// frontend/src/components/Biblioteca/GeneratedGallery.jsx — Galeria com Paginação Inteligente de Imagens Geradas
import React, { useState, useMemo } from 'react';

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis-start', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages];
}

function formatUploadDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function GeneratedGallery({
  generatedImages = [],
  onPreviewImage,
  onSaveToLibrary,
  showToast
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredImages = useMemo(() => {
    if (!searchTerm.trim()) return generatedImages;
    const term = searchTerm.toLowerCase();
    return generatedImages.filter(img => 
      (img.prompt && img.prompt.toLowerCase().includes(term)) ||
      (img.generatedPrompt && img.generatedPrompt.toLowerCase().includes(term))
    );
  }, [generatedImages, searchTerm]);

  const totalPages = Math.ceil(filteredImages.length / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedImages = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredImages.slice(start, start + pageSize);
  }, [filteredImages, validCurrentPage, pageSize]);

  const handleDownload = (url, filename) => {
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

  const paginationItems = getPaginationItems(validCurrentPage, totalPages);

  if (generatedImages.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3, #a1a1aa)' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎨</div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '6px' }}>
          Nenhuma imagem gerada ainda
        </div>
        <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
          Converse com o Assistente de Criação na aba ao lado para gerar novas imagens com IA.
        </div>
      </div>
    );
  }

  return (
    <div className="generated-gallery-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* ── Barra Superior com Busca e Contagem ── */}
      <div style={{ padding: '10px 16px 6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar no histórico de gerações..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '11px',
            color: '#fff',
            outline: 'none'
          }}
        />
      </div>

      {/* ── Grid de Imagens ── */}
      <div className="generated-gallery-container" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 14px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridAutoRows: 'max-content', gap: '10px', alignContent: 'start' }}>
        {paginatedImages.map((item, idx) => {
          const dateStr = formatUploadDate(item.createdAt);
          return (
            <div key={item.id || idx} className="gen-card" style={{ background: '#141416', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '210px', flexShrink: 0 }}>
              <div
                className="gen-card-thumb-wrap"
                style={{ width: '100%', height: '110px', background: '#18181b', overflow: 'hidden', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => onPreviewImage({ url: item.imageUrl, title: item.prompt })}
                title="Clique para visualizar em tamanho real"
              >
                <button
                  type="button"
                  className="gen-card-quick-save-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveToLibrary(item);
                  }}
                  title="Salvar na Biblioteca de Referências"
                >
                  💾 Salvar
                </button>

                <img
                  src={item.imageUrl}
                  alt={item.prompt || 'Imagem Gerada'}
                  className="gen-card-thumb"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%2318181b'/%3E%3Ctext x='50%25' y='50%25' fill='%2371717a' font-size='12' text-anchor='middle' dy='.3em'%3EImagem Indispon%C3%ADvel%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="gen-card-preview-overlay">
                  <span className="gen-card-preview-badge">👁️ Ver</span>
                </div>
              </div>

              <div className="gen-card-footer" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span className="gen-card-prompt" title={item.prompt || item.generatedPrompt} style={{ fontSize: '11px', fontWeight: '600', color: '#f4f4f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.prompt || item.generatedPrompt || 'Geração IA'}
                </span>

                {dateStr && (
                  <span style={{ fontSize: '10px', color: 'var(--text-3, #71717a)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    🕒 {dateStr}
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-3, #71717a)', marginTop: '1px' }}>
                  <span>🤖 {item.model || 'gpt-image-1'}</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>
                    {item.costFormatted || (item.costBrl ? `R$ ${item.costBrl.toFixed(2).replace('.', ',')}` : 'R$ 0,20')}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
                  <button
                    className="chat-ai-action-btn btn-save-lib"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '6px 4px',
                      background: 'rgba(201, 168, 76, 0.2)',
                      border: '1px solid #c9a84c',
                      color: '#ffd700',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => onSaveToLibrary(item)}
                    title="Salvar na Biblioteca de Referências"
                  >
                    💾 Salvar na Biblioteca
                  </button>

                  <button
                    className="chat-ai-action-btn"
                    style={{ padding: '6px 8px', borderRadius: '6px' }}
                    onClick={() => handleDownload(item.imageUrl, item.filename)}
                    title="Baixar imagem"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Paginação Inteligente no Drawer ── */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border, rgba(255, 255, 255, 0.08))', background: '#0d0d0f', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-3, #a1a1aa)' }}>
          <span>
            {filteredImages.length > 0
              ? `${(validCurrentPage - 1) * pageSize + 1}-${Math.min(validCurrentPage * pageSize, filteredImages.length)} de ${filteredImages.length}`
              : '0 de 0'}
          </span>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              background: '#18181b',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="6" style={{ background: '#18181b', color: '#ffffff' }}>6 / pág</option>
            <option value="8" style={{ background: '#18181b', color: '#ffffff' }}>8 / pág</option>
            <option value="12" style={{ background: '#18181b', color: '#ffffff' }}>12 / pág</option>
            <option value="20" style={{ background: '#18181b', color: '#ffffff' }}>20 / pág</option>
            <option value="50" style={{ background: '#18181b', color: '#ffffff' }}>50 / pág</option>
          </select>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '10px',
                padding: '4px 6px',
                borderRadius: '4px',
                cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: validCurrentPage === 1 ? 0.35 : 1
              }}
            >
              «
            </button>

            {paginationItems.map((item, index) => {
              if (item === 'ellipsis-start' || item === 'ellipsis-end') {
                return (
                  <span key={`ellipsis-${index}`} style={{ color: 'var(--text-3)', fontSize: '10px', padding: '0 2px' }}>
                    ...
                  </span>
                );
              }
              const isActive = item === validCurrentPage;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCurrentPage(item)}
                  style={{
                    minWidth: '22px',
                    height: '22px',
                    padding: '0 4px',
                    background: isActive ? 'var(--gold, #c9a84c)' : 'rgba(255, 255, 255, 0.05)',
                    border: isActive ? '1px solid var(--gold, #c9a84c)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#09090b' : '#fff',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '10px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {item}
                </button>
              );
            })}

            <button
              type="button"
              disabled={validCurrentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '10px',
                padding: '4px 6px',
                borderRadius: '4px',
                cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: validCurrentPage === totalPages ? 0.35 : 1
              }}
            >
              »
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
