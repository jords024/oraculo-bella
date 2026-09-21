import React from 'react';

export default function BackupStatusCards({
  lastBackupFilename,
  lastBackupTime,
  nextBackupTime,
  nextBackupSub,
  retention
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
      
      {/* Card 1: Último Backup */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Último Backup</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', wordBreak: 'break-all' }}>{lastBackupFilename}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{lastBackupTime}</div>
        </div>
      </div>

      {/* Card 2: Próximo Backup */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Próximo Backup</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>{nextBackupTime}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{nextBackupSub}</div>
        </div>
      </div>

      {/* Card 3: Retenção */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#8b5cf6', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Retenção</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>{retention}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>backups mantidos no S3</div>
        </div>
      </div>

    </div>
  );
}
