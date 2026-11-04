import { useEffect, useRef, useState, type ReactNode } from "react";
import { Minus, Plus, RotateCcw, Volume2 } from "lucide-react";
import { sfx } from "@/lib/sfx";
import type { ObsFragment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { arr, gearPath } from "./art";
import "./obs.css";

export interface PuzzleProps {
  params: Record<string, unknown> | null;
  busy: boolean;
  fails: number;
  submit: (taps: string[]) => void;
  fragments: ObsFragment[];
}

export function Win({ title, hint, fails, done, letter, children }: { title: string; hint?: string; fails: number; done?: boolean; letter?: string | null; children?: ReactNode }) {
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (!fails) return;
    setShake(true);
    const t = window.setTimeout(() => setShake(false), 480);
    return () => window.clearTimeout(t);
  }, [fails]);
  return (
    <section className={cn("ob-win", done && "ob-win-done", shake && "ob-shake")} data-testid={`obs-puzzle-${title}`}>
      <h3 className="ob-title">{title}</h3>
      {hint && !done && <p className="ob-engrave">{hint}</p>}
      {done ? (
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="text-xs tracking-widest text-[#d7f3ee]/60 uppercase">risolto</span>
          {letter && <span className="ob-plate">{letter}</span>}
        </div>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </section>
  );
}

function Stepper({ value, onChange, min = 0, max = 9, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={label}>
      <button type="button" className="ob-btn ob-btn-ghost !px-2.5 !py-2" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Meno">
        <Minus className="size-3.5" />
      </button>
      <span className="ob-plate !min-w-[2.6rem]">{value}</span>
      <button type="button" className="ob-btn ob-btn-ghost !px-2.5 !py-2" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Più">
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

interface Ring {
  p: number;
  a: number;
  s: number;
}

const RING_R = [34, 56, 78];
const RING_COLORS = ["#5eead4", "#fb923c", "#f472b6"];

export function Maree({ params, busy, submit }: PuzzleProps) {
  const rings = arr<Ring>(params?.rings);
  const span = typeof params?.span === "number" ? params.span : 100;
  const [day, setDay] = useState(0);
  const at = (r: Ring) => (r.a + r.s * day) % r.p;
  const aligned = rings.length > 0 && rings.every((r) => at(r) === 0);
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-[17rem] select-none" role="img" aria-label="Vortici">
        <defs>
          <radialGradient id="ob-mr-bg" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#0b3b4a" />
            <stop offset="1" stopColor="#03121b" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="96" fill="url(#ob-mr-bg)" stroke="#2dd4bf" strokeOpacity="0.5" />
        <path d="M100 4 V100" stroke="#fef08a" strokeOpacity={aligned ? 0.95 : 0.35} strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M94 6 L106 6 L100 16Z" fill={aligned ? "#fef08a" : "#7ff3e6"} />
        {rings.map((r, i) => {
          const R = RING_R[i] ?? 34;
          const pos = at(r);
          const ang = (pos / r.p) * Math.PI * 2 - Math.PI / 2;
          return (
            <g key={i}>
              <circle cx="100" cy="100" r={R} fill="none" stroke={RING_COLORS[i]} strokeOpacity="0.35" strokeWidth="1.2" />
              {Array.from({ length: r.p }, (_, k) => {
                const a = (k / r.p) * Math.PI * 2 - Math.PI / 2;
                return <circle key={k} cx={100 + Math.cos(a) * R} cy={100 + Math.sin(a) * R} r={k === 0 ? 2.6 : 1.5} fill={k === 0 ? "#fef08a" : RING_COLORS[i]} fillOpacity={k === 0 ? 1 : 0.6} />;
              })}
              <g className="ob-buoy" style={{ transform: `translate(${100 + Math.cos(ang) * R}px, ${100 + Math.sin(ang) * R}px)` }}>
                <circle r="6.5" fill={RING_COLORS[i]} fillOpacity="0.25" />
                <circle r="4" fill={RING_COLORS[i]} stroke="#02080f" strokeWidth="1" />
                <circle r="1.4" cx="-1" cy="-1.2" fill="#fff" fillOpacity="0.85" />
              </g>
            </g>
          );
        })}
        <circle cx="100" cy="100" r="9" fill="#02080f" stroke="#7ff3e6" strokeOpacity="0.6" />
        <text x="100" y="103" textAnchor="middle" fontSize="9" fill="#7ff3e6" fontFamily="ui-monospace, monospace">
          {day}
        </text>
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-[#d7f3ee]/75">
        {rings.map((r, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="size-2 rounded-full" style={{ background: RING_COLORS[i] }} /> {r.p} boe, {r.s} per giorno
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="ob-btn ob-btn-ghost !px-2.5 !py-2" onClick={() => setDay((d) => Math.max(0, d - 1))} aria-label="Giorno prima">
          <Minus className="size-3.5" />
        </button>
        <input type="range" min={0} max={span} value={day} onChange={(e) => setDay(Number(e.target.value))} className="ob-range min-w-0 flex-1" aria-label="Giorno" />
        <button type="button" className="ob-btn ob-btn-ghost !px-2.5 !py-2" onClick={() => setDay((d) => Math.min(span, d + 1))} aria-label="Giorno dopo">
          <Plus className="size-3.5" />
        </button>
      </div>
      <div className="flex justify-center">
        <button type="button" className="ob-btn" disabled={busy || day < 1} onClick={() => submit([String(day)])} data-testid="obs-submit-maree">
          Segna il giorno
        </button>
      </div>
    </div>
  );
}

const GRID = 5;

const around = (cell: number) => {
  const r = Math.floor(cell / GRID);
  const c = cell % GRID;
  const out = [cell];
  if (r > 0) out.push(cell - GRID);
  if (r < GRID - 1) out.push(cell + GRID);
  if (c > 0) out.push(cell - 1);
  if (c < GRID - 1) out.push(cell + 1);
  return out;
};

export function Fanali({ params, busy, fails, submit }: PuzzleProps) {
  const start = arr<boolean>(params?.board);
  const [board, setBoard] = useState<boolean[]>(start);
  const [marks, setMarks] = useState<boolean[]>(() => start.map(() => false));
  const sent = useRef(false);
  useEffect(() => {
    sent.current = false;
  }, [fails]);
  const press = (cell: number) => {
    if (busy) return;
    sfx("toggleOn");
    const next = board.slice();
    around(cell).forEach((c) => (next[c] = !next[c]));
    const m = marks.slice();
    m[cell] = !m[cell];
    setBoard(next);
    setMarks(m);
    if (!next.some(Boolean) && m.some(Boolean) && !sent.current) {
      sent.current = true;
      submit([m.map((x) => (x ? "1" : "0")).join("")]);
    }
  };
  const reset = () => {
    setBoard(start);
    setMarks(start.map(() => false));
    sent.current = false;
  };
  return (
    <div className="space-y-3">
      <div className="mx-auto grid w-fit grid-cols-5 gap-2">
        {board.map((on, i) => (
          <button
            key={i}
            type="button"
            onClick={() => press(i)}
            aria-label={`Fanale ${i + 1}`}
            aria-pressed={on}
            data-testid={`obs-lamp-${i}`}
            className={cn("ob-lamp relative grid size-11 place-items-center rounded-xl border bg-[#041520] sm:size-[3.2rem]", on ? "border-[#f9a8d4]/70" : "border-[#2dd4bf]/30")}
            style={{ filter: on ? "drop-shadow(0 0 12px rgba(244,114,182,0.8))" : "none" }}
          >
            <svg viewBox="0 0 40 40" className="size-8">
              <path d="M8 22 C8 10 14 6 20 6 C26 6 32 10 32 22Z" fill={on ? "#f9a8d4" : "#0c2a38"} stroke={on ? "#fde7f3" : "#2dd4bf"} strokeOpacity={on ? 0.9 : 0.5} strokeWidth="1.3" />
              <path d="M12 22 Q11 29 14 34 M18 22 Q17 30 19 36 M24 22 Q25 30 23 36 M29 22 Q29 29 27 34" fill="none" stroke={on ? "#f9a8d4" : "#2dd4bf"} strokeOpacity={on ? 0.9 : 0.35} strokeWidth="1.3" strokeLinecap="round" className={on ? "ob-sway" : undefined} />
              {on && <ellipse cx="20" cy="14" rx="5" ry="4" fill="#fff" fillOpacity="0.75" className="ob-pulse" />}
            </svg>
            {marks[i] && <span className="absolute right-1 bottom-1 size-1.5 rounded-full bg-[#fef08a]" />}
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button type="button" className="ob-btn ob-btn-ghost" onClick={reset}>
          <RotateCcw className="mr-1 inline size-3.5" /> Reimposta
        </button>
      </div>
    </div>
  );
}

export function Giornale({ busy, submit }: PuzzleProps) {
  const [vals, setVals] = useState(["", "", "", ""]);
  const lines = ["Quante creature dormono dentro le casse?", "Quanti gradi di rarità le dividono?", "Quanto costa lo scrigno dorato?", "Quanto costano le due casse insieme?"];
  const ready = vals.every((v) => v.trim());
  const go = () => ready && !busy && submit(vals.map((v) => v.trim()));
  return (
    <div className="space-y-3">
      {lines.map((t, i) => (
        <label key={t} className="block">
          <span className="mb-1 block text-center text-sm text-[#d7f3ee]/85 italic">{t}</span>
          <input
            className="ob-input !tracking-[0.2em]"
            inputMode="numeric"
            maxLength={5}
            value={vals[i]}
            onChange={(e) => setVals((s) => s.map((x, j) => (j === i ? e.target.value.replace(/\D/g, "") : x)))}
            onKeyDown={(e) => e.key === "Enter" && go()}
            data-testid={`obs-giornale-${i}`}
          />
        </label>
      ))}
      <div className="flex justify-center">
        <button type="button" className="ob-btn" disabled={!ready || busy} onClick={go}>
          Annota
        </button>
      </div>
    </div>
  );
}

const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function Segnali({ params, busy, submit }: PuzzleProps) {
  const cipher = typeof params?.cipher === "string" ? params.cipher : "";
  const [word, setWord] = useState("");
  const go = () => word.length > 1 && !busy && submit([word]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-center gap-1.5">
        {cipher.split("").map((c, i) => (
          <span key={i} className="ob-plate !min-w-[1.9rem] !px-1">
            {c}
          </span>
        ))}
      </div>
      <details className="rounded-lg border border-[#2dd4bf]/30 bg-black/30 p-2">
        <summary className="cursor-pointer text-center text-xs tracking-widest text-[#7ff3e6] uppercase select-none">Tavola</summary>
        <div className="mt-2 max-h-56 overflow-auto">
          <table className="mx-auto border-collapse font-mono text-[10px] text-[#d7f3ee]/85">
            <thead>
              <tr>
                <th className="sticky top-0 bg-[#06151e] px-1" />
                {A.split("").map((c) => (
                  <th key={c} className="sticky top-0 bg-[#06151e] px-[3px] text-[#7ff3e6]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {A.split("").map((r, ri) => (
                <tr key={r}>
                  <th className="sticky left-0 bg-[#06151e] px-1 text-[#7ff3e6]">{r}</th>
                  {A.split("").map((_, ci) => (
                    <td key={ci} className="px-[3px] text-center">
                      {A[(ri + ci) % 26]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <input
        className="ob-input"
        value={word}
        maxLength={20}
        onChange={(e) => setWord(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && go()}
        placeholder="· · · · ·"
        autoCapitalize="characters"
        autoComplete="off"
        data-testid="obs-segnali-input"
      />
      <div className="flex justify-center">
        <button type="button" className="ob-btn" disabled={word.length < 2 || busy} onClick={go}>
          Decifra
        </button>
      </div>
    </div>
  );
}

const MOD = 5;
const GEAR_POS = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
  return [180 + Math.cos(a) * 92, 118 + Math.sin(a) * 82] as const;
});

export function Turbine({ params, busy, fails, submit }: PuzzleProps) {
  const initial = arr<number>(params?.state);
  const [state, setState] = useState<number[]>(initial);
  const [ang, setAng] = useState<number[]>(initial.map((p) => p * 72));
  const [counts, setCounts] = useState<number[]>(initial.map(() => 0));
  const sent = useRef(false);
  useEffect(() => {
    sent.current = false;
  }, [fails]);
  const turn = (i: number) => {
    if (busy) return;
    sfx("flip");
    const n = state.length;
    const ns = state.slice();
    const na = ang.slice();
    ns[i] = (ns[i] + 1) % MOD;
    na[i] += 72;
    const j = (i + 1) % n;
    ns[j] = (ns[j] + 2) % MOD;
    na[j] += 144;
    const nc = counts.map((c, k) => (k === i ? (c + 1) % MOD : c));
    setState(ns);
    setAng(na);
    setCounts(nc);
    if (ns.every((v) => v === 0) && !sent.current) {
      sent.current = true;
      submit(nc.map(String));
    }
  };
  const reset = () => {
    setState(initial);
    setAng(initial.map((p) => p * 72));
    setCounts(initial.map(() => 0));
    sent.current = false;
  };
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 236" className="mx-auto w-full max-w-md select-none" role="group" aria-label="Turbine">
        <circle cx="180" cy="118" r="62" fill="none" stroke="#2dd4bf" strokeOpacity="0.25" strokeDasharray="3 5" />
        {state.map((_, i) => {
          const [x, y] = GEAR_POS[i];
          const [x2, y2] = GEAR_POS[(i + 1) % state.length];
          return <path key={`l${i}`} d={`M${x} ${y} L${x2} ${y2}`} stroke="#5eead4" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" />;
        })}
        {state.map((v, i) => {
          const [x, y] = GEAR_POS[i];
          return (
            <g
              key={i}
              role="button"
              tabIndex={0}
              aria-label={`Turbina ${i + 1}`}
              className="ob-hit"
              data-testid={`obs-gear-${i}`}
              onClick={() => turn(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  turn(i);
                }
              }}
            >
              <g transform={`translate(${x} ${y})`}>
                <g className="ob-gear" style={{ transform: `rotate(${ang[i] ?? 0}deg)` }}>
                  <path d={gearPath(25, 10, 7)} fill={v === 0 ? "#0f766e" : "#164e63"} stroke={v === 0 ? "#7ff3e6" : "#38bdf8"} strokeOpacity="0.9" strokeWidth="1.5" />
                  <circle r="16" fill="#031018" stroke="#2dd4bf" strokeOpacity="0.7" />
                  <path d="M-4 -24 L4 -24 L0 -12Z" fill="#fef08a" />
                  <circle r="4" fill="#7ff3e6" />
                </g>
              </g>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-center">
        <button type="button" className="ob-btn ob-btn-ghost" onClick={reset}>
          <RotateCcw className="mr-1 inline size-3.5" /> Reimposta
        </button>
      </div>
    </div>
  );
}

export function Manometro({ params, busy, submit }: PuzzleProps) {
  const terms = arr<number>(params?.terms);
  const [vals, setVals] = useState(["", ""]);
  const ready = vals.every(Boolean);
  const go = () => ready && !busy && submit(vals);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {terms.map((t, i) => (
          <span key={i} className="ob-plate !min-w-[2.8rem]">
            {t}
          </span>
        ))}
        <span className="ob-plate ob-plate-dim !min-w-[2.8rem]">?</span>
        <span className="ob-plate ob-plate-dim !min-w-[2.8rem]">?</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {vals.map((v, i) => (
          <input
            key={i}
            className="ob-input !tracking-[0.2em]"
            inputMode="numeric"
            maxLength={6}
            value={v}
            onChange={(e) => setVals((s) => s.map((x, j) => (j === i ? e.target.value.replace(/\D/g, "") : x)))}
            onKeyDown={(e) => e.key === "Enter" && go()}
            data-testid={`obs-manometro-${i}`}
          />
        ))}
      </div>
      <div className="flex justify-center">
        <button type="button" className="ob-btn" disabled={!ready || busy} onClick={go}>
          Leggi la pressione
        </button>
      </div>
    </div>
  );
}

const CELL = 44;
const PAD = 30;

export function Periscopio({ params, busy, submit }: PuzzleProps) {
  const size = typeof params?.size === "number" ? params.size : 7;
  const cells = arr<string>(params?.cells);
  const row = typeof params?.row === "number" ? params.row : 1;
  const [port, setPort] = useState("");
  const [hits, setHits] = useState(0);
  const [pencil, setPencil] = useState<Record<number, boolean>>({});
  const total = size * CELL + PAD * 2;
  const portOk = new RegExp(`^[trbl][1-${size}]$`, "i").test(port);
  const go = () => portOk && !busy && submit([port.toLowerCase(), String(hits)]);
  const labels = Array.from({ length: size }, (_, i) => i);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${total} ${total}`} className="mx-auto w-full max-w-sm select-none" role="group" aria-label="Periscopio">
        <rect x={PAD} y={PAD} width={size * CELL} height={size * CELL} rx="6" fill="#031621" stroke="#2dd4bf" strokeOpacity="0.5" />
        {labels.map((i) => (
          <g key={i} fontSize="9" fill="#7ff3e6" fillOpacity="0.8" fontFamily="ui-monospace, monospace" textAnchor="middle">
            <text x={PAD + i * CELL + CELL / 2} y={PAD - 9}>{`T${i + 1}`}</text>
            <text x={PAD + i * CELL + CELL / 2} y={PAD + size * CELL + 17}>{`B${i + 1}`}</text>
            <text x={PAD - 14} y={PAD + i * CELL + CELL / 2 + 3}>{`L${i + 1}`}</text>
            <text x={PAD + size * CELL + 14} y={PAD + i * CELL + CELL / 2 + 3}>{`R${i + 1}`}</text>
          </g>
        ))}
        {labels.map((i) => (
          <g key={`g${i}`}>
            <path d={`M${PAD + i * CELL} ${PAD} V${PAD + size * CELL}`} stroke="#2dd4bf" strokeOpacity="0.1" />
            <path d={`M${PAD} ${PAD + i * CELL} H${PAD + size * CELL}`} stroke="#2dd4bf" strokeOpacity="0.1" />
          </g>
        ))}
        {cells.map((ch, k) => {
          const r = Math.floor(k / size);
          const c = k % size;
          const x = PAD + c * CELL;
          const y = PAD + r * CELL;
          return (
            <g key={k} className="ob-hit" onClick={() => setPencil((p) => ({ ...p, [k]: !p[k] }))}>
              <rect x={x} y={y} width={CELL} height={CELL} fill={pencil[k] ? "#fef08a" : "transparent"} fillOpacity="0.14" />
              {ch === "/" && (
                <g>
                  <path d={`M${x + 7} ${y + CELL - 7} L${x + CELL - 7} ${y + 7}`} stroke="#0e7490" strokeWidth="7" strokeLinecap="round" />
                  <path d={`M${x + 7} ${y + CELL - 7} L${x + CELL - 7} ${y + 7}`} stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" />
                </g>
              )}
              {ch === "\\" && (
                <g>
                  <path d={`M${x + 7} ${y + 7} L${x + CELL - 7} ${y + CELL - 7}`} stroke="#0e7490" strokeWidth="7" strokeLinecap="round" />
                  <path d={`M${x + 7} ${y + 7} L${x + CELL - 7} ${y + CELL - 7}`} stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" />
                </g>
              )}
              {(ch === "a" || ch === "b") && (
                <g transform={`translate(${x + CELL / 2} ${y + CELL / 2})`}>
                  <circle r="15" fill="#2e1065" stroke="#c084fc" strokeWidth="2" />
                  <g className="ob-spin-fast">
                    <path d="M0 -11 C8 -11 11 -3 5 1 C0 4 -6 0 -3 -4" fill="none" stroke="#f0abfc" strokeWidth="2" strokeLinecap="round" />
                    <path d="M0 11 C-8 11 -11 3 -5 -1 C0 -4 6 0 3 4" fill="none" stroke="#f0abfc" strokeWidth="2" strokeLinecap="round" />
                  </g>
                </g>
              )}
            </g>
          );
        })}
        <g transform={`translate(${PAD - 22} ${PAD + (row - 1) * CELL + CELL / 2})`}>
          <path d="M0 0 H20" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
          <path d="M14 -6 L22 0 L14 6Z" fill="#fef08a" />
          <circle cx="-4" r="5" fill="#fef9c3" className="ob-pulse" />
        </g>
      </svg>
      <p className="text-center text-[11px] text-[#d7f3ee]/60 italic">Tocca una cella per segnarla. Il raggio entra da sinistra.</p>
      <div className="grid grid-cols-2 items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-center text-xs text-[#d7f3ee]/80">Porta d'uscita</span>
          <input
            className="ob-input"
            value={port}
            maxLength={2}
            onChange={(e) => setPort(e.target.value.replace(/[^trblTRBL1-9]/g, "").toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder="R3"
            autoComplete="off"
            data-testid="obs-periscopio-port"
          />
        </label>
        <div className="flex flex-col items-center">
          <span className="mb-1 text-xs text-[#d7f3ee]/80">Specchi colpiti</span>
          <Stepper label="Specchi colpiti" value={hits} onChange={setHits} max={20} />
        </div>
      </div>
      <div className="flex justify-center">
        <button type="button" className="ob-btn" disabled={!portOk || busy} onClick={go}>
          Guarda
        </button>
      </div>
    </div>
  );
}

const PING_COLORS = ["#ff6b6b", "#fb923c", "#4ade80", "#38bdf8", "#c084fc"];
const PING_POS = PING_COLORS.map((_, i) => {
  const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
  return [100 + Math.cos(a) * 60, 84 + Math.sin(a) * 60] as const;
});
const STEP = 760;
const ON = 480;

export function Sonar({ params, busy, fails, submit }: PuzzleProps) {
  const seq = arr<string>(params?.sequence);
  const key = seq.join(",");
  const [lit, setLit] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [replay, setReplay] = useState(0);
  const [taps, setTaps] = useState<string[]>([]);
  useEffect(() => {
    const list = key ? key.split(",") : [];
    const timers: number[] = [];
    setTaps([]);
    setPlaying(true);
    list.forEach((id, i) => {
      timers.push(
        window.setTimeout(() => {
          setLit(id);
          sfx("pop");
        }, 800 + i * STEP),
      );
      timers.push(window.setTimeout(() => setLit(null), 800 + i * STEP + ON));
    });
    timers.push(window.setTimeout(() => setPlaying(false), 800 + list.length * STEP));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      setLit(null);
      setPlaying(false);
    };
  }, [key, replay, fails]);
  const tap = (id: string) => {
    if (playing || busy) return;
    sfx("click");
    setLit(id);
    window.setTimeout(() => setLit(null), 220);
    const next = [...taps, id];
    setTaps(next);
    if (next.length >= seq.length) submit(next);
  };
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 200 168" className="mx-auto w-full max-w-[16rem] select-none" role="group" aria-label="Sonar">
        <circle cx="100" cy="84" r="60" fill="none" stroke="#2dd4bf" strokeOpacity="0.25" strokeDasharray="3 5" />
        <circle cx="100" cy="84" r="34" fill="none" stroke="#2dd4bf" strokeOpacity="0.12" />
        <g className="ob-spin" style={{ transformOrigin: "100px 84px" }}>
          <path d="M100 84 L100 24 A60 60 0 0 1 130 32Z" fill="#5eead4" fillOpacity="0.08" />
        </g>
        {PING_COLORS.map((c, i) => {
          const id = `orb-${i}`;
          const [x, y] = PING_POS[i];
          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-label={`Eco ${i + 1}`}
              className="ob-hit"
              data-testid={`obs-orb-${i}`}
              onClick={() => tap(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  tap(id);
                }
              }}
              style={{ color: c }}
            >
              <circle cx={x} cy={y} r="18" fill={c} fillOpacity="0.22" stroke={c} strokeWidth="2" className={cn("ob-orb", lit === id && "ob-orb-lit")} />
              <circle cx={x} cy={y} r="6.5" fill={c} className={cn("ob-orb", lit === id && "ob-orb-lit")} />
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-1.5" aria-label="Scala dei colori">
        {PING_COLORS.map((c, i) => (
          <span key={c} className="flex items-center gap-1.5 text-[#d7f3ee]/50">
            <span className="size-3 rounded-full" style={{ background: c }} />
            {i < PING_COLORS.length - 1 && <span className="text-[10px]">›</span>}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1.5" aria-hidden>
        {seq.map((_, i) => (
          <span key={i} className={cn("size-2 rotate-45", i < taps.length ? "bg-[#7ff3e6]" : "border border-[#2dd4bf]/60")} />
        ))}
      </div>
      <div className="flex justify-center">
        <button type="button" className="ob-btn ob-btn-ghost" disabled={playing || busy} onClick={() => setReplay((n) => n + 1)}>
          <Volume2 className="mr-1 inline size-3.5" /> Riascolta
        </button>
      </div>
    </div>
  );
}

export function Corallo({ busy, fails, submit, fragments }: PuzzleProps) {
  const [slots, setSlots] = useState<string[]>([]);
  const sent = useRef(false);
  useEffect(() => {
    setSlots([]);
    sent.current = false;
  }, [fails]);
  const letterOf = (id: string) => fragments.find((f) => f.puzzle === id)?.letter ?? "?";
  const free = fragments.filter((f) => !slots.includes(f.puzzle));
  const add = (id: string) => {
    if (busy) return;
    sfx("click");
    const next = [...slots, id];
    setSlots(next);
    if (next.length >= fragments.length && !sent.current) {
      sent.current = true;
      submit(next);
    }
  };
  const drop = (i: number) => {
    if (busy) return;
    setSlots((s) => s.filter((_, j) => j !== i));
    sent.current = false;
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        {fragments.map((_, i) => {
          const id = slots[i];
          return (
            <button key={i} type="button" onClick={() => id && drop(i)} className={cn("ob-plate !h-14 !min-w-[2.8rem] text-xl", !id && "ob-plate-dim")} data-testid={`obs-slot-${i}`} aria-label={`Casella ${i + 1}`}>
              {id ? letterOf(id) : ""}
            </button>
          );
        })}
      </div>
      <div className="flex min-h-12 flex-wrap justify-center gap-2 border-t border-[#2dd4bf]/25 pt-3">
        {free.map((f) => (
          <button key={f.puzzle} type="button" onClick={() => add(f.puzzle)} className="ob-plate !h-11 text-lg" data-testid={`obs-tile-${f.puzzle}`} aria-label={`Lettera ${f.letter}`}>
            {f.letter}
          </button>
        ))}
      </div>
    </div>
  );
}

export const PUZZLE_UI: Record<string, { Comp: (p: PuzzleProps) => ReactNode; hint?: string }> = {
  maree: { Comp: Maree, hint: "Porta tutte le boe sotto la lampada. Il primo giorno in cui succede." },
  fanali: { Comp: Fanali, hint: "Ogni medusa sveglia le vicine. Lascia il buio." },
  giornale: { Comp: Giornale, hint: "Il sito conosce ogni risposta. Basta cercarla." },
  segnali: { Comp: Segnali, hint: "Una chiave di tre lettere. Poi leggi al contrario." },
  turbine: { Comp: Turbine, hint: "Ogni turbina trascina la vicina. Allinea tutte le frecce verso l'alto." },
  manometro: { Comp: Manometro, hint: "La pressione segue una regola. Servono i prossimi due valori." },
  periscopio: { Comp: Periscopio, hint: "Specchi che riflettono, vortici che portano altrove." },
  sonar: { Comp: Sonar, hint: "Ascolta il ritorno, poi rispondi come torna a te." },
  corallo: { Comp: Corallo, hint: "Rimetti le lettere dove il fondale le vuole." },
};
