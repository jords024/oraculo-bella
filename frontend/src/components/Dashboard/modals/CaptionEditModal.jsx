import React from 'react';

export default function CaptionEditModal({
  isCaptionMaximized,
  setIsCaptionMaximized,
  selectedDetailsCarousel,
  editedCaption,
  setEditedCaption,
  handleSaveCaption,
  isSavingCaption,
  showToast
}) {
  if (!isCaptionMaximized || !selectedDetailsCarousel) return null;

  return (
    <div className="form-modal open" style={{ zIndex: 1100 }}>
      <div className="form-box" style={{ maxWidth: '720px', width: '90%', padding: '24px', background: '#121214' }}>
        <h3 className="form-title" style={{ color: 'var(--gold, #C9A84C)', fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
          📝 Editar Legenda
        </h3>
        
        <textarea
          className="form-textarea"
          style={{ 
            width: '100%', 
            minHeight: '240px', 
            maxHeight: '55vh',
            padding: '14px', 
            borderRadius: '6px', 
            backgroundColor: '#09090b', 
            color: '#f4f4f5', 
            border: '1px solid var(--border, rgba(255,255,255,0.15))',
            fontSize: '14px',
            lineHeight: '1.6',
            resize: 'vertical',
            fontFamily: 'inherit',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          value={editedCaption}
          onChange={(e) => setEditedCaption(e.target.value)}
          placeholder="Digite ou edite a legenda do carrossel..."
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
          <button 
            type="button"
            className="btn btn-outline" 
            style={{ padding: '8px 16px' }} 
            onClick={() => {
              navigator.clipboard.writeText(editedCaption);
              showToast('Legenda copiada para a área de transferência!');
            }}
          >
            Copiar Texto
          </button>
          <button 
            type="button"
            className="btn btn-gold" 
            style={{ padding: '8px 20px', fontWeight: 'bold' }}
            onClick={handleSaveCaption}
            disabled={isSavingCaption}
          >
            {isSavingCaption ? '⏳ Salvando...' : '💾 Salvar Legenda'}
          </button>
          <button 
            type="button"
            className="btn btn-outline" 
            style={{ padding: '8px 16px', borderColor: 'rgba(255,255,255,0.2)' }} 
            onClick={() => setIsCaptionMaximized(false)}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
