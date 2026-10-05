// Edição do roteiro gerado pelo Criador: troca o TÍTULO e o CORPO de uma lâmina dentro do texto bruto da mensagem,
// sem tocar em layout, cena, direção visual, legenda nem nas outras lâminas. O texto bruto continua sendo a fonte
// da verdade (é ele que "Copiar Roteiro" e "Gerar Arte" leem), então a edição precisa voltar para ele.

const HEADER = /^\s*\[S(?:LIDE)?\s*0*(\d+)\b[^\]]*\]\s*$/i;
const SECTION_END = /^\s*(?:#{1,3}\s|━|CAPTION\b|CTA TRIBAL\b|REVISÃO\b|SCORECARD\b)/i;
const LABELS = {
  title: /^\s*T[IÍ]TULO:\s*/i,
  body: /^\s*(?:CORPO|TEXTO|COPY):\s*/i,
  other: /^\s*(?:CENA|RESPIRO|VISUAL|IMAGEM|PROMPT(?:\s+VISUAL)?|DIRE[ÇC][ÃA]O_JSON|DESIGN_JSON):/i,
};

const fieldOf = line => (LABELS.title.test(line) ? 'title' : LABELS.body.test(line) ? 'body' : LABELS.other.test(line) ? 'other' : null);
const valueLines = (value, label) => {
  const parts = String(value ?? '').replace(/\r/g, '').replace(/\s+$/g, '').split('\n').map(line => line.replace(/\s+$/g, ''));
  return parts.map((line, index) => (index === 0 ? `${label}: ${line}` : line));
};

/**
 * @param {string} content texto bruto da mensagem do Oráculo
 * @param {string|number} num número da lâmina (ex.: "04" ou 4)
 * @param {{title?: string, body?: string}} fields novos valores (só os informados são trocados)
 * @returns {string|null} novo texto, ou null se a lâmina não foi encontrada
 */
export function replaceSlideFields(content, num, fields) {
  const lines = String(content || '').replace(/\r\n/g, '\n').split('\n');
  const wanted = Number(num);
  const start = lines.findIndex(line => { const m = line.match(HEADER); return m && Number(m[1]) === wanted; });
  if (start < 0) return null;

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (HEADER.test(lines[i]) || SECTION_END.test(lines[i])) { end = i; break; }
  }

  // Divide o bloco em regiões: cada região começa numa linha de campo e vai até o próximo campo.
  const regions = [];
  let current = null;
  for (let i = start + 1; i < end; i += 1) {
    const kind = fieldOf(lines[i]);
    if (kind) { current = { kind, from: i, to: i + 1 }; regions.push(current); }
    else if (current) current.to = i + 1;
    else regions.push((current = { kind: 'pre', from: i, to: i + 1 }));
  }

  const out = lines.slice(0, start + 1);
  const replaced = new Set();
  const emit = (kind, label) => {
    if (fields[kind] === undefined) return false;
    out.push(...valueLines(fields[kind], label));
    replaced.add(kind);
    return true;
  };

  regions.forEach(region => {
    const chunk = lines.slice(region.from, region.to);
    if ((region.kind === 'title' || region.kind === 'body') && fields[region.kind] !== undefined) {
      const blanks = [];
      for (let i = chunk.length - 1; i > 0 && !chunk[i].trim(); i -= 1) blanks.push('');
      emit(region.kind, region.kind === 'title' ? 'TÍTULO' : 'CORPO');
      out.push(...blanks);
    } else {
      out.push(...chunk);
    }
    if (region.kind === 'title' && !regions.some(r => r.kind === 'body') && !replaced.has('body') && fields.body !== undefined) emit('body', 'CORPO');
  });

  // Lâmina sem rótulo de título/corpo: acrescenta logo depois do cabeçalho.
  if (fields.title !== undefined && !replaced.has('title')) out.splice(start + 1, 0, ...valueLines(fields.title, 'TÍTULO'));
  if (fields.body !== undefined && !replaced.has('body')) {
    const at = out.findIndex((line, i) => i > start && LABELS.title.test(line));
    let insertAt = start + 1;
    if (at >= 0) { insertAt = at + 1; while (insertAt < out.length && !fieldOf(out[insertAt]) && out[insertAt].trim()) insertAt += 1; }
    out.splice(insertAt, 0, ...valueLines(fields.body, 'CORPO'));
  }

  return [...out, ...lines.slice(end)].join('\n');
}
