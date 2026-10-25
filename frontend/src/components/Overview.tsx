import { ArrowUpRight, BarChart3, BookOpen, FolderOpen, Megaphone } from "lucide-react";
import type { ReactNode } from "react";
import type { Me } from "@/lib/types";
import type { Tab } from "@/components/layout/AppShell";
import { useFolders, useHomework, useNotices, usePolls } from "@/lib/queries";
import { dueInfo, formatLongDay, relTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Avatar, Eyebrow, NOTICE_TAG_STYLE, PRIORITY_STYLE, SkeletonList } from "@/components/common";

function Tile({
  title,
  icon,
  onMore,
  children,
  className,
  testId,
}: {
  title: string;
  icon: ReactNode;
  onMore: () => void;
  children: ReactNode;
  className?: string;
  testId: string;
}) {
  return (
    <section className={cn("rounded-xl border border-[#30363D] bg-[#161B22] p-5", className)} data-testid={testId}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-[#8B949E]">{icon}</span>
          {title}
        </div>
        <button type="button" onClick={onMore} className="flex items-center gap-1 text-xs text-[#8B949E] transition-colors duration-150 hover:text-[#58A6FF]" data-testid={`${testId}-more`}>
          Apri <ArrowUpRight className="size-3.5" />
        </button>
      </div>
      {children}
    </section>
  );
}

const muted = "text-sm text-[#8B949E]";

export default function Overview({ me, onNavigate }: { me: Me; onNavigate: (t: Tab) => void }) {
  const homework = useHomework();
  const polls = usePolls();
  const notices = useNotices();
  const folders = useFolders();

  const todo = (homework.isError ? [] : homework.data ?? []).filter((h) => !h.completed);
  const openPolls = (polls.isError ? [] : polls.data ?? []).filter((p) => !p.my_vote);
  const latestNotices = (notices.isError ? [] : notices.data ?? []).slice(0, 3);
  const folderList = folders.isError ? [] : folders.data ?? [];
  const firstPoll = openPolls[0] ?? (polls.isError ? undefined : polls.data?.[0]);
  const loading = homework.isPending || polls.isPending || notices.isPending || folders.isPending;
  if (loading) {
    return (
      <div data-testid="overview-loading">
        <div className="mb-6 h-16 w-2/3 animate-pulse rounded-lg bg-[#161B22]" />
        <SkeletonList rows={4} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Eyebrow>{formatLongDay(me.today)}</Eyebrow>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-[28px]" data-testid="overview-greeting">
          Ciao {me.nickname}, ecco la {me.group_name}.
        </h1>
        <div className="mt-4 flex flex-wrap gap-2 text-sm" data-testid="overview-stats">
          <span className="rounded-md border border-[#30363D] bg-[#161B22] px-2.5 py-1 text-[#C9D1D9]">
            <b className="font-semibold text-[#F0F6FC]">{todo.length}</b> compiti da fare
          </span>
          <span className="rounded-md border border-[#30363D] bg-[#161B22] px-2.5 py-1 text-[#C9D1D9]">
            <b className="font-semibold text-[#F0F6FC]">{openPolls.length}</b> sondaggi da votare
          </span>
          <span className="rounded-md border border-[#30363D] bg-[#161B22] px-2.5 py-1 text-[#C9D1D9]">
            <b className="font-semibold text-[#F0F6FC]">{me.member_count}</b> compagni
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-5">
        <Tile title="Prossimi compiti" icon={<BookOpen className="size-4" />} onMore={() => onNavigate("compiti")} className="col-span-12 lg:col-span-7" testId="overview-homework">
          {todo.length === 0 ? (
            <p className={muted}>Nessun compito in sospeso. 🎉</p>
          ) : (
            <ul className="divide-y divide-[#30363D]">
              {todo.slice(0, 5).map((h) => {
                const due = dueInfo(h.due_date, me.today);
                return (
                  <li key={h.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className={cn("size-2 shrink-0 rounded-full", PRIORITY_STYLE[h.priority].dot)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm"><span className="font-medium">{h.subject}</span> <span className="text-[#8B949E]">· {h.description}</span></p>
                    </div>
                    <span className={cn("shrink-0 text-xs", due.tone === "late" || due.tone === "today" ? "text-[#FFA198]" : "text-[#8B949E]")}>{due.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Tile>

        <Tile title="Bacheca" icon={<Megaphone className="size-4" />} onMore={() => onNavigate("bacheca")} className="col-span-12 lg:col-span-5" testId="overview-notices">
          {latestNotices.length === 0 ? (
            <p className={muted}>Nessun avviso per ora.</p>
          ) : (
            <ul className="space-y-3">
              {latestNotices.map((n) => (
                <li key={n.id} className="flex items-center gap-3">
                  <Avatar name={n.author} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-[#8B949E]">
                      <span className={cn("mr-1.5 rounded border px-1 py-px text-[10px]", NOTICE_TAG_STYLE[n.tag].cls)}>{NOTICE_TAG_STYLE[n.tag].label}</span>
                      {n.author} · {relTime(n.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Tile>

        <Tile title={openPolls.length ? "Sondaggio da votare" : "Ultimo sondaggio"} icon={<BarChart3 className="size-4" />} onMore={() => onNavigate("sondaggi")} className="col-span-12 md:col-span-6" testId="overview-poll">
          {!firstPoll ? (
            <p className={muted}>Ancora nessun sondaggio.</p>
          ) : (
            <div>
              <p className="text-sm font-medium">{firstPoll.question}</p>
              <div className="mt-3 space-y-2">
                {firstPoll.options.map((o) => {
                  const pct = firstPoll.total_votes ? Math.round((o.votes / firstPoll.total_votes) * 100) : 0;
                  return (
                    <div key={o.id}>
                      <div className="mb-1 flex justify-between text-xs text-[#8B949E]">
                        <span className="truncate">{o.text}</span>
                        <span className="font-mono">{pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#21262D]">
                        <div className="h-full rounded-full bg-[#388BFD] animate-bar-grow" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-[#8B949E]">{firstPoll.total_votes} voti · {firstPoll.anonymous ? "anonimo" : "voto palese"}</p>
            </div>
          )}
        </Tile>

        <Tile title="Materiali" icon={<FolderOpen className="size-4" />} onMore={() => onNavigate("materiali")} className="col-span-12 md:col-span-6" testId="overview-materials">
          {folderList.length === 0 ? (
            <p className={muted}>Nessuna cartella ancora.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {folderList.slice(0, 6).map((f) => (
                <button key={f.id} type="button" onClick={() => onNavigate("materiali")} className="flex items-center gap-2 rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-2.5 text-left transition-colors duration-150 hover:border-[#58A6FF]/40">
                  <FolderOpen className="size-4 shrink-0 text-[#BC8CFF]" />
                  <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
                  <span className="text-xs text-[#8B949E]">{f.item_count}</span>
                </button>
              ))}
            </div>
          )}
        </Tile>
      </div>
    </div>
  );
}
