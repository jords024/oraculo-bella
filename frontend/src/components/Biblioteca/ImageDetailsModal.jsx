import React, { useState, useEffect } from 'react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

export default function ImageDetailsModal({
  isOpen,
  image,
  onClose,
  onSaveMetadata,
  showToast
}) {
  useLockBodyScroll(isOpen);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Geral');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (image) {
      setTitle(image.title || '');
      setCategory(image.category || 'Geral');
      setNotes(image.notes || '');
    }
  }, [image]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  const handleCopyUrl = () => {
    const fullUrl = image.url.startsWith('http') ? image.url : `${window.location.origin}${image.url}`;
    navigator.clipboard.writeText(fullUrl);
    if (showToast) showToast('Link da imagem copiado!');
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = image.url;
    a.download = image.filename || `${image.title}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (showToast) showToast('Download iniciado!');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!image.id) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('fo_token');
      const res = await fetch(`/api/library/${image.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ title, category, notes })
      });

      if (res.ok) {
        if (showToast) showToast('Informações salvas com sucesso!');
        if (onSaveMetadata) onSaveMetadata();
        onClose();
      } else {
        if (showToast) showToast('Erro ao salvar alterações.');
      }
    } catch {
      if (showToast) showToast('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-modal open">
      <div className="form-box" style={{ maxWidth: '780px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'row', minHeight: '440px' }}>
        {/* ── Lado Esquerdo: Imagem Ampliada ── */}
        <div style={{ flex: 1.2, background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
          <img
            src={image.url}
            alt={image.title}
            style={{ maxWidth: '100%', maxHeight: '440px', objectFit: 'contain', borderRadius: '6px' }}
          />
        </div>

        {/* ── Lado Direito: Metadados e Edição ── */}
        <div style={{ flex: 1, padding: '24px', background: '#121214', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: (image.created_at || image.createdAt) ? '6px' : '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
              Detalhes da Imagem
            </h3>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', fontSize: '18px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {(image.created_at || image.createdAt) && (
            <div style={{ fontSize: '11px', color: 'var(--text-3, #71717a)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>🕒 Data do Upload:</span>
              <strong style={{ color: 'var(--gold, #c9a84c)' }}>
                {new Date(image.created_at || image.createdAt).toLocaleString('pt-BR')}
              </strong>
            </div>
          )}

          {/* Procedência e Modelo de IA */}
          <div style={{ marginBottom: '14px' }}>
            {image.source === 'ai' || image.prompt ? (
              <div style={{ 
                fontSize: '11px', 
                color: '#06b6d4', 
                background: 'rgba(6, 182, 212, 0.1)', 
                border: '1px solid rgba(6, 182, 212, 0.25)', 
                padding: '5px 9px', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>🤖</span>
                <span><strong>Gerada por IA:</strong> Modelo {(image.ai_model || 'gpt-image-2').toUpperCase()}</span>
              </div>
            ) : (
              <div style={{ 
                fontSize: '11px', 
                color: 'var(--text-2, #e4e4e7)', 
                background: 'rgba(255, 255, 255, 0.04)', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                padding: '5px 9px', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>📤</span>
                <span><strong>Upload Manual</strong></span>
              </div>
            )}
          </div>

          <form onSubmit={handleSave} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Título</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!image.id}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoria</label>
              <input
                type="text"
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={!image.id}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Anotações / Prompt de Estilo</label>
              <textarea
                className="form-textarea"
                style={{ height: '80px', resize: 'none' }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!image.id}
              />
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, fontSize: '11px', padding: '8px 6px' }}
                onClick={handleCopyUrl}
              >
                🔗 Copiar URL
              </button>

              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, fontSize: '11px', padding: '8px 6px' }}
                onClick={handleDownload}
              >
                ⬇️ Baixar
              </button>

              {image.id && (
                <button
                  type="submit"
                  className="btn btn-gold"
                  style={{ flex: 1.2, fontSize: '11px', padding: '8px 6px' }}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
