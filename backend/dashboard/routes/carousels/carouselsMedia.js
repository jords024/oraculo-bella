import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { 
  readDataAsync, 
  getCarouselById,
  updateCarouselFields,
  getLocalSlidesDir, 
  getSlidesFromDir 
} from "../../helpers.js";
import { 
  IS_PROD, 
  b2, 
  COMPOSE_SCRIPT, 
  ZIP_SCRIPT 
} from "../../state.js";
import { logger } from '../../logger.js';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PYTHON = process.platform === "win32" ? "python" : "python3";
const router = express.Router();
const renderUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, ["image/jpeg", "image/png"].includes(file.mimetype))
});

const cleanAssetSrc = value => {
  if (typeof value !== "string") return undefined;
  const clean = value.replace(/([?&])token=[^&]+/i, "$1").replace(/[?&]$/, "").slice(0, 2048);
  return clean.startsWith("/api/library/") || clean.startsWith("/api/carousels/") ? clean : undefined;
};
const isSafeSlideFilename = value => path.basename(value) === value && /^slide-[\w-]+\.(jpg|jpeg|png)$/i.test(value);

// ── API: Serve slide images ──────────────────────────────────────────────────
router.get("/api/carousels/:id/image/:filename", async (req, res) => {
  const c = await getCarouselById(req.params.id);
  if (!c) return res.status(404).send("Carrossel não encontrado");

  // Desabilitar cache se um parâmetro de versão (v ou t) for fornecido
  if (req.query.v || req.query.t) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  } else {
    res.setHeader("Cache-Control", "public, max-age=86400, must-revalidate");
  }

  // Se o carrossel foi de fato enviado ao MinIO (possui b2BaseUrl, slides com url ou slidesDir b2://)
  const isUploadedToB2 = c.b2BaseUrl || (c.slides && c.slides.length > 0 && typeof c.slides[0] === 'object' && c.slides[0].url) || (c.slidesDir && c.slidesDir.startsWith("b2://"));

  if (isUploadedToB2 && b2) {
    try {
      const stream = await b2.getImageStream(c.id, req.params.filename);
      res.setHeader("Content-Type", "image/jpeg");
      return stream.pipe(res);
    } catch (err) {
      logger.warn('[Carousel Image]', `Imagem não encontrada no B2 para ${c.id}/${req.params.filename}, tentando local: ${err.message}`);
    }
  }

  const localDir = getLocalSlidesDir(c);
  if (!localDir) return res.status(404).send("Diretório local não encontrado");
  
  let imgPath = path.join(localDir, req.params.filename);
  if (!fs.existsSync(imgPath)) {
    // Procura arquivos correspondentes ao slide no diretório
    if (fs.existsSync(localDir)) {
      try {
        const reqBase = req.params.filename.replace(/\.(jpg|jpeg|png)$/i, '');
        const files = fs.readdirSync(localDir);
        const match = files.find(f => {
          const fBase = f.replace(/\.(jpg|jpeg|png)$/i, '');
          return f === req.params.filename || fBase === reqBase || f.startsWith(`${reqBase}-`) || f.startsWith(`${reqBase}_`);
        });
        if (match) {
          imgPath = path.join(localDir, match);
        }
      } catch {}
    }
  }

  if (!fs.existsSync(imgPath)) return res.status(404).send("Imagem não encontrada");
  
  res.setHeader("Content-Type", "image/jpeg");
  res.sendFile(imgPath);
});

// ── API: Download single slide image ─────────────────────────────────────────
router.get("/api/carousels/:id/download/:filename", async (req, res) => {
  const c = await getCarouselById(req.params.id);
  if (!c) return res.status(404).send("Não encontrado");
  const imgPath = path.join(getLocalSlidesDir(c), req.params.filename);
  if (!fs.existsSync(imgPath)) return res.status(404).send("Imagem não encontrada");
  res.setHeader("Content-Disposition", `attachment; filename="${req.params.filename}"`);
  res.sendFile(imgPath);
});

