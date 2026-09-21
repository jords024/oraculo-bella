import React, { useEffect } from 'react';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

export default function ImageLightboxModal({
  isOpen,
  image,
  onClose,
  onOpenEdit,
  showToast
}) {
  useLockBodyScroll(isOpen);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  const handleCopyUrl = (e) => {
    e.stopPropagation();
    const fullUrl = image.url?.startsWith('http') ? image.url : `${window.location.origin}${image.url}`;
    navigator.clipboard.writeText(fullUrl);
    if (showToast) showToast('Link da imagem copiado com sucesso!');
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = image.url;
    a.download = image.filename || `${image.title || 'imagem'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (showToast) showToast('Download iniciado!');
  };

  const uploadDate = image.created_at || image.createdAt
    ? new Date(image.created_at || image.createdAt).toLocaleString('pt-BR')
    : '';

  return (
    <div
      className="form-modal open"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="form-box"
        style={{
          maxWidth: '92vw',
          maxHeight: '92vh',
          width: 'auto',
          background: 'rgba(18, 18, 20, 0.98)',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(201, 168, 76, 0.15)',
          borderRadius: '14px',
          padding: '0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInScale 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Popup */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🖼️</span>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0, letterSpacing: '-0.2px' }}>
                {image.title || 'Visualização da Imagem'}
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-3, #a1a1aa)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {image.source === 'ai' || image.prompt ? (
                  <span style={{ 
                    color: '#06b6d4', 
                    background: 'rgba(6, 182, 212, 0.12)', 
                    border: '1px solid rgba(6, 182, 212, 0.25)', 
                    padding: '1px 6px', 
                    borderRadius: '4px', 
                    fontWeight: '600' 
                  }}>
                    🤖 Gerada por IA (Modelo: {(image.ai_model || 'gpt-image-2').toUpperCase()})
                  </span>
                ) : (
                  <span style={{ 
                    color: 'var(--text-2, #e4e4e7)', 
                    background: 'rgba(255, 255, 255, 0.06)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    padding: '1px 6px', 
                    borderRadius: '4px', 
                    fontWeight: '500' 
                  }}>
                    📤 Upload Manual
                  </span>
                )}
                {uploadDate && (
                  <span>
                    • Enviada em: <strong style={{ color: '#fff' }}>{uploadDate}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onClose}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            ✖ Fechar
          </button>
        </div>

        {/* Área Central da Imagem (Maximizada) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#09090b',
            overflow: 'auto',
            maxHeight: 'calc(92vh - 140px)'
          }}
        >
          <img
            src={image.url}
            alt={image.title || 'Imagem Maximizada'}
            style={{
              maxWidth: '85vw',
              maxHeight: 'calc(85vh - 150px)',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          />
        </div>

        {/* Rodapé com Ações */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleCopyUrl}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
            >
              📋 Copiar Link
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleDownload}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
            >
              💾 Baixar Imagem
            </button>
            {onOpenEdit && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  onClose();
                  onOpenEdit(image);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
              >
                ✏️ Editar Metadados
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn btn-gold btn-sm"
            onClick={onClose}
            style={{ padding: '6px 18px', fontSize: '12px', fontWeight: '600' }}
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
