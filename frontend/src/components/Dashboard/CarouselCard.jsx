import React from 'react';
import GeneratingBadge from './GeneratingBadge';

export default function CarouselCard({
  carousel: c,
  isExpanded,
  isSelected,
  imageVersion,
  retryingId,
  publishingId,
  schedulingId,
  onToggleExpand,
  onSelectCard,
  onTogglePin,
  onOpenLightbox,
  onOpenEditModal,
  onOpenCaptionModal,
  onStatusChange,
  onLoadChatHistory,
  onRetryGeneration,
  onOpenPipeline,
  onOpenDetails,
  onPublish,
  onDownloadZip,
  onDeleteTarget
}) {
  const token = encodeURIComponent(localStorage.getItem('fo_token') || '');

  return (
    <div className={`carousel-card ${isSelected ? 'selected' : ''}`} style={{ position: 'relative' }}>
      {/* Checkbox de seleção em lote */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          position: 'absolute', 
          top: '12px', 
          left: '12px', 
          zIndex: 20, 
          background: 'rgba(0, 0, 0, 0.75)', 
          borderRadius: '4px', 
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onSelectCard(c.id)}
          style={{ 
            width: '16px', 
            height: '16px', 
            cursor: 'pointer',
            accentColor: 'var(--gold)'
          }}
        />
      </div>

      {/* Botão de Fixar no Topo */}
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(c.id, c.isPinned);
        }}
        title={c.isPinned ? "Desfixar do topo" : "Fixar no topo (máx 10)"}
        style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px', 
          zIndex: 20, 
          background: c.isPinned ? 'rgba(234, 179, 8, 0.25)' : 'rgba(0, 0, 0, 0.75)', 
          color: c.isPinned ? '#facc15' : '#9ca3af',
          border: c.isPinned ? '1px solid rgba(250, 204, 21, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '6px', 
          padding: '4px 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        📌 {c.isPinned && <span>FIXADO</span>}
      </button>

      <div className="card-header" onClick={() => onToggleExpand(c.id)}>
        {c.slides && c.slides.length > 0 ? (
          <img src={`/api/carousels/${c.id}/image/${c.slides[0]}?token=${token}&v=${imageVersion}`} className="card-thumb" alt="" />
        ) : (
          <div className="card-thumb-placeholder">{c.status === 'generating' ? '⏳' : '🎨'}</div>
        )}
        <div className="card-meta" style={{ paddingRight: '75px' }}>
          <div className="card-title">{c.title}</div>
          <div className="card-badges">
            {c.isPinned && (
              <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.4)', fontWeight: 'bold' }}>
                📌 FIXADO
              </span>
            )}
            <span className="badge badge-format">F: {c.format}</span>
            {c.status === 'generating' ? (
              <GeneratingBadge startedAt={c.generationStartedAt} />
            ) : c.status === 'queued' ? (
              <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.4)', fontWeight: 'bold' }}>
                ⏳ em fila
              </span>
            ) : (
              <span className={`badge badge-${c.status}`}>{c.status}</span>
            )}
            {(c.generationDuration || c.generationTimeSeconds) && c.status !== 'generating' && (
              <span className="badge" title="Tempo gasto para gerar o carrossel" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.3)', fontWeight: '500' }}>
                ⏱️ {c.generationDuration || (c.generationTimeSeconds >= 60 ? `${Math.floor(c.generationTimeSeconds / 60)}m ${c.generationTimeSeconds % 60}s` : `${c.generationTimeSeconds}s`)}
              </span>
            )}
            {c.preset === 'escala' && (
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 'bold' }}>MOCK</span>
            )}
          </div>
          <div className="card-date">
            {c.scheduledDate ? `📅 ${c.scheduledDate} ${c.scheduledTime || ''}` : new Date(c.createdAt || Date.now()).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="slide-strip open">
            {Array.from({ length: c.status === 'generating' ? (c.totalSlides || 10) : (c.slides?.length || 0) }).map((_, idx) => {
              const slide = c.slides && c.slides[idx];
              if (slide) {
                return (
                  <div className="slide-thumb-wrap" key={idx}>
                    <img
                      src={`/api/carousels/${c.id}/image/${slide}?token=${token}&v=${imageVersion}`}
                      className="slide-thumb"
                      alt=""
                    />
                    <div className="slide-thumb-num">{idx + 1}</div>
                    <div className="slide-actions-overlay" style={{ cursor: 'pointer' }} onClick={() => onOpenLightbox(c.id, c.slides, idx)}>
                      <button type="button" className="slide-icon-btn" title="Visualizar/Maximizar" style={{ background: 'var(--green, #22c55e)', color: '#fff' }}>👁</button>
                      <button type="button" className="slide-icon-btn slide-icon-btn-dl" title="Baixar" onClick={(e) => {
                        e.stopPropagation();
                        const a = document.createElement('a');
                        a.href = `/api/carousels/${c.id}/image/${slide}?token=${token}&v=${imageVersion}`;
                        a.download = slide;
                        a.click();
                      }}>↓</button>
                      <button type="button" className="slide-icon-btn slide-icon-btn-edit" title="Editar" onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditModal(c.id, slide, c.slides);
                      }}>✎</button>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="slide-thumb-wrap" key={idx}>
                    <div className="slide-thumb-loading">
                      <div className="slide-thumb-spinner"></div>
                    </div>
                    <div className="slide-thumb-num">{idx + 1}</div>
                  </div>
                );
              }
            })}
          </div>
          {c.caption && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', padding: '0 4px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Legenda</span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{
                    fontSize: '10px',
                    padding: '2px 10px',
                    height: 'auto',
                    minHeight: 'auto',
                    borderColor: 'rgba(201, 168, 76, 0.4)',
                    color: 'var(--gold)',
                    backgroundColor: 'rgba(18, 18, 20, 0.85)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCaptionModal(c);
                  }}
                >
                  ✏️ Editar Legenda
                </button>
              </div>
              <div className="caption-box open" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onOpenCaptionModal(c); }}>
                {c.caption_full || c.caption}
              </div>
            </div>
          )}
        </>
      )}

      <div className="card-footer">
        <select
          className="status-select"
          value={c.status}
          disabled={c.status === 'generating' || c.status === 'queued'}
          onChange={(e) => onStatusChange(c.id, e.target.value)}
        >
          <option value="rascunho">Rascunho</option>
          <option value="pronto">Pronto</option>
          <option value="aprovado">Aprovado</option>
          <option value="agendado">Agendado</option>
          <option value="publicando">Publicando</option>
          <option value="publicado">Publicado</option>
        </select>

        <div className="card-actions">
          {c.chatHistory && c.chatHistory.length > 0 && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ borderColor: 'var(--gold, #e0a96d)', color: 'var(--gold, #e0a96d)' }}
              onClick={(e) => { e.stopPropagation(); onLoadChatHistory(c.chatHistory); }}
            >
              💬 Ver no Chat
            </button>
          )}

          {c.status !== 'generating' && c.status !== 'queued' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ borderColor: '#22c55e', color: '#22c55e', opacity: retryingId === c.id ? 0.6 : 1 }}
              disabled={!!retryingId}
              onClick={(e) => { e.stopPropagation(); onRetryGeneration(c.id); }}
              title="Recriar carrossel gerando as artes"
            >
              {retryingId === c.id ? '⏳ Recriando...' : '🔄 Recriar'}
            </button>
          )}

          {c.status !== 'generating' && c.status !== 'queued' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ borderColor: '#8b5cf6', color: '#a78bfa' }}
              onClick={(e) => { e.stopPropagation(); onOpenPipeline(c); }}
              title="Ver todo o pipeline de criação e prompts utilizados"
            >
              ⚡ Pipeline
            </button>
          )}

          {c.status !== 'generating' && c.status !== 'queued' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={(e) => { e.stopPropagation(); onOpenDetails(c); }}
            >
              🔎 Detalhes
            </button>
          )}

          {c.slides && c.slides.length > 0 && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ borderColor: '#a855f7', color: '#a855f7' }}
              onClick={(e) => {
                e.stopPropagation();
                const firstSlide = typeof c.slides[0] === 'string' ? c.slides[0] : c.slides[0].filename;
                onOpenEditModal(c.id, firstSlide, c.slides);
              }}
            >
              ✏️ Editar
            </button>
          )}

          {c.status === 'publicando' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                className="btn-instagram btn-sm"
                disabled={true}
                style={{ opacity: 0.8 }}
              >
                ⏳ Publicando...
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ borderColor: '#ef4444', color: '#ef4444', padding: '4px 8px' }}
                title="Cancelar modo de publicação e voltar para pronto"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(c.id, 'pronto');
                }}
              >
                ✕ Cancelar
              </button>
            </div>
          ) : (
            c.status !== 'generating' && c.status !== 'queued' && c.status !== 'failed' && c.slides && c.slides.length > 0 && (
              <button
                type="button"
                className="btn-instagram btn-sm"
                disabled={c.status === 'publicado' || c.status === 'agendado' || publishingId === c.id}
                onClick={() => onPublish(c)}
              >
                {c.status === 'publicado' ? '✓ Postado' : (c.status === 'agendado' ? '📅 Agendado' : (schedulingId === c.id ? '⏳ Agendando...' : (publishingId === c.id ? '⏳ Publicando...' : '✈ Postar')))}
              </button>
            )
          )}
          {c.slides && c.slides.length > 0 && c.totalSlides > 0 && c.slides.length === c.totalSlides && (
            <button 
              type="button"
              className="btn btn-outline btn-sm" 
              onClick={(e) => { e.stopPropagation(); onDownloadZip(c.id); }} 
              title="Baixar todos os slides em ZIP"
            >
              Baixar
            </button>
          )}
          <button type="button" className="btn-danger btn-sm" onClick={() => onDeleteTarget(c.id)}>✕</button>
        </div>
      </div>
    </div>
  );
}
