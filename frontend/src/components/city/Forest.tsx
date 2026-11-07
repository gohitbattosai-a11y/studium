import { useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, Package, Volume2, Wind } from "lucide-react";
import { toast } from "sonner";
import { ANIMAL_LIMIT, addAnimal, getSandbox, useSandbox, type AnimalCatch } from "@/lib/runtime/sandbox";
import { pickAnimal, rollWeight, type AnimalSpecies } from "@/lib/domain/animals";
import { Button } from "@/components/ui/button";
import AnimalArt from "./AnimalArt";
import Wings from "./Wings";
import AnimalBag, { AnimalDialog } from "./AnimalBag";
import "./city.css";
import "./forest.css";

type Shot = "perfect" | "hit" | "miss";

interface Spawn {
  uid: number;
  sp: AnimalSpecies;
  lane: number;
  dir: 1 | -1;
  dur: number;
}

const CALL_COOLDOWN = 25000;
const MAX_SPAWNS = 5;

let counter = 0;
const makeSpawn = (boost = 0): Spawn => {
  const sp = pickAnimal(boost);
  const sky = sp.behavior === "fly";
  const lane = sky ? 16 + Math.random() * 20 : 54 + Math.random() * 30;
  const base = sp.behavior === "graze" ? 20 : sp.behavior === "fly" ? 9 : 14;
  return { uid: ++counter, sp, lane, dir: Math.random() < 0.5 ? 1 : -1, dur: (base + Math.random() * 6) / sp.speed };
};

