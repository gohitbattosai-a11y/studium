import { useEffect, useRef, useState, type ReactNode } from "react";
import { Minus, Plus, RotateCcw, Volume2 } from "lucide-react";
import { sfx } from "@/lib/sfx";
import type { ObsFragment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { arr, gearPath, lcg, neighbors, starPath } from "./art";
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
          <span className="text-xs tracking-widest text-[#efe6cf]/60 uppercase">risolto</span>
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

function Sky({ bright, faint, seed }: { bright: number; faint: number; seed: number }) {
  const r = lcg(seed * 977 + bright * 31 + faint * 7);
  const taken: [number, number][] = [];
  const spot = () => {
    for (let n = 0; n < 60; n++) {
      const p: [number, number] = [10 + r() * 100, 9 + r() * 62];
      if (taken.every(([x, y]) => Math.hypot(x - p[0], y - p[1]) > 15)) {
        taken.push(p);
        return p;
      }
    }
    const p: [number, number] = [10 + r() * 100, 9 + r() * 62];
    taken.push(p);
    return p;
  };
  const big = Array.from({ length: bright }, spot);
  const small = Array.from({ length: faint }, spot);
  return (
    <svg viewBox="0 0 120 80" className="w-full rounded-lg border border-[#d9a441]/40 bg-[#070a1e]" aria-hidden>
      {small.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.1" fill="#9db4ff" opacity="0.55" className="ob-twinkle" style={{ animationDelay: `-${i}s` }} />
      ))}
      {big.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="5" fill="#ffd36b" opacity="0.2" />
          <path d={starPath(4.2)} fill="#ffe9a8" />
        </g>
      ))}
    </svg>
  );
}

export function Stelle({ params, busy, submit }: PuzzleProps) {
  const panels = arr<[number, number]>(params?.panels);
  const [vals, setVals] = useState<number[]>([0, 0, 0]);
  return (
    <div className="space-y-3">
      {panels.map(([b, f], i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="mx-auto min-w-0 max-w-[200px] flex-1">
            <Sky bright={b} faint={f} seed={i + 1} />
          </div>
          <Stepper label={`Cielo ${i + 1}`} value={vals[i] ?? 0} onChange={(v) => setVals((s) => s.map((x, j) => (j === i ? v : x)))} />
        </div>
      ))}
      <div className="flex justify-center">
        <button type="button" className="ob-btn" disabled={busy} onClick={() => submit(vals.map(String))} data-testid="obs-submit-stelle">
          Incidi
        </button>
      </div>
    </div>
  );
}

