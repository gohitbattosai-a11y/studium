import React, { useEffect, useRef } from 'react';

export function HalloweenBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Lista di elementi Halloween
    const emojis = ['🎃', '👻', '🦇', '💀', '🕷️', '🎃', '👻'];

    interface Particle {
      x: number;
      y: number;
      emoji: string;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
    }

    // Creiamo 30 elementi fluttuanti
    const particles: Particle[] = Array.from({ length: 30 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: Math.floor(Math.random() * 16) + 22, // da 22px a 38px
      speedY: Math.random() * 1.2 + 0.5, // Velocità risalita
      speedX: Math.sin(Math.random() * Math.PI) * 0.5,
      opacity: Math.random() * 0.6 + 0.3,
    }));

    // Cavaliere / Fantasma volante
    let riderX = -100;
    let riderY = window.innerHeight * 0.25;

    // Loop di animazione
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Scritta in alto "HAPPY HALLOWEEN"
      ctx.save();
      ctx.font = '900 24px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = 'rgba(249, 115, 22, 0.9)';
      ctx.shadowBlur = 12;
      ctx.fillText('🎃 HAPPY HALLOWEEN 👻', canvas.width / 2, 35);
      ctx.restore();

      // 2. Disegna e muovi Zucche, Fantasmi e Pipistrelli
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.emoji, p.x, p.y);
        ctx.restore();

        // Movimento verso l'alto
        p.y -= p.speedY;
        p.x += Math.sin(p.y * 0.02) * 0.5;

        // Reset se esce dallo schermo
        if (p.y < -40) {
          p.y = canvas.height + 40;
          p.x = Math.random() * canvas.width;
        }
      });

      // 3. Disegna il Cavaliere Fantasma che attraversa lo schermo
      ctx.save();
      ctx.font = '36px serif';
      ctx.fillText('🏇💨👻', riderX, riderY);
      ctx.restore();

      riderX += 2.5;
      riderY += Math.sin(riderX * 0.01) * 0.5;
      if (riderX > canvas.width + 120) {
        riderX = -120;
        riderY = Math.random() * (canvas.height * 0.5) + 100;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none', // Permette i clic sui bottoni e tab sotto!
        zIndex: 999999, // Forza la visibilità SOPRA ogni card e sidebar
      }}
    />
  );
}
