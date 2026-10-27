import { useMemo, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, Check, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiPost } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useHomework } from "@/lib/queries";
import { addDays, dueInfo, errMsg, formatDay, relTime } from "@/lib/format";
import type { Homework, HomeworkCreate, Me, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, EmptyState, LoadError, PRIORITY_STYLE, SectionHeader, Segmented, SkeletonList } from "@/components/common";

type Filter = "tutti" | "da-fare" | "completati";
const SUBJECTS = ["Matematica", "Italiano", "Storia", "Inglese", "Fisica", "Latino", "Scienze", "Filosofia", "Arte"];

function HomeworkCard({ h, today, isAdmin }: { h: Homework; today: string; isAdmin: boolean }) {
  const toggle = useMutation({
    mutationFn: () => apiPost<Homework>(`/homework/${h.id}/toggle`),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ["homework"] });
      toast.success(res.completed ? "Segnato come completato per tutta la classe" : "Compito riaperto");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: () => apiDelete<{ ok: boolean }>(`/homework/${h.id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["homework"] });
      toast.success("Compito eliminato");
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const due = dueInfo(h.due_date, today);
  const p = PRIORITY_STYLE[h.priority];

  return (
    <article
      className={cn(
        "group flex gap-3 rounded-lg border border-[#30363D] bg-[#161B22] p-4 transition-colors duration-150 hover:border-[#58A6FF]/40 hover:bg-[#1C2128]",
        h.completed && "opacity-70",
      )}
      data-testid={`homework-card-${h.id}`}
    >
      <button
        type="button"
        onClick={() => toggle.mutate()}
        disabled={toggle.isPending}
        aria-pressed={h.completed}
        aria-label={h.completed ? "Segna come da fare" : "Segna come completato"}
        data-testid={`homework-toggle-${h.id}`}
        className={cn(
          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-150 active:scale-90",
          h.completed ? "border-[#3FB950] bg-[#3FB950] text-[#0D1117]" : "border-[#484F58] hover:border-[#3FB950]",
        )}
      >
        {h.completed && <Check className="size-3.5" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded border border-[#30363D] bg-[#21262D] px-1.5 py-0.5 text-xs font-medium text-[#C9D1D9]" data-testid={`homework-subject-${h.id}`}>{h.subject}</span>
          <span className={cn("rounded border px-1.5 py-0.5 text-xs", p.cls)}>{p.label}</span>
          <span
            className={cn(
              "ml-auto text-xs",
              h.completed ? "text-[#8B949E]" : due.tone === "late" || due.tone === "today" ? "text-[#FFA198]" : due.tone === "soon" ? "text-[#E3B341]" : "text-[#8B949E]",
            )}
            title={formatDay(h.due_date)}
            data-testid={`homework-due-${h.id}`}
          >
            {due.label}
          </span>
          {isAdmin && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Elimina compito"
              disabled={remove.isPending}
              onClick={() => window.confirm("Eliminare questo compito?") && remove.mutate()}
              data-testid={`homework-delete-${h.id}`}
            >
              <Trash2 className="size-4 text-[#8B949E]" />
            </Button>
          )}
        </div>
        <p className={cn("mt-2 text-[15px] leading-relaxed whitespace-pre-wrap", h.completed && "text-[#8B949E] line-through decoration-[#484F58]")} data-testid={`homework-description-${h.id}`}>
          {h.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8B949E]">
          <span className="flex items-center gap-1.5" data-testid={`homework-author-${h.id}`}>
            <Avatar name={h.author} size="sm" /> di <b className="font-medium text-[#C9D1D9]">{h.author}</b> · {relTime(h.created_at)}
          </span>
          {h.completed && h.completed_by && (
            <span className="text-[#7EE787]" data-testid={`homework-completed-by-${h.id}`}>✓ completato da {h.completed_by}</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function HomeworkPanel({ me }: { me: Me }) {
  const homework = useHomework();
  const [filter, setFilter] = useState<Filter>("da-fare");
  const [open, setOpen] = useState(false);
  // Draft lives here (panel never unmounts), so it survives tab switches and dialog closes.
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState(() => addDays(me.today, 1));
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("media");

  const create = useMutation({
    mutationFn: (body: HomeworkCreate) => apiPost<Homework>("/homework", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["homework"] });
      toast.success("Compito pubblicato");
      setSubject("");
      setDescription("");
      setPriority("media");
      setOpen(false);
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate({ subject: subject.trim(), due_date: dueDate, description: description.trim(), priority });
  };

  const all = homework.data ?? [];
  const counts = { tutti: all.length, "da-fare": all.filter((h) => !h.completed).length, completati: all.filter((h) => h.completed).length };
  const visible = all.filter((h) => (filter === "tutti" ? true : filter === "da-fare" ? !h.completed : h.completed));
  const subjects = useMemo(() => Array.from(new Set([...SUBJECTS, ...all.map((h) => h.subject)])), [all]);

  return (
    <div>
      <SectionHeader
        title="Compiti & Agenda"
        subtitle="Una spunta vale per tutta la classe."
        testId="homework"
        action={
          <Button onClick={() => setOpen(true)} className="h-9 gap-1.5" data-testid="add-homework-button">
            <Plus className="size-4" /> <span className="hidden sm:inline">Nuovo compito</span><span className="sm:hidden">Nuovo</span>
          </Button>
        }
      />

      <div className="no-scrollbar -mx-4 mb-4 overflow-x-auto px-4">
        <Segmented
          value={filter}
          onChange={setFilter}
          testId="homework-filter"
          options={[
            { value: "tutti", label: <>Tutti <span className="ml-1 text-xs text-[#8B949E]">{counts.tutti}</span></> },
            { value: "da-fare", label: <>Da fare <span className="ml-1 text-xs text-[#8B949E]">{counts["da-fare"]}</span></> },
            { value: "completati", label: <>Completati <span className="ml-1 text-xs text-[#8B949E]">{counts.completati}</span></> },
          ]}
        />
      </div>

      {homework.isPending ? (
        <SkeletonList />
      ) : homework.isError ? (
        <LoadError testId="homework-error" />
      ) : visible.length === 0 ? (
        <EmptyState icon={<BookOpen className="size-5" />} title={filter === "completati" ? "Nessun compito completato" : "Nessun compito qui"} hint="Aggiungi il primo compito per la classe." testId="homework-empty" />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2" data-testid="homework-list">
          {visible.map((h) => (
            <HomeworkCard key={h.id} h={h} today={me.today} isAdmin={me.role === "admin"} />
          ))}
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-[#8B949E]">
        <ShieldCheck className="size-3.5" /> Solo gli admin possono eliminare i compiti: l'autore resta sempre visibile.
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" data-testid="homework-dialog">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>Nuovo compito</DialogTitle>
              <DialogDescription>Pubblicato come <b className="text-[#C9D1D9]">{me.nickname}</b>. Solo gli admin possono eliminarlo.</DialogDescription>
            </DialogHeader>
            <div className="my-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hw-subject">Materia</Label>
                  <Input id="hw-subject" list="hw-subjects" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="es. Matematica" required maxLength={40} data-testid="homework-subject-input" />
                  <datalist id="hw-subjects">
                    {subjects.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hw-due">Scadenza</Label>
                  <Input id="hw-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required data-testid="homework-due-input" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hw-desc">Descrizione</Label>
                <Textarea id="hw-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="es. Pag. 214 esercizi 12-25" required maxLength={1000} rows={3} data-testid="homework-description-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Priorità</Label>
                <Segmented
                  value={priority}
                  onChange={setPriority}
                  testId="homework-priority"
                  className="w-full"
                  options={[
                    { value: "bassa", label: "Bassa", activeClass: PRIORITY_STYLE.bassa.cls },
                    { value: "media", label: "Media", activeClass: PRIORITY_STYLE.media.cls },
                    { value: "alta", label: "Alta", activeClass: PRIORITY_STYLE.alta.cls },
                  ]}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="homework-cancel-button">Chiudi</Button>
              <Button type="submit" disabled={create.isPending} data-testid="homework-submit-button">
                {create.isPending ? "Pubblico…" : "Pubblica compito"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
