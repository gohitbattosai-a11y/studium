import { useEffect, useRef, useState } from "react";
import { Coffee, Play, Square, Timer, Users } from "lucide-react";
import { useStudio } from "@/lib/queries";
import { pingStudio, useStudioActions } from "@/lib/extraActions";
import { queryClient } from "@/lib/queryClient";
import type { Me, StudyMode, StudyPhase } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, EmptyState, LoadError, SectionHeader, Segmented, SkeletonList } from "@/components/common";

const MODE_LABEL: Record<StudyMode, string> = { pomodoro: "Pomodoro 25 + 5", lungo: "Lungo 50 + 10" };
const RING = 2 * Math.PI * 88;

const clock = (s: number) => {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

const spent = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
};

function useTick(ms: number, enabled: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms, enabled]);
  return now;
}

const phaseText = (p: StudyPhase) => (p === "focus" ? "Studia" : "In pausa");

export default function StudioPanel({ me, active }: { me: Me; active: boolean }) {
  const studio = useStudio();
  const { start, stop } = useStudioActions();
  const [mode, setMode] = useState<StudyMode>("pomodoro");
  const now = useTick(1000, active);
  const fetchedAt = studio.dataUpdatedAt;
  const mine = studio.data?.mine ?? null;
  const flipped = useRef<number>(0);

  const left = mine ? Math.max(0, Math.ceil(mine.remaining_s - (now - fetchedAt) / 1000)) : 0;
  const total = mine ? (mine.phase === "focus" ? mine.focus_s : mine.break_s) : 1;
  const progress = mine ? 1 - left / total : 0;

  useEffect(() => {
    if (!mine) return;
    const id = window.setInterval(() => void pingStudio(), 45_000);
    void pingStudio();
    return () => window.clearInterval(id);
  }, [mine?.started_ts]);

  useEffect(() => {
    if (!mine || left > 0 || flipped.current === fetchedAt) return;
    flipped.current = fetchedAt;
    void pingStudio().then(() => queryClient.invalidateQueries({ queryKey: ["studio"] }));
  }, [mine, left, fetchedAt]);

  if (studio.isPending) return <SkeletonList />;
  if (studio.isError || !studio.data) return <LoadError testId="studio-error" />;
  const data = studio.data;
  const others = data.active.filter((a) => a.nickname !== me.nickname);
  const count = data.active.length;
  const focus = mine?.phase === "focus";

  return (
    <section data-testid="studio-panel">
      <SectionHeader title="Sala studio" subtitle="Un timer, tanti compagni. Qui conta esserci." testId="studio" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-5">
          <div className="mx-auto grid w-full max-w-[260px] place-items-center">
            <div className="relative aspect-square w-full">
              <svg viewBox="0 0 200 200" className="size-full -rotate-90">
                <defs>
                  <linearGradient id="studio-focus" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#388BFD" />
                    <stop offset="1" stopColor="#BC8CFF" />
                  </linearGradient>
                  <linearGradient id="studio-break" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#2DD4BF" />
                    <stop offset="1" stopColor="#3FB950" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="88" fill="none" stroke="#21262D" strokeWidth="10" />
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke={mine ? (focus ? "url(#studio-focus)" : "url(#studio-break)") : "transparent"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={RING}
                  strokeDashoffset={RING * (1 - progress)}
                  className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 grid place-content-center text-center">
                {mine ? (
                  <>
                    <span className="flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#8B949E]">
                      {focus ? <Timer className="size-3.5" /> : <Coffee className="size-3.5" />}
                      {phaseText(mine.phase)}
                    </span>
                    <span className="font-mono text-5xl font-semibold tabular-nums" data-testid="studio-clock">{clock(left)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-medium uppercase tracking-wider text-[#8B949E]">Pronto</span>
                    <span className="font-mono text-5xl font-semibold tabular-nums text-[#484F58]">{clock(mode === "pomodoro" ? 1500 : 3000)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center gap-3">
            {mine ? (
              <Button variant="outline" disabled={stop.isPending} onClick={() => stop.mutate()} data-testid="studio-stop">
                <Square className="size-4" /> Termina sessione
              </Button>
            ) : (
              <>
                <Segmented
                  value={mode}
                  onChange={setMode}
                  options={(Object.keys(MODE_LABEL) as StudyMode[]).map((m) => ({ value: m, label: MODE_LABEL[m] }))}
                  testId="studio-mode"
                />
                <Button disabled={start.isPending} onClick={() => start.mutate(mode)} data-testid="studio-start">
                  <Play className="size-4" /> Entra in sessione
                </Button>
              </>
            )}
            <p className="text-xs text-[#8B949E]" data-testid="studio-total">Hai studiato {spent(data.study_seconds)} in tutto.</p>
          </div>
        </div>

        <aside className="rounded-xl border border-[#30363D] bg-[#161B22] p-5" data-testid="studio-presence">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-[#58A6FF]" />
            <h2 className="text-sm font-medium" data-testid="studio-count">
              {count === 0 ? "Nessuno in sessione" : count === 1 ? "1 persona in sessione" : `${count} persone in sessione`}
            </h2>
          </div>
          {count === 0 ? (
            <div className="mt-4">
              <EmptyState icon={<Timer className="size-5" />} title="La sala è vuota" hint="Inizia tu: qualcuno ti raggiungerà." testId="studio-empty" />
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {mine && (
                <li className="flex items-center gap-2.5 rounded-lg bg-[#388BFD]/10 px-2 py-1.5 text-sm" data-testid="studio-row-me">
                  <Avatar name={me.nickname} />
                  <span className="min-w-0 flex-1 truncate">{me.nickname} <span className="text-xs text-[#8B949E]">(tu)</span></span>
                  <span className={cn("text-xs", focus ? "text-[#79B8FF]" : "text-[#7EE787]")}>{phaseText(mine.phase)}</span>
                </li>
              )}
              {others.map((a) => {
                const rest = Math.max(0, Math.ceil(a.remaining_s - (now - fetchedAt) / 1000));
                return (
                  <li key={a.member_id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm" data-testid={`studio-row-${a.nickname}`}>
                    <Avatar name={a.nickname} />
                    <span className="min-w-0 flex-1 truncate">{a.nickname}</span>
                    <span className={cn("text-xs", a.phase === "focus" ? "text-[#79B8FF]" : "text-[#7EE787]")}>{phaseText(a.phase)}</span>
                    <span className="w-11 text-right font-mono text-xs tabular-nums text-[#8B949E]">{clock(rest)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}
