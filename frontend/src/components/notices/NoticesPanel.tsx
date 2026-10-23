import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useNotices } from "@/lib/queries";
import { errMsg, relTime } from "@/lib/format";
import type { Notice, NoticeCreate, NoticeTag } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, EmptyState, LoadError, NOTICE_TAG_STYLE, SectionHeader, Segmented, SkeletonList } from "@/components/common";

export default function NoticesPanel() {
  const notices = useNotices();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<NoticeTag>("avviso");

  const create = useMutation({
    mutationFn: (b: NoticeCreate) => apiPost<Notice>("/notices", b),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success("Avviso pubblicato in bacheca");
      setTitle("");
      setBody("");
      setTag("avviso");
      setOpen(false);
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate({ title: title.trim(), body: body.trim(), tag });
  };

  const list = notices.data ?? [];

  return (
    <div className="max-w-3xl">
      <SectionHeader
        title="Bacheca avvisi"
        subtitle="Comunicazioni trasparenti per tutta la classe."
        testId="notices"
        action={
          <Button onClick={() => setOpen(true)} className="h-9 gap-1.5" data-testid="add-notice-button">
            <Plus className="size-4" /> <span className="hidden sm:inline">Nuovo avviso</span><span className="sm:hidden">Nuovo</span>
          </Button>
        }
      />

      {notices.isPending ? (
        <SkeletonList />
      ) : notices.isError ? (
        <LoadError testId="notices-error" />
      ) : list.length === 0 ? (
        <EmptyState icon={<Megaphone className="size-5" />} title="Bacheca vuota" hint="Pubblica il primo avviso." testId="notices-empty" />
      ) : (
        <ol className="relative space-y-4 border-l border-[#30363D] pl-5 md:pl-7" data-testid="notices-list">
          {list.map((n) => (
            <li key={n.id} className="relative" data-testid={`notice-card-${n.id}`}>
              <span className={cn("absolute top-5 -left-[25px] size-2.5 rounded-full ring-4 ring-[#0D1117] md:-left-[33px]", n.tag === "urgente" ? "bg-[#FF7B72]" : n.tag === "info" ? "bg-[#BC8CFF]" : "bg-[#388BFD]")} />
              <article className="rounded-lg border border-[#30363D] bg-[#161B22] p-4 md:p-5">
                <div className="flex items-center gap-2.5">
                  <Avatar name={n.author} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" data-testid={`notice-author-${n.id}`}>{n.author}</p>
                    <p className="text-xs text-[#8B949E]">{relTime(n.created_at)}</p>
                  </div>
                  <span className={cn("rounded border px-1.5 py-0.5 text-xs", NOTICE_TAG_STYLE[n.tag].cls)}>{NOTICE_TAG_STYLE[n.tag].label}</span>
                </div>
                <h3 className="mt-3 text-[16px] font-semibold tracking-tight" data-testid={`notice-title-${n.id}`}>{n.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed whitespace-pre-wrap text-[#C9D1D9]">{n.body}</p>
              </article>
            </li>
          ))}
        </ol>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" data-testid="notice-dialog">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>Nuovo avviso</DialogTitle>
              <DialogDescription>Resterà in bacheca, visibile a tutti, con il tuo nome.</DialogDescription>
            </DialogHeader>
            <div className="my-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Segmented
                  value={tag}
                  onChange={setTag}
                  testId="notice-tag"
                  className="w-full"
                  options={[
                    { value: "avviso", label: "Avviso", activeClass: NOTICE_TAG_STYLE.avviso.cls },
                    { value: "urgente", label: "Urgente", activeClass: NOTICE_TAG_STYLE.urgente.cls },
                    { value: "info", label: "Info", activeClass: NOTICE_TAG_STYLE.info.cls },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notice-title">Titolo</Label>
                <Input id="notice-title" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} maxLength={120} placeholder="es. Cambio aula" data-testid="notice-title-input" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notice-body">Messaggio</Label>
                <Textarea id="notice-body" value={body} onChange={(e) => setBody(e.target.value)} required rows={4} maxLength={2000} placeholder="Scrivi il messaggio per la classe…" data-testid="notice-body-input" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="notice-cancel-button">Chiudi</Button>
              <Button type="submit" disabled={create.isPending} data-testid="notice-submit-button">{create.isPending ? "Pubblico…" : "Pubblica"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
