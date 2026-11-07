import { useMemo, useState } from "react";
import { FOSSILS, condition, type FossilSpecies } from "@/lib/domain/fossils";
import { useSandbox } from "@/lib/runtime/sandbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FossilArt from "./FossilArt";
import { RarityTag, fmtWhen } from "./Bucket";

export default function FossilRoom() {
  const sb = useSandbox();
  const [sel, setSel] = useState<FossilSpecies | null>(null);
  const gifts = useMemo(() => new Map(sb.fossilMuseum.map((g) => [g.species_id, g])), [sb.fossilMuseum]);
  const gift = sel ? gifts.get(sel.id) : undefined;
  const cond = gift ? condition(gift.integrity) : null;
  const done = gifts.size;

  return (
    <div className="absolute inset-0 overflow-y-auto pt-14 pb-10" style={{ background: "radial-gradient(ellipse at 50% 0%, #4b3a26 0%, #261a10 55%, #130d07 100%)" }} data-testid="fossil-room">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,236,170,0.22),transparent_70%)]" />
      <div className="relative mx-auto w-full max-w-6xl px-4">
        <div className="mx-auto mb-6 w-fit rounded-xl border border-[#e3b341]/70 bg-[#2a1d0f]/85 px-5 py-2 text-center shadow-xl">
          <p className="text-[10px] font-medium tracking-wider text-[#e3cfa0] uppercase">Sala dei fossili</p>
          <p className="text-lg leading-none font-bold tabular-nums text-[#fff3c4]">
            {done}/{FOSSILS.length}
          </p>
          <div className="mx-auto mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full bg-gradient-to-r from-[#e3b341] to-[#f0883e]" style={{ width: `${(done / FOSSILS.length) * 100}%` }} />
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {FOSSILS.map((f) => {
            const g = gifts.get(f.id);
            return (
              <li key={f.id}>
                <button type="button" onClick={() => setSel(f)} className="group flex w-full flex-col items-center outline-none" data-testid={`fossil-case-${f.id}`}>
                  <div className="relative flex aspect-[5/4] w-full items-center justify-center overflow-hidden rounded-t-xl border-[5px] border-b-0 border-[#6b4a2b] bg-gradient-to-b from-[#3a4a52]/70 to-[#1b252b]/90 p-4 transition-[filter] group-hover:brightness-125 group-focus-visible:brightness-125">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,244,200,0.35),transparent_65%)]" />
                    <div className="pointer-events-none absolute -inset-y-4 left-[18%] w-[10%] rotate-12 bg-white/10 blur-[2px]" />
                    <FossilArt s={f} bare silhouette={!g} className="relative max-h-full w-full drop-shadow-xl" />
                  </div>
                  <div className="w-full rounded-b-md border-[5px] border-t-0 border-[#6b4a2b] bg-[#8a6a43] px-2 py-1.5 text-center shadow-lg">
                    <p className="truncate text-xs font-semibold text-[#2a1d0f]">{g ? f.name : "???"}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="sm:max-w-md">
          {sel && (
            <>
              <DialogHeader>
                <DialogTitle>{gift ? sel.name : "Fossile sconosciuto"}</DialogTitle>
                <DialogDescription>{gift ? sel.description : "Nessuno ha ancora donato questo fossile. Cercalo al sito di scavo!"}</DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border border-[#30363D] bg-[#241c12] p-4">
                <FossilArt s={sel} bare silhouette={!gift} className="mx-auto max-h-56 w-full max-w-[300px]" />
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <RarityTag rarity={sel.rarity} />
                {gift && <span className="text-xs text-[#8B949E]">{sel.era}</span>}
                {gift && cond && (
                  <span className="font-medium tabular-nums" style={{ color: cond.color }}>
                    {cond.label}
                  </span>
                )}
              </div>
              {gift && <p className="rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-2 text-xs text-[#8B949E]">Donato da {gift.donor} il {fmtWhen(gift.donated_at)}.</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
