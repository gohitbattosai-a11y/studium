import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Package } from "lucide-react";
import type { CityState, Donation, Species } from "@/lib/city";
import { RARITY } from "@/components/pets/rarity";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FishArt from "./FishArt";
import TankScene from "./TankScene";
import { RarityTag, fmtWhen } from "./Bucket";
import { THEMES, buildRooms, isBig, type Decor, type ResolvedItem, type ResolvedRoom, type Theme } from "./rooms";
import "./city.css";

type TankItem = Extract<ResolvedItem, { k: "tank" }>;
type Sel = { tank: TankItem | null; sp: Species | null };

const BOTTOM = new Set(["anguilla", "siluro"]);
const LANES = [10, 34, 20, 48, 6, 28, 42, 16];
const BIG_DECOR: Record<string, Decor> = { mud: "mud", predator: "predator", abyss: "abyss", shrine: "shrine", stream: "stream", koi: "koi" };

function Bubbles({ n, tone = "rgba(255,255,255,0.7)" }: { n: number; tone?: string }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="ct-bubble" style={{ left: `${8 + ((i * 37) % 84)}%`, width: 3 + (i % 3) * 3, height: 3 + (i % 3) * 3, borderColor: tone, [`--bd` as string]: `${3.4 + (i % 4) * 0.8}s`, [`--bdelay` as string]: `${i * 0.6}s` } as CSSProperties} />
      ))}
    </>
  );
}

function sizePct(s: Species, big: boolean) {
  return Math.min(big ? 62 : 44, big ? 34 + Math.sqrt(s.max_cm) * 2.2 : 15 + Math.sqrt(s.max_cm) * 2.4);
}

