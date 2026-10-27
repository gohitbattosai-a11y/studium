import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Flame, Heart, Play, Square, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playSound, playTone, unlockAudio } from "@/lib/scratch/audio";
import { Runtime, STEP } from "@/lib/scratch/engine";
import { usedKeys } from "@/lib/scratch/project";
import type { ScratchProject } from "@/lib/scratch/types";
import { cn } from "@/lib/utils";
import StageView from "./StageView";

const KEY_LABEL: Record<string, string> = { up: "↑", down: "↓", left: "←", right: "→", space: "Spazio" };
const PAD = ["up", "left", "down", "right"];

function KeyButton({ k, onDown, onUp }: { k: string; onDown: (k: string) => void; onUp: (k: string) => void }) {
  return (
    <button
      type="button"
      className="grid h-11 min-w-11 touch-none select-none place-items-center rounded-lg border border-[#30363D] bg-[#21262D] px-3 text-sm font-medium active:bg-[#388BFD]/30"
      onPointerDown={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        onDown(k);
      }}
      onPointerUp={() => onUp(k)}
      onPointerCancel={() => onUp(k)}
      onLostPointerCapture={() => onUp(k)}
    >
      {KEY_LABEL[k] ?? k.toUpperCase()}
    </button>
  );
}

export default function ScratchRun({ project, onFinish, onStop, autoStart = false }: { project: ScratchProject; onFinish: (percent: number) => void; onStop?: () => void; autoStart?: boolean }) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const timer = useRef<number | undefined>(undefined);
  const [rt] = useState(
    () =>
      new Runtime(project, {
        sound: playSound,
        tone: playTone,
        end: (p) => {
          timer.current = window.setTimeout(() => finishRef.current(p), 900);
        },
      }),
  );
  const [started, setStarted] = useState(false);
  const [view, setView] = useState(() => rt.view());
  const [answer, setAnswer] = useState("");
  const keys = useMemo(() => usedKeys(project), [project]);

  const begin = () => {
    unlockAudio();
    rt.start();
    setView(rt.view());
    setStarted(true);
  };

  useEffect(() => {
    if (autoStart) begin();
    return () => {
      window.clearTimeout(timer.current);
      rt.stopAll();
    };
  }, []);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      let ticked = false;
      while (acc >= STEP) {
        rt.tick();
        acc -= STEP;
        ticked = true;
        if (rt.ended) break;
      }
      if (ticked || rt.ended) setView(rt.view());
      if (!rt.ended) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [started, rt]);

  useEffect(() => {
    if (!started) return;
    const typing = () => {
      const el = document.activeElement;
      return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
    };
    const down = (e: KeyboardEvent) => {
      if (typing()) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      rt.keyDown(e.key);
    };
    const up = (e: KeyboardEvent) => rt.keyUp(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [started, rt]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    rt.submitAnswer(answer);
    setAnswer("");
  };

  const finishNow = () => {
    rt.endGame();
    setView(rt.view());
  };

  const pad = PAD.filter((k) => keys.includes(k));
  const others = keys.filter((k) => !PAD.includes(k));

  return (
    <div className="space-y-3" data-testid="player-scratch">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
        <span className="tabular-nums" data-testid="scratch-score">
          <b>{Math.round(view.score * 100) / 100}</b>
          <span className="text-[#8B949E]"> / {project.settings.goal} pt</span>
        </span>
        <span className="flex items-center gap-3">
          {project.settings.lives > 0 && (
            <span className="inline-flex gap-0.5" data-testid="scratch-lives">
              {Array.from({ length: project.settings.lives }, (_, i) => (
                <Heart key={i} className={cn("size-4", i < view.lives ? "fill-[#F85149] text-[#F85149]" : "text-[#30363D]")} />
              ))}
            </span>
          )}
          {view.timeLeft !== null && (
            <span className="inline-flex items-center gap-1 tabular-nums text-[#E3B341]">
              <Timer className="size-4" /> {Math.ceil(view.timeLeft)}s
            </span>
          )}
          {view.percent >= 100 && <Flame className="size-4 text-[#F0883E]" />}
        </span>
      </div>

      <StageView view={view} backdrops={project.backdrops} onPointer={(x, y, down) => rt.pointer(x, y, down)} onClick={(x, y) => rt.click(x, y)}>
        {!started && (
          <div className="absolute inset-0 z-[2000] grid place-items-center bg-black/45">
            <Button className="h-11 px-6 text-base" onClick={begin} data-testid="scratch-start">
              <Play className="size-5" /> Gioca
            </Button>
          </div>
        )}
        {view.ended && (
          <div className="absolute inset-0 z-[2000] grid place-items-center bg-black/55 text-lg font-semibold text-white">Fine! {view.percent}%</div>
        )}
      </StageView>

      {view.asking !== null && (
        <form onSubmit={submit} className="flex items-center gap-2" data-testid="scratch-ask">
          <span className="shrink-0 text-sm text-[#C9D1D9]">{view.asking}</span>
          <Input className="h-9" value={answer} onChange={(e) => setAnswer(e.target.value)} autoFocus maxLength={120} data-testid="scratch-answer" />
          <Button type="submit" className="h-9">
            Invia
          </Button>
        </form>
      )}

      {started && !view.ended && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {pad.length > 0 && (
              <div className="flex gap-1.5">
                {PAD.filter((k) => pad.includes(k)).map((k) => (
                  <KeyButton key={k} k={k} onDown={(x) => rt.keyDown(x === "up" ? "ArrowUp" : x === "down" ? "ArrowDown" : x === "left" ? "ArrowLeft" : "ArrowRight")} onUp={(x) => rt.keyUp(x === "up" ? "ArrowUp" : x === "down" ? "ArrowDown" : x === "left" ? "ArrowLeft" : "ArrowRight")} />
                ))}
              </div>
            )}
            {others.map((k) => (
              <KeyButton key={k} k={k} onDown={(x) => rt.keyDown(x === "space" ? " " : x)} onUp={(x) => rt.keyUp(x === "space" ? " " : x)} />
            ))}
          </div>
          <div className="flex gap-2">
            {onStop && (
              <Button variant="outline" className="h-9" onClick={onStop}>
                <Square className="size-4" /> Ferma
              </Button>
            )}
            <Button variant="outline" className="h-9" onClick={finishNow} data-testid="scratch-finish">
              Termina partita
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
