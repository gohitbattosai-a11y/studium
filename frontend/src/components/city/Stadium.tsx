import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FastForward, Play, RefreshCw, RotateCcw, Trophy, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { useNow } from "@/lib/runtime/useNow";
import { COLORS, SQUAD_MIN, TOTAL_DAYS, TRAIN, addBudget, available, collectTraining, getStadium, buyTeam, createTeam, isReady, myTeam, newSeason, playDay, playSeason, resetStadium, resetTraining, settleAuctions, strength, table, teamPrice, train, trainCost, trainSeconds, trainTeam, useStadium, type Fixture, type Player, type StadiumState, type Team, type TrainKind } from "@/lib/domain/football";
import { CFG } from "@/lib/domain/stadiumConfig";
import { stadiumArt } from "@/lib/art/stadiumAssets";
import Deals from "./Deals";
import LiveMatch from "./LiveMatch";
import MarketView from "./Market";
import Squad, { PlayerDetail } from "./Squad";
import { Crest, Dot, Empty, PANEL, PosBadge, eur, run } from "./stadiumUi";
import "./stadium.css";

type Tab = "table" | "matches" | "squad" | "market" | "deals" | "train" | "teams";

const TABS: [Tab, string, string][] = [["squad", "Rosa", "👕"], ["market", "Mercato", "💶"], ["deals", "Trattative", "🤝"], ["train", "Allenamento", "🏃"], ["table", "Classifica", "🏆"], ["matches", "Calendario", "📅"], ["teams", "Squadre", "🛡"]];

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

