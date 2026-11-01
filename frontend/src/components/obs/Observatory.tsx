import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { BookMarked, X } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api";
import { errMsg } from "@/lib/format";
import { useHuntActions } from "@/lib/extraActions";
import { useObsActions } from "@/lib/obsActions";
import { queryClient } from "@/lib/queryClient";
import { sfx } from "@/lib/sfx";
import type { ExclusiveInfo, Me, ObsState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/common";
import { SvgArt } from "@/components/art/SvgArt";
import { PetSprite } from "@/components/pets/PetSprite";
import { RARITY } from "@/components/pets/rarity";
import { BackgroundPreview } from "@/components/theme/ThemeBackground";
import { RoomScene } from "./scenes";
import { PUZZLE_UI, Win } from "./puzzles";
import "./obs.css";

function Finale({ me, state }: { me: Me; state: ObsState }) {
  const { equip } = useHuntActions();
  const { pet } = useObsActions();
  const deco = state.rewards.find((r) => r.kind === "decoration");
  const bg = state.rewards.find((r) => r.kind === "background");
  const toggle = (r: ExclusiveInfo) => {
    equip.mutate(
      { kind: r.kind, item_id: r.equipped ? null : r.id },
      {
        onSuccess: (badges) => {
          queryClient.setQueryData<ObsState>(["obs"], (s) =>
            s ? { ...s, rewards: s.rewards.map((x) => ({ ...x, equipped: badges.exclusives.find((e) => e.id === x.id)?.equipped ?? false })) } : s,
          );
        },
      },
    );
  };
  return (
    <div className="mx-auto w-full max-w-3xl pb-10" data-testid="obs-finale">
      <div className="ob-finale relative aspect-video w-full overflow-hidden rounded-2xl border border-[#d9a441]/50 bg-black">
        {bg && <SvgArt kind="backgrounds" id={bg.id} className="absolute inset-0 size-full" />}
        <div className="ob-door absolute inset-0 grid place-items-center pb-6">
          <div className="scale-[3] sm:scale-[4.4]">
            <Avatar name={me.nickname} decoration={deco?.id ?? null} />
          </div>
        </div>
        {state.pet && (
          <div className="absolute right-[8%] bottom-[8%] w-[22%]">
            <PetSprite id={state.pet.id} state="idle" className="w-full" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-3 text-center">
          <p className="ob-glow text-lg tracking-[0.35em] text-[#f6d98a] uppercase sm:text-2xl">Astronomo d'ottone</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {state.rewards.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-[#d9a441]/30 bg-black/50 p-2.5">
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
              <p className="truncate text-sm font-medium text-[#efe6cf]">{r.name}</p>
              <p className="text-[11px] leading-snug text-[#efe6cf]/60">{r.description}</p>
            </div>
            <button type="button" className={cn("ob-btn", r.equipped && "ob-btn-ghost")} disabled={equip.isPending} onClick={() => toggle(r)} data-testid={`obs-equip-${r.id}`}>
              {r.equipped ? "Togli" : "Indossa"}
            </button>
          </div>
        ))}
        {state.pet && (
          <div className="flex items-center gap-3 rounded-xl border border-[#d9a441]/30 bg-black/50 p-2.5">
            <div className="grid size-10 shrink-0 place-items-center">
              <PetSprite id={state.pet.id} state="idle" className="w-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#efe6cf]">{state.pet.name}</p>
              <p className="text-[11px] leading-snug" style={{ color: RARITY[state.pet.rarity].color }}>
                {RARITY[state.pet.rarity].label} · esclusivo, non esce dalle casse
              </p>
            </div>
            <button type="button" className={cn("ob-btn", state.pet.active && "ob-btn-ghost")} disabled={pet.isPending} onClick={() => pet.mutate(!state.pet?.active)} data-testid="obs-equip-pet">
              {state.pet.active ? "Congeda" : "Chiama"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Observatory({ me, open, onClose }: { me: Me; open: boolean; onClose: () => void }) {
  const { open: openDoor, solve } = useObsActions();
  const state = useQuery({ queryKey: ["obs"], queryFn: () => apiGet<ObsState>("/obs"), enabled: false }).data;
  const [view, setView] = useState(0);
  const [notes, setNotes] = useState(false);
  const [fails, setFails] = useState<Record<string, number>>({});
  const [doorKey, setDoorKey] = useState(0);
  const openRef = useRef(openDoor.mutate);
  openRef.current = openDoor.mutate;
  const seen = useRef(0);

  useEffect(() => {
    if (open) openRef.current();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const count = state?.rooms.length ?? 0;
  useEffect(() => {
    if (!count) return;
    if (count > seen.current) {
      if (seen.current) {
        sfx("open");
        setDoorKey((n) => n + 1);
      }
      seen.current = count;
      setView(count - 1);
    }
  }, [count]);

  useEffect(() => {
    if (!open) seen.current = 0;
  }, [open]);

  if (!open) return null;

  const room = state?.rooms[Math.min(view, Math.max(0, count - 1))];
  const finished = !!state?.finished;

  const submit = (puzzle: string) => (taps: string[]) => {
    solve.mutate(
      { puzzle, taps },
      {
        onSuccess: () => sfx("success"),
        onError: (e) => {
          sfx("wrong");
          setFails((f) => ({ ...f, [puzzle]: (f[puzzle] ?? 0) + 1 }));
          toast.error(errMsg(e));
        },
      },
    );
  };

  return createPortal(
    <div className="ob-root fixed inset-0 z-[70] flex flex-col overflow-hidden bg-[#05060d] text-[#efe6cf]" role="dialog" aria-modal="true" aria-label="Osservatorio" data-testid="obs-root">
      <div key={finished ? "fin" : (room?.id ?? "load")} className="ob-door absolute inset-0">
        <RoomScene id={finished ? "cupola" : (room?.id ?? "atrio")} />
      </div>
      <header className="relative z-10 flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-[0.4em] text-[#f6d98a]/70 uppercase">L'Osservatorio</p>
          <p className="truncate text-lg leading-tight tracking-wide text-[#f6d98a]" data-testid="obs-room-title">
            {finished ? "Il cielo è in ordine" : (room?.title ?? "")}
          </p>
        </div>
        {!finished && count > 1 && (
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Stanze">
            {state?.rooms.map((r, i) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={i === view}
                aria-label={r.title}
                onClick={() => setView(i)}
                className={cn("size-3 rotate-45 border border-[#d9a441]", i === view ? "bg-[#f6d98a]" : r.done ? "bg-[#d9a441]/50" : "bg-transparent")}
              />
            ))}
          </div>
        )}
        <button type="button" onClick={() => setNotes((v) => !v)} className="ob-btn ob-btn-ghost !px-3" aria-pressed={notes} data-testid="obs-notes-toggle">
          <BookMarked className="mr-1 inline size-4" />
          {state?.fragments.length ?? 0}
        </button>
        <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full border border-[#d9a441]/50 text-[#f6d98a] hover:bg-white/10" aria-label="Chiudi" data-testid="obs-close">
          <X className="size-4" />
        </button>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 pb-10">
        {!state && <p className="animate-pulse py-24 text-center tracking-[0.6em] text-[#f6d98a]/60">· · ·</p>}

        {state && finished && <Finale me={me} state={state} />}

        {state && !finished && room && (
          <div key={`${room.id}-${doorKey}`} className="ob-rise mx-auto w-full max-w-5xl">
            {view > 0 && state.reveals[view - 1] && <p className="mx-auto mb-4 max-w-xl text-center text-sm text-[#efe6cf]/75 italic">{state.reveals[view - 1]}</p>}
            <div className={cn("grid gap-4", room.puzzles.length > 1 ? "md:grid-cols-2" : "mx-auto max-w-xl", room.puzzles.length === 3 && "lg:grid-cols-3 md:max-w-none")}>
              {room.puzzles.map((p) => {
                const ui = PUZZLE_UI[p.id];
                if (!ui) return null;
                const letter = state.fragments.find((f) => f.puzzle === p.id)?.letter ?? null;
                return (
                  <Win key={p.id} title={p.title} hint={ui.hint} fails={fails[p.id] ?? 0} done={p.solved} letter={letter}>
                    <ui.Comp params={p.params} busy={solve.isPending} fails={fails[p.id] ?? 0} submit={submit(p.id)} fragments={state.fragments} />
                  </Win>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {notes && state && (
        <aside className="ob-rise absolute right-3 bottom-3 z-20 w-[min(22rem,calc(100%-1.5rem))] rounded-2xl border border-[#d9a441]/50 bg-[#0b0a10]/95 p-4 shadow-2xl" data-testid="obs-notes">
          <p className="ob-title !text-left">Taccuino</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {state.fragments.length === 0 && <p className="text-xs text-[#efe6cf]/50 italic">Ancora niente.</p>}
            {state.fragments.map((f) => (
              <span key={f.puzzle} className="ob-plate">
                {f.letter}
              </span>
            ))}
          </div>
          {state.reveals.length > 0 && (
            <ol className="mt-3 space-y-1.5 border-t border-[#d9a441]/25 pt-3 text-xs text-[#efe6cf]/70 italic">
              {state.reveals.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          )}
        </aside>
      )}
    </div>,
    document.body,
  );
}
