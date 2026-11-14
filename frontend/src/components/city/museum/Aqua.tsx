import { useId, type CSSProperties } from "react";
import type { Donation, Species } from "@/lib/domain/city";
import FishArt from "../fishing/FishArt";
import type { Arch, Decor, ResolvedSystem, Theme, WinShape } from "../shared/rooms";
import "../shared/city.css";

export const BOTTOM = new Set(["anguilla", "siluro"]);
export const LANES = [14, 40, 26, 54, 8, 34, 48, 20];

export function Bubbles({ n, tone = "rgba(255,255,255,0.7)" }: { n: number; tone?: string }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="ct-bubble"
          style={{ left: `${8 + ((i * 37) % 84)}%`, width: 3 + (i % 3) * 3, height: 3 + (i % 3) * 3, borderColor: tone, [`--bd` as string]: `${3.4 + (i % 4) * 0.8}s`, [`--bdelay` as string]: `${i * 0.6}s` } as CSSProperties}
        />
      ))}
    </>
  );
}

export function Motes({ n, color }: { n: number; color: string }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="ct-mote" style={{ left: `${6 + ((i * 29) % 88)}%`, bottom: `${8 + ((i * 17) % 40)}%`, width: 3 + (i % 3), height: 3 + (i % 3), background: color, boxShadow: `0 0 8px ${color}`, [`--bd` as string]: `${4 + (i % 4)}s`, [`--bdelay` as string]: `${i * 0.7}s` } as CSSProperties} />
      ))}
    </>
  );
}

