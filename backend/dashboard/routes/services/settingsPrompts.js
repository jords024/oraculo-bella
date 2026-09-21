import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildAgentPrompts } from "../../agentPrompts.js";
import { CLIENT } from "../../state.js";
import { logger } from '../../logger.js';
import { query } from '../../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const AGENTS_DIR = path.join(__dirname, "..", "..", "..", "agents");
const NAMES_FILE = path.join(AGENTS_DIR, "display_names.json");

function readDisplayNames() {
  try {
    if (fs.existsSync(NAMES_FILE)) {
      return JSON.parse(fs.readFileSync(NAMES_FILE, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

function writeDisplayNames(data) {
  try {
    fs.writeFileSync(NAMES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

async function getAllAgentPrompts(client) {
  let displayNames = readDisplayNames();

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
      logger.info('[AgentPrompts]', `DB carregado com ${dbRes.rows.length} prompt(s) salvos.`);
    }
  } catch (dbErr) {
    logger.error('[AgentPrompts]', `Falha ao ler prompts do banco de dados: ${dbErr.message}. Usando arquivos como fallback.`);
  }

  const dynamicPrompts = buildAgentPrompts(client) || {};
  let list = [];

  try {
    if (fs.existsSync(AGENTS_DIR)) {
      const files = fs.readdirSync(AGENTS_DIR);
      list = files
        .filter(f => f.endsWith('.md'))
        .map(f => {
          const id = f.replace('.md', '');
          const fileContent = fs.readFileSync(path.join(AGENTS_DIR, f), 'utf-8');
          const dbEntry = dbPromptsMap[id];
          let name = (dbEntry && dbEntry.name) || displayNames[id];
          if (!name) {
            name = id
              .split('-')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
              .replace('Haucacau', 'HauCacau')
              .replace('V2', 'V2')
              .replace('Dna', 'DNA')
              .replace('Cta', 'CTA');
          }
          const content = (dbEntry && dbEntry.content) ? dbEntry.content : fileContent;
          if (dbEntry && dbEntry.content) {
            logger.info('[AgentPrompts]', `Prompt '${id}' carregado do banco de dados.`);
          } else {
            logger.warn('[AgentPrompts]', `Prompt '${id}' não encontrado no DB — usando arquivo em disco (pode estar desatualizado).`);
          }
          return { id, name, content };
        });
    }
  } catch (e) {
    logger.error('[AgentPrompts]', 'Erro ao ler pasta agents:', e.message);
  }

  for (const [key, text] of Object.entries(dynamicPrompts)) {
    if (!list.some(a => a.id === key)) {
      const formattedName = key
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      const dbEntry = dbPromptsMap[key];
      const content = (dbEntry && dbEntry.content) ? dbEntry.content : text;
      list.push({ id: key, name: formattedName, content });
    }
  }

  const map = Object.fromEntries(list.map(a => [a.id, a.content]));
  return { map, list };
}

// ── API: Obter prompts dos agentes ───────────────────────────────────────────
router.get('/api/settings/prompts', async (req, res) => {
  try {
    const { list } = await getAllAgentPrompts(CLIENT);
    res.json({ prompts: list });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── API: Salvar prompt de agente ─────────────────────────────────────────────
router.post('/api/settings/prompts', async (req, res) => {
  const { id, content } = req.body;
  if (!id || content === undefined) {
    return res.status(400).json({ error: 'Parâmetros inválidos. É necessário fornecer id e content.' });
  }
  const safeId = path.basename(id);
  const filePath = path.join(AGENTS_DIR, `${safeId}.md`);

  try {
    await query(`
      INSERT INTO agent_prompts (id, content, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (id) DO UPDATE SET content = $2, updated_at = NOW()
    `, [safeId, content]);
    logger.info('[AgentPrompts]', `Prompt '${safeId}' salvo no banco de dados com sucesso.`);
  } catch (dbErr) {
    logger.error('[AgentPrompts]', `Falha crítica ao salvar prompt '${safeId}' no banco: ${dbErr.message}`);
    return res.status(500).json({ error: `Erro ao salvar no banco de dados: ${dbErr.message}` });
  }

  try {
    fs.writeFileSync(filePath, content, 'utf-8');
  } catch (fileErr) {
    logger.warn('[AgentPrompts]', `Aviso: prompt '${safeId}' salvo no DB mas falhou no arquivo: ${fileErr.message}`);
  }

  res.json({ ok: true });
});

// ── API: Renomear agente ─────────────────────────────────────────────────────
router.post('/api/settings/prompts/rename', async (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'Parâmetros inválidos. Forneça id e name.' });
  }

  try {
    await query(`
      INSERT INTO agent_prompts (id, display_name, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (id) DO UPDATE SET display_name = $2, updated_at = NOW()
    `, [id, name]);
    logger.info('[AgentPrompts]', `Nome do agente '${id}' renomeado para '${name}' no banco de dados.`);
  } catch (dbErr) {
    logger.error('[AgentPrompts]', `Falha crítica ao renomear agente '${id}' no banco: ${dbErr.message}`);
    return res.status(500).json({ error: `Erro ao salvar nome no banco de dados: ${dbErr.message}` });
  }

  try {
    const displayNames = readDisplayNames();
    displayNames[id] = name;
    writeDisplayNames(displayNames);
  } catch (fileErr) {
    logger.warn('[AgentPrompts]', `Aviso: nome '${name}' salvo no DB mas falhou no arquivo local: ${fileErr.message}`);
  }

  res.json({ ok: true });
});

export default router;
