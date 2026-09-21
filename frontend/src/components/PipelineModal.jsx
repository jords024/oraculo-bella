import React, { useState, useEffect } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';
import PipelineOverviewTab from './PipelineModal/PipelineOverviewTab';
import PipelineAgentsTab from './PipelineModal/PipelineAgentsTab';
import PipelineSlidesTab from './PipelineModal/PipelineSlidesTab';
import PipelineChatTab from './PipelineModal/PipelineChatTab';
import PipelineLogsTab from './PipelineModal/PipelineLogsTab';
import MaximizedPromptModal from './PipelineModal/MaximizedPromptModal';

const TABS = [
  { id: 'overview', label: '🎯 Visão Geral' },
  { id: 'agents', label: '🤖 Prompts dos Agentes' },
  { id: 'slides', label: '🎨 Prompts dos Slides' },
  { id: 'chat', label: '💬 Histórico de Chat' },
  { id: 'logs', label: '📜 Logs de Execução' }
];

export default function PipelineModal({ carousel, onClose }) {
  useScrollLock(Boolean(carousel));

  const [activeTab, setActiveTab] = useState('overview');
  const [copiedPromptKey, setCopiedPromptKey] = useState(null);
  const [pipelineInfo, setPipelineInfo] = useState(carousel);
  const [loading, setLoading] = useState(true);
  const [collapsedAgents, setCollapsedAgents] = useState({});
  const [maximizedAgent, setMaximizedAgent] = useState(null);

  const toggleAgentCollapse = (id) => {
    setCollapsedAgents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllAgents = (agentList) => {
    const allCollapsed = agentList.every(a => collapsedAgents[a.id]);
    if (allCollapsed) {
      setCollapsedAgents({});
    } else {
      const newMap = {};
      agentList.forEach(a => { newMap[a.id] = true; });
      setCollapsedAgents(newMap);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!carousel?.id) return;

    fetch(`/api/carousels/${carousel.id}/pipeline`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar pipeline');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setPipelineInfo(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPipelineInfo(carousel);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [carousel]);

  if (!carousel) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptKey(key);
    setTimeout(() => setCopiedPromptKey(null), 2000);
  };

  const agentPrompts = pipelineInfo?.agentPrompts || {};
  const chatHistory = pipelineInfo?.chatHistory || [];
  const logs = pipelineInfo?.generationLogs || [];
  const slides = pipelineInfo?.slides || [];

  return (
    <div
      className="pipeline-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        .pipeline-modal-panel {
          overflow: hidden !important;
        }
        .custom-pipeline-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-pipeline-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .custom-pipeline-scroll::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.4);
          border-radius: 4px;
        }
        .custom-pipeline-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>

      <div
        className="pipeline-modal-panel"
        style={{
          width: '100%',
          maxWidth: '920px',
          height: '85vh',
          maxHeight: '850px',
          backgroundColor: '#121319',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(139, 92, 246, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#e4e4e7'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div style={{
          flexShrink: 0,
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.12) 0%, rgba(18, 19, 25, 0) 100%)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
                Pipeline de Criação do Carrossel
              </h2>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                color: '#a78bfa',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                fontWeight: '600'
              }}>
                {pipelineInfo.id}
              </span>
              {(pipelineInfo.generationDuration || carousel?.generationDuration) && (
                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  fontWeight: '600'
                }}>
                  ⏱️ {pipelineInfo.generationDuration || carousel?.generationDuration}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
              {pipelineInfo.title || 'Sem título'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#fff'}
            onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
            title="Fechar Modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          gap: '6px',
          padding: '12px 24px 0 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0c0d12',
          overflowX: 'auto',
          position: 'relative',
          zIndex: 10
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                backgroundColor: activeTab === tab.id ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #8b5cf6' : '2px solid transparent',
                color: activeTab === tab.id ? '#a78bfa' : 'rgba(255, 255, 255, 0.6)',
                fontWeight: activeTab === tab.id ? '600' : '400',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div
          className="custom-pipeline-scroll"
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#a78bfa' }}>
              ⚡ Carregando dados do pipeline...
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <PipelineOverviewTab pipelineInfo={pipelineInfo} />}
              {activeTab === 'agents' && (
                <PipelineAgentsTab
                  pipelineInfo={pipelineInfo}
                  agentPrompts={agentPrompts}
                  collapsedAgents={collapsedAgents}
                  toggleAgentCollapse={toggleAgentCollapse}
                  toggleAllAgents={toggleAllAgents}
                  handleCopy={handleCopy}
                  copiedPromptKey={copiedPromptKey}
                  setMaximizedAgent={setMaximizedAgent}
                />
              )}
              {activeTab === 'slides' && <PipelineSlidesTab slides={slides} pipelineInfo={pipelineInfo} />}
              {activeTab === 'chat' && <PipelineChatTab chatHistory={chatHistory} />}
              {activeTab === 'logs' && <PipelineLogsTab logs={logs} />}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          flexShrink: 0,
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: '#0c0d12'
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal Overlay para Maximizar Prompt */}
      <MaximizedPromptModal
        maximizedAgent={maximizedAgent}
        setMaximizedAgent={setMaximizedAgent}
        handleCopy={handleCopy}
        copiedPromptKey={copiedPromptKey}
      />
    </div>
  );
}
