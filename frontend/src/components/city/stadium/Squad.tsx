import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import { useNow } from "@/lib/runtime/useNow";
import { auctionOf, FORMATIONS, FORMATION_LIST, SQUAD_MAX, STAT_KEYS, STAT_LABEL, TRAIN, autoLineup, lineup, sellPlayer, sellPrice, setFormation, setSlot, strength, train, trainCost, trainSeconds, type Player, type StadiumState, type Team, type TrainKind } from "@/lib/domain/football";
import PlayerCard, { tierName } from "./PlayerCard";
import { stadiumArt } from "@/lib/art/stadiumAssets";
import { AskDialog } from "./Market";
import { useStadiumActions } from "@/lib/domain/stadiumApi";

const eur = (n: number) => `€${n.toFixed(1)}M`;
const run = (fn: () => string | null, ok?: string) => {
  const err = fn();
  if (err) toast.error(err);
  else if (ok) toast.success(ok);
};

export function PlayerDetail({ p, team, s, onClose }: { p: Player | null; team: Team; s: StadiumState; onClose: () => void }) {
  const cur = p ? team.players.find((x) => x.id === p.id) : undefined;
  const trained = !!cur && cur.trained === s.day;
  const busy = !!cur?.training;
  const now = useNow(busy);
  const [ask, setAsk] = useState(false);
  const act = useStadiumActions();
  const left = cur?.training ? Math.max(0, Math.ceil((cur.training.end - now) / 1000)) : 0;
  const pct = cur?.training ? Math.min(100, Math.max(0, 100 - (left / trainSeconds(cur)) * 100)) : 0;
  return (
    <Dialog open={!!cur} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        {cur && (
          <>
            <DialogHeader>
              <DialogTitle>{cur.name}</DialogTitle>
              <DialogDescription>
                Carta {tierName(cur.ovr)} · {cur.goals} gol in stagione
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-4">
              <PlayerCard p={cur} size={1.35} color={team.color} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                {STAT_KEYS.map((k) => (
                  <div key={k} className="flex items-center gap-2 text-xs">
                    <span className="w-7 text-[#8B949E]">{STAT_LABEL[k]}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#21262D]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#58A6FF] to-[#3FB950]" style={{ width: `${cur.stats[k]}%` }} />
                    </div>
                    <b className="w-6 text-right tabular-nums">{cur.stats[k]}</b>
                  </div>
                ))}
                <p className="mt-1 text-xs text-[#8B949E]">
                  Potenziale <b className="text-[#E3B341]">{cur.pot}</b>
                </p>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold tracking-wider text-[#8B949E] uppercase">Allenamento · {eur(trainCost(cur))}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(TRAIN) as TrainKind[]).map((k) => (
                  <Button key={k} size="sm" variant="outline" disabled={trained || busy} onClick={() => run(() => train(cur.id, k), "Allenamento completato!")}>
                    {TRAIN[k].label}
                  </Button>
                ))}
              </div>
              {cur.training ? (
                <div className="mt-2">
                  <div className="h-2 overflow-hidden rounded-full bg-[#21262D]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#E3B341] to-[#3FB950] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-[#C9D1D9]">
                    Allenamento {TRAIN[cur.training.kind].label.toLowerCase()} in corso · {left}s
                  </p>
                </div>
              ) : (
                trained && <p className="mt-1 text-[11px] text-[#8B949E]">Già allenato in questa giornata: torna dopo la prossima partita.</p>
              )}
            </div>
            {cur.out && <p className="rounded-lg border border-[#F85149]/40 bg-[#2a1214]/90 px-3 py-2 text-xs text-[#FFA198]">{cur.out.kind === "red" ? `Squalificato per ${cur.out.left} partite` : `Infortunato: torna tra ${cur.out.left} partite`}. Non può essere schierato.</p>}
            {cur.id.startsWith("pk-") ? (
              <div>
                <p className="mb-1.5 text-[11px] text-[#8B949E]">Carta da pack: non si vende né va all'asta, ma puoi svincolarla per ricevere un rimborso.</p>
                <Button
                  variant="ghost"
                  className="w-full text-[#FFA198]"
                  disabled={act.release.isPending}
                  onClick={() =>
                    act.release.mutate(cur.id, {
                      onSuccess: (r) => {
                        toast.success(`Carta svincolata: +${eur(r.value)} in arrivo`);
                        onClose();
                      },
                    })
                  }
                >
                  Svincola
                </Button>
              </div>
            ) : cur.loan ? (
              <p className="text-[11px] text-[#8B949E]">In prestito: non si può vendere né mettere all'asta.</p>
            ) : auctionOf(s, cur.id) ? (
              <p className="text-[11px] text-[#E3B341]">Questo giocatore è all'asta.</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                <Button variant="outline" onClick={() => setAsk(true)}>
                  Metti all'asta
                </Button>
                <Button
                  variant="ghost"
                  className="text-[#FFA198]"
                  onClick={() => {
                    run(() => sellPlayer(cur.id), "Giocatore venduto");
                    onClose();
                  }}
                >
                  Vendi subito {eur(sellPrice(cur))}
                </Button>
              </div>
            )}
            <AskDialog s={s} p={ask ? cur : null} mine onClose={() => setAsk(false)} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Squad({ s, team }: { s: StadiumState; team: Team }) {
  const [sel, setSel] = useState<number | null>(null);
  const [detail, setDetail] = useState<Player | null>(null);
  const slots = lineup(team);
  const f = FORMATIONS[team.formation];
  const inXi = new Set(team.xi.filter(Boolean) as string[]);
  const bench = team.players.filter((p) => !inXi.has(p.id)).sort((a, b) => b.ovr - a.ovr);
  const st = strength(team);

  const tapSlot = (i: number) => {
    if (sel === null) {
      setSel(i);
      return;
    }
    if (sel === i) {
      setSel(null);
      return;
    }
    const other = team.xi[i];
    const mine = team.xi[sel];
    if (other) run(() => setSlot(sel, other));
    else if (mine) run(() => setSlot(i, mine));
    setSel(null);
  };

  const tapBench = (p: Player) => {
    if (sel === null) {
      setDetail(p);
      return;
    }
    run(() => setSlot(sel, p.id));
    setSel(null);
  };

  const selPlayer = sel !== null ? slots[sel].player : null;

  return (
    <div>
      <div className="mb-3 grid grid-cols-4 gap-2 text-center text-xs">
        {[["Overall", st.ovr], ["Attacco", Math.round(st.att)], ["Difesa", Math.round(st.def)], ["Rosa", `${team.players.length}/${SQUAD_MAX}`]].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-[#30363D] bg-[#0D1117]/80 py-2 backdrop-blur-sm">
            <p className="text-[#8B949E]">{l}</p>
            <p className="text-base font-bold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {FORMATION_LIST.map((x) => (
          <button key={x} type="button" onClick={() => (setSel(null), run(() => setFormation(x)))} className={cn("rounded-full border px-3 py-1 text-xs", team.formation === x ? "border-[#58A6FF] bg-[#58A6FF]/15 text-white" : "border-[#30363D] bg-[#0D1117]/70 text-[#8B949E]")}>
            {x}
          </button>
        ))}
        <Button size="sm" variant="secondary" className="ml-auto" onClick={() => (setSel(null), run(autoLineup, "Formazione sistemata"))}>
          Formazione automatica
        </Button>
      </div>
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-[#30363D]" style={{ aspectRatio: "3 / 4" }}>
        <span className="absolute inset-0 block [&>svg]:size-full" aria-hidden dangerouslySetInnerHTML={{ __html: stadiumArt("lineup-pitch") }} />
        {f.map(([pos, x, y], i) => {
          const slot = slots[i];
          return (
            <div key={i} className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
              {slot.player ? (
                <PlayerCard p={slot.player} size={0.62} color={team.color} selected={sel === i} dim={slot.player.pos !== pos} onClick={() => tapSlot(i)} />
              ) : (
                <button type="button" onClick={() => tapSlot(i)} className={cn("grid size-12 place-items-center rounded-full border-2 border-dashed text-[11px] font-bold text-white", sel === i ? "border-[#E3B341] bg-[#E3B341]/25" : "border-white/70 bg-black/25")} aria-label={`Slot ${pos}`}>
                  {pos}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 min-h-9 rounded-lg border border-[#30363D] bg-[#0D1117]/80 px-3 py-2 text-xs text-[#C9D1D9] backdrop-blur-sm">
        {sel === null ? (
          "Tocca un giocatore in campo per selezionarlo, poi una riserva (o un altro titolare) per scambiarli."
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Slot {f[sel][0]}: <b>{selPlayer?.name ?? "vuoto"}</b>. Scegli chi metterci.
            </span>
            {selPlayer && (
              <>
                <Button size="sm" variant="outline" onClick={() => (setDetail(selPlayer), setSel(null))}>
                  Dettagli
                </Button>
                <Button size="sm" variant="ghost" onClick={() => (run(() => setSlot(sel, null)), setSel(null))}>
                  Svuota
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={() => setSel(null)}>
              Annulla
            </Button>
          </div>
        )}
      </div>
      <h3 className="mt-4 mb-2 text-xs font-semibold tracking-wider text-[#8B949E] uppercase">Riserve ({bench.length})</h3>
      {bench.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#30363D] bg-[#0D1117]/70 px-4 py-6 text-center text-sm text-[#8B949E]">Nessuna riserva. Compra altri giocatori dal mercato.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {bench.map((p) => (
            <PlayerCard key={p.id} p={p} size={0.85} color={team.color} onClick={() => tapBench(p)} />
          ))}
        </div>
      )}
      <PlayerDetail p={detail} team={team} s={s} onClose={() => setDetail(null)} />
    </div>
  );
}
