import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Anchor, ArrowRightLeft, Bell, Bug, Coffee, Coins, GlassWater, Landmark, Package, Shovel, Sparkles } from "lucide-react";
import type { CityState } from "@/lib/domain/city";
import { ANIMAL_BY_ID } from "@/lib/domain/animals";
import { FOSSIL_BY_ID } from "@/lib/domain/fossils";
import { addBudget } from "@/lib/domain/football";
import { fmtMoney, sellValue, spanFactor, useCityShop, useShopActions, type SellLine, type ShopCategory, type ShopItem, type ShopUpgrade } from "@/lib/domain/shop";
import { discardFossil, releaseAnimal, releaseFish, useSandbox } from "@/lib/runtime/sandbox";
import type { Rarity } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadError, SkeletonList } from "@/components/common";
import { BASE_W, PropArt } from "./Props";
import { Hotspots, Scene3D, floorPt, quadPts, useGeo, wallPt, type HotDef } from "./Room3D";
import { THEMES, type Prop } from "./rooms";
import { RarityTag } from "./Bucket";
import "./city.css";

type Station = "sell" | "bait" | "energy" | "tools" | "swap" | "stadium";

interface Row {
  id: string;
  name: string;
  rarity: Rarity;
  info: string;
  value: number;
  fresh: boolean;
  line: SellLine;
  remove: () => unknown;
}

const META: Record<Station, { title: string; sub: string; tone: string; cats: ShopCategory[] }> = {
  sell: { title: "Il bancone", sub: "Vendi pesci, animali e fossili in cambio di monete.", tone: "#E3B341", cats: [] },
  bait: { title: "Vetrina di esche e fischietti", sub: "Il pane resta gratis. Qui trovi esche migliori e richiami per la foresta.", tone: "#58A6FF", cats: ["esca", "richiamo"] },
  energy: { title: "Scaffale dell'energia", sub: "Per non fermarti proprio sul fossile giusto.", tone: "#E3B341", cats: ["energia"] },
  tools: { title: "Banco degli attrezzi", sub: "Potenziamenti permanenti.", tone: "#F0883E", cats: [] },
  swap: { title: "La cassaforte", sub: "Cambia le monete in punti.", tone: "#7EE787", cats: [] },
  stadium: { title: "Angolo dello stadio", sub: "Trasforma le monete in budget per la tua squadra.", tone: "#A371F7", cats: ["stadio"] },
};

const ICONS: Record<string, ReactNode> = {
  verme: <Bug />,
  mosca: <Bug />,
  brillante: <Sparkles />,
  fischietto_bosco: <Bell />,
  fischietto_argento: <Bell />,
  fischietto_oro: <Bell />,
  caffe: <Coffee />,
  borraccia: <GlassWater />,
  fondi_5: <Landmark />,
  fondi_20: <Landmark />,
  fondi_50: <Landmark />,
  pala: <Shovel />,
  canna: <Anchor />,
};

const TINT: Record<string, string> = { esca: "#58A6FF", richiamo: "#7EE787", energia: "#E3B341", stadio: "#A371F7", upgrade: "#F0883E" };

