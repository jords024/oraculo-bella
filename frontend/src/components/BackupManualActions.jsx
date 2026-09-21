import React from 'react';

export default function BackupManualActions({
  handleManualBackup,
  handleUploadClick,
  handleFileChange,
  fileInputRef,
  actionLoading
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Painel 1: Backup Manual */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px'
          }}>
            <div style={{
              background: 'rgba(212, 163, 89, 0.1)',
              border: '1px solid rgba(212, 163, 89, 0.25)',
              color: 'var(--gold)',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.2 15a8.85 8.85 0 0 0-1.75-4.58c-.1-.13-.25-.23-.41-.3M12 13v8M9 16l3-3 3 3"/></svg>
            </div>
            <span>Backup Manual Imediato</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-3)', lineHeight: '1.5' }}>
            Gera um dump completo e seguro de todas as tabelas e dados do PostgreSQL neste exato momento e o envia diretamente ao armazenamento na nuvem (Backblaze S3 / MinIO).
          </div>
        </div>
        <button
          className="btn btn-gold"
          onClick={handleManualBackup}
          disabled={actionLoading}
          style={{ padding: '10px 20px', fontWeight: '700', fontSize: '13px' }}
        >
          <svg style={{ marginRight: '8px' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.2 15a8.85 8.85 0 0 0-1.75-4.58c-.1-.13-.25-.23-.41-.3M12 13v8M9 16l3-3 3 3"/></svg>
          {actionLoading ? 'Gerando Backup...' : 'Fazer Backup Agora'}
        </button>
      </div>

      {/* Painel 2: Importar Backup Externo */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px'
          }}>
            <div style={{
              background: 'rgba(249, 115, 22, 0.1)',
              border: '1px solid rgba(249, 115, 22, 0.25)',
              color: 'var(--orange)',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            </div>
            <span>Importar Backup Externo</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-3)', lineHeight: '1.5' }}>
            Envie um arquivo de backup (<code style={{ color: 'var(--orange)', background: 'rgba(249,115,22,0.1)', padding: '2px 6px', borderRadius: '4px' }}>.dump</code> ou <code style={{ color: 'var(--orange)', background: 'rgba(249,115,22,0.1)', padding: '2px 6px', borderRadius: '4px' }}>.dump.gz</code>) gerado em outro servidor ou ambiente para salvá-lo no repositório S3 e permitir sua restauração.
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          accept=".dump,.dump.gz" 
        />
        <button
          className="btn btn-outline"
          onClick={handleUploadClick}
          disabled={actionLoading}
          style={{
            borderColor: 'var(--orange)',
            color: 'var(--orange)',
            padding: '10px 20px',
            fontWeight: '700',
            fontSize: '13px'
          }}
        >
          <svg style={{ marginRight: '8px' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          {actionLoading ? 'Enviando...' : 'Fazer Upload de Backup'}
        </button>
      </div>

    </div>
  );
}
