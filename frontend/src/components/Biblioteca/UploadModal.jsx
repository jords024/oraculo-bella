import React, { useState, useRef } from 'react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

export default function UploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  existingCategories = [],
  showToast
}) {
  useLockBodyScroll(isOpen);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [category, setCategory] = useState('Geral');
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    previews.forEach(url => {
      try { URL.revokeObjectURL(url); } catch { /* ignore */ }
    });
    setFiles([]);
    setPreviews([]);
    setCategory('Geral');
    setCustomCategory('');
    setTitle('');
    setNotes('');
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toda vez que o modal for aberto, garante que abre 100% limpo
  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    if (uploading) return;
    resetForm();
    onClose();
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !uploading) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, uploading]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setFiles(selectedFiles);
    if (selectedFiles.length === 1 && !title) {
      const ext = selectedFiles[0].name.lastIndexOf('.');
      const cleanName = ext !== -1 ? selectedFiles[0].name.substring(0, ext) : selectedFiles[0].name;
      setTitle(cleanName);
    }

    // Gerar previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      if (droppedFiles.length === 1 && !title) {
        const ext = droppedFiles[0].name.lastIndexOf('.');
        const cleanName = ext !== -1 ? droppedFiles[0].name.substring(0, ext) : droppedFiles[0].name;
        setTitle(cleanName);
      }
      setPreviews(droppedFiles.map(f => URL.createObjectURL(f)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      if (showToast) showToast('Selecione ao menos uma imagem.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const finalCategory = category === '__nova__' ? (customCategory.trim() || 'Geral') : category;
    formData.append('category', finalCategory);
    formData.append('notes', notes.trim());
    if (title.trim()) {
      formData.append('customTitle', title.trim());
    }

    try {
      const token = localStorage.getItem('fo_token');
      const res = await fetch('/api/library/upload', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        if (showToast) showToast(`✨ ${data.count || files.length} imagem(ns) adicionada(s) à biblioteca!`);
        onUploadSuccess();
        onClose();
      } else {
        if (showToast) showToast(`Erro: ${data.error || 'Falha no upload'}`);
      }
    } catch {
      if (showToast) showToast('Erro de conexão no upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-modal open">
      <div className="form-box" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span>📸</span> Fazer Upload de Imagens de Referência
          </h3>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-3, #a1a1aa)',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}
            title="Fechar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Dropzone ── */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed rgba(201, 168, 76, 0.4)',
              borderRadius: '10px',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(0, 0, 0, 0.25)',
              marginBottom: '16px',
              transition: 'all 0.2s'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/png, image/jpeg, image/webp"
              style={{ display: 'none' }}
            />

            {previews.length === 0 ? (
              <div>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📤</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                  Arraste imagens aqui ou clique para selecionar
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-3, #a1a1aa)', marginTop: '4px' }}>
                  Suporta PNG, JPG, WEBP até 25MB
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {previews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt="Preview"
                    style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--gold, #c9a84c)' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Título (se 1 arquivo) ── */}
          {files.length <= 1 && (
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Título da Imagem</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: mulerm_ruiva, cozinha_apocalipse"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          )}

          {/* ── Categoria ── */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Categoria / Tag</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {existingCategories.filter(c => c !== 'Todas').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__nova__">+ Criar Nova Categoria...</option>
            </select>
          </div>

          {category === '__nova__' && (
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Nome da Nova Categoria</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Personagens, Fundos, Vetores"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* ── Notas / Prompt de Referência ── */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Anotações / Prompt de Estilo (Opcional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Descreva detalhes específicos desta referência que a IA deve replicar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* ── Botões de Ação ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleClose}
              disabled={uploading}
            >
              Fechar
            </button>
            <button
              type="submit"
              className="btn btn-gold"
              disabled={uploading || files.length === 0}
            >
              {uploading ? 'Enviando...' : 'Salvar na Biblioteca'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
