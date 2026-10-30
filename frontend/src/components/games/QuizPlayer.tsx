import { useState } from "react";
import { Button } from "@/components/ui/button";
import { shuffle, toQuestions } from "@/lib/games";
import type { GameOut } from "@/lib/types";
import { sfx } from "@/lib/sfx";
import { choiceClass, Progress } from "./ui";

export default function QuizPlayer({ game, onFinish }: { game: GameOut; onFinish: (percent: number) => void }) {
  const [questions] = useState(() => shuffle(toQuestions(game)));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  const q = questions[index];
  const last = index + 1 === questions.length;

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    sfx(i === q.correct ? "correct" : "wrong");
    if (i === q.correct) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (last) {
      onFinish(Math.round((correct / questions.length) * 100));
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  return (
    <div data-testid="player-quiz">
      <Progress value={index + 1} max={questions.length} label={game.template === "sort" ? "Elemento" : "Domanda"} />
      <h2 className="mb-5 text-xl font-semibold leading-snug">{q.prompt}</h2>
      <div className="space-y-2.5">
        {q.options.map((option, i) => {
          let state: Parameters<typeof choiceClass>[0] = "idle";
          if (picked !== null) {
            if (i === q.correct) state = "correct";
            else if (i === picked) state = "wrong";
            else state = "dim";
          }
          return (
            <button key={i} type="button" className={choiceClass(state)} onClick={() => choose(i)} data-testid={`quiz-option-${i}`}>
              {option}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-[#8B949E]">{picked === null ? "" : picked === q.correct ? "Esatto!" : "Non proprio."}</p>
        <Button className="h-9" disabled={picked === null} onClick={next} data-testid="quiz-next">
          {last ? "Fine" : "Avanti"}
        </Button>
      </div>
    </div>
  );
}