function TopScorers({ s }: { s: StadiumState }) {
  const list = s.teams
    .flatMap((t) => t.players.map((p) => ({ p, t })))
    .filter((x) => x.p.goals > 0)
    .sort((a, b) => b.p.goals - a.p.goals)
    .slice(0, 5);
  if (!list.length) return null;
  return (
    <div className={cn("mt-4 rounded-xl p-3", PANEL)}>
      <h3 className="mb-2 text-sm font-semibold">Capocannonieri</h3>
      <ul className="flex flex-col gap-1">
        {list.map(({ p, t }) => (
          <li key={p.id} className="flex items-center gap-2 text-sm">
            <Dot color={t.color} />
            <span className="min-w-0 flex-1 truncate">{p.name}</span>
            <span className="text-[11px] text-[#8B949E]">{t.name}</span>
            <b className="w-6 text-right tabular-nums">{p.goals}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TableView({ s }: { s: StadiumState }) {
  const rows = table(s);
  const champ = s.teams.find((t) => t.id === s.champion);
  return (
    <div>
      <p className="mb-2 text-xs text-[#C9D1D9]">
        Stagione {s.season} · Giornata {s.day}/{TOTAL_DAYS}
      </p>
      {champ && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#E3B341]/50 bg-[#1f1a0d]/90 px-3 py-2 text-sm">
          <Trophy className="size-4 text-[#E3B341]" />
          <span>
            Campione: <b>{champ.name}</b>
            {s.prize > 0 && <span className="text-[#7EE787]"> · premio {eur(s.prize)} alla tua squadra</span>}
          </span>
        </div>
      )}
      <div className={cn("overflow-x-auto rounded-xl", PANEL)}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363D] text-[11px] text-[#8B949E]">
              <th className="px-2 py-2 text-left">#</th>
              <th className="px-2 py-2 text-left">Squadra</th>
              {["G", "V", "N", "P", "GF", "GS", "Pt"].map((h) => (
                <th key={h} className="px-1.5 py-2 text-right">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.team.id} className={cn("border-b border-[#21262D] last:border-0", r.team.mine && "bg-[#1f2d1f]/80")}>
                <td className="px-2 py-1.5 tabular-nums text-[#8B949E]">{i + 1}</td>
                <td className="px-2 py-1.5">
                  <span className="flex items-center gap-2">
                    <Dot color={r.team.color} />
                    <span className={cn("truncate", r.team.mine && "font-semibold")}>{r.team.name}</span>
                  </span>
                </td>
                {[r.p, r.w, r.d, r.l, r.gf, r.ga].map((v, k) => (
                  <td key={k} className="px-1.5 py-1.5 text-right tabular-nums text-[#C9D1D9]">
                    {v}
                  </td>
                ))}
                <td className="px-1.5 py-1.5 text-right font-bold tabular-nums">{r.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TopScorers s={s} />
    </div>
  );
}

function MatchesView({ s, onWatch }: { s: StadiumState; onWatch: (f: Fixture) => void }) {
  const [view, setView] = useState<number | null>(null);
  const day = view ?? Math.min(s.day + 1, TOTAL_DAYS);
  const list = s.fixtures.filter((f) => f.day === day);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Button size="icon-lg" variant="ghost" disabled={day <= 1} onClick={() => setView(day - 1)} aria-label="Giornata precedente">
          <ChevronLeft />
        </Button>
        <p className="text-sm font-semibold">
          Giornata {day}/{TOTAL_DAYS}
        </p>
        <Button size="icon-lg" variant="ghost" disabled={day >= TOTAL_DAYS} onClick={() => setView(day + 1)} aria-label="Giornata successiva">
          <ChevronRight />
        </Button>
      </div>
      <ul className="flex flex-col gap-1.5">
        {list.map((f, i) => {
          const h = s.teams.find((t) => t.id === f.home) as Team;
          const a = s.teams.find((t) => t.id === f.away) as Team;
          const played = f.hg !== null;
          const own = h.mine || a.mine;
          return (
            <li key={i}>
              <button type="button" disabled={!played} onClick={() => onWatch(f)} className={cn("flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm outline-none backdrop-blur-sm", own ? "border-[#3FB950]/50 bg-[#12261E]/85" : "border-[#30363D] bg-[#0D1117]/80", played && "hover:brightness-125")}>
                <span className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
                  <span className="truncate">{h.name}</span>
                  <Dot color={h.color} />
                </span>
                <span className="w-14 shrink-0 text-center font-bold tabular-nums">{played ? `${f.hg} - ${f.ag}` : "vs"}</span>
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <Dot color={a.color} />
                  <span className="truncate">{a.name}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-center text-[11px] text-[#8B949E]">Tocca una partita giocata per rivederla.</p>
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

function TeamsView({ s }: { s: StadiumState }) {
  const list = [...s.teams].sort((a, b) => strength(b).ovr - strength(a).ovr);
  return (
    <ul className="flex flex-col gap-1.5">
      {list.map((t) => {
        const st = strength(t);
        return (
          <li key={t.id} className={cn("flex items-center gap-3 rounded-lg px-3 py-2", PANEL, t.mine && "border-[#3FB950]/50 bg-[#12261E]/85")}>
            <Dot color={t.color} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {t.name}
                {t.mine && <span className="ml-2 text-[10px] text-[#7EE787]">LA TUA</span>}
              </p>
              <p className="text-[11px] text-[#8B949E]">
                Att {Math.round(st.att)} · Dif {Math.round(st.def)} · {t.players.length} giocatori · {t.formation}
              </p>
            </div>
            <b className="text-lg tabular-nums">{Math.round(st.ovr)}</b>
          </li>
        );
      })}
    </ul>
  );
}

function Hub({ s, mine, onOpen, onPlay }: { s: StadiumState; mine: Team; onOpen: (t: Tab) => void; onPlay: (f: Fixture) => void }) {
  const finished = s.day >= TOTAL_DAYS;
  const ready = isReady(mine);
  const next = s.fixtures.find((f) => f.day === s.day + 1 && (f.home === s.myId || f.away === s.myId));
  const h = next ? (s.teams.find((t) => t.id === next.home) as Team) : null;
  const a = next ? (s.teams.find((t) => t.id === next.away) as Team) : null;
  const rank = table(s).findIndex((r) => r.team.mine) + 1;
  const st = strength(mine);
  const badge: Partial<Record<Tab, number>> = { deals: s.offers.length, market: s.auctions.length };

  const play = () => {
    const d = s.day + 1;
    const err = playDay();
    if (err) {
      toast.error(err);
      return;
    }
    const now = getStadium();
    const fx = now.fixtures.find((f) => f.day === d && (f.home === now.myId || f.away === now.myId));
    if (fx) {
      if (fx.reward) toast.success(`Premio partita +${eur(fx.reward)}`);
      onPlay(fx);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="st-hero">
        <div className="flex items-center gap-3">
          <Crest team={mine} size={54} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-black">{mine.name}</h2>
            <p className="text-xs text-[#C9D1D9]">
              Stagione {s.season} · {rank}° posto · Overall {st.ovr}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-widest text-[#8B949E] uppercase">Budget</p>
            <p className="text-xl font-black tabular-nums text-[#E3B341]">{eur(s.budget)}</p>
            {s.auctions.length > 0 && <p className="text-[10px] text-[#8B949E]">disponibili {eur(available(s))}</p>}
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-[#3FB950] to-[#E3B341]" style={{ width: `${(s.day / TOTAL_DAYS) * 100}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-[#8B949E]">
          Giornata {s.day}/{TOTAL_DAYS}
        </p>
      </div>

      <div className="st-ticket">
        {finished ? (
          <div className="py-2 text-center">
            <Trophy className="mx-auto size-9 text-[#E3B341]" />
            <p className="mt-2 text-sm text-[#C9D1D9]">Campionato concluso</p>
            <Button size="lg" className="mt-3 h-12 w-full text-base" onClick={() => run(newSeason, "Nuova stagione!")}>
              <RefreshCw /> Nuova stagione
            </Button>
          </div>
        ) : (
          <>
            <p className="text-center text-[10px] tracking-[0.25em] text-[#8B949E] uppercase">
              Prossima partita · Giornata {s.day + 1}/{TOTAL_DAYS}
            </p>
            {h && a && (
              <div className="mt-3 flex items-center justify-center gap-3">
                <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
                  <Crest team={h} size={46} />
                  <span className="max-w-full truncate text-sm font-semibold">{h.name}</span>
                </div>
                <span className="text-2xl font-black text-[#E3B341]">VS</span>
                <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
                  <Crest team={a} size={46} />
                  <span className="max-w-full truncate text-sm font-semibold">{a.name}</span>
                </div>
              </div>
            )}
            <p className="mt-3 text-center text-[11px] text-[#7EE787]">
              Vittoria +{eur(CFG.economy.winReward)} · Pareggio +{eur(CFG.economy.drawReward)} · Sconfitta +{eur(CFG.economy.lossReward)} · +{eur(CFG.economy.goalBonus)} a gol
            </p>
            {!ready && <p className="mt-3 rounded-lg border border-[#F85149]/40 bg-[#2a1214]/90 px-3 py-2 text-xs text-[#FFA198]">Formazione incompleta: servono 11 titolari. Vai in Rosa e Mercato.</p>}
            <Button size="lg" className="st-play mt-4 h-14 w-full text-lg font-black tracking-wider" disabled={!ready} onClick={play} data-testid="stadium-play">
              <Play /> GIOCA
            </Button>
            <Button variant="secondary" className="mt-2 w-full" disabled={!ready} onClick={() => run(playSeason, "Campionato concluso!")}>
              <FastForward /> Simula tutto il campionato
            </Button>
          </>
        )}
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
  const [live, setLive] = useState<Fixture | null>(null);
  const mine = myTeam(s);
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
            <Hub s={s} mine={mine} onOpen={setTab} onPlay={setLive} />
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
              {tab === "table" && <TableView s={s} />}
              {tab === "matches" && <MatchesView s={s} onWatch={setLive} />}
              {tab === "squad" && <Squad s={s} team={mine} />}
              {tab === "market" && <MarketView s={s} team={mine} />}
              {tab === "deals" && <Deals s={s} team={mine} />}
              {tab === "train" && <TrainView s={s} team={mine} />}
              {tab === "teams" && <TeamsView s={s} />}
            </>
          )}
        </div>
      </div>
      {live && <LiveMatch key={`${live.day}${live.home}${live.away}`} fx={live} s={s} onClose={() => setLive(null)} />}
    </div>
  );
}
