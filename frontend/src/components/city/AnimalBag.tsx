import { Gift, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { ANIMAL_BY_ID } from "@/lib/domain/animals";
import { errMsg } from "@/lib/utils/format";
import { ANIMAL_LIMIT, donateAnimal, releaseAnimal, useSandbox, type AnimalCatch } from "@/lib/runtime/sandbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AnimalArt from "./AnimalArt";
import { RarityTag, fmtWhen } from "./Bucket";

function Actions({ item, onDone, big }: { item: AnimalCatch; onDone?: () => void; big?: boolean }) {
  const size = big ? "lg" : "sm";
  const donate = () => {
    try {
      donateAnimal(item.id);
      toast.success("Animale donato al museo!");
      onDone?.();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const release = () => {
    try {
      releaseAnimal(item.id);
      onDone?.();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      <Button size={size} onClick={donate}>
        <Gift /> Dona al museo
      </Button>
      <Button size={size} variant="outline" onClick={release}>
        <Undo2 /> Rilascia
      </Button>
    </div>
  );
}

export function AnimalDialog({ item, onClose }: { item: AnimalCatch | null; onClose: () => void }) {
  const sb = useSandbox();
  const sp = item ? ANIMAL_BY_ID[item.species_id] : undefined;
  const gift = item ? sb.animalMuseum.find((g) => g.species_id === item.species_id) : undefined;
  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {item && sp && (
          <>
            <DialogHeader>
              <DialogTitle>Hai cacciato: {sp.name}!</DialogTitle>
              <DialogDescription>{sp.description}</DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border border-[#30363D] bg-[#12261E] p-4">
              <AnimalArt a={sp} className="mx-auto w-full max-w-[260px] drop-shadow-lg" />
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <RarityTag rarity={sp.rarity} />
              <span className="tabular-nums text-[#C9D1D9]">{item.weight} kg</span>
            </div>
            {gift ? (
              <p className="rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-2 text-xs text-[#8B949E]">
                Questa specie è già nel museo: donata da {gift.donor} il {fmtWhen(gift.donated_at)}.
              </p>
            ) : (
              <p className="rounded-md border border-[#3FB950]/30 bg-[#12261E] px-3 py-2 text-xs text-[#7EE787]">Nessuno l'ha ancora donata: puoi essere il primo!</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Actions item={item} onDone={onClose} big />
              <Button variant="ghost" size="lg" onClick={onClose}>
                Tieni nello zaino
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AnimalBag({ open, onClose }: { open: boolean; onClose: () => void }) {
  const sb = useSandbox();
  const gifts = new Set(sb.animalMuseum.map((g) => g.species_id));
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Il tuo zaino</DialogTitle>
          <DialogDescription>
            {sb.animalBag.length}/{ANIMAL_LIMIT} animali. Dona al museo quelli che mancano, rilascia gli altri.
          </DialogDescription>
        </DialogHeader>
        {sb.animalBag.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#30363D] px-4 py-8 text-center text-sm text-[#8B949E]">Lo zaino è vuoto. Vai nella foresta a cacciare!</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {sb.animalBag.map((it) => {
              const sp = ANIMAL_BY_ID[it.species_id];
              return (
                <li key={it.id} className="flex flex-col gap-2 rounded-lg border border-[#30363D] bg-[#0D1117] p-3">
                  <div className="flex items-center gap-3">
                    <AnimalArt a={sp} className="w-20 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{sp.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[#8B949E]">
                        <RarityTag rarity={sp.rarity} />
                        <span className="tabular-nums">{it.weight} kg</span>
                      </div>
                    </div>
                  </div>
                  {gifts.has(it.species_id) && <p className="text-[11px] text-[#8B949E]">Già nel museo</p>}
                  <Actions item={it} />
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
