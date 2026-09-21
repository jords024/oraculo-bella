import React from 'react';

export default function SelectedReferencesBar({
  selectedReferences = [],
  onRemoveReference,
  onOpenPicker
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '8px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-2, #e4e4e7)' }}>
            Referências Visuais ({selectedReferences.length}/3)
          </span>
          {selectedReferences.length > 0 && (
            <span style={{ 
              fontSize: '10px', 
              padding: '1px 6px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(201, 168, 76, 0.2)', 
              color: 'var(--gold, #c9a84c)',
              fontWeight: '600' 
            }}>
              {selectedReferences.length === 3 ? 'Limite atingido (3/3)' : 'Até 3 referências'}
            </span>
          )}
        </div>

        {selectedReferences.length < 3 && onOpenPicker && (
          <button
            type="button"
            onClick={onOpenPicker}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--gold, #c9a84c)',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            <span>+ Adicionar (@)</span>
          </button>
        )}
      </div>

      {selectedReferences.length > 0 ? (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px', 
          padding: '8px', 
          backgroundColor: 'rgba(201, 168, 76, 0.04)', 
          border: '1px dashed rgba(201, 168, 76, 0.3)', 
          borderRadius: '8px' 
        }}>
          {selectedReferences.map((ref, idx) => (
            <div
              key={ref.id || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px 4px 4px',
                backgroundColor: '#18181b',
                border: '1px solid rgba(201, 168, 76, 0.4)',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
            >
              <img
                src={ref.url || `/api/library/${ref.id}/image`}
                alt={ref.title}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  objectFit: 'cover',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
              <span style={{ 
                fontSize: '11px', 
                fontWeight: '600', 
                color: '#fff', 
                maxWidth: '120px', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
              }}>
                {ref.title}
              </span>
              <button
                type="button"
                onClick={() => onRemoveReference(ref.id)}
                title="Remover referência"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  color: 'var(--red, #ef4444)',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  cursor: 'pointer',
                  padding: 0,
                  marginLeft: '2px'
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          fontSize: '11px',
          color: 'var(--text-3, #71717a)',
          lineHeight: '1.4'
        }}>
          💡 Digite <strong style={{ color: 'var(--gold, #c9a84c)' }}>@</strong> no prompt acima para escolher até 3 imagens de referência da biblioteca.
        </div>
      )}
    </div>
  );
}
