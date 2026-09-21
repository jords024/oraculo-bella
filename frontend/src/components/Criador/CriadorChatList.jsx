import React from 'react';
import { getTemplate, parseIdeasFromText } from './criadorConstants';
import MarkdownMessage from './MarkdownMessage';
import AgentActivityPanel from './AgentActivityPanel';

export default function CriadorChatList({
  messages,
  generating,
  isMockFlow,
  onSend,
  onCopy,
  onCreateCarousel,
  startingCarousel,
  msgsRef,
  scrollAnchorRef,
  IDEAS_PROMPT,
  selectedTemplate
}) {
  const activeTemplate = getTemplate(selectedTemplate);

  return (
    <div className="criador-msgs" ref={msgsRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {messages.length === 0 ? (
        <div className="criador-welcome">
          <div className="criador-welcome-mark" style={{ '--creator-accent': activeTemplate.color }}>
            {isMockFlow ? '⚡' : activeTemplate.icon}
          </div>
          <div className="criador-welcome-eyebrow">{isMockFlow ? 'AMBIENTE DE TESTE' : `DIREÇÃO ${activeTemplate.shortName.toUpperCase()}`}</div>
          <div className="criador-welcome-title">{isMockFlow ? 'Teste de escala' : activeTemplate.welcomeTitle}</div>
          <div className="criador-welcome-sub">
            {isMockFlow 
              ? 'Gere o roteiro do carrossel usando IA e crie o design de teste instantaneamente e sem custos.'
              : activeTemplate.welcomeDescription
            }
          </div>
          <div className="criador-chips">
            {activeTemplate.suggestions.map(suggestion => (
              <button key={suggestion} className="criador-chip" onClick={() => onSend(suggestion)}>{suggestion}</button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((m, idx) => {
          return (
            <div key={idx} className={`criador-msg criador-msg--${m.role}`}>
              <div className="criador-avatar">{m.role === 'user' ? '✦' : '🌸'}</div>
              <div className="criador-bubble">
                {(() => {
                  if (typeof m.content !== 'string') return m.content;
                  if (m.role === 'user') {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = m.content.split(urlRegex);
                    return parts.map((part, i) => {
                      if (part.match(urlRegex)) {
                        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline', wordBreak: 'break-all' }}>{part}</a>;
                      }
                      return part;
                    });
                  }

                  return <MarkdownMessage content={m.content} />;
                })()}
                {m.streaming && <span className="criador-cursor"></span>}
                {m.role === 'ai' && Array.isArray(m.activities) && m.activities.length > 0 ? (
                  <AgentActivityPanel
                    activities={m.activities}
                    streaming={m.streaming}
                    startedAt={m.activityStartedAt}
                    finishedAt={m.activityFinishedAt}
                  />
                ) : m.streaming && m.stageLabel && (
                  <div className="creator-editorial-stage" role="status" aria-live="polite">
                    <span className="creator-editorial-stage__pulse" aria-hidden="true" />
                    {m.stageLabel}
                  </div>
                )}
                {m.role === 'ai' && !m.streaming && (() => {
                  const ideas = parseIdeasFromText(m.content);
                  if (ideas.length > 0 && !generating) {
                    return (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '600' }}>✦ Clique para escolher o tema e gerar o carrossel:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {ideas.map((idea, iIdx) => (
                            <button
                              key={iIdx}
                              className="criador-action-btn"
                              style={{ background: 'rgba(184, 98, 62, 0.15)', borderColor: 'rgba(184, 98, 62, 0.4)', color: 'var(--text-1)' }}
                              onClick={() => onSend(`${idea.num ? idea.num + '. ' : ''}Tema: ${idea.theme}\nTítulo: ${idea.title}`)}
                            >
                              ✨ {idea.num ? `#${idea.num} ` : ''}{idea.theme}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                {m.role === 'ai' && !m.streaming && (
                  <div style={{ marginTop: '8px', fontSize: '10.5px', color: 'rgba(237, 232, 223, 0.45)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      {m.timestamp || (new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' de ' + new Date().toLocaleDateString('pt-BR'))}
                    </span>
                    {m.costUSD !== undefined && (
                      <span style={{ color: 'var(--gold)', fontWeight: '500' }}>
                        Modelo: {(m.model || 'gpt-5.6-terra').toUpperCase()} · Profundidade: {(m.reasoningEffort || 'medium') === 'low' ? 'LEVE' : (m.reasoningEffort || 'medium') === 'high' ? 'FORTE' : 'MÉDIO'} | Custo: ${m.costUSD.toFixed(4)} USD (~R$ {(m.costUSD * 5).toFixed(3)} BRL)
                      </span>
                    )}
                  </div>
                )}
                {m.role === 'ai' && !m.streaming && m.content && (() => {
                  const hasSlides = m.isCarousel || m.content.includes('[S1') || m.content.includes('[S01') || (m.parsedSlides && m.parsedSlides.length > 0);
                  return (
                    <div className="criador-msg-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                      {hasSlides && (
                        <button
                          onClick={() => onCreateCarousel(m.content, m.parsedSlides)}
                          disabled={startingCarousel}
                          aria-busy={startingCarousel}
                          style={{
                            background: 'linear-gradient(135deg, #B8623E 0%, #944828 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            color: '#FAF6F0',
                            fontWeight: '700',
                            padding: '9px 18px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: startingCarousel ? 'wait' : 'pointer',
                            opacity: startingCarousel ? 0.72 : 1,
                            fontSize: '13px',
                            boxShadow: '0 4px 14px rgba(184, 98, 62, 0.4)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 18px rgba(184, 98, 62, 0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(184, 98, 62, 0.4)';
                          }}
                          title="Gerar as artes e imagens deste carrossel"
                        >
                          <span>{startingCarousel ? '⏳ Enviando para geração...' : '🎨 Gerar Arte do Carrossel'}</span>
                          <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 7px', borderRadius: '4px', fontSize: '11px', color: '#FAF6F0' }}>
                            {m.parsedSlides?.length ? `${m.parsedSlides.length} Slides` : '10 Slides'}
                          </span>
                        </button>
                      )}
                      <button className="criador-action-btn" onClick={() => onCopy(m.content)} style={{ padding: '8px 12px', fontSize: '12px' }}>
                        📋 Copiar Roteiro
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })
      )}
      <div ref={scrollAnchorRef} />
    </div>
  );
}
