import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowLeft, DoorOpen, Lock, Package } from "lucide-react";
import type { CityState, Donation, Species } from "@/lib/domain/city";
import { RARITY } from "@/components/pets/rarity";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FishArt from "./FishArt";
import { RarityTag, fmtWhen } from "./Bucket";
import { Bubbles, Scenery, TankView, WaterWall, type LTun, type LWin } from "./Aqua";
import { BASE_W, PropArt } from "./Props";
import { Hotspots, Scene3D, floorPt, planePt, quadPts, useGeo, type HotDef, type PlaneId } from "./Room3D";
import { ARCH, THEMES, buildRooms, isBig, type ResolvedRoom, type ResolvedSystem, type Surface, type Theme } from "./rooms";
import "./city.css";

type Sys = ResolvedSystem;
type Sel = { tank: Sys | null; sp: Species | null };

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
  const where = sp ? room.systems.find((t) => t.species.some((x) => x.id === sp.id)) : undefined;
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

function Chip({ x, y, children, onClick, tone }: { x: number; y: number; children: ReactNode; onClick?: () => void; tone?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow backdrop-blur transition-colors enabled:hover:bg-black/75" style={{ left: x, top: y, borderColor: tone ? `${tone}99` : undefined }}>
      {children}
    </button>
  );
}

function DoorArt({ lock, tone, th }: { lock?: boolean; tone: [string, string]; th: Theme }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute -inset-x-[7%] -top-[5%] bottom-0 rounded-t-[999px]" style={{ background: `linear-gradient(180deg, ${th.trim}, #00000066)` }} />
      <div className="absolute inset-0 overflow-hidden rounded-t-[999px] border-x-[10px] border-t-[10px] border-[#3a2616]" style={{ background: lock ? "linear-gradient(180deg,#1b1e24,#2b2f38)" : `linear-gradient(180deg, ${tone[0]}, ${tone[1]})` }}>
        {!lock && <div className="ct-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.55),transparent_65%)]" />}
        {lock && <Lock className="absolute inset-0 m-auto size-1/4 text-[#8B949E]" />}
        {!lock && <DoorOpen className="absolute inset-x-0 bottom-[8%] mx-auto size-1/5 text-white/85" />}
        <div className="absolute inset-y-0 left-1/2 w-px bg-black/40" />
      </div>
    </div>
  );
}

const SKY = [22, 50, 78];

