import { useState, type ComponentType } from "react";
import { ArrowLeft, Coins, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGameActions } from "@/lib/gameActions";
import { templateOf } from "@/lib/games";
import type { FinishResult, GameOut, GameTemplate } from "@/lib/types";
import EnginePlayer from "./engine/EnginePlayer";
import GuessPlayer from "./GuessPlayer";
import MatchPlayer from "./MatchPlayer";
import MemoryPlayer from "./MemoryPlayer";
import OrderPlayer from "./OrderPlayer";
import QuizPlayer from "./QuizPlayer";

type PlayerProps = { game: GameOut; onFinish: (percent: number) => void };

const PLAYERS: Record<GameTemplate, ComponentType<PlayerProps>> = {
  quiz: QuizPlayer,
  sort: QuizPlayer,
  abbina: MatchPlayer,
  memory: MemoryPlayer,
  indovina: GuessPlayer,
  ordina: OrderPlayer,
  custom: EnginePlayer,
};

function Outcome({ result, game, onClaim, claiming, onReplay, onExit }: { result: FinishResult; game: GameOut; onClaim: () => void; claiming: boolean; onReplay: () => void; onExit: () => void }) {
  if (result.claimed_points !== null) {
    return (
      <div className="space-y-4" data-testid="outcome-claimed">
        <p className="text-sm text-[#C9D1D9]">
          Hai già riscosso <b>{result.claimed_points} punti</b> da questo gioco. Puoi continuare a giocare per divertimento.
        </p>
        <Buttons onReplay={onReplay} onExit={onExit} />
      </div>
    );
  }
  if (result.can_claim) {
    return (
      <div className="space-y-4" data-testid="outcome-claim">
        <p className="text-sm text-[#C9D1D9]">
          Con questo risultato (<b>{result.round_percent}%</b>) puoi ottenere <b>{result.points_available} punti</b>. Vuoi prenderli?
        </p>
        <p className="text-xs text-[#8B949E]">
          Se li prendi ora, da questo gioco non potrai ottenerne altri. Se rigiochi, ti chiederò di nuovo a fine round.
          {result.next_percent !== null && result.next_points !== null && <> Rigiocando, con il {result.next_percent}% ne otterresti {result.next_points}.</>}
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" className="h-9" onClick={onReplay} data-testid="outcome-continue">
            <RotateCcw className="size-4" /> Rigioca per di più
          </Button>
          <Button className="h-9" disabled={claiming} onClick={onClaim} data-testid="outcome-claim-button">
            <Coins className="size-4" /> Prendi {result.points_available} punti
          </Button>
        </div>
      </div>
    );
  }
  const note =
    result.reason === "non_participating"
      ? "Attiva la partecipazione nello Shop per ottenere punti dai giochi."
      : result.reason === "author"
        ? `Sei l'autore di «${game.title}»: puoi giocarci ma senza punti.`
        : `Servono almeno il ${result.next_percent ?? 40}% in un round per ottenere punti. Riprova!`;
  return (
    <div className="space-y-4" data-testid="outcome-none">
      <p className="text-sm text-[#C9D1D9]">{note}</p>
      <Buttons onReplay={onReplay} onExit={onExit} />
    </div>
  );
}

function Buttons({ onReplay, onExit }: { onReplay: () => void; onExit: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" className="h-9" onClick={onExit} data-testid="outcome-exit">
        Esci
      </Button>
      <Button className="h-9" onClick={onReplay} data-testid="outcome-replay">
        <RotateCcw className="size-4" /> Rigioca
      </Button>
    </div>
  );
}

export default function GameRunner({ game, preview = false, onExit }: { game: GameOut; preview?: boolean; onExit: () => void }) {
  const actions = useGameActions();
  const [round, setRound] = useState(0);
  const [percent, setPercent] = useState<number | null>(null);
  const [result, setResult] = useState<FinishResult | null>(null);

  const Player = PLAYERS[game.template];
  const meta = templateOf(game.template);

  const finish = (p: number) => {
    setPercent(p);
    setResult(null);
    if (preview) return;
    actions.finish.mutate({ id: game.id, score: p }, { onSuccess: setResult, onError: () => setPercent(null) });
  };

  const replay = () => {
    setPercent(null);
    setResult(null);
    setRound((r) => r + 1);
  };

  return (
    <div data-testid="game-runner">
      <div className="mb-5 flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" aria-label="Esci dal gioco" onClick={onExit} data-testid="game-exit">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{game.title}</h1>
          <p className="text-xs text-[#8B949E]">
            {meta.label}
            {preview && " · anteprima"}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-2xl">
        <Player key={round} game={game} onFinish={finish} />
      </div>
      <Dialog open={percent !== null} onOpenChange={(open) => !open && replay()}>
        <DialogContent className="sm:max-w-md" data-testid="game-result">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="size-5 text-[#E3B341]" /> Hai fatto {percent}%
            </DialogTitle>
            <DialogDescription>{preview ? "Anteprima: in revisione non si assegnano punti." : "Partita completata."}</DialogDescription>
          </DialogHeader>
          {preview ? (
            <Buttons onReplay={replay} onExit={onExit} />
          ) : result ? (
            <Outcome result={result} game={game} claiming={actions.claim.isPending} onClaim={() => actions.claim.mutate(game.id, { onSuccess: setResult })} onReplay={replay} onExit={onExit} />
          ) : (
            <p className="text-sm text-[#8B949E]">Calcolo il risultato…</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
