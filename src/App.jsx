import React, { useEffect, useRef, useState } from 'react';
import Terminal from './Terminal';
import Card3D from './Card3D';
import MatrixRain from './MatrixRain';

export default function App() {
  const commands = ['help','about','projects','skills','experience','education','certifications','contact','social','resume','clear'];
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('leftWidthPx') : null;
    return saved ? parseInt(saved, 10) : 520; // default left panel width in px
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [visitCount, setVisitCount] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('leftWidthPx', String(leftWidth));
    }
  }, [leftWidth]);

  // Visitor counter (uses a free public counter service with CORS)
  useEffect(() => {
    let isMounted = true;
    async function incrementAndFetch() {
      try {
        const res = await fetch('https://api.countapi.xyz/hit/terminal-ranjan/portfolio');
        const data = await res.json();
        if (isMounted && typeof data?.value === 'number') setVisitCount(data.value);
      } catch (e) {
        // Fallback to local approximate counter if network fails
        try {
          const key = 'local_visit_count';
          const current = parseInt(window.localStorage.getItem(key) || '0', 10) + 1;
          window.localStorage.setItem(key, String(current));
          if (isMounted) setVisitCount(current);
        } catch {}
      }
    }
    incrementAndFetch();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    function onMove(e) {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const pointerX = e.touches ? e.touches[0].clientX : e.clientX;
      const newWidth = Math.min(
        Math.max(pointerX - containerRect.left, 240), // min 240px
        Math.max(320, containerRect.width - 320) // leave at least 320px for right
      );
      setLeftWidth(newWidth);
      e.preventDefault();
    }
    function onUp() { setIsDragging(false); }
    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging]);

  return (
    <div className="app">
      <MatrixRain />
              <header className="header">
          <div className="title">
            <div className="name">Ranjan Kumar</div>
            <div className="subtitle">Software Engineer</div>
          </div>
        </header>

      <div className="content" ref={containerRef} style={{ gridTemplateColumns: `${Math.max(leftWidth, 240)}px 8px 1fr` }}>
        <aside className="left">
          <Card3D />
          <div className="card-foot">[Interactive 3D Card]</div>
        </aside>
        {/* vertical resizer */}
        <div
          className={`resize-handle ${isDragging ? 'dragging' : ''}`}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize left and right panels"
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
        />
        <main className="right">
          <nav className="topnav" aria-label="commands">
            {commands.map(c => (
              <button key={c} className="nav-link" onClick={() => {
                // trigger a custom event so Terminal can pick it up
                window.dispatchEvent(new CustomEvent('run-command', { detail: c }));
              }}>{c}</button>
            ))}
          </nav>

          <div className="terminal-wrap">
            <Terminal />
          </div>
        </main>
      </div>

              <footer className="statusbar">
          <div className="status-left">ranjan@portfolio:~$</div>
        <div className="status-right">
          <span>{new Date().toLocaleString()}</span>
          <span className="visitors" title="Total visitors">
            👁 {visitCount !== null ? visitCount.toLocaleString() : '—'}
          </span>
        </div>
        </footer>
    </div>
  );
}
