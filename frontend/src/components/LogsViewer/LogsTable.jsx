import React from 'react';

export default function LogsTable({
  logs = [],
  totalLines,
  selectedDate,
  selectedLines = [],
  handleDeleteLines,
  handleCopyLogs,
  handleDownloadLogs,
  handleSelectAll,
  handleSelectLine,
  loading
}) {
  return (
    <div style={{ background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)', borderRadius: '12px', overflow: 'hidden' }}>
      
      {/* Table actions header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {logs.length} / {totalLines} LINHAS • {selectedDate}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedLines.length > 0 && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => handleDeleteLines(selectedLines)}
              style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--red)', color: 'var(--red)', marginRight: '8px', padding: '4px 10px', fontSize: '11px' }}
            >
              🗑 Excluir Selecionados ({selectedLines.length})
            </button>
          )}
          <button type="button" className="btn btn-outline btn-sm" onClick={handleCopyLogs}>📋 Copiar</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleDownloadLogs}>📥 Download</button>
        </div>
      </div>

      {/* Logs list */}
      <div style={{ maxHeight: '500px', overflowY: 'auto', background: '#09090b', padding: '12px 0', fontFamily: 'monospace', fontSize: '12px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
            <div className="slide-thumb-spinner" style={{ display: 'inline-block', width: '20px', height: '20px', marginBottom: '10px' }} />
            <div>Carregando logs do servidor...</div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Nenhum log encontrado para os critérios selecionados.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header Row */}
            <div style={{ display: 'flex', padding: '8px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: 'var(--text-3)', fontWeight: 'bold' }}>
              <input 
                type="checkbox" 
                style={{ marginRight: '16px' }} 
                onChange={handleSelectAll} 
                checked={selectedLines.length === logs.length && logs.length > 0} 
              />
              <div style={{ width: '40px', textAlign: 'right', marginRight: '16px' }}>#</div>
              <div style={{ width: '80px', marginRight: '16px' }}>NÍVEL</div>
              <div style={{ width: '150px', marginRight: '16px' }}>DATA/HORA</div>
              <div style={{ flex: 1 }}>MENSAGEM</div>
              <div style={{ width: '60px', textAlign: 'center' }}>AÇÕES</div>
            </div>
            
            {/* Logs Data */}
            {logs.map((l, idx) => {
              let lvlColor = '#a1a1aa';
              if (l.level === 'ERROR' || l.level === 'CRITICAL') lvlColor = 'var(--red, #f43f5e)';
              if (l.level === 'WARNING') lvlColor = 'var(--gold, #e0a96d)';
              if (l.level === 'INFO') lvlColor = 'var(--cyan, #38bdf8)';
              if (l.level === 'DEBUG') lvlColor = '#818cf8';

              return (
                <div
                  key={l.id}
                  style={{
                    display: 'flex',
                    padding: '6px 20px',
                    background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid rgba(255,255,255,0.02)'
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ marginRight: '16px', marginTop: '2px' }}
                    checked={selectedLines.includes(l.id)}
                    onChange={() => handleSelectLine(l.id)}
                  />
                  <div style={{ width: '40px', textAlign: 'right', marginRight: '16px', color: 'var(--text-3)' }}>{l.id}</div>
                  <div style={{ width: '80px', marginRight: '16px' }}>
                    <span style={{
                      background: `${lvlColor}15`,
                      border: `1px solid ${lvlColor}30`,
                      color: lvlColor,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: 'bold'
                    }}>
                      {l.level}
                    </span>
                  </div>
                  <div style={{ width: '150px', marginRight: '16px', color: 'var(--text-3)' }}>{l.datetime}</div>
                  <div style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#e4e4e7' }}>
                    {l.tag ? <span style={{ color: 'var(--gold, #e0a96d)', marginRight: '6px' }}>[{l.tag}]</span> : null}
                    {l.message}
                  </div>
                  <div style={{ width: '60px', display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteLines([l.id])}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--red, #f43f5e)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '0 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.7,
                        transition: 'opacity 0.15s'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = 1}
                      onMouseLeave={(e) => e.target.style.opacity = 0.7}
                      title="Excluir Linha"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
