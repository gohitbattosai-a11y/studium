import { useState } from "react";
import { Check, Coins, Lock, Sparkles } from "lucide-react";
import { usePets } from "@/lib/queries";
import { usePetActions } from "@/lib/petActions";
import { useShopActions } from "@/lib/shopActions";
import type { BoxInfo, PetInfo, PetsState, RollResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadError, SkeletonList } from "@/components/common";
import { Field, NativeSelect, Panel } from "@/components/shop/ui";
import { BoxArt } from "./BoxArt";
import GachaOpening from "./GachaOpening";
import { PetSprite } from "./PetSprite";
import { RARITY } from "./rarity";
import { setPetSettings, usePetSettings, type Chatter } from "./petSettings";

function BoxCard({ box, balance, onOpen }: { box: BoxInfo; balance: number; onOpen: () => void }) {
  const missing = box.price - balance;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22]" data-testid={`box-${box.id}`}>
      <div className="grid h-40 place-items-center bg-[radial-gradient(circle_at_50%_60%,#1f2a44,#0D1117_70%)]">
        <BoxArt kind={box.id} className="h-32 box-float" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium">{box.name}</h3>
            <span className="shrink-0 text-sm tabular-nums text-[#E3B341]">{box.price} pt</span>
          </div>
          <p className="mt-1 text-sm text-[#8B949E]">{box.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5" data-testid={`box-odds-${box.id}`}>
          {box.odds.map((o) => (
            <span key={o.rarity} className="inline-flex items-center gap-1 rounded border border-[#30363D] bg-[#0D1117] px-1.5 py-0.5 text-[11px] text-[#C9D1D9]">
              <span className="size-2 rounded-full" style={{ background: RARITY[o.rarity].color }} />
              {RARITY[o.rarity].label} {o.percent}%
            </span>
          ))}
        </div>
        <p className="text-xs text-[#8B949E]">Un pet Raro o migliore è garantito entro {box.guaranteed_in} aperture.</p>
        <Button className="mt-auto h-9 w-full" disabled={missing > 0} onClick={onOpen} data-testid={`box-open-${box.id}`}>
          <Coins className="size-4" /> {missing > 0 ? `Ti mancano ${missing} pt` : `Apri · ${box.price} pt`}
        </Button>
      </div>
    </article>
  );
}

