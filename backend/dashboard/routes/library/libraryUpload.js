import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { query } from '../../db.js';
import { logger } from '../../logger.js';
import { b2 } from '../../state.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const storageDir = path.join(__dirname, '..', '..', '..', 'storage', 'library');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Configuração do Multer para uploads
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB máximo por arquivo
});

// Helper para upload de arquivo para o MinIO / B2
export async function uploadToMinio(filename, localFilePath, mimeType) {
  try {
    if (b2 && typeof b2.isB2Configured === 'function' && b2.isB2Configured()) {
      const fileData = fs.readFileSync(localFilePath);
      const BUCKET = process.env.MINIO_BUCKET || 'oraculo-bucket';
      const key = `library/${filename}`;
      
      const cmd = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileData,
        ContentType: mimeType || 'image/jpeg'
      });
    }
  } catch (err) {
    logger.warn('[Library]', 'Aviso ao persistir no MinIO (usando storage local):', err.message);
  }
}

// ── Upload de Imagens ────────────────────────────────────────────────────────
router.post('/api/library/upload', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const { category = 'Geral', notes = '', customTitle } = req.body;
    const userEmail = req.user?.email || 'admin';
    const insertedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const cleanOriginalName = path.basename(file.originalname, ext);
      const uniqueFilename = `lib_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const destPath = path.join(storageDir, uniqueFilename);

      // Move do temp para a pasta persistente da biblioteca
      fs.copyFileSync(file.path, destPath);
      try { fs.unlinkSync(file.path); } catch {}

      // Tenta enviar para o MinIO em background
      await uploadToMinio(uniqueFilename, destPath, file.mimetype);

      const title = (files.length === 1 && customTitle) ? customTitle.trim() : cleanOriginalName;

      const insertRes = await query(
        `INSERT INTO library_images (title, category, notes, filename, storage_path, mime_type, size_bytes, created_by, source, ai_model)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [title, category, notes, uniqueFilename, uniqueFilename, file.mimetype, file.size, userEmail, 'upload', null]
      );

      const item = insertRes.rows[0];
      insertedImages.push({
        ...item,
        url: `/api/library/${item.id}/image`
      });
    }

    logger.info('[Library]', `✅ ${insertedImages.length} imagem(ns) adicionada(s) à biblioteca por ${userEmail}`);
    res.json({ ok: true, count: insertedImages.length, images: insertedImages });
  } catch (err) {
    logger.error('[Library]', 'Erro no upload de imagem:', err);
    res.status(500).json({ error: 'Erro no upload de imagem: ' + err.message });
  }
});

export default router;
