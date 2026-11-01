import { useMemo, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import type { CityState, Donation, Species } from "@/lib/city";
import type { Rarity } from "@/lib/types";
import { RARITY, TIER } from "@/components/pets/rarity";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FishArt from "./FishArt";
import { RarityTag, fmtWhen } from "./Bucket";
import "./city.css";

const isHung = (s: Species) => s.max_cm >= 80;

function Bubbles({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="ct-bubble"
          style={{ left: `${12 + ((i * 37) % 76)}%`, width: 4 + (i % 3) * 3, height: 4 + (i % 3) * 3, ["--bd" as string]: `${3.4 + (i % 4) * 0.8}s`, ["--bdelay" as string]: `${i * 0.6}s` } as CSSProperties}
        />
      ))}
    </>
  );
}

function Plants() {
  return (
    <svg viewBox="0 0 200 60" className="pointer-events-none absolute inset-x-0 bottom-[10%] w-full" aria-hidden>
      <path d="M20 60 q-6 -26 4 -48 q4 22 8 48Z" fill="#2f9a56" opacity="0.9" />
      <path d="M34 60 q8 -20 0 -38 q-8 20 -4 38Z" fill="#3fb36a" opacity="0.85" />
      <path d="M170 60 q-8 -30 2 -52 q6 24 10 52Z" fill="#2f9a56" opacity="0.9" />
      <path d="M156 60 q6 -18 -2 -34 q-8 18 -2 34Z" fill="#3fb36a" opacity="0.85" />
      <ellipse cx="100" cy="58" rx="12" ry="5" fill="#8c8f98" />
    </svg>
  );
}

function Tank({ s, g, i, onOpen }: { s: Species; g: Donation | undefined; i: number; onOpen: () => void }) {
  const fw = Math.round(Math.min(130, 44 + Math.sqrt(s.max_cm) * 5.5));
  const style = { ["--fw" as string]: `${fw}px`, ["--dur" as string]: `${8 + (i % 5) * 1.3}s`, ["--delay" as string]: `${-(i % 7) * 1.1}s` } as CSSProperties;
  return (
    <button type="button" onClick={onOpen} className="group relative flex w-[210px] flex-col items-stretch outline-none" data-testid={`hall-tank-${s.id}`} aria-label={g && s.name ? s.name : "Acquario vuoto"}>
      <div className="relative h-[min(30dvh,200px)] overflow-hidden rounded-t-xl border-[5px] border-[#a9b4c0] bg-gradient-to-b from-[#5cc0df] to-[#1d6a8e] shadow-xl transition-transform duration-150 group-hover:scale-[1.02] group-focus-visible:scale-[1.02]" style={{ opacity: g ? 1 : 0.8 }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.35),transparent_65%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[12%] bg-gradient-to-t from-[#c9b27a] to-[#a8955f]" />
        <Plants />
        <Bubbles n={g ? 6 : 3} />
        {g ? (
          <div className="ct-swim top-[28%]" style={style}>
            <div className="ct-bob" style={{ animationDelay: `${-(i % 5)}s` }}>
              <div className="ct-flip" style={style}>
                <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} className="w-full drop-shadow" />
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-4xl font-bold text-white/35">?</div>
        )}
      </div>
      <div className="rounded-b-md border-x-[5px] border-b-[5px] border-[#5a3d22] bg-gradient-to-b from-[#8a6a43] to-[#6b4a2b] px-2 py-1.5 text-center">
        <p className="truncate text-xs font-semibold text-[#f6e7b4]">{g ? s.name : "Acquario libero"}</p>
        <p className="truncate text-[10px] text-[#d9c59a]">{g ? `donato da ${g.donor}` : "in attesa di un ospite"}</p>
      </div>
    </button>
  );
}

function Hung({ s, g, onOpen }: { s: Species; g: Donation | undefined; onOpen: () => void }) {
  const w = Math.round(Math.min(170, 80 + Math.sqrt(s.max_cm) * 6));
  return (
    <button type="button" onClick={onOpen} className="group relative flex flex-col items-center outline-none" data-testid={`hall-hung-${s.id}`} aria-label={g && s.name ? s.name : "Targa vuota"}>
      <div className="ct-hang flex flex-col items-center transition-transform duration-150 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]">
        <div className="flex w-16 justify-between">
          <span className="h-5 w-px bg-[#5a3d22]" />
          <span className="h-5 w-px bg-[#5a3d22]" />
        </div>
        <div className="rounded-xl border-4 border-[#5a3d22] bg-gradient-to-b from-[#a37a4d] to-[#7a5230] p-3 shadow-xl" style={{ width: w + 40 }}>
          {g ? (
            <div className="rounded-md bg-[#f1e6c8]/20 p-1" style={{ transform: "rotate(-6deg)" }}>
              <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} className="w-full drop-shadow-lg" />
            </div>
          ) : (
            <div className="grid place-items-center rounded-md bg-black/20 py-3 text-3xl font-bold text-white/40" style={{ minHeight: 70 }}>
              ?
            </div>
          )}
        </div>
        <div className="-mt-1 w-[88%] rounded-b-md border-2 border-[#8a6a1f] bg-gradient-to-b from-[#e3b341] to-[#b98c25] px-2 py-1 text-center shadow">
          <p className="truncate text-[11px] font-semibold text-[#3b2a0f]">{g ? s.name : "Targa vuota"}</p>
          <p className="truncate text-[9px] text-[#5a410f]">{g ? `donato da ${g.donor}` : "da donare"}</p>
        </div>
      </div>
    </button>
  );
}

