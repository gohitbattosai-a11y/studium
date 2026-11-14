import { useMemo, useState, type ReactNode } from "react";
import type { Block } from "@/lib/domain/lessons";
import { cn } from "@/lib/utils/cn";

const BTN = "rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40";
const GOLD = "rounded-lg border border-[#E3B341] bg-[#E3B341]/20 px-3 py-1.5 text-sm font-semibold text-[#fff3c4] transition-colors hover:bg-[#E3B341]/35 disabled:cursor-not-allowed disabled:opacity-40";

const TONES = {
  gold: { box: "border-[#E3B341]/40 bg-black/25", label: "text-[#E3B341]" },
  green: { box: "border-[#7EE787]/40 bg-[#7EE787]/10", label: "text-[#7EE787]" },
  pink: { box: "border-[#F778BA]/40 bg-[#F778BA]/10", label: "text-[#ff9ccf]" },
  teal: { box: "border-[#39D0D8]/40 bg-[#39D0D8]/10", label: "text-[#7be6ec]" },
  blue: { box: "border-[#58A6FF]/40 bg-[#58A6FF]/10", label: "text-[#79C0FF]" },
} as const;

function Shell({ tone, label, title, hint, children }: { tone: keyof typeof TONES; label: string; title?: string; hint?: string; children: ReactNode }) {
  const t = TONES[tone];
  return (
    <section className={cn("mt-5 rounded-xl border p-4", t.box)}>
      <p className={cn("text-xs font-semibold tracking-wider uppercase", t.label)}>
        {label}
        {title ? ` · ${title}` : ""}
      </p>
      {hint && <p className="mt-1 text-sm text-[#b8c7bc]">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

const OK = "border-[#7EE787] bg-[#7EE787]/15 text-white";
const KO = "border-[#FF7B72] bg-[#FF7B72]/15 text-white";
const IDLE = "border-white/20 bg-black/20 text-[#e8efe6] hover:border-[#E3B341]";

export function Sort({ b }: { b: Extract<Block, { t: "sort" }> }) {
  const [sel, setSel] = useState<number | null>(null);
  const [placed, setPlaced] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const left = b.items.map((_, i) => i).filter((i) => !placed.includes(i));
  const finished = left.length === 0;
  const drop = (bucket: number) => {
    if (sel === null) return;
    const it = b.items[sel];
    if (it.bucket === bucket) {
      setPlaced([...placed, sel]);
      setMsg({ ok: true, text: it.why ?? "Esatto!" });
      setSel(null);
    } else {
      setErrors(errors + 1);
      setMsg({ ok: false, text: `Non è «${b.buckets[bucket]}»: ripensaci.` });
    }
  };
  const reset = () => {
    setSel(null);
    setPlaced([]);
    setErrors(0);
    setMsg(null);
  };
  return (
    <Shell tone="green" label="🧩 Smista" title={b.title} hint={b.hint ?? "Tocca un elemento, poi tocca la categoria giusta."}>
      {!finished && (
        <div className="flex flex-wrap gap-2">
          {left.map((i) => (
            <button key={i} type="button" onClick={() => setSel(i)} className={cn("rounded-lg border px-3 py-2 text-left text-sm transition-colors", sel === i ? "border-[#E3B341] bg-[#E3B341]/25 text-[#fff3c4]" : IDLE)}>
              {b.items[i].text}
            </button>
          ))}
        </div>
      )}
      <div className={cn("mt-3 grid gap-2", b.buckets.length > 3 ? "sm:grid-cols-3" : b.buckets.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
        {b.buckets.map((name, bi) => (
          <button key={bi} type="button" onClick={() => drop(bi)} className={cn("min-h-16 rounded-lg border border-dashed p-2 text-left transition-colors", sel !== null ? "border-[#E3B341]/70 bg-[#E3B341]/5 hover:bg-[#E3B341]/15" : "border-white/25 bg-black/20")}>
            <span className="block text-xs font-bold tracking-wide text-[#fff3c4] uppercase">{name}</span>
            <span className="mt-1 flex flex-col gap-1">
              {placed
                .filter((i) => b.items[i].bucket === bi)
                .map((i) => (
                  <span key={i} className="rounded border border-[#7EE787]/50 bg-[#7EE787]/10 px-2 py-1 text-xs text-[#e8efe6]">
                    {b.items[i].text}
                  </span>
                ))}
            </span>
          </button>
        ))}
      </div>
      {msg && <p className={cn("mt-3 text-sm font-medium", msg.ok ? "text-[#7EE787]" : "text-[#FF7B72]")}>{msg.text}</p>}
      {finished && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-[#fff3c4]">{errors === 0 ? "Tutto al primo colpo! 🏆" : `Completato con ${errors} ${errors === 1 ? "errore" : "errori"}.`}</p>
          <button type="button" className={BTN} onClick={reset}>
            Rigioca
          </button>
        </div>
      )}
    </Shell>
  );
}

export function Mark({ b }: { b: Extract<Block, { t: "mark" }> }) {
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const toggle = (i: number) => {
    if (checked) return;
    setPicked(picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i]);
  };
  const right = b.correct.filter((i) => picked.includes(i)).length;
  const wrong = picked.filter((i) => !b.correct.includes(i)).length;
  const perfect = right === b.correct.length && wrong === 0;
  return (
    <Shell tone="pink" label="👆 Individua" title={b.title} hint={b.prompt}>
      <div className="flex flex-wrap gap-2">
        {b.words.map((w, i) => {
          const on = picked.includes(i);
          const should = b.correct.includes(i);
          const cls = !checked ? (on ? "border-[#E3B341] bg-[#E3B341]/25 text-[#fff3c4]" : IDLE) : on && should ? OK : on ? KO : should ? "border-dashed border-[#E3B341] bg-[#E3B341]/10 text-[#fff3c4]" : "border-white/10 bg-black/10 text-[#9fb0a4]";
          return (
            <button key={i} type="button" onClick={() => toggle(i)} className={cn("rounded-lg border px-2.5 py-1.5 text-left text-sm transition-colors", cls)}>
              {w}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {!checked ? (
          <button type="button" className={GOLD} disabled={picked.length === 0} onClick={() => setChecked(true)}>
            Controlla
          </button>
        ) : (
          <button
            type="button"
            className={BTN}
            onClick={() => {
              setChecked(false);
              setPicked([]);
            }}
          >
            Riprova
          </button>
        )}
      </div>
      {checked && (
        <div className="mt-3 text-sm">
          <p className={perfect ? "font-semibold text-[#7EE787]" : "font-semibold text-[#FF7B72]"}>{perfect ? "Perfetto! 🎉" : `Ne hai trovati ${right} su ${b.correct.length}${wrong > 0 ? `, con ${wrong} in più che non andavano` : ""}.`}</p>
          <p className="mt-1 text-[#d5e2d8]">{b.why}</p>
        </div>
      )}
    </Shell>
  );
}

export function Fill({ b }: { b: Extract<Block, { t: "fill" }> }) {
  const [solved, setSolved] = useState<Record<number, boolean>>({});
  const [bad, setBad] = useState<Record<number, number>>({});
  const [errors, setErrors] = useState(0);
  const count = Object.keys(solved).length;
  const pick = (i: number, o: number) => {
    if (solved[i]) return;
    if (o === b.items[i].answer) {
      setSolved({ ...solved, [i]: true });
      const next = { ...bad };
      delete next[i];
      setBad(next);
    } else {
      setBad({ ...bad, [i]: o });
      setErrors(errors + 1);
    }
  };
  return (
    <Shell tone="teal" label="✏️ Completa" title={b.title} hint={b.hint ?? "Scegli l'opzione giusta per ogni frase."}>
      <ol className="space-y-3">
        {b.items.map((it, i) => (
          <li key={i} className="rounded-lg border border-white/15 bg-black/20 p-3">
            <p className="text-[15px] leading-relaxed text-white">
              {it.before}
              <span className={cn("mx-1 inline-block min-w-12 rounded border px-2 py-0.5 text-center font-semibold", solved[i] ? "border-[#7EE787] bg-[#7EE787]/15 text-[#bdf5c8]" : "border-dashed border-white/40 text-[#9fb0a4]")}>{solved[i] ? it.options[it.answer] : "…"}</span>
              {it.after}
            </p>
            {!solved[i] && (
              <div className="mt-2 flex flex-wrap gap-2">
                {it.options.map((o, oi) => (
                  <button key={oi} type="button" onClick={() => pick(i, oi)} className={cn("rounded-lg border px-3 py-1 text-sm transition-colors", bad[i] === oi ? KO : IDLE)}>
                    {o}
                  </button>
                ))}
              </div>
            )}
            {bad[i] !== undefined && !solved[i] && <p className="mt-2 text-sm font-medium text-[#FF7B72]">Non è questa: riprova.</p>}
            {solved[i] && <p className="mt-2 text-sm text-[#d5e2d8]">{it.why}</p>}
          </li>
        ))}
      </ol>
      {count === b.items.length && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-[#fff3c4]">{errors === 0 ? "Nessun errore! 🏆" : `Fatto, con ${errors} ${errors === 1 ? "tentativo sbagliato" : "tentativi sbagliati"}.`}</p>
          <button
            type="button"
            className={BTN}
            onClick={() => {
              setSolved({});
              setBad({});
              setErrors(0);
            }}
          >
            Rifai
          </button>
        </div>
      )}
    </Shell>
  );
}

export function Punct({ b }: { b: Extract<Block, { t: "punct" }> }) {
  const [mark, setMark] = useState(b.marks[0]);
  const [slots, setSlots] = useState<string[][]>(() => b.items.map((it) => it.words.map(() => "")));
  const [checked, setChecked] = useState(false);
  const setSlot = (r: number, c: number) => {
    if (checked) return;
    setSlots(slots.map((row, ri) => (ri === r ? row.map((v, ci) => (ci === c ? (v === mark ? "" : mark) : v)) : row)));
  };
  const rowOk = (r: number) => b.items[r].solution.every((s, c) => s === slots[r][c]);
  const allOk = b.items.every((_, r) => rowOk(r));
  return (
    <Shell tone="gold" label="✍️ Punteggia" title={b.title} hint={b.hint ?? "Scegli un segno, poi tocca i puntini dopo le parole. Tocca di nuovo per toglierlo."}>
      <div className="flex flex-wrap gap-2">
        {b.marks.map((m) => (
          <button key={m} type="button" onClick={() => setMark(m)} className={cn("grid size-9 place-items-center rounded-lg border text-lg font-bold transition-colors", mark === m ? "border-[#E3B341] bg-[#E3B341]/25 text-[#fff3c4]" : IDLE)} aria-label={`segno ${m}`}>
            {m}
          </button>
        ))}
      </div>
      <ol className="mt-3 space-y-3">
        {b.items.map((it, r) => (
          <li key={r} className="rounded-lg border border-white/15 bg-black/20 p-3">
            <p className="flex flex-wrap items-center gap-y-2 text-[15px] text-white">
              {it.words.map((w, c) => {
                const v = slots[r][c];
                const sol = it.solution[c];
                const cls = !checked ? (v ? "border-[#E3B341] text-[#fff3c4]" : "border-white/20 text-white/30") : v === sol ? (v ? "border-[#7EE787] bg-[#7EE787]/15 text-[#bdf5c8]" : "border-transparent text-white/20") : "border-[#FF7B72] bg-[#FF7B72]/15 text-[#ffb3ad]";
                return (
                  <span key={c} className="inline-flex items-center">
                    <span className="px-0.5">{w}</span>
                    <button type="button" onClick={() => setSlot(r, c)} className={cn("mr-1 grid h-7 min-w-6 place-items-center rounded border px-1 text-base font-bold", cls)} aria-label={`dopo ${w}`}>
                      {v || "·"}
                    </button>
                  </span>
                );
              })}
            </p>
            {checked && (
              <p className="mt-2 text-sm text-[#d5e2d8]">
                {rowOk(r) ? "✅ " : "❌ "}
                {it.words.map((w, c) => w + it.solution[c]).join(" ")} — {it.why}
              </p>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!checked ? (
          <button type="button" className={GOLD} onClick={() => setChecked(true)}>
            Controlla
          </button>
        ) : (
          <>
            <p className={cn("text-sm font-semibold", allOk ? "text-[#7EE787]" : "text-[#FF7B72]")}>{allOk ? "Tutto giusto! 🎉" : "Guarda dove hai sbagliato, poi riprova."}</p>
            <button
              type="button"
              className={BTN}
              onClick={() => {
                setChecked(false);
                setSlots(b.items.map((it) => it.words.map(() => "")));
              }}
            >
              Ricomincia
            </button>
          </>
        )}
      </div>
    </Shell>
  );
}

function shuffled(n: number, seed: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  let s = seed + 7;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.every((v, i) => v === i) && n > 1) a.push(a.shift() as number);
  return a;
}

export function Seq({ b }: { b: Extract<Block, { t: "seq" }> }) {
  const order = useMemo(() => shuffled(b.items.length, b.items.join("").length), [b]);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const rest = order.filter((i) => !picked.includes(i));
  const perfect = picked.every((v, pos) => v === pos);
  return (
    <Shell tone="blue" label="🔢 Rimetti in ordine" title={b.title} hint={b.hint ?? "Tocca gli elementi nell'ordine giusto. Tocca un elemento già scelto per toglierlo."}>
      {rest.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {rest.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setChecked(false);
                setPicked([...picked, i]);
              }}
              className={cn("rounded-lg border px-3 py-2 text-left text-sm transition-colors", IDLE)}
            >
              {b.items[i]}
            </button>
          ))}
        </div>
      )}
      <ol className="mt-3 space-y-1.5">
        {picked.map((v, pos) => (
          <li key={pos}>
            <button
              type="button"
              onClick={() => {
                setChecked(false);
                setPicked(picked.filter((_, p) => p !== pos));
              }}
              className={cn("flex w-full gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors", checked ? (v === pos ? OK : KO) : "border-[#58A6FF]/50 bg-[#58A6FF]/10 text-white")}
            >
              <span className="font-bold text-[#fff3c4]">{pos + 1}.</span>
              <span>{b.items[v]}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={GOLD} disabled={rest.length > 0 || checked} onClick={() => setChecked(true)}>
          Controlla
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => {
            setPicked([]);
            setChecked(false);
          }}
        >
          Ricomincia
        </button>
      </div>
      {checked && (
        <div className="mt-3 text-sm">
          <p className={perfect ? "font-semibold text-[#7EE787]" : "font-semibold text-[#FF7B72]"}>{perfect ? "Ordine perfetto! 🎉" : "Non ancora: le caselle rosse sono fuori posto. Tocca per spostarle."}</p>
          {perfect && b.why && <p className="mt-1 text-[#d5e2d8]">{b.why}</p>}
        </div>
      )}
    </Shell>
  );
}
