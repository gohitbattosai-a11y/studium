import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import type { Donation, Species } from "@/lib/domain/city";
import FishArt, { shade } from "./FishArt";
import { Scenery, fishW } from "./Aqua";
import { isBig, type ResolvedRoom, type ResolvedSystem, type Theme, type ThemeId } from "./rooms";
import "./city.css";
import "./aquarium.css";

type PassKind = "fall" | "cave" | "vent" | "light";

const KIND: Record<ThemeId, PassKind> = { pond: "fall", lake: "fall", stream: "fall", koi: "fall", mud: "cave", predator: "cave", abyss: "vent", shrine: "light" };
const BOTTOM = new Set(["anguilla", "siluro"]);

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

interface Fish {
  sp: Species;
  sys: ResolvedSystem;
  zi: number;
  copy: number;
  w: number;
  bottom: boolean;
  big: boolean;
  depth: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  speed: number;
  timer: number;
  dir: 1 | -1;
  seed: number;
}

interface Geo {
  vw: number;
  vh: number;
  fh: number;
  tb: number;
  ks: number;
  endW: number;
  zw: number;
  worldW: number;
}

function PassageArt({ kind, th, closed }: { kind: PassKind; th: Theme; closed: boolean }) {
  const rock = shade(th.trim, kind === "vent" ? -0.55 : kind === "cave" ? -0.35 : -0.05);
  const rockHi = shade(rock, 0.22);
  const rockLo = shade(rock, -0.4);
  const glow = kind === "vent" ? "#38bdf8" : kind === "light" ? "#fde68a" : th.water[0];
  const open = kind === "cave" ? "#05070a" : glow;
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <linearGradient id={`ps-wall-${kind}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={rockLo} />
          <stop offset="0.6" stopColor={rock} />
          <stop offset="1" stopColor={rockHi} />
        </linearGradient>
        <linearGradient id={`ps-open-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={open} stopOpacity={kind === "cave" ? 1 : 0.95} />
          <stop offset="1" stopColor={kind === "cave" ? "#12100c" : th.water[1]} />
        </linearGradient>
        <linearGradient id="ps-curtain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4fcff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#b8e6f4" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id="ps-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={glow} stopOpacity="0.8" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M0 0 H332 L352 60 L318 130 L350 212 L312 292 L346 384 L316 472 L352 560 L338 600 H0Z" fill={`url(#ps-wall-${kind})`} />
      <path d="M60 0 L150 0 L120 90 L40 60Z M200 140 L290 90 L310 190 L230 230Z M30 300 L120 260 L150 380 L50 420Z M200 380 L300 330 L320 470 L210 500Z" fill={rockHi} opacity="0.28" />
      <path d="M0 150 L60 190 L30 280 L0 260Z M120 470 L220 430 L250 560 L110 600Z" fill={rockLo} opacity="0.4" />
      {!closed && <path d="M64 600 V300 Q64 186 168 186 Q272 186 272 300 V600Z" fill={`url(#ps-open-${kind})`} />}
      {!closed && <ellipse cx="168" cy="330" rx="150" ry="210" fill="url(#ps-halo)" className="aq-glow" />}
      {closed && (
        <g>
          <path d="M40 600 L60 330 L140 250 L240 270 L290 380 L300 600Z" fill={rockLo} />
          <path d="M60 330 L140 250 L240 270 L190 340 L110 370Z" fill={rockHi} opacity="0.5" />
          <rect x="96" y="410" width="140" height="48" rx="8" fill="#0d1117" opacity="0.7" />
          <path d="M116 434 H216" stroke="#8b949e" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {kind === "fall" && !closed && (
        <g>
          <rect x="44" y="150" width="256" height="40" rx="14" fill={rockHi} />
          <rect x="44" y="150" width="256" height="14" rx="7" fill="#7fc46a" />
          <rect x="74" y="182" width="190" height="418" fill="url(#ps-curtain)" />
          {Array.from({ length: 13 }, (_, i) => (
            <line key={i} x1={80 + i * 14.6} y1="188" x2={80 + i * 14.6} y2="590" stroke="#ffffff" strokeOpacity={0.55 + (i % 3) * 0.12} strokeWidth={3 + (i % 3)} className="aq-fall" style={{ animationDelay: `${-(i % 5) * 0.14}s`, animationDuration: `${0.6 + (i % 4) * 0.08}s` }} />
          ))}
          {[100, 150, 200, 240].map((x, i) => (
            <circle key={x} cx={x} cy={590} r={34 + (i % 2) * 14} fill="#ffffff" opacity="0.28" className="aq-mist" style={{ ["--kd" as string]: `${i * 0.5}s` }} />
          ))}
          <ellipse cx="168" cy="596" rx="118" ry="14" fill="#ffffff" opacity="0.55" />
          {[[40, 596], [300, 590]].map(([x, y]) => (
            <path key={x} d={`M${x} ${y} q-14 -50 -2 -96 q18 40 10 96Z`} fill="#3f9a4a" className="aq-kelp" />
          ))}
        </g>
      )}
      {kind === "cave" && !closed && (
        <g>
          {[96, 132, 168, 204, 240].map((x, i) => (
            <path key={x} d={`M${x} 186 q${i % 2 ? 10 : -10} 70 ${i % 2 ? -4 : 6} ${110 + i * 16}`} stroke="#4a3320" strokeWidth={5 + (i % 2) * 2} fill="none" strokeLinecap="round" className="aq-kelp" style={{ ["--kd" as string]: `${i * 0.3}s` }} />
          ))}
          <ellipse cx="168" cy="560" rx="104" ry="26" fill="#b08d57" opacity="0.18" className="aq-glow" />
          {[[120, 520], [210, 480], [170, 420]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#e3cfa0" opacity="0.6" className="aq-glow" style={{ ["--kd" as string]: `${i * 0.7}s` }} />
          ))}
        </g>
      )}
      {kind === "vent" && !closed && (
        <g>
          <path d="M20 230 L58 330 L34 420 M300 250 L270 360 L296 460 M120 100 L160 160" stroke="#38bdf8" strokeWidth="4" fill="none" strokeLinecap="round" className="aq-glow" />
          {[[54, 600], [280, 600], [304, 600]].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x} ${y} q-8 -70 ${i % 2 ? 10 : -10} -150`} stroke="#e8f6ff" strokeWidth="6" fill="none" strokeLinecap="round" className="aq-kelp" />
              <circle cx={x + (i % 2 ? 10 : -10)} cy={y - 152} r="7" fill="#f472b6" className="aq-glow" style={{ ["--kd" as string]: `${i * 0.6}s` }} />
            </g>
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={100 + (i * 37) % 140} cy={250 + (i * 71) % 300} r={2.5 + (i % 3)} fill="#7dd3fc" className="aq-glow" style={{ ["--kd" as string]: `${i * 0.4}s` }} />
          ))}
        </g>
      )}
      {kind === "light" && !closed && (
        <g>
          <rect x="42" y="170" width="28" height="430" fill="#8a6a1f" />
          <rect x="266" y="170" width="28" height="430" fill="#8a6a1f" />
          <path d="M34 182 Q168 120 302 182 V204 Q168 142 34 204Z" fill="#fbbf24" />
          <path d="M120 186 L216 186 L290 600 L46 600Z" fill="#fde68a" opacity="0.22" className="aq-glow" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx={90 + (i * 29) % 160} cy={220 + (i * 53) % 340} r={2 + (i % 3)} fill="#fff7cc" className="aq-glow" style={{ ["--kd" as string]: `${i * 0.3}s` }} />
          ))}
        </g>
      )}
    </svg>
  );
}

function Passage({ side, th, kind, closed, w, h, label, onClick }: { side: "left" | "right"; th: Theme; kind: PassKind; closed: boolean; w: number; h: number; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className="group absolute top-0 block outline-none" style={side === "left" ? { left: 0, width: w, height: h } : { right: 0, width: w, height: h, transform: "scaleX(-1)" }} aria-label={label} data-testid={`room-pass-${side}`}>
      <div className="absolute inset-0 transition-[filter] duration-150 group-hover:brightness-125 group-focus-visible:brightness-125">
        <PassageArt kind={kind} th={th} closed={closed} />
      </div>
    </button>
  );
}

function Arch({ th, w, h, x }: { th: Theme; w: number; h: number; x: number }) {
  const rock = shade(th.trim, -0.2);
  return (
    <svg viewBox="0 0 300 600" preserveAspectRatio="none" className="pointer-events-none absolute top-0" style={{ left: x - w / 2, width: w, height: h }} aria-hidden>
      <path d="M0 600 L18 380 L10 240 L52 120 L96 86 L92 190 L70 330 L74 600Z" fill={rock} />
      <path d="M300 600 L282 400 L292 250 L250 130 L206 90 L210 200 L232 340 L226 600Z" fill={rock} />
      <path d="M52 120 Q150 20 250 130 L206 90 Q150 50 96 86Z" fill={shade(rock, 0.18)} />
      <path d="M18 380 L10 240 L52 120 L36 300Z M282 400 L292 250 L250 130 L264 310Z" fill={shade(rock, 0.25)} opacity="0.5" />
      {[[40, 600], [262, 600], [28, 560]].map(([cx, y], i) => (
        <path key={i} d={`M${cx} ${y} q-14 -90 4 -190 q22 90 6 190Z`} fill={i % 2 ? "#2f7a3a" : "#3f9a4a"} className="aq-kelp" style={{ ["--kd" as string]: `${i * 0.6}s` }} />
      ))}
    </svg>
  );
}

const Backdrop = memo(function Backdrop({ th, w, h }: { th: Theme; w: number; h: number }) {
  const c1 = shade(th.water[1], 0.04);
  const c2 = shade(th.water[1], -0.2);
  return (
    <>
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="pointer-events-none absolute bottom-0 left-0" style={{ width: w, height: h * 0.62, opacity: 0.55 }} aria-hidden>
        <path d="M0 300 V210 Q60 150 120 200 T250 170 T380 210 T520 150 T660 200 T800 160 T1000 200 V300Z" fill={c1} />
        {[80, 330, 590, 870].map((x, i) => (
          <path key={x} d={`M${x} 210 q-10 -80 6 -150 q20 70 4 150Z`} fill={shade(c1, 0.1)} className="aq-kelp" style={{ ["--kd" as string]: `${i * 0.7}s` }} />
        ))}
      </svg>
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="pointer-events-none absolute bottom-0 left-0" style={{ width: w, height: h * 0.4, opacity: 0.8 }} aria-hidden>
        <path d="M0 300 V230 Q80 170 150 220 T300 200 T450 240 T620 190 T780 230 T1000 200 V300Z" fill={c2} />
      </svg>
    </>
  );
});

function Rays({ w, th }: { w: number; th: Theme }) {
  const n = Math.max(4, Math.round(w / 260));
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="aq-ray absolute top-0 h-[78%] [clip-path:polygon(35%_0,65%_0,100%_100%,0_100%)]" style={{ left: (i * w) / n + ((i * 53) % 90), width: 180 + ((i * 37) % 120), background: `linear-gradient(180deg, ${th.water[0]}cc, transparent)`, ["--kd" as string]: `${(i % 5) * 1.3}s` }} />
      ))}
    </div>
  );
}

function Motes({ w, h, n, c }: { w: number; h: number; n: number; c: string }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="aq-mote" style={{ left: (i * 197) % w, top: 40 + ((i * 131) % Math.max(60, h - 120)), width: 3 + (i % 3), height: 3 + (i % 3), background: c, boxShadow: `0 0 8px ${c}`, ["--md" as string]: `${6 + (i % 5) * 1.5}s`, ["--mdl" as string]: `${-(i % 7)}s` } as CSSProperties} />
      ))}
    </div>
  );
}

function BubbleTrail({ x, h, n }: { x: number; h: number; n: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="aq-bub" style={{ left: x + ((i * 17) % 40), bottom: h * 0.1, width: 4 + (i % 3) * 3, height: 4 + (i % 3) * 3, ["--bd" as string]: `${7 + (i % 4)}s`, ["--bdl" as string]: `${-i * 1.1}s` } as CSSProperties} />
      ))}
    </>
  );
}

function Frame({ geo, th }: { geo: Geo; th: Theme }) {
  const { vw, vh, fh, tb } = geo;
  const steel = shade(th.trim, th.dark ? -0.45 : -0.55);
  return (
    <>
      <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <defs>
          <linearGradient id="aq-steel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={shade(steel, 0.12)} />
            <stop offset="1" stopColor={shade(steel, -0.45)} />
          </linearGradient>
        </defs>
        <path d="M0 0 H1000 V38 Q500 78 0 38Z" fill="url(#aq-steel)" />
        <path d="M0 38 Q500 78 1000 38" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="2" fill="none" />
        <path d="M0 0 L110 0 Q30 70 0 230Z M1000 0 L890 0 Q970 70 1000 230Z" fill="url(#aq-steel)" opacity="0.92" />
        <path d="M0 0 L110 0 Q30 70 0 230" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="2" fill="none" />
        <path d="M1000 0 L890 0 Q970 70 1000 230" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="2" fill="none" />
      </svg>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-around" style={{ height: tb }}>
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className="aq-glow mt-[1.4%] h-[26%] w-[3.4%] rounded-full bg-[#fff1b8] shadow-[0_0_22px_rgba(255,236,160,0.9)]" style={{ ["--kd" as string]: `${i * 0.4}s` }} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: fh }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${shade(steel, 0.1)}, ${shade(steel, -0.55)})` }} />
        <div className="aq-caustic absolute inset-0 opacity-50" />
        <div className="absolute inset-x-0 top-0 h-[18%]" style={{ background: `linear-gradient(180deg, ${shade(th.accent, 0.1)}aa, transparent)` }} />
        <div className="absolute inset-x-0 top-0 h-[10px] bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.05))]" />
        <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.35)_0_2px,transparent_2px_96px)]" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="aq-visitor absolute bottom-[12%]" style={{ ["--wd" as string]: `${64 + i * 17}s`, ["--wdl" as string]: `${-i * 23}s` } as CSSProperties}>
            <svg width={fh * 0.34} height={fh * 0.6} viewBox="0 0 20 36" aria-hidden>
              <circle cx="10" cy="6" r="4.4" fill={["#1b2230", "#2a1a22", "#16282a"][i]} />
              <path d="M3 34 Q2 14 10 13 Q18 14 17 34Z" fill={["#1b2230", "#2a1a22", "#16282a"][i]} />
            </svg>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-[10%] left-[18%] h-[130%] w-[7%] rotate-[14deg] bg-gradient-to-b from-white/14 to-transparent" />
        <div className="absolute -top-[10%] left-[27%] h-[130%] w-[2%] rotate-[14deg] bg-white/8" />
        <div className="absolute -top-[10%] left-[68%] h-[130%] w-[10%] rotate-[14deg] bg-gradient-to-b from-white/10 to-transparent" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_46%,transparent_55%,rgba(2,8,22,0.55))]" style={{ width: vw, height: vh }} />
    </>
  );
}

