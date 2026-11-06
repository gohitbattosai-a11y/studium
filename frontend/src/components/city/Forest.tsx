import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Crosshair, Package, Volume2, Wind } from "lucide-react";
import { toast } from "sonner";
import { ANIMAL_LIMIT, addAnimal, getSandbox, useSandbox, type AnimalCatch } from "@/lib/runtime/sandbox";
import { pickAnimal, rollWeight, type AnimalSpecies } from "@/lib/domain/animals";
import { Button } from "@/components/ui/button";
import AnimalArt from "./AnimalArt";
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

const PINES = Array.from({ length: 26 }, (_, i) => ({ x: (i * 41) % 1000, h: 90 + ((i * 53) % 70), l: i % 3 }));

function Back() {
  const stars = Array.from({ length: 40 }, (_, i) => [(i * 137) % 1000, (i * 61) % 230, 0.6 + (i % 3) * 0.4, (i % 7) * 0.4]);
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <linearGradient id="fo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1230" />
          <stop offset="0.55" stopColor="#173a44" />
          <stop offset="1" stopColor="#1c4a35" />
        </linearGradient>
        <linearGradient id="fo-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f5a37" />
          <stop offset="1" stopColor="#0f2b1c" />
        </linearGradient>
        <radialGradient id="fo-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#dbe7ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#dbe7ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="600" fill="url(#fo-sky)" />
      {stars.map(([x, y, r, d], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" className="ct-twinkle" style={{ animationDelay: `${d}s` }} />
      ))}
      <circle cx="800" cy="90" r="80" fill="url(#fo-moon)" />
      <circle cx="800" cy="90" r="26" fill="#f3f0dc" />
      {[0, 1, 2].map((layer) => (
        <g key={layer} opacity={0.5 + layer * 0.25}>
          {PINES.filter((p) => p.l === layer).map((p, i) => {
            const base = 300 + layer * 55;
            const col = ["#0f3326", "#0c2a1e", "#081f16"][layer];
            return (
              <g key={i} transform={`translate(${p.x + layer * 13} ${base})`}>
                <path d={`M0 ${-p.h * 1.5} L${p.h * 0.32} ${-p.h * 0.6} H${-p.h * 0.32}Z`} fill={col} />
                <path d={`M0 ${-p.h * 1.15} L${p.h * 0.42} ${-p.h * 0.2} H${-p.h * 0.42}Z`} fill={col} />
                <path d={`M0 ${-p.h * 0.8} L${p.h * 0.52} ${p.h * 0.2} H${-p.h * 0.52}Z`} fill={col} />
                <rect x="-5" y={p.h * 0.2} width="10" height={p.h * 0.5} fill="#1a120a" />
              </g>
            );
          })}
        </g>
      ))}
      <rect y="330" width="1000" height="270" fill="url(#fo-ground)" />
      <path d="M0 360 Q250 340 500 362 T1000 350 V380 H0Z" fill="#2b7045" opacity="0.5" />
      <path d="M0 470 Q300 450 600 478 T1000 466 V500 H0Z" fill="#164a2e" opacity="0.55" />
      <g className="fo-fog" opacity="0.35">
        <ellipse cx="260" cy="400" rx="320" ry="26" fill="#9bc5d6" opacity="0.22" />
        <ellipse cx="760" cy="440" rx="360" ry="30" fill="#9bc5d6" opacity="0.18" />
      </g>
      <path d="M300 0 L420 0 L620 330 L180 330Z" fill="#dbe7ff" opacity="0.05" />
      {[[120, 520], [380, 560], [640, 535], [880, 575], [250, 585]].map(([x, y], i) => (
        <g key={i}>
          {[-5, 0, 5].map((d) => (
            <path key={d} d={`M${x + d} ${y} q${d} -14 ${d * 2} -26`} stroke="#3a8a4a" strokeWidth="3" fill="none" strokeLinecap="round" />
          ))}
        </g>
      ))}
    </svg>
  );
}

const VITAL = { x: 0.58, y: 0.52 };

