import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, HandCoins, Handshake, ScrollText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { SQUAD_MAX, acceptOffer, available, borrowFee, borrowPlayer, declineOffer, isFree, playerPrice, proposeTrade, tradeQuote, type Player, type StadiumState, type Team } from "@/lib/domain/football";
import { CFG } from "@/lib/domain/stadiumConfig";
import PlayerCard from "./PlayerCard";
import { Crest, Dot, Empty, PANEL, PosBadge, eur, run } from "./stadiumUi";

type Sub = "offers" | "loans" | "trade" | "ledger";
const SUBS: [Sub, string, typeof Handshake][] = [["offers", "Offerte", Handshake], ["loans", "Prestiti", HandCoins], ["trade", "Scambi", ArrowLeftRight], ["ledger", "Movimenti", ScrollText]];

function Offers({ s, team }: { s: StadiumState; team: Team }) {
  if (!s.offers.length) return <Empty>Nessuna offerta per ora. Dopo ogni giornata i club possono chiederti un giocatore in prestito o comprarlo.</Empty>;
  return (
    <ul className="flex flex-col gap-2">
      {s.offers.map((o) => {
        const p = team.players.find((x) => x.id === o.pid);
        const t = s.teams.find((x) => x.id === o.team);
        if (!p || !t) return null;
        const left = Math.max(0, o.expires - s.day);
        return (
          <li key={o.id} className={cn(PANEL, "flex items-center gap-3 rounded-xl p-2.5")}>
            <PlayerCard p={p} size={0.7} color={team.color} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-bold">
                <Crest team={t} size={16} />
                <span className="truncate">{t.name}</span>
              </p>
              <p className="mt-0.5 text-xs text-[#C9D1D9]">
                {o.kind === "loan" ? `Chiede ${p.name} in prestito per ${o.days} giornate` : `Vuole comprare ${p.name}`}
              </p>
              <p className="mt-1 text-lg font-black tabular-nums text-[#7EE787]">{eur(o.amount)}</p>
              <p className="text-[10px] text-[#8B949E]">Scade tra {left} {left === 1 ? "giornata" : "giornate"}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Button size="sm" onClick={() => run(() => acceptOffer(o.id), o.kind === "loan" ? "Prestito concordato" : "Giocatore ceduto")}>
                <Check /> Accetta
              </Button>
              <Button size="sm" variant="ghost" onClick={() => run(() => declineOffer(o.id))}>
                <X /> Rifiuta
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Loans({ s, team }: { s: StadiumState; team: Team }) {
  const [tid, setTid] = useState<string>("");
  const [days, setDays] = useState(3);
  const bots = s.teams.filter((t) => !t.mine);
  const host = bots.find((t) => t.id === tid) ?? bots[0];
  const out = s.teams.flatMap((t) => (t.mine ? [] : t.players.filter((p) => p.loan?.from === team.id).map((p) => ({ p, t }))));
  const inn = team.players.filter((p) => p.loan);
  const list = host ? [...host.players].filter((p) => isFree(s, p)).sort((a, b) => b.ovr - a.ovr) : [];
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="st-h">In prestito ad altri ({out.length})</h3>
        {out.length === 0 ? (
          <Empty>Nessun tuo giocatore è in prestito.</Empty>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {out.map(({ p, t }) => (
              <li key={p.id} className={cn(PANEL, "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm")}>
                <PosBadge pos={p.pos} />
                <b className="w-7 text-center tabular-nums">{p.ovr}</b>
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <span className="text-[11px] text-[#8B949E]">
                  da {t.name} · rientra tra {Math.max(0, (p.loan?.until ?? 0) - s.day)} giornate
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="st-h">Presi in prestito ({inn.length})</h3>
        {inn.length === 0 ? (
          <Empty>Nessun giocatore preso in prestito.</Empty>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {inn.map((p) => (
              <li key={p.id} className={cn(PANEL, "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm")}>
                <PosBadge pos={p.pos} />
                <b className="w-7 text-center tabular-nums">{p.ovr}</b>
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <span className="text-[11px] text-[#8B949E]">torna a {s.teams.find((t) => t.id === p.loan?.from)?.name} tra {Math.max(0, (p.loan?.until ?? 0) - s.day)} giornate</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="st-h">Prendi un giocatore in prestito</h3>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {bots.map((t) => (
            <button key={t.id} type="button" onClick={() => setTid(t.id)} className={cn("st-chip", host?.id === t.id && "st-chip-on")}>
              <Dot color={t.color} /> {t.name}
            </button>
          ))}
        </div>
        <div className="mb-2 flex items-center gap-1.5 text-xs text-[#C9D1D9]">
          Durata
          {Array.from({ length: CFG.loan.maxDays - CFG.loan.minDays + 1 }, (_, i) => CFG.loan.minDays + i).map((d) => (
            <button key={d} type="button" onClick={() => setDays(d)} className={cn("st-chip", days === d && "st-chip-on")}>
              {d} giornate
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {list.slice(0, 18).map((p) => (
            <div key={p.id} className="st-slot">
              <PlayerCard p={p} size={0.8} color={host?.color} />
              <Button size="sm" className="w-full" disabled={available(s) < borrowFee(p, days) || team.players.length >= SQUAD_MAX} onClick={() => run(() => borrowPlayer(p.id, days), `${p.name} è in prestito da te`)}>
                {eur(borrowFee(p, days))}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Trade({ s, team }: { s: StadiumState; team: Team }) {
  const bots = s.teams.filter((t) => !t.mine);
  const [tid, setTid] = useState("");
  const [give, setGive] = useState<string[]>([]);
  const [get, setGet] = useState<string[]>([]);
  const [cash, setCash] = useState("0");
  const bot = bots.find((t) => t.id === tid) ?? bots[0];
  const amount = Number(cash.replace(",", ".")) || 0;
  const quote = useMemo(() => (bot ? tradeQuote(s, bot.id, give, get, amount) : { need: 0, error: "Squadra non trovata" }), [s, bot, give, get, amount]);
  const toggle = (list: string[], set: (v: string[]) => void, id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const mine = [...team.players].filter((p) => isFree(s, p)).sort((a, b) => b.ovr - a.ovr);
  const theirs = bot ? [...bot.players].filter((p) => isFree(s, p)).sort((a, b) => b.ovr - a.ovr) : [];
  const sum = (ids: string[], pool: Player[]) => pool.filter((p) => ids.includes(p.id)).reduce((t, p) => t + playerPrice(p), 0);
  const column = (title: string, list: Player[], sel: string[], set: (v: string[]) => void, color: string) => (
    <div className="min-w-0 flex-1">
      <h4 className="mb-1.5 text-[11px] font-semibold tracking-wider text-[#8B949E] uppercase">{title}</h4>
      <div className="flex max-h-80 flex-wrap justify-center gap-1.5 overflow-y-auto pr-1">
        {list.map((p) => (
          <PlayerCard key={p.id} p={p} size={0.62} color={color} selected={sel.includes(p.id)} dim={sel.length > 0 && !sel.includes(p.id)} onClick={() => toggle(sel, set, p.id)} />
        ))}
      </div>
    </div>
  );
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {bots.map((t) => (
          <button key={t.id} type="button" onClick={() => (setTid(t.id), setGive([]), setGet([]))} className={cn("st-chip", bot?.id === t.id && "st-chip-on")}>
            <Dot color={t.color} /> {t.name}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        {column("I tuoi", mine, give, setGive, team.color)}
        {column(bot?.name ?? "Club", theirs, get, setGet, bot?.color ?? "#2563eb")}
      </div>
      <div className={cn(PANEL, "mt-3 rounded-xl p-3")}>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#C9D1D9]">
          <span>Dai {eur(sum(give, mine))}</span>
          <ArrowLeftRight className="size-3.5" />
          <span>Ricevi {eur(sum(get, theirs))}</span>
          <span className="ml-auto flex items-center gap-1.5">
            Aggiungi €M
            <Input className="h-7 w-20 bg-[#0D1117]/80" inputMode="decimal" value={cash} onChange={(e) => setCash(e.target.value)} />
          </span>
        </div>
        <p className={cn("mt-2 text-xs", quote.error ? "text-[#FFA198]" : quote.need > 0 ? "text-[#E3B341]" : "text-[#7EE787]")}>
          {quote.error ?? (quote.need > 0 ? `Controfferta: il club chiede ancora ${eur(quote.need)}` : "Il club accetterebbe questo scambio")}
        </p>
        <p className="mt-0.5 text-[10px] text-[#8B949E]">Metti un importo negativo per farti pagare la differenza. Budget disponibile {eur(available(s))}.</p>
        <div className="mt-2 flex gap-2">
          {!quote.error && quote.need > 0 && (
            <Button size="sm" variant="outline" onClick={() => setCash((Math.round((amount + quote.need) * 10) / 10).toString())}>
              Aggiungi {eur(quote.need)}
            </Button>
          )}
          <Button
            className="ml-auto"
            disabled={!bot}
            onClick={() => {
              if (bot && run(() => proposeTrade(bot.id, give, get, amount), "Scambio concluso!")) {
                setGive([]);
                setGet([]);
                setCash("0");
              }
            }}
          >
            Proponi scambio
          </Button>
        </div>
      </div>
    </div>
  );
}

function Ledger({ s }: { s: StadiumState }) {
  if (!s.ledger.length) return <Empty>Nessun movimento ancora: vinci una partita o chiudi un affare.</Empty>;
  return (
    <ul className="flex flex-col gap-1">
      {s.ledger.map((l, i) => (
        <li key={i} className={cn(PANEL, "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm")}>
          <span className="w-12 text-[10px] text-[#8B949E]">G.{l.day}</span>
          <span className="min-w-0 flex-1 truncate">{l.text}</span>
          <b className={cn("tabular-nums", l.amount >= 0 ? "text-[#7EE787]" : "text-[#FFA198]")}>
            {l.amount >= 0 ? "+" : ""}
            {eur(l.amount)}
          </b>
        </li>
      ))}
    </ul>
  );
}

export default function Deals({ s, team }: { s: StadiumState; team: Team }) {
  const [sub, setSub] = useState<Sub>("offers");
  return (
    <div>
      <div className="st-bar mb-3 flex gap-1.5 overflow-x-auto">
        {SUBS.map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => setSub(id)} className={cn("st-chip shrink-0", sub === id && "st-chip-on")}>
            <Icon className="size-3.5" /> {label}
            {id === "offers" && s.offers.length > 0 && <b className="st-badge">{s.offers.length}</b>}
          </button>
        ))}
      </div>
      {sub === "offers" && <Offers s={s} team={team} />}
      {sub === "loans" && <Loans s={s} team={team} />}
      {sub === "trade" && <Trade s={s} team={team} />}
      {sub === "ledger" && <Ledger s={s} />}
    </div>
  );
}
