import express from "express";
import fs from "fs";
import path from "path";
import { execFile, spawn } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { 
  readDataAsync, 
  readReelsHistory, 
  writeReelsHistory 
} from "../../helpers.js";
import { buildAgentPrompts } from "../../agentPrompts.js";
import { CLIENT } from "../../state.js";
import { logger } from '../../logger.js';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const ORACULO_SCRIPT = path.join(__dirname, "..", "..", "..", "oraculo_metrics.py");
const ORACULO_DATA_FILE = path.join(__dirname, "..", "..", "data", "oraculo_data.json");
const ORACULO_COMPLETO_SCRIPT = path.join(__dirname, "..", "..", "..", "core", "agentes", "oraculo_completo.py");
const HAU_PIPELINE = path.join(__dirname, "..", "..", "..", "core", "agentes", "pipeline_haucacau.py");
const RADAR_DATA_FILE = path.join(__dirname, "..", "..", "data", "radar_data.json");
const RADAR_SCRIPT = path.join(__dirname, "..", "..", "..", "infra", "social", "radar_apify.py");
const REELS_SCRIPT = path.join(__dirname, "..", "..", "..", "core", "agentes", "reels_engineer.py");
const dlScript = path.join(__dirname, "..", "..", "scripts", "download_reel.py");
const PIPELINE_SCRIPT = path.join(__dirname, "..", "..", "..", "processos", "pipeline_reels.py");

const AGENT_SYSTEM_PROMPTS = buildAgentPrompts(CLIENT);

function readOraculoData() {
  try {
    return JSON.parse(fs.readFileSync(ORACULO_DATA_FILE, "utf-8"));
  } catch {
    return { posts: [], last_sync: null, total_posts: 0, totals: {} };
  }
}

function readRadarData() {
  try {
    return JSON.parse(fs.readFileSync(RADAR_DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

// ── API: Oráculo — Buscar métricas reais do Instagram ────────────────────────
router.post("/api/oraculo/update", async (req, res) => {
  const carouselId = req.body.id || null;
  const args = ["-X", "utf8", ORACULO_SCRIPT];
  if (carouselId) args.push("--id", carouselId);

  try {
    const { stdout } = await execFileAsync("python", args, { timeout: 60000 });
    logger.info('[Services]', "oraculo:", stdout.trim());
    const all = await readDataAsync();
    res.json({ ok: true, log: stdout, carousels: all });
  } catch (e) {
    logger.error('[Services]', "oraculo error:", e.message);
    res.status(500).json({ error: e.message, log: e.stdout || "" });
  }
});

router.get("/api/oraculo", async (req, res) => {
  const all = await readDataAsync();
  const withMetrics = all
    .filter(c => c.metrics)
    .map(c => ({
      id:          c.id,
      title:       c.title,
      status:      c.status,
      publishedAt: c.publishedAt || "",
      permalink:   c.metrics?.permalink || "",
      likes:       c.metrics?.likes || 0,
      comments:    c.metrics?.comments || 0,
      impressions: c.metrics?.impressions || 0,
      reach:       c.metrics?.reach || 0,
      saved:       c.metrics?.saved || 0,
      shares:      c.metrics?.shares || 0,
      engagement:  c.metrics?.engagement || 0,
      updated_at:  c.metrics?.updated_at || "",
    }))
    .sort((a, b) => b.engagement - a.engagement);
  res.json(withMetrics);
});

// Sincroniza todos os posts do Instagram
router.post("/api/oraculo/sync", async (req, res) => {
  try {
    const { stdout, stderr } = await execFileAsync("python", [
      "-X", "utf8", ORACULO_COMPLETO_SCRIPT
    ], { timeout: 300000 });
    logger.info('[Services]', "oraculo-sync:", stdout.trim());
    if (stderr) logger.error('[Services]', "oraculo-sync stderr:", stderr.trim());
    const data = readOraculoData();
    res.json({ ok: true, log: stdout, ...data });
  } catch (e) {
    logger.error('[Services]', "oraculo-sync error:", e.message);
    res.status(500).json({ error: e.message, log: e.stdout || "" });
  }
});

// Retorna dados do Oráculo
router.get("/api/oraculo/completo", (req, res) => {
  res.json(readOraculoData());
});

// ── API: HauCacau — Gerar Carrossel ──────────────────────────────────────────
router.post("/api/haucacau/gerar", (req, res) => {
  const { tema, universo = 2, avatar = "A", ancora = "" } = req.body;
  if (!tema) return res.status(400).json({ error: "tema é obrigatório" });

  const params = JSON.stringify({ tema, universo, avatar, ancora });

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  const proc = spawn("python", ["-X", "utf8", HAU_PIPELINE, "--data", params]);

  proc.stdout.on("data", chunk => {
    chunk.toString().split("\n").filter(Boolean).forEach(line => {
      try {
        const obj = JSON.parse(line);
        res.write(`data: ${JSON.stringify(obj)}\n\n`);
      } catch {}
    });
  });

  proc.stderr.on("data", chunk => {
    res.write(`data: ${JSON.stringify({ type: "log", msg: chunk.toString().trim() })}\n\n`);
  });

  proc.on("close", code => {
    res.write(`data: ${JSON.stringify({ type: "closed", code })}\n\n`);
    res.end();
  });
});

// ── API: HauCacau — Listar carrosséis ────────────────────────────────────────
router.get("/api/haucacau/carousels", async (req, res) => {
  const all = await readDataAsync();
  res.json(all.filter(c => c.projeto === "haucacau"));
});

// ── API: Radar de Descobertas ─────────────────────────────────────────────────
router.post("/api/radar/sync", async (req, res) => {
  try {
    const { stdout, stderr } = await execFileAsync("python", ["-X", "utf8", RADAR_SCRIPT], { timeout: 300000 });
    logger.info('[Services]', "radar-sync:", stdout.trim());
    if (stderr) logger.error('[Services]', "radar-sync stderr:", stderr.trim());
    const data = readRadarData();
    res.json({ ok: true, log: stdout, data });
  } catch (e) {
    logger.error('[Services]', "radar-sync error:", e.message);
    res.status(500).json({ error: e.message, log: e.stdout || "" });
  }
});

router.get("/api/radar", (req, res) => {
  res.json(readRadarData());
});

// ── API: Máquina de Reels ────────────────────────────────────────────────────
router.get("/api/reels/analyze", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL is required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const child = spawn("python", ["-X", "utf8", REELS_SCRIPT, url], { shell: true });
  let finalResult = null;

  child.on("error", (err) => {
    res.write(`data: ${JSON.stringify({ type: "error", message: "Erro ao iniciar o script: " + err.message })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done", result: { error: err.message } })}\n\n`);
    res.end();
  });

  child.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      if (line.startsWith("FINAL_RESULT:")) {
        try {
          finalResult = JSON.parse(line.substring(13));
        } catch(e) {}
      } else {
        res.write(`data: ${JSON.stringify({ type: "log", message: line })}\n\n`);
      }
    }
  });

  child.stderr.on("data", (data) => {
    res.write(`data: ${JSON.stringify({ type: "log", message: data.toString() })}\n\n`);
  });

  child.on("close", async (code) => {
    if (finalResult && !finalResult.error) {
      const history = await readReelsHistory();
      history.unshift({
        ...finalResult,
        url: url,
        timestamp: new Date().toISOString()
      });
      await writeReelsHistory(history.slice(0, 50));
    }
    res.write(`data: ${JSON.stringify({ type: "done", result: finalResult })}\n\n`);
    res.end();
  });
});

