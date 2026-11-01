import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, DoorOpen, Package } from "lucide-react";
import type { CityState, Donation, Species } from "@/lib/city";
import { RARITY } from "@/components/pets/rarity";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FishArt from "./FishArt";
import { RarityTag, fmtWhen } from "./Bucket";
import { THEMES, buildRooms, isBig, type Decor, type Prop, type ResolvedItem, type ResolvedRoom, type Theme } from "./rooms";
import "./city.css";

type TankItem = Extract<ResolvedItem, { k: "tank" }>;
type Sel = { tank: TankItem | null; sp: Species | null };

const BOTTOM = new Set(["anguilla", "siluro"]);
const LANES = [14, 40, 26, 54, 8, 34, 48, 20];

function Bubbles({ n, tone = "rgba(255,255,255,0.7)" }: { n: number; tone?: string }) {
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

function Motes({ n, color }: { n: number; color: string }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="ct-mote" style={{ left: `${6 + ((i * 29) % 88)}%`, bottom: `${8 + ((i * 17) % 40)}%`, width: 3 + (i % 3), height: 3 + (i % 3), background: color, boxShadow: `0 0 8px ${color}`, [`--bd` as string]: `${4 + (i % 4)}s`, [`--bdelay` as string]: `${i * 0.7}s` } as CSSProperties} />
      ))}
    </>
  );
}

