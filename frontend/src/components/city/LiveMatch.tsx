import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { FastForward, ListOrdered, Pause, Play, X } from "lucide-react";
import type { Fixture, Team } from "@/lib/domain/football";
import { Match } from "@/lib/domain/matchEngine";
import { CFG } from "@/lib/domain/stadiumConfig";
import { stadiumInner } from "@/lib/art/stadiumAssets";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { StadiumBack } from "./Landmarks";
import "./stadium.css";

const ICON: Record<string, string> = { kickoff: "🟢", goal: "⚽", save: "🧤", post: "💥", off: "💨", yellow: "🟨", red: "🟥", injury: "🚑", half: "⏸", end: "🏁" };

const rgb = (hex: string) => {
  const v = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
const clash = (a: string, b: string) => {
  const x = rgb(a);
  const y = rgb(b);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) < CFG.match.clashDistance;
};

interface Snap {
  version: number;
  minute: number;
  phase: string;
  holder: string;
  goalId: number | null;
  hg: number;
  ag: number;
}

const snapOf = (m: Match): Snap => ({
  version: m.version,
  minute: m.minute,
  phase: m.phase,
  holder: m.holderName,
  goalId: m.t - m.goalAt < 3.2 && m.goalItem ? m.goalItem.id : null,
  hg: m.score[0],
  ag: m.score[1],
});

const same = (a: Snap, b: Snap) => a.version === b.version && a.minute === b.minute && a.phase === b.phase && a.holder === b.holder && a.goalId === b.goalId && a.hg === b.hg && a.ag === b.ag;

