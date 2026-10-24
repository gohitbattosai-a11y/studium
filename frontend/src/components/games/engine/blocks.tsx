import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { acceptedAnswers, normalize, shuffle } from "@/lib/games";
import type { Block } from "@/lib/types";
import { cn } from "@/lib/utils";
import { choiceClass } from "../ui";

export interface BlockProps {
  block: Block;
  locked: boolean;
  onResolve: (ratio: number) => void;
}

export function ChoiceBlock({ block, locked, onResolve }: BlockProps) {
  const [picked, setPicked] = useState<number | null>(null);
  const choose = (i: number) => {
    if (locked || picked !== null) return;
    setPicked(i);
    onResolve(i === block.correct ? 1 : 0);
  };
  return (
    <div className="space-y-2.5" data-testid="block-choice">
      {block.options.map((option, i) => {
        let state: Parameters<typeof choiceClass>[0] = "idle";
        if (locked) state = i === block.correct ? "correct" : i === picked ? "wrong" : "dim";
        return (
          <button key={i} type="button" className={choiceClass(state)} onClick={() => choose(i)} data-testid={`block-option-${i}`}>
            {option}
          </button>
        );
      })}
    </div>
  );
}

function AnswerForm({ locked, onSubmit, placeholder, shown, inputMode }: { locked: boolean; onSubmit: (value: string) => void; placeholder: string; shown?: string; inputMode?: "decimal" }) {
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (locked || done || !value.trim()) return;
    setDone(true);
    onSubmit(value);
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <Input className="h-10" value={value} inputMode={inputMode} onChange={(e) => setValue(e.target.value)} disabled={locked || done} placeholder={placeholder} autoFocus data-testid="block-input" />
      {locked && shown && <p className="text-sm text-[#8B949E]">Risposta: {shown}</p>}
      {!locked && !done && (
        <div className="flex justify-end">
          <Button type="submit" className="h-9" disabled={!value.trim()} data-testid="block-check">
            Controlla
          </Button>
        </div>
      )}
    </form>
  );
}

export function TypeBlock({ block, locked, onResolve }: BlockProps) {
  return (
    <AnswerForm
      locked={locked}
      placeholder="Scrivi la risposta"
      shown={block.answer.split("/")[0].trim()}
      onSubmit={(v) => onResolve(acceptedAnswers(block.answer).includes(normalize(v)) ? 1 : 0)}
    />
  );
}

export function NumberBlock({ block, locked, onResolve }: BlockProps) {
  return (
    <AnswerForm
      locked={locked}
      placeholder="Scrivi un numero"
      inputMode="decimal"
      shown={String(block.number ?? "")}
      onSubmit={(v) => {
        const n = Number(v.replace(",", "."));
        onResolve(Number.isFinite(n) && block.number !== null && Math.abs(n - block.number) <= block.tolerance + 1e-9 ? 1 : 0);
      }}
    />
  );
}

export function OrderBlock({ block, locked, onResolve }: BlockProps) {
  const steps = block.steps;
  const [order, setOrder] = useState(() => {
    let mixed = shuffle(steps.map((_, i) => i));
    if (mixed.every((v, i) => v === i)) mixed = [...mixed.slice(1), mixed[0]];
    return mixed;
  });
  const [checked, setChecked] = useState(false);
  const reveal = checked || locked;

  const move = (from: number, to: number) => {
    if (reveal || to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    setOrder(next);
  };

  const check = () => {
    setChecked(true);
    onResolve(order.filter((v, i) => v === i).length / steps.length);
  };

  return (
    <div className="space-y-2.5" data-testid="block-order">
      {order.map((v, i) => (
        <div
          key={v}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm",
            !reveal && "border-[#30363D] bg-[#161B22]",
            reveal && (v === i ? "border-[#3FB950] bg-[#3FB950]/12" : "border-[#F85149] bg-[#F85149]/12"),
          )}
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#21262D] text-xs tabular-nums">{i + 1}</span>
          <span className="min-w-0 flex-1">{steps[v]}</span>
          {!reveal && (
            <span className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon-sm" aria-label="Sposta su" disabled={i === 0} onClick={() => move(i, i - 1)}>
                <ChevronUp className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Sposta giù" disabled={i === order.length - 1} onClick={() => move(i, i + 1)}>
                <ChevronDown className="size-4" />
              </Button>
            </span>
          )}
        </div>
      ))}
      {!reveal && (
        <div className="flex justify-end">
          <Button className="h-9" onClick={check} data-testid="block-check">
            Controlla
          </Button>
        </div>
      )}
    </div>
  );
}

export function MatchBlock({ block, locked, onResolve }: BlockProps) {
  const pairs = block.pairs;
  const [lefts] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [rights] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pickRight = (r: number) => {
    if (locked || selected === null || done.includes(r) || wrong) return;
    if (selected === r) {
      const next = [...done, r];
      setDone(next);
      setSelected(null);
      if (next.length === pairs.length) onResolve(pairs.length / (pairs.length + mistakes));
      return;
    }
    setMistakes((m) => m + 1);
    setWrong([selected, r]);
    timer.current = window.setTimeout(() => {
      setWrong(null);
      setSelected(null);
    }, 700);
  };

  return (
    <div className="grid grid-cols-2 gap-3" data-testid="block-match">
      <div className="space-y-2.5">
        {lefts.map((i) => {
          const state = done.includes(i) ? "correct" : wrong?.[0] === i ? "wrong" : selected === i ? "selected" : "idle";
          return (
            <button key={i} type="button" disabled={locked || done.includes(i)} className={choiceClass(state)} onClick={() => !wrong && setSelected(i)}>
              {pairs[i].left}
            </button>
          );
        })}
      </div>
      <div className="space-y-2.5">
        {rights.map((i) => {
          const state = done.includes(i) ? "correct" : wrong?.[1] === i ? "wrong" : "idle";
          return (
            <button key={i} type="button" disabled={locked || done.includes(i) || selected === null} className={choiceClass(state)} onClick={() => pickRight(i)}>
              {pairs[i].right}
            </button>
          );
        })}
      </div>
    </div>
  );
}
