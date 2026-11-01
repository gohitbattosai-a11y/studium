import { ArrowRight, Lock, Package } from "lucide-react";
import { useMemo } from "react";
import type { CityState } from "@/lib/city";
import { Button } from "@/components/ui/button";
import FishArt from "./FishArt";
import { THEMES, buildRooms } from "./rooms";
import "./city.css";

function Owl() {
  return (
    <svg viewBox="0 0 90 100" className="w-16 drop-shadow-md sm:w-20" aria-hidden>
      <ellipse cx="45" cy="64" rx="28" ry="30" fill="#8a6a43" />
      <ellipse cx="45" cy="70" rx="17" ry="20" fill="#e8d9b5" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${36 + i * 9} 58 q4 6 0 12`} stroke="#b59a6a" strokeWidth="1.6" fill="none" />
      ))}
      <path d="M17 66 q-8 12 4 26 q8 -12 6 -26Z M73 66 q8 12 -4 26 q-8 -12 -6 -26Z" fill="#7a5a36" />
      <circle cx="45" cy="34" r="24" fill="#9b7a50" />
      <path d="M24 16 L31 28 L19 28Z M66 16 L59 28 L71 28Z" fill="#7a5a36" />
      <circle cx="35" cy="34" r="10" fill="#f8f3e4" />
      <circle cx="55" cy="34" r="10" fill="#f8f3e4" />
      <g className="ct-blink">
        <circle cx="35" cy="35" r="4.5" fill="#1b1b1b" />
        <circle cx="55" cy="35" r="4.5" fill="#1b1b1b" />
        <circle cx="33.6" cy="33.4" r="1.4" fill="#ffffff" />
        <circle cx="53.6" cy="33.4" r="1.4" fill="#ffffff" />
      </g>
      <path d="M40 43 L45 52 L50 43Z" fill="#e3a53a" />
      <path d="M31 20 q14 -7 28 0" stroke="#2b2b2b" strokeOpacity="0.55" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M34 94 l-4 6 M40 95 l-2 6 M50 95 l2 6 M56 94 l4 6" stroke="#e3a53a" strokeWidth="2.2" strokeLinecap="round" />
      <g transform="translate(60 6)">
        <ellipse cx="0" cy="3" rx="14" ry="4" fill="#2b2b2b" />
        <rect x="-11" y="-10" width="22" height="12" rx="2" fill="#1f3a5f" />
        <rect x="-8" y="-14" width="16" height="4" fill="#1f3a5f" />
        <rect x="-4" y="-14" width="8" height="2" fill="#f6e7b4" />
      </g>
    </svg>
  );
}

function Chandelier() {
  return (
    <div className="ct-swing pointer-events-none absolute top-0 left-1/2 z-[1] -translate-x-1/2" aria-hidden>
      <svg viewBox="0 0 220 130" className="w-40 sm:w-56">
        <path d="M110 0 V28" stroke="#8a6a1f" strokeWidth="3" />
        <path d="M110 28 q-70 6 -88 42 M110 28 q70 6 88 42 M110 28 V76" stroke="#d9a93a" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M60 28 h100 q-6 18 -50 20 q-44 -2 -50 -20Z" fill="#b98c25" />
        {[22, 66, 110, 154, 198].map((x, i) => (
          <g key={x}>
            <rect x={x - 5} y={i === 2 ? 76 : 70 + (i % 2) * 4} width="10" height="18" rx="2" fill="#f6e7b4" />
            <ellipse cx={x} cy={i === 2 ? 72 : 66 + (i % 2) * 4} rx="4" ry="7" fill="#ffd36a" className="ct-glow" style={{ animationDelay: `${i * 0.4}s` }} />
            <circle cx={x} cy={i === 2 ? 70 : 64 + (i % 2) * 4} r="22" fill="#ffd36a" opacity="0.12" />
          </g>
        ))}
        {[40, 80, 140, 180].map((x) => (
          <path key={x} d={`M${x} 96 l-3 14 l3 6 l3 -6Z`} fill="#bae6fd" opacity="0.8" />
        ))}
      </svg>
    </div>
  );
}

function Column({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 260" className={className} aria-hidden>
      <rect x="0" y="0" width="50" height="14" rx="3" fill="#d8d3c6" />
      <rect x="6" y="14" width="38" height="8" fill="#bdb7a6" />
      <rect x="9" y="22" width="32" height="208" fill="#efeadf" />
      {[14, 21, 28, 35].map((x) => (
        <rect key={x} x={x} y="22" width="2" height="208" fill="#000000" opacity="0.08" />
      ))}
      <rect x="6" y="230" width="38" height="8" fill="#bdb7a6" />
      <rect x="0" y="238" width="50" height="22" rx="3" fill="#d8d3c6" />
    </svg>
  );
}

export default function Museum({ city, onRoom, onBucket, onExit }: { city: CityState; onRoom: (id: string) => void; onBucket: () => void; onExit: () => void }) {
  const rooms = useMemo(() => buildRooms(city.species), [city.species]);
  const gifts = useMemo(() => new Map(city.museum.map((d) => [d.species_id, d])), [city.museum]);
  const done = city.museum.length;
  const total = city.species.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="relative flex h-full flex-col overflow-hidden" data-testid="museum-lobby">
      <div className="ct-scroll relative min-h-0 flex-1 overflow-y-auto">
        <div className="ct-wall relative overflow-hidden px-3 pt-4 pb-0 sm:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-around opacity-80">
            {[0, 1, 2].map((i) => (
              <svg key={i} viewBox="0 0 120 150" className="hidden w-28 sm:block" aria-hidden>
                <path d="M10 150 V60 Q10 12 60 12 Q110 12 110 60 V150Z" fill="#8a6a43" />
                <path d="M20 142 V62 Q20 22 60 22 Q100 22 100 62 V142Z" fill="url(#lb-sky)" />
                <defs>
                  <linearGradient id="lb-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#9bd7ff" />
                    <stop offset="1" stopColor="#f4efd3" />
                  </linearGradient>
                </defs>
                <path d="M60 22 V142 M20 84 H100" stroke="#8a6a43" strokeWidth="4" />
              </svg>
            ))}
          </div>
          <Chandelier />
          <div className="relative z-[2] mx-auto flex max-w-4xl items-end justify-center gap-4 pt-28 sm:gap-8 sm:pt-36">
            <Column className="hidden h-44 w-10 sm:block" />
            <div className="flex flex-col items-center">
              <div className="mb-3 rounded-lg border-4 border-[#6b4a2b] bg-[#f8f1dc] px-4 py-2 text-center shadow-md">
                <p className="text-[10px] font-medium tracking-wider text-[#7a5230] uppercase">Collezione del museo</p>
                <p className="text-2xl font-bold tabular-nums text-[#3b2a17] sm:text-3xl">
                  {done}/{total}
                </p>
                <div className="mx-auto mt-1 h-2 w-40 overflow-hidden rounded-full bg-[#d8c9a3]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#e3b341] to-[#f0883e] transition-[width] duration-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-[#7a5230]">pesci donati · {pct}%</p>
              </div>
              <div className="flex items-end gap-2">
                <Owl />
                <div className="mb-0 flex h-12 w-44 flex-col justify-between rounded-t-md border-2 border-[#5a3d22] bg-gradient-to-b from-[#8a6a43] to-[#6b4a2b] px-2 py-1 shadow-lg sm:w-56">
                  <span className="text-[10px] font-semibold text-[#f6e7b4]">Accoglienza</span>
                  <span className="text-[9px] text-[#e3cfa0]">Scegli una sala da visitare</span>
                </div>
              </div>
            </div>
            <Column className="hidden h-44 w-10 sm:block" />
          </div>
          <div className="relative z-[2] mx-auto h-4 max-w-4xl bg-[#7a5230]" />
        </div>

        <div className="ct-marble relative px-3 py-5 sm:px-10">
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-40 -translate-x-1/2 bg-[#9c3b3b]/70 [clip-path:polygon(10%_0,90%_0,100%_100%,0_100%)]" />
          <div className="relative z-[1] mx-auto grid max-w-4xl grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {rooms.map((r, i) => {
              const th = THEMES[r.def.theme];
              const c = r.list.filter((s) => gifts.has(s.id)).length;
              const preview = r.list.slice(0, 3);
              const full = c === r.list.length && r.list.length > 0;
              return (
                <button key={r.def.id} type="button" onClick={() => onRoom(r.def.id)} className="group flex flex-col items-center text-center outline-none" data-testid={`lobby-room-${r.def.id}`} aria-label={`Entra in ${r.def.name}`}>
                  <div className="mb-2 flex items-center gap-1.5 rounded-md border-2 px-2.5 py-1 text-[11px] font-semibold shadow transition-transform duration-150 group-hover:scale-105 group-focus-visible:scale-105 sm:text-xs" style={{ background: th.plaque, borderColor: th.trim, color: th.plaqueInk }}>
                    <span className="grid size-4 place-items-center rounded-full bg-black/25 text-[9px] text-white">{i + 1}</span>
                    {r.def.name}
                  </div>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[999px] border-x-[10px] border-t-[10px] transition-transform duration-200 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]" style={{ borderColor: th.trim, background: `linear-gradient(180deg, ${th.water[0]}, ${th.water[1]})` }}>
                    <div className="ct-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.4),transparent_60%)]" />
                    {preview.map((s, k) => (
                      <div key={s.id} className="ct-float absolute w-[46%]" style={{ left: `${8 + k * 20}%`, top: `${20 + k * 22}%`, animationDelay: `${k * 0.7}s`, opacity: gifts.has(s.id) ? 1 : 0.6 }}>
                        <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} silhouette={!gifts.has(s.id)} className="w-full" />
                      </div>
                    ))}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
                    {full && <span className="absolute top-3 right-2 rounded-full bg-[#E3B341] px-1.5 py-0.5 text-[9px] font-bold text-[#3b2a0f]">Completa</span>}
                  </div>
                  <p className="mt-1.5 text-[11px] leading-tight text-[#3b2a17]">{r.def.subtitle}</p>
                  <div className="mt-1 flex w-4/5 items-center gap-1.5">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/15">
                      <div className="h-full rounded-full" style={{ width: `${(c / Math.max(1, r.list.length)) * 100}%`, background: th.accent }} />
                    </div>
                    <span className="text-[10px] font-medium tabular-nums text-[#3b2a17]">
                      {c}/{r.list.length}
                    </span>
                  </div>
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-[#7a5230] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    Entra <ArrowRight className="size-3" />
                  </span>
                </button>
              );
            })}
            <div className="flex flex-col items-center text-center" data-testid="lobby-left-passage">
              <div className="mb-2 rounded-md border-2 border-[#5a3d22] bg-[#6b4a2b] px-2.5 py-1 text-[11px] font-semibold text-[#f6e7b4] shadow sm:text-xs">
                Animali
                <span className="block text-[10px] font-normal opacity-80">Prossimamente</span>
              </div>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[999px] border-x-[10px] border-t-[10px] border-[#6b4a2b] bg-gradient-to-b from-[#1b1e24] to-[#2b2f38]">
                <div className="absolute inset-0 grid place-items-center">
                  <Lock className="size-7 text-[#8B949E] sm:size-10" />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ct-floor relative z-[2] flex h-16 shrink-0 items-center justify-between border-t-4 border-[#5a3d22] px-3 sm:px-10">
        <button type="button" onClick={onExit} className="flex h-12 items-center gap-2 rounded-t-xl border-4 border-b-0 border-[#4a3320] bg-gradient-to-b from-[#7a5230] to-[#5b3b1f] px-4 text-xs font-medium text-[#f6e7b4] transition-transform duration-150 hover:scale-105" data-testid="lobby-exit">
          <span className="size-2.5 rounded-full bg-[#e3b341]" />
          Esci
        </button>
        <Button variant="secondary" size="lg" onClick={onBucket} data-testid="lobby-bucket-button">
          <Package /> Secchio ({city.bucket.length})
        </Button>
      </div>
    </div>
  );
}