function Scope({ sp, onDone }: { sp: AnimalSpecies; onDone: (shot: Shot) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const reticle = useRef<HTMLDivElement>(null);
  const animal = useRef<HTMLDivElement>(null);
  const breathBar = useRef<HTMLDivElement>(null);
  const timeBar = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0.5, y: 0.5 });
  const cur = useRef({ x: 0.5, y: 0.5 });
  const pos = useRef({ x: 0.5, y: 0.5 });
  const holding = useRef(false);
  const stamina = useRef(1);
  const done = useRef(false);
  const [verdict, setVerdict] = useState<Shot | null>(null);
  const d = sp.difficulty;
  const radius = Math.max(0.04, 0.13 - d * 0.009);
  const sway = 0.03 + d * 0.007;
  const phase = useMemo(() => Math.random() * 6, []);
  const limit = 9;
  const finish = useRef<() => void>(() => undefined);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      if (holding.current && stamina.current > 0) stamina.current = Math.max(0, stamina.current - dt * 0.4);
      else if (!holding.current) stamina.current = Math.min(1, stamina.current + dt * 0.18);
      const steady = holding.current && stamina.current > 0 ? 0.18 : 1;
      cur.current.x += (target.current.x - cur.current.x) * Math.min(1, dt * 9);
      cur.current.y += (target.current.y - cur.current.y) * Math.min(1, dt * 9);
      const sx = cur.current.x + Math.sin(t * 1.7 + phase) * sway * steady + Math.sin(t * 3.1) * sway * 0.4 * steady;
      const sy = cur.current.y + Math.cos(t * 1.3 + phase) * sway * steady + Math.cos(t * 2.7) * sway * 0.4 * steady;
      pos.current = { x: sx, y: sy };
      const ax = 0.5 + Math.sin(t * 0.5 * sp.speed + phase) * 0.1;
      const ay = 0.52 + Math.sin(t * 0.9 * sp.speed) * 0.015;
      animal.current?.style.setProperty("left", `${ax * 100}%`);
      animal.current?.style.setProperty("top", `${ay * 100}%`);
      animal.current?.setAttribute("data-ax", String(ax));
      animal.current?.setAttribute("data-ay", String(ay));
      if (reticle.current) reticle.current.style.transform = `translate(${sx * 100}cqw, ${sy * 75}cqw) translate(-50%, -50%)`;
      if (breathBar.current) breathBar.current.style.width = `${stamina.current * 100}%`;
      if (timeBar.current) timeBar.current.style.width = `${Math.max(0, 1 - t / limit) * 100}%`;
      if (t >= limit && !done.current) {
        finish.current();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase, sway, sp.speed]);

  const fire = () => {
    if (done.current) return;
    done.current = true;
    const el = animal.current;
    const ax = Number(el?.getAttribute("data-ax") ?? 0.5);
    const ay = Number(el?.getAttribute("data-ay") ?? 0.52);
    const w = 0.5 * sp.scale * 0.9;
    const h = w;
    const vx = ax - w / 2 + VITAL.x * w;
    const vy = ay - h / 2 + VITAL.y * h;
    const dist = Math.hypot(pos.current.x - vx, (pos.current.y - vy) * 0.75);
    const shot: Shot = dist <= radius * 0.38 ? "perfect" : dist <= radius ? "hit" : "miss";
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

  const steer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    target.current = { x: Math.max(0.02, Math.min(0.98, (e.clientX - r.left) / r.width)), y: Math.max(0.02, Math.min(0.98, (e.clientY - r.top) / r.height)) };
  };

  const label = verdict === "perfect" ? "Colpo perfetto!" : verdict === "hit" ? "Colpito!" : "Mancato!";

  return (
    <div className="absolute inset-0 z-[8] grid place-items-center bg-black/75 p-3" data-testid="forest-scope">
      <div className="w-full max-w-lg">
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div ref={timeBar} className="h-full bg-[#E3B341]" />
        </div>
        <div
          ref={box}
          className="relative aspect-[4/3] w-full touch-none overflow-hidden rounded-2xl border border-[#30363D] bg-[linear-gradient(180deg,#0f2a2c,#1c4a35_70%,#10301f)] shadow-2xl [container-type:inline-size]"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            steer(e);
          }}
          onPointerMove={(e) => {
            if (e.buttons || e.pointerType === "mouse") steer(e);
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
          <div ref={animal} className="pointer-events-none absolute w-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `${50 * sp.scale * 0.9}%` }}>
            <AnimalArt a={sp} silhouette className="w-full" />
          </div>
          <div ref={reticle} className="pointer-events-none absolute top-0 left-0 size-[14cqw]">
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
        <p className="mt-2 text-center text-xs text-[#C9D1D9]">Trascina per mirare al torace, trattieni il respiro per tenere ferma la mira, poi spara.</p>
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
              <div className={inner}>
                <AnimalArt a={s.sp} silhouette className="w-full drop-shadow-[0_0_6px_rgba(227,179,65,0.35)]" />
              </div>
            </button>
          </div>
        );
      })}
      {[[12, 30], [28, 55], [47, 70], [63, 40], [78, 62], [90, 35], [20, 80], [70, 85]].map(([x, y], i) => (
        <span key={i} className="fo-fly absolute size-1.5 rounded-full bg-[#e8ff8a] shadow-[0_0_8px_#e8ff8a]" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.7}s` }} />
      ))}
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