export function Scenery({ kind, th }: { kind: Decor; th: Theme }) {
  const sand = th.sand;
  const base = <path d="M0 176 Q50 166 110 174 T210 170 T300 174 V200 H0Z" fill={sand} />;
  const top = <path d="M0 176 Q50 166 110 174 T210 170 T300 174" fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="2" />;
  const pebbles = [[30, 186, 6], [70, 190, 4], [150, 188, 7], [240, 186, 5], [276, 191, 4]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill="#000000" opacity="0.18" />);
  return (
    <svg viewBox="0 0 300 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
      {(kind === "shoal" || kind === "reeds") &&
        [70, 140, 210].map((x, i) => <polygon key={i} points={`${x},0 ${x + 26},0 ${x + 70},190 ${x - 18},190`} fill="#ffffff" opacity="0.07" className="ct-beam" style={{ animationDelay: `${i}s` }} />)}
      {kind === "abyss" && <rect width="300" height="200" fill="#020617" opacity="0.35" />}
      {base}
      {top}
      {pebbles}
      {kind === "reeds" && (
        <g>
          {[18, 30, 44, 252, 268, 282].map((x, i) => (
            <path key={i} d={`M${x} 180 Q${x + (i % 2 ? 8 : -8)} ${110 - (i % 3) * 14} ${x + (i % 2 ? 3 : -3)} ${50 + (i % 3) * 12}`} stroke={i % 2 ? "#3f9a4a" : "#2f7a3a"} strokeWidth="3.2" fill="none" strokeLinecap="round" />
          ))}
          <path d="M120 180 q-8 -34 4 -62 q10 30 6 62Z M136 180 q10 -28 0 -50 q-12 26 0 50Z" fill="#3fb36a" opacity="0.9" />
          {[[88, 14], [168, 10], [226, 16]].map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx="22" ry="5" fill="#3f9a4a" />
              <circle cx={x + 6} cy={y - 4} r="4" fill="#f9a8d4" />
            </g>
          ))}
        </g>
      )}
      {kind === "shoal" && (
        <g>
          {[24, 60, 232, 270].map((x, i) => (
            <path key={i} d={`M${x} 180 q-10 -30 0 -60 q4 20 12 30 q-2 14 -4 30Z`} fill={i % 2 ? "#2f9a56" : "#3fb36a"} opacity="0.92" />
          ))}
          <path d="M120 182 q14 -20 4 -44 q18 14 10 44Z" fill="#7bd88f" opacity="0.8" />
          <ellipse cx="170" cy="182" rx="22" ry="7" fill="#8c8f98" />
          <ellipse cx="166" cy="179" rx="10" ry="3" fill="#ffffff" opacity="0.2" />
        </g>
      )}
      {kind === "mud" && (
        <g>
          <rect x="30" y="148" width="120" height="26" rx="13" fill="#5b4328" />
          <ellipse cx="34" cy="161" rx="7" ry="13" fill="#7a5a36" />
          <path d="M60 150 h60 M72 158 h56 M52 166 h70" stroke="#000000" strokeOpacity="0.25" strokeWidth="1.5" />
          {[190, 232, 268].map((x, i) => (
            <g key={x}>
              <ellipse cx={x} cy={176 - (i % 2) * 2} rx="20" ry="9" fill="#6e5636" />
              <ellipse cx={x} cy={174 - (i % 2) * 2} rx="11" ry="5" fill="#16110a" />
            </g>
          ))}
          <path d="M150 176 q10 -38 30 -34 q-14 8 -18 34Z" fill="#9b7a4a" opacity="0.9" />
          <path d="M10 180 q20 -50 6 -80 M18 180 q30 -30 24 -64" stroke="#6b5230" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
      {kind === "stream" && (
        <g>
          {[[40, 168, 28, "#8a929a"], [100, 176, 20, "#a1a8ae"], [236, 170, 30, "#7b838b"], [276, 180, 18, "#9aa1a8"]].map(([x, y, r, c], i) => (
            <g key={i}>
              <ellipse cx={x as number} cy={y as number} rx={r as number} ry={(r as number) * 0.7} fill={c as string} />
              <ellipse cx={(x as number) - 6} cy={(y as number) - 6} rx={(r as number) * 0.5} ry={(r as number) * 0.3} fill="#ffffff" opacity="0.22" />
            </g>
          ))}
          {[40, 80, 120, 150].map((y, i) => (
            <path key={i} d={`M-10 ${y} q40 -14 80 0 t80 0 t80 0 t80 0`} stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" fill="none" className="ct-flow" style={{ animationDelay: `${-i * 0.6}s` }} />
          ))}
          <path d="M150 178 q10 -20 22 -4Z" fill="#3a7a3f" />
        </g>
      )}
      {kind === "predator" && (
        <g>
          <path d="M-5 178 L120 120 L130 128 L10 190Z" fill="#4a3822" />
          <path d="M80 140 L110 96 M100 132 L148 100 M60 152 L52 114" stroke="#4a3822" strokeWidth="6" strokeLinecap="round" />
          <path d="M120 124 l14 -6" stroke="#6e5232" strokeWidth="3" />
          {[190, 214, 240, 266].map((x, i) => (
            <path key={x} d={`M${x} 180 q${i % 2 ? 10 : -10} -40 ${i % 2 ? -2 : 4} -${70 + i * 8}`} stroke="#1f5a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
          ))}
          <ellipse cx="160" cy="184" rx="26" ry="9" fill="#4a5a52" />
        </g>
      )}
      {kind === "koi" && (
        <g>
          {[[50, 176, 22], [100, 180, 14], [214, 178, 20]].map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.5} fill="#b8b2a4" />
          ))}
          {[[70, 14], [150, 10], [236, 16]].map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx="22" ry="5" fill="#3f9a4a" />
              <path d={`M${x + 4} ${y - 2} l4 -9 l4 9 l-8 0Z`} fill="#f9a8d4" />
            </g>
          ))}
          {[262, 276, 288].map((x, i) => (
            <g key={x}>
              <rect x={x} y={20 + i * 8} width="5" height={160 - i * 8} fill="#7fa650" />
              <rect x={x - 1} y={70 + i * 6} width="7" height="2.5" fill="#4d6e2e" />
              <rect x={x - 1} y={120} width="7" height="2.5" fill="#4d6e2e" />
            </g>
          ))}
          <path d="M20 160 q40 -50 80 0" stroke="#c4302b" strokeWidth="5" fill="none" opacity="0.65" />
        </g>
      )}
      {kind === "coral" && (
        <g>
          <path d="M50 180 q-4 -40 -22 -60 M50 180 q4 -30 20 -50 M50 180 q-2 -20 0 -40" stroke="#f43f5e" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M120 180 q-14 -20 -6 -48 q16 12 20 48Z M150 180 q10 -40 34 -52 q2 28 -10 52Z" fill="#fb923c" />
          <path d="M210 180 q0 -50 -24 -64 M210 180 q10 -44 36 -54 M210 180 q24 -20 44 -22" stroke="#e879f9" strokeWidth="5" fill="none" strokeLinecap="round" />
          {[240, 258, 272].map((x, i) => (
            <circle key={x} cx={x} cy={170 + (i % 2) * 6} r="7" fill="#fbbf24" opacity="0.9" />
          ))}
          <path d="M96 182 q10 -8 20 0 q-10 6 -20 0Z" fill="#fde68a" />
        </g>
      )}
      {kind === "ice" && (
        <g>
          {[[30, 60], [70, 90], [220, 50], [262, 84], [156, 104]].map(([x, h], i) => (
            <g key={i}>
              <polygon points={`${x},180 ${x + 12},${180 - h} ${x + 26},180`} fill="#bae6fd" opacity="0.85" />
              <polygon points={`${x + 12},${180 - h} ${x + 26},180 ${x + 14},180`} fill="#ffffff" opacity="0.35" />
            </g>
          ))}
          <path d="M0 40 L300 70 M0 110 L300 90" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1" />
        </g>
      )}
      {kind === "abyss" && (
        <g>
          {[[34, 100, "#22d3ee"], [88, 70, "#a78bfa"], [150, 120, "#38bdf8"], [218, 80, "#34d399"], [262, 112, "#f0abfc"]].map(([x, h, c], i) => (
            <g key={i}>
              <path d={`M${x} 180 q${i % 2 ? 8 : -8} -${(h as number) / 2} 0 -${h}`} stroke={c as string} strokeOpacity="0.6" strokeWidth="2.5" fill="none" />
              <circle cx={x as number} cy={180 - (h as number)} r="6" fill={c as string} className="ct-glow" style={{ animationDelay: `${i * 0.5}s` }} />
              <circle cx={x as number} cy={180 - (h as number)} r="14" fill={c as string} opacity="0.18" />
            </g>
          ))}
        </g>
      )}
      {kind === "shrine" && (
        <g>
          <circle cx="150" cy="60" r="34" fill="#fef3c7" opacity="0.25" className="ct-glow" />
          {[40, 250].map((x) => (
            <rect key={x} x={x} y="30" width="14" height="150" fill="#c4b5fd" opacity="0.35" />
          ))}
        </g>
      )}
    </svg>
  );
}