function Money({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold tabular-nums text-[#F6D77A]", className)}>
      <Coins className="size-3.5" /> {fmtMoney(n)}
    </span>
  );
}

function Case({ tint, icon, children }: { tint: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="relative flex gap-3 overflow-hidden rounded-xl border bg-gradient-to-b from-white/[0.07] to-black/30 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]" style={{ borderColor: `${tint}55` }}>
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border [&>svg]:size-6" style={{ borderColor: `${tint}66`, background: `radial-gradient(circle at 50% 30%, ${tint}33, transparent 70%)`, color: tint }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Chip({ x, y, children, onClick, tone }: { x: number; y: number; children: ReactNode; onClick?: () => void; tone?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow backdrop-blur transition-colors enabled:hover:bg-black/75" style={{ left: x, top: y, borderColor: tone ? `${tone}99` : undefined }}>
      {children}
    </button>
  );
}

function Keeper() {
  return (
    <svg viewBox="0 0 120 150" className="w-full drop-shadow-lg" aria-hidden>
      <ellipse cx="60" cy="132" rx="38" ry="10" fill="#000000" opacity="0.25" />
      <path d="M22 150 Q20 96 60 92 Q100 96 98 150Z" fill="#9a6a3a" />
      <path d="M34 150 V108 Q60 98 86 108 V150Z" fill="#e8d3a2" />
      <path d="M44 112 H76 V128 H44Z" fill="#d7bd86" />
      <circle cx="26" cy="64" r="13" fill="#6b5a4a" />
      <circle cx="94" cy="64" r="13" fill="#6b5a4a" />
      <circle cx="26" cy="64" r="6" fill="#d9b99b" />
      <circle cx="94" cy="64" r="6" fill="#d9b99b" />
      <ellipse cx="60" cy="74" rx="38" ry="34" fill="#8a7765" />
      <path d="M28 70 Q60 52 92 70 Q88 88 60 84 Q32 88 28 70Z" fill="#3a2f27" />
      <ellipse cx="60" cy="86" rx="22" ry="17" fill="#f2e6d3" />
      <g className="ct-blink">
        <circle cx="45" cy="70" r="6" fill="#f8f3e4" />
        <circle cx="75" cy="70" r="6" fill="#f8f3e4" />
        <circle cx="46" cy="71" r="3.2" fill="#1b1b1b" />
        <circle cx="74" cy="71" r="3.2" fill="#1b1b1b" />
        <circle cx="45" cy="69.6" r="1" fill="#ffffff" />
        <circle cx="73" cy="69.6" r="1" fill="#ffffff" />
      </g>
      <ellipse cx="60" cy="82" rx="5" ry="3.6" fill="#2b2118" />
      <path d="M52 91 Q60 98 68 91" stroke="#6b4a2b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M44 56 q16 -9 32 0" stroke="#3a2f27" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M42 36 q18 -20 36 0Z" fill="#5a3d22" />
      <rect x="38" y="34" width="44" height="6" rx="2" fill="#7a5230" />
    </svg>
  );
}

function ShelfBottles() {
  const cols = ["#e5484d", "#4aa3ff", "#7ee787", "#f6c453", "#a371f7", "#ff9f43"];
  return (
    <g>
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3, 4].map((k) => {
          const x = 98 + k * 46;
          const y = [226, 310, 388][r];
          const c = cols[(r * 5 + k) % cols.length];
          return (
            <g key={`${r}-${k}`} transform={`translate(${x} ${y})`}>
              <rect x="-4" y="-34" width="8" height="12" rx="1" fill="#d9c9a0" />
              <rect x="-6" y="-36" width="12" height="4" rx="1" fill="#8a5a34" />
              <path d="M-4 -22 Q-20 -16 -18 -2 Q-18 8 0 8 Q18 8 18 -2 Q20 -16 4 -22Z" fill={c} opacity="0.92" />
              <path d="M-12 -8 Q-12 -14 -6 -15" stroke="#ffffff" strokeWidth="2" opacity="0.5" fill="none" strokeLinecap="round" />
            </g>
          );
        }),
      )}
    </g>
  );
}

