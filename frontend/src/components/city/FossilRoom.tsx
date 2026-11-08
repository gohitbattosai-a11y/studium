import { ArrowLeft, ArrowRight, Package } from "lucide-react";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { FOSSILS, FOSSIL_BY_ID, HALLS, condition, type FossilSpecies, type HallId } from "@/lib/domain/fossils";
import { useSandbox } from "@/lib/runtime/sandbox";
import { RARITY } from "@/components/pets/rarity";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FossilArt from "./FossilArt";
import FossilBag from "./FossilBag";
import { RarityTag, fmtWhen } from "./Bucket";
import { BASE_W, PropArt } from "./Props";
import { Pan, Scene3D, floorPt, useGeo, wallPt } from "./Room3D";
import { THEMES, type Prop } from "./rooms";
import "./city.css";
import "./fossil.css";

type Style = "frame" | "niche" | "case" | "trophy";
type Plane = "back" | "left" | "right";

interface Slot {
  id: string;
  at: Plane;
  style: Style;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Stand {
  id: string;
  u: number;
  z: number;
  w: number;
  big?: boolean;
}

interface HallDef {
  slots: Slot[];
  stands: Stand[];
  props: { p: Prop; u: number; z: number; k?: number }[];
  wall: CSSProperties;
  side: CSSProperties;
  floor: CSSProperties;
  ceil: CSSProperties;
  trim: string;
  accent: string;
  glow: string;
  spot: string;
}

const DEF: Record<HallId, HallDef> = {
  mari: {
    slots: [
      { id: "pesce_fossile", at: "back", style: "frame", x: 31, y: 16, w: 38, h: 50 },
      { id: "trilobite", at: "back", style: "niche", x: 7, y: 22, w: 20, h: 40 },
      { id: "brachiopode", at: "back", style: "niche", x: 73, y: 22, w: 20, h: 40 },
      { id: "ammonite", at: "left", style: "case", x: 40, y: 26, w: 40, h: 40 },
    ],
    stands: [{ id: "dente_megalodonte", u: 0.5, z: 0.46, w: 190 }],
    props: [
      { p: "coral", u: 0.1, z: 0.4 },
      { p: "coral", u: 0.9, z: 0.4 },
      { p: "rocks", u: 0.26, z: 0.7, k: 0.8 },
      { p: "rocks", u: 0.78, z: 0.72, k: 0.8 },
    ],
    wall: { backgroundColor: "#1f4a5a", backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0 22%, transparent 23%), radial-gradient(circle at 74% 62%, rgba(255,255,255,0.06) 0 26%, transparent 27%), linear-gradient(180deg,#2d6d80,#14313d)" },
    side: { backgroundColor: "#1a4150", backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.3)), repeating-linear-gradient(90deg, rgba(120,220,240,0.1) 0 3px, transparent 3px 80px)", filter: "brightness(0.9)" },
    floor: { backgroundColor: "#1d3c45", backgroundImage: "repeating-conic-gradient(#28505b 0 25%, #1b3740 0 50%)", backgroundSize: "96px 96px" },
    ceil: { backgroundColor: "#10252e", backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.6), rgba(80,170,200,0.12))" },
    trim: "#7fd6e8",
    accent: "#7fd6e8",
    glow: "rgba(127,214,232,0.55)",
    spot: "rgba(190,240,255,0.5)",
  },
  giungla: {
    slots: [
      { id: "archaeopteryx", at: "back", style: "frame", x: 30, y: 14, w: 40, h: 52 },
      { id: "felce", at: "back", style: "niche", x: 6, y: 22, w: 20, h: 40 },
      { id: "artiglio_raptor", at: "back", style: "case", x: 74, y: 26, w: 20, h: 32 },
    ],
    stands: [
      { id: "uovo_dino", u: 0.36, z: 0.44, w: 170 },
      { id: "ambra", u: 0.66, z: 0.46, w: 160 },
    ],
    props: [
      { p: "ficus", u: 0.07, z: 0.42 },
      { p: "ficus", u: 0.93, z: 0.42 },
      { p: "plant", u: 0.22, z: 0.74 },
      { p: "plant", u: 0.8, z: 0.74 },
      { p: "log", u: 0.5, z: 0.8, k: 0.8 },
    ],
    wall: { backgroundColor: "#3a5230", backgroundImage: "radial-gradient(ellipse at 24% 18%, rgba(170,220,90,0.28), transparent 46%), radial-gradient(ellipse at 80% 70%, rgba(110,170,60,0.22), transparent 50%), linear-gradient(180deg,#476b38,#1f3419)" },
    side: { backgroundColor: "#35502c", backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.3)), repeating-linear-gradient(90deg, rgba(40,70,20,0.35) 0 4px, transparent 4px 64px)", filter: "brightness(0.9)" },
    floor: { backgroundColor: "#5b4222", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 86px), linear-gradient(180deg, rgba(255,255,255,0.1), rgba(0,0,0,0.25))" },
    ceil: { backgroundColor: "#16260f", backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(120,180,60,0.12))" },
    trim: "#b6e26a",
    accent: "#b6e26a",
    glow: "rgba(182,226,106,0.5)",
    spot: "rgba(255,240,170,0.5)",
  },
  giganti: {
    slots: [
      { id: "cranio_triceratopo", at: "back", style: "trophy", x: 31, y: 5, w: 38, h: 40 },
      { id: "zanna_mammut", at: "left", style: "case", x: 38, y: 26, w: 46, h: 40 },
      { id: "geode_stellare", at: "right", style: "niche", x: 16, y: 22, w: 36, h: 48 },
    ],
    stands: [{ id: "tirannosauro", u: 0.5, z: 0.6, w: 0, big: true }],
    props: [
      { p: "brazier", u: 0.06, z: 0.42 },
      { p: "brazier", u: 0.94, z: 0.42 },
      { p: "column", u: 0.18, z: 0.74 },
      { p: "column", u: 0.82, z: 0.74 },
    ],
    wall: { backgroundColor: "#3d352e", backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0 3px, transparent 3px 96px), repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0 3px, transparent 3px 150px), linear-gradient(180deg,#54483d,#241d18)" },
    side: { backgroundColor: "#372f29", backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(0,0,0,0.35)), repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 3px, transparent 3px 90px)", filter: "brightness(0.9)" },
    floor: { backgroundColor: "#26221f", backgroundImage: "repeating-conic-gradient(#312c28 0 25%, #1f1b18 0 50%)", backgroundSize: "120px 120px" },
    ceil: { backgroundColor: "#15110e", backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.65), rgba(255,170,60,0.1))" },
    trim: "#e3b341",
    accent: "#e3b341",
    glow: "rgba(255,170,60,0.5)",
    spot: "rgba(255,236,170,0.55)",
  },
};

