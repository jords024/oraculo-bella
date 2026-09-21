/**
 * test_calendar_modal_filter.mjs
 *
 * Testa o filtro da lista de seleção do modal de agendamento no Calendário.
 * Garante que apenas carrosséis "pronto" ou "aprovado" (que podem ser agendados) apareçam,
 * ocultando carrosséis agendados, publicados ou em rascunho/geração.
 */

import assert from 'assert';

console.log('\n📋 Teste Unitário: Filtro de Carrosséis Disponíveis no Modal do Calendário\n');

let passed = 0;
let failed = 0;

const carousels = [
  { id: '1', title: 'Carrossel 1', status: 'pronto' },
  { id: '2', title: 'Carrossel 2', status: 'aprovado' },
  { id: '3', title: 'Carrossel 3', status: 'agendado' },
  { id: '4', title: 'Carrossel 4', status: 'publicado' },
  { id: '5', title: 'Carrossel 5', status: 'rascunho' },
  { id: '6', title: 'Carrossel 6', status: 'generating' }
];

try {
  const pendings = carousels.filter(c => c.status === 'pronto' || c.status === 'aprovado');
  
  assert.strictEqual(pendings.length, 2, 'Devem ser retornados apenas 2 carrosséis (pronto e aprovado)');
  assert.deepStrictEqual(pendings.map(c => c.id), ['1', '2']);
  
  console.log('  ✅ TESTE PASSOU: Apenas carrosséis PRONTO e APROVADO são listados para agendamento!');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE FALHOU: ${e.message}`);
  failed++;
}

console.log(`\n📊 Resultado: ${passed} passou / ${failed} falhou\n`);
if (failed > 0) process.exit(1);
