import { Gift, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { FOSSIL_BY_ID, condition } from "@/lib/domain/fossils";
import { errMsg } from "@/lib/utils/format";
import { FOSSIL_LIMIT, discardFossil, donateFossil, useSandbox, type FossilCatch } from "@/lib/runtime/sandbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FossilArt from "./FossilArt";
import { RarityTag, fmtWhen } from "../shared/Bucket";

function Actions({ item, onDone, big }: { item: FossilCatch; onDone?: () => void; big?: boolean }) {
  const size = big ? "lg" : "sm";
  const donate = () => {
    try {
      donateFossil(item.id);
      toast.success("Fossile donato al museo!");
      onDone?.();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  const discard = () => {
    try {
      discardFossil(item.id);
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
      <Button size={size} variant="outline" onClick={discard}>
        <Undo2 /> Scarta
      </Button>
    </div>
  );
}

export function FossilDialog({ item, onClose }: { item: FossilCatch | null; onClose: () => void }) {
  const sb = useSandbox();
  const sp = item ? FOSSIL_BY_ID[item.species_id] : undefined;
  const gift = item ? sb.fossilMuseum.find((g) => g.species_id === item.species_id) : undefined;
  const cond = item ? condition(item.integrity) : null;
  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {item && sp && cond && (
          <>
            <DialogHeader>
              <DialogTitle>Hai trovato: {sp.name}!</DialogTitle>
              <DialogDescription>{sp.description}</DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border border-[#30363D] bg-[#241c12] p-4">
              <FossilArt s={sp} bare className="mx-auto max-h-56 w-full max-w-[300px] drop-shadow-lg" />
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <RarityTag rarity={sp.rarity} />
              <span className="text-xs text-[#8B949E]">{sp.era}</span>
              <span className="font-medium tabular-nums" style={{ color: cond.color }}>
                {cond.label} · {item.integrity}%
              </span>
            </div>
            {gift ? (
              <p className="rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-2 text-xs text-[#8B949E]">
                Questa specie è già nel museo: donata da {gift.donor} il {fmtWhen(gift.donated_at)}.
              </p>
            ) : (
              <p className="rounded-md border border-[#3FB950]/30 bg-[#12261E] px-3 py-2 text-xs text-[#7EE787]">Nessuno l'ha ancora donato: puoi essere il primo!</p>
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

export default function FossilBag({ open, onClose }: { open: boolean; onClose: () => void }) {
  const sb = useSandbox();
  const gifts = new Set(sb.fossilMuseum.map((g) => g.species_id));
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Il tuo zaino da scavo</DialogTitle>
          <DialogDescription>
            {sb.fossilBag.length}/{FOSSIL_LIMIT} fossili. Dona al museo quelli che mancano, scarta gli altri.
          </DialogDescription>
        </DialogHeader>
        {sb.fossilBag.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#30363D] px-4 py-8 text-center text-sm text-[#8B949E]">Lo zaino è vuoto. Vai a scavare!</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {sb.fossilBag.map((it) => {
              const sp = FOSSIL_BY_ID[it.species_id];
              const cond = condition(it.integrity);
              return (
                <li key={it.id} className="flex flex-col gap-2 rounded-lg border border-[#30363D] bg-[#0D1117] p-3">
                  <div className="flex items-center gap-3">
                    <FossilArt s={sp} bare className="h-16 w-20 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{sp.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8B949E]">
                        <RarityTag rarity={sp.rarity} />
                        <span style={{ color: cond.color }}>{cond.label}</span>
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
