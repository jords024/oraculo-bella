import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../../db.js';
import { logger } from '../../logger.js';
import { recordUsageCost } from '../../helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const storageDir = path.join(__dirname, '..', '..', '..', 'storage', 'library');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// ── 1. Histórico de Chat do Assistente IA ────────────────────────────────────
router.get('/api/library/chat', async (req, res) => {
  try {
    const userEmail = req.user?.email || 'admin';
    const chatRes = await query('SELECT * FROM library_chats WHERE user_email = $1', [userEmail]);
    
    if (chatRes.rows.length === 0) {
      return res.json({ messages: [], generated_images: [] });
    }

    const row = chatRes.rows[0];
    res.json({
      messages: row.messages || [],
      generated_images: row.generated_images || []
    });
  } catch (err) {
    logger.error('[Library]', 'Erro ao obter histórico do chat:', err);
    res.status(500).json({ error: 'Erro ao obter histórico: ' + err.message });
  }
});

// ── 2. Limpar Histórico do Chat ──────────────────────────────────────────────
router.post('/api/library/chat/clear', async (req, res) => {
  try {
    const userEmail = req.user?.email || 'admin';
    await query(
      `INSERT INTO library_chats (user_email, messages, generated_images, updated_at)
       VALUES ($1, '[]'::jsonb, '[]'::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (user_email) DO UPDATE 
       SET messages = '[]'::jsonb, updated_at = CURRENT_TIMESTAMP`,
      [userEmail]
    );

    res.json({ ok: true });
  } catch (err) {
    logger.error('[Library]', 'Erro ao limpar chat:', err);
    res.status(500).json({ error: 'Erro ao limpar chat: ' + err.message });
  }
});