function PetCard({ pet, onActivate, busy }: { pet: PetInfo; onActivate: (id: string | null) => void; busy: boolean }) {
  const [hover, setHover] = useState(false);
  const meta = RARITY[pet.rarity];
  return (
    <article
      className={cn("flex flex-col overflow-hidden rounded-xl border bg-[#161B22]", pet.active ? "border-[#388BFD]" : "border-[#30363D]")}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-testid={`pet-${pet.id}`}
    >
      <div className="relative grid h-36 place-items-center" style={{ background: `radial-gradient(circle at 50% 70%, ${meta.color}33, #0D1117 72%)` }}>
        <div className="w-32" style={pet.owned ? { filter: pet.rarity === "epico" || pet.rarity === "leggendario" ? `drop-shadow(0 0 8px ${meta.color}aa)` : undefined } : { filter: "brightness(0) opacity(0.45)" }}>
          <PetSprite id={pet.id} state={hover && pet.owned ? "walk" : "idle"} />
        </div>
        {!pet.owned && <Lock className="absolute right-3 top-3 size-4 text-[#8B949E]" />}
        {pet.copies > 1 && <span className="absolute left-3 top-3 rounded bg-[#0D1117]/80 px-1.5 py-0.5 text-xs tabular-nums">×{pet.copies}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium">{pet.owned ? pet.name : "???"}</h3>
          <span className="rounded border px-1.5 py-0.5 text-[11px]" style={{ color: meta.color, borderColor: `${meta.color}55` }}>
            {meta.label}
          </span>
        </div>
        {pet.owned ? (
          <Button variant={pet.active ? "outline" : "default"} className="mt-auto h-9 w-full" disabled={busy} onClick={() => onActivate(pet.active ? null : pet.id)} data-testid={`pet-activate-${pet.id}`}>
            {pet.active ? (
              <>
                <Check className="size-4 text-[#3FB950]" /> Compagno attivo · Rimuovi
              </>
            ) : (
              "Scegli come compagno"
            )}
          </Button>
        ) : (
          <p className="mt-auto text-sm text-[#8B949E]">Aprilo da una box per sbloccarlo.</p>
        )}
      </div>
    </article>
  );
}

function Settings() {
  const settings = usePetSettings();
  return (
    <Panel title="Il tuo compagno" hint="Queste impostazioni valgono solo su questo dispositivo." testId="pet-settings">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-[#388BFD]" checked={settings.visible} onChange={(e) => setPetSettings({ visible: e.target.checked })} data-testid="pet-visible" />
          Mostra il pet mentre uso il sito
        </label>
        <Field label="Quanto parla">
          <NativeSelect value={settings.chatter} onChange={(e) => setPetSettings({ chatter: e.target.value as Chatter })} data-testid="pet-chatter">
            <option value="tanto">Chiacchierone</option>
            <option value="normale">Normale</option>
            <option value="muto">Silenzioso</option>
          </NativeSelect>
        </Field>
      </div>
    </Panel>
  );
}

function Body({ state }: { state: PetsState }) {
  const actions = usePetActions();
  const [opening, setOpening] = useState<BoxInfo | null>(null);
  const [result, setResult] = useState<RollResult | null>(null);

  const open = (box: BoxInfo) => {
    setOpening(box);
    setResult(null);
    actions.roll.mutate(box.id, {
      onSuccess: setResult,
      onError: () => setOpening(null),
    });
  };

  const owned = state.pets.filter((p) => p.owned).length;

  return (
    <div className="space-y-6" data-testid="pets-view">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#30363D] bg-[#161B22] p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#8B949E]">Il tuo saldo</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums" data-testid="pets-balance">
            {state.balance} <span className="text-base font-normal text-[#8B949E]">punti</span>
          </p>
        </div>
        <p className="text-sm text-[#8B949E]">
          Collezione: <b className="text-[#F0F6FC]">{owned}</b> / {state.pets.length} pet
        </p>
      </section>

      <div>
        <h2 className="mb-3 text-sm font-medium">Box</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {state.boxes.map((b) => (
            <BoxCard key={b.id} box={b} balance={state.balance} onOpen={() => open(b)} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium">Collezione</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.pets.map((p) => (
            <PetCard key={p.id} pet={p} busy={actions.setActive.isPending} onActivate={(id) => actions.setActive.mutate(id)} />
          ))}
        </div>
      </div>

      <Settings />

      {opening && (
        <GachaOpening
          key={`${opening.id}-${actions.roll.submittedAt}`}
          box={opening}
          result={result}
          canAgain={result !== null && result.balance >= opening.price}
          onAgain={() => open(opening)}
          onClose={() => setOpening(null)}
        />
      )}
    </div>
  );
}

export default function PetsView() {
  const pets = usePets(true);
  const shopActions = useShopActions();

  if (pets.isPending) return <SkeletonList rows={3} />;
  if (pets.isError) return <LoadError testId="pets-error" />;
  if (!pets.data.participating) {
    return (
      <section className="rounded-xl border border-dashed border-[#30363D] px-6 py-10 text-center" data-testid="pets-optin">
        <div className="mx-auto mb-3 grid size-10 place-items-center rounded-md bg-[#21262D] text-[#E3B341]">
          <Sparkles className="size-5" />
        </div>
        <p className="font-medium">Per aprire le box serve partecipare</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-[#8B949E]">I pet si comprano con i punti: attiva la partecipazione alla classifica per guadagnarli e usarli.</p>
        <Button className="mt-5 h-9" disabled={shopActions.participate.isPending} onClick={() => shopActions.participate.mutate(true)} data-testid="pets-join">
          Partecipa
        </Button>
      </section>
    );
  }
  return <Body state={pets.data} />;
}
