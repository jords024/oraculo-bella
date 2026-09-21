import React from 'react';

const STATUS_OPTIONS = ['all', 'rascunho', 'pronto', 'aprovado', 'agendado', 'publicando', 'publicado'];

export default function DashboardFilters({
  filterStatus,
  setFilterStatus,
  setCurrentPage,
  filteredCount,
  isAllSelected,
  selectedCount,
  onSelectAll,
  onOpenBulkDeleteModal
}) {
  return (
    <div className="section-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="section-title">Carrosséis</div>
        {filteredCount > 0 && (
          <button 
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onSelectAll}
            style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {isAllSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </button>
        )}
        {selectedCount > 0 && (
          <button
            type="button"
            className="btn-danger btn-sm"
            onClick={onOpenBulkDeleteModal}
            style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🗑 Excluir Selecionados ({selectedCount})
          </button>
        )}
      </div>
      <div className="filter-row">
        {STATUS_OPTIONS.map(status => (
          <button
            key={status}
            type="button"
            className={`btn btn-outline btn-sm ${filterStatus === status ? 'active' : ''}`}
            onClick={() => {
              setFilterStatus(status);
              setCurrentPage(1);
            }}
            style={status === 'agendado' ? { borderColor: 'var(--gold)', color: 'var(--gold)' } : (status === 'publicando' ? { borderColor: '#60a5fa', color: '#60a5fa' } : {})}
          >
            {status === 'all' ? 'Todos' : status.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
