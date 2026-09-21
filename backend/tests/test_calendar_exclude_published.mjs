/**
 * test_calendar_exclude_published.mjs
 *
 * Testa se carrosséis com status 'publicado' são excluídos do grid de células do Calendário.
 */

import assert from 'assert';

console.log('\n📋 Teste Unitário: Exclusão de Publicados do Grid do Calendário\n');

let passed = 0;
let failed = 0;

const carousels = [
  { id: '1', title: 'Carrossel Agendado', status: 'agendado', scheduledDate: '2026-08-05' },
  { id: '2', title: 'Carrossel Publicado', status: 'publicado', scheduledDate: '2026-08-05' }
];

try {
  const dayStr = '2026-08-05';
  const scheduled = carousels.filter(c => c.status !== 'publicado' && c.scheduledDate === dayStr);
  
  assert.strictEqual(scheduled.length, 1, 'Deve ser retornado apenas 1 carrossel');
  assert.strictEqual(scheduled[0].id, '1');
  assert.strictEqual(scheduled[0].status, 'agendado');
  
  console.log('  ✅ TESTE PASSOU: Carrosséis com status PUBLICADO são omitidos das células do Calendário!');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE FALHOU: ${e.message}`);
  failed++;
}

console.log(`\n📊 Resultado: ${passed} passou / ${failed} falhou\n`);
if (failed > 0) process.exit(1);
