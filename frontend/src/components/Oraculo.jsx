import React, { useState, useEffect } from 'react';

export default function Oraculo({ showToast }) {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Cálculos de Paginação
  const totalPages = Math.ceil(posts.length / itemsPerPage) || 1;
  const paginatedPosts = posts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/oraculo/completo');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || null);
        setPosts(data.posts || []);
      }
    } catch (e) {
      showToast('Erro ao carregar estatísticas do Oráculo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/oraculo/sync', { method: 'POST' });
      if (res.ok) {
        showToast('Instagram sincronizado!');
        loadStats();
      }
    } catch (e) {
      showToast('Erro ao sincronizar.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="oraculo-header">
        <div>
          <div className="oraculo-title">ORÁCULO</div>
          <div className="oraculo-subtitle">Clique em Sincronizar para carregar os dados do Instagram</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-sync" disabled={syncing} onClick={handleSync}>
            {syncing ? '⟳ Sincronizando...' : '⟳ Sincronizar'}
          </button>
        </div>
      </div>

      {stats && (
        <div className="oraculo-totals">
          <div className="oraculo-total-card" style={{ '--accent': 'var(--gold)' }}>
            <div className="oraculo-total-num">{stats.posts || 0}</div>
            <div className="oraculo-total-label">Posts</div>
          </div>
          <div className="oraculo-total-card" style={{ '--accent': '#e56' }}>
            <div className="oraculo-total-num">{stats.likes || 0}</div>
            <div className="oraculo-total-label">Curtidas</div>
          </div>
          <div className="oraculo-total-card" style={{ '--accent': 'var(--cyan)' }}>
            <div className="oraculo-total-num">{stats.comments || 0}</div>
            <div className="oraculo-total-label">Comentários</div>
          </div>
          <div className="oraculo-total-card" style={{ '--accent': 'var(--green)' }}>
            <div className="oraculo-total-num">{stats.saved || 0}</div>
            <div className="oraculo-total-label">Salvamentos</div>
          </div>
          <div className="oraculo-total-card" style={{ '--accent': 'var(--purple)' }}>
            <div className="oraculo-total-num">{stats.shares || 0}</div>
            <div className="oraculo-total-label">Shares</div>
          </div>
          <div className="oraculo-total-card" style={{ '--accent': 'var(--blue)' }}>
            <div className="oraculo-total-num">{stats.reach || 0}</div>
            <div className="oraculo-total-label">Alcance (reach)</div>
          </div>
          <div className="oraculo-total-card" style={{ '--accent': '#f0a500' }}>
            <div className="oraculo-total-num">{stats.follows || 0}</div>
            <div className="oraculo-total-label">Seguidores</div>
          </div>
        </div>
      )}

      <div className="oraculo-table-wrap">
        {loading ? (
          <div className="oraculo-empty">
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔮</div>
            <div style={{ fontSize: '15px', color: 'var(--text-2)', marginBottom: '8px' }}>Carregando dados...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="oraculo-empty">
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔮</div>
            <div style={{ fontSize: '15px', color: 'var(--text-2)', marginBottom: '8px' }}>Oráculo aguardando sincronização</div>
            <div style={{ fontSize: '13px' }}>Clique em Sincronizar para buscar todos os posts do @afonteoculta</div>
          </div>
        ) : (
          <div>
            <style>{`
              .oraculo-table th, .oraculo-table td {
                padding: 16px 20px !important;
              }
              .oraculo-caption {
                max-width: 450px !important;
                white-space: normal !important;
                word-wrap: break-word !important;
                overflow: visible !important;
                text-overflow: clip !important;
                line-height: 1.6 !important;
              }
              .oraculo-table tbody tr {
                border-bottom: 1px solid var(--border) !important;
              }
              .oraculo-table-wrap {
                padding-bottom: 60px !important;
              }
            `}</style>
            <table className="oraculo-table">
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Likes</th>
                  <th>Comentários</th>
                  <th>Salvamentos</th>
                  <th>Shares</th>
                  <th>Alcance</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPosts.map((post, index) => (
                  <tr key={index}>
                    <td>
                      <div className="oraculo-caption">{post.caption || 'Sem legenda'}</div>
                    </td>
                    <td className="oraculo-num">{post.likes}</td>
                    <td className="oraculo-num">{post.comments}</td>
                    <td className="oraculo-num">{post.saved}</td>
                    <td className="oraculo-num">{post.shares}</td>
                    <td className="oraculo-num">{post.reach}</td>
                    <td className="oraculo-date">{new Date(post.date).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginação do Oráculo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-2)' }}>
                <span>Mostrar</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border2)',
                    color: 'var(--text-2)',
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value={50}>50</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </select>
                <span>por página</span>
              </div>
              
              <div className="pagination-controls" style={{ display: 'flex', gap: '5px' }}>
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${currentPage === p ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      backgroundColor: currentPage === p ? 'var(--gold, #C9A84C)' : '',
                      borderColor: currentPage === p ? 'var(--gold, #C9A84C)' : '',
                      color: currentPage === p ? '#000' : ''
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
