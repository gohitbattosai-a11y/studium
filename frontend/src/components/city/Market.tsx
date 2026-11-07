import { useMemo, useState } from "react";
import { Gavel, Search, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { useNow } from "@/lib/runtime/useNow";
import { POS_ORDER, SQUAD_MAX, auctionOf, auctionStart, auctionStep, available, buyPlayer, openAuction, placeBid, playerPrice, type Auction, type Player, type Pos, type StadiumState, type Team } from "@/lib/domain/football";
import { CFG, canInstantBuy, tierFor } from "@/lib/domain/stadiumConfig";
import PlayerCard from "./PlayerCard";
import { Empty, PANEL, TierTag, eur, run } from "./stadiumUi";

const TIERS = CFG.tiers.map((t) => t.id);

function locate(s: StadiumState, pid: string): Player | undefined {
  return s.market.find((p) => p.id === pid) ?? s.teams.flatMap((t) => t.players).find((p) => p.id === pid);
}

export function AskDialog({ s, p, mine, onClose }: { s: StadiumState; p: Player | null; mine: boolean; onClose: () => void }) {
  const [val, setVal] = useState("");
  const base = p ? (mine ? Math.max(0.1, Math.round(playerPrice(p) * 10) / 10) : auctionStart(p)) : 0;
  const num = val === "" ? base : Number(val.replace(",", "."));
  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        {p && (
          <>
            <DialogHeader>
              <DialogTitle>{mine ? "Metti all'asta" : "Apri l'asta"}</DialogTitle>
              <DialogDescription>
                {mine ? `I club rilanciano su ${p.name}: parti dalla base che vuoi, vendi al migliore offerente.` : `La tua offerta apre l'asta su ${p.name}. Gli altri club possono rilanciare finché non scade il tempo.`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-4">
              <PlayerCard p={p} size={1.1} />
              <div className="flex flex-1 flex-col gap-2">
                <p className="text-xs text-[#8B949E]">
                  {mine ? "Base d'asta" : "Offerta iniziale"} (minimo {eur(mine ? 0.1 : base)})
                </p>
                <Input inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} placeholder={base.toFixed(1)} />
                {!mine && <p className="text-[11px] text-[#8B949E]">Disponibili {eur(available(s))} · rilancio minimo {eur(auctionStep(num || base))}</p>}
                <Button
                  onClick={() => {
                    if (run(() => openAuction(p.id, num), mine ? "Asta aperta" : "Offerta piazzata, asta aperta!")) onClose();
                  }}
                >
                  <Gavel /> {mine ? "Avvia asta" : `Offri ${eur(num || base)}`}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AuctionRow({ s, a, team, now }: { s: StadiumState; a: Auction; team: Team; now: number }) {
  const p = locate(s, a.pid);
  const [custom, setCustom] = useState("");
  if (!p) return null;
  const left = Math.max(0, Math.ceil((a.endsAt - now) / 1000));
  const leader = s.teams.find((t) => t.id === a.bidder);
  const sells = a.seller === team.id;
  const youLead = a.bidder === team.id;
  const step = auctionStep(a.bid);
  const min = Math.round((a.bid + step) * 10) / 10;
  const amount = custom === "" ? min : Number(custom.replace(",", "."));
  return (
    <li className={cn("st-auction", youLead && "st-auction-lead", left <= 5 && "st-auction-hot")}>
      <PlayerCard p={p} size={0.8} color={leader?.color} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-bold">{p.name}</p>
          <span className="st-timer">
            <Timer className="size-3" /> {left}s
          </span>
        </div>
        <p className="text-[11px] text-[#8B949E]">
          {sells ? "La tua vendita" : "Asta di mercato"} · {leader ? (youLead ? "Sei in testa" : `In testa: ${leader.name}`) : "Nessuna offerta"}
        </p>
        <p className="text-xl font-black tabular-nums text-[#E3B341]">{eur(a.bid)}</p>
        {!sells && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Button size="sm" disabled={youLead || left === 0} onClick={() => run(() => placeBid(a.id, min))}>
              Rilancia {eur(min)}
            </Button>
            <Button size="sm" variant="outline" disabled={youLead || left === 0} onClick={() => run(() => placeBid(a.id, min + step * 2))}>
              +{eur(step * 2)}
            </Button>
            <Input className="h-7 w-20 bg-[#0D1117]/80 text-xs" inputMode="decimal" value={custom} placeholder={min.toFixed(1)} onChange={(e) => setCustom(e.target.value)} />
            <Button size="sm" variant="secondary" disabled={youLead || left === 0 || !custom} onClick={() => run(() => placeBid(a.id, amount), "Rilancio inviato")}>
              OK
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

export function Auctions({ s, team }: { s: StadiumState; team: Team }) {
  const now = useNow(s.auctions.length > 0);
  if (!s.auctions.length) return null;
  return (
    <div className="mb-4">
      <h3 className="st-h">
        <Gavel className="size-3.5" /> Aste in corso ({s.auctions.length}/{CFG.auction.maxActive})
      </h3>
      <ul className="flex flex-col gap-2">
        {s.auctions.map((a) => (
          <AuctionRow key={a.id} s={s} a={a} team={team} now={now} />
        ))}
      </ul>
    </div>
  );
}

export default function MarketView({ s, team }: { s: StadiumState; team: Team }) {
  const [f, setF] = useState<Pos | "ALL">("ALL");
  const [tier, setTier] = useState<string>("ALL");
  const [q, setQ] = useState("");
  const [order, setOrder] = useState<"ovr" | "price">("ovr");
  const [limit, setLimit] = useState(24);
  const [ask, setAsk] = useState<Player | null>(null);
  const list = useMemo(() => {
    const l = s.market.filter((p) => !auctionOf(s, p.id) && (f === "ALL" || p.pos === f) && (tier === "ALL" || tierFor(p.ovr).id === tier) && p.name.toLowerCase().includes(q.trim().toLowerCase()));
    return order === "ovr" ? [...l].sort((a, b) => b.ovr - a.ovr) : [...l].sort((a, b) => playerPrice(a) - playerPrice(b));
  }, [s, f, tier, q, order]);
  const reset = () => setLimit(24);
  return (
    <div>
      <Auctions s={s} team={team} />
      <div className="st-bar mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["ALL", ...POS_ORDER] as const).map((x) => (
            <button key={x} type="button" onClick={() => (setF(x), reset())} className={cn("st-chip", f === x && "st-chip-on")}>
              {x === "ALL" ? "Tutti" : x}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-white/15" />
          {["ALL", ...TIERS].map((x) => (
            <button key={x} type="button" onClick={() => (setTier(x), reset())} className={cn("st-chip", tier === x && "st-chip-on")}>
              {x === "ALL" ? "Ogni carta" : CFG.tiers.find((t) => t.id === x)?.name}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#8B949E]" />
            <Input value={q} onChange={(e) => (setQ(e.target.value), reset())} placeholder="Cerca giocatore" className="bg-[#0D1117]/80 pl-8" />
          </div>
          <Button variant="outline" onClick={() => setOrder(order === "ovr" ? "price" : "ovr")}>
            {order === "ovr" ? "Per overall" : "Per prezzo"}
          </Button>
        </div>
      </div>
      <p className="mb-2 text-[11px] text-[#C9D1D9]">
        {list.length} giocatori disponibili · rosa {team.players.length}/{SQUAD_MAX} · le carte Oro, Élite e Leggenda si prendono solo all'asta
      </p>
      <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 md:grid-cols-4">
        {list.slice(0, limit).map((p) => {
          const instant = canInstantBuy(p.ovr, p.card);
          const price = playerPrice(p);
          return (
            <div key={p.id} className="st-slot">
              <PlayerCard p={p} size={1} color={team.color} />
              <TierTag ovr={p.ovr} />
              {instant ? (
                <Button size="sm" className="w-full" disabled={available(s) < price || team.players.length >= SQUAD_MAX} onClick={() => run(() => buyPlayer(p.id))}>
                  <Zap /> {eur(price)}
                </Button>
              ) : (
                <p className="text-[11px] font-semibold text-[#E3B341]">Valutato {eur(price)}</p>
              )}
              <Button size="sm" variant={instant ? "outline" : "default"} className="w-full" onClick={() => setAsk(p)} disabled={s.auctions.length >= CFG.auction.maxActive}>
                <Gavel /> {instant ? "Asta" : "Offri all'asta"}
              </Button>
            </div>
          );
        })}
      </div>
      {list.length > limit && (
        <Button className="mt-4 w-full" variant="secondary" onClick={() => setLimit(limit + 24)}>
          Mostra altri
        </Button>
      )}
      {list.length === 0 && <Empty>Nessun giocatore trovato. Il mercato è limitato: i club comprano e vendono anche loro.</Empty>}
      <AskDialog s={s} p={ask} mine={false} onClose={() => setAsk(null)} />
    </div>
  );
}
