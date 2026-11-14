import { useMemo, useState } from "react";
import { ArrowLeft, Package } from "lucide-react";
import type { CityState, Donation, Species } from "@/lib/domain/city";
import { RARITY } from "@/components/pets/rarity";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FishArt from "../fishing/FishArt";
import { RarityTag, fmtWhen } from "../shared/Bucket";
import { Bubbles, Scenery } from "./Aqua";
import AquaScene from "./AquaScene";
import { THEMES, buildRooms, isBig, type ResolvedRoom, type ResolvedSystem, type Theme } from "../shared/rooms";
import "../shared/city.css";

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

export default function MuseumRoom({ city, roomId, onRoom, onAtrium, onBucket }: { city: CityState; roomId: string; onRoom: (id: string) => void; onAtrium: () => void; onBucket: () => void }) {
  const [sel, setSel] = useState<Sel | null>(null);
  const gifts = useMemo(() => new Map(city.museum.map((d) => [d.species_id, d])), [city.museum]);
  const rooms = useMemo(() => buildRooms(city.species), [city.species]);
  const idx = Math.max(0, rooms.findIndex((r) => r.def.id === roomId));
  const room = rooms[idx];
  const prev = rooms[idx - 1];
  const next = rooms[idx + 1];
  const th = THEMES[room.def.theme];
  const got = room.list.filter((s) => gifts.has(s.id)).length;
  const goPrev = () => (prev ? onRoom(prev.def.id) : onAtrium());
  const goNext = next ? () => onRoom(next.def.id) : undefined;

  return (
    <div className="ct-dolly absolute inset-0" data-testid="museum-room">
      <AquaScene key={room.def.id} room={room} th={th} gifts={gifts} prevName={prev ? prev.def.name : "Atrio"} nextName={next ? next.def.name : null} onFish={(sp, tank) => setSel({ tank, sp })} onZone={(tank) => setSel({ tank, sp: null })} onPrev={goPrev} onNext={goNext} />
      <div className="absolute left-3 z-[3] max-w-[min(280px,62vw)] rounded-xl border border-white/15 bg-black/55 p-2.5 text-white shadow-xl backdrop-blur" style={{ bottom: "calc(15% + 12px)" }}>
        <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: th.accent }}>
          Sala {idx + 1} di {rooms.length}
        </p>
        <h2 className="text-sm leading-tight font-bold">{room.def.name}</h2>
        <p className="mt-1 hidden text-[11px] leading-snug text-white/75 sm:block">{room.def.intro}</p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(got / Math.max(1, room.list.length)) * 100}%`, background: th.accent }} />
        </div>
        <p className="mt-1 text-[10px] tabular-nums text-white/70">
          {got}/{room.list.length} specie esposte
        </p>
      </div>
      <Button variant="secondary" size="lg" className="absolute right-3 z-[3]" style={{ bottom: "calc(15% + 12px)" }} onClick={onBucket} data-testid="room-bucket-button">
        <Package /> Secchio ({city.bucket.length})
      </Button>
      <Panel sel={sel} setSel={setSel} gifts={gifts} room={room} th={th} onClose={() => setSel(null)} />
    </div>
  );
}
