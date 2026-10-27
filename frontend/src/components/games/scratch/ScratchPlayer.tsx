import type { GameOut } from "@/lib/types";
import ScratchRun from "./ScratchRun";

export default function ScratchPlayer({ game, onFinish }: { game: GameOut; onFinish: (percent: number) => void }) {
  const project = game.content.scratch!;
  return <ScratchRun project={project} onFinish={onFinish} />;
}