function Plant() {
  return (
    <svg viewBox="0 0 60 90" className="w-12 opacity-95" aria-hidden>
      <path d="M30 60 q-22 -6 -22 -34 q18 2 22 34Z M30 60 q22 -8 22 -38 q-20 4 -22 38Z M30 60 q-4 -20 2 -46 q8 22 -2 46Z" fill="#3f9a4a" />
      <path d="M14 60 h32 l-4 28 h-24Z" fill="#b5653a" />
      <rect x="12" y="56" width="36" height="7" rx="2" fill="#c97a4a" />
    </svg>
  );
}

function Bench() {
  return (
    <div className="flex flex-col items-center opacity-95" aria-hidden>
      <div className="h-3 w-28 rounded-sm bg-[#a37a4d]" />
      <div className="flex w-24 justify-between">
        <span className="h-8 w-2 bg-[#5a3d22]" />
        <span className="h-8 w-2 bg-[#5a3d22]" />
      </div>
    </div>
  );
}

function Sconce() {
  return (
    <div className="flex flex-col items-center" aria-hidden>
      <div className="ct-glow size-14 rounded-full bg-[radial-gradient(circle,rgba(255,226,140,0.85),transparent_70%)]" />
      <div className="-mt-9 h-4 w-3 rounded-sm bg-[#8a6a1f]" />
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="tracking-tight text-[#E3B341]" aria-label={`${n} su 10`}>
      {"★".repeat(Math.max(1, Math.round(n / 2)))}
      <span className="text-[#30363D]">{"★".repeat(5 - Math.max(1, Math.round(n / 2)))}</span>
    </span>
  );
}

