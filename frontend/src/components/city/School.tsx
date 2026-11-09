import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, Circle, Lightbulb } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LESSONS, SUBJECTS, lessonsOf, useStudied, type Block, type Lesson } from "@/lib/domain/lessons";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import Interactive from "./LessonWidgets";

function BlockView({ b }: { b: Block }) {
  if (b.t === "section") return null;
  if (b.t === "h") return <h3 className="mt-6 text-lg font-semibold text-[#fff3c4] first:mt-0">{b.text}</h3>;
  if (b.t === "p") return <p className="mt-3 text-[15px] leading-relaxed text-[#e8efe6]">{b.text}</p>;
  if (b.t === "list")
    return (
      <ul className="mt-3 space-y-1.5">
        {b.items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-[#e8efe6]">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#E3B341]" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    );
  if (b.t === "note")
    return (
      <aside className="mt-4 rounded-lg border border-[#E3B341]/50 bg-[#E3B341]/10 px-4 py-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#E3B341] uppercase">
          <Lightbulb className="size-3.5" /> {b.title ?? "Da ricordare"}
        </p>
        <p className="mt-1 text-[15px] leading-relaxed text-[#fff3c4]">{b.text}</p>
      </aside>
    );
  if (b.t === "formula")
    return (
      <figure className="mt-4 rounded-lg border border-white/15 bg-black/25 px-4 py-3 text-center">
        <pre className="font-mono text-base whitespace-pre-wrap text-[#9ff0b4]">{b.text}</pre>
        {b.caption && <figcaption className="mt-1 text-xs text-[#b8c7bc]">{b.caption}</figcaption>}
      </figure>
    );
  return <Interactive b={b} />;
}

const sectionsOf = (l: Lesson) => l.blocks.filter((b) => b.t === "section").length;

const activities = (l: Lesson) => l.blocks.filter((b) => b.t === "lab" || b.t === "quiz" || b.t === "reveal" || b.t === "steps" || b.t === "flip" || b.t === "sort" || b.t === "mark" || b.t === "fill" || b.t === "punct" || b.t === "seq").length;

function Reader({ lesson, siblings, studied, onToggle, onOpen, onBack }: { lesson: Lesson; siblings: Lesson[]; studied: boolean; onToggle: () => void; onOpen: (l: Lesson) => void; onBack: () => void }) {
  const idx = siblings.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const subject = SUBJECTS.find((s) => s.id === lesson.subject);
  const sections = useMemo(() => {
    const out: { title: string; text?: string; blocks: Block[] }[] = [];
    for (const b of lesson.blocks) {
      if (b.t === "section") out.push({ title: b.title, text: b.text, blocks: [] });
      else {
        if (out.length === 0) out.push({ title: lesson.title, text: lesson.summary, blocks: [] });
        out[out.length - 1].blocks.push(b);
      }
    }
    return out;
  }, [lesson]);
  const [sec, setSec] = useState(0);
  const top = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    top.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [sec]);
  const at = Math.min(sec, sections.length - 1);
  const cur = sections[at];
  const multi = sections.length > 1;
  return (
    <article className="mx-auto w-full max-w-3xl" data-testid="school-reader">
      <button type="button" onClick={onBack} className="mb-3 flex items-center gap-1.5 text-sm text-[#cfe0d3] transition-colors hover:text-white">
        <ArrowLeft className="size-4" /> {subject?.name ?? "Lezioni"}
      </button>
      <div ref={top} className="scroll-mt-16" />
      {multi && (
        <nav className="no-scrollbar -mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Sezioni">
          {sections.map((s, i) => (
            <button key={i} type="button" onClick={() => setSec(i)} className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors", i === at ? "border-[#E3B341] bg-[#E3B341]/20 text-[#fff3c4]" : "border-white/20 text-[#d8cdb6] hover:border-white/40")} data-testid={`school-section-${i}`}>
              <span className="font-bold">{i + 1}</span>
              <span className="max-w-[9rem] truncate">{s.title}</span>
            </button>
          ))}
        </nav>
      )}
      <div className="rounded-2xl border-[6px] border-[#6b4a2b] bg-[#1f3a2e] p-5 shadow-2xl sm:p-8" style={{ backgroundImage: "radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.08), transparent 60%)" }}>
        <p className="text-xs font-medium tracking-wider text-[#9fc2a8] uppercase">
          {subject?.emoji} {lesson.title}
          {multi && ` · sezione ${at + 1} di ${sections.length}`}
        </p>
        <h2 className="mt-1 text-2xl font-bold text-white">{cur.title}</h2>
        {cur.text && <p className="mt-1 text-sm text-[#b8c7bc]">{cur.text}</p>}
        <div className="mt-5 border-t border-white/15 pt-5">
          {cur.blocks.map((b, i) => (
            <BlockView key={`${at}-${i}`} b={b} />
          ))}
        </div>
      </div>
      {multi && (
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button size="lg" variant="outline" disabled={at === 0} onClick={() => setSec(at - 1)}>
            <ArrowLeft /> Sezione precedente
          </Button>
          <Button size="lg" disabled={at >= sections.length - 1} onClick={() => setSec(at + 1)} data-testid="school-next-section">
            Sezione successiva <ArrowRight />
          </Button>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Button size="lg" variant={studied ? "secondary" : "default"} onClick={onToggle} data-testid="school-toggle-done">
          {studied ? <CheckCircle2 /> : <Circle />} {studied ? "Capitolo studiato" : "Segna come studiato"}
        </Button>
        <div className="flex gap-2">
          <Button size="lg" variant="outline" disabled={!prev} onClick={() => prev && onOpen(prev)}>
            <ArrowLeft /> Precedente
          </Button>
          <Button size="lg" variant="outline" disabled={!next} onClick={() => next && onOpen(next)}>
            Successiva <ArrowRight />
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function School({ memberId }: { memberId: string }) {
  const { done, toggle } = useStudied(memberId);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const doneSet = useMemo(() => new Set(done), [done]);
  const total = LESSONS.length;
  const studiedCount = LESSONS.filter((l) => doneSet.has(l.id)).length;
  const open = openId ? LESSONS.find((l) => l.id === openId) ?? null : null;
  const subject = subjectId ? SUBJECTS.find((s) => s.id === subjectId) ?? null : null;
  const list = subject ? lessonsOf(subject.id) : LESSONS;

  return (
    <div className="absolute inset-0 overflow-y-auto bg-[#2a1d12] pt-14 pb-10" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 64px), linear-gradient(180deg, #3a2819, #1d130b)" }} data-testid="school">
      <div className="mx-auto w-full max-w-5xl px-4">
        {open ? (
          <Reader key={open.id} lesson={open} siblings={lessonsOf(open.subject)} studied={doneSet.has(open.id)} onToggle={() => toggle(open.id)} onOpen={(l) => setOpenId(l.id)} onBack={() => setOpenId(null)} />
        ) : (
          <>
            <div className="rounded-2xl border-[6px] border-[#6b4a2b] bg-[#1f3a2e] px-5 py-5 text-center shadow-2xl" style={{ backgroundImage: "radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.08), transparent 60%)" }}>
              <p className="flex items-center justify-center gap-2 text-xs font-medium tracking-wider text-[#9fc2a8] uppercase">
                <BookOpenCheck className="size-4" /> Aula di studio
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">Lezioni e spiegazioni</h2>
              <p className="mt-1 text-sm text-[#b8c7bc]">
                {total === 0 ? "La lavagna è ancora vuota." : `${studiedCount} di ${total} lezioni studiate`}
              </p>
              {total > 0 && (
                <div className="mx-auto mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-black/40">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#E3B341] to-[#7EE787]" style={{ width: `${(studiedCount / total) * 100}%` }} />
                </div>
              )}
            </div>

            <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              <button type="button" onClick={() => setSubjectId(null)} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors", !subject ? "border-[#E3B341] bg-[#E3B341]/15 text-[#fff3c4]" : "border-white/20 text-[#d8cdb6] hover:border-white/40")}>
                Tutte
              </button>
              {SUBJECTS.map((s) => {
                const n = lessonsOf(s.id).length;
                return (
                  <button key={s.id} type="button" onClick={() => setSubjectId(s.id)} className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors", subject?.id === s.id ? "text-white" : "border-white/20 text-[#d8cdb6] hover:border-white/40")} style={subject?.id === s.id ? { borderColor: s.color, background: `${s.color}26` } : undefined} data-testid={`school-subject-${s.id}`}>
                    <span>{s.emoji}</span>
                    {s.name}
                    <span className="text-xs opacity-60">{n}</span>
                  </button>
                );
              })}
            </div>

            {list.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-white/25 bg-black/20 px-6 py-12 text-center">
                <p className="text-4xl">🪧</p>
                <p className="mt-3 text-base font-medium text-[#fff3c4]">{subject ? `Nessuna lezione di ${subject.name} per ora` : "Nessuna lezione disponibile"}</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-[#b8c7bc]">Le spiegazioni compariranno qui man mano che andiamo avanti con il programma.</p>
              </div>
            ) : (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((l) => {
                  const s = SUBJECTS.find((x) => x.id === l.subject);
                  const isDone = doneSet.has(l.id);
                  return (
                    <li key={l.id}>
                      <button type="button" onClick={() => setOpenId(l.id)} className="flex h-full w-full flex-col rounded-xl border border-white/15 bg-[#1f3a2e]/80 p-4 text-left transition-colors hover:border-[#E3B341]/60" style={{ boxShadow: `inset 4px 0 0 ${s?.color ?? "#E3B341"}` }} data-testid={`school-lesson-${l.id}`}>
                        <span className="flex items-center justify-between text-xs text-[#9fc2a8]">
                          <span>
                            {s?.emoji} {s?.name}
                          </span>
                          {isDone && <CheckCircle2 className="size-4 text-[#7EE787]" />}
                        </span>
                        <span className="mt-1 text-base font-semibold text-white">{l.title}</span>
                        <span className="mt-1 text-sm text-[#b8c7bc]">{l.summary}</span>
                        <span className="mt-2 text-xs text-[#E3B341]">{sectionsOf(l) > 1 ? `${sectionsOf(l)} sezioni · ` : ""}⚡ {activities(l)} attività interattive</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
