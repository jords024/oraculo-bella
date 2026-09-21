import React, { useRef } from 'react';
import { TEMPLATES, getTemplate } from './criadorConstants';

export default function CriadorTemplateBar({ selectedTemplate, onSelectTemplate, disabled }) {
  const detailsRef = useRef(null);
  const activeTemplate = getTemplate(selectedTemplate);

  const handleSelect = (templateId) => {
    onSelectTemplate(templateId);
    if (detailsRef.current) detailsRef.current.open = false;
  };

  return (
    <details className="visual-direction-picker" ref={detailsRef}>
      <summary className="visual-direction-summary" aria-label="Escolher direção visual">
        <span className="visual-direction-swatch" style={{ '--template-color': activeTemplate.color }}>{activeTemplate.icon}</span>
        <span className="visual-direction-copy">
          <span className="creator-toolbar-label">Direção visual</span>
          <strong>{activeTemplate.shortName}</strong>
        </span>
        <span className="visual-direction-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div className="visual-direction-menu" role="listbox" aria-label="Templates de arte">
        <div className="visual-direction-menu-heading">
          <strong>Escolha a atmosfera</strong>
          <span>Ela orienta os layouts, as imagens e a composição final.</span>
        </div>
        {TEMPLATES.map(template => {
          const isActive = activeTemplate.id === template.id;
          return (
            <button
              key={template.id}
              type="button"
              className={`visual-direction-option${isActive ? ' is-active' : ''}`}
              onClick={() => handleSelect(template.id)}
              disabled={disabled}
              role="option"
              aria-selected={isActive}
            >
              <span className="visual-direction-option-icon" style={{ '--template-color': template.color }}>{template.icon}</span>
              <span>
                <strong>{template.shortName}</strong>
                <small>{template.desc}</small>
              </span>
              {isActive && <span className="visual-direction-check" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>
    </details>
  );
}