export function Lanterne({ params, busy, fails, submit }: PuzzleProps) {
  const start = arr<boolean>(params?.board);
  const [board, setBoard] = useState<boolean[]>(start);
  const [pressed, setPressed] = useState<number[]>([]);
  const sent = useRef(false);
  useEffect(() => {
    sent.current = false;
  }, [fails]);
  const press = (cell: number) => {
    if (busy) return;
    sfx("toggleOn");
    const next = board.slice();
    neighbors(cell).forEach((c) => (next[c] = !next[c]));
    const marks = pressed.includes(cell) ? pressed.filter((c) => c !== cell) : [...pressed, cell];
    setBoard(next);
    setPressed(marks);
    if (!next.some(Boolean) && marks.length && !sent.current) {
      sent.current = true;
      submit(marks.map(String));
    }
  };
  const reset = () => {
    setBoard(start);
    setPressed([]);
    sent.current = false;
  };
  return (
    <div className="space-y-3">
      <div className="mx-auto grid w-fit grid-cols-3 gap-2.5">
        {board.map((on, i) => (
          <button
            key={i}
            type="button"
            onClick={() => press(i)}
            aria-label={`Lanterna ${i + 1}`}
            aria-pressed={on}
            data-testid={`obs-lamp-${i}`}
            className="ob-lamp grid size-16 place-items-center rounded-xl border border-[#d9a441]/50 bg-[#0b0a10] sm:size-[4.5rem]"
            style={{ filter: on ? "drop-shadow(0 0 14px rgba(255,190,80,0.85))" : "none" }}
          >
            <svg viewBox="0 0 40 40" className="size-10">
              <path d="M12 8 H28 L31 18 Q31 30 20 33 Q9 30 9 18Z" fill={on ? "#ffc65a" : "#1d1a26"} stroke="#d9a441" strokeWidth="1.5" />
              <path d="M15 5 H25" stroke="#d9a441" strokeWidth="2.5" strokeLinecap="round" />
              {on && <ellipse cx="20" cy="21" rx="4" ry="7" fill="#fff3c4" className="ob-flame" />}
            </svg>
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

export function Registro({ busy, submit }: PuzzleProps) {
  const [vals, setVals] = useState(["", "", ""]);
  const lines = ["I compagni che dormono dentro le casse", "I gradi che li dividono per rarità", "Il prezzo dello scrigno dorato"];
  const ready = vals.every((v) => v.trim());
  const go = () => ready && !busy && submit(vals.map((v) => v.trim()));
  return (
    <div className="space-y-3">
      {lines.map((t, i) => (
        <label key={t} className="block">
          <span className="mb-1 block text-center text-sm text-[#efe6cf]/85 italic">{t}</span>
          <input
            className="ob-input !tracking-[0.2em]"
            inputMode="numeric"
            maxLength={4}
            value={vals[i]}
            onChange={(e) => setVals((s) => s.map((x, j) => (j === i ? e.target.value.replace(/\D/g, "") : x)))}
            onKeyDown={(e) => e.key === "Enter" && go()}
            data-testid={`obs-registro-${i}`}
          />
        </label>
      ))}
      <div className="flex justify-center">
        <button type="button" className="ob-btn" disabled={!ready || busy} onClick={go}>
          Registra
        </button>
      </div>
    </div>
  );
}

const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function Cifrario({ params, busy, submit }: PuzzleProps) {
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
      <details className="rounded-lg border border-[#d9a441]/30 bg-black/30 p-2">
        <summary className="cursor-pointer text-center text-xs tracking-widest text-[#f6d98a] uppercase select-none">Tavola</summary>
        <div className="mt-2 max-h-56 overflow-auto">
          <table className="mx-auto border-collapse font-mono text-[10px] text-[#efe6cf]/85">
            <thead>
              <tr>
                <th className="sticky top-0 bg-[#15110a] px-1" />
                {A.split("").map((c) => (
                  <th key={c} className="sticky top-0 bg-[#15110a] px-[3px] text-[#f6d98a]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {A.split("").map((r, ri) => (
                <tr key={r}>
                  <th className="sticky left-0 bg-[#15110a] px-1 text-[#f6d98a]">{r}</th>
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
        data-testid="obs-cifrario-input"
      />
      <div className="flex justify-center">
        <button type="button" className="ob-btn" disabled={word.length < 2 || busy} onClick={go}>
          Decifra
        </button>
      </div>
    </div>
  );
}

const MOD = 6;
const CX = [52, 148, 244, 340];

export function Ingranaggi({ params, busy, fails, submit }: PuzzleProps) {
  const initial = arr<number>(params?.state);
  const base = initial.map((p) => p * 60);
  const [ang, setAng] = useState<number[]>(base);
  const [counts, setCounts] = useState<number[]>(initial.map(() => 0));
  const sent = useRef(false);
  useEffect(() => {
    sent.current = false;
  }, [fails]);
  const pos = ang.map((a) => (((a / 60) % MOD) + MOD) % MOD);
  const turn = (i: number) => {
    if (busy) return;
    sfx("flip");
    const next = ang.slice();
    next[i] += 60;
    next[(i + 1) % next.length] += 120;
    const nc = counts.map((c, j) => (j === i ? (c + 1) % MOD : c));
    setAng(next);
    setCounts(nc);
    const done = next.every((a) => Math.round(a / 60) % MOD === 0);
    if (done && !sent.current) {
      sent.current = true;
      submit(nc.map(String));
    }
  };
  const reset = () => {
    setAng(base);
    setCounts(initial.map(() => 0));
    sent.current = false;
  };
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 392 150" className="mx-auto w-full max-w-md select-none" role="group" aria-label="Ingranaggi">
        <path d="M52 132 Q196 160 340 132" stroke="#d9a441" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
        {CX.map((x, i) => (
          <g key={i}>
            <path d={`M${x - 6} 14 L${x + 6} 14 L${x} 26Z`} fill="#f6d98a" />
            <g
              role="button"
              tabIndex={0}
              aria-label={`Ingranaggio ${i + 1}`}
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
              <g transform={`translate(${x} 78)`}>
                <g className="ob-gear" style={{ transform: `rotate(${ang[i] ?? 0}deg)` }}>
                  <path d={gearPath(36, 12, 9)} fill={pos[i] === 0 ? "#b9822c" : "#6e4a1a"} stroke="#f6d98a" strokeWidth="1.5" />
                  <circle r="24" fill="#150f06" stroke="#d9a441" strokeWidth="1" />
                  <path d="M-5 -34 L5 -34 L0 -20Z" fill="#fff3c4" />
                  <circle r="5" fill="#f6d98a" />
                </g>
              </g>
            </g>
          </g>
        ))}
      </svg>
      <div className="flex justify-center">
        <button type="button" className="ob-btn ob-btn-ghost" onClick={reset}>
          <RotateCcw className="mr-1 inline size-3.5" /> Reimposta
        </button>
      </div>
    </div>
  );
}

export function Successione({ params, busy, submit }: PuzzleProps) {
  const terms = arr<number>(params?.terms);
  const [val, setVal] = useState("");
  const go = () => val && !busy && submit([val]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {terms.map((t, i) => (
          <span key={i} className="ob-plate !min-w-[2.8rem]">
            {t}
          </span>
        ))}
        <span className="ob-plate ob-plate-dim !min-w-[2.8rem]">?</span>
      </div>
      <input
        className="ob-input !tracking-[0.25em]"
        inputMode="numeric"
        maxLength={5}
        value={val}
        onChange={(e) => setVal(e.target.value.replace(/\D/g, ""))}
        onKeyDown={(e) => e.key === "Enter" && go()}
        data-testid="obs-successione-input"
      />
      <div className="flex justify-center">
        <button type="button" className="ob-btn" disabled={!val || busy} onClick={go}>
          Gira la lancetta
        </button>
      </div>
    </div>
  );
}

const ORB_COLORS = ["#ff6b6b", "#ffd36b", "#5be3a0", "#5bb8ff", "#c58bff"];
const ORB_POS = ORB_COLORS.map((_, i) => {
  const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
  return [100 + Math.cos(a) * 62, 90 + Math.sin(a) * 62] as const;
});
const STEP = 760;
const ON = 480;

export function Eco({ params, busy, fails, submit }: PuzzleProps) {
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
      timers.push(window.setTimeout(() => {
        setLit(id);
        sfx("pop");
      }, 800 + i * STEP));
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
      <svg viewBox="0 0 200 170" className="mx-auto w-full max-w-[16rem] select-none" role="group" aria-label="Sfere">
        <circle cx="100" cy="90" r="62" fill="none" stroke="#d9a441" strokeOpacity="0.25" strokeDasharray="3 5" />
        {ORB_COLORS.map((c, i) => {
          const id = `orb-${i}`;
          const [x, y] = ORB_POS[i];
          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-label={`Sfera ${i + 1}`}
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
              <circle cx={x} cy={y} r="19" fill={c} fillOpacity="0.28" stroke={c} strokeWidth="2" className={cn("ob-orb", lit === id && "ob-orb-lit")} />
              <circle cx={x} cy={y} r="7" fill={c} className={cn("ob-orb", lit === id && "ob-orb-lit")} />
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-1.5" aria-hidden>
        {seq.map((_, i) => (
          <span key={i} className={cn("size-2 rotate-45", i < taps.length ? "bg-[#f6d98a]" : "border border-[#d9a441]/60")} />
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

export function Meridiana({ busy, fails, submit, fragments }: PuzzleProps) {
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
      <div className="flex min-h-12 flex-wrap justify-center gap-2 border-t border-[#d9a441]/25 pt-3">
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
  stelle: { Comp: Stelle, hint: "Conta soltanto ciò che arde." },
  lanterne: { Comp: Lanterne, hint: "Ogni fiamma sveglia le vicine. Lascia il buio." },
  registro: { Comp: Registro, hint: "Il sito conosce ogni risposta. Basta cercarla." },
  cifrario: { Comp: Cifrario, hint: "Le lettere dell'Atrio, da sinistra a destra." },
  ingranaggi: { Comp: Ingranaggi, hint: "Allinea ogni freccia verso l'alto." },
  successione: { Comp: Successione, hint: "Il quadrante si è fermato. Cosa segna ora?" },
  eco: { Comp: Eco, hint: "Ascolta, poi rispondi nello stesso ordine." },
  meridiana: { Comp: Meridiana, hint: "Dodici case, un solo anello. Rimetti il cielo al suo posto." },
};
