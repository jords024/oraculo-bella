import React from 'react';

export default function PublishModals({
  confirmPublishCarousel,
  setConfirmPublishCarousel,
  isScheduleMode,
  setIsScheduleMode,
  scheduledDateTime,
  setScheduledDateTime,
  executePublish,
  publishResultModal,
  setPublishResultModal,
  copiedError,
  setCopiedError,
  showToast
}) {
  return (
    <>
      {/* Modal de Confirmação de Publicação */}
      {confirmPublishCarousel && (
        <div className="form-modal open" style={{ zIndex: 12000 }}>
          <div 
            className="form-box" 
            style={{ 
              maxWidth: '520px', 
              width: '90%', 
              padding: '24px', 
              background: '#0c0d12', 
              border: '1px solid rgba(201, 168, 76, 0.4)', 
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(201, 168, 76, 0.15)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 className="form-title" style={{ color: 'var(--gold, #c9a84c)', fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✈️ Confirmar Publicação no Instagram
              </h3>
              <button 
                type="button" 
                onClick={() => setConfirmPublishCarousel(null)} 
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '14px', color: '#e4e4e7', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Tem certeza que deseja publicar o carrossel abaixo diretamente na sua conta do Instagram?
            </p>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Carrossel Selecionado</div>
              <div style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '15px' }}>{confirmPublishCarousel.title}</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '6px' }}>
                📷 <strong>{confirmPublishCarousel.slides ? confirmPublishCarousel.slides.length : 0} slides</strong> salvos • ID: <code>{confirmPublishCarousel.id}</code>
              </div>
            </div>

            {/* Opções de Envio: Agora vs Agendado */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    border: !isScheduleMode ? '1px solid var(--gold, #c9a84c)' : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: !isScheduleMode ? 'rgba(201, 168, 76, 0.15)' : 'rgba(255,255,255,0.03)',
                    color: !isScheduleMode ? 'var(--gold, #c9a84c)' : '#a1a1aa'
                  }}
                  onClick={() => setIsScheduleMode(false)}
                >
                  🚀 Publicar Agora
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    border: isScheduleMode ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: isScheduleMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                    color: isScheduleMode ? '#60a5fa' : '#a1a1aa'
                  }}
                  onClick={() => setIsScheduleMode(true)}
                >
                  📅 Agendar Publicação
                </button>
              </div>

              {isScheduleMode && (
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', padding: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#93c5fd', fontWeight: 'bold', marginBottom: '6px' }}>
                    Data e Hora do Disparo (Horário Local):
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#090a0f',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px', lineHeight: '1.4' }}>
                    ℹ️ A Meta exige que postagens agendadas fiquem com no mínimo <strong>15 minutos</strong> de antecedência e no máximo <strong>75 dias</strong> no futuro.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ padding: '8px 20px', fontSize: '13px', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }} 
                onClick={() => setConfirmPublishCarousel(null)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className={isScheduleMode ? "btn btn-outline" : "btn btn-gold"} 
                style={{
                  padding: '8px 22px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  ...(isScheduleMode ? { borderColor: '#3b82f6', color: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.15)' } : {})
                }} 
                onClick={executePublish}
              >
                {isScheduleMode ? '📅 Agendar no Instagram' : '🚀 Confirmar e Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resultado Explicito da Publicacao */}
      {publishResultModal && (
        <div className="form-modal open" style={{ zIndex: 12000 }}>
          <div 
            className="form-box" 
            style={{ 
              maxWidth: '680px', 
              width: '90%', 
              padding: '24px', 
              background: '#0c0d12', 
              border: publishResultModal.success ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)', 
              borderRadius: '16px',
              boxShadow: publishResultModal.success 
                ? '0 20px 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(34, 197, 94, 0.15)'
                : '0 20px 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(244, 63, 94, 0.15)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 className="form-title" style={{ color: publishResultModal.success ? '#22c55e' : '#f43f5e', fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {publishResultModal.success ? '🎉 Publicado com Sucesso!' : '⚠️ Erro na Publicação do Instagram'}
              </h3>
              <button 
                type="button" 
                onClick={() => setPublishResultModal(null)} 
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {publishResultModal.success ? (
              <>
                <p style={{ fontSize: '14px', color: '#e4e4e7', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  O carrossel <strong>{publishResultModal.title}</strong> foi transmitido e publicado com sucesso no Instagram!
                </p>
                {publishResultModal.postId && (
                  <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#4ade80' }}>
                    ✅ <strong>ID da Mídia Gerada no Instagram:</strong> <code>{publishResultModal.postId}</code>
                  </div>
                )}
              </>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                  A tentativa de publicação do carrossel <strong>{publishResultModal.title}</strong> encontrou uma falha na comunicação com os servidores da Meta:
                </p>
                <pre 
                  className="custom-pipeline-scroll" 
                  style={{ 
                    margin: '0 0 20px 0', 
                    padding: '16px', 
                    fontSize: '12px', 
                    lineHeight: '1.6', 
                    fontFamily: 'Consolas, Monaco, monospace', 
                    whiteSpace: 'pre-wrap', 
                    color: '#f87171', 
                    backgroundColor: '#090a0f', 
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    borderRadius: '8px', 
                    maxHeight: '280px', 
                    overflowY: 'auto', 
                    userSelect: 'text'
                  }}
                >
                  {publishResultModal.error || publishResultModal.log}
                </pre>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              {!publishResultModal.success && (
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ 
                    padding: '8px 18px', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    borderColor: copiedError ? '#22c55e' : 'var(--gold, #c9a84c)', 
                    color: copiedError ? '#22c55e' : 'var(--gold, #c9a84c)',
                    backgroundColor: copiedError ? 'rgba(34, 197, 94, 0.1)' : 'rgba(201, 168, 76, 0.1)'
                  }} 
                  onClick={() => {
                    navigator.clipboard.writeText(publishResultModal.error || publishResultModal.log);
                    setCopiedError(true);
                    showToast('✓ Erro completo copiado para a área de transferência!', 'success');
                    setTimeout(() => setCopiedError(false), 3000);
                  }}
                >
                  {copiedError ? '✓ Copiado!' : '📋 Copiar Erro Completo'}
                </button>
              )}
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ padding: '8px 20px', fontSize: '13px', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }} 
                onClick={() => setPublishResultModal(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
