import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import { ANIMALS, type AnimalSpecies } from "@/lib/animals";
import { useSandbox } from "@/lib/sandbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AnimalArt from "./AnimalArt";
import AnimalBag from "./AnimalBag";
import { RarityTag, fmtWhen } from "./Bucket";
import "./city.css";

export default function AnimalRoom() {
  const sb = useSandbox();
  const [bag, setBag] = useState(false);
  const [sel, setSel] = useState<AnimalSpecies | null>(null);
  const gifts = useMemo(() => new Map(sb.animalMuseum.map((g) => [g.species_id, g])), [sb.animalMuseum]);
  const total = ANIMALS.length;
  const done = gifts.size;
  const gift = sel ? gifts.get(sel.id) : undefined;
  return (
    <div className="absolute inset-0 overflow-y-auto bg-[#2a1d12]" data-testid="animal-room">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(0,0,0,0.35)),repeating-linear-gradient(90deg,rgba(90,60,30,0.2)_0_3px,transparent_3px_80px)]" />
      <div className="relative mx-auto max-w-5xl px-4 pt-16 pb-28">
        <div className="mx-auto mb-6 w-fit rounded-lg border-[3px] border-[#e3b341] bg-[#2a1d0f]/90 px-6 py-2 text-center shadow-xl">
          <p className="text-[10px] font-medium tracking-wider text-[#e3cfa0] uppercase">Collezione animali</p>
          <p className="text-2xl leading-none font-bold tabular-nums text-[#fff3c4]">
            {done}/{total}
          </p>
          <div className="mx-auto mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full bg-gradient-to-r from-[#e3b341] to-[#f0883e]" style={{ width: `${(done / total) * 100}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ANIMALS.map((a) => {
            const owned = gifts.has(a.id);
            return (
              <button key={a.id} type="button" onClick={() => setSel(a)} className="group flex flex-col items-center outline-none" aria-label={owned ? a.name : "Animale sconosciuto"}>
                <div className="w-full rounded-sm border-[8px] border-[#6b4a2b] bg-[#f4ecd2] p-1 shadow-lg transition-transform group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5">
                  <div className="grid aspect-[4/3] place-items-center rounded-sm" style={{ background: owned ? "linear-gradient(180deg,#a9d6a0,#3f7d47)" : "linear-gradient(180deg,#52606b,#2b333b)" }}>
                    <AnimalArt a={a} silhouette={!owned} className="size-full p-2" />
                  </div>
                </div>
                <div className="mt-1.5 rounded bg-[#e3b341] px-2 py-0.5 text-[11px] font-semibold text-[#2a1d0f]">{owned ? a.name : "???"}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1a0f08] to-transparent" />
      <Button variant="secondary" size="lg" className="fixed right-4 bottom-4 z-[3]" onClick={() => setBag(true)} data-testid="animal-room-bag">
        <Package /> Zaino ({sb.animalBag.length})
      </Button>
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="sm:max-w-md">
          {sel && (
            <>
              <DialogHeader>
                <DialogTitle>{gift ? sel.name : "Animale sconosciuto"}</DialogTitle>
                <DialogDescription>{gift ? sel.description : "Nessuno ha ancora donato questa specie."}</DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border border-[#30363D] bg-[#12261E] p-4">
                <AnimalArt a={sel} silhouette={!gift} className="mx-auto w-full max-w-[260px]" />
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <RarityTag rarity={sel.rarity} />
                {gift && <span className="tabular-nums text-[#C9D1D9]">{gift.weight} kg</span>}
              </div>
              {gift && <p className="rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-2 text-xs text-[#8B949E]">Donato da {gift.donor} il {fmtWhen(gift.donated_at)}.</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
      <AnimalBag open={bag} onClose={() => setBag(false)} />
    </div>
  );
}
