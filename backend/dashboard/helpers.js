import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { query } from "./db.js";
import { logger } from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_PROD = process.env.NODE_ENV === "production";
export const ACTIVE_WORKSPACE = process.env.CONTENT_WORKSPACE || 'bella';

let b2 = null;
if (IS_PROD) {
  try {
    b2 = await import("./b2.js");
  } catch (e) {
    logger.error('[B2]', 'Erro ao carregar módulo B2 em helpers:', e);
  }
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function mapCarouselFromDb(row) {
  return {
    id: row.id,
    title: row.title,
    theme: row.theme,
    praca: row.praca,
    format: row.format,
    preset: row.preset,
    workspace: row.workspace || 'legacy',
    status: row.status,
    createdAt: row.created_at,
    slidesDir: row.slides_dir,
    slidePrefix: row.slide_prefix,
    totalSlides: row.total_slides,
    caption: row.caption,
    notes: row.notes,
    imageQuality: row.image_quality || 'high',
    b2BaseUrl: row.b2_base_url || '',
    imageProvider: row.image_provider || 'gpt-image-2',
    copyModel: row.copy_model || 'gpt-4o',
    noImageSlidesCount: row.no_image_slides_count || 0,
    lastPayload: row.last_payload || null,
    isPinned: row.is_pinned || false,
    pinnedAt: row.pinned_at || null,
    generationDuration: row.generation_duration || null,
    generationTimeSeconds: row.generation_time_seconds || null,
    generationLogs: typeof row.generation_logs === 'string' ? JSON.parse(row.generation_logs) : (row.generation_logs || []),
    generationError: row.generation_error || null,
    scheduledAt: row.scheduled_at || null,
    scheduledTimestamp: row.scheduled_timestamp || null,
    totalCostUsd: Number(row.total_cost_usd) || 0,
    totalCostBrl: Number(row.total_cost_brl) || 0,
    retryCount: Number(row.retry_count) || 0,
    slides: typeof row.slides === 'string' ? JSON.parse(row.slides) : (row.slides || []),
    chatHistory: typeof row.chat_history === 'string' ? JSON.parse(row.chat_history) : (row.chat_history || [])
  };
}

export async function readData() {
  try {
    const res = await query("SELECT * FROM carousels WHERE workspace = $1 ORDER BY is_pinned DESC, pinned_at DESC, created_at DESC", [ACTIVE_WORKSPACE]);
    return res.rows.map(mapCarouselFromDb);
  } catch (err) {
    logger.error('[Helpers]',"Erro ao ler carrosséis do banco:", err);
    return [];
  }
}

export async function writeData(data) {
  try {
    await query("BEGIN");
    const currentIds = data.map(c => c.id).filter(Boolean);
    if (currentIds.length > 0) {
      await query("DELETE FROM carousels WHERE workspace = $1 AND id NOT IN (" + currentIds.map((_, i) => `$${i + 2}`).join(",") + ")", [ACTIVE_WORKSPACE, ...currentIds]);
    } else {
      await query("DELETE FROM carousels WHERE workspace = $1", [ACTIVE_WORKSPACE]);
    }

    for (const c of data) {
      const upsertQuery = `
        INSERT INTO carousels (
          id, title, theme, praca, format, preset, workspace, status, created_at,
          slides_dir, slide_prefix, total_slides, caption, notes, slides, chat_history, image_quality, b2_base_url, image_provider, copy_model, no_image_slides_count, last_payload, is_pinned, pinned_at, generation_duration, generation_time_seconds, scheduled_at, scheduled_timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          theme = EXCLUDED.theme,
          praca = EXCLUDED.praca,
          format = EXCLUDED.format,
          preset = EXCLUDED.preset,
          workspace = EXCLUDED.workspace,
          status = EXCLUDED.status,
          created_at = EXCLUDED.created_at,
          slides_dir = EXCLUDED.slides_dir,
          slide_prefix = EXCLUDED.slide_prefix,
          total_slides = EXCLUDED.total_slides,
          caption = EXCLUDED.caption,
          notes = EXCLUDED.notes,
          slides = EXCLUDED.slides,
          chat_history = EXCLUDED.chat_history,
          image_quality = EXCLUDED.image_quality,
          b2_base_url = EXCLUDED.b2_base_url,
          image_provider = EXCLUDED.image_provider,
          copy_model = EXCLUDED.copy_model,
          no_image_slides_count = EXCLUDED.no_image_slides_count,
          last_payload = EXCLUDED.last_payload,
          is_pinned = EXCLUDED.is_pinned,
          pinned_at = EXCLUDED.pinned_at,
          generation_duration = EXCLUDED.generation_duration,
          generation_time_seconds = EXCLUDED.generation_time_seconds,
          scheduled_at = EXCLUDED.scheduled_at,
          scheduled_timestamp = EXCLUDED.scheduled_timestamp
      `;
      const params = [
        c.id,
        c.title || '',
        c.theme || '',
        c.praca || '',
        c.format || '',
        c.preset || '',
        c.workspace || ACTIVE_WORKSPACE,
        c.status || '',
        c.createdAt || '',
        c.slidesDir || '',
        c.slidePrefix || '',
        c.totalSlides || 0,
        c.caption || '',
        c.notes || '',
        JSON.stringify(c.slides || []),
        JSON.stringify(c.chatHistory || []),
        c.imageQuality || 'high',
        c.b2BaseUrl || '',
        c.imageProvider || 'gpt-image-2',
        c.copyModel || 'gpt-4o',
        c.noImageSlidesCount || 0,
        c.lastPayload ? JSON.stringify(c.lastPayload) : null,
        c.isPinned || false,
        c.pinnedAt || null,
        c.generationDuration || null,
        c.generationTimeSeconds || null,
        c.scheduledAt || null,
        c.scheduledTimestamp || null
      ];
      await query(upsertQuery, params);
    }
    await query("COMMIT");
  } catch (err) {
    await query("ROLLBACK");
    logger.error('[Helpers]',"Erro ao salvar carrosséis no banco:", err);
    throw err;
  }
}

export async function readDataAsync() {
  return readData();
}

export async function writeDataAsync(data) {
  return writeData(data);
}

// ── Funções Atômicas Diretas no PostgreSQL (Alta Performance) ────────────────

export async function getCarouselById(id) {
  try {
    const res = await query("SELECT * FROM carousels WHERE id = $1", [id]);
    if (res.rows.length === 0) return null;
    return mapCarouselFromDb(res.rows[0]);
  } catch (err) {
    logger.error('[Helpers]', `Erro ao buscar carrossel ${id}:`, err);
    return null;
  }
}

export async function saveSingleCarousel(c) {
  const upsertQuery = `
    INSERT INTO carousels (
      id, title, theme, praca, format, preset, workspace, status, created_at,
      slides_dir, slide_prefix, total_slides, caption, notes, slides, chat_history, image_quality, b2_base_url, image_provider, copy_model, no_image_slides_count, last_payload, is_pinned, pinned_at, generation_duration, generation_time_seconds, scheduled_at, scheduled_timestamp,
      total_cost_usd, total_cost_brl, retry_count
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      theme = EXCLUDED.theme,
      praca = EXCLUDED.praca,
      format = EXCLUDED.format,
      preset = EXCLUDED.preset,
      workspace = EXCLUDED.workspace,
      status = EXCLUDED.status,
      created_at = EXCLUDED.created_at,
      slides_dir = EXCLUDED.slides_dir,
      slide_prefix = EXCLUDED.slide_prefix,
      total_slides = EXCLUDED.total_slides,
      caption = EXCLUDED.caption,
      notes = EXCLUDED.notes,
      slides = EXCLUDED.slides,
      chat_history = EXCLUDED.chat_history,
      image_quality = EXCLUDED.image_quality,
      b2_base_url = EXCLUDED.b2_base_url,
      image_provider = EXCLUDED.image_provider,
      copy_model = EXCLUDED.copy_model,
      no_image_slides_count = EXCLUDED.no_image_slides_count,
      last_payload = EXCLUDED.last_payload,
      is_pinned = EXCLUDED.is_pinned,
      pinned_at = EXCLUDED.pinned_at,
      generation_duration = EXCLUDED.generation_duration,
      generation_time_seconds = EXCLUDED.generation_time_seconds,
      scheduled_at = EXCLUDED.scheduled_at,
      scheduled_timestamp = EXCLUDED.scheduled_timestamp,
      total_cost_usd = EXCLUDED.total_cost_usd,
      total_cost_brl = EXCLUDED.total_cost_brl,
      retry_count = EXCLUDED.retry_count
    RETURNING *;
  `;
  const params = [
    c.id,
    c.title || '',
    c.theme || '',
    c.praca || '',
    c.format || '',
    c.preset || '',
    c.workspace || ACTIVE_WORKSPACE,
    c.status || '',
    c.createdAt || '',
    c.slidesDir || '',
    c.slidePrefix || '',
    c.totalSlides || 0,
    c.caption || '',
    c.notes || '',
    JSON.stringify(c.slides || []),
    JSON.stringify(c.chatHistory || []),
    c.imageQuality || 'high',
    c.b2BaseUrl || '',
    c.imageProvider || 'gpt-image-2',
    c.copyModel || 'gpt-4o',
    c.noImageSlidesCount || 0,
    c.lastPayload ? JSON.stringify(c.lastPayload) : null,
    c.isPinned || false,
    c.pinnedAt || null,
    c.generationDuration || null,
    c.generationTimeSeconds || null,
    c.scheduledAt || null,
    c.scheduledTimestamp || null,
    Number(c.totalCostUsd) || 0,
    Number(c.totalCostBrl) || 0,
    Number(c.retryCount) || 0
  ];
  const res = await query(upsertQuery, params);
  return mapCarouselFromDb(res.rows[0]);
}

export async function updateCarouselFields(id, updates = {}) {
  const fields = [];
  const params = [id];
  let idx = 2;

  for (const [key, val] of Object.entries(updates)) {
    const dbColMap = {
      title: 'title',
      theme: 'theme',
      praca: 'praca',
      format: 'format',
      preset: 'preset',
      workspace: 'workspace',
      status: 'status',
      createdAt: 'created_at',
      slidesDir: 'slides_dir',
      slidePrefix: 'slide_prefix',
      totalSlides: 'total_slides',
      caption: 'caption',
      notes: 'notes',
      imageQuality: 'image_quality',
      b2BaseUrl: 'b2_base_url',
      imageProvider: 'image_provider',
      copyModel: 'copy_model',
      noImageSlidesCount: 'no_image_slides_count',
      isPinned: 'is_pinned',
      pinnedAt: 'pinned_at',
      generationDuration: 'generation_duration',
      generationTimeSeconds: 'generation_time_seconds',
      generationLogs: 'generation_logs',
      generationError: 'generation_error',
      scheduledAt: 'scheduled_at',
      scheduledTimestamp: 'scheduled_timestamp',
      totalCostUsd: 'total_cost_usd',
      totalCostBrl: 'total_cost_brl',
      retryCount: 'retry_count',
      slides: 'slides',
      chatHistory: 'chat_history',
      lastPayload: 'last_payload'
    };

    const col = dbColMap[key] || key;
    let finalVal = val;
    if (['slides', 'chatHistory', 'lastPayload', 'generationLogs'].includes(key) || ['slides', 'chat_history', 'last_payload', 'generation_logs'].includes(col)) {
      finalVal = typeof val === 'string' ? val : JSON.stringify(val);
    }

    fields.push(`${col} = $${idx}`);
    params.push(finalVal);
    idx++;
  }

  if (fields.length === 0) return null;

  const updateSql = `UPDATE carousels SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
  const res = await query(updateSql, params);
  if (res.rows.length === 0) return null;
  return mapCarouselFromDb(res.rows[0]);
}

export async function deleteCarouselById(id) {
  const res = await query("DELETE FROM carousels WHERE id = $1 RETURNING id", [id]);
  return res.rowCount > 0;
}



let cachedDesktopDir = null;
function getCachedDesktopDir() {
  if (cachedDesktopDir) return cachedDesktopDir;
  if (process.platform === 'win32') {
    const userProfile = process.env.USERPROFILE || 'C:/Users/julia';
    const onedrivePath = path.join(userProfile, 'OneDrive', 'Área de Trabalho');
    const normalDesktop = path.join(userProfile, 'Desktop');
    cachedDesktopDir = fs.existsSync(onedrivePath) ? onedrivePath : normalDesktop;
  } else {
    cachedDesktopDir = path.resolve(__dirname, '..', 'storage', 'carousels');
  }
  return cachedDesktopDir;
}

export function getLocalSlidesDir(c) {
  if (!c || (!c.slidesDir && !c.id)) return "";
  
  let dir = c.slidesDir || "";
  const baseStorage = path.resolve(__dirname, '..', 'storage', 'carousels');
  
  // Se dir existe diretamente no sistema de arquivos
  if (dir && !dir.startsWith("b2://") && fs.existsSync(dir)) {
    return dir;
  }

  const parts = dir.replace(/\\/g, '/').split('/').filter(Boolean);
  const folderName = parts.length > 0 ? parts[parts.length - 1] : '';

  // Lista de candidatos possíveis para o diretório de slides
  const candidates = [];

  if (folderName) {
    candidates.push(path.join(baseStorage, folderName));
  }
  if (c.id) {
    candidates.push(path.join(baseStorage, c.id));
  }
  if (c.theme) {
    candidates.push(path.join(baseStorage, `carrossel-${c.theme}`));
    candidates.push(path.join(baseStorage, c.theme));
  }

  // Tenta encontrar diretório existente na pasta storage/carousels
  for (const cand of candidates) {
    if (fs.existsSync(cand)) return cand;
  }

  // Tenta busca dinâmica por prefixo do id do carrossel em storage/carousels
  if (fs.existsSync(baseStorage) && c.id) {
    try {
      const items = fs.readdirSync(baseStorage);
      const matchedFolder = items.find(item => item === c.id || item.startsWith(`${c.id}-`));
      if (matchedFolder) {
        return path.join(baseStorage, matchedFolder);
      }
    } catch {}
  }

  // Se estiver no Windows desktop
  if (process.platform === 'win32') {
    const targetDesktop = getCachedDesktopDir();
    if (folderName) {
      const cand = path.join(targetDesktop, folderName);
      if (fs.existsSync(cand)) return cand;
    }
    if (c.theme) {
      const cand = path.join(targetDesktop, `carrossel-${c.theme}`);
      if (fs.existsSync(cand)) return cand;
    }
  }

  // Fallback padrão seguro
  return path.join(baseStorage, c.id || folderName || "carrossel-default");
}

export function getSlidesFromDir(dir, prefix = "slide-") {
  try {
    const files = fs.readdirSync(dir);
    return files
      .filter(f => f.startsWith(prefix) && /\.(jpg|jpeg|png)$/i.test(f))
      .sort()
      .map(f => ({ filename: f, path: path.join(dir, f) }));
  } catch {
    return [];
  }
}

export function getSlidesForCarousel(c) {
  if (c.slides && c.slides.length > 0) {
    return c.slides.map(s => typeof s === 'string' ? s : (s.filename || s.name));
  }
  return getSlidesFromDir(getLocalSlidesDir(c), c.slidePrefix).map(s => s.filename);
}

export function getCarouselCostDetails(c) {
  const slides = getSlidesForCarousel(c);
  const slidesDir = getLocalSlidesDir(c);
  const imageProvider = c.imageProvider || process.env.ACTIVE_IMAGE_PROVIDER || 'gpt-image-2';

  let costPerImage = 0.08;
  if (imageProvider === 'fal') costPerImage = 0.003;
  else if (imageProvider === 'gemini') costPerImage = 0.015;
  else if (imageProvider === 'gpt-image-1-mini' || imageProvider === 'dall-e-2') costPerImage = 0.02;

  let paidSlides = 0;
  let freeSlides = 0;
  const hasLocalDir = slidesDir && !slidesDir.startsWith('b2://') && fs.existsSync(slidesDir);

  if (slides.length > 0) {
    // Para carrosséis que possuem slides gerados/cadastrados
    for (let i = 0; i < slides.length; i++) {
      const numStr = String(i + 1).padStart(2, '0');
      let isTextOnly = false;
      if (hasLocalDir) {
        const metaPath = path.join(slidesDir, `slide-${numStr}.meta.json`);
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            if (meta.layout === 'text_only') isTextOnly = true;
          } catch (e) {}
        }
      }

      if (isTextOnly) {
        freeSlides++;
      } else {
        paidSlides++;
      }
    }
  } else if (hasLocalDir) {
    // Se a pasta existe, verifica se há arquivos de imagem reais gerados no disco
    try {
      const files = fs.readdirSync(slidesDir);
      const rawFiles = files.filter(f => /^raw-.*\.jpg$/i.test(f));
      const slideFiles = files.filter(f => /^slide-.*\.jpg$/i.test(f));
      const totalCount = Math.max(rawFiles.length, slideFiles.length);

      for (let i = 1; i <= totalCount; i++) {
        const numStr = String(i).padStart(2, '0');
        const metaPath = path.join(slidesDir, `slide-${numStr}.meta.json`);
        let isTextOnly = false;
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            if (meta.layout === 'text_only') isTextOnly = true;
          } catch (e) {}
        }

        if (isTextOnly) {
          freeSlides++;
        } else {
          paidSlides++;
        }
      }
    } catch (e) {}
  }
  // Se slides.length === 0 e nenhum arquivo existir, paidSlides e freeSlides permanecem 0!

  const calculatedCost = paidSlides * costPerImage;
  const cost = c.totalCostUsd && Number(c.totalCostUsd) > 0 ? Math.max(calculatedCost, Number(c.totalCostUsd)) : calculatedCost;
  const savedCost = freeSlides * costPerImage;

  return {
    cost,
    costPerImage,
    paidSlides,
    freeSlides,
    totalSlidesCount: slides.length || (paidSlides + freeSlides),
    savedCost,
    retryCount: Number(c.retryCount) || 0
  };
}

export async function recordUsageCost({
  type,
  itemId = null,
  description = '',
  model = '',
  provider = '',
  costUsd = 0,
  costBrl = null,
  tokensInput = 0,
  tokensOutput = 0,
  quantity = 1,
  metadata = {}
}) {
  try {
    const finalCostUsd = Number(costUsd) || 0;
    const finalCostBrl = costBrl !== null ? Number(costBrl) : Math.round(finalCostUsd * 5.0 * 1000) / 1000;
    const sql = `
      INSERT INTO usage_costs (
        type, item_id, description, model, provider,
        cost_usd, cost_brl, tokens_input, tokens_output, quantity, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const params = [
      type,
      itemId,
      description,
      model,
      provider,
      finalCostUsd,
      finalCostBrl,
      tokensInput,
      tokensOutput,
      quantity,
      JSON.stringify(metadata)
    ];
    const res = await query(sql, params);
    return res.rows[0];
  } catch (err) {
    logger.error('[Financial]', `Erro ao registrar custo de uso (${type}):`, err);
    return null;
  }
}

export async function readReelsHistory() {
  try {
    const res = await query("SELECT * FROM reels_history ORDER BY id DESC");
    return res.rows;
  } catch (err) {
    logger.error('[Helpers]',"Erro ao ler reels do banco:", err);
    return [];
  }
}

export async function writeReelsHistory(data) {
  try {
    await query("BEGIN");
    await query("DELETE FROM reels_history");
    for (const r of data) {
      const insQuery = `
        INSERT INTO reels_history (
          gancho_original, padrao_psicologico, roteiro_fonte_oculta,
          transcricao_original, url, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;
      const params = [
        r.gancho_original || '',
        r.padrao_psicologico || '',
        r.roteiro_fonte_oculta || '',
        r.transcricao_original || '',
        r.url || '',
        r.timestamp || ''
      ];
      await query(insQuery, params);
    }
    await query("COMMIT");
  } catch (err) {
    await query("ROLLBACK");
    logger.error('[Helpers]',"Erro ao salvar reels no banco:", err);
    throw err;
  }
}