function Plaque({ s, known, fs }: { s: FossilSpecies; known: boolean; fs: string }) {
  return (
    <div className="mt-[3%] truncate rounded-[2px] px-[5%] py-[2.5%] text-center font-semibold shadow" style={{ background: "linear-gradient(180deg,#f1e6c9,#cdb98a)", color: "#2a1d0f", fontSize: fs, borderBottom: `0.3cqw solid ${known ? RARITY[s.rarity].color : "#6b5a3c"}` }}>
      {known ? s.name : "???"}
    </div>
  );
}

function Exhibit({ s, slot, known, fs, def, onOpen }: { s: FossilSpecies; slot: Slot; known: boolean; fs: string; def: HallDef; onOpen: () => void }) {
  const frame = slot.style === "frame" || slot.style === "trophy";
  const shape = slot.style === "niche" ? "rounded-t-[999px]" : slot.style === "case" ? "rounded-md" : "rounded-sm";
  const border = slot.style === "trophy" ? `0.9cqw solid ${def.trim}` : frame ? "0.8cqw solid #6b4a2b" : slot.style === "case" ? "0.45cqw solid rgba(220,240,255,0.55)" : "0.8cqw solid #4a3320";
  return (
    <button type="button" onClick={onOpen} className="group absolute flex flex-col outline-none" style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.w}%`, height: `${slot.h}%` }} aria-label={known ? s.name : "Fossile sconosciuto"} data-testid={`fossil-case-${s.id}`}>
      <div className={`relative min-h-0 flex-1 overflow-hidden transition-[filter] group-hover:brightness-125 group-focus-visible:brightness-125 ${shape}`} style={{ border, background: "radial-gradient(ellipse at 50% 18%, rgba(255,244,200,0.4), rgba(20,14,8,0.92) 72%)", boxShadow: frame ? `0 0 0 0.25cqw ${def.trim}66, inset 0 0 3cqw rgba(0,0,0,0.7)` : "inset 0 0 3cqw rgba(0,0,0,0.7)" }}>
        <div className="pointer-events-none absolute inset-x-[10%] top-0 h-3/4 opacity-70" style={{ background: `linear-gradient(180deg, ${def.spot}, transparent)`, clipPath: "polygon(30% 0, 70% 0, 100% 100%, 0 100%)" }} />
        <FossilArt s={s} silhouette={!known} className="relative size-full p-[6%] drop-shadow-xl" />
        {slot.style === "case" && <div className="pointer-events-none absolute -inset-y-4 left-[16%] w-[12%] rotate-12 bg-white/15 blur-[2px]" />}
      </div>
      <Plaque s={s} known={known} fs={fs} />
    </button>
  );
}

function Plinth({ s, known, x, y, w, onOpen, def }: { s: FossilSpecies; known: boolean; x: number; y: number; w: number; onOpen: () => void; def: HallDef }) {
  return (
    <button type="button" onClick={onOpen} className="pointer-events-auto group absolute outline-none" style={{ left: x, top: y, width: w, transform: "translate(-50%, -100%)" }} aria-label={known ? s.name : "Fossile sconosciuto"} data-testid={`fossil-case-${s.id}`}>
      <div className="relative transition-[filter] group-hover:brightness-125 group-focus-visible:brightness-125">
        <div className="relative mx-auto aspect-[4/3] w-[96%] overflow-hidden rounded-t-[999px] border-[3px] border-white/40" style={{ background: `radial-gradient(ellipse at 50% 20%, ${def.spot}, rgba(14,10,6,0.9) 75%)`, boxShadow: `0 0 28px ${def.glow}` }}>
          <FossilArt s={s} silhouette={!known} className="size-full p-[10%] drop-shadow-xl" />
          <div className="pointer-events-none absolute -inset-y-2 left-[18%] w-[12%] rotate-12 bg-white/20 blur-[2px]" />
        </div>
        <div className="mx-auto h-[10%] min-h-3 w-[104%] -translate-x-[2%] rounded-sm" style={{ background: `linear-gradient(180deg, ${def.trim}, #5a4630)` }} />
        <div className="mx-auto w-[84%] rounded-b-md pt-[16%] pb-[4%] text-center" style={{ background: "linear-gradient(90deg,#6e5a3e,#a58e66 45%,#6e5a3e)", boxShadow: "0 10px 14px rgba(0,0,0,0.5)" }}>
          <span className="mx-auto block w-[92%] rounded-[2px] bg-[#f1e6c9] px-1 py-0.5 text-[clamp(8px,0.85vw,12px)] leading-tight font-semibold text-[#2a1d0f]">{known ? s.name : "???"}</span>
        </div>
      </div>
    </button>
  );
}

