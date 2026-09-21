import express from "express";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { getCarouselById, updateCarouselFields } from "../../helpers.js";
import { logger } from '../../logger.js';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PYTHON = process.platform === "win32" ? "python" : "python3";
const router = express.Router();

// ── API: Publicar / Agendar no Instagram ─────────────────────────────────────
export const handlePublishInstagram = async (req, res) => {
  const c = await getCarouselById(req.params.id);
  if (!c) return res.status(404).json({ error: "Carrossel não encontrado" });

  const PUBLISH_SCRIPT = path.join(__dirname, "..", "..", "..", "infra", "social", "publish_instagram.py");
  const caption = req.body?.caption || c.caption || "";

  const args = [
    "-X", "utf8", PUBLISH_SCRIPT,
    "--id",      req.params.id,
  ];
  if (caption) {
    args.push("--caption", caption);
  }
  if (req.body?.stories) {
    args.push("--stories");
  }
  const sched = req.body?.scheduled_publish_time || req.body?.schedule;
  if (sched) {
    args.push("--schedule", String(sched));
    await updateCarouselFields(c.id, {
      status: "agendado",
      scheduledTimestamp: parseInt(sched, 10),
      scheduledAt: new Date(parseInt(sched, 10) * 1000).toISOString()
    });
  }

  try {
    const { stdout, stderr } = await execFileAsync(PYTHON, args, { 
      timeout: 300000,
      cwd: path.join(__dirname, '..', '..', '..'),
      env: {
        ...process.env,
        PYTHONPATH: [
          path.join(__dirname, '..', '..', '..'),
          path.join(__dirname, '..', '..', '..', 'python_packages'),
        ].join(process.platform === 'win32' ? ';' : ':'),
      }
    });
    logger.info('[Carousel]', "publish-instagram:", stdout.trim());
    if (stderr) logger.warn('[Carousel]', "publish-instagram stderr:", stderr.trim());

    if (!sched) {
      const publishedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      await updateCarouselFields(c.id, {
        status: "publicado",
        publishedAt
      });
    }

    const updated = await getCarouselById(req.params.id);
    res.json({ ok: true, log: stdout, carousel: updated });
  } catch (e) {
    const stdoutStr = e.stdout || "";
    const stderrStr = e.stderr || "";
    const wasPublished = stdoutStr.includes("PUBLICADO COM SUCESSO") || stdoutStr.includes("AGENDADO COM SUCESSO");

    logger.error('[Carousel]', "publish-instagram error:", e.message);
    if (stderrStr) logger.error('[Carousel]', "publish-instagram stderr:", stderrStr.trim());

    if (wasPublished) {
      logger.info('[Carousel]', "Publicação confirmada no stdout apesar de exit code != 0. Atualizando status...");
      try {
        if (!sched) {
          const publishedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
          await updateCarouselFields(c.id, {
            status: "publicado",
            publishedAt
          });
        }
        const updated = await getCarouselById(req.params.id);
        return res.json({ ok: true, log: stdoutStr, carousel: updated });
      } catch (updateErr) {
        logger.error('[Carousel]', "Erro ao atualizar status após publicação confirmada:", updateErr.message);
      }
    }

    const errOutput = stdoutStr + " " + stderrStr + " " + e.message;
    res.status(500).json({ error: errOutput.trim() || e.message, log: stdoutStr });
  }
};

router.post("/api/carousels/:id/publish-instagram", handlePublishInstagram);
router.post("/api/carousels/:id/publish", handlePublishInstagram);

export default router;