export function Backdrop({ kind }: { kind: Decor }) {
  if (kind === "coral" || kind === "ice" || kind === "abyss" || kind === "shrine") return null;
  const moss = kind === "koi" ? "#7d8a72" : "#5f7a4a";
  return (
    <svg viewBox="0 0 300 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
      <path d="M0 200 V96 Q16 56 54 64 Q80 40 112 74 Q128 92 124 200Z" fill={kind === "koi" ? "#a9a493" : "#46564c"} />
      <path d="M0 96 Q16 56 54 64 Q80 40 112 74 Q104 70 90 66 Q70 56 54 72 Q22 66 0 104Z" fill={moss} />
      <path d="M60 200 V120 Q74 98 96 112 L110 200Z" fill="#ffffff" opacity="0.06" />
      <path d="M300 200 V80 Q286 44 252 52 Q226 34 200 70 Q188 92 192 200Z" fill={kind === "koi" ? "#b3ae9d" : "#4f5f55"} />
      <path d="M300 80 Q286 44 252 52 Q226 34 200 70 Q214 64 232 62 Q262 56 280 76Z" fill={moss} />
      {kind === "stream" && (
        <g>
          <rect x="236" y="48" width="18" height="86" fill="#e8f7ff" opacity="0.5" />
          {[240, 245, 250].map((x, i) => (
            <path key={x} d={`M${x} 48 V134`} stroke="#ffffff" strokeWidth="2" opacity="0.7" strokeDasharray="10 24" className="ct-flow" style={{ animationDelay: `${-i * 0.4}s`, animationDuration: "1.1s" }} />
          ))}
          <ellipse cx="245" cy="136" rx="22" ry="6" fill="#ffffff" opacity="0.4" />
        </g>
      )}
    </svg>
  );
}

