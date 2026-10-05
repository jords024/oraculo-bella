import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

const INLINE_PATTERN = /(\[\[[^\]\n]+\]\]|\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\n]+\*|https?:\/\/[^\s]+)/g;

function InlineContent({ text }) {
  return text.split(INLINE_PATTERN).filter(Boolean).map((part, index) => {
    if (/^https?:\/\//.test(part)) {
      return <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
    }
    if (part.startsWith('[[') && part.endsWith(']]')) {
      return <strong key={index} className="creator-concept">{part.slice(2, -2)}</strong>;
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

const QUICK_ASKS = [
  ['Mais ácida', 'deixa mais ácida, direta e sem suavizar'],
  ['Mais curta', 'deixa mais curta, cortando o que sobra'],
  ['Mais simples', 'deixa mais simples e humana, como conversa de mesa'],
  ['Mais emocional', 'deixa mais emocional e íntima'],
  ['Mais concreta', 'troca o abstrato por uma cena concreta'],
];

function AutoTextarea({ value, onChange, onSelectRange, onKeyDown, innerRef, className, placeholder, label }) {
  const localRef = useRef(null);
  const ref = innerRef || localRef;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value, ref]);
  const report = event => {
    const el = event.currentTarget;
    onSelectRange?.(el.selectionEnd > el.selectionStart ? { start: el.selectionStart, end: el.selectionEnd } : null);
  };
  return (
    <textarea
      ref={ref}
      rows={1}
      className={className}
      value={value}
      placeholder={placeholder}
      aria-label={label}
      onChange={event => onChange(event.target.value)}
      onSelect={report}
      onKeyUp={report}
      onMouseUp={report}
      onKeyDown={onKeyDown}
    />
  );
}

function SlideCard({ slide, editable, onSave, onRewrite }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '' });
  const [selection, setSelection] = useState(null); // { field, start, end }
  const [instruction, setInstruction] = useState('');
  const [ai, setAi] = useState({ status: 'idle', options: [], scope: 'lamina', error: '' });
  const [previous, setPrevious] = useState(null);
  const titleRef = useRef(null);
  const bodyRef = useRef(null);
  const focusRef = useRef('title');
  const hasDetails = Boolean(slide.visual || slide.scene || slide.respiro || slide.layout);
  const cleanTitle = String(slide.title || '').trim();
  const cleanBody = String(slide.body || '').trim();

  const startEdit = field => {
    if (!editable || editing) return;
    focusRef.current = field;
    setDraft({ title: cleanTitle, body: cleanBody });
    setSelection(null); setInstruction(''); setPrevious(null);
    setAi({ status: 'idle', options: [], scope: 'lamina', error: '' });
    setEditing(true);
  };
  useEffect(() => {
    if (!editing) return;
    const el = focusRef.current === 'body' ? bodyRef.current : titleRef.current;
    if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
  }, [editing]);

  const cancel = () => { setEditing(false); setAi({ status: 'idle', options: [], scope: 'lamina', error: '' }); };
  const dirty = draft.title.trim() !== cleanTitle || draft.body.trim() !== cleanBody;
  const save = () => {
    if (dirty && onSave) onSave(slide.num, { title: draft.title.trim(), body: draft.body.trim() });
    setEditing(false);
    setAi({ status: 'idle', options: [], scope: 'lamina', error: '' });
  };
  const onKeyDown = event => {
    if (event.key === 'Escape') { event.preventDefault(); cancel(); }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); save(); }
  };

  const selectedText = selection ? draft[selection.field].slice(selection.start, selection.end) : '';

  const ask = async (text) => {
    const wanted = String(text ?? instruction).trim();
    if (!wanted || ai.status === 'loading' || !onRewrite) return;
    setAi({ status: 'loading', options: [], scope: selection ? 'trecho' : 'lamina', error: '' });
    const asked = selection ? { ...selection, text: selectedText } : null;
    const result = await onRewrite({ instruction: wanted, title: draft.title, body: draft.body, selection: asked?.text || '', slideNum: slide.num, estado: slide.estado });
    if (!result.ok) { setAi({ status: 'error', options: [], scope: 'lamina', error: result.error }); return; }
    setAi({ status: 'done', options: result.options, scope: result.scope, error: '', asked });
  };

  const useOption = option => {
    setPrevious(draft);
    if (ai.scope === 'trecho' && ai.asked) {
      const { field, start, end, text } = ai.asked;
      const current = draft[field];
      const exact = current.slice(start, end) === text;
      const at = exact ? start : current.indexOf(text);
      const next = at >= 0 ? current.slice(0, at) + option.texto + current.slice(at + text.length) : `${current} ${option.texto}`;
      setDraft({ ...draft, [field]: next });
    } else {
      setDraft({ title: option.title ?? draft.title, body: option.body ?? draft.body });
    }
    setSelection(null);
    setAi({ status: 'idle', options: [], scope: 'lamina', error: '' });
  };

  if (editing) {
    return (
      <article className="creator-slide-card is-editing">
        <header className="creator-slide-card__header">
          <span className="creator-slide-card__badge">Slide {slide.num}</span>
          {slide.estado && <span className="creator-slide-card__estado">{slide.estado}</span>}
          <span className="creator-slide-card__spacer" />
          <button type="button" className="csc-btn" onClick={cancel}>Cancelar</button>
          <button type="button" className="csc-btn csc-btn--primary" onClick={save} disabled={!dirty} title="Ctrl+Enter">Salvar</button>
        </header>

        <label className="csc-label">Título</label>
        <AutoTextarea
          innerRef={titleRef}
          className="csc-field csc-field--title"
          value={draft.title}
          label={`Título do slide ${slide.num}`}
          onChange={value => setDraft(current => ({ ...current, title: value }))}
          onSelectRange={range => setSelection(range ? { field: 'title', ...range } : current => (current?.field === 'title' ? null : current))}
          onKeyDown={onKeyDown}
        />
        <label className="csc-label">Texto</label>
        <AutoTextarea
          innerRef={bodyRef}
          className="csc-field csc-field--body"
          value={draft.body}
          label={`Texto do slide ${slide.num}`}
          onChange={value => setDraft(current => ({ ...current, body: value }))}
          onSelectRange={range => setSelection(range ? { field: 'body', ...range } : current => (current?.field === 'body' ? null : current))}
          onKeyDown={onKeyDown}
        />

        <section className="csc-ai" aria-label="Ajustar com o Oráculo">
          <div className="csc-ai__head">
            <strong>✨ Ajustar com o Oráculo</strong>
            <span>{selection && selectedText ? <>Só o trecho: <em>“{selectedText.length > 60 ? `${selectedText.slice(0, 60)}…` : selectedText}”</em></> : 'Vale para o slide inteiro. Selecione uma frase para ajustar só ela.'}</span>
          </div>
          <div className="csc-ai__chips">
            {QUICK_ASKS.map(([label, text]) => (
              <button type="button" key={label} className="csc-chip" onClick={() => ask(text)} disabled={ai.status === 'loading'}>{label}</button>
            ))}
          </div>
          <div className="csc-ai__row">
            <input
              type="text"
              value={instruction}
              placeholder="Ou diga o que quer: “deixa essa frase mais ácida”"
              onChange={event => setInstruction(event.target.value)}
              onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); ask(); } if (event.key === 'Escape') cancel(); }}
              aria-label="Pedido para o Oráculo"
            />
            <button type="button" className="csc-btn csc-btn--primary" onClick={() => ask()} disabled={!instruction.trim() || ai.status === 'loading'}>{ai.status === 'loading' ? 'Pensando…' : 'Pedir'}</button>
          </div>
          {ai.status === 'loading' && <div className="csc-ai__loading" role="status" aria-live="polite"><i /><i /></div>}
          {ai.status === 'error' && <div className="csc-ai__error" role="alert">{ai.error}</div>}
          {ai.status === 'done' && (
            <div className="csc-ai__options">
              {ai.options.map((option, index) => (
                <div key={index} className="csc-option">
                  <span className="csc-option__tag">Opção {index + 1}</span>
                  {ai.scope === 'trecho'
                    ? <p>{option.texto}</p>
                    : <>{option.title && <p className="csc-option__title">{option.title}</p>}{option.body && <p>{option.body}</p>}</>}
                  <button type="button" className="csc-btn csc-btn--primary" onClick={() => useOption(option)}>Usar esta</button>
                </div>
              ))}
              <button type="button" className="csc-link" onClick={() => ask(instruction || 'reescreva de outro jeito')}>Gerar outras opções</button>
            </div>
          )}
          {previous && ai.status !== 'loading' && (
            <button type="button" className="csc-link" onClick={() => { setDraft(previous); setPrevious(null); }}>↶ Desfazer o último ajuste</button>
          )}
        </section>
      </article>
    );
  }

  return (
    <article className={`creator-slide-card${editable ? ' is-editable' : ''}`}>
      <header className="creator-slide-card__header">
        <span className="creator-slide-card__badge">Slide {slide.num}</span>
        {slide.estado && <span className="creator-slide-card__estado">{slide.estado}</span>}
        {editable && <><span className="creator-slide-card__spacer" /><button type="button" className="csc-edit" onClick={() => startEdit('title')} title="Editar este slide">✎ Editar</button></>}
      </header>
      {slide.title && (
        <h4 className="creator-slide-card__title" onClick={() => startEdit('title')} title={editable ? 'Clique para editar' : undefined}>
          <InlineContent text={slide.title.replace(/\n+/g, ' ')} />
        </h4>
      )}
      {slide.body && slide.body.trim().split('\n').filter(Boolean).map((line, i) => (
        <p className="creator-slide-card__body" key={i} onClick={() => startEdit('body')} title={editable ? 'Clique para editar' : undefined}><InlineContent text={line} /></p>
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

// `editable` liga a edição por clique nos cartões; `onSaveSlide(num, {title, body})` devolve o texto editado ao roteiro
// e `onRewrite(pedido)` pede ao Oráculo para reescrever um trecho ou o slide (devolve {ok, scope, options}).
export default function MarkdownMessage({ content, editable = false, onSaveSlide, onRewrite }) {
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
          ? <SlideCard key={`slide-${segment.num}-${index}`} slide={segment} editable={editable} onSave={onSaveSlide} onRewrite={onRewrite} />
          : <React.Fragment key={`text-${index}`}>{renderProseLines(segment.lines)}</React.Fragment>
      ))}
    </div>
  );
}
