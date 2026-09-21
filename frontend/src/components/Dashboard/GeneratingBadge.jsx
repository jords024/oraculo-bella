import React, { useState, useEffect } from 'react';

export default function GeneratingBadge({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const getStartMs = (val) => {
      if (!val) return Date.now();
      if (typeof val === 'number') return val;
      const parsed = new Date(val).getTime();
      return isNaN(parsed) ? Date.now() : parsed;
    };

    const start = getStartMs(startedAt);
    setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    const interval = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const formatted = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return (
    <span className="badge badge-generating" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.4)', fontWeight: 'bold' }}>
      ⏳ gerando... ({formatted})
    </span>
  );
}
