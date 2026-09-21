import React from 'react';

export default function UsersSubTabsHeader({ activeSubTab, setActiveSubTab }) {
  return (
    <>
      <div className="oraculo-header">
        <div>
          <div className="oraculo-title">GESTÃO DE USUÁRIOS</div>
          <div className="oraculo-subtitle">
            Gerencie os acessos do estúdio e crie convites temporários com níveis de acesso.
          </div>
        </div>
      </div>

      <div
        className="inner-tabs"
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '10px',
          paddingLeft: '16px'
        }}
      >
        <button
          className={`inner-tab-btn ${activeSubTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('users')}
          style={{
            background: activeSubTab === 'users' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: activeSubTab === 'users' ? '1px solid var(--border)' : '1px solid transparent',
            color: activeSubTab === 'users' ? 'var(--text)' : 'var(--text-3)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Usuários Cadastrados
        </button>
        <button
          className={`inner-tab-btn ${activeSubTab === 'invitations' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('invitations')}
          style={{
            background: activeSubTab === 'invitations' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: activeSubTab === 'invitations' ? '1px solid var(--border)' : '1px solid transparent',
            color: activeSubTab === 'invitations' ? 'var(--text)' : 'var(--text-3)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Convites Enviados
        </button>
      </div>
    </>
  );
}
