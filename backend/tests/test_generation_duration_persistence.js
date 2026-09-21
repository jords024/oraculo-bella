/**
 * test_generation_duration_persistence.js
 * Testa a persistência de generation_duration e generation_time_seconds no banco de dados.
 *
 * USO:
 *   node backend/tests/test_generation_duration_persistence.js
 */

import { query } from '../dashboard/db.js';
import { readDataAsync, writeDataAsync } from '../dashboard/helpers.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FALHOU: ${msg}`);
    failed++;
  }
}

console.log('\n📋 Testes: Persistência de Duração de Geração\n');

// TESTE 1: Verificar se as colunas existem no banco
console.log('Teste 1: Verificar existência das colunas no banco de dados');
try {
  const res = await query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'carousels'
      AND column_name IN ('generation_duration', 'generation_time_seconds')
  `);
  const cols = res.rows.map(r => r.column_name);
  assert(cols.includes('generation_duration'), 'Coluna generation_duration existe na tabela');
  assert(cols.includes('generation_time_seconds'), 'Coluna generation_time_seconds existe na tabela');
} catch (err) {
  console.error('  ❌ Erro ao consultar banco:', err.message);
  failed += 2;
}

// TESTE 2: Verificar que writeData persiste a duração
console.log('\nTeste 2: writeData deve persistir generation_duration e generation_time_seconds');
const TEST_ID = `test-duration-${Date.now()}`;
try {
  const allBefore = await readDataAsync();
  const testCarousel = {
    id: TEST_ID,
    title: 'Carrossel Teste Duração',
    theme: 'test',
    praca: '',
    format: 'A',
    preset: 'cinematografico',
    status: 'pronto',
    createdAt: new Date().toISOString(),
    slidesDir: '',
    slidePrefix: 'slide-',
    totalSlides: 10,
    caption: '',
    notes: '',
    slides: ['slide-01.jpg'],
    chatHistory: [],
    imageQuality: 'high',
    b2BaseUrl: '',
    imageProvider: 'gpt-image-2',
    copyModel: 'gpt-4o',
    noImageSlidesCount: 0,
    lastPayload: null,
    isPinned: false,
    pinnedAt: null,
    generationDuration: '2m 15s',
    generationTimeSeconds: 135
  };

  await writeDataAsync([...allBefore, testCarousel]);

  // Relê do banco para verificar persistência
  const allAfter = await readDataAsync();
  const persisted = allAfter.find(c => c.id === TEST_ID);

  assert(persisted !== undefined, 'Carrossel de teste foi encontrado no banco após salvar');
  assert(persisted?.generationDuration === '2m 15s', `generationDuration persistido corretamente (valor: ${persisted?.generationDuration})`);
  assert(persisted?.generationTimeSeconds === 135, `generationTimeSeconds persistido corretamente (valor: ${persisted?.generationTimeSeconds})`);

  // Limpeza
  await writeDataAsync(allBefore);
  console.log('  🗑️  Dados de teste limpos.');
} catch (err) {
  console.error('  ❌ Erro durante teste de persistência:', err.message);
  failed += 3;
}

// TESTE 3: mapCarouselFromDb deve retornar null quando colunas são null
console.log('\nTeste 3: Carrosseis sem duração devem retornar null (não undefined)');
try {
  const all = await readDataAsync();
  const carouselSemDuracao = all.find(c => !c.generationDuration);
  if (carouselSemDuracao) {
    assert(carouselSemDuracao.generationDuration === null,
      `generationDuration deve ser null para carrosseis sem duração (valor: ${carouselSemDuracao.generationDuration})`);
  } else {
    console.log('  ⚠️  Nenhum carrossel sem duração encontrado para testar (skip).');
    passed++;
  }
} catch (err) {
  console.error('  ❌ Erro:', err.message);
  failed++;
}

// ── Resumo ────────────────────────────────────────────────────────────────────
console.log(`\n📊 Resultado: ${passed} passou / ${failed} falhou\n`);
process.exit(failed > 0 ? 1 : 0);
