import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { shuffle } from "@/lib/games";
import type { GameOut } from "@/lib/types";

export default function OrderPlayer({ game, onFinish }: { game: GameOut; onFinish: (percent: number) => void }) {
  const steps = game.content.steps;
  const [order, setOrder] = useState(() => {
    const base = steps.map((_, i) => i);
    let mixed = shuffle(base);
    if (mixed.every((v, i) => v === i)) mixed = [...mixed.slice(1), mixed[0]];
    return mixed;
  });
  const [checked, setChecked] = useState(false);

  const move = (from: number, to: number) => {
    if (checked || to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    setOrder(next);
  };

  const right = order.filter((v, i) => v === i).length;

  return (
    <div data-testid="player-order">
      <p className="mb-4 text-sm text-[#8B949E]">Usa le frecce per mettere i passaggi nell'ordine giusto, poi controlla.</p>
      <ol className="space-y-2.5">
        {order.map((v, i) => (
          <li
            key={v}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm",
              !checked && "border-[#30363D] bg-[#161B22]",
              checked && (v === i ? "border-[#3FB950] bg-[#3FB950]/12" : "border-[#F85149] bg-[#F85149]/12"),
            )}
            data-testid={`order-item-${i}`}
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#21262D] text-xs tabular-nums">{i + 1}</span>
            <span className="min-w-0 flex-1">{steps[v]}</span>
            {!checked && (
              <span className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="Sposta su" disabled={i === 0} onClick={() => move(i, i - 1)}>
                  <ChevronUp className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Sposta giù" disabled={i === order.length - 1} onClick={() => move(i, i + 1)}>
                  <ChevronDown className="size-4" />
                </Button>
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-[#8B949E]">{checked ? `${right} su ${steps.length} al posto giusto` : ""}</p>
        {checked ? (
          <Button className="h-9" onClick={() => onFinish(Math.round((right / steps.length) * 100))} data-testid="order-finish">
            Concludi
          </Button>
        ) : (
          <Button className="h-9" onClick={() => setChecked(true)} data-testid="order-check">
            Controlla
          </Button>
        )}
      </div>
    </div>
  );
}
