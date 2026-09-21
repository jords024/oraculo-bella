import React from 'react';

export default function ReferenceAutocompleteMenu({
  filteredImages = [],
  selectedIndex = 0,
  onSelect,
  onMouseEnter,
  onClose,
  mentionQuery = '',
  onQueryChange,
  selectedIds = []
}) {
  return (
    <div 
      className="mention-autocomplete-menu"
      style={{
        position: 'relative',
        width: '100%',
        margin: '10px 0',
        maxHeight: '270px',
        overflowY: 'auto',
        background: '#121216',
        border: '1.5px solid var(--gold, #c9a84c)',
        borderRadius: '8px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
        zIndex: 10,
        scrollbarWidth: 'thin',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      {/* Header com título, busca rápida e botão fechar */}
      <div style={{ 
        padding: '8px 12px', 
        fontSize: '11px', 
        color: 'var(--gold, #c9a84c)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(201, 168, 76, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🖼️ SELECIONE ATÉ 3 IMAGENS DE REFERÊNCIA (@)</span>
          {mentionQuery && (
            <span style={{ fontSize: '10px', color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '1px 6px', borderRadius: '4px' }}>
              Filtro: "{mentionQuery}"
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>↑↓ navega • Enter escolhe</span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-3, #a1a1aa)',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '0 4px',
                lineHeight: 1
              }}
              title="Fechar seletor"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: 'var(--text-3, #a1a1aa)', 
          fontSize: '12px' 
        }}>
          Nenhuma imagem encontrada na biblioteca{mentionQuery ? ` para "${mentionQuery}"` : ''}.
        </div>
      ) : (
        filteredImages.map((img, idx) => {
          const isAlreadySelected = selectedIds.includes(img.id);
          const isActive = idx === selectedIndex;
          
          return (
            <div
              key={img.id}
              className="mention-option-item"
              onClick={() => onSelect(img)}
              onMouseEnter={() => onMouseEnter && onMouseEnter(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                cursor: isAlreadySelected ? 'not-allowed' : 'pointer',
                backgroundColor: isActive ? 'rgba(201, 168, 76, 0.18)' : 'transparent',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                transition: 'background-color 0.15s ease',
                opacity: isAlreadySelected ? 0.6 : 1
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '6px',
                overflow: 'hidden',
                flexShrink: 0,
                border: isAlreadySelected ? '1.5px solid var(--green, #22c55e)' : isActive ? '1.5px solid var(--gold, #c9a84c)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: '#09090b',
                position: 'relative'
              }}>
                <img
                  src={img.url}
                  alt={img.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
                {isAlreadySelected && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(34, 197, 94, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: isAlreadySelected ? 'var(--green, #22c55e)' : isActive ? 'var(--gold, #c9a84c)' : '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {img.title}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-3, #a1a1aa)', marginTop: '2px' }}>
                  {img.category || 'Geral'} {isAlreadySelected ? '• (Já Selecionada)' : ''}
                </div>
              </div>

              {isAlreadySelected ? (
                <span style={{ 
                  fontSize: '10px', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  backgroundColor: 'rgba(34, 197, 94, 0.15)', 
                  color: 'var(--green, #22c55e)',
                  fontWeight: '600'
                }}>
                  ✓ Selecionada
                </span>
              ) : (
                <span style={{ 
                  fontSize: '10px', 
                  padding: '3px 10px', 
                  borderRadius: '4px', 
                  backgroundColor: 'rgba(201, 168, 76, 0.15)', 
                  color: 'var(--gold, #c9a84c)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  fontWeight: '600'
                }}>
                  + Usar Referência
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
