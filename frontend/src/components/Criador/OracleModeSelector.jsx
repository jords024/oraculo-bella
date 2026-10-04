import React from 'react';

const OPTIONS = [
  { id: 'atual', label: 'Atual', title: 'Oráculo completo de hoje (várias etapas e regras)' },
  { id: 'simples', label: 'Simples', title: 'Versão de teste: só o prompt-mestre simples, em uma chamada por etapa' },
];

export default function OracleModeSelector({ value, onChange, disabled }) {
  return (
    <fieldset className="slide-count-selector oracle-mode-selector" disabled={disabled}>
      <legend>Oráculo</legend>
      <div className="slide-count-options" aria-label="Versão do Oráculo">
        {OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            className={value === option.id ? 'is-active' : ''}
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
            title={option.title}
            style={{ minWidth: 54 }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <small>{value === 'simples' ? 'Teste simples' : 'Completo'}</small>
    </fieldset>
  );
}
