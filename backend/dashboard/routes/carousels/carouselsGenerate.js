import express from "express";
import fs from "fs";
import path from "path";
import { execFile, spawn } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { 
  slugify, 
  readDataAsync, 
  writeDataAsync,
  getCarouselById,
  saveSingleCarousel,
  updateCarouselFields,
  getLocalSlidesDir,
  recordUsageCost
} from "../../helpers.js";
import { enqueueCarouselTask } from "../../services/rabbitmq.js";
import { 
  IS_PROD, 
  b2, 
  generationJobs, 
  REGEN_SCRIPT,
  isUserSuperAdmin,
  sseClients
} from "../../state.js";
import { logger } from '../../logger.js';
import { query } from '../../db.js';
import { enrichPromptWithReferences } from "../../services/referencePromptEnricher.js";
import { contextualizeThemeSelection, detectEditorialMode, runBigIdeaLab, runEditorialOrchestration } from "../../services/editorialOrchestrator.js";
import { getBellaVisualReferenceContract } from "../../services/visualReferenceService.js";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PYTHON = process.platform === "win32" ? "python" : "python3";
const router = express.Router();

async function getAgentPromptAsync(agentId) {
  try {
    const dbRes = await query('SELECT content FROM agent_prompts WHERE id = $1', [agentId]);
    if (dbRes && dbRes.rows && dbRes.rows.length > 0 && dbRes.rows[0].content) {
      return dbRes.rows[0].content;
    }
  } catch (err) {
    logger.error('[Carousels]', `Erro ao buscar prompt '${agentId}' do BD: ${err.message}`);
  }

  const agentFilePath = path.join(__dirname, '..', '..', '..', 'agents', `${agentId}.md`);
  if (fs.existsSync(agentFilePath)) {
    try {
      return fs.readFileSync(agentFilePath, 'utf-8');
    } catch (err) {
      logger.error('[Carousels]', `Erro ao ler arquivo de prompt ${agentFilePath}: ${err.message}`);
    }
  }

  return null;
}

function parseCarouselTextNode(text) {
  if (!text || typeof text !== 'string') return [];
  const t = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const slides = [];
  const lines = t.split('\n');
  const slideHeader = /^(?:\[S(?:LIDE)?\s*(\d+)\s*[—–\-:]?\s*([^\]|]*?)(?:\s*\|\s*layout:\s*([^\]\s|]+))?\s*\]|S(?:LIDE)?\s*(\d+)\b\s*[:—–\-]?\s*(.*))/i;
  let current = null;
  let field = null;
  const cleanMarkdown = (value = '') => value.trim().replace(/^#{1,6}\s*/, '').replace(/\*\*|__|`/g, '').replace(/^[-*+]\s+/, '').trim();

  const flush = () => {
    if (current && (current.title || current.body)) {
      slides.push({
        num: current.num,
        estado: current.estado || `S${current.num}`,
        layout: current.layout || 'fullbleed',
        title: (current.title || '').trim(),
        body: (current.body || '').trim(),
        prompt: (current.prompt || '').trim(),
        scene: current.scene || null,
        text_anchor: current.textAnchor || 'base',
        visual_plan: current.visualPlan || null,
      });
    }
  };

  for (const raw of lines) {
    const line = cleanMarkdown(raw);
    const hm = line.match(slideHeader);
    if (hm) {
      flush();
      const num = (hm[1] || hm[4] || '').padStart(2, '0');
      const rawState = hm[2] || hm[5] || '';
      const estado = rawState ? rawState.replace(/\|\s*layout:.*$/i, '').trim().replace(/[^\wÀ-ÿ\s]/g, '').trim().toUpperCase() : `S${num}`;
      const inlineLayout = line.match(/\|\s*layout:\s*([^\]\s|]+)/i)?.[1];
      let layout = (hm[3] || inlineLayout || 'fullbleed').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      current = { num, estado, layout, title: '', body: '', prompt: '', scene: null, textAnchor: null, visualPlan: null };
      field = null;
      continue;
    }

    if (!current) continue;

    const lower = line.toLowerCase();
    if (lower.startsWith('título:') || lower.startsWith('titulo:') || lower.startsWith('gancho:')) {
      field = 'title';
      current.title = cleanMarkdown(line.replace(/^(título|titulo|gancho):\s*/i, ''));
    } else if (lower.startsWith('corpo:') || lower.startsWith('texto:') || lower.startsWith('copy:')) {
      field = 'body';
      current.body = cleanMarkdown(line.replace(/^(corpo|texto|copy):\s*/i, ''));
    } else if (lower.startsWith('prompt:') || lower.startsWith('prompt visual:') || lower.startsWith('visual:') || lower.startsWith('imagem:')) {
      field = 'prompt';
      current.prompt = cleanMarkdown(line.replace(/^(?:prompt(?:\s*visual)?|visual|imagem):\s*/i, ''));
    } else if (lower.startsWith('cena:')) {
      field = null;
      const scene = cleanMarkdown(line.replace(/^cena:\s*/i, '')).toUpperCase();
      current.scene = /^[A-D]$/.test(scene) ? scene : null;
    } else if (lower.startsWith('respiro:')) {
      field = null;
      const anchor = cleanMarkdown(line.replace(/^respiro:\s*/i, '')).toLowerCase();
      current.textAnchor = ['topo', 'centro', 'base'].includes(anchor) ? anchor : null;
    } else if (lower.startsWith('direção_json:') || lower.startsWith('direcao_json:') || lower.startsWith('design_json:')) {
      field = null;
      const rawJson = raw.trim().replace(/^(?:dire[çc][ãa]o_json|design_json):\s*/i, '');
      try { current.visualPlan = JSON.parse(rawJson); } catch { current.visualPlan = null; }
    } else if (field && line) {
      current[field] += '\n' + line;
    }
  }
  flush();
  return slides;
}

// ── API: Criador — Capacidades do ambiente ────────────────────────────────────
router.get('/api/criador/capabilities', (req, res) => {
  res.json({ canGenerateImages: true, isProd: IS_PROD });
});

