import React from 'react';

const CATEGORIZE_AGENT = (id) => {
  const normId = (id || '').toLowerCase();
  const textCopyKeywords = ['copy', 'oraculo', 'gancho', 'humanizer', 'cta', 'criador', 'roteirista'];
  const designVisualKeywords = ['visual', 'diretor', 'arte', 'dna', 'imagem'];
  
  if (textCopyKeywords.some(k => normId.includes(k))) return 'TEXTO & COPY';
  if (designVisualKeywords.some(k => normId.includes(k))) return 'DESIGN & VISUAL';
  return 'REVISÃO & GESTÃO';
};

const AGENT_COLORS = ['#e0a96d', '#8b5cf6', '#06b6d4', '#ec4899', '#22c55e', '#f43f5e', '#3b82f6', '#eab308'];

export default function PipelineAgentsTab({
  pipelineInfo,
  agentPrompts,
  collapsedAgents,
  toggleAgentCollapse,
  toggleAllAgents,
  handleCopy,
  copiedPromptKey,
  setMaximizedAgent
}) {
  const agentList = pipelineInfo?.agentPromptsList || (
    Object.entries(agentPrompts).map(([k, v]) => ({
      id: k,
      name: k.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      content: v
    }))
  );

  const groupedAgents = {
    'TEXTO & COPY': [],
    'DESIGN & VISUAL': [],
    'REVISÃO & GESTÃO': []
  };

  agentList.forEach(agent => {
    const cat = CATEGORIZE_AGENT(agent.id);
    if (!groupedAgents[cat]) groupedAgents[cat] = [];
    groupedAgents[cat].push(agent);
  });

  const getAgentColor = (id, idx) => {
    return AGENT_COLORS[idx % AGENT_COLORS.length];
  };

  let globalIdx = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#a78bfa' }}>
          🤖 Todos os Agentes Registrados ({agentList.length})
        </span>
        <button
          type="button"
          onClick={() => toggleAllAgents(agentList)}
          style={{
            padding: '4px 10px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: '#a1a1aa',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '6px',
            fontSize: '11px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          {agentList.every(a => collapsedAgents[a.id]) ? '▲ Expandir Todos' : '▼ Recolher Todos'}
        </button>
      </div>

      {Object.entries(groupedAgents).map(([categoryName, items]) => {
        if (items.length === 0) return null;

        return (
          <div key={categoryName} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: '700',
              color: 'rgba(255, 255, 255, 0.45)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              paddingTop: '8px',
              paddingBottom: '4px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{categoryName}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)', fontWeight: 'normal' }}>
                ({items.length})
              </span>
            </div>

            {items.map(agent => {
              const idx = globalIdx++;
              const promptText = agent.content || agentPrompts[agent.id] || 'Prompt não disponível.';
              const agentColor = getAgentColor(agent.id, idx);
              const isCollapsed = Boolean(collapsedAgents[agent.id]);

              return (
                <div
                  key={agent.id || idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    onClick={() => toggleAgentCollapse(agent.id)}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                        {isCollapsed ? '►' : '▼'}
                      </span>
                      <span style={{ fontWeight: '600', fontSize: '13px', color: agentColor }}>
                        🎭 {agent.name || agent.id}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontFamily: 'monospace'
                      }}>
                        {agent.id}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMaximizedAgent({
                            id: agent.id,
                            name: agent.name || agent.id,
                            content: promptText,
                            color: agentColor
                          });
                        }}
                        title="Maximizar prompt em tela cheia"
                        style={{
                          padding: '4px 10px',
                          backgroundColor: 'rgba(139, 92, 246, 0.15)',
                          color: '#a78bfa',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s'
                        }}
                      >
                        ⛶ Maximizar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(promptText, agent.id);
                        }}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: copiedPromptKey === agent.id ? '#22c55e' : 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                      >
                        {copiedPromptKey === agent.id ? '✓ Copiado!' : '📋 Copiar Prompt'}
                      </button>
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                        {isCollapsed ? 'Mostrar' : 'Ocultar'}
                      </span>
                    </div>
                  </div>
                  {!isCollapsed && (
                    <pre
                      className="custom-pipeline-scroll"
                      style={{
                        margin: 0,
                        padding: '14px',
                        fontSize: '12px',
                        lineHeight: '1.5',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        color: '#a1a1aa',
                        maxHeight: '220px',
                        overflowY: 'auto'
                      }}
                    >
                      {promptText}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