function rnd(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pine = (x: number, base: number, h: number, c: string, c2: string) => (
  <g key={`p${x}-${base}`}>
    <rect x={x - h * 0.04} y={base - h * 0.22} width={h * 0.08} height={h * 0.24} fill="#1a120a" />
    <path d={`M${x} ${base - h} L${x + h * 0.2} ${base - h * 0.55} H${x - h * 0.2}Z`} fill={c} />
    <path d={`M${x} ${base - h * 0.78} L${x + h * 0.27} ${base - h * 0.34} H${x - h * 0.27}Z`} fill={c} />
    <path d={`M${x} ${base - h * 0.56} L${x + h * 0.33} ${base - h * 0.12} H${x - h * 0.33}Z`} fill={c} />
    <path d={`M${x} ${base - h} L${x - h * 0.2} ${base - h * 0.55} H${x}Z`} fill={c2} opacity="0.5" />
    <path d={`M${x} ${base - h * 0.78} L${x - h * 0.27} ${base - h * 0.34} H${x}Z`} fill={c2} opacity="0.5" />
  </g>
);

const broad = (x: number, base: number, h: number, c: string, c2: string, tr: string) => (
  <g key={`b${x}-${base}`}>
    <path d={`M${x - h * 0.05} ${base} C${x - h * 0.04} ${base - h * 0.3} ${x - h * 0.06} ${base - h * 0.45} ${x - h * 0.08} ${base - h * 0.55} H${x + h * 0.08} C${x + h * 0.06} ${base - h * 0.45} ${x + h * 0.04} ${base - h * 0.3} ${x + h * 0.05} ${base}Z`} fill={tr} />
    <circle cx={x - h * 0.2} cy={base - h * 0.62} r={h * 0.22} fill={c} />
    <circle cx={x + h * 0.2} cy={base - h * 0.64} r={h * 0.23} fill={c} />
    <circle cx={x} cy={base - h * 0.8} r={h * 0.28} fill={c} />
    <circle cx={x - h * 0.08} cy={base - h * 0.88} r={h * 0.16} fill={c2} opacity="0.55" />
  </g>
);

const FOREST = (() => {
  const r = rnd(11);
  const stars = Array.from({ length: 46 }, () => [r() * 1000, r() * 200, 0.5 + r() * 1.1] as const);
  const rows = [
    { base: 300, n: 26, h: [120, 190], c: "#12392c", c2: "#1d5240", t: "#0c241c", o: 0.55 },
    { base: 340, n: 20, h: [150, 240], c: "#0e3023", c2: "#18463a", t: "#091d16", o: 0.7 },
    { base: 395, n: 15, h: [200, 310], c: "#0a261c", c2: "#143a2c", t: "#07160f", o: 0.85 },
    { base: 455, n: 10, h: [260, 380], c: "#071d15", c2: "#0f2e22", t: "#050f0a", o: 1 },
  ].map((row, li) =>
    Array.from({ length: row.n }, (_, i) => {
      const x = (i + r() * 0.8) * (1000 / row.n);
      const h = row.h[0] + r() * (row.h[1] - row.h[0]);
      return { x, h, pine: (i + li) % 3 !== 0, row };
    }),
  );
  const ferns = Array.from({ length: 22 }, () => ({ x: r() * 1000, y: 360 + r() * 230, s: 0.7 + r() * 0.9 }));
  const bushes = Array.from({ length: 16 }, () => ({ x: r() * 1000, y: 350 + r() * 220, s: 0.7 + r() * 1 }));
  const mush = Array.from({ length: 12 }, () => ({ x: r() * 1000, y: 380 + r() * 200, s: 0.7 + r() * 0.8, c: r() > 0.5 ? "#ff6b6b" : "#7dd3fc" }));
  const rocks = Array.from({ length: 9 }, () => ({ x: r() * 1000, y: 400 + r() * 190, s: 0.6 + r() * 1 }));
  const flowers = Array.from({ length: 40 }, () => ({ x: r() * 1000, y: 370 + r() * 230, c: ["#f9a8d4", "#fde68a", "#c4b5fd", "#ffffff"][Math.floor(r() * 4)] }));
  const leaves = Array.from({ length: 30 }, () => ({ x: r() * 1000, y: 360 + r() * 230, c: ["#8a5a2a", "#a8742f", "#5a3f1e", "#6e8a2a"][Math.floor(r() * 4)] }));
  const canopy = Array.from({ length: 22 }, (_, i) => ({ x: i * 48 + r() * 30, y: -10 + r() * 70, rr: 50 + r() * 50 }));
  const vines = Array.from({ length: 9 }, () => ({ x: r() * 1000, l: 60 + r() * 120 }));
  const grass = Array.from({ length: 36 }, () => ({ x: r() * 1000, h: 30 + r() * 60, y: 560 + r() * 40 }));
  return { stars, rows, ferns, bushes, mush, rocks, flowers, leaves, canopy, vines, grass };
})();

function Back() {
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <linearGradient id="fo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070d26" />
          <stop offset="0.5" stopColor="#12333f" />
          <stop offset="1" stopColor="#1a4a3a" />
        </linearGradient>
        <linearGradient id="fo-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e5a38" />
          <stop offset="0.5" stopColor="#173f2a" />
          <stop offset="1" stopColor="#0b1f15" />
        </linearGradient>
        <linearGradient id="fo-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fb6c4" stopOpacity="0" />
          <stop offset="1" stopColor="#7fb6c4" stopOpacity="0.26" />
        </linearGradient>
        <radialGradient id="fo-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#dbe7ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#dbe7ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fo-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="600" fill="url(#fo-sky)" />
      {FOREST.stars.map(([x, y, rr], i) => (
        <circle key={i} cx={x} cy={y} r={rr} fill="#ffffff" opacity="0.8" />
      ))}
      <circle cx="800" cy="82" r="90" fill="url(#fo-moon)" />
      <circle cx="800" cy="82" r="26" fill="#f3f0dc" />
      <path d="M0 250 Q120 190 260 240 T520 220 T780 250 T1000 210 V330 H0Z" fill="#0f2c33" opacity="0.8" />
      {FOREST.rows.map((row, li) => (
        <g key={li} opacity={row[0].row.o}>
          {row.map((t) => (t.pine ? pine(t.x, t.row.base, t.h, t.row.c, t.row.c2) : broad(t.x, t.row.base, t.h, t.row.c, t.row.c2, t.row.t)))}
          <rect x="0" y={row[0].row.base - 40} width="1000" height="60" fill="url(#fo-haze)" />
        </g>
      ))}
      <path d="M380 0 L470 0 L560 330 L260 330Z" fill="#dbe7ff" opacity="0.06" />
      <path d="M620 0 L680 0 L780 330 L600 330Z" fill="#dbe7ff" opacity="0.05" />
      <rect y="330" width="1000" height="270" fill="url(#fo-ground)" />
      <path d="M0 372 Q250 352 500 374 T1000 362 V400 H0Z" fill="#2b7045" opacity="0.5" />
      <path d="M0 480 Q300 458 600 486 T1000 474 V520 H0Z" fill="#14402a" opacity="0.6" />
      <path d="M380 600 C420 520 470 470 520 430 C560 400 620 380 700 362" stroke="#4a3a24" strokeWidth="46" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M380 600 C420 520 470 470 520 430 C560 400 620 380 700 362" stroke="#6a5334" strokeWidth="30" fill="none" strokeLinecap="round" opacity="0.5" />
      {FOREST.leaves.map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx="6" ry="3" fill={l.c} opacity="0.8" transform={`rotate(${(i * 47) % 180} ${l.x} ${l.y})`} />
      ))}
      {FOREST.rocks.map((k, i) => (
        <g key={i} transform={`translate(${k.x} ${k.y}) scale(${k.s})`}>
          <ellipse cx="0" cy="6" rx="34" ry="7" fill="#000" opacity="0.3" />
          <path d="M-32 6 Q-30 -22 -6 -28 Q22 -30 34 -8 Q38 0 32 6Z" fill="#59635f" />
          <path d="M-6 -28 Q22 -30 34 -8 Q12 -16 -10 -10Z" fill="#7b8782" />
          <ellipse cx="-14" cy="-20" rx="16" ry="5" fill="#3f7a3f" opacity="0.85" />
        </g>
      ))}
      <g transform="translate(160 520)">
        <ellipse cx="0" cy="10" rx="110" ry="12" fill="#000" opacity="0.3" />
        <path d="M-100 8 Q-104 -22 -80 -26 H70 Q96 -22 96 8Z" fill="#4a3320" />
        <path d="M-100 8 Q-104 -22 -80 -26 H70 L60 -14 H-76Z" fill="#6a4a2e" />
        <ellipse cx="96" cy="-9" rx="10" ry="17" fill="#c79a62" />
        <ellipse cx="-40" cy="-26" rx="46" ry="8" fill="#3f7a3f" opacity="0.8" />
      </g>
      {FOREST.bushes.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
          <ellipse cx="0" cy="4" rx="40" ry="7" fill="#000" opacity="0.3" />
          <circle cx="-20" cy="-8" r="20" fill="#14432a" />
          <circle cx="20" cy="-8" r="22" fill="#14432a" />
          <circle cx="0" cy="-16" r="26" fill="#1c5a38" />
          <circle cx="-8" cy="-24" r="14" fill="#2b7a4a" opacity="0.7" />
        </g>
      ))}
      {FOREST.ferns.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y}) scale(${f.s})`} stroke="#2f8a4a" strokeWidth="3" fill="none" strokeLinecap="round">
          {[-50, -28, -8, 12, 32, 52].map((a) => (
            <path key={a} d={`M0 0 Q${a * 0.5} -26 ${a} -${40 - Math.abs(a) * 0.3}`} />
          ))}
        </g>
      ))}
      {FOREST.mush.map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${m.y}) scale(${m.s})`}>
          <circle cx="0" cy="-8" r="22" fill="url(#fo-glow)" opacity="0.35" />
          <rect x="-2" y="-8" width="4" height="9" fill="#e8dcc0" />
          <path d="M-9 -8 Q0 -22 9 -8Z" fill={m.c} />
          <circle cx="-3" cy="-12" r="1.2" fill="#fff" />
          <circle cx="3" cy="-11" r="1" fill="#fff" />
        </g>
      ))}
      {FOREST.flowers.map((f, i) => (
        <g key={i}>
          <path d={`M${f.x} ${f.y} v7`} stroke="#2f8a4a" strokeWidth="1.4" />
          <circle cx={f.x} cy={f.y} r="2.6" fill={f.c} />
        </g>
      ))}
      <path d="M0 0 H1000 V50 Q900 80 800 50 T600 54 T400 48 T200 56 T0 46Z" fill="#06180f" />
      {FOREST.canopy.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.rr} fill={i % 3 ? "#0a2a1b" : "#0e3524"} />
      ))}
      {FOREST.vines.map((v, i) => (
        <path key={i} d={`M${v.x} 40 q8 ${v.l * 0.5} -2 ${v.l}`} stroke="#1f6a3a" strokeWidth="3" fill="none" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function Front() {
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 z-[6] size-full" aria-hidden>
      <path d="M-20 600 L-20 0 H70 C60 120 80 260 66 380 C56 470 74 540 96 600Z" fill="#050d08" />
      <path d="M70 0 C60 120 80 260 66 380 C56 470 74 540 96 600 H70 C50 520 40 470 52 380 C62 260 48 120 52 0Z" fill="#14281c" opacity="0.8" />
      <path d="M1020 600 L1020 0 H930 C940 120 920 260 934 380 C944 470 926 540 904 600Z" fill="#050d08" />
      <path d="M930 0 C940 120 920 260 934 380 C944 470 926 540 904 600 H930 C950 520 960 470 948 380 C938 260 952 120 948 0Z" fill="#14281c" opacity="0.8" />
      <path d="M-20 590 q60 -40 120 -2 M1020 590 q-60 -40 -120 -2" stroke="#050d08" strokeWidth="26" fill="none" strokeLinecap="round" />
      {FOREST.grass.map((g, i) => (
        <g key={i} stroke={i % 3 ? "#2f8a4a" : "#46a85e"} strokeWidth="3.4" fill="none" strokeLinecap="round">
          <path d={`M${g.x - 7} ${g.y + 40} Q${g.x - 8} ${g.y + 20} ${g.x - 14} ${g.y + 40 - g.h}`} />
          <path d={`M${g.x} ${g.y + 40} Q${g.x + 2} ${g.y + 10} ${g.x} ${g.y + 40 - g.h * 1.15}`} />
          <path d={`M${g.x + 7} ${g.y + 40} Q${g.x + 8} ${g.y + 20} ${g.x + 15} ${g.y + 40 - g.h}`} />
        </g>
      ))}
      {[[120, 560], [880, 566]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${i ? -1.5 : 1.5} 1.5)`} stroke="#1f6a3a" strokeWidth="4" fill="none" strokeLinecap="round">
          {[-60, -36, -12, 12, 36, 60].map((a) => (
            <path key={a} d={`M0 0 Q${a * 0.6} -36 ${a} -${56 - Math.abs(a) * 0.4}`} />
          ))}
        </g>
      ))}
    </svg>
  );
}

const VITAL = { x: 0.58, y: 0.52 };

function Scope({ sp, onDone }: { sp: AnimalSpecies; onDone: (shot: Shot) => void }) {
  const reticle = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const animal = useRef<HTMLDivElement>(null);
  const breathBar = useRef<HTMLDivElement>(null);
  const timeBar = useRef<HTMLDivElement>(null);
  const holding = useRef(false);
  const stamina = useRef(1);
  const done = useRef(false);
  const armed = useRef(false);
  const state = useRef({ ax: 0.5, ay: 0.52, ox: 0, oy: 0 });
  const [verdict, setVerdict] = useState<Shot | null>(null);
  const d = sp.difficulty;
  const radius = Math.max(0.035, 0.07 - d * 0.0045);
  const sway = 0.08 + d * 0.008;
  const phase = useMemo(() => Math.random() * 6, []);
  const limit = 10;
  const finish = useRef<() => void>(() => undefined);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    const arm = window.setTimeout(() => {
      armed.current = true;
    }, 350);
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      if (holding.current && stamina.current > 0) stamina.current = Math.max(0, stamina.current - dt * 0.35);
      else if (!holding.current) stamina.current = Math.min(1, stamina.current + dt * 0.2);
      const steady = holding.current && stamina.current > 0 ? 0.55 : 1;
      const pulse = 0.1 + 0.9 * (0.5 + 0.5 * Math.sin(t * 1.6 + phase)) ** 2;
      const amp = sway * pulse * steady;
      const ax = 0.5 + Math.sin(t * 0.8 * sp.speed + phase) * 0.16;
      const ay = 0.52 + Math.sin(t * 0.8 * sp.speed) * 0.015;
      const w = 0.5 * sp.scale * 0.9;
      const vx = ax - w / 2 + VITAL.x * w;
      const vy = ay - w / 2 + VITAL.y * w;
      const ox = Math.sin(t * 1.7 + phase) * amp + Math.sin(t * 3.1) * amp * 0.35;
      const oy = Math.cos(t * 1.3 + phase) * amp + Math.cos(t * 2.7) * amp * 0.35;
      state.current = { ax, ay, ox, oy };
      animal.current?.style.setProperty("left", `${ax * 100}%`);
      animal.current?.style.setProperty("top", `${ay * 100}%`);
      if (reticle.current) reticle.current.style.transform = `translate(${(vx + ox) * 100}cqw, ${(vy + oy) * 75}cqw) translate(-50%, -50%)`;
      if (ring.current) {
        ring.current.style.transform = `translate(${vx * 100}cqw, ${vy * 75}cqw) translate(-50%, -50%) scale(${0.35 + (amp / (sway * 1.3)) * 0.65})`;
        ring.current.style.opacity = amp < sway * 0.45 ? "1" : "0.55";
      }
      if (breathBar.current) breathBar.current.style.width = `${stamina.current * 100}%`;
      if (timeBar.current) timeBar.current.style.width = `${Math.max(0, 1 - t / limit) * 100}%`;
      if (t >= limit && !done.current) {
        finish.current();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(arm);
    };
  }, [phase, sway, sp.speed, sp.scale]);

  const fire = () => {
    if (done.current || !armed.current) return;
    done.current = true;
    const { ox, oy } = state.current;
    const dist = Math.hypot(ox, oy * 0.75);
    const shot: Shot = dist <= radius * 0.4 ? "perfect" : dist <= radius ? "hit" : "miss";
    navigator.vibrate?.(shot === "miss" ? 30 : 70);
    setVerdict(shot);
    window.setTimeout(() => onDone(shot), 750);
  };

  useEffect(() => {
    finish.current = () => {
      if (done.current) return;
      done.current = true;
      setVerdict("miss");
      window.setTimeout(() => onDone("miss"), 600);
    };
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        fire();
      }
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") holding.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") holding.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  });

  const label = verdict === "perfect" ? "Colpo perfetto!" : verdict === "hit" ? "Colpito!" : "Mancato!";

  return (
    <div className="absolute inset-0 z-[8] grid place-items-center bg-black/75 p-3" data-testid="forest-scope">
      <div className="w-full max-w-lg">
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div ref={timeBar} className="h-full bg-[#E3B341]" />
        </div>
        <div
          className="relative aspect-[4/3] w-full touch-none overflow-hidden rounded-2xl border border-[#30363D] bg-[linear-gradient(180deg,#0f2a2c,#1c4a35_70%,#10301f)] shadow-2xl [container-type:inline-size]"
          onPointerDown={fire}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
          <div ref={animal} className="pointer-events-none absolute w-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `${50 * sp.scale * 0.9}%` }}>
            <AnimalArt a={sp} silhouette className="w-full" />
          </div>
          <div ref={ring} className="pointer-events-none absolute top-0 left-0 size-[26cqw] transition-opacity">
            <svg viewBox="0 0 100 100" className="size-full">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#7EE787" strokeWidth="2" strokeDasharray="6 5" />
            </svg>
          </div>
          <div ref={reticle} className="pointer-events-none absolute top-0 left-0 size-[12cqw]">
            <svg viewBox="0 0 100 100" className="size-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#E3B341" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="3" fill="#F85149" />
              <path d="M50 2 V28 M50 72 V98 M2 50 H28 M72 50 H98" stroke="#E3B341" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          {verdict && <div className="fo-flash pointer-events-none absolute inset-0 bg-white/70" />}
          {verdict && (
            <p className="fo-pop pointer-events-none absolute top-1/3 left-1/2 rounded-full bg-black/70 px-4 py-1.5 text-base font-bold text-white" style={{ color: verdict === "miss" ? "#F85149" : "#E3B341" }}>
              {label}
            </p>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-[#C9D1D9]">Il mirino segue l'animale da solo. Il mirino trema: tocca nel momento esatto in cui il cerchio verde è al minimo. Se lo fai al momento sbagliato, manchi.</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div ref={breathBar} className="h-full bg-[#58A6FF]" />
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 touch-none select-none"
            onPointerDown={() => {
              holding.current = true;
            }}
            onPointerUp={() => {
              holding.current = false;
            }}
            onPointerLeave={() => {
              holding.current = false;
            }}
            onPointerCancel={() => {
              holding.current = false;
            }}
          >
            <Wind /> Respira
          </Button>
          <Button size="lg" className="flex-[2]" onClick={fire} disabled={!!verdict} data-testid="forest-fire">
            <Crosshair /> Spara
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Forest() {
  const sb = useSandbox();
  const [spawns, setSpawns] = useState<Spawn[]>(() => [makeSpawn(), makeSpawn()]);
  const [aim, setAim] = useState<Spawn | null>(null);
  const [result, setResult] = useState<AnimalCatch | null>(null);
  const [bag, setBag] = useState(false);
  const [streak, setStreak] = useState(0);
  const [callAt, setCallAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const paused = !!aim || !!result || bag;

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setSpawns((cur) => (cur.length >= MAX_SPAWNS ? cur : [...cur, makeSpawn()])), 2000);
    return () => window.clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  const callLeft = Math.max(0, Math.ceil((callAt + CALL_COOLDOWN - now) / 1000));

  const call = () => {
    if (callLeft > 0 || paused) return;
    setCallAt(Date.now());
    setSpawns((cur) => [...cur.slice(-(MAX_SPAWNS - 1)), makeSpawn(1.6)]);
    toast("Richiamo lanciato: qualcosa si avvicina…");
  };

  const tap = (s: Spawn) => {
    if (getSandbox().animalBag.length >= ANIMAL_LIMIT) {
      toast.error("Lo zaino è pieno: dona o rilascia qualche animale");
      return;
    }
    setSpawns((cur) => cur.filter((x) => x.uid !== s.uid));
    setAim(s);
  };

  const done = (shot: Shot) => {
    const s = aim;
    setAim(null);
    if (!s) return;
    if (shot === "miss") {
      setStreak(0);
      toast.error("È scappato!");
      return;
    }
    const next = shot === "perfect" ? streak + 1 : 0;
    setStreak(next);
    const bonus = shot === "perfect" ? 1.1 : 1;
    const weight = Math.round(rollWeight(s.sp) * bonus * 10) / 10;
    setResult(addAnimal(s.sp.id, weight));
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a1230]" data-testid="forest">
      <Back />
      <div className="fo-mist pointer-events-none absolute inset-x-[-10%] top-[48%] h-[16%] bg-[radial-gradient(ellipse,rgba(155,197,214,0.22),transparent_70%)]" />
      <div className="fo-mist pointer-events-none absolute inset-x-[-10%] top-[66%] h-[14%] bg-[radial-gradient(ellipse,rgba(155,197,214,0.16),transparent_70%)]" style={{ animationDelay: "-8s" }} />
      {spawns.map((s) => {
        const sky = s.sp.behavior === "fly";
        const w = (sky ? 80 : 70 + (s.lane - 50) * 2.4) * s.sp.scale;
        const inner = s.sp.behavior === "hop" ? "fo-hop" : sky ? "fo-fly-arc" : "";
        return (
          <div
            key={s.uid}
            className="pointer-events-none absolute left-0"
            style={{ top: `${s.lane}%`, width: w, zIndex: Math.round(s.lane), animation: `${s.dir === 1 ? "fo-run-r" : "fo-run-l"} ${s.dur}s linear forwards` }}
            onAnimationEnd={() => setSpawns((cur) => cur.filter((x) => x.uid !== s.uid))}
          >
            <button type="button" onClick={() => tap(s)} className="pointer-events-auto block w-full outline-none" aria-label="Animale nella foresta" style={{ transform: `translateY(-100%) scaleX(${s.dir})` }}>
              <div className={`relative ${inner}`}>
                {sky && <Wings a={s.sp} silhouette />}
                <AnimalArt a={s.sp} silhouette className="w-full" />
              </div>
            </button>
          </div>
        );
      })}
      {[[12, 30], [28, 55], [47, 70], [63, 40], [78, 62], [90, 35], [20, 80], [70, 85]].map(([x, y], i) => (
        <span key={i} className="fo-fly absolute size-1.5 rounded-full bg-[#e8ff8a] shadow-[0_0_8px_#e8ff8a]" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.7}s` }} />
      ))}
      <Front />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[9%] bg-gradient-to-r from-[#050c08] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[9%] bg-gradient-to-l from-[#050c08] to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_55%,rgba(2,8,5,0.55))]" />
      <div className="pointer-events-none absolute inset-x-0 top-14 flex flex-col items-center gap-1.5">
        <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">Tocca un animale per mirare</span>
        {streak > 1 && <span className="rounded-full border border-[#3FB950]/50 bg-black/55 px-2.5 py-0.5 text-[11px] font-semibold text-[#7EE787] backdrop-blur">Serie di {streak} colpi perfetti</span>}
        <span className="rounded-full border border-[#E3B341]/50 bg-black/55 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#E3B341] uppercase backdrop-blur">Test · niente viene salvato</span>
      </div>
      <div className="absolute right-4 bottom-4 z-[3] flex gap-2">
        <Button variant="outline" size="lg" onClick={call} disabled={callLeft > 0 || paused} data-testid="forest-call">
          <Volume2 /> {callLeft > 0 ? `Richiamo (${callLeft}s)` : "Richiamo"}
        </Button>
        <Button variant="secondary" size="lg" onClick={() => setBag(true)} data-testid="forest-bag-button">
          <Package /> Zaino ({sb.animalBag.length})
        </Button>
      </div>
      {aim && <Scope sp={aim.sp} onDone={done} />}
      <AnimalDialog item={result} onClose={() => setResult(null)} />
      <AnimalBag open={bag} onClose={() => setBag(false)} />
    </div>
  );
}
