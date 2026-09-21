import React from 'react';

export default function EditSlideTextTab({
  slideMeta,
  setSlideMeta,
  defaultSizes,
  saving,
  onClose,
  handleRecompose
}) {
  return (
    <div className="edit-panel-content">
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-2)' }}>Título</label>
        <textarea 
          className="form-textarea" 
          style={{ minHeight: '80px', width: '100%', padding: '8px', background: '#09090b', color: '#fff', border: '1px solid var(--border)', borderRadius: '6px' }} 
          value={slideMeta.title} 
          onChange={e => setSlideMeta(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-2)' }}>Corpo</label>
        <textarea 
          className="form-textarea" 
          style={{ minHeight: '120px', width: '100%', padding: '8px', background: '#09090b', color: '#fff', border: '1px solid var(--border)', borderRadius: '6px' }} 
          value={slideMeta.body} 
          onChange={e => setSlideMeta(prev => ({ ...prev, body: e.target.value }))}
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-2)' }}>Tamanho do Título (px)</label>
          <input 
            type="number" 
            placeholder="Ex: 76" 
            className="form-input" 
            style={{ width: '100%', padding: '8px', background: '#09090b', color: '#fff', border: '1px solid var(--border)', borderRadius: '6px' }} 
            value={slideMeta.title_px !== undefined && slideMeta.title_px !== null ? slideMeta.title_px : defaultSizes.title} 
            onChange={e => setSlideMeta(prev => ({ ...prev, title_px: e.target.value }))} 
          />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-2)' }}>Tamanho do Corpo (px)</label>
          <input 
            type="number" 
            placeholder="Ex: 40" 
            className="form-input" 
            style={{ width: '100%', padding: '8px', background: '#09090b', color: '#fff', border: '1px solid var(--border)', borderRadius: '6px' }} 
            value={slideMeta.body_px !== undefined && slideMeta.body_px !== null ? slideMeta.body_px : defaultSizes.body} 
            onChange={e => setSlideMeta(prev => ({ ...prev, body_px: e.target.value }))} 
          />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-2)' }}>Texto da Logomarca (Marca d'água)</label>
        <input 
          type="text" 
          placeholder="Ex: @HAUCACAU" 
          className="form-input" 
          style={{ width: '100%', padding: '8px', background: '#09090b', color: '#fff', border: '1px solid var(--border)', borderRadius: '6px' }} 
          value={slideMeta.watermark_text || ''} 
          onChange={e => setSlideMeta(prev => ({ ...prev, watermark_text: e.target.value }))} 
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-2)' }}>Posição da Marca d'água</label>
        <select 
          className="form-select" 
          style={{ width: '100%', padding: '8px', background: '#09090b', color: '#fff', border: '1px solid var(--border)', borderRadius: '6px' }} 
          value={slideMeta.watermark_pos === 'custom' ? 'top_left' : slideMeta.watermark_pos} 
          onChange={e => setSlideMeta(prev => ({ ...prev, watermark_pos: e.target.value }))}
        >
          <option value="top_left">Superior Esquerdo (Padrão)</option>
          <option value="top_right">Superior Direito</option>
          <option value="bottom_left">Inferior Esquerdo</option>
          <option value="bottom_right">Inferior Direito</option>
          <option value="hidden">Ocultar Marca d'água</option>
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-2)' }}>Layout do Slide</label>
        <select 
          className="form-select" 
          style={{ width: '100%', padding: '8px', background: '#09090b', color: '#fff', border: '1px solid var(--border)', borderRadius: '6px' }} 
          value={slideMeta.layout} 
          onChange={e => setSlideMeta(prev => ({ ...prev, layout: e.target.value }))}
        >
          <option value="brands_cover">BrandsDecoded — Capa com Badge e Header</option>
          <option value="brands_split">BrandsDecoded — Bloco Dividido com Foto</option>
          <option value="brands_editorial">BrandsDecoded — Editorial com Ponto Vermelho (🔴)</option>
          <option value="brands_outro">BrandsDecoded — Outro / Disclaimer IA e CTA</option>
          <option value="fullbleed">Inferior Centralizado (Fullbleed)</option>
          <option value="dramatico">Esquerda Dramático (Dramático)</option>
          <option value="etereo">Esquerda Luminoso (Etéreo)</option>
          <option value="card">Texto Inferior com Card (Card)</option>
          <option value="text_only">Apenas Texto (Text-Only)</option>
        </select>
        <p style={{ color: 'var(--text-3)', fontSize: '11px', marginTop: '8px', lineHeight: '1.4' }}>
          * Arraste o Título ou Corpo diretamente na visualização real-time à direita para alterar suas posições.
        </p>
      </div>

      <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button type="button" className="btn btn-outline" onClick={onClose}>Fechar</button>
        <button type="button" className="btn btn-gold" onClick={() => handleRecompose(false)} disabled={saving}>
          {saving ? 'Salvando...' : 'Recompor Slide 🔄'}
        </button>
      </div>
    </div>
  );
}
