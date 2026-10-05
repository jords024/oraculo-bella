import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const looksLikeInput = value => /pinterest\.|pin\.it/i.test(value) || /^@?[A-Za-z0-9_.-]{3,60}$/.test(value.trim());

function Thumb({ src }) {
  return src
    ? <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" />
    : <i className="bp-thumb-empty" aria-hidden="true">▧</i>;
}

// Conectar o Pinterest em três movimentos: colar o link → conferir o que foi encontrado → adicionar.
// Sem senha: só pastas públicas, lidas pelo endereço público de cada pasta.
export default function PinterestBoardsPanel({ boards, selectedIds, onToggle, onPreview, onAdd, onSync, onDisconnect, onRemove, onClose }) {
  const [input, setInput] = useState('');
  const [state, setState] = useState({ status: 'idle' }); // idle | loading | error | found
  const [picked, setPicked] = useState([]);
  const [adding, setAdding] = useState(false);
  const [busyUser, setBusyUser] = useState('');
  const [notice, setNotice] = useState('');
  const requestRef = useRef(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const search = async value => {
    const text = String(value ?? input).trim();
    if (!text) return;
    const ticket = ++requestRef.current;
    setNotice('');
    setState({ status: 'loading' });
    const result = await onPreview(text);
    if (ticket !== requestRef.current) return; // uma busca mais nova já começou
    if (!result.ok) { setState({ status: 'error', message: result.error }); return; }
    setPicked(result.boards.filter(board => !board.connected).map(board => board.id));
    setState({ status: 'found', ...result });
  };

  // Busca sozinha quando a pessoa para de digitar (ou cola) algo que parece um link ou usuário.
  useEffect(() => {
    if (!looksLikeInput(input)) { if (!input.trim()) setState({ status: 'idle' }); return undefined; }
    const timer = setTimeout(() => search(input), 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { setInput(text.trim()); inputRef.current?.focus(); }
    } catch { inputRef.current?.focus(); setNotice('Seu navegador não deixou colar sozinho. Clique no campo e use Ctrl+V.'); }
  };

  const add = async () => {
    if (state.status !== 'found' || !picked.length || adding) return;
    setAdding(true);
    const items = state.boards.filter(board => picked.includes(board.id)).map(board => ({ user: board.user, slug: board.url.replace(/\/$/, '').split('/').pop() }));
    const result = await onAdd(items);
    setAdding(false);
    if (!result.ok) { setState({ status: 'error', message: result.error }); return; }
    setNotice(`${result.added.length} pasta${result.added.length === 1 ? '' : 's'} conectada${result.added.length === 1 ? '' : 's'} e já marcada${result.added.length === 1 ? '' : 's'} para usar.`);
    setInput('');
    setState({ status: 'idle' });
  };

  const sync = async user => {
    setBusyUser(user);
    const result = await onSync(user);
    setBusyUser('');
    setNotice(result.ok ? `@${user} sincronizado: ${result.added.length} pasta(s) nova(s)${result.removed ? `, ${result.removed} removida(s)` : ''}.` : result.error);
  };

  const groups = useMemo(() => {
    const map = new Map();
    boards.forEach(board => { const key = board.user || 'perfil'; map.set(key, [...(map.get(key) || []), board]); });
    return [...map.entries()];
  }, [boards]);

  // Portal: o painel fica por cima de toda a tela, sem herdar a ordem de camadas da barra onde foi aberto.
  return createPortal(
    <div className="bp-backdrop" role="dialog" aria-modal="true" aria-label="Minhas pastas do Pinterest" onClick={onClose}>
      <div className="bp-panel" onClick={event => event.stopPropagation()}>
        <header className="bp-header">
          <div>
            <h2>Minhas pastas do Pinterest</h2>
            <p>Use a sua própria curadoria como fonte das imagens. Sem senha: o Oráculo só lê pastas públicas.</p>
          </div>
          <button type="button" className="bp-close" onClick={onClose} aria-label="Fechar">×</button>
        </header>

        <div className="bp-body">
          <section className="bp-connect" aria-label="Conectar perfil ou pasta">
            <label htmlFor="bp-input" className="bp-step"><b>1</b> Cole o link do seu perfil ou de uma pasta</label>
            <div className="bp-input-row">
              <span className="bp-input-icon" aria-hidden="true">⌕</span>
              <input
                id="bp-input"
                ref={inputRef}
                type="text"
                value={input}
                placeholder="pinterest.com/seu-usuario  ·  ou o link de uma pasta"
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => { if (event.key === 'Enter') search(); }}
                autoComplete="off"
                spellCheck="false"
              />
              <button type="button" className="bp-ghost" onClick={pasteFromClipboard} title="Colar o que você copiou">Colar</button>
              <button type="button" className="bp-primary" onClick={() => search()} disabled={!input.trim() || state.status === 'loading'}>
                {state.status === 'loading' ? 'Buscando…' : 'Buscar'}
              </button>
            </div>
            <div className="bp-helpers">
              <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer">Abrir o Pinterest ↗</a>
              <details>
                <summary>Como achar o meu link?</summary>
                <ol>
                  <li>Abra o Pinterest e entre na sua conta.</li>
                  <li>Clique na sua foto (canto superior) para abrir o seu perfil.</li>
                  <li>Copie o endereço da barra do navegador (<em>pinterest.com/seu-usuario</em>) e cole aqui. Para uma pasta específica, abra a pasta e copie o endereço dela.</li>
                </ol>
                <p>As pastas precisam estar <strong>públicas</strong>: abra a pasta → editar → desmarque “Manter esta pasta secreta”. O Oráculo lê as 25 imagens mais recentes de cada pasta.</p>
              </details>
            </div>

            {state.status === 'loading' && (
              <div className="bp-skeletons" aria-live="polite" aria-label="Buscando pastas">
                {[0, 1, 2, 3].map(index => <div key={index} className="bp-skeleton" />)}
              </div>
            )}

            {state.status === 'error' && (
              <div className="bp-alert" role="alert">
                <strong>Não deu certo</strong>
                <span>{state.message}</span>
              </div>
            )}

            {state.status === 'found' && (
              <div className="bp-found">
                <div className="bp-found-head">
                  <div>
                    <strong>{state.kind === 'profile' ? `Perfil @${state.user}` : 'Pasta encontrada'}</strong>
                    <span>{state.boards.length} pasta{state.boards.length === 1 ? '' : 's'} pública{state.boards.length === 1 ? '' : 's'}{state.skipped ? ` · ${state.skipped} privada(s) ou vazia(s) ignorada(s)` : ''}</span>
                  </div>
                  {state.boards.length > 1 && (
                    <button type="button" className="bp-link" onClick={() => setPicked(picked.length === state.boards.filter(board => !board.connected).length ? [] : state.boards.filter(board => !board.connected).map(board => board.id))}>
                      {picked.length ? 'Desmarcar todas' : 'Marcar todas'}
                    </button>
                  )}
                </div>
                <div className="bp-grid">
                  {state.boards.map(board => {
                    const on = picked.includes(board.id);
                    return (
                      <button
                        type="button"
                        key={board.id}
                        className={`bp-card${on ? ' is-on' : ''}${board.connected ? ' is-connected' : ''}`}
                        onClick={() => !board.connected && setPicked(current => current.includes(board.id) ? current.filter(id => id !== board.id) : [...current, board.id])}
                        disabled={board.connected}
                        aria-pressed={on}
                      >
                        <Thumb src={board.thumb} />
                        <span className="bp-card-check" aria-hidden="true">{board.connected ? '✓ conectada' : on ? '✓' : ''}</span>
                        <span className="bp-card-info"><strong title={board.name}>{board.name}</strong><small>{board.count} imagens</small></span>
                      </button>
                    );
                  })}
                </div>
                <div className="bp-found-actions">
                  <button type="button" className="bp-ghost" onClick={() => { setState({ status: 'idle' }); setInput(''); }}>Cancelar</button>
                  <button type="button" className="bp-primary" onClick={add} disabled={!picked.length || adding}>
                    {adding ? 'Adicionando…' : picked.length ? `Adicionar ${picked.length} pasta${picked.length === 1 ? '' : 's'}` : 'Escolha ao menos uma'}
                  </button>
                </div>
              </div>
            )}
          </section>

          {notice && <div className="bp-notice" role="status">{notice}</div>}

          <section className="bp-library" aria-label="Pastas conectadas">
            <div className="bp-step"><b>2</b> Escolha as pastas deste carrossel</div>
            {groups.length === 0 ? (
              <div className="bp-empty">
                <span aria-hidden="true">📌</span>
                <strong>Nenhuma pasta conectada ainda</strong>
                <p>Cole o link do seu perfil acima. Em segundos as suas pastas aparecem aqui, com miniatura, para você marcar.</p>
              </div>
            ) : groups.map(([user, items]) => (
              <div key={user} className="bp-profile">
                <div className="bp-profile-head">
                  <strong>@{user}</strong>
                  <span>{items.length} pasta{items.length === 1 ? '' : 's'}</span>
                  <div>
                    <button type="button" className="bp-link" onClick={() => sync(user)} disabled={busyUser === user}>{busyUser === user ? 'Sincronizando…' : 'Sincronizar'}</button>
                    <button type="button" className="bp-link bp-danger" onClick={() => onDisconnect(user)}>Desconectar</button>
                  </div>
                </div>
                <div className="bp-grid">
                  {items.map(board => {
                    const on = selectedIds.includes(board.id);
                    return (
                      <div key={board.id} className={`bp-card${on ? ' is-on' : ''}`}>
                        <button type="button" className="bp-card-main" onClick={() => onToggle(board.id)} aria-pressed={on} title={on ? 'Clique para não usar esta pasta' : 'Clique para usar esta pasta'}>
                          <Thumb src={board.thumb} />
                          <span className="bp-card-check" aria-hidden="true">{on ? '✓' : ''}</span>
                          <span className="bp-card-info"><strong title={board.name}>{board.name}</strong><small>{board.count} imagens</small></span>
                        </button>
                        <button type="button" className="bp-card-remove" onClick={() => onRemove(board.id)} aria-label={`Remover ${board.name}`} title="Remover esta pasta">×</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        </div>

        <footer className="bp-footer">
          <span>{selectedIds.length ? `${selectedIds.length} pasta${selectedIds.length === 1 ? '' : 's'} em uso neste carrossel` : 'Nenhuma pasta em uso'}</span>
          <button type="button" className="bp-primary" onClick={onClose}>Pronto</button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
