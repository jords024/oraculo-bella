import React from 'react';

export default function RetryConfirmationModal({
  retryTargetId,
  setRetryTargetId,
  confirmRetry
}) {
  if (!retryTargetId) return null;

  return (
    <div className="form-modal open" role="dialog" aria-modal="true">
      <div className="form-box">
        <h3 className="form-title" style={{ color: '#22c55e', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔄</span> Confirmar Recriação
        </h3>
        <p style={{ margin: '14px 0 24px', color: '#e4e4e7', fontSize: '14px', lineHeight: '1.5' }}>
          Você tem certeza que deseja recriar as artes e imagens deste carrossel? Uma nova tarefa de geração será enviada para a fila de produção.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setRetryTargetId(null)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ backgroundColor: '#22c55e', color: '#090a0f', fontWeight: '600', border: 'none' }}
            onClick={() => {
              const id = retryTargetId;
              setRetryTargetId(null);
              confirmRetry(id);
            }}
          >
            Confirmar Recriação
          </button>
        </div>
      </div>
    </div>
  );
}
