// "Minhas pastas do Pinterest": o usuário conecta o próprio perfil (ou cola o link de uma pasta pública) e o
// Oráculo passa a poder usar as imagens dessas pastas como fonte de imagens. Sem login e sem senha: só pastas
// públicas, lidas pelo RSS público de cada pasta. A lista é guardada por usuário em storage/curadoria/boards.json
// (storage é volume persistente em produção).
//
// Fluxo: POST /preview (descobre o que há no link, sem salvar) → POST /boards (adiciona as pastas escolhidas).
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../logger.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE = path.resolve(__dirname, '..', '..', 'storage', 'curadoria', 'boards.json');
const UA = 'Mozilla/5.0';
const MAX_BOARDS_PER_USER = 60;
const RESERVED = new Set(['pin', 'search', 'ideas', 'today', 'explore', 'business', 'settings', 'login', 'news_hub', 'video', 'topics', 'about', 'password']);
const RESERVED_SLUGS = new Set(['pins', 'boards', 'followers', 'following', 'feed', 'activity', 'tried', 'saved', 'created']);

const userKey = req => String(req.user?.email || req.user?.user || 'local@bella').toLowerCase().slice(0, 255);
const fail = (status, message) => Object.assign(new Error(message), { status, friendly: true });

function readStore() {
  try { return JSON.parse(fs.readFileSync(STORE, 'utf-8')); } catch { return { users: {} }; }
}
function writeStore(data) {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  fs.writeFileSync(STORE, JSON.stringify(data, null, 2));
}

const decode = text => String(text || '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&amp;/g, '&');

async function fetchText(url, ms = 25000) {
  const response = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'pt-BR,pt;q=0.9' }, signal: AbortSignal.timeout(ms), redirect: 'follow' });
  if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}`), { http: response.status });
  return { text: await response.text(), url: response.url };
}

const isHandle = value => /^[A-Za-z0-9_.-]{2,60}$/.test(value) && !RESERVED.has(value.toLowerCase());
const validSlug = value => value && !value.startsWith('_') && !RESERVED_SLUGS.has(value.toLowerCase());

// Entende o que a pessoa colou: link de perfil, de pasta, de imagem (pin), link curto pin.it, @usuário ou usuário.
async function resolveInput(raw) {
  const text = String(raw || '').trim();
  if (!text) throw fail(400, 'Cole o link do seu perfil do Pinterest ou de uma das suas pastas.');
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    throw fail(400, 'Isso parece um e-mail. O Pinterest identifica o perfil pelo link, não pelo e-mail: abra o seu perfil no Pinterest e copie o endereço da barra do navegador.');
  }
  const link = text.match(/(?:https?:\/\/)?(?:[a-z0-9-]+\.)*(?:pinterest\.[a-z.]+|pin\.it)\/[^\s"'<>)]*/i);
  if (link) {
    let url = /^https?:\/\//i.test(link[0]) ? link[0] : `https://${link[0]}`;
    if (/\/\/(?:[a-z0-9-]+\.)*pin\.it\//i.test(url)) {
      try { url = (await fetchText(url, 15000)).url; } catch { throw fail(400, 'Não consegui abrir esse link curto (pin.it). Cole o endereço completo do perfil ou da pasta.'); }
    }
    const parts = new URL(url).pathname.split('/').filter(Boolean).map(part => { try { return decodeURIComponent(part); } catch { return part; } });
    if (parts[0]?.toLowerCase() === 'pin' && parts[1]) {
      // Link de uma imagem: descobre a pasta onde ela está salva.
      try {
        const { text: html } = await fetchText(`https://www.pinterest.com/pin/${encodeURIComponent(parts[1])}/`, 20000);
        for (const match of html.matchAll(/href="\/([A-Za-z0-9_.-]+)\/([^/"?]+)\/"/g)) {
          if (isHandle(match[1]) && validSlug(match[2])) return { user: match[1], slug: match[2] };
        }
      } catch { /* cai na mensagem abaixo */ }
      throw fail(400, 'Esse é o link de uma imagem. Cole o link da pasta (ou do seu perfil) onde ela está.');
    }
    if (parts[0] && isHandle(parts[0])) return validSlug(parts[1]) ? { user: parts[0], slug: parts[1].replace(/\.rss$/i, '') } : { user: parts[0] };
    throw fail(400, 'Não reconheci esse link do Pinterest. Use o endereço do seu perfil (pinterest.com/seu-usuario) ou de uma pasta.');
  }
  const handle = text.replace(/^@/, '').trim();
  if (isHandle(handle)) return { user: handle };
  throw fail(400, /\s/.test(text)
    ? 'Isso parece um nome, não um endereço. Cole o link do seu perfil (pinterest.com/seu-usuario) ou escreva só o seu nome de usuário, sem espaços.'
    : 'Não consegui entender. Cole o link do seu perfil do Pinterest ou de uma das suas pastas.');
}

