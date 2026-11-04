import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, BookOpen, FolderOpen, Gamepad2, KeyRound, LayoutGrid, Megaphone, ShoppingBag, X } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useHuntActions } from "@/lib/extraActions";
import { queryClient } from "@/lib/queryClient";
import type { ExclusiveInfo, HuntState, Me } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/common";
import { SvgArt } from "@/components/art/SvgArt";
import { BackgroundPreview } from "@/components/theme/ThemeBackground";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { OBS_SEQUENCE, OBS_WINDOW } from "../obs/entry";
import { SCENES } from "./scenes";
import "./hunt.css";

const TAPS = 7;
const WINDOW_MS = 4000;
const PLAY_START = 900;
const PLAY_STEP = 800;
const PLAY_ON = 520;

export function SecretLogo({ onOpen, children }: { onOpen: () => void; children: ReactNode }) {
  const taps = useRef<number[]>([]);
  const tap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < WINDOW_MS), now];
    if (taps.current.length >= TAPS) {
      taps.current = [];
      onOpen();
    }
  };
  return (
    <div onClick={tap} className="touch-manipulation select-none">
      {children}
    </div>
  );
}

const ROUTE_ICONS = { home: LayoutGrid, compiti: BookOpen, sondaggi: BarChart3, materiali: FolderOpen, bacheca: Megaphone, giochi: Gamepad2, shop: ShoppingBag } as const;

