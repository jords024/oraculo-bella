import React from 'react';

export default function UsersBatchBanner({
  selectedCount,
  totalCount,
  itemLabel = 'item(ns)',
  onSelectAll,
  onClearSelection,
  onOpenBatchDelete
}) {
  if (selectedCount === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '16px',
        animation: 'fadeIn 0.2s ease-in-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fca5a5' }}>
        <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>✓</span>
        <span>
          <strong>{selectedCount}</strong> de <strong>{totalCount}</strong> {itemLabel} selecionado(s)
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {selectedCount < totalCount && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onSelectAll}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Selecionar Todos ({totalCount})
          </button>
        )}
        <button
          type="button"
          className="btn btn-outline"
          onClick={onClearSelection}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          Desmarcar Todos
        </button>
        <button
          type="button"
          className="btn"
          style={{
            background: '#ef4444',
            borderColor: '#ef4444',
            color: '#fff',
            fontSize: '12px',
            padding: '6px 14px',
            fontWeight: '600'
          }}
          onClick={onOpenBatchDelete}
        >
          🗑️ Excluir Selecionados ({selectedCount})
        </button>
      </div>
    </div>
  );
}
