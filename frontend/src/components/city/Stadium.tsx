import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FastForward, Play, RefreshCw, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { COLORS, POS_LABEL, POS_ORDER, SQUAD_MAX, SQUAD_MIN, TOTAL_DAYS, addBudget, buyPlayer, buyTeam, createTeam, isReady, lineup, myTeam, newSeason, playDay, playSeason, priceOf, refreshMarket, resetStadium, sellPlayer, sellPrice, strength, table, teamPrice, useStadium, type Fixture, type Player, type Pos, type StadiumState, type Team } from "@/lib/football";
import { StadiumSketch } from "./Landmarks";

type Tab = "table" | "matches" | "squad" | "market" | "teams";

const TABS: [Tab, string][] = [["table", "Classifica"], ["matches", "Partite"], ["squad", "Rosa"], ["market", "Mercato"], ["teams", "Squadre"]];
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

function Ovr({ v }: { v: number }) {
  const c = v >= 80 ? "#E3B341" : v >= 70 ? "#3FB950" : v >= 60 ? "#58A6FF" : "#8B949E";
  return (
    <span className="w-9 shrink-0 rounded text-center text-sm font-bold tabular-nums" style={{ color: c }}>
      {v}
    </span>
  );
}

function TestBar({ s }: { s: StadiumState }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#E3B341]/40 bg-[#1f1a0d] px-3 py-2">
      <span className="rounded-full border border-[#E3B341]/60 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#E3B341] uppercase">Test · non si salva</span>
      <span className="text-sm font-semibold tabular-nums text-[#F0F6FC]">Budget {eur(s.budget)}</span>
      <div className="ml-auto flex flex-wrap gap-1.5">
        <Button size="sm" variant="outline" onClick={() => addBudget(10)}>
          +€10M
        </Button>
        <Button size="sm" variant="outline" onClick={() => addBudget(100)}>
          +€100M
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
      <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-4">
        <h2 className="text-base font-semibold">Crea la tua squadra</h2>
        <p className="mt-1 text-xs text-[#8B949E]">Parti da zero con {eur(s.budget)} e compra i giocatori dal mercato. Minimo {SQUAD_MIN} giocatori e un portiere.</p>
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
      <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-4">
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

function TableView({ s }: { s: StadiumState }) {
  const rows = table(s);
  const champ = s.teams.find((t) => t.id === s.champion);
  return (
    <div>
      <p className="mb-2 text-xs text-[#8B949E]">
        Stagione {s.season} · Giornata {s.day}/{TOTAL_DAYS}
      </p>
      {champ && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#E3B341]/50 bg-[#1f1a0d] px-3 py-2 text-sm">
          <Trophy className="size-4 text-[#E3B341]" />
          <span>
            Campione: <b>{champ.name}</b>
            {s.prize > 0 && <span className="text-[#7EE787]"> · premio {eur(s.prize)} alla tua squadra</span>}
          </span>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-[#30363D] bg-[#161B22]">
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
              <tr key={r.team.id} className={cn("border-b border-[#21262D] last:border-0", r.team.mine && "bg-[#1f2d1f]")}>
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

function TopScorers({ s }: { s: StadiumState }) {
  const list = s.teams
    .flatMap((t) => t.players.map((p) => ({ p, t })))
    .filter((x) => x.p.goals > 0)
    .sort((a, b) => b.p.goals - a.p.goals)
    .slice(0, 5);
  if (!list.length) return null;
  return (
    <div className="mt-4 rounded-xl border border-[#30363D] bg-[#161B22] p-3">
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

function MatchDialog({ fx, s, onClose }: { fx: Fixture | null; s: StadiumState; onClose: () => void }) {
  const h = fx ? s.teams.find((t) => t.id === fx.home) : undefined;
  const a = fx ? s.teams.find((t) => t.id === fx.away) : undefined;
  return (
    <Dialog open={!!fx} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {fx && h && a && (
          <>
            <DialogHeader>
              <DialogTitle>
                {h.name} {fx.hg} - {fx.ag} {a.name}
              </DialogTitle>
              <DialogDescription>Giornata {fx.day}</DialogDescription>
            </DialogHeader>
            {fx.events.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[#30363D] px-4 py-6 text-center text-sm text-[#8B949E]">Nessun gol: partita chiusa sullo 0-0.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {fx.events.map((e, i) => {
                  const t = e.teamId === h.id ? h : a;
                  return (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-8 text-right tabular-nums text-[#8B949E]">{e.min}'</span>
                      <Dot color={t.color} />
                      <span>{e.player}</span>
                      <span className="text-[11px] text-[#8B949E]">{t.name}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MatchesView({ s }: { s: StadiumState }) {
  const [view, setView] = useState<number | null>(null);
  const [open, setOpen] = useState<Fixture | null>(null);
  const day = view ?? Math.min(s.day + 1, TOTAL_DAYS);
  const list = s.fixtures.filter((f) => f.day === day);
  const mine = myTeam(s);
  const finished = s.day >= TOTAL_DAYS;
  const ready = isReady(mine);
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button disabled={finished} onClick={() => run(playDay)}>
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
      </div>
      {!ready && <p className="mb-3 rounded-lg border border-[#F85149]/40 bg-[#2a1214] px-3 py-2 text-xs text-[#FFA198]">Rosa incompleta: servono almeno {SQUAD_MIN} giocatori e un portiere. Compra i giocatori dal mercato.</p>}
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
              <button type="button" disabled={!played} onClick={() => setOpen(f)} className={cn("flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm outline-none", own ? "border-[#3FB950]/50 bg-[#12261E]" : "border-[#30363D] bg-[#161B22]", played && "hover:brightness-125")}>
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
      <MatchDialog fx={open} s={s} onClose={() => setOpen(null)} />
    </div>
  );
}

function SquadView({ s }: { s: StadiumState }) {
  const mine = myTeam(s) as Team;
  const xi = new Set(lineup(mine).map((x) => x.player?.id));
  const st = strength(mine);
  return (
    <div>
      <div className="mb-3 grid grid-cols-4 gap-2 text-center text-xs">
        {[["Overall", st.ovr], ["Attacco", Math.round(st.att)], ["Difesa", Math.round(st.def)], ["Rosa", `${mine.players.length}/${SQUAD_MAX}`]].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-[#30363D] bg-[#161B22] py-2">
            <p className="text-[#8B949E]">{l}</p>
            <p className="text-base font-bold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      {mine.players.length === 0 && <p className="rounded-lg border border-dashed border-[#30363D] px-4 py-8 text-center text-sm text-[#8B949E]">La rosa è vuota. Vai al mercato e compra i primi giocatori.</p>}
      {POS_ORDER.map((pos) => {
        const list = mine.players.filter((p) => p.pos === pos).sort((a, b) => b.ovr - a.ovr);
        if (!list.length) return null;
        return (
          <div key={pos} className="mb-3">
            <h3 className="mb-1 text-xs font-semibold tracking-wider text-[#8B949E] uppercase">{POS_LABEL[pos]}i</h3>
            <ul className="flex flex-col gap-1">
              {list.map((p) => (
                <PlayerRow key={p.id} p={p} starter={xi.has(p.id)} action={<Button size="sm" variant="outline" onClick={() => run(() => sellPlayer(p.id), "Giocatore venduto")}>Vendi {eur(sellPrice(p))}</Button>} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function PlayerRow({ p, starter, action }: { p: Player; starter?: boolean; action: React.ReactNode }) {
  return (
    <li className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5", starter ? "border-[#3FB950]/40 bg-[#12261E]" : "border-[#30363D] bg-[#161B22]")}>
      <PosBadge pos={p.pos} />
      <Ovr v={p.ovr} />
      <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
      {p.goals > 0 && <span className="text-[11px] text-[#8B949E]">{p.goals} gol</span>}
      {action}
    </li>
  );
}

function MarketView({ s }: { s: StadiumState }) {
  const [f, setF] = useState<Pos | "ALL">("ALL");
  const list = s.market.filter((p) => f === "ALL" || p.pos === f);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {(["ALL", ...POS_ORDER] as const).map((x) => (
          <button key={x} type="button" onClick={() => setF(x)} className={cn("rounded-full border px-3 py-1 text-xs", f === x ? "border-[#58A6FF] bg-[#58A6FF]/15 text-white" : "border-[#30363D] text-[#8B949E]")}>
            {x === "ALL" ? "Tutti" : x}
          </button>
        ))}
        <Button size="sm" variant="ghost" className="ml-auto" onClick={() => run(refreshMarket)}>
          <RefreshCw /> Rinnova
        </Button>
      </div>
      <ul className="flex flex-col gap-1">
        {list.map((p) => (
          <PlayerRow key={p.id} p={p} action={<Button size="sm" disabled={s.budget < priceOf(p.ovr)} onClick={() => run(() => buyPlayer(p.id))}>{eur(priceOf(p.ovr))}</Button>} />
        ))}
      </ul>
      {list.length === 0 && <p className="rounded-lg border border-dashed border-[#30363D] px-4 py-8 text-center text-sm text-[#8B949E]">Nessun giocatore disponibile.</p>}
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
          <li key={t.id} className={cn("flex items-center gap-3 rounded-lg border px-3 py-2", t.mine ? "border-[#3FB950]/50 bg-[#12261E]" : "border-[#30363D] bg-[#161B22]")}>
            <Dot color={t.color} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {t.name}
                {t.mine && <span className="ml-2 text-[10px] text-[#7EE787]">LA TUA</span>}
              </p>
              <p className="text-[11px] text-[#8B949E]">
                Att {Math.round(st.att)} · Dif {Math.round(st.def)} · {t.players.length} giocatori
              </p>
            </div>
            <Ovr v={Math.round(st.ovr)} />
          </li>
        );
      })}
    </ul>
  );
}

export default function Stadium() {
  const s = useStadium();
  const [tab, setTab] = useState<Tab>("table");
  const mine = myTeam(s);
  return (
    <div className="absolute inset-0 overflow-y-auto bg-[#0D1117] pb-10" data-testid="stadium">
      <div className="pt-12">
        <StadiumSketch />
      </div>
      <div className="mx-auto w-full max-w-3xl px-3 pt-3">
        <TestBar s={s} />
        {!mine ? (
          <Setup s={s} />
        ) : (
          <>
            <div className="mb-3 flex items-center gap-2">
              <Dot color={mine.color} />
              <h2 className="text-base font-semibold">{mine.name}</h2>
            </div>
            <div className="mb-3 flex gap-1 overflow-x-auto">
              {TABS.map(([id, label]) => (
                <button key={id} type="button" onClick={() => setTab(id)} className={cn("rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap", tab === id ? "border-[#58A6FF] bg-[#58A6FF]/15 text-white" : "border-[#30363D] text-[#8B949E]")}>
                  {label}
                </button>
              ))}
            </div>
            {tab === "table" && <TableView s={s} />}
            {tab === "matches" && <MatchesView s={s} />}
            {tab === "squad" && <SquadView s={s} />}
            {tab === "market" && <MarketView s={s} />}
            {tab === "teams" && <TeamsView s={s} />}
          </>
        )}
      </div>
    </div>
  );
}
