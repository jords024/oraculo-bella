// scripts/migrate_users.js — Cria as novas tabelas de usuários e convites
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

import { initDb } from '../db.js';

async function main() {
  console.log('🏁 Iniciando migração de Gestão de Usuários...');
  try {
    await initDb();
    console.log('🎉 Migração concluída com sucesso!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Falha na migração:', e.message);
    process.exit(1);
  }
}

main();
