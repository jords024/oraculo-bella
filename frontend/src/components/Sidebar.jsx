import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, branding, onNewCarousel, currentUser }) {
  const categories = [
    {
      title: 'Criação',
      items: [
        { id: 'carrosseis', label: 'Carrosséis', icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
          </svg>
        )},
        { id: 'criador', label: 'Criador', icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        )},
        { id: 'calendario', label: 'Calendário', icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        )},
        { id: 'biblioteca', label: 'Biblioteca', icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        )},
        { id: 'financeiro', label: 'Financeiro', icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        )}
      ]
    },
    {
      title: 'Ferramentas',
      items: [
        { id: 'reels', label: 'Clonador de Reels', icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
        )},
        { id: 'fabrica', label: 'Fábrica de Vídeos', icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
        )}
      ]
    },
    {
      title: 'Análise',
      items: [
        { id: 'oraculo', label: 'Oráculo', icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        )},
        { id: 'radar', label: 'Radar', icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="6"/>
          </svg>
        )}
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-bar"></div>
        <div>
          <div className="brand-name">{branding?.companyName || branding?.logoText || 'FONTE OCULTA'}</div>
          <div className="brand-sub">{branding?.logoSub || 'Produção'}</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {categories.map(cat => {
          const filteredItems = cat.items.filter(item => {
            const access = currentUser?.permissions?.[item.id];
            return access !== 'bloqueado';
          });
          if (filteredItems.length === 0) return null;
          return (
            <React.Fragment key={cat.title}>
              <div className="sidebar-category-title">{cat.title}</div>
              {filteredItems.map(tab => {
                const access = currentUser?.permissions?.[tab.id];
                const isSoon = access === 'em_breve';
                return (
                  <button
                    key={tab.id}
                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      {tab.icon}
                      {tab.label}
                    </div>
                    {isSoon && (
                      <span style={{ 
                        fontSize: '9px', 
                        background: 'rgba(212, 163, 89, 0.15)', 
                        color: 'var(--gold)', 
                        padding: '2px 6px', 
                        borderRadius: '10px', 
                        border: '1px solid rgba(212, 163, 89, 0.3)',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Breve
                      </span>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          );
        })}
        
        <div className="sidebar-category-title">Painel</div>
        {(currentUser?.isSuperAdmin || currentUser?.role === 'admin') && (
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            style={{ marginBottom: '4px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Gestão de Usuários
          </button>
        )}
        {currentUser?.isSuperAdmin && (
          <>
            <button
              className={`nav-item ${activeTab === 'backups' ? 'active' : ''}`}
              onClick={() => setActiveTab('backups')}
              style={{ marginBottom: '4px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Backups do Banco
            </button>
            <button
              className={`nav-item ${activeTab === 'escala' ? 'active' : ''}`}
              onClick={() => setActiveTab('escala')}
              style={{ marginBottom: '4px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Teste de Escala
            </button>
          </>
        )}
        <button
          className={`nav-item ${activeTab === 'configuracoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuracoes')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Configurações
        </button>
      </nav>
      <div className="sidebar-footer">
        <button className="btn-sidebar-action" onClick={onNewCarousel}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Carrossel
        </button>
        <button onClick={() => window.dispatchEvent(new CustomEvent('show-logout-modal'))} className="btn-logout" title="Sair" style={{ background: 'transparent', border: 'none', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left', padding: '10px 16px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}
