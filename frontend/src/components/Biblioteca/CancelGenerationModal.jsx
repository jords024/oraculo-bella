import React from 'react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

export default function CancelGenerationModal({
  isOpen,
  onClose,
  onConfirm
}) {
  useLockBodyScroll(isOpen);
  if (!isOpen) return null;

  return (
    <div
      className="form-modal open"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="form-box cancel-modal-panel"
        style={{
          maxWidth: '420px',
          width: '90%',
          background: '#121214',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '14px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.85)',
          padding: '28px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cancel-modal-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h3 className="cancel-modal-title" style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
          Cancelar Geração de Imagem?
        </h3>
        
        <p className="cancel-modal-desc" style={{ fontSize: '13px', color: '#d4d4d8', lineHeight: '1.5', margin: 0 }}>
          Tem certeza de que deseja interromper a criação da imagem com IA em andamento? O processamento atual será cancelado imediatamente.
        </p>

        <div className="cancel-modal-actions" style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
          <button
            type="button"
            className="cancel-modal-btn-secondary"
            onClick={onClose}
            title="Fechar aviso e continuar gerando a imagem"
          >
            Continuar Gerando
          </button>

          <button
            type="button"
            className="cancel-modal-btn-danger"
            onClick={onConfirm}
            title="Confirmar cancelamento da geração"
          >
            Sim, Cancelar Geração
          </button>
        </div>
      </div>
    </div>
  );
}
