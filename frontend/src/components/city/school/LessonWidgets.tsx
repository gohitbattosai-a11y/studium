import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Block } from "@/lib/domain/lessons";
import { ALGOS, factorString, factorize, fmt, gcd, run, sup, type AlgoId } from "@/lib/domain/lessonAlgos";
import { cn } from "@/lib/utils/cn";
import { Fill, Mark, Punct, Seq, Sort } from "./ItalianWidgets";

const BTN = "rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40";
const GOLD = "rounded-lg border border-[#E3B341] bg-[#E3B341]/20 px-3 py-1.5 text-sm font-semibold text-[#fff3c4] transition-colors hover:bg-[#E3B341]/35 disabled:cursor-not-allowed disabled:opacity-40";

function Card({ title, hint, children }: { title?: string; hint?: string; children: ReactNode }) {
  return (
    <section className="mt-5 rounded-xl border border-[#E3B341]/40 bg-black/25 p-4">
      <p className="text-xs font-semibold tracking-wider text-[#E3B341] uppercase">⚡ {title ?? "Provalo tu"}</p>
      {hint && <p className="mt-1 text-sm text-[#b8c7bc]">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Num({ value, onChange, min, max, label }: { value: number; onChange: (n: number) => void; min: number; max: number; label?: string }) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText(value < 0 ? `−${Math.abs(value)}` : String(value));
  }, [value]);
  const commit = (s: string) => {
    const n = Number(s.replace("−", "-"));
    if (s.trim() !== "" && Number.isInteger(n) && n >= min && n <= max) onChange(n);
  };
  return (
    <label className="flex flex-col items-center gap-1 text-xs text-[#b8c7bc]">
      {label}
      <input
        value={text}
        inputMode={min < 0 ? "text" : "numeric"}
        onChange={(e) => {
          setText(e.target.value);
          commit(e.target.value);
        }}
        onBlur={() => setText(value < 0 ? `−${Math.abs(value)}` : String(value))}
        className="h-10 w-20 rounded-lg border border-white/25 bg-black/30 px-2 text-center text-base font-semibold text-white outline-none focus:border-[#E3B341]"
      />
    </label>
  );
}

