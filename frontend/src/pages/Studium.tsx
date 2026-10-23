import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Me } from "@/lib/types";
import AuthScreen from "@/components/auth/AuthScreen";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { BrandMark } from "@/components/common";

interface Particle {
  id: number;
  emoji: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

// Overlay di Halloween con elementi DOM nativi (garantiti al 100%)
function HalloweenDOMOverlay() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const emojis = ["🎃", "👻", "🦇", "💀", "🕷️", "🎃", "👻"];
    const items: Particle[] = Array.from({ length: 25 }).map((_, index) => ({
      id: index,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 96, // Posizione orizzontale casuale %
      size: Math.floor(Math.random() * 18) + 24, // Dimensione in px
      duration: Math.floor(Math.random() * 8) + 8, // Durata in secondi (8s - 16s)
      delay: Math.random() * 5, // Ritardo iniziale
    }));
    setParticles(items);
  }, []);

  return (
    <>
      <style>{`
        @keyframes floatUpDOM {
          0% {
            transform: translateY(105vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-10vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes crossScreenDOM {
          0% {
            transform: translateX(-10vw);
          }
          50% {
            transform: translateX(50vw) translateY(-25px);
          }
          100% {
            transform: translateX(110vw);
          }
        }

        @keyframes pulseTitle {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.7; transform: translateX(-50%) scale(1.04); }
        }

        .hw-particle {
          position: fixed;
          bottom: 0;
          pointer-events: none;
          z-index: 999999;
          animation-name: floatUpDOM;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          user-select: none;
        }

        .hw-rider {
          position: fixed;
          top: 22%;
          left: 0;
          font-size: 2.8rem;
          pointer-events: none;
          z-index: 999999;
          animation: crossScreenDOM 14s linear infinite;
          user-select: none;
        }

        .hw-title {
          position: fixed;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          font-weight: 900;
          font-size: 1.3rem;
          letter-spacing: 0.15em;
          color: #f97316;
          text-shadow: 0 0 12px rgba(249, 115, 22, 0.9);
          pointer-events: none;
          z-index: 999999;
          animation: pulseTitle 2.5s ease-in-out infinite;
          white-space: nowrap;
          user-select: none;
        }
      `}</style>

      {/* Scritta in alto */}
      <div className="hw-title">
        🎃 HAPPY HALLOWEEN 👻
      </div>

      {/* Zucche e fantasmi fluttuanti */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="hw-particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Cavaliere / Fantasma volante */}
      <div className="hw-rider">
        🏇💨 👻
      </div>
    </>
  );
}

export default function Studium() {
  const [, setEpoch] = useState(0);
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<Me>("/auth/me"), retry: false, staleTime: 60_000 });

  let body;
  if (me.isPending) {
    body = (
      <div className="flex min-h-dvh items-center justify-center" data-testid="app-loading">
        <BrandMark className="size-9 animate-pulse" />
      </div>
    );
  } else if (me.isError || !me.data) {
    body = <AuthScreen onJoined={() => setEpoch((n) => n + 1)} />;
  } else {
    body = <AppShell me={me.data} />;
  }

  return (
    <>
      {/* Sfondo animato di Halloween sovrapposto */}
      <HalloweenDOMOverlay />

      {body}
      <Toaster richColors theme="dark" />
    </>
  );
}
