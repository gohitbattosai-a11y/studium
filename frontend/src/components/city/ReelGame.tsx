import { useEffect, useRef } from "react";
import { Fish } from "lucide-react";

interface Props {
  difficulty: number;
  strength?: number;
  dash?: number;
  head?: number;
  onEnd: (ok: boolean) => void;
}

export default function ReelGame({ difficulty, strength = 0.5, dash = 0.5, head = 0, onEnd }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const zoneEl = useRef<HTMLDivElement>(null);
  const fishEl = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const warn = useRef<HTMLParagraphElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const hold = useRef(false);
  const done = useRef(false);
  const end = useRef(onEnd);

  useEffect(() => {
    end.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    const d = Math.max(1, Math.min(10, difficulty));
    const zs = Math.max(0.1, Math.min(0.4, 0.37 - d * 0.021 - strength * 0.03));
    const baseSpeed = 0.32 + d * 0.085 + strength * 0.2;
    const dashEvery = Math.max(2.2, 5.4 - dash * 2 - d * 0.15);
    const gain = 0.24;
    const loss = 0.09 + d * 0.012;
    let z = 0.1;
    let v = 0;
    let f = 0.5;
    let target = 0.5;
    let retarget = 0;
    let p = Math.min(0.6, 0.3 + head);
    let elapsed = 0;
    let nextDash = 2.5 + Math.random() * 1.5;
    let warnLeft = 0;
    let dashLeft = 0;
    let dir = 1;
    let last = performance.now();
    let raf = 0;

    const finish = (ok: boolean) => {
      if (done.current) return;
      done.current = true;
      end.current(ok);
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;
      v += (hold.current ? 2.7 : -2.3) * dt;
      v = Math.max(-1.1, Math.min(1.1, v));
      z += v * dt;
      if (z < 0) {
        z = 0;
        v = Math.abs(v) * 0.2;
      }
      if (z > 1 - zs) {
        z = 1 - zs;
        v = 0;
      }
      nextDash -= dt;
      if (nextDash <= 0 && warnLeft <= 0 && dashLeft <= 0) {
        warnLeft = 0.55;
        nextDash = dashEvery + Math.random() * 1.6;
      }
      if (warnLeft > 0) {
        warnLeft -= dt;
        if (warnLeft <= 0) {
          dashLeft = 0.7;
          dir = f > 0.5 ? -1 : 1;
          target = dir > 0 ? 0.85 + Math.random() * 0.15 : Math.random() * 0.15;
          navigator.vibrate?.(60);
        }
      }
      let speed = baseSpeed * (1 - 0.35 * p);
      if (dashLeft > 0) {
        dashLeft -= dt;
        speed = baseSpeed * 3.2;
      } else {
        retarget -= dt;
        if (retarget <= 0) {
          target = Math.random();
          retarget = Math.max(0.35, 0.5 + Math.random() * 1.0 - d * 0.04);
        }
      }
      const diff = target - f;
      f += Math.sign(diff) * Math.min(Math.abs(diff), speed * dt);
      const inside = f >= z && f <= z + zs;
      p += (inside ? gain : -loss) * dt;
      p = Math.min(1, p);
      const h = box.current?.clientHeight ?? 300;
      if (zoneEl.current) {
        zoneEl.current.style.height = `${zs * h}px`;
        zoneEl.current.style.bottom = `${z * h}px`;
        zoneEl.current.style.background = inside ? "linear-gradient(180deg,rgba(63,185,80,0.7),rgba(63,185,80,0.45))" : "linear-gradient(180deg,rgba(63,185,80,0.32),rgba(63,185,80,0.18))";
      }
      if (fishEl.current) {
        fishEl.current.style.bottom = `${f * (h - 28)}px`;
        fishEl.current.style.transform = `translateX(-50%) rotate(${Math.max(-40, Math.min(40, (target - f) * 120))}deg)`;
        fishEl.current.style.color = dashLeft > 0 || warnLeft > 0 ? "#F85149" : "#FBBF24";
      }
      if (bar.current) bar.current.style.height = `${p * 100}%`;
      if (pct.current) pct.current.textContent = `${Math.round(p * 100)}%`;
      if (warn.current) warn.current.style.opacity = warnLeft > 0 || dashLeft > 0 ? "1" : "0";
      if (root.current) root.current.style.setProperty("--shake", dashLeft > 0 ? `${Math.sin(now * 0.12) * 3}px` : "0px");
      if (p >= 1) return finish(true);
      if (p <= 0 || elapsed > 35) return finish(false);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        hold.current = true;
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") hold.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [difficulty, strength, dash, head]);

  return (
    <div
      ref={root}
      className="absolute inset-0 z-10 flex touch-none select-none flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-[2px]"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        hold.current = true;
      }}
      onPointerUp={() => {
        hold.current = false;
      }}
      onPointerCancel={() => {
        hold.current = false;
      }}
      data-testid="reel-game"
    >
      <p className="px-6 text-center text-sm font-medium text-[#F0F6FC]">Tieni premuto per alzare la zona verde e tieni il pesce al suo interno</p>
      <p ref={warn} className="rounded-full bg-[#F85149] px-3 py-0.5 text-xs font-bold text-white opacity-0 transition-opacity">
        Scatto! Segui il pesce!
      </p>
      <div className="flex items-stretch gap-3" style={{ transform: "translateX(var(--shake, 0px))" }}>
        <div ref={box} className="relative h-[min(52dvh,320px)] w-16 overflow-hidden rounded-lg border border-[#30363D] bg-[linear-gradient(180deg,#1d7fa5,#0b2a3d)]">
          {[18, 44, 70].map((y, i) => (
            <span key={i} className="ct-bubble" style={{ left: `${20 + i * 24}%`, width: 5 + i * 2, height: 5 + i * 2, ["--bd" as string]: `${3 + i}s`, ["--bdelay" as string]: `${i * 0.8}s`, bottom: `${y - 18}%` }} />
          ))}
          <div ref={zoneEl} className="absolute inset-x-0 rounded-md border border-[#3FB950]/80" />
          <div ref={fishEl} className="absolute left-1/2 grid size-7 -translate-x-1/2 place-items-center text-[#FBBF24]">
            <Fish className="size-6" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-3 flex-1 overflow-hidden rounded-full border border-[#30363D] bg-[#0D1117]">
            <div ref={bar} className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3FB950] to-[#E3B341]" style={{ height: "30%" }} />
          </div>
          <span ref={pct} className="text-[10px] font-semibold tabular-nums text-[#C9D1D9]">
            30%
          </span>
        </div>
      </div>
    </div>
  );
}
