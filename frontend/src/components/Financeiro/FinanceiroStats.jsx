import React from 'react';

export default function FinanceiroStats({ summary, categoriesBreakdown }) {
  if (!summary) return null;

  return (
    <div className="financeiro-kpi-grid">
      <div className="financeiro-kpi-card" style={{ '--accent': '#22c55e' }}>
        <div className="financeiro-kpi-label">
          <span>Custo Total Geral</span>
          <span style={{ color: '#22c55e' }}>💰 BRL</span>
        </div>
        <div className="financeiro-kpi-value" style={{ color: '#22c55e' }}>
          R$ {Number(summary.totalCostBrl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="financeiro-kpi-sub">
          Equivalente a ${Number(summary.totalCostUsd || 0).toFixed(2)} USD
        </div>
      </div>

      <div className="financeiro-kpi-card" style={{ '--accent': '#10b981' }}>
        <div className="financeiro-kpi-label">
          <span>Economia (Text-Only)</span>
          <span style={{ color: '#10b981' }}>✨ Grátis</span>
        </div>
        <div className="financeiro-kpi-value" style={{ color: '#10b981' }}>
          R$ {Number(summary.totalSavedBrl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="financeiro-kpi-sub">
          ${Number(summary.totalSavedUsd || 0).toFixed(2)} economizados em API
        </div>
      </div>

      <div className="financeiro-kpi-card" style={{ '--accent': 'var(--cyan, #38bdf8)' }}>
        <div className="financeiro-kpi-label">
          <span>Carrosséis & Recriações</span>
          <span style={{ color: '#38bdf8' }}>📊 Produção</span>
        </div>
        <div className="financeiro-kpi-value">
          R$ {Number((categoriesBreakdown?.carousels?.brl || 0) + (categoriesBreakdown?.retries?.brl || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="financeiro-kpi-sub">
          {summary.totalCarousels || 0} carrosséis · {categoriesBreakdown?.retries?.count || 0} recriações
        </div>
      </div>

      <div className="financeiro-kpi-card" style={{ '--accent': 'var(--purple, #a855f7)' }}>
        <div className="financeiro-kpi-label">
          <span>Imagens de Estúdio</span>
          <span style={{ color: '#a855f7' }}>🎨 Galeria</span>
        </div>
        <div className="financeiro-kpi-value">
          R$ {Number(categoriesBreakdown?.studioImages?.brl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="financeiro-kpi-sub">
          {categoriesBreakdown?.studioImages?.count || 0} imagens geradas
        </div>
      </div>

      <div className="financeiro-kpi-card" style={{ '--accent': 'var(--gold, #c9a84c)' }}>
        <div className="financeiro-kpi-label">
          <span>Prompts & Conversas IA</span>
          <span style={{ color: 'var(--gold, #c9a84c)' }}>💬 Chat</span>
        </div>
        <div className="financeiro-kpi-value">
          R$ {Number(categoriesBreakdown?.prompts?.brl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="financeiro-kpi-sub">
          ${Number(categoriesBreakdown?.prompts?.usd || 0).toFixed(4)} USD ({categoriesBreakdown?.prompts?.count || 0} prompts)
        </div>
      </div>

      <div className="financeiro-kpi-card" style={{ '--accent': '#06b6d4' }}>
        <div className="financeiro-kpi-label">
          <span>Custo Médio / Slide</span>
          <span style={{ color: '#06b6d4' }}>⚡ Por Imagem</span>
        </div>
        <div className="financeiro-kpi-value">
          R$ {Number(summary.avgCostPerSlideBrl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="financeiro-kpi-sub">
          ${Number(summary.avgCostPerSlideUsd || 0).toFixed(3)} USD por imagem de IA
        </div>
      </div>
    </div>
  );
}
