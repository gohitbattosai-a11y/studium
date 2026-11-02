import { Lock, Package } from "lucide-react";
import { useMemo, type CSSProperties } from "react";
import type { CityState } from "@/lib/city";
import { Button } from "@/components/ui/button";
import FishArt from "./FishArt";
import { buildRooms } from "./rooms";
import "./city.css";

function Owl() {
  return (
    <svg viewBox="0 0 90 100" className="w-full drop-shadow-lg" aria-hidden>
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
    </svg>
  );
}

function Stairs() {
  const n = 10;
  const xl = (y: number) => 40 + ((430 - y) / 200) * 180;
  const xr = (y: number) => 300 + ((430 - y) / 200) * 20;
  const band = (y0: number, y1: number, f0: number, f1: number) => {
    const w0 = xr(y0) - xl(y0);
    const w1 = xr(y1) - xl(y1);
    return `${xl(y0) + w0 * f0},${y0} ${xl(y0) + w0 * f1},${y0} ${xl(y1) + w1 * f1},${y1} ${xl(y1) + w1 * f0},${y1}`;
  };
  const steps = Array.from({ length: n }, (_, i) => ({ i, yb: 430 - i * 20 }));
  const flight = (
    <g>
      {steps.map(({ i, yb }) => (
        <g key={i}>
          <polygon points={band(yb, yb - 8, 0, 1)} fill="#8a7a58" />
          <polygon points={band(yb - 8, yb - 20, 0, 1)} fill="#d2c39e" />
          <polygon points={band(yb - 8, yb - 20, 0, 1)} fill="url(#ls-tread)" />
          <polygon points={band(yb, yb - 8, 0.17, 0.83)} fill="#6e2f36" />
          <polygon points={band(yb - 8, yb - 20, 0.17, 0.83)} fill="#a8545e" />
          <polygon points={band(yb - 8, yb - 20, 0.17, 0.83)} fill="url(#ls-tread)" />
          <polyline points={`${xl(yb - 20) + (xr(yb - 20) - xl(yb - 20)) * 0.17},${yb - 20} ${xl(yb - 20) + (xr(yb - 20) - xl(yb - 20)) * 0.83},${yb - 20}`} stroke="#f0d9a0" strokeWidth="1.6" opacity="0.8" />
          <line x1={xl(yb) - 7} y1={yb - 8} x2={xl(yb) - 7} y2={yb - 38} stroke="#4a2f1a" strokeWidth="3" />
          <line x1={xl(yb) - 8} y1={yb - 8} x2={xl(yb) - 8} y2={yb - 38} stroke="#9a6a3c" strokeWidth="1" />
          <line x1={xr(yb) + 4} y1={yb - 8} x2={xr(yb) + 4} y2={yb - 38} stroke="#4a2f1a" strokeWidth="3" />
        </g>
      ))}
      <path d={`M${xl(430) - 7} 392 L${xl(230) - 7} 192`} stroke="#3a2412" strokeWidth="8" strokeLinecap="round" />
      <path d={`M${xl(430) - 7} 389 L${xl(230) - 7} 189`} stroke="#9a6a3c" strokeWidth="3" strokeLinecap="round" />
      <path d={`M${xr(430) + 4} 392 L${xr(230) + 4} 192`} stroke="#3a2412" strokeWidth="7" strokeLinecap="round" />
      <path d={`M${xr(430) + 4} 389 L${xr(230) + 4} 189`} stroke="#9a6a3c" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points={`${xl(430) - 12},430 ${xl(430) - 2},430 ${xl(230) - 2},232 ${xl(230) - 12},232`} fill="#a89468" />
    </g>
  );
  return (
    <svg viewBox="0 0 800 430" preserveAspectRatio="xMidYMax meet" className="absolute inset-0 size-full drop-shadow-[0_18px_22px_rgba(0,0,0,0.45)]" aria-hidden>
      <defs>
        <linearGradient id="ls-tread" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="ls-void" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a0f08" />
          <stop offset="1" stopColor="#3a2616" />
        </linearGradient>
        <linearGradient id="ls-alcove" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a6640" />
          <stop offset="1" stopColor="#bba983" />
        </linearGradient>
        <linearGradient id="ls-door" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a190c" />
          <stop offset="0.5" stopColor="#4a2f18" />
          <stop offset="1" stopColor="#2a190c" />
        </linearGradient>
        <linearGradient id="ls-col" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8f7f5d" />
          <stop offset="0.45" stopColor="#e6d9b4" />
          <stop offset="1" stopColor="#7d6e4e" />
        </linearGradient>
        <radialGradient id="ls-sconce" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="220" y="0" width="360" height="210" fill="url(#ls-alcove)" />
      <rect x="220" y="0" width="360" height="14" fill="#5a4528" />
      {[236, 564].map((x) => (
        <g key={x}>
          <rect x={x - 14} y="14" width="28" height="196" fill="url(#ls-col)" />
          <rect x={x - 19} y="6" width="38" height="12" rx="2" fill="#cdbd96" />
          <rect x={x - 19} y="200" width="38" height="12" rx="2" fill="#cdbd96" />
        </g>
      ))}
      {[318, 482].map((x) => (
        <g key={x}>
          <circle cx={x} cy="120" r="34" fill="url(#ls-sconce)" className="ct-glow" />
          <rect x={x - 4} y="112" width="8" height="16" rx="2" fill="#ffe9a3" />
          <path d={`M${x - 10} 130 q10 10 20 0`} stroke="#4a2f1a" strokeWidth="3" fill="none" />
        </g>
      ))}
      <path d="M356 210 V112 Q356 66 400 66 Q444 66 444 112 V210Z" fill="url(#ls-door)" stroke="#e3b341" strokeWidth="4" />
      <path d="M400 70 V210 M372 120 H428 M372 160 H428" stroke="#000" strokeOpacity="0.35" strokeWidth="2" />
      <rect x="352" y="34" width="96" height="22" rx="4" fill="#e3b341" stroke="#7a5a1a" strokeWidth="2" />
      <text x="400" y="50" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3b2a0f" letterSpacing="2">
        ANIMALI
      </text>
      <circle cx="400" cy="150" r="13" fill="#1b1e24" stroke="#e3b341" strokeWidth="2" />
      <rect x="394" y="148" width="12" height="10" rx="2" fill="#e3b341" />
      <path d="M396 148 v-5 a4 4 0 0 1 8 0 v5" stroke="#e3b341" strokeWidth="2" fill="none" />
      <polygon points="300,430 320,232 480,232 500,430" fill="url(#ls-void)" />
      <rect x="214" y="206" width="372" height="26" fill="#cdbd96" />
      <rect x="214" y="206" width="372" height="5" fill="#f0e4c0" />
      <rect x="214" y="226" width="372" height="6" fill="#7a6a48" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
        <rect key={k} x={232 + k * 40} y="214" width="26" height="10" fill="#b8a780" stroke="#8f7f5d" strokeWidth="1" />
      ))}
      {flight}
      <g transform="translate(800 0) scale(-1 1)">{flight}</g>
    </svg>
  );
}

