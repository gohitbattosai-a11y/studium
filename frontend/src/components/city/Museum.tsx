import { Lock, Package } from "lucide-react";
import { useMemo } from "react";
import type { CityState } from "@/lib/city";
import { Button } from "@/components/ui/button";
import FishArt from "./FishArt";
import { THEMES, buildRooms, type ResolvedRoom } from "./rooms";
import "./city.css";

const W = 1000;
const H = 600;
const DOORS: { i: number; cx: number; w: number; h: number }[] = [
  { i: 0, cx: 95, w: 100, h: 180 },
  { i: 1, cx: 215, w: 100, h: 180 },
  { i: 2, cx: 335, w: 100, h: 180 },
  { i: 3, cx: 500, w: 130, h: 215 },
  { i: 4, cx: 665, w: 100, h: 180 },
  { i: 5, cx: 785, w: 100, h: 180 },
  { i: 6, cx: 905, w: 100, h: 180 },
];

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
  const steps = Array.from({ length: n }, (_, i) => {
    const y0 = 520 - i * 22;
    const y1 = y0 - 22;
    const xl = (y: number) => 100 + ((520 - y) / 220) * 50;
    const xr = (y: number) => 360 - ((520 - y) / 220) * 30;
    return { y0, y1, xl0: xl(y0), xr0: xr(y0), xl1: xl(y1), xr1: xr(y1), i };
  });
  return (
    <g>
      {steps.map((s) => (
        <g key={s.i}>
          <polygon points={`${s.xl0},${s.y0} ${s.xr0},${s.y0} ${s.xr1},${s.y1 + 11} ${s.xl1},${s.y1 + 11}`} fill="#6e2f36" />
          <polygon points={`${s.xl1},${s.y1 + 11} ${s.xr1},${s.y1 + 11} ${s.xr1},${s.y1} ${s.xl1},${s.y1}`} fill="#a4505a" />
          <line x1={s.xl1} y1={s.y1} x2={s.xr1} y2={s.y1} stroke="#e6c9a0" strokeWidth="1.5" opacity="0.7" />
        </g>
      ))}
      <polygon points="100,520 150,300 138,300 82,520" fill="#b9a67c" />
      <polygon points="360,520 330,300 342,300 372,520" fill="#9a8760" />
      <path d="M372 512 L342 292" stroke="#4a2f1a" strokeWidth="7" strokeLinecap="round" />
      <path d="M372 508 L342 288" stroke="#8a5a34" strokeWidth="3" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const t = k / 6;
        const x = 366 - t * 24;
        const y = 506 - t * 204;
        return <rect key={k} x={x - 1.5} y={y - 30} width="3" height="30" fill="#5a3d22" />;
      })}
    </g>
  );
}

