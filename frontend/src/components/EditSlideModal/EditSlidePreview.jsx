import React from 'react';
import { parseFontSize, getDefaultPositions } from './editSlideConstants';

export default function EditSlidePreview({
  previewRef,
  carouselId,
  filename,
  previewImgUrl,
  handleImageError,
  activeTab,
  slideMeta,
  defaultSizes,
  handleDragStart,
  draggingElement
}) {
  const { defaultTitleY, defaultBodyY } = getDefaultPositions(slideMeta.layout);
  const scale = 336 / 1080;

  const tY = slideMeta.title_y !== '' && slideMeta.title_y !== undefined && slideMeta.title_y !== null 
    ? Number(slideMeta.title_y) 
    : defaultTitleY;

  const bY = slideMeta.body_y !== '' && slideMeta.body_y !== undefined && slideMeta.body_y !== null 
    ? Number(slideMeta.body_y) 
    : defaultBodyY;

  const titleSize = parseFontSize(slideMeta.title_px, defaultSizes.title);
  const bodySize = parseFontSize(slideMeta.body_px, defaultSizes.body);

  // Watermark Position Simulator
  let wmX = 84;
  let wmY = 48;
  if (slideMeta.watermark_pos === 'top_right') {
    wmX = 1080 - 84 - 180;
    wmY = 48;
  } else if (slideMeta.watermark_pos === 'bottom_left') {
    wmX = 84;
    wmY = 1350 - 80;
  } else if (slideMeta.watermark_pos === 'bottom_right') {
    wmX = 1080 - 84 - 180;
    wmY = 1350 - 80;
  }

  if (slideMeta.watermark_pos === 'custom') {
    wmX = slideMeta.watermark_x !== '' && slideMeta.watermark_x !== null ? Number(slideMeta.watermark_x) : 84;
    wmY = slideMeta.watermark_y !== '' && slideMeta.watermark_y !== null ? Number(slideMeta.watermark_y) : 48;
  }

  const showWatermark = slideMeta.watermark_pos !== 'hidden';
  const isLeftAligned = slideMeta.layout === 'dramatico' || slideMeta.layout === 'etereo' || slideMeta.layout === 'text_only';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#09090b', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px', position: 'relative', minHeight: '450px' }}>
      <div style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '11px', fontWeight: 'bold', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', zIndex: 10 }}>
        👁️ RENDERIZAÇÃO REAL-TIME
      </div>
      
      {carouselId && filename ? (
        <div ref={previewRef} style={{ position: 'relative', width: '336px', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '4px', border: '1px solid #27272a', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <img 
            src={previewImgUrl} 
            onError={handleImageError}
            alt="Preview" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          
          {/* Overlay de gradiente */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, transparent 40%, rgba(26, 14, 4, 0.65) 75%, rgba(14, 7, 2, 0.92) 100%)',
            pointerEvents: 'none',
            zIndex: 1
          }} />
          
          {/* Simulador de Posicionamento de Texto (Overlay) */}
          {activeTab === 'text' && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {/* Guia do Título */}
              <div 
                onMouseDown={e => handleDragStart(e, 'title')}
                style={{
                  position: 'absolute',
                  top: `${tY * scale}px`,
                  left: `${84 * scale}px`,
                  width: `${(1080 - 168) * scale}px`,
                  height: 'auto',
                  minHeight: '24px',
                  border: '1.5px dashed #f97316',
                  backgroundColor: 'rgba(249, 115, 22, 0.15)',
                  color: '#fff',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: `${titleSize * scale}px`,
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isLeftAligned ? 'flex-start' : 'center',
                  justifyContent: 'center',
                  textAlign: isLeftAligned ? 'left' : 'center',
                  borderRadius: '4px',
                  zIndex: 2,
                  pointerEvents: 'auto',
                  cursor: draggingElement === 'title' ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                  whiteSpace: 'pre-wrap'
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '4px',
                  background: '#f97316',
                  color: '#fff',
                  fontSize: '8px',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  textShadow: 'none',
                  lineHeight: '1'
                }}>
                  TÍTULO (Y: {tY})
                </span>
                {slideMeta.title || 'Título do Slide'}
              </div>
              
              {/* Guia do Corpo */}
              <div 
                onMouseDown={e => handleDragStart(e, 'body')}
                style={{
                  position: 'absolute',
                  top: `${bY * scale}px`,
                  left: `${84 * scale}px`,
                  width: `${(1080 - 168) * scale}px`,
                  height: 'auto',
                  minHeight: '36px',
                  border: '1.5px dashed #06b6d4',
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  color: '#fff',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: `${bodySize * scale}px`,
                  fontWeight: 'normal',
                  padding: '4px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isLeftAligned ? 'flex-start' : 'center',
                  justifyContent: 'center',
                  textAlign: isLeftAligned ? 'left' : 'center',
                  borderRadius: '4px',
                  zIndex: 2,
                  pointerEvents: 'auto',
                  cursor: draggingElement === 'body' ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                  whiteSpace: 'pre-wrap'
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '4px',
                  background: '#06b6d4',
                  color: '#fff',
                  fontSize: '8px',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  textShadow: 'none',
                  lineHeight: '1'
                }}>
                  CORPO (Y: {bY})
                </span>
                {slideMeta.body || 'Corpo do Slide'}
              </div>
              
              {/* Guia do Watermark */}
              {showWatermark && (
                <div 
                  style={{
                    position: 'absolute',
                    top: `${wmY * scale}px`,
                    left: `${wmX * scale}px`,
                    width: `${180 * scale}px`,
                    height: `${38 * scale}px`,
                    border: '1.5px dashed #eab308',
                    backgroundColor: 'rgba(234, 179, 8, 0.15)',
                    color: '#fff',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    fontSize: '8px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    zIndex: 2,
                    userSelect: 'none'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '4px',
                    background: '#eab308',
                    color: '#000',
                    fontSize: '7px',
                    padding: '1px 4px',
                    borderRadius: '2px',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    textShadow: 'none',
                    lineHeight: '1'
                  }}>
                    LOGOMARCA
                  </span>
                  {slideMeta.watermark_text || '@HAUCACAU'}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: 'var(--text-3)' }}>Carregando imagem...</div>
      )}
    </div>
  );
}
