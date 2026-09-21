import React, { useState, useRef, useEffect } from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import GeneratedGallery from './GeneratedGallery';

export default function AssistantDrawer({
  isOpen,
  onClose,
  selectedReferences = [],
  onRemoveReference,
  onAddReference,
  allImages = [],
  messages = [],
  generatedImages = [],
  onSendMessage,
  onClearChat,
  generating,
  onRequestCancel,
  onSaveToLibrary,
  onPreviewImage,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' ou 'generated'
  const scrollAnchorRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, generating, activeTab]);

  if (!isOpen) return null;

  return (
    <aside className="assistant-drawer">
      {/* ── Header ── */}
      <div className="assistant-header">
        <div className="assistant-header-titles">
          <h2>Assistente de Criação IA</h2>
          <p>Histórico de Conversas e Gerações</p>
        </div>

        <div className="assistant-header-actions">
          <button
            className="assistant-btn-clear"
            onClick={onClearChat}
            title="Limpar histórico de mensagens"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Limpar
          </button>

          <button
            className="assistant-btn-close"
            onClick={onClose}
            title="Fechar assistente"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Tabs Bar ── */}
      <div className="assistant-tabs-bar">
        <button
          className={`assistant-tab-pill ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <span>🟡</span> Conversa ({messages.length})
        </button>

        <button
          className={`assistant-tab-pill ${activeTab === 'generated' ? 'active' : ''}`}
          onClick={() => setActiveTab('generated')}
        >
          <span>🎨</span> Geradas ({generatedImages.length})
        </button>
      </div>

      {/* ── Seção de Imagens de Entrada ── */}
      <div className="assistant-references-box">
        <div className="assistant-references-title">
          IMAGENS DE ENTRADA ({selectedReferences.length}/5)
        </div>
        <div className="assistant-references-subtitle">
          Selecione até 5 imagens na galeria ou digite @ no chat abaixo.
        </div>

        {selectedReferences.length > 0 && (
          <div className="assistant-chips-list">
            {selectedReferences.map(ref => (
              <div key={ref.id} className="assistant-chip">
                <img
                  src={ref.url}
                  alt={ref.title}
                  className="assistant-chip-img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ref.title}
                </span>
                <button
                  className="assistant-chip-remove"
                  onClick={() => onRemoveReference(ref.id)}
                  title="Remover referência"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Conteúdo da Aba Ativa ── */}
      {activeTab === 'chat' && (
        <>
          <ChatMessages
            messages={messages}
            generating={generating}
            onRequestCancel={onRequestCancel}
            onSaveToLibrary={onSaveToLibrary}
            onPreviewImage={onPreviewImage}
            onSelectPrompt={onSendMessage}
            showToast={showToast}
            scrollAnchorRef={scrollAnchorRef}
          />

          <ChatInput
            onSend={onSendMessage}
            generating={generating}
            allImages={allImages}
            onAddReference={onAddReference}
          />
        </>
      )}

      {activeTab === 'generated' && (
        <GeneratedGallery
          generatedImages={generatedImages}
          onPreviewImage={onPreviewImage}
          onSaveToLibrary={onSaveToLibrary}
          showToast={showToast}
        />
      )}
    </aside>
  );
}