function Scenery({ kind, th }: { kind: Decor; th: Theme }) {
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

function fishW(s: Species, k = 1) {
  return Math.round(Math.min(112, 36 + Math.sqrt(s.max_cm) * 4.6) * k);
}

function Tank({ item, th, gifts, base, onOpen }: { item: TankItem; th: Theme; gifts: Map<string, Donation>; base: number; onOpen: () => void }) {
  const TW = 320;
  const got = item.species.filter((s) => gifts.has(s.id)).length;
  const swimmers: { s: Species; k: number; i: number; lane: number; owned: boolean }[] = [];
  item.species.forEach((s, i) => {
    const owned = gifts.has(s.id);
    const n = owned && s.max_cm <= 20 && item.species.length > 2 ? 2 : 1;
    for (let c = 0; c < n; c++) swimmers.push({ s, k: c ? 0.72 : 1, i: i + c * 3, lane: BOTTOM.has(s.shape) ? 58 + c * 4 : LANES[(i + c * 3) % LANES.length], owned });
  });
  return (
    <button type="button" onClick={onOpen} className="group relative flex w-[340px] shrink-0 flex-col items-stretch outline-none" data-testid={`room-tank-${item.id}`} aria-label={item.name}>
      <div className="mx-4 h-2.5 rounded-t-md border-x-2 border-t-2 border-black/30 bg-gradient-to-b from-[#fff7cf] to-[#d9c47a] shadow-[0_8px_24px_rgba(255,236,160,0.45)]" />
      <div className="relative h-[min(34dvh,230px)] overflow-hidden rounded-t-lg border-[6px] shadow-2xl transition-transform duration-150 group-hover:scale-[1.015] group-focus-visible:scale-[1.015]" style={{ borderColor: "#aeb9c5", background: `linear-gradient(180deg, ${th.water[0]}, ${th.water[1]})` }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.4),transparent_62%)]" />
        <Scenery kind={item.decor} th={th} />
        <Bubbles n={5 + got} />
        {item.decor === "abyss" && <Motes n={9} color="#7dd3fc" />}
        {item.decor === "ice" && <Motes n={7} color="#e0f2fe" />}
        {swimmers.map((w, idx) => {
          const fw = fishW(w.s, w.k);
          const dur = 8 + ((idx * 1.7) % 6) + fw / 40;
          const style = { [`--fw` as string]: `${fw}px`, [`--travel` as string]: `${TW - 12 - fw - 6}px`, [`--dur` as string]: `${dur}s`, [`--delay` as string]: `${-((base + idx) % 9) * 1.3}s`, top: `${w.lane}%`, opacity: w.owned ? 1 : 0.55 } as CSSProperties;
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
        {got === 0 && <div className="absolute inset-0 grid place-items-center text-5xl font-bold text-white/25">?</div>}
        <div className="pointer-events-none absolute inset-y-0 left-[10%] w-[14%] -skew-x-12 bg-gradient-to-r from-white/18 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-[30%] w-[4%] -skew-x-12 bg-white/10" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
      <div className="rounded-b-md border-x-[6px] border-b-[6px] px-3 py-2 text-left" style={{ borderColor: th.trim, background: `linear-gradient(180deg, ${th.trim}, #00000066)` }}>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold" style={{ color: th.plaque }}>
            {item.name}
          </p>
          <span className="shrink-0 rounded bg-black/30 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white/90">
            {got}/{item.species.length}
          </span>
        </div>
        <p className="truncate text-[10px] text-white/70">{item.note}</p>
        <div className="mt-1.5 flex gap-1">
          {item.species.map((s) => (
            <span key={s.id} className="size-2 rounded-full border border-black/30" style={{ background: gifts.has(s.id) ? RARITY[s.rarity].color : "transparent", boxShadow: gifts.has(s.id) ? `0 0 6px ${RARITY[s.rarity].color}` : "none", borderColor: gifts.has(s.id) ? "transparent" : "rgba(255,255,255,0.35)" }} />
          ))}
        </div>
      </div>
    </button>
  );
}

function Hung({ s, g, th, onOpen }: { s: Species; g: Donation | undefined; th: Theme; onOpen: () => void }) {
  const w = Math.round(Math.min(200, 110 + Math.sqrt(s.max_cm) * 5));
  return (
    <button type="button" onClick={onOpen} className="group relative flex shrink-0 flex-col items-center outline-none" style={{ width: w + 90 }} data-testid={`room-hung-${s.id}`} aria-label={g ? s.name ?? "Esemplare" : "Targa vuota"}>
      <div className="pointer-events-none absolute -top-2 left-1/2 h-[120%] w-[90%] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_160deg,rgba(255,240,180,0.22)_180deg,transparent_200deg)] ct-beam" />
      <div className="ct-hang relative flex flex-col items-center transition-transform duration-150 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]">
        <div className="flex justify-between" style={{ width: w * 0.6 }}>
          <span className="h-8 w-px bg-black/60" />
          <span className="h-8 w-px bg-black/60" />
        </div>
        <div className="rounded-xl border-[5px] p-2 shadow-2xl" style={{ width: w + 48, borderColor: th.trim, background: `linear-gradient(145deg, ${th.trim}, #00000055)` }}>
          <div className="relative overflow-hidden rounded-md border-2 border-black/30 p-2" style={{ background: `linear-gradient(180deg, ${th.water[0]}, ${th.water[1]})` }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.3),transparent_65%)]" />
            <div className="relative" style={{ transform: "rotate(-5deg)" }}>
              <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} silhouette={!g} className="w-full drop-shadow-lg" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-[18%] w-[12%] -skew-x-12 bg-white/15" />
          </div>
        </div>
        <div className="-mt-1.5 w-[84%] rounded-b-md border-2 px-2 py-1 text-center shadow-lg" style={{ borderColor: "#8a6a1f", background: "linear-gradient(180deg,#f0c860,#b98c25)" }}>
          <p className="truncate text-[11px] font-bold text-[#3b2a0f]">{g ? s.name : "Targa vuota"}</p>
          <p className="truncate text-[9px] text-[#5a410f]">{g ? `donato da ${g.donor} · ${g.length} cm` : "ancora da donare"}</p>
        </div>
      </div>
    </button>
  );
}

