#!/usr/bin/env node
/**
 * migrate_settings_to_db.js — Migração única de configurações para o PostgreSQL
 *
 * Lê os arquivos existentes no filesystem e popula as tabelas:
 *   - agent_prompts  ← backend/agents/*.md + display_names.json
 *   - branding       ← backend/dashboard/data/branding.json
 *   - api_keys       ← .env (apenas as MANAGED_KEYS, encriptadas com AES-256)
 *
 * É idempotente: usa ON CONFLICT DO NOTHING (não sobrescreve dados existentes).
 * Execute apenas UMA vez após o primeiro deploy com as novas tabelas.
 *
 * Uso: node dashboard/scripts/migrate_settings_to_db.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { encrypt } from '../crypto.js';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Caminhos ──────────────────────────────────────────────────────────────────
const ROOT         = path.join(__dirname, '..', '..');
const AGENTS_DIR   = path.join(ROOT, 'agents');
const NAMES_FILE   = path.join(AGENTS_DIR, 'display_names.json');
const BRANDING_FILE = path.join(__dirname, '..', 'data', 'branding.json');
const ENV_PATH     = fs.existsSync(path.join(ROOT, '.env'))
  ? path.join(ROOT, '.env')
  : path.join(ROOT, '..', '.env');

// ── Chaves gerenciadas ────────────────────────────────────────────────────────
const MANAGED_KEYS = [
  { key: 'OPENAI_API_KEY',        label: 'OpenAI API Key',           group: 'Geração de Imagem' },
  { key: 'FAL_KEY',               label: 'Fal.ai API Key',            group: 'Geração de Imagem' },
  { key: 'GEMINI_API_KEY',        label: 'Google Gemini API Key',     group: 'Geração de Imagem' },
  { key: 'ELEVENLABS_API_KEY',    label: 'ElevenLabs API Key',        group: 'Áudio' },
  { key: 'META_ACCESS_TOKEN',     label: 'Meta / Instagram Token',    group: 'Publicação' },
  { key: 'INSTAGRAM_ACCOUNT_ID',  label: 'Instagram Account ID',      group: 'Publicação' },
  { key: 'FACEBOOK_PAGE_ID',      label: 'Facebook Page ID',          group: 'Publicação' },
  { key: 'NOTION_TOKEN',          label: 'Notion Token',              group: 'Integrações' },
  { key: 'APIFY_API_KEY',         label: 'Apify API Key',             group: 'Integrações' },
  { key: 'ACTIVE_IMAGE_PROVIDER', label: 'Provedor de Imagem Ativo',  group: 'Geração de Imagem' },
  { key: 'ANTHROPIC_API_KEY',     label: 'Anthropic API Key',         group: 'Geração de Imagem' },
  { key: 'B2_KEY_ID',             label: 'Backblaze Key ID',          group: 'Armazenamento' },
  { key: 'B2_APPLICATION_KEY',    label: 'Backblaze Application Key', group: 'Armazenamento' },
  { key: 'B2_BUCKET_NAME',        label: 'Backblaze Bucket Name',     group: 'Armazenamento' },
  { key: 'B2_ENDPOINT',           label: 'Backblaze Endpoint',        group: 'Armazenamento' },
  { key: 'INSTAGRAM_USERNAME',    label: 'Instagram Username',        group: 'Publicação' },
  { key: 'INSTAGRAM_PASSWORD',    label: 'Instagram Password',        group: 'Publicação' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseEnvFile(content) {
  const result = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    result[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
  return result;
}

function formatName(id) {
  return id
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace('Haucacau', 'HauCacau')
    .replace('Dna', 'DNA')
    .replace('Cta', 'CTA');
}

// ── Conexão ───────────────────────────────────────────────────────────────────

// Carrega .env antes de conectar
if (fs.existsSync(ENV_PATH)) {
  const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  for (const [k, v] of Object.entries(parseEnvFile(envContent))) {
    if (!process.env[k]) process.env[k] = v;
  }
}

const client = new Client({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME     || 'oracle_manager',
});

const JWT_SECRET = process.env.JWT_SECRET || 'fonte-oculta-secret-key-change-in-prod';

// ── Migração ──────────────────────────────────────────────────────────────────

async function migrateAgentPrompts() {
  console.log('\n📄 Migrando prompts dos agentes...');
  if (!fs.existsSync(AGENTS_DIR)) {
    console.log('   ⚠️  Pasta agents/ não encontrada. Pulando.');
    return;
  }

  let displayNames = {};
  if (fs.existsSync(NAMES_FILE)) {
    try { displayNames = JSON.parse(fs.readFileSync(NAMES_FILE, 'utf-8')); } catch {}
  }

  const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));
  let inserted = 0;
  let skipped = 0;

  for (const file of files) {
    const id = file.replace('.md', '');
    const content = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf-8');
    const displayName = displayNames[id] || formatName(id);

    // Infere categoria a partir do nome do arquivo
    let category = 'geral';
    if (['canalizador-visual', 'diretor-arte', 'visual-dna'].some(p => id.includes(p.replace('-', '')))) category = 'design';
    else if (['copywriter', 'gancho', 'cta', 'humanizer', 'oraculo'].some(p => id.includes(p))) category = 'copy';

    const res = await client.query(
      `INSERT INTO agent_prompts (id, display_name, category, content)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [id, displayName, category, content]
    );
    if (res.rowCount > 0) { inserted++; console.log(`   ✅ ${displayName} (${id})`); }
    else { skipped++; console.log(`   ⏭️  ${displayName} (${id}) — já existe, pulando`); }
  }

  console.log(`   → ${inserted} inseridos, ${skipped} ignorados (já existiam).`);
}

async function migrateBranding() {
  console.log('\n🎨 Migrando identidade visual...');
  let data = {};
  if (fs.existsSync(BRANDING_FILE)) {
    try { data = JSON.parse(fs.readFileSync(BRANDING_FILE, 'utf-8')); } catch {}
  } else {
    data = {
      logoText: 'ORÁCULO MANAGER',
      logoSub: 'PRODUÇÃO',
      logoSize: '13px',
      logoColor: '#ffffff',
      carouselTextSize: '15px',
      carouselTextColor: '#e4e4e7',
    };
  }

  const res = await client.query(
    `INSERT INTO branding (id, data) VALUES (1, $1)
     ON CONFLICT (id) DO NOTHING`,
    [JSON.stringify(data)]
  );
  if (res.rowCount > 0) console.log('   ✅ Identidade visual inserida.');
  else console.log('   ⏭️  Identidade visual já existe, pulando.');
}

async function migrateApiKeys() {
  console.log('\n🔑 Migrando chaves de API (criptografadas com AES-256)...');
  let envData = {};
  if (fs.existsSync(ENV_PATH)) {
    try { envData = parseEnvFile(fs.readFileSync(ENV_PATH, 'utf-8')); } catch {}
  }

  let inserted = 0;
  let skipped = 0;
  let empty = 0;

  for (const { key } of MANAGED_KEYS) {
    const rawValue = envData[key] || process.env[key] || '';
    if (!rawValue) { empty++; continue; }

    const encryptedValue = encrypt(rawValue, JWT_SECRET);
    const res = await client.query(
      `INSERT INTO api_keys (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING`,
      [key, encryptedValue]
    );
    if (res.rowCount > 0) { inserted++; console.log(`   ✅ ${key} → encriptado e salvo`); }
    else { skipped++; console.log(`   ⏭️  ${key} — já existe, pulando`); }
  }

  console.log(`   → ${inserted} inseridas, ${skipped} ignoradas, ${empty} vazias.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Iniciando migração de configurações para o PostgreSQL...');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
  console.log(`   Banco: ${process.env.DB_NAME || 'oracle_manager'}`);

  await client.connect();

  await migrateAgentPrompts();
  await migrateBranding();
  await migrateApiKeys();

  await client.end();

  console.log('\n✅ Migração concluída com sucesso!');
  console.log('   Os arquivos originais não foram removidos (guarde-os como backup).');
}

main().catch(err => {
  console.error('❌ Erro durante a migração:', err);
  process.exit(1);
});
