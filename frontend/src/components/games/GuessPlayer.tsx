import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { acceptedAnswers, normalize, shuffle } from "@/lib/games";
import type { GameOut } from "@/lib/types";
import { sfx } from "@/lib/sfx";
import { Progress } from "./ui";

export default function GuessPlayer({ game, onFinish }: { game: GameOut; onFinish: (percent: number) => void }) {
  const [items] = useState(() => shuffle(game.content.pairs));
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);

  const item = items[index];
  const last = index + 1 === items.length;

  const check = (e: FormEvent) => {
    e.preventDefault();
    if (verdict !== null || !value.trim()) return;
    const ok = acceptedAnswers(item.right).includes(normalize(value));
    sfx(ok ? "correct" : "wrong");
    setVerdict(ok);
    if (ok) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (last) {
      onFinish(Math.round((correct / items.length) * 100));
      return;
    }
    setIndex((i) => i + 1);
    setValue("");
    setVerdict(null);
  };

  return (
    <div data-testid="player-guess">
      <Progress value={index + 1} max={items.length} label="Indizio" />
      <h2 className="mb-5 text-xl font-semibold leading-snug">{item.left}</h2>
      <form onSubmit={check} className="space-y-3">
        <Input className="h-10" value={value} onChange={(e) => setValue(e.target.value)} disabled={verdict !== null} placeholder="Scrivi la risposta" autoFocus data-testid="guess-input" />
        {verdict !== null && (
          <p className={verdict ? "text-sm text-[#3FB950]" : "text-sm text-[#F85149]"} data-testid="guess-verdict">
            {verdict ? "Esatto!" : `La risposta era: ${item.right.split("/")[0].trim()}`}
          </p>
        )}
        <div className="flex justify-end">
          {verdict === null ? (
            <Button type="submit" className="h-9" disabled={!value.trim()} data-testid="guess-check">
              Controlla
            </Button>
          ) : (
            <Button type="button" className="h-9" onClick={next} data-testid="guess-next">
              {last ? "Fine" : "Avanti"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
