/**
 * test_no_image_slides_enforcement.js
 * Testa a lógica de forçamento estrito de slides text_only no carouselQueueWorker.
 *
 * USO:
 *   node backend/tests/test_no_image_slides_enforcement.js
 */

// ── Simulação isolada da lógica de distribuição ───────────────────────────────
function enforceTextOnlyDistribution(slides, noImageSlidesCount) {
  const spawnSlides = slides.map(s => ({ ...s }));

  if (noImageSlidesCount <= 0 || !spawnSlides.length) return spawnSlides;

  const totalS = spawnSlides.length;
  const target = Math.min(noImageSlidesCount, totalS);
  const currentTextOnly = spawnSlides.filter(s => s.layout === 'text_only').length;

  if (currentTextOnly < target) {
    const priority = ['PS', 'CTA', 'SINTESE', 'REFLEXÃO', 'SETUP'];
    const candidates = [];

    for (const p of priority) {
      spawnSlides.forEach((s, i) => {
        if (s.layout !== 'text_only' && s.estado?.toUpperCase().includes(p)) {
          candidates.push(i);
        }
      });
    }

    for (let i = totalS - 1; i >= 0; i--) {
      if (!candidates.includes(i) && spawnSlides[i].layout !== 'text_only') {
        candidates.push(i);
      }
    }

    let remaining = target - currentTextOnly;
    for (const idx of candidates) {
      if (remaining <= 0) break;
      spawnSlides[idx].layout = 'text_only';
      remaining--;
    }

  } else if (currentTextOnly > target) {
    let excess = currentTextOnly - target;
    for (let i = totalS - 1; i >= 0 && excess > 0; i--) {
      if (spawnSlides[i].layout === 'text_only') {
        spawnSlides[i].layout = 'fullbleed';
        excess--;
      }
    }
  }

  return spawnSlides;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FALHOU: ${msg}`);
    failed++;
  }
}

function makeSlidesWithAI(aiLayouts) {
  const estados = ['GANCHO', 'VALIDAÇÃO', 'CONFRONTO', 'EDUCAÇÃO1', 'EDUCAÇÃO2',
                   'REFLEXÃO', 'EMPODERAMENTO', 'SÍNTESE', 'SETUP', 'CTA', 'PS'];
  return aiLayouts.map((layout, i) => ({
    num: i + 1,
    estado: estados[i] || `S${i + 1}`,
    layout,
    title: `Slide ${i + 1}`,
    body: ''
  }));
}

// ── Testes ────────────────────────────────────────────────────────────────────
console.log('\n📋 Testes: Distribuição Estrita de Slides de Fundo Preto\n');

// TESTE 1: IA gerou 3 text_only mas usuário pediu 5
console.log('Teste 1: IA gerou 3 text_only, usuário pediu 5');
{
  const ai = ['fullbleed', 'fullbleed', 'fullbleed', 'text_only', 'text_only',
               'text_only', 'fullbleed', 'fullbleed', 'fullbleed', 'fullbleed'];
  const result = enforceTextOnlyDistribution(makeSlidesWithAI(ai), 5);
  const count = result.filter(s => s.layout === 'text_only').length;
  assert(count === 5, `Resultado deve ter exatamente 5 text_only (tem ${count})`);
}

// TESTE 2: IA gerou 7 text_only mas usuário pediu 5
console.log('\nTeste 2: IA gerou 7 text_only, usuário pediu 5');
{
  const ai = ['text_only', 'fullbleed', 'text_only', 'text_only', 'text_only',
               'text_only', 'fullbleed', 'text_only', 'fullbleed', 'text_only'];
  const result = enforceTextOnlyDistribution(makeSlidesWithAI(ai), 5);
  const count = result.filter(s => s.layout === 'text_only').length;
  assert(count === 5, `Resultado deve ter exatamente 5 text_only (tem ${count})`);
}

// TESTE 3: IA gerou exatamente 5 text_only e usuário pediu 5
console.log('\nTeste 3: IA gerou exatamente 5 text_only, usuário pediu 5');
{
  const ai = ['fullbleed', 'text_only', 'fullbleed', 'text_only', 'fullbleed',
               'text_only', 'fullbleed', 'text_only', 'fullbleed', 'text_only'];
  const result = enforceTextOnlyDistribution(makeSlidesWithAI(ai), 5);
  const count = result.filter(s => s.layout === 'text_only').length;
  assert(count === 5, `Resultado deve ter exatamente 5 text_only (tem ${count})`);
}

// TESTE 4: sem text_only pedido — não deve alterar nada
console.log('\nTeste 4: noImageSlidesCount=0, não deve alterar nada');
{
  const ai = ['fullbleed', 'fullbleed', 'text_only', 'fullbleed', 'fullbleed'];
  const original = makeSlidesWithAI(ai);
  const result = enforceTextOnlyDistribution(original, 0);
  assert(JSON.stringify(result) === JSON.stringify(original), 'Slides devem ser idênticos ao original');
}

// TESTE 5: Prioridade — slides CTA/PS devem ser preferidos para virar text_only
console.log('\nTeste 5: Prioridade — CTA e PS preferidos para virar text_only');
{
  const slides = [
    { num: 1, estado: 'GANCHO', layout: 'fullbleed', title: 'G', body: '' },
    { num: 2, estado: 'VALIDAÇÃO', layout: 'fullbleed', title: 'V', body: '' },
    { num: 3, estado: 'EDUCAÇÃO', layout: 'fullbleed', title: 'E', body: '' },
    { num: 4, estado: 'SÍNTESE', layout: 'fullbleed', title: 'S', body: '' },
    { num: 5, estado: 'CTA', layout: 'fullbleed', title: 'CTA', body: '' },
    { num: 6, estado: 'PS', layout: 'fullbleed', title: 'PS', body: '' },
  ];
  const result = enforceTextOnlyDistribution(slides, 2);
  const textOnlyEstados = result.filter(s => s.layout === 'text_only').map(s => s.estado);
  assert(textOnlyEstados.includes('CTA') || textOnlyEstados.includes('PS'),
    `Slides prioritários (CTA/PS) devem virar text_only. Convertidos: ${textOnlyEstados.join(', ')}`);
}

// TESTE 6: noImageSlidesCount maior que total de slides — limitar ao total
console.log('\nTeste 6: noImageSlidesCount maior que total de slides');
{
  const ai = ['fullbleed', 'fullbleed', 'fullbleed'];
  const result = enforceTextOnlyDistribution(makeSlidesWithAI(ai), 10);
  const count = result.filter(s => s.layout === 'text_only').length;
  assert(count === 3, `Deve limitar ao total de slides (3), resultado: ${count}`);
}

// ── Resumo ────────────────────────────────────────────────────────────────────
console.log(`\n📊 Resultado: ${passed} passou / ${failed} falhou\n`);
process.exit(failed > 0 ? 1 : 0);