export function fishW(s: Species, k = 1) {
  return Math.round(Math.min(112, 36 + Math.sqrt(s.max_cm) * 4.6) * k);
}

export function TankView({ t, th, gifts, base, pw, ph, onOpen }: { t: ResolvedSystem; th: Theme; gifts: Map<string, Donation>; base: number; pw: number; ph: number; onOpen: () => void }) {
  const got = t.species.filter((s) => gifts.has(s.id)).length;
  const big = !!t.big;
  const water: [string, string] = big ? ["#2a6fb8", "#050f2a"] : th.water;
  const sc = ph / 230;
  const bw = Math.max(5, Math.round(ph * 0.03));
  const tile = Math.round(ph * 1.5);
  const tiles = Math.max(2, Math.ceil(pw / tile) + 1);
  const swimmers: { s: Species; k: number; lane: number; owned: boolean }[] = [];
  t.species.forEach((s, i) => {
    const owned = gifts.has(s.id);
    const n = !big && owned && s.max_cm <= 20 && t.species.length > 2 ? 2 : 1;
    for (let c = 0; c < n; c++) swimmers.push({ s, k: c ? 0.72 : 1, lane: big ? 14 + (i % 3) * 16 + c * 6 : BOTTOM.has(s.shape) ? 58 + c * 4 : LANES[(i + c * 3) % LANES.length], owned });
  });
  return (
    <button type="button" onClick={onOpen} className="group relative block outline-none" style={{ width: pw, height: ph }} data-testid={`room-tank-${t.id}`} aria-label={t.name}>
      <div className="absolute inset-0 overflow-hidden transition-[filter] duration-150 group-hover:brightness-110 group-focus-visible:brightness-110" style={{ borderRadius: ph * 0.1, border: `${bw}px solid #2c3a40`, boxShadow: `0 0 ${ph * 0.12}px ${water[0]}66, inset 0 0 ${ph * 0.2}px rgba(0,10,30,0.5)`, background: `linear-gradient(180deg, ${water[0]}, ${water[1]})` }}>
        {[10, 38, 64].map((x, i) => (
          <div key={x} className="ct-beam pointer-events-none absolute top-0 h-full bg-gradient-to-b from-white/22 to-transparent [clip-path:polygon(30%_0,70%_0,100%_100%,0_100%)]" style={{ left: `${x}%`, width: "26%", animationDelay: `${i * 1.3}s` }} />
        ))}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex" style={{ width: tile * 0.8 }}>
          <div className="relative h-full w-full">
            <Backdrop kind={t.decor} />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex" style={{ width: tile * 0.8, transform: "scaleX(-1)" }}>
          <div className="relative h-full w-full">
            <Backdrop kind={t.decor} />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 flex overflow-hidden">
          {Array.from({ length: tiles }, (_, i) => (
            <div key={i} className="relative h-full flex-none" style={{ width: tile, transform: i % 2 ? "scaleX(-1)" : undefined }}>
              <Scenery kind={t.decor} th={th} />
            </div>
          ))}
        </div>
        <Bubbles n={5 + got * 2} />
        {t.decor === "abyss" && <Motes n={12} color="#7dd3fc" />}
        {t.decor === "ice" && <Motes n={8} color="#e0f2fe" />}
        {t.decor === "shrine" && <Motes n={12} color="#fde68a" />}
        {swimmers.map((w, idx) => {
          const raw = big ? Math.min(230, 90 + Math.sqrt(w.s.max_cm) * 9) : fishW(w.s, w.k) * 1.15;
          const fw = Math.round(Math.min(pw * 0.42, raw * sc));
          const dur = (big ? 18 : 9) + ((idx * 1.7) % 6) + fw / 60;
          const style = { [`--fw` as string]: `${fw}px`, [`--travel` as string]: `${Math.max(10, pw - 2 * bw - fw - 8)}px`, [`--dur` as string]: `${dur}s`, [`--delay` as string]: `${-((base + idx) % 9) * 1.3}s`, top: `${w.lane}%`, opacity: w.owned ? 1 : 0.55 } as CSSProperties;
          return (
            <div key={`${w.s.id}${idx}`} className="ct-swim" style={style}>
              <div className="ct-bob" style={{ [`--bobd` as string]: `${2.6 + (idx % 4) * 0.5}s`, animationDelay: `${-(idx % 5)}s` } as CSSProperties}>
                <div className="ct-flip" style={style}>
                  <FishArt shape={w.s.shape} colors={w.s.colors} pattern={w.s.pattern} silhouette={!w.owned} swim={w.owned} className="w-full drop-shadow" />
                </div>
              </div>
            </div>
          );
        })}
        {got === 0 && <div className="absolute inset-0 grid place-items-center font-bold text-white/25" style={{ fontSize: ph * 0.3 }}>?</div>}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[8%] bg-gradient-to-b from-white/35 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-[8%] w-[10%] -skew-x-12 bg-gradient-to-r from-white/14 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-[22%] w-[2%] -skew-x-12 bg-white/8" />
      </div>
    </button>
  );
}

