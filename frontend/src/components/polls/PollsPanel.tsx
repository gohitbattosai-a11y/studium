import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { BarChart3, Check, EyeOff, Plus, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiPost } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { usePolls } from "@/lib/queries";
import { errMsg, relTime } from "@/lib/format";
import type { Me, Poll, PollCreate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, EmptyState, LoadError, SectionHeader, Segmented, SkeletonList } from "@/components/common";

function PollCard({ poll, isAdmin }: { poll: Poll; isAdmin: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const voted = poll.my_vote !== null;
  const vote = useMutation({
    mutationFn: (option_id: string) => apiPost<Poll>(`/polls/${poll.id}/vote`, { option_id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast.success(voted ? "Voto modificato" : "Voto registrato");
      setSelected(null);
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: () => apiDelete<{ ok: boolean }>(`/polls/${poll.id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast.success("Sondaggio eliminato");
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  return (
    <article className="rounded-xl border border-[#30363D] bg-[#161B22] p-5" data-testid={`poll-card-${poll.id}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {poll.anonymous ? (
          <span className="flex items-center gap-1 rounded border border-[#BC8CFF]/25 bg-[#BC8CFF]/12 px-1.5 py-0.5 text-[#D2A8FF]" data-testid={`poll-mode-${poll.id}`}>
            <EyeOff className="size-3" /> Voto anonimo
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded border border-[#388BFD]/25 bg-[#388BFD]/12 px-1.5 py-0.5 text-[#79B8FF]" data-testid={`poll-mode-${poll.id}`}>
            <Users className="size-3" /> Voto palese
          </span>
        )}
        <span className="text-[#8B949E]">di <b className="font-medium text-[#C9D1D9]">{poll.author}</b> · {relTime(poll.created_at)}</span>
        {isAdmin && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            aria-label="Elimina sondaggio"
            disabled={remove.isPending}
            onClick={() => window.confirm("Eliminare questo sondaggio?") && remove.mutate()}
            data-testid={`poll-delete-${poll.id}`}
          >
            <Trash2 className="size-4 text-[#8B949E]" />
          </Button>
        )}
      </div>
      <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight" data-testid={`poll-question-${poll.id}`}>{poll.question}</h3>

      <div className="mt-4 space-y-2" role="radiogroup">
        {poll.options.map((o) => {
          const pct = poll.total_votes ? Math.round((o.votes / poll.total_votes) * 100) : 0;
          const mine = poll.my_vote === o.id;
          const isSel = (selected ?? poll.my_vote) === o.id;
          return (
            <div key={o.id}>
              <button
                type="button"
                role="radio"
                aria-checked={isSel}
                disabled={vote.isPending}
                onClick={() => setSelected(o.id)}
                data-testid={`poll-option-${o.id}`}
                className={cn(
                  "relative w-full overflow-hidden rounded-md border px-3 py-2.5 text-left transition-colors duration-150",
                  "hover:border-[#58A6FF]/50",
                  isSel ? "border-[#58A6FF] bg-[#388BFD]/8" : mine ? "border-[#388BFD]/60" : "border-[#30363D]",
                )}
              >
                <span
                  className={cn("absolute inset-y-0 left-0 animate-bar-grow transition-[width] duration-500 ease-out", mine ? "bg-[#388BFD]/22" : "bg-[#21262D]")}
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
                <span className="relative flex items-center gap-3">
                  <span className={cn("grid size-4 shrink-0 place-items-center rounded-full border", isSel ? "border-[#58A6FF]" : "border-[#484F58]")}>
                    {isSel && <span className="size-2 rounded-full bg-[#58A6FF]" />}
                  </span>
                  <span className="min-w-0 flex-1 text-sm">{o.text}{mine && <span className="ml-2 text-xs text-[#58A6FF]">il tuo voto</span>}</span>
                  <span className="shrink-0 font-mono text-xs text-[#C9D1D9]" data-testid={`poll-option-pct-${o.id}`}>{pct}%</span>
                  <span className="w-6 shrink-0 text-right font-mono text-xs text-[#8B949E]">{o.votes}</span>
                </span>
              </button>
              {!poll.anonymous && o.voters.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1 pl-1" data-testid={`poll-voters-${o.id}`}>
                  {o.voters.map((v) => (
                    <span key={v} className="flex items-center gap-1 rounded-full bg-[#21262D] py-0.5 pr-2 pl-0.5 text-[11px] text-[#C9D1D9]">
                      <Avatar name={v} size="sm" /> {v}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[#8B949E]" data-testid={`poll-total-${poll.id}`}>{poll.total_votes} {poll.total_votes === 1 ? "voto" : "voti"} totali</span>
        {selected && selected !== poll.my_vote ? (
          <Button size="sm" disabled={vote.isPending} onClick={() => vote.mutate(selected)} data-testid={`poll-vote-button-${poll.id}`}>
            {vote.isPending ? "Invio…" : voted ? "Cambia voto" : "Conferma voto"}
          </Button>
        ) : voted ? (
          <span className="flex items-center gap-1.5 text-xs text-[#8B949E]" data-testid={`poll-locked-${poll.id}`}>
            <Check className="size-3.5" /> Hai votato · puoi cambiare voto
          </span>
        ) : null}
      </div>
    </article>
  );
}

export default function PollsPanel({ me }: { me: Me }) {
  const polls = usePolls();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [visibility, setVisibility] = useState<"palese" | "anonimo">("palese");

  const create = useMutation({
    mutationFn: (body: PollCreate) => apiPost<Poll>("/polls", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast.success("Sondaggio pubblicato");
      setQuestion("");
      setOptions(["", ""]);
      setVisibility("palese");
      setOpen(false);
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const clean = options.map((o) => o.trim()).filter(Boolean);
    if (clean.length < 2) {
      toast.error("Servono almeno due opzioni");
      return;
    }
    create.mutate({ question: question.trim(), options: clean, anonymous: visibility === "anonimo" });
  };

  const list = polls.data ?? [];

  return (
    <div>
      <SectionHeader
        title="Sondaggi di classe"
        subtitle="Voto palese per turni e interrogazioni, anonimo per le preferenze."
        testId="polls"
        action={
          <Button onClick={() => setOpen(true)} className="h-9 gap-1.5" data-testid="add-poll-button">
            <Plus className="size-4" /> <span className="hidden sm:inline">Nuovo sondaggio</span><span className="sm:hidden">Nuovo</span>
          </Button>
        }
      />

      {polls.isPending ? (
        <SkeletonList rows={2} />
      ) : polls.isError ? (
        <LoadError testId="polls-error" />
      ) : list.length === 0 ? (
        <EmptyState icon={<BarChart3 className="size-5" />} title="Nessun sondaggio" hint="Crea il primo sondaggio per la classe." testId="polls-empty" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2" data-testid="polls-list">
          {list.map((p) => (
            <PollCard key={p.id} poll={p} isAdmin={me.role === "admin"} />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" data-testid="poll-dialog">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>Nuovo sondaggio</DialogTitle>
              <DialogDescription>Solo gli admin possono eliminarlo. Puoi cambiare il tuo voto quando vuoi.</DialogDescription>
            </DialogHeader>
            <div className="my-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="poll-question">Domanda</Label>
                <Input id="poll-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="es. Chi si offre per l'interrogazione di lunedì?" required minLength={3} maxLength={200} data-testid="poll-question-input" />
              </div>
              <div className="space-y-1.5">
                <Label>Opzioni</Label>
                <div className="space-y-2">
                  {options.map((o, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={o}
                        onChange={(e) => setOptions((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                        placeholder={`Opzione ${i + 1}`}
                        maxLength={100}
                        data-testid={`poll-option-input-${i}`}
                      />
                      {options.length > 2 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))} aria-label="Rimuovi opzione" data-testid={`poll-option-remove-${i}`}>
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {options.length < 8 && (
                  <Button type="button" variant="ghost" size="sm" className="mt-1 gap-1 text-[#58A6FF]" onClick={() => setOptions((prev) => [...prev, ""])} data-testid="poll-add-option-button">
                    <Plus className="size-3.5" /> Aggiungi opzione
                  </Button>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Tipo di voto</Label>
                <Segmented
                  value={visibility}
                  onChange={setVisibility}
                  testId="poll-visibility"
                  className="w-full"
                  options={[
                    { value: "palese", label: <span className="flex items-center justify-center gap-1.5"><Users className="size-3.5" /> Voto palese</span> },
                    { value: "anonimo", label: <span className="flex items-center justify-center gap-1.5"><EyeOff className="size-3.5" /> Voto anonimo</span> },
                  ]}
                />
                <p className="text-xs text-[#8B949E]">{visibility === "palese" ? "Tutti vedranno chi ha scelto cosa." : "Si vedranno solo i totali, mai i nomi."}</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="poll-cancel-button">Chiudi</Button>
              <Button type="submit" disabled={create.isPending} data-testid="poll-submit-button">{create.isPending ? "Pubblico…" : "Pubblica sondaggio"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
