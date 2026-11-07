import { useEffect, useRef } from "react";
import { Fish } from "lucide-react";

interface Props {
  difficulty: number;
  strength?: number;
  dash?: number;
  head?: number;
  onEnd: (ok: boolean) => void;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

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
    const d = clamp(difficulty, 1, 10);
    const zs = clamp(0.47 - d * 0.026 - strength * 0.03, 0.24, 0.46);
    const wander = 0.2 + d * 0.025;
    const maxSpeed = 0.2 + d * 0.03 + strength * 0.08;
    const dashEvery = Math.max(5, 9 - dash * 2 - d * 0.2);
    const gain = 0.22;
    const loss = 0.04 + d * 0.005;
    let z = 0;
    let v = 0;
    let f = 0.5;
    let fv = 0;
    let target = 0.5;
    let retarget = 1;
    let p = clamp(0.38 + head, 0.38, 0.7);
    let elapsed = 0;
    let nextDash = 5 + Math.random() * 2;
    let warnLeft = 0;
    let dashLeft = 0;
    let last = performance.now();
    let raf = 0;

    const finish = (ok: boolean) => {
      if (done.current) return;
      done.current = true;
      end.current(ok);
    };

    const step = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      elapsed += dt;

      const acc = hold.current ? 2.1 : -1.7;
      v += acc * dt;
      v *= 1 - Math.min(1, 1.6 * dt);
      v = clamp(v, -0.8, 0.8);
      z += v * dt;
      if (z < 0) {
        z = 0;
        v = 0;
      }
      if (z > 1 - zs) {
        z = 1 - zs;
        v = 0;
      }

      nextDash -= dt;
      if (nextDash <= 0 && warnLeft <= 0 && dashLeft <= 0) {
        warnLeft = 0.9;
        nextDash = dashEvery + Math.random() * 2.5;
      }
      if (warnLeft > 0) {
        warnLeft -= dt;
        if (warnLeft <= 0) {
          dashLeft = 0.9;
          const dir = f > 0.5 ? -1 : 1;
          target = clamp(f + dir * (0.28 + Math.random() * 0.14), 0.04, 0.96);
          navigator.vibrate?.(40);
        }
      }
      if (dashLeft > 0) dashLeft -= dt;
      else {
        retarget -= dt;
        if (retarget <= 0) {
          target = clamp(target + (Math.random() - 0.5) * 2 * wander, 0.05, 0.95);
          retarget = 1.1 + Math.random() * 1.3 - d * 0.04;
        }
      }

      const stiff = dashLeft > 0 ? 9 : 5;
      const damp = 2 * Math.sqrt(stiff) * 0.95;
      fv += ((target - f) * stiff - fv * damp) * dt;
      const cap = dashLeft > 0 ? maxSpeed * 2 : maxSpeed;
      fv = clamp(fv, -cap, cap);
      f = clamp(f + fv * dt, 0, 1);

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
        fishEl.current.style.transform = `translateX(-50%) rotate(${clamp(fv * 120, -35, 35)}deg)`;
        fishEl.current.style.color = dashLeft > 0 || warnLeft > 0 ? "#F85149" : "#FBBF24";
      }
      if (bar.current) bar.current.style.height = `${p * 100}%`;
      if (pct.current) pct.current.textContent = `${Math.round(p * 100)}%`;
      if (warn.current) warn.current.style.opacity = warnLeft > 0 || dashLeft > 0 ? "1" : "0";
      if (root.current) root.current.style.setProperty("--shake", dashLeft > 0 ? `${Math.sin(now * 0.08) * 1.5}px` : "0px");
      if (p >= 1) return finish(true);
      if (p <= 0 || elapsed > 50) return finish(false);
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
      <p className="px-6 text-center text-sm font-medium text-[#F0F6FC]">Tieni premuto per far salire la zona verde, rilascia per farla scendere. Tieni il pesce al suo interno.</p>
      <p ref={warn} className="rounded-full bg-[#F85149] px-3 py-0.5 text-xs font-bold text-white opacity-0 transition-opacity">
        Sta per scattare!
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
            <div ref={bar} className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3FB950] to-[#E3B341]" style={{ height: "38%" }} />
          </div>
          <span ref={pct} className="text-[10px] font-semibold tabular-nums text-[#C9D1D9]">
            38%
          </span>
        </div>
      </div>
    </div>
  );
}
