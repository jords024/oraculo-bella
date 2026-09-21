import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../../db.js';
import { logger } from '../../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const storageDir = path.join(__dirname, '..', '..', '..', 'storage', 'library');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// ── 1. Listar Imagens da Biblioteca ──────────────────────────────────────────
router.get('/api/library', async (req, res) => {
  try {
    const { search, category, sort, source, model } = req.query;
    let sql = 'SELECT * FROM library_images WHERE 1=1';
    const params = [];

    if (category && category !== 'Todas') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (source && source !== 'Todos' && source !== 'Todas') {
      const cleanSource = (source === 'ai' || source === 'IA Gerada' || source === 'Geradas por IA') ? 'ai' : 'upload';
      params.push(cleanSource);
      sql += ` AND source = $${params.length}`;
    }

    if (model && model !== 'Todos') {
      params.push(model);
      sql += ` AND ai_model = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (title ILIKE $${params.length} OR notes ILIKE $${params.length} OR category ILIKE $${params.length} OR ai_model ILIKE $${params.length})`;
    }

    if (sort === 'date_asc') {
      sql += ' ORDER BY created_at ASC, id ASC';
    } else if (sort === 'name_asc') {
      sql += ' ORDER BY title ASC, id ASC';
    } else if (sort === 'name_desc') {
      sql += ' ORDER BY title DESC, id DESC';
    } else {
      sql += ' ORDER BY created_at DESC, id DESC';
    }

    const result = await query(sql, params);
    
    // Obter todas as categorias existentes
    const catsRes = await query('SELECT DISTINCT category FROM library_images WHERE category IS NOT NULL AND category <> \'\'');
    const existingCategories = catsRes.rows.map(r => r.category);

    // Obter todos os modelos de IA registrados
    const modelsRes = await query("SELECT DISTINCT ai_model FROM library_images WHERE ai_model IS NOT NULL AND ai_model <> '' ORDER BY ai_model ASC");
    const existingModels = modelsRes.rows.map(r => r.ai_model);

    const images = result.rows.map(img => ({
      ...img,
      source: img.source || (img.prompt ? 'ai' : 'upload'),
      ai_model: img.ai_model || (img.source === 'ai' || img.prompt ? 'gpt-image-2' : null),
      url: `/api/library/${img.id}/image`
    }));

    res.json({
      images,
      categories: ['Todas', 'Geral', 'Pessoas', 'Cenários', 'Estilo', 'Produtos', ...existingCategories.filter(c => !['Todas', 'Geral', 'Pessoas', 'Cenários', 'Estilo', 'Produtos'].includes(c))],
      models: ['Todos', ...existingModels.filter(m => m !== 'Todos')],
      sources: ['Todos', 'Geradas por IA', 'Uploads Manuais']
    });
  } catch (err) {
    logger.error('[Library]', 'Erro ao listar imagens:', err);
    res.status(500).json({ error: 'Erro ao listar imagens da biblioteca: ' + err.message });
  }
});

// ── 2. Servir Imagem (Proxy / Streaming) ──────────────────────────────────────
router.get('/api/library/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const imgRes = await query('SELECT * FROM library_images WHERE id = $1', [id]);
    if (imgRes.rows.length === 0) {
      return res.status(404).send('Imagem não encontrada');
    }

    const img = imgRes.rows[0];
    const localFilePath = path.join(storageDir, img.filename);

    if (fs.existsSync(localFilePath)) {
      let contentType = img.mime_type || 'image/jpeg';
      if (img.filename.endsWith('.svg')) {
        contentType = 'image/svg+xml';
      }
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return fs.createReadStream(localFilePath).pipe(res);
    }

    // Se o arquivo físico não existir (ex: seed), gera SVG placeholder elegante
    const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#14b8a6', '#f43f5e'];
    const hash = (img.title || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const color = colors[hash % colors.length];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#141416"/>
          <stop offset="100%" stop-color="#09090b"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="16" fill="url(#bg)"/>
      <circle cx="256" cy="220" r="48" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="2"/>
      <text x="256" y="235" font-family="system-ui, sans-serif" font-size="32" text-anchor="middle">🎨</text>
      <text x="256" y="305" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#f4f4f5" text-anchor="middle">${(img.title || 'Imagem').substring(0, 30)}</text>
      <text x="256" y="335" font-family="system-ui, sans-serif" font-size="12" fill="#71717a" text-anchor="middle">${img.category || 'Biblioteca'}</text>
    </svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  } catch (err) {
    logger.error('[Library]', 'Erro ao entregar imagem:', err);
    res.status(500).send('Erro interno');
  }
});

// ── 3. Atualizar Metadados de Imagem ──────────────────────────────────────────
router.put('/api/library/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, notes } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Título é obrigatório.' });
    }

    const updateRes = await query(
      `UPDATE library_images 
       SET title = $1, category = $2, notes = $3 
       WHERE id = $4 
       RETURNING *`,
      [title.trim(), category || 'Geral', notes || '', id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Imagem não encontrada.' });
    }

    res.json({ ok: true, image: updateRes.rows[0] });
  } catch (err) {
    logger.error('[Library]', 'Erro ao atualizar imagem:', err);
    res.status(500).json({ error: 'Erro ao atualizar imagem: ' + err.message });
  }
});

// ── 4. Excluir Imagem ────────────────────────────────────────────────────────
router.delete('/api/library/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const imgRes = await query('SELECT * FROM library_images WHERE id = $1', [id]);
    if (imgRes.rows.length === 0) {
      return res.status(404).json({ error: 'Imagem não encontrada.' });
    }

    const img = imgRes.rows[0];
    const localFilePath = path.join(storageDir, img.filename);

    if (fs.existsSync(localFilePath)) {
      try { fs.unlinkSync(localFilePath); } catch {}
    }

    await query('DELETE FROM library_images WHERE id = $1', [id]);
    logger.info('[Library]', `🗑️ Imagem "${img.title}" (ID: ${id}) excluída com sucesso.`);

    res.json({ ok: true });
  } catch (err) {
    logger.error('[Library]', 'Erro ao excluir imagem:', err);
    res.status(500).json({ error: 'Erro ao excluir imagem: ' + err.message });
  }
});

// ── 5. Excluir Imagens em Lote ───────────────────────────────────────────
router.post('/api/library/delete-batch', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Nenhum ID de imagem informado para exclusão.' });
    }

    const imgRes = await query('SELECT id, filename, title FROM library_images WHERE id = ANY($1::int[])', [ids]);
    for (const img of imgRes.rows) {
      const localFilePath = path.join(storageDir, img.filename);
      if (fs.existsSync(localFilePath)) {
        try { fs.unlinkSync(localFilePath); } catch {}
      }
    }

    await query('DELETE FROM library_images WHERE id = ANY($1::int[])', [ids]);
    logger.info('[Library]', `🗑️ ${imgRes.rows.length} imagens excluídas em lote com sucesso.`);

    res.json({ ok: true, count: imgRes.rows.length });
  } catch (err) {
    logger.error('[Library]', 'Erro ao excluir imagens em lote:', err);
    res.status(500).json({ error: 'Erro ao excluir imagens em lote: ' + err.message });
  }
});

export default router;
