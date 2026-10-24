import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { shuffle } from "@/lib/games";
import type { GameOut } from "@/lib/types";
import { Progress } from "./ui";

export default function MemoryPlayer({ game, onFinish }: { game: GameOut; onFinish: (percent: number) => void }) {
  const pairs = game.content.pairs;
  const [cards] = useState(() => shuffle(pairs.flatMap((p, i) => [{ pair: i, text: p.left }, { pair: i, text: p.right }])));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flip = (i: number) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(cards[i].pair)) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length < 2) return;
    const total = moves + 1;
    setMoves(total);
    if (cards[next[0]].pair === cards[next[1]].pair) {
      const done = [...matched, cards[i].pair];
      setMatched(done);
      setFlipped([]);
      if (done.length === pairs.length) onFinish(Math.min(100, Math.round((pairs.length * 150) / total)));
      return;
    }
    timer.current = window.setTimeout(() => setFlipped([]), 900);
  };

  return (
    <div data-testid="player-memory">
      <Progress value={matched.length} max={pairs.length} label={`Mosse: ${moves}`} />
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {cards.map((card, i) => {
          const open = flipped.includes(i) || matched.includes(card.pair);
          return (
            <button
              key={i}
              type="button"
              onClick={() => flip(i)}
              data-testid={`memory-card-${i}`}
              className={cn(
                "grid min-h-20 place-items-center rounded-lg border p-2 text-center text-sm transition-colors duration-200",
                open ? (matched.includes(card.pair) ? "border-[#3FB950] bg-[#3FB950]/12" : "border-[#388BFD] bg-[#388BFD]/10") : "border-[#30363D] bg-[#21262D] text-transparent hover:border-[#8B949E]",
              )}
            >
              {open ? card.text : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
