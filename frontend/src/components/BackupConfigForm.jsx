import React from 'react';

export default function BackupConfigForm({
  config,
  setConfig,
  loadingConfig,
  actionLoading,
  handleSaveConfig,
  getFreqLabel
}) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Agendamento Automático
      </div>

      {loadingConfig ? (
        <div className="spinner"></div>
      ) : (
        <>
          {/* Toggle Switch */}
          <div style={{ background: 'var(--surface-d)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Agendamento Ativado</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Backups serão realizados automaticamente de forma cíclica.</div>
            </div>
            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span className="slider round" style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: config.enabled ? 'var(--gold)' : '#3f3f46',
                transition: '.3s', borderRadius: '34px'
              }}></span>
              <span style={{
                position: 'absolute', content: '""', height: '16px', width: '16px', left: config.enabled ? '20px' : '4px', bottom: '3px',
                backgroundColor: '#000', transition: '.3s', borderRadius: '50%'
              }}></span>
            </label>
          </div>

          {/* Parametrizações */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: '600' }}>Frequência</label>
              <select
                className="key-input"
                value={config.frequency}
                onChange={(e) => setConfig(prev => ({ ...prev, frequency: e.target.value }))}
                style={{ width: '100%', cursor: 'pointer', appearance: 'auto' }}
              >
                <option value="minutes">A cada X minutos</option>
                <option value="hours">A cada X horas</option>
                <option value="days">A cada X dias</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: '600' }}>Valor do Intervalo</label>
              <input
                className="key-input"
                type="number"
                min={1}
                value={config.interval_val}
                onChange={(e) => setConfig(prev => ({ ...prev, interval_val: parseInt(e.target.value) || 1 }))}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                Backup a cada {config.interval_val} {getFreqLabel(config.frequency, config.interval_val)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: '600' }}>Pasta do Backup no S3</label>
            <input
              className="key-input"
              type="text"
              value={config.s3_folder}
              onChange={(e) => setConfig(prev => ({ ...prev, s3_folder: e.target.value }))}
              style={{ width: '100%' }}
              placeholder="Ex: backups/"
            />
            <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Subpasta onde os backups serão salvos no bucket do Backblaze S3. Ex: backups/ ou backups/cliente1/.</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: '600' }}>Retenção — Máximo de Backups no S3</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  className="key-input"
                  type="number"
                  min={1}
                  value={config.retention}
                  onChange={(e) => setConfig(prev => ({ ...prev, retention: parseInt(e.target.value) || 1 }))}
                  style={{ width: '80px', textAlign: 'center' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>backups — os mais antigos serão excluídos automaticamente.</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className="btn btn-gold" onClick={handleSaveConfig} disabled={actionLoading} style={{ background: 'var(--purple-d)', borderColor: 'var(--purple)', color: 'var(--purple)' }}>
              <svg style={{ marginRight: '6px' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Salvar Configuração
            </button>
          </div>
        </>
      )}
    </div>
  );
}
