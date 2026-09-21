import React from 'react';

export default function DeleteInviteModal({
  isOpen,
  onClose,
  deletingInvite,
  count = 1,
  onSubmit,
  deleteInviteSubmitting
}) {
  if (!isOpen) return null;
  if (!deletingInvite && count <= 1) return null;

  const isBatch = count > 1;

  return (
    <div className="form-modal open" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="form-box">
        <h3 className="form-title" style={{ color: 'var(--red, #f43f5e)', fontSize: '16px' }}>
          {isBatch ? `Excluir ${count} Convites permanentemente` : 'Excluir Convite permanentemente'}
        </h3>
        <p style={{ margin: '14px 0 24px', color: '#e4e4e7', fontSize: '14px', lineHeight: '1.5' }}>
          {isBatch ? (
            <>
              Você tem certeza que deseja excluir <strong>{count} convites</strong> selecionados? Esta ação invalidará todos os links selecionados permanentemente.
            </>
          ) : (
            <>
              Você tem certeza que deseja excluir o convite <strong>{deletingInvite?.id}</strong>? Esta ação invalidará o link permanentemente e removerá o convite do histórico.
            </>
          )}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" style={{ backgroundColor: 'var(--red, #f43f5e)', border: 'none', color: '#ffffff' }} onClick={onSubmit} disabled={deleteInviteSubmitting}>
            {deleteInviteSubmitting ? 'Excluindo...' : (isBatch ? `Excluir ${count} convites` : 'Excluir convite')}
          </button>
        </div>
      </div>
    </div>
  );
}