function Hall() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <linearGradient id="mh-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a68f66" />
          <stop offset="1" stopColor="#d2c19a" />
        </linearGradient>
        <pattern id="mh-tile" width="60" height="30" patternUnits="userSpaceOnUse">
          <rect width="60" height="30" fill="#33423f" />
          <path d="M30 0 L60 15 L30 30 L0 15Z" fill="#3c4d49" />
          <path d="M30 0 L60 15 L30 30 L0 15Z" fill="none" stroke="#25302e" strokeWidth="1.5" />
        </pattern>
        <radialGradient id="mh-warm" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.65" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mh-vig" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#1a0f08" stopOpacity="0" />
          <stop offset="1" stopColor="#1a0f08" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <rect width={W} height="300" fill="url(#mh-wall)" />
      <rect y="0" width={W} height="34" fill="#6e5a3a" />
      <rect y="34" width={W} height="6" fill="#8a7348" />
      <rect y="230" width={W} height="70" fill="#9c8559" />
      <rect y="228" width={W} height="4" fill="#7a6540" />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={i * 50 + 6} y="238" width="38" height="52" fill="#a78f62" stroke="#7a6540" strokeWidth="1.5" />
      ))}
      <rect y="296" width={W} height="14" fill="#6b4a2b" />
      <rect y="296" width={W} height="3" fill="#a37a4d" />
      <rect x="0" y="310" width="100" height="210" fill="#b3a07a" />
      <rect x="900" y="310" width="100" height="210" fill="#b3a07a" />
      {[10, 910].map((x) => (
        <rect key={x} x={x} y="330" width="80" height="170" fill="#9c8a65" stroke="#7a6540" strokeWidth="2" />
      ))}
      <rect x="330" y="310" width="340" height="210" fill="#8a7550" />
      <rect x="330" y="310" width="340" height="8" fill="#6b4a2b" />
      <path d="M410 510 V380 Q410 340 500 340 Q590 340 590 380 V510Z" fill="#5c4a30" />
      <path d="M420 510 V382 Q420 350 500 350 Q580 350 580 382 V510Z" fill="#3c3022" />
      <Stairs />
      <g transform={`translate(${W} 0) scale(-1 1)`}>
        <Stairs />
      </g>
      {[336, 352, 368, 384, 400, 416, 584, 600, 616, 632, 648, 664].map((x) => (
        <rect key={x} x={x} y="268" width="3" height="28" fill="#4a2f1a" />
      ))}
      <rect x="330" y="262" width="100" height="7" rx="2" fill="#8a5a34" />
      <rect x="570" y="262" width="100" height="7" rx="2" fill="#8a5a34" />
      <rect y="520" width={W} height={H - 520} fill="url(#mh-tile)" />
      <rect y="520" width={W} height="6" fill="#1e2826" />
      <rect x="380" y="530" width="240" height="70" rx="4" fill="#8d3f45" opacity="0.8" />
      <rect x="388" y="536" width="224" height="58" rx="3" fill="none" stroke="#e6c9a0" strokeWidth="2" opacity="0.7" />
      {[155, 275, 415, 585, 725, 845].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="86" r="38" fill="url(#mh-warm)" className="ct-glow" style={{ animationDelay: `${i * 0.5}s` }} />
          <rect x={x - 3} y="76" width="6" height="14" rx="2" fill="#ffe9a3" />
          <path d={`M${x - 8} 92 q8 8 16 0`} stroke="#5a3d22" strokeWidth="2" fill="none" />
        </g>
      ))}
      {[345, 655].map((x) => (
        <g key={x}>
          <circle cx={x} cy="372" r="46" fill="url(#mh-warm)" className="ct-glow" />
          <rect x={x - 4} y="362" width="8" height="16" rx="2" fill="#ffe9a3" />
        </g>
      ))}
      <ellipse cx="500" cy="540" rx="200" ry="40" fill="url(#mh-warm)" opacity="0.5" />
      <rect width={W} height={H} fill="url(#mh-vig)" />
      <rect width={W} height={H} fill="#2a1508" opacity="0.12" />
    </svg>
  );
}

