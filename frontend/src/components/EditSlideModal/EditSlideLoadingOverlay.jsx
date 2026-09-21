import React from 'react';

export default function EditSlideLoadingOverlay({ saving, loadingAction, slideDisplayNum, filename }) {
  if (!saving) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        style={{
          background: '#09090b',
          border: '1px solid var(--gold, #d97706)',
          borderRadius: '12px',
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 25px rgba(217, 119, 6, 0.2)',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center'
        }}
      >
        <div 
          style={{
            width: '44px',
            height: '44px',
            border: '3px solid rgba(217, 119, 6, 0.2)',
            borderTopColor: 'var(--gold, #d97706)',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite'
          }} 
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>
            {loadingAction === 'visualizar' 
              ? 'Abrindo Visualização...' 
              : loadingAction === 'regen' 
                ? 'Recriando Imagem com IA...' 
                : 'Recriando & Renderizando Slide...'}
          </div>
          <div style={{ color: 'var(--text-3, #a1a1aa)', fontSize: '13px' }}>
            {loadingAction === 'visualizar'
              ? <>Preparando o <strong style={{ color: 'var(--gold, #d97706)' }}>Slide {slideDisplayNum}</strong> para visualização. Por favor, aguarde.</>
              : <>Recriando o <strong style={{ color: 'var(--gold, #d97706)' }}>Slide {slideDisplayNum}</strong> ({filename}). Por favor, aguarde.</>}
          </div>
        </div>
      </div>
    </div>
  );
}
