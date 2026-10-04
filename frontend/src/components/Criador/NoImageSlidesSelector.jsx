import React from 'react';

export default function NoImageSlidesSelector({ value, total, onChange, disabled }) {
  const withImage = Math.max(0, total - value);
  const set = next => onChange(Math.max(0, Math.min(total, next)));

  return (
    <fieldset className="slide-count-selector no-image-selector" disabled={disabled}>
      <legend>Sem imagem</legend>
      <div className="slide-count-options" aria-label="Quantidade de lâminas só com fundo de cor">
        <button type="button" onClick={() => set(value - 1)} disabled={value <= 0} aria-label="Menos lâminas sem imagem">−</button>
        <button type="button" className={value > 0 ? 'is-active' : ''} aria-live="polite" title="Lâminas só com fundo de cor e tipografia (economiza geração de imagem)" style={{ minWidth: 30, cursor: 'default' }}>
          {value}
        </button>
        <button type="button" onClick={() => set(value + 1)} disabled={value >= total} aria-label="Mais lâminas sem imagem">+</button>
      </div>
      <small>{value === 0 ? 'Automático (padrão do estilo)' : `${withImage} com imagem · ${value} só cor`}</small>
    </fieldset>
  );
}
