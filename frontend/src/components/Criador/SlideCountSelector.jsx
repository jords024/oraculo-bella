import React from 'react';

const SLIDE_OPTIONS = [3, 5, 7, 10];

export default function SlideCountSelector({ value, onChange, disabled }) {
  return (
    <fieldset className="slide-count-selector" disabled={disabled}>
      <legend>Lâminas</legend>
      <div className="slide-count-options" aria-label="Quantidade de lâminas do carrossel">
        {SLIDE_OPTIONS.map(count => (
          <button
            key={count}
            type="button"
            className={value === count ? 'is-active' : ''}
            onClick={() => onChange(count)}
            aria-pressed={value === count}
            title={`${count} lâminas${count === 5 ? ' — equilíbrio entre profundidade e custo' : ''}`}
          >
            {count}
          </button>
        ))}
      </div>
      <small>{value === 3 ? 'Essencial' : value === 5 ? 'Equilíbrio' : value === 7 ? 'Aprofundado' : 'Narrativa completa'}</small>
    </fieldset>
  );
}
