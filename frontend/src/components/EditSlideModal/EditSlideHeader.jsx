import React from 'react';

export default function EditSlideHeader({
  filename,
  slides = [],
  onChangeFilename,
  onOpenLightbox,
  onClose,
  handleVisualizar,
  saving
}) {
  const currentIndex = slides.findIndex(s => (typeof s === 'string' ? s : s.filename) === filename);
  const prevSlide = currentIndex > 0 ? slides[currentIndex - 1] : null;
  const nextSlide = currentIndex < slides.length - 1 ? slides[currentIndex + 1] : null;
  const prevFilename = prevSlide ? (typeof prevSlide === 'string' ? prevSlide : prevSlide.filename) : null;
  const nextFilename = nextSlide ? (typeof nextSlide === 'string' ? nextSlide : nextSlide.filename) : null;

  return (
    <div className="edit-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <div>
        <div className="form-title" style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>EDITAR SLIDE</div>
        <div className="edit-filename" style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-3)' }}>{filename}</div>
      </div>

      {slides && slides.length > 0 && onChangeFilename && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <button 
            type="button"
            className="btn btn-outline btn-sm" 
            style={{ padding: '2px 10px', fontSize: '12px', minWidth: 'auto', cursor: prevFilename ? 'pointer' : 'not-allowed', opacity: prevFilename ? 1 : 0.4 }}
            disabled={!prevFilename}
            onClick={() => onChangeFilename(prevFilename)}
          >
            ← Voltar
          </button>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--gold)', minWidth: '50px', textAlign: 'center' }}>
            {currentIndex + 1} / {slides.length}
          </span>
          <button 
            type="button"
            className="btn btn-outline btn-sm" 
            style={{ padding: '2px 10px', fontSize: '12px', minWidth: 'auto', cursor: nextFilename ? 'pointer' : 'not-allowed', opacity: nextFilename ? 1 : 0.4 }}
            disabled={!nextFilename}
            onClick={() => onChangeFilename(nextFilename)}
          >
            Avançar →
          </button>
          {onOpenLightbox && (
            <button 
              type="button"
              className="btn btn-outline btn-sm"
              style={{ 
                marginLeft: '12px', 
                padding: '2px 10px', 
                fontSize: '12px', 
                minWidth: 'auto', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                borderColor: 'var(--gold)', 
                color: 'var(--gold)' 
              }}
              disabled={saving}
              onClick={handleVisualizar}
            >
              {saving ? 'Salvando...' : 'Visualizar 👁️'}
            </button>
          )}
        </div>
      )}

      <button 
        type="button"
        className="modal-close" 
        onClick={onClose} 
        style={{ position: 'static', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '18px', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
  );
}
