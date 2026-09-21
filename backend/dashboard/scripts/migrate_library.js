// backend/dashboard/scripts/migrate_library.js — Criação das tabelas da Biblioteca
import "../loadEnv.js";
import { query } from "../db.js";
import { logger } from "../logger.js";

async function migrate() {
  logger.info('[MIGRATE]', 'Iniciando migração das tabelas da Biblioteca...');

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

  try {
    await query(createLibraryImagesTable);
    await query(createLibraryChatsTable);
    logger.info('[MIGRATE]', '✅ Tabelas "library_images" e "library_chats" criadas/validadas com sucesso!');
  } catch (err) {
    logger.error('[MIGRATE]', '❌ Erro na migração das tabelas da Biblioteca:', err);
    process.exit(1);
  }
}

migrate().then(() => {
  logger.info('[MIGRATE]', 'Migração concluída.');
  process.exit(0);
});