// ── 3. Geração de Imagens com o Assistente IA ─────────────────────────────────
router.post('/api/library/chat/generate', async (req, res) => {
  try {
    const { prompt, referenceIds = [], messages = [] } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt é obrigatório.' });
    }

    const userEmail = req.user?.email || 'admin';
    const apiKey = process.env.OPENAI_API_KEY;

    // 1. Carrega as imagens de referência selecionadas e converte para base64 (Vision)
    let referencesInfo = [];
    let referenceImageUrls = [];
    const cleanNumericIds = (Array.isArray(referenceIds) ? referenceIds : [])
      .map(id => typeof id === 'number' ? id : parseInt(id, 10))
      .filter(id => !isNaN(id) && id > 0);

    if (cleanNumericIds.length > 0) {
      const refsRes = await query('SELECT * FROM library_images WHERE id = ANY($1::int[])', [cleanNumericIds]);
      referencesInfo = refsRes.rows || [];

      for (const r of referencesInfo) {
        try {
          if (r.filename) {
            const p = path.join(storageDir, path.basename(r.filename));
            if (fs.existsSync(p)) {
              const fileData = fs.readFileSync(p);
              const ext = path.extname(r.filename).toLowerCase();
              const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.svg' ? 'image/svg+xml' : 'image/jpeg';
              if (mime !== 'image/svg+xml') {
                referenceImageUrls.push(`data:${mime};base64,${fileData.toString('base64')}`);
              }
            }
          }
        } catch (readErr) {
          logger.warn('[Library]', 'Erro ao carregar imagem de referência para Vision:', readErr.message);
        }
      }
    }

    // Se nenhuma referência nova foi marcada explicitamente, herda o contexto da conversa
    if (referenceImageUrls.length === 0 && Array.isArray(messages) && messages.length > 0) {
      // 1. Tenta herdar a referência da mensagem anterior do usuário
      const lastUserWithRefs = [...messages].reverse().find(m => m.role === 'user' && Array.isArray(m.references) && m.references.length > 0);
      if (lastUserWithRefs && lastUserWithRefs.references.length > 0) {
        referencesInfo = lastUserWithRefs.references;
        for (const r of referencesInfo) {
          try {
            const filename = r.filename || (r.url ? path.basename(r.url.split('?')[0]) : null);
            if (filename) {
              const p = path.join(storageDir, filename);
              if (fs.existsSync(p)) {
                const fileData = fs.readFileSync(p);
                const ext = path.extname(filename).toLowerCase();
                const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
                if (ext !== '.svg') {
                  referenceImageUrls.push(`data:${mime};base64,${fileData.toString('base64')}`);
                }
              }
            }
          } catch (e) {}
        }
      }

      // 2. Se ainda não carregou, herda a última imagem gerada pela IA
      if (referenceImageUrls.length === 0) {
        const lastAiImageMsg = [...messages].reverse().find(m => m.role === 'ai' && m.filename);
        if (lastAiImageMsg && lastAiImageMsg.filename) {
          try {
            const p = path.join(storageDir, path.basename(lastAiImageMsg.filename));
            if (fs.existsSync(p)) {
              const fileData = fs.readFileSync(p);
              const ext = path.extname(lastAiImageMsg.filename).toLowerCase();
              const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
              if (ext !== '.svg') {
                referenceImageUrls.push(`data:${mime};base64,${fileData.toString('base64')}`);
                referencesInfo = [{ id: lastAiImageMsg.id, url: lastAiImageMsg.imageUrl, title: lastAiImageMsg.generatedPrompt || 'Imagem Anterior', filename: lastAiImageMsg.filename }];
                logger.info('[Library]', `🖼️ Contexto contínuo ativado: herdando ${lastAiImageMsg.filename} para análise do Vision`);
              }
            }
          } catch (prevErr) {
            logger.warn('[Library]', 'Erro ao carregar imagem anterior para contexto:', prevErr.message);
          }
        }
      }
    }

    // 2. Enriquecimento do Prompt com IA (GPT-4o Vision / Reasoning)
    let generatedPrompt = prompt.trim();
    if (apiKey) {
      try {
        const refTitles = referencesInfo.map(r => r.title).filter(Boolean).join(', ');
        const sysPrompt = `You are an elite AI Visual Art Director and Prompt Engineer specializing in image-to-image synthesis, character consistency, and artistic adaptation.
Your mission is to analyze the attached reference image(s) and translate the user's creative instruction into a highly accurate, descriptive English image generation prompt (for DALL-E 3 / Flux / Midjourney).

Core Directives:
1. Art Style & Medium Fidelity: Preserve the exact visual medium and artistic style of the reference image (e.g., Japanese anime/manga cel-shaded animation, 2D vector art, 3D CGI render, vintage comic book art, oil painting, or realistic photography). If the reference is anime/cartoon, the prompt MUST keep the anime/cartoon style; NEVER turn an anime character into a real person unless explicitly requested.
2. Subject & Identity Consistency: Identify the character/subject, hair shape/silhouette, iconic accessories (headband with symbols, jewelry, whisker marks, tattoos, facial markings), clothing, and overall composition.
3. Targeted Transformation & Scene Placement: Accurately apply the user's specific request (e.g., "change hair color to red", "add sunglasses", "change outfit", "change expression", "place in a modern luxury environment"). When the user asks to place the image/subject in a setting or background, place the ACTUAL character/subject directly inside that environment as the main foreground subject, NEVER as a framed picture or painting on a wall. Keep all characteristic features, art style, and character identity identical to the reference image.
4. Comprehensive Scene Description: Clearly describe the subject, hair color, facial expression, clothing, pose, lighting, and background.
5. Strict Output: Output ONLY the raw English generation prompt text without quotes, markdown formatting, explanations, or conversational prefixes.`;

        let userContent;
        if (referenceImageUrls.length > 0) {
          const refContextStr = refTitles ? ` (Reference images: "${refTitles}")` : '';
          userContent = [
            {
              type: 'text',
              text: `User instruction: "${prompt}"${refContextStr}\n\nCarefully inspect the attached reference image(s). Generate an English prompt that replicates the exact character, art style, clothing, and pose from the reference image, applying the user's modification precisely (e.g., changing hair color, expression, or background).`
            },
            ...referenceImageUrls.map(url => ({
              type: 'image_url',
              image_url: { url, detail: 'high' }
            }))
          ];
        } else {
          userContent = `User instruction: "${prompt}"\nCreate a rich, visually compelling image generation prompt in English that perfectly captures this concept.`;
        }

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
            generatedPrompt = candidate;
            logger.info('[Library]', '✨ Prompt enriquecido pelo Vision com sucesso:', generatedPrompt.substring(0, 80) + '...');
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          logger.warn('[Library]', 'OpenAI Vision chat completion retornou status não-200:', response.status, errData);
        }
      } catch (promptErr) {
        logger.warn('[Library]', 'Erro no enriquecimento do prompt (usando original):', promptErr.message);
      }
    }

    // 3. Geração Real da Imagem usando OpenAI
    let imageBuffer = null;
    const activeProvider = process.env.ACTIVE_IMAGE_PROVIDER || 'gpt-image-1';

    if (apiKey) {
      try {
        const modelName = activeProvider;
        const genResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: modelName,
            prompt: generatedPrompt.substring(0, 1000),
            n: 1,
            size: '1024x1024'
          })
        });

        if (genResponse.ok) {
          const genData = await genResponse.json();
          const firstData = genData.data?.[0];
          if (firstData?.b64_json) {
            imageBuffer = Buffer.from(firstData.b64_json, 'base64');
          } else if (firstData?.url) {
            const imgFetch = await fetch(firstData.url);
            if (imgFetch.ok) {
              const arrayBuf = await imgFetch.arrayBuffer();
              imageBuffer = Buffer.from(arrayBuf);
            }
          }
        } else {
          const errData = await genResponse.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `Status HTTP ${genResponse.status}`;
          logger.warn('[Library]', 'OpenAI image gen retornou status não-200:', genResponse.status, errMsg);
        }
      } catch (genErr) {
        logger.error('[Library]', 'Erro ao chamar API de geração:', genErr.message);
      }
    }

    // Grava imagem gerada em disco
    const ext = imageBuffer ? '.png' : '.svg';
    const genFilename = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const genFilePath = path.join(storageDir, genFilename);

    if (imageBuffer) {
      fs.writeFileSync(genFilePath, imageBuffer);
    } else {
      const safePrompt = (prompt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeGenPrompt = (generatedPrompt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 100);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#18181b"/>
            <stop offset="100%" stop-color="#09090b"/>
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f3d172"/>
            <stop offset="100%" stop-color="#c9a84c"/>
          </linearGradient>
        </defs>
        <rect width="1024" height="1024" rx="28" fill="url(#bg)"/>
        <rect x="28" y="28" width="968" height="968" rx="20" fill="none" stroke="#c9a84c" stroke-width="2" stroke-dasharray="8 8" opacity="0.35"/>
        <circle cx="512" cy="390" r="100" fill="rgba(201, 168, 76, 0.12)" stroke="#c9a84c" stroke-width="3"/>
        <text x="512" y="415" font-family="system-ui, -apple-system, sans-serif" font-size="56" text-anchor="middle">✨</text>
        <text x="512" y="560" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="bold" fill="url(#gold)" text-anchor="middle">ORÁCULO ART STUDIO</text>
        <text x="512" y="610" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#f4f4f5" text-anchor="middle">"${safePrompt.substring(0, 45)}"</text>
        <text x="512" y="660" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#a1a1aa" text-anchor="middle">${safeGenPrompt}...</text>
        <rect x="362" y="710" width="300" height="40" rx="20" fill="rgba(201, 168, 76, 0.15)" stroke="#c9a84c" stroke-width="1.5"/>
        <text x="512" y="735" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#c9a84c" text-anchor="middle">ARTE GERADA</text>
      </svg>`;
      fs.writeFileSync(genFilePath, Buffer.from(svg, 'utf-8'));
    }

    const genUrl = `/api/library/generated/${genFilename}`;

    // Cálculo do Modelo e Custo da Geração (Câmbio: 1 USD = 5 BRL)
    const usedModel = activeProvider;
    const usdRate = 5.0;
    let costUsd = 0.040;
    if (usedModel === 'gpt-image-1-mini' || usedModel === 'dall-e-2') {
      costUsd = 0.020;
    } else if (usedModel === 'gpt-image-2') {
      costUsd = 0.050;
    }
    if (referenceImageUrls.length > 0) {
      costUsd += 0.005;
    }
    const costBrl = costUsd * usdRate;
    const costFormatted = `R$ ${costBrl.toFixed(2).replace('.', ',')}`;

    // Registrar no Extrato Financeiro Global (usage_costs)
    await recordUsageCost({
      type: 'image_generation',
      itemId: genFilename,
      description: `Geração de imagem no Estúdio: "${(prompt || '').slice(0, 48)}..."`,
      model: usedModel,
      provider: activeProvider,
      costUsd,
      costBrl,
      quantity: 1,
      metadata: { prompt, generatedPrompt, filename: genFilename }
    });

    // 4. Atualiza o histórico do chat no banco
    const userMsg = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: prompt,
      referenceIds,
      references: referencesInfo.map(r => ({ id: r.id, url: r.url, title: r.title })),
      createdAt: new Date().toISOString()
    };

    const aiMsg = {
      id: 'ai_' + (Date.now() + 1),
      role: 'ai',
      type: 'image',
      imageUrl: genUrl,
      filename: genFilename,
      generatedPrompt,
      referenceIds,
      model: usedModel,
      costUsd,
      costBrl,
      costFormatted,
      warning: null,
      createdAt: new Date().toISOString()
    };

    const newGeneratedItem = {
      id: 'gen_' + Date.now(),
      imageUrl: genUrl,
      filename: genFilename,
      prompt,
      generatedPrompt,
      referenceIds,
      model: usedModel,
      costUsd,
      costBrl,
      costFormatted,
      createdAt: new Date().toISOString()
    };

    const existingChat = await query('SELECT * FROM library_chats WHERE user_email = $1', [userEmail]);
    let currentMsgs = [];
    let currentGenerated = [];

    if (existingChat.rows.length > 0) {
      currentMsgs = existingChat.rows[0].messages || [];
      currentGenerated = existingChat.rows[0].generated_images || [];
    }

    const updatedMsgs = [...currentMsgs, userMsg, aiMsg];
    const updatedGenerated = [newGeneratedItem, ...currentGenerated];

    await query(
      `INSERT INTO library_chats (user_email, messages, generated_images, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_email) DO UPDATE 
       SET messages = $2, generated_images = $3, updated_at = CURRENT_TIMESTAMP`,
      [userEmail, JSON.stringify(updatedMsgs), JSON.stringify(updatedGenerated)]
    );

    res.json({
      ok: true,
      userMessage: userMsg,
      aiMessage: aiMsg,
      generatedItem: newGeneratedItem
    });
  } catch (err) {
    logger.error('[Library]', 'Erro ao gerar imagem no chat:', err);
    res.status(500).json({ error: 'Erro ao gerar imagem: ' + err.message });
  }
});

// ── 4. Servir Imagem Gerada ──────────────────────────────────────────────────
router.get('/api/library/generated/:filename', (req, res) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const filePath = path.join(storageDir, safeFilename);

  if (fs.existsSync(filePath)) {
    try {
      const head = Buffer.alloc(30);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, head, 0, 30, 0);
      fs.closeSync(fd);
      const headStr = head.toString('utf-8').trim();

      if (headStr.startsWith('<svg') || headStr.startsWith('<?xml') || safeFilename.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (safeFilename.endsWith('.jpg') || safeFilename.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (safeFilename.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      } else {
        res.setHeader('Content-Type', 'image/png');
      }
    } catch {
      res.setHeader('Content-Type', 'image/png');
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(filePath).pipe(res);
  }

  const themes = [
    { bg1: '#4338ca', bg2: '#1e1b4b', fg: '#a5b4fc', icon: '🔮', label: 'Conceito Sci-Fi' },
    { bg1: '#047857', bg2: '#022c22', fg: '#6ee7b7', icon: '🌿', label: 'Fotografia Natureza' },
    { bg1: '#be123c', bg2: '#4c0519', fg: '#fda4af', icon: '⚔️', label: 'Personagem RPG' },
    { bg1: '#b45309', bg2: '#451a03', fg: '#fde68a', icon: '👑', label: 'Carrossel Ouro' },
    { bg1: '#0369a1', bg2: '#082f49', fg: '#7dd3fc', icon: '🚀', label: 'Futurismo Tech' },
    { bg1: '#a21caf', bg2: '#4a044e', fg: '#f0abfc', icon: '🎨', label: 'Ilustração 3D' },
    { bg1: '#c2410c', bg2: '#431407', fg: '#fdba74', icon: '☕', label: 'Lifestyle & Café' },
    { bg1: '#0e7490', bg2: '#083344', fg: '#67e8f9', icon: '💎', label: 'Produto Premium' }
  ];
  const hash = safeFilename.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const theme = themes[hash % themes.length];
  const itemNum = (hash % 1000) + 1;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <radialGradient id="g_${hash}" cx="50%" cy="30%" r="75%">
        <stop offset="0%" stop-color="${theme.bg1}"/>
        <stop offset="100%" stop-color="${theme.bg2}"/>
      </radialGradient>
    </defs>
    <rect width="512" height="512" rx="16" fill="url(#g_${hash})"/>
    <rect x="14" y="14" width="484" height="484" rx="12" fill="none" stroke="${theme.fg}" stroke-width="2" stroke-dasharray="8 6" opacity="0.45"/>
    <circle cx="256" cy="190" r="64" fill="rgba(0,0,0,0.35)" stroke="${theme.fg}" stroke-width="2.5"/>
    <text x="256" y="212" font-family="system-ui, sans-serif" font-size="44" text-anchor="middle">${theme.icon}</text>
    <rect x="136" y="280" width="240" height="28" rx="14" fill="rgba(0,0,0,0.4)" stroke="${theme.fg}" stroke-width="1"/>
    <text x="256" y="299" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="${theme.fg}" text-anchor="middle" letter-spacing="1">${theme.label.toUpperCase()}</text>
    <text x="256" y="348" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">Arte Gerada #${itemNum}</text>
    <text x="256" y="378" font-family="system-ui, sans-serif" font-size="12" fill="rgba(255,255,255,0.75)" text-anchor="middle">Estúdio Oráculo IA • 8K Render</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(svg);
});

// ── 5. Salvar Imagem Gerada na Biblioteca Principal ────────────────────────
router.post('/api/library/save-generated', async (req, res) => {
  try {
    const { filename, title = 'Imagem Gerada por IA', category = 'IA Gerada', prompt = '', notes = '', model, source = 'ai' } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Filename é obrigatório.' });
    }

    const safeFilename = path.basename(filename);
    const srcPath = path.join(storageDir, safeFilename);
    if (!fs.existsSync(srcPath)) {
      return res.status(404).json({ error: 'Arquivo gerado não encontrado.' });
    }

    const ext = path.extname(safeFilename) || '.png';
    const newFilename = `lib_from_gen_${Date.now()}${ext}`;
    const destPath = path.join(storageDir, newFilename);
    fs.copyFileSync(srcPath, destPath);

    const stats = fs.statSync(destPath);
    const userEmail = req.user?.email || 'admin';
    const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
    const effectiveModel = model || process.env.ACTIVE_IMAGE_PROVIDER || 'gpt-image-2';

    const insertRes = await query(
      `INSERT INTO library_images (title, category, notes, prompt, filename, storage_path, mime_type, size_bytes, created_by, source, ai_model)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title.trim(), category, notes, prompt || null, newFilename, newFilename, mime, stats.size, userEmail, source, effectiveModel]
    );

    const created = insertRes.rows[0];
    res.json({
      ok: true,
      image: {
        ...created,
        url: `/api/library/${created.id}/image`
      }
    });
  } catch (err) {
    logger.error('[Library]', 'Erro ao salvar imagem gerada:', err);
    res.status(500).json({ error: 'Erro ao salvar na biblioteca: ' + err.message });
  }
});

export default router;
