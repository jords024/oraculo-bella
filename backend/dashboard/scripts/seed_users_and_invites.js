// backend/dashboard/scripts/seed_users_and_invites.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Carrega .env da raiz do projeto
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

import { query, initDb } from '../db.js';
import { hashPassword } from '../state.js';

const firstNames = [
  'Lucas', 'Gabriel', 'Mateus', 'Felipe', 'Rafael', 'Bruno', 'Rodrigo', 'Thiago', 'Guilherme', 'Leonardo',
  'Mariana', 'Beatriz', 'Camila', 'Juliana', 'Larissa', 'Carolina', 'Amanda', 'Bruna', 'Fernanda', 'Leticia',
  'Eduardo', 'Carlos', 'Andre', 'Daniel', 'Gustavo', 'Marcelo', 'Diego', 'Vinicius', 'Alexandre', 'Ricardo',
  'Patricia', 'Aline', 'Jessica', 'Vanessa', 'Renata', 'Priscila', 'Natalia', 'Bianca', 'Tatiana', 'Sabrina',
  'Arthur', 'Bernardo', 'Heitor', 'Davi', 'Lorenzo', 'Theo', 'Pedro', 'Henrique', 'Samuel', 'Enzo'
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
  'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Machado', 'Mendes', 'Freitas', 'Marques',
  'Cardoso', 'Ramos', 'Goncalves', 'Santana', 'Teixeira', 'Moura', 'Castro', 'Borges', 'Cavalcanti', 'Pinto'
];

const permissionTemplates = [
  { carrosseis: 'liberado', criador: 'liberado', calendario: 'liberado', biblioteca: 'liberado', reels: 'liberado', fabrica: 'liberado', oraculo: 'liberado', radar: 'liberado' },
  { carrosseis: 'liberado', criador: 'bloqueado', calendario: 'liberado', biblioteca: 'liberado', reels: 'bloqueado', fabrica: 'bloqueado', oraculo: 'liberado', radar: 'bloqueado' },
  { carrosseis: 'liberado', criador: 'liberado', calendario: 'bloqueado', biblioteca: 'liberado', reels: 'liberado', fabrica: 'em_breve', oraculo: 'liberado', radar: 'liberado' },
  { carrosseis: 'bloqueado', criador: 'bloqueado', calendario: 'liberado', biblioteca: 'liberado', reels: 'bloqueado', fabrica: 'bloqueado', oraculo: 'liberado', radar: 'liberado' },
  { carrosseis: 'liberado', criador: 'em_breve', calendario: 'liberado', biblioteca: 'liberado', reels: 'em_breve', fabrica: 'liberado', oraculo: 'liberado', radar: 'liberado' }
];

