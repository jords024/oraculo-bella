import React from 'react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

export default function DeleteImageModal({
  isOpen,
  image,
  count = 1,
  onClose,
  onConfirm,
  deleting
}) {
  useLockBodyScroll(isOpen);
  if (!isOpen) return null;

  const isBatch = count > 1 || (!image && count > 0);
  const title = isBatch ? `Excluir ${count} Imagens` : 'Excluir Imagem';
  const description = isBatch
    ? `Tem certeza que deseja apagar as ${count} imagens selecionadas da biblioteca? Esta ação não poderá ser desfeita.`
    : `Tem certeza que deseja apagar a imagem "${image?.title || 'selecionada'}" da biblioteca? Esta ação não poderá ser desfeita.`;

  return (
    <div
      className="form-modal open"
      style={{
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(6px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="form-box"
        style={{
          maxWidth: '420px',
          background: '#121214',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
          padding: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            fontSize: '22px'
          }}>
            🗑️
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#fff', margin: '0 0 6px 0' }}>
            {title}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-3, #a1a1aa)', margin: 0, lineHeight: '1.45' }}>
            {description}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={deleting}
            style={{ flex: 1, padding: '10px 16px', fontSize: '13px' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              background: '#ef4444',
              borderColor: '#ef4444',
              color: '#fff',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '600'
            }}
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Apagando...' : 'Excluir Definitivamente'}
          </button>
        </div>
      </div>
    </div>
  );
}
