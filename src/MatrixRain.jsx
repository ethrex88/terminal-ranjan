import React, { useEffect, useRef } from 'react';

export default function MatrixRain() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const configRef = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const fontSize = Math.max(14, Math.floor(canvas.width / 80));
      const columns = Math.floor(canvas.width / fontSize) + 1;
      const drops = new Array(columns).fill(0);
      configRef.current = { fontSize, columns, drops };
    }

    function frame() {
      const { fontSize, drops } = configRef.current;
      // fade the canvas slightly to create trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff66';
      ctx.font = `${fontSize}px Roboto Mono, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = Math.random() > 0.5 ? '1' : '0';
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i]++;
        }
      }

      animationRef.current = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(frame);
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-rain"
      aria-hidden="true"
    />
  );
}
