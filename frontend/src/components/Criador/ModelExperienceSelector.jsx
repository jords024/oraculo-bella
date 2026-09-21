import React, { useRef } from 'react';

export const CREATOR_MODELS = [
  { id: 'gpt-5.6-sol', icon: '✦', name: 'Sol', label: 'Máxima qualidade', description: 'Para campanhas decisivas e textos de maior impacto.' },
  { id: 'gpt-5.6-terra', icon: '◉', name: 'Terra', label: 'Equilíbrio', description: 'Alta qualidade com ótimo equilíbrio de tempo e custo.', recommended: true },
  { id: 'gpt-5.6-luna', icon: '◐', name: 'Luna', label: 'Ágil', description: 'Para ideias, testes e produção em maior volume.' }
];

export const REASONING_LEVELS = [
  { id: 'low', label: 'Leve', description: 'Resposta mais rápida' },
  { id: 'medium', label: 'Médio', description: 'Equilíbrio recomendado' },
  { id: 'high', label: 'Forte', description: 'Mais análise e refinamento' }
];

export default function ModelExperienceSelector({ model, effort, onModelChange, onEffortChange, disabled }) {
  const detailsRef = useRef(null);
  const selectedModel = CREATOR_MODELS.find(item => item.id === model) || CREATOR_MODELS[1];
  const selectedEffort = REASONING_LEVELS.find(item => item.id === effort) || REASONING_LEVELS[1];

  return (
    <details className="ai-settings-picker" ref={detailsRef}>
      <summary className="ai-settings-summary" aria-label="Configurar inteligência artificial">
        <span className="ai-settings-symbol" aria-hidden="true">{selectedModel.icon}</span>
        <span>
          <span className="creator-toolbar-label">Inteligência</span>
          <strong>{selectedModel.name} · {selectedEffort.label}</strong>
        </span>
        <span className="visual-direction-chevron" aria-hidden="true">⌄</span>
      </summary>

      <div className="ai-settings-menu">
        <div className="ai-settings-heading">
          <strong>Como o Oráculo deve pensar?</strong>
          <span>Escolha a potência e o nível de aprofundamento.</span>
        </div>

        <fieldset className="ai-model-options" disabled={disabled}>
          <legend>Modelo</legend>
          {CREATOR_MODELS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`ai-model-option${selectedModel.id === item.id ? ' is-active' : ''}`}
              onClick={() => onModelChange(item.id)}
              aria-pressed={selectedModel.id === item.id}
            >
              <span className="ai-model-option-icon">{item.icon}</span>
              <span><strong>{item.name}</strong><small>{item.label}</small></span>
              {item.recommended && <em>Recomendado</em>}
            </button>
          ))}
        </fieldset>

        <fieldset className="ai-depth-options" disabled={disabled}>
          <legend>Profundidade</legend>
          <div>
            {REASONING_LEVELS.map(item => (
              <button
                key={item.id}
                type="button"
                className={selectedEffort.id === item.id ? 'is-active' : ''}
                onClick={() => onEffortChange(item.id)}
                aria-pressed={selectedEffort.id === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
          <small>{selectedEffort.description}</small>
        </fieldset>
      </div>
    </details>
  );
}