function BackArt() {
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <linearGradient id="sh-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8693a" />
          <stop offset="1" stopColor="#c98a4c" />
        </linearGradient>
        <radialGradient id="sh-warm" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sh-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8995a3" />
          <stop offset="1" stopColor="#4d5865" />
        </linearGradient>
      </defs>
      <rect width="1000" height="600" fill="url(#sh-wall)" />
      {Array.from({ length: 14 }, (_, i) => (
        <g key={i}>
          <rect x="0" y={i * 46} width="1000" height="44" fill={i % 2 ? "#b87a44" : "#c58850"} />
          <rect x="0" y={i * 46} width="1000" height="3" fill="#e4b070" opacity="0.55" />
          <rect x="0" y={i * 46 + 41} width="1000" height="5" fill="#5a3a1c" opacity="0.7" />
        </g>
      ))}
      <rect x="0" y="0" width="1000" height="46" fill="#5a3a1c" />
      <rect x="0" y="40" width="1000" height="8" fill="#7a5230" />
      <rect x="0" y="0" width="36" height="600" fill="#5a3a1c" />
      <rect x="964" y="0" width="36" height="600" fill="#5a3a1c" />
      <rect x="36" y="0" width="5" height="600" fill="#3a2412" opacity="0.5" />
      <rect x="959" y="0" width="5" height="600" fill="#3a2412" opacity="0.5" />

      <rect x="396" y="62" width="208" height="76" rx="8" fill="#5a3a1c" />
      <rect x="404" y="70" width="192" height="60" rx="5" fill="#d9a35a" />
      <rect x="404" y="70" width="192" height="12" rx="5" fill="#ffffff" opacity="0.18" />
      <path d="M500 62 V46 M420 62 V46 M580 62 V46" stroke="#3a2412" strokeWidth="4" />
      <circle cx="430" cy="100" r="16" fill="#f6c453" stroke="#b9852f" strokeWidth="3" />
      <circle cx="570" cy="100" r="16" fill="#f6c453" stroke="#b9852f" strokeWidth="3" />

      {[200, 800].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 46 V86`} stroke="#3a2412" strokeWidth="3" />
          <circle cx={x} cy="110" r="58" fill="url(#sh-warm)" className="ct-glow" style={{ animationDelay: `${i * 0.7}s` }} />
          <rect x={x - 12} y="86" width="24" height="34" rx="6" fill="#ffe9a3" />
          <rect x={x - 15} y="82" width="30" height="7" rx="2" fill="#3a2412" />
          <rect x={x - 15} y="118" width="30" height="6" rx="2" fill="#3a2412" />
        </g>
      ))}

      <rect x="62" y="150" width="276" height="260" rx="4" fill="#5a3a1c" />
      <rect x="72" y="160" width="256" height="240" fill="#2d1b0d" />
      {[238, 322, 400].map((y) => (
        <g key={y}>
          <rect x="72" y={y - 4} width="256" height="9" fill="#8a5a2f" />
          <rect x="72" y={y - 4} width="256" height="2.4" fill="#e4b070" opacity="0.5" />
        </g>
      ))}
      <ShelfBottles />

      <rect x="62" y="446" width="276" height="22" rx="3" fill="#b97a3c" />
      <rect x="62" y="446" width="276" height="5" fill="#e4b070" opacity="0.6" />
      <rect x="78" y="468" width="16" height="132" fill="#6b4524" />
      <rect x="306" y="468" width="16" height="132" fill="#6b4524" />
      <rect x="94" y="520" width="212" height="12" fill="#8a5a2f" />
      <g transform="translate(110 446)">
        <rect x="40" y="-14" width="8" height="14" fill="#3a3f47" />
        <path d="M20 -14 H70 L62 -26 H28Z" fill="#6b7480" />
        <rect x="28" y="-30" width="34" height="6" rx="2" fill="#8995a3" />
      </g>
      <g transform="translate(220 446)">
        <rect x="-3" y="-46" width="7" height="46" fill="#8a5a34" transform="rotate(22)" />
        <path d="M-14 -50 L16 -48 L12 -40 L-12 -42Z" fill="#9aa4ae" transform="rotate(22) translate(0 -4)" />
        <rect x="42" y="-18" width="36" height="18" rx="3" fill="#a77f50" />
        <path d="M42 -10 H78" stroke="#5a3d22" strokeWidth="2" />
      </g>
      <path d="M96 590 L112 540 L130 590Z" fill="#6b4524" />
      <rect x="110" y="480" width="40" height="26" rx="3" fill="#c2553f" />
      <rect x="116" y="476" width="28" height="6" rx="2" fill="#e2e2e2" />

      <rect x="352" y="410" width="296" height="190" fill="#8a5a2f" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={366 + i * 96} y="430" width="84" height="150" rx="3" fill="#6b4524" />
          <rect x={372 + i * 96} y="436" width="72" height="138" rx="2" fill="#9a6a3a" />
          <rect x={372 + i * 96} y="436" width="72" height="8" fill="#ffffff" opacity="0.12" />
        </g>
      ))}
      <rect x="338" y="392" width="324" height="24" rx="4" fill="#c98a4c" />
      <rect x="338" y="392" width="324" height="6" rx="3" fill="#f0c58a" opacity="0.7" />
      <rect x="338" y="412" width="324" height="4" fill="#5a3a1c" opacity="0.6" />
      <g transform="translate(576 392)">
        <rect x="-4" y="-54" width="64" height="52" rx="5" fill="#d9d2c0" />
        <rect x="2" y="-48" width="52" height="20" rx="3" fill="#2b3a2b" />
        <rect x="6" y="-44" width="32" height="6" rx="2" fill="#7ee787" opacity="0.8" />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={6 + k * 12} y="-22" width="9" height="8" rx="2" fill="#8a8473" />
        ))}
        <rect x="-8" y="-4" width="72" height="6" rx="2" fill="#a39b86" />
      </g>
      <g transform="translate(388 392)">
        <circle cx="12" cy="-12" r="12" fill="#e5484d" />
        <path d="M12 -24 q4 -8 10 -8" stroke="#3f9a4a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="8" cy="-16" r="3" fill="#ffffff" opacity="0.4" />
        <rect x="44" y="-30" width="30" height="30" rx="5" fill="#bfe3f0" opacity="0.9" />
        <ellipse cx="59" cy="-8" rx="10" ry="4" fill="#f6c453" />
        <ellipse cx="59" cy="-12" rx="10" ry="4" fill="#f6c453" />
        <rect x="44" y="-34" width="30" height="6" rx="2" fill="#8a5a34" />
      </g>

      <rect x="740" y="140" width="140" height="170" rx="4" fill="#5a3a1c" />
      <rect x="750" y="150" width="120" height="150" fill="#f1e3c4" />
      <path d="M810 176 L822 208 L856 210 L830 230 L840 262 L810 244 L780 262 L790 230 L764 210 L798 208Z" fill="#f6c453" stroke="#b9852f" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="810" cy="296" r="2" fill="#b9852f" />

      <rect x="722" y="372" width="176" height="228" rx="10" fill="url(#sh-steel)" />
      <rect x="722" y="372" width="176" height="10" rx="5" fill="#ffffff" opacity="0.2" />
      <rect x="738" y="388" width="144" height="196" rx="6" fill="#6c7886" stroke="#3a4350" strokeWidth="3" />
      <circle cx="810" cy="470" r="38" fill="#3a4350" />
      <circle cx="810" cy="470" r="31" fill="#97a3b1" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d="M810 442 v7" stroke="#2b3340" strokeWidth={i % 3 ? 1.5 : 3} transform={`rotate(${i * 30} 810 470)`} />
      ))}
      <path d="M810 470 L810 450" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" />
      <circle cx="810" cy="470" r="6" fill="#3a4350" />
      <rect x="846" y="448" width="24" height="46" rx="6" fill="#b9852f" />
      <rect x="850" y="452" width="8" height="38" rx="3" fill="#f6c453" />
      {[[748, 398], [872, 398], [748, 572], [872, 572]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill="#3a4350" />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${750 + i * 46} 372)`}>
          {[0, 1, 2, 3].map((k) => (
            <ellipse key={k} cx="14" cy={-4 - k * 6} rx="14" ry="5" fill="#f6c453" stroke="#b9852f" strokeWidth="1.5" />
          ))}
        </g>
      ))}
    </svg>
  );
}