function Door({ label, onClick, tone, left }: { label: string; onClick: () => void; tone: [string, string]; left: boolean }) {
  return (
    <div className="absolute" style={{ left: left ? "6%" : "72%", top: "22%", width: "22%", height: "66%" }}>
      <div className="absolute -inset-x-[8%] -top-[5%] bottom-0 rounded-t-[999px] bg-gradient-to-b from-[#6b4a2b] to-[#3a2616]" />
      <button type="button" onClick={onClick} className="group absolute inset-0 outline-none" aria-label={label}>
        <div className="absolute inset-0 overflow-hidden rounded-t-[999px] border-x-[12px] border-t-[12px] border-[#4a3320] transition-[filter] group-hover:brightness-125 group-focus-visible:brightness-125" style={{ background: `linear-gradient(180deg, ${tone[0]}, ${tone[1]})` }}>
          <div className="ct-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.55),transparent_65%)]" />
        </div>
      </button>
    </div>
  );
}

function Decor({ hall, def }: { hall: HallId; def: HallDef }) {
  if (hall === "mari")
    return (
      <>
        <div className="fh-caustic pointer-events-none absolute inset-0" />
        <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-[14%] h-[10%] w-full opacity-60" aria-hidden>
          <path d="M0 60 Q60 20 120 60 T240 60 T360 60 T480 60 T600 60 T720 60 T840 60 T960 60 T1080 60" fill="none" stroke={def.accent} strokeWidth="5" className="ct-flow" />
          <path d="M0 90 Q60 50 120 90 T240 90 T360 90 T480 90 T600 90 T720 90 T840 90 T960 90 T1080 90" fill="none" stroke={def.accent} strokeWidth="3" opacity="0.6" />
        </svg>
      </>
    );
  if (hall === "giungla")
    return (
      <>
        {[8, 22, 40, 62, 78, 92].map((x, i) => (
          <svg key={x} viewBox="0 0 40 200" className="ct-hang pointer-events-none absolute top-0 w-[3.2%]" style={{ left: `${x}%`, height: `${16 + (i % 3) * 7}%`, animationDelay: `${i * 0.5}s` }} preserveAspectRatio="none" aria-hidden>
            <path d="M20 0 C10 40 30 80 18 120 C10 150 24 170 20 196" fill="none" stroke="#2c5a1e" strokeWidth="4" />
            {[24, 60, 96, 132, 164].map((y, k) => (
              <path key={y} d={`M${k % 2 ? 22 : 18} ${y} q${k % 2 ? 16 : -16} -8 ${k % 2 ? 14 : -14} 8 q${k % 2 ? -8 : 8} 8 ${k % 2 ? -14 : 14} -8Z`} fill={k % 2 ? "#5d9a3a" : "#74b84a"} />
            ))}
          </svg>
        ))}
      </>
    );
  return (
    <>
      {[12, 88].map((x) => (
        <div key={x} className="pointer-events-none absolute" style={{ left: `${x}%`, top: "34%" }}>
          <div className="ct-glow -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,170,60,0.7),transparent_70%)]" style={{ width: "10cqw", height: "10cqw", marginTop: "-4cqw" }} />
          <div className="fh-flame absolute top-[0.4cqw] left-1/2 h-[2.4cqw] w-[1.3cqw] -translate-x-1/2 rounded-[50%_50%_50%_50%/70%_70%_30%_30%] bg-[#ffd36a]" />
          <div className="absolute top-[2.6cqw] left-1/2 h-[3cqw] w-[0.7cqw] -translate-x-1/2 bg-[#4a3320]" />
        </div>
      ))}
    </>
  );
}

