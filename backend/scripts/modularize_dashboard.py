import os

# Subcomponentes do Dashboard
files = {}

files['frontend/src/components/Dashboard/GeneratingBadge.jsx'] = "import React, { useState, useEffect } from 'react';

export default function GeneratingBadge({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const getStartMs = (val) => {
      if (!val) return Date.now();
      if (typeof val === 'number') return val;
      const parsed = new Date(val).getTime();
      return isNaN(parsed) ? Date.now() : parsed;
    };

    const start = getStartMs(startedAt);
    setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    const interval = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const formatted = mins > 0 ? ${mins}m s : ${secs}s;

  return (
    <span className=badge badge-generating style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.4)', fontWeight: 'bold' }}>
      ⏳ gerando... ({formatted})
    </span>
  );
}
"

files['frontend/src/components/Dashboard/DashboardStats.jsx'] = "import React from 'react';

export default function DashboardStats({ stats }) {
  return (
    <div className=stats-row>
      <div className=stat-card style={{ '--accent': 'var(--gold)' }}>
        <div className=stat-num>{stats?.total || 0}</div>
        <div className=stat-label>Carrosséis produzidos</div>
      </div>
      <div className=stat-card style={{ '--accent': 'var(--cyan)' }}>
        <div className=stat-num>{stats?.slides || 0}</div>
        <div className=stat-label>Slides gerados</div>
      </div>
      <div className=stat-card style={{ '--accent': 'var(--green)' }}>
        <div className=stat-num>{stats?.aprovados || 0}</div>
        <div className=stat-label>Aprovados / prontos</div>
      </div>
      <div className=stat-card style={{ '--accent': 'var(--purple)' }}>
        <div className=stat-num>{stats?.publicados || 0}</div>
        <div className=stat-label>Publicados</div>
      </div>
      <div className=stat-card style={{ '--accent': 'var(--green)' }}>
        <div className=stat-num style={{ fontSize: stats?.cost && stats.cost > 0 ? '28px' : undefined }}>
          R$ {stats?.cost !== undefined && stats?.cost !== null ? Number(stats.cost).toFixed(2) : '0,00'}
        </div>
        <div className=stat-label>Custo total (BRL)</div>
      </div>
    </div>
  );
}
"

files['frontend/src/components/Dashboard/DashboardFilters.jsx'] = "import React from 'react';

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
    <div className=section-header style={{ flexWrap: 'wrap', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className=section-title>Carrosséis</div>
        {filteredCount > 0 && (
          <button 
            type=button
            className=btn btn-outline btn-sm
            onClick={onSelectAll}
            style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {isAllSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </button>
        )}
        {selectedCount > 0 && (
          <button
            type=button
            className=btn-danger btn-sm
            onClick={onOpenBulkDeleteModal}
            style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🗑 Excluir Selecionados ({selectedCount})
          </button>
        )}
      </div>
      <div className=filter-row>
        {STATUS_OPTIONS.map(status => (
          <button
            key={status}
            type=button
            className={tn btn-outline btn-sm }
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
"

files['frontend/src/components/Dashboard/DashboardPagination.jsx'] = "import React from 'react';

export default function DashboardPagination({
  pageSize,
  onPageSizeChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems
}) {
  if (totalItems === 0) return null;

  return (
    <div className=pagination style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className=pagination-info style={{ margin: 0 }}>Mostrar</span>
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
          <option value=20>20 por página</option>
          <option value=50>50 por página</option>
          <option value=100>100 por página</option>
        </select>
      </div>

      {totalPages > 1 && (
        <div className=pagination-controls style={{ margin: 0 }}>
          <button 
            type=button
            className=page-btn 
            disabled={currentPage === 1} 
            onClick={() => onPageChange(currentPage - 1)}
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type=button
              className={page-btn }
              onClick={() => onPageChange(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button 
            type=button
            className=page-btn 
            disabled={currentPage === totalPages} 
            onClick={() => onPageChange(currentPage + 1)}
          >
            Próxima
          </button>
        </div>
      )}

      <span className=pagination-info style={{ margin: 0 }}>
        Página {currentPage} de {totalPages} ({totalItems} no total)
      </span>
    </div>
  );
}
"

os.makedirs('frontend/src/components/Dashboard', exist_ok=True)
for path, code in files.items():
    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f'Criado: {path}')
