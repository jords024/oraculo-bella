import React, { useRef } from 'react';

export default function PromptEditorArea({
  editorStyles,
  isRenaming,
  setIsRenaming,
  tempName,
  setTempName,
  handleRenamePrompt,
  activePrompt,
  selectedPromptId,
  lineCount,
  lineNumbers,
  handleExport,
  importInputRef,
  handleImport,
  isMaximized,
  setIsMaximized,
  handleSavePrompt,
  promptSaving,
  promptContent,
  setPromptContent
}) {
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);

  const handleScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="prompt-editor-panel" style={editorStyles}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isRenaming ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenamePrompt();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                autoFocus
                style={{
                  background: '#09090b',
                  color: '#fff',
                  border: '1px solid var(--gold)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button className="btn btn-gold" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleRenamePrompt()}>
                Salvar
              </button>
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setIsRenaming(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                {activePrompt?.name || 'Editor de Prompt'}
              </div>
              <button
                onClick={() => { setTempName(activePrompt?.name || ''); setIsRenaming(true); }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  transition: 'all 0.2s'
                }}
                title="Renomear Agente"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Renomear
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>
            Arquivo: agents/{selectedPromptId}.md · {lineCount} linha(s)
          </div>

          <button
            onClick={handleExport}
            title="Exportar todos os prompts como JSON"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-2)',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar
          </button>

          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            title="Importar prompts de um arquivo JSON"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-2)',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Importar
          </button>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-2)',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isMaximized ? (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>
                Minimizar
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                Maximizar
              </>
            )}
          </button>

          {isMaximized && (
            <button className="btn btn-gold" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={handleSavePrompt} disabled={promptSaving}>
              {promptSaving ? 'Salvando...' : 'Salvar Prompt'}
            </button>
          )}
        </div>
      </div>

      {/* Editor com Numerador de Linhas */}
      <div
        className="code-editor-container"
        style={{
          flex: 1,
          display: 'flex',
          background: '#09090b',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        <div
          ref={gutterRef}
          style={{
            padding: '14px 10px 14px 12px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRight: '1px solid var(--border)',
            color: 'var(--text-3)',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '1.6',
            textAlign: 'right',
            userSelect: 'none',
            overflowY: 'hidden',
            minWidth: '45px',
            boxSizing: 'border-box'
          }}
        >
          {lineNumbers.map(num => (
            <div key={num} style={{ opacity: 0.5 }}>{num}</div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={promptContent}
          onChange={(e) => setPromptContent(e.target.value)}
          onScroll={handleScroll}
          style={{
            flex: 1,
            background: 'transparent',
            color: '#e4e4e7',
            border: 'none',
            padding: '14px',
            fontSize: '13px',
            fontFamily: 'monospace',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            overflowX: 'hidden',
            wordBreak: 'break-word'
          }}
          placeholder="Selecione um prompt ou aguarde o carregamento..."
        />
      </div>
    </div>
  );
}
