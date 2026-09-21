/**
 * Migration Script: Criacao de Indices Estrategicos de Performance no PostgreSQL
 * Executa indices para acelerar listagens, filtros e workers de background.
 */

import pg from 'pg';
const { Client } = pg;

async function run() {
  console.log('🚀 Iniciando criacao de indices de otimizacao no PostgreSQL...');

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'oracle_manager',
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL.');

    console.log('⚡ Criando indice idx_carousels_pinned_created...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_carousels_pinned_created 
      ON carousels (is_pinned DESC, pinned_at DESC, created_at DESC);
    `);

    console.log('⚡ Criando indice idx_carousels_status...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_carousels_status 
      ON carousels (status);
    `);

    console.log('⚡ Criando indice idx_carousels_scheduled...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_carousels_scheduled 
      ON carousels (scheduled_timestamp) WHERE scheduled_timestamp IS NOT NULL;
    `);

    console.log('⚡ Criando indice idx_library_images_category_created...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_library_images_category_created 
      ON library_images (category, created_at DESC);
    `);

    console.log('⚡ Criando indice idx_backup_logs_created...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_backup_logs_created 
      ON backup_logs (created_at DESC);
    `);

    console.log('⚡ Criando indice idx_invitations_status_expires...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_invitations_status_expires 
      ON invitations (status, expires_at);
    `);

    console.log('🎉 Todos os indices de performance foram criados e aplicados com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar indices:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
