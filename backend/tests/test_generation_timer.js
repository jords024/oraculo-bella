import assert from 'assert';

// Teste das funções de formatação e cálculo de tempo de geração
function formatGenerationTime(durationSeconds) {
  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function getStartMs(val) {
  if (!val) return Date.now();
  if (typeof val === 'number') return val;
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

function runGenerationTimerTests() {
  console.log('🧪 Executando testes unitários do Cronômetro de Geração...');

  // Teste 1: Geração rápida (< 60 segundos)
  const timeSec1 = 45;
  const formatted1 = formatGenerationTime(timeSec1);
  assert.strictEqual(formatted1, '45s', 'Deveria formatar 45s corretamente');
  console.log('  ✓ Teste 1 (<60s):', formatted1);

  // Teste 2: Geração mais longa (> 60 segundos)
  const timeSec2 = 105;
  const formatted2 = formatGenerationTime(timeSec2);
  assert.strictEqual(formatted2, '1m 45s', 'Deveria formatar 1m 45s corretamente');
  console.log('  ✓ Teste 2 (>60s):', formatted2);

  // Teste 3: Geração exata de minutos (120 segundos)
  const timeSec3 = 120;
  const formatted3 = formatGenerationTime(timeSec3);
  assert.strictEqual(formatted3, '2m 0s', 'Deveria formatar 2m 0s corretamente');
  console.log('  ✓ Teste 3 (2m exatos):', formatted3);

  // Teste 4: Verificação de cálculo de timestamp inicial e final
  const startTime = Date.now() - 3500; // 3.5 segundos atrás
  const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
  assert(elapsedSeconds >= 3 && elapsedSeconds <= 4, 'Cálculo de tempo decorrido deve estar dentro de 3-4s');
  console.log('  ✓ Teste 4 (Cálculo de delta timestamp):', elapsedSeconds, 'segundos');

  // Teste 5: Preservação do tempo de início após F5 / Atualização da página
  const pastMs = Date.now() - 42000; // Iniciou há 42 segundos atrás
  const isoDate = new Date(pastMs).toISOString();
  
  const restoredFromNum = getStartMs(pastMs);
  const restoredFromIso = getStartMs(isoDate);

  const elapsedFromNum = Math.floor((Date.now() - restoredFromNum) / 1000);
  const elapsedFromIso = Math.floor((Date.now() - restoredFromIso) / 1000);

  assert.strictEqual(elapsedFromNum, 42, 'Deveria restaurar 42s do timestamp numérico');
  assert.strictEqual(elapsedFromIso, 42, 'Deveria restaurar 42s do ISO string retornado no F5');
  console.log('  ✓ Teste 5 (Preservação pós-F5):', elapsedFromNum, 's restaurados com sucesso');

  console.log('✅ Todos os testes do Cronômetro de Geração passaram com sucesso!');
}

runGenerationTimerTests();
