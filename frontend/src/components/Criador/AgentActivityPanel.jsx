import React, { useEffect, useMemo, useState } from 'react';

function durationLabel(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes ? `${minutes} min ${seconds} s` : `${seconds} s`;
}

const STATUS_LABELS = { working: 'Em atividade', done: 'Concluído', warning: 'Proteção aplicada' };

export default function AgentActivityPanel({ activities = [], streaming, startedAt, finishedAt }) {
  const [expanded, setExpanded] = useState(Boolean(streaming));
  const [, setClock] = useState(Date.now());

  useEffect(() => {
    if (!streaming) return undefined;
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [streaming]);

  const elapsed = Math.max(0, Number(finishedAt || Date.now()) - Number(startedAt || Date.now()));
  const completed = useMemo(() => activities.filter(item => item.status === 'done').length, [activities]);
  const active = activities.find(item => item.status === 'working');
  if (!activities.length) return null;

  return (
    <section className={`agent-activity ${streaming ? 'is-live' : 'is-finished'}`} aria-label="Atividade dos agentes do Oráculo">
      <button type="button" className="agent-activity__header" onClick={() => setExpanded(value => !value)} aria-expanded={expanded}>
        <span className={`agent-activity__signal ${streaming ? 'is-live' : 'is-done'}`} aria-hidden="true" />
        <span className="agent-activity__heading">
          <strong>{streaming ? `Oráculo trabalhando há ${durationLabel(elapsed)}` : `Trabalhou por ${durationLabel(elapsed)}`}</strong>
          <small>{streaming ? (active?.title || 'Coordenando os agentes') : `${completed} etapas concluídas`}</small>
        </span>
        <span className={`agent-activity__chevron ${expanded ? 'is-open' : ''}`} aria-hidden="true">⌄</span>
      </button>
      {expanded && (
        <div className="agent-activity__timeline" aria-live="polite">
          {activities.map((item, index) => (
            <article className={`agent-step is-${item.status || 'working'}`} key={item.id || index}>
              <div className="agent-step__rail" aria-hidden="true"><span>{item.status === 'done' ? '✓' : item.status === 'warning' ? '!' : ''}</span></div>
              <div className="agent-step__content">
                <div className="agent-step__identity"><strong>{item.agent || 'Oráculo'}</strong><span>{STATUS_LABELS[item.status] || 'Em atividade'}</span></div>
                {Array.isArray(item.collaborators) && item.collaborators.length > 0 && <div className="agent-step__collaboration">em colaboração com {item.collaborators.join(' · ')}</div>}
                <h4>{item.title}</h4>
                {item.detail && <p>{item.detail}</p>}
                {Array.isArray(item.metrics) && item.metrics.length > 0 && <div className="agent-step__metrics">{item.metrics.map(metric => <span key={`${metric.label}-${metric.value}`}><b>{metric.value}</b> {metric.label}</span>)}</div>}
                {item.status === 'working' && Number(item.elapsedSeconds) > 0 && <small className="agent-step__elapsed">analisando há {durationLabel(item.elapsedSeconds * 1000)}</small>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
