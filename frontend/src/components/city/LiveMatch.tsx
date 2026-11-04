import { useEffect, useMemo, useState } from "react";
import { FastForward, Pause, Play, X } from "lucide-react";
import { FORMATIONS, lineup, type Fixture, type StadiumState, type Team } from "@/lib/football";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./stadium.css";

const ICON: Record<string, string> = { kickoff: "🟢", goal: "⚽", save: "🧤", post: "💥", off: "💨", yellow: "🟨", half: "⏸", end: "🏁" };

function positions(team: Team, home: boolean) {
  const f = FORMATIONS[team.formation];
  return lineup(team).map((s, i) => {
    const d = (90 - f[i][2]) / 72;
    const x = home ? 4 + d * 42 : 96 - d * 42;
    return { x: (x / 100) * 100, y: (f[i][1] / 100) * 60, n: i + 1, name: s.player?.name ?? "" };
  });
}

export default function LiveMatch({ fx, s, onClose }: { fx: Fixture; s: StadiumState; onClose: () => void }) {
  const h = s.teams.find((t) => t.id === fx.home) as Team;
  const a = s.teams.find((t) => t.id === fx.away) as Team;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(4);
  const [pitch, setPitch] = useState(true);
  const hp = useMemo(() => positions(h, true), [h]);
  const ap = useMemo(() => positions(a, false), [a]);

  useEffect(() => {
    if (!playing || t >= 90) return;
    const id = window.setInterval(() => setT((v) => Math.min(90, v + 1)), 700 / speed);
    return () => window.clearInterval(id);
  }, [playing, speed, t]);

  const seen = fx.log.filter((e) => e.min <= t);
  const last = seen[seen.length - 1];
  const hg = fx.events.filter((e) => e.min <= t && e.teamId === h.id).length;
  const ag = fx.events.filter((e) => e.min <= t && e.teamId === a.id).length;
  const done = t >= 90;

  const ball = useMemo(() => {
    if (!last) return { x: 50, y: 30 };
    const homeAtt = last.teamId === h.id;
    const gx = homeAtt ? 90 : 10;
    const jitter = ((last.id * 37) % 21) - 10;
    if (last.type === "goal") return { x: homeAtt ? 98 : 2, y: 30 };
    if (last.type === "save" || last.type === "post" || last.type === "off") return { x: gx, y: 30 + jitter * 0.9 };
    return { x: 50 + jitter, y: 30 + jitter * 0.6 };
  }, [last, h.id]);

  const fresh = last && last.type === "goal" && t - last.min <= 2;

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-[#05080d]/95 backdrop-blur" data-testid="live-match">
      <div className="flex items-center gap-2 border-b border-[#30363D] px-3 pt-14 pb-2">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
          <span className="truncate text-sm font-semibold">{h.name}</span>
          <span className="size-3 shrink-0 rounded-full" style={{ background: h.color }} />
        </div>
        <div className="shrink-0 rounded-lg bg-[#161B22] px-3 py-1 text-center">
          <p className="text-xl leading-none font-bold tabular-nums">
            {hg} - {ag}
          </p>
          <p className="mt-0.5 text-[10px] text-[#E3B341] tabular-nums">{done ? "FINE" : `${t}'`}</p>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="size-3 shrink-0 rounded-full" style={{ background: a.color }} />
          <span className="truncate text-sm font-semibold">{a.name}</span>
        </div>
        <Button size="icon-lg" variant="ghost" onClick={onClose} aria-label="Chiudi partita">
          <X />
        </Button>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2">
        <Button size="sm" variant="secondary" onClick={() => (done ? (setT(0), setPlaying(true)) : setPlaying((v) => !v))}>
          {playing && !done ? <Pause /> : <Play />} {done ? "Rivedi" : playing ? "Pausa" : "Riprendi"}
        </Button>
        {[1, 4, 12].map((v) => (
          <button key={v} type="button" onClick={() => setSpeed(v)} className={cn("rounded-full border px-2.5 py-1 text-xs", speed === v ? "border-[#58A6FF] bg-[#58A6FF]/15 text-white" : "border-[#30363D] text-[#8B949E]")}>
            {v}x
          </button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => setT(90)}>
          <FastForward /> Fine
        </Button>
        <button type="button" onClick={() => setPitch((v) => !v)} className="ml-auto rounded-full border border-[#30363D] px-2.5 py-1 text-xs text-[#C9D1D9]">
          {pitch ? "Solo cronaca" : "Mostra campo"}
        </button>
      </div>
      {pitch && (
        <div className="px-3">
          <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-[#30363D]" style={{ aspectRatio: "100 / 60" }}>
            <svg viewBox="0 0 100 60" className="absolute inset-0 size-full" preserveAspectRatio="none">
              <rect width="100" height="60" fill="#2f9a4a" />
              {Array.from({ length: 10 }, (_, i) => (
                <rect key={i} x={i * 10} width="10" height="60" fill={i % 2 ? "#359f50" : "#2c9246"} />
              ))}
              <g fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.85">
                <rect x="1.5" y="1.5" width="97" height="57" />
                <path d="M50 1.5 V58.5" />
                <circle cx="50" cy="30" r="7" />
                <rect x="1.5" y="17" width="12" height="26" />
                <rect x="86.5" y="17" width="12" height="26" />
                <rect x="1.5" y="24" width="4.5" height="12" />
                <rect x="94" y="24" width="4.5" height="12" />
              </g>
              {[hp, ap].map((list, side) =>
                list.map((p) => (
                  <g key={`${side}${p.n}`} transform={`translate(${p.x} ${p.y})`}>
                    <g className="lm-jit" style={{ animationDelay: `${(p.n % 5) * 0.2}s` }}>
                      <circle r="2.1" fill={side === 0 ? h.color : a.color} stroke="#ffffff" strokeWidth="0.4" />
                      <text y="0.8" textAnchor="middle" fontSize="2.2" fontWeight="700" fill="#ffffff">
                        {p.n}
                      </text>
                    </g>
                  </g>
                )),
              )}
              <g style={{ transform: `translate(${ball.x}px, ${ball.y}px)`, transition: "transform 0.7s ease-in-out" }}>
                <circle r="1.3" fill="#ffffff" stroke="#111111" strokeWidth="0.3" />
              </g>
            </svg>
            {fresh && last && (
              <div key={last.id} className="lm-pop pointer-events-none absolute inset-0 grid place-items-center">
                <div className="rounded-xl bg-black/65 px-5 py-2 text-center">
                  <p className="text-3xl font-black tracking-wider text-[#E3B341]">GOL!</p>
                  <p className="text-xs font-semibold">
                    {last.player}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-2 min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        <ul className="mx-auto flex max-w-2xl flex-col gap-1">
          {[...seen].reverse().map((e) => {
            const team = e.teamId === h.id ? h : a;
            return (
              <li key={e.id} className={cn("flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-sm", e.type === "goal" ? "border-[#E3B341]/60 bg-[#2a2210] font-semibold" : "border-[#30363D] bg-[#0D1117]/80")}>
                <span className="w-8 shrink-0 text-right text-xs tabular-nums text-[#8B949E]">{e.min}'</span>
                <span className="shrink-0">{ICON[e.type]}</span>
                <span className="min-w-0 flex-1">{e.text}</span>
                {e.player && <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: team.color }} />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
