import React from 'react';

export default function DashboardStats({ stats }) {
  return (
    <div className="stats-row">
      <div className="stat-card" style={{ '--accent': 'var(--gold)' }}>
        <div className="stat-num">{stats?.total || 0}</div>
        <div className="stat-label">Carrosséis produzidos</div>
      </div>
      <div className="stat-card" style={{ '--accent': 'var(--cyan)' }}>
        <div className="stat-num">{stats?.slides || 0}</div>
        <div className="stat-label">Slides gerados</div>
      </div>
      <div className="stat-card" style={{ '--accent': 'var(--green)' }}>
        <div className="stat-num">{stats?.aprovados || 0}</div>
        <div className="stat-label">Aprovados / prontos</div>
      </div>
      <div className="stat-card" style={{ '--accent': 'var(--purple)' }}>
        <div className="stat-num">{stats?.publicados || 0}</div>
        <div className="stat-label">Publicados</div>
      </div>
      <div className="stat-card" style={{ '--accent': 'var(--green)' }}>
        <div className="stat-num" style={{ fontSize: stats?.cost && stats.cost > 0 ? '28px' : undefined }}>
          R$ {stats?.cost !== undefined && stats?.cost !== null ? Number(stats.cost).toFixed(2) : '0,00'}
        </div>
        <div className="stat-label">Custo total (BRL)</div>
      </div>
    </div>
  );
}
