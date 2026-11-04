import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FastForward, Play, RefreshCw, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { COLORS, POS_ORDER, SQUAD_MAX, SQUAD_MIN, TOTAL_DAYS, TRAIN, addBudget, getStadium, buyPlayer, buyTeam, createTeam, isReady, myTeam, newSeason, playDay, playSeason, priceOf, refreshMarket, resetStadium, resetTraining, strength, table, teamPrice, train, trainCost, trainTeam, useStadium, type Fixture, type Player, type Pos, type StadiumState, type Team, type TrainKind } from "@/lib/football";
import { StadiumBack } from "./Landmarks";
import LiveMatch from "./LiveMatch";
import PlayerCard from "./PlayerCard";
import Squad, { PlayerDetail } from "./Squad";
import "./stadium.css";

type Tab = "table" | "matches" | "squad" | "market" | "train" | "teams";

const TABS: [Tab, string][] = [["table", "Classifica"], ["matches", "Partite"], ["squad", "Rosa"], ["market", "Mercato"], ["train", "Allenamento"], ["teams", "Squadre"]];
const PANEL = "border border-[#30363D] bg-[#0D1117]/80 backdrop-blur-sm";
const eur = (n: number) => `€${n.toFixed(1)}M`;
const run = (fn: () => string | null, ok?: string) => {
  const err = fn();
  if (err) toast.error(err);
  else if (ok) toast.success(ok);
};

function Dot({ color }: { color: string }) {
  return <span className="inline-block size-2.5 shrink-0 rounded-full" style={{ background: color }} />;
}

function PosBadge({ pos }: { pos: Pos }) {
  const tone: Record<Pos, string> = { POR: "#E3B341", DIF: "#58A6FF", CEN: "#3FB950", ATT: "#F85149" };
  return (
    <span className="w-9 shrink-0 rounded border px-1 py-0.5 text-center text-[10px] font-semibold" style={{ borderColor: `${tone[pos]}66`, color: tone[pos], background: `${tone[pos]}14` }}>
      {pos}
    </span>
  );
}

function TestBar({ s }: { s: StadiumState }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#E3B341]/40 bg-[#1f1a0d]/90 px-3 py-2 backdrop-blur-sm">
      <span className="rounded-full border border-[#E3B341]/60 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#E3B341] uppercase">Test · non si salva</span>
      <span className="text-sm font-semibold tabular-nums text-[#F0F6FC]">Budget {eur(s.budget)}</span>
      <div className="ml-auto flex flex-wrap gap-1.5">
        <Button size="sm" variant="outline" onClick={() => addBudget(10)}>
          +€10M
        </Button>
        <Button size="sm" variant="outline" onClick={() => addBudget(100)}>
          +€100M
        </Button>
        <Button size="sm" variant="outline" onClick={() => resetTraining()}>
          Azzera allenamenti
        </Button>
        <Button size="sm" variant="ghost" onClick={() => resetStadium()}>
          <RotateCcw /> Reset
        </Button>
      </div>
    </div>
  );
}

