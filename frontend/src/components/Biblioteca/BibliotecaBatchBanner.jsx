// frontend/src/components/Biblioteca/BibliotecaBatchBanner.jsx — Banner de Ações em Lote
import React from 'react';

export default function BibliotecaBatchBanner({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onOpenBatchDelete
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="biblioteca-batch-banner">
      <div className="biblioteca-batch-info">
        <span style={{ color: '#ef4444', fontSize: '16px' }}>✓</span>
        <span>
          <strong>{selectedCount}</strong> de <strong>{totalCount}</strong> imagem(ns) selecionada(s)
        </span>
      </div>
      <div className="biblioteca-batch-actions">
        {selectedCount < totalCount && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onSelectAll}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Selecionar Todas ({totalCount})
          </button>
        )}
        <button
          type="button"
          className="btn btn-outline"
          onClick={onClearSelection}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          Desmarcar Todas
        </button>
        <button
          type="button"
          className="btn"
          style={{ background: '#ef4444', borderColor: '#ef4444', color: '#fff', fontSize: '12px', padding: '6px 14px', fontWeight: '600' }}
          onClick={onOpenBatchDelete}
        >
          🗑️ Excluir Selecionadas ({selectedCount})
        </button>
      </div>
    </div>
  );
}
