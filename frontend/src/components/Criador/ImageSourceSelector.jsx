import React from 'react';

const OPTIONS = [
  { id: 'ia', label: 'IA', title: 'Gera cada foto com gpt-image (custa por imagem)' },
  { id: 'pinterest', label: 'Pinterest', title: 'Curadoria automática de imagens do Pinterest (busca, ranking e escolha por lâmina)' },
];

export default function ImageSourceSelector({ value, onChange, disabled }) {
  return (
    <fieldset className="slide-count-selector image-source-selector" disabled={disabled}>
      <legend>Imagens</legend>
      <div className="slide-count-options" aria-label="Origem das imagens do carrossel">
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
      <small>{value === 'pinterest' ? 'Curadoria (teste)' : 'Gerada por IA'}</small>
    </fieldset>
  );
}