function Chandelier() {
  return (
    <svg viewBox="0 0 160 110" className="pointer-events-none absolute top-0 left-1/2 z-[4] h-[13%] -translate-x-1/2 drop-shadow-xl" aria-hidden>
      <defs>
        <radialGradient id="ch-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe9a3" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe9a3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="66" r="62" fill="url(#ch-glow)" className="ct-glow" />
      <line x1="80" y1="0" x2="80" y2="34" stroke="#5a3d22" strokeWidth="3" />
      <path d="M30 56 Q80 90 130 56" stroke="#b8862f" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="80" cy="42" rx="14" ry="8" fill="#d4a548" />
      {[30, 55, 80, 105, 130].map((x, i) => (
        <g key={x}>
          <rect x={x - 3} y={46 + Math.abs(i - 2) * -1 + (i === 2 ? 22 : 8 + Math.abs(i - 2) * 4)} width="6" height="12" rx="2" fill="#fff6d0" />
          <circle cx={x} cy={44 + (i === 2 ? 20 : 6 + Math.abs(i - 2) * 4)} r="4" fill="#fff3b0" className="ct-glow" style={{ animationDelay: `${i * 0.4}s` }} />
        </g>
      ))}
      <path d="M68 78 L80 104 L92 78Z" fill="#e3b341" opacity="0.8" />
    </svg>
  );
}

