import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, RotateCcw, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { useNow } from "@/lib/runtime/useNow";
import { COLORS, SQUAD_MIN, TRAIN, addBudget, available, collectTraining, buyTeam, createTeam, isReady, myTeam, resetStadium, resetTraining, settleAuctions, strength, teamPrice, train, trainCost, trainSeconds, trainTeam, useStadium, type Player, type StadiumState, type Team, type TrainKind } from "@/lib/domain/football";
import { useClubSync, useServerState } from "@/lib/domain/stadiumApi";
import { stadiumArt } from "@/lib/art/stadiumAssets";
import Deals from "./Deals";
import Leagues, { countdown, fmtWhen } from "./Leagues";
import MarketView from "./Market";
import Packs from "./Packs";
import Squad, { PlayerDetail } from "./Squad";
import { Crest, PANEL, PosBadge, eur, run } from "./stadiumUi";
import "./stadium.css";

type Tab = "squad" | "market" | "deals" | "train" | "league" | "packs";

const TABS: [Tab, string, string][] = [["squad", "Rosa", "👕"], ["market", "Mercato", "💶"], ["deals", "Trattative", "🤝"], ["train", "Allenamento", "🏃"], ["league", "Campionato", "🏆"], ["packs", "Pack", "🎴"]];

const report = (r: { name: string; d: number }[]) => {
  r.slice(0, 3).forEach((x) => toast.success(x.d > 0 ? `${x.name}: +${x.d} overall` : `${x.name} ha finito l'allenamento`));
  if (r.length > 3) toast.success(`Altri ${r.length - 3} giocatori hanno finito l'allenamento`);
};

function Tools({ s }: { s: StadiumState }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3">
      <button type="button" onClick={() => setOpen(!open)} className="st-chip">
        <Wrench className="size-3.5" /> Strumenti test
      </button>
      {open && (
        <div className="st-bar mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[#C9D1D9]">Budget {eur(s.budget)}</span>
          <Button size="sm" variant="outline" onClick={() => addBudget(10)}>
            +€10M
          </Button>
          <Button size="sm" variant="outline" onClick={() => addBudget(100)}>
            +€100M
          </Button>
          <Button size="sm" variant="outline" onClick={() => report(collectTraining(Infinity))}>
            Completa allenamenti
          </Button>
          <Button size="sm" variant="outline" onClick={() => resetTraining()}>
            Azzera allenamenti
          </Button>
          <Button size="sm" variant="ghost" onClick={() => resetStadium()}>
            <RotateCcw /> Nuovo mondo
          </Button>
        </div>
      )}
    </div>
  );
}