export interface LWin {
  x: number;
  y: number;
  w: number;
  h: number;
  shape: WinShape;
}

export interface LTun {
  x1: number;
  x2: number;
  y: number;
  h: number;
}

const rr = (x: number, y: number, w: number, h: number, r: number) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
const archP = (x: number, y: number, w: number, h: number) => {
  const r = Math.min(w / 2, h);
  return `M${x} ${y + h}V${y + r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h}Z`;
};
const ellP = (x: number, y: number, w: number, h: number) => {
  const rx = w / 2;
  const ry = h / 2;
  const cy = y + ry;
  return `M${x} ${cy}A${rx} ${ry} 0 1 1 ${x + w} ${cy}A${rx} ${ry} 0 1 1 ${x} ${cy}Z`;
};

function winPath(w: LWin, pw: number, ph: number) {
  const x = (w.x / 100) * pw;
  const y = (w.y / 100) * ph;
  const ww = (w.w / 100) * pw;
  const hh = (w.h / 100) * ph;
  if (w.shape === "arch") return archP(x, y, ww, hh);
  if (w.shape === "round") return ellP(x, y, ww, hh);
  return rr(x, y, ww, hh, Math.min(ww, hh) * 0.08);
}

function tunPath(t: LTun, pw: number, ph: number) {
  const x = (t.x1 / 100) * pw;
  const y = (t.y / 100) * ph;
  return rr(x, y, ((t.x2 - t.x1) / 100) * pw, (t.h / 100) * ph, 0);
}