function Setup({ s }: { s: StadiumState }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const bots = useMemo(() => [...s.teams].sort((a, b) => teamPrice(b) - teamPrice(a)), [s.teams]);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className={cn("rounded-xl p-4", PANEL)}>
        <h2 className="text-base font-semibold">Crea la tua squadra</h2>
        <p className="mt-1 text-xs text-[#8B949E]">Parti da zero con {eur(s.budget)} e compra i giocatori dal mercato. Servono {SQUAD_MIN} titolari, portiere compreso.</p>
        <Input className="mt-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome della squadra" maxLength={24} />
        <div className="mt-3 flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Colore ${c}`} className={cn("size-7 rounded-full border-2", color === c ? "border-white" : "border-transparent")} style={{ background: c }} />
          ))}
        </div>
        <Button className="mt-4 w-full" onClick={() => run(() => createTeam(name, color), "Squadra creata!")}>
          Crea squadra
        </Button>
      </div>
      <div className={cn("rounded-xl p-4", PANEL)}>
        <h2 className="text-base font-semibold">Compra una squadra</h2>
        <p className="mt-1 text-xs text-[#8B949E]">Prendi una squadra già pronta: paghi il prezzo con il tuo budget.</p>
        <ul className="mt-3 flex max-h-72 flex-col gap-1.5 overflow-y-auto">
          {bots.map((t) => (
            <li key={t.id} className="flex items-center gap-2 rounded-lg border border-[#30363D] bg-[#0D1117] px-2.5 py-2">
              <Dot color={t.color} />
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
  const [watch, setWatch] = useState(true);
  const day = view ?? Math.min(s.day + 1, TOTAL_DAYS);
  const list = s.fixtures.filter((f) => f.day === day);
  const mine = myTeam(s);
  const finished = s.day >= TOTAL_DAYS;
  const ready = isReady(mine);

  const play = () => {
    const d = s.day + 1;
    const err = playDay();
    if (err) {
      toast.error(err);
      return;
    }
    setView(null);
    if (watch) {
      const now = getStadium();
      const fx = now.fixtures.find((f) => f.day === d && (f.home === now.myId || f.away === now.myId));
      if (fx) onWatch(fx);
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button disabled={finished} onClick={play}>
          <Play /> Gioca giornata
        </Button>
        <Button variant="secondary" disabled={finished} onClick={() => run(playSeason, "Campionato concluso!")}>
          <FastForward /> Simula campionato
        </Button>
        {finished && (
          <Button variant="outline" onClick={() => run(newSeason, "Nuova stagione!")}>
            <RefreshCw /> Nuova stagione
          </Button>
        )}
        <label className="ml-auto flex items-center gap-1.5 text-xs text-[#C9D1D9]">
          <input type="checkbox" checked={watch} onChange={(e) => setWatch(e.target.checked)} /> Guarda la mia partita
        </label>
      </div>
      {!ready && <p className="mb-3 rounded-lg border border-[#F85149]/40 bg-[#2a1214]/90 px-3 py-2 text-xs text-[#FFA198]">Formazione incompleta: servono 11 titolari in campo. Compra giocatori dal mercato e sistemali in Rosa.</p>}
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
      <p className="mt-2 text-center text-[11px] text-[#8B949E]">Tocca una partita giocata per rivederla o leggere la cronaca.</p>
    </div>
  );
}

function MarketView({ s, team }: { s: StadiumState; team: Team }) {
  const [f, setF] = useState<Pos | "ALL">("ALL");
  const [q, setQ] = useState("");
  const [order, setOrder] = useState<"ovr" | "price">("ovr");
  const [limit, setLimit] = useState(24);
  const list = useMemo(() => {
    const l = s.market.filter((p) => (f === "ALL" || p.pos === f) && p.name.toLowerCase().includes(q.trim().toLowerCase()));
    return order === "ovr" ? l : [...l].sort((a, b) => priceOf(a.ovr) - priceOf(b.ovr));
  }, [s.market, f, q, order]);
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {(["ALL", ...POS_ORDER] as const).map((x) => (
          <button key={x} type="button" onClick={() => (setF(x), setLimit(24))} className={cn("rounded-full border px-3 py-1 text-xs backdrop-blur-sm", f === x ? "border-[#58A6FF] bg-[#58A6FF]/15 text-white" : "border-[#30363D] bg-[#0D1117]/70 text-[#8B949E]")}>
            {x === "ALL" ? "Tutti" : x}
          </button>
        ))}
        <Button size="sm" variant="ghost" className="ml-auto" onClick={() => run(refreshMarket, "Mercato rinnovato")}>
          <RefreshCw /> Rinnova
        </Button>
      </div>
      <div className="mb-3 flex gap-2">
        <Input value={q} onChange={(e) => (setQ(e.target.value), setLimit(24))} placeholder="Cerca giocatore" className="bg-[#0D1117]/80" />
        <Button variant="outline" onClick={() => setOrder(order === "ovr" ? "price" : "ovr")}>
          {order === "ovr" ? "Per overall" : "Per prezzo"}
        </Button>
      </div>
      <p className="mb-2 text-[11px] text-[#C9D1D9]">
        {list.length} giocatori · rosa {team.players.length}/{SQUAD_MAX}
      </p>
      <div className="grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-4">
        {list.slice(0, limit).map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-1">
            <PlayerCard p={p} size={0.9} color={team.color} />
            <Button size="sm" className="w-full max-w-[90px]" disabled={s.budget < priceOf(p.ovr) || team.players.length >= SQUAD_MAX} onClick={() => run(() => buyPlayer(p.id))}>
              {eur(priceOf(p.ovr))}
            </Button>
          </div>
        ))}
      </div>
      {list.length > limit && (
        <Button className="mt-4 w-full" variant="secondary" onClick={() => setLimit(limit + 24)}>
          Mostra altri
        </Button>
      )}
      {list.length === 0 && <p className="rounded-lg border border-dashed border-[#30363D] bg-[#0D1117]/70 px-4 py-8 text-center text-sm text-[#8B949E]">Nessun giocatore trovato.</p>}
    </div>
  );
}

