import { useMemo, useState } from "react";
import { ChevronLeft, Crown, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { useNow } from "@/lib/runtime/useNow";
import { teamOfSnap, useLeague, useLeagues, useReplay, useServerState, useStadiumActions, type FixtureRow, type LeagueCard, type LeagueDetail } from "@/lib/domain/stadiumApi";
import LiveMatch from "./LiveMatch";
import { Dot, PANEL } from "./stadiumUi";

export const fmtWhen = (at: number) => new Date(at * 1000).toLocaleString("it-IT", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export const countdown = (at: number, now: number) => {
  const s = Math.max(0, Math.round(at - now / 1000));
  if (s >= 86400) return `${Math.floor(s / 86400)}g ${Math.floor((s % 86400) / 3600)}h`;
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${s}s`;
};

const statusLabel: Record<string, string> = { open: "In formazione", running: "In corso", finished: "Conclusa", break: "Pausa tra stagioni" };

export function ReplayHost({ id, onClose }: { id: string; onClose: () => void }) {
  const q = useReplay(id);
  if (q.isError) {
    toast.error("Replay non disponibile");
    onClose();
    return null;
  }
  if (!q.data) return <div className="fixed inset-0 z-[70] grid place-items-center bg-black/80 text-sm text-white">Carico la partita…</div>;
  const r = q.data;
  const h = teamOfSnap(r.home);
  const a = teamOfSnap(r.away);
  return <LiveMatch fx={{ day: r.day, home: h.id, away: a.id, hg: r.hg, ag: r.ag, events: r.events, log: r.log }} h={h} a={a} onClose={onClose} />;
}

function FixtureList({ d, myId, onWatch }: { d: LeagueDetail; myId: string | null; onWatch: (f: FixtureRow) => void }) {
  const names = useMemo(() => Object.fromEntries(d.teams_list.map((t) => [t.id, t])), [d.teams_list]);
  const lastPlayed = Math.max(0, ...d.fixtures.filter((f) => f.status === "played").map((f) => f.day));
  const [day, setDay] = useState<number | null>(null);
  const total = Math.max(1, ...d.fixtures.map((f) => f.day));
  const cur = day ?? Math.min(total, Math.max(1, lastPlayed + (lastPlayed < total && d.fixtures.every((f) => f.day !== lastPlayed || f.status === "played") ? 1 : 0)));
  const list = d.fixtures.filter((f) => f.day === cur);
  if (!d.fixtures.length) return <p className="py-6 text-center text-xs text-[#8B949E]">Il calendario sarà generato all'avvio della lega.</p>;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Button size="icon-lg" variant="ghost" disabled={cur <= 1} onClick={() => setDay(cur - 1)} aria-label="Giornata precedente">
          <ChevronLeft />
        </Button>
        <p className="text-sm font-semibold">
          Giornata {cur}/{total}
        </p>
        <Button size="icon-lg" variant="ghost" disabled={cur >= total} onClick={() => setDay(cur + 1)} aria-label="Giornata successiva" className="rotate-180">
          <ChevronLeft />
        </Button>
      </div>
      <ul className="flex flex-col gap-1.5">
        {list.map((f) => {
          const h = names[f.home];
          const a = names[f.away];
          const own = f.home === myId || f.away === myId;
          const played = f.status === "played";
          return (
            <li key={f.id} className={cn("rounded-lg border px-3 py-2 text-sm backdrop-blur-sm", own ? "border-[#3FB950]/50 bg-[#12261E]/85" : "border-[#30363D] bg-[#0D1117]/80")}>
              <div className="flex items-center gap-2">
                <span className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
                  <span className="truncate">{h?.name}</span>
                  <Dot color={h?.color ?? "#888"} />
                </span>
                <span className="w-14 shrink-0 text-center font-bold tabular-nums">{played ? `${f.hg} - ${f.ag}` : "vs"}</span>
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <Dot color={a?.color ?? "#888"} />
                  <span className="truncate">{a?.name}</span>
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-[#8B949E]">
                <span>{played ? (f.walkover ? "3-0 a tavolino" : "Giocata") : f.status === "void" ? "Annullata" : fmtWhen(f.at)}</span>
                {played && !f.walkover && (
                  <button type="button" onClick={() => onWatch(f)} className="flex items-center gap-1 rounded-full bg-[#58A6FF]/15 px-2 py-0.5 font-semibold text-[#58A6FF]">
                    <Eye className="size-3" /> Rivedi
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LeagueView({ id, myId, onBack }: { id: string; myId: string | null; onBack: () => void }) {
  const q = useLeague(id);
  const act = useStadiumActions();
  const [watch, setWatch] = useState<string | null>(null);
  const [view, setView] = useState<"table" | "fixtures" | "scorers">("table");
  const [code, setCode] = useState("");
  const now = useNow(true);
  const d = q.data;
  if (!d) return <p className="py-10 text-center text-sm text-[#8B949E]">Carico…</p>;
  const serie = d.kind === "serie_a";
  const next = d.fixtures.filter((f) => f.status === "scheduled").sort((a, b) => a.at - b.at)[0];
  return (
    <div>
      <Button size="sm" variant="outline" onClick={onBack} className="mb-3">
        <ChevronLeft /> Leghe
      </Button>
      <div className={cn("mb-3 rounded-xl p-3", PANEL)}>
        <div className="flex items-center gap-2">
          {serie && <Crown className="size-5 text-[#E3B341]" />}
          <h3 className="min-w-0 flex-1 truncate text-lg font-black">{d.name}</h3>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold">{statusLabel[d.status] ?? d.status}</span>
        </div>
        <p className="mt-1 text-[11px] text-[#8B949E]">
          Stagione {d.season} · {d.teams}/{d.size} squadre · una partita ogni {d.interval_minutes} min {d.owner_name ? `· creata da ${d.owner_name}` : ""}
        </p>
        {d.champion && <p className="mt-1 text-xs text-[#E3B341]">🏆 Campione: {d.champion}</p>}
        {serie && !!d.promoted_waiting && <p className="mt-1 text-xs text-[#7EE787]">{d.promoted_waiting} promosse dalle leghe personalizzate in attesa della prossima stagione.</p>}
        {d.status === "break" && d.next_season_at && <p className="mt-1 text-xs text-[#C9D1D9]">Nuova stagione tra {countdown(d.next_season_at, now)}</p>}
        {d.status === "running" && next && <p className="mt-1 text-xs text-[#C9D1D9]">Prossima giornata tra {countdown(next.at, now)}</p>}
        {d.status === "open" && d.code && <p className="mt-1 text-xs text-[#C9D1D9]">Codice invito: <b className="tracking-widest">{d.code}</b></p>}
        <div className="mt-2 flex flex-wrap gap-2">
          {!serie && d.status === "open" && d.owner && (
            <Button size="sm" disabled={act.start.isPending} onClick={() => act.start.mutate(d.id, { onSuccess: () => toast.success("Lega avviata! Le partite si giocano da sole.") })}>
              Avvia lega
            </Button>
          )}
          {!serie && d.status === "finished" && d.owner && (
            <Button size="sm" disabled={act.start.isPending} onClick={() => act.start.mutate(d.id)}>
              Nuova stagione
            </Button>
          )}
          {!serie && !d.joined && d.status === "open" && d.private && <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Codice invito" className="h-8 w-36" />}
          {!serie && !d.joined && d.status === "open" && (
            <Button size="sm" disabled={act.join.isPending || !myId || (d.private && code.trim().length < 3)} onClick={() => act.join.mutate({ id: d.id, code: d.private ? code.trim() : undefined }, { onSuccess: () => toast.success("Ti sei iscritto") })}>
              Iscriviti
            </Button>
          )}
          {!serie && d.joined && d.status !== "running" && (
            <Button size="sm" variant="outline" disabled={act.leave.isPending} onClick={() => act.leave.mutate(d.id, { onSuccess: () => toast("Hai lasciato la lega") })}>
              Esci
            </Button>
          )}
          {!serie && d.owner && d.status !== "running" && (
            <Button size="sm" variant="ghost" className="text-[#FFA198]" onClick={() => act.remove.mutate(d.id, { onSuccess: onBack })}>
              Elimina
            </Button>
          )}
        </div>
      </div>
      <div className="mb-3 flex gap-1.5">
        {(["table", "fixtures", "scorers"] as const).map((v) => (
          <button key={v} type="button" onClick={() => setView(v)} className={cn("st-chip", view === v && "st-chip-on")}>
            {v === "table" ? "Classifica" : v === "fixtures" ? "Calendario" : "Marcatori"}
          </button>
        ))}
      </div>
      {view === "table" && (
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
              {d.table.map((r, i) => (
                <tr key={r.id} className={cn("border-b border-[#21262D] last:border-0", r.id === myId && "bg-[#1f2d1f]/80", serie && i >= d.table.length - 3 && "bg-[#2a1214]/40", !serie && i === 0 && d.status !== "open" && "bg-[#1f1a0d]/60")}>
                  <td className="px-2 py-1.5 tabular-nums text-[#8B949E]">{i + 1}</td>
                  <td className="px-2 py-1.5">
                    <span className="flex items-center gap-2">
                      <Dot color={r.color} />
                      <span className={cn("truncate", r.id === myId && "font-semibold")}>{r.name}</span>
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
          {!serie && <p className="px-3 py-2 text-[10px] text-[#8B949E]">La prima classificata a fine stagione viene promossa in Serie A.</p>}
        </div>
      )}
      {view === "fixtures" && <FixtureList d={d} myId={myId} onWatch={(f) => setWatch(f.id)} />}
      {view === "scorers" && (
        <ul className={cn("flex flex-col gap-1 rounded-xl p-3", PANEL)}>
          {d.scorers.length === 0 && <li className="text-center text-xs text-[#8B949E]">Ancora nessun gol.</li>}
          {d.scorers.map((s, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="w-5 text-[#8B949E]">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate">{s.player}</span>
              <span className="text-[11px] text-[#8B949E]">{s.team}</span>
              <b className="w-6 text-right tabular-nums">{s.goals}</b>
            </li>
          ))}
        </ul>
      )}
      {watch && <ReplayHost id={watch} onClose={() => setWatch(null)} />}
    </div>
  );
}

function LeagueRow({ l, onOpen }: { l: LeagueCard; onOpen: () => void }) {
  return (
    <li>
      <button type="button" onClick={onOpen} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", PANEL, l.joined && "border-[#3FB950]/50")}>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {l.name}
            {l.private && " 🔒"}
          </p>
          <p className="text-[11px] text-[#8B949E]">
            {statusLabel[l.status] ?? l.status} · {l.teams}/{l.size} squadre · ogni {l.interval_minutes} min
          </p>
        </div>
        {l.joined && <span className="text-[10px] font-bold text-[#7EE787]">ISCRITTO</span>}
      </button>
    </li>
  );
}

export default function Leagues({ myId, onNeedClub }: { myId: string | null; onNeedClub: () => void }) {
  const q = useLeagues();
  const st = useServerState();
  const act = useStadiumActions();
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState(false);
  const [name, setName] = useState("");
  const [size, setSize] = useState<number | null>(null);
  const [priv, setPriv] = useState(false);
  const cfg = st.data?.settings;
  const clubId = st.data?.club?.id ?? myId;

  if (open) return <LeagueView id={open} myId={st.data?.club?.id ?? null} onBack={() => setOpen(null)} />;
  const d = q.data;
  const n = size ?? cfg?.default_teams ?? 8;
  return (
    <div>
      {d?.serie_a && (
        <button type="button" onClick={() => setOpen("serie-a")} className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-[#E3B341]/50 bg-gradient-to-r from-[#2a2108]/90 to-[#12100a]/90 px-4 py-3 text-left">
          <Crown className="size-7 text-[#E3B341]" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-black text-[#F5D26B]">Serie A</p>
            <p className="text-[11px] text-[#C9D1D9]">
              Le squadre più forti. I campioni delle leghe personalizzate vengono promossi qui. · ogni {d.serie_a.interval_minutes} min
            </p>
          </div>
          {d.serie_a.joined && <span className="text-[10px] font-bold text-[#7EE787]">IN SERIE A</span>}
        </button>
      )}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wider text-[#8B949E] uppercase">Leghe personalizzate</h3>
        <Button size="sm" onClick={() => (clubId ? setForm(!form) : onNeedClub())}>
          <Plus /> Crea lega
        </Button>
      </div>
      {form && (
        <div className={cn("mb-3 rounded-xl p-3", PANEL)}>
          <Input value={name} maxLength={28} onChange={(e) => setName(e.target.value)} placeholder="Nome della lega" />
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-[#8B949E]">Squadre</span>
            <input type="range" min={cfg?.min_teams ?? 2} max={cfg?.max_teams ?? 24} value={n} onChange={(e) => setSize(Number(e.target.value))} className="flex-1" />
            <b className="w-6 text-right tabular-nums">{n}</b>
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs">
            <input type="checkbox" checked={priv} onChange={(e) => setPriv(e.target.checked)} /> Privata (solo con codice invito)
          </label>
          <p className="mt-2 text-[11px] text-[#8B949E]">Le squadre libere vengono riempite con bot. Una partita ogni {cfg?.interval_minutes ?? "?"} minuti, giocate in automatico.</p>
          <Button className="mt-2 w-full" disabled={name.trim().length < 3 || act.createLeague.isPending} onClick={() => act.createLeague.mutate({ name: name.trim(), size: n, private: priv }, { onSuccess: (l) => (setForm(false), setName(""), setOpen(l.id)) })}>
            Crea
          </Button>
        </div>
      )}
      <ul className="flex flex-col gap-1.5">
        {d?.leagues.length === 0 && <li className="rounded-lg border border-dashed border-[#30363D] bg-[#0D1117]/70 px-4 py-6 text-center text-sm text-[#8B949E]">Nessuna lega: creane una e invita gli amici.</li>}
        {d?.leagues.map((l) => (
          <LeagueRow key={l.id} l={l} onOpen={() => setOpen(l.id)} />
        ))}
      </ul>
    </div>
  );
}
