import React from 'react';

export default function BackupList({
  backups,
  loadingList,
  paginatedBackups,
  selectedBackups,
  handleSelectAllToggle,
  handleSelectToggle,
  formatSize,
  confirmRestore,
  confirmDelete,
  currentPage,
  setCurrentPage,
  totalPages,
  displayCount,
  setDisplayCount,
  loadBackups,
  setBulkDeleteModalOpen
}) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {backups.length > 0 && (
            <input 
              type="checkbox"
              checked={paginatedBackups.length > 0 && paginatedBackups.every(b => selectedBackups.includes(b.filename))}
              onChange={handleSelectAllToggle}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer',
                accentColor: 'var(--gold)',
                margin: 0
              }}
            />
          )}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Backups no S3 ({backups.length})
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {selectedBackups.length > 0 && (
            <button
              onClick={() => setBulkDeleteModalOpen(true)}
              className="btn"
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'opacity 0.2s'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              Excluir Selecionados ({selectedBackups.length})
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-3)' }}>
            <span>Exibir:</span>
            <select
              value={displayCount}
              onChange={(e) => {
                setDisplayCount(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                background: 'var(--surface-d)',
                border: '1px solid var(--border)',
                color: 'var(--text-2)',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <button 
            onClick={loadBackups} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px' }}
            title="Atualizar lista"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          </button>
        </div>
      </div>

      {loadingList ? (
        <div className="spinner"></div>
      ) : backups.length === 0 ? (
        <div className="empty" style={{ padding: '30px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>💾</div>
          <div style={{ color: 'var(--text-3)', fontSize: '13px' }}>Nenhum backup encontrado no repositório.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {paginatedBackups.map(log => (
            <div 
              key={log.id} 
              style={{ 
                background: 'var(--surface-d)', 
                border: '1px solid var(--border2)', 
                borderRadius: '8px', 
                padding: '14px 16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'all 0.15s'
              }}
              className="backup-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <input 
                  type="checkbox"
                  checked={selectedBackups.includes(log.filename)}
                  onChange={() => handleSelectToggle(log.filename)}
                  style={{
                    width: '15px',
                    height: '15px',
                    cursor: 'pointer',
                    accentColor: 'var(--gold)',
                    flexShrink: 0
                  }}
                />
                <span 
                  style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: log.status === 'success' ? '#22c55e' : '#f43f5e',
                    flexShrink: 0
                  }}
                  title={log.status === 'success' ? 'Sucesso' : 'Falhou'}
                />
                <div style={{ minWidth: 0 }}>
                  <div 
                    style={{ 
                      fontSize: '13px', 
                      fontWeight: '600', 
                      color: 'var(--text)', 
                      wordBreak: 'break-all',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={log.filename}
                  >
                    {log.filename}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
                    {new Date(log.created_at).toLocaleString('pt-BR')} · {formatSize(log.size_bytes)}
                  </div>
                  {log.status === 'failed' && log.error_message && (
                    <div style={{ fontSize: '10px', color: '#f43f5e', marginTop: '4px', fontStyle: 'italic' }}>
                      Erro: {log.error_message}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {log.status === 'success' && (
                  <>
                    <a 
                      href={`/api/backups/download/${log.filename}`} 
                      className="btn btn-outline btn-sm" 
                      style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)', padding: '6px 10px', display: 'flex', alignItems: 'center' }}
                      title="Baixar Backup"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    </a>
                    <button 
                      className="btn btn-outline btn-sm" 
                      style={{ borderColor: 'var(--gold)', color: 'var(--gold)', padding: '6px 10px', display: 'flex', alignItems: 'center' }}
                      onClick={() => confirmRestore(log.filename)}
                      title="Restaurar Banco de Dados"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                    </button>
                  </>
                )}
                <button 
                  className="btn-danger btn-sm" 
                  style={{ padding: '6px 10px', display: 'flex', alignItems: 'center' }}
                  onClick={() => confirmDelete(log.filename)}
                  title="Deletar Backup"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}

          {/* Paginação */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '16px' }}>
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`page-btn ${currentPage === p ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                  style={{
                    backgroundColor: currentPage === p ? 'var(--gold)' : '',
                    borderColor: currentPage === p ? 'var(--gold)' : '',
                    color: currentPage === p ? '#000' : ''
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Próximo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