// ── API: Read slide meta ─────────────────────────────────────────────────────
router.get("/api/carousels/:id/slide/:filename/meta", async (req, res) => {
  const c = await getCarouselById(req.params.id);
  if (!c) return res.status(404).json({ error: "Não encontrado" });
  const metaPath = path.join(getLocalSlidesDir(c), req.params.filename.replace(/\.(jpg|jpeg|png)$/i, ".meta.json"));
  if (!fs.existsSync(metaPath)) return res.json({ title: "", body: "", layout: "fullbleed" });
  try {
    res.json(JSON.parse(fs.readFileSync(metaPath, "utf-8")));
  } catch {
    res.json({ title: "", body: "", layout: "fullbleed" });
  }
});

// ── API: Save editable slide document ───────────────────────────────────────
router.put("/api/carousels/:id/slide/:filename/design", async (req, res) => {
  const c = await getCarouselById(req.params.id);
  if (!c) return res.status(404).json({ error: "Não encontrado" });

  const localDir = getLocalSlidesDir(c);
  if (!localDir) return res.status(404).json({ error: "Diretório local não encontrado" });
  if (!isSafeSlideFilename(req.params.filename)) return res.status(400).json({ error: "Nome de lâmina inválido" });
  const safeFilename = path.basename(req.params.filename);
  const metaPath = path.join(localDir, safeFilename.replace(/\.(jpg|jpeg|png)$/i, ".meta.json"));
  const design = req.body?.design;

  if (!design || design.version !== 1 || !Array.isArray(design.elements)) {
    return res.status(400).json({ error: "Documento visual inválido" });
  }
  if (design.elements.length > 150) {
    return res.status(400).json({ error: "A lâmina excedeu o limite de elementos" });
  }

  try {
    let currentMeta = {};
    if (fs.existsSync(metaPath)) {
      try { currentMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8")); } catch {}
    }
    const cleanDesign = {
      version: 1,
      width: 1080,
      height: 1350,
      background: String(design.background || "#2d241f").slice(0, 64),
      updatedAt: new Date().toISOString(),
      elements: design.elements.map(element => ({
        ...element,
        id: String(element.id || "").slice(0, 100),
        type: ["text", "image", "shape"].includes(element.type) ? element.type : "shape",
        name: String(element.name || "Elemento").slice(0, 120),
        content: element.content === undefined ? undefined : String(element.content).slice(0, 10000),
        src: cleanAssetSrc(element.src)
      }))
    };

    fs.writeFileSync(metaPath, JSON.stringify({ ...currentMeta, design: cleanDesign }, null, 2));
    res.json({ ok: true, design: cleanDesign });
  } catch (error) {
    logger.error('[Carousel design]', error.message);
    res.status(500).json({ error: "Não foi possível salvar o documento visual" });
  }
});

// ── API: Persist the rendered compatibility image ───────────────────────────
router.put("/api/carousels/:id/slide/:filename/render", renderUpload.single("file"), async (req, res) => {
  const c = await getCarouselById(req.params.id);
  if (!c) return res.status(404).json({ error: "Não encontrado" });
  if (!req.file) return res.status(400).json({ error: "Imagem renderizada inválida" });

  const localDir = getLocalSlidesDir(c);
  if (!localDir) return res.status(404).json({ error: "Diretório local não encontrado" });
  if (!isSafeSlideFilename(req.params.filename)) {
    return res.status(400).json({ error: "Nome de lâmina inválido" });
  }
  const safeFilename = path.basename(req.params.filename);

  try {
    fs.writeFileSync(path.join(localDir, safeFilename), req.file.buffer);
    res.json({ ok: true, filename: safeFilename });
  } catch (error) {
    logger.error('[Carousel render]', error.message);
    res.status(500).json({ error: "Não foi possível salvar a renderização" });
  }
});

// ── API: Recompose slide ─────────────────────────────────────────────────────
router.post("/api/carousels/:id/slide/:filename/recompose", async (req, res) => {
  const c = await getCarouselById(req.params.id);
  if (!c) return res.status(404).json({ error: "Não encontrado" });
  
  const imgPath = path.join(getLocalSlidesDir(c), req.params.filename);
  const rawFilename = req.params.filename.replace(/^slide-/, 'raw-');
  const rawPath = path.join(getLocalSlidesDir(c), rawFilename);

  // Se o MinIO/B2 estiver ativo e a imagem não estiver localmente, baixa do bucket
  if (!fs.existsSync(imgPath) && b2) {
    try {
      await b2.downloadImageFromB2(c.id, req.params.filename, imgPath);
      try {
        await b2.downloadImageFromB2(c.id, rawFilename, rawPath);
      } catch {}
    } catch (err) {
      logger.warn('[Carousel recompose]', `Falha ao baixar imagem do B2 para recompor localmente: ${err.message}`);
    }
  }

  if (!fs.existsSync(imgPath)) return res.status(404).json({ error: "Imagem não encontrada" });
  
  // Buscar a imagem limpa do Raw Cache se disponível
  const baseImgPath = fs.existsSync(rawPath) ? rawPath : imgPath;

  let { 
    title, 
    body, 
    layout = "fullbleed",
    title_y,
    body_y,
    watermark_pos = "top_left",
    watermark_x,
    watermark_y,
    watermark_text,
    title_px,
    body_px,
    text_anchor
  } = req.body;

  const validLayouts = ["fullbleed", "dramatico", "etereo", "card", "text_only"];
  if (!validLayouts.includes(String(layout).toLowerCase())) {
    layout = "fullbleed";
  }
  
  if (!title || !body) return res.status(400).json({ error: "title e body são obrigatórios" });
  
  const metaPath = imgPath.replace(/\.(jpg|jpeg|png)$/i, ".meta.json");
  let preset = "sagrado";
  let existingMeta = {};
  if (fs.existsSync(metaPath)) {
    try {
      const slideMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      existingMeta = slideMeta;
      if (slideMeta.preset) {
        preset = slideMeta.preset;
      } else if (c.preset) {
        preset = c.preset;
      }
    } catch {}
  } else if (c.preset) {
    preset = c.preset;
  }

  if (preset === "manuscrito_sagrado" || preset === "escala" || !preset) {
    preset = "sagrado";
  }

  try {
    const pythonArgs = [
      COMPOSE_SCRIPT,
      "--image", baseImgPath, "--title", title, "--body", body,
      "--layout", layout, "--preset", preset, "--output", imgPath
    ];

    if (title_y !== undefined && title_y !== null && String(title_y).trim() !== "") {
      pythonArgs.push("--title_y", String(title_y));
    }
    if (body_y !== undefined && body_y !== null && String(body_y).trim() !== "") {
      pythonArgs.push("--body_y", String(body_y));
    }
    if (watermark_pos) {
      pythonArgs.push("--watermark_pos", watermark_pos);
    }
    if (watermark_x !== undefined && watermark_x !== null && String(watermark_x).trim() !== "") {
      pythonArgs.push("--watermark_x", String(watermark_x));
    }
    if (watermark_y !== undefined && watermark_y !== null && String(watermark_y).trim() !== "") {
      pythonArgs.push("--watermark_y", String(watermark_y));
    }
    if (watermark_text !== undefined && watermark_text !== null && String(watermark_text).trim() !== "") {
      pythonArgs.push("--watermark_text", String(watermark_text));
    }
    if (title_px !== undefined && title_px !== null && String(title_px).trim() !== "") {
      pythonArgs.push("--title_px", String(title_px));
    }
    if (body_px !== undefined && body_px !== null && String(body_px).trim() !== "") {
      pythonArgs.push("--body_px", String(body_px));
    }
    if (text_anchor !== undefined && text_anchor !== null && String(text_anchor).trim() !== "") {
      pythonArgs.push("--text_anchor", String(text_anchor));
    }

    const { stdout } = await execFileAsync(PYTHON, pythonArgs, {
      timeout: 60000,
      cwd: path.join(__dirname, '..', '..', '..'),
      env: {
        ...process.env,
        PYTHONPATH: [
          path.join(__dirname, '..', '..', '..'),
          path.join(__dirname, '..', '..', '..', 'python_packages'),
        ].join(process.platform === 'win32' ? ';' : ':'),
      }
    });
    
    logger.info('[Carousel]', "recompose:", stdout.trim());
    fs.writeFileSync(metaPath, JSON.stringify({
      ...existingMeta,
      title, 
      body, 
      layout, 
      preset,
      title_y,
      body_y,
      watermark_pos,
      watermark_x,
      watermark_y,
      watermark_text,
      title_px,
      body_px,
      text_anchor
    }, null, 2));

    // Se o MinIO/B2 estiver ativo, envia de volta para o bucket
    if (b2) {
      try {
        await b2.uploadImageToB2(c.id, req.params.filename, imgPath);
        if (IS_PROD) {
          try { fs.unlinkSync(imgPath); } catch {}
          try { fs.unlinkSync(rawPath); } catch {}
        }
      } catch (uploadErr) {
        logger.error('[Carousel recompose upload]', `Erro ao reenviar slide atualizado para o B2: ${uploadErr.message}`);
      }
    }

    res.json({ ok: true, message: stdout.trim() });
  } catch (e) {
    logger.error('[Carousel]', "recompose error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── API: Excluir slide individual ─────────────────────────────────────────────
router.delete("/api/carousels/:id/slide/:filename", async (req, res) => {
  const c = await getCarouselById(req.params.id);
  if (!c) return res.status(404).json({ error: "Carrossel não encontrado" });
  
  const imgPath = path.join(getLocalSlidesDir(c), req.params.filename);
  try {
    if (fs.existsSync(imgPath)) {
      fs.unlinkSync(imgPath);
      res.json({ ok: true, message: "Slide apagado com sucesso" });
    } else {
      res.status(404).json({ error: "Arquivo do slide não encontrado" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── API: Download ZIP — Único Carrossel ───────────────────────────────────────
router.get("/api/carousels/:id/download-zip", async (req, res) => {
  const c = await getCarouselById(req.params.id);
  if (!c) return res.status(404).json({ error: "Carrossel não encontrado" });

  const slides = getSlidesFromDir(getLocalSlidesDir(c), c.slidePrefix);
  if (slides.length === 0) return res.status(404).json({ error: "Nenhum slide encontrado na pasta" });

  const payload  = [{ ...c, slides: slides.map(s => s.filename) }];
  const safeName = c.id.replace(/[^a-z0-9-]/gi, "-");
  const tmpFile  = path.join(os.tmpdir(), `${safeName}-${Date.now()}.zip`);

  try {
    const { stdout } = await execFileAsync(PYTHON, [
      ZIP_SCRIPT,
      "--data",   JSON.stringify(payload),
      "--output", tmpFile,
    ], { timeout: 60000 });
    logger.info('[Carousel]', "zip-carousel:", stdout.trim());

    res.setHeader("Content-Disposition", `attachment; filename="${safeName}.zip"`);
    res.setHeader("Content-Type", "application/zip");
    const stream = fs.createReadStream(tmpFile);
    stream.pipe(res);
    stream.on("close", () => fs.unlink(tmpFile, () => {}));
  } catch (e) {
    logger.error('[Carousel]', "zip-carousel error:", e.message);
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
});

// ── API: Download ZIP — TODOS ────────────────────────────────────────────────
router.get("/api/download-all", async (req, res) => {
  const all  = await readDataAsync();
  const payload = all.map(c => {
    const slides = getSlidesFromDir(getLocalSlidesDir(c), c.slidePrefix);
    return { ...c, slides: slides.map(s => s.filename) };
  }).filter(c => c.slides.length > 0);

  if (payload.length === 0) {
    return res.status(404).json({ error: "Nenhum slide encontrado em nenhum carrossel" });
  }

  const tmpFile = path.join(os.tmpdir(), `afonteoculta-todos-${Date.now()}.zip`);

  try {
    const { stdout } = await execFileAsync(PYTHON, [
      ZIP_SCRIPT,
      "--data",   JSON.stringify(payload),
      "--output", tmpFile,
    ], { timeout: 180000 });
    logger.info('[Carousel]', "download-all:", stdout.trim());

    const date = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Disposition", `attachment; filename="afonteoculta-carrosseis-${date}.zip"`);
    res.setHeader("Content-Type", "application/zip");
    const stream = fs.createReadStream(tmpFile);
    stream.pipe(res);
    stream.on("close", () => fs.unlink(tmpFile, () => {}));
  } catch (e) {
    logger.error('[Carousel]', "download-all error:", e.message);
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
});

export default router;
