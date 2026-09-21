import React from 'react';

export default function CarouselDetailsModal({
  selectedDetailsCarousel,
  setSelectedDetailsCarousel,
  handleOpenCaptionModal
}) {
  if (!selectedDetailsCarousel) return null;

  return (
    <div className="form-modal open">
      <div className="form-box" style={{ maxWidth: '550px', padding: '24px' }}>
        <h3 className="form-title" style={{ color: 'var(--gold, #C9A84C)', fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ℹ️ Detalhes do Carrossel
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', color: '#e4e4e7', fontSize: '13px' }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
            <span style={{ color: 'var(--gold, #C9A84C)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', letterSpacing: '0.5px' }}>
              Título / Gancho
              {selectedDetailsCarousel.preset === 'escala' && (
                <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>MOCK</span>
              )}
            </span>
            <strong style={{ fontSize: '16px', color: '#ffffff', lineHeight: '1.4', display: 'block' }}>{selectedDetailsCarousel.title || 'Sem título'}</strong>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--gold, #C9A84C)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>Tema</span>
              <span style={{ fontFamily: 'monospace', color: '#ffffff', fontSize: '14px', fontWeight: '600', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'inline-block' }}>{selectedDetailsCarousel.theme || 'Não definido'}</span>
            </div>
            <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Slides</span>
              <span style={{ fontWeight: '600' }}>{selectedDetailsCarousel.slides?.length || 0} / {selectedDetailsCarousel.totalSlides || 10}</span>
            </div>
          </div>

          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Qualidade / Resolução</span>
            <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>
              {(() => {
                const q = selectedDetailsCarousel.imageQuality;
                if (q === 'low') return 'Baixa (Low)';
                if (q === 'medium') return 'Média (Medium)';
                if (q === 'high') return 'Alta (High)';
                if (q === 'hd') return 'HD (DALL-E 3)';
                if (q === 'standard') return 'Padrão (DALL-E 3)';
                if (q === 'auto') return 'Automático (Auto)';
                return q || 'Alta (High)';
              })()}
            </span>
          </div>

          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Criado em (Horário de Brasília)</span>
            <span style={{ fontWeight: '500' }}>
              {new Date(selectedDetailsCarousel.createdAt || Date.now()).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
            </span>
          </div>

          {selectedDetailsCarousel.caption && (
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase' }}>Legenda (Caption)</span>
                <button 
                  type="button"
                  className="btn btn-outline btn-sm" 
                  style={{ fontSize: '10px', padding: '2px 8px', height: 'auto', minHeight: 'auto', border: '1px solid rgba(201, 168, 76, 0.4)', color: 'var(--gold)' }}
                  onClick={() => handleOpenCaptionModal(selectedDetailsCarousel)}
                >
                  ✏️ Editar Legenda
                </button>
              </div>
              <div style={{ 
                maxHeight: '80px', 
                overflowY: 'auto', 
                backgroundColor: 'rgba(0,0,0,0.2)', 
                padding: '8px', 
                borderRadius: '4px', 
                whiteSpace: 'pre-wrap', 
                fontSize: '11px',
                color: '#d4d4d8'
              }}>
                {selectedDetailsCarousel.caption_full || selectedDetailsCarousel.caption}
              </div>
            </div>
          )}

          {selectedDetailsCarousel.notes && (
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Conteúdo / Roteiro (Slides e Prompts)</span>
              <div style={{ 
                maxHeight: '150px', 
                overflowY: 'auto', 
                backgroundColor: 'rgba(0,0,0,0.2)', 
                padding: '8px', 
                borderRadius: '4px', 
                whiteSpace: 'pre-wrap', 
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#a1a1aa'
              }}>
                {selectedDetailsCarousel.notes}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Custo Total (USD)</span>
              <span style={{ color: '#f43f5e', fontWeight: '600' }}>${Number(selectedDetailsCarousel.cost || 0).toFixed(2)}</span>
            </div>
            <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Custo Total (BRL)</span>
              <span style={{ color: '#22c55e', fontWeight: '600' }}>R$ {Number((selectedDetailsCarousel.cost || 0) * 5.00).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Slides Gerados (API x Grátis)</span>
              <span style={{ fontWeight: '500', color: '#e4e4e7' }}>
                {selectedDetailsCarousel.costDetails ? (
                  <>
                    <span style={{ color: '#f43f5e' }}>{selectedDetailsCarousel.costDetails.paidSlides} pagos (API)</span>
                    {' · '}
                    <span style={{ color: '#22c55e' }}>{selectedDetailsCarousel.costDetails.freeSlides} grátis (text_only)</span>
                  </>
                ) : (
                  `${selectedDetailsCarousel.totalSlides || 10} slides`
                )}
              </span>
            </div>
            <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Economia com Text-Only</span>
              <span style={{ fontWeight: '600', color: '#22c55e' }}>
                {selectedDetailsCarousel.costDetails && selectedDetailsCarousel.costDetails.savedCost > 0 ? (
                  `R$ ${Number(selectedDetailsCarousel.costDetails.savedCost * 5.00).toFixed(2)} ($${Number(selectedDetailsCarousel.costDetails.savedCost).toFixed(2)})`
                ) : (
                  'R$ 0,00'
                )}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Custo / Slide Pago (USD)</span>
              <span style={{ fontWeight: '500' }}>
                ${Number(selectedDetailsCarousel.costDetails ? selectedDetailsCarousel.costDetails.costPerImage : (selectedDetailsCarousel.totalSlides > 0 ? (selectedDetailsCarousel.cost || 0) / selectedDetailsCarousel.totalSlides : 0)).toFixed(2)}
              </span>
            </div>
            <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Custo / Slide Pago (BRL)</span>
              <span style={{ fontWeight: '500' }}>
                R$ {Number((selectedDetailsCarousel.costDetails ? selectedDetailsCarousel.costDetails.costPerImage : (selectedDetailsCarousel.totalSlides > 0 ? (selectedDetailsCarousel.cost || 0) / selectedDetailsCarousel.totalSlides : 0)) * 5.00).toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>IA dos Slides (Imagens)</span>
              <span style={{ fontWeight: '500', color: '#06b6d4' }}>
                {(() => {
                  const provider = selectedDetailsCarousel.imageProvider;
                  if (!provider || provider === 'gpt-image-2') return 'OpenAI GPT Image 2';
                  if (provider === 'dall-e-3') return 'OpenAI DALL-E 3';
                  if (provider === 'fal') return 'Flux Schnell (via Fal)';
                  if (provider === 'gemini') return 'Google Imagen 3';
                  if (provider === 'gpt-image-1-mini') return 'GPT Image 1 Mini';
                  if (provider === 'dall-e-2') return 'OpenAI DALL-E 2';
                  return provider.toUpperCase();
                })()}
              </span>
            </div>
            <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>LLM do Briefing, Prompt & Copy</span>
              <span style={{ fontWeight: '500', color: 'var(--gold, #C9A84C)' }}>
                {(() => {
                  const lastAssistantMsg = (selectedDetailsCarousel.chatHistory || []).slice().reverse().find(m => m.role === 'assistant' && m.model);
                  const model = lastAssistantMsg ? lastAssistantMsg.model : (selectedDetailsCarousel.copyModel || 'N/A');
                  return model.toUpperCase();
                })()}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button type="button" className="btn btn-outline" style={{ padding: '8px 20px' }} onClick={() => setSelectedDetailsCarousel(null)}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
