import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool, Client } = pg;

let activeEngine = 'pg';
let pool = null;
let pgliteInstance = null;

// Helper para executar queries de forma agnóstica (PostgreSQL nativo ou PGlite embarcado)
export const query = async (text, params = []) => {
  if (activeEngine === 'pglite' && pgliteInstance) {
    const res = await pgliteInstance.query(text, params);
    return {
      rows: res.rows || [],
      rowCount: res.affectedRows ?? (res.rows ? res.rows.length : 0),
      fields: res.fields || []
    };
  }
  if (!pool) {
    throw new Error('Banco de dados ainda não foi inicializado.');
  }
  return pool.query(text, params);
};

// Inicialização automática das tabelas (Schema definition)
export async function initDb() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '123456';
  const targetDb = process.env.DB_NAME || 'oracle_manager';

  let connectedNative = false;
  if (process.env.DB_ENGINE !== 'pglite') {
    logger.info('[DB]', 'Verificando conectividade com PostgreSQL nativo...');
    const tempClient = new Client({
      host,
      port,
      user,
      password,
      database: 'postgres',
      connectionTimeoutMillis: 3000,
    });

    try {
      await tempClient.connect();
      connectedNative = true;
      const res = await tempClient.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [targetDb]
      );

      if (res.rows.length === 0) {
        logger.info('[DB]', `Banco de dados "${targetDb}" não encontrado. Criando...`);
        const cleanDbName = targetDb.replace(/[^a-zA-Z0-9_]/g, '');
        await tempClient.query(`CREATE DATABASE ${cleanDbName}`);
        logger.info('[DB]', `✅ Banco de dados "${targetDb}" criado com sucesso!`);
      } else {
        logger.info('[DB]', `✅ Banco de dados "${targetDb}" já existe.`);
      }
    } catch (err) {
      logger.warn('[DB]', 'PostgreSQL nativo indisponível ou inacessível:', err.message);
    } finally {
      try {
        await tempClient.end();
      } catch {}
    }
  }

  if (connectedNative) {
    activeEngine = 'pg';
    pool = new Pool({
      host,
      port,
      user,
      password,
      database: targetDb,
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    logger.info('[DB]', 'Conectado ao PostgreSQL externo.');
  } else {
    activeEngine = 'pglite';
    logger.info('[DB]', 'Inicializando banco de dados PostgreSQL embarcado (PGlite WASM)...');
    const { PGlite } = await import('@electric-sql/pglite');
    const pgDataDir = path.join(__dirname, '..', 'storage', 'pgdata');
    if (!fs.existsSync(pgDataDir)) {
      fs.mkdirSync(pgDataDir, { recursive: true });
    }
    pgliteInstance = new PGlite(pgDataDir);
    logger.info('[DB]', `✅ PGlite ativo com persistência de dados em: ${pgDataDir}`);
  }

  logger.info('[DB]', 'Inicializando tabelas do banco de dados...');

  const createCarouselsTable = `
    CREATE TABLE IF NOT EXISTS carousels (
      id VARCHAR(100) PRIMARY KEY,
      title TEXT NOT NULL,
      theme VARCHAR(255),
      praca VARCHAR(100),
      format VARCHAR(50),
      preset VARCHAR(100),
      workspace VARCHAR(100) NOT NULL DEFAULT 'legacy',
      status VARCHAR(100),
      created_at VARCHAR(50),
      slides_dir TEXT,
      slide_prefix VARCHAR(100),
      total_slides INTEGER,
      image_quality VARCHAR(100) DEFAULT 'high',
      b2_base_url TEXT,
      image_provider VARCHAR(100) DEFAULT 'gpt-image-2',
      copy_model VARCHAR(100) DEFAULT 'gpt-4o',
      no_image_slides_count INTEGER DEFAULT 0,
      caption TEXT,
      notes TEXT,
      slides JSONB,
      chat_history JSONB,
      is_pinned BOOLEAN DEFAULT FALSE,
      pinned_at TIMESTAMP DEFAULT NULL,
      generation_duration VARCHAR(100),
      generation_time_seconds INTEGER
    );
  `;

  const createReelsHistoryTable = `
    CREATE TABLE IF NOT EXISTS reels_history (
      id SERIAL PRIMARY KEY,
      gancho_original TEXT,
      padrao_psicologico TEXT,
      roteiro_fonte_oculta TEXT,
      transcricao_original TEXT,
      url TEXT,
      timestamp VARCHAR(100)
    );
  `;

  const createDashboardUsersTable = `
    CREATE TABLE IF NOT EXISTS dashboard_users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      permissions JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createCreatorChatsTable = `
    CREATE TABLE IF NOT EXISTS creator_chats (
      user_email VARCHAR(255) NOT NULL,
      workspace VARCHAR(100) NOT NULL DEFAULT 'bella',
      conversations JSONB NOT NULL DEFAULT '[]'::jsonb,
      active_conversation_id VARCHAR(120),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_email, workspace)
    );
  `;

  const createInvitationsTable = `
    CREATE TABLE IF NOT EXISTS invitations (
      id VARCHAR(100) PRIMARY KEY,
      role VARCHAR(50) NOT NULL,
      permissions JSONB DEFAULT '{}'::jsonb,
      expires_at TIMESTAMP NOT NULL,
      status VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createBackupConfigTable = `
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
  `;

  const createBackupLogsTable = `
    CREATE TABLE IF NOT EXISTS backup_logs (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      size_bytes BIGINT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) NOT NULL,
      error_message TEXT
    );
  `;

  const createAgentPromptsTable = `
    CREATE TABLE IF NOT EXISTS agent_prompts (
      id           VARCHAR(100) PRIMARY KEY,
      display_name VARCHAR(255),
      category     VARCHAR(100),
      content      TEXT NOT NULL DEFAULT '',
      updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createBrandingTable = `
    CREATE TABLE IF NOT EXISTS branding (
      id         INTEGER PRIMARY KEY DEFAULT 1,
      data       JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT branding_one_row CHECK (id = 1)
    );
  `;

  const createApiKeysTable = `
    CREATE TABLE IF NOT EXISTS api_keys (
      key        VARCHAR(100) PRIMARY KEY,
      value      TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createLibraryImagesTable = `
    CREATE TABLE IF NOT EXISTS library_images (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'Geral',
      notes TEXT,
      filename VARCHAR(255) NOT NULL,
      storage_path TEXT NOT NULL,
      mime_type VARCHAR(100) DEFAULT 'image/jpeg',
      size_bytes BIGINT DEFAULT 0,
      width INTEGER DEFAULT 0,
      height INTEGER DEFAULT 0,
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createLibraryChatsTable = `
    CREATE TABLE IF NOT EXISTS library_chats (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255) UNIQUE NOT NULL,
      messages JSONB DEFAULT '[]'::jsonb,
      generated_images JSONB DEFAULT '[]'::jsonb,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createUsageCostsTable = `
    CREATE TABLE IF NOT EXISTS usage_costs (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      item_id VARCHAR(100),
      description TEXT,
      model VARCHAR(100),
      provider VARCHAR(100),
      workspace VARCHAR(100) NOT NULL DEFAULT 'legacy',
      cost_usd NUMERIC(10, 5) NOT NULL DEFAULT 0,
      cost_brl NUMERIC(10, 4) NOT NULL DEFAULT 0,
      tokens_input INTEGER DEFAULT 0,
      tokens_output INTEGER DEFAULT 0,
      quantity INTEGER DEFAULT 1,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createCarouselsTable);
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS image_quality VARCHAR(100) DEFAULT 'high'");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS b2_base_url TEXT");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS image_provider VARCHAR(100) DEFAULT 'gpt-image-2'");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS copy_model VARCHAR(100) DEFAULT 'gpt-4o'");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS no_image_slides_count INTEGER DEFAULT 0");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS last_payload JSONB");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS generation_logs JSONB DEFAULT '[]'::jsonb");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS generation_error TEXT");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP DEFAULT NULL");
    await query(createReelsHistoryTable);
    await query(createDashboardUsersTable);
    await query(createCreatorChatsTable);
    await query(createInvitationsTable);
    await query(createBackupConfigTable);
    await query(createBackupLogsTable);
    await query(createAgentPromptsTable);
    const agentMigrations = [
      { id: 'pesquisador-bella', name: 'PESQUISADOR BELLA — Evidência Condicional', legacy: null },
      { id: 'verificador-fatos-bella', name: 'VERIFICADOR DE FATOS — Precisão Editorial', legacy: null },
      { id: 'gancho-viral', name: 'FERREIRO DE GANCHOS — Aberturas Autorais', legacy: '%Ganchos Somáticos%' },
      { id: 'canalizador-visual', name: 'CANALIZADOR VISUAL — Universos Autorais', legacy: '%Fotográfica 35mm%' }
    ];
    for (const migration of agentMigrations) {
      const promptPath = path.join(__dirname, '..', 'agents', `${migration.id}.md`);
      if (!fs.existsSync(promptPath)) continue;
      const promptContent = fs.readFileSync(promptPath, 'utf8');
      await query(`
        INSERT INTO agent_prompts (id, display_name, category, content, updated_at)
        VALUES ($1, $2, 'Bella Editorial', $3, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING
      `, [migration.id, migration.name, promptContent]);
      if (migration.legacy) {
        await query(`
          UPDATE agent_prompts
          SET display_name=$2, category='Bella Editorial', content=$3, updated_at=CURRENT_TIMESTAMP
          WHERE id=$1 AND content ILIKE $4
        `, [migration.id, migration.name, promptContent, migration.legacy]);
      }
    }
    await query(createBrandingTable);
    await query(createApiKeysTable);
    await query(createLibraryImagesTable);
    await query("ALTER TABLE library_images ADD COLUMN IF NOT EXISTS prompt TEXT");
    await query("ALTER TABLE library_images ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'upload'");
    await query("ALTER TABLE library_images ADD COLUMN IF NOT EXISTS ai_model VARCHAR(100) DEFAULT NULL");
    await query("CREATE INDEX IF NOT EXISTS idx_library_images_source_model ON library_images (source, ai_model)");
    await query(createLibraryChatsTable);
    await query(createUsageCostsTable);

    // Inicializa a linha de configuração única se não existir
    const checkConfig = await query("SELECT * FROM backup_config WHERE id = 1");
    if (checkConfig.rows.length === 0) {
      await query(`
        INSERT INTO backup_config (id, enabled, frequency, interval_val, s3_folder, retention)
        VALUES (1, FALSE, 'hours', 6, 'backups/', 30);
      `);
    }

    // Migração: atualizar registros com valores padrão para os valores atuais do .env
    const envImageProvider = process.env.ACTIVE_IMAGE_PROVIDER;
    const envCopyModel     = process.env.COPY_GENERATION_MODEL;
    if (envImageProvider && envImageProvider !== 'gpt-image-2') {
      await query(
        `UPDATE carousels SET image_provider = $1 WHERE image_provider = 'gpt-image-2'`,
        [envImageProvider]
      );
    }
    if (envCopyModel && envCopyModel !== 'gpt-4o') {
      await query(
        `UPDATE carousels SET copy_model = $1 WHERE copy_model = 'gpt-4o'`,
        [envCopyModel]
      );
    }

    // Migração: adicionar colunas de duração se não existirem
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS generation_duration VARCHAR(100)");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS generation_time_seconds INTEGER");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP DEFAULT NULL");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS scheduled_timestamp BIGINT DEFAULT NULL");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS total_cost_usd NUMERIC(10, 5) DEFAULT 0");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS total_cost_brl NUMERIC(10, 4) DEFAULT 0");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0");
    await query("ALTER TABLE carousels ADD COLUMN IF NOT EXISTS workspace VARCHAR(100) NOT NULL DEFAULT 'legacy'");
    await query("ALTER TABLE usage_costs ADD COLUMN IF NOT EXISTS workspace VARCHAR(100) NOT NULL DEFAULT 'legacy'");
    await query(`
      UPDATE usage_costs
      SET workspace = 'bella'
      WHERE workspace = 'legacy'
        AND item_id IN (SELECT id FROM carousels WHERE workspace = 'bella')
    `);

    // Otimização de Performance: Criação de Índices Estratégicos
    await query("CREATE INDEX IF NOT EXISTS idx_carousels_pinned_created ON carousels (is_pinned DESC, pinned_at DESC, created_at DESC)");
    await query("CREATE INDEX IF NOT EXISTS idx_carousels_status ON carousels (status)");
    await query("CREATE INDEX IF NOT EXISTS idx_carousels_scheduled ON carousels (scheduled_timestamp) WHERE scheduled_timestamp IS NOT NULL");
    await query("CREATE INDEX IF NOT EXISTS idx_library_images_category_created ON library_images (category, created_at DESC)");
    await query("CREATE INDEX IF NOT EXISTS idx_backup_logs_created ON backup_logs (created_at DESC)");
    await query("CREATE INDEX IF NOT EXISTS idx_invitations_status_expires ON invitations (status, expires_at)");
    await query("CREATE INDEX IF NOT EXISTS idx_usage_costs_created ON usage_costs (created_at DESC)");
    await query("CREATE INDEX IF NOT EXISTS idx_usage_costs_type ON usage_costs (type)");
    await query("CREATE INDEX IF NOT EXISTS idx_usage_costs_item ON usage_costs (item_id)");
    await query("CREATE INDEX IF NOT EXISTS idx_creator_chats_updated ON creator_chats (workspace, updated_at DESC)");

    // Resetar carrosséis que ficaram presos em "generating" (processo morreu com restart do container)
    const orphaned = await query(`UPDATE carousels SET status = 'rascunho' WHERE status = 'generating'`);
    if (orphaned.rowCount > 0) {
      logger.warn('[DB]', `⚠️ ${orphaned.rowCount} carrossel(is) órfão(s) em "generating" resetados para "rascunho".`);
    }

    // Usuário admin de desenvolvimento (senha fixa conhecida). NUNCA em produção: em produção o acesso
    // administrativo vem de DASHBOARD_USER/DASHBOARD_PASS no ambiente.
    try {
      const userCheck = await query("SELECT id FROM dashboard_users WHERE email = $1", ['admin@exemplo.com.br']);
      if (process.env.NODE_ENV === 'production') {
        if (userCheck.rows.length > 0) {
          logger.warn('[DB]', '⚠️ SEGURANÇA: existe o usuário de desenvolvimento admin@exemplo.com.br em produção. Apague-o ou troque a senha.');
        }
      } else if (userCheck.rows.length === 0) {
        const { hashPassword } = await import('./state.js');
        const defaultHash = await hashPassword('senha_ficticia_123');
        await query(
          "INSERT INTO dashboard_users (name, email, password, role, permissions) VALUES ($1, $2, $3, $4, $5)",
          ['Administrador', 'admin@exemplo.com.br', defaultHash, 'admin', JSON.stringify({ admin: true, read: true, write: true, delete: true })]
        );
        logger.info('[DB]', '✅ Usuário padrão admin@exemplo.com.br inicializado com sucesso.');
      }
    } catch (userInitErr) {
      logger.warn('[DB]', 'Aviso ao verificar usuário padrão:', userInitErr.message);
    }

    logger.info('[DB]', '✅ Tabelas e índices validados/criados com sucesso: carousels, reels_history, dashboard_users, invitations, backup_config, backup_logs, agent_prompts, branding, api_keys, library_images, library_chats, usage_costs.');
  } catch (err) {
    logger.error('[DB]', '❌ Erro ao inicializar tabelas do banco de dados:', err);
    throw err;
  }
}

export default pool;
