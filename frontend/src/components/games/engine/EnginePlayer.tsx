import { useEffect, useState } from "react";
import { Flame, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shuffle } from "@/lib/games";
import type { Block, GameOut } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChoiceBlock, MatchBlock, NumberBlock, OrderBlock, TypeBlock } from "./blocks";
import { Scene } from "./scenes";

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

const arrange = (blocks: Block[], doShuffle: boolean) => {
  if (!doShuffle) return blocks;
  const slots = blocks.flatMap((b, i) => (b.kind === "info" ? [] : [i]));
  const mixed = shuffle(slots.map((i) => blocks[i]));
  const out = [...blocks];
  slots.forEach((slot, k) => {
    out[slot] = mixed[k];
  });
  return out;
};

export default function EnginePlayer({ game, onFinish }: { game: GameOut; onFinish: (percent: number) => void }) {
  const custom = game.content.custom!;
  const { rules, scene } = custom;
  const [blocks] = useState(() => arrange(custom.blocks, rules.shuffle));
  const maxScore = blocks.reduce((sum, b) => sum + (b.kind === "info" ? 0 : b.value), 0);
  const total = blocks.filter((b) => b.kind !== "info").length;

  const [idx, setIdx] = useState(0);
  const [earned, setEarned] = useState(0);
  const [lives, setLives] = useState(rules.lives);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<"ask" | "feedback">("ask");
  const [last, setLast] = useState<{ ratio: number; gained: number; timedOut: boolean; bonus: boolean } | null>(null);
  const [hit, setHit] = useState<{ kind: "good" | "bad"; n: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(rules.seconds);

  const block = blocks[idx];
  const progress = maxScore > 0 ? Math.min(1, earned / maxScore) : 1;
  const answered = blocks.slice(0, idx + (phase === "feedback" ? 1 : 0)).filter((b) => b.kind !== "info").length;

  const resolve = (ratio: number, timedOut = false) => {
    if (phase !== "ask" || block.kind === "info") return;
    const bonus = rules.streak_bonus && streak >= 2 && ratio === 1;
    const gained = block.value * ratio * (bonus ? 1.5 : 1);
    const bad = ratio < 0.5;
    setEarned(Math.max(0, earned + gained - (bad ? rules.penalty : 0)));
    setStreak(ratio === 1 ? streak + 1 : 0);
    if (bad && rules.lives > 0) setLives(Math.max(0, lives - 1));
    setLast({ ratio, gained, timedOut, bonus });
    setHit({ kind: bad ? "bad" : "good", n: (hit?.n ?? 0) + 1 });
    setPhase("feedback");
  };

  useEffect(() => {
    if (phase !== "ask" || rules.seconds === 0 || block.kind === "info") return;
    const end = Date.now() + rules.seconds * 1000;
    setTimeLeft(rules.seconds);
    const timer = window.setInterval(() => {
      const left = Math.max(0, (end - Date.now()) / 1000);
      setTimeLeft(left);
      if (left <= 0) {
        window.clearInterval(timer);
        resolve(0, true);
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [idx, phase]);

  const next = () => {
    const over = rules.lives > 0 && lives <= 0;
    if (over || idx + 1 >= blocks.length) {
      onFinish(maxScore > 0 ? Math.min(100, Math.round((earned / maxScore) * 100)) : 100);
      return;
    }
    setIdx(idx + 1);
    setPhase("ask");
    setLast(null);
  };

  const props = { block, locked: phase === "feedback", onResolve: (ratio: number) => resolve(ratio) };
  const dead = rules.lives > 0 && lives <= 0;
  const verdict = !last ? "" : last.timedOut ? "Tempo scaduto" : last.ratio === 1 ? "Esatto!" : last.ratio > 0 ? "Quasi!" : "Sbagliato";

  return (
    <div className="space-y-4" data-testid="player-engine">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-[#8B949E]">
          Sfida {Math.min(answered + (phase === "ask" && block.kind !== "info" ? 1 : 0), total)}/{total}
        </span>
        <span className="flex items-center gap-3">
          {rules.streak_bonus && streak >= 2 && (
            <span className="inline-flex items-center gap-1 text-[#F0883E]" data-testid="engine-streak">
              <Flame className="size-4" /> ×{streak}
            </span>
          )}
          {rules.lives > 0 && (
            <span className="inline-flex gap-0.5" data-testid="engine-lives">
              {Array.from({ length: rules.lives }, (_, i) => (
                <Heart key={i} className={cn("size-4", i < lives ? "fill-[#F85149] text-[#F85149]" : "text-[#30363D]")} />
              ))}
            </span>
          )}
          <span className="tabular-nums" data-testid="engine-score">
            <b>{fmt(earned)}</b>
            <span className="text-[#8B949E]"> / {maxScore} pt</span>
          </span>
        </span>
      </div>

      <Scene id={scene} progress={progress} hit={hit} />
      {scene === "none" && (
        <div className="h-2 overflow-hidden rounded-full bg-[#21262D]">
          <div className="h-full rounded-full bg-[#388BFD] transition-all duration-500" style={{ width: `${progress * 100}%` }} />
        </div>
      )}

      {rules.seconds > 0 && block.kind !== "info" && (
        <div className="h-1 overflow-hidden rounded-full bg-[#21262D]">
          <div className={cn("h-full rounded-full", timeLeft < 5 ? "bg-[#F85149]" : "bg-[#D29922]")} style={{ width: `${phase === "ask" ? (timeLeft / rules.seconds) * 100 : 0}%`, transition: "width 0.2s linear" }} />
        </div>
      )}

      <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-5">
        {block.kind === "info" ? (
          <div className="space-y-4">
            <p className="whitespace-pre-line text-base leading-relaxed">{block.prompt}</p>
            <div className="flex justify-end">
              <Button className="h-9" onClick={next} data-testid="engine-info-next">
                Continua
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              {block.prompt ? <h2 className="text-lg font-semibold leading-snug">{block.prompt}</h2> : <span />}
              <span className="shrink-0 rounded border border-[#30363D] bg-[#21262D] px-1.5 py-0.5 text-xs text-[#C9D1D9]">{block.value} pt</span>
            </div>
            {block.kind === "choice" && <ChoiceBlock key={idx} {...props} />}
            {block.kind === "type" && <TypeBlock key={idx} {...props} />}
            {block.kind === "number" && <NumberBlock key={idx} {...props} />}
            {block.kind === "order" && <OrderBlock key={idx} {...props} />}
            {block.kind === "match" && <MatchBlock key={idx} {...props} />}
          </div>
        )}
      </div>

      {phase === "feedback" && last && (
        <div
          className={cn("rounded-lg border p-3 text-sm", last.ratio === 1 ? "border-[#3FB950]/50 bg-[#3FB950]/10" : last.ratio > 0 ? "border-[#D29922]/50 bg-[#D29922]/10" : "border-[#F85149]/50 bg-[#F85149]/10")}
          data-testid="engine-feedback"
        >
          <p className="font-medium">
            {verdict}
            {last.gained > 0 && ` · +${fmt(last.gained)} punti`}
            {last.bonus && " · serie ×1,5"}
            {dead && " · hai finito le vite"}
          </p>
          {block.explain && <p className="mt-1 text-[#C9D1D9]">{block.explain}</p>}
          <div className="mt-3 flex justify-end">
            <Button className="h-9" onClick={next} data-testid="engine-next">
              {dead || idx + 1 >= blocks.length ? "Concludi" : "Avanti"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