export default function FossilRoom({ onAtrium }: { onAtrium?: () => void }) {
  const sb = useSandbox();
  const { ref, g } = useGeo();
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<FossilSpecies | null>(null);
  const [bag, setBag] = useState(false);
  const hall = HALLS[idx];
  const def = DEF[hall.id];
  const th = THEMES.lake;
  const gifts = useMemo(() => new Map(sb.fossilMuseum.map((x) => [x.species_id, x])), [sb.fossilMuseum]);
  const list = FOSSILS.filter((f) => f.hall === hall.id);
  const got = list.filter((f) => gifts.has(f.id)).length;
  const total = gifts.size;
  const gift = sel ? gifts.get(sel.id) : undefined;
  const cond = gift ? condition(gift.integrity) : null;
  const prev = HALLS[idx - 1];
  const next = HALLS[idx + 1];
  const goPrev = () => (prev ? setIdx(idx - 1) : onAtrium?.());
  const goNext = next ? () => setIdx(idx + 1) : undefined;

  const planeSlots = (at: Plane, fs: string) =>
    def.slots
      .filter((s) => s.at === at)
      .map((slot) => {
        const sp = FOSSIL_BY_ID[slot.id];
        return <Exhibit key={slot.id} s={sp} slot={slot} known={gifts.has(sp.id)} fs={fs} def={def} onOpen={() => setSel(sp)} />;
      });

  const wrap = (node: ReactNode) => (
    <div className="absolute inset-0" style={{ containerType: "inline-size" }}>
      {node}
    </div>
  );

  return (
    <div ref={ref} key={hall.id} className="ct-dolly absolute inset-0 bg-[#120c07]" data-testid="fossil-room">
      {g && (
        <Pan g={g}>
        <Scene3D
          g={g}
          wallBack={def.wall}
          wallSide={def.side}
          wallFloor={def.floor}
          wallCeil={def.ceil}
          back={wrap(
            <>
              <div className="absolute inset-x-0 top-0 h-[6%]" style={{ background: `linear-gradient(180deg, ${def.trim}55, transparent)` }} />
              <div className="absolute inset-x-0 bottom-0 h-[14%] border-t-[0.5cqw]" style={{ borderColor: def.trim, background: "linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0.5))" }} />
              <Decor hall={hall.id} def={def} />
              {planeSlots("back", "1.25cqw")}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_50%,rgba(10,6,3,0.55))]" />
            </>,
          )}
          left={wrap(
            <>
              <div className="absolute inset-x-0 bottom-0 h-[14%] border-t-[0.9cqw]" style={{ borderColor: def.trim, background: "rgba(0,0,0,0.35)" }} />
              <Door label={prev ? `Vai a ${prev.name}` : "Torna all'atrio"} onClick={goPrev} tone={prev ? ["#ffe9a8", "#8a5a1f"] : ["#8fd6e6", "#1f6f93"]} left />
              {planeSlots("left", "3.4cqw")}
            </>,
          )}
          right={wrap(
            <>
              <div className="absolute inset-x-0 bottom-0 h-[14%] border-t-[0.9cqw]" style={{ borderColor: def.trim, background: "rgba(0,0,0,0.35)" }} />
              {goNext && <Door label={`Vai a ${next.name}`} onClick={goNext} tone={["#ffe9a8", "#8a5a1f"]} left={false} />}
              {planeSlots("right", "3.4cqw")}
            </>,
          )}
          ceil={
            <>
              {[10, 30, 50, 70, 90].map((y) => (
                <div key={y} className="absolute inset-x-0 h-[3%]" style={{ top: `${y}%`, background: "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(0,0,0,0.5))" }} />
              ))}
              <div className="ct-beam absolute rounded-sm" style={{ left: "36%", top: "38%", width: "28%", height: "30%", background: def.spot, boxShadow: `0 0 44px ${def.glow}` }} />
            </>
          }
          floor={
            <>
              <div className="absolute inset-y-0 left-[38%] w-[24%] border-x-[8px] opacity-80" style={{ borderColor: `${def.trim}88`, background: `linear-gradient(180deg, ${def.trim}22, ${def.trim}44)` }} />
              {def.stands.some((s) => s.big) && <div className="absolute left-1/2 top-[22%] h-[58%] w-[70%] -translate-x-1/2 rounded-[50%] border-[6px]" style={{ borderColor: `${def.trim}aa`, background: "radial-gradient(ellipse, rgba(60,44,28,0.95), rgba(30,22,14,0.95))", boxShadow: `0 0 60px ${def.glow}` }} />}
              <div className="ct-beam absolute left-1/2 top-[26%] -translate-x-1/2 rounded-[50%]" style={{ width: "34%", height: "36%", background: `radial-gradient(ellipse, ${def.spot}, transparent 70%)` }} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/25" />
            </>
          }
        >
          {[...def.props].sort((a, b) => b.z - a.z).map((p, i) => {
            const pt = floorPt(g, p.u, p.z);
            const wpx = BASE_W[p.p] * pt.s * (p.k ?? 1) * Math.max(0.8, g.w / 1500);
            return (
              <div key={i} className="pointer-events-none absolute [&_svg]:w-full" style={{ left: pt.x, top: pt.y, width: wpx, transform: "translate(-50%, -100%)" }}>
                <PropArt p={p.p} th={th} />
              </div>
            );
          })}
          {def.stands.map((st) => {
            const sp = FOSSIL_BY_ID[st.id];
            const pt = floorPt(g, st.u, st.z);
            if (st.big) {
              const wpx = g.w * 0.5 * pt.s;
              return (
                <button key={st.id} type="button" onClick={() => setSel(sp)} className="pointer-events-auto group absolute outline-none" style={{ left: pt.x, top: pt.y, width: wpx, transform: "translate(-50%, -88%)" }} aria-label={gifts.has(sp.id) ? sp.name : "Fossile sconosciuto"} data-testid={`fossil-case-${sp.id}`}>
                  <div className="relative transition-[filter] group-hover:brightness-125 group-focus-visible:brightness-125">
                    <FossilArt s={sp} silhouette={!gifts.has(sp.id)} className="w-full drop-shadow-[0_16px_14px_rgba(0,0,0,0.55)]" />
                    <span className="absolute -bottom-[6%] left-1/2 -translate-x-1/2 rounded bg-[#f1e6c9] px-3 py-0.5 text-[clamp(9px,1vw,13px)] font-semibold whitespace-nowrap text-[#2a1d0f] shadow">{gifts.has(sp.id) ? sp.name : "???"}</span>
                  </div>
                </button>
              );
            }
            return <Plinth key={st.id} s={sp} known={gifts.has(sp.id)} x={pt.x} y={pt.y} w={st.w * pt.s * Math.max(0.8, g.w / 1500)} onOpen={() => setSel(sp)} def={def} />;
          })}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="ct-mote pointer-events-none" style={{ left: `${12 + i * 15}%`, top: `${58 + (i % 3) * 9}%`, width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, background: def.accent, opacity: 0.6, ["--bd" as string]: `${5 + i}s`, ["--bdelay" as string]: `${i * 0.8}s` }} />
          ))}
          {(() => {
            const l = wallPt(g, "left", 17, 18);
            const r = wallPt(g, "right", 83, 18);
            return (
              <>
                <button type="button" onClick={goPrev} className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow backdrop-blur" style={{ left: l.x + 40, top: l.y }}>
                  ← {prev ? prev.name : "Atrio"}
                </button>
                {goNext && (
                  <button type="button" onClick={goNext} className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow backdrop-blur" style={{ left: r.x - 40, top: r.y }}>
                    {next.name} →
                  </button>
                )}
              </>
            );
          })()}
        </Scene3D>
        </Pan>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_55%,rgba(20,8,4,0.55))]" />
      <div className="absolute left-3 z-[3] max-w-[min(280px,62vw)] rounded-xl border border-white/15 bg-black/55 p-2.5 text-white shadow-xl backdrop-blur" style={{ bottom: "12px" }}>
        <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: def.accent }}>
          Sala {idx + 1} di {HALLS.length}
        </p>
        <h2 className="text-sm leading-tight font-bold">{hall.name}</h2>
        <p className="mt-1 hidden text-[11px] leading-snug text-white/75 sm:block">{hall.intro}</p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(got / Math.max(1, list.length)) * 100}%`, background: def.accent }} />
        </div>
        <p className="mt-1 text-[10px] text-white/70 tabular-nums">
          {got}/{list.length} reperti · {total}/{FOSSILS.length} totali
        </p>
      </div>
      <div className="absolute right-3 bottom-3 z-[3] flex flex-col items-end gap-1.5">
        <div className="flex gap-1.5">
          <Button variant="secondary" size="lg" onClick={goPrev} aria-label={prev ? "Sala precedente" : "Torna all'atrio"}>
            <ArrowLeft />
          </Button>
          <Button variant="secondary" size="lg" onClick={goNext} disabled={!goNext} aria-label="Sala successiva">
            <ArrowRight />
          </Button>
        </div>
        <Button variant="secondary" size="lg" onClick={() => setBag(true)} data-testid="fossil-room-bag">
          <Package /> Zaino ({sb.fossilBag.length})
        </Button>
      </div>
      <FossilBag open={bag} onClose={() => setBag(false)} />
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="sm:max-w-md">
          {sel && (
            <>
              <DialogHeader>
                <DialogTitle>{gift ? sel.name : "Fossile sconosciuto"}</DialogTitle>
                <DialogDescription>{gift ? sel.description : "Nessuno ha ancora donato questo fossile. Cercalo al sito di scavo!"}</DialogDescription>
              </DialogHeader>
              <div className="relative overflow-hidden rounded-xl border border-[#30363D] p-4" style={{ background: `radial-gradient(ellipse at 50% 0%, ${def.spot}, #1a120a 70%)` }}>
                <FossilArt s={sel} silhouette={!gift} className="mx-auto max-h-56 w-full max-w-[320px] drop-shadow-xl" />
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <RarityTag rarity={sel.rarity} />
                {gift && <span className="text-xs text-[#8B949E]">{sel.era}</span>}
                {gift && cond && (
                  <span className="font-medium tabular-nums" style={{ color: cond.color }}>
                    {cond.label} · {gift.integrity}%
                  </span>
                )}
              </div>
              <p className="rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-2 text-xs text-[#8B949E]">{gift ? `Donato da ${gift.donor} il ${fmtWhen(gift.donated_at)}.` : `Esposto in: ${HALLS.find((h) => h.id === sel.hall)?.name}.`}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