function Finale({ me, rewards }: { me: Me; rewards: ExclusiveInfo[] }) {
  const { equip } = useHuntActions();
  const [route, setRoute] = useState(false);
  const deco = rewards.find((r) => r.kind === "decoration");
  const bg = rewards.find((r) => r.kind === "background");
  const toggle = (r: ExclusiveInfo) => {
    equip.mutate(
      { kind: r.kind, item_id: r.equipped ? null : r.id },
      {
        onSuccess: (badges) => {
          queryClient.setQueryData<HuntState>(["hunt"], (s) =>
            s ? { ...s, rewards: s.rewards.map((x) => ({ ...x, equipped: badges.exclusives.find((e) => e.id === x.id)?.equipped ?? false })) } : s,
          );
        },
      },
    );
  };
  return (
    <div data-testid="secret-finale">
      <div className="hx-finale relative aspect-video w-full overflow-hidden bg-black">
        {bg && <SvgArt kind="backgrounds" id={bg.id} className="absolute inset-0 size-full" />}
        <div className="hx-reveal absolute inset-0 grid place-items-center pb-6">
          <div className="scale-[3] sm:scale-[4.4]">
            <Avatar name={me.nickname} decoration={deco?.id ?? null} />
          </div>
        </div>
        <button type="button" onClick={() => setRoute(true)} className="hx-twinkle absolute top-[7%] right-[9%] grid size-7 place-items-center rounded-full text-[#e0f2fe] opacity-40 outline-none hover:opacity-100 focus-visible:opacity-100" aria-label="Una stella diversa dalle altre" data-testid="secret-route-star">
          <span className="block size-1.5 rotate-45 bg-current shadow-[0_0_10px_2px_rgba(186,230,253,0.8)]" />
        </button>
        {route && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#020611]/85 p-4 backdrop-blur-sm" data-testid="secret-route">
            <div className="relative w-full max-w-md rounded-xl border border-sky-200/30 bg-[#06101f] p-4 text-center">
              <button type="button" onClick={() => setRoute(false)} className="absolute top-2 right-2 grid size-7 place-items-center rounded-full text-sky-100/70 hover:bg-white/10" aria-label="Chiudi">
                <X className="size-4" />
              </button>
              <p className="text-[11px] tracking-[0.3em] text-sky-200/80 uppercase">Rotta verso il fondo</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
                {OBS_SEQUENCE.map((id, i) => {
                  const Icon = ROUTE_ICONS[id];
                  return (
                    <span key={i} className="flex items-center gap-1">
                      <span className="grid size-9 place-items-center rounded-lg border border-sky-200/30 bg-sky-200/10 text-sky-100">
                        <Icon className="size-4" />
                      </span>
                      {i < OBS_SEQUENCE.length - 1 && <span className="text-xs text-sky-200/40">›</span>}
                    </span>
                  );
                })}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-sky-100/70 italic">Otto porte, una dopo l'altra, senza fermarti. Hai {Math.round(OBS_WINDOW / 1000)} secondi prima che il mare si richiuda.</p>
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-3 text-center">
          <p className="hx-glow-text font-serif text-lg tracking-[0.35em] text-[#fde68a] uppercase sm:text-2xl">Custode del segreto</p>
          <p className="mt-1 text-[10px] tracking-[0.25em] text-white/45 uppercase">Una stella, in alto, non brilla come le altre</p>
        </div>
      </div>
      <div className="space-y-2 bg-[#07050f] p-4">
        {rewards.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
            {r.kind === "background" ? (
              <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md">
                <BackgroundPreview id={r.id} />
              </div>
            ) : (
              <div className="grid size-10 shrink-0 place-items-center">
                <Avatar name={me.nickname} decoration={r.id} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#E6EDF3]">{r.name}</p>
              <p className="text-[11px] leading-snug text-[#8B949E]">{r.description}</p>
            </div>
            <Button size="sm" variant={r.equipped ? "outline" : "default"} disabled={equip.isPending} onClick={() => toggle(r)} data-testid={`secret-equip-${r.id}`}>
              {r.equipped ? "Togli" : "Indossa"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SecretPassage({ me, open, onOpenChange }: { me: Me; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { knock, solve } = useHuntActions();
  const state = useQuery({ queryKey: ["hunt"], queryFn: () => apiGet<HuntState>("/hunt"), enabled: false }).data;
  const [taps, setTaps] = useState<string[]>([]);
  const [digits, setDigits] = useState<number[]>([0, 0, 0, 0]);
  const [lit, setLit] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [replay, setReplay] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const knockRef = useRef(knock.mutate);
  knockRef.current = knock.mutate;

  const scene = state?.scene ?? null;
  const seqKey = state?.sequence?.join(",") ?? "";

  useEffect(() => {
    if (open) knockRef.current();
  }, [open]);

  useEffect(() => {
    setTaps([]);
    setDigits([0, 0, 0, 0]);
  }, [scene]);

  useEffect(() => {
    if (scene !== "eco" || !seqKey) return;
    const seq = seqKey.split(",");
    const timers: number[] = [];
    setPlaying(true);
    seq.forEach((id, i) => {
      timers.push(window.setTimeout(() => setLit(id), PLAY_START + i * PLAY_STEP));
      timers.push(window.setTimeout(() => setLit(null), PLAY_START + i * PLAY_STEP + PLAY_ON));
    });
    timers.push(window.setTimeout(() => setPlaying(false), PLAY_START + seq.length * PLAY_STEP));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      setLit(null);
      setPlaying(false);
    };
  }, [scene, seqKey, replay]);

  const buzz = () => {
    setShaking(true);
    window.setTimeout(() => setShaking(false), 500);
  };

  const submit = (list: string[]) => {
    solve.mutate(list, {
      onSuccess: () => {
        setFlashing(true);
        window.setTimeout(() => setFlashing(false), 800);
      },
      onError: () => {
        buzz();
        setTaps([]);
        if (scene === "eco") window.setTimeout(() => setReplay((n) => n + 1), 600);
      },
    });
  };

  const tap = (id: string) => {
    if (!state || state.finished || solve.isPending || playing) return;
    if (state.kind === "pick") {
      setTaps([id]);
      submit([id]);
      return;
    }
    if (state.kind === "order") {
      if (taps.includes(id)) return;
      const next = [...taps, id];
      setTaps(next);
      if (next.length >= state.length) submit(next);
      return;
    }
    if (state.kind === "sequence") {
      setLit(id);
      window.setTimeout(() => setLit(null), 260);
      const next = [...taps, id];
      setTaps(next);
      if (next.length >= state.length) submit(next);
    }
  };

  const bump = (index: number, delta: number) => {
    setDigits((d) => d.map((v, i) => (i === index ? (v + delta + 10) % 10 : v)));
  };

  const Scene = scene ? SCENES[scene] : null;
  const hint = state?.solved[state.solved.length - 1]?.reveal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden border border-[#BC8CFF]/25 bg-black p-0 sm:max-w-3xl" data-testid="secret-dialog">
        <DialogTitle className="sr-only">Il passaggio</DialogTitle>
        <DialogDescription className="sr-only">Passaggio segreto</DialogDescription>

        {!state && <p className="animate-pulse py-24 text-center font-mono text-sm tracking-[0.5em] text-[#6E7681]">· · ·</p>}

        {state?.finished && <Finale me={me} rewards={state.rewards} />}

        {state && !state.finished && Scene && (
          <>
            <div className="relative bg-black">
              <div key={scene} className="hx-enter">
                <div className={cn(shaking && "hx-shake")} data-testid={`hunt-scene-${scene}`}>
                  <Scene taps={taps} onTap={tap} lit={lit} digits={digits} onDigit={bump} />
                </div>
              </div>
              {flashing && <div className="hx-flash pointer-events-none absolute inset-0" />}
            </div>
            <div className="space-y-3 border-t border-white/10 bg-[#07050f] p-4">
              <div className="flex items-center gap-1.5" aria-hidden>
                {state.solved.map((s) => (
                  <span key={s.title} className="size-2 rotate-45 bg-gradient-to-br from-[#fde68a] to-[#c084fc]" />
                ))}
                <span className="size-2 rotate-45 border border-[#6E7681]" />
              </div>
              {hint && (
                <p className="text-sm leading-relaxed text-[#E6EDF3] italic" data-testid="secret-hint">
                  {hint}
                </p>
              )}
              {state.kind === "code" && (
                <Button onClick={() => submit(digits.map(String))} disabled={solve.isPending} data-testid="secret-key">
                  <KeyRound className="size-4" /> Gira la chiave
                </Button>
              )}
              {state.kind === "sequence" && (
                <Button variant="outline" onClick={() => setReplay((n) => n + 1)} disabled={playing || solve.isPending} data-testid="secret-replay">
                  Rivedi la sequenza
                </Button>
              )}
              {state.solved.length > 1 && (
                <details className="text-xs text-[#6E7681]">
                  <summary className="cursor-pointer select-none">Indizi raccolti</summary>
                  <ol className="mt-2 space-y-1.5 italic">
                    {state.solved.map((s) => (
                      <li key={s.title}>{s.reveal}</li>
                    ))}
                  </ol>
                </details>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
