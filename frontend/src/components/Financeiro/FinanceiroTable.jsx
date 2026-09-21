import React from 'react';

export default function FinanceiroTable({ carousels = [], onOpenDetails }) {
  const getProviderBadge = (provider) => {
    if (!provider || provider === 'gpt-image-2') return <span className="badge-tag badge-openai">GPT Image 2</span>;
    if (provider === 'dall-e-3') return <span className="badge-tag badge-openai">DALL-E 3</span>;
    if (provider === 'fal') return <span className="badge-tag badge-fal">Flux (Fal)</span>;
    if (provider === 'gemini') return <span className="badge-tag badge-gemini">Imagen 3</span>;
    if (provider === 'gpt-image-1-mini') return <span className="badge-tag badge-openai">GPT Mini</span>;
    if (provider === 'dall-e-2') return <span className="badge-tag badge-openai">DALL-E 2</span>;
    return <span className="badge-tag badge-other">{String(provider).toUpperCase()}</span>;
  };

  const getStatusBadge = (status) => {
    const s = (status || 'rascunho').toLowerCase();
    if (s === 'aprovado' || s === 'pronto') {
      return <span style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{s}</span>;
    }
    if (s === 'publicado') {
      return <span style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{s}</span>;
    }
    if (s === 'generating') {
      return <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>gerando</span>;
    }
    return <span style={{ color: '#71717a', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{s}</span>;
  };

  const token = encodeURIComponent(localStorage.getItem('fo_token') || '');

  return (
    <div className="financeiro-table-box">
      {carousels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>Nenhum carrossel encontrado</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>Tente alterar os termos de busca ou filtros acima.</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="financeiro-table">
            <thead>
              <tr>
                <th>Carrossel / Tema</th>
                <th>Provedor IA</th>
                <th>Status</th>
                <th>Slides (Pagos x Grátis)</th>
                <th>Custo / Slide</th>
                <th>Custo Total (USD)</th>
                <th>Custo Total (BRL)</th>
                <th>Economia</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carousels.map((c) => {
                const coverPath = c.cover || (c.slides && c.slides[0]);
                let coverSrc = '';
                if (coverPath) {
                  const pathStr = typeof coverPath === 'string' ? coverPath : coverPath?.filename;
                  if (pathStr) {
                    coverSrc = pathStr.startsWith('http') || pathStr.startsWith('/')
                      ? pathStr
                      : `/api/carousels/${c.id}/image/${pathStr}?token=${token}`;
                  }
                }

                return (
                  <tr key={c.id}>
                    <td>
                      <div className="financeiro-carousel-info">
                        {coverSrc ? (
                          <img
                            src={coverSrc}
                            alt=""
                            className="financeiro-thumb"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="financeiro-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'var(--text-3)' }}>
                            🖼️
                          </div>
                        )}
                        <div>
                          <div className="financeiro-carousel-title" title={c.title}>
                            {c.title || 'Sem título'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="financeiro-carousel-theme">{c.theme || 'Geral'}</span>
                            {c.retryCount > 0 && (
                              <span style={{ fontSize: '10.5px', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                🔄 {c.retryCount}x recriado
                              </span>
                            )}
                            {c.createdAt && (
                              <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                                {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {getProviderBadge(c.imageProvider)}
                        <span style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'monospace' }}>
                          LLM: {c.copyModel || 'gpt-4o'}
                        </span>
                      </div>
                    </td>

                    <td>
                      {getStatusBadge(c.status)}
                    </td>

                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>
                        <span style={{ color: '#f43f5e' }}>{c.paidSlides || 0} pagos</span>
                        {' · '}
                        <span style={{ color: '#22c55e' }}>{c.freeSlides || 0} grátis</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                        Total: {c.totalSlides || 0} slides
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--text)' }}>
                        ${Number(c.costPerImageUsd || 0).toFixed(3)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                        R$ {Number(c.costPerImageBrl || 0).toFixed(2)}
                      </div>
                    </td>

                    <td>
                      <span style={{ color: '#f43f5e', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        ${Number(c.costUsd || 0).toFixed(2)}
                      </span>
                    </td>

                    <td>
                      <span style={{ color: '#22c55e', fontWeight: 800, fontSize: '14px', fontVariantNumeric: 'tabular-nums' }}>
                        R$ {Number(c.costBrl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td>
                      {c.savedBrl > 0 ? (
                        <span style={{ color: '#10b981', fontWeight: 600, fontSize: '12px' }}>
                          +R$ {Number(c.savedBrl).toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>—</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-details-action"
                        onClick={() => onOpenDetails && onOpenDetails(c)}
                        title="Ver detalhes de custo e prompts"
                      >
                        ℹ️ Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
