import React, { useState, useEffect } from 'react';

export default function Radar({ showToast }) {
  const [radarData, setRadarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncInfo, setSyncInfo] = useState('Última busca: Desconhecida');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadRadar();
  }, []);

  const loadRadar = async () => {
    setLoading(true);
    try {
      const res = await window.customFetch('/api/radar');
      const data = await res.json();
      setRadarData(data);
      setCurrentPage(1);
    } catch (e) {
      showToast('Erro ao carregar o Radar.');
    } finally {
      setLoading(false);
    }
  };

  const syncRadar = async () => {
    setSyncing(true);
    try {
      const res = await window.customFetch('/api/radar/sync', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        showToast('Radar atualizado com sucesso!');
        setRadarData(data.data);
        setSyncInfo('Última busca: ' + new Date().toLocaleString('pt-BR'));
        setCurrentPage(1);
      } else {
        alert('Erro: ' + data.error);
      }
    } catch (e) {
      showToast('Erro ao sincronizar radar.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="oraculo-header">
        <div>
          <div className="oraculo-title">RADAR DE DESCOBERTAS</div>
          <div className="oraculo-subtitle">Monitoramento em tempo real de estudos e notícias inusitadas (Apify Google Search)</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="oraculo-sync-info">{syncInfo}</span>
          <button className="btn-sync" disabled={syncing} onClick={syncRadar}>
            {syncing ? ' Sincronizando...' : '↻ Sincronizar Radar'}
          </button>
        </div>
      </div>

      <div className="section">
        {loading ? (
          <div className="empty">
            <div className="empty-icon">⏳</div>
            <div className="empty-text">Carregando o Radar...</div>
          </div>
        ) : radarData.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📡</div>
            <div className="empty-text">Nenhuma descoberta recente.</div>
          </div>
        ) : (
          <>
            <div className="carousel-grid">
              {radarData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, idx) => (
                <div className="carousel-card" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }} key={idx}>
                  <div style={{ fontSize: '10px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    {item.query}
                  </div>
                  <div className="card-title" style={{ fontSize: '16px', marginBottom: '12px', lineHeight: '1.4' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '20px', lineHeight: '1.5', flex: 1 }}>
                    {item.snippet}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ textDecoration: 'none', textAlign: 'center', flex: 1 }}>Ler Original</a>
                    <button className="btn btn-gold" style={{ flex: 1 }} onClick={() => alert('Funcionalidade Roteiro do Oráculo em construção!')}>🪄 Gerar Roteiro</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Controles de Paginação */}
            <div className="pagination" style={{ marginTop: '24px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>Exibir:</span>
                <select
                  className="status-select"
                  id="items-per-page-select"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ fontSize: '12px', padding: '6px 12px', height: 'auto' }}
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>
              </div>

              <div className="pagination-controls" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <button
                  className="page-btn"
                  id="btn-prev-page"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                
                {Array.from({ length: Math.ceil(radarData.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="page-btn"
                  id="btn-next-page"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(radarData.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(radarData.length / itemsPerPage) || Math.ceil(radarData.length / itemsPerPage) <= 1}
                >
                  Próximo
                </button>
              </div>
              
              <div className="pagination-info" style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                Mostrando {Math.min(radarData.length, (currentPage - 1) * itemsPerPage + 1)} a {Math.min(currentPage * itemsPerPage, radarData.length)} de {radarData.length} tópicos
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