function Setup({ s }: { s: StadiumState }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const bots = useMemo(() => [...s.teams].sort((a, b) => teamPrice(b) - teamPrice(a)), [s.teams]);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className={cn("rounded-2xl p-5", PANEL)}>
        <div className="flex justify-center">
          <Crest team={{ name: name || "Il tuo club", color }} size={72} />
        </div>
        <h2 className="mt-3 text-center text-lg font-black">Crea la tua squadra</h2>
        <p className="mt-1 text-center text-xs text-[#8B949E]">Parti da zero con {eur(s.budget)} e costruisci la rosa tra mercato, aste e scambi. Servono {SQUAD_MIN} titolari, portiere compreso.</p>
        <Input className="mt-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome della squadra" maxLength={24} />
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Colore ${c}`} className={cn("size-7 rounded-full border-2 transition-transform", color === c ? "scale-110 border-white" : "border-transparent")} style={{ background: c }} />
          ))}
        </div>
        <Button className="mt-4 w-full" onClick={() => run(() => createTeam(name, color), "Squadra creata!")}>
          Crea squadra
        </Button>
      </div>
      <div className={cn("rounded-2xl p-5", PANEL)}>
        <h2 className="text-lg font-black">Compra una squadra</h2>
        <p className="mt-1 text-xs text-[#8B949E]">Prendi un club già pronto: paghi il prezzo con il tuo budget.</p>
        <ul className="mt-3 flex max-h-80 flex-col gap-1.5 overflow-y-auto">
          {bots.map((t) => (
            <li key={t.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
              <Crest team={t} size={22} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.name}</p>
                <p className="text-[11px] text-[#8B949E]">Overall {strength(t).ovr}</p>
              </div>
              <Button size="sm" variant="outline" disabled={s.budget < teamPrice(t)} onClick={() => run(() => buyTeam(t.id), `Hai comprato ${t.name}!`)}>
                {eur(teamPrice(t))}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TrainView({ s, team }: { s: StadiumState; team: Team }) {
  const [detail, setDetail] = useState<Player | null>(null);
  const players = [...team.players].sort((a, b) => b.ovr - a.ovr);
  const busy = players.some((p) => p.training);
  const now = useNow(busy);
  const pending = players.filter((p) => p.trained !== s.day && !p.training);
  const total = pending.reduce((sum, p) => sum + trainCost(p), 0);
  return (
    <div>
      <div className={cn("mb-3 rounded-xl p-3", PANEL)}>
        <h3 className="text-sm font-semibold">Allenamento di squadra</h3>
        <p className="mt-0.5 text-[11px] text-[#8B949E]">
          Ogni giocatore si allena una volta per giornata e ci mette un po' di tempo (circa mezzo minuto). Costo totale per chi può allenarsi: {eur(total)} ({pending.length} giocatori).
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {(Object.keys(TRAIN) as TrainKind[]).map((k) => (
            <Button key={k} variant="secondary" disabled={!pending.length} onClick={() => run(() => trainTeam(k), "Squadra allenata!")}>
              <span className="flex flex-col leading-tight">
                <span>{TRAIN[k].label}</span>
                <span className="text-[10px] font-normal opacity-70">{TRAIN[k].hint}</span>
              </span>
            </Button>
          ))}
        </div>
      </div>
      {players.length === 0 && <p className="rounded-lg border border-dashed border-[#30363D] bg-[#0D1117]/70 px-4 py-8 text-center text-sm text-[#8B949E]">Nessun giocatore da allenare: compra qualcuno dal mercato.</p>}
      <ul className="flex flex-col gap-1">
        {players.map((p) => {
          const done = p.trained === s.day;
          const left = p.training ? Math.max(0, Math.ceil((p.training.end - now) / 1000)) : 0;
          const pct = p.training ? Math.min(100, Math.max(0, 100 - (left / trainSeconds(p)) * 100)) : 0;
          return (
            <li key={p.id} className={cn("flex flex-wrap items-center gap-2 rounded-lg px-2.5 py-1.5", PANEL)}>
              <button type="button" onClick={() => setDetail(p)} className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none">
                <PosBadge pos={p.pos} />
                <b className="w-7 text-center tabular-nums">{p.ovr}</b>
                <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                <span className="text-[10px] text-[#8B949E]">POT {p.pot}</span>
              </button>
              {p.training ? (
                <div className="w-full sm:w-44">
                  <div className="h-2 overflow-hidden rounded-full bg-[#21262D]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#E3B341] to-[#3FB950] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#C9D1D9]">
                    {TRAIN[p.training.kind].label} · {left}s
                  </p>
                </div>
              ) : done ? (
                <span className="text-[11px] text-[#7EE787]">Allenato ✓</span>
              ) : (
                <div className="flex gap-1">
                  {(Object.keys(TRAIN) as TrainKind[]).map((k) => (
                    <Button key={k} size="sm" variant="outline" title={`${TRAIN[k].hint} · ${eur(trainCost(p))}`} onClick={() => run(() => train(p.id, k))}>
                      {TRAIN[k].label.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <PlayerDetail p={detail} team={team} s={s} onClose={() => setDetail(null)} />
    </div>
  );
}

function Hub({ s, mine, onOpen }: { s: StadiumState; mine: Team; onOpen: (t: Tab) => void }) {
  const q = useServerState();
  const sv = q.data;
  const now = useNow(!!sv?.next);
  const ready = isReady(mine);
  const st = strength(mine);
  const badge: Partial<Record<Tab, number>> = { deals: s.offers.length, market: s.auctions.length };
  const next = sv?.next;
  const out = mine.players.filter((p) => p.out);

  return (
    <div className="flex flex-col gap-4">
      <div className="st-hero">
        <div className="flex items-center gap-3">
          <Crest team={mine} size={54} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-black">{mine.name}</h2>
            <p className="text-xs text-[#C9D1D9]">
              {sv?.club?.played ?? 0} partite giocate · Overall {st.ovr}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-widest text-[#8B949E] uppercase">Budget</p>
            <p className="text-xl font-black tabular-nums text-[#E3B341]">{eur(s.budget)}</p>
            {s.auctions.length > 0 && <p className="text-[10px] text-[#8B949E]">disponibili {eur(available(s))}</p>}
          </div>
        </div>
      </div>

      <div className="st-ticket">
        <p className="text-center text-[10px] tracking-[0.25em] text-[#8B949E] uppercase">Prossima partita</p>
        {next ? (
          <>
            <p className="mt-2 text-center text-xs text-[#C9D1D9]">
              {next.league} · giornata {next.day}
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
                <Crest team={mine} size={46} />
                <span className="max-w-full truncate text-sm font-semibold">{mine.name}</span>
              </div>
              <span className="text-2xl font-black text-[#E3B341]">VS</span>
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
                <span className="grid size-[46px] place-items-center rounded-full bg-white/10 text-xl">🛡</span>
                <span className="max-w-full truncate text-sm font-semibold">{next.opponent}</span>
              </div>
            </div>
            <p className="mt-3 text-center text-2xl font-black tabular-nums text-[#7EE787]">{countdown(next.at, now)}</p>
            <p className="text-center text-[11px] text-[#8B949E]">
              {fmtWhen(next.at)} · {next.home ? "in casa" : "in trasferta"} · si gioca da sola, potrai rivederla
            </p>
          </>
        ) : (
          <div className="py-3 text-center">
            <p className="text-sm text-[#C9D1D9]">Nessuna partita in programma.</p>
            <Button className="mt-3" onClick={() => onOpen("league")}>
              Crea o unisciti a una lega
            </Button>
          </div>
        )}
        {(!ready || sv?.warning) && <p className="mt-3 rounded-lg border border-[#F85149]/40 bg-[#2a1214]/90 px-3 py-2 text-xs text-[#FFA198]">{sv?.warning ?? "Formazione incompleta: servono 11 titolari disponibili."} Se non schieri 11 giocatori la partita viene persa 0-3 a tavolino.</p>}
        {out.length > 0 && (
          <p className="mt-2 text-center text-[11px] text-[#8B949E]">
            Indisponibili: {out.map((p) => `${p.out?.kind === "red" ? "🟥" : "🚑"} ${p.name} (${p.out?.left})`).join(", ")}
          </p>
        )}
        <Button variant="secondary" className="mt-3 w-full" onClick={() => onOpen("league")}>
          Campionato e leghe
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {TABS.map(([id, label, icon]) => (
          <button key={id} type="button" onClick={() => onOpen(id)} className="st-tile">
            {!!badge[id] && <b className="st-badge absolute top-2 right-2">{badge[id]}</b>}
            <span className="text-3xl">{icon}</span>
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Stadium() {
  const s = useStadium();
  const [tab, setTab] = useState<Tab | null>(null);
  const mine = myTeam(s);
  useClubSync();
  useEffect(() => {
    const id = window.setInterval(() => {
      report(collectTraining());
      settleAuctions().forEach((r) => (r.good ? toast.success(r.text) : toast(r.text)));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);
  const label = TABS.find((t) => t[0] === tab)?.[1];
  return (
    <div className="st-root" data-testid="stadium">
      <span className="absolute inset-0 block [&>svg]:size-full" aria-hidden dangerouslySetInnerHTML={{ __html: stadiumArt("backdrop") }} />
      <div className="absolute inset-0 overflow-y-auto pt-14 pb-10">
        <div className="mx-auto w-full max-w-3xl px-3 pt-3">
          <Tools s={s} />
          {!mine ? (
            <Setup s={s} />
          ) : !tab ? (
            <Hub s={s} mine={mine} onOpen={setTab} />
          ) : (
            <>
              <div className="st-nav mb-3">
                <Button size="sm" variant="outline" onClick={() => setTab(null)}>
                  <ChevronLeft /> Menu
                </Button>
                <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
                  {TABS.map(([id, l]) => (
                    <button key={id} type="button" onClick={() => setTab(id)} className={cn("st-chip shrink-0", tab === id && "st-chip-on")}>
                      {l}
                    </button>
                  ))}
                </div>
                <span className="st-budget">{eur(s.budget)}</span>
              </div>
              <h2 className="sr-only">{label}</h2>
              {tab === "squad" && <Squad s={s} team={mine} />}
              {tab === "market" && <MarketView s={s} team={mine} />}
              {tab === "deals" && <Deals s={s} team={mine} />}
              {tab === "train" && <TrainView s={s} team={mine} />}
              {tab === "league" && <Leagues myId={mine.id} onNeedClub={() => toast("Sto creando il tuo club online, riprova tra un attimo")} />}
              {tab === "packs" && <Packs hasClub />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
