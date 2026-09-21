import React from 'react';
import ChatWelcomeGuide from './ChatWelcomeGuide';

export default function ChatMessages({
  messages,
  generating,
  onRequestCancel,
  onSaveToLibrary,
  onPreviewImage,
  onSelectPrompt,
  showToast,
  scrollAnchorRef
}) {
  const handleCopyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    if (showToast) showToast('Prompt copiado para a área de transferência!');
  };

  const handleDownload = async (url, filename) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `gerada_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (showToast) showToast('Download iniciado!');
    } catch {
      if (showToast) showToast('Erro ao baixar imagem.');
    }
  };

  return (
    <div className="assistant-chat-scroll">
      {messages.length === 0 && !generating && (
        <ChatWelcomeGuide onSelectPrompt={onSelectPrompt} />
      )}

      {messages.map((msg, index) => {
        if (msg.role === 'user') {
          const refs = msg.references || [];
          return (
            <div key={msg.id || index} style={{ alignSelf: 'flex-end', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '85%', marginBottom: '12px' }}>
              <div className="chat-bubble-user" style={{ width: '100%' }}>
                <div style={{ wordBreak: 'break-word', fontSize: '13px', lineHeight: '1.4' }}>
                  {msg.content}
                </div>

                {refs.length > 0 && (
                  <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(0, 0, 0, 0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🖼️</span> Referência Anexada:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                      {refs.map((r, rIdx) => (
                        <div
                          key={r.id || rIdx}
                          onClick={() => onPreviewImage && onPreviewImage({ url: r.url, title: r.title || 'Imagem de Referência' })}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(0, 0, 0, 0.25)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          title={`Clique para ampliar "${r.title || 'Referência'}"`}
                        >
                          {r.url && (
                            <img
                              src={r.url}
                              alt=""
                              style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          )}
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#18181b', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r.title || 'Imagem'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }

        // Mensagem da IA
        return (
          <div key={msg.id || index} className="chat-bubble-ai-card">
            {msg.imageUrl && (
              <div className="chat-ai-img-wrap" onClick={() => onPreviewImage({ url: msg.imageUrl, title: msg.generatedPrompt || 'Imagem Gerada' })}>
                <img
                  src={msg.imageUrl}
                  alt={msg.generatedPrompt || 'Imagem gerada pela IA'}
                  className="chat-ai-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {msg.generatedPrompt && (
              <div className="chat-ai-prompt-box">
                <strong>Prompt Gerado: </strong>
                {msg.generatedPrompt}
              </div>
            )}

            {/* ── Modelo de IA e Custo em Reais (1 USD = 5 BRL) ── */}
            {msg.imageUrl && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                fontSize: '11px',
                color: 'var(--text-3, #a1a1aa)',
                padding: '6px 10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '6px',
                margin: '6px 0 8px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>🤖 Modelo:</span>
                  <strong style={{ color: 'var(--text-1, #f4f4f5)' }}>{msg.model || 'gpt-image-1'}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>💰 Custo:</span>
                  <strong style={{ color: '#10b981' }}>{msg.costFormatted || (msg.costBrl ? `R$ ${msg.costBrl.toFixed(2).replace('.', ',')}` : 'R$ 0,20')}</strong>
                  <span style={{ fontSize: '9px', color: 'var(--text-3, #71717a)' }}>($0.04 USD)</span>
                </span>
              </div>
            )}

            {msg.warning && (
              <div style={{
                margin: '8px 0',
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#fca5a5',
                lineHeight: '1.4'
              }}>
                {msg.warning}
              </div>
            )}

            {msg.content && !msg.generatedPrompt && (
              <div style={{ fontSize: '12px', color: '#e4e4e7', lineHeight: '1.45' }}>
                {msg.content}
              </div>
            )}

            {msg.imageUrl && (
              <div className="chat-ai-actions-bar">
                <button
                  className="chat-ai-action-btn btn-save-lib"
                  onClick={() => onSaveToLibrary(msg)}
                  title="Salvar esta imagem no catálogo da biblioteca"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Salvar na Biblioteca
                </button>

                <button
                  className="chat-ai-action-btn"
                  onClick={() => handleDownload(msg.imageUrl, msg.filename)}
                  title="Baixar imagem"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Baixar
                </button>

                <button
                  className="chat-ai-action-btn"
                  onClick={() => handleCopyPrompt(msg.generatedPrompt || msg.content)}
                  title="Copiar prompt gerado"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copiar Prompt
                </button>
              </div>
            )}
          </div>
        );
      })}

      {generating && (
        <div className="chat-bubble-ai-card" style={{ padding: '20px', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            border: '2px solid rgba(201, 168, 76, 0.2)',
            borderTopColor: 'var(--gold, #c9a84c)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{ fontSize: '12px', color: 'var(--gold, #c9a84c)', fontWeight: '500' }}>
            Criando imagem e aplicando referências visuais...
          </span>

          {onRequestCancel && (
            <button
              type="button"
              className="btn-cancel-generation"
              onClick={onRequestCancel}
              title="Interromper criação de imagem"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Cancelar Geração
            </button>
          )}
        </div>
      )}

      <div ref={scrollAnchorRef} style={{ height: '1px' }} />
    </div>
  );
}