function Column({ cx, y0, y1, cw, style, th, id }: { cx: number; y0: number; y1: number; cw: number; style: Arch; th: Theme; id: string }) {
  const x = cx - cw / 2;
  const hgt = y1 - y0;
  if (style === "rock") {
    const pts = Array.from({ length: 12 }, (_, i) => {
      const t = i / 11;
      const j = ((i * 53) % 7) / 7;
      return `${x + (i % 2 ? cw * (0.85 + j * 0.2) : cw * (0.05 - j * 0.1))},${y0 + t * hgt}`;
    });
    const back = Array.from({ length: 12 }, (_, i) => {
      const t = 1 - i / 11;
      const j = ((i * 31) % 5) / 5;
      return `${x + (i % 2 ? cw * (0.1 - j * 0.12) : cw * (0.9 + j * 0.16))},${y0 + t * hgt}`;
    });
    return (
      <g>
        <polygon points={[...pts, ...back].join(" ")} fill="#4b5a50" />
        <polygon points={[...pts.slice(0, 6), `${x + cw * 0.5},${y0 + hgt * 0.5}`].join(" ")} fill="#5f7a4a" opacity="0.8" />
        <path d={`M${x + cw * 0.3} ${y0} V${y1}`} stroke="#ffffff" strokeOpacity="0.12" strokeWidth={cw * 0.08} />
      </g>
    );
  }
  const body: Record<string, string> = { stone: "#e6e0d0", timber: th.trim, lacquer: "#c4302b", steel: "#2c3a4a", gold: "#3a2d6a" };
  const cap: Record<string, string> = { stone: "#cfc8b4", timber: "#3f2a16", lacquer: "#e3b341", steel: "#38bdf8", gold: "#fbbf24" };
  const b = body[style] ?? "#e6e0d0";
  const c = cap[style] ?? "#cfc8b4";
  return (
    <g>
      <rect x={x} y={y0} width={cw} height={hgt} fill={`url(#${id}-col)`} />
      <rect x={x - cw * 0.14} y={y0} width={cw * 1.28} height={hgt * 0.05} rx={cw * 0.06} fill={c} />
      <rect x={x - cw * 0.08} y={y0 + hgt * 0.05} width={cw * 1.16} height={hgt * 0.02} fill={c} opacity="0.8" />
      <rect x={x - cw * 0.14} y={y1 - hgt * 0.05} width={cw * 1.28} height={hgt * 0.05} rx={cw * 0.06} fill={c} />
      {style === "stone" && [0.28, 0.44, 0.6, 0.76].map((f) => <rect key={f} x={x + cw * f} y={y0 + hgt * 0.07} width={cw * 0.04} height={hgt * 0.86} fill="#000000" opacity="0.08" />)}
      {style === "timber" && [0.2, 0.4, 0.6, 0.8].map((f) => <path key={f} d={`M${x} ${y0 + hgt * f} L${x + cw} ${y0 + hgt * (f + 0.1)}`} stroke="#000000" strokeOpacity="0.3" strokeWidth={cw * 0.06} />)}
      {style === "lacquer" && [0.25, 0.5, 0.75].map((f) => <rect key={f} x={x} y={y0 + hgt * f} width={cw} height={hgt * 0.014} fill={c} />)}
      {style === "steel" && <rect x={x + cw * 0.44} y={y0 + hgt * 0.08} width={cw * 0.12} height={hgt * 0.84} fill={c} opacity="0.85" className="ct-glow" />}
      {style === "gold" && [0.2, 0.5, 0.8].map((f) => <rect key={f} x={x} y={y0 + hgt * f} width={cw} height={hgt * 0.02} fill={c} />)}
      <rect x={x + cw * 0.08} y={y0 + hgt * 0.07} width={cw * 0.12} height={hgt * 0.86} fill="#ffffff" opacity="0.14" />
      <circle cx={cx} cy={y0 - hgt * 0.02} r={cw * 0.12} fill={b} opacity="0" />
    </g>
  );
}