function PropArt({ p, th }: { p: Prop; th: Theme }) {
  if (p === "plant")
    return (
      <svg viewBox="0 0 80 130" className="w-16 sm:w-20" aria-hidden>
        <path d="M40 80 q-34 -8 -34 -50 q26 2 34 50Z M40 80 q34 -10 34 -56 q-30 6 -34 56Z M40 80 q-8 -30 2 -70 q12 34 -2 70Z M40 84 q-20 -20 -26 -44 q24 8 26 44Z" fill="#3f9a4a" />
        <path d="M40 80 q-30 -8 -34 -50 q10 2 20 14" fill="#5bc06a" opacity="0.5" />
        <path d="M16 82 h48 l-6 44 h-36Z" fill="#b5653a" />
        <rect x="13" y="76" width="54" height="10" rx="3" fill="#c97a4a" />
      </svg>
    );
  if (p === "bench")
    return (
      <svg viewBox="0 0 150 90" className="w-28 sm:w-36" aria-hidden>
        <rect x="10" y="30" width="130" height="10" rx="3" fill="#b08457" />
        <rect x="10" y="44" width="130" height="8" rx="3" fill="#8c6a41" />
        <rect x="16" y="54" width="8" height="32" fill="#5a3d22" />
        <rect x="126" y="54" width="8" height="32" fill="#5a3d22" />
        <rect x="14" y="8" width="122" height="7" rx="3" fill="#a37a4d" />
        <rect x="22" y="14" width="6" height="18" fill="#5a3d22" />
        <rect x="122" y="14" width="6" height="18" fill="#5a3d22" />
      </svg>
    );
  if (p === "window")
    return (
      <svg viewBox="0 0 120 170" className="w-24 sm:w-28" aria-hidden>
        <path d="M10 170 V50 Q10 8 60 8 Q110 8 110 50 V170Z" fill={th.trim} />
        <path d="M18 162 V52 Q18 16 60 16 Q102 16 102 52 V162Z" fill="url(#cw-sky)" />
        <defs>
          <linearGradient id="cw-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fd3ff" />
            <stop offset="1" stopColor="#e9f7d8" />
          </linearGradient>
        </defs>
        <path d="M60 16 V162 M18 90 H102" stroke={th.trim} strokeWidth="5" />
        <ellipse cx="42" cy="48" rx="14" ry="6" fill="#ffffff" opacity="0.85" />
        <ellipse cx="82" cy="70" rx="10" ry="4" fill="#ffffff" opacity="0.7" />
        <path d="M18 162 V120 q20 -14 42 0 q22 -14 42 0 V162Z" fill="#4d8f4a" opacity="0.8" />
      </svg>
    );
  if (p === "lamp")
    return (
      <div className="flex flex-col items-center" aria-hidden>
        <div className="ct-glow size-16 rounded-full bg-[radial-gradient(circle,rgba(255,226,140,0.9),transparent_70%)]" />
        <div className="-mt-10 h-5 w-4 rounded-sm" style={{ background: th.plaque }} />
        <div className="h-24 w-1.5" style={{ background: th.trim }} />
        <div className="h-2 w-10 rounded-full" style={{ background: th.trim }} />
      </div>
    );
  if (p === "column")
    return (
      <svg viewBox="0 0 60 190" className="w-12 sm:w-14" aria-hidden>
        <rect x="2" y="0" width="56" height="12" rx="2" fill="#d8d3c6" />
        <rect x="8" y="12" width="44" height="6" fill="#bdb7a6" />
        <rect x="12" y="18" width="36" height="150" fill="#ece8de" />
        {[18, 26, 34, 42].map((x) => (
          <rect key={x} x={x} y="18" width="2" height="150" fill="#000000" opacity="0.08" />
        ))}
        <rect x="8" y="168" width="44" height="8" fill="#bdb7a6" />
        <rect x="2" y="176" width="56" height="14" rx="2" fill="#d8d3c6" />
      </svg>
    );
  if (p === "banner")
    return (
      <svg viewBox="0 0 90 170" className="w-16 sm:w-20" aria-hidden>
        <rect x="4" y="4" width="82" height="7" rx="3" fill="#5a3d22" />
        <path d="M12 11 H78 V140 L45 160 L12 140Z" fill="#1f6f93" />
        <path d="M20 20 H70 V132 L45 148 L20 132Z" fill="none" stroke="#9fd6ee" strokeWidth="2" />
        <path d="M30 78 q15 -22 34 0 q-19 22 -34 0Z M64 78 l10 -10 v20Z" fill="#e0f2fe" />
        <circle cx="38" cy="75" r="2.4" fill="#0b2a3d" />
      </svg>
    );
  if (p === "rocks")
    return (
      <svg viewBox="0 0 150 80" className="w-28 sm:w-36" aria-hidden>
        <ellipse cx="50" cy="56" rx="44" ry="26" fill="#7b8087" />
        <ellipse cx="40" cy="44" rx="20" ry="9" fill="#ffffff" opacity="0.2" />
        <ellipse cx="104" cy="62" rx="34" ry="18" fill="#6a6f76" />
        <path d="M30 40 q10 -16 24 -8 q-12 2 -24 8Z" fill="#4d8a3e" />
        <path d="M118 30 q6 -18 16 -22 q0 12 -6 24Z" fill="#3f9a4a" />
      </svg>
    );
  if (p === "statue")
    return (
      <svg viewBox="0 0 100 200" className="w-16 sm:w-20" aria-hidden>
        <rect x="14" y="170" width="72" height="26" rx="3" fill="#8b84c4" />
        <rect x="24" y="150" width="52" height="22" fill="#a49ddb" />
        <path d="M50 148 C 20 130, 24 80, 50 50 C 76 80, 80 130, 50 148Z" fill="#c4b5fd" />
        <path d="M50 148 C 36 130, 38 90, 50 56" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="3" fill="none" />
        <circle cx="50" cy="36" r="16" fill="#c4b5fd" />
        <circle cx="50" cy="20" r="26" fill="#fbbf24" opacity="0.2" className="ct-glow" />
      </svg>
    );
  return (
    <svg viewBox="0 0 70 160" className="w-12 sm:w-14" aria-hidden>
      <rect x="31" y="0" width="8" height="30" fill="#4a1210" />
      <path d="M12 30 H58 L50 62 H20Z" fill="#c4302b" />
      <rect x="22" y="40" width="26" height="14" fill="#ffd36a" className="ct-glow" />
      <rect x="16" y="62" width="38" height="8" fill="#4a1210" />
      <rect x="31" y="70" width="8" height="70" fill="#8c2a24" />
      <ellipse cx="35" cy="146" rx="26" ry="9" fill="#4a1210" />
    </svg>
  );
}