// ── API: Regenerate image ────────────────────────────────────────────────────
router.post("/api/carousels/:id/slide/:filename/regen", async (req, res) => {
  const c = await getCarouselById(req.params.id);
  if (!c) return res.status(404).json({ error: "Não encontrado" });
  const imgPath = path.join(getLocalSlidesDir(c), req.params.filename);
  const { prompt, title, body, layout = "fullbleed", preset, reference_ids, referenceIds, reference_images, referenceImages } = req.body;
  if (!prompt || !title || !body) return res.status(400).json({ error: "prompt, title e body são obrigatórios" });
  
  const rawRefIds = reference_ids || referenceIds || (Array.isArray(reference_images) ? reference_images.map(r => r.id) : (Array.isArray(referenceImages) ? referenceImages.map(r => r.id) : []));
  const activeProvider = c.imageProvider || process.env.ACTIVE_IMAGE_PROVIDER || 'gpt-image-2';
  
  try {
    let finalPrompt = prompt;
    let enrichedReferences = [];
    if (Array.isArray(rawRefIds) && rawRefIds.length > 0) {
      const enrichResult = await enrichPromptWithReferences(prompt, rawRefIds);
      finalPrompt = enrichResult.enrichedPrompt || prompt;
      enrichedReferences = enrichResult.references || [];
      logger.info('[Carousel]', `🖼️ Prompt enriquecido com ${enrichedReferences.length} referência(s) para o slide ${req.params.filename}`);
    }

    const pythonArgs = [
      REGEN_SCRIPT,
      "--prompt", finalPrompt, 
      "--title", title, 
      "--body", body,
      "--layout", layout, 
      "--preset", preset || c.preset || "dramatico",
      "--provider", activeProvider, 
      "--output", imgPath
    ];
    let watermarkText = c.handle;
    if (!watermarkText) {
      try {
        const resBranding = await query('SELECT data FROM branding WHERE id = 1');
        if (resBranding.rows.length > 0 && resBranding.rows[0].data?.logoText) {
          watermarkText = resBranding.rows[0].data.logoText;
        }
      } catch (e) {}
    }
    if (watermarkText) {
      pythonArgs.push("--watermark", watermarkText);
    }
    const { stdout } = await execFileAsync(PYTHON, pythonArgs, {
      timeout: 180000,
      cwd: path.join(__dirname, '..', '..', '..'),
      env: {
        ...process.env,
        PYTHONPATH: [
          path.join(__dirname, '..', '..', '..'),
          path.join(__dirname, '..', '..', '..', 'python_packages'),
        ].join(process.platform === 'win32' ? ';' : ':'),
      }
    });
    logger.info('[Carousel]', "regen:", stdout.trim());
    
    // Salvar/atualizar o prompt e metadados no arquivo .meta.json
    const metaPath = imgPath.replace(/\.(jpg|jpeg|png)$/i, ".meta.json");
    let currentMeta = {};
    if (fs.existsSync(metaPath)) {
      try { currentMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8")); } catch {}
    }
    fs.writeFileSync(metaPath, JSON.stringify({
      ...currentMeta,
      prompt,
      final_prompt: finalPrompt !== prompt ? finalPrompt : undefined,
      reference_ids: rawRefIds && rawRefIds.length > 0 ? rawRefIds : undefined,
      reference_images: enrichedReferences.length > 0 ? enrichedReferences : undefined,
      title,
      body,
      layout,
      preset: preset || currentMeta.preset || c.preset || "dramatico"
    }, null, 2));

    // Se o MinIO / B2 estiver configurado, sincroniza o slide e raw atualizados para a nuvem
    if (b2 && fs.existsSync(imgPath)) {
      try {
        await b2.uploadImageToB2(c.id, req.params.filename, imgPath);
        const rawFilename = req.params.filename.replace(/^slide-/, 'raw-');
        const rawPath = path.join(getLocalSlidesDir(c), rawFilename);
        if (fs.existsSync(rawPath)) {
          await b2.uploadImageToB2(c.id, rawFilename, rawPath);
        }
        if (fs.existsSync(metaPath)) {
          const metaFilename = req.params.filename.replace(/\.(jpg|jpeg|png)$/i, ".meta.json");
          await b2.uploadImageToB2(c.id, metaFilename, metaPath);
        }
      } catch (uploadErr) {
        logger.error('[Carousel regen upload]', `Erro ao reenviar slide atualizado para o B2: ${uploadErr.message}`);
      }
    }

    res.json({ ok: true, message: stdout.trim(), enriched: finalPrompt !== prompt });
  } catch (e) {
    logger.error('[Carousel]', "regen error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── API: Retry carousel generation ──────────────────────────────────────────
router.post('/api/carousels/:id/retry', async (req, res) => {
  const { id } = req.params;
  const carousel = await getCarouselById(id);

  if (!carousel) {
    return res.status(404).json({ error: 'Carrossel não encontrado' });
  }

  let payload = carousel.lastPayload;

  // Fallback: se não houver lastPayload ou lastPayload.slides estiver vazio, tenta extrair das notas ou do histórico de chat
  if (!payload || !Array.isArray(payload.slides) || payload.slides.length === 0) {
    let textToParse = carousel.notes || '';
    if (!textToParse && carousel.chatHistory && Array.isArray(carousel.chatHistory)) {
      const lastAiMsg = [...carousel.chatHistory].reverse().find(m => m.role === 'ai' && m.content && m.content.includes('[S1'));
      if (lastAiMsg) textToParse = lastAiMsg.content;
    }

    const extractedSlides = parseCarouselTextNode(textToParse);
    if (extractedSlides.length > 0) {
      payload = {
        id: carousel.id,
        title: carousel.title,
        theme: carousel.theme,
        format: carousel.format || 'A',
        totalSlides: extractedSlides.length,
        slides: extractedSlides,
        caption: carousel.caption || ''
      };
    }
  }

  if (!payload || !Array.isArray(payload.slides) || payload.slides.length === 0) {
    return res.status(400).json({ error: 'Não há roteiro de slides salvo para recriar este carrossel. Por favor, gere o roteiro no Criador.' });
  }

  const newStartTime = Date.now();
  const newCarousel = {
    ...carousel,
    id:          id,
    title:       payload.title || carousel?.title || 'Carrossel',
    theme:       payload.theme || carousel?.theme || 'sem-titulo',
    format:      payload.format || carousel?.format || 'B',
    preset:      payload.preset || payload.template || carousel?.preset || 'bella_editorial_luxo',
    workspace:   carousel?.workspace || 'bella',
    status:      'queued',
    generationStartedAt: newStartTime,
    generationDuration: undefined,
    generationTimeSeconds: undefined,
    completedAt: undefined,
    createdAt:   carousel?.createdAt || new Date().toISOString(),
    slidesDir:   carousel?.slidesDir || '',
    slidePrefix: 'slide-',
    totalSlides: Number(payload.totalSlides) || payload.slides?.length || 10,
    imageQuality: payload.imageQuality || carousel?.imageQuality || 'high',
    caption:     payload.caption || carousel?.caption || '',
    notes:       payload.notes || carousel?.notes || '',
    chatHistory: carousel?.chatHistory || [],
    slides:      [],
    noImageSlidesCount: payload.noImageSlidesCount || carousel?.noImageSlidesCount || 0,
    imageProvider: process.env.ACTIVE_IMAGE_PROVIDER || carousel?.imageProvider || 'gpt-image-2',
    copyModel:     process.env.COPY_GENERATION_MODEL || carousel?.copyModel || 'gpt-4o',
    lastPayload: { ...payload, slidesDir: undefined }
  };
  
  await saveSingleCarousel(newCarousel);
  logger.info('[Retry]', `Retentativa de geração para carrossel ${id}`);

  const taskPayload = {
    carouselId: id,
    payload: { ...payload, slidesDir: '' },
    noImageSlidesCount: newCarousel.noImageSlidesCount,
    startTime: newStartTime,
    isRetry: true
  };

  const queueResult = await enqueueCarouselTask(taskPayload);

  res.json({
    ok: true,
    id: id,
    status: 'queued',
    queuePosition: queueResult.queuePosition || 1,
    message: 'Carrossel enfileirado no RabbitMQ com sucesso'
  });
});

// ── API: Criador — Gerar carrossel completo ───────────────────────────────────
router.post('/api/criador/generate', async (req, res) => {
  const payload = req.body;
  if (!payload || !Array.isArray(payload.slides) || payload.slides.length === 0) {
    return res.status(400).json({ error: 'slides é obrigatório' });
  }

  let newId = payload.id;
  let existingCarousel = null;
  if (newId) {
    existingCarousel = await getCarouselById(newId);
  }

  if (!existingCarousel) {
    const countRes = await query("SELECT count(*) as total FROM carousels");
    let nextNum = (parseInt(countRes.rows[0].total, 10) || 0) + 1;
    newId = `carrossel-${String(nextNum).padStart(2, '0')}`;
    while (await getCarouselById(newId)) {
      nextNum += 1;
      newId = `carrossel-${String(nextNum).padStart(2, '0')}`;
    }
  }

  const slug = payload.title ? slugify(payload.title) : 'sem-titulo';
  let outDir;
  if (process.platform === 'win32') {
    const userProfile = process.env.USERPROFILE || 'C:/Users/julia';
    const onedrivePath = path.join(userProfile, 'OneDrive', 'Área de Trabalho');
    const hasOneDrive = fs.existsSync(onedrivePath);
    outDir = hasOneDrive
      ? path.join(onedrivePath, `${newId}-${slug}`).replace(/\\/g, '/')
      : path.join(userProfile, 'Desktop', `${newId}-${slug}`).replace(/\\/g, '/');
  } else {
    outDir = path.resolve(__dirname, '..', '..', '..', 'storage', 'carousels', `${newId}-${slug}`);
  }

  const noImageSlidesCount = payload.noImageSlidesCount !== undefined ? Number(payload.noImageSlidesCount) : (existingCarousel?.noImageSlidesCount || 0);

  const newCarousel = {
    id:          newId,
    title:       payload.title || existingCarousel?.title || 'Carrossel',
    theme:       payload.theme || existingCarousel?.theme || slug,
    format:      payload.format || existingCarousel?.format || 'B',
    preset:      payload.preset || payload.template || existingCarousel?.preset || 'bella_editorial_luxo',
    workspace:   'bella',
    status:      'queued',
    createdAt:   existingCarousel?.createdAt || new Date().toISOString(),
    slidesDir:   outDir,
    slidePrefix: 'slide-',
    totalSlides: Number(payload.totalSlides) || payload.slides.length || 10,
    imageQuality: payload.imageQuality || existingCarousel?.imageQuality || 'high',
    caption:     payload.caption || existingCarousel?.caption || '',
    notes:       payload.notes || existingCarousel?.notes || '',
    chatHistory: existingCarousel?.chatHistory || [],
    slides:      existingCarousel?.slides || [],
    noImageSlidesCount: noImageSlidesCount,
    imageProvider: process.env.ACTIVE_IMAGE_PROVIDER || existingCarousel?.imageProvider || 'gpt-image-2',
    copyModel:     process.env.COPY_GENERATION_MODEL || existingCarousel?.copyModel || 'gpt-4o',
    lastPayload: { ...payload, slidesDir: undefined }
  };

  const saved = await saveSingleCarousel(newCarousel);

  const taskPayload = {
    carouselId: newId,
    payload: { ...payload, slidesDir: newCarousel.slidesDir },
    noImageSlidesCount,
    startTime: Date.now()
  };

  const queueResult = await enqueueCarouselTask(taskPayload);

  res.json({
    ok: true,
    id: newId,
    status: 'queued',
    queuePosition: queueResult.queuePosition || 1,
    message: 'Carrossel enfileirado no RabbitMQ com sucesso'
  });
});

// ── API: Obter histórico de criação em tempo real ────────────────────────────
router.get('/api/carousels/:id/history', (req, res) => {
  const { id } = req.params;
  const job = generationJobs.get(id);
  if (!job) {
    return res.json({
      id,
      status: 'done',
      logs: ['Histórico de log em tempo real indisponível para este carrossel.'],
      slides: []
    });
  }
  res.json(job);
});

router.get('/api/debug-jobs', (req, res) => {
  res.json(Array.from(generationJobs.entries()));
});

const CREATOR_TEMPLATE_DIRECTIONS = {
  bella_essencial: {
    name: 'Bella Essencial',
    layouts: ['bella_essential_01', 'bella_essential_02', 'bella_essential_03', 'bella_essential_04', 'bella_essential_05'],
    plans: {
      3: ['bella_essential_01', 'bella_essential_04', 'bella_essential_05'],
      5: ['bella_essential_01', 'bella_essential_02', 'bella_essential_03', 'bella_essential_04', 'bella_essential_05'],
      7: ['bella_essential_01', 'bella_essential_02', 'bella_essential_03', 'bella_essential_02', 'bella_essential_03', 'bella_essential_04', 'bella_essential_05'],
      10: ['bella_essential_01', 'bella_essential_02', 'bella_essential_03', 'bella_essential_02', 'bella_essential_03', 'bella_essential_04', 'bella_essential_02', 'bella_essential_03', 'bella_essential_04', 'bella_essential_05']
    },
    direction: 'design simples e preciso com universo esotérico sensível: antes de escolher objetos, invente uma lei visual exclusiva que revele a tensão psicológica da copy; preserve essa lei no carrossel e transforme gesto, escala e estado em cada página; capa com imagem dominante e texto em base escura; desenvolvimento com imagem enquadrada e copy abaixo; uma pausa tipográfica; sem literalidade pobre, barras, blur improvisado, cards decorativos, misticismo decorativo ou retratos genéricos'
  },
  bella_editorial_luxo: {
    name: 'Direção Viva Bella',
    layouts: ['bella_sequence_01', 'bella_sequence_02', 'bella_sequence_03', 'bella_sequence_04', 'bella_sequence_05', 'bella_sequence_06', 'bella_sequence_07', 'bella_sequence_08', 'bella_sequence_09', 'bella_sequence_10'],
    direction: 'direção editorial adaptativa: a ferida e a tese da copy escolhem entre colagem poética, surrealismo simbólico, matéria escultórica, grafismo expressivo ou cinema em movimento; nunca repetir uma receita fixa de fotografia'
  },
  bella_organico_terracota: {
    name: 'Terracota Orgânico',
    layouts: ['fullbleed', 'text_only', 'card', 'fullbleed', 'card'],
    direction: 'matéria orgânica, argila, linho cru, raízes e pele; paleta terracota, luz solar imperfeita e sensação artesanal, íntima e aterrada'
  },
  bella_verde_musgo: {
    name: 'Botânico Bella',
    layouts: ['fullbleed', 'card', 'text_only', 'fullbleed', 'card'],
    direction: 'narrativa botânica poética, verde-musgo, sálvia e creme; folhas, ciclos naturais, crescimento interior, luz difusa e calma elegante'
  },
  bella_ambar_sagrado: {
    name: 'Âmbar Sagrado',
    layouts: ['etereo', 'text_only', 'card', 'fullbleed', 'etereo'],
    direction: 'luz âmbar, mel, pergaminho e sombra profunda; símbolos sutis, calor maduro, contemplação, clareza e expansão'
  }
};

// Cada ID aciona um papel editorial distinto no compositor. A descrição também
// chega ao Criador para que a fotografia, a copy e a tipografia nasçam como
// uma mesma decisão — e não como uma foto escolhida depois do texto.
const BELLA_SEQUENCE_ROLES = {
  bella_essential_01: 'capa essencial: imagem impactante ocupa os 70% superiores; título e subheadline ficam abaixo em base carvão limpa; crie uma metáfora psicológica esotérica e expressiva — nunca apenas um objeto citado na copy',
  bella_essential_02: 'desenvolvimento: título curto no topo, imagem simbólica enquadrada ao centro e corpo abaixo; a última frase contém a virada',
  bella_essential_03: 'aprofundamento: repete a grade para criar reconhecimento, mas muda ação, escala e sentido da imagem',
  bella_essential_04: 'pausa tipográfica sem imagem: fundo creme, tese serifada ampla e corpo curto; silêncio antes do fechamento',
  bella_essential_05: 'fechamento visual: imagem forte no alto, COMENTE BELLA e convite direto na base escura',
  bella_sequence_01: 'capa fotográfica expansiva: mundo visível em profundidade, mulher de corpo inteiro ou três quartos com no máximo 35% do quadro, movimento e metáfora ambiental; grande silêncio orgânico para a manchete',
  bella_sequence_02: 'manifesto tipográfico em grafite/cacau: título como protagonista, corpo curto e nenhum elemento decorativo aleatório',
  bella_sequence_03: 'diálogo foto + tipografia: fotografia emocional com área silenciosa genuína para título e apoio',
  bella_sequence_04: 'cartaz de palavras: frase monumental, assimétrica e respirada; sem cards, bullets ou aparência corporativa',
  bella_sequence_05: 'cena narrativa íntima: fotografia que encarna a virada, título e apoio em contraste local discreto',
  bella_sequence_06: 'página editorial em duas áreas: imagem e argumento, com margem e ritmo de revista',
  bella_sequence_07: 'manifesto fotográfico de afirmação: pouco texto, gesto preciso e contraste alto',
  bella_sequence_08: 'citação tipográfica: verdade cristalizada com respiro e escala',
  bella_sequence_09: 'página de abertura de possibilidade: imagem recortada e copy de convite',
  bella_sequence_10: 'fechamento escuro e sóbrio: CTA curto, sem vender agressivamente'
};

function compactRecentCopy(value, maxLength = 120) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

async function getRecentBellaCopyContext(limit = 6) {
  try {
    const result = await query(`
      SELECT title, theme, last_payload, created_at
      FROM carousels
      WHERE workspace = 'bella'
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);

    const summaries = result.rows.map((row, index) => {
      let payload = row.last_payload || {};
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch { payload = {}; }
      }

      const slides = Array.isArray(payload?.slides) ? payload.slides : [];
      const slideSignature = slides
        .slice(0, 8)
        .map((slide, slideIndex) => {
          const state = compactRecentCopy(slide.estado || slide.state || slide.role, 36);
          const title = compactRecentCopy(slide.title || slide.title_text, 80);
          return `S${slideIndex + 1}${state ? ` ${state}` : ''}: ${title}`;
        })
        .filter(line => !line.endsWith(': '))
        .join(' | ');

      return `${index + 1}. ${compactRecentCopy(row.title || row.theme, 100)}${slideSignature ? ` — ${slideSignature}` : ''}`;
    }).filter(Boolean);

    return summaries.join('\n');
  } catch (error) {
    logger.warn('[Carousel]', `Não foi possível montar o contexto antirrepetição: ${error.message}`);
    return '';
  }
}

// ── API: Criador — Chat unificado com streaming SSE ──────────────────────────
router.post('/api/criador/stream', async (req, res) => {
  const { messages, totalSlides, noImageSlidesCount, model, reasoningEffort, template, format, recentContentMemory, editorialIntent } = req.body;
  let system = await getAgentPromptAsync('criador');
  if (!system) return res.status(500).json({ error: 'Agente criador não configurado' });
  const artDirectorSystem = await getAgentPromptAsync('diretor-artistico-bella-v2');
  if (artDirectorSystem) {
    system += `\n\n${artDirectorSystem}`;
  }

  // Injeta dinamicamente a quantidade de slides configurada no formulário dentro do System Prompt
  const numSlides = Number(totalSlides) || 10;
  if (numSlides !== 10) {
    system = system
      .replace(/completo de 10 slides/g, `completo de ${numSlides} slides`)
      .replace(/ESTRUTURA DOS 10 SLIDES/g, `ESTRUTURA DOS ${numSlides} SLIDES`)
      .replace(/10 ESTADOS:/g, `${numSlides} ESTADOS:`)
      .replace(/S10/g, `S${numSlides}`)
      .replace(/S9/g, `S${numSlides - 1}`)
      .replace(/S8/g, `S${numSlides - 2}`)
      .replace(/S10 \[CTA FIXO\]/g, `S${numSlides} [CTA FIXO]`)
      .replace(/S9 \[SETUP CTA\]/g, `S${numSlides - 1} [SETUP CTA]`)
      .replace(/S8 \[CRISTALIZAÇÃO\]/g, `S${numSlides - 2} [CRISTALIZAÇÃO]`);
    
    system = `IMPORTANTE: Para esta geração, o usuário configurou e deseja estritamente um carrossel de exatamente ${numSlides} slides. Adapte a estrutura para caberem exatamente em ${numSlides} slides (S1 até S${numSlides}), garantindo que o slide final S${numSlides} seja o CTA Oficial BELLA com a palavra-chave BELLA.\n\n` + system;
  }

  const activeTemplate = CREATOR_TEMPLATE_DIRECTIONS[template] || CREATOR_TEMPLATE_DIRECTIONS.bella_editorial_luxo;
  const selectedPlan = activeTemplate.plans?.[numSlides] || activeTemplate.layouts;
  const layoutPlan = Array.from({ length: numSlides }, (_, index) => {
    const layout = selectedPlan[index % selectedPlan.length];
    const role = BELLA_SEQUENCE_ROLES[layout];
    return `S${index + 1}: ${layout}${role ? ` — ${role}` : ''}`;
  }
  ).join('\n');

  const mandatoryFormatInstruction = `\n\n⚠️ PROTOCOLO CRIATIVO COMPLETO OBRIGATÓRIO:
Direção visual selecionada pelo usuário: ${activeTemplate.name} (${template || 'bella_editorial_luxo'}).
Formato selecionado: ${format || '4:5'}.
Toda a copy, as metáforas visuais, os objetos, a luz e a atmosfera DEVEM refletir esta direção: ${activeTemplate.direction}.
No preset Direção Viva, escolha UMA linguagem-mãe original para o carrossel e declare-a no PLANO-MESTRE. Não use fotografia por padrão. Quando outro template estiver selecionado, respeite sua linguagem própria.

DIREÇÃO ARTÍSTICA OBRIGATÓRIA:
- Cada slide comunica UMA ideia dominante. TÍTULO deve ter entre 3 e 12 palavras; CORPO entre 12 e 42 palavras.
- A função narrativa de cada slide é variável e deve nascer do tema. S3 NÃO tem papel fixo e nunca deve ser automaticamente “impacto no corpo”, sintomas, infância, sistema nervoso, exaustão ou limites.
- Linguagem corporal é opcional: use no máximo uma passagem curta somente quando for indispensável à tese. Não use mandíbula, peito, garganta, sono, vigilância ou “o corpo guarda” como atalhos para fabricar profundidade.
- Se duas lâminas intermediárias puderem trocar de posição sem prejudicar o sentido, falta causalidade: reescreva a sequência para que cada slide responda ao anterior e abra uma pergunta específica para o próximo.
- Varie o mecanismo emocional entre conteúdos: curiosidade, contradição, desejo, reconhecimento, ternura, indignação, lucidez, contemplação e decisão. Não reduza “impacto emocional” a anatomia.
- Escreva para composição visual: elimine explicações redundantes, listas longas e paredes de texto.
- Alterne ritmo entre slides fotográficos, tipográficos e de respiro; não centralize tudo e não repita a mesma composição. A tipografia é parte da cena: pense em escala, recorte intencional, alinhamento, pausa e contraste antes de escrever cada título.
- Nas lâminas tipográficas, deixe a FRASE COMPLETA carregar a escala. Não transforme uma palavra solta do título em enfeite e não repita palavra-chave já dita no título.
- Em VISUAL, traduza o CONFLITO da copy em uma cena que só poderia pertencer àquele slide: emoção no rosto, gesto, objeto simbólico, matéria, luz e ambiente devem carregar o mesmo sentido. Antes de escrever a cena, defina mentalmente: “qual ferida esta imagem torna visível?” e “qual transformação ela faz desejar?”.
- É proibido usar cadeira vazia, café, janela, livro, planta ou retrato neutro como preenchimento visual. Só use esses elementos se a copy os tornar indispensáveis. Uma copy sobre prosperidade, merecimento ou valor pode pedir, por exemplo, uma mulher de olhar profundo diante de reflexos dourados, moedas antigas, metal líquido, fios de ouro ou uma balança simbólica — nunca decoração aleatória.
- Em VISUAL, descreva uma metáfora concreta, o enquadramento nativo vertical 4:5, a posição do sujeito (esquerda/direita/centro), expressão/gesto, matéria e luz, além de onde deve existir espaço negativo para a tipografia.
- Na capa S1, crie um universo expansivo e expressivo. Pode ser colagem, surrealismo, instalação escultórica, grafismo ou cinema ambiental — o meio deve nascer da tese. Uma pessoa é opcional; se existir, deve ocupar no máximo 35% do quadro. Preserve uma grande região de silêncio orgânico para a manchete. Nunca use close, retrato sentado contra parede lisa, mulher posando diante de parede ou pose genérica.
- A imagem precisa participar do significado da copy. Evite retratos genéricos, banco de imagens, poses artificiais e símbolos óbvios.
- Nunca peça texto dentro da imagem gerada; a cena nasce limpa e a tipografia editorial é composta pelo sistema para preservar acentos, ortografia, alinhamento e edição posterior.

PLANO-MESTRE DO CARROSSEL:
- Antes dos slides, defina LINGUAGEM-MÃE, paleta de cinco cores, um símbolo material recorrente e no máximo três CENAS-MÃE (A, B e C). Escolha a linguagem-mãe entre: colagem poética, surrealismo simbólico, matéria escultórica, grafismo expressivo ou cinema em movimento. Varie essa escolha entre conteúdos; fotografia não é padrão.
- Uma CENA-MÃE deve voltar em outro slide com a mesma personagem, roupa, atmosfera e símbolo, porém com recorte diferente. Não invente uma fotografia independente para cada lâmina.
- Conduza uma curva visual: impacto fotográfico → respiro tipográfico → retorno da cena → explicação gráfica → transformação.
- Nos slides puramente tipográficos use CENA: TIPOGRÁFICA. Nos fotográficos use CENA: A, B ou C.
- O plano inteiro deve ser original para Isabella Dalcin; referências servem apenas para princípios de ritmo, hierarquia e direção.

Ao receber um tema, você DEVE SEMPRE gerar TODAS as seções na ordem exata:
1. PRAÇA / PILAR T.A.F.A e FORMATO
2. ARQUEOLOGIA DA FERIDA (Dor atual, Desejo profundo, Frustrações, Crença nuclear, Verdade oculta)
3. BIG IDEA
4. HOOK FORGE (3 ganchos + Escolhido + Motivo)
5. PLANO-MESTRE DE ARTE (paleta, símbolo recorrente, CENA A, CENA B, CENA C e progressão cromática)
6. PARTITURA EMOCIONAL (S1 até S${numSlides})
7. SLIDES (ROTEIRO OFICIAL com tags [S1] até [S${numSlides}], TÍTULO: completo sem '...', CORPO:, CENA: e VISUAL:)
8. CAPTION e CTA TRIBAL

⚠️ REGRA INNEGOCIÁVEL DE FORMATO DE SAÍDA DE SLIDES:
Ao gerar o roteiro final de slides, cada slide DEVE usar a tag exata abaixo:
[SX — ESTADO | layout: LAYOUT]
TÍTULO: [título completo — NUNCA use reticências ou "..."]
CORPO: [conteúdo do texto/copy do slide]
CENA: [A, B, C ou TIPOGRÁFICA]
VISUAL: [descrição da imagem visual do slide com espaço negativo para tipografia]
DIREÇÃO_JSON: {"visual_role":"","subject":"","action":"","environment":"","material_anchor":"","crop_focus":"","mood":"","accent":"","photo_treatment":"","text_density":"","continuity_key":"","unique_detail":"","emotional_intent":"","care_signal":"","sensory_focus":"","light":"","lens":"","composition":"","human_presence":"","authenticity_detail":"","anti_corporate_guard":""}

O DIREÇÃO_JSON deve ocupar uma única linha e conter JSON válido. Ele é a ponte entre a copy, o diretor artístico e o gerador/compositor; não repita valores genéricos entre lâminas.

Use exatamente este plano de layouts para a direção escolhida:
${layoutPlan}

Jamais entregue títulos vazios ou com "...". O CTA do slide final DEVE ser SEMPRE "COMENTE BELLA" para a Academia Sete.

🎯 REGRA DE SELEÇÃO DE TEMA:
Se o usuário escolheu ou enviou um tema/título, você DEVE IMEDIATAMENTE gerar o roteiro completo dos ${numSlides} slides ([S1] até [S${numSlides}]). NUNCA continue listando mais opções de temas numeradas.\n\n`;

  system = system + mandatoryFormatInstruction;
  const visualReferenceContract = getBellaVisualReferenceContract();
  system += `\n\nMEMÓRIA VISUAL BELLA — use como princípios de decisão, nunca como template para copiar:\n${JSON.stringify(visualReferenceContract)}`;

  const recentCopyContext = await getRecentBellaCopyContext();
  if (recentCopyContext) {
    system += `\n\n🧭 MEMÓRIA EDITORIAL RECENTE — USE APENAS PARA EVITAR REPETIÇÃO:
${recentCopyContext}

Antes de responder, compare o novo conteúdo com esta memória em seis dimensões: gancho, arquitetura narrativa, estado de S3, metáfora central, construção sintática e resolução. Não copie os exemplos. Se duas dimensões coincidirem, mude o arco antes de escrever. S3 deve nascer da causalidade deste tema; é proibido transformá-lo automaticamente em impacto no corpo, sintomas, infância, sistema nervoso ou exaustão.\n`;
  }

  if (Array.isArray(recentContentMemory) && recentContentMemory.length > 0) {
    const browserMemory = recentContentMemory.slice(0, 6).map((entry, index) => {
      const slides = Array.isArray(entry?.slides) ? entry.slides.slice(0, 10) : [];
      const signature = slides.map((slide, slideIndex) => {
        const position = Number(slide?.position) || slideIndex + 1;
        const state = compactRecentCopy(slide?.state, 40);
        const title = compactRecentCopy(slide?.title, 100);
        const body = compactRecentCopy(slide?.body, 140);
        return `S${position}${state ? ` ${state}` : ''}: ${title}${body ? ` / ${body}` : ''}`;
      }).join(' | ');
      return `${index + 1}. ${compactRecentCopy(entry?.title, 100)} — ${signature}`;
    }).join('\n');

    system += `\n\n🧠 MEMÓRIA DOS ROTEIROS RECENTES SALVOS NO CRIADOR:
${browserMemory}

Esta memória não é referência de estilo para copiar; é uma lista antirrepetição. Faça uma comparação estrutural antes de redigir. Mude obrigatoriamente o arco, a função de S3 e a metáfora quando o novo roteiro se aproximar desses padrões.\n`;
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages é obrigatório' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.write(`data: ${JSON.stringify({ error: 'OPENAI_API_KEY não configurada' })}\n\n`);
    return res.end();
  }

  const OPENAI_URL = 'https://api.openai.com/v1/responses';
  const allowedModels = ['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna'];
  const allowedEfforts = ['low', 'medium', 'high'];
  const activeModel = allowedModels.includes(model) ? model : 'gpt-5.6-terra';
  const activeEffort = allowedEfforts.includes(reasoningEffort) ? reasoningEffort : 'medium';

  try {
    const formattedMessages = contextualizeThemeSelection(messages.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : msg.role,
      content: msg.content || ''
    })));

    const detectedEditorialMode = detectEditorialMode(formattedMessages);
    const editorialMode = editorialIntent === 'production' || editorialIntent === 'ideas'
      ? editorialIntent
      : detectedEditorialMode;
    const latestUserMessage = [...formattedMessages].reverse().find(message => message.role === 'user')?.content || '';
    logger.info('[Carousel]', `Criador Bella selecionou modo editorial: ${editorialMode} (detectado=${detectedEditorialMode}, contrato=${editorialIntent || 'auto'}, pedido=${compactRecentCopy(latestUserMessage, 120)})`);
    if (editorialMode === 'ideas' || editorialMode === 'production') {
      try {
        const promptIds = ['oraculo-v2', 'gancho-viral', 'copywriter', 'diretor-artistico-bella-v2', 'oraculo-revisor-bella', 'pesquisador-bella', 'verificador-fatos-bella'];
        const promptValues = await Promise.all(promptIds.map(id => getAgentPromptAsync(id)));
        const editorialPrompts = Object.fromEntries(promptIds.map((id, index) => [id, promptValues[index] || '']));
        const memory = [recentCopyContext, JSON.stringify(recentContentMemory || [])].filter(Boolean).join('\n');
        // O gerador de imagem depende do plano de layouts e do DIREÇÃO_JSON de cada lâmina
        // (build_prompt e a seleção de referências visuais leem visual_plan). Esse contrato
        // precisa chegar à etapa de escrita mesmo quando o prompt `criador` não é usado.
        const technicalContract = `CONTRATO TÉCNICO DAS LÂMINAS (o gerador de imagem depende disto; tem prioridade sobre instruções de variar layouts livremente):
- Use exatamente este plano de layouts para a direção escolhida:
${layoutPlan}
- Ordem dos campos em cada lâmina: cabeçalho [SX — ESTADO | layout: LAYOUT], TÍTULO:, CORPO:, CENA:, RESPIRO:, VISUAL:, DIREÇÃO_JSON:.
- DIREÇÃO_JSON ocupa uma única linha com JSON válido e estas chaves preenchidas de forma específica para aquela lâmina, sem valores genéricos repetidos entre lâminas: {"visual_role":"","subject":"","action":"","environment":"","material_anchor":"","crop_focus":"","mood":"","accent":"","photo_treatment":"","text_density":"","continuity_key":"","unique_detail":"","emotional_intent":"","care_signal":"","sensory_focus":"","light":"","lens":"","composition":"","human_presence":"","authenticity_detail":"","anti_corporate_guard":""}`;
        const visualDirection = `IDENTIDADE BELLA: ${activeTemplate.name}. ${activeTemplate.direction}\nQuantidade variável: ${numSlides} lâminas. Preserve CTA COMENTE BELLA no encerramento. Aplique o plano de layouts já fornecido pelo sistema, mas varie linguagem-mãe, escala, densidade e presença humana entre conteúdos.\nMEMÓRIA VISUAL E ANTIPADRÕES: ${JSON.stringify(visualReferenceContract)}\n${technicalContract}`;
        const orchestrationArgs = {
          apiKey, model: activeModel, reasoningEffort: activeEffort,
          messages: formattedMessages, totalSlides: numSlides, memory, visualDirection,
          prompts: {
            master: system,
            strategist: editorialPrompts['oraculo-v2'],
            hooks: editorialPrompts['gancho-viral'],
            copywriter: editorialPrompts.copywriter,
            artDirector: editorialPrompts['diretor-artistico-bella-v2'],
            reviewer: editorialPrompts['oraculo-revisor-bella'],
            researcher: editorialPrompts['pesquisador-bella'],
            factChecker: editorialPrompts['verificador-fatos-bella']
          },
          onStage: (stage, label) => res.write(`data: ${JSON.stringify({ stage, label })}\n\n`),
          onActivity: activity => res.write(`data: ${JSON.stringify({ activity })}\n\n`)
        };
        const orchestration = editorialMode === 'ideas'
          ? await runBigIdeaLab(orchestrationArgs)
          : await runEditorialOrchestration(orchestrationArgs);
        const finalText = orchestration.text || '';
        for (let index = 0; index < finalText.length; index += 180) {
          res.write(`data: ${JSON.stringify({ token: finalText.slice(index, index + 180) })}\n\n`);
        }
        const inputTokens = orchestration.usage?.input_tokens || 0;
        const outputTokens = orchestration.usage?.output_tokens || 0;
        const modelPricesPerMillion = {
          'gpt-5.6-sol': { input: 4.00, output: 20.00 },
          'gpt-5.6-terra': { input: 2.00, output: 12.00 },
          'gpt-5.6-luna': { input: 0.20, output: 1.20 }
        };
        const prices = modelPricesPerMillion[activeModel];
        const costUsd = Number((((inputTokens * prices.input) + (outputTokens * prices.output)) / 1_000_000).toFixed(5));
        const costBrl = Number((costUsd * 5).toFixed(4));
        await recordUsageCost({
          type: 'agent_prompt',
          itemId: editorialMode === 'ideas' ? 'bella-big-idea-lab' : 'bella-editorial-orchestration',
          description: `${editorialMode === 'ideas' ? 'Laboratório de Big Ideas' : 'Orquestração editorial'} Bella (${orchestration.stages.join(' → ')})`,
          model: activeModel, provider: 'openai', costUsd, costBrl,
          tokensInput: inputTokens, tokensOutput: outputTokens, quantity: orchestration.stages.length,
          metadata: {
            workspace: 'bella', editorialMode, stages: orchestration.stages,
            researchMode: orchestration.brief?.research_mode || 'dispensable',
            bigIdea: orchestration.brief?.selected_big_idea || '',
            sourceCount: orchestration.research?.sources?.length || 0,
            sources: orchestration.research?.sources || []
          }
        });
        res.write(`data: ${JSON.stringify({ done: true, model: activeModel, reasoningEffort: activeEffort, costUSD: costUsd, costBRL: costBrl, orchestration: true, editorialMode, stages: orchestration.stages, researchMode: orchestration.brief?.research_mode || 'dispensable' })}\n\n`);
        return res.end();
      } catch (orchestrationError) {
        logger.error('[Carousel]', `Orquestração editorial Bella falhou; usando Criador direto: ${orchestrationError.message}`);
        res.write(`data: ${JSON.stringify({ stage: 'fallback', label: 'Continuando com o Criador direto' })}\n\n`);
      }
    }

    let response;
    try {
      const payload = {
        model: activeModel,
        instructions: system,
        input: formattedMessages,
        reasoning: { effort: activeEffort },
        max_output_tokens: 10000,
        stream: true,
      };

      response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (fetchErr) {
      const cause = fetchErr.cause?.message || fetchErr.cause?.code || '';
      const detail = cause ? ` (causa: ${cause})` : '';
      logger.error('[Carousel]', `criador/stream — falha de rede ao conectar com a OpenAI${detail}. URL: ${OPENAI_URL}. Erro: ${fetchErr.message}. Stack: ${fetchErr.stack}`);
      const userMsg = `Erro de conexão com a OpenAI: não foi possível alcançar ${OPENAI_URL}.${detail} Verifique a conexão de rede do servidor ou se a API da OpenAI está fora do ar.`;
      res.write(`data: ${JSON.stringify({ error: userMsg })}\n\n`);
      return res.end();
    }

    if (!response.ok) {
      let errText = `HTTP ${response.status}`;
      let rawBody = '';
      try {
        const j = await response.json();
        rawBody = JSON.stringify(j);
        errText = j.error?.message || errText;
      } catch {}

      logger.error('[Carousel]', `criador/stream — OpenAI retornou erro HTTP ${response.status}. Modelo: ${activeModel}. Esforço: ${activeEffort}. Corpo: ${rawBody}`);

      if (response.status === 401) {
        errText = 'A OPENAI_API_KEY configurada é inválida ou expirou. Verifique a chave no arquivo .env do servidor.';
      } else if (response.status === 403) {
        errText = 'Acesso negado pela OpenAI (403). A chave pode não ter permissão para usar o modelo ' + activeModel + '.';
      } else if (response.status === 404) {
        errText = `Modelo "${activeModel}" não encontrado na OpenAI (404). Verifique se sua conta tem acesso a ele.`;
      } else if (errText.includes('quota') || errText.includes('billing') || response.status === 429) {
        errText = 'Você excedeu sua cota atual na OpenAI ou atingiu o limite de requisições. Adicione créditos em: https://platform.openai.com/settings/organization/billing/overview';
      } else if (response.status >= 500) {
        errText = `A OpenAI retornou um erro interno (${response.status}). Tente novamente em alguns instantes.`;
      }

      res.write(`data: ${JSON.stringify({ error: errText })}\n\n`);
      return res.end();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let generatedFullText = '';
    let responseUsage = null;
    let providerStreamError = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const t = line.trim();
        if (!t || t === 'data: [DONE]') continue;
        if (t.startsWith('data: ')) {
          try {
            const event = JSON.parse(t.slice(6));
            if (event.type === 'response.output_text.delta' && event.delta) {
              generatedFullText += event.delta;
              res.write(`data: ${JSON.stringify({ token: event.delta })}\n\n`);
            }
            if (event.type === 'response.completed') {
              responseUsage = event.response?.usage || null;
            }
            if (event.type === 'response.failed' || event.type === 'error') {
              providerStreamError = event.response?.error?.message || event.error?.message || event.message || 'A geração foi interrompida pela OpenAI.';
            }
          } catch {}
        }
      }
    }

    if (providerStreamError) {
      throw new Error(providerStreamError);
    }

    const estimatedInputWords = system.split(/\s+/).length + formattedMessages.reduce((acc, m) => acc + (m.content || '').split(/\s+/).length, 0);
    const inputTokens = responseUsage?.input_tokens || Math.round(estimatedInputWords * 1.33);
    const outputTokens = responseUsage?.output_tokens || Math.round(generatedFullText.split(/\s+/).length * 1.33);
    const modelPricesPerMillion = {
      'gpt-5.6-sol': { input: 4.00, output: 20.00 },
      'gpt-5.6-terra': { input: 2.00, output: 12.00 },
      'gpt-5.6-luna': { input: 0.20, output: 1.20 }
    };
    const prices = modelPricesPerMillion[activeModel];
    const costUsd = Number((((inputTokens * prices.input) + (outputTokens * prices.output)) / 1_000_000).toFixed(5));
    const costBrl = Number((costUsd * 5.0).toFixed(4));

    await recordUsageCost({
      type: 'agent_prompt',
      itemId: 'criador',
      description: `Prompt com Agente no Criador (${outputTokens} tokens)`,
      model: activeModel,
      provider: 'openai',
      costUsd,
      costBrl,
      tokensInput: inputTokens,
      tokensOutput: outputTokens,
      quantity: 1,
      metadata: { model: activeModel, reasoningEffort: activeEffort }
    });

    res.write(`data: ${JSON.stringify({ done: true, model: activeModel, reasoningEffort: activeEffort, costUSD: costUsd, costBRL: costBrl })}\n\n`);
    res.end();
  } catch (e) {
    const cause = e.cause?.message || e.cause?.code || '';
    logger.error('[Carousel]', `criador/stream — erro inesperado: ${e.message}${cause ? ' | causa: ' + cause : ''}. Stack: ${e.stack}`);
    const userMsg = `Erro inesperado ao processar resposta da IA: ${e.message}${cause ? ' (' + cause + ')' : ''}`;
    if (!res.headersSent) res.status(500).json({ error: userMsg });
    else { res.write(`data: ${JSON.stringify({ error: userMsg })}\n\n`); res.end(); }
  }
});

router.post("/api/escala/criar-mock", async (req, res) => {
  if (!req.user || !isUserSuperAdmin(req.user.email)) {
    return res.status(403).json({ error: "Acesso negado. Apenas super admins podem usar o teste de escala." });
  }

  const payload = req.body;
  if (!payload || !Array.isArray(payload.slides) || payload.slides.length === 0) {
    return res.status(400).json({ error: "slides é obrigatório" });
  }

  let allCarousels = [];
  try {
    allCarousels = await readDataAsync();
  } catch (err) {
    logger.error('[Carousel]', "Erro ao ler carrosséis para determinar ID:", err);
  }

  const targetId = payload.id;
  let existingIndex = -1;
  if (targetId) {
    existingIndex = allCarousels.findIndex(c => c.id === targetId);
  }

  const finalId = existingIndex >= 0 ? targetId : (() => {
    const nums = allCarousels.map(c => parseInt(c.id?.split('-').pop()) || 0).filter(Boolean);
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
    return `carrossel-${String(nextNum).padStart(2, '0')}`;
  })();

  const slug = payload.title ? slugify(payload.title) : 'sem-titulo';
  const outDir = path.join(__dirname, '..', '..', '..', 'storage', `carrossel-${slug}`);

  const slidesData = payload.slides.map((s, idx) => ({
    num: idx + 1,
    title_text: s.title || s.title_text || `Slide ${idx + 1}`,
    text: s.body || s.text || ""
  }));

  const estimatedCost = slidesData.length * 0.08;
  const baseCarousel = existingIndex >= 0 ? allCarousels[existingIndex] : {};
  const notesContent = slidesData.map(s => `[Slide ${s.num}]\nTítulo: ${s.title_text}\nCorpo: ${s.text}`).join('\n\n');

  const updatedCarousel = {
    ...baseCarousel,
    id:          finalId,
    title:       payload.title || baseCarousel.title || 'Carrossel em Escala',
    theme:       payload.title || baseCarousel.theme || 'Geração Automática',
    format:      payload.format || baseCarousel.format || 'B',
    status:      'generating',
    preset:      'escala',
    cost:        estimatedCost,
    createdAt:   baseCarousel.createdAt || new Date().toISOString(),
    slidesDir:   outDir.replace(/\\/g, '/'),
    slidePrefix: 'slide-',
    totalSlides: payload.totalSlides || slidesData.length || baseCarousel.totalSlides || 10,
    imageQuality: payload.imageQuality || baseCarousel.imageQuality || 'high',
    caption:     payload.caption || baseCarousel.caption || '',
    notes:       notesContent,
    chatHistory: baseCarousel.chatHistory || [],
    slides:      [],
  };

  if (existingIndex >= 0) {
    allCarousels[existingIndex] = updatedCarousel;
  } else {
    allCarousels.push(updatedCarousel);
  }
  
  await writeDataAsync(allCarousels);
  res.json({ ok: true, carousel: updatedCarousel });

  (async () => {
    try {
      let branding = {
        logoText: "FONTE OCULTA",
        logoColor: "#ffffff",
        carouselTextColor: "#e4e4e7"
      };
      try {
        const resBranding = await query('SELECT data FROM branding WHERE id = 1');
        if (resBranding.rows.length > 0 && resBranding.rows[0].data && Object.keys(resBranding.rows[0].data).length > 0) {
          branding = resBranding.rows[0].data;
        }
      } catch (err) {
        logger.error('[Carousel mock branding]', "Erro ao ler branding do DB:", err.message);
      }

      const PIPELINE = path.join(__dirname, '..', '..', '..', 'core', 'generate_mock_slides.py');
      
      const child = spawn(PYTHON, ['-X', 'utf8', PIPELINE, '--data', JSON.stringify({
        id: finalId,
        title: updatedCarousel.title,
        slidesDir: updatedCarousel.slidesDir,
        format: updatedCarousel.format,
        slides: slidesData,
        logoText: branding.logoText || "FONTE OCULTA",
        logoColor: branding.logoColor || "#ffffff",
        logoSize: branding.logoSize || "22px",
        carouselTextColor: branding.carouselTextColor || "#e4e4e7",
        titleTextSize: branding.titleTextSize || "40px",
        bodyTextSize: branding.bodyTextSize || "24px",
        titleTextColor: branding.titleTextColor || "#ffffff",
        bodyTextColor: branding.bodyTextColor || branding.carouselTextColor || "#e4e4e7",
        logoPosition: branding.logoPosition || "left"
      })], {
        shell: false,
        cwd: path.join(__dirname, '..', '..', '..'),
        env: { ...process.env }
      });

      const generatedFiles = [];

      child.stdout.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const obj = JSON.parse(line);
            if (obj.type === 'slide' && obj.status === 'ok') {
              const fileAbsPath = path.join(outDir, obj.filename);
              generatedFiles.push({
                num: obj.num,
                estado: obj.estado || 'PRODUÇÃO',
                file: fileAbsPath,
                filename: obj.filename
              });
              
              sseClients.forEach(send => send({
                type: 'slide',
                carouselId: finalId,
                num: obj.num,
                total: slidesData.length,
                estado: obj.estado || 'PRODUÇÃO',
                status: 'generating_image',
                filename: obj.filename,
                title_text: slidesData[obj.num - 1]?.title_text || ''
              }));
            }
          } catch (e) {}
        }
      });

      child.stderr.on('data', (chunk) => {
        logger.error('[Carousel mock stderr]', chunk.toString().trim());
      });

      const code = await new Promise((resolve) => {
        child.on('close', resolve);
      });

      logger.info('[Carousel mock]', `Script Python finalizou com código ${code}. Arquivos gerados: ${generatedFiles.length}`);

      if (generatedFiles.length > 0) {
        const currentSlidesList = [];

        if (b2) {
          sseClients.forEach(send => send({
            type: 'log',
            carouselId: finalId,
            msg: '☁ Enviando slides gerados para o MinIO...'
          }));

          for (const { num, estado, file, filename } of generatedFiles) {
            try {
              const url = await b2.uploadImageToB2(finalId, filename, file);
              currentSlidesList.push(filename);
              
              sseClients.forEach(send => send({
                type: 'log',
                carouselId: finalId,
                msg: `☁ ${filename} → MinIO ✓`
              }));

              await updateCarouselFields(finalId, { slides: currentSlidesList });

              sseClients.forEach(send => send({
                type: 'slide',
                carouselId: finalId,
                num: num,
                total: slidesData.length,
                estado: estado,
                status: 'ok',
                filename: filename
              }));

            } catch (err) {
              logger.error('[Carousel mock upload]', `Falha no upload de ${filename} para o MinIO: ${err.message}`);
            }

            try { fs.unlinkSync(file); } catch {}
          }

          try { fs.rmdirSync(outDir); } catch {}
        } else {
          for (const { num, estado, filename } of generatedFiles) {
            currentSlidesList.push(filename);
            
            sseClients.forEach(send => send({
              type: 'slide',
              carouselId: finalId,
              num: num,
              total: slidesData.length,
              estado: estado,
              status: 'ok',
              filename: filename
            }));
          }
        }

        await updateCarouselFields(finalId, {
          status: 'pronto',
          totalSlides: currentSlidesList.length,
          slides: currentSlidesList,
          b2BaseUrl: b2 ? b2.b2ImageUrl(finalId, '') : undefined
        });
      }

      await new Promise(r => setTimeout(r, 1000));

      sseClients.forEach(send => send({
        type: 'done',
        carouselId: finalId
      }));

    } catch (err) {
      logger.error('[Carousel mock simulation]', `Erro na simulação e upload do mock: ${err.message}`);
    }
  })();
});

export default router;
