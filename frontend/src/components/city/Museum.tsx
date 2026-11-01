import { useMemo, useState } from "react";
import { Landmark, Package } from "lucide-react";
import type { CityState, Species } from "@/lib/city";
import { TIER, RARITY } from "@/components/pets/rarity";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Segmented } from "@/components/common";
import type { Rarity } from "@/lib/types";
import FishArt from "./FishArt";
import { RarityTag, fmtWhen } from "./Bucket";

type Filter = "tutti" | "donati" | "mancanti";

export default function Museum({ city, onBucket }: { city: CityState; onBucket: () => void }) {
  const [filter, setFilter] = useState<Filter>("tutti");
  const [open, setOpen] = useState<Species | null>(null);
  const gifts = useMemo(() => new Map(city.museum.map((d) => [d.species_id, d])), [city.museum]);
  const sorted = useMemo(() => [...city.species].sort((a, b) => TIER[a.rarity] - TIER[b.rarity] || a.min_cm - b.min_cm), [city.species]);
  const shown = sorted.filter((s) => (filter === "tutti" ? true : filter === "donati" ? gifts.has(s.id) : !gifts.has(s.id)));
  const total = city.species.length;
  const done = city.museum.length;
  const donors = useMemo(() => {
    const m = new Map<string, number>();
    city.museum.forEach((d) => m.set(d.donor, (m.get(d.donor) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [city.museum]);
  const perRarity = (Object.keys(RARITY) as Rarity[]).map((r) => ({
    r,
    have: city.species.filter((s) => s.rarity === r && gifts.has(s.id)).length,
    all: city.species.filter((s) => s.rarity === r).length,
  }));
  const gift = open ? gifts.get(open.id) : undefined;

  return (
    <div className="space-y-5" data-testid="museum-view">
      <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-[#21262D] text-[#E3B341]">
              <Landmark className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">
                {done}/{total} specie
              </p>
              <p className="text-xs text-[#8B949E]">donate al museo dal gruppo</p>
            </div>
          </div>
          <Button variant="outline" size="lg" onClick={onBucket} data-testid="museum-bucket-button">
            <Package /> Il mio secchio ({city.bucket.length})
          </Button>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#0D1117]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#388BFD] to-[#E3B341]" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {perRarity.map(({ r, have, all }) => (
            <span key={r} className="inline-flex items-center gap-1 rounded border border-[#30363D] bg-[#0D1117] px-1.5 py-0.5 text-[11px] text-[#C9D1D9]">
              <span className="size-2 rounded-full" style={{ background: RARITY[r].color }} />
              {RARITY[r].label} {have}/{all}
            </span>
          ))}
        </div>
        {donors.length > 0 && (
          <p className="mt-3 text-xs text-[#8B949E]">
            Top donatori: {donors.map(([n, c]) => `${n} (${c})`).join(" · ")}
          </p>
        )}
      </div>

      <Segmented<Filter>
        value={filter}
        onChange={setFilter}
        testId="museum-filter"
        options={[
          { value: "tutti", label: "Tutti" },
          { value: "donati", label: "Donati" },
          { value: "mancanti", label: "Mancanti" },
        ]}
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" data-testid="museum-grid">
        {shown.map((s) => {
          const g = gifts.get(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setOpen(s)}
                className="flex h-full w-full flex-col gap-2 rounded-xl border bg-[#161B22] p-3 text-left transition-colors duration-150 hover:bg-[#1B222B]"
                style={{ borderColor: g ? `${RARITY[s.rarity].color}55` : "#30363D" }}
                data-testid={`museum-card-${s.id}`}
              >
                <div className="rounded-lg bg-[#0b2a3d] p-2">
                  <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} silhouette={!g} className="w-full" />
                </div>
                <p className="truncate text-sm font-medium">{g || s.name ? s.name : "???"}</p>
                <RarityTag rarity={s.rarity} />
                <p className="min-h-8 text-[11px] leading-snug text-[#8B949E]">{g ? `Donato da ${g.donor} · ${fmtWhen(g.donated_at).split(" alle ")[0]}` : "Non ancora donato"}</p>
              </button>
            </li>
          );
        })}
      </ul>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.name ?? "Specie sconosciuta"}</DialogTitle>
                <DialogDescription>{open.description ?? "Pesca questo pesce per scoprirne il nome e donarlo al museo."}</DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border border-[#30363D] bg-[#0b2a3d] p-4">
                <FishArt shape={open.shape} colors={open.colors} pattern={open.pattern} silhouette={!gift} className="mx-auto w-full max-w-[280px]" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <RarityTag rarity={open.rarity} />
                <span className="tabular-nums text-[#8B949E]">
                  {open.min_cm}–{open.max_cm} cm
                </span>
              </div>
              {gift ? (
                <div className="rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-2 text-sm">
                  <p>
                    Donato da <span className="font-medium">{gift.donor}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-[#8B949E]">
                    {fmtWhen(gift.donated_at)} · esemplare di {gift.length} cm
                  </p>
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-[#30363D] px-3 py-2 text-xs text-[#8B949E]">Nessuno ha ancora donato questa specie.</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
