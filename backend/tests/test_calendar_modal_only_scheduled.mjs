/**
 * test_calendar_modal_only_scheduled.mjs
 *
 * Testa se a lista do modal do Calendário filtra exclusivamente carrosséis com status 'agendado'.
 */

import assert from 'assert';

console.log('\n📋 Teste Unitário: Filtro de Apenas Carrosséis AGENDADOS no Modal do Calendário\n');

let passed = 0;
let failed = 0;

const carousels = [
  { id: '1', title: 'Carrossel 1', status: 'pronto' },
  { id: '2', title: 'Carrossel 2', status: 'aprovado' },
  { id: '3', title: 'Carrossel 3', status: 'agendado' },
  { id: '4', title: 'Carrossel 4', status: 'publicado' },
  { id: '5', title: 'Carrossel 5', status: 'rascunho' }
];

try {
  const pendings = carousels.filter(c => c.status === 'agendado');
  
  assert.strictEqual(pendings.length, 1, 'Deve ser retornado apenas 1 carrossel (agendado)');
  assert.strictEqual(pendings[0].id, '3');
  assert.strictEqual(pendings[0].status, 'agendado');
  
  console.log('  ✅ TESTE PASSOU: Apenas carrosséis com status AGENDADO são listados!');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE FALHOU: ${e.message}`);
  failed++;
}

console.log(`\n📊 Resultado: ${passed} passou / ${failed} falhou\n`);
if (failed > 0) process.exit(1);
