/**
 * test_carousel_parser_no_image_count.mjs
 * Testa se o carouselParser.js extrai corretamente o noImageSlidesCount.
 *
 * USO (Node 18+):
 *   node frontend/js/test_carousel_parser_no_image_count.mjs
 *
 * Nota: Cópia da lógica do parser para poder rodar fora do contexto Vite/Browser.
 */

// ── Réplica isolada do parseCarouselText ─────────────────────────────────────
function parseCarouselText(text, fallbackData = null) {
  const t = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const temaMatch = t.match(/TEMA:\s*(.+)/i);
  const pracaMatch = t.match(/PRA[ÇC]A:\s*(.+)/i);
  const bigIdea = t.match(/BIG IDEA:\s*(.+)/i);
  const revisorMatch = t.match(/TOTAL:\s*([\d]+\/15)/i);
  const captionMatch = t.match(/CAPTION[^:\n]*:\s*\n([\s\S]+?)(?=\nCTA TRIBAL|━)/i);
  const ctaMatch = t.match(/CTA TRIBAL:\s*"([^"\n]+)"/i);

  const title = temaMatch
    ? temaMatch[1].trim().slice(0, 80)
    : (fallbackData?.title || 'Carrossel Fonte Oculta');

  const caption = (captionMatch?.[1] || bigIdea?.[1] || '').trim();

  const slides = [];
  const lines = t.split('\n');
  const slideHeader = /^(?:\[S(\d+)\s*[—–\-]?\s*([^\]|]*?)(?:\s*\|\s*layout:\s*([^\]\s|]+))?\s*\]|SLIDE\s*(\d+)\b)/i;
  let current = null;
  let field = null;

  const flush = () => {
    if (current && (current.title || current.body)) {
      slides.push({
        num: current.num,
        estado: current.estado,
        layout: current.layout,
        title: current.title.trim(),
        body: current.body.trim(),
        prompt: current.prompt.trim(),
      });
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    const hm = line.match(slideHeader);
    if (hm) {
      flush();
      const num = (hm[1] || hm[4] || '').padStart(2, '0');
      const estado = hm[2] ? hm[2].trim().replace(/[^\w\s]/g, '').trim().toUpperCase() : `SLIDE ${num}`;
      let layout = (hm[3] || 'fullbleed').trim().toLowerCase();
      layout = layout.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      current = { num, estado, layout, title: '', body: '', prompt: '' };
      field = null;
      continue;
    }
    if (!current) continue;
    if (/^T[IÍ]TULO:\s*/i.test(line)) { field = 'title'; current.title = line.replace(/^T[IÍ]TULO:\s*/i, ''); continue; }
    if (/^CORPO:\s*/i.test(line)) { field = 'body'; current.body = line.replace(/^CORPO:\s*/i, ''); continue; }
    if (/^VISUAL:\s*/i.test(line)) { field = 'prompt'; current.prompt = line.replace(/^VISUAL:\s*/i, ''); continue; }
    if (line === '') {
      if (field === 'prompt') field = null;
      if (field === 'title') current.title += '\n';
      if (field === 'body') current.body += '\n';
      continue;
    }
    if (field === 'title') current.title += (current.title ? '\n' : '') + line;
    if (field === 'body') current.body += (current.body ? '\n' : '') + line;
    if (field === 'prompt') current.prompt += (current.prompt ? ' ' : '') + line;
  }
  flush();

  const finalTitle = temaMatch
    ? temaMatch[1].trim().slice(0, 80)
    : (slides[0]?.title?.replace(/\n/g, ' ') || fallbackData?.title || 'Carrossel Fonte Oculta');

  return {
    title: finalTitle,
    theme: temaMatch
      ? finalTitle.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-').slice(0, 48)
      : (fallbackData?.theme || finalTitle.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-').slice(0, 48)),
    format: pracaMatch?.[1]?.trim().slice(0, 20) || (fallbackData?.format || 'B'),
    caption: caption || (fallbackData?.caption || ''),
    notes: ctaMatch?.[1]?.trim() || (fallbackData?.notes || ''),
    revisor_score: revisorMatch?.[1] || '',
    slides,
    totalSlides: slides.length || fallbackData?.totalSlides || 10,
    imageQuality: fallbackData?.imageQuality || 'high',
    noImageSlidesCount: slides.filter(s => s.layout === 'text_only').length,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
let passed = 0; let failed = 0;
function assert(condition, msg) {
  if (condition) { console.log(`  ✅ ${msg}`); passed++; }
  else { console.error(`  ❌ FALHOU: ${msg}`); failed++; }
}

// ── Texto exatamente como o usuário colou ────────────────────────────────────
const CAROUSEL_USER = `[S1 — DISRUPÇÃO | layout: fullbleed]
TÍTULO: O SUCESSO NÃO É IMEDIATO
CORPO: O que você vê nas redes sociais é uma ilusão.
VISUAL: a crowded social media feed.

[S2 — DESCIDA | layout: dramático]
TÍTULO: E SE EU TE CONTAR...
CORPO: Você não estava errado.
VISUAL: uma pessoa olhando desanimada.

[S3 — NOMEAÇÃO | layout: dramático]
TÍTULO: O QUE NINGUÉM TE CONTA
CORPO: A maioria dos influenciadores...
VISUAL: uma linha do tempo.

[S4 — PROFUNDIDADE | layout: text_only]
TÍTULO: O MEIO TEM QUE ALINHAR
CORPO: Estudos mostram que o sucesso sustentável...
VISUAL: fundo escuro com textura.

[S5 — QUEDA FUNDA | layout: text_only]
TÍTULO: O QUE VOCÊ NÃO VÊ
CORPO: Você se vê buscando a validação...
VISUAL: fundo escuro mais pesado.

[S6 — ESPELHO | layout: text_only]
TÍTULO: JÁ SENTIU ISSO?
CORPO: Existe uma parte de você que sabe...
VISUAL: fundo neutro.

[S7 — ASCENSÃO | layout: dramático]
TÍTULO: O CAMINHO PARA O SUCESSO
CORPO: Há um jeito claro de construir...
VISUAL: uma estrada iluminada.

[S8 — CRISTALIZAÇÃO | layout: etéreo]
TÍTULO: A JORNADA IMPORTA
CORPO: Cada passo conta.
VISUAL: uma escada etérea.

[S9 — SETUP CTA | layout: dramático]
TÍTULO: DESPERTE O SEU POTENCIAL
CORPO: Existe um protocolo específico.
VISUAL: uma porta entreaberta.

[S10 — CTA FIXO | layout: fullbleed]
TÍTULO: COMENTE FONTE
CORPO: E eu te envio a Tecnologia Sonora.
VISUAL: portal dourado puro.`;

console.log('\n📋 Testes: Parser — Extração de noImageSlidesCount\n');

// TESTE 1: Texto com 3 slides text_only declarados explicitamente
console.log('Teste 1: Carrossel com 3 slides text_only declarados');
{
  const parsed = parseCarouselText(CAROUSEL_USER);
  assert(parsed.slides.length === 10, `Deve extrair 10 slides (extraiu ${parsed.slides.length})`);
  assert(parsed.noImageSlidesCount === 3, `noImageSlidesCount deve ser 3 (obteve ${parsed.noImageSlidesCount})`);
  const textOnlySlides = parsed.slides.filter(s => s.layout === 'text_only');
  assert(textOnlySlides.length === 3, `Deve ter 3 slides com layout=text_only (tem ${textOnlySlides.length})`);
  assert(textOnlySlides.map(s => s.num).join(',') === '04,05,06', `Slides text_only devem ser S4, S5, S6 (obteve ${textOnlySlides.map(s => s.num).join(',')})`);
}

// TESTE 2: Carrossel sem slides text_only
console.log('\nTeste 2: Carrossel sem nenhum slide text_only');
{
  const textSemFundo = `[S1 — GANCHO | layout: fullbleed]
TÍTULO: TESTE
CORPO: corpo
VISUAL: visual

[S2 — CORPO | layout: dramático]
TÍTULO: TESTE 2
CORPO: corpo 2
VISUAL: visual 2`;
  const parsed = parseCarouselText(textSemFundo);
  assert(parsed.noImageSlidesCount === 0, `noImageSlidesCount deve ser 0 para carrossel sem text_only (obteve ${parsed.noImageSlidesCount})`);
}

// TESTE 3: Carrossel com 5 slides text_only
console.log('\nTeste 3: Carrossel com 5 slides text_only');
{
  const text5 = Array.from({ length: 10 }, (_, i) => {
    const layout = i >= 5 ? 'text_only' : 'fullbleed';
    return `[S${i + 1} — ESTADO | layout: ${layout}]\nTÍTULO: Slide ${i + 1}\nCORPO: corpo\nVISUAL: visual`;
  }).join('\n\n');
  const parsed = parseCarouselText(text5);
  assert(parsed.noImageSlidesCount === 5, `noImageSlidesCount deve ser 5 (obteve ${parsed.noImageSlidesCount})`);
}

// TESTE 4: Layout com acento é normalizado para text_only
console.log('\nTeste 4: Layout com acento ("dramático") deve ser normalizado corretamente (não vira text_only)');
{
  const textAcento = `[S1 — GANCHO | layout: dramático]\nTÍTULO: T\nCORPO: C\nVISUAL: V`;
  const parsed = parseCarouselText(textAcento);
  assert(parsed.slides[0].layout === 'dramatico', `Layout dramático deve ser normalizado para 'dramatico' (obteve '${parsed.slides[0].layout}')`);
  assert(parsed.noImageSlidesCount === 0, `'dramático' não deve ser contado como text_only (obteve ${parsed.noImageSlidesCount})`);
}

console.log(`\n📊 Resultado: ${passed} passou / ${failed} falhou\n`);
process.exit(failed > 0 ? 1 : 0);
