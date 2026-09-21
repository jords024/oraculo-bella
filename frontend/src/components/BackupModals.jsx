import React from 'react';

export default function BackupModals({
  restoreModalOpen,
  setRestoreModalOpen,
  restoreFilename,
  handleRestore,
  deleteModalOpen,
  setDeleteModalOpen,
  deleteFilename,
  handleDelete,
  bulkDeleteModalOpen,
  setBulkDeleteModalOpen,
  selectedBackups,
  handleBulkDelete,
  actionLoading
}) {
  return (
    <>
      {/* Modal: Confirmar Restauração */}
      {restoreModalOpen && (
        <div className="form-modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)' }}>
          <div className="form-box" style={{ maxWidth: '450px', width: '100%', textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
            <div className="form-title" style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.05em' }}>CONFIRMAR RESTAURAÇÃO</div>
            <div className="settings-group-sub" style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--text-3)', lineHeight: '1.6' }}>
              Esta ação irá substituir todos os dados atuais do banco de dados PostgreSQL pelas informações contidas no arquivo <strong style={{ color: 'var(--text)' }}>{restoreFilename}</strong>.<br/>
              Isso pode causar perda de dados inseridos após a criação deste backup. Deseja continuar?
            </div>
            <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setRestoreModalOpen(false)} style={{ flex: 1 }}>
                Cancelar
              </button>
              <button className="btn btn-gold" onClick={handleRestore} disabled={actionLoading} style={{ flex: 1, backgroundColor: 'var(--gold)', borderColor: 'var(--gold)', color: '#000', fontWeight: '600' }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão */}
      {deleteModalOpen && (
        <div className="form-modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)' }}>
          <div className="form-box" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🗑️</div>
            <div className="form-title" style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.05em' }}>CONFIRMAR EXCLUSÃO</div>
            <div className="settings-group-sub" style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--text-3)' }}>
              Tem certeza que deseja excluir permanentemente o arquivo <strong style={{ color: 'var(--text)' }}>{deleteFilename}</strong> do armazenamento Backblaze S3?
            </div>
            <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteModalOpen(false)} style={{ flex: 1 }}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={actionLoading} style={{ flex: 1, fontWeight: '600' }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal: Confirmar Exclusão em Massa */}
      {bulkDeleteModalOpen && (
        <div className="form-modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)' }}>
          <div className="form-box" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🗑️</div>
            <div className="form-title" style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.05em' }}>CONFIRMAR EXCLUSÃO</div>
            <div className="settings-group-sub" style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--text-3)' }}>
              Tem certeza que deseja excluir permanentemente os <strong style={{ color: 'var(--text)' }}>{selectedBackups.length}</strong> backups selecionados do armazenamento Backblaze S3?
            </div>
            <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setBulkDeleteModalOpen(false)} style={{ flex: 1 }}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleBulkDelete} disabled={actionLoading} style={{ flex: 1, fontWeight: '600' }}>
                Excluir todos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
