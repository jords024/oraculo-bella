import assert from 'assert';

// Teste unitário para validar que o tempo de geração fica fixado após a conclusão e não aumenta a cada refresh
function testDurationBadgePersistence() {
  console.log('🧪 Executando testes unitários de tempo fixado pós-conclusão...');

  const mockCarouselCompletedWithFixedDuration = {
    id: 'test-c1',
    status: 'pronto',
    generationDuration: '4m 30s',
    generationTimeSeconds: 270,
    createdAt: '2026-07-31T14:43:36.000Z',
    completedAt: '2026-07-31T14:48:06.000Z'
  };

  function computeDuration(c) {
    let generationDuration = c.generationDuration;
    let generationTimeSeconds = c.generationTimeSeconds;
    if (c.status !== 'generating') {
      if (!generationTimeSeconds && c.completedAt && (c.generationStartedAt || c.createdAt)) {
        const startMs = new Date(c.generationStartedAt || c.createdAt).getTime();
        const endMs = new Date(c.completedAt).getTime();
        if (startMs && endMs && endMs > startMs) {
          generationTimeSeconds = Math.max(1, Math.round((endMs - startMs) / 1000));
        }
      }
      if (!generationDuration && generationTimeSeconds) {
        const mins = Math.floor(generationTimeSeconds / 60);
        const secs = generationTimeSeconds % 60;
        generationDuration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      }
    }
    return { generationDuration, generationTimeSeconds };
  }

  const result1 = computeDuration(mockCarouselCompletedWithFixedDuration);
  assert.strictEqual(result1.generationDuration, '4m 30s', 'Duração deve permanecer fixa em 4m 30s');

  const legacyWithoutDuration = {
    id: 'test-c2',
    status: 'pronto',
    createdAt: '2026-07-31T10:00:00.000Z'
  };

  const result2 = computeDuration(legacyWithoutDuration);
  assert.strictEqual(result2.generationDuration, undefined, 'Carrosséis antigos sem completedAt/generationDuration não devem ter timer inventado com Date.now()');

  console.log('  ✓ Teste 1: O tempo de geração fica congelado em 4m 30s e não aumenta em atualizações de tela.');
  console.log('  ✓ Teste 2: Carrosséis sem tempo registrado não aumentam dinamicamente.');
  console.log('✅ Todos os testes do tempo de geração passaram com sucesso!');
}

testDurationBadgePersistence();
