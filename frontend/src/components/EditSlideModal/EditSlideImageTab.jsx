import React, { useState, useEffect, useRef } from 'react';
import ReferenceAutocompleteMenu from './ReferenceAutocompleteMenu';
import SelectedReferencesBar from './SelectedReferencesBar';

export default function EditSlideImageTab({
  slideMeta,
  setSlideMeta,
  saving,
  onClose,
  handleRegen,
  showToast
}) {
  const [libraryImages, setLibraryImages] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef(null);

  // Carrega imagens da biblioteca ao abrir a aba
  const fetchLibrary = async () => {
    try {
      const token = localStorage.getItem('fo_token') || '';
      const res = await fetch('/api/library', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.images)) {
          setLibraryImages(data.images);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar biblioteca para referências:', err);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const selectedReferences = Array.isArray(slideMeta.reference_images)
    ? slideMeta.reference_images
    : [];

  const selectedIds = selectedReferences.map(r => r.id);

  // Filtra as imagens baseado no texto após o @
  const filteredImages = libraryImages.filter(img => {
    if (!mentionQuery) return true;
    const q = mentionQuery.toLowerCase();
    return (
      (img.title && img.title.toLowerCase().includes(q)) ||
      (img.category && img.category.toLowerCase().includes(q)) ||
      (img.notes && img.notes.toLowerCase().includes(q))
    );
  }).slice(0, 15);

  const checkMentionAtCursor = (val, cursorPos) => {
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const queryAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Se não contém quebra de linha após o @, ativa o menu de autocomplete
      if (!/[\n\r]/.test(queryAfterAt)) {
        setMentionQuery(queryAfterAt.trim());
        setShowMentions(true);
        setSelectedIndex(0);
        if (libraryImages.length === 0) fetchLibrary();
        return;
      }
    }

    setShowMentions(false);
  };

  const handlePromptChange = (e) => {
    const val = e.target.value;
    setSlideMeta(prev => ({ ...prev, prompt: val }));
    const cursorPos = e.target.selectionStart;
    checkMentionAtCursor(val, cursorPos);
  };

  const handleCursorMove = (e) => {
    const val = e.target.value || '';
    const cursorPos = e.target.selectionStart || val.length;
    checkMentionAtCursor(val, cursorPos);
  };

  const selectMention = (image) => {
    if (selectedIds.includes(image.id)) {
      if (typeof showToast === 'function') {
        showToast('Esta imagem já foi adicionada como referência.', 'info');
      }
      setShowMentions(false);
      return;
    }

    if (selectedReferences.length >= 3) {
      if (typeof showToast === 'function') {
        showToast('Máximo de 3 imagens de referência permitidas.', 'warning');
      } else {
        alert('Máximo de 3 imagens de referência permitidas.');
      }
      setShowMentions(false);
      return;
    }

    // Adiciona a imagem de referência
    const newRefs = [
      ...selectedReferences,
      {
        id: image.id,
        title: image.title || 'Imagem de Referência',
        category: image.category || 'Geral',
        filename: image.filename,
        url: image.url || `/api/library/${image.id}/image`
      }
    ];

    setSlideMeta(prev => ({
      ...prev,
      reference_images: newRefs,
      reference_ids: newRefs.map(r => r.id)
    }));

    // Remove o termo "@termo" do input ou limpa o @ digitado
    const currentPrompt = slideMeta.prompt || '';
    const cursorPos = textareaRef.current ? textareaRef.current.selectionStart : currentPrompt.length;
    const textBeforeCursor = currentPrompt.slice(0, cursorPos);
    const textAfterCursor = currentPrompt.slice(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const newPrompt = textBeforeCursor.slice(0, lastAtIndex) + textAfterCursor;
      setSlideMeta(prev => ({ ...prev, prompt: newPrompt }));
    }

    setShowMentions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleRemoveReference = (idToRemove) => {
    const updatedRefs = selectedReferences.filter(r => r.id !== idToRemove);
    setSlideMeta(prev => ({
      ...prev,
      reference_images: updatedRefs,
      reference_ids: updatedRefs.map(r => r.id)
    }));
  };

  const handleKeyDown = (e) => {
    if (showMentions && filteredImages.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredImages.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredImages.length) % filteredImages.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectMention(filteredImages[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentions(false);
        return;
      }
    }
  };

  return (
    <div className="edit-panel-content">
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label className="form-label" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-2, #e4e4e7)', margin: 0 }}>
            Prompt Visual
          </label>
          <button
            type="button"
            onClick={() => {
              setShowMentions(prev => !prev);
              setMentionQuery('');
              setSelectedIndex(0);
              if (libraryImages.length === 0) fetchLibrary();
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '11px',
              color: 'var(--gold, #c9a84c)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {showMentions ? 'Fechar lista (@)' : 'Dica: Digite @ para referências'}
          </button>
        </div>

        <textarea 
          ref={textareaRef}
          className="form-textarea" 
          style={{ 
            minHeight: '120px', 
            width: '100%', 
            padding: '10px', 
            background: '#09090b', 
            color: '#fff', 
            border: '1px solid var(--border, #27272a)', 
            borderRadius: '6px',
            fontSize: '13px',
            lineHeight: '1.5'
          }} 
          value={slideMeta.prompt || ''} 
          onChange={handlePromptChange}
          onKeyUp={handleCursorMove}
          onClick={handleCursorMove}
          onKeyDown={handleKeyDown}
          placeholder="Descreva a cena visual que deseja gerar... (Digite @ para adicionar referências da biblioteca)"
        />

        {showMentions && (
          <ReferenceAutocompleteMenu
            filteredImages={filteredImages}
            selectedIndex={selectedIndex}
            onSelect={selectMention}
            onMouseEnter={idx => setSelectedIndex(idx)}
            onClose={() => setShowMentions(false)}
            mentionQuery={mentionQuery}
            selectedIds={selectedIds}
          />
        )}
      </div>

      {/* Barra de Imagens de Referência Selecionadas */}
      <SelectedReferencesBar
        selectedReferences={selectedReferences}
        onRemoveReference={handleRemoveReference}
        onOpenPicker={() => {
          setMentionQuery('');
          setShowMentions(true);
          setSelectedIndex(0);
          if (libraryImages.length === 0) fetchLibrary();
          if (textareaRef.current) textareaRef.current.focus();
        }}
      />

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-2)' }}>
          Formato de Exibição (Layout do Slide)
        </label>
        <select 
          className="form-select" 
          style={{ width: '100%', padding: '8px', background: '#09090b', color: '#fff', border: '1px solid var(--border)', borderRadius: '6px' }} 
          value={slideMeta.layout} 
          onChange={e => setSlideMeta(prev => ({ ...prev, layout: e.target.value }))}
        >
          <option value="dramatico">Esquerda Dramático (Dramático — Imagem na tela cheia com texto alinhado à esquerda)</option>
          <option value="fullbleed">Inferior Centralizado (Fullbleed — Imagem na tela cheia com texto centralizado)</option>
          <option value="etereo">Esquerda Luminoso (Etéreo — Imagem suave na tela cheia)</option>
          <option value="card">Moldura Retangular (Card — Imagem dentro da caixa superior com texto embaixo)</option>
          <option value="text_only">Apenas Texto (Sem imagem)</option>
        </select>
        <p style={{ color: 'var(--gold)', fontSize: '11px', marginTop: '6px', lineHeight: '1.4' }}>
          {slideMeta.layout === 'card' 
            ? '📌 Modo Moldura (Card): a imagem é cortada e encaixada dentro de uma caixa com borda dourada.'
            : '✨ Modo Tela Cheia: a imagem preenche todo o fundo do slide com gradiente escuro profissional para destacar o título e o texto.'}
        </p>
      </div>

      <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={onClose}>Fechar</button>
        <button type="button" className="btn btn-gold" onClick={handleRegen} disabled={saving}>
          {saving ? 'Gerando...' : 'Gerar Nova Imagem 🎨'}
        </button>
      </div>
    </div>
  );
}
