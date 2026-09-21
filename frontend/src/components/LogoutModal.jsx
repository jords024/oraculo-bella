import React from 'react';
import { useScrollLock } from '../hooks/useScrollLock';

export default function LogoutModal({ logoutModalOpen, setLogoutModalOpen, onLoggedOut }) {
  useScrollLock(logoutModalOpen);

  if (!logoutModalOpen) return null;

  return (
    <div className="form-modal open" id="logout-confirm-modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)' }}>
      <div className="form-box" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '30px', animation: 'scaleUp 0.2s ease-out' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>🚪</div>
        <div className="form-title" style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.05em' }}>CONFIRMAR SAÍDA</div>
        <div className="settings-group-sub" style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--text-3)' }}>
          Tem certeza que deseja encerrar a sua sessão atual no painel do Oráculo?
        </div>
        <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={() => setLogoutModalOpen(false)} style={{ flex: 1 }}>
            Voltar
          </button>
          <button 
            className="btn btn-gold" 
            style={{ flex: 1, fontWeight: '600', cursor: 'pointer' }}
            onClick={async () => {
              try {
                await fetch('/auth/logout');
              } catch (e) {}
              localStorage.removeItem('fo_token');
              window.location.replace('/login.html');
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