function CabinetArt() {
  return (
    <svg viewBox="0 0 200 230" className="absolute size-full" aria-hidden>
      <rect x="6" y="6" width="188" height="218" rx="8" fill="#5a3a1c" />
      <rect x="14" y="14" width="172" height="202" rx="4" fill="#1e1209" />
      <rect x="14" y="14" width="172" height="202" rx="4" fill="#9fd3ee" opacity="0.18" />
      {[84, 150, 214].map((y) => (
        <rect key={y} x="14" y={y - 8} width="172" height="8" fill="#8a5a2f" />
      ))}
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${38 + k * 52} 76)`}>
          <rect x="-12" y="-30" width="24" height="30" rx="4" fill="#bfe3f0" opacity="0.85" />
          <rect x="-14" y="-34" width="28" height="6" rx="2" fill="#8a5a34" />
          <path d="M-6 -14 q6 -8 12 0 q-6 8 -12 0Z" fill="#c2553f" />
        </g>
      ))}
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${38 + k * 52} 142)`}>
          <path d="M-8 -6 q8 -16 16 0 v8 h-16Z" fill={["#cfd4da", "#cbd5e1", "#f6c453"][k]} stroke="#6b7480" strokeWidth="1.5" />
          <circle cx="0" cy="-22" r="3" fill="#6b7480" />
        </g>
      ))}
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${38 + k * 52} 206)`}>
          <path d={`M-14 -4 q14 -18 28 0 q-14 10 -28 0Z`} fill={["#2a8fb3", "#7ee787", "#a371f7"][k]} />
          <path d="M14 -4 l8 -6 v12Z" fill={["#2a8fb3", "#7ee787", "#a371f7"][k]} />
          <circle cx="-6" cy="-5" r="1.6" fill="#ffffff" />
        </g>
      ))}
      <rect x="14" y="14" width="40" height="202" fill="#ffffff" opacity="0.08" />
    </svg>
  );
}

function StadiumWallArt() {
  return (
    <svg viewBox="0 0 200 230" className="absolute size-full" aria-hidden>
      <path d="M10 14 Q100 40 190 14" stroke="#3a2412" strokeWidth="2.4" fill="none" />
      {[0, 1, 2, 3, 4].map((k) => {
        const x = 26 + k * 37;
        const y = 22 + Math.sin(k * 0.9) * 8;
        return <path key={k} d={`M${x - 11} ${y} H${x + 11} L${x} ${y + 34}Z`} fill={["#2563eb", "#e11d48", "#fbbf24", "#16a34a", "#a371f7"][k]} />;
      })}
      <rect x="22" y="80" width="156" height="130" rx="6" fill="#5a3a1c" />
      <rect x="30" y="88" width="140" height="114" fill="#1f4a2c" />
      <rect x="30" y="88" width="140" height="114" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
      <path d="M100 88 V202" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
      <circle cx="100" cy="145" r="20" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
      <rect x="30" y="118" width="22" height="54" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
      <rect x="148" y="118" width="22" height="54" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
      <g transform="translate(100 138)">
        <path d="M-16 40 h32 l-4 -14 h-24Z" fill="#b9852f" />
        <rect x="-3" y="-4" width="6" height="30" fill="#d9a233" />
        <path d="M-18 -30 H18 Q18 -6 0 -2 Q-18 -6 -18 -30Z" fill="#f6c453" stroke="#b9852f" strokeWidth="2" />
        <path d="M-18 -26 q-14 2 -10 14 q4 8 14 4 M18 -26 q14 2 10 14 q-4 8 -14 4" stroke="#b9852f" strokeWidth="3" fill="none" />
        <path d="M-9 -26 q-1 12 4 18" stroke="#ffffff" strokeWidth="3" opacity="0.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const FLOOR_PROPS: { p: Prop; u: number; z: number }[] = [
  { p: "barrel", u: 0.08, z: 0.34 },
  { p: "crate", u: 0.93, z: 0.34 },
  { p: "ficus", u: 0.06, z: 0.62 },
  { p: "ficus", u: 0.94, z: 0.62 },
  { p: "amphora", u: 0.24, z: 0.7 },
  { p: "barrel", u: 0.8, z: 0.7 },
  { p: "lamp", u: 0.14, z: 0.46 },
  { p: "lamp", u: 0.86, z: 0.46 },
];

export default function Shop({ city, participating, onExit }: { city: CityState; participating: boolean; onExit: () => void }) {
  const { ref, g } = useGeo();
  const [station, setStation] = useState<Station | null>(null);
  const shop = useCityShop(true);
  const act = useShopActions();
  const sb = useSandbox();
  const data = shop.data;
  const busy = act.sell.isPending || act.buy.isPending || act.upgrade.isPending || act.convert.isPending;
  const th = THEMES.lake;

  const speciesById = useMemo(() => new Map(city.species.map((s) => [s.id, s])), [city.species]);

  const fishRows: Row[] = sb.fishBucket.map((f) => {
    const sp = speciesById.get(f.species_id);
    const factor = sp ? spanFactor(f.length, sp.min_cm, sp.max_cm) : 0.5;
    return {
      id: f.id,
      name: f.name,
      rarity: f.rarity,
      info: `${f.length} cm`,
      value: sellValue("fish", f.rarity, factor),
      fresh: !sb.fishMuseum.some((d) => d.species_id === f.species_id),
      line: { kind: "fish", species_id: f.species_id, length: f.length },
      remove: () => releaseFish(f.id),
    };
  });

  const animalRows: Row[] = sb.animalBag.flatMap((a) => {
    const sp = ANIMAL_BY_ID[a.species_id];
    if (!sp) return [];
    const factor = spanFactor(a.weight, sp.min_kg, sp.max_kg);
    return [
      {
        id: a.id,
        name: sp.name,
        rarity: sp.rarity,
        info: `${a.weight} kg`,
        value: sellValue("animal", sp.rarity, factor),
        fresh: !sb.animalMuseum.some((d) => d.species_id === a.species_id),
        line: { kind: "animal", rarity: sp.rarity, factor },
        remove: () => releaseAnimal(a.id),
      },
    ];
  });

  const fossilRows: Row[] = sb.fossilBag.flatMap((x) => {
    const sp = FOSSIL_BY_ID[x.species_id];
    if (!sp) return [];
    const factor = x.integrity / 100;
    return [
      {
        id: x.id,
        name: sp.name,
        rarity: sp.rarity,
        info: `Integrità ${Math.round(x.integrity)}%`,
        value: sellValue("fossil", sp.rarity, factor),
        fresh: !sb.fossilMuseum.some((d) => d.species_id === x.species_id),
        line: { kind: "fossil", rarity: sp.rarity, factor },
        remove: () => discardFossil(x.id),
      },
    ];
  });

  const sellRows = async (rows: Row[]) => {
    if (rows.length === 0 || busy) return;
    try {
      const res = await act.sell.mutateAsync(rows.map((r) => r.line));
      rows.forEach((r) => r.remove());
      toast.success(`Venduto: +${fmtMoney(res.earned ?? 0)} monete`);
    } catch {
      return;
    }
  };

  const buy = async (item: ShopItem, qty: number) => {
    try {
      const res = await act.buy.mutateAsync({ item_id: item.id, qty });
      if (res.granted) {
        addBudget(res.granted);
        toast.success(`Budget dello stadio +${res.granted} M`);
      } else {
        toast.success(`${item.name} ×${qty}`);
      }
    } catch {
      return;
    }
  };

  const upgrade = async (u: ShopUpgrade) => {
    try {
      await act.upgrade.mutateAsync(u.id);
      toast.success(`${u.name}: livello ${u.level + 1}`);
    } catch {
      return;
    }
  };

  const convert = async () => {
    try {
      await act.convert.mutateAsync(1);
      toast.success("Hai guadagnato 1 punto!");
    } catch {
      return;
    }
  };

  const sections: { title: string; rows: Row[] }[] = [
    { title: "Pesci nel secchio", rows: fishRows },
    { title: "Animali nello zaino", rows: animalRows },
    { title: "Fossili nello zaino", rows: fossilRows },
  ];

  const itemCards = (cats: ShopCategory[]) =>
    (data?.items ?? [])
      .filter((i) => cats.includes(i.category))
      .map((i) => (
        <Case key={i.id} tint={TINT[i.category]} icon={ICONS[i.id]}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold">{i.name}</p>
            {i.category !== "stadio" && <span className="shrink-0 rounded-full bg-black/40 px-2 py-0.5 text-[11px] tabular-nums text-[#d8c8ac]">hai {i.owned}</span>}
          </div>
          <p className="mt-0.5 text-xs leading-snug text-[#bfae92]">{i.description}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Money n={i.price} className="text-sm" />
            <div className="flex gap-1.5">
              <Button size="sm" variant="secondary" disabled={busy || (data?.money ?? 0) < i.price} onClick={() => buy(i, 1)} data-testid={`shop-buy-${i.id}`}>
                Compra
              </Button>
              {i.category !== "stadio" && (
                <Button size="sm" variant="outline" disabled={busy || (data?.money ?? 0) < i.price * 5} onClick={() => buy(i, 5)}>
                  ×5
                </Button>
              )}
            </div>
          </div>
        </Case>
      ));

  const panel = () => {
    if (!data || !station) return null;
    if (station === "sell")
      return (
        <div className="space-y-5">
          <p className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-[#bfae92]">Quello che vendi sparisce dallo zaino: le specie nuove per il museo conviene donarle prima.</p>
          {sections.map((sec) => (
            <section key={sec.title}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold tracking-wide text-[#F6D77A] uppercase">{sec.title}</h3>
                {sec.rows.length > 1 && (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => sellRows(sec.rows)}>
                    Vendi tutto <Money n={sec.rows.reduce((t, r) => t + r.value, 0)} />
                  </Button>
                )}
              </div>
              {sec.rows.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/15 px-3 py-4 text-center text-xs text-[#bfae92]">Niente da vendere qui.</p>
              ) : (
                <ul className="space-y-1.5">
                  {sec.rows.map((r) => (
                    <li key={r.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.name}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#bfae92]">
                          <RarityTag rarity={r.rarity} />
                          <span className="tabular-nums">{r.info}</span>
                          {r.fresh && <span className="rounded border border-[#3FB950]/40 px-1.5 py-0.5 text-[10px] text-[#7EE787]">Nuova per il museo</span>}
                        </div>
                      </div>
                      <Button size="sm" variant="secondary" disabled={busy} onClick={() => sellRows([r])} data-testid="shop-sell">
                        <Money n={r.value} className="text-[#2a1a0e]" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      );
    if (station === "tools")
      return (
        <div className="grid gap-2.5">
          {data.upgrades.map((u) => (
            <Case key={u.id} tint={TINT.upgrade} icon={ICONS[u.id]}>
              <p className="text-sm font-semibold">{u.name}</p>
              <p className="mt-0.5 text-xs leading-snug text-[#bfae92]">{u.description}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex gap-1" aria-label={`Livello ${u.level} di ${u.max_level}`}>
                  {Array.from({ length: u.max_level }, (_, k) => (
                    <span key={k} className={cn("h-2 w-5 rounded-full", k < u.level ? "bg-[#F0883E]" : "bg-black/40")} />
                  ))}
                </div>
                {u.next_price === null ? (
                  <span className="text-xs font-semibold text-[#7EE787]">Massimo</span>
                ) : (
                  <Button size="sm" variant="secondary" disabled={busy || data.money < u.next_price} onClick={() => upgrade(u)} data-testid={`shop-upgrade-${u.id}`}>
                    <Money n={u.next_price} className="text-[#2a1a0e]" />
                  </Button>
                )}
              </div>
            </Case>
          ))}
        </div>
      );
    if (station === "swap")
      return (
        <div className="space-y-3">
          <Case tint="#E3B341" icon={<ArrowRightLeft />}>
            <p className="text-sm font-semibold">Cambio in punti</p>
            <p className="mt-0.5 text-xs leading-snug text-[#bfae92]">
              {fmtMoney(data.convert.rate)} monete = 1 punto. Il cambio va solo in questa direzione e ogni giorno puoi cambiare al massimo {data.convert.daily_cap} {data.convert.daily_cap === 1 ? "punto" : "punti"}.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
              <div className="h-full rounded-full bg-gradient-to-r from-[#E3B341] to-[#F0883E] transition-[width]" style={{ width: `${Math.min(100, (data.money / data.convert.rate) * 100)}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-[#bfae92]">
              <Money n={data.money} />
              <span className="tabular-nums">{fmtMoney(data.convert.rate)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-[#d8c8ac]">Oggi: ancora {data.convert.left_today}</span>
              <Button size="sm" disabled={busy || !participating || data.convert.left_today < 1 || data.money < data.convert.rate} onClick={convert} data-testid="shop-convert">
                Cambia 1 punto
              </Button>
            </div>
            {!participating && <p className="mt-2 text-xs text-[#FF7B72]">Attiva la partecipazione nello shop per poter cambiare le monete in punti.</p>}
          </Case>
          <p className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-[#bfae92]">Un pesce mitico vale al massimo 600 monete: per un punto ne servono tanti.</p>
        </div>
      );
    return <div className="grid gap-2.5 sm:grid-cols-2">{itemCards(META[station].cats)}</div>;
  };

  const open = (s: Station) => () => setStation(s);

  const hots: HotDef[] = g
    ? [
        { key: "shelf", pts: quadPts(g, "back", 6, 25, 28, 42), label: "Scaffale dell'energia", onClick: open("energy"), tone: META.energy.tone },
        { key: "bench", pts: quadPts(g, "back", 6, 74, 28, 26), label: "Banco degli attrezzi", onClick: open("tools"), tone: META.tools.tone },
        { key: "counter", pts: quadPts(g, "back", 34, 48, 32, 52), label: "Bancone: vendi", onClick: open("sell"), tone: META.sell.tone },
        { key: "safe", pts: quadPts(g, "back", 72, 62, 18, 38), label: "Cassaforte: cambia in punti", onClick: open("swap"), tone: META.swap.tone },
        { key: "cab", pts: quadPts(g, "left", 28, 22, 44, 62), label: "Vetrina di esche e fischietti", onClick: open("bait"), tone: META.bait.tone },
        { key: "stad", pts: quadPts(g, "right", 28, 22, 44, 62), label: "Angolo dello stadio", onClick: open("stadium"), tone: META.stadium.tone },
      ]
    : [];

  return (
    <div ref={ref} className="ct-dolly absolute inset-0 bg-[#1a0f08]" data-testid="city-shop">
      {g && (
        <Scene3D
          g={g}
          wallBack={{ backgroundColor: "#b87a44" }}
          wallSide={{ backgroundColor: "#a8693a", backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(0,0,0,0.3)), repeating-linear-gradient(0deg, rgba(60,30,10,0.35) 0 4px, transparent 4px 46px)", filter: "brightness(0.88)" }}
          wallFloor={{ backgroundColor: "#8a5a2f", backgroundImage: "repeating-linear-gradient(90deg, rgba(40,20,5,0.4) 0 3px, transparent 3px 64px), repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 40px, rgba(0,0,0,0.06) 40px 80px)" }}
          wallCeil={{ backgroundColor: "#4d3320", backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.1))" }}
          back={
            <>
              <BackArt />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_50%,rgba(26,15,8,0.5))]" />
            </>
          }
          left={
            <>
              <div className="absolute inset-x-0 bottom-0 h-[12%] border-t-[6px] border-[#4a2f1a] bg-[#7a4a25]" />
              <div className="absolute" style={{ left: "28%", top: "22%", width: "44%", height: "62%" }}>
                <CabinetArt />
              </div>
              <div className="ct-glow pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(255,217,138,0.7),transparent_70%)]" style={{ left: "44%", top: "8%", width: 140, height: 140 }} />
            </>
          }
          right={
            <>
              <div className="absolute inset-x-0 bottom-0 h-[12%] border-t-[6px] border-[#4a2f1a] bg-[#7a4a25]" />
              <div className="absolute" style={{ left: "28%", top: "22%", width: "44%", height: "62%" }}>
                <StadiumWallArt />
              </div>
              <div className="ct-glow pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(255,217,138,0.7),transparent_70%)]" style={{ left: "44%", top: "8%", width: 140, height: 140, animationDelay: "0.8s" }} />
            </>
          }
          ceil={
            <>
              {[10, 30, 50, 70, 90].map((y) => (
                <div key={y} className="absolute inset-x-0 h-[3%]" style={{ top: `${y}%`, background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.5))" }} />
              ))}
              <div className="ct-beam absolute rounded-sm bg-[#fff4c8]/60 shadow-[0_0_40px_rgba(255,244,200,0.8)]" style={{ left: "38%", top: "40%", width: "24%", height: "26%" }} />
            </>
          }
          floor={
            <>
              <div className="absolute rounded-md border-[8px] border-[#e6c9a0]/80 bg-[#a6362f]" style={{ left: "27%", top: "18%", width: "46%", height: "62%" }}>
                <div className="absolute inset-[7%] border-2 border-dashed border-[#f6d77a]/70" />
                <div className="absolute inset-[22%] rotate-45 border-2 border-[#f6d77a]/55" />
              </div>
              <div className="ct-beam absolute left-1/2 top-[26%] -translate-x-1/2 rounded-[50%]" style={{ width: "30%", height: "34%", background: "radial-gradient(ellipse, rgba(255,244,200,0.35), transparent 70%)" }} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/25" />
            </>
          }
        >
          <Hotspots items={hots} />
          {[...FLOOR_PROPS].sort((a, b) => b.z - a.z).map((p, i) => {
            const pt = floorPt(g, p.u, p.z);
            const wpx = BASE_W[p.p] * pt.s * Math.max(0.8, g.w / 1500);
            return (
              <div key={i} className="absolute [&_svg]:w-full" style={{ left: pt.x, top: pt.y, width: wpx, transform: "translate(-50%, -100%)" }}>
                <div className="mx-auto" style={{ width: p.p === "lamp" ? "40%" : "100%" }}>
                  <PropArt p={p.p} th={th} />
                </div>
              </div>
            );
          })}
          {(() => {
            const k = wallPt(g, "back", 50, 52);
            const sh = wallPt(g, "back", 20, 21);
            const wb = wallPt(g, "back", 20, 71);
            const co = wallPt(g, "back", 50, 44);
            const sf = wallPt(g, "back", 81, 58);
            const ca = wallPt(g, "left", 50, 18);
            const st = wallPt(g, "right", 50, 18);
            return (
              <>
                <div className="absolute" style={{ left: k.x, top: k.y, width: 110 * k.s * Math.max(0.8, g.w / 1500), transform: "translate(-50%,-100%)" }}>
                  <Keeper />
                </div>
                <Chip x={sh.x} y={sh.y} onClick={open("energy")} tone={META.energy.tone}>
                  Energia
                </Chip>
                <Chip x={wb.x} y={wb.y} onClick={open("tools")} tone={META.tools.tone}>
                  Attrezzi
                </Chip>
                <Chip x={co.x} y={co.y} onClick={open("sell")} tone={META.sell.tone}>
                  Vendi
                </Chip>
                <Chip x={sf.x} y={sf.y} onClick={open("swap")} tone={META.swap.tone}>
                  Cambio in punti
                </Chip>
                <Chip x={ca.x} y={ca.y} onClick={open("bait")} tone={META.bait.tone}>
                  Esche e fischietti
                </Chip>
                <Chip x={st.x} y={st.y} onClick={open("stadium")} tone={META.stadium.tone}>
                  Stadio
                </Chip>
              </>
            );
          })()}
        </Scene3D>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_55%,rgba(20,8,4,0.55))]" />
      <div className="pointer-events-none absolute inset-0 bg-[#2a1508]/10" />
      {data && (
        <div className="absolute top-14 right-3 z-[3] rounded-full border border-[#E3B341]/50 bg-black/60 px-3 py-1.5 text-sm backdrop-blur" data-testid="shop-money">
          <Money n={data.money} />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 z-[3] flex justify-center">
        <button type="button" onClick={onExit} className="group flex w-[min(180px,30vw)] flex-col items-center outline-none" data-testid="shop-exit" aria-label="Esci in città">
          <span className="mb-1 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">Esci in città</span>
          <div className="relative h-[min(16vh,110px)] w-full overflow-hidden rounded-t-[999px] border-x-[8px] border-t-[8px] border-[#4a3320] transition-[filter] group-hover:brightness-125 group-focus-visible:brightness-125" style={{ background: "linear-gradient(180deg,#0b1740,#1d2f66)" }}>
            <div className="absolute inset-x-0 top-[18%] mx-auto size-[22%] rounded-full bg-[#f3f0dc]" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[#26402a]" />
          </div>
        </button>
      </div>
      <Button variant="secondary" size="lg" className="absolute bottom-4 left-4 z-[3]" onClick={open("sell")} data-testid="shop-sell-button">
        <Package /> Vendi
      </Button>

      <Dialog open={station !== null} onOpenChange={(o) => !o && setStation(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-[#E3B341]/30 bg-[#2a1a0e] text-[#F3E7D3] sm:max-w-xl">
          {station && (
            <>
              <DialogHeader>
                <DialogTitle>{META[station].title}</DialogTitle>
                <DialogDescription>{META[station].sub}</DialogDescription>
              </DialogHeader>
              {data && (
                <div className="flex justify-end">
                  <Money n={data.money} className="rounded-full border border-[#E3B341]/40 bg-black/30 px-3 py-1 text-sm" />
                </div>
              )}
              {shop.isPending ? <SkeletonList /> : shop.isError || !data ? <LoadError testId="shop-error" /> : panel()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
