import React, { useState, useEffect, useRef } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';

export default function GenerationHistoryModal({ isOpen, onClose, carouselId }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const logEndRef = useRef(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen || !carouselId) return;

    setLoading(true);
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/carousels/${carouselId}/history`);
        if (res.ok) {
          const data = await res.json();
          setJob(data);
        }
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 2000);

    return () => clearInterval(interval);
  }, [isOpen, carouselId]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [job?.logs]);

  if (!isOpen) return null;

  const statusColors = {
    generating: 'var(--gold, #e0a96d)',
    done: 'var(--green, #22c55e)',
    failed: 'var(--red, #f43f5e)',
    pending: '#9ca3af'
  };

  const statusLabels = {
    generating: '⏳ Gerando...',
    done: '✅ Concluído',
    failed: '❌ Falhou',
    pending: '⏳ Aguardando...'
  };

  return (
    <div className="form-modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.85)', zIndex: 1000 }}>
      <div className="form-box" style={{ maxWidth: '780px', width: '100%', padding: '24px', borderRadius: '16px', background: 'var(--surface2, #18181b)', border: '1px solid var(--border2, #27272a)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3, #a1a1aa)' }}>Histórico de Criação</span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: 'var(--text, #ffffff)' }}>
              {job?.title || `Carrossel ${carouselId}`}
            </h3>
          </div>
          <div style={{ 
            padding: '6px 12px', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: '600', 
            background: 'rgba(0, 0, 0, 0.4)',
            border: `1px solid ${statusColors[job?.status || 'pending']}`,
            color: statusColors[job?.status || 'pending']
          }}>
            {statusLabels[job?.status || 'pending']}
          </div>
        </div>

        {/* Slides Live Preview */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-3, #a1a1aa)', marginBottom: '8px', letterSpacing: '0.05em' }}>
            🖼️ Pré-visualização dos Slides
          </div>
          {loading && !job ? (
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
              Carregando histórico...
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              overflowX: 'auto', 
              padding: '8px 0',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--border2) transparent'
            }}>
              {job?.slides && job.slides.length > 0 ? (
                job.slides.map((slide, idx) => (
                  <div key={idx} style={{ 
                    flex: '0 0 100px', 
                    height: '100px', 
                    borderRadius: '8px', 
                    background: '#09090b',
                    border: '1px solid var(--border2, #27272a)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {slide.status === 'ok' ? (
                      <img 
                        src={`/api/carousels/${carouselId}/image/${slide.filename}`} 
                        alt="" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : slide.status === 'erro' ? (
                      <span style={{ fontSize: '20px' }}>⚠️</span>
                    ) : (
                      <div className="criador-cursor" style={{ width: '20px', height: '20px' }}></div>
                    )}
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '4px', 
                      left: '4px', 
                      background: 'rgba(0,0,0,0.75)', 
                      borderRadius: '4px', 
                      padding: '2px 6px', 
                      fontSize: '9px',
                      color: '#ffffff'
                    }}>
                      Slide {slide.num}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  width: '100%', 
                  padding: '24px', 
                  textAlign: 'center', 
                  color: 'var(--text-3)', 
                  border: '1px dashed var(--border2)', 
                  borderRadius: '8px',
                  fontSize: '13px'
                }}>
                  Nenhum slide foi gerado ainda. Aguardando processamento...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logs terminal */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-3, #a1a1aa)', marginBottom: '8px', letterSpacing: '0.05em' }}>
            📋 Logs de Execução
          </div>
          <div style={{ 
            height: '240px', 
            overflowY: 'auto', 
            background: '#09090b', 
            border: '1px solid var(--border2, #27272a)', 
            borderRadius: '8px', 
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: '1.6',
            color: '#e4e4e7',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {job?.logs && job.logs.length > 0 ? (
              job.logs.map((log, i) => (
                <div key={i} style={{ 
                  color: log.includes('erro') || log.includes('Erro') || log.includes('falhou') ? 'var(--red, #f43f5e)' :
                         log.includes('Concluído') || log.includes('sucesso') || log.includes('✓') ? 'var(--green, #22c55e)' :
                         log.includes('⚙') || log.includes('☁') ? 'var(--gold, #e0a96d)' : '#e4e4e7'
                }}>
                  {log}
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-3)' }}>Aguardando logs...</div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Footer/Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '10px 24px', fontWeight: '600' }}>
            Fechar Histórico
          </button>
        </div>
      </div>
    </div>
  );
}
