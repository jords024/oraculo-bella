import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { query } from '../db.js';
import { 
  performBackup, 
  resetBackupScheduler, 
  getBackupDownloadUrl, 
  restoreBackup, 
  deleteBackup,
  uploadBackupToS3,
  enforceRetention
} from '../backupManager.js';
import { requireSuperAdmin } from '../state.js';
import { logger } from '../logger.js';

const router = express.Router();

// Protege todas as rotas de backup exigindo privilégio de Super Admin
router.use('/api/backups', requireSuperAdmin);

// Configura o multer para uploads temporários no diretório temporário do SO
const upload = multer({ dest: os.tmpdir() });

// ── GET /api/backups/config ──────────────────────────────────────────────────
router.get('/api/backups/config', async (req, res) => {
  try {
    const configRes = await query("SELECT * FROM backup_config WHERE id = 1");
    if (configRes.rows.length > 0) {
      res.json(configRes.rows[0]);
    } else {
      res.status(404).json({ error: "Configuração não encontrada" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/backups/config ─────────────────────────────────────────────────
router.post('/api/backups/config', async (req, res) => {
  const { enabled, frequency, interval_val, s3_folder, retention } = req.body;
  try {
    await query(`
      INSERT INTO backup_config (id, enabled, frequency, interval_val, s3_folder, retention, updated_at)
      VALUES (1, $1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET 
        enabled = EXCLUDED.enabled,
        frequency = EXCLUDED.frequency,
        interval_val = EXCLUDED.interval_val,
        s3_folder = EXCLUDED.s3_folder,
        retention = EXCLUDED.retention,
        updated_at = CURRENT_TIMESTAMP
    `, [enabled, frequency, interval_val, s3_folder || 'backups/', retention || 30]);

    // Reinicializa o agendador automático com a nova configuração
    await resetBackupScheduler();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/backups/list ────────────────────────────────────────────────────
router.get('/api/backups/list', async (req, res) => {
  try {
    const logsRes = await query("SELECT * FROM backup_logs ORDER BY created_at DESC");
    res.json(logsRes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/backups/run (Backup Manual) ────────────────────────────────────
router.post('/api/backups/run', async (req, res) => {
  try {
    const result = await performBackup();
    res.json({ ok: true, filename: result.filename });
  } catch (err) {
    res.status(500).json({ error: "Falha ao executar backup: " + err.message });
  }
});

// ── POST /api/backups/upload (Importar Backup Externo) ────────────────────────
router.post('/api/backups/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  const originalName = req.file.originalname;
  // Valida extensão (.dump ou .dump.gz)
  if (!originalName.endsWith('.dump') && !originalName.endsWith('.dump.gz')) {
    try { fs.unlinkSync(req.file.path); } catch {}
    return res.status(400).json({ error: "Extensão de arquivo inválida. Apenas .dump ou .dump.gz são permitidos." });
  }

  const tempPath = req.file.path;
  const sizeBytes = req.file.size;

  try {
    // 1. Obtém a pasta configurada
    let s3Folder = 'backups/';
    let retention = 30;
    const configRes = await query("SELECT s3_folder, retention FROM backup_config WHERE id = 1");
    if (configRes.rows.length > 0) {
      s3Folder = configRes.rows[0].s3_folder;
      retention = configRes.rows[0].retention;
    }

    // 2. Faz o upload para o S3
    await uploadBackupToS3(originalName, tempPath, s3Folder);

    // 3. Salva no banco de dados como sucesso
    await query(`
      INSERT INTO backup_logs (filename, size_bytes, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (filename) DO UPDATE SET size_bytes = $2, status = $3, error_message = NULL
    `, [originalName, sizeBytes, 'success']);

    // 4. Remove arquivo temporário local
    try { fs.unlinkSync(tempPath); } catch {}

    // 5. Aplica retenção
    await enforceRetention(s3Folder, retention);

    res.json({ ok: true, filename: originalName });
  } catch (err) {
    try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch {}
    res.status(500).json({ error: "Falha ao processar upload do backup: " + err.message });
  }
});

// ── GET /api/backups/download/:filename ──────────────────────────────────────
router.get('/api/backups/download/:filename', async (req, res) => {
  const { filename } = req.params;
  try {
    let s3Folder = 'backups/';
    const configRes = await query("SELECT s3_folder FROM backup_config WHERE id = 1");
    if (configRes.rows.length > 0) {
      s3Folder = configRes.rows[0].s3_folder;
    }

    const downloadUrl = await getBackupDownloadUrl(filename, s3Folder);
    res.redirect(302, downloadUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/backups/restore/:filename ──────────────────────────────────────
router.post('/api/backups/restore/:filename', async (req, res) => {
  const { filename } = req.params;
  try {
    let s3Folder = 'backups/';
    const configRes = await query("SELECT s3_folder FROM backup_config WHERE id = 1");
    if (configRes.rows.length > 0) {
      s3Folder = configRes.rows[0].s3_folder;
    }

    await restoreBackup(filename, s3Folder);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Falha ao restaurar banco: " + err.message });
  }
});

// ── POST /api/backups/bulk-delete ─────────────────────────────────────────────
router.post('/api/backups/bulk-delete', async (req, res) => {
  const { filenames } = req.body;
  if (!Array.isArray(filenames) || filenames.length === 0) {
    return res.status(400).json({ error: "Lista de arquivos inválida ou vazia" });
  }

  try {
    let s3Folder = 'backups/';
    const configRes = await query("SELECT s3_folder FROM backup_config WHERE id = 1");
    if (configRes.rows.length > 0) {
      s3Folder = configRes.rows[0].s3_folder;
    }

    for (const filename of filenames) {
      try {
        await deleteBackup(filename, s3Folder);
      } catch (e) {
        logger.error('[Backup]', `Erro ao excluir ${filename}:`, e.message);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/backups/:filename ────────────────────────────────────────────
router.delete('/api/backups/:filename', async (req, res) => {
  const { filename } = req.params;
  try {
    let s3Folder = 'backups/';
    const configRes = await query("SELECT s3_folder FROM backup_config WHERE id = 1");
    if (configRes.rows.length > 0) {
      s3Folder = configRes.rows[0].s3_folder;
    }

    await deleteBackup(filename, s3Folder);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
