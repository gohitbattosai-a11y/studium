import React, { useEffect, useState } from 'react';

interface FloatingItem {
  id: number;
  emoji: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

export const HalloweenBackground: React.FC = () => {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    // Genera elementi animati casuali (zucche, fantasmi, pipistrelli, cavaliere/teschio)
    const emojis = ['🎃', '👻', '🦇', '💀', '🕷️', '🎃', '👻'];
    const generatedItems: FloatingItem[] = Array.from({ length: 25 }).map((_, index) => ({
      id: index,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100, // Posizione orizzontale %
      size: Math.random() * 25 + 20, // Dimensione in px
      duration: Math.random() * 10 + 10, // Durata animazione (10s - 20s)
      delay: Math.random() * 10, // Ritardo iniziale
    }));

    setItems(generatedItems);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {/* Scritta Animata di Halloween in alto */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <h1 className="animate-pulse text-2xl md:text-4xl font-extrabold tracking-widest text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">
          🎃 HAPPY HALLOWEEN 👻
        </h1>
      </div>

      {/* Particelle / Elementi fluttuanti dal basso verso l'alto */}
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute bottom-[-50px] animate-halloween-float opacity-80 hover:opacity-100 transition-opacity"
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

      {/* Fantasma o Cavaliere Fantasma che attraversa lo schermo da sinistra a destra */}
      <div className="absolute top-1/3 left-[-100px] text-5xl animate-halloween-cross opacity-70">
        🏇💨 👻
      </div>
    </div>
  );
};
