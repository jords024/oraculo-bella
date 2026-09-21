import React, { useState, useEffect } from 'react';

export default function ReelsCloner({ onOpenNewModal, showToast }) {
  const [url, setUrl] = useState('');
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState(['Aguardando início...']);
  const [result, setResult] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeSection, setActiveSection] = useState('cloner'); // 'cloner' ou 'history'

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/reels/history');
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      showToast('Erro ao carregar histórico de Reels.');
    }
  };

  const handleRun = () => {
    if (!url.trim()) return alert('Insira uma URL!');
    setRunning(true);
    setLogs([`Iniciando engenharia reversa para: ${url}`]);
    setResult(null);

    const eventSource = new EventSource(`/api/reels/analyze?url=${encodeURIComponent(url)}`);

    eventSource.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setLogs(prev => [...prev, data.message]);
      } else if (data.type === 'error') {
        setLogs(prev => [...prev, `[ERRO] ${data.message}`]);
      } else if (data.type === 'done') {
        eventSource.close();
        setRunning(false);
        if (data.result && !data.result.error) {
          setResult(data.result);
          loadHistory();
        } else if (data.result?.error) {
          setLogs(prev => [...prev, `[ERRO FATAL] ${data.result.error}`]);
        }
      }
    };

    eventSource.onerror = function() {
      setLogs(prev => [...prev, 'Erro na conexão com o servidor.']);
      eventSource.close();
      setRunning(false);
    };
  };

  const handleDownloadVideo = async () => {
    if (!url.trim()) return alert('Cole a URL do Reel primeiro.');
    setDownloading(true);
    try {
      const res = await fetch(`/api/reels/download?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const disposition = res.headers.get('Content-Disposition') || '';
        const match = disposition.match(/filename="?([^"]+)"?/);
        const filename = match ? match[1] : 'reel.mp4';
        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      alert('Falha no download: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadTranscription = () => {
    if (!result?.transcricao_original) return;
    const blob = new Blob([result.transcricao_original], { type: 'text/plain' });
    const fileUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `transcricao-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCreateCarousel = () => {
    if (!result?.roteiro_fonte_oculta) return;
    onOpenNewModal({
      title: "Reel Adaptado",
      theme: "engenharia-reversa",
      notes: "ROTEIRO GERADO PELO CLONADOR:\n\n" + result.roteiro_fonte_oculta
    });
  };

  const handleDeleteHistory = async (idx) => {
    if (!confirm('Apagar esta análise do histórico?')) return;
    try {
      const res = await fetch(`/api/reels/history/${idx}`, { method: 'DELETE' });
      if (res.ok) {
        loadHistory();
        showToast('Análise apagada do histórico.');
      }
    } catch (e) {
      showToast('Erro ao apagar análise.');
    }
  };

  return (
    <div>
      <div className="oraculo-header">
        <div>
          <div className="oraculo-title">CLONADOR DE REELS (Engenharia Reversa)</div>
          <div className="oraculo-subtitle">Cole a URL de um Reel viral para extrair o gancho e adaptar o roteiro para a Fonte Oculta.</div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '30px',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '6px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        width: 'fit-content'
      }}>
        <button
          id="tab-cloner"
          className="btn"
          style={{
            background: activeSection === 'cloner' ? 'var(--gold)' : 'transparent',
            color: activeSection === 'cloner' ? '#000' : 'var(--text-2)',
            border: 'none',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeSection === 'cloner' ? '0 0 10px rgba(212, 175, 55, 0.3)' : 'none'
          }}
          onClick={() => setActiveSection('cloner')}
        >
          📹 Clonar Reels
        </button>
        <button
          id="tab-history"
          className="btn"
          style={{
            background: activeSection === 'history' ? 'var(--gold)' : 'transparent',
            color: activeSection === 'history' ? '#000' : 'var(--text-2)',
            border: 'none',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeSection === 'history' ? '0 0 10px rgba(212, 175, 55, 0.3)' : 'none'
          }}
          onClick={() => setActiveSection('history')}
        >
          📜 Histórico ({history.length})
        </button>
      </div>

      {activeSection === 'cloner' && (
        <div className="section" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, background: 'var(--surface)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div className="form-group">
              <label className="form-label">URL do Instagram Reel ou TikTok</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="https://www.instagram.com/reel/..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  disabled={running}
                />
                <button className="btn btn-gold" disabled={running} onClick={handleRun}>
                  {running ? 'Processando...' : '🔄 Iniciar'}
                </button>
                <button className="btn" onClick={handleDownloadVideo} disabled={downloading}>
                  {downloading ? '⏳ Baixando...' : '⬇ Baixar'}
                </button>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <label className="form-label">Progresso da IA (Running...)</label>
              <div id="reels-terminal" style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', padding: '10px', height: '250px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', color: '#0f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {logs.map((log, index) => <div key={index}>{log}</div>)}
              </div>
            </div>
          </div>

          <div style={{ flex: 1.5, background: 'var(--surface)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">Resultado: Roteiro Adaptado</label>
            {!result ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '14px', textAlign: 'center' }}>
                A engenharia reversa do roteiro aparecerá aqui.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', overflowY: 'auto' }}>
                <div>
                  <strong style={{ color: 'var(--gold)', fontSize: '12px' }}>GANCHO ORIGINAL DO VÍDEO</strong>
                  <div style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '6px', fontSize: '13px', marginTop: '5px', fontStyle: 'italic' }}>
                    {result.gancho_original}
                  </div>
                </div>
                <div>
                  <strong style={{ color: 'var(--cyan)', fontSize: '12px' }}>PADRÃO PSICOLÓGICO</strong>
                  <div style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '6px', fontSize: '13px', marginTop: '5px', lineHeight: 1.4 }}>
                    {result.padrao_psicologico}
                  </div>
                </div>
                <div>
                  <strong style={{ color: 'var(--purple)', fontSize: '12px' }}>TRANSCRIÇÃO ORIGINAL (LITERAL)</strong>
                  <div style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '6px', fontSize: '13px', marginTop: '5px', lineHeight: 1.4, color: 'var(--text-2)', maxHeight: '100px', overflowY: 'auto' }}>
                    {result.transcricao_original}
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: 'var(--green)', fontSize: '12px' }}>ROTEIRO FONTE OCULTA</strong>
                  <textarea
                    className="form-textarea"
                    style={{ flex: 1, minHeight: '150px', marginTop: '5px', fontFamily: 'monospace', lineHeight: 1.5 }}
                    value={result.roteiro_fonte_oculta}
                    onChange={e => setResult(prev => ({ ...prev, roteiro_fonte_oculta: e.target.value }))}
                  />
                </div>
                <div style={{ textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-outline" onClick={handleDownloadTranscription}>📥 Baixar Transcrição</button>
                  <button className="btn btn-gold" onClick={handleCreateCarousel}>+ Criar Carrossel com este Roteiro</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'history' && (
        <div className="section" style={{ marginTop: '0px' }}>
          <div className="section-header">
            <div className="section-title">Histórico de Análises</div>
            <button className="btn btn-outline btn-sm" onClick={loadHistory}>↺ Atualizar Histórico</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {history.length === 0 ? (
              <div style={{ color: 'var(--text-3)', fontSize: '13px' }}>Nenhuma análise no histórico.</div>
            ) : (
              history.map((h, idx) => (
                <div className="carousel-card" style={{ padding: '15px' }} key={idx}>
                  <div style={{ fontSize: '11px', color: 'var(--gold)', marginBottom: '5px' }}>📅 {new Date(h.timestamp).toLocaleString()}</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.url}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    <strong>Hook:</strong> {h.gancho_original}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => {
                      setResult(h);
                      setActiveSection('cloner');
                    }}>👁 Ver</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteHistory(idx)}>✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
