/**
 * Parses the raw AI generated text for a carousel into a structured payload.
 * Used by the Criador component to send data to the backend generation pipeline.
 * 
 * @param {string} text Raw markdown/text from the AI
 * @returns {object} Parsed carousel payload
 */
export function parseCarouselText(text, fallbackData = null) {
  const t = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const temaMatch = t.match(/TEMA:\s*(.+)/i);
  const pracaMatch = t.match(/PRA[ÇC]A:\s*(.+)/i);
  const bigIdea = t.match(/BIG IDEA:\s*(.+)/i);
  const revisorMatch = t.match(/TOTAL:\s*([\d]+\/15)/i);
  const captionMatch = t.match(/CAPTION[^:\n]*:\s*\n([\s\S]+?)(?=\n━|\nCTA TRIBAL|\nREVISÃO AUTÔNOMA|\n---|$)/i);
  const ctaMatch = t.match(/CTA TRIBAL:\s*"([^"\n]+)"/i);
  
  // Se houver fallbackData, usamos o título original do formulário. Caso contrário, tenta do Match, senão fallback final.
  const title = temaMatch 
    ? temaMatch[1].trim().slice(0, 80) 
    : (fallbackData?.title || 'Carrossel Bella Dalcin');
    
  let caption = (captionMatch?.[1] || '').trim();

  const slides = [];
  const lines = t.split('\n');
  const slideHeader = /^(?:\[S(?:LIDE)?\s*(\d+)\s*[—–\-:]?\s*([^\]|]*?)(?:\s*\|\s*layout:\s*([^\]\s|]+))?\s*\]|S(?:LIDE)?\s*(\d+)\b\s*[:—–\-]?\s*(.*))/i;
  let current = null;
  let field = null;

  const cleanMarkdown = (value = '') => value
    .trim()
    .replace(/^#{1,6}\s*/, '')
    .replace(/\*\*|__|`/g, '')
    .replace(/^[-*+]\s+/, '')
    .trim();

  const flush = () => {
    if (current && (current.title || current.body)) {
      slides.push({
        num: current.num,
        estado: current.estado,
        layout: current.layout,
        title: current.title.trim(),
        body: current.body.trim(),
        prompt: current.prompt.trim(),
        scene: current.scene || null,
        visual_plan: current.visualPlan || null,
      });
    }
  };

  for (const raw of lines) {
    const line = cleanMarkdown(raw);
    const hm = line.match(slideHeader);
    if (hm) {
      flush();
      const num = (hm[1] || hm[4] || '').padStart(2, '0');
      const rawState = hm[2] || hm[5] || '';
      const estado = rawState ? rawState.replace(/\|\s*layout:.*$/i, '').trim().replace(/[^\wÀ-ÿ\s]/g, '').trim().toUpperCase() : `SLIDE ${num}`;
      const inlineLayout = line.match(/\|\s*layout:\s*([^\]\s|]+)/i)?.[1];
      let layout = (hm[3] || inlineLayout || fallbackData?.preset || 'fullbleed').trim().toLowerCase();
      // Remove acentos para compatibilidade com o backend (ex: "dramático" -> "dramatico")
      layout = layout.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const validLayouts = ['fullbleed', 'dramatico', 'etereo', 'card', 'text_only', 'brands_cover', 'brands_split', 'brands_editorial', 'brands_outro', 'bella_editorial_cover', 'bella_editorial_paper', 'bella_editorial_card', 'bella_editorial_sunlight', 'bella_editorial_dark', ...Array.from({ length: 10 }, (_, i) => `bella_sequence_${String(i + 1).padStart(2, '0')}`)];
      if (!validLayouts.includes(layout)) {
        layout = 'fullbleed';
      }
      current = {
        num,
        estado,
        layout,
        title: '', body: '', prompt: '', scene: null, visualPlan: null,
      };
      field = null;
      continue;
    }
    if (!current) continue;
    if (/^T[IÍ]TULO:\s*/i.test(line)) {
      field = 'title';
      current.title = cleanMarkdown(line.replace(/^T[IÍ]TULO:\s*/i, ''));
      continue;
    }
    if (/^(?:CORPO|TEXTO|COPY):\s*/i.test(line)) {
      field = 'body';
      current.body = cleanMarkdown(line.replace(/^(?:CORPO|TEXTO|COPY):\s*/i, ''));
      continue;
    }
    if (/^(?:VISUAL|IMAGEM|PROMPT(?:\s+VISUAL)?):\s*/i.test(line)) {
      field = 'prompt';
      current.prompt = cleanMarkdown(line.replace(/^(?:VISUAL|IMAGEM|PROMPT(?:\s+VISUAL)?):\s*/i, ''));
      continue;
    }
    if (/^CENA:\s*/i.test(line)) {
      field = null;
      const scene = cleanMarkdown(line.replace(/^CENA:\s*/i, '')).toUpperCase();
      current.scene = /^[A-D]$/.test(scene) ? scene : null;
      continue;
    }
    if (/^(?:DIRE[ÇC][ÃA]O_JSON|DESIGN_JSON):\s*/i.test(line)) {
      field = null;
      const rawJson = raw.trim().replace(/^(?:DIRE[ÇC][ÃA]O_JSON|DESIGN_JSON):\s*/i, '');
      try { current.visualPlan = JSON.parse(rawJson); } catch { current.visualPlan = null; }
      continue;
    }
    if (line === '') {
      if (field === 'prompt') field = null;
      // Permitir quebras de linha dentro do título e corpo ao invés de resetar/pular
      if (field === 'title') current.title += '\n';
      if (field === 'body') current.body += '\n';
      continue;
    }
    if (field === 'title') current.title += (current.title ? '\n' : '') + cleanMarkdown(line);
    if (field === 'body') current.body += (current.body ? '\n' : '') + cleanMarkdown(line);
    if (field === 'prompt') current.prompt += (current.prompt ? ' ' : '') + cleanMarkdown(line);
  }
  flush();

  const finalTitle = temaMatch 
    ? temaMatch[1].trim().slice(0, 80) 
    : (fallbackData?.title || slides[0]?.title?.replace(/\n/g, ' ') || 'Carrossel Bella Dalcin');

  if (!caption) {
    if (bigIdea?.[1]) {
      caption = bigIdea[1].trim();
    } else if (slides.length > 0) {
      // Fallback: Concatena o corpo dos slides principais para gerar uma legenda rica em vez de uma única frase curta
      caption = slides
        .map(s => s.body)
        .filter(Boolean)
        .join('\n\n');
    }
  }

  const rawTheme = temaMatch
    ? temaMatch[1].trim()
    : (fallbackData?.theme || fallbackData?.title || finalTitle);

  const cleanTheme = rawTheme.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/g, '').replace(/\s+/g, '-').slice(0, 48);

  const preset = fallbackData?.preset || (
    t.includes('bella_verde_musgo') ? 'bella_verde_musgo' :
    t.includes('bella_ambar_sagrado') ? 'bella_ambar_sagrado' :
    t.includes('bella') || t.includes('TAFA') || t.includes('T.A.F.A') || t.includes('isabella') ? 'bella_organico_terracota' :
    t.includes('brands_decoded_autoral') || t.includes('BRANDS_AUTORAL') ? 'brands_decoded_autoral' :
    t.includes('brands_decoded') || t.includes('BRANDS_PRINCIPAL') || t.includes('BRANDS DECODED') ? 'brands_decoded_principal' :
    'bella_organico_terracota'
  );

  return {
    title: finalTitle,
    theme: cleanTheme || 'novo-carrossel',
    format: pracaMatch?.[1]?.trim().slice(0, 20) || (fallbackData?.format || (preset.includes('autoral') ? 'BRANDS_AUTORAL' : preset.includes('brands') ? 'BRANDS_PRINCIPAL' : 'TAFA')),
    preset,
    caption: caption || (fallbackData?.caption || ''),
    notes: ctaMatch?.[1]?.trim() || (fallbackData?.notes || ''),
    revisor_score: revisorMatch?.[1] || '',
    slides,
    totalSlides: slides.length || fallbackData?.totalSlides || 10,
    imageQuality: fallbackData?.imageQuality || 'high',
    // Contagem de slides com fundo preto (text_only) extraída diretamente da estrutura gerada pela IA
    noImageSlidesCount: slides.filter(s => s.layout === 'text_only').length,
  };
}
