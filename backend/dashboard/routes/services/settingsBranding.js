import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CLIENT } from "../../state.js";
import { logger } from '../../logger.js';
import { query } from '../../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const BRANDING_FILE = path.join(__dirname, "..", "..", "data", "branding.json");

async function readBranding() {
  try {
    const res = await query('SELECT data FROM branding WHERE id = 1');
    if (res.rows.length > 0 && res.rows[0].data && Object.keys(res.rows[0].data).length > 0) {
      return res.rows[0].data;
    }
  } catch (e) {
    logger.warn('[Branding]', 'Falha ao ler branding do DB, buscando arquivo:', e.message);
  }
  try {
    if (fs.existsSync(BRANDING_FILE)) {
      return JSON.parse(fs.readFileSync(BRANDING_FILE, 'utf-8'));
    }
  } catch (e) {}
  return {
    logoText: "FONTE OCULTA",
    logoSub: "PRODUÇÃO",
    logoSize: "13px",
    logoColor: "#ffffff",
    carouselTextSize: "15px",
    carouselTextColor: "#e4e4e7"
  };
}

async function writeBranding(data) {
  try {
    await query(
      `INSERT INTO branding (id, data, updated_at)
       VALUES (1, $1, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(data)]
    );
    logger.info('[Branding]', 'Identidade visual salva no banco de dados com sucesso.');
  } catch (e) {
    logger.error('[Branding]', 'Erro ao salvar branding no DB:', e.message);
  }
  try {
    fs.writeFileSync(BRANDING_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

// ── API: Obter configurações de branding ─────────────────────────────────────
router.get('/api/settings/branding', async (req, res) => {
  const data = await readBranding();
  res.json(data);
});

// ── API: Salvar configurações de branding ────────────────────────────────────
router.post('/api/settings/branding', async (req, res) => {
  const data = req.body;
  if (!data) return res.status(400).json({ error: 'corpo inválido' });
  await writeBranding(data);
  res.json({ ok: true });
});

// ── API: Obter configuração do cliente ────────────────────────────────────────
router.get('/api/client', (req, res) => {
  if (!CLIENT) return res.status(404).json({ error: 'client.json não encontrado' });
  res.json(CLIENT);
});

export default router;