function Stars({ n }: { n: number }) {
  const f = Math.max(1, Math.round(n / 2));
  return (
    <span className="tracking-tight text-[#E3B341]" aria-label={`${n} su 10`}>
      {"★".repeat(f)}
      <span className="text-[#30363D]">{"★".repeat(5 - f)}</span>
    </span>
  );
}

function SizeBar({ s, g }: { s: Species; g: Donation | undefined }) {
  const span = Math.max(1, s.max_cm - s.min_cm);
  const pos = g ? Math.max(0, Math.min(100, ((g.length - s.min_cm) / span) * 100)) : null;
  return (
    <div className="rounded-lg border border-[#30363D] bg-[#0D1117] p-2.5">
      <div className="flex items-center justify-between text-[11px] text-[#8B949E]">
        <span>Misura</span>
        <span className="tabular-nums">
          {s.min_cm}–{s.max_cm} cm
        </span>
      </div>
      <div className="relative mt-2 h-2 rounded-full bg-[#21262D]">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: pos === null ? "100%" : `${Math.max(6, pos)}%`, background: `linear-gradient(90deg, ${RARITY[s.rarity].color}55, ${RARITY[s.rarity].color})`, opacity: pos === null ? 0.25 : 1 }} />
        {pos !== null && <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ left: `${Math.max(3, Math.min(97, pos))}%`, background: RARITY[s.rarity].color }} />}
      </div>
      {g && <p className="mt-1.5 text-[11px] text-[#C9D1D9]">Esemplare esposto: {g.length} cm</p>}
    </div>
  );
}

