// backend/tests/test_library_model_and_source.js
import assert from 'assert';
import { query } from '../dashboard/db.js';

async function runTests() {
  console.log('🧪 Iniciando testes de registro e filtros de Origem e Modelo na Biblioteca...');

  try {
    // 1. Inserir imagem de teste gerada por IA (ex: dall-e-3)
    const aiRes = await query(`
      INSERT INTO library_images (title, category, notes, prompt, filename, storage_path, mime_type, size_bytes, created_by, source, ai_model)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, ['Teste Imagem IA Dalle', 'Testes', 'Notas de teste', 'Prompt IA', 'test_dalle.png', 'test_dalle.png', 'image/png', 1024, 'admin', 'ai', 'dall-e-3']);

    const aiImg = aiRes.rows[0];
    assert.strictEqual(aiImg.source, 'ai', 'Origem da imagem deve ser "ai"');
    assert.strictEqual(aiImg.ai_model, 'dall-e-3', 'Modelo deve ser "dall-e-3"');
    console.log('  ✅ [PASS] Imagem gerada por IA criada com modelo correto.');

    // 2. Inserir imagem de teste enviada por upload manual
    const uploadRes = await query(`
      INSERT INTO library_images (title, category, notes, filename, storage_path, mime_type, size_bytes, created_by, source, ai_model)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, ['Teste Imagem Upload Manual', 'Testes', 'Notas de upload', 'test_upload.jpg', 'test_upload.jpg', 'image/jpeg', 2048, 'admin', 'upload', null]);

    const uploadImg = uploadRes.rows[0];
    assert.strictEqual(uploadImg.source, 'upload', 'Origem da imagem deve ser "upload"');
    assert.strictEqual(uploadImg.ai_model, null, 'Modelo de upload manual deve ser null');
    console.log('  ✅ [PASS] Imagem de upload manual criada com source="upload" e model=null.');

    // 3. Testar consulta filtrando por source = 'ai'
    const filterAiRes = await query(`
      SELECT * FROM library_images WHERE source = 'ai' AND id = $1
    `, [aiImg.id]);
    assert.strictEqual(filterAiRes.rows.length, 1, 'Filtro por source=ai deve retornar a imagem');
    console.log('  ✅ [PASS] Query filtrando por source="ai" validada.');

    // 4. Testar consulta filtrando por ai_model = 'dall-e-3'
    const filterModelRes = await query(`
      SELECT * FROM library_images WHERE ai_model = 'dall-e-3' AND id = $1
    `, [aiImg.id]);
    assert.strictEqual(filterModelRes.rows.length, 1, 'Filtro por ai_model deve retornar a imagem correspondente');
    console.log('  ✅ [PASS] Query filtrando por ai_model="dall-e-3" validada.');

    // 5. Testar consulta de modelos distintos
    const modelsRes = await query(`
      SELECT DISTINCT ai_model FROM library_images WHERE ai_model IS NOT NULL AND ai_model <> ''
    `);
    const modelsList = modelsRes.rows.map(r => r.ai_model);
    assert(modelsList.includes('dall-e-3'), 'Lista de modelos disponíveis deve conter "dall-e-3"');
    console.log('  ✅ [PASS] Consulta de modelos distintos validada.');

    // Limpeza dos registros de teste
    await query(`DELETE FROM library_images WHERE id IN ($1, $2)`, [aiImg.id, uploadImg.id]);
    console.log('  ✅ [PASS] Registros de teste limpos com sucesso.');

    console.log('\n🎉 Todos os testes de modelo e origem foram aprovados com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Falha nos testes:', err);
    process.exit(1);
  }
}

runTests();