function Detail({ s, g, onClose }: { s: Species | null; g: Donation | undefined; onClose: () => void }) {
  const known = !!s?.name;
  return (
    <Dialog open={!!s} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        {s && (
          <>
            <DialogHeader>
              <DialogTitle>{known ? s.name : "Specie sconosciuta"}</DialogTitle>
              <DialogDescription>{s.description ?? "Pesca questo pesce per scoprirne il nome e donarlo al museo."}</DialogDescription>
            </DialogHeader>
            <div className="relative h-44 overflow-hidden rounded-xl border border-[#30363D] bg-gradient-to-b from-[#5cc0df] to-[#1d6a8e]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.35),transparent_65%)]" />
              <Bubbles n={5} />
              <div className="ct-float absolute inset-0 grid place-items-center p-4">
                <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} silhouette={!g} className="w-full max-w-[260px] drop-shadow-xl" />
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-[#30363D] bg-[#0D1117] p-2.5">
                <dt className="text-[11px] text-[#8B949E]">Rarità</dt>
                <dd className="mt-1">
                  <RarityTag rarity={s.rarity} />
                </dd>
              </div>
              <div className="rounded-lg border border-[#30363D] bg-[#0D1117] p-2.5">
                <dt className="text-[11px] text-[#8B949E]">Esposizione</dt>
                <dd className="mt-1">{isHung(s) ? "Appeso in sala" : "Acquario vivo"}</dd>
              </div>
              <div className="rounded-lg border border-[#30363D] bg-[#0D1117] p-2.5">
                <dt className="text-[11px] text-[#8B949E]">Dimensioni tipiche</dt>
                <dd className="mt-1 tabular-nums">
                  {s.min_cm}–{s.max_cm} cm
                </dd>
              </div>
              <div className="rounded-lg border border-[#30363D] bg-[#0D1117] p-2.5">
                <dt className="text-[11px] text-[#8B949E]">Difficoltà di pesca</dt>
                <dd className="mt-1">{known ? <Stars n={s.difficulty} /> : "???"}</dd>
              </div>
            </dl>
            {g ? (
              <div className="rounded-lg border border-[#E3B341]/30 bg-[#342207]/40 p-3 text-sm">
                <p>
                  Donato da <span className="font-semibold">{g.donor}</span>
                </p>
                <p className="mt-0.5 text-xs text-[#C9D1D9]">
                  {fmtWhen(g.donated_at)} · esemplare di {g.length} cm
                </p>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-[#30363D] px-3 py-2 text-xs text-[#8B949E]">Nessuno ha ancora donato questa specie. Vai al Pond e pescala!</p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function FishHall({ city, onBucket }: { city: CityState; onBucket: () => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Species | null>(null);
  const gifts = useMemo(() => new Map(city.museum.map((d) => [d.species_id, d])), [city.museum]);
  const sorted = useMemo(() => [...city.species].sort((a, b) => TIER[a.rarity] - TIER[b.rarity] || a.max_cm - b.max_cm), [city.species]);
  const groups = useMemo(() => {
    const out: { rarity: Rarity; items: Species[] }[] = [];
    sorted.forEach((s) => {
      const last = out[out.length - 1];
      if (last && last.rarity === s.rarity) last.items.push(s);
      else out.push({ rarity: s.rarity, items: [s] });
    });
    return out;
  }, [sorted]);

  const scrollBy = (dx: number) => scroller.current?.scrollBy({ left: dx, behavior: "smooth" });
  const jump = (r: Rarity) => document.getElementById(`hall-${r}`)?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });

  let n = 0;
  return (
    <div className="relative flex h-full flex-col overflow-hidden" data-testid="fish-hall">
      <div className="relative z-[3] flex flex-wrap items-center gap-1.5 border-b border-black/20 bg-[#161B22]/90 px-3 py-2 backdrop-blur">
        {groups.map((g) => (
          <button
            key={g.rarity}
            type="button"
            onClick={() => jump(g.rarity)}
            className="inline-flex items-center gap-1 rounded border border-[#30363D] bg-[#0D1117] px-2 py-1 text-[11px] text-[#C9D1D9] hover:text-white"
            data-testid={`hall-jump-${g.rarity}`}
          >
            <span className="size-2 rounded-full" style={{ background: RARITY[g.rarity].color }} />
            {RARITY[g.rarity].label}
            <span className="tabular-nums text-[#8B949E]">
              {g.items.filter((s) => gifts.has(s.id)).length}/{g.items.length}
            </span>
          </button>
        ))}
        <Button variant="secondary" size="sm" className="ml-auto" onClick={onBucket} data-testid="hall-bucket-button">
          <Package /> Secchio ({city.bucket.length})
        </Button>
      </div>

      <div
        ref={scroller}
        className="ct-wall relative min-h-0 flex-1 overflow-x-auto overflow-y-hidden"
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && scroller.current) scroller.current.scrollLeft += e.deltaY;
        }}
        data-testid="hall-scroller"
      >
        <div className="relative flex h-full min-w-max items-stretch px-6">
          <div className="ct-floor absolute inset-x-0 bottom-0 h-[15%] border-t-4 border-[#5a3d22]" />
          {groups.map((g) => (
            <div key={g.rarity} className="relative flex items-stretch">
              <div id={`hall-${g.rarity}`} className="flex w-[120px] shrink-0 flex-col items-center pt-6">
                <div className="h-6 w-px bg-[#5a3d22]" />
                <div className="w-24 rounded-b-lg border-2 border-t-0 border-black/20 px-2 pt-3 pb-5 text-center text-xs font-bold text-white shadow-lg [clip-path:polygon(0_0,100%_0,100%_88%,50%_100%,0_88%)]" style={{ background: RARITY[g.rarity].color }}>
                  {RARITY[g.rarity].label}
                  <span className="mt-1 block text-[10px] font-medium opacity-90">
                    {g.items.filter((s) => gifts.has(s.id)).length}/{g.items.length}
                  </span>
                </div>
              </div>
              {g.items.map((s) => {
                const gift = gifts.get(s.id);
                const idx = n++;
                const hung = isHung(s);
                return (
                  <div key={s.id} className="flex w-[240px] shrink-0 flex-col">
                    <div className="flex flex-[1.1] items-center justify-center pt-3">{hung ? <Hung s={s} g={gift} onOpen={() => setOpen(s)} /> : <Sconce />}</div>
                    <div className="flex flex-1 items-end justify-center pb-[8%]">
                      {hung ? idx % 2 ? <Plant /> : <Bench /> : <Tank s={s} g={gift} i={idx} onOpen={() => setOpen(s)} />}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div className="w-10 shrink-0" />
        </div>
      </div>

      <button type="button" onClick={() => scrollBy(-420)} className="absolute top-1/2 left-2 z-[3] grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur active:scale-95" aria-label="Scorri a sinistra" data-testid="hall-left">
        <ChevronLeft />
      </button>
      <button type="button" onClick={() => scrollBy(420)} className="absolute top-1/2 right-2 z-[3] grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur active:scale-95" aria-label="Scorri a destra" data-testid="hall-right">
        <ChevronRight />
      </button>

      <Detail s={open} g={open ? gifts.get(open.id) : undefined} onClose={() => setOpen(null)} />
    </div>
  );
}