function Slider({ value, onChange, min, max, label }: { value: number; onChange: (n: number) => void; min: number; max: number; label: string }) {
  return (
    <label className="block text-xs text-[#b8c7bc]">
      {label} = <span className="font-semibold text-white">{fmt(value)}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 block w-full accent-[#E3B341]" />
    </label>
  );
}

function Quiz({ b }: { b: Extract<Block, { t: "quiz" }> }) {
  const [pick, setPick] = useState<number | null>(null);
  const ok = pick === b.answer;
  return (
    <section className="mt-5 rounded-xl border border-[#58A6FF]/40 bg-[#58A6FF]/10 p-4">
      <p className="text-xs font-semibold tracking-wider text-[#79C0FF] uppercase">🎯 Quiz</p>
      <p className="mt-1 text-[15px] font-medium text-white">{b.question}</p>
      <div className="mt-3 grid gap-2">
        {b.options.map((o, i) => {
          const chosen = pick === i;
          const right = pick !== null && i === b.answer;
          return (
            <button
              key={i}
              type="button"
              disabled={pick !== null}
              onClick={() => setPick(i)}
              className={cn("rounded-lg border px-3 py-2 text-left text-sm transition-colors", pick === null ? "border-white/20 bg-black/20 text-[#e8efe6] hover:border-[#58A6FF]" : right ? "border-[#7EE787] bg-[#7EE787]/15 text-white" : chosen ? "border-[#FF7B72] bg-[#FF7B72]/15 text-white" : "border-white/10 text-[#8fa196]")}
            >
              {o}
            </button>
          );
        })}
      </div>
      {pick !== null && (
        <div className="mt-3 text-sm">
          <p className={ok ? "font-semibold text-[#7EE787]" : "font-semibold text-[#FF7B72]"}>{ok ? "Esatto! 🎉" : "Non proprio…"}</p>
          <p className="mt-1 text-[#d5e2d8]">{b.why}</p>
          {!ok && (
            <button type="button" className={cn(BTN, "mt-2")} onClick={() => setPick(null)}>
              Riprova
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function Reveal({ b }: { b: Extract<Block, { t: "reveal" }> }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-5 rounded-xl border border-[#BC8CFF]/40 bg-[#BC8CFF]/10 p-4">
      <p className="text-xs font-semibold tracking-wider text-[#d2b3ff] uppercase">🤔 Pensaci un attimo</p>
      <p className="mt-1 text-[15px] font-medium text-white">{b.prompt}</p>
      {open ? (
        <p className="mt-3 rounded-lg bg-black/25 px-3 py-2 text-sm text-[#e8efe6]">{b.answer}</p>
      ) : (
        <button type="button" className={cn(GOLD, "mt-3")} onClick={() => setOpen(true)}>
          Mostra la risposta
        </button>
      )}
    </section>
  );
}

function Steps({ b }: { b: Extract<Block, { t: "steps" }> }) {
  const [n, setN] = useState(1);
  const total = b.items.length;
  return (
    <section className="mt-5">
      {b.title && <p className="mb-2 text-sm font-semibold text-[#fff3c4]">{b.title}</p>}
      <ol className="space-y-2">
        {b.items.slice(0, n).map((it, i) => (
          <li key={i} className="flex gap-3 rounded-lg border border-white/15 bg-black/20 px-3 py-2.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#E3B341] text-xs font-bold text-[#2a1d0f]">{i + 1}</span>
            <div>
              <p className="text-sm font-semibold text-white">{it.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-[#d5e2d8]">{it.text}</p>
            </div>
          </li>
        ))}
      </ol>
      {n < total && (
        <div className="mt-2 flex gap-2">
          <button type="button" className={GOLD} onClick={() => setN(n + 1)}>
            Avanti ({n}/{total})
          </button>
          <button type="button" className={BTN} onClick={() => setN(total)}>
            Mostra tutto
          </button>
        </div>
      )}
    </section>
  );
}

function Flip({ b }: { b: Extract<Block, { t: "flip" }> }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  return (
    <section className="mt-5">
      {b.title && <p className="mb-2 text-sm font-semibold text-[#fff3c4]">{b.title}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {b.cards.map((c, i) => {
          const on = open.has(i);
          return (
            <button key={i} type="button" onClick={() => toggle(i)} className={cn("min-h-[84px] rounded-xl border p-3 text-left transition-colors", on ? "border-[#7EE787]/60 bg-[#7EE787]/10" : "border-[#E3B341]/50 bg-[#E3B341]/10 hover:bg-[#E3B341]/20")}>
              <span className="block text-sm font-semibold text-white">{c.front}</span>
              {on ? <span className="mt-1 block text-sm leading-relaxed text-[#d5e2d8]">{c.back}</span> : <span className="mt-1 block text-xs text-[#b8c7bc]">tocca per girare ↻</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AlgoLab({ cfg, title, hint }: { cfg: Record<string, string | number>; title?: string; hint?: string }) {
  const id = String(cfg.algo) as AlgoId;
  const conf = ALGOS[id];
  const [vals, setVals] = useState<number[]>(() => conf.defaults.map((d, i) => Number(cfg[i === 0 ? "a" : "b"] ?? d)));
  const [step, setStep] = useState(0);
  const tr = useMemo(() => run(id, vals), [id, vals]);
  const last = tr.rows.length - 1;
  const shown = Math.min(step, last);
  const set = (i: number, n: number) => {
    setVals((prev) => prev.map((x, k) => (k === i ? n : x)));
    setStep(0);
  };
  const finished = shown >= last;
  return (
    <Card title={title ?? conf.title} hint={hint}>
      <div className="flex flex-wrap items-end gap-3">
        {conf.labels.map((l, i) => (
          <Num key={l} label={l} value={vals[i]} min={conf.mins[i]} max={conf.maxs[i]} onChange={(n) => set(i, n)} />
        ))}
        <button type="button" className={GOLD} disabled={finished} onClick={() => setStep(shown + 1)}>
          Avanti
        </button>
        <button type="button" className={BTN} disabled={finished} onClick={() => setStep(last)}>
          Fino alla fine
        </button>
        <button type="button" className={BTN} disabled={shown === 0} onClick={() => setStep(0)}>
          Ricomincia
        </button>
      </div>
      <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-white/15">
        <table className="w-full text-center font-mono text-sm">
          <thead className="sticky top-0 bg-[#16291f] text-xs text-[#9fc2a8]">
            <tr>
              {tr.head.map((h) => (
                <th key={h} className="px-3 py-1.5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tr.rows.slice(0, shown + 1).map((r, i) => (
              <tr key={i} className={i === shown ? "bg-[#E3B341]/20 text-[#fff3c4]" : "text-[#cfe0d3]"}>
                {r.map((c, k) => (
                  <td key={k} className="px-3 py-1">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 min-h-5 text-sm text-[#d5e2d8]">{tr.notes[shown]}</p>
      {finished && tr.error && <p className="mt-2 rounded-lg border border-[#FF7B72]/50 bg-[#FF7B72]/10 px-3 py-2 text-sm text-[#ffb4ae]">{tr.error}</p>}
      {finished && !tr.error && tr.result && <p className="mt-2 rounded-lg border border-[#7EE787]/50 bg-[#7EE787]/10 px-3 py-2 text-sm font-semibold text-[#9ff0b4]">{tr.result}</p>}
      {finished && tr.warn && <p className="mt-2 text-xs text-[#E3B341]">{tr.warn}</p>}
    </Card>
  );
}

function Line({ mode, title, hint }: { mode: string; title?: string; hint?: string }) {
  const [x, setX] = useState(0);
  const [a, setA] = useState(-2);
  const [b, setB] = useState(4);
  const add = mode === "add";
  const nat = mode === "naturals";
  const lo = add ? -10 : nat ? Math.max(0, x - 6) : x - 6;
  const hi = add ? 10 : lo + 12;
  const W = 700;
  const pad = 30;
  const X = (v: number) => pad + ((v - lo) / (hi - lo)) * (W - 2 * pad);
  const ticks: number[] = [];
  for (let v = lo; v <= hi; v++) ticks.push(v);
  const cur = add ? a : x;
  return (
    <Card title={title ?? "Sulla retta dei numeri"} hint={hint}>
      <svg viewBox={`0 0 ${W} 120`} className="w-full" role="img" aria-label="retta numerica">
        <line x1={pad - 10} x2={W - pad + 10} y1="60" y2="60" stroke="#9fc2a8" strokeWidth="3" strokeLinecap="round" />
        {ticks.map((v) => (
          <g key={v}>
            <line x1={X(v)} x2={X(v)} y1="52" y2="68" stroke="#9fc2a8" strokeWidth="2" />
            <text x={X(v)} y="92" textAnchor="middle" fontSize={add ? 15 : 17} fill={v === cur ? "#E3B341" : "#cfe0d3"} fontWeight={v === cur ? 700 : 400}>
              {fmt(v)}
            </text>
          </g>
        ))}
        {add ? (
          <>
            <path d={`M${X(a)} 40 Q${(X(a) + X(a + b)) / 2} ${b === 0 ? 40 : 6} ${X(a + b)} 40`} fill="none" stroke="#58A6FF" strokeWidth="3" />
            <circle cx={X(a)} cy="60" r="8" fill="#E3B341" />
            <circle cx={X(a + b)} cy="60" r="8" fill="#7EE787" />
          </>
        ) : (
          <circle cx={X(x)} cy="60" r="10" fill="#E3B341" />
        )}
      </svg>
      {add ? (
        <>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <Slider label="a (si parte da qui)" value={a} min={-5} max={5} onChange={setA} />
            <Slider label="b (quanti passi)" value={b} min={-5} max={5} onChange={setB} />
          </div>
          <p className="mt-2 text-sm text-[#d5e2d8]">
            Parti da <b className="text-[#E3B341]">{fmt(a)}</b> e fai {Math.abs(b)} {Math.abs(b) === 1 ? "passo" : "passi"} verso {b >= 0 ? "destra" : "sinistra"}: arrivi a <b className="text-[#7EE787]">{fmt(a + b)}</b>.
          </p>
          <p className="mt-1 text-center font-mono text-lg font-semibold text-white">
            {fmt(a)} + {b < 0 ? `(${fmt(b)})` : fmt(b)} = {fmt(a + b)}
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={BTN} disabled={nat && x === 0} onClick={() => setX(x - 1)}>
              P · precedente
            </button>
            <button type="button" className={GOLD} onClick={() => setX(x + 1)}>
              S · successivo
            </button>
            <button type="button" className={BTN} onClick={() => setX(0)}>
              Torna a 0
            </button>
          </div>
          <p className="mt-2 text-sm text-[#d5e2d8]">
            <span className="font-mono text-white">
              S({fmt(x)}) = {fmt(x + 1)}
            </span>
            {nat && x === 0 ? <span className="text-[#ffb4ae]"> · P(0) non esiste: 0 non è il successore di nessuno!</span> : <span className="font-mono text-white"> · P({fmt(x)}) = {fmt(x - 1)}</span>}
          </p>
          {!nat && (
            <p className="mt-1 text-xs text-[#9fc2a8]">
              Controlla: S(P({fmt(x)})) = S({fmt(x - 1)}) = {fmt(x)} e P(S({fmt(x)})) = P({fmt(x + 1)}) = {fmt(x)}.
            </p>
          )}
        </>
      )}
    </Card>
  );
}

function Dominoes({ title, hint }: { title?: string; hint?: string }) {
  const N = 12;
  const [gaps, setGaps] = useState<Set<number>>(new Set());
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  let reach = N;
  for (let i = 0; i < N; i++) {
    if (gaps.has(i)) {
      reach = i;
      break;
    }
  }
  useEffect(() => {
    if (!running) return;
    if (shown >= reach) {
      setRunning(false);
      return;
    }
    const id = window.setTimeout(() => setShown((s) => s + 1), 260);
    return () => window.clearTimeout(id);
  }, [running, shown, reach]);
  const toggle = (i: number) => {
    if (running || started) return;
    setGaps((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };
  const end = started && !running;
  return (
    <Card title={title ?? "Effetto domino"} hint={hint}>
      <div className="flex h-28 items-end justify-center gap-1 overflow-hidden">
        {Array.from({ length: N }, (_, i) => {
          const gap = gaps.has(i);
          const fell = i < shown;
          return (
            <button key={i} type="button" onClick={() => toggle(i)} aria-label={`domino ${i}`} className={cn("relative h-20 w-5 shrink-0 origin-bottom-right rounded-sm border transition-transform duration-300 sm:w-6", gap ? "border-dashed border-white/30 bg-transparent" : "border-[#6b4a2b] bg-[#f1e6c9]")} style={fell && !gap ? { transform: "rotate(72deg) translateY(2px)" } : undefined}>
              <span className="absolute inset-x-0 top-1 text-center text-[10px] font-bold text-[#6b4a2b]">{gap ? "" : i}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={GOLD}
          disabled={running || started}
          onClick={() => {
            setStarted(true);
            setRunning(true);
          }}
        >
          Spingi il primo
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => {
            setRunning(false);
            setStarted(false);
            setShown(0);
          }}
        >
          Rimetti in piedi
        </button>
        <button type="button" className={BTN} disabled={running || started} onClick={() => setGaps(new Set())}>
          Togli i buchi
        </button>
      </div>
      <p className="mt-2 text-sm text-[#d5e2d8]">
        {end && reach === N && "Sono caduti tutti! Primo domino spinto + ogni domino che cade fa cadere il successivo = cadono tutti. È l'induzione."}
        {end && reach < N && reach === 0 && "Senza il primo domino non parte niente: serve il caso di partenza (0 ∈ A)."}
        {end && reach < N && reach > 0 && `La catena si è fermata al ${reach}: manca un domino, quindi «se cade x cade anche S(x)» non vale in quel punto.`}
        {!end && "Tocca un domino per toglierlo (o rimetterlo), poi spingi il primo."}
      </p>
    </Card>
  );
}

function Positional({ base, title, hint }: { base: number; title?: string; hint?: string }) {
  const len = base === 2 ? 8 : 4;
  const [d, setD] = useState<number[]>(() => (base === 2 ? [0, 0, 0, 0, 1, 0, 0, 1] : [0, 1, 2, 3]));
  const value = d.reduce((s, c, i) => s + c * Math.pow(base, len - 1 - i), 0);
  const set = (i: number, c: number) => setD((prev) => prev.map((x, k) => (k === i ? c : x)));
  const terms = d.map((c, i) => ({ c, e: len - 1 - i })).filter((t) => t.c !== 0);
  return (
    <Card title={title ?? (base === 2 ? "Costruisci un numero binario" : "Costruisci un numero decimale")} hint={hint}>
      <div className="flex justify-center gap-1.5">
        {d.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-xs text-[#9fc2a8]">
              {base}
              <sup>{len - 1 - i}</sup>
            </span>
            {base === 2 ? (
              <button type="button" onClick={() => set(i, c ? 0 : 1)} className={cn("size-10 rounded-lg border text-lg font-bold transition-colors", c ? "border-[#E3B341] bg-[#E3B341]/25 text-[#fff3c4]" : "border-white/25 bg-black/30 text-[#9fc2a8]")}>
                {c}
              </button>
            ) : (
              <>
                <button type="button" className={cn(BTN, "px-3 py-0.5")} onClick={() => set(i, (c + 1) % 10)}>
                  ▲
                </button>
                <span className="grid size-10 place-items-center rounded-lg border border-[#E3B341] bg-[#E3B341]/15 text-xl font-bold text-[#fff3c4]">{c}</span>
                <button type="button" className={cn(BTN, "px-3 py-0.5")} onClick={() => set(i, (c + 9) % 10)}>
                  ▼
                </button>
              </>
            )}
            <span className="text-[10px] text-[#9fc2a8]">vale {Math.pow(base, len - 1 - i)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center font-mono text-sm text-[#d5e2d8]">
        {terms.length === 0
          ? "0"
          : terms.map((t, i) => (
              <span key={i}>
                {i > 0 && " + "}
                {t.c}·{base}
                <sup>{t.e}</sup>
              </span>
            ))}
      </p>
      <p className="mt-1 text-center text-lg font-bold text-white">
        {base === 2 ? `${d.join("")}₂ = ${value}` : `${d.join("")} = ${value}`}
        {base === 2 && <span className="text-sm font-normal text-[#9fc2a8]"> in base dieci</span>}
      </p>
    </Card>
  );
}

function Order({ neg, title, hint }: { neg: boolean; title?: string; hint?: string }) {
  const [a, setA] = useState(neg ? -3 : 4);
  const [b, setB] = useState(neg ? 2 : 9);
  const min = neg ? -20 : 0;
  const rel: [string, boolean][] = [
    [`${fmt(a)} < ${fmt(b)}`, a < b],
    [`${fmt(a)} = ${fmt(b)}`, a === b],
    [`${fmt(a)} > ${fmt(b)}`, a > b],
  ];
  const wide: [string, boolean][] = [
    [`${fmt(a)} ≤ ${fmt(b)}`, a <= b],
    [`${fmt(a)} ≥ ${fmt(b)}`, a >= b],
  ];
  return (
    <Card title={title ?? "Tricotomia in azione"} hint={hint}>
      <div className="flex justify-center gap-4">
        <Num label="a" value={a} min={min} max={99} onChange={setA} />
        <Num label="b" value={b} min={min} max={99} onChange={setB} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {rel.map(([t, v]) => (
          <div key={t} className={cn("rounded-lg border px-3 py-2 text-center font-mono text-sm", v ? "border-[#7EE787] bg-[#7EE787]/15 text-white" : "border-white/15 text-[#8fa196]")}>
            {t} {v ? "✓" : "✗"}
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {wide.map(([t, v]) => (
          <div key={t} className={cn("rounded-lg border px-3 py-2 text-center font-mono text-sm", v ? "border-[#58A6FF] bg-[#58A6FF]/15 text-white" : "border-white/15 text-[#8fa196]")}>
            {t} {v ? "✓" : "✗"}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[#9fc2a8]">Una e una sola delle tre relazioni in alto è vera: è la tricotomia.</p>
    </Card>
  );
}

function Area({ title, hint }: { title?: string; hint?: string }) {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [c, setC] = useState(4);
  const cols = a + b;
  return (
    <Card title={title ?? "La proprietà distributiva in figura"} hint={hint}>
      <div className="mx-auto grid max-w-sm gap-[3px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols * c }, (_, i) => (
          <div key={i} className={cn("aspect-square rounded-[3px]", i % cols < a ? "bg-[#E3B341]" : "bg-[#58A6FF]")} />
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Slider label="a (oro)" value={a} min={1} max={8} onChange={setA} />
        <Slider label="b (azzurro)" value={b} min={1} max={8} onChange={setB} />
        <Slider label="c (righe)" value={c} min={1} max={6} onChange={setC} />
      </div>
      <p className="mt-2 text-center font-mono text-sm text-white">
        ({a} + {b})·{c} = {(a + b) * c} &nbsp;=&nbsp; {a}·{c} + {b}·{c} = {a * c} + {b * c}
      </p>
    </Card>
  );
}

function PowProps({ title, hint }: { title?: string; hint?: string }) {
  const [a, setA] = useState(2);
  const [d, setD] = useState(3);
  const [b, setB] = useState(3);
  const [c, setC] = useState(2);
  const p = Math.pow;
  const lines: { l: string; r: string; lv: number | null; rv: number | null }[] = [
    { l: `${a}${sup(b)} · ${a}${sup(c)}`, r: `${a}${sup(b + c)}`, lv: p(a, b) * p(a, c), rv: p(a, b + c) },
    { l: `${a}${sup(b)} · ${d}${sup(b)}`, r: `(${a}·${d})${sup(b)}`, lv: p(a, b) * p(d, b), rv: p(a * d, b) },
    { l: `(${a}${sup(b)})${sup(c)}`, r: `${a}${sup(b * c)}`, lv: p(p(a, b), c), rv: p(a, b * c) },
    { l: `${a}${sup(b)} : ${a}${sup(c)}`, r: `${a}${sup(Math.max(b - c, 0))}`, lv: b >= c ? p(a, b) / p(a, c) : null, rv: b >= c ? p(a, b - c) : null },
  ];
  return (
    <Card title={title ?? "Verifica le proprietà delle potenze"} hint={hint}>
      <div className="flex flex-wrap justify-center gap-3">
        <Num label="a" value={a} min={1} max={5} onChange={setA} />
        <Num label="d" value={d} min={1} max={5} onChange={setD} />
        <Num label="b" value={b} min={0} max={4} onChange={setB} />
        <Num label="c" value={c} min={0} max={4} onChange={setC} />
      </div>
      <ul className="mt-3 space-y-2">
        {lines.map((x, i) => (
          <li key={i} className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-center font-mono text-sm text-white">
            {x.lv === null ? (
              <span className="text-[#E3B341]">{x.l}: serve b ≥ c (in ℕ)</span>
            ) : (
              <>
                {x.l} = {x.r} &nbsp;→&nbsp; {x.lv} = {x.rv} <span className="text-[#7EE787]">{x.lv === x.rv ? "✓" : "✗"}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Sieve({ title, hint }: { title?: string; hint?: string }) {
  const N = 100;
  const [crossed, setCrossed] = useState<Set<number>>(new Set([1]));
  const [kept, setKept] = useState<number[]>([]);
  const [msg, setMsg] = useState("Il numero 1 è già stato eliminato (non è primo). Tocca il 2!");
  const [auto, setAuto] = useState(false);
  const nextPrime = () => {
    for (let n = 2; n <= N; n++) if (!crossed.has(n) && !kept.includes(n)) return n;
    return null;
  };
  const np = nextPrime();
  const done = np === null || (kept.length > 0 && np * np > N);
  const step = (p: number) => {
    const next = new Set(crossed);
    for (let m = 2 * p; m <= N; m += p) next.add(m);
    setCrossed(next);
    setKept([...kept, p]);
    setMsg(`${p} è primo: lo teniamo e eliminiamo tutti i suoi multipli.`);
  };
  useEffect(() => {
    if (!auto) return;
    if (done || np === null) {
      setAuto(false);
      return;
    }
    const id = window.setTimeout(() => step(np), 700);
    return () => window.clearTimeout(id);
  });
  const click = (n: number) => {
    if (done || np === null) return;
    if (n === np) step(np);
    else setMsg(`Non ancora: il prossimo numero non eliminato è ${np}.`);
  };
  const reset = () => {
    setCrossed(new Set([1]));
    setKept([]);
    setAuto(false);
    setMsg("Ricominciamo: tocca il 2!");
  };
  const primes = Array.from({ length: N }, (_, i) => i + 1).filter((n) => !crossed.has(n));
  return (
    <Card title={title ?? "Il crivello di Eratostene"} hint={hint}>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: N }, (_, i) => i + 1).map((n) => {
          const isCrossed = crossed.has(n);
          const isPrime = kept.includes(n) || (done && !isCrossed && n > 1);
          return (
            <button key={n} type="button" onClick={() => click(n)} className={cn("aspect-square rounded text-[11px] font-semibold transition-colors sm:text-sm", isCrossed ? "bg-black/30 text-[#5f7567] line-through" : isPrime ? "bg-[#E3B341] text-[#2a1d0f]" : n === np ? "bg-[#58A6FF]/30 text-white ring-1 ring-[#58A6FF]" : "bg-white/10 text-white hover:bg-white/20")}>
              {n}
            </button>
          );
        })}
      </div>
      <p className="mt-2 min-h-10 text-sm text-[#d5e2d8]">{done ? `Fatto! I numeri rimasti sono i ${primes.length} numeri primi fino a 100.` : msg}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={GOLD} disabled={done} onClick={() => np !== null && step(np)}>
          Prossimo passo
        </button>
        <button type="button" className={BTN} disabled={done} onClick={() => setAuto((v) => !v)}>
          {auto ? "Pausa" : "Automatico"}
        </button>
        <button type="button" className={BTN} onClick={reset}>
          Ricomincia
        </button>
      </div>
    </Card>
  );
}

function Factor({ title, hint }: { title?: string; hint?: string }) {
  const [a, setA] = useState(60);
  const [b, setB] = useState(18);
  const fa = useMemo(() => factorize(a), [a]);
  const fb = useMemo(() => factorize(b), [b]);
  const primes = [...new Set([...fa.keys(), ...fb.keys()])].sort((x, y) => x - y);
  let mcd = 1;
  let mcm = 1;
  for (const p of primes) {
    mcd *= Math.pow(p, Math.min(fa.get(p) ?? 0, fb.get(p) ?? 0));
    mcm *= Math.pow(p, Math.max(fa.get(p) ?? 0, fb.get(p) ?? 0));
  }
  return (
    <Card title={title ?? "Scomponi, MCD e mcm"} hint={hint}>
      <div className="flex justify-center gap-4">
        <Num label="a" value={a} min={2} max={999} onChange={setA} />
        <Num label="b" value={b} min={2} max={999} onChange={setB} />
      </div>
      <p className="mt-3 text-center font-mono text-sm text-white">
        {a} = {factorString(fa)}
      </p>
      <p className="text-center font-mono text-sm text-white">
        {b} = {factorString(fb)}
      </p>
      <div className="mt-3 overflow-x-auto rounded-lg border border-white/15">
        <table className="w-full text-center font-mono text-sm">
          <thead className="bg-[#16291f] text-xs text-[#9fc2a8]">
            <tr>
              <th className="px-2 py-1.5">primo</th>
              <th className="px-2">esp. in a</th>
              <th className="px-2">esp. in b</th>
              <th className="px-2 text-[#58A6FF]">min (MCD)</th>
              <th className="px-2 text-[#E3B341]">max (mcm)</th>
            </tr>
          </thead>
          <tbody>
            {primes.map((p) => (
              <tr key={p} className="text-[#e8efe6]">
                <td className="py-1">{p}</td>
                <td>{fa.get(p) ?? 0}</td>
                <td>{fb.get(p) ?? 0}</td>
                <td className="text-[#79C0FF]">{Math.min(fa.get(p) ?? 0, fb.get(p) ?? 0)}</td>
                <td className="text-[#E3B341]">{Math.max(fa.get(p) ?? 0, fb.get(p) ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <p className="rounded-lg border border-[#58A6FF]/50 bg-[#58A6FF]/10 px-3 py-2 text-center text-sm font-semibold text-white">MCD({a}, {b}) = {mcd}</p>
        <p className="rounded-lg border border-[#E3B341]/50 bg-[#E3B341]/10 px-3 py-2 text-center text-sm font-semibold text-white">mcm({a}, {b}) = {mcm}</p>
      </div>
      <p className="mt-2 text-center font-mono text-xs text-[#9fc2a8]">
        MCD · mcm = {mcd} · {mcm} = {mcd * mcm} &nbsp;e&nbsp; a · b = {a * b} {mcd * mcm === a * b ? "✓" : "✗"}
      </p>
    </Card>
  );
}

function Gauss({ title, hint }: { title?: string; hint?: string }) {
  const [n, setN] = useState(100);
  const total = (n * (n + 1)) / 2;
  const even = n % 2 === 0;
  const pairs = [0, 1, 2].filter((i) => i < Math.floor(n / 2));
  return (
    <Card title={title ?? "Il trucco di Gauss"} hint={hint}>
      <Num label="somma da 1 fino a n" value={n} min={2} max={1000} onChange={setN} />
      <ul className="mt-3 space-y-1 font-mono text-sm text-[#e8efe6]">
        {pairs.map((i) => (
          <li key={i}>
            {i + 1} + {n - i} = {n + 1}
          </li>
        ))}
        <li className="text-[#9fc2a8]">…</li>
      </ul>
      <p className="mt-2 text-sm text-[#d5e2d8]">
        {even ? `Ci sono ${n / 2} coppie, tutte da ${n + 1}.` : `Ci sono ${(n - 1) / 2} coppie da ${n + 1} e resta in mezzo ${(n + 1) / 2}.`}
      </p>
      <p className="mt-1 text-center font-mono text-lg font-bold text-white">
        1 + 2 + … + {n} = {total.toLocaleString("it-IT")}
      </p>
      <p className="text-center text-xs text-[#9fc2a8]">(formula: n·(n+1) : 2)</p>
    </Card>
  );
}

function Cantor({ title, hint }: { title?: string; hint?: string }) {
  const [n, setN] = useState(5);
  const [z, setZ] = useState(-3);
  const f = (k: number) => (k === 0 ? 0 : k % 2 === 0 ? k / 2 : -(k + 1) / 2);
  const inv = (v: number) => (v === 0 ? 0 : v > 0 ? 2 * v : -2 * v - 1);
  const shown = Array.from({ length: 13 }, (_, i) => i);
  return (
    <Card title={title ?? "Contare gli interi"} hint={hint}>
      <div className="grid grid-cols-2 gap-x-6 text-center">
        <p className="text-xs font-semibold text-[#9fc2a8]">ℕ</p>
        <p className="text-xs font-semibold text-[#9fc2a8]">ℤ</p>
        {shown.map((k) => (
          <div key={k} className="contents">
            <span className={cn("rounded py-0.5 font-mono text-sm", k === n ? "bg-[#E3B341] font-bold text-[#2a1d0f]" : "text-[#cfe0d3]")}>{k}</span>
            <span className={cn("rounded py-0.5 font-mono text-sm", k === n ? "bg-[#E3B341] font-bold text-[#2a1d0f]" : "text-[#cfe0d3]")}>{fmt(f(k))}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label="n" value={n} min={0} max={12} onChange={setN} />
        <div className="flex items-end gap-3">
          <Num label="z" value={z} min={-6} max={6} onChange={setZ} />
          <p className="pb-2 font-mono text-sm text-white">
            ← f(z) = {inv(z)}
          </p>
        </div>
      </div>
      <p className="mt-2 text-center font-mono text-base font-bold text-white">
        f({n}) = {fmt(f(n))}
      </p>
      <p className="text-center text-xs text-[#9fc2a8]">{n === 0 ? "n = 0 → 0" : n % 2 === 0 ? "n pari → n : 2" : "n dispari → −(n + 1) : 2"}</p>
    </Card>
  );
}

function AbsLab({ title, hint }: { title?: string; hint?: string }) {
  const [x, setX] = useState(-5);
  const W = 700;
  const pad = 30;
  const X = (v: number) => pad + ((v + 10) / 20) * (W - 2 * pad);
  return (
    <Card title={title ?? "Distanza dallo zero"} hint={hint}>
      <svg viewBox={`0 0 ${W} 100`} className="w-full" role="img" aria-label="valore assoluto">
        <line x1={pad - 10} x2={W - pad + 10} y1="50" y2="50" stroke="#9fc2a8" strokeWidth="3" strokeLinecap="round" />
        {Array.from({ length: 21 }, (_, i) => i - 10).map((v) => (
          <g key={v}>
            <line x1={X(v)} x2={X(v)} y1="42" y2="58" stroke="#9fc2a8" strokeWidth="2" />
            <text x={X(v)} y="84" textAnchor="middle" fontSize="15" fill="#cfe0d3">
              {fmt(v)}
            </text>
          </g>
        ))}
        <line x1={X(0)} x2={X(x)} y1="30" y2="30" stroke="#58A6FF" strokeWidth="6" strokeLinecap="round" />
        <circle cx={X(0)} cy="50" r="7" fill="#fff" />
        <circle cx={X(x)} cy="50" r="9" fill="#E3B341" />
      </svg>
      <Slider label="x" value={x} min={-10} max={10} onChange={setX} />
      <p className="mt-2 text-center font-mono text-lg font-bold text-white">
        |{fmt(x)}| = {Math.abs(x)}
      </p>
      <p className="text-center text-sm text-[#d5e2d8]">{x >= 0 ? "x ≥ 0: il valore assoluto è x stesso." : `x < 0: il valore assoluto è −x = −(${fmt(x)}) = ${-x}.`}</p>
    </Card>
  );
}

function Triangle({ title, hint }: { title?: string; hint?: string }) {
  const [a, setA] = useState(-2);
  const [b, setB] = useState(5);
  const lhs = Math.abs(a) + Math.abs(b);
  const rhs = Math.abs(a + b);
  return (
    <Card title={title ?? "La disuguaglianza triangolare"} hint={hint}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="a" value={a} min={-9} max={9} onChange={setA} />
        <Slider label="b" value={b} min={-9} max={9} onChange={setB} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <p className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-center font-mono text-sm text-white">
          |a| + |b| = {Math.abs(a)} + {Math.abs(b)} = {lhs}
        </p>
        <p className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-center font-mono text-sm text-white">
          |a + b| = |{fmt(a + b)}| = {rhs}
        </p>
      </div>
      <p className="mt-2 text-center text-sm text-[#d5e2d8]">{lhs === rhs ? "Uguali: a e b hanno lo stesso segno (o uno è 0), niente si compensa." : "|a| + |b| è maggiore: a e b hanno segni opposti e nella somma una parte si cancella."}</p>
    </Card>
  );
}

function SignsLab({ title, hint }: { title?: string; hint?: string }) {
  const [sa, setSa] = useState(-1);
  const [sb, setSb] = useState(-1);
  const [op, setOp] = useState("·");
  const res = sa * sb;
  const ex = op === "·" ? `(${sa < 0 ? "−" : "+"}3) · (${sb < 0 ? "−" : "+"}4) = ${fmt(sa * sb * 12)}` : `(${sa < 0 ? "−" : "+"}12) : (${sb < 0 ? "−" : "+"}4) = ${fmt(sa * sb * 3)}`;
  const sign = (s: number) => (s < 0 ? "−" : "+");
  return (
    <Card title={title ?? "La regola dei segni"} hint={hint}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" className={sa > 0 ? GOLD : BTN} onClick={() => setSa(1)}>+</button>
        <button type="button" className={sa < 0 ? GOLD : BTN} onClick={() => setSa(-1)}>−</button>
        <button type="button" className={cn(BTN, "mx-2 w-12")} onClick={() => setOp(op === "·" ? ":" : "·")}>
          {op}
        </button>
        <button type="button" className={sb > 0 ? GOLD : BTN} onClick={() => setSb(1)}>+</button>
        <button type="button" className={sb < 0 ? GOLD : BTN} onClick={() => setSb(-1)}>−</button>
      </div>
      <p className="mt-3 text-center text-2xl font-bold text-white">
        ({sign(sa)}) {op} ({sign(sb)}) = <span className={res > 0 ? "text-[#7EE787]" : "text-[#FF7B72]"}>({sign(res)})</span>
      </p>
      <p className="mt-1 text-center font-mono text-sm text-[#d5e2d8]">Esempio: {ex}</p>
      <p className="mt-1 text-center text-sm text-[#9fc2a8]">{sa === sb ? "Segni uguali → risultato positivo." : "Segni diversi → risultato negativo."}</p>
      <p className="mt-1 text-center text-xs text-[#9fc2a8]">Tocca il simbolo centrale per passare da prodotto a quoziente: la regola è la stessa.</p>
    </Card>
  );
}

function Parity({ title, hint }: { title?: string; hint?: string }) {
  const [b, setB] = useState(3);
  const [n, setN] = useState(2);
  const v1 = Math.pow(-b, n);
  const v2 = -Math.pow(b, n);
  return (
    <Card title={title ?? "Esponente pari o dispari?"} hint={hint}>
      <div className="flex justify-center gap-4">
        <Num label="base" value={b} min={1} max={6} onChange={setB} />
        <Num label="esponente" value={n} min={0} max={8} onChange={setN} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <p className="rounded-lg border border-[#58A6FF]/50 bg-[#58A6FF]/10 px-3 py-3 text-center font-mono text-base text-white">
          (−{b}){sup(n)} = <b>{fmt(v1)}</b>
        </p>
        <p className="rounded-lg border border-[#FF7B72]/50 bg-[#FF7B72]/10 px-3 py-3 text-center font-mono text-base text-white">
          −{b}{sup(n)} = <b>{fmt(v2)}</b>
        </p>
      </div>
      <p className="mt-2 text-sm text-[#d5e2d8]">
        {n === 0 ? "Esponente 0: il risultato è 1 (per la prima), e −1 per la seconda." : n % 2 === 0 ? "Esponente pari: i fattori negativi si accoppiano tutti, quindi (−b)ⁿ è positivo." : "Esponente dispari: resta un fattore negativo spaiato, quindi (−b)ⁿ è negativo."}
      </p>
      <p className="mt-1 text-xs text-[#E3B341]">Attenzione alle parentesi: nella seconda il segno meno sta fuori e l'elevamento riguarda solo {b}.</p>
    </Card>
  );
}

function Venn({ title, hint }: { title?: string; hint?: string }) {
  const [sel, setSel] = useState("Z");
  const info: Record<string, string> = {
    Z: "ℤ = ℤ⁻ ∪ {0} ∪ ℤ⁺: tutti gli interi, da −∞ a +∞.",
    N: "ℕ = {0, 1, 2, 3, …}: i naturali. Ogni naturale è anche un intero: ℕ ⊂ ℤ.",
    Zn: "ℤ⁻ = {−1, −2, −3, …}: gli interi negativi, quelli nuovi.",
    Zp: "ℤ⁺ = {+1, +2, +3, …} = ℕ ∖ {0}.",
    zero: "{0}: lo zero non è né positivo né negativo.",
  };
  const on = (k: string, extra?: string[]) => (sel === k || (extra ?? []).includes(sel) ? "#E3B341" : "none");
  return (
    <Card title={title ?? "La mappa degli interi"} hint={hint}>
      <svg viewBox="0 0 700 230" className="w-full" role="img" aria-label="insiemi numerici">
        <rect x="10" y="10" width="680" height="210" rx="26" fill={sel === "Z" ? "#E3B34133" : "#ffffff10"} stroke="#9fc2a8" strokeWidth="2" />
        <text x="30" y="40" fill="#cfe0d3" fontSize="20" fontWeight="700">ℤ</text>
        <rect x="40" y="60" width="230" height="140" rx="18" fill={sel === "Zn" ? "#E3B34140" : "#FF7B7220"} stroke={on("Zn") === "none" ? "#FF7B72" : "#E3B341"} strokeWidth="2" />
        <text x="60" y="88" fill="#ffb4ae" fontSize="17" fontWeight="700">ℤ⁻</text>
        <text x="60" y="140" fill="#fff" fontSize="22">−3  −2  −1</text>
        <rect x="300" y="45" width="370" height="165" rx="22" fill={sel === "N" ? "#E3B34140" : "#58A6FF20"} stroke={sel === "N" ? "#E3B341" : "#58A6FF"} strokeWidth="2" />
        <text x="320" y="75" fill="#79C0FF" fontSize="17" fontWeight="700">ℕ</text>
        <circle cx="350" cy="140" r="26" fill={sel === "zero" ? "#E3B34166" : "#ffffff15"} stroke={sel === "zero" ? "#E3B341" : "#fff"} strokeWidth="2" />
        <text x="350" y="148" textAnchor="middle" fill="#fff" fontSize="22">0</text>
        <ellipse cx="530" cy="140" rx="110" ry="46" fill={sel === "Zp" ? "#E3B34140" : "#7EE78720"} stroke={sel === "Zp" ? "#E3B341" : "#7EE787"} strokeWidth="2" />
        <text x="440" y="108" fill="#9ff0b4" fontSize="17" fontWeight="700">ℤ⁺</text>
        <text x="530" y="148" textAnchor="middle" fill="#fff" fontSize="22">1  2  3</text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-2">
        {[["Z", "ℤ"], ["N", "ℕ"], ["Zn", "ℤ⁻"], ["Zp", "ℤ⁺"], ["zero", "{0}"]].map(([k, l]) => (
          <button key={k} type="button" className={sel === k ? GOLD : BTN} onClick={() => setSel(k)}>
            {l}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-[#d5e2d8]">{info[sel]}</p>
    </Card>
  );
}

interface Q {
  prompt: string;
  kind: "choice" | "num" | "pair";
  answer: number[] | string;
  explain: string;
}

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const par = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n));

const GENS: Record<string, () => Q> = {
  signs: () => {
    const a = rnd(2, 9) * (Math.random() < 0.5 ? -1 : 1);
    const b = rnd(2, 9) * (Math.random() < 0.5 ? -1 : 1);
    const div = Math.random() < 0.4;
    const left = div ? a * b : a;
    const neg = left * b < 0;
    return { prompt: `Che segno ha ${par(left)} ${div ? ":" : "·"} ${par(b)} ?`, kind: "choice", answer: neg ? "−" : "+", explain: `Segni ${neg ? "diversi" : "uguali"} → risultato ${neg ? "negativo" : "positivo"}.` };
  },
  addZ: () => {
    const a = rnd(-15, 15);
    const b = rnd(-15, 15);
    return { prompt: `${fmt(a)} + ${par(b)} = ?`, kind: "num", answer: [a + b], explain: `${fmt(a)} + ${par(b)} = ${fmt(a + b)}.` };
  },
  powsign: () => {
    const a = rnd(2, 5) * (Math.random() < 0.7 ? -1 : 1);
    const n = rnd(2, 5);
    return { prompt: `(${fmt(a)})${sup(n)} = ?`, kind: "num", answer: [Math.pow(a, n)], explain: `Esponente ${n % 2 === 0 ? "pari" : "dispari"}: ${fmt(Math.pow(a, n))}.` };
  },
  gcd: () => {
    const g = rnd(2, 9);
    const x = rnd(2, 8);
    const y = rnd(2, 8);
    const a = g * x;
    const b = g * y;
    return { prompt: `MCD(${a}, ${b}) = ?`, kind: "num", answer: [gcd(a, b)], explain: `Il massimo divisore comune di ${a} e ${b} è ${gcd(a, b)}.` };
  },
  divrem: () => {
    const b = rnd(3, 9);
    const a = rnd(20, 99);
    const q = Math.floor(a / b);
    const r = a % b;
    return { prompt: `${a} : ${b}  →  quoziente e resto?`, kind: "pair", answer: [q, r], explain: `${a} = ${b}·${q} + ${r}, con 0 ≤ ${r} < ${b}.` };
  },
  divremZ: () => {
    const b = rnd(2, 9) * (Math.random() < 0.4 ? -1 : 1);
    const a = rnd(-60, 60);
    const m = Math.abs(b);
    const r = ((a % m) + m) % m;
    const q = (a - r) / b;
    return { prompt: `${fmt(a)} : ${par(b)}  →  quoziente e resto?`, kind: "pair", answer: [q, r], explain: `${fmt(a)} = ${par(b)}·${par(q)} + ${r}, con il resto 0 ≤ ${r} < ${m}.` };
  },
};

function Drill({ kinds, title, hint }: { kinds: string[]; title?: string; hint?: string }) {
  const make = () => GENS[kinds[rnd(0, kinds.length - 1)]]();
  const [q, setQ] = useState<Q>(make);
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [res, setRes] = useState<null | boolean>(null);
  const [score, setScore] = useState({ ok: 0, tot: 0, streak: 0 });
  const parse = (s: string) => Number(s.replace("−", "-").trim());
  const check = (choice?: string) => {
    if (res !== null) return;
    let good = false;
    if (q.kind === "choice") good = choice === q.answer;
    else if (q.kind === "num") good = t1.trim() !== "" && parse(t1) === (q.answer as number[])[0];
    else good = t1.trim() !== "" && t2.trim() !== "" && parse(t1) === (q.answer as number[])[0] && parse(t2) === (q.answer as number[])[1];
    setRes(good);
    setScore((s) => ({ ok: s.ok + (good ? 1 : 0), tot: s.tot + 1, streak: good ? s.streak + 1 : 0 }));
  };
  const next = () => {
    setQ(make());
    setT1("");
    setT2("");
    setRes(null);
  };
  const inputCls = "h-11 w-24 rounded-lg border border-white/25 bg-black/30 px-2 text-center text-lg font-semibold text-white outline-none focus:border-[#E3B341]";
  return (
    <Card title={title ?? "Allenati"} hint={hint}>
      <div className="flex items-center justify-between text-xs text-[#9fc2a8]">
        <span>
          Giuste {score.ok}/{score.tot}
        </span>
        <span>{score.streak >= 3 ? `🔥 serie di ${score.streak}` : score.streak > 0 ? `serie di ${score.streak}` : ""}</span>
      </div>
      <p className="mt-2 text-center text-xl font-bold text-white">{q.prompt}</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {q.kind === "choice" ? (
          <>
            <button type="button" className={cn(GOLD, "w-20 text-xl")} disabled={res !== null} onClick={() => check("+")}>+</button>
            <button type="button" className={cn(GOLD, "w-20 text-xl")} disabled={res !== null} onClick={() => check("−")}>−</button>
          </>
        ) : (
          <>
            <input value={t1} onChange={(e) => setT1(e.target.value)} inputMode="text" placeholder={q.kind === "pair" ? "quoz." : "?"} className={inputCls} onKeyDown={(e) => e.key === "Enter" && check()} />
            {q.kind === "pair" && <input value={t2} onChange={(e) => setT2(e.target.value)} inputMode="numeric" placeholder="resto" className={inputCls} onKeyDown={(e) => e.key === "Enter" && check()} />}
            <button type="button" className={GOLD} disabled={res !== null} onClick={() => check()}>
              Controlla
            </button>
          </>
        )}
      </div>
      {res !== null && (
        <div className="mt-3 text-center">
          <p className={res ? "font-semibold text-[#7EE787]" : "font-semibold text-[#FF7B72]"}>{res ? "Giusto! 🎉" : "Quasi…"}</p>
          <p className="mt-1 text-sm text-[#d5e2d8]">{q.explain}</p>
          <button type="button" className={cn(BTN, "mt-2")} onClick={next}>
            Prossima domanda
          </button>
        </div>
      )}
    </Card>
  );
}

function Lab({ b }: { b: Extract<Block, { t: "lab" }> }) {
  const cfg = b.cfg ?? {};
  switch (b.w) {
    case "line":
      return <Line mode={String(cfg.mode ?? "naturals")} title={b.title} hint={b.hint} />;
    case "dominoes":
      return <Dominoes title={b.title} hint={b.hint} />;
    case "positional":
      return <Positional base={Number(cfg.base ?? 10)} title={b.title} hint={b.hint} />;
    case "order":
      return <Order neg={Boolean(cfg.neg)} title={b.title} hint={b.hint} />;
    case "algo":
      return <AlgoLab cfg={cfg} title={b.title} hint={b.hint} />;
    case "area":
      return <Area title={b.title} hint={b.hint} />;
    case "powprops":
      return <PowProps title={b.title} hint={b.hint} />;
    case "sieve":
      return <Sieve title={b.title} hint={b.hint} />;
    case "factor":
      return <Factor title={b.title} hint={b.hint} />;
    case "gauss":
      return <Gauss title={b.title} hint={b.hint} />;
    case "cantor":
      return <Cantor title={b.title} hint={b.hint} />;
    case "abs":
      return <AbsLab title={b.title} hint={b.hint} />;
    case "triangle":
      return <Triangle title={b.title} hint={b.hint} />;
    case "signs":
      return <SignsLab title={b.title} hint={b.hint} />;
    case "parity":
      return <Parity title={b.title} hint={b.hint} />;
    case "venn":
      return <Venn title={b.title} hint={b.hint} />;
    case "drill":
      return <Drill kinds={String(cfg.kinds ?? "signs").split(",")} title={b.title} hint={b.hint} />;
  }
}

export default function Interactive({ b }: { b: Block }) {
  switch (b.t) {
    case "steps":
      return <Steps b={b} />;
    case "flip":
      return <Flip b={b} />;
    case "quiz":
      return <Quiz b={b} />;
    case "reveal":
      return <Reveal b={b} />;
    case "sort":
      return <Sort b={b} />;
    case "mark":
      return <Mark b={b} />;
    case "fill":
      return <Fill b={b} />;
    case "punct":
      return <Punct b={b} />;
    case "seq":
      return <Seq b={b} />;
    case "lab":
      return <Lab b={b} />;
    default:
      return null;
  }
}
