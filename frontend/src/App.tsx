import { Routes, Route } from "react-router-dom";
import Studium from "@/pages/Studium";
import React, { useEffect, useState } from 'react';

interface FloatingItem {
  id: number;
  emoji: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

// Componente Sfondo Animato Halloween
function HalloweenBackground() {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    const emojis = ['🎃', '👻', '🦇', '💀', '🕷️', '🎃', '👻'];
    const generatedItems: FloatingItem[] = Array.from({ length: 25 }).map((_, index) => ({
      id: index,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 95, // Posizione orizzontale %
      size: Math.floor(Math.random() * 20) + 24, // Dimensione emoji
      duration: Math.floor(Math.random() * 8) + 8, // Durata in secondi
      delay: Math.random() * 5, // Ritardo iniziale
    }));
    setItems(generatedItems);
  }, []);

  return (
    <>
      {/* Iniezione Stili CSS per l'animazione */}
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

        .halloween-item {
          position: fixed;
          bottom: 0;
          pointer-events: none;
          z-index: 99999;
          animation-name: floatUp;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }

        .halloween-rider {
          position: fixed;
          top: 30%;
          left: 0;
          pointer-events: none;
          z-index: 99999;
          font-size: 2.5rem;
          animation: crossScreen 14s linear infinite;
        }

        .halloween-title {
          position: fixed;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 99999;
          color: #f97316;
          font-weight: 900;
          font-size: 1.25rem;
          letter-spacing: 0.1em;
          text-shadow: 0 0 12px rgba(249, 115, 22, 0.9);
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>

      {/* Scritta in alto */}
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

      {/* Cavaliere / Fantasma che vola da sinistra a destra */}
      <div className="halloween-rider">
        🏇💨 👻
      </div>
    </>
  );
}

// App principale
export default function App() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Sfondo di Halloween integrato */}
      <HalloweenBackground />

      {/* Pagine e Router */}
      <Routes>
        <Route path="*" element={<Studium />} />
      </Routes>
    </div>
  );
}
