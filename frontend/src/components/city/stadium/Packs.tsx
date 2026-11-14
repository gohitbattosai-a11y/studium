import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { packArt } from "@/lib/art/stadiumAssets";
import { usePacks, useStadiumActions, type PackInfo } from "@/lib/domain/stadiumApi";
import PackOpening, { RARITY } from "./PackOpening";
import { PANEL } from "./stadiumUi";
import { PosBadge } from "./stadiumUi";
import type { Pos } from "@/lib/domain/football";

const fmt = (n: number) => `${Math.round(n * 10) / 10}%`;

export default function Packs({ hasClub }: { hasClub: boolean }) {
  const q = usePacks();
  const act = useStadiumActions();
  const [opening, setOpening] = useState<PackInfo | null>(null);
  const [odds, setOdds] = useState<string | null>(null);
  const d = q.data;

  if (!d) return <p className="py-10 text-center text-sm text-[#8B949E]">{q.isError ? "Impossibile caricare i pack." : "Carico i pack…"}</p>;

  const can = (p: PackInfo) => hasClub && d.participating && d.balance >= p.price;
  const start = (p: PackInfo) => {
    if (!hasClub) return toast.error("Crea prima la tua squadra");
    if (!d.participating) return toast.error("Attiva la partecipazione nello Shop per usare i punti");
    if (d.balance < p.price) return toast.error("Punti insufficienti");
    setOpening(p);
  };
  const owned = d.collection.filter((c) => c.owned).length;

  return (
    <div>
      <div className={cn("mb-3 flex items-center justify-between rounded-xl p-3", PANEL)}>
        <div>
          <p className="text-[10px] tracking-widest text-[#8B949E] uppercase">I tuoi punti</p>
          <p className="text-2xl font-black text-[#E3B341] tabular-nums">{d.balance}</p>
        </div>
        <p className="max-w-[55%] text-right text-[11px] text-[#8B949E]">Nei pack trovi anche giocatori esclusivi che non esistono in nessun altro posto. Dopo diversi pack senza un epico, il prossimo ne contiene uno garantito.</p>
      </div>
      {!d.participating && <p className="mb-3 rounded-lg border border-[#F85149]/40 bg-[#2a1214]/90 px-3 py-2 text-xs text-[#FFA198]">Non stai partecipando: attiva la partecipazione per spendere i punti nei pack.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {d.packs.map((p) => (
          <div key={p.id} className={cn("flex flex-col items-center rounded-2xl p-3 text-center", PANEL)} style={{ boxShadow: `0 0 22px ${p.tone}22` }}>
            <button type="button" onClick={() => start(p)} className="w-24 transition-transform hover:-translate-y-1 active:scale-95" aria-label={`Apri ${p.name}`}>
              <span className="block [&>svg]:w-full" style={{ filter: `drop-shadow(0 6px 10px #000a) drop-shadow(0 0 8px ${p.tone}88)` }} dangerouslySetInnerHTML={{ __html: packArt(p.id) }} />
            </button>
            <h3 className="mt-2 text-sm font-black" style={{ color: p.tone }}>
              {p.name}
            </h3>
            <p className="mt-0.5 text-[11px] text-[#8B949E]">{p.blurb}</p>
            <Button size="sm" className="mt-2 w-full" disabled={!can(p) && d.participating && hasClub} onClick={() => start(p)} data-testid={`pack-buy-${p.id}`}>
              {p.price} punti
            </Button>
            <button type="button" className="mt-1.5 text-[10px] text-[#58A6FF] underline" onClick={() => setOdds(odds === p.id ? null : p.id)}>
              Probabilità
            </button>
            {odds === p.id && (
              <ul className="mt-1 w-full space-y-0.5 text-[10px]">
                {Object.entries(p.odds).map(([k, v]) => (
                  <li key={k} className="flex justify-between" style={{ color: RARITY[k]?.color }}>
                    <span>{RARITY[k]?.name ?? k}</span>
                    <b>{fmt((v / (Object.values(p.odds) as number[]).reduce((a, b) => a + b, 0)) * 100)}</b>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <h3 className="mt-5 mb-2 text-xs font-semibold tracking-wider text-[#8B949E] uppercase">
        Giocatori solo da pack · {owned}/{d.collection.length}
      </h3>
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {d.collection.map((c) => (
          <li key={c.id} className={cn("flex items-center gap-2 rounded-lg px-2.5 py-1.5", PANEL, !c.owned && "opacity-60")} style={{ borderLeft: `3px solid ${RARITY[c.rarity]?.color}` }}>
            {c.owned ? <PosBadge pos={c.pos as Pos} /> : <Lock className="size-4 text-white/40" />}
            <span className="min-w-0 flex-1 truncate text-sm">{c.owned ? c.name : "???"}</span>
            <b className="tabular-nums" style={{ color: RARITY[c.rarity]?.color }}>
              {c.owned ? c.ovr : "?"}
            </b>
          </li>
        ))}
      </ul>

      {opening && (
        <PackOpening
          pack={opening}
          run={() => act.open.mutateAsync(opening.id)}
          onClose={() => setOpening(null)}
          onAgain={() => {
            const cur = opening;
            setOpening(null);
            window.setTimeout(() => start(cur), 60);
          }}
        />
      )}
    </div>
  );
}
