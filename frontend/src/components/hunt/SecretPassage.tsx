import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useHuntActions } from "@/lib/extraActions";
import { queryClient } from "@/lib/queryClient";
import type { HuntState, Me } from "@/lib/types";
import { Avatar } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const TAPS = 7;
const WINDOW_MS = 4000;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

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

export default function SecretPassage({ me, open, onOpenChange }: { me: Me; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { knock, answer, equip } = useHuntActions();
  const [word, setWord] = useState("");
  const state = useQuery({ queryKey: ["hunt"], queryFn: () => apiGet<HuntState>("/hunt"), enabled: false }).data;
  const knockRef = useRef(knock.mutate);
  knockRef.current = knock.mutate;

  useEffect(() => {
    if (open) knockRef.current();
  }, [open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = word.trim();
    if (!value) return;
    answer.mutate(value, { onSuccess: () => setWord("") });
  };

  const toggle = (reward: NonNullable<HuntState["reward"]>) => {
    equip.mutate(reward.equipped ? null : reward.id, {
      onSuccess: (badges) => {
        const now = badges.exclusives.find((x) => x.id === reward.id)?.equipped ?? false;
        queryClient.setQueryData<HuntState>(["hunt"], (s) => (s && s.reward ? { ...s, reward: { ...s.reward, equipped: now } } : s));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto border border-[#BC8CFF]/25 bg-[#0B0E14] sm:max-w-md" data-testid="secret-dialog">
        <DialogHeader>
          <DialogTitle className="font-mono text-base tracking-[0.5em] text-[#D2A8FF]">· · ·</DialogTitle>
          <DialogDescription className="sr-only">Passaggio segreto</DialogDescription>
        </DialogHeader>

        {!state ? (
          <p className="animate-pulse py-6 text-center font-mono text-sm text-[#6E7681]">…</p>
        ) : (
          <div className="space-y-4">
            <ol className="space-y-3" data-testid="secret-log">
              {state.solved.map((line, i) => {
                const last = i === state.solved.length - 1 && !state.finished;
                return (
                  <li key={line.title} className="flex gap-3">
                    <span className="w-6 shrink-0 pt-0.5 text-right font-mono text-xs text-[#6E7681]">{ROMAN[i] ?? i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6E7681]">{line.title}</p>
                      <p className={last ? "mt-0.5 text-sm leading-relaxed text-[#E6EDF3] italic" : "mt-0.5 text-sm leading-relaxed text-[#6E7681] italic"}>{line.reveal}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {state.needs_code && (
              <form onSubmit={submit} className="flex gap-2" data-testid="secret-form">
                <Input value={word} onChange={(e) => setWord(e.target.value)} maxLength={60} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Sussurra…" className="font-mono" data-testid="secret-input" />
                <Button type="submit" disabled={answer.isPending || !word.trim()} data-testid="secret-submit">
                  Invia
                </Button>
              </form>
            )}

            {!state.needs_code && !state.finished && <p className="text-center text-xs text-[#6E7681]">Ora servono i fatti, non le parole.</p>}

            {state.finished && state.reward && (
              <div className="rounded-xl bg-gradient-to-br from-[#FDE68A]/60 via-[#C084FC]/50 to-[#7C3AED]/60 p-px" data-testid="secret-reward">
                <div className="flex items-center gap-4 rounded-[11px] bg-[#0B0E14] p-4">
                  <div className="grid size-16 shrink-0 place-items-center">
                    <Avatar name={me.nickname} decoration={state.reward.id} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{state.reward.name}</p>
                    <p className="text-xs leading-snug text-[#8B949E]">{state.reward.description}</p>
                    <Button size="sm" className="mt-2" variant={state.reward.equipped ? "outline" : "default"} disabled={equip.isPending} onClick={() => state.reward && toggle(state.reward)} data-testid="secret-equip">
                      {state.reward.equipped ? "Togli" : "Indossa"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
