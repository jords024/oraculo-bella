import React, { useState } from 'react';

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const diff = Math.max(0, now - new Date(timestamp).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

export default function CriadorHistorySidebar({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onTogglePinConversation,
  isOpen,
  onToggleOpen,
  syncStatus
}) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = (conversations || []).filter(c => 
    !search || (c.title && c.title.toLowerCase().includes(search.toLowerCase()))
  );

  const pinned = filtered.filter(c => c.isPinned);
  const unpinned = filtered.filter(c => !c.isPinned);

  const handleStartRename = (c, e) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = (id, e) => {
    e?.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        style={{
          position: 'absolute',
          left: '16px',
          top: '16px',
          zIndex: 40,
          background: 'rgba(24, 24, 27, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: 'var(--text-1, #EDE8DF)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease'
        }}
        title="Abrir Histórico de Conversas"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>Histórico ({conversations?.length || 0})</span>
      </button>
    );
  }

  const renderConversationItem = (c) => {
    const isActive = c.id === activeId;
    const isEditing = editingId === c.id;

    return (
      <div
        key={c.id}
        onClick={() => onSelectConversation(c.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: '8px',
          background: isActive ? 'rgba(184, 98, 62, 0.18)' : 'transparent',
          border: isActive ? '1px solid rgba(184, 98, 62, 0.4)' : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = 'transparent';
        }}
      >
        {isEditing ? (
          <div style={{ display: 'flex', gap: '4px', width: '100%', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(c.id, e);
                if (e.key === 'Escape') setEditingId(null);
              }}
              autoFocus
              style={{
                flex: 1,
                background: '#09090b',
                color: '#fff',
                border: '1px solid var(--gold, #C9A84C)',
                borderRadius: '4px',
                padding: '3px 6px',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <button
              onClick={(e) => handleSaveRename(c.id, e)}
              style={{ background: 'transparent', border: 'none', color: 'var(--gold, #C9A84C)', cursor: 'pointer', fontSize: '11px' }}
            >
              ✓
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
              style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '11px' }}
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden', flex: 1, marginRight: '6px' }}>
              <span
                style={{
                  fontSize: '12.5px',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#FFFFFF' : 'rgba(237, 232, 223, 0.85)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={c.title}
              >
                {c.title || 'Nova Conversa'}
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(237, 232, 223, 0.4)' }}>
                {c.messages?.length || 0} msgs · {formatRelativeTime(c.updatedAt || c.createdAt)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePinConversation(c.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: c.isPinned ? 'var(--gold, #C9A84C)' : 'rgba(237, 232, 223, 0.3)',
                  cursor: 'pointer',
                  padding: 0,
                  width: '26px',
                  height: '26px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={c.isPinned ? 'Desafixar conversa' : 'Fixar conversa'}
                aria-label={c.isPinned ? `Desafixar ${c.title}` : `Fixar ${c.title}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={c.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="17" x2="12" y2="22"/>
                  <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => handleStartRename(c, e)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(237, 232, 223, 0.4)',
                  cursor: 'pointer',
                  padding: 0,
                  width: '26px',
                  height: '26px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Renomear"
                aria-label={`Renomear ${c.title}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Deseja apagar a conversa "${c.title}"?`)) {
                    onDeleteConversation(c.id);
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(237, 232, 223, 0.55)',
                  cursor: 'pointer',
                  padding: 0,
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Excluir"
                aria-label={`Excluir ${c.title}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className="criador-history-sidebar"
      style={{
        width: '260px',
        background: 'rgba(18, 17, 16, 0.96)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        zIndex: 30
      }}
    >
      <div style={{ padding: '16px 12px 10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', color: 'rgba(237, 232, 223, 0.6)', textTransform: 'uppercase' }}>
            Conversas
          </span>
          <span title={syncStatus === 'offline' ? 'Salvo neste navegador; servidor indisponível' : 'Histórico sincronizado'} style={{ marginLeft: 'auto', marginRight: '8px', fontSize: '9px', color: syncStatus === 'offline' ? '#d9a05d' : 'rgba(237,232,223,.38)' }}>
            {syncStatus === 'saving' || syncStatus === 'loading' ? 'salvando…' : syncStatus === 'offline' ? 'local' : 'salvo'}
          </span>
          <button
            onClick={onToggleOpen}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(237, 232, 223, 0.5)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Recolher barra lateral"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>

        <button
          onClick={onNewConversation}
          style={{
            background: 'rgba(184, 98, 62, 0.18)',
            border: '1px solid rgba(184, 98, 62, 0.45)',
            color: '#FAF6F0',
            borderRadius: '8px',
            padding: '9px 12px',
            fontSize: '12.5px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(184, 98, 62, 0.32)';
            e.currentTarget.style.borderColor = 'rgba(184, 98, 62, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(184, 98, 62, 0.18)';
            e.currentTarget.style.borderColor = 'rgba(184, 98, 62, 0.45)';
          }}
        >
          <span style={{ fontSize: '15px', lineHeight: 1 }}>+</span>
          <span>Nova Conversa</span>
        </button>

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '6px 8px 6px 26px',
              fontSize: '11.5px',
              color: '#EDE8DF',
              outline: 'none'
            }}
          />
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ position: 'absolute', left: '8px', top: '8px', color: 'rgba(237, 232, 223, 0.4)' }}
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {pinned.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontSize: '9.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold, #C9A84C)', padding: '4px 6px' }}>
              📌 Fixadas
            </div>
            {pinned.map(renderConversationItem)}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {pinned.length > 0 && unpinned.length > 0 && (
            <div style={{ fontSize: '9.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(237, 232, 223, 0.4)', padding: '4px 6px' }}>
              Histórico Recente
            </div>
          )}
          {unpinned.length === 0 && pinned.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 10px', fontSize: '11px', color: 'rgba(237, 232, 223, 0.4)' }}>
              Nenhuma conversa salva ainda.
            </div>
          ) : (
            unpinned.map(renderConversationItem)
          )}
        </div>
      </div>
    </div>
  );
}
