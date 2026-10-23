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
    const generatedItems: FloatingItem[] = Array.from({ length: 22 }).map((_, index) => ({
      id: index,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 95,
      size: Math.floor(Math.random() * 18) + 22,
      duration: Math.floor(Math.random() * 8) + 10,
      delay: Math.random() * 5,
    }));
    setItems(generatedItems);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none">
      {/* Scritta in alto */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
        <h1 className="animate-pulse text-lg md:text-xl font-extrabold tracking-widest text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">
          🎃 HAPPY HALLOWEEN 👻
        </h1>
      </div>

      {/* Zucche e fantasmi fluttuanti che usano la classe di index.css */}
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute bottom-[-50px] animate-halloween-float opacity-80"
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
      <div className="absolute top-1/4 left-[-100px] text-3xl animate-halloween-cross opacity-75">
        🏇💨 👻
      </div>
    </div>
  );
}
