// scripts/migrate_backups.js — Cria tabelas de configuração e histórico de backups
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

(function loadEnv() {
  try {
    const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '.env');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const eq = t.indexOf('=');
        if (eq < 0) continue;
        const k = t.slice(0, eq).trim();
        const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        if (k && !process.env[k]) process.env[k] = v;
      }
    }
  } catch {}
})();

import { query } from '../db.js';

async function main() {
  console.log('🏁 Iniciando migração para tabelas de backup automático...');
  try {
    // 1. Tabela backup_config
    await query(`
      CREATE TABLE IF NOT EXISTS backup_config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        enabled BOOLEAN DEFAULT FALSE,
        frequency VARCHAR(50) DEFAULT 'hours',
        interval_val INTEGER DEFAULT 6,
        s3_folder VARCHAR(255) DEFAULT 'backups/',
        retention INTEGER DEFAULT 30,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT one_row CHECK (id = 1)
      );
    `);
    console.log('✅ Tabela "backup_config" criada ou validada.');

    // Inicializa a linha de configuração única se não existir
    const checkConfig = await query("SELECT * FROM backup_config WHERE id = 1");
    if (checkConfig.rows.length === 0) {
      await query(`
        INSERT INTO backup_config (id, enabled, frequency, interval_val, s3_folder, retention)
        VALUES (1, FALSE, 'hours', 6, 'backups/', 30);
      `);
      console.log('✅ Configuração padrão de backup inicializada.');
    }

    // 2. Tabela backup_logs
    await query(`
      CREATE TABLE IF NOT EXISTS backup_logs (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        size_bytes BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) NOT NULL,
        error_message TEXT
      );
    `);
    console.log('✅ Tabela "backup_logs" criada ou validada.');

    console.log('🎉 Migração de tabelas de backup concluída com sucesso!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Falha na migração:', e.message);
    process.exit(1);
  }
}

main();
