import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { requireSuperAdmin } from "../../state.js";
import { logger } from '../../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const ENV_PATH = fs.existsSync(path.join(__dirname, '..', '..', '..', '.env'))
  ? path.join(__dirname, '..', '..', '..', '.env')
  : path.join(__dirname, '..', '..', '..', '..', '.env');

const MANAGED_KEYS = [
  { key: 'OPENAI_API_KEY',       label: 'OpenAI API Key',          group: 'Geração de Imagem' },
  { key: 'FAL_KEY',              label: 'Fal.ai API Key',           group: 'Geração de Imagem' },
  { key: 'GEMINI_API_KEY',       label: 'Google Gemini API Key',    group: 'Geração de Imagem' },
  { key: 'ELEVENLABS_API_KEY',   label: 'ElevenLabs API Key',       group: 'Áudio' },
  { key: 'META_ACCESS_TOKEN',    label: 'Meta / Instagram Token',   group: 'Publicação' },
  { key: 'INSTAGRAM_ACCOUNT_ID', label: 'Instagram Account ID',     group: 'Publicação' },
  { key: 'FACEBOOK_PAGE_ID',     label: 'Facebook Page ID',         group: 'Publicação' },
  { key: 'NOTION_TOKEN',         label: 'Notion Token',             group: 'Integrações' },
  { key: 'APIFY_API_KEY',        label: 'Apify API Key',            group: 'Integrações' },
  { key: 'ACTIVE_IMAGE_PROVIDER',label: 'Provedor de Imagem Ativo', group: 'Geração de Imagem' },
  { key: 'COPY_GENERATION_MODEL',label: 'Modelo de Copy Ativo',      group: 'Texto & Copy' },
];

function readEnvFile() {
  try { return fs.readFileSync(ENV_PATH, 'utf-8'); } catch { return ''; }
}

function parseEnvFile(content) {
  const result = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    result[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
  return result;
}

function maskValue(v) {
  if (!v || v.length < 6) return v ? '••••••••••••' : '';
  const prefix = v.length >= 10 ? v.slice(0, 4) : '••••';
  const suffix = v.slice(-4);
  return `${prefix}••••••••••••••••••••••••••••••••${suffix}`;
}

// ── API: Settings Keys ────────────────────────────────────────────────────────
router.get('/api/settings/keys', (req, res) => {
  const env = parseEnvFile(readEnvFile());
  const result = MANAGED_KEYS.map(({ key, label, group }) => {
    const isPublicConfig = ['ACTIVE_IMAGE_PROVIDER', 'COPY_GENERATION_MODEL'].includes(key);
    const rawVal = env[key] || '';
    const isSet = !!(rawVal && rawVal !== `sua_${key.toLowerCase()}_aqui` && rawVal.trim() !== '');

    return {
      key,
      label,
      group,
      // Chaves secretas NUNCA são enviadas em texto plano para o frontend (proteção contra roubo e vazamento)
      value: isPublicConfig ? rawVal : '',
      masked: isSet ? maskValue(rawVal) : '',
      set: isSet,
    };
  });

  let activeProvider = env['ACTIVE_IMAGE_PROVIDER'] || 'gpt-image-2';
  if (activeProvider === 'dall-e-2') activeProvider = 'gpt-image-1-mini';

  res.json({
    keys: result,
    activeProvider,
    activeCopyModel: env['COPY_GENERATION_MODEL'] || 'gpt-5.6-terra',
  });
});

router.post('/api/settings/keys', (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') return res.status(400).json({ error: 'body inválido' });

  let content = readEnvFile();
  const lines = content.split('\n');

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null) continue;
    const strVal = String(value).trim();
    // Ignorar máscaras (ex: "sk-p••••••••••••1234") para evitar sobrescrever a chave real com a máscara
    if (strVal.includes('••') || strVal.includes('••••')) continue;
    if (strVal === '' && key !== 'ACTIVE_IMAGE_PROVIDER' && key !== 'COPY_GENERATION_MODEL') continue;

    const idx = lines.findIndex(l => {
      const t = l.trim();
      return !t.startsWith('#') && t.startsWith(key + '=');
    });
    const newLine = `${key}=${strVal}`;
    if (idx >= 0) {
      lines[idx] = newLine;
    } else {
      lines.push(newLine);
    }
  }

  try {
    fs.writeFileSync(ENV_PATH, lines.join('\n'), 'utf-8');
    for (const [k, v] of Object.entries(updates)) {
      const strVal = String(v).trim();
      if (!strVal.includes('••') && strVal !== '') {
        process.env[k] = strVal;
      }
    }
    res.json({ ok: true, updated: Object.keys(updates) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── API: Saldo OpenAI (apenas Super Admin) ────────────────────────────────────
router.get('/api/settings/openai-balance', requireSuperAdmin, async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'sua_openai_api_key_aqui') {
    return res.json({
      ok: false,
      error: 'OPENAI_API_KEY não configurada.',
      billingUrl: 'https://platform.openai.com/settings/organization/billing/overview'
    });
  }

  const BILLING_URL = 'https://platform.openai.com/settings/organization/billing/overview';

  try {
    const response = await fetch('https://api.openai.com/v1/dashboard/billing/credit_grants', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const totalGranted = data.total_granted ?? null;
      const totalUsed = data.total_used ?? null;
      const totalAvailable = data.total_available ?? null;
      const grants = data.grants?.data ?? [];

      logger.info('[OpenAI-Balance]', `Saldo disponível: $${totalAvailable ?? 'N/A'}`);

      return res.json({
        ok: true,
        totalGranted,
        totalUsed,
        totalAvailable,
        grants,
        billingUrl: BILLING_URL
      });
    }

    const status = response.status;
    logger.warn('[OpenAI-Balance]', `Endpoint retornou ${status}. Chave pode ser de projeto sem acesso a billing.`);

    return res.json({
      ok: false,
      error: `Endpoint de billing retornou ${status}. Sua chave de API pode ser de um projeto e não ter acesso ao faturamento.`,
      billingUrl: BILLING_URL
    });

  } catch (err) {
    logger.error('[OpenAI-Balance]', 'Erro ao consultar saldo:', err.message);
    return res.json({
      ok: false,
      error: 'Erro de rede ao consultar a OpenAI.',
      billingUrl: BILLING_URL
    });
  }
});

export default router;
