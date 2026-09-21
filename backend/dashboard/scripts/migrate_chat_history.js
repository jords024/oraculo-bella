// scripts/migrate_chat_history.js — Adiciona a coluna chat_history na tabela carousels
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Load .env from project root ──────────────────────────────────────────────
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
  console.log('🏁 Iniciando migração da coluna chat_history...');
  try {
    const alterQuery = `
      ALTER TABLE carousels 
      ADD COLUMN IF NOT EXISTS chat_history JSONB;
    `;
    await query(alterQuery);
    console.log('✅ Coluna chat_history adicionada com sucesso ou já existente.');
    console.log('🎉 Migração concluída com sucesso!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Falha na migração:', e.message);
    process.exit(1);
  }
}

main();