// Lê o RSS da pasta: nome, quantidade de imagens e uma miniatura. Lança erro se for privada ou não existir.
async function boardMeta(user, slug) {
  const { text: xml } = await fetchText(`https://www.pinterest.com/${encodeURIComponent(user)}/${encodeURIComponent(slug)}.rss`);
  const name = decode((xml.match(/<channel>[\s\S]*?<title>([\s\S]*?)<\/title>/) || [])[1] || slug).trim();
  const count = (xml.match(/<item>/g) || []).length;
  const thumb = (decode(xml).match(/src="(https:\/\/i\.pinimg\.com\/[^"]+)"/) || [])[1] || '';
  if (!count) throw new Error('pasta sem imagens públicas');
  return { name, count, thumb: thumb.replace(/pinimg\.com\/\d+x\//, 'pinimg.com/236x/') };
}

async function userBoardSlugs(user) {
  let html;
  try { html = (await fetchText(`https://www.pinterest.com/${encodeURIComponent(user)}/`, 30000)).text; } catch (error) {
    if (error.http === 404) throw fail(404, `Não encontrei o perfil “${user}” no Pinterest. Confira o link ou o nome de usuário.`);
    throw error;
  }
  const pattern = new RegExp(`href="/${user.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/([^/"?]+)/"`, 'gi');
  const slugs = new Set();
  for (const match of html.matchAll(pattern)) {
    let slug = match[1];
    try { slug = decodeURIComponent(slug); } catch { /* mantém */ }
    if (validSlug(slug)) slugs.add(slug);
  }
  return [...slugs].slice(0, 40);
}

async function inBatches(items, size, task) {
  const results = [];
  for (let i = 0; i < items.length; i += size) results.push(...await Promise.all(items.slice(i, i + size).map(task)));
  return results;
}

const boardId = (user, slug) => `${user}/${slug}`.toLowerCase();
const toBoard = (user, slug, meta, addedAt) => ({
  id: boardId(user, slug), name: meta.name, url: `https://www.pinterest.com/${user}/${slug}/`, thumb: meta.thumb, count: meta.count, user, addedAt: addedAt || new Date().toISOString()
});

// Descobre as pastas públicas de um link, sem salvar nada.
async function discover(input) {
  const parsed = await resolveInput(input);
  const slugs = parsed.slug ? [parsed.slug] : await userBoardSlugs(parsed.user);
  if (!slugs.length) throw fail(404, 'Este perfil não tem pastas públicas visíveis. No Pinterest, abra a pasta → editar → desmarque “Manter esta pasta secreta”. Também dá para colar o link direto de uma pasta.');
  const found = (await inBatches(slugs, 5, async slug => {
    try { return toBoard(parsed.user, slug, await boardMeta(parsed.user, slug)); } catch { return null; }
  })).filter(Boolean);
  if (!found.length) throw fail(404, 'Estas pastas são privadas ou estão vazias. Deixe-as públicas no Pinterest (editar pasta → desmarcar “Manter esta pasta secreta”) e tente de novo.');
  return { kind: parsed.slug ? 'board' : 'profile', user: parsed.user, boards: found, skipped: slugs.length - found.length };
}

function respondError(res, error) {
  if (error.friendly) return res.status(error.status || 400).json({ ok: false, error: error.message });
  logger.warn('[Pinterest boards]', error.message);
  return res.status(502).json({ ok: false, error: 'Não consegui falar com o Pinterest agora. Tente de novo em instantes.' });
}

function mergeBoards(current, incoming) {
  const byId = new Map(current.map(board => [board.id, board]));
  const added = [];
  for (const board of incoming) {
    if (!byId.has(board.id)) added.push(board);
    byId.set(board.id, { ...board, addedAt: byId.get(board.id)?.addedAt || board.addedAt });
  }
  return { boards: [...byId.values()].slice(-MAX_BOARDS_PER_USER), added };
}

router.get('/api/pinterest/boards', (req, res) => {
  res.json({ ok: true, boards: readStore().users?.[userKey(req)] || [] });
});

// Mostra o que há no link (perfil ou pasta), já marcando o que já está conectado. Não salva.
router.post('/api/pinterest/preview', async (req, res) => {
  try {
    const result = await discover(req.body?.input);
    const connected = new Set((readStore().users?.[userKey(req)] || []).map(board => board.id));
    res.json({ ok: true, ...result, boards: result.boards.map(board => ({ ...board, connected: connected.has(board.id) })) });
  } catch (error) { respondError(res, error); }
});

// Adiciona pastas. `items` = [{user, slug}] escolhidas na prévia; sem `items`, descobre e adiciona tudo do `input`.
router.post('/api/pinterest/boards', async (req, res) => {
  try {
    let incoming;
    if (Array.isArray(req.body?.items) && req.body.items.length) {
      incoming = (await inBatches(req.body.items.slice(0, 40), 5, async item => {
        const user = String(item?.user || '');
        const slug = String(item?.slug || '');
        if (!isHandle(user) || !validSlug(slug)) return null;
        try { return toBoard(user, slug, await boardMeta(user, slug)); } catch { return null; }
      })).filter(Boolean);
      if (!incoming.length) throw fail(404, 'Não consegui ler essas pastas. Confira se continuam públicas.');
    } else {
      incoming = (await discover(req.body?.input)).boards;
    }
    const store = readStore();
    store.users = store.users || {};
    const merged = mergeBoards(store.users[userKey(req)] || [], incoming);
    store.users[userKey(req)] = merged.boards;
    writeStore(store);
    res.json({ ok: true, added: merged.added, boards: merged.boards });
  } catch (error) { respondError(res, error); }
});

// Sincroniza um perfil já conectado: atualiza contagens e miniaturas, traz pastas novas e tira as que sumiram.
router.post('/api/pinterest/sync', async (req, res) => {
  try {
    const user = String(req.body?.user || '');
    if (!isHandle(user)) throw fail(400, 'Perfil inválido.');
    const store = readStore();
    store.users = store.users || {};
    const current = store.users[userKey(req)] || [];
    const found = (await discover(user)).boards;
    const foundIds = new Set(found.map(board => board.id));
    const kept = current.filter(board => board.user.toLowerCase() !== user.toLowerCase() || foundIds.has(board.id));
    const removed = current.length - kept.length;
    const merged = mergeBoards(kept, found);
    store.users[userKey(req)] = merged.boards;
    writeStore(store);
    res.json({ ok: true, added: merged.added, removed, boards: merged.boards });
  } catch (error) { respondError(res, error); }
});

router.delete('/api/pinterest/boards', (req, res) => {
  const id = String(req.query.id || '').toLowerCase();
  const store = readStore();
  const key = userKey(req);
  const before = (store.users?.[key] || []).length;
  if (store.users?.[key]) store.users[key] = store.users[key].filter(board => board.id !== id);
  writeStore(store);
  res.json({ ok: true, removed: before - (store.users?.[key] || []).length, boards: store.users?.[key] || [] });
});

// Desconecta um perfil inteiro (remove todas as pastas dele da lista).
router.delete('/api/pinterest/profile', (req, res) => {
  const user = String(req.query.user || '').toLowerCase();
  const store = readStore();
  const key = userKey(req);
  const before = (store.users?.[key] || []).length;
  if (store.users?.[key]) store.users[key] = store.users[key].filter(board => String(board.user).toLowerCase() !== user);
  writeStore(store);
  res.json({ ok: true, removed: before - (store.users?.[key] || []).length, boards: store.users?.[key] || [] });
});

export default router;