export default function LiveMatch({ fx, h, a, onClose }: { fx: Fixture; h: Team; a: Team; onClose: () => void }) {
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(CFG.match.defaultSpeed);
  const [started, setStarted] = useState(false);
  const [log, setLog] = useState(false);
  const sim = useMemo(() => new Match(fx, h, a), [fx, h, a, run]);
  const [ui, setUi] = useState<Snap>(() => snapOf(sim));
  const uiRef = useRef(ui);
  const gs = useRef<(SVGGElement | null)[]>([]);
  const us = useRef<(SVGUseElement | null)[]>([]);
  const rings = useRef<(SVGCircleElement | null)[]>([]);
  const ballRef = useRef<SVGUseElement | null>(null);
  const shadowRef = useRef<SVGEllipseElement | null>(null);
  const cardRef = useRef<SVGRectElement | null>(null);
  const awayColor = clash(h.color, a.color) ? CFG.match.awayAlt : a.color;
  const kit = [h.color, awayColor];
  const trim = [clash(h.color, "#ffffff") ? "#111827" : "#ffffff", clash(awayColor, "#ffffff") ? "#111827" : "#ffffff"];
  const defs = useMemo(() => `<g id="lm-token">${stadiumInner("token")}</g><g id="lm-ball">${stadiumInner("ball")}</g>`, []);
  const pitch = useMemo(() => stadiumInner("pitch"), []);

  const paint = () => {
    for (let side = 0; side < 2; side++)
      for (let i = 0; i < 11; i++) {
        const k = side * 11 + i;
        const p = sim.P[side][i];
        gs.current[k]?.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
        us.current[k]?.setAttribute("transform", `rotate(${((p.h * 180) / Math.PI).toFixed(1)})`);
        rings.current[k]?.setAttribute("opacity", sim.owner && sim.owner.s === side && sim.owner.i === i ? "1" : "0");
      }
    const b = sim.ball;
    ballRef.current?.setAttribute("transform", `translate(${b.x.toFixed(2)} ${(b.y - 0.5 - b.z * 0.5).toFixed(2)}) scale(${(1 + b.z * 0.12).toFixed(3)})`);
    shadowRef.current?.setAttribute("transform", `translate(${b.x.toFixed(2)} ${(b.y + 0.4).toFixed(2)}) scale(${(1 + b.z * 0.1).toFixed(3)})`);
    shadowRef.current?.setAttribute("opacity", String(Math.max(0.12, 0.35 - b.z * 0.06)));
    const c = sim.card;
    const r = cardRef.current;
    if (r) {
      if (c && sim.t < c.until) {
        const p = sim.P[c.s][c.i];
        r.setAttribute("x", (p.x + 1.2).toFixed(2));
        r.setAttribute("y", (p.y - 5).toFixed(2));
        r.setAttribute("fill", c.red ? "#ef4444" : "#facc15");
        r.setAttribute("visibility", "visible");
      } else r.setAttribute("visibility", "hidden");
    }
  };

  const sync = () => {
    const next = snapOf(sim);
    if (!same(next, uiRef.current)) {
      uiRef.current = next;
      setUi(next);
    }
  };

  useEffect(() => {
    uiRef.current = snapOf(sim);
    setUi(uiRef.current);
    paint();
  }, [sim]);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playing) sim.advance(dt * speed);
      paint();
      sync();
      if (!sim.ended) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sim, started, playing, speed]);

  const replay = () => {
    setRun((v) => v + 1);
    setPlaying(true);
  };
  const skip = () => {
    sim.finish();
    paint();
    sync();
  };

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

  const done = ui.phase === "end";
  const feed = sim.feed;
  const recent = [...feed].reverse().slice(0, 3);
  const goal = ui.goalId !== null ? feed[ui.goalId] : null;
  const stage = { aspectRatio: "117 / 78", width: "min(100vw, calc(100dvh * 117 / 78))" } as const;
  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-hidden bg-[#05080d] text-[#E6EDF3]" data-testid="live-match">
      <StadiumBack />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative overflow-hidden shadow-2xl" style={stage}>
          <svg viewBox="-6 -5 117 78" className="absolute inset-0 size-full" aria-hidden>
            <defs dangerouslySetInnerHTML={{ __html: defs }} />
            <g dangerouslySetInnerHTML={{ __html: pitch }} />
            {[0, 1].map((side) =>
              Array.from({ length: 11 }, (_, i) => {
                const k = side * 11 + i;
                const col = i === 0 ? CFG.match.gkColors[side] : kit[side];
                return (
                  <g key={k} ref={(el) => void (gs.current[k] = el)}>
                    <circle ref={(el) => void (rings.current[k] = el)} r="2.5" fill="none" stroke="#E3B341" strokeWidth="0.4" opacity="0" />
                    <use ref={(el) => void (us.current[k] = el)} href="#lm-token" style={{ "--shirt": col, "--trim": trim[side] } as CSSProperties} />
                    <text y="0.1" textAnchor="middle" dominantBaseline="central" fontSize="1.9" fontWeight="800" fill="#ffffff" stroke="#000000" strokeWidth="0.3" paintOrder="stroke" fontFamily="Inter,Arial,sans-serif">
                      {i + 1}
                    </text>
                  </g>
                );
              }),
            )}
            <ellipse ref={shadowRef} rx="0.9" ry="0.45" fill="#000000" opacity="0.3" />
            <use ref={ballRef} href="#lm-ball" />
            <rect ref={cardRef} width="1.7" height="2.4" rx="0.25" fill="#facc15" stroke="#1f2937" strokeWidth="0.15" visibility="hidden" />
          </svg>
          {goal && (
            <div key={goal.id} className="lm-pop pointer-events-none absolute inset-0 z-[5] grid place-items-center">
              <div className="rounded-2xl bg-black/70 px-8 py-3 text-center">
                <p className="text-4xl font-black tracking-widest text-[#E3B341] sm:text-6xl">GOL!</p>
                <p className="text-sm font-semibold text-white sm:text-lg">{goal.player}</p>
              </div>
            </div>
          )}
          {ui.phase === "interval" && (
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
            <span className="text-xl font-black tabular-nums sm:text-2xl">{ui.hg}</span>
            <span className="rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-[#E3B341] tabular-nums">{done ? "FINE" : `${ui.minute}'`}</span>
            <span className="text-xl font-black tabular-nums sm:text-2xl">{ui.ag}</span>
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
            <p className="h-4 text-[11px] text-white/80 drop-shadow">{ui.holder && !done ? `Palla a ${ui.holder}` : ""}</p>
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/15 bg-[#0D1117]/85 px-2.5 py-1.5 backdrop-blur">
              <Button size="sm" variant="secondary" onClick={() => (done ? replay() : setPlaying((v) => !v))}>
                {playing && !done ? <Pause /> : <Play />} {done ? "Rivedi" : playing ? "Pausa" : "Riprendi"}
              </Button>
              {CFG.match.speeds.map((v) => (
                <button key={v} type="button" onClick={() => setSpeed(v)} className={cn("rounded-full border px-2.5 py-1 text-xs", speed === v ? "border-[#58A6FF] bg-[#58A6FF]/20 text-white" : "border-white/20 text-[#C9D1D9]")}>
                  {v}x
                </button>
              ))}
              <Button size="sm" variant="ghost" onClick={skip}>
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
                {[...feed].reverse().map((e) => {
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
                {ui.hg} - {ui.ag}
              </span>
              <span className="min-w-0 flex-1 truncate text-left text-sm font-bold">{a.name}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-[#C9D1D9]">
              <ul className="flex flex-col items-end gap-0.5">
                {sim.scorers(h.id).map((x, i) => (
                  <li key={i}>⚽ {x}</li>
                ))}
              </ul>
              <ul className="flex flex-col items-start gap-0.5">
                {sim.scorers(a.id).map((x, i) => (
                  <li key={i}>⚽ {x}</li>
                ))}
              </ul>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={replay}>
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