function TankBody({ item, th, gifts, base, big, onOpen, onSpecies }: { item: TankItem; th: Theme; gifts: Map<string, Donation>; base: number; big: boolean; onOpen: () => void; onSpecies: (s: Species) => void }) {
  const got = item.species.filter((s) => gifts.has(s.id)).length;
  const swimmers: { s: Species; c: number; i: number; lane: number; owned: boolean }[] = [];
  item.species.forEach((s, i) => {
    const owned = gifts.has(s.id);
    const n = big || !owned ? 1 : s.max_cm <= 25 ? 3 : s.max_cm <= 60 ? 2 : 1;
    for (let c = 0; c < n; c++) swimmers.push({ s, c, i, owned, lane: BOTTOM.has(s.shape) ? 68 + c * 3 : big ? 24 + (i % 2) * 8 : LANES[(i + c * 3) % LANES.length] });
  });
  return (
    <div role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()} className="group relative size-full cursor-pointer overflow-hidden outline-none [container-type:inline-size]" data-testid={big ? `room-big-${item.id}` : `room-tank-${item.id}`} aria-label={item.name}>
      <TankScene kind={item.decor} th={th} deep={big} />
      <Bubbles n={5 + got} />
      {swimmers.map((w, idx) => {
        const k = w.c ? 0.7 : 1;
        const fw = `clamp(${Math.round(44 * k)}px, ${(sizePct(w.s, big) * k).toFixed(1)}cqw, ${Math.round((big ? 360 : 200) * k)}px)`;
        const dur = (big ? 17 : 9) * (w.c ? 1.35 : 1) + ((idx * 1.7) % 6);
        const style = { [`--fw` as string]: fw, [`--travel` as string]: "calc(100cqw - var(--fw))", [`--dur` as string]: `${dur}s`, [`--delay` as string]: `${-((base + idx) % 9) * 1.3}s`, top: `${w.lane}%`, opacity: w.owned ? (w.c ? 0.78 : 1) : 0.5, filter: w.c ? "saturate(0.85)" : undefined } as CSSProperties;
        return (
          <div key={`${w.s.id}${idx}`} className="ct-swim" style={style}>
            <div className="ct-bob" style={{ [`--bobd` as string]: `${2.6 + (idx % 4) * 0.5}s`, animationDelay: `${-(idx % 5)}s` } as CSSProperties}>
              <div className="ct-flip">
                <div role="button" tabIndex={-1} aria-label={w.owned ? (w.s.name ?? "Pesce") : "Specie sconosciuta"} className="cursor-pointer transition-transform hover:scale-110" onClick={(e) => { e.stopPropagation(); onSpecies(w.s); }}>
                  <FishArt shape={w.s.shape} colors={w.s.colors} pattern={w.s.pattern} silhouette={!w.owned} swim={w.owned} className="w-full drop-shadow-[0_6px_6px_rgba(0,20,40,0.35)]" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {got === 0 && <div className="pointer-events-none absolute inset-0 grid place-items-center text-5xl font-bold text-white/25">?</div>}
      <div className="pointer-events-none absolute inset-y-0 left-[10%] w-[14%] -skew-x-12 bg-gradient-to-r from-white/18 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-[30%] w-[2.5%] -skew-x-12 bg-white/10" />
      <div className="pointer-events-none absolute inset-y-0 right-[8%] w-[5%] -skew-x-12 bg-gradient-to-l from-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/25 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

function WallTank({ item, th, gifts, base, onOpen, onSpecies }: { item: TankItem; th: Theme; gifts: Map<string, Donation>; base: number; onOpen: () => void; onSpecies: (s: Species) => void }) {
  const got = item.species.filter((s) => gifts.has(s.id)).length;
  const big = item.species.length === 1 && item.span >= 1.6;
  return (
    <div className="relative flex flex-col" style={{ flex: `${item.span} 1 0%`, minWidth: Math.round(210 * Math.min(item.span, 1.6)) }}>
      <div className="pointer-events-none absolute -top-4 inset-x-[14%] z-[2] h-3 rounded-full" style={{ background: th.lamp, boxShadow: `0 0 30px 10px ${th.lamp}77` }} />
      <div className="pointer-events-none absolute -top-9 inset-x-[8%] z-[1] h-10 bg-gradient-to-b from-transparent to-white/10 [clip-path:polygon(0_0,100%_0,92%_100%,8%_100%)]" />
      <div className="relative min-h-0 flex-1 rounded-t-[36px] p-[7px] shadow-[0_18px_40px_rgba(0,0,0,0.45)]" style={{ background: `linear-gradient(160deg, ${th.trim}, #0b0f14 55%, ${th.trim})` }}>
        <div className="relative size-full overflow-hidden rounded-t-[30px] ring-1 ring-black/70">
          <TankBody item={item} th={th} gifts={gifts} base={base} big={big} onOpen={onOpen} onSpecies={onSpecies} />
        </div>
      </div>
      <div className="relative rounded-b-lg border-x-[3px] border-b-[3px] px-3 pt-1.5 pb-2 text-left shadow-xl" style={{ borderColor: th.trim, background: "linear-gradient(180deg,#1b2228,#0d1216)" }}>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold text-white/95 sm:text-sm">{item.name}</p>
          <span className="shrink-0 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white/90">
            {got}/{item.species.length}
          </span>
        </div>
        <p className="truncate text-[10px] text-white/60">{item.note}</p>
        <div className="mt-1 flex gap-1 overflow-hidden">
          {item.species.map((s) => {
            const own = gifts.has(s.id);
            return (
              <span key={s.id} className="flex h-5 w-8 shrink-0 items-center justify-center rounded-sm border bg-[#f8f1dc]/90 px-0.5" style={{ borderColor: own ? RARITY[s.rarity].color : "rgba(0,0,0,0.35)", boxShadow: own ? `0 0 6px ${RARITY[s.rarity].color}88` : "none" }}>
                <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} silhouette={!own} className="w-full" />
              </span>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-[6%] top-full z-0 h-[24vh] [clip-path:polygon(10%_0,90%_0,100%_100%,0_100%)]" style={{ background: `linear-gradient(180deg, ${th.glow}66, transparent)` }} />
    </div>
  );
}

function IslandTank({ item, th, gifts, base, onOpen, onSpecies }: { item: TankItem; th: Theme; gifts: Map<string, Donation>; base: number; onOpen: () => void; onSpecies: (s: Species) => void }) {
  const got = item.species.filter((s) => gifts.has(s.id)).length;
  return (
    <div className="absolute bottom-[2.5%] left-1/2 z-[3] -translate-x-1/2" style={{ width: "min(46%, 560px)", height: "29%", minWidth: 260 }}>
      <div className="pointer-events-none absolute -bottom-[2%] -inset-x-[5%] h-[22%] rounded-[50%] bg-black/55 blur-md" />
      <div className="pointer-events-none absolute -bottom-[8%] inset-x-[-14%] h-[40%] rounded-[50%] blur-xl" style={{ background: `radial-gradient(ellipse, ${th.glow}88, transparent 70%)` }} />
      <div className="absolute inset-x-0 bottom-0 flex h-[30%] items-end justify-center rounded-[50%/45%] border-t-2 border-white/20 pb-[1%] shadow-xl" style={{ background: "linear-gradient(180deg,#39434b,#12181d)" }}>
        <div className="mb-[2.5%] flex items-center gap-2 rounded-md bg-black/55 px-3 py-1 text-white">
          <span className="max-w-[40vw] truncate text-xs font-semibold sm:text-sm">{item.name}</span>
          <span className="rounded bg-white/15 px-1.5 text-[10px] tabular-nums">
            {got}/{item.species.length}
          </span>
        </div>
      </div>
      <div className="absolute inset-x-[2%] top-0 bottom-[17%] overflow-hidden border-[3px] border-white/35 shadow-[0_0_50px_rgba(255,255,255,0.12)] [border-radius:50%/20%_20%_34%_34%]" style={{ background: th.water[1] }}>
        <TankBody item={item} th={th} gifts={gifts} base={base} big={false} onOpen={onOpen} onSpecies={onSpecies} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-white/45 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-[12%] w-[8%] -skew-x-12 bg-white/15" />
      </div>
      <div className="pointer-events-none absolute inset-x-[2%] top-[-3%] h-[17%] rounded-[50%] border-[3px] border-white/55 bg-white/10" />
    </div>
  );
}

function RoomDoor({ side, label, sub, from, to, onClick, testId, locked }: { side: "prev" | "next"; label: string; sub: string; from: string; to: string; onClick?: () => void; testId: string; locked?: boolean }) {
  const Arrow = side === "prev" ? ChevronLeft : ChevronRight;
  const body = (
    <>
      <span className="mb-2 flex max-w-full flex-col items-center rounded-md border border-black/30 bg-[#e3b341] px-2 py-1 text-center text-[11px] leading-tight font-semibold text-[#3b2a0f] shadow-lg transition-transform group-hover:scale-105">
        <span className="truncate">{label}</span>
        <span className="text-[9px] font-normal opacity-75">{sub}</span>
      </span>
      <div className="relative w-full flex-1 overflow-hidden rounded-t-[999px] border-x-[9px] border-t-[9px] border-[#4a3320] shadow-[0_0_40px_rgba(255,214,140,0.25)] transition-transform duration-200 group-hover:scale-[1.03]" style={{ background: locked ? "linear-gradient(180deg,#171b22,#2a2f3a)" : `linear-gradient(180deg, ${from}, ${to})` }}>
        {!locked && <div className="ct-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(255,255,255,0.55),transparent_62%)]" />}
        {!locked && <div className="ct-caustic absolute inset-0 opacity-30" />}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
        <Arrow className="absolute inset-x-0 top-[42%] mx-auto size-8 text-white/85 drop-shadow" />
      </div>
      <div className="h-2 w-[115%] rounded-sm bg-gradient-to-b from-[#5a3d22] to-[#2a1a0c]" />
    </>
  );
  const cls = "group relative z-[1] flex shrink-0 flex-col items-center self-end outline-none";
  const st = { width: "clamp(96px, 11vw, 150px)", height: "80%" };
  if (locked || !onClick)
    return (
      <div className={cls} style={st} data-testid={testId}>
        {body}
      </div>
    );
  return (
    <button type="button" onClick={onClick} className={cls} style={st} data-testid={testId} aria-label={label}>
      {body}
    </button>
  );
}

function FloorPlant({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 190" className="pointer-events-none absolute bottom-[-1%] z-[4] h-[30%] drop-shadow-[0_10px_8px_rgba(0,0,0,0.5)]" style={{ [flip ? "right" : "left"]: "1%", transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <defs>
        <linearGradient id={flip ? "fp-b" : "fp-a"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6fd07a" />
          <stop offset="1" stopColor="#1f6a34" />
        </linearGradient>
      </defs>
      <path d="M60 120 q-56 -14 -54 -84 q44 4 54 84Z M60 120 q54 -16 52 -92 q-48 8 -52 92Z M60 122 q-14 -50 4 -118 q20 58 -4 118Z M60 126 q-34 -30 -42 -66 q38 12 42 66Z M60 126 q34 -30 42 -60 q-38 10 -42 60Z" fill={`url(#${flip ? "fp-b" : "fp-a"})`} />
      <path d="M60 120 q-4 -50 4 -112" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" fill="none" />
      <path d="M22 124 h76 l-10 62 h-56Z" fill="#b5653a" />
      <path d="M22 124 h76 l-3 14 h-70Z" fill="#d98a58" />
      <path d="M30 140 l8 44 h-8Z" fill="#000" opacity="0.18" />
      <ellipse cx="60" cy="124" rx="38" ry="6" fill="#3a2414" />
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
              <TankScene kind={where?.decor ?? BIG_DECOR[room.def.theme] ?? "shoal"} th={th} />
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
                <dd className="mt-1 text-xs">{where ? where.name : isBig(sp) ? "Vasca grande" : "Vetrina"}</dd>
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
              <TankScene kind={tank.decor} th={th} />
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

export default function MuseumRoom({ city, roomId, onRoom, onBucket, onLobby }: { city: CityState; roomId: string; onRoom: (id: string) => void; onBucket: () => void; onLobby: () => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<Sel | null>(null);
  const [over, setOver] = useState(false);
  const gifts = useMemo(() => new Map(city.museum.map((d) => [d.species_id, d])), [city.museum]);
  const rooms = useMemo(() => buildRooms(city.species), [city.species]);
  const idx = Math.max(0, rooms.findIndex((r) => r.def.id === roomId));
  const room = rooms[idx];
  const prev = rooms[idx - 1];
  const next = rooms[idx + 1];
  const th = THEMES[room.def.theme];
  const got = room.list.filter((s) => gifts.has(s.id)).length;
  const wall = room.items.filter((it) => it.k === "hung" || it.at === "wall");
  const island = room.items.find((it): it is TankItem => it.k === "tank" && it.at === "island");
  const minW = Math.round(wall.reduce((a, it) => a + 230 * Math.min(it.span, 1.6), 0) + 360);

  const asTank = (it: ResolvedItem): TankItem => {
    if (it.k === "tank") return it;
    const sp = it.species;
    const g = gifts.get(sp.id);
    return { k: "tank", id: sp.id, name: g ? (sp.name ?? "Esemplare") : "Vasca misteriosa", note: g ? `donato da ${g.donor} · ${g.length} cm` : "ancora da donare", decor: BIG_DECOR[room.def.theme] ?? "abyss", species: [sp], at: "wall", span: it.span };
  };

  useEffect(() => {
    scroller.current?.scrollTo({ left: 0 });
    setSel(null);
  }, [roomId]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const measure = () => setOver(el.scrollWidth > el.clientWidth + 8);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [roomId, minW]);

  const scrollBy = (dx: number) => scroller.current?.scrollBy({ left: dx, behavior: "smooth" });
  let n = 0;

  const openTank = (it: ResolvedItem) => (it.k === "tank" ? setSel({ tank: it, sp: null }) : setSel({ tank: null, sp: it.species }));
  const openSpecies = (it: ResolvedItem) => (s: Species) => setSel({ tank: it.k === "tank" ? it : null, sp: s });

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-black" data-testid="museum-room">
      <div ref={scroller} className="ct-scroll absolute inset-0 overflow-x-auto overflow-y-hidden" onWheel={(e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && scroller.current) scroller.current.scrollLeft += e.deltaY; }} data-testid="room-scroller">
        <div key={roomId} className="ct-enter relative h-full w-full" style={{ minWidth: minW }}>
          <div className="absolute inset-x-0 top-0 h-[66%]" style={{ background: `linear-gradient(180deg, ${th.wallA}, ${th.wallB})` }}>
            <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.07) 0 2px, transparent 2px 54px), repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 36px)" }} />
            <div className="absolute inset-x-0 top-0 h-[10%] bg-gradient-to-b from-black/55 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-[2.2%]" style={{ background: `linear-gradient(180deg, ${th.trim}, ${th.trim}99)` }} />
            <div className="absolute inset-x-0 bottom-0 h-[16%]" style={{ background: `linear-gradient(180deg, ${th.trim}cc, ${th.trim})`, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 120px), linear-gradient(180deg, rgba(255,255,255,0.14), rgba(0,0,0,0.3))" }} />
            <div className="absolute inset-x-0 bottom-[16%] h-1.5" style={{ background: th.lamp, opacity: 0.35 }} />
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 30%, ${th.glow}22, transparent 65%)` }} />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[34%] overflow-hidden" style={{ background: `linear-gradient(180deg, ${th.floorB}, ${th.floorA})` }}>
            <div className="absolute -inset-x-[60%] top-0 h-[260%] origin-top" style={{ transform: "perspective(520px) rotateX(62deg)", backgroundColor: th.floorA, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.32) 0 2px, transparent 2px 120px), repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 70px), linear-gradient(180deg, rgba(255,255,255,0.16), rgba(0,0,0,0.25))" }} />
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 0%, ${th.glow}55, transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.45), transparent 40%, rgba(0,0,0,0.3))` }} />
          </div>
          <div className="absolute inset-x-0 top-[66%] z-[1] h-2 bg-gradient-to-b from-black/50 to-transparent" />

          <div className="absolute inset-x-0 top-[13%] bottom-[34%] z-[2] flex items-stretch gap-3 px-4 sm:gap-5 sm:px-6">
            <RoomDoor side="prev" testId="room-prev" label={prev ? prev.def.name : "Atrio"} sub={prev ? `Sala ${idx}` : "Torna indietro"} from={prev ? THEMES[prev.def.theme].water[0] : "#f1dba8"} to={prev ? THEMES[prev.def.theme].water[1] : "#8a7348"} onClick={() => (prev ? onRoom(prev.def.id) : onLobby())} />
            {wall.map((it, i) => {
              const t = asTank(it);
              return <WallTank key={`${t.id}${i}`} item={t} th={th} gifts={gifts} base={n++ * 3} onOpen={() => openTank(it)} onSpecies={openSpecies(it)} />;
            })}
            {next ? (
              <RoomDoor side="next" testId="room-next" label={next.def.name} sub={`Sala ${idx + 2}`} from={THEMES[next.def.theme].water[0]} to={THEMES[next.def.theme].water[1]} onClick={() => onRoom(next.def.id)} />
            ) : (
              <RoomDoor side="next" testId="room-end" label="Fine del percorso" sub="Altre sale in arrivo" from="#1b1f2a" to="#2a2f3a" locked />
            )}
          </div>

          {island && <IslandTank item={island} th={th} gifts={gifts} base={n++ * 3} onOpen={() => openTank(island)} onSpecies={openSpecies(island)} />}

          <FloorPlant />
          <FloorPlant flip />
          <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_50%_45%,transparent_55%,rgba(6,2,16,0.55))]" />
          {th.dark && <div className="pointer-events-none absolute inset-0 z-[5] bg-[#0a0520]/15" />}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[6] flex items-start justify-between gap-2 p-2 sm:p-3">
        <div className="w-24 sm:w-32" />
        <div className="flex min-w-0 flex-col items-center rounded-xl border border-white/15 bg-black/45 px-4 py-1.5 text-center text-white shadow-xl backdrop-blur">
          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: th.accent }}>
            Sala {idx + 1} di {rooms.length}
          </p>
          <h2 className="truncate text-sm leading-tight font-bold sm:text-base">{room.def.name}</h2>
          <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-white/20 sm:w-44">
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(got / Math.max(1, room.list.length)) * 100}%`, background: th.accent }} />
          </div>
          <p className="mt-0.5 text-[10px] tabular-nums opacity-80">
            {got}/{room.list.length} specie esposte
          </p>
          <div className="mt-1 flex gap-1">
            {rooms.map((r, i) => (
              <span key={r.def.id} className="size-1.5 rounded-full" style={{ background: i === idx ? th.accent : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
        </div>
        <div className="pointer-events-auto flex w-24 justify-end sm:w-32">
          <Button variant="secondary" size="sm" onClick={onBucket} data-testid="room-bucket-button">
            <Package /> Secchio ({city.bucket.length})
          </Button>
        </div>
      </div>

      <div key={`i${roomId}`} className="ct-intro pointer-events-none absolute inset-x-0 bottom-[4%] z-[6] mx-auto w-fit max-w-[88%] rounded-xl border border-white/15 bg-black/55 px-4 py-2 text-center text-xs text-white shadow-xl backdrop-blur sm:text-sm">
        <span className="block text-[10px] tracking-widest uppercase opacity-70">{room.def.subtitle}</span>
        {room.def.intro}
      </div>

      {over && (
        <>
          <button type="button" onClick={() => scrollBy(-460)} className="absolute top-1/2 left-2 z-[6] grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur active:scale-95" aria-label="Scorri a sinistra" data-testid="room-left">
            <ChevronLeft />
          </button>
          <button type="button" onClick={() => scrollBy(460)} className="absolute top-1/2 right-2 z-[6] grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur active:scale-95" aria-label="Scorri a destra" data-testid="room-right">
            <ChevronRight />
          </button>
        </>
      )}

      <Panel sel={sel} setSel={setSel} gifts={gifts} room={room} th={th} onClose={() => setSel(null)} />
    </div>
  );
}
