// backend/scripts/add_source_and_model_to_library_images.js
import { query } from '../dashboard/db.js';
import { logger } from '../dashboard/logger.js';

async function migrate() {
  console.log('🚀 Iniciando migração: adicionando source e ai_model à tabela library_images...');
  try {
    // 1. Adiciona coluna source (padrão: upload)
    await query(`
      ALTER TABLE library_images 
      ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'upload'
    `);
    console.log('✅ Coluna "source" adicionada/validada com sucesso.');

    // 2. Adiciona coluna ai_model (padrão: NULL)
    await query(`
      ALTER TABLE library_images 
      ADD COLUMN IF NOT EXISTS ai_model VARCHAR(100) DEFAULT NULL
    `);
    console.log('✅ Coluna "ai_model" adicionada/validada com sucesso.');

    // 3. Cria índice composto para acelerar filtros por origem e modelo
    await query(`
      CREATE INDEX IF NOT EXISTS idx_library_images_source_model 
      ON library_images (source, ai_model)
    `);
    console.log('✅ Índice "idx_library_images_source_model" criado/validado.');

    // 4. Atualiza registros históricos: imagens geradas por IA recebem source = 'ai' e ai_model
    const updateRes = await query(`
      UPDATE library_images
      SET 
        source = 'ai',
        ai_model = COALESCE(ai_model, 'gpt-image-2')
      WHERE 
        (prompt IS NOT NULL AND prompt <> '')
        OR filename LIKE 'lib_from_gen_%'
        OR filename LIKE 'seed_lib_img_%'
        OR category = 'IA Gerada'
    `);
    console.log(`✅ Registros históricos de IA atualizados: ${updateRes.rowCount} imagens.`);

    // 5. Demais imagens sem source explícito são marcadas como upload manual
    const updateUploadRes = await query(`
      UPDATE library_images
      SET source = 'upload'
      WHERE source IS NULL OR source = ''
    `);
    console.log(`✅ Registros de upload manual normalizados: ${updateUploadRes.rowCount} imagens.`);

    console.log('🎉 Migração concluída com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na migração:', err);
    process.exit(1);
  }
}

migrate();
