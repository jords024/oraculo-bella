import React from 'react';

export default function DeleteUserModal({
  isOpen,
  onClose,
  deletingUser,
  count = 1,
  onSubmit,
  deleteSubmitting
}) {
  if (!isOpen) return null;
  if (!deletingUser && count <= 1) return null;

  const isBatch = count > 1;

  return (
    <div className="form-modal open" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="form-box">
        <h3 className="form-title" style={{ color: 'var(--red, #f43f5e)', fontSize: '16px' }}>
          {isBatch ? `Excluir ${count} Usuários permanentemente` : 'Excluir Usuário permanentemente'}
        </h3>
        <p style={{ margin: '14px 0 24px', color: '#e4e4e7', fontSize: '14px', lineHeight: '1.5' }}>
          {isBatch ? (
            <>
              Você tem certeza que deseja remover <strong>{count} usuários</strong> selecionados? Esta ação removerá totalmente seus direitos de acesso ao estúdio.
            </>
          ) : (
            <>
              Você tem certeza que deseja remover o usuário <strong>{deletingUser?.name}</strong> ({deletingUser?.email})? Esta ação removerá totalmente seus direitos de acesso ao estúdio.
            </>
          )}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" style={{ backgroundColor: 'var(--red, #f43f5e)', border: 'none', color: '#ffffff' }} onClick={onSubmit} disabled={deleteSubmitting}>
            {deleteSubmitting ? 'Excluindo...' : (isBatch ? `Excluir ${count} usuários` : 'Excluir usuário')}
          </button>
        </div>
      </div>
    </div>
  );
}
