import React, { useState, useEffect } from 'react';

export default function LiveGenPanel({ liveSession, setLiveSession, onOpenLightbox }) {
  if (!liveSession || !liveSession.visible) return null;

  const pct = Math.round((liveSession.slides.filter(s => s.status === 'ok' || s.status === 'error').length / (liveSession.total || 1)) * 100);

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!liveSession || !liveSession.visible || pct >= 100) return;
    const start = liveSession.startedAt || Date.now();
    setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
      setElapsed(diff);
    }, 1000);
    return () => clearInterval(timer);
  }, [liveSession?.visible, liveSession?.startedAt, pct]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div id="live-gen-panel" className={`live-panel ${liveSession.expanded ? 'expanded' : ''} visible`}>
      <div className="live-gen-header">
        <span id="live-gen-title">
          {pct >= 100 
            ? `✓ Concluído (${liveSession.duration || formatTimer(elapsed)})` 
            : `⏱️ ${formatTimer(elapsed)} | Gerando carrossel...`}
        </span>
        <span className="live-gen-pct">{pct}%</span>
        <button
          className="live-gen-expand"
          onClick={() => setLiveSession(prev => ({ ...prev, expanded: !prev.expanded }))}
        >
          {liveSession.expanded ? '⤡' : '⤢'}
        </button>
        <button
          className="live-gen-close"
          onClick={() => setLiveSession(prev => ({ ...prev, visible: false }))}
        >
          ✕
        </button>
      </div>
      <div className="live-gen-progress">
        <div id="live-gen-bar" style={{ width: `${pct}%` }}></div>
      </div>
      <div id="live-gen-grid">
        {Array.from({ length: liveSession.total }).map((_, idx) => {
          const slideNum = idx + 1;
          const slide = liveSession.slides.find(s => s.num === slideNum);
          
          let className = 'live-slot pending';
          let content = (
            <>
              <div className="live-slot-num">{String(slideNum).padStart(2, '0')}</div>
              <div className="live-slot-pulse"></div>
            </>
          );

          if (slide) {
            if (slide.status === 'loading') {
              className = 'live-slot loading';
              content = (
                <>
                  <div className="live-slot-pulse" style={{ display: 'block' }}></div>
                </>
              );
            } else if (slide.status === 'ok') {
              className = 'live-slot done';
              content = (
                <>
                  <img
                    src={`/api/carousels/${liveSession.carouselId}/image/${slide.filename}?t=${slide.timestamp}`}
                    alt={slide.title_text || `Slide ${slideNum}`}
                    onClick={() => {
                      if (liveSession.expanded) {
                        onOpenLightbox(liveSession.carouselId, liveSession.slides.map(s => s.filename), idx);
                      }
                    }}
                  />
                  <div className="live-slot-cap">{slide.title_text}</div>
                </>
              );
            } else if (slide.status === 'error') {
              className = 'live-slot error';
              content = <div className="live-slot-num" style={{ color: 'var(--red)' }}>Err</div>;
            }
          }

          return (
            <div className={className} id={`live-slot-${slideNum}`} key={slideNum}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
