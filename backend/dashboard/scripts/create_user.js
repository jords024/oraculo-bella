// backend/dashboard/scripts/create_user.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Load .env ──
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

import { query, initDb } from '../db.js';
import { hashPassword } from '../state.js';

async function run() {
  console.log('🏁 Conectando ao banco de dados...');
  await initDb();

  const name = 'Arya Raj Alves';
  const email = 'aryarajmarketing@gmail.com';
  const rawPassword = '123456';
  const role = 'admin';

  console.log(`👤 Criando usuário: ${email}...`);
  
  // Limpa o usuário anterior se ele de alguma forma existisse
  await query('DELETE FROM dashboard_users WHERE email = $1', [email]);

  const hashed = await hashPassword(rawPassword);
  await query(
    'INSERT INTO dashboard_users (name, email, password, role, permissions) VALUES ($1, $2, $3, $4, $5)',
    [name, email, hashed, role, JSON.stringify({
      read: true,
      write: true,
      delete: true,
      admin: true
    })]
  );

  console.log('✅ Usuário criado com sucesso!');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
