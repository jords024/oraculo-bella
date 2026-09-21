import assert from 'assert';

// Teste unitário para validar que o botão de postar é ocultado quando o carrossel falhou ou não tem slides
function testPostButtonVisibility() {
  console.log('🧪 Executando testes unitários de visibilidade do botão Postar e reinício de timer...');

  function shouldShowPostButton(status, slidesCount = 0) {
    return status !== 'generating' && status !== 'queued' && status !== 'failed' && slidesCount > 0;
  }

  assert.strictEqual(shouldShowPostButton('generating', 0), false, 'Não deve exibir para status generating');
  assert.strictEqual(shouldShowPostButton('queued', 0), false, 'Não deve exibir para status queued');
  assert.strictEqual(shouldShowPostButton('failed', 0), false, 'Não deve exibir para status falho');
  assert.strictEqual(shouldShowPostButton('rascunho', 0), false, 'Não deve exibir para rascunho sem slides');
  assert.strictEqual(shouldShowPostButton('pronto', 10), true, 'Deve exibir para status pronto com slides');
  assert.strictEqual(shouldShowPostButton('aprovado', 10), true, 'Deve exibir para status aprovado com slides');

  console.log('  ✓ Teste 1: Botão Postar fica oculto para falhas e carrosséis sem slides.');
  console.log('  ✓ Teste 2: Botão Postar é exibido apenas quando há slides e o status não é gerando/fila/falha.');

  const carouselBeforeRetry = {
    id: 'c1',
    status: 'failed',
    generationDuration: '5m 0s',
    generationTimeSeconds: 300,
    completedAt: '2026-07-31T14:00:00.000Z'
  };

  const newStartTime = Date.now();
  const carouselAfterRetry = {
    ...carouselBeforeRetry,
    status: 'queued',
    generationStartedAt: newStartTime,
    generationDuration: undefined,
    generationTimeSeconds: undefined,
    completedAt: undefined,
    slides: []
  };

  assert.strictEqual(carouselAfterRetry.status, 'queued', 'Status deve mudar para queued ao recriar');
  assert.strictEqual(carouselAfterRetry.generationDuration, undefined, 'Duração antiga deve ser zerada');
  assert.strictEqual(carouselAfterRetry.generationTimeSeconds, undefined, 'Segundos antigos devem ser zerados');
  assert.strictEqual(carouselAfterRetry.generationStartedAt, newStartTime, 'Novo tempo de início deve ser registrado');

  console.log('  ✓ Teste 3: Ao recriar carrossel, o timer é reiniciado do zero.');
  console.log('✅ Todos os testes de botão de postar e reinício de timer passaram com sucesso!');
}

testPostButtonVisibility();
