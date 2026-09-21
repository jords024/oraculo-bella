import React, { useState } from 'react';

export default function VideoFactory() {
  const [tema, setTema] = useState('');
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState(['Aguardando inserção de tema...']);

  const runVideoFactory = () => {
    if (!tema.trim()) return alert('Insira um tema!');
    setRunning(true);
    setLogs([`> Iniciando fábrica para: ${tema}`]);

    const eventSource = new EventSource(`/api/video/generate?tema=${encodeURIComponent(tema)}`);

    eventSource.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (data.type === 'log' || data.type === 'error') {
        setLogs(prev => [...prev, `> ${data.message}`]);
      } else if (data.type === 'done') {
        eventSource.close();
        setRunning(false);
        setLogs(prev => [
          ...prev,
          '> -----------------------------------------------------',
          '> PROCESSO CONCLUÍDO COM SUCESSO!'
        ]);
      }
    };

    eventSource.onerror = function() {
      eventSource.close();
      setRunning(false);
      setLogs(prev => [...prev, '> Erro na conexão com a fábrica de vídeos.']);
    };
  };

  return (
    <div>
      <div className="oraculo-header">
        <div>
          <div className="oraculo-title">FÁBRICA DE VÍDEOS (Seedance 2.0 + ElevenLabs)</div>
          <div className="oraculo-subtitle">Gere vídeos completos (12s) com narração misteriosa e cena Dark Fantasy. Os arquivos serão salvos em campanhas/reels/temp/</div>
        </div>
      </div>
      <div className="section" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, background: 'var(--surface)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div className="form-group">
            <label className="form-label">Tema do Vídeo</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Ex: O verdadeiro motivo pelo qual colocam flúor na água..."
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                disabled={running}
              />
              <button className="btn btn-gold" disabled={running} onClick={runVideoFactory}>
                {running ? 'Processando...' : '🚀 Produzir Vídeo'}
              </button>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <label className="form-label">Progresso da IA (Terminal)</label>
            <div id="video-terminal" style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', padding: '10px', height: '350px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#3ACC7A', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: '1.4' }}>
              {logs.map((log, index) => (
                <div key={index} style={{ color: log.includes('ERRO') ? '#CC4455' : 'inherit' }}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
