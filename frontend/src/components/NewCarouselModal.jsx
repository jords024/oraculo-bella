import React, { useState } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';

export default function NewCarouselModal({ isOpen, onClose, onCreate, onSendToChat }) {
  useScrollLock(isOpen);

  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [format, setFormat] = useState('A');
  const [dir, setDir] = useState('');
  const [caption, setCaption] = useState('');
  const [notes, setNotes] = useState('');

  const [totalSlides, setTotalSlides] = useState('10');
  const [noImageSlides, setNoImageSlides] = useState('0');
  const [imageQuality, setImageQuality] = useState('high');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onCreate({ title, theme, format, dir, caption, notes, totalSlides: Number(totalSlides), noImageSlidesCount: Number(noImageSlides), imageQuality });
    onClose();
  };

  const handleSendToChat = () => {
    if (onSendToChat) {
      onSendToChat({ title, theme, format, dir, caption, notes, totalSlides: Number(totalSlides), noImageSlidesCount: Number(noImageSlides), imageQuality });
    }
    onClose();
  };

  return (
    <div className="form-modal open" id="new-modal">
      <div className="form-box" style={{ padding: '20px 24px', maxWidth: '480px' }}>
        <div className="form-title" style={{ marginBottom: '12px' }}>+ NOVO CARROSSEL</div>
        <div className="form-group" style={{ marginBottom: '10px' }}>
          <label className="form-label">Título / Gancho</label>
          <input className="form-input" placeholder="Ex: O que a física prova sobre dinheiro..." value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Tema</label>
            <input className="form-input" placeholder="Ex: frequencia-dinheiro" value={theme} onChange={e => setTheme(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Formato</label>
            <select className="form-select" value={format} onChange={e => setFormat(e.target.value)}>
              <option value="TAFA">Método T.A.F.A (Isabella Dalcin / Academia Sete)</option>
              <option value="BRANDS_PRINCIPAL">BrandsDecoded — Principal 01 (Estudo de Caso)</option>
              <option value="BRANDS_AUTORAL">BrandsDecoded — Autoral 02 (Editorial / Tese)</option>
              <option value="A">A — Tese + Tradução</option>
              <option value="B">B — Demolição + Reconstrução</option>
              <option value="C">C — Lista Revelação</option>
              <option value="D">D — História + Verdade</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Total de Slides</label>
            <input type="number" className="form-input" min="1" max="20" value={totalSlides} onChange={e => setTotalSlides(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Slides Sem Imagem</label>
            <input type="number" className="form-input" min="0" max={totalSlides} value={noImageSlides} onChange={e => setNoImageSlides(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Qualidade</label>
            <select className="form-select" value={imageQuality} onChange={e => setImageQuality(e.target.value)}>
              <option value="auto">Auto</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="standard">Padrão (DALL-E 3)</option>
              <option value="hd">HD (DALL-E 3)</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '10px' }}>
          <label className="form-label">Pasta das artes (caminho completo)</label>
          <input className="form-input" placeholder="C:/Users/julia/Desktop/nome-da-pasta" value={dir} onChange={e => setDir(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: '10px' }}>
          <label className="form-label">Caption (texto para o post)</label>
          <textarea className="form-textarea" rows="2" style={{ minHeight: '50px' }} placeholder="Caption para publicar junto ao carrossel..." value={caption} onChange={e => setCaption(e.target.value)}></textarea>
        </div>
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label">Notas internas</label>
          <textarea className="form-textarea" rows="2" style={{ minHeight: '50px' }} placeholder="Observações, modelo usado, bolha A/B..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
        </div>
        <div className="form-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          {onSendToChat && (
            <button className="btn btn-outline" onClick={handleSendToChat}>Enviar para Chat</button>
          )}
          <button className="btn btn-gold" onClick={handleSubmit}>Criar Rascunho</button>
        </div>
      </div>
    </div>
  );
}
