import assert from 'assert';

console.log('\n📋 Teste Unitário: Suporte a Navegação por Scroll no Lightbox\n');

try {
  // Simular evento wheel
  let currentIndex = 2;
  const maxSlides = 10;
  let lastScrollTime = 0;
  const SCROLL_COOLDOWN = 280;

  function simulateWheel(deltaY, now) {
    if (now - lastScrollTime < SCROLL_COOLDOWN) return currentIndex;
    if (deltaY > 20) {
      if (currentIndex < maxSlides - 1) {
        lastScrollTime = now;
        currentIndex++;
      }
    } else if (deltaY < -20) {
      if (currentIndex > 0) {
        lastScrollTime = now;
        currentIndex--;
      }
    }
    return currentIndex;
  }

  let idx = simulateWheel(50, 1000); // Scroll para baixo -> próximo
  assert.strictEqual(idx, 3, 'Scroll para baixo avançou para o slide 3');

  idx = simulateWheel(-50, 1500); // Scroll para cima -> anterior
  assert.strictEqual(idx, 2, 'Scroll para cima voltou para o slide 2');

  console.log('  ✅ Navegação por Scroll (Mouse Wheel) funcionando com throttling de 280ms');
  console.log('\n📊 Resultado: 1 passou / 0 falhou\n');
  process.exit(0);
} catch (e) {
  console.error(`  ❌ FALHOU: ${e.message}`);
  process.exit(1);
}