export function WaterWall({ sys, wins, tuns, pw, ph, th, gifts, base, wallStyle, glass = false, style }: { sys: ResolvedSystem; wins: LWin[]; tuns: LTun[]; pw: number; ph: number; th: Theme; gifts: Map<string, Donation>; base: number; wallStyle: CSSProperties; glass?: boolean; style: Arch }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const big = !!sys.big;
  const water: [string, string] = big ? ["#2a6fb8", "#050f2a"] : th.water;
  const top = Math.min(...wins.map((w) => w.y), ...tuns.map((t) => t.y));
  const bot = Math.max(...wins.map((w) => w.y + w.h), ...tuns.map((t) => t.y + t.h));
  const boxTop = (top / 100) * ph;
  const boxH = ((bot - top) / 100) * ph;
  const sc = boxH / 230;
  const tile = Math.round(boxH * 1.5);
  const tiles = Math.max(2, Math.ceil(pw / tile) + 1);
  const got = sys.species.filter((s) => gifts.has(s.id)).length;
  const swimmers: { key: string; s: Species; fw: number; lane: number; owned: boolean }[] = [];
  sys.species.forEach((s, i) => {
    const owned = gifts.has(s.id);
    const raw = big ? Math.min(260, 100 + Math.sqrt(s.max_cm) * 9) : fishW(s, 1) * 1.15;
    const fw = Math.round(Math.min(pw * 0.22, raw * sc));
    const clones = !big && owned && s.max_cm <= 20 && sys.species.length > 2 ? 2 : 1;
    for (let c = 0; c < clones; c++) {
      const f = c ? Math.round(fw * 0.72) : fw;
      const lane = BOTTOM.has(s.shape) ? 60 : 4 + ((i * 29 + c * 41) % 52);
      swimmers.push({ key: `${s.id}${c}`, s, fw: f, lane, owned });
    }
  });
  tuns.forEach((t, k) => {
    const s = sys.species[k % sys.species.length];
    const owned = gifts.has(s.id);
    const tunPx = (t.h / 100) * ph;
    const fw = Math.round(Math.min(tunPx * 2.2, fishW(s, 1) * sc * 1.1, pw * 0.15));
    const center = ((t.y + t.h / 2 - top) / (bot - top)) * 100;
    swimmers.push({ key: `t${k}`, s, fw, lane: center - ((fw * 0.25) / boxH) * 100, owned });
  });
  const holes = [...wins.map((w) => winPath(w, pw, ph)), ...tuns.map((t) => tunPath(t, pw, ph))];
  const clip = `path(evenodd, "M0 0H${pw}V${ph}H0Z ${holes.join(" ")}")`;
  const sorted = [...wins].sort((a, b) => a.x - b.x);
  const gaps: { l: number; r: number }[] = [];
  gaps.push({ l: 0, r: sorted[0].x });
  for (let i = 0; i < sorted.length - 1; i++) gaps.push({ l: sorted[i].x + sorted[i].w, r: sorted[i + 1].x });
  gaps.push({ l: sorted[sorted.length - 1].x + sorted[sorted.length - 1].w, r: 100 });
  const trim = th.trim;
  const steel = "#9fb4bb";
  const sw = Math.max(4, ph * 0.012);
  const yTop = (top / 100) * ph;
  const yBot = (bot / 100) * ph;
  const colTop = Math.max(0, yTop - ph * 0.04);
  return (
    <div className="absolute inset-0">
      <div className="absolute overflow-hidden" style={{ left: 0, top: boxTop, width: pw, height: boxH, background: `linear-gradient(180deg, ${water[0]}, ${water[1]})` }}>
        {[8, 30, 52, 74].map((x, i) => (
          <div key={x} className="ct-beam pointer-events-none absolute top-0 h-full bg-gradient-to-b from-white/22 to-transparent [clip-path:polygon(30%_0,70%_0,100%_100%,0_100%)]" style={{ left: `${x}%`, width: "20%", animationDelay: `${i * 1.3}s` }} />
        ))}
        <div className="pointer-events-none absolute inset-y-0 left-0" style={{ width: tile * 0.8 }}>
          <div className="relative h-full w-full">
            <Backdrop kind={sys.decor} />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0" style={{ width: tile * 0.8, transform: "scaleX(-1)" }}>
          <div className="relative h-full w-full">
            <Backdrop kind={sys.decor} />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 flex overflow-hidden">
          {Array.from({ length: tiles }, (_, i) => (
            <div key={i} className="relative h-full flex-none" style={{ width: tile, transform: i % 2 ? "scaleX(-1)" : undefined }}>
              <Scenery kind={sys.decor} th={th} />
            </div>
          ))}
        </div>
        <Bubbles n={8 + got * 2} />
        {sys.decor === "abyss" && <Motes n={16} color="#7dd3fc" />}
        {sys.decor === "ice" && <Motes n={10} color="#e0f2fe" />}
        {sys.decor === "shrine" && <Motes n={16} color="#fde68a" />}
        {swimmers.map((w, idx) => {
          const travel = Math.max(10, pw - w.fw - 8);
          const dur = Math.max(18, travel / (34 + (idx % 4) * 9));
          const st = { [`--fw` as string]: `${w.fw}px`, [`--travel` as string]: `${travel}px`, [`--dur` as string]: `${dur}s`, [`--delay` as string]: `${-(((base + idx) * 13.7) % dur)}s`, top: `${w.lane}%`, opacity: w.owned ? 1 : 0.55 } as CSSProperties;
          return (
            <div key={w.key} className="ct-swim" style={st}>
              <div className="ct-bob" style={{ [`--bobd` as string]: `${2.6 + (idx % 4) * 0.5}s`, animationDelay: `${-(idx % 5)}s` } as CSSProperties}>
                <div className="ct-flip" style={st}>
                  <FishArt shape={w.s.shape} colors={w.s.colors} pattern={w.s.pattern} silhouette={!w.owned} swim={w.owned} className="w-full drop-shadow" />
                </div>
              </div>
            </div>
          );
        })}
        {got === 0 && <div className="absolute inset-0 grid place-items-center font-bold text-white/25" style={{ fontSize: boxH * 0.3 }}>?</div>}
      </div>
      <div className="absolute inset-0" style={{ ...wallStyle, clipPath: clip }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/30" />
      </div>
      <svg viewBox={`0 0 ${pw} ${ph}`} className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <defs>
          <linearGradient id={`${uid}-col`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000000" stopOpacity="0.28" />
            <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.38" />
          </linearGradient>
          <linearGradient id={`${uid}-gl`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {!glass &&
          gaps.map((g, i) => {
            const gw = ((g.r - g.l) / 100) * pw;
            if (gw < 10) return null;
            const cw = Math.min(gw * 0.86, ph * 0.12);
            const cx = ((g.l + g.r) / 200) * pw;
            return <Column key={i} id={uid} cx={cx} y0={colTop} y1={yBot + ph * 0.03} cw={cw} style={style} th={th} />;
          })}
        {!glass && (
          <g>
            <rect x="0" y={colTop - ph * 0.045} width={pw} height={ph * 0.045} fill={trim} />
            <rect x="0" y={colTop - ph * 0.045} width={pw} height={ph * 0.008} fill="#ffffff" opacity="0.2" />
            <rect x="0" y={colTop} width={pw} height={ph * 0.012} fill="#000000" opacity="0.3" />
            {style === "stone" && Array.from({ length: Math.ceil(pw / 30) }, (_, i) => <rect key={i} x={i * 30 + 6} y={colTop + ph * 0.012} width="12" height={ph * 0.014} fill="#ffffff" opacity="0.2" />)}
            <rect x="0" y={yBot + ph * 0.03} width={pw} height={ph * 0.03} fill={trim} />
            <rect x="0" y={yBot + ph * 0.03} width={pw} height={ph * 0.006} fill="#ffffff" opacity="0.2" />
          </g>
        )}
        {wins.map((w, i) => {
          const d = winPath(w, pw, ph);
          return (
            <g key={i}>
              <path d={d} fill={`url(#${uid}-gl)`} />
              <path d={d} fill="none" stroke={glass ? steel : trim} strokeWidth={sw} strokeLinejoin="round" />
              <path d={d} fill="none" stroke={th.accent} strokeWidth="2" opacity="0.55" transform={`translate(0 0)`} />
              {w.shape === "arch" && <path d={`M${((w.x + w.w / 2) / 100) * pw - sw * 2} ${(w.y / 100) * ph - sw} l${sw * 4} 0 l${-sw} ${sw * 3} h${-sw * 2}Z`} fill={th.plaque} />}
              {glass && (
                <g stroke={steel} strokeWidth="3" opacity="0.8">
                  {[1, 2, 3].map((k) => (
                    <path key={k} d={`M${((w.x + (w.w * k) / 4) / 100) * pw} ${(w.y / 100) * ph}V${((w.y + w.h) / 100) * ph}`} />
                  ))}
                  <path d={`M${(w.x / 100) * pw} ${((w.y + w.h / 2) / 100) * ph}H${((w.x + w.w) / 100) * pw}`} />
                </g>
              )}
            </g>
          );
        })}
        {tuns.map((t, i) => {
          const x = (t.x1 / 100) * pw;
          const y = (t.y / 100) * ph;
          const w = ((t.x2 - t.x1) / 100) * pw;
          const h = (t.h / 100) * ph;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill={`url(#${uid}-gl)`} />
              <rect x={x - 3} y={y - 5} width={w + 6} height="7" rx="3" fill={steel} />
              <rect x={x - 3} y={y + h - 2} width={w + 6} height="7" rx="3" fill={steel} />
              {Array.from({ length: Math.max(1, Math.floor(w / 26)) }, (_, k) => (
                <rect key={k} x={x + 10 + k * 26} y={y - 5} width="6" height={h + 10} rx="2" fill="#2c3a40" opacity="0.8" />
              ))}
              <path d={`M${x} ${y + h * 0.22}H${x + w}`} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
