import { useEffect, useRef } from "react";
import { Fish } from "lucide-react";

export default function ReelGame({ difficulty, onEnd }: { difficulty: number; onEnd: (ok: boolean) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const zoneEl = useRef<HTMLDivElement>(null);
  const fishEl = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const hold = useRef(false);
  const done = useRef(false);
  const end = useRef(onEnd);

  useEffect(() => {
    end.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    const d = Math.max(1, Math.min(10, difficulty));
    const zs = 0.37 - d * 0.021;
    const fishSpeed = 0.32 + d * 0.085;
    const gain = 0.24;
    const loss = 0.09 + d * 0.012;
    let z = 0.1;
    let v = 0;
    let f = 0.5;
    let target = 0.5;
    let retarget = 0;
    let p = 0.3;
    let elapsed = 0;
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
      retarget -= dt;
      if (retarget <= 0) {
        target = Math.random();
        retarget = Math.max(0.35, 0.5 + Math.random() * 1.0 - d * 0.04);
      }
      const diff = target - f;
      f += Math.sign(diff) * Math.min(Math.abs(diff), fishSpeed * dt);
      const inside = f >= z && f <= z + zs;
      p += (inside ? gain : -loss) * dt;
      p = Math.min(1, p);
      const h = box.current?.clientHeight ?? 300;
      if (zoneEl.current) {
        zoneEl.current.style.height = `${zs * h}px`;
        zoneEl.current.style.bottom = `${z * h}px`;
        zoneEl.current.style.background = inside ? "rgba(63,185,80,0.55)" : "rgba(63,185,80,0.28)";
      }
      if (fishEl.current) fishEl.current.style.bottom = `${f * (h - 28)}px`;
      if (bar.current) bar.current.style.height = `${p * 100}%`;
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
  }, [difficulty]);

  return (
    <div
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
      <div className="flex items-stretch gap-3">
        <div ref={box} className="relative h-[min(52dvh,320px)] w-14 overflow-hidden rounded-lg border border-[#30363D] bg-[#0b2a3d]">
          <div ref={zoneEl} className="absolute inset-x-0 rounded-md border border-[#3FB950]/70" />
          <div ref={fishEl} className="absolute left-1/2 grid size-7 -translate-x-1/2 place-items-center text-[#FBBF24]">
            <Fish className="size-6" />
          </div>
        </div>
        <div className="relative w-3 overflow-hidden rounded-full border border-[#30363D] bg-[#0D1117]">
          <div ref={bar} className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3FB950] to-[#E3B341]" style={{ height: "30%" }} />
        </div>
      </div>
    </div>
  );
}
