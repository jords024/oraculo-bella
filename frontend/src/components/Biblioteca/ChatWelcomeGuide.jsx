// frontend/src/components/Biblioteca/ChatWelcomeGuide.jsx — Guia explicativo inicial do Assistente IA
import React from 'react';

const SUGGESTIONS = [
  {
    icon: '🎨',
    label: 'Mudar Estilo / Cor',
    prompt: 'Crie uma variação com iluminação cinematográfica e detalhes dourados'
  },
  {
    icon: '🏙️',
    label: 'Inserir em Cenário',
    prompt: 'Coloque a imagem de referência em um ambiente moderno e luxuoso'
  },
  {
    icon: '✨',
    label: 'Fundo de Carrossel',
    prompt: 'Crie um fundo minimalista escuro e elegante para slide de carrossel'
  }
];

export default function ChatWelcomeGuide({ onSelectPrompt }) {
  return (
    <div className="chat-welcome-guide">
      <div className="welcome-guide-header">
        <div className="welcome-guide-icon">✨</div>
        <h3 className="welcome-guide-title">Assistente de Criação IA</h3>
        <p className="welcome-guide-desc">
          Seu estúdio inteligente para transformar referências, criar variações e gerar novas imagens para seus carrosséis e artes.
        </p>
      </div>

      <div className="welcome-guide-features">
        <div className="welcome-feature-item">
          <span className="feature-item-bullet">🎯</span>
          <div>
            <strong>Use referências da biblioteca:</strong>
            <p>Selecione imagens na galeria ou digite <span className="highlight-tag">@</span> no chat para combiná-las.</p>
          </div>
        </div>

        <div className="welcome-feature-item">
          <span className="feature-item-bullet">🔄</span>
          <div>
            <strong>Crie variações e novos ângulos:</strong>
            <p>Peça para alterar cores, fundos, materiais ou elementos mantendo o mesmo estilo.</p>
          </div>
        </div>

        <div className="welcome-feature-item">
          <span className="feature-item-bullet">💡</span>
          <div>
            <strong>Gere conceitos do zero:</strong>
            <p>Descreva qualquer cena, fundo ou conceito visual livremente.</p>
          </div>
        </div>
      </div>

      <div className="welcome-guide-suggestions">
        <span className="suggestions-label">⚡ Sugestões de comandos para testar:</span>
        <div className="suggestions-grid">
          {SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="suggestion-btn"
              onClick={() => onSelectPrompt && onSelectPrompt(item.prompt)}
              title="Clique para testar este comando"
            >
              <span className="suggestion-btn-icon">{item.icon}</span>
              <span className="suggestion-btn-text">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