function Window({ x }: { x: string }) {
  return (
    <div className="pointer-events-none absolute top-[4%] z-[1] h-[17%] w-[5.5%] min-w-9 overflow-hidden rounded-t-[999px] border-x-[5px] border-t-[5px] border-[#5a3d22] shadow-[0_0_30px_rgba(255,226,150,0.45)]" style={{ left: x, background: "linear-gradient(180deg,#9fdcff,#fff1c8)" }}>
      <div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-[#5a3d22]" />
      <div className="absolute inset-x-0 top-1/2 h-[3px] bg-[#5a3d22]" />
      <div className="absolute bottom-0 inset-x-0 h-1/3 bg-[#4f8a68]/70" />
    </div>
  );
}

export default function Museum({ city, onRoom, onBucket, onExit }: { city: CityState; onRoom: (id: string) => void; onBucket: () => void; onExit: () => void }) {
  const rooms = useMemo(() => buildRooms(city.species), [city.species]);
  const gifts = useMemo(() => new Set(city.museum.map((d) => d.species_id)), [city.museum]);
  const done = city.museum.length;
  const total = city.species.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const first = rooms[0];
  const preview = first ? first.list.slice(0, 3) : [];
  return (
    <div className="relative h-full overflow-hidden bg-[#1a0f08]" data-testid="museum-lobby">
      <div className="ct-enter absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[62%]" style={{ background: "linear-gradient(180deg,#8a7449 0%,#c4b189 38%,#dccda8 100%)" }}>
          <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(110,80,40,0.09) 0 2px, transparent 2px 38px), repeating-linear-gradient(-45deg, rgba(110,80,40,0.09) 0 2px, transparent 2px 38px)" }} />
          <div className="absolute inset-x-0 top-0 h-[4%] bg-gradient-to-b from-[#4a3820] to-[#7a6440]" />
          <div className="absolute inset-x-0 top-[4%] h-[1.2%] bg-[#a88a4e]" />
          <div className="absolute inset-x-0 bottom-0 h-[20%] bg-[#6b4a2b]" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0 2px, transparent 2px 90px), linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.3))" }} />
          <div className="absolute inset-x-0 bottom-[20%] h-[1.4%] bg-[#a37a4d]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,230,160,0.4),transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[40%] overflow-hidden bg-[#2c3a37]">
          <div className="absolute -inset-x-[80%] top-0 h-[300%] origin-top" style={{ transform: "perspective(600px) rotateX(64deg)", background: "repeating-conic-gradient(#e6dfcb 0 25%, #b3a78a 0 50%) 0 0 / 130px 130px" }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,226,150,0.5),transparent_62%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/40" />
        </div>
        <div className="absolute inset-x-0 top-[62%] z-[1] h-2 bg-gradient-to-b from-black/45 to-transparent" />

        <Window x="9%" />
        <Window x="85.5%" />
        <div className="ct-shaft pointer-events-none absolute top-[8%] left-[7%] z-[4] h-[72%] w-[16%] bg-gradient-to-b from-[#ffe6a8]/55 to-transparent mix-blend-screen [clip-path:polygon(0_0,55%_0,100%_100%,35%_100%)]" />
        <div className="ct-shaft pointer-events-none absolute top-[8%] right-[7%] z-[4] h-[72%] w-[16%] bg-gradient-to-b from-[#ffe6a8]/55 to-transparent mix-blend-screen [clip-path:polygon(45%_0,100%_0,65%_100%,0_100%)]" style={{ animationDelay: "-3s" }} />

        <div className="absolute top-[8%] left-1/2 h-[56%] w-[66%] -translate-x-1/2">
          <Stairs />
        </div>
        <Chandelier />

        <div className="absolute bottom-0 left-1/2 top-[61%] z-[2] w-[46%] -translate-x-1/2 bg-gradient-to-b from-[#e3b341] to-[#b8862f] [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#a8454d] to-[#6e2128] [clip-path:polygon(44%_1.5%,56%_1.5%,96%_100%,4%_100%)]" />
          <div className="absolute inset-0 opacity-50 [clip-path:polygon(44%_1.5%,56%_1.5%,96%_100%,4%_100%)]" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 26px)" }} />
        </div>

        <button type="button" onClick={() => first && onRoom(first.def.id)} className="group absolute top-[13%] right-0 z-[3] flex flex-col items-center outline-none" style={{ width: "clamp(96px, 17%, 240px)", height: "54%", perspective: 700 }} data-testid={`lobby-room-${first?.def.id ?? "fish"}`} aria-label="Entra nell'ala dei pesci">
          <div className="flex h-full w-full flex-col items-center" style={{ transform: "rotateY(-24deg)", transformOrigin: "100% 50%" }}>
            <span className="mb-2 flex flex-col items-center rounded-md border border-black/30 bg-[#e3b341] px-3 py-1 text-center leading-tight font-semibold text-[#3b2a0f] shadow-lg transition-transform group-hover:scale-105" style={{ fontSize: "clamp(9px, 1.1vw, 13px)" }}>
              Ala dei Pesci
              <span className="text-[0.8em] font-normal tabular-nums opacity-80">
                {done}/{total} specie · {rooms.length} sale
              </span>
            </span>
            <div className="relative w-full flex-1 overflow-hidden rounded-t-[999px] border-x-[10px] border-t-[10px] border-[#4a3320] shadow-[0_0_60px_rgba(120,220,255,0.55)] transition-transform duration-200 group-hover:scale-[1.03]" style={{ background: "linear-gradient(180deg,#9be4f0,#2a7fa6 55%,#0c3050)" }}>
              <div className="ct-caustic absolute inset-0 opacity-40" />
              <div className="ct-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.55),transparent_62%)]" />
              {preview.map((s, k) => (
                <div key={s.id} className="ct-float absolute w-[60%]" style={{ left: `${k % 2 ? 34 : 6}%`, top: `${22 + k * 22}%`, animationDelay: `${k * 0.7}s`, opacity: gifts.has(s.id) ? 1 : 0.55 }}>
                  <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} silhouette={!gifts.has(s.id)} className="w-full drop-shadow" />
                </div>
              ))}
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="ct-bubble" style={{ left: `${14 + i * 14}%`, width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, [`--bd` as string]: `${3 + (i % 3)}s`, [`--bdelay` as string]: `${i * 0.7}s` } as CSSProperties} />
              ))}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        </button>
        <div className="pointer-events-none absolute top-[56%] right-0 z-[1] h-[20%] w-[24%] bg-gradient-to-l from-[#7fe0f5]/45 to-transparent [clip-path:polygon(0_30%,100%_0,100%_100%,30%_100%)]" />

        <div className="absolute top-[13%] left-0 z-[3] flex flex-col items-center" style={{ width: "clamp(96px, 17%, 240px)", height: "54%", perspective: 700 }} data-testid="lobby-left-passage">
          <div className="flex h-full w-full flex-col items-center" style={{ transform: "rotateY(24deg)", transformOrigin: "0% 50%" }}>
            <span className="mb-2 flex flex-col items-center rounded-md border border-black/30 bg-[#8a8f99] px-3 py-1 text-center leading-tight font-semibold text-[#14181f] shadow-lg" style={{ fontSize: "clamp(9px, 1.1vw, 13px)" }}>
              Prossimamente
              <span className="text-[0.8em] font-normal opacity-80">nuova ala</span>
            </span>
            <div className="relative grid w-full flex-1 place-items-center overflow-hidden rounded-t-[999px] border-x-[10px] border-t-[10px] border-[#4a3320]" style={{ background: "linear-gradient(180deg,#14181f,#262b36)" }}>
              <Lock className="size-1/4 text-[#8B949E]" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        </div>

        <div className="absolute z-[5] flex flex-col items-center" style={{ left: "53%", top: "67%", width: "clamp(54px, 7%, 100px)" }}>
          <div className="absolute bottom-[104%] left-1/2 w-[190%] -translate-x-1/2 rounded-xl border-2 border-[#8a6a43] bg-[#fff8e4] px-2.5 py-1.5 text-center text-[#3b2a0f] shadow-lg" style={{ fontSize: "clamp(8px, 1vw, 12px)" }}>
            Benvenuto al museo! Le sale dei pesci sono a destra.
            <span className="absolute -bottom-[7px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-[#8a6a43] bg-[#fff8e4]" />
          </div>
          <Owl />
        </div>

        <button type="button" onClick={onExit} className="group absolute bottom-0 left-1/2 z-[3] -translate-x-1/2 outline-none" style={{ width: "clamp(120px, 15%, 210px)", height: "15%" }} data-testid="lobby-exit" aria-label="Esci in città">
          <div className="relative size-full overflow-hidden rounded-t-[999px] border-x-[8px] border-t-[8px] border-[#4a3320] shadow-[0_-10px_50px_rgba(255,214,140,0.45)] transition-transform duration-200 group-hover:scale-105" style={{ background: "linear-gradient(180deg,#0b1740,#2a3f80 70%,#e8c88a)" }}>
            <div className="absolute inset-x-0 top-[18%] mx-auto size-[16%] rounded-full bg-[#f3f0dc]" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[#26402a]" />
            <span className="absolute inset-x-0 bottom-[8%] text-center font-semibold text-white drop-shadow" style={{ fontSize: "clamp(8px, 1vw, 12px)" }}>
              Esci in città
            </span>
          </div>
        </button>

        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="ct-mote pointer-events-none z-[4]" style={{ left: `${22 + ((i * 37) % 56)}%`, bottom: `${14 + ((i * 17) % 52)}%`, width: 2 + (i % 3), height: 2 + (i % 3), background: "#ffe9a3", boxShadow: "0 0 8px #ffe9a3", [`--bd` as string]: `${5 + (i % 4)}s`, [`--bdelay` as string]: `${i * 0.7}s` } as CSSProperties} />
        ))}

        <div className="pointer-events-none absolute inset-0 z-[6] bg-[radial-gradient(ellipse_at_50%_42%,transparent_55%,rgba(20,8,2,0.6))]" />
      </div>

      <div className="absolute bottom-3 left-3 z-[7] flex min-w-36 flex-col items-center rounded-xl border-2 border-[#e3b341] bg-[#2a1d0f]/85 px-4 py-2 text-center shadow-xl backdrop-blur">
        <p className="text-[10px] font-medium tracking-wider text-[#e3cfa0] uppercase">Collezione</p>
        <p className="text-xl leading-none font-bold tabular-nums text-[#fff3c4] sm:text-2xl">
          {done}/{total}
        </p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
          <div className="h-full rounded-full bg-gradient-to-r from-[#e3b341] to-[#f0883e] transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-[#e3cfa0]">{pct}%</p>
      </div>
      <div className="absolute right-3 bottom-3 z-[7]">
        <Button variant="secondary" size="lg" onClick={onBucket} data-testid="lobby-bucket-button">
          <Package /> Secchio ({city.bucket.length})
        </Button>
      </div>
    </div>
  );
}
