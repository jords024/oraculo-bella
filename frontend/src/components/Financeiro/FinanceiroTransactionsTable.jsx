import React from 'react';

export default function FinanceiroTransactionsTable({ transactions = [] }) {
  const getTypeBadge = (type) => {
    switch (type) {
      case 'carousel_generation':
        return <span style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>🖼️ Geração Carrossel</span>;
      case 'carousel_retry':
        return <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>🔄 Recriação</span>;
      case 'image_generation':
        return <span style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.12)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>🎨 Estúdio / Galeria</span>;
      case 'slide_regenerate':
        return <span style={{ color: '#ec4899', background: 'rgba(236, 72, 153, 0.12)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>⚡ Slide Avulso</span>;
      case 'agent_prompt':
        return <span style={{ color: '#c9a84c', background: 'rgba(201, 168, 76, 0.12)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>💬 Prompt IA</span>;
      default:
        return <span style={{ color: '#71717a', background: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{type}</span>;
    }
  };

  return (
    <div className="financeiro-table-box">
      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧾</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>Nenhuma transação individual registrada</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>Todas as gerações futuras de carrosséis, recriações, imagens e prompts aparecerão aqui em tempo real.</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="financeiro-table">
            <thead>
              <tr>
                <th>Data & Hora</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Modelo / IA</th>
                <th>Quantidade / Tokens</th>
                <th>Custo (USD)</th>
                <th>Custo (BRL)</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleString('pt-BR') : '—';
                const tokensCount = (t.tokensInput || 0) + (t.tokensOutput || 0);

                return (
                  <tr key={t.id || Math.random()}>
                    <td style={{ fontSize: '12px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                      {dateStr}
                    </td>

                    <td>
                      {getTypeBadge(t.type)}
                    </td>

                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                        {t.description || 'Geração no sistema'}
                      </div>
                      {t.itemId && (
                        <span style={{ fontSize: '10.5px', color: 'var(--text-3)', fontFamily: 'monospace' }}>
                          ID: {t.itemId}
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="badge-tag badge-openai" style={{ fontSize: '11px' }}>
                        {(t.model || t.provider || 'IA').toUpperCase()}
                      </span>
                    </td>

                    <td style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                      {tokensCount > 0 ? (
                        <span>{tokensCount} tokens</span>
                      ) : (
                        <span>{t.quantity || 1} {t.quantity === 1 ? 'item' : 'itens'}</span>
                      )}
                    </td>

                    <td>
                      <span style={{ color: '#f43f5e', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        ${Number(t.costUsd || 0).toFixed(4)}
                      </span>
                    </td>

                    <td>
                      <span style={{ color: '#22c55e', fontWeight: 800, fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}>
                        R$ {Number(t.costBrl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                      </span>
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
