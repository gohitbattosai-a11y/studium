import { Lock, Package } from "lucide-react";
import { useMemo } from "react";
import type { CityState } from "@/lib/city";
import { Button } from "@/components/ui/button";
import FishArt from "./FishArt";
import { BASE_W, PropArt } from "./Props";
import { Hotspots, Scene3D, floorPt, planePt, quadPts, useGeo, wallPt, type HotDef } from "./Room3D";
import { THEMES, type Prop } from "./rooms";
import { buildRooms } from "./rooms";
import "./city.css";

function Chip({ x, y, children, onClick, tone }: { x: number; y: number; children: React.ReactNode; onClick?: () => void; tone?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow backdrop-blur transition-colors enabled:hover:bg-black/75" style={{ left: x, top: y, borderColor: tone ? `${tone}99` : undefined }}>
      {children}
    </button>
  );
}

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

function BackArt() {
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <linearGradient id="at-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a68f66" />
          <stop offset="1" stopColor="#d2c19a" />
        </linearGradient>
        <radialGradient id="at-warm" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="600" fill="url(#at-wall)" />
      <rect width="1000" height="34" fill="#6e5a3a" />
      <rect y="34" width="1000" height="6" fill="#8a7348" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={i * 130 - 10} y="40" width="14" height="260" fill="#c4b088" opacity="0.5" />
      ))}
      <rect y="230" width="1000" height="70" fill="#9c8559" />
      <rect y="228" width="1000" height="4" fill="#7a6540" />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={i * 50 + 6} y="238" width="38" height="52" fill="#a78f62" stroke="#7a6540" strokeWidth="1.5" />
      ))}
      <rect y="296" width="1000" height="14" fill="#6b4a2b" />
      <rect y="296" width="1000" height="3" fill="#a37a4d" />
      <rect x="0" y="310" width="100" height="290" fill="#b3a07a" />
      <rect x="900" y="310" width="100" height="290" fill="#b3a07a" />
      <rect x="330" y="310" width="340" height="290" fill="#8a7550" />
      <rect x="330" y="310" width="340" height="8" fill="#6b4a2b" />
      <path d="M410 600 V390 Q410 340 500 340 Q590 340 590 390 V600Z" fill="#5c4a30" />
      <path d="M422 600 V392 Q422 352 500 352 Q578 352 578 392 V600Z" fill="#14100a" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={440 + i * 3} y={420 + i * 26} width={120 - i * 6} height="6" fill="#2b2216" opacity="0.9" />
      ))}
      <path d="M435 296 V150 Q435 82 500 82 Q565 82 565 150 V296Z" fill="#6b4a2b" />
      <path d="M447 296 V152 Q447 96 500 96 Q553 96 553 152 V296Z" fill="#241a10" />
      <path d="M435 296 V150 Q435 82 500 82 Q565 82 565 150" fill="none" stroke="#e3b341" strokeWidth="3" />
      {[95, 215, 335, 665, 785, 905].map((x) => (
        <g key={x}>
          <rect x={x - 42} y="108" width="84" height="116" fill="#6b4a2b" />
          <rect x={x - 34} y="116" width="68" height="100" fill="#2a2418" />
          <rect x={x - 34} y="116" width="68" height="100" fill="none" stroke="#e3b341" strokeWidth="2" opacity="0.6" />
        </g>
      ))}
      {[155, 275, 725, 845].map((x) => (
        <g key={x}>
          <rect x={x - 11} y="40" width="22" height="3" fill="#e3b341" />
          <path d={`M${x - 11} 43 H${x + 11} V122 L${x} 134 L${x - 11} 122Z`} fill="#8d2f36" />
          <path d={`M${x - 7} 49 H${x + 7} V117 L${x} 126 L${x - 7} 117Z`} fill="none" stroke="#e3b341" strokeWidth="1.5" />
          <path d={`M${x - 5} 84 q5 -7 10 0 q-5 7 -10 0Z`} fill="#e3b341" />
        </g>
      ))}
      <circle cx="500" cy="52" r="26" fill="#6b4a2b" />
      <circle cx="500" cy="52" r="21" fill="#f6efd8" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d="M500 34 v4" stroke="#6b4a2b" strokeWidth={i % 3 ? 1 : 2} transform={`rotate(${i * 30} 500 52)`} />
      ))}
      <path d="M500 52 V38 M500 52 L510 58" stroke="#3a2616" strokeWidth="2.4" strokeLinecap="round" />
      <Stairs />
      <g transform="translate(1000 0) scale(-1 1)">
        <Stairs />
      </g>
      {[336, 352, 368, 384, 400, 416, 584, 600, 616, 632, 648, 664].map((x) => (
        <rect key={x} x={x} y="268" width="3" height="28" fill="#4a2f1a" />
      ))}
      <rect x="330" y="262" width="100" height="7" rx="2" fill="#8a5a34" />
      <rect x="570" y="262" width="100" height="7" rx="2" fill="#8a5a34" />
      {[250, 750, 500].map((x, i) => (
        <circle key={x} cx={x} cy={i === 2 ? 60 : 130} r="46" fill="url(#at-warm)" className="ct-glow" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
    </svg>
  );
}

function SideDoor({ lock, tone, label, onClick }: { lock?: boolean; tone: [string, string]; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={lock} className="group absolute inset-0 outline-none" aria-label={label}>
      <div className="absolute inset-0 overflow-hidden rounded-t-[999px] border-x-[12px] border-t-[12px] border-[#4a3320] transition-[filter] group-hover:brightness-125 group-focus-visible:brightness-125" style={{ background: lock ? "linear-gradient(180deg,#1b1e24,#2b2f38)" : `linear-gradient(180deg, ${tone[0]}, ${tone[1]})` }}>
        {!lock && <div className="ct-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.55),transparent_65%)]" />}
        {lock && <Lock className="absolute inset-0 m-auto size-1/4 text-[#8B949E]" />}
      </div>
    </button>
  );
}

const STAND: Prop[] = ["ficus"];

export default function Museum({ city, onFish, onAnimals, onBucket, onExit }: { city: CityState; onFish: () => void; onAnimals: () => void; onBucket: () => void; onExit: () => void }) {
  const { ref, g } = useGeo();
  const rooms = useMemo(() => buildRooms(city.species), [city.species]);
  const done = city.museum.length;
  const total = city.species.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const all = rooms.flatMap((r) => r.list);
  const owned = new Set(city.museum.map((d) => d.species_id));
  const th = THEMES.lake;
  const sconces = (
    <>
      {[20, 80].map((x) => (
        <div key={x} className="absolute" style={{ left: `${x}%`, top: "26%" }}>
          <div className="ct-glow -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,217,138,0.85),transparent_70%)]" style={{ width: 150, height: 150, marginTop: -64 }} />
          <div className="absolute top-[54px] left-1/2 h-7 w-3 -translate-x-1/2 rounded-sm bg-[#ffe9a3]" />
          <div className="absolute top-[78px] left-1/2 h-1 w-6 -translate-x-1/2 rounded bg-[#8a5a34]" />
        </div>
      ))}
    </>
  );
  const prints = (side: "left" | "right") => (
    <>
      {[34, 54, 74].map((x, i) => {
        const s = all[(i + (side === "left" ? 0 : 3)) % Math.max(1, all.length)];
        const left = side === "right" ? 100 - x - 14 : x;
        return (
          <div key={x} className="absolute rounded-sm border-[6px] border-[#6b4a2b] bg-[#f4ecd2] p-1 shadow-lg" style={{ left: `${left}%`, top: "26%", width: "14%", height: "26%" }}>
            <div className="size-full rounded-sm" style={{ background: "linear-gradient(180deg,#bfe3f0,#6fb4cf)" }}>
              {s && <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} silhouette={!owned.has(s.id)} className="size-full p-1" />}
            </div>
          </div>
        );
      })}
    </>
  );
  const hots: HotDef[] = g
    ? [
        { key: "fish", pts: quadPts(g, "right", 72, 22, 22, 66), label: "Entra nella sezione pesci", onClick: onFish, tone: "#58A6FF" },
        { key: "ani", pts: quadPts(g, "left", 6, 22, 22, 66), label: "Entra nella sezione animali", onClick: onAnimals, tone: "#7EE787" },
      ]
    : [];
  const props: { p: Prop; u: number; z: number; k?: number }[] = [
    { p: STAND[0], u: 0.07, z: 0.34 },
    { p: "ficus", u: 0.93, z: 0.34 },
    { p: "ficus", u: 0.3, z: 0.62 },
    { p: "ficus", u: 0.7, z: 0.62 },
    { p: "bench", u: 0.22, z: 0.26 },
    { p: "bench", u: 0.78, z: 0.26 },
    { p: "statue", u: 0.14, z: 0.62 },
    { p: "statue", u: 0.86, z: 0.62 },
    { p: "pedestal", u: 0.36, z: 0.4 },
    { p: "lamp", u: 0.64, z: 0.4 },
  ];
  return (
    <div ref={ref} className="ct-dolly absolute inset-0 bg-[#1a0f08]" data-testid="museum-lobby">
      {g && (
        <Scene3D
          g={g}
          wallBack={{ backgroundColor: "#c4b088" }}
          wallSide={{ backgroundColor: "#b9a47a", backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.25)), repeating-linear-gradient(90deg, rgba(90,60,30,0.14) 0 3px, transparent 3px 70px)", filter: "brightness(0.85)" }}
          wallFloor={{ backgroundColor: "#33423f", backgroundImage: "repeating-conic-gradient(#3d4e4a 0 25%, #2f3d3a 0 50%)", backgroundSize: "90px 90px" }}
          wallCeil={{ backgroundColor: "#4d3a24", backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.1))" }}
          back={
            <>
              <BackArt />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_50%,rgba(26,15,8,0.5))]" />
              <Lock className="absolute text-[#8B949E]" style={{ left: "47.5%", top: "26%", width: "5%", height: "8%" }} />
              <Lock className="absolute text-[#8B949E]" style={{ left: "47.5%", top: "72%", width: "5%", height: "8%" }} />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="absolute grid place-items-center text-[#e3b341]/60" style={{ left: `${[7.5, 19.5, 31.5, 62.5, 74.5, 86.5][i]}%`, top: "19.5%", width: "6.4%", height: "16%", fontSize: "clamp(10px,2vw,28px)" }}>
                  ?
                </div>
              ))}
            </>
          }
          left={
            <>
              <div className="absolute inset-x-0 bottom-0 h-[14%] border-t-[6px] border-[#6b4a2b] bg-[#8a7550]" />
              {prints("left")}
              <div className="absolute" style={{ left: "6%", top: "22%", width: "22%", height: "66%" }}>
                <div className="absolute -inset-x-[8%] -top-[5%] bottom-0 rounded-t-[999px] bg-gradient-to-b from-[#6b4a2b] to-[#3a2616]" />
                <SideDoor tone={["#b7e08a", "#3a7d3f"]} label="Entra nella sezione animali" onClick={onAnimals} />
              </div>
              {sconces}
            </>
          }
          right={
            <>
              <div className="absolute inset-x-0 bottom-0 h-[14%] border-t-[6px] border-[#6b4a2b] bg-[#8a7550]" />
              {prints("right")}
              <div className="absolute" style={{ left: "72%", top: "22%", width: "22%", height: "66%" }}>
                <div className="absolute -inset-x-[8%] -top-[5%] bottom-0 rounded-t-[999px] bg-gradient-to-b from-[#6b4a2b] to-[#3a2616]" />
                <SideDoor tone={["#8fd6e6", "#1f6f93"]} label="Entra nella sezione pesci" onClick={onFish} />
              </div>
              {sconces}
            </>
          }
          ceil={
            <>
              {[10, 30, 50, 70, 90].map((y) => (
                <div key={y} className="absolute inset-x-0 h-[3%]" style={{ top: `${y}%`, background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(0,0,0,0.5))" }} />
              ))}
              <div className="ct-beam absolute rounded-sm bg-[#fff4c8]/70 shadow-[0_0_40px_rgba(255,244,200,0.9)]" style={{ left: "38%", top: "40%", width: "24%", height: "26%" }} />
            </>
          }
          floor={
            <>
              <div className="absolute inset-y-0 left-[41%] w-[18%] border-x-[8px] border-[#e6c9a0]/70 bg-[#8d3f45]" />
              <div className="absolute inset-y-0 left-[44%] w-[12%] border-x-2 border-[#e6c9a0]/40" />
              <div className="absolute left-1/2 top-[30%] -translate-x-1/2 rounded-full border-[6px] border-[#e3b341]/70 bg-[#1f2c2a]/70" style={{ width: g.D * 0.5, height: g.D * 0.5 }}>
                <div className="absolute inset-[12%] rounded-full border-2 border-[#e3b341]/50" />
                <div className="absolute inset-y-[6%] left-1/2 w-px bg-[#e3b341]/70" />
                <div className="absolute inset-x-[6%] top-1/2 h-px bg-[#e3b341]/70" />
                <div className="absolute inset-[38%] rotate-45 border-2 border-[#e3b341]/70" />
              </div>
              <div className="ct-beam absolute left-1/2 top-[26%] -translate-x-1/2 rounded-[50%]" style={{ width: "30%", height: "34%", background: "radial-gradient(ellipse, rgba(255,244,200,0.4), transparent 70%)" }} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/25" />
            </>
          }
        >
          <Hotspots items={hots} />
          {[26, 50, 74].map((x) => {
            const p = planePt(g, "ceil", x, 48);
            const w = 120 * p.s * Math.max(0.8, g.w / 1500);
            return (
              <div key={x} className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: p.x, top: p.y }} aria-hidden>
                <span className="w-px bg-black/60" style={{ height: 70 * p.s * 2 }} />
                <span className="rounded-t-full bg-[#8a6a1f]" style={{ width: w, height: w * 0.3 }} />
                <span className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((k) => (
                    <span key={k} className="ct-glow rounded-full bg-[#ffd36a]" style={{ width: w * 0.12, height: w * 0.2, animationDelay: `${k * 0.3}s` }} />
                  ))}
                </span>
              </div>
            );
          })}
          {[...props].sort((a, b) => b.z - a.z).map((p, i) => {
            const pt = floorPt(g, p.u, p.z);
            const wpx = BASE_W[p.p] * pt.s * (p.k ?? 1) * Math.max(0.8, g.w / 1500);
            return (
              <div key={i} className="absolute [&_svg]:w-full" style={{ left: pt.x, top: pt.y, width: wpx, transform: "translate(-50%, -100%)" }}>
                <div className="mx-auto" style={{ width: p.p === "lamp" ? "40%" : "100%" }}>
                  <PropArt p={p.p} th={th} />
                </div>
              </div>
            );
          })}
          {(() => {
            const a = wallPt(g, "back", 50, 21);
            const b = wallPt(g, "back", 50, 66);
            const l = wallPt(g, "left", 17, 18);
            const r = wallPt(g, "right", 17, 18);
            const o = floorPt(g, 0.5, 0.42);
            const sg = floorPt(g, 0.5, 0.2);
            return (
              <>
                <Chip x={a.x} y={a.y}>Insetti · prossimamente</Chip>
                <Chip x={b.x} y={b.y}>Fossili · prossimamente</Chip>
                <Chip x={l.x + 40} y={l.y} onClick={onAnimals} tone="#7EE787">← Animali</Chip>
                <Chip x={r.x - 40} y={r.y} onClick={onFish} tone="#58A6FF">Pesci →</Chip>
                <div className="absolute" style={{ left: o.x, top: o.y, width: 130 * o.s * Math.max(0.8, g.w / 1500), transform: "translate(-50%,-100%)" }}>
                  <Owl />
                </div>
                <div className="absolute rounded-lg border-[3px] border-[#e3b341] bg-[#2a1d0f]/90 text-center shadow-xl" style={{ left: sg.x, top: sg.y, width: 150 * sg.s * Math.max(0.8, g.w / 1500) * 1.4, transform: "translate(-50%,-100%)", padding: 6 * sg.s }}>
                  <p className="text-[9px] font-medium tracking-wider text-[#e3cfa0] uppercase">Collezione pesci</p>
                  <p className="text-xl leading-none font-bold tabular-nums text-[#fff3c4]">
                    {done}/{total}
                  </p>
                  <div className="mx-auto mt-1 h-1.5 w-4/5 overflow-hidden rounded-full bg-black/40">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#e3b341] to-[#f0883e]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </>
            );
          })()}
        </Scene3D>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_55%,rgba(20,8,4,0.55))]" />
      <div className="pointer-events-none absolute inset-0 bg-[#2a1508]/10" />
      <div className="absolute inset-x-0 bottom-0 z-[3] flex justify-center">
        <button type="button" onClick={onExit} className="group flex w-[min(180px,30vw)] flex-col items-center outline-none" data-testid="lobby-exit" aria-label="Esci in città">
          <span className="mb-1 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">Esci in città</span>
          <div className="relative h-[min(16vh,110px)] w-full overflow-hidden rounded-t-[999px] border-x-[8px] border-t-[8px] border-[#4a3320] transition-[filter] group-hover:brightness-125 group-focus-visible:brightness-125" style={{ background: "linear-gradient(180deg,#0b1740,#1d2f66)" }}>
            <div className="absolute inset-x-0 top-[18%] mx-auto size-[22%] rounded-full bg-[#f3f0dc]" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[#26402a]" />
          </div>
        </button>
      </div>
      <Button variant="secondary" size="lg" className="absolute right-4 bottom-4 z-[3]" onClick={onBucket} data-testid="lobby-bucket-button">
        <Package /> Secchio ({city.bucket.length})
      </Button>
    </div>
  );
}
