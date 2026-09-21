import React from 'react';

export default function FinanceiroBreakdown({ providers = [], summary, topThemes = [] }) {
  const getProviderLabel = (provider) => {
    if (!provider || provider === 'gpt-image-2') return 'OpenAI GPT Image 2';
    if (provider === 'dall-e-3') return 'OpenAI DALL-E 3';
    if (provider === 'fal') return 'Flux Schnell (via Fal)';
    if (provider === 'gemini') return 'Google Imagen 3 (Gemini)';
    if (provider === 'gpt-image-1-mini') return 'GPT Image 1 Mini';
    if (provider === 'dall-e-2') return 'OpenAI DALL-E 2';
    return String(provider).toUpperCase();
  };

  const getProviderColor = (provider) => {
    if (provider?.includes('gpt') || provider?.includes('dall-e')) return '#10b981';
    if (provider === 'fal') return '#f59e0b';
    if (provider === 'gemini') return '#3b82f6';
    return '#a855f7';
  };

  return (
    <div className="financeiro-breakdown-row">
      <div className="financeiro-panel-box">
        <div className="financeiro-panel-title">
          <span>🤖 Distribuição de Gastos por Provedor de IA</span>
        </div>

        {providers.length === 0 ? (
          <div style={{ color: 'var(--text-3)', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>
            Nenhum dado de provedor registrado ainda.
          </div>
        ) : (
          <div>
            {providers.map((p) => {
              const color = getProviderColor(p.provider);
              return (
                <div key={p.provider} className="provider-item-row">
                  <div className="provider-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></span>
                      <span style={{ color: 'var(--text, #ffffff)' }}>{getProviderLabel(p.provider)}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 400 }}>
                        ({p.carouselsCount} {p.carouselsCount === 1 ? 'carrossel' : 'carrosséis'} · {p.paidSlides} slides)
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'var(--text, #ffffff)', fontVariantNumeric: 'tabular-nums' }}>
                        R$ {Number(p.costBrl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span style={{ fontSize: '11px', color: color, fontWeight: 700, minWidth: '42px', textAlign: 'right' }}>
                        {p.sharePercent || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="provider-bar-wrap">
                    <div
                      className="provider-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.max(2, p.sharePercent || 0))}%`,
                        background: color
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="financeiro-panel-box" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="financeiro-panel-title">
          <span>💡 Eficiência e Economia</span>
        </div>

        <div className="efficiency-card">
          <div className="efficiency-circle">
            {summary?.savingsRatePercent || 0}%
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text, #ffffff)' }}>
            Taxa de Economia com Text-Only
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-3, #a1a1aa)', lineHeight: 1.4 }}>
            {summary?.totalFreeSlides || 0} de {summary?.totalSlides || 0} slides criados usaram layout text-only sem custo de imagem via API, gerando <strong>R$ {Number(summary?.totalSavedBrl || 0).toFixed(2)}</strong> em economia.
          </div>
        </div>

        {topThemes.length > 0 && (
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
              Top Temas por Investimento
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {topThemes.slice(0, 3).map((t, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.theme}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                    R$ {Number(t.costBrl || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
