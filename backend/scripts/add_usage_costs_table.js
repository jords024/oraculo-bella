/**
 * add_usage_costs_table.js
 * Migração para criar a tabela usage_costs e adicionar colunas de custo total nos carrosséis.
 */
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'oracle_manager',
});

export async function runMigration() {
  console.log('🚀 Executando migração: Criando tabela usage_costs...');

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS usage_costs (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      item_id VARCHAR(100),
      description TEXT,
      model VARCHAR(100),
      provider VARCHAR(100),
      cost_usd NUMERIC(10, 5) NOT NULL DEFAULT 0,
      cost_brl NUMERIC(10, 4) NOT NULL DEFAULT 0,
      tokens_input INTEGER DEFAULT 0,
      tokens_output INTEGER DEFAULT 0,
      quantity INTEGER DEFAULT 1,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_usage_costs_created ON usage_costs (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_usage_costs_type ON usage_costs (type);
    CREATE INDEX IF NOT EXISTS idx_usage_costs_item ON usage_costs (item_id);

    ALTER TABLE carousels ADD COLUMN IF NOT EXISTS total_cost_usd NUMERIC(10, 5) DEFAULT 0;
    ALTER TABLE carousels ADD COLUMN IF NOT EXISTS total_cost_brl NUMERIC(10, 4) DEFAULT 0;
    ALTER TABLE carousels ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
  `;

  try {
    await pool.query(createTableSql);
    console.log('✅ Migração concluída com sucesso!');
  } catch (err) {
    console.error('❌ Erro na migração:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && process.argv[1].includes('add_usage_costs_table.js')) {
  runMigration().then(() => process.exit(0)).catch(() => process.exit(1));
}
