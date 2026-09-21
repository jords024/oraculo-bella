// frontend/src/components/Biblioteca/ChatInput.jsx — Input com suporte a menções @ e autocomplete
import React, { useState, useRef, useEffect } from 'react';

export default function ChatInput({
  onSend,
  generating,
  allImages,
  onAddReference
}) {
  const [text, setText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef(null);

  // Filtra as imagens baseado no texto após o @
  const filteredImages = allImages.filter(img => {
    if (!mentionQuery) return true;
    const q = mentionQuery.toLowerCase();
    return (
      img.title.toLowerCase().includes(q) ||
      (img.category && img.category.toLowerCase().includes(q))
    );
  }).slice(0, 8);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setText(val);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const queryAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Se não contém espaço após o @, ativa o menu de autocomplete
      if (!/\s/.test(queryAfterAt)) {
        setMentionQuery(queryAfterAt);
        setShowMentions(true);
        setSelectedIndex(0);
        return;
      }
    }

    setShowMentions(false);
  };

  const selectMention = (image) => {
    if (onAddReference) {
      onAddReference(image);
    }

    // Remove o "@termo" do input
    const cursorPos = textareaRef.current ? textareaRef.current.selectionStart : text.length;
    const textBeforeCursor = text.slice(0, cursorPos);
    const textAfterCursor = text.slice(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const newText = textBeforeCursor.slice(0, lastAtIndex) + textAfterCursor;
      setText(newText);
    }

    setShowMentions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || generating) return;
    onSend(text);
    setText('');
    setShowMentions(false);
  };

  return (
    <div className="assistant-input-area">
      {showMentions && filteredImages.length > 0 && (
        <div className="mention-autocomplete-menu">
          <div style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--gold, #c9a84c)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: '600' }}>
            Selecione uma imagem de referência (@):
          </div>
          {filteredImages.map((img, idx) => (
            <div
              key={img.id}
              className={`mention-item ${idx === selectedIndex ? 'active' : ''}`}
              onClick={() => selectMention(img)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <img
                src={img.url}
                alt={img.title}
                className="mention-item-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="mention-item-name">{img.title}</span>
              <span className="mention-item-cat">{img.category || 'Geral'}</span>
            </div>
          ))}
        </div>
      )}

      <div className="assistant-input-box">
        <textarea
          ref={textareaRef}
          className="assistant-textarea"
          placeholder="Digite @ para listar referências..."
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={generating}
        />

        <button
          className="assistant-send-btn"
          onClick={handleSubmit}
          disabled={!text.trim() || generating}
          title="Enviar mensagem para o assistente"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
