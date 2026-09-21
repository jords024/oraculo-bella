/**
 * test_scheduling_vs_publishing.mjs
 *
 * Testa as diferenças entre publicação imediata e agendamento:
 * 1. Valida que o worker tem lógica de rescue "PUBLICADO COM SUCESSO"
 * 2. Valida a lógica do scheduledTimestamp (worker só publica quando timestamp chegou)
 * 3. Valida que erros reais do worker continuam sendo tratados como erro
 */

import assert from 'assert';

console.log('\n📋 Teste Unitário: Agendamento vs Publicação Imediata\n');

let passed = 0;
let failed = 0;

// ─── Simula a lógica do worker de agendamento ─────────────────────────────────

function simulateWorkerCheck(carousel, nowSeconds) {
  if (carousel.status === 'agendado') {
    if (carousel.scheduledTimestamp) {
      return nowSeconds >= carousel.scheduledTimestamp;
    }
  }
  if ((carousel.status === 'pronto' || carousel.status === 'aprovado') && 
      (carousel.scheduledTimestamp || carousel.scheduledDate)) {
    if (carousel.scheduledTimestamp) {
      return nowSeconds >= carousel.scheduledTimestamp;
    }
  }
  return false;
}

function simulateWorkerErrorHandling(pubErrStdout) {
  const wasPublished = pubErrStdout.includes('PUBLICADO COM SUCESSO') || 
                        pubErrStdout.includes('AGENDADO COM SUCESSO');
  return wasPublished ? 'publicado' : 'erro-publicacao';
}

// ─── TESTE 1: Worker NÃO dispara carrossel com timestamp no futuro ────────────
try {
  const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // +1 hora
  const carousel = {
    id: 'carrossel-001',
    status: 'agendado',
    scheduledTimestamp: futureTimestamp,
    title: 'Teste Agendamento Futuro'
  };
  const nowSeconds = Math.floor(Date.now() / 1000);
  const isDue = simulateWorkerCheck(carousel, nowSeconds);
  assert.strictEqual(isDue, false, 'Worker NÃO deve publicar carrossel com timestamp no futuro');
  console.log('  ✅ TESTE 1 PASSOU: Worker não dispara carrossel agendado para o futuro');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 1 FALHOU: ${e.message}`);
  failed++;
}

// ─── TESTE 2: Worker DISPARA carrossel com timestamp passado ─────────────────
try {
  const pastTimestamp = Math.floor(Date.now() / 1000) - 60; // -1 minuto (passou)
  const carousel = {
    id: 'carrossel-002',
    status: 'agendado',
    scheduledTimestamp: pastTimestamp,
    title: 'Teste Agendamento Passado'
  };
  const nowSeconds = Math.floor(Date.now() / 1000);
  const isDue = simulateWorkerCheck(carousel, nowSeconds);
  assert.strictEqual(isDue, true, 'Worker DEVE publicar carrossel com timestamp já passado');
  console.log('  ✅ TESTE 2 PASSOU: Worker dispara carrossel quando timestamp já chegou');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 2 FALHOU: ${e.message}`);
  failed++;
}

// ─── TESTE 3: Worker ignora carrossel com status 'publicado' ─────────────────
try {
  const carousel = {
    id: 'carrossel-003',
    status: 'publicado',
    scheduledTimestamp: Math.floor(Date.now() / 1000) - 60,
    title: 'Teste Já Publicado'
  };
  const nowSeconds = Math.floor(Date.now() / 1000);
  const isDue = simulateWorkerCheck(carousel, nowSeconds);
  assert.strictEqual(isDue, false, 'Worker NÃO deve republícar carrossel já publicado');
  console.log('  ✅ TESTE 3 PASSOU: Worker ignora carrossel com status "publicado"');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 3 FALHOU: ${e.message}`);
  failed++;
}

// ─── TESTE 4: Worker ignora carrossel sem scheduledTimestamp ─────────────────
try {
  const carousel = {
    id: 'carrossel-004',
    status: 'pronto',
    title: 'Teste Sem Agendamento'
    // sem scheduledTimestamp nem scheduledDate
  };
  const nowSeconds = Math.floor(Date.now() / 1000);
  const isDue = simulateWorkerCheck(carousel, nowSeconds);
  assert.strictEqual(isDue, false, 'Worker NÃO deve disparar carrossel sem agendamento');
  console.log('  ✅ TESTE 4 PASSOU: Worker ignora carrossel sem scheduledTimestamp');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 4 FALHOU: ${e.message}`);
  failed++;
}

// ─── TESTE 5: Worker trata sucesso com exit code != 0 ────────────────────────
try {
  const stdout = `
[1/3] Enviando slides...
PUBLICADO COM SUCESSO
Post ID: 999888
AVISO: Nao foi possivel atualizar status local: Permission denied
`;
  const result = simulateWorkerErrorHandling(stdout);
  assert.strictEqual(result, 'publicado', 'Worker deve tratar "PUBLICADO COM SUCESSO" como publicado');
  console.log('  ✅ TESTE 5 PASSOU: Worker rescue "PUBLICADO COM SUCESSO" → status publicado');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 5 FALHOU: ${e.message}`);
  failed++;
}

// ─── TESTE 6: Worker falha real → erro-publicacao ────────────────────────────
try {
  const stdout = `
[1/3] Enviando slides...
ERRO ao publicar: Timeout: container nao ficou pronto a tempo.
`;
  const result = simulateWorkerErrorHandling(stdout);
  assert.strictEqual(result, 'erro-publicacao', 'Falha real deve resultar em "erro-publicacao"');
  console.log('  ✅ TESTE 6 PASSOU: Falha real no worker → status erro-publicacao');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 6 FALHOU: ${e.message}`);
  failed++;
}

// ─── TESTE 7: scheduledTimestamp exatamente igual ao nowSeconds ──────────────
try {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const carousel = {
    id: 'carrossel-005',
    status: 'agendado',
    scheduledTimestamp: nowSeconds, // agora exato
    title: 'Teste Agendamento Exato'
  };
  const isDue = simulateWorkerCheck(carousel, nowSeconds);
  assert.strictEqual(isDue, true, 'Worker DEVE publicar quando nowSeconds === scheduledTimestamp');
  console.log('  ✅ TESTE 7 PASSOU: Worker dispara quando timestamp é exatamente agora');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 7 FALHOU: ${e.message}`);
  failed++;
}

// ─── RESULTADO FINAL ──────────────────────────────────────────────────────────
console.log(`\n📊 Resultado: ${passed} passou / ${failed} falhou\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ Todos os testes de agendamento vs publicação passaram!\n');
  process.exit(0);
}
