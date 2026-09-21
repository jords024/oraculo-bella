import React from 'react';

export default function LogsPasteModal({
  isOpen,
  onClose,
  manualLogs,
  setManualLogs,
  handlePasteManually
}) {
  if (!isOpen) return null;

  return (
    <div className="form-modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.85)', zIndex: 1000 }}>
      <div className="form-box" style={{ maxWidth: '650px', width: '100%' }}>
        <h3 className="form-title">Colar Logs Manualmente</h3>
        <p style={{ color: 'var(--text-3)', fontSize: '12px', marginBottom: '14px' }}>
          Cole linhas de log abaixo. Se estiverem no formato do sistema (ex: <code style={{ color: 'var(--gold)' }}>DD/MM/YYYY HH:MM:SS - TAG - LEVEL - MSG</code>), eles serão filtrados adequadamente.
        </p>
        <textarea
          className="form-textarea"
          style={{ height: '300px', width: '100%', fontFamily: 'monospace', fontSize: '11px', background: '#09090b', color: '#fff', border: '1px solid var(--border)' }}
          placeholder="Cole os logs aqui..."
          value={manualLogs}
          onChange={(e) => setManualLogs(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-gold" onClick={handlePasteManually}>Carregar Logs</button>
        </div>
      </div>
    </div>
  );
}
