import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { 
  readDataAsync, 
  getCarouselById,
  saveSingleCarousel,
  updateCarouselFields,
  deleteCarouselById,
  getLocalSlidesDir, 
  getSlidesForCarousel, 
  getCarouselCostDetails
} from "../../helpers.js";
import { buildAgentPrompts } from "../../agentPrompts.js";
import { CLIENT, generationJobs } from "../../state.js";
import { logger } from '../../logger.js';
import { query } from '../../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

async function getAllAgentPrompts(client) {
  const AGENTS_DIR = path.join(__dirname, "..", "..", "..", "agents");
  const NAMES_FILE = path.join(AGENTS_DIR, "display_names.json");
  let displayNames = {};
  try {
    if (fs.existsSync(NAMES_FILE)) {
      displayNames = JSON.parse(fs.readFileSync(NAMES_FILE, "utf-8"));
    }
  } catch {}

  let dbPromptsMap = {};
  try {
    const dbRes = await query('SELECT id, display_name, content FROM agent_prompts');
    if (dbRes && dbRes.rows) {
      for (const row of dbRes.rows) {
        dbPromptsMap[row.id] = {
          name: row.display_name,
          content: row.content
        };
      }
    }
  } catch {}

  const dynamicPrompts = buildAgentPrompts(client) || {};
  let list = [];

  try {
    if (fs.existsSync(AGENTS_DIR)) {
      const files = fs.readdirSync(AGENTS_DIR);
      list = files
        .filter(f => f.endsWith(".md"))
        .map(f => {
          const id = f.replace(".md", "");
          const fileContent = fs.readFileSync(path.join(AGENTS_DIR, f), "utf-8");
          const dbEntry = dbPromptsMap[id];
          let name = (dbEntry && dbEntry.name) || displayNames[id];
          if (!name) {
            name = id
              .split("-")
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
              .replace("Haucacau", "HauCacau")
              .replace("V2", "V2")
              .replace("Dna", "DNA")
              .replace("Cta", "CTA");
          }
          const content = (dbEntry && dbEntry.content) ? dbEntry.content : fileContent;
          return { id, name, content };
        });
    }
  } catch (e) {
    logger.error("[AgentPrompts]", "Erro ao ler pasta agents:", e.message);
  }

  for (const [key, text] of Object.entries(dynamicPrompts)) {
    if (!list.some(a => a.id === key)) {
      const formattedName = key
        .split("_")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      const dbEntry = dbPromptsMap[key];
      const content = (dbEntry && dbEntry.content) ? dbEntry.content : text;
      list.push({ id: key, name: formattedName, content });
    }
  }

  const map = Object.fromEntries(list.map(a => [a.id, a.content]));
  return { map, list };
}

// ── API: List all carousels ──────────────────────────────────────────────────
router.get("/api/carousels", async (req, res) => {
  const all = await readDataAsync();
  const carousels = all.map(c => {
    const slides = getSlidesForCarousel(c);
    const costDetails = getCarouselCostDetails(c);
    const activeJob = generationJobs.get(c.id);
    const generationStartedAt = activeJob?.startedAt || c.generationStartedAt || (c.status === 'generating' ? new Date(c.createdAt || Date.now()).getTime() : undefined);
    
    let generationDuration = c.generationDuration;
    let generationTimeSeconds = c.generationTimeSeconds;
    if (c.status !== 'generating') {
      if (!generationTimeSeconds && c.completedAt && (c.generationStartedAt || c.createdAt)) {
        const startMs = new Date(c.generationStartedAt || c.createdAt).getTime();
        const endMs = new Date(c.completedAt).getTime();
        if (startMs && endMs && endMs > startMs) {
          generationTimeSeconds = Math.max(1, Math.round((endMs - startMs) / 1000));
        }
      }
      if (!generationDuration && generationTimeSeconds) {
        const mins = Math.floor(generationTimeSeconds / 60);
        const secs = generationTimeSeconds % 60;
        generationDuration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      }
    }
    
    return { 
      ...c, 
      slidesFound: slides.length, 
      slides, 
      cost: costDetails.cost, 
      costDetails, 
      generationStartedAt,
      generationDuration,
      generationTimeSeconds 
    };
  });
  res.json(carousels);
});

