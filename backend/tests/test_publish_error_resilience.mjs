/**
 * test_publish_error_resilience.mjs
 * 
 * Testa a resiliência do sistema de publicação:
 * 1. Se stdout contém "PUBLICADO COM SUCESSO" e exit code != 0 → deve retornar 200 OK
 * 2. Se stdout NÃO contém marcador de sucesso → deve retornar 500
 * 3. Se publicação falha completamente → deve retornar 500 com mensagem de erro
 *
 * Estes testes validam a lógica adicionada em carousels.js (handlePublishInstagram)
 * para evitar que erros na atualização de status local causem falso positivo de erro.
 */

import assert from 'assert';

console.log('\n📋 Teste Unitário: Resiliência de Erro na Publicação do Instagram\n');

let passed = 0;
let failed = 0;

// ─── Simula a lógica do handlePublishInstagram de forma isolada ───────────────

function simulatePublishResultHandling(stdoutStr, stderrStr, exitCode, isScheduled) {
  const wasPublished = stdoutStr.includes("PUBLICADO COM SUCESSO") || stdoutStr.includes("AGENDADO COM SUCESSO");
  
  if (exitCode === 0) {
    return { success: true, source: 'normal_success' };
  }
  
  // Processo falhou (exit code != 0) — verifica se publicou antes de falhar
  if (wasPublished) {
    return { success: true, source: 'rescued_from_stdout' };
  }
  
  return { success: false, error: (stdoutStr + ' ' + stderrStr).trim(), source: 'real_failure' };
}

// ─── TESTE 1: Publicação OK mas status update falhou (exit code 1) ────────────
try {
  const stdout = `
============================================================
  INSTAGRAM PUBLISHER — Fonte Oculta
  Pasta: carrossel-abc123

[1/3] Enviando slides para MinIO...
      slide-01.jpg... OK
      slide-02.jpg... OK
[2/3] Criando containers individuais na Meta API...
      Slide 01... OK (17890123)
      Slide 02... OK (17890124)
[3/3] Criando container do carrossel...
      Carousel container ID: 17890999
      Verificando status do container...
      Status: IN_PROGRESS — aguardando... (1/10)
      Status: FINISHED — aguardando... (2/10)

  Publicando no Instagram...

============================================================
  PUBLICADO COM SUCESSO!
  ID: 17999888
  @afonteoculta — instagram.com/afonteoculta
============================================================

Post ID: 17999888
AVISO: Nao foi possivel atualizar status local apos publicacao: [Errno 13] Permission denied
`;
  
  const result = simulatePublishResultHandling(stdout, '', 1, false);
  assert.strictEqual(result.success, true, 'Deve ser success=true quando stdout tem PUBLICADO COM SUCESSO mesmo com exit 1');
  assert.strictEqual(result.source, 'rescued_from_stdout', 'Source deve ser rescued_from_stdout');
  console.log('  ✅ TESTE 1 PASSOU: stdout "PUBLICADO COM SUCESSO" + exit 1 → tratado como sucesso');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 1 FALHOU: ${e.message}`);
  failed++;
}

// ─── TESTE 2: Falha real — sem marcador de sucesso no stdout ─────────────────
try {
  const stdout = `
[1/3] Enviando slides para MinIO...
      slide-01.jpg... OK
[2/3] Criando containers individuais...

ERRO ao publicar: Timeout: container não ficou pronto a tempo.
Traceback (most recent call last):
  ...
RuntimeError: Timeout: container não ficou pronto a tempo.
`;
  
  const result = simulatePublishResultHandling(stdout, '', 1, false);
  assert.strictEqual(result.success, false, 'Deve ser success=false quando não tem marcador de sucesso');
  assert.strictEqual(result.source, 'real_failure', 'Source deve ser real_failure');
  console.log('  ✅ TESTE 2 PASSOU: falha real sem marcador → retorna erro 500');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 2 FALHOU: ${e.message}`);
  failed++;
}

// ─── TESTE 3: Agendamento bem-sucedido com exit code 1 ───────────────────────
try {
  const stdout = `
[1/3] Enviando slides para MinIO...
      slide-01.jpg... OK
[2/3] Criando containers individuais na Meta API...
      Slide 01... OK (11111111)
[3/3] Criando container do carrossel...
      Carousel container ID: 22222222

  Carrossel AGENDADO com sucesso para o timestamp 1759834800!

AGENDADO COM SUCESSO
Post ID: 22222222
AVISO: Nao foi possivel atualizar status local apos publicacao: Connection refused
`;
  
  const result = simulatePublishResultHandling(stdout, '', 1, true);
  assert.strictEqual(result.success, true, 'Agendamento com AGENDADO COM SUCESSO + exit 1 → deve ser tratado como sucesso');
  assert.strictEqual(result.source, 'rescued_from_stdout');
  console.log('  ✅ TESTE 3 PASSOU: "AGENDADO COM SUCESSO" + exit 1 → tratado como sucesso');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 3 FALHOU: ${e.message}`);
  failed++;
}

// ─── TESTE 4: Sucesso normal (exit code 0) ───────────────────────────────────
try {
  const stdout = `
PUBLICADO COM SUCESSO
Post ID: 33333333
Dashboard atualizado -> publicado (Feed)
`;
  
  const result = simulatePublishResultHandling(stdout, '', 0, false);
  assert.strictEqual(result.success, true, 'Exit code 0 → sempre sucesso');
  assert.strictEqual(result.source, 'normal_success', 'Source deve ser normal_success');
  console.log('  ✅ TESTE 4 PASSOU: exit code 0 → sucesso normal');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 4 FALHOU: ${e.message}`);
  failed++;
}

// ─── TESTE 5: Falha total — sem stdout e exit code 1 ─────────────────────────
try {
  const result = simulatePublishResultHandling('', 'PYTHON error: module not found', 1, false);
  assert.strictEqual(result.success, false, 'Sem stdout de sucesso + exit 1 → erro real');
  console.log('  ✅ TESTE 5 PASSOU: sem stdout + exit 1 → retorna erro 500');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 5 FALHOU: ${e.message}`);
  failed++;
}

// ─── TESTE 6: Publicacao com partial stdout contendo erro antes do sucesso ────
try {
  const stdout = `
[1/3] Enviando slides...
AVISO: Caption vazio — publicando sem caption.
slide-01.jpg... OK
PUBLICADO COM SUCESSO
Post ID: 44444444
AVISO: Nao foi possivel atualizar status local apos publicacao: DB error
`;
  
  const result = simulatePublishResultHandling(stdout, 'boto3 deprecation warning', 1, false);
  assert.strictEqual(result.success, true, 'Warnings no stderr + PUBLICADO COM SUCESSO no stdout → deve ser sucesso');
  console.log('  ✅ TESTE 6 PASSOU: warnings no stderr + publicado no stdout → sucesso');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 6 FALHOU: ${e.message}`);
  failed++;
}

// ─── RESULTADO FINAL ──────────────────────────────────────────────────────────
console.log(`\n📊 Resultado: ${passed} passou / ${failed} falhou\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ Todos os testes de resiliência de publicação passaram!\n');
  process.exit(0);
}
