import React from 'react';

export default function PipelineSlidesTab({ slides, pipelineInfo }) {
  if (!slides || slides.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', padding: '20px' }}>
        Nenhum prompt individual de slide registrado para este carrossel.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {slides.map((s, idx) => {
        const slideNum = typeof s === 'object' ? s.num || idx + 1 : idx + 1;
        const slideName = typeof s === 'object' ? (s.filename || s.estado || `Slide ${slideNum}`) : s;
        const isTextOnly = typeof s === 'object' && (s.layout === 'text_only' || s.prompt?.includes('Fundo Preto'));
        const promptDesc = typeof s === 'object' 
          ? (s.prompt || s.msg || (isTextOnly ? '[ Slide de Fundo Preto / Sem Imagem ]' : `Arte gerada para ${slideName}`))
          : `Arte gerada para ${slideName}`;

        return (
          <div
            key={idx}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', color: '#a78bfa', fontSize: '13px' }}>
                🖼️ Slide {slideNum}: {slideName}
              </span>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: isTextOnly ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                color: isTextOnly ? '#ef4444' : '#06b6d4'
              }}>
                {isTextOnly ? 'FUNDO PRETO (TEXTO)' : (pipelineInfo?.imageProvider || 'gpt-image-2').toUpperCase()}
              </span>
            </div>
            <div style={{
              backgroundColor: '#090a0f',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              color: isTextOnly ? '#9ca3af' : '#d4d4d8',
              fontFamily: 'monospace',
              lineHeight: '1.4',
              fontStyle: isTextOnly ? 'italic' : 'normal'
            }}>
              {promptDesc}
            </div>
          </div>
        );
      })}
    </div>
  );
}
