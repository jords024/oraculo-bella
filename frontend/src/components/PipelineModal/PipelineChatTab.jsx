import React from 'react';

export default function PipelineChatTab({ chatHistory }) {
  if (!chatHistory || chatHistory.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', padding: '20px' }}>
        Nenhum histórico de chat gravado para este carrossel.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {chatHistory.map((msg, idx) => (
        <div
          key={idx}
          style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '90%',
            backgroundColor: msg.role === 'user' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            border: msg.role === 'user' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '12px 16px'
          }}
        >
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            color: msg.role === 'user' ? '#a78bfa' : '#06b6d4',
            display: 'block',
            marginBottom: '4px'
          }}>
            {msg.role === 'user' ? '👤 Usuário / Criador' : `🤖 Oráculo (${msg.model || 'IA'})`}
          </span>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap', color: '#e4e4e7' }}>
            {msg.content}
          </p>
        </div>
      ))}
    </div>
  );
}
