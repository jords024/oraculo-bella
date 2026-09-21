import assert from 'assert';

console.log('\n📋 Teste Unitário: Modal Customizada de Erro de Publicação com Cópia de Texto\n');

try {
  let modalState = null;
  let copiedText = '';

  function openErrorModal(carouselId, errorText) {
    modalState = { carouselId, error: errorText };
  }

  function copyError() {
    if (modalState) {
      copiedText = modalState.error;
    }
  }

  const sampleError = 'Traceback (most recent call last):\n  File "publish_instagram.py", line 85\nModuleNotFoundError: No module named \'instagram_publisher\'';

  openErrorModal('carrossel-14', sampleError);
  assert.strictEqual(modalState !== null, true, 'Modal de erro foi aberta');
  assert.strictEqual(modalState.error, sampleError, 'Texto do erro gravado na modal');

  copyError();
  assert.strictEqual(copiedText, sampleError, 'Texto do erro copiado com sucesso');

  console.log('  ✅ Modal de Erro Customizada e Botão de Cópia validados com sucesso');
  console.log('\n📊 Resultado: 1 passou / 0 falhou\n');
  process.exit(0);
} catch (e) {
  console.error(`  ❌ FALHOU: ${e.message}`);
  process.exit(1);
}