function TrainView({ s, team }: { s: StadiumState; team: Team }) {
  const [detail, setDetail] = useState<Player | null>(null);
  const players = [...team.players].sort((a, b) => b.ovr - a.ovr);
  const pending = players.filter((p) => p.trained !== s.day);
  const total = pending.reduce((sum, p) => sum + trainCost(p), 0);
  return (
    <div>
      <div className={cn("mb-3 rounded-xl p-3", PANEL)}>
        <h3 className="text-sm font-semibold">Allenamento di squadra</h3>
        <p className="mt-0.5 text-[11px] text-[#8B949E]">
          Ogni giocatore si allena una volta per giornata. Costo totale per chi può allenarsi: {eur(total)} ({pending.length} giocatori).
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
          return (
            <li key={p.id} className={cn("flex flex-wrap items-center gap-2 rounded-lg px-2.5 py-1.5", PANEL)}>
              <button type="button" onClick={() => setDetail(p)} className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none">
                <PosBadge pos={p.pos} />
                <b className="w-7 text-center tabular-nums">{p.ovr}</b>
                <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                <span className="text-[10px] text-[#8B949E]">POT {p.pot}</span>
              </button>
              {done ? (
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

export default function Stadium() {
  const s = useStadium();
  const [tab, setTab] = useState<Tab>("table");
  const [live, setLive] = useState<Fixture | null>(null);
  const mine = myTeam(s);
  return (
    <div className="absolute inset-0 bg-[#05080d]" data-testid="stadium">
      <StadiumBack />
      <div className="absolute inset-0 overflow-y-auto pt-14 pb-10">
        <div className="mx-auto w-full max-w-3xl px-3 pt-3">
          <TestBar s={s} />
          {!mine ? (
            <Setup s={s} />
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2">
                <Dot color={mine.color} />
                <h2 className="text-base font-semibold drop-shadow">{mine.name}</h2>
              </div>
              <div className="mb-3 flex gap-1 overflow-x-auto">
                {TABS.map(([id, label]) => (
                  <button key={id} type="button" onClick={() => setTab(id)} className={cn("rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap backdrop-blur-sm", tab === id ? "border-[#58A6FF] bg-[#58A6FF]/20 text-white" : "border-[#30363D] bg-[#0D1117]/70 text-[#C9D1D9]")}>
                    {label}
                  </button>
                ))}
              </div>
              {tab === "table" && <TableView s={s} />}
              {tab === "matches" && <MatchesView s={s} onWatch={setLive} />}
              {tab === "squad" && <Squad s={s} team={mine} />}
              {tab === "market" && <MarketView s={s} team={mine} />}
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
