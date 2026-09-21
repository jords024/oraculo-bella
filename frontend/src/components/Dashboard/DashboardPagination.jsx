function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis-start', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages];
}

export default function DashboardPagination({
  pageSize,
  onPageSizeChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems
}) {
  if (totalItems === 0) return null;

  const paginationItems = getPaginationItems(currentPage, totalPages);

  return (
    <div className="pagination" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="pagination-info" style={{ margin: 0 }}>Mostrar</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(e.target.value)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        >
          <option value="20">20 por página</option>
          <option value="50">50 por página</option>
          <option value="100">100 por página</option>
        </select>
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button 
            type="button"
            className="page-btn" 
            disabled={currentPage === 1} 
            onClick={() => onPageChange(currentPage - 1)}
          >
            Anterior
          </button>
          {paginationItems.map((p) => {
            if (typeof p === 'string') {
              return (
                <span key={p} style={{ padding: '0 6px', color: 'var(--text-3)', fontSize: '13px', userSelect: 'none' }}>
                  ...
                </span>
              );
            }
            return (
              <button
                key={p}
                type="button"
                className={`page-btn ${currentPage === p ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
                style={{
                  backgroundColor: currentPage === p ? 'var(--gold, #C9A84C)' : '',
                  borderColor: currentPage === p ? 'var(--gold, #C9A84C)' : '',
                  color: currentPage === p ? '#000' : ''
                }}
              >
                {p}
              </button>
            );
          })}
          <button 
            type="button"
            className="page-btn" 
            disabled={currentPage === totalPages} 
            onClick={() => onPageChange(currentPage + 1)}
          >
            Próxima
          </button>
        </div>
      )}

      <span className="pagination-info" style={{ margin: 0 }}>
        Página {currentPage} de {totalPages} ({totalItems} no total)
      </span>
    </div>
  );
}
