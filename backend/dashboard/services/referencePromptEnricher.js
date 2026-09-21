// backend/dashboard/services/referencePromptEnricher.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../db.js';
import { logger } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getLibraryStorageDir() {
  const candidates = [
    path.join(__dirname, '..', '..', 'storage', 'library'),
    path.join(__dirname, '..', '..', '..', 'backend', 'storage', 'library'),
    path.join(process.cwd(), 'backend', 'storage', 'library'),
    path.join(process.cwd(), 'storage', 'library'),
    '/app/backend/storage/library'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(__dirname, '..', '..', 'storage', 'library');
}

const storageDir = getLibraryStorageDir();

/**
 * Carrega as imagens de referência da biblioteca pelo ID e enriquece o prompt com GPT-4o Vision.
 * @param {string} prompt - Prompt ou instrução do usuário (ex: "mulher segurando o machado")
 * @param {Array<number|string>} referenceIds - Lista com até 3 IDs das imagens da biblioteca
 * @returns {Promise<{ enrichedPrompt: string, references: Array<object> }>}
 */
export async function enrichPromptWithReferences(prompt, referenceIds = []) {
  if (!prompt || !prompt.trim()) {
    return { enrichedPrompt: prompt || '', references: [] };
  }

  const cleanIds = (Array.isArray(referenceIds) ? referenceIds : [])
    .map(id => parseInt(id, 10))
    .filter(id => !isNaN(id) && id > 0)
    .slice(0, 3); // Limite rígido de até 3 referências

  if (cleanIds.length === 0) {
    return { enrichedPrompt: prompt.trim(), references: [] };
  }

  let referencesInfo = [];
  const referenceImageUrls = [];

  try {
    const refsRes = await query('SELECT id, title, category, filename, storage_path, mime_type FROM library_images WHERE id = ANY($1::int[])', [cleanIds]);
    referencesInfo = refsRes.rows || [];

    for (const r of referencesInfo) {
      if (r.filename) {
        const localPath = path.join(storageDir, path.basename(r.filename));
        if (fs.existsSync(localPath)) {
          const fileData = fs.readFileSync(localPath);
          const ext = path.extname(r.filename).toLowerCase();
          const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.svg' ? 'image/svg+xml' : 'image/jpeg';
          if (mime !== 'image/svg+xml') {
            referenceImageUrls.push(`data:${mime};base64,${fileData.toString('base64')}`);
          }
        }
      }
    }
  } catch (dbErr) {
    logger.error('[ReferenceEnricher]', 'Erro ao consultar banco de dados para imagens de referência:', dbErr.message);
  }

  // Se não encontrou nenhuma imagem física correspondente, retorna o prompt original
  if (referenceImageUrls.length === 0) {
    return { enrichedPrompt: prompt.trim(), references: referencesInfo };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  let enrichedPrompt = prompt.trim();

  if (apiKey) {
    try {
      const refTitles = referencesInfo.map(r => r.title).filter(Boolean).join(', ');
      const sysPrompt = `You are an elite AI Visual Art Director and Prompt Engineer specializing in image-to-image synthesis, character consistency, and artistic adaptation.
Your mission is to analyze the attached reference image(s) and translate the user's creative instruction into a highly accurate, descriptive English image generation prompt (for DALL-E 3 / Flux / Midjourney / Stable Diffusion).

Core Directives:
1. Art Style & Medium Fidelity: Preserve the exact visual medium and artistic style of the reference image (e.g., cinematic photography, dramatic lighting, dark esoteric mood, 3D render, vintage painting).
2. Key Elements & Props: Extract the specific object, character, or styling from the reference images (such as an axe, weapon, armor, hairstyle, environment, or atmosphere) and seamlessly integrate it into the user's requested scene.
3. Targeted Transformation & Scene Placement: Accurately apply the user's specific request (e.g., "recriar a mulher segurando o machado", "colocar em ambiente luxuoso"). When the user asks to place the image/subject in a setting, place the ACTUAL character/subject directly inside that environment as the main foreground subject, NEVER as a framed painting on a wall. Ensure consistent texture, materials, pose, and cinematic lighting.
4. Comprehensive Scene Description: Clearly describe the subject, expression, pose, props, lighting, atmosphere, and background without generic fluff.
5. Strict Output: Output ONLY the raw English generation prompt text without quotes, markdown formatting, explanations, or conversational prefixes.`;

      const refContextStr = refTitles ? ` (Reference images: "${refTitles}")` : '';
      const userContent = [
        {
          type: 'text',
          text: `User instruction: "${prompt}"${refContextStr}\n\nCarefully inspect the attached reference image(s). Generate an English prompt that seamlessly incorporates the key visual elements, objects, character style, and atmosphere from the reference image(s), applying the user's request precisely.`
        },
        ...referenceImageUrls.map(url => ({
          type: 'image_url',
          image_url: { url, detail: 'high' }
        }))
      ];

      const modelName = process.env.COPY_GENERATION_MODEL || 'gpt-4o';
      const bodyPayload = {
        model: modelName,
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: userContent }
        ],
        max_completion_tokens: 500
      };
      if (!modelName.startsWith('o1') && !modelName.startsWith('o3')) {
        bodyPayload.temperature = 0.7;
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(bodyPayload)
      });

      if (response.ok) {
        const completion = await response.json();
        const candidate = completion.choices?.[0]?.message?.content?.trim();
        if (candidate && !candidate.toLowerCase().startsWith("i'm sorry") && !candidate.toLowerCase().startsWith("i cannot")) {
          enrichedPrompt = candidate;
          logger.info('[ReferenceEnricher]', `✨ Prompt enriquecido com ${referenceImageUrls.length} referência(s): "${enrichedPrompt.substring(0, 80)}..."`);
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        logger.warn('[ReferenceEnricher]', 'OpenAI Vision API retornou status não-200:', response.status, errJson);
      }
    } catch (apiErr) {
      logger.warn('[ReferenceEnricher]', 'Erro ao enriquecer prompt com OpenAI Vision:', apiErr.message);
    }
  }

  return {
    enrichedPrompt,
    references: referencesInfo.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      filename: r.filename
    }))
  };
}
