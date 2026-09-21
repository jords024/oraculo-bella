import React from 'react';

export default function DeleteConfirmationModals({
  deleteTargetId,
  setDeleteTargetId,
  confirmDeleteIndividual,
  isBulkDeleteModalOpen,
  setIsBulkDeleteModalOpen,
  selectedCount,
  confirmDeleteBulk
}) {
  return (
    <>
      {/* Modal de Confirmação de Exclusão Individual */}
      {deleteTargetId && (
        <div className="form-modal open">
          <div className="form-box">
            <h3 className="form-title" style={{ color: 'var(--red, #f43f5e)', fontSize: '16px' }}>Confirmar Exclusão</h3>
            <p style={{ margin: '14px 0 24px', color: '#e4e4e7', fontSize: '14px', lineHeight: '1.5' }}>
               Você tem certeza que deseja excluir permanentemente este carrossel? Esta ação não pode ser desfeita e removerá todos os arquivos físicos e registros.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setDeleteTargetId(null)}>Cancelar</button>
              <button type="button" className="btn btn-danger" style={{ backgroundColor: 'var(--red, #f43f5e)', color: '#ffffff', border: 'none' }} onClick={confirmDeleteIndividual}>Excluir permanentemente</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão em Lote */}
      {isBulkDeleteModalOpen && (
        <div className="form-modal open">
          <div className="form-box">
            <h3 className="form-title" style={{ color: 'var(--red, #f43f5e)', fontSize: '16px' }}>Confirmar Exclusão em Lote</h3>
            <p style={{ margin: '14px 0 24px', color: '#e4e4e7', fontSize: '14px', lineHeight: '1.5' }}>
              Você tem certeza que deseja excluir permanentemente os <strong>{selectedCount}</strong> carrosséis selecionados? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsBulkDeleteModalOpen(false)}>Cancelar</button>
              <button type="button" className="btn btn-danger" style={{ backgroundColor: 'var(--red, #f43f5e)', color: '#ffffff', border: 'none' }} onClick={confirmDeleteBulk}>Excluir permanentemente</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