function Door({ room, r, cx, w, h, gifts, big, onRoom }: { room: number; r: ResolvedRoom; cx: number; w: number; h: number; gifts: Set<string>; big: boolean; onRoom: (id: string) => void }) {
  const th = THEMES[r.def.theme];
  const c = r.list.filter((s) => gifts.has(s.id)).length;
  const preview = r.list.slice(0, big ? 3 : 2);
  return (
    <button type="button" onClick={() => onRoom(r.def.id)} className="group absolute flex flex-col items-center outline-none" style={{ left: `${((cx - w / 2) / W) * 100}%`, width: `${(w / W) * 100}%`, bottom: `${((H - 296) / H) * 100}%` }} data-testid={`lobby-room-${r.def.id}`} aria-label={`Entra in ${r.def.name}`}>
      <span className="mb-[3%] flex max-w-full flex-col items-center rounded border px-[6%] py-[2%] text-center leading-tight shadow transition-transform duration-150 group-hover:scale-105 group-focus-visible:scale-105" style={{ background: th.plaque, borderColor: th.trim, color: th.plaqueInk, fontSize: "clamp(7px, 1.05vw, 12px)" }}>
        <span className="font-semibold">
          {room + 1}. {r.def.name}
        </span>
        <span className="tabular-nums opacity-80">
          {c}/{r.list.length}
        </span>
      </span>
      <div className="relative w-full overflow-hidden rounded-t-[999px] border-x-[7px] border-t-[7px] transition-transform duration-200 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]" style={{ aspectRatio: `${w}/${h}`, borderColor: th.trim, background: `linear-gradient(180deg, ${th.water[0]}, ${th.water[1]})` }}>
        <div className="ct-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.4),transparent_62%)]" />
        {preview.map((s, k) => (
          <div key={s.id} className="ct-float absolute w-[58%]" style={{ left: `${k % 2 ? 36 : 6}%`, top: `${24 + k * 24}%`, animationDelay: `${k * 0.7}s`, opacity: gifts.has(s.id) ? 1 : 0.55 }}>
            <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} silhouette={!gifts.has(s.id)} className="w-full" />
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
      </div>
    </button>
  );
}

export default function Museum({ city, onRoom, onBucket, onExit }: { city: CityState; onRoom: (id: string) => void; onBucket: () => void; onExit: () => void }) {
  const rooms = useMemo(() => buildRooms(city.species), [city.species]);
  const gifts = useMemo(() => new Set(city.museum.map((d) => d.species_id)), [city.museum]);
  const done = city.museum.length;
  const total = city.species.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#1a0f08]" data-testid="museum-lobby">
      <div className="ct-scroll min-h-0 flex-1 overflow-auto">
        <div className="relative mx-auto min-w-[780px] max-w-[1200px]" style={{ aspectRatio: `${W}/${H}` }}>
          <Hall />
          {DOORS.map((d) => {
            const r = rooms[d.i];
            return r ? <Door key={d.i} room={d.i} r={r} cx={d.cx} w={d.w} h={d.h} gifts={gifts} big={d.i === 3} onRoom={onRoom} /> : null;
          })}

          <div className="absolute flex flex-col items-center justify-center rounded-lg border-[3px] border-[#e3b341] bg-[#2a1d0f]/85 text-center shadow-xl" style={{ left: "43%", top: "58%", width: "14%", height: "24%" }}>
            <p className="text-[clamp(6px,0.8vw,10px)] font-medium tracking-wider text-[#e3cfa0] uppercase">Collezione</p>
            <p className="text-[clamp(14px,2.6vw,30px)] leading-none font-bold tabular-nums text-[#fff3c4]">
              {done}/{total}
            </p>
            <div className="mt-[4%] h-[5%] min-h-1 w-[70%] overflow-hidden rounded-full bg-black/40">
              <div className="h-full rounded-full bg-gradient-to-r from-[#e3b341] to-[#f0883e] transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-[3%] text-[clamp(6px,0.8vw,10px)] text-[#e3cfa0]">{pct}%</p>
          </div>

          <div className="absolute flex flex-col items-center" style={{ left: "46%", top: "72%", width: "8%" }}>
            <Owl />
          </div>

          <div className="absolute flex flex-col items-center" style={{ left: "1.5%", bottom: "13.3%", width: "7%" }}>
            <div className="relative w-full overflow-hidden rounded-t-[999px] border-x-[5px] border-t-[5px] border-[#5a3d22] bg-gradient-to-b from-[#1b1e24] to-[#2b2f38]" style={{ aspectRatio: "70/110" }} data-testid="lobby-left-passage">
              <Lock className="absolute inset-0 m-auto size-1/3 text-[#8B949E]" />
            </div>
          </div>

          <button type="button" onClick={onExit} className="group absolute flex flex-col items-center outline-none" style={{ right: "1.5%", bottom: "13.3%", width: "7%" }} data-testid="lobby-exit" aria-label="Esci in città">
            <div className="relative w-full overflow-hidden rounded-t-[999px] border-x-[5px] border-t-[5px] border-[#5a3d22] transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105" style={{ aspectRatio: "70/110", background: "linear-gradient(180deg,#0b1740,#1d2f66)" }}>
              <div className="absolute inset-x-0 top-[16%] mx-auto size-[22%] rounded-full bg-[#f3f0dc]" />
              <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[#26402a]" />
            </div>
          </button>
        </div>
      </div>
      <div className="relative z-[2] flex h-14 shrink-0 items-center justify-between border-t-2 border-[#3a2616] bg-[#24160c] px-3 sm:px-8">
        <p className="text-xs text-[#e3cfa0]">Animali: prossimamente · Esci dalla porta a destra</p>
        <Button variant="secondary" size="lg" onClick={onBucket} data-testid="lobby-bucket-button">
          <Package /> Secchio ({city.bucket.length})
        </Button>
      </div>
    </div>
  );
}