function Panel({ sel, setSel, gifts, room, th, onClose }: { sel: Sel | null; setSel: (s: Sel | null) => void; gifts: Map<string, Donation>; room: ResolvedRoom; th: Theme; onClose: () => void }) {
  const sp = sel?.sp ?? null;
  const tank = sel?.tank ?? null;
  const g = sp ? gifts.get(sp.id) : undefined;
  const known = !!sp?.name;
  const where = sp ? room.items.find((it): it is TankItem => it.k === "tank" && it.species.some((x) => x.id === sp.id)) : undefined;
  return (
    <Dialog open={!!sel} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {sel && sp && (
          <>
            <DialogHeader>
              <DialogTitle>{known ? sp.name : "Specie sconosciuta"}</DialogTitle>
              <DialogDescription>{sp.description ?? "Pesca questo pesce per scoprirne il nome e donarlo al museo."}</DialogDescription>
            </DialogHeader>
            <div className="relative h-48 overflow-hidden rounded-xl border border-[#30363D]" style={{ background: `linear-gradient(180deg, ${th.water[0]}, ${th.water[1]})` }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.35),transparent_65%)]" />
              <Scenery kind={where?.decor ?? "shoal"} th={th} />
              <Bubbles n={6} />
              <div className="ct-float absolute inset-0 grid place-items-center p-6">
                <FishArt shape={sp.shape} colors={sp.colors} pattern={sp.pattern} silhouette={!g} swim={!!g} className="w-full max-w-[280px] drop-shadow-xl" />
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-[#30363D] bg-[#0D1117] p-2.5">
                <dt className="text-[11px] text-[#8B949E]">Rarità</dt>
                <dd className="mt-1">
                  <RarityTag rarity={sp.rarity} />
                </dd>
              </div>
              <div className="rounded-lg border border-[#30363D] bg-[#0D1117] p-2.5">
                <dt className="text-[11px] text-[#8B949E]">Difficoltà di pesca</dt>
                <dd className="mt-1">{known ? <Stars n={sp.difficulty} /> : "???"}</dd>
              </div>
              <div className="rounded-lg border border-[#30363D] bg-[#0D1117] p-2.5">
                <dt className="text-[11px] text-[#8B949E]">Sala</dt>
                <dd className="mt-1 text-xs">{room.def.name}</dd>
              </div>
              <div className="rounded-lg border border-[#30363D] bg-[#0D1117] p-2.5">
                <dt className="text-[11px] text-[#8B949E]">Esposizione</dt>
                <dd className="mt-1 text-xs">{where ? where.name : isBig(sp) ? "Appeso in sala" : "Vetrina"}</dd>
              </div>
            </dl>
            <SizeBar s={sp} g={g} />
            {g ? (
              <div className="rounded-lg border border-[#E3B341]/30 bg-[#342207]/40 p-3 text-sm">
                <p>
                  Donato da <span className="font-semibold">{g.donor}</span>
                </p>
                <p className="mt-0.5 text-xs text-[#C9D1D9]">{fmtWhen(g.donated_at)}</p>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-[#30363D] px-3 py-2 text-xs text-[#8B949E]">Nessuno ha ancora donato questa specie. Vai al Pond e pescala!</p>
            )}
            {tank && (
              <Button variant="outline" onClick={() => setSel({ tank, sp: null })}>
                <ArrowLeft /> Torna all'acquario
              </Button>
            )}
          </>
        )}
        {sel && !sp && tank && (
          <>
            <DialogHeader>
              <DialogTitle>{tank.name}</DialogTitle>
              <DialogDescription>{tank.note}</DialogDescription>
            </DialogHeader>
            <div className="relative h-36 overflow-hidden rounded-xl border border-[#30363D]" style={{ background: `linear-gradient(180deg, ${th.water[0]}, ${th.water[1]})` }}>
              <Scenery kind={tank.decor} th={th} />
              <Bubbles n={6} />
              <div className="absolute inset-0 flex items-center justify-around px-3">
                {tank.species.slice(0, 4).map((s, i) => (
                  <div key={s.id} className="ct-float w-[22%]" style={{ animationDelay: `${i * 0.5}s`, marginTop: (i % 2) * 22 }}>
                    <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} silhouette={!gifts.has(s.id)} swim={gifts.has(s.id)} className="w-full drop-shadow" />
                  </div>
                ))}
              </div>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {tank.species.map((s) => {
                const d = gifts.get(s.id);
                return (
                  <li key={s.id}>
                    <button type="button" onClick={() => setSel({ tank, sp: s })} className="flex w-full items-center gap-3 rounded-lg border border-[#30363D] bg-[#0D1117] p-2 text-left transition-colors hover:border-[#58A6FF]" data-testid={`tank-species-${s.id}`}>
                      <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} silhouette={!d} className="w-16 shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.name ?? "???"}</p>
                        <div className="mt-1">
                          <RarityTag rarity={s.rarity} />
                        </div>
                        <p className="mt-1 truncate text-[10px] text-[#8B949E]">{d ? `donato da ${d.donor}` : "da donare"}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function MuseumRoom({ city, roomId, onRoom, onBucket }: { city: CityState; roomId: string; onRoom: (id: string) => void; onBucket: () => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<Sel | null>(null);
  const gifts = useMemo(() => new Map(city.museum.map((d) => [d.species_id, d])), [city.museum]);
  const rooms = useMemo(() => buildRooms(city.species), [city.species]);
  const idx = Math.max(0, rooms.findIndex((r) => r.def.id === roomId));
  const room = rooms[idx];
  const next = rooms[idx + 1];
  const th = THEMES[room.def.theme];
  const got = room.list.filter((s) => gifts.has(s.id)).length;

  useEffect(() => {
    scroller.current?.scrollTo({ left: 0 });
    setSel(null);
  }, [roomId]);

  const scrollBy = (dx: number) => scroller.current?.scrollBy({ left: dx, behavior: "smooth" });
  let n = 0;

  return (
    <div className="relative flex h-full flex-col overflow-hidden" data-testid="museum-room">
      <div className="relative z-[3] flex items-center gap-1.5 overflow-x-auto border-b border-black/30 bg-[#161B22]/92 px-3 py-2 backdrop-blur ct-scroll">
        {rooms.map((r, i) => {
          const c = r.list.filter((s) => gifts.has(s.id)).length;
          const active = r.def.id === roomId;
          return (
            <button key={r.def.id} type="button" onClick={() => onRoom(r.def.id)} className="inline-flex shrink-0 items-center gap-1.5 rounded border px-2 py-1 text-[11px] transition-colors" style={{ borderColor: active ? THEMES[r.def.theme].accent : "#30363D", background: active ? `${THEMES[r.def.theme].accent}22` : "#0D1117", color: active ? "#F0F6FC" : "#C9D1D9" }} data-testid={`room-chip-${r.def.id}`}>
              <span className="grid size-4 place-items-center rounded-full text-[9px] font-bold text-black" style={{ background: THEMES[r.def.theme].accent }}>
                {i + 1}
              </span>
              <span className="hidden sm:inline">{r.def.name}</span>
              <span className="tabular-nums text-[#8B949E]">
                {c}/{r.list.length}
              </span>
            </button>
          );
        })}
        <Button variant="secondary" size="sm" className="ml-auto shrink-0" onClick={onBucket} data-testid="room-bucket-button">
          <Package /> Secchio ({city.bucket.length})
        </Button>
      </div>

      <div ref={scroller} className="relative min-h-0 flex-1 overflow-x-auto overflow-y-hidden ct-scroll" style={th.wall} onWheel={(e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && scroller.current) scroller.current.scrollLeft += e.deltaY; }} data-testid="room-scroller">
        <div className="relative flex h-full min-w-max items-stretch gap-2 px-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-[14%] h-3" style={{ background: th.trim }} />
          <div className="absolute inset-x-0 bottom-0 h-[14%] border-t-4" style={{ ...th.floor, borderColor: th.trim }} />

          <div className="relative z-[1] flex w-[250px] shrink-0 flex-col justify-center pr-2">
            <div className="rounded-xl border-4 p-3 shadow-xl" style={{ borderColor: th.trim, background: th.dark ? "#0000004d" : "#ffffffb0", color: th.dark ? "#f3efe0" : "#2a1d0f" }}>
              <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: th.accent }}>
                Sala {idx + 1} di {rooms.length}
              </p>
              <h2 className="mt-1 text-lg leading-tight font-bold">{room.def.name}</h2>
              <p className="text-xs opacity-80">{room.def.subtitle}</p>
              <p className="mt-2 text-[11px] leading-snug opacity-80">{room.def.intro}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/25">
                <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(got / Math.max(1, room.list.length)) * 100}%`, background: th.accent }} />
              </div>
              <p className="mt-1 text-[10px] tabular-nums opacity-80">
                {got}/{room.list.length} specie esposte
              </p>
            </div>
          </div>

          {room.items.map((it, i) => {
            if (it.k === "tank")
              return (
                <div key={`${it.id}${i}`} className="relative z-[1] flex items-end pb-[11%]">
                  <Tank item={it} th={th} gifts={gifts} base={n++ * 3} onOpen={() => setSel({ tank: it, sp: null })} />
                </div>
              );
            if (it.k === "hung") {
              const sp = it.species;
              return (
                <div key={`${sp.id}${i}`} className="relative z-[1] flex flex-col items-center justify-between pt-3 pb-[13%]">
                  <Hung s={sp} g={gifts.get(sp.id)} th={th} onOpen={() => setSel({ tank: null, sp })} />
                  <div className="h-10 w-24 rounded-t-md border-2 border-b-0 shadow-lg" style={{ borderColor: th.trim, background: `linear-gradient(180deg, ${th.trim}, #00000066)` }} />
                </div>
              );
            }
            return (
              <div key={`p${i}`} className="relative z-[1] flex items-end justify-center px-3 pb-[12%]">
                <PropArt p={it.p} th={th} />
              </div>
            );
          })}

          <div className="relative z-[1] flex w-[210px] shrink-0 items-end justify-center pb-[10%]">
            {next ? (
              <button type="button" onClick={() => onRoom(next.def.id)} className="group flex w-[170px] flex-col items-center outline-none" data-testid="room-next">
                <span className="mb-2 rounded-md px-2.5 py-1 text-center text-[11px] font-semibold shadow" style={{ background: THEMES[next.def.theme].plaque, color: THEMES[next.def.theme].plaqueInk }}>
                  {next.def.name}
                </span>
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[999px] border-x-[10px] border-t-[10px] transition-transform duration-200 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]" style={{ borderColor: th.trim, background: `linear-gradient(180deg, ${THEMES[next.def.theme].water[0]}, ${THEMES[next.def.theme].water[1]})` }}>
                  <div className="ct-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.45),transparent_60%)]" />
                  <DoorOpen className="absolute inset-x-0 bottom-3 mx-auto size-7 text-white/80" />
                </div>
              </button>
            ) : (
              <div className="rounded-lg border-2 border-dashed px-3 py-4 text-center text-xs" style={{ borderColor: th.accent, color: th.dark ? "#f3efe0" : "#2a1d0f" }}>
                Fine del percorso
                <span className="mt-1 block text-[10px] opacity-70">Altre sale in arrivo</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <button type="button" onClick={() => scrollBy(-440)} className="absolute top-1/2 left-2 z-[3] grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur active:scale-95" aria-label="Scorri a sinistra" data-testid="room-left">
        <ChevronLeft />
      </button>
      <button type="button" onClick={() => scrollBy(440)} className="absolute top-1/2 right-2 z-[3] grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur active:scale-95" aria-label="Scorri a destra" data-testid="room-right">
        <ChevronRight />
      </button>

      <Panel sel={sel} setSel={setSel} gifts={gifts} room={room} th={th} onClose={() => setSel(null)} />
    </div>
  );
}
