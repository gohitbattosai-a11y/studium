import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FastForward, ListOrdered, Pause, Play, X } from "lucide-react";
import { FORMATIONS, lineup, type Fixture, type StadiumState, type Team } from "@/lib/football";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StadiumBack } from "./Landmarks";
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
  const [started, setStarted] = useState(false);
  const [log, setLog] = useState(false);
  const sides = useMemo(() => [base(h, true), base(a, false)], [h, a]);
  const seed = fx.day * 7.31 + fx.log.length;
  const rand = (n: number) => {
    const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  useEffect(() => {
    if (!started || !playing || tick >= TICKS) return;
    const id = window.setInterval(() => setTick((v) => Math.min(TICKS, v + 1)), 480 / speed);
    return () => window.clearInterval(id);
  }, [started, playing, speed, tick]);

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
  const half = last && last.type === "half" && minute - last.min <= 1 && !done;
  const holderName = frame.holder ? sides[frame.holder.side][frame.holder.i].name : "";
  const recent = [...seen].reverse().slice(0, 3);
  const scorers = (id: string) => fx.events.filter((e) => e.teamId === id).map((e) => `${e.player} ${e.min}'`);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", fn, true);
    return () => window.removeEventListener("keydown", fn, true);
  }, [onClose]);

  const stage = { aspectRatio: "100 / 60", width: "min(100vw, calc(100dvh * 100 / 60))", containerType: "inline-size" } as const;

  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-hidden bg-[#05080d] text-[#E6EDF3]" data-testid="live-match">
      <StadiumBack />
      <div className="absolute inset-0 bg-black/35" />

      <div className="absolute inset-0 grid place-items-center">
        <div className="relative overflow-hidden shadow-2xl" style={stage}>
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
                  width: "3.6cqw",
                  height: "3.6cqw",
                  fontSize: "1.7cqw",
                  background: side === 0 ? h.color : a.color,
                  border: d.hold ? "0.28cqw solid #E3B341" : "0.2cqw solid #ffffff",
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
            style={{ left: `${frame.ball.x}%`, top: `${frame.ball.y}%`, width: "1.8cqw", height: "1.8cqw", border: "0.2cqw solid #111111", transform: "translate(-50%, -50%)", transition: "left 0.4s ease-out, top 0.4s ease-out", zIndex: 4 }}
          />
          {fresh && last && (
            <div key={last.id} className="lm-pop pointer-events-none absolute inset-0 z-[5] grid place-items-center">
              <div className="rounded-2xl bg-black/70 px-8 py-3 text-center">
                <p className="text-4xl font-black tracking-widest text-[#E3B341] sm:text-6xl">GOL!</p>
                <p className="text-sm font-semibold text-white sm:text-lg">{last.player}</p>
              </div>
            </div>
          )}
          {half && (
            <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
              <p className="rounded-xl bg-black/70 px-6 py-2 text-2xl font-black tracking-widest text-white">INTERVALLO</p>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-[#0D1117]/90 shadow-xl backdrop-blur">
          <div className="flex min-w-0 items-center justify-end gap-2 px-3 py-1.5" style={{ borderBottom: `3px solid ${h.color}` }}>
            <span className="max-w-[28vw] truncate text-xs font-bold tracking-wide uppercase sm:max-w-48 sm:text-sm">{h.name}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#161B22] px-3.5">
            <span className="text-xl font-black tabular-nums sm:text-2xl">{hg}</span>
            <span className="rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-[#E3B341] tabular-nums">{done ? "FINE" : `${minute}'`}</span>
            <span className="text-xl font-black tabular-nums sm:text-2xl">{ag}</span>
          </div>
          <div className="flex min-w-0 items-center gap-2 px-3 py-1.5" style={{ borderBottom: `3px solid ${a.color}` }}>
            <span className="max-w-[28vw] truncate text-xs font-bold tracking-wide uppercase sm:max-w-48 sm:text-sm">{a.name}</span>
          </div>
        </div>
      </div>

      <button type="button" onClick={onClose} aria-label="Esci dalla partita" className="absolute top-[max(0.5rem,env(safe-area-inset-top))] right-3 z-20 grid size-10 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur">
        <X className="size-5" />
      </button>

      {started && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {!log && (
              <ul className="pointer-events-auto flex w-full max-w-xl flex-col gap-1">
                {recent.map((e) => (
                  <li key={e.id} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs backdrop-blur sm:text-sm", e.type === "goal" ? "border-[#E3B341]/70 bg-[#2a2210]/90 font-semibold" : "border-white/10 bg-black/60")}>
                    <span className="w-7 shrink-0 text-right tabular-nums text-[#8B949E]">{e.min}'</span>
                    <span>{ICON[e.type]}</span>
                    <span className="min-w-0 flex-1 truncate">{e.text}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="h-4 text-[11px] text-white/80 drop-shadow">{holderName && !done ? `Palla a ${holderName}` : ""}</p>
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/15 bg-[#0D1117]/85 px-2.5 py-1.5 backdrop-blur">
              <Button size="sm" variant="secondary" onClick={() => (done ? (setTick(0), setPlaying(true)) : setPlaying((v) => !v))}>
                {playing && !done ? <Pause /> : <Play />} {done ? "Rivedi" : playing ? "Pausa" : "Riprendi"}
              </Button>
              {[1, 3, 10].map((v) => (
                <button key={v} type="button" onClick={() => setSpeed(v)} className={cn("rounded-full border px-2.5 py-1 text-xs", speed === v ? "border-[#58A6FF] bg-[#58A6FF]/20 text-white" : "border-white/20 text-[#C9D1D9]")}>
                  {v}x
                </button>
              ))}
              <Button size="sm" variant="ghost" onClick={() => setTick(TICKS)}>
                <FastForward /> Fine
              </Button>
              <Button size="sm" variant={log ? "secondary" : "ghost"} onClick={() => setLog((v) => !v)}>
                <ListOrdered /> Cronaca
              </Button>
            </div>
          </div>

          {log && (
            <div className="absolute inset-x-0 top-16 bottom-28 z-10 mx-auto w-full max-w-xl overflow-y-auto px-3">
              <ul className="flex flex-col gap-1">
                {[...seen].reverse().map((e) => {
                  const team = e.teamId === h.id ? h : a;
                  return (
                    <li key={e.id} className={cn("flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-sm backdrop-blur", e.type === "goal" ? "border-[#E3B341]/60 bg-[#2a2210]/90 font-semibold" : "border-white/10 bg-[#0D1117]/90")}>
                      <span className="w-8 shrink-0 text-right text-xs tabular-nums text-[#8B949E]">{e.min}'</span>
                      <span className="shrink-0">{ICON[e.type]}</span>
                      <span className="min-w-0 flex-1">{e.text}</span>
                      {e.player && <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: team.color }} />}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}

      {!started && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md text-center">
            <p className="text-[11px] tracking-[0.3em] text-[#E3B341] uppercase">Giornata {fx.day}</p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="size-16 rounded-full border-4 border-white shadow-lg" style={{ background: h.color }} />
                <span className="max-w-full truncate text-base font-bold">{h.name}</span>
              </div>
              <span className="text-3xl font-black text-[#E3B341]">VS</span>
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="size-16 rounded-full border-4 border-white shadow-lg" style={{ background: a.color }} />
                <span className="max-w-full truncate text-base font-bold">{a.name}</span>
              </div>
            </div>
            <Button size="lg" className="mt-8 h-14 w-full text-lg font-black tracking-widest" onClick={() => setStarted(true)} data-testid="live-kickoff">
              <Play /> CALCIO D'INIZIO
            </Button>
          </div>
        </div>
      )}

      {done && started && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0D1117]/95 p-5 text-center shadow-2xl">
            <p className="text-[11px] tracking-[0.3em] text-[#E3B341] uppercase">Fischio finale</p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="min-w-0 flex-1 truncate text-right text-sm font-bold">{h.name}</span>
              <span className="text-4xl font-black tabular-nums">
                {hg} - {ag}
              </span>
              <span className="min-w-0 flex-1 truncate text-left text-sm font-bold">{a.name}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-[#C9D1D9]">
              <ul className="flex flex-col items-end gap-0.5">
                {scorers(h.id).map((x, i) => (
                  <li key={i}>⚽ {x}</li>
                ))}
              </ul>
              <ul className="flex flex-col items-start gap-0.5">
                {scorers(a.id).map((x, i) => (
                  <li key={i}>⚽ {x}</li>
                ))}
              </ul>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => (setTick(0), setPlaying(true))}>
                Rivedi
              </Button>
              <Button className="h-11 flex-1 font-bold" onClick={onClose}>
                Continua
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
