import { useState, useEffect } from 'react';

export function useGlobalSSE({ loadCarousels, loadStats }) {
  const [liveSession, setLiveSession] = useState(null);

  const setupSSE = () => {
    const token = localStorage.getItem('fo_token');
    const url = token ? `/api/events?token=${encodeURIComponent(token)}` : '/api/events';
    const eventSource = new EventSource(url);

    let stuckTimer = null;
    const resetStuckTimer = () => {
      if (stuckTimer) clearTimeout(stuckTimer);
      stuckTimer = setTimeout(() => {
        setLiveSession(prev => prev ? { ...prev, visible: false } : null);
      }, 60000);
    };

    eventSource.onmessage = function(event) {
      try {
        const obj = JSON.parse(event.data);
        if (obj.type === 'start') {
          setLiveSession({
            carouselId: obj.carouselId,
            total: obj.total,
            slides: [],
            visible: true,
            expanded: false
          });
          loadCarousels?.();
          resetStuckTimer();
        } else if (obj.type === 'slide') {
          resetStuckTimer();
          loadCarousels?.();
          loadStats?.();
          setLiveSession(prev => {
            if (!prev) return prev;
            const slides = [...prev.slides];
            const idx = slides.findIndex(s => s.num === obj.num);
            const slideData = {
              num: obj.num,
              estado: obj.estado,
              filename: obj.filename,
              title_text: obj.title_text,
              status: obj.status === 'ok' ? 'ok' : obj.status === 'erro' ? 'error' : 'loading',
              timestamp: Date.now()
            };
            if (idx >= 0) slides[idx] = slideData;
            else slides.push(slideData);
            return { ...prev, slides };
          });
        } else if (obj.type === 'done' || obj.type === 'registered') {
          if (stuckTimer) clearTimeout(stuckTimer);
          loadCarousels?.();
          loadStats?.();
          setTimeout(() => {
            setLiveSession(prev => prev ? { ...prev, visible: false } : null);
          }, 3000);
        }
      } catch (e) {}
    };

    return () => {
      eventSource.close();
      if (stuckTimer) clearTimeout(stuckTimer);
    };
  };

  return {
    liveSession,
    setLiveSession,
    setupSSE
  };
}
