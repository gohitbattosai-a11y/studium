import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Gift, Undo2 } from "lucide-react";
import { useCityActions, type CatchInfo, type CityState } from "@/lib/domain/city";
import type { Rarity } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RARITY } from "@/components/pets/rarity";
import FishArt from "../fishing/FishArt";

export const fmtWhen = (iso: string) => format(new Date(iso), "d MMMM yyyy 'alle' HH:mm", { locale: it });

export function RarityTag({ rarity }: { rarity: Rarity }) {
  const r = RARITY[rarity];
  return (
    <span className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px]" style={{ borderColor: `${r.color}55`, color: r.color, background: `${r.color}14` }}>
      <span className="size-1.5 rounded-full" style={{ background: r.color }} />
      {r.label}
    </span>
  );
}

function FishActions({ fish, onDone, big }: { fish: CatchInfo; onDone?: () => void; big?: boolean }) {
  const { donate, release } = useCityActions();
  const busy = donate.isPending || release.isPending;
  const size = big ? "lg" : "sm";
  return (
    <div className="flex flex-wrap gap-1.5">
      {!fish.donated_by && (
        <Button size={size} disabled={busy} onClick={() => donate.mutate(fish.id, { onSuccess: onDone })} data-testid={`donate-${fish.id}`}>
          <Gift /> Dona al museo
        </Button>
      )}
      <Button size={size} variant="outline" disabled={busy} onClick={() => release.mutate(fish.id, { onSuccess: onDone })} data-testid={`release-${fish.id}`}>
        <Undo2 /> Rilascia
      </Button>
    </div>
  );
}

export function CatchDialog({ fish, city, onClose }: { fish: CatchInfo | null; city: CityState | undefined; onClose: () => void }) {
  const species = fish ? city?.species.find((s) => s.id === fish.species_id) : undefined;
  return (
    <Dialog open={!!fish} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {fish && species && (
          <>
            <DialogHeader>
              <DialogTitle>Hai pescato: {fish.name}!</DialogTitle>
              <DialogDescription>{species.description ?? ""}</DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border border-[#30363D] bg-[#0b2a3d] p-4">
              <FishArt shape={species.shape} colors={species.colors} pattern={species.pattern} className="mx-auto w-full max-w-[280px] drop-shadow-lg" />
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <RarityTag rarity={fish.rarity} />
              <span className="tabular-nums text-[#C9D1D9]">{fish.length} cm</span>
            </div>
            {fish.donated_by ? (
              <p className="rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-2 text-xs text-[#8B949E]">
                Questa specie è già nel museo: donata da {fish.donated_by}
                {fish.donated_at ? ` il ${fmtWhen(fish.donated_at)}` : ""}.
              </p>
            ) : (
              <p className="rounded-md border border-[#3FB950]/30 bg-[#12261E] px-3 py-2 text-xs text-[#7EE787]">Nessuno l'ha ancora donata: puoi essere il primo!</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FishActions fish={fish} onDone={onClose} big />
              <Button variant="ghost" size="lg" onClick={onClose}>
                Tieni nel secchio
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Bucket({ open, onClose, city }: { open: boolean; onClose: () => void; city: CityState | undefined }) {
  const bucket = city?.bucket ?? [];
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Il tuo secchio</DialogTitle>
          <DialogDescription>
            {bucket.length}/{city?.bucket_limit ?? 30} pesci. Dona al museo quelli che mancano, rilascia gli altri.
          </DialogDescription>
        </DialogHeader>
        {bucket.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#30363D] px-4 py-8 text-center text-sm text-[#8B949E]">Il secchio è vuoto. Vai al Pond a pescare!</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2" data-testid="bucket-list">
            {bucket.map((f) => {
              const s = city?.species.find((x) => x.id === f.species_id);
              return (
                <li key={f.id} className="flex flex-col gap-2 rounded-lg border border-[#30363D] bg-[#0D1117] p-3">
                  <div className="flex items-center gap-3">
                    {s && <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} className="w-20 shrink-0" />}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{f.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[#8B949E]">
                        <RarityTag rarity={f.rarity} />
                        <span className="tabular-nums">{f.length} cm</span>
                      </div>
                    </div>
                  </div>
                  {f.donated_by && <p className="text-[11px] text-[#8B949E]">Già nel museo (donato da {f.donated_by})</p>}
                  <FishActions fish={f} />
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
