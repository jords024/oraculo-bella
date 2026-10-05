import React, { useEffect, useRef } from 'react';

const SOURCES = [
  { id: 'ia', icon: '✦', name: 'Gerar com IA', short: 'IA', description: 'Cada foto é criada pela IA. Custa por imagem.' },
  { id: 'pinterest', icon: '⌕', name: 'Busca no Pinterest', short: 'Pinterest · busca', description: 'Busca, avalia e escolhe imagens do Pinterest para cada lâmina. Leva alguns minutos.' },
  { id: 'pasta', icon: '⌑', name: 'Minhas pastas', short: 'Minhas pastas', description: 'Usa as imagens das suas próprias pastas do Pinterest. Mais rápido e com a sua curadoria.' },
];

// Fonte das imagens: mesmo padrão dos outros seletores da barra (botão compacto que abre um cartão).
export default function ImageSourceSelector({ value, onChange, disabled, selectedBoards = [], onManageBoards }) {
  const detailsRef = useRef(null);
  const active = SOURCES.find(item => item.id === value) || SOURCES[0];
  const close = () => { if (detailsRef.current) detailsRef.current.open = false; };

  useEffect(() => {
    const onPointerDown = event => {
      if (detailsRef.current?.open && !detailsRef.current.contains(event.target)) close();
    };
    const onKey = event => { if (event.key === 'Escape') close(); };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKey); };
  }, []);

  const summaryValue = value === 'pasta' && selectedBoards.length ? `Minhas pastas · ${selectedBoards.length}` : active.short;

  const choose = id => {
    onChange(id);
    if (id !== 'pasta') { close(); return; }
    if (!selectedBoards.length) { close(); onManageBoards?.(); }
  };

  return (
    <details className="ai-settings-picker image-source-picker" ref={detailsRef}>
      <summary className="ai-settings-summary" aria-label="Escolher a origem das imagens" style={disabled ? { pointerEvents: 'none', opacity: .55 } : undefined}>
        <span className="ai-settings-symbol" aria-hidden="true">{active.icon}</span>
        <span>
          <span className="creator-toolbar-label">Imagens</span>
          <strong>{summaryValue}</strong>
        </span>
        <span className="visual-direction-chevron" aria-hidden="true">⌄</span>
      </summary>

      <div className="image-source-menu">
        <div className="ai-settings-heading">
          <strong>De onde vêm as imagens?</strong>
          <span>Vale para as lâminas que usam foto.</span>
        </div>

        <div className="image-source-options" role="listbox" aria-label="Origem das imagens">
          {SOURCES.map(item => {
            const isActive = item.id === value;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`visual-direction-option${isActive ? ' is-active' : ''}`}
                onClick={() => choose(item.id)}
                disabled={disabled}
              >
                <span className="visual-direction-option-icon" aria-hidden="true">{item.icon}</span>
                <span><strong>{item.name}</strong><small>{item.description}</small></span>
                <span className="visual-direction-check" aria-hidden="true">{isActive ? '✓' : ''}</span>
              </button>
            );
          })}
        </div>

        {value === 'pasta' && (
          <div className="image-source-boards">
            <span className="image-source-boards-title">Pastas escolhidas</span>
            {selectedBoards.length ? (
              <div className="image-source-chips">
                {selectedBoards.map(board => <span key={board.id} className="image-source-chip" title={board.name}>{board.name}</span>)}
              </div>
            ) : <small>Nenhuma pasta escolhida ainda.</small>}
            <button type="button" className="image-source-manage" onClick={() => { close(); onManageBoards?.(); }}>
              {selectedBoards.length ? 'Gerenciar pastas' : 'Conectar minhas pastas'}
            </button>
          </div>
        )}
      </div>
    </details>
  );
}
