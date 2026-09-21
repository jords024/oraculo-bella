import React from 'react';
import { useScrollLock } from '../../hooks/useScrollLock';

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  danger = true,
  onConfirm,
  onCancel
}) {
  useScrollLock(isOpen);

  if (!isOpen) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '16px',
          padding: '32px 36px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          animation: 'modalPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Ícone */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: danger ? 'rgba(244, 63, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
            border: `1px solid ${danger ? 'rgba(244, 63, 94, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            {danger ? '🗑️' : '⚠️'}
          </div>
        </div>

        {/* Título */}
        <h3 style={{
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '700',
          textAlign: 'center',
          margin: '0 0 10px 0',
          letterSpacing: '-0.3px'
        }}>{title}</h3>

        {/* Descrição */}
        <p style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: '14px',
          lineHeight: '1.6',
          textAlign: 'center',
          margin: '0 0 28px 0'
        }}>{description}</p>

        {/* Botões */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#e4e4e7',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.06)'}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              background: danger ? 'rgba(244, 63, 94, 0.85)' : 'rgba(251, 191, 36, 0.85)',
              border: 'none',
              color: danger ? '#fff' : '#000',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: danger ? '0 4px 20px rgba(244, 63, 94, 0.35)' : '0 4px 20px rgba(251,191,36,0.35)'
            }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.88) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