export interface AquaProps {
  room: ResolvedRoom;
  th: Theme;
  gifts: Map<string, Donation>;
  prevName: string;
  nextName: string | null;
  onFish: (sp: Species, sys: ResolvedSystem) => void;
  onZone: (sys: ResolvedSystem) => void;
  onPrev: () => void;
  onNext?: () => void;
}

export default function AquaScene({ room, th, gifts, prevName, nextName, onFish, onZone, onPrev, onNext }: AquaProps) {
  const view = useRef<HTMLDivElement>(null);
  const far = useRef<HTMLDivElement>(null);
  const mid = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLDivElement>(null);
  const floor = useRef<HTMLDivElement>(null);
  const fishNodes = useRef<(HTMLDivElement | null)[]>([]);
  const flipNodes = useRef<(HTMLDivElement | null)[]>([]);
  const cam = useRef({ x: 0, vx: 0, tx: null as number | null });
  const geoRef = useRef<Geo | null>(null);
  const keys = useRef(new Set<string>());
  const drag = useRef({ on: false, moved: false, sx: 0, cx: 0, lx: 0, lt: 0 });
  const [geo, setGeo] = useState<Geo | null>(null);
  const [cur, setCur] = useState(0);
  const curRef = useRef(0);
  const zones = room.systems;
  const nZ = zones.length;

  const fish = useMemo<Fish[]>(() => {
    const out: Fish[] = [];
    zones.forEach((sys, zi) => {
      sys.species.forEach((sp, si) => {
        const small = sp.max_cm <= 20 && sys.species.length > 2;
        const copies = isBig(sp) ? 1 : small ? 3 : sp.max_cm <= 45 ? 2 : 1;
        for (let c = 0; c < copies; c++) {
          const big = isBig(sp);
          out.push({ sp, sys, zi, copy: c, w: 0, bottom: BOTTOM.has(sp.shape), big, depth: big ? 1.1 : [1, 0.82, 1.18][(si + c) % 3], x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, speed: 0, timer: 0, dir: Math.random() < 0.5 ? 1 : -1, seed: Math.random() * 20 });
        }
      });
    });
    return out;
  }, [zones]);

  useEffect(() => {
    const el = view.current;
    if (!el) return;
    const measure = () => {
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      if (!vw || !vh) return;
      const endW = Math.round(clamp(vw * 0.6, 300, 620));
      const zw = Math.max(vw, 760);
      const g: Geo = { vw, vh, fh: Math.round(vh * 0.15), tb: Math.round(vh * 0.075), ks: clamp(vh / 760, 0.65, 1.3), endW, zw, worldW: endW * 2 + nZ * zw };
      const prev = geoRef.current;
      geoRef.current = g;
      if (!prev) cam.current.x = clamp(endW - g.vw * 0.1, 0, g.worldW - g.vw);
      else cam.current.x = clamp((cam.current.x / Math.max(1, prev.worldW - prev.vw)) * (g.worldW - g.vw), 0, g.worldW - g.vw);
      setGeo(g);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const g = geoRef.current;
      if (!g || e.ctrlKey) return;
      cam.current.tx = null;
      cam.current.x = clamp(cam.current.x + (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY), 0, g.worldW - g.vw);
    };
    const gesture = (e: Event) => e.preventDefault();
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("gesturestart", gesture);
    return () => {
      ro.disconnect();
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("gesturestart", gesture);
    };
  }, [nZ]);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (document.querySelector("[data-slot='dialog-content']")) return;
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "a", "d"].includes(k)) {
        e.preventDefault();
        keys.current.add(k);
        cam.current.tx = null;
      }
    };
    const ku = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  useEffect(() => {
    if (!geo) return;
    const water = (f: Fish) => {
      const top = geo.tb + 24;
      const bot = geo.vh - geo.fh - 18;
      const span = bot - top;
      if (f.bottom) return top + span * (0.78 + Math.random() * 0.18);
      if (f.big) return top + span * (0.2 + Math.random() * 0.45);
      return top + span * (0.06 + Math.random() * 0.74);
    };
    const pick = (f: Fish) => {
      const x0 = geo.endW + f.zi * geo.zw;
      const spill = Math.random() < 0.12 ? (Math.random() < 0.5 ? -1 : 1) : 0;
      const zx = x0 + (spill ? (spill < 0 ? -0.18 : 1.18) : 0.06 + Math.random() * 0.88) * geo.zw;
      f.tx = clamp(zx, geo.endW + 60, geo.worldW - geo.endW - 60);
      f.ty = water(f);
      f.timer = 4 + Math.random() * 7;
      f.speed = (f.big ? 38 : 60 + Math.random() * 50) * geo.ks * (f.bottom ? 0.6 : 1);
    };
    fish.forEach((f) => {
      const raw = f.big ? Math.min(300, 100 + Math.sqrt(f.sp.max_cm) * 10) : fishW(f.sp) * 1.3;
      f.w = Math.round(raw * geo.ks * f.depth);
      const x0 = geo.endW + f.zi * geo.zw;
      f.x = x0 + (0.08 + Math.random() * 0.84) * geo.zw;
      f.y = water(f);
      pick(f);
    });
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const c = cam.current;
      const maxX = Math.max(0, geo.worldW - geo.vw);
      const ax = (keys.current.has("arrowright") || keys.current.has("d") ? 1 : 0) - (keys.current.has("arrowleft") || keys.current.has("a") ? 1 : 0);
      if (ax) c.vx += (ax * 900 - c.vx) * Math.min(1, dt * 6);
      if (c.tx !== null && !drag.current.on) {
        c.x += (c.tx - c.x) * Math.min(1, dt * 4.5);
        c.vx = 0;
        if (Math.abs(c.tx - c.x) < 1) c.tx = null;
      } else if (!drag.current.on) {
        c.x += c.vx * dt;
        if (!ax) c.vx *= Math.exp(-4 * dt);
      }
      c.x = clamp(c.x, 0, maxX);
      const place = (el: HTMLDivElement | null, p: number) => {
        if (el) el.style.transform = `translate3d(${-c.x * p}px, 0, 0)`;
      };
      place(far.current, 0.25);
      place(mid.current, 0.55);
      place(main.current, 1);
      if (floor.current) floor.current.style.backgroundPositionX = `${-c.x}px`;
      const center = c.x + geo.vw / 2;
      const zi = clamp(Math.floor((center - geo.endW) / geo.zw), 0, nZ - 1);
      if (zi !== curRef.current) {
        curRef.current = zi;
        setCur(zi);
      }
      fish.forEach((f, i) => {
        const el = fishNodes.current[i];
        if (!el) return;
        f.timer -= dt;
        const dx = f.tx - f.x;
        const dy = f.ty - f.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 40 || f.timer <= 0) {
          const x0 = geo.endW + f.zi * geo.zw;
          const spill = Math.random() < 0.12 ? (Math.random() < 0.5 ? -1 : 1) : 0;
          f.tx = clamp(x0 + (spill ? (spill < 0 ? -0.18 : 1.18) : 0.06 + Math.random() * 0.88) * geo.zw, geo.endW + 60, geo.worldW - geo.endW - 60);
          const top = geo.tb + 24;
          const bot = geo.vh - geo.fh - 18;
          const sp = bot - top;
          f.ty = f.bottom ? top + sp * (0.78 + Math.random() * 0.18) : f.big ? top + sp * (0.2 + Math.random() * 0.45) : top + sp * (0.06 + Math.random() * 0.74);
          f.timer = 4 + Math.random() * 7;
          f.speed = (f.big ? 38 : 60 + Math.random() * 50) * geo.ks * (f.bottom ? 0.6 : 1);
        }
        const d = Math.max(1, dist);
        const beat = 0.8 + 0.2 * Math.sin(now / 1000 * 2 + f.seed);
        const ease = Math.min(1, dt * 1.3);
        f.vx += ((dx / d) * f.speed * beat - f.vx) * ease;
        f.vy += ((dy / d) * f.speed * 0.5 * beat - f.vy) * ease;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        if (Math.abs(f.vx) > 8) {
          const dir: 1 | -1 = f.vx > 0 ? 1 : -1;
          f.dir = dir;
        }
        const pitch = clamp((Math.atan2(f.vy, Math.max(20, Math.abs(f.vx))) * 180) / Math.PI, -22, 22);
        const fl = flipNodes.current[i];
        if (fl) fl.style.transform = `scaleX(${f.dir}) rotate(${pitch.toFixed(1)}deg)`;
        el.style.transform = `translate3d(${f.x - f.w / 2}px, ${f.y - f.w * 0.2 + Math.sin(now / 1000 * 1.6 + f.seed) * 3}px, 0)`;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [geo, fish, nZ]);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-slot='dialog-content'],[data-slot='dialog-overlay'],[data-aq-ui]")) return;
    const g = geoRef.current;
    if (!g) return;
    const d = drag.current;
    const c = cam.current;
    d.on = true;
    d.moved = false;
    d.sx = e.clientX;
    d.cx = c.x;
    d.lx = e.clientX;
    d.lt = performance.now();
    c.vx = 0;
    c.tx = null;
    const move = (ev: PointerEvent) => {
      if (!d.on) return;
      const dx = ev.clientX - d.sx;
      if (!d.moved && Math.abs(dx) > 6) d.moved = true;
      if (!d.moved) return;
      c.x = clamp(d.cx - dx, 0, g.worldW - g.vw);
      const now = performance.now();
      const dtm = Math.max(1, now - d.lt) / 1000;
      c.vx = c.vx * 0.6 + (-(ev.clientX - d.lx) / dtm) * 0.4;
      d.lx = ev.clientX;
      d.lt = now;
    };
    const up = () => {
      d.on = false;
      if (performance.now() - d.lt > 90) c.vx = 0;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const goTo = useCallback(
    (i: number) => {
      const g = geoRef.current;
      if (!g) return;
      cam.current.tx = clamp(g.endW + i * g.zw + g.zw / 2 - g.vw / 2, 0, g.worldW - g.vw);
    },
    [],
  );

  const tune = (fn: () => void) => () => {
    if (drag.current.moved) return;
    fn();
  };

  const kind = KIND[room.def.theme];

  return (
    <div ref={view} className="absolute inset-0 touch-none overflow-hidden select-none" style={{ background: `linear-gradient(180deg, ${th.water[0]}, ${th.water[1]} 78%, ${shade(th.water[1], -0.4)})` }} onPointerDown={onDown} data-testid="aqua-scene">
      {geo && (
        <>
          <div ref={far} className="pointer-events-none absolute top-0 left-0 h-full will-change-transform" style={{ width: (geo.worldW - geo.vw) * 0.25 + geo.vw }}>
            <Rays w={(geo.worldW - geo.vw) * 0.25 + geo.vw} th={th} />
            <Backdrop th={th} w={(geo.worldW - geo.vw) * 0.25 + geo.vw} h={geo.vh} />
          </div>
          <div ref={mid} className="pointer-events-none absolute top-0 left-0 h-full will-change-transform" style={{ width: (geo.worldW - geo.vw) * 0.55 + geo.vw }}>
            <Backdrop th={th} w={(geo.worldW - geo.vw) * 0.55 + geo.vw} h={geo.vh * 1.05} />
            <Motes w={(geo.worldW - geo.vw) * 0.55 + geo.vw} h={geo.vh} n={Math.round(geo.worldW / 140)} c={th.dark ? "#9bd8ff" : "#e8fbff"} />
          </div>
          <div ref={main} className="absolute top-0 left-0 h-full will-change-transform" style={{ width: geo.worldW }}>
            <div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ height: geo.fh * 1.5, background: `linear-gradient(180deg, transparent, ${th.sand}cc 55%, ${shade(th.sand, -0.45)})` }} />
            {zones.map((s, zi) => {
              const x0 = geo.endW + zi * geo.zw;
              const sceneH = geo.vh - geo.fh * 0.45;
              const tile = Math.round(sceneH * 1.5);
              const tiles = Math.max(2, Math.ceil(geo.zw / tile) + 1);
              return (
                <div key={s.id} className="pointer-events-none absolute top-0 overflow-hidden" style={{ left: x0, width: geo.zw, height: geo.vh }}>
                  <div className="absolute inset-x-0 top-0 flex overflow-hidden" style={{ height: sceneH }}>
                    {Array.from({ length: tiles }, (_, i) => (
                      <div key={i} className="relative h-full flex-none" style={{ width: tile, transform: i % 2 ? "scaleX(-1)" : undefined }}>
                        <Scenery kind={s.decor} th={th} />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, transparent, ${s.decor === "ice" ? "rgba(186,230,253,0.16)" : s.decor === "abyss" ? "rgba(76,29,149,0.16)" : s.decor === "koi" ? "rgba(251,146,60,0.1)" : s.decor === "mud" ? "rgba(92,64,28,0.18)" : "rgba(255,255,255,0.05)"} 50%, transparent)` }} />
                  <BubbleTrail x={geo.zw * 0.2} h={geo.vh} n={5} />
                  <BubbleTrail x={geo.zw * 0.66} h={geo.vh} n={4} />
                </div>
              );
            })}
            {zones.slice(1).map((s, i) => (
              <Arch key={s.id} th={th} x={geo.endW + (i + 1) * geo.zw} w={Math.round(geo.vh * 0.55)} h={geo.vh - geo.fh * 0.4} />
            ))}
            <Passage side="left" th={th} kind={kind} closed={false} w={geo.endW} h={geo.vh} label={prevName} onClick={tune(onPrev)} />
            <Passage side="right" th={th} kind={kind} closed={!onNext} w={geo.endW} h={geo.vh} label={nextName ?? "Fine del percorso"} onClick={onNext ? tune(onNext) : undefined} />
            {fish.map((f, i) => {
              const owned = gifts.has(f.sp.id);
              if (f.copy > 0 && !owned) return null;
              return (
                <div key={`${f.sys.id}-${f.sp.id}-${f.copy}`} ref={(el) => { fishNodes.current[i] = el; }} className="absolute top-0 left-0" style={{ width: f.w || 80, zIndex: Math.round(f.depth * 10), opacity: f.depth < 0.9 ? 0.8 : 1, willChange: "transform" }}>
                  <button type="button" onClick={tune(() => onFish(f.sp, f.sys))} className="block w-full cursor-pointer outline-none" aria-label={owned ? (f.sp.name ?? "Pesce") : "Specie sconosciuta"} data-testid={`aq-fish-${f.sp.id}`}>
                    <div ref={(el) => { flipNodes.current[i] = el; }} style={{ transform: `scaleX(${f.dir})` }}>
                      <FishArt shape={f.sp.shape} colors={f.sp.colors} pattern={f.sp.pattern} silhouette={!owned} swim={owned} className="w-full drop-shadow" />
                    </div>
                  </button>
                </div>
              );
            })}
            {Array.from({ length: Math.ceil(geo.worldW / 520) + 1 }, (_, i) => (
              <div key={i} className="pointer-events-none absolute top-0" style={{ left: i * 520 + 140, width: 12, height: geo.vh - geo.fh, zIndex: 40, background: `linear-gradient(90deg, ${shade(th.trim, 0.1)}, ${shade(th.trim, -0.6)} 70%, ${shade(th.trim, -0.4)})`, boxShadow: "0 0 10px rgba(0,0,0,0.35)" }} />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ height: geo.fh }}>
            <div ref={floor} className="absolute inset-0 opacity-40 [background-image:repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0_2px,transparent_2px_130px)]" />
          </div>
          <Frame geo={geo} th={th} />
          <div className="aq-hint pointer-events-none absolute inset-x-0 flex justify-center" style={{ bottom: geo.fh + 14 }}>
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">Trascina per percorrere il tunnel · tocca un pesce per conoscerlo</span>
          </div>
          <div className="absolute inset-x-0 top-12 z-[4] flex justify-center px-2" data-aq-ui>
            <div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-white/15 bg-black/45 p-1 backdrop-blur [scrollbar-width:none]">
              <button type="button" onClick={onPrev} className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-white/85 hover:bg-white/10">
                ← {prevName}
              </button>
              {zones.map((s, i) => (
                <button key={s.id} type="button" onClick={() => (i === cur ? onZone(s) : goTo(i))} className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-white transition-colors" style={{ borderColor: i === cur ? th.accent : "transparent", background: i === cur ? `${th.accent}55` : "transparent" }} data-testid={`aq-zone-${s.id}`}>
                  {s.name} · {s.species.filter((x) => gifts.has(x.id)).length}/{s.species.length}
                </button>
              ))}
              {onNext ? (
                <button type="button" onClick={onNext} className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-white/85 hover:bg-white/10">
                  {nextName} →
                </button>
              ) : (
                <span className="shrink-0 px-2.5 py-1 text-[11px] whitespace-nowrap text-white/45">Fine del percorso</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
