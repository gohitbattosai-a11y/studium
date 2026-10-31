import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Hourglass, Lock, LockOpen, Send } from "lucide-react";
import { useCapsules } from "@/lib/queries";
import { useSealCapsule } from "@/lib/extraActions";
import { addDays, dayDiff } from "@/lib/format";
import type { Capsule } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, EmptyState, LoadError, SectionHeader, SkeletonList } from "@/components/common";

const MAX = 1000;
const MAX_DAYS = 1100;

const longDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return format(new Date(y, m - 1, d), "d MMMM yyyy", { locale: it });
};

const nextOccurrence = (today: string, month: string, day: string) => {
  const year = Number(today.slice(0, 4));
  const candidate = `${year}-${month}-${day}`;
  return candidate > today ? candidate : `${year + 1}-${month}-${day}`;
};

const daysLabel = (n: number) => (n === 1 ? "domani" : `tra ${n} giorni`);

function Composer({ today }: { today: string }) {
  const seal = useSealCapsule();
  const [message, setMessage] = useState("");
  const [openAt, setOpenAt] = useState("");
  const presets = [
    { label: "Tra un mese", value: addDays(today, 30) },
    { label: "31 dicembre", value: nextOccurrence(today, "12", "31") },
    { label: "10 giugno", value: nextOccurrence(today, "06", "10") },
    { label: "Tra un anno", value: addDays(today, 365) },
  ];
  const min = addDays(today, 1);
  const max = addDays(today, MAX_DAYS);
  const valid = message.trim().length > 0 && openAt >= min && openAt <= max;

  const submit = () => {
    if (!valid) return;
    if (!window.confirm(`Sigillare la capsula fino al ${longDate(openAt)}? Non potrai né modificarla né rileggerla prima.`)) return;
    seal.mutate({ message: message.trim(), open_at: openAt });
  };

  return (
    <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-5" data-testid="capsule-composer">
      <div className="flex items-center gap-2">
        <Hourglass className="size-4 text-[#BC8CFF]" />
        <h2 className="text-sm font-medium">Scrivi la tua capsula</h2>
      </div>
      <p className="mt-1 text-xs text-[#8B949E]">Una a testa, per sempre. Dopo la data scelta la leggeranno tutti.</p>
      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="capsule-message">Messaggio</Label>
          <Textarea id="capsule-message" value={message} onChange={(e) => setMessage(e.target.value.slice(0, MAX))} placeholder="Cosa vuoi dire a te e alla classe, nel futuro?" className="min-h-28" data-testid="capsule-message" />
          <p className="text-right text-[11px] text-[#8B949E]">{message.length}/{MAX}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="capsule-date">Si apre il</Label>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setOpenAt(p.value)}
                data-testid={`capsule-preset-${p.value}`}
                className={cn("rounded-full border px-3 py-1 text-xs transition-colors", openAt === p.value ? "border-[#BC8CFF] bg-[#BC8CFF]/15 text-[#D2A8FF]" : "border-[#30363D] text-[#C9D1D9] hover:border-[#58A6FF]/50")}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Input id="capsule-date" type="date" min={min} max={max} value={openAt} onChange={(e) => setOpenAt(e.target.value)} className="max-w-48" data-testid="capsule-date" />
          {openAt >= min && openAt <= max && <p className="text-xs text-[#8B949E]">Si aprirà {longDate(openAt)}.</p>}
        </div>
        <Button disabled={!valid || seal.isPending} onClick={submit} data-testid="capsule-seal">
          <Send className="size-4" /> {seal.isPending ? "Sigillo…" : "Sigilla la capsula"}
        </Button>
      </div>
    </div>
  );
}

function CapsuleCard({ capsule, today }: { capsule: Capsule; today: string }) {
  const left = dayDiff(capsule.open_at, today);
  if (!capsule.is_open) {
    return (
      <article className="rounded-xl border border-dashed border-[#30363D] bg-[#161B22] p-4" data-testid={`capsule-${capsule.id}`}>
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#21262D] text-[#8B949E]">
            <Lock className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-medium">
              <span className="truncate">{capsule.is_mine ? "La tua capsula" : `Capsula di ${capsule.author}`}</span>
            </p>
            <p className="text-xs text-[#8B949E]">Si apre il {longDate(capsule.open_at)} · {daysLabel(left)}</p>
          </div>
        </div>
      </article>
    );
  }
  return (
    <article className="rounded-xl bg-gradient-to-br from-[#2DD4BF]/50 via-[#388BFD]/40 to-[#BC8CFF]/50 p-px" data-testid={`capsule-${capsule.id}`}>
      <div className="rounded-[11px] bg-[#161B22] p-4">
        <div className="flex items-center gap-2.5">
          <Avatar name={capsule.author} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{capsule.is_mine ? "La tua capsula" : capsule.author}</p>
            <p className="flex items-center gap-1 text-xs text-[#8B949E]">
              <LockOpen className="size-3" /> Aperta dal {longDate(capsule.open_at)}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-[#E6EDF3]" data-testid={`capsule-text-${capsule.id}`}>{capsule.message}</p>
      </div>
    </article>
  );
}

export default function CapsulePanel() {
  const capsules = useCapsules();
  if (capsules.isPending) return <SkeletonList />;
  if (capsules.isError || !capsules.data) return <LoadError testId="capsule-error" />;
  const { today, can_write, capsules: list } = capsules.data;
  const sealed = list.filter((c) => !c.is_open);
  const opened = list.filter((c) => c.is_open).sort((a, b) => (a.open_at < b.open_at ? 1 : -1));

  return (
    <section data-testid="capsule-panel">
      <SectionHeader title="Capsula del tempo" subtitle="Messaggi sigillati che si aprono nel giorno scelto." testId="capsule" />
      <div className="space-y-4">
        {can_write && <Composer today={today} />}
        {list.length === 0 ? (
          <EmptyState icon={<Hourglass className="size-5" />} title="Nessuna capsula, per ora" hint="Sii il primo a sigillare un messaggio." testId="capsule-empty" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {opened.map((c) => (
              <CapsuleCard key={c.id} capsule={c} today={today} />
            ))}
            {sealed.map((c) => (
              <CapsuleCard key={c.id} capsule={c} today={today} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
