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
    const generatedItems: FloatingItem[] = Array.from({ length: 20 }).map((_, index) => ({
      id: index,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100,
      size: Math.random() * 20 + 20,
      duration: Math.random() * 10 + 12,
      delay: Math.random() * 10,
    }));
    setItems(generatedItems);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {/* Scritta Animata in alto */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
        <h1 className="animate-pulse text-xl md:text-2xl font-extrabold tracking-widest text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">
          🎃 HAPPY HALLOWEEN 👻
        </h1>
      </div>

      {/* Zucche e fantasmi che salgono dal basso */}
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute bottom-[-50px] animate-halloween-float opacity-75"
          style={{
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Cavaliere / Fantasma che attraversa lo schermo in mezzo */}
      <div className="absolute top-1/4 left-[-100px] text-4xl animate-halloween-cross opacity-70">
        🏇💨 👻
      </div>
    </div>
  );
}

// App principale
export default function App() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Sfondo di Halloween sempre attivo sopra i tab */}
      <HalloweenBackground />

      {/* Router e pagine */}
      <Routes>
        <Route path="*" element={<Studium />} />
      </Routes>
    </div>
  );
}
