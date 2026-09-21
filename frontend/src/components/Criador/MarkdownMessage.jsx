import React, { useState } from 'react';

const INLINE_PATTERN = /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\n]+\*|https?:\/\/[^\s]+)/g;

function InlineContent({ text }) {
  return text.split(INLINE_PATTERN).filter(Boolean).map((part, index) => {
    if (/^https?:\/\//.test(part)) {
      return <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
    }
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function renderProseLines(rawLines) {
  return rawLines.map((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return <div className="creator-markdown-space" key={index} aria-hidden="true" />;
    if (/^(---+|___+|\*\*\*+)$/.test(line)) return <hr key={index} />;

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const Tag = heading[1].length <= 2 ? 'h3' : 'h4';
      return <Tag key={index}><InlineContent text={heading[2]} /></Tag>;
    }

    const bullet = line.match(/^[-*+]\s+(.+)$/);
    if (bullet) return <div className="creator-markdown-list-item" key={index}><span>•</span><p><InlineContent text={bullet[1]} /></p></div>;

    const numbered = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (numbered) return <div className="creator-markdown-list-item" key={index}><span>{numbered[1]}.</span><p><InlineContent text={numbered[2]} /></p></div>;

    const quote = line.match(/^>\s?(.+)$/);
    if (quote) return <blockquote key={index}><InlineContent text={quote[1]} /></blockquote>;

    return <p key={index}><InlineContent text={line} /></p>;
  });
}

// Mesmo formato usado pelo parser real de geração (frontend/src/utils/carouselParser.js),
// reimplementado aqui só para leitura/exibição — não altera o texto original da mensagem
// (o botão "Copiar Roteiro" e a geração de arte continuam usando o conteúdo bruto).
const SLIDE_HEADER = /^\[S(?:LIDE)?\s*(\d+)\s*[—–-]?\s*([^\]|]*?)(?:\s*\|\s*layout:\s*([^\]\s|]+))?\s*\]$/i;
const FIELD_LABELS = [
  ['title', /^T[IÍ]TULO:\s*(.*)$/i],
  ['body', /^(?:CORPO|TEXTO|COPY):\s*(.*)$/i],
  ['scene', /^CENA:\s*(.*)$/i],
  ['respiro', /^RESPIRO:\s*(.*)$/i],
  ['visual', /^(?:VISUAL|IMAGEM|PROMPT(?:\s+VISUAL)?):\s*(.*)$/i],
  // DIREÇÃO_JSON é reconhecido só para NÃO aparecer como texto solto — o dado
  // técnico não é útil visualmente; a versão legível já está em VISUAL.
  ['direction', /^(?:DIRE[ÇC][ÃA]O_JSON|DESIGN_JSON):\s*(.*)$/i],
];

function parseSlideSegments(rawLines) {
  const segments = [];
  let textBuffer = [];
  let current = null;
  let field = null;

  const flushText = () => {
    if (textBuffer.length) {
      segments.push({ type: 'text', lines: textBuffer });
      textBuffer = [];
    }
  };
  const flushSlide = () => {
    if (current) {
      segments.push(current);
      current = null;
    }
  };

  for (const raw of rawLines) {
    const line = raw.trim();

    // Bloco de código cercado por ``` — apenas ignora as linhas de cerca;
    // o conteúdo interno segue sendo interpretado normalmente (é markdown
    // do próprio roteiro, não código de verdade).
    if (/^```/.test(line)) continue;

    const header = line.match(SLIDE_HEADER);
    if (header) {
      flushSlide();
      flushText();
      current = {
        type: 'slide',
        num: header[1],
        estado: (header[2] || '').trim(),
        layout: (header[3] || '').trim(),
        title: '', body: '', scene: '', respiro: '', visual: '', direction: '',
      };
      field = null;
      continue;
    }

    if (current) {
      const match = FIELD_LABELS.find(([, re]) => re.test(line));
      if (match) {
        const [key, re] = match;
        field = key;
        current[key] = (line.match(re)?.[1] || '').trim();
        continue;
      }
      if (line === '') {
        if (field === 'title' || field === 'body' || field === 'visual') current[field] += '\n';
        continue;
      }
      if (field === 'title' || field === 'body' || field === 'visual') {
        current[field] = (current[field] ? current[field] + '\n' : '') + line;
        continue;
      }
      // Linha solta dentro do bloco sem campo ativo (ex: continuação perdida) — ignora.
      continue;
    }

    textBuffer.push(raw);
  }
  flushSlide();
  flushText();
  return segments;
}

function SlideCard({ slide }) {
  const [open, setOpen] = useState(false);
  const hasDetails = Boolean(slide.visual || slide.scene || slide.respiro || slide.layout);

  return (
    <article className="creator-slide-card">
      <header className="creator-slide-card__header">
        <span className="creator-slide-card__badge">Slide {slide.num}</span>
        {slide.estado && <span className="creator-slide-card__estado">{slide.estado}</span>}
      </header>
      {slide.title && <h4 className="creator-slide-card__title"><InlineContent text={slide.title.replace(/\n+/g, ' ')} /></h4>}
      {slide.body && slide.body.trim().split('\n').filter(Boolean).map((line, i) => (
        <p className="creator-slide-card__body" key={i}><InlineContent text={line} /></p>
      ))}
      {hasDetails && (
        <details className="creator-slide-card__details" open={open} onToggle={(e) => setOpen(e.target.open)}>
          <summary>{open ? 'Ocultar' : 'Ver'} direção visual</summary>
          <div className="creator-slide-card__meta">
            {slide.layout && <span><b>Layout</b>{slide.layout}</span>}
            {slide.scene && <span><b>Cena</b>{slide.scene}</span>}
            {slide.respiro && <span><b>Respiro</b>{slide.respiro}</span>}
          </div>
          {slide.visual && <p className="creator-slide-card__visual">{slide.visual}</p>}
        </details>
      )}
    </article>
  );
}

export default function MarkdownMessage({ content }) {
  const lines = String(content || '').replace(/\r\n/g, '\n').split('\n');
  const segments = parseSlideSegments(lines);
  const hasSlides = segments.some(segment => segment.type === 'slide');

  if (!hasSlides) {
    return <div className="creator-markdown">{renderProseLines(lines)}</div>;
  }

  return (
    <div className="creator-markdown creator-markdown--roteiro">
      {segments.map((segment, index) => (
        segment.type === 'slide'
          ? <SlideCard key={`slide-${segment.num}-${index}`} slide={segment} />
          : <React.Fragment key={`text-${index}`}>{renderProseLines(segment.lines)}</React.Fragment>
      ))}
    </div>
  );
}
