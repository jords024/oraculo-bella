import React from 'react';

export const QUICK_FILTERS = [
  { label: 'Requisições HTTP', tag: 'HTTP' },
  { label: 'Banco de Dados', tag: 'DB' },
  { label: 'Carrosséis', tag: 'Carousel' },
  { label: 'Backups', tag: 'Backup' },
  { label: 'Autenticação', tag: 'AUTH' },
  { label: 'MinIO / Storage', tag: 'B2' },
  { label: 'Servidor', tag: 'SERVER' }
];

export const LOG_LEVELS = ['CRITICAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG'];

export default function LogsFilterBar({
  selectedDate,
  setSelectedDate,
  availableDates = [],
  loadLogs,
  totalLines,
  setIsPasteModalOpen,
  handleClearFilters,
  handleClearServerLogs,
  activeQuickFilters = [],
  setActiveQuickFilters,
  timeFrom,
  setTimeFrom,
  timeTo,
  setTimeTo,
  searchText,
  setSearchText,
  selectedLevel,
  setSelectedLevel,
  rawLogs = []
}) {
  return (
    <div style={{ background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        <select
          className="form-input"
          style={{ width: '150px', background: '#09090b', color: '#fff', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', height: '36px' }}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          {availableDates.length === 0 ? (
            <option value="">Nenhuma data</option>
          ) : (
            availableDates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))
          )}
        </select>
        <button type="button" className="btn btn-gold" onClick={loadLogs}>
          🔄 Carregar {selectedDate}
        </button>
        
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

        <button type="button" className="btn btn-outline" onClick={() => setIsPasteModalOpen(true)}>📋 Colar manualmente</button>
        <button type="button" className="btn btn-outline" onClick={handleClearFilters}>🧹 Limpar</button>

        <button 
          type="button"
          className="btn btn-danger" 
          style={{ marginLeft: 'auto', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--red)', color: 'var(--red)' }} 
          onClick={handleClearServerLogs}
        >
          🗑 Apagar log no servidor
        </button>
        <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{totalLines} linhas totais</span>
      </div>

      {/* Quick filters tags */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: '8px', fontWeight: 'bold' }}>⚡ FILTROS RÁPIDOS</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {QUICK_FILTERS.map(qf => {
            const isSelected = activeQuickFilters.includes(qf.tag);
            return (
              <button
                key={qf.tag}
                type="button"
                onClick={() => {
                  setActiveQuickFilters(prev =>
                    isSelected ? prev.filter(t => t !== qf.tag) : [...prev, qf.tag]
                  );
                }}
                style={{
                  background: isSelected ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                  border: isSelected ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                  color: isSelected ? 'var(--gold)' : '#e4e4e7',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                📁 {qf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inputs row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-3)' }}>Horário De</label>
          <input type="time" className="form-input" style={{ width: '100%', background: '#09090b', color: '#fff', border: '1px solid var(--border)' }} value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
        </div>
        <div>
          <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-3)' }}>Horário Até</label>
          <input type="time" className="form-input" style={{ width: '100%', background: '#09090b', color: '#fff', border: '1px solid var(--border)' }} value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
        </div>
        <div>
          <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-3)' }}>Busca no Texto</label>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', background: '#09090b', color: '#fff', border: '1px solid var(--border)' }}
            placeholder="Buscar ou pressionar Enter..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
          />
        </div>
      </div>

      {/* Levels row */}
      <div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: '8px', fontWeight: 'bold' }}>NÍVEL</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setSelectedLevel('all')}
            style={{
              background: selectedLevel === 'all' ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
              color: selectedLevel === 'all' ? '#000' : '#e4e4e7',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            TODOS ({rawLogs.length})
          </button>
          {LOG_LEVELS.map(lvl => {
            const count = rawLogs.filter(l => l.level === lvl).length;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                style={{
                  background: selectedLevel === lvl ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                  color: '#e4e4e7',
                  border: selectedLevel === lvl ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {lvl} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