// ── API: Get single carousel ─────────────────────────────────────────────────
router.get("/api/carousels/:id", async (req, res) => {
  const all = await readDataAsync();
  const c = all.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Carrossel não encontrado" });
  const slides = getSlidesForCarousel(c);
  const costDetails = getCarouselCostDetails(c);
  const activeJob = generationJobs.get(c.id);
  const generationStartedAt = activeJob?.startedAt || c.generationStartedAt || (c.status === 'generating' ? new Date(c.createdAt || Date.now()).getTime() : undefined);

  let generationDuration = c.generationDuration;
  let generationTimeSeconds = c.generationTimeSeconds;
  if (c.status !== 'generating') {
    if (!generationTimeSeconds && c.completedAt && (c.generationStartedAt || c.createdAt)) {
      const startMs = new Date(c.generationStartedAt || c.createdAt).getTime();
      const endMs = new Date(c.completedAt).getTime();
      if (startMs && endMs && endMs > startMs) {
        generationTimeSeconds = Math.max(1, Math.round((endMs - startMs) / 1000));
      }
    }
    if (!generationDuration && generationTimeSeconds) {
      const mins = Math.floor(generationTimeSeconds / 60);
      const secs = generationTimeSeconds % 60;
      generationDuration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
  }

  res.json({ 
    ...c, 
    slides, 
    cost: costDetails.cost, 
    costDetails, 
    generationStartedAt,
    generationDuration,
    generationTimeSeconds
  });
});

// ── API: Get carousel pipeline details ───────────────────────────────────────
router.get("/api/carousels/:id/pipeline", async (req, res) => {
  const all = await readDataAsync();
  const c = all.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Carrossel não encontrado" });

  const rawSlides = getSlidesForCarousel(c);
  const slidesDir = getLocalSlidesDir(c);
  const slides = rawSlides.map((s, idx) => {
    const filename = typeof s === 'string' ? s : (s.filename || s.name);
    const numStr = String(idx + 1).padStart(2, '0');
    let prompt = null;
    let layout = 'fullbleed';
    let title = '';
    
    if (slidesDir && fs.existsSync(slidesDir)) {
      const metaPath = path.join(slidesDir, `slide-${numStr}.meta.json`);
      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          prompt = meta.prompt || meta.arte_prompt || null;
          layout = meta.layout || layout;
          title = meta.title || title;
        } catch (e) {}
      }
    }

    if (typeof s === 'object') {
      return {
        ...s,
        filename,
        num: s.num || idx + 1,
        prompt: s.prompt || prompt || (layout === 'text_only' ? '[ Slide de Fundo Preto / Sem Imagem ]' : null),
        layout: s.layout || layout,
        title: s.title || title
      };
    }
    return {
      filename,
      num: idx + 1,
      prompt: prompt || (layout === 'text_only' ? '[ Slide de Fundo Preto / Sem Imagem ]' : null),
      layout,
      title
    };
  });

  const costDetails = getCarouselCostDetails(c);
  const job = generationJobs.get(c.id);
  const { map: agentPromptsMap, list: agentPromptsList } = await getAllAgentPrompts(CLIENT);

  res.json({
    id: c.id,
    title: c.title,
    theme: c.theme || '',
    format: c.format || 'A',
    preset: c.preset || 'cinematografico',
    status: c.status,
    createdAt: c.createdAt,
    slidesDir: c.slidesDir,
    totalSlides: c.totalSlides || slides.length || 10,
    caption: c.caption || '',
    notes: c.notes || '',
    imageProvider: c.imageProvider || process.env.ACTIVE_IMAGE_PROVIDER || 'gpt-image-2',
    copyModel: c.copyModel || process.env.COPY_GENERATION_MODEL || 'gpt-4o',
    cost: c.cost || costDetails.cost || 0,
    costDetails,
    slides,
    slidesFound: slides.length,
    chatHistory: c.chatHistory || [],
    agentPrompts: agentPromptsMap,
    agentPromptsList,
    totalAgents: agentPromptsList.length,
    generationLogs: job ? job.logs : (c.generationLogs || c.logs || [
      'Iniciando pipeline de geração...',
      `Configuração: Formato ${c.format || 'A'}, Preset ${c.preset || 'cinematografico'}, Provedor: ${c.imageProvider || 'gpt-image-2'}`,
      `Processamento de ${slides.length || c.totalSlides || 10} slides concluído com status "${c.status}".`
    ]),
    pipelineData: {
      theme: c.theme || '',
      format: c.format || 'A',
      preset: c.preset || 'cinematografico',
      imageQuality: c.imageQuality || 'high',
      no_image_slides_count: c.no_image_slides_count || 0
    }
  });
});

