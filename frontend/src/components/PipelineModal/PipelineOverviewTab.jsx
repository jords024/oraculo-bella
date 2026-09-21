import React from 'react';

export default function PipelineOverviewTab({ pipelineInfo }) {
  if (!pipelineInfo) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div className="info-card" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', display: 'block' }}>Formato & Preset</span>
          <span style={{ fontWeight: '600', color: '#e4e4e7', fontSize: '14px' }}>
            Formato {pipelineInfo.format || 'A'} · {pipelineInfo.preset || 'cinematografico'}
          </span>
        </div>

        <div className="info-card" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', display: 'block' }}>IA das Imagens</span>
          <span style={{ fontWeight: '600', color: '#06b6d4', fontSize: '14px' }}>
            {(pipelineInfo.imageProvider || 'gpt-image-2').toUpperCase()}
          </span>
        </div>

        <div className="info-card" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', display: 'block' }}>LLM de Copy</span>
          <span style={{ fontWeight: '600', color: 'var(--gold, #e0a96d)', fontSize: '14px' }}>
            {(pipelineInfo.copyModel || 'gpt-4o').toUpperCase()}
          </span>
        </div>

        <div className="info-card" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', display: 'block' }}>Custo Total</span>
          <span style={{ fontWeight: '600', color: '#22c55e', fontSize: '14px' }}>
            ${Number(pipelineInfo.cost || 0).toFixed(2)} (R$ {Number((pipelineInfo.cost || 0) * 5.00).toFixed(2)})
          </span>
        </div>
      </div>

      {pipelineInfo.caption && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            ✍️ Legenda Gerada (Caption)
          </span>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap', color: '#d4d4d8' }}>
            {pipelineInfo.caption}
          </p>
        </div>
      )}

      {pipelineInfo.notes && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <span style={{ fontSize: '12px', color: '#06b6d4', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            📌 Notas & Diretrizes de Produção
          </span>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#d4d4d8' }}>
            {pipelineInfo.notes}
          </p>
        </div>
      )}
    </div>
  );
}