export default function MuseumRoom({ city, roomId, onRoom, onAtrium, onBucket }: { city: CityState; roomId: string; onRoom: (id: string) => void; onAtrium: () => void; onBucket: () => void }) {
  const { ref, g } = useGeo();
  const [sel, setSel] = useState<Sel | null>(null);
  const gifts = useMemo(() => new Map(city.museum.map((d) => [d.species_id, d])), [city.museum]);
  const rooms = useMemo(() => buildRooms(city.species), [city.species]);
  const idx = Math.max(0, rooms.findIndex((r) => r.def.id === roomId));
  const room = rooms[idx];
  const prev = rooms[idx - 1];
  const next = rooms[idx + 1];
  const th = THEMES[room.def.theme];
  const arch = ARCH[room.def.theme];
  const got = room.list.filter((s) => gifts.has(s.id)).length;
  const nextTh = next ? THEMES[next.def.theme] : th;
  const open = (t: Sys) => setSel({ tank: t, sp: null });
  const goPrev = () => (prev ? onRoom(prev.def.id) : onAtrium());
  const goNext = next ? () => onRoom(next.def.id) : undefined;

  const loc = (surface: string, x: number, w: number) => (surface === "right" ? 100 - x - w : x);
  const localWins = (s: Sys): LWin[] => s.wins.map((w) => ({ ...w, x: loc(s.surface, w.x, w.w), shape: w.shape ?? "rect" }));
  const localTuns = (s: Sys): LTun[] => (s.tunnels ?? []).map((t) => (s.surface === "right" ? { ...t, x1: 100 - t.x2, x2: 100 - t.x1 } : t));
  const dims = (surface: string) => (!g ? { pw: 0, ph: 0 } : surface === "back" ? { pw: g.w, ph: g.h } : surface === "left" || surface === "right" ? { pw: g.D, ph: g.h } : { pw: g.w, ph: g.D });
  const wallFor = (surface: string): CSSProperties => (surface === "floor" ? th.floor : surface === "ceil" ? { backgroundColor: th.trim, backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.1))" } : th.wall);
  const wall = (surface: Surface) =>
    room.systems
      .filter((s) => s.surface === surface)
      .map((s, i) => {
        const d = dims(surface);
        return <WaterWall key={s.id} sys={s} wins={localWins(s)} tuns={localTuns(s)} pw={d.pw} ph={d.ph} th={th} gifts={gifts} base={i * 5} wallStyle={wallFor(surface)} glass={surface === "floor" || surface === "ceil"} style={arch} />;
      });

  const wainscot = <div className="absolute inset-x-0 bottom-0 h-[13%] border-t-[6px]" style={{ backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,0.22) 0 3px, transparent 3px 90px), linear-gradient(180deg, ${th.trim}, #00000066)`, backgroundColor: th.trim, borderColor: th.trim }} />;
  const doorBox = (side: "left" | "right") => {
    const isPrev = side === "left";
    const target = isPrev ? prev : next;
    const dTh = target ? THEMES[target.def.theme] : th;
    return (
      <div className="absolute" style={{ left: `${loc(side, 4, 20)}%`, top: "20%", width: "20%", height: "66%" }}>
        <DoorArt lock={!isPrev && !next} tone={isPrev && !prev ? ["#2b3a55", "#101a2e"] : [dTh.water[0], dTh.water[1]]} th={th} />
      </div>
    );
  };
  const bare = (surface: "left" | "right") => !room.systems.some((s) => s.surface === surface);
  const pictures = (surface: "left" | "right") =>
    bare(surface) ? (
      <>
        {[34, 58].map((x, i) => (
          <div key={x} className="absolute rounded-sm border-[6px]" style={{ left: `${loc(surface, x, 18)}%`, top: "26%", width: "18%", height: "36%", borderColor: th.plaque, background: `linear-gradient(160deg, ${th.water[0]}, ${th.water[1]})`, boxShadow: "inset 0 0 20px rgba(0,0,0,0.4)" }}>
            <div className="ct-float absolute inset-[18%]" style={{ animationDelay: `${i * 0.8}s` }}>
              {room.list[i] && <FishArt shape={room.list[i].shape} colors={room.list[i].colors} pattern={room.list[i].pattern} silhouette={!gifts.has(room.list[i].id)} className="w-full" />}
            </div>
          </div>
        ))}
      </>
    ) : null;

  const hots: HotDef[] = [];
  const chips: ReactNode[] = [];
  if (g) {
    room.systems.forEach((s) => {
      if (s.surface === "island") return;
      const wins = localWins(s);
      const tuns = localTuns(s);
      const pl = s.surface as PlaneId;
      wins.forEach((w, i) => hots.push({ key: `${s.id}w${i}`, pts: quadPts(g, pl, w.x, w.y, w.w, w.h), label: s.name, onClick: () => open(s), tone: th.accent }));
      tuns.forEach((t, i) => hots.push({ key: `${s.id}t${i}`, pts: quadPts(g, pl, t.x1, t.y, t.x2 - t.x1, t.h), label: s.name, onClick: () => open(s), tone: th.accent }));
      const minX = Math.min(...wins.map((w) => w.x));
      const maxX = Math.max(...wins.map((w) => w.x + w.w));
      const bot = Math.max(...wins.map((w) => w.y + w.h));
      const pt = planePt(g, pl, (minX + maxX) / 2, bot + 3);
      const c = s.species.filter((x) => gifts.has(x.id)).length;
      chips.push(
        <Chip key={`c${s.id}`} x={pt.x} y={pt.y} onClick={() => open(s)} tone={th.accent}>
          {s.name} · {c}/{s.species.length}
        </Chip>,
      );
    });
    hots.push({ key: "dl", pts: quadPts(g, "left", loc("left", 4, 20), 20, 20, 66), label: prev ? prev.def.name : "Atrio", onClick: goPrev, tone: "#ffffff" });
    hots.push({ key: "dr", pts: quadPts(g, "right", loc("right", 4, 20), 20, 20, 66), label: next ? next.def.name : "Fine del percorso", onClick: goNext, tone: nextTh.accent });
  }

  const pendants = [14, 86, ...(room.systems.some((s) => s.surface === "ceil") ? [] : [50])];

  return (
    <div ref={ref} className="ct-dolly absolute inset-0" data-testid="museum-room">
      {g && (
        <Scene3D
          g={g}
          wallBack={th.wall}
          wallSide={{ ...th.wall, filter: "brightness(0.84)" }}
          wallFloor={th.floor}
          wallCeil={{ backgroundColor: th.trim, backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.15))" }}
          back={
            <>
              <div className="absolute inset-x-0 top-0 h-[16%]" style={{ background: `linear-gradient(180deg, ${th.trim}, transparent)` }} />
              {wainscot}
              {[12, 50, 88].map((x) => (
                <div key={x} className="ct-glow absolute -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,217,138,0.7),transparent_70%)]" style={{ left: `${x}%`, top: "2%", width: "10%", height: "12%" }} />
              ))}
              {wall("back")}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_50%,rgba(10,5,25,0.45))]" />
            </>
          }
          left={
            <>
              {wainscot}
              {pictures("left")}
              {wall("left")}
              {doorBox("left")}
            </>
          }
          right={
            <>
              {wainscot}
              {pictures("right")}
              {wall("right")}
              {doorBox("right")}
            </>
          }
          ceil={
            <>
              {[8, 24, 40, 56, 72, 88].map((y) => (
                <div key={y} className="absolute inset-x-0 h-[2.4%]" style={{ top: `${y}%`, background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.45))" }} />
              ))}
              {SKY.map((x) => (
                <div key={x} className="ct-beam absolute rounded-sm bg-[#fff4c8]/70 shadow-[0_0_30px_rgba(255,244,200,0.8)]" style={{ left: `${x - 6}%`, top: "78%", width: "12%", height: "14%" }} />
              ))}
              {wall("ceil")}
            </>
          }
          floor={
            <>
              <div className="absolute inset-y-0 left-[34%] w-[32%] border-x-[8px]" style={{ borderColor: `${th.plaque}aa`, background: `linear-gradient(180deg, ${th.accent}44, ${th.accent}22)` }} />
              {room.systems.filter((s) => s.surface === "back").flatMap((s) => localWins(s)).map((w, i) => (
                <div key={i} className="absolute rounded-[50%]" style={{ left: `${w.x}%`, width: `${w.w}%`, top: "0%", height: "40%", background: `radial-gradient(ellipse at 50% 0%, ${room.systems[0].big ? "#4f8cff" : th.water[0]}66, transparent 70%)` }} />
              ))}
              {SKY.map((x) => (
                <div key={x} className="ct-beam absolute rounded-[50%]" style={{ left: `${x - 9}%`, top: "26%", width: "18%", height: "24%", background: "radial-gradient(ellipse, rgba(255,244,200,0.35), transparent 70%)" }} />
              ))}
              <div className="absolute inset-x-0 top-0 h-[2%]" style={{ background: th.trim }} />
              {wall("floor")}
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/20" />
            </>
          }
        >
          <Hotspots items={hots} />
          {pendants.map((x) => {
            const p = planePt(g, "ceil", x, 46);
            const wpx = 70 * p.s * Math.max(0.8, g.w / 1500);
            return (
              <div key={x} className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: p.x, top: p.y }} aria-hidden>
                <span className="w-px bg-black/60" style={{ height: 44 * p.s * 2 }} />
                <span className="rounded-t-full bg-[#2e3a3f]" style={{ width: wpx, height: wpx * 0.45 }} />
                <span className="ct-glow rounded-full bg-[#ffe9a3]" style={{ width: wpx * 0.7, height: wpx * 0.25 }} />
              </div>
            );
          })}
          {[...room.def.props].sort((a, b) => b.z - a.z).map((p, i) => {
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
          {room.systems.filter((s) => s.surface === "island").map((t) => {
            const pt = floorPt(g, t.u ?? 0.5, t.z ?? 0.3);
            const pw = (t.w ?? 300) * pt.s * Math.max(0.8, g.w / 1500) * 1.4;
            const ph = pw * 0.5;
            return (
              <div key={t.id} className="pointer-events-auto absolute" style={{ left: pt.x, top: pt.y, transform: "translate(-50%, -100%)" }}>
                <div className="relative">
                  <TankView t={t} th={th} gifts={gifts} base={2} pw={pw} ph={ph} onOpen={() => open(t)} />
                  <div className="mx-auto -mt-1 rounded-b-md border-x-[3px] border-b-[3px]" style={{ width: pw * 0.96, height: ph * 0.28, borderColor: "#2c3a40", background: `linear-gradient(180deg, ${th.trim}, #00000066)` }} />
                </div>
                <div className="absolute left-1/2 mt-2 -translate-x-1/2">
                  <Chip x={0} y={8} onClick={() => open(t)} tone={th.accent}>
                    {t.name} · {t.species.filter((x) => gifts.has(x.id)).length}/{t.species.length}
                  </Chip>
                </div>
              </div>
            );
          })}
          {chips}
          {(() => {
            const l = planePt(g, "left", 14, 16);
            const r = planePt(g, "right", 86, 16);
            return (
              <>
                <Chip x={l.x + 30} y={l.y} onClick={goPrev}>
                  ← {prev ? prev.def.name : "Atrio"}
                </Chip>
                <Chip x={r.x - 30} y={r.y} onClick={goNext} tone={nextTh.accent}>
                  {next ? `${next.def.name} →` : "Fine del percorso"}
                </Chip>
              </>
            );
          })()}
        </Scene3D>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_55%,rgba(8,4,20,0.55))]" />
      <div className="pointer-events-none absolute inset-0 bg-[#2a1850]/10" />
      <div className="absolute bottom-4 left-4 z-[3] max-w-[min(300px,60vw)] rounded-xl border border-white/15 bg-black/55 p-3 text-white shadow-xl backdrop-blur">
        <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: th.accent }}>
          Sala {idx + 1} di {rooms.length}
        </p>
        <h2 className="text-base leading-tight font-bold">{room.def.name}</h2>
        <p className="mt-1 text-[11px] leading-snug text-white/75">{room.def.intro}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(got / Math.max(1, room.list.length)) * 100}%`, background: th.accent }} />
        </div>
        <p className="mt-1 text-[10px] tabular-nums text-white/70">
          {got}/{room.list.length} specie esposte
        </p>
      </div>
      <Button variant="secondary" size="lg" className="absolute right-4 bottom-4 z-[3]" onClick={onBucket} data-testid="room-bucket-button">
        <Package /> Secchio ({city.bucket.length})
      </Button>
      <Panel sel={sel} setSel={setSel} gifts={gifts} room={room} th={th} onClose={() => setSel(null)} />
    </div>
  );
}