async function seed() {
  console.log('🚀 Iniciando geração de dados de teste (1000 Usuários e 2000 Convites)...');
  await initDb();

  const fixedPasswordHash = await hashPassword('SenhaForte@2026');
  const now = Date.now();

  // 1. Inserir 1.000 Usuários
  console.log('👤 Gerando 1.000 Usuários Cadastrados...');
  const userBatchSize = 100;
  let createdUsers = 0;

  for (let batch = 0; batch < 10; batch++) {
    const values = [];
    const params = [];
    let paramIndex = 1;

    for (let i = 0; i < userBatchSize; i++) {
      const idx = batch * userBatchSize + i + 1;
      const fn = firstNames[idx % firstNames.length];
      const ln = lastNames[Math.floor(idx / firstNames.length) % lastNames.length];
      const name = `${fn} ${ln}`;
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}.${idx}@oraculo.teste`;
      const role = idx % 8 === 0 ? 'admin' : 'user'; // ~12.5% admin
      const perms = permissionTemplates[idx % permissionTemplates.length];
      
      // Data de criação variada entre 180 dias atrás e hoje
      const randomDaysAgo = Math.floor(Math.random() * 180);
      const createdAt = new Date(now - (randomDaysAgo * 86400000) - Math.floor(Math.random() * 86400000));

      values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      params.push(name, email, fixedPasswordHash, role, JSON.stringify(perms), createdAt);
    }

    const insertUsersSql = `
      INSERT INTO dashboard_users (name, email, password, role, permissions, created_at)
      VALUES ${values.join(', ')}
      ON CONFLICT (email) DO NOTHING
    `;
    await query(insertUsersSql, params);
    createdUsers += userBatchSize;
    process.stdout.write(`\r   Progresso Usuários: ${createdUsers}/1000`);
  }
  console.log('\n✅ 1.000 Usuários gerados com sucesso!');

  // 2. Inserir 2.000 Convites
  console.log('✉️ Gerando 2.000 Convites Enviados com status variados...');
  const inviteBatchSize = 200;
  let createdInvites = 0;

  for (let batch = 0; batch < 10; batch++) {
    const values = [];
    const params = [];
    let paramIndex = 1;

    for (let i = 0; i < inviteBatchSize; i++) {
      const idx = batch * inviteBatchSize + i + 1;
      const id = crypto.randomUUID();
      const role = idx % 6 === 0 ? 'admin' : 'user';
      const perms = permissionTemplates[idx % permissionTemplates.length];
      
      let status;
      let createdAt;
      let expiresAt;

      if (idx % 3 === 1) {
        // ~700 Pendentes: criados recentemente, expiram no futuro
        status = 'pending';
        const hoursAgo = Math.floor(Math.random() * 48); // Criado até 2 dias atrás
        createdAt = new Date(now - hoursAgo * 3600000);
        const futureHours = [2, 12, 24, 48, 72, 168, 720][idx % 7]; // 2h a 30d
        expiresAt = new Date(createdAt.getTime() + futureHours * 3600000);
        // Garante que ainda esteja no futuro
        if (expiresAt.getTime() <= now) {
          expiresAt = new Date(now + futureHours * 3600000);
        }
      } else if (idx % 3 === 2) {
        // ~650 Aceitos: criados no passado, aceitos
        status = 'accepted';
        const daysAgo = 1 + Math.floor(Math.random() * 120);
        createdAt = new Date(now - daysAgo * 86400000);
        expiresAt = new Date(createdAt.getTime() + 24 * 3600000);
      } else {
        // ~650 Expirados: criados no passado, expirados no passado
        status = 'expired';
        const daysAgo = 5 + Math.floor(Math.random() * 175);
        createdAt = new Date(now - daysAgo * 86400000);
        expiresAt = new Date(createdAt.getTime() + 24 * 3600000); // Já expirou
      }

      values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      params.push(id, role, JSON.stringify(perms), expiresAt, status, createdAt);
    }

    const insertInvitesSql = `
      INSERT INTO invitations (id, role, permissions, expires_at, status, created_at)
      VALUES ${values.join(', ')}
      ON CONFLICT (id) DO NOTHING
    `;
    await query(insertInvitesSql, params);
    createdInvites += inviteBatchSize;
    process.stdout.write(`\r   Progresso Convites: ${createdInvites}/2000`);
  }
  console.log('\n✅ 2.000 Convites gerados com sucesso!');

  // Contagem final no banco
  const usersCount = await query('SELECT count(*) FROM dashboard_users');
  const invitesCount = await query('SELECT count(*) FROM invitations');
  const statusCount = await query('SELECT status, count(*) FROM invitations GROUP BY status');

  console.log('\n📊 RESUMO DOS DADOS NO BANCO:');
  console.log(`Total de Usuários no Banco: ${usersCount.rows[0].count}`);
  console.log(`Total de Convites no Banco: ${invitesCount.rows[0].count}`);
  console.log('Distribuição de Convites por Status:');
  statusCount.rows.forEach(r => console.log(` - ${r.status.toUpperCase()}: ${r.count}`));

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
