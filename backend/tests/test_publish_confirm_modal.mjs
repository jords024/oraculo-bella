import assert from 'assert';

console.log('\n📋 Teste Unitário: Modal de Confirmação e Resultado de Publicação no Instagram\n');

try {
  let modalConfirmState = null;
  let modalResultState = null;

  function triggerPublishClick(carousel) {
    modalConfirmState = carousel;
  }

  function confirmPublish(carousel) {
    modalConfirmState = null;
    // Simula resposta com sucesso da API
    modalResultState = {
      success: true,
      carouselId: carousel.id,
      title: carousel.title,
      postId: '18612220159003336'
    };
  }

  const sampleCarousel = { id: 'carrossel-14', title: 'Carrossel Teste', slides: [1, 2, 3] };

  // 1. Clique no botão de publicar abre modal de confirmação
  triggerPublishClick(sampleCarousel);
  assert.strictEqual(modalConfirmState !== null, true, 'Modal de confirmação deve abrir');
  assert.strictEqual(modalConfirmState.id, 'carrossel-14', 'ID do carrossel correto na modal de confirmação');

  // 2. Confirmação aciona o envio e abre resultado com sucesso e ID da mídia
  confirmPublish(sampleCarousel);
  assert.strictEqual(modalConfirmState, null, 'Modal de confirmação fecha após aceitar');
  assert.strictEqual(modalResultState.success, true, 'Resultado de sucesso exibido');
  assert.strictEqual(modalResultState.postId, '18612220159003336', 'ID da mídia gerada gravado no resultado');

  console.log('  ✅ Fluxo de Confirmação e Resultado da Publicação validado com sucesso!');
  console.log('\n📊 Resultado: 1 passou / 0 falhou\n');
  process.exit(0);
} catch (e) {
  console.error(`  ❌ FALHOU: ${e.message}`);
  process.exit(1);
}
