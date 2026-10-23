import React, { useEffect, useState } from 'react';

interface FloatingItem {
  id: number;
  emoji: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

export function HalloweenBackground() {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    const emojis = ['🎃', '👻', '🦇', '💀', '🕷️', '🎃', '👻'];
    const generatedItems: FloatingItem[] = Array.from({ length: 25 }).map((_, index) => ({
      id: index,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 95,
      size: Math.floor(Math.random() * 20) + 24,
      duration: Math.floor(Math.random() * 8) + 8,
      delay: Math.random() * 5,
    }));
    setItems(generatedItems);
  }, []);

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.9;
          }
          85% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-10vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes crossScreen {
          0% {
            transform: translateX(-10vw) translateY(0);
          }
          50% {
            transform: translateX(55vw) translateY(-30px);
          }
          100% {
            transform: translateX(110vw) translateY(0);
          }
        }

        @keyframes titlePulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.7; transform: translateX(-50%) scale(1.05); }
        }

        .halloween-item {
          position: fixed;
          bottom: 0;
          pointer-events: none;
          z-index: 999999;
          animation-name: floatUp;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }

        .halloween-rider {
          position: fixed;
          top: 25%;
          left: 0;
          pointer-events: none;
          z-index: 999999;
          font-size: 3rem;
          animation: crossScreen 14s linear infinite;
        }

        .halloween-title {
          position: fixed;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 999999;
          color: #f97316;
          font-weight: 900;
          font-size: 1.4rem;
          letter-spacing: 0.15em;
          text-shadow: 0 0 14px rgba(249, 115, 22, 0.9);
          animation: titlePulse 2.5s ease-in-out infinite;
          white-space: nowrap;
        }
      `}</style>

      {/* Scritta in alto al centro */}
      <div className="halloween-title">
        🎃 HAPPY HALLOWEEN 👻
      </div>

      {/* Zucche e fantasmi fluttuanti */}
      {items.map((item) => (
        <div
          key={item.id}
          className="halloween-item"
          style={{
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Cavaliere Fantasma che vola sullo schermo */}
      <div className="halloween-rider">
        🏇💨 👻
      </div>
    </>
  );
}
