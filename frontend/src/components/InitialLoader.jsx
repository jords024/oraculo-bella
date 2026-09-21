// frontend/src/components/InitialLoader.jsx — Tela de carregamento inicial
import React from 'react';

export default function InitialLoader({ loading, branding }) {
  const formatSize = (val) => {
    if (!val) return '';
    const clean = val.trim();
    if (/^\d+$/.test(clean)) return `${clean}px`;
    return clean;
  };

  return (
    <>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#09090b',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.5s ease',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(201, 168, 76, 0.15)',
            borderTopColor: '#C9A84C',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '20px'
          }} />
          <div style={{
            fontSize: '11px',
            color: 'rgba(237, 232, 223, 0.4)',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif'
          }}>
            Carregando Estúdio...
          </div>
        </div>
      )}
      <style>{`
        .brand-name {
          font-size: ${formatSize(branding?.logoSize)} !important;
          color: ${branding?.logoColor} !important;
        }
        .carousel-card-title, .carousel-title, .slide-text, .lb-editor-textarea, .meta-textarea, .slide-preview-text {
          font-size: ${formatSize(branding?.carouselTextSize)} !important;
          color: ${branding?.carouselTextColor} !important;
        }
      `}</style>
    </>
  );
}
