import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { 
  S3Client, 
  PutObjectCommand, 
  ListObjectsV2Command, 
  DeleteObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { query } from './db.js';
import { logger } from './logger.js';
import { Readable } from 'stream';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── S3 Configuration ──────────────────────────────────────────────────────────
function getRegionFromEndpoint(endpoint) {
  if (process.env.B2_REGION || process.env.AWS_REGION || process.env.MINIO_REGION) {
    return process.env.B2_REGION || process.env.AWS_REGION || process.env.MINIO_REGION;
  }
  const match = endpoint.match(/s3[.-]([a-z0-9-]+)\.backblazeb2\.com/i);
  if (match) return match[1];
  const awsMatch = endpoint.match(/s3[.-]([a-z0-9-]+)\.amazonaws\.com/i);
  if (awsMatch) return awsMatch[1];
  return "us-east-005";
}

const getS3Client = () => {
  const bucket = process.env.B2_BUCKET_NAME || process.env.B2_BUCKET || "Publicacoes";
  const rawEndpoint = process.env.B2_ENDPOINT || process.env.MINIO_ENDPOINT || "s3.us-east-005.backblazeb2.com";
  const cleanEndpoint = rawEndpoint.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const region = getRegionFromEndpoint(cleanEndpoint);
  const keyId = process.env.B2_KEY_ID || process.env.B2_APPLICATION_KEY_ID || process.env.MINIO_ROOT_USER;
  const appKey = process.env.B2_APPLICATION_KEY || process.env.B2_APP_KEY || process.env.MINIO_ROOT_PASSWORD;

  if (!keyId || !appKey) {
    throw new Error("Credenciais do Backblaze B2/S3 não configuradas no .env");
  }

  return {
    client: new S3Client({
      region: region,
      endpoint: `https://${cleanEndpoint}`,
      credentials: { accessKeyId: keyId, secretAccessKey: appKey },
      forcePathStyle: true,
    }),
    bucket
  };
};

// Global reference for the dynamic interval timer
let activeSchedulerTimer = null;

// Executa pg_dump e gera o arquivo comprimido
const executeDump = (outputPath) => {
  return new Promise((resolve, reject) => {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || '123456';
    const database = process.env.DB_NAME || 'oracle_manager';

    const args = [
      '-h', host,
      '-p', port,
      '-U', user,
      '-F', 'c', // Formato customizado pg_dump (comprimido nativamente ou estruturado)
      '-b',      // Inclui blobs
      '-v',      // Verbose
      '-f', outputPath,
      database
    ];

    logger.info('[Backup]', `Executando pg_dump para ${database} no host ${host}...`);
    const pgDump = spawn('pg_dump', args, {
      env: {
        ...process.env,
        PGPASSWORD: password
      }
    });

    let stderrData = '';
    pgDump.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pgDump.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pg_dump finalizou com código ${code}. Erro: ${stderrData}`));
      }
    });

    pgDump.on('error', (err) => {
      reject(err);
    });
  });
};

// Faz o upload de um arquivo de backup para o S3
export async function uploadBackupToS3(filename, filePath, s3Folder) {
  const { client, bucket } = getS3Client();
  const fileStream = fs.createReadStream(filePath);
  const key = `${s3Folder.replace(/\/$/, '')}/${filename}`;

  logger.info('[Backup]', `Enviando backup para S3: ${key}...`);
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileStream,
    ContentType: "application/octet-stream"
  });

  await client.send(cmd);
}

// Limpa backups antigos no S3 de acordo com o limite de retenção
export async function enforceRetention(s3Folder, retentionLimit) {
  try {
    const { client, bucket } = getS3Client();
    const cleanFolder = s3Folder.replace(/\/$/, '');
    const prefix = `${cleanFolder}/`;

    logger.info('[Backup]', `Verificando retenção em ${prefix} (limite: ${retentionLimit})...`);
    const listCmd = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix
    });

    const res = await client.send(listCmd);
    const contents = res.Contents || [];

    // Filtra apenas arquivos de dump e ordena pelo mais recente
    const backups = contents
      .filter(obj => obj.Key.endsWith('.dump') || obj.Key.endsWith('.dump.gz'))
      .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));

    if (backups.length > retentionLimit) {
      const toDelete = backups.slice(retentionLimit);
      logger.info('[Backup]', `Removendo ${toDelete.length} backup(s) antigo(s)...`);

      for (const obj of toDelete) {
        logger.info('[Backup]', `Deletando do S3: ${obj.Key}`);
        const deleteCmd = new DeleteObjectCommand({
          Bucket: bucket,
          Key: obj.Key
        });
        await client.send(deleteCmd);

        // Remove também dos logs de backup locais
        const filename = path.basename(obj.Key);
        await query("DELETE FROM backup_logs WHERE filename = $1", [filename]);
      }
    }
  } catch (err) {
    logger.error('[Backup]', 'Erro ao aplicar política de retenção:', err.message);
  }
}

// Executa o fluxo de backup completo
export async function performBackup() {
  const timestamp = new Date().toISOString()
    .replace(/T/, '_')
    .replace(/\..+/, '')
    .replace(/:/g, '_')
    .replace(/-/g, '_');

  const filename = `oracle_backup_${timestamp}.dump`;
  const tempPath = path.join(os.tmpdir(), filename);

  let config = { s3_folder: 'backups/', retention: 30 };
  try {
    const configRes = await query("SELECT * FROM backup_config WHERE id = 1");
    if (configRes.rows.length > 0) {
      config = configRes.rows[0];
    }
  } catch (err) {
    logger.error('[Backup]', 'Erro ao carregar configuração de backup:', err.message);
  }

  try {
    // 1. Gera o dump
    await executeDump(tempPath);

    // 2. Obtém o tamanho do arquivo
    const stats = fs.statSync(tempPath);
    const sizeBytes = stats.size;

    // 3. Faz o upload para o S3
    await uploadBackupToS3(filename, tempPath, config.s3_folder);

    // 4. Salva no banco de dados como sucesso
    await query(`
      INSERT INTO backup_logs (filename, size_bytes, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (filename) DO UPDATE SET size_bytes = $2, status = $3, error_message = NULL
    `, [filename, sizeBytes, 'success']);

    logger.info('[Backup]', `✅ Backup concluído com sucesso: ${filename}`);

    // 5. Remove arquivo temporário local
    try {
      fs.unlinkSync(tempPath);
    } catch {}

    // 6. Aplica retenção
    await enforceRetention(config.s3_folder, config.retention);

    return { success: true, filename };
  } catch (err) {
    logger.error('[Backup]', 'Falha ao realizar backup:', err.message);

    // Registra falha no banco
    try {
      await query(`
        INSERT INTO backup_logs (filename, size_bytes, status, error_message)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (filename) DO UPDATE SET status = $3, error_message = $4
      `, [filename, 0, 'failed', err.message]);
    } catch (dbErr) {
      logger.error('[Backup]', 'Erro ao salvar log de falha de backup:', dbErr.message);
    }

    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {}

    throw err;
  }
}

// Inicializa ou reinicializa o cronômetro do scheduler de backup
export async function resetBackupScheduler() {
  if (activeSchedulerTimer) {
    clearInterval(activeSchedulerTimer);
    activeSchedulerTimer = null;
    logger.info('[Backup]', 'Scheduler anterior finalizado.');
  }

  try {
    const configRes = await query("SELECT * FROM backup_config WHERE id = 1");
    if (configRes.rows.length === 0) return;

    const config = configRes.rows[0];
    if (!config.enabled) {
      logger.info('[Backup]', 'Scheduler automático desativado.');
      return;
    }

    let intervalMs = 60000; // padrão 1 minuto
    const value = config.interval_val || 6;

    if (config.frequency === 'minutes') {
      intervalMs = value * 60 * 1000;
    } else if (config.frequency === 'hours') {
      intervalMs = value * 60 * 60 * 1000;
    } else if (config.frequency === 'days') {
      intervalMs = value * 24 * 60 * 60 * 1000;
    }

    logger.info('[Backup]', `Scheduler ativado. Frequência: a cada ${value} ${config.frequency} (${intervalMs}ms)`);

    activeSchedulerTimer = setInterval(async () => {
      logger.info('[Backup]', 'Executando rotina programada de backup...');
      try {
        await performBackup();
      } catch (err) {
        logger.error('[Backup]', 'Erro na execução programada do backup:', err.message);
      }
    }, intervalMs);

  } catch (err) {
    logger.error('[Backup]', 'Erro ao inicializar scheduler:', err.message);
  }
}

// Retorna URL de download do backup
export async function getBackupDownloadUrl(filename, s3Folder) {
  const { client, bucket } = getS3Client();
  const endpoint = (process.env.B2_ENDPOINT || "s3.us-east-005.backblazeb2.com").replace(/^https?:\/\//i, "");
  const key = `${s3Folder.replace(/\/$/, '')}/${filename}`;
  return `https://${bucket}.${endpoint}/${key}`;
}

// Restaura um backup (executa pg_restore no banco)
export async function restoreBackup(filename, s3Folder) {
  const { client, bucket } = getS3Client();
  const key = `${s3Folder.replace(/\/$/, '')}/${filename}`;
  const tempPath = path.join(os.tmpdir(), filename);

  logger.info('[Backup]', `Baixando backup do S3 para restauração: ${key}...`);
  const getCmd = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });

  const res = await client.send(getCmd);
  const fileStream = fs.createWriteStream(tempPath);

  await new Promise((resolve, reject) => {
    res.Body.pipe(fileStream);
    res.Body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  logger.info('[Backup]', `Restaurando arquivo pg_dump: ${tempPath}...`);
  return new Promise((resolve, reject) => {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || '123456';
    const database = process.env.DB_NAME || 'oracle_manager';

    const args = [
      '-h', host,
      '-p', port,
      '-U', user,
      '-d', database,
      '-c',        // Limpa (dropa) objetos do banco antes de recriar
      '-v',
      tempPath
    ];

    const pgRestore = spawn('pg_restore', args, {
      env: {
        ...process.env,
        PGPASSWORD: password
      }
    });

    let stderrData = '';
    pgRestore.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pgRestore.on('close', (code) => {
      try {
        fs.unlinkSync(tempPath);
      } catch {}

      if (code === 0 || code === 1) { // código 1 pode ser apenas avisos normais do pg_restore
        logger.info('[Backup]', '✅ Restauração concluída com sucesso.');
        resolve();
      } else {
        reject(new Error(`pg_restore finalizou com código ${code}. Erro: ${stderrData}`));
      }
    });

    pgRestore.on('error', (err) => {
      try {
        fs.unlinkSync(tempPath);
      } catch {}
      reject(err);
    });
  });
}

// Deleta um backup do S3 e dos logs
export async function deleteBackup(filename, s3Folder) {
  try {
    const { client, bucket } = getS3Client();
    const key = `${s3Folder.replace(/\/$/, '')}/${filename}`;

    logger.info('[Backup]', `Removendo backup do S3: ${key}...`);
    const deleteCmd = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    });

    await client.send(deleteCmd);
  } catch (s3Err) {
    logger.warn('[Backup]', `Aviso ao remover do S3 (${filename}): ${s3Err.message}`);
  }

  // Sempre remove do banco de dados (backup_logs)
  await query("DELETE FROM backup_logs WHERE filename = $1", [filename]);
}

