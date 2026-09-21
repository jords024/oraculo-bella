import React from 'react';

export default function MaximizedPromptModal({
  maximizedAgent,
  setMaximizedAgent,
  handleCopy,
  copiedPromptKey
}) {
  if (!maximizedAgent) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 10005,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          width: '95%',
          maxWidth: '1200px',
          height: '85vh',
          backgroundColor: '#0c0d12',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header do Modal Maximizado */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: maximizedAgent.color || '#a78bfa' }}>
              🎭 {maximizedAgent.name}
            </span>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: 'monospace'
            }}>
              {maximizedAgent.id}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => handleCopy(maximizedAgent.content, maximizedAgent.id)}
              style={{
                padding: '6px 14px',
                backgroundColor: copiedPromptKey === maximizedAgent.id ? '#22c55e' : 'rgba(201, 168, 76, 0.2)',
                color: copiedPromptKey === maximizedAgent.id ? '#fff' : 'var(--gold, #c9a84c)',
                border: '1px solid rgba(201, 168, 76, 0.4)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {copiedPromptKey === maximizedAgent.id ? '✓ Copiado!' : '📋 Copiar Prompt'}
            </button>
            <button
              type="button"
              onClick={() => setMaximizedAgent(null)}
              style={{
                padding: '6px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ✕ Fechar
            </button>
          </div>
        </div>

        {/* Conteúdo do Prompt Maximizado */}
        <pre
          className="custom-pipeline-scroll"
          style={{
            margin: 0,
            padding: '24px',
            fontSize: '13px',
            lineHeight: '1.6',
            fontFamily: 'Consolas, Monaco, monospace',
            whiteSpace: 'pre-wrap',
            color: '#e4e4e7',
            backgroundColor: '#090a0f',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {maximizedAgent.content}
        </pre>
      </div>
    </div>
  );
}
