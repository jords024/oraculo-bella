// scripts/migrate_permissions.js — Adiciona a coluna de permissões às tabelas
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
  console.log('🏁 Iniciando migração para adicionar permissões por página...');
  try {
    // 1. Altera tabela dashboard_users
    await query(`
      ALTER TABLE dashboard_users 
      ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;
    `);
    console.log('✅ Coluna "permissions" adicionada à tabela "dashboard_users" (se não existia).');

    // 2. Altera tabela invitations
    await query(`
      ALTER TABLE invitations 
      ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;
    `);
    console.log('✅ Coluna "permissions" adicionada à tabela "invitations" (se não existia).');

    console.log('🎉 Migração de permissões concluída com sucesso!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Falha na migração:', e.message);
    process.exit(1);
  }
}

main();
