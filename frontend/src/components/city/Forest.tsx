import { useEffect, useMemo, useRef, useState } from "react";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { ANIMAL_LIMIT, addAnimal, getSandbox, useSandbox, type AnimalCatch } from "@/lib/sandbox";
import { pickAnimal, rollWeight, type AnimalSpecies } from "@/lib/animals";
import { Button } from "@/components/ui/button";
import AnimalArt from "./AnimalArt";
import AnimalBag, { AnimalDialog } from "./AnimalBag";
import "./city.css";
import "./forest.css";

interface Spawn {
  uid: number;
  sp: AnimalSpecies;
  lane: number;
  dir: 1 | -1;
  dur: number;
}

let counter = 0;
const makeSpawn = (): Spawn => ({ uid: ++counter, sp: pickAnimal(), lane: 52 + Math.random() * 32, dir: Math.random() < 0.5 ? 1 : -1, dur: 11 + Math.random() * 8 });

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

function Aim({ sp, onDone }: { sp: AnimalSpecies; onDone: (hit: boolean) => void }) {
  const [pos, setPos] = useState(0);
  const posRef = useRef(0);
  const zone = Math.min(0.34, Math.max(0.07, 0.36 - sp.difficulty * 0.03));
  const center = useMemo(() => 0.2 + Math.random() * 0.6, []);
  useEffect(() => {
    const t0 = performance.now();
    const speed = 0.7 + sp.difficulty * 0.12;
    let raf = 0;
    const tick = (t: number) => {
      const v = 0.5 - 0.5 * Math.cos(((t - t0) / 1000) * speed * Math.PI * 2);
      posRef.current = v;
      setPos(v);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sp.difficulty]);
  const shoot = () => onDone(Math.abs(posRef.current - center) <= zone / 2);
  return (
    <div className="absolute inset-0 z-[8] grid place-items-center bg-black/65 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#30363D] bg-[#0D1117]/95 p-4 text-center shadow-2xl">
        <AnimalArt a={sp} silhouette className="mx-auto w-40" />
        <p className="mt-2 text-sm text-[#C9D1D9]">Prendi la mira: tocca quando l'indicatore è nella zona verde</p>
        <button type="button" onClick={shoot} className="relative mt-4 h-9 w-full overflow-hidden rounded-full border border-[#30363D] bg-[#161B22] outline-none" aria-label="Colpisci">
          <div className="absolute inset-y-0 bg-[#3FB950]/60" style={{ left: `${(center - zone / 2) * 100}%`, width: `${zone * 100}%` }} />
          <div className="absolute inset-y-0 w-1.5 -translate-x-1/2 rounded bg-[#E3B341]" style={{ left: `${pos * 100}%` }} />
        </button>
        <Button size="lg" className="mt-4 w-full" onClick={shoot}>
          Colpisci!
        </Button>
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
  const paused = !!aim || !!result || bag;

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setSpawns((cur) => (cur.length >= 4 ? cur : [...cur, makeSpawn()])), 2200);
    return () => window.clearInterval(id);
  }, [paused]);

  const tap = (s: Spawn) => {
    if (getSandbox().animalBag.length >= ANIMAL_LIMIT) {
      toast.error("Lo zaino è pieno: dona o rilascia qualche animale");
      return;
    }
    setSpawns((cur) => cur.filter((x) => x.uid !== s.uid));
    setAim(s);
  };

  const done = (hit: boolean) => {
    const s = aim;
    setAim(null);
    if (!s) return;
    if (!hit) {
      toast.error("È scappato!");
      return;
    }
    setResult(addAnimal(s.sp.id, rollWeight(s.sp)));
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a1230]" data-testid="forest">
      <Back />
      {spawns.map((s) => {
        const w = 70 + (s.lane - 50) * 2.4;
        return (
          <div
            key={s.uid}
            className="pointer-events-none absolute left-0"
            style={{ top: `${s.lane}%`, width: w, animation: `${s.dir === 1 ? "fo-run-r" : "fo-run-l"} ${s.dur}s linear forwards` }}
            onAnimationEnd={() => setSpawns((cur) => cur.filter((x) => x.uid !== s.uid))}
          >
            <button type="button" onClick={() => tap(s)} className="pointer-events-auto block w-full outline-none" aria-label="Animale nella foresta" style={{ transform: `translateY(-100%) scaleX(${s.dir})` }}>
              <div className="fo-hop">
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
        <span className="rounded-full border border-[#E3B341]/50 bg-black/55 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#E3B341] uppercase backdrop-blur">Test · niente viene salvato</span>
      </div>
      <Button variant="secondary" size="lg" className="absolute right-4 bottom-4 z-[3]" onClick={() => setBag(true)} data-testid="forest-bag-button">
        <Package /> Zaino ({sb.animalBag.length})
      </Button>
      {aim && <Aim sp={aim.sp} onDone={done} />}
      <AnimalDialog item={result} onClose={() => setResult(null)} />
      <AnimalBag open={bag} onClose={() => setBag(false)} />
    </div>
  );
}
