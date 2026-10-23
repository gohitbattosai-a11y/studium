import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Me } from "@/lib/types";
import AuthScreen from "@/components/auth/AuthScreen";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { BrandMark } from "@/components/common";

// Componente Sfondo Animato Halloween (Canvas Overlay)
function HalloweenOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const emojis = ["🎃", "👻", "🦇", "💀", "🕷️", "🎃", "👻"];
    const particles = Array.from({ length: 28 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: Math.floor(Math.random() * 16) + 22,
      speedY: Math.random() * 1.2 + 0.6,
      opacity: Math.random() * 0.7 + 0.3,
    }));

    let riderX = -100;
    let riderY = window.innerHeight * 0.25;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Scritta Happy Halloween in alto
      ctx.save();
      ctx.font = "bold 22px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#f97316";
      ctx.shadowColor = "rgba(249, 115, 22, 0.9)";
      ctx.shadowBlur = 10;
      ctx.fillText("🎃 HAPPY HALLOWEEN 👻", canvas.width / 2, 32);
      ctx.restore();

      // Flusso di zucche e fantasmi
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.emoji, p.x, p.y);
        ctx.restore();

        p.y -= p.speedY;
        p.x += Math.sin(p.y * 0.02) * 0.6;

        if (p.y < -40) {
          p.y = canvas.height + 40;
          p.x = Math.random() * canvas.width;
        }
      });

      // Cavaliere / Fantasma in volo
      ctx.save();
      ctx.font = "32px serif";
      ctx.fillText("🏇💨👻", riderX, riderY);
      ctx.restore();

      riderX += 2.5;
      riderY += Math.sin(riderX * 0.01) * 0.5;
      if (riderX > canvas.width + 120) {
        riderX = -120;
        riderY = Math.random() * (canvas.height * 0.4) + 80;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none", // Rende l'overlay trasparente ai clic
        zIndex: 999999, // Garantisce la sovrapposizione su AppShell
      }}
    />
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
      {/* Sfondo Animato Halloween sovrapposto all'intera app */}
      <HalloweenOverlay />

      {body}
      <Toaster richColors theme="dark" />
    </>
  );
}
