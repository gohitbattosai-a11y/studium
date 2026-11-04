import { useEffect, useMemo, useState } from "react";
import { FastForward, Pause, Play, X } from "lucide-react";
import { FORMATIONS, lineup, type Fixture, type StadiumState, type Team } from "@/lib/football";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./stadium.css";

const ICON: Record<string, string> = { kickoff: "🟢", goal: "⚽", save: "🧤", post: "💥", off: "💨", yellow: "🟨", half: "⏸", end: "🏁" };
const ATTACK = ["goal", "save", "post", "off"];
const TICKS = 180;

interface Dot {
  x: number;
  y: number;
  depth: number;
  name: string;
  n: number;
}

function base(team: Team, home: boolean): Dot[] {
  const f = FORMATIONS[team.formation];
  return lineup(team).map((s, i) => {
    const depth = (90 - f[i][2]) / 72;
    return { x: home ? 5 + depth * 42 : 95 - depth * 42, y: f[i][1], depth, name: s.player?.name ?? "", n: i + 1 };
  });
}

export default function LiveMatch({ fx, s, onClose }: { fx: Fixture; s: StadiumState; onClose: () => void }) {
  const h = s.teams.find((t) => t.id === fx.home) as Team;
  const a = s.teams.find((t) => t.id === fx.away) as Team;
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(3);
  const [pitch, setPitch] = useState(true);
  const sides = useMemo(() => [base(h, true), base(a, false)], [h, a]);
  const seed = fx.day * 7.31 + fx.log.length;
  const rand = (n: number) => {
    const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  useEffect(() => {
    if (!playing || tick >= TICKS) return;
    const id = window.setInterval(() => setTick((v) => Math.min(TICKS, v + 1)), 480 / speed);
    return () => window.clearInterval(id);
  }, [playing, speed, tick]);

  const minute = Math.min(90, Math.floor(tick / 2));
  const seen = fx.log.filter((e) => e.min <= minute);
  const last = seen[seen.length - 1];
  const hg = fx.events.filter((e) => e.min <= minute && e.teamId === h.id).length;
  const ag = fx.events.filter((e) => e.min <= minute && e.teamId === a.id).length;
  const done = tick >= TICKS;

  const frame = useMemo(() => {
    const attacks = fx.log.filter((e) => ATTACK.includes(e.type));
    const upcoming = attacks.find((e) => e.min * 2 >= tick && e.min * 2 - tick <= 8);
    const just = attacks.find((e) => e.min * 2 + 1 === tick);
    const strike = attacks.find((e) => e.min * 2 === tick);
    const sideOf = (id: string) => (id === h.id ? 0 : 1);
    const byName = (side: number, name: string) => sides[side].findIndex((d) => d.name === name);
    let ball = { x: 50, y: 50 };
    let holder: { side: number; i: number } | null = null;

    if (tick === 0) return { ball, holder, poss: 0 };

    if (strike) {
      const side = sideOf(strike.teamId);
      const gx = side === 0 ? 97 : 3;
      const i = byName(side, strike.player);
      if (strike.type === "goal") ball = { x: gx, y: 50 + (rand(strike.id) - 0.5) * 8 };
      else if (strike.type === "save") ball = { x: side === 0 ? 93 : 7, y: 50 + (rand(strike.id) - 0.5) * 22 };
      else if (strike.type === "post") ball = { x: side === 0 ? 98 : 2, y: rand(strike.id) < 0.5 ? 41 : 59 };
      else ball = { x: side === 0 ? 99 : 1, y: rand(strike.id) < 0.5 ? 30 : 70 };
      return { ball, holder: i >= 0 ? { side, i } : null, poss: side };
    }

    if (just) {
      const side = sideOf(just.teamId);
      if (just.type === "goal") return { ball: { x: 50, y: 50 }, holder: null, poss: 1 - side };
      const def = 1 - side;
      return { ball: { x: def === 0 ? 6 : 94, y: 50 }, holder: { side: def, i: 0 }, poss: def };
    }

    if (upcoming) {
      const side = sideOf(upcoming.teamId);
      const p = Math.min(1, Math.max(0, 1 - (upcoming.min * 2 - tick) / 8));
      const shooter = byName(side, upcoming.player);
      if (p > 0.7 && shooter >= 0) {
        const d = sides[side][shooter];
        return { ball: { x: d.x + (side === 0 ? 1.6 : -1.6), y: d.y }, holder: { side, i: shooter }, poss: side };
      }
      const want = 0.25 + p * 0.65 + (rand(tick * 3) - 0.5) * 0.2;
      let best = 1;
      sides[side].forEach((d, i) => {
        if (i > 0 && Math.abs(d.depth - want) < Math.abs(sides[side][best].depth - want)) best = i;
      });
      const d = sides[side][best];
      return { ball: { x: d.x + (side === 0 ? 1.6 : -1.6), y: d.y }, holder: { side, i: best }, poss: side };
    }

    const poss = rand(Math.floor(tick / 6)) < 0.5 ? 0 : 1;
    const terr = 0.35 + 0.22 * Math.sin(tick / 9 + seed) + (poss === 0 ? 0.05 : -0.05);
    const want = terr + (rand(tick * 5) - 0.5) * 0.4;
    let best = 1;
    sides[poss].forEach((d, i) => {
      if (i > 0 && Math.abs(d.depth - want) < Math.abs(sides[poss][best].depth - want)) best = i;
    });
    const d = sides[poss][best];
    ball = { x: d.x + (poss === 0 ? 1.6 : -1.6), y: d.y };
    return { ball, holder: { side: poss, i: best }, poss };
  }, [tick, fx.log, sides, h.id]);

  const dots = useMemo(() => {
    const press = [0, 1].map((side) => {
      let best = -1;
      let dist = 1e9;
      sides[side].forEach((d, i) => {
        if (i === 0 || (frame.holder && frame.holder.side === side && frame.holder.i === i)) return;
        const dd = Math.hypot(d.x - frame.ball.x, (d.y - frame.ball.y) * 0.6);
        if (dd < dist) {
          dist = dd;
          best = i;
        }
      });
      return best;
    });
    return sides.map((list, side) =>
      list.map((d, i) => {
        if (frame.holder && frame.holder.side === side && frame.holder.i === i) return { x: frame.ball.x - (side === 0 ? 1.6 : -1.6), y: frame.ball.y, hold: true };
        if (i === press[side]) return { x: frame.ball.x + (side === 0 ? -2.8 : 2.8), y: frame.ball.y + (side === 0 ? 2 : -2), hold: false };
        const shift = (frame.ball.x - 50) * (i === 0 ? 0.08 : 0.22) + (frame.poss === side ? (side === 0 ? 3 : -3) : 0) * (i === 0 ? 0 : 1);
        const wob = (rand(tick * 11 + d.n + side * 20) - 0.5) * 2.2;
        return { x: Math.min(97, Math.max(3, d.x + shift + wob)), y: Math.min(94, Math.max(6, d.y + (frame.ball.y - d.y) * 0.08 + wob)), hold: false };
      }),
    );
  }, [frame, sides, tick]);

  const fresh = last && last.type === "goal" && minute - last.min <= 2;
  const holderName = frame.holder ? sides[frame.holder.side][frame.holder.i].name : "";

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
          <p className="mt-0.5 text-[10px] text-[#E3B341] tabular-nums">{done ? "FINE" : `${minute}'`}</p>
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
        <Button size="sm" variant="secondary" onClick={() => (done ? (setTick(0), setPlaying(true)) : setPlaying((v) => !v))}>
          {playing && !done ? <Pause /> : <Play />} {done ? "Rivedi" : playing ? "Pausa" : "Riprendi"}
        </Button>
        {[1, 3, 10].map((v) => (
          <button key={v} type="button" onClick={() => setSpeed(v)} className={cn("rounded-full border px-2.5 py-1 text-xs", speed === v ? "border-[#58A6FF] bg-[#58A6FF]/15 text-white" : "border-[#30363D] text-[#8B949E]")}>
            {v}x
          </button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => setTick(TICKS)}>
          <FastForward /> Fine
        </Button>
        <button type="button" onClick={() => setPitch((v) => !v)} className="ml-auto rounded-full border border-[#30363D] px-2.5 py-1 text-xs text-[#C9D1D9]">
          {pitch ? "Solo cronaca" : "Mostra campo"}
        </button>
      </div>
      {pitch && (
        <div className="px-3">
          <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-[#30363D]" style={{ aspectRatio: "100 / 60", containerType: "inline-size" }}>
            <svg viewBox="0 0 100 60" className="absolute inset-0 size-full" preserveAspectRatio="none" aria-hidden>
              <rect width="100" height="60" fill="#2f9a4a" />
              {Array.from({ length: 10 }, (_, i) => (
                <rect key={i} x={i * 10} width="10" height="60" fill={i % 2 ? "#359f50" : "#2c9246"} />
              ))}
              <g fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.85">
                <rect x="1.5" y="1.5" width="97" height="57" />
                <path d="M50 1.5 V58.5" />
                <ellipse cx="50" cy="30" rx="7" ry="7" />
                <rect x="1.5" y="17" width="12" height="26" />
                <rect x="86.5" y="17" width="12" height="26" />
                <rect x="1.5" y="24" width="4.5" height="12" />
                <rect x="94" y="24" width="4.5" height="12" />
              </g>
            </svg>
            {dots.map((list, side) =>
              list.map((d, i) => (
                <div
                  key={`${side}-${i}`}
                  className="absolute grid place-items-center rounded-full font-bold text-white"
                  style={{
                    left: `${d.x}%`,
                    top: `${d.y}%`,
                    width: "4.6cqw",
                    height: "4.6cqw",
                    fontSize: "2.2cqw",
                    background: side === 0 ? h.color : a.color,
                    border: d.hold ? "0.3cqw solid #E3B341" : "0.25cqw solid #ffffff",
                    textShadow: "0 0 2px #000",
                    transform: "translate(-50%, -50%)",
                    transition: "left 0.42s linear, top 0.42s linear",
                    zIndex: d.hold ? 3 : 2,
                  }}
                >
                  {i + 1}
                </div>
              )),
            )}
            <div
              className="absolute rounded-full bg-white"
              style={{ left: `${frame.ball.x}%`, top: `${frame.ball.y}%`, width: "2.2cqw", height: "2.2cqw", border: "0.25cqw solid #111111", transform: "translate(-50%, -50%)", transition: "left 0.4s ease-out, top 0.4s ease-out", zIndex: 4 }}
            />
            {fresh && last && (
              <div key={last.id} className="lm-pop pointer-events-none absolute inset-0 z-[5] grid place-items-center">
                <div className="rounded-xl bg-black/65 px-5 py-2 text-center">
                  <p className="text-3xl font-black tracking-wider text-[#E3B341]">GOL!</p>
                  <p className="text-xs font-semibold text-white">{last.player}</p>
                </div>
              </div>
            )}
          </div>
          <p className="mx-auto mt-1 h-4 max-w-2xl truncate text-center text-[11px] text-[#8B949E]">{holderName && !done ? `Palla a ${holderName}` : ""}</p>
        </div>
      )}
      <div className="mt-1 min-h-0 flex-1 overflow-y-auto px-3 pb-6">
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
