import { useEffect, useRef, useState } from "react";
import { shuffle } from "@/lib/games";
import type { GameOut } from "@/lib/types";
import { sfx } from "@/lib/sfx";
import { choiceClass, Progress } from "./ui";

export default function MatchPlayer({ game, onFinish }: { game: GameOut; onFinish: (percent: number) => void }) {
  const pairs = game.content.pairs;
  const [lefts] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [rights] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pickRight = (r: number) => {
    if (selected === null || done.includes(r) || wrong) return;
    if (selected === r) {
      sfx("match");
      const next = [...done, r];
      setDone(next);
      setSelected(null);
      if (next.length === pairs.length) onFinish(Math.round((pairs.length / (pairs.length + mistakes)) * 100));
      return;
    }
    sfx("wrong");
    setMistakes((m) => m + 1);
    setWrong([selected, r]);
    timer.current = window.setTimeout(() => {
      setWrong(null);
      setSelected(null);
    }, 700);
  };

  return (
    <div data-testid="player-match">
      <Progress value={done.length} max={pairs.length} label="Coppie trovate" />
      <p className="mb-4 text-sm text-[#8B949E]">Tocca un elemento a sinistra, poi la sua corrispondenza a destra.</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2.5">
          {lefts.map((i) => {
            const state = done.includes(i) ? "correct" : wrong?.[0] === i ? "wrong" : selected === i ? "selected" : "idle";
            return (
              <button key={i} type="button" disabled={done.includes(i)} className={choiceClass(state)} onClick={() => !wrong && setSelected(i)} data-testid={`match-left-${i}`}>
                {pairs[i].left}
              </button>
            );
          })}
        </div>
        <div className="space-y-2.5">
          {rights.map((i) => {
            const state = done.includes(i) ? "correct" : wrong?.[1] === i ? "wrong" : "idle";
            return (
              <button key={i} type="button" disabled={done.includes(i) || selected === null} className={choiceClass(state)} onClick={() => pickRight(i)} data-testid={`match-right-${i}`}>
                {pairs[i].right}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