// ── API: Create carousel ─────────────────────────────────────────────────────
router.post("/api/carousels", async (req, res) => {
  logger.info('[CarouselsAPI]', `CRIAR NOVO CARROSSEL (POST): ${JSON.stringify(req.body)}`);
  const countRes = await query("SELECT count(*) as total FROM carousels");
  let nextIdNum = (parseInt(countRes.rows[0].total, 10) || 0) + 1;
  let newId = `carrossel-${String(nextIdNum).padStart(2, "0")}`;
  while (await getCarouselById(newId)) {
    nextIdNum++;
    newId = `carrossel-${String(nextIdNum).padStart(2, "0")}`;
  }

  const newCarousel = {
    id: newId,
    title: req.body.title || "Sem título",
    theme: req.body.theme || "",
    format: req.body.format || "A",
    preset: req.body.preset || "bella_editorial_luxo",
    workspace: "bella",
    status: "rascunho",
    createdAt: new Date().toISOString(),
    slidesDir: req.body.slidesDir || "",
    slidePrefix: "slide-",
    totalSlides: Number(req.body.totalSlides) || 10,
    imageQuality: req.body.imageQuality || "high",
    noImageSlidesCount: Number(req.body.noImageSlidesCount || req.body.no_image_slides_count || 0),
    caption: req.body.caption || "",
    notes: req.body.notes || "",
    chatHistory: req.body.chatHistory || [],
  };
  const saved = await saveSingleCarousel(newCarousel);

  if (req.body.createFolder && req.body.slidesDir) {
    fs.mkdirSync(req.body.slidesDir, { recursive: true });
  }

  logger.info('[CarouselsAPI]', `CRIADO COM SUCESSO: ${newId} (${saved.title})`);
  res.json(saved);
});

// ── API: Update carousel status/fields ──────────────────────────────────────
router.put("/api/carousels/:id", async (req, res) => {
  logger.info('[CarouselsAPI]', `ATUALIZAR CARROSSEL (PUT ${req.params.id}): ${JSON.stringify(req.body)}`);
  const updated = await updateCarouselFields(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Não encontrado" });
  logger.info('[CarouselsAPI]', `ATUALIZADO COM SUCESSO: ${req.params.id} (${updated.title})`);
  res.json(updated);
});

// ── API: Pin / Unpin carousel (Max 10 pinned) ──────────────────────────────
router.post("/api/carousels/:id/pin", async (req, res) => {
  try {
    const { id } = req.params;
    const carousel = await getCarouselById(id);

    if (!carousel) {
      return res.status(404).json({ error: "Carrossel não encontrado" });
    }

    let shouldPin;
    if (typeof req.body.isPinned !== 'undefined') {
      shouldPin = Boolean(req.body.isPinned);
    } else if (typeof req.body.is_pinned !== 'undefined') {
      shouldPin = Boolean(req.body.is_pinned);
    } else {
      shouldPin = !carousel.isPinned;
    }

    if (shouldPin) {
      const countRes = await query("SELECT count(*) as count FROM carousels WHERE is_pinned = true AND id != $1", [id]);
      const currentPinnedCount = parseInt(countRes.rows[0].count, 10) || 0;
      if (currentPinnedCount >= 10) {
        return res.status(400).json({ 
          error: "Limite de 10 carrosséis fixados atingido. Desfixe um carrossel antes de fixar outro." 
        });
      }
    }

    const updated = await updateCarouselFields(id, {
      isPinned: shouldPin,
      pinnedAt: shouldPin ? new Date().toISOString() : null
    });

    logger.info('[CarouselsAPI]', `Carrossel ${id} ${shouldPin ? 'FIXADO' : 'DESFIXADO'}`);
    res.json({ ok: true, isPinned: updated.isPinned, pinnedAt: updated.pinnedAt, carousel: updated });
  } catch (err) {
    logger.error('[CarouselsAPI]', 'Erro ao alternar pino do carrossel:', err);
    res.status(500).json({ error: "Erro interno do servidor ao fixar carrossel" });
  }
});

// ── API: Bulk Delete carousels ────────────────────────────────────────────────
router.post("/api/carousels/bulk-delete", async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Lista de ids inválida" });
  }

  let deletedCount = 0;
  for (const id of ids) {
    const c = await getCarouselById(id);
    if (c) {
      try {
        const localDir = getLocalSlidesDir(c);
        if (localDir && fs.existsSync(localDir)) {
          fs.rmSync(localDir, { recursive: true, force: true });
        }
      } catch (e) {
        logger.error('[Carousel]', `Erro ao apagar pasta ${c.slidesDir}:`, e.message);
      }
      await deleteCarouselById(id);
      deletedCount++;
    }
  }

  res.json({ ok: true, deletedCount, message: `${deletedCount} carrosséis apagados com sucesso` });
});

// ── API: Excluir carrossel inteiro ─────────────────────────────────────────────
router.delete("/api/carousels/:id", async (req, res) => {
  const c = await getCarouselById(req.params.id);
  if (!c) return res.status(404).json({ error: "Não encontrado" });
  
  try {
    const localDir = getLocalSlidesDir(c);
    if (localDir && fs.existsSync(localDir)) {
      fs.rmSync(localDir, { recursive: true, force: true });
    }
  } catch (e) {
    logger.error('[Carousel]', `Erro ao apagar pasta ${c.slidesDir}:`, e.message);
  }

  await deleteCarouselById(req.params.id);
  res.json({ ok: true, message: "Carrossel apagado com sucesso" });
});

export default router;
