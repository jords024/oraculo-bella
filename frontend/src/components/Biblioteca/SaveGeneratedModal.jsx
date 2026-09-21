import React, { useState, useEffect } from 'react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

export default function SaveGeneratedModal({
  isOpen,
  item,
  onClose,
  onConfirmSave,
  saving
}) {
  useLockBodyScroll(isOpen);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('IA Gerada');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (item) {
      const initialPrompt = item.prompt || item.generatedPrompt || '';
      // Sugere um título limpo baseado no prompt ou padrão
      const suggestedTitle = initialPrompt
        ? initialPrompt.replace(/[^\w\sÀ-ÿ]/gi, '').trim().substring(0, 40)
        : 'Imagem Gerada por IA';
      
      setTitle(suggestedTitle || 'Imagem Gerada por IA');
      setPrompt(item.generatedPrompt || item.prompt || '');
      setCategory('IA Gerada');
      setNotes('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onConfirmSave({
      filename: item.filename,
      title: title.trim(),
      prompt: prompt.trim(),
      category: category.trim() || 'IA Gerada',
      notes: notes.trim()
    });
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        // Não fecha ao clicar fora (conforme regra de popups)
        e.stopPropagation();
      }}
    >
      <div
        className="modal-content glass-panel"
        style={{
          background: '#121214',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.12))',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '520px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Cabeçalho do Modal ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>💾</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff' }}>
              Salvar na Biblioteca Principal
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-3, #a1a1aa)',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Prévia e Formulário ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Card de Preview da Imagem */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <img
              src={item.imageUrl}
              alt="Prévia"
              style={{ width: '64px', height: '64px', objectFit: 'contain', background: '#09090b', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-3, #a1a1aa)' }}>Arquivo gerado</div>
              <div style={{ fontSize: '12px', color: '#fff', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.filename}
              </div>
              <div style={{ fontSize: '10px', color: '#10b981', marginTop: '2px' }}>
                {item.model || 'gpt-image-1'} • {item.costFormatted || 'R$ 0,20'}
              </div>
            </div>
          </div>

          {/* Campo: Título da Imagem */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-2, #d4d4d8)', marginBottom: '6px' }}>
              Título da Imagem <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Personagem Guerreiro Sombrio"
              disabled={saving}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border, rgba(255, 255, 255, 0.12))',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Campo: Prompt Utilizado */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-2, #d4d4d8)', marginBottom: '6px' }}>
              Prompt de Criação
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Prompt utilizado na geração da imagem..."
              disabled={saving}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border, rgba(255, 255, 255, 0.12))',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                color: '#fff',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                lineHeight: '1.4'
              }}
            />
          </div>

          {/* Grid de Categoria e Notas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-2, #d4d4d8)', marginBottom: '6px' }}>
                Categoria
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: IA Gerada, Personagem"
                disabled={saving}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border, rgba(255, 255, 255, 0.12))',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-2, #d4d4d8)', marginBottom: '6px' }}>
                Notas (Opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Estilo futurista"
                disabled={saving}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border, rgba(255, 255, 255, 0.12))',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* ── Rodapé com Botões de Ação ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#d4d4d8',
                fontSize: '12px',
                fontWeight: '600',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!title.trim() || saving}
              style={{
                background: 'var(--gold, #c9a84c)',
                border: 'none',
                color: '#09090b',
                fontSize: '12px',
                fontWeight: '700',
                padding: '8px 20px',
                borderRadius: '6px',
                cursor: (!title.trim() || saving) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: (!title.trim() || saving) ? 0.6 : 1
              }}
            >
              {saving ? (
                <>
                  <div style={{ width: '12px', height: '12px', border: '2px solid #09090b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Salvando...
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Salvar na Biblioteca
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