router.get("/api/reels/history", async (req, res) => {
  res.json(await readReelsHistory());
});

// ── API: Download de Reel (yt-dlp) ───────────────────────────────────────────
router.get("/api/reels/download", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const tmpDir = path.join(__dirname, "..", "..", "data", "reel-downloads");
  fs.mkdirSync(tmpDir, { recursive: true });

  const outTemplate = path.join(tmpDir, "%(id)s.%(ext)s");

  try {
    const { stdout } = await execFileAsync(
      "python",
      ["-X", "utf8", dlScript, url, outTemplate],
      { shell: false, maxBuffer: 10 * 1024 * 1024 }
    );

    const result = JSON.parse(stdout.trim().split("\n").pop());
    if (result.error) return res.status(500).json({ error: result.error });

    const filePath = result.file;
    const title = (result.title || "reel").replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 60);

    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: "Arquivo não encontrado após download." });
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.mp4"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on("close", () => { try { fs.unlinkSync(filePath); } catch {} });
  } catch (e) {
    res.status(500).json({ error: e.stderr || e.message });
  }
});

// ── API: Fábrica de Vídeos (Seedance) SSE ───────────────────────────────────
router.get("/api/video/generate", (req, res) => {
  const tema = req.query.tema;
  if (!tema) return res.status(400).json({ error: "Tema is required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const child = spawn("python", ["-X", "utf8", PIPELINE_SCRIPT, tema], { shell: true });

  child.on("error", (err) => {
    res.write(`data: ${JSON.stringify({ type: "error", message: "Erro ao iniciar o script: " + err.message })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  });

  child.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      res.write(`data: ${JSON.stringify({ type: "log", message: line })}\n\n`);
    }
  });

  child.stderr.on("data", (data) => {
    res.write(`data: ${JSON.stringify({ type: "log", message: data.toString() })}\n\n`);
  });

  child.on("close", (code) => {
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  });
});

router.delete("/api/reels/history/:index", async (req, res) => {
  const history = await readReelsHistory();
  const idx = parseInt(req.params.index);
  if (isNaN(idx) || idx < 0 || idx >= history.length) return res.status(400).json({ error: "Invalid index" });
  history.splice(idx, 1);
  await writeReelsHistory(history);
  res.json({ ok: true });
});

// ── POST /api/agent/chat ──────────────────────────────────────────────────────
router.post('/api/agent/chat', async (req, res) => {
  const { agentId, messages } = req.body;
  const system = AGENT_SYSTEM_PROMPTS[agentId];
  if (!system) return res.status(400).json({ error: `Agente não encontrado: ${agentId}` });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY não configurada no .env' });

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages é obrigatório' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: system }, ...messages],
        max_tokens: 4000,
        temperature: 0.85,
      }),
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    res.json({ reply: data.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
