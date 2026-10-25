import { Trophy } from "lucide-react";
import { useLeaderboard } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { Avatar, EmptyState, LoadError, SkeletonList } from "@/components/common";
import { RoleBadge } from "./ui";

const PODIUM = ["bg-[#E3B341]/15 text-[#E3B341] border-[#E3B341]/30", "bg-[#C9D1D9]/10 text-[#C9D1D9] border-[#C9D1D9]/25", "bg-[#D2793F]/15 text-[#E8A06A] border-[#D2793F]/30"];

export default function LeaderboardView() {
  const board = useLeaderboard();

  if (board.isPending) return <SkeletonList rows={4} />;
  if (board.isError) return <LoadError testId="leaderboard-error" />;
  if (board.data.length === 0) {
    return <EmptyState icon={<Trophy className="size-5" />} title="Nessuno in classifica" hint="La classifica è per chi sceglie di partecipare dallo Shop." testId="leaderboard-empty" />;
  }

  return (
    <ol className="space-y-2.5" data-testid="leaderboard-list">
      {board.data.map((e) => (
        <li
          key={e.member_id}
          className={cn("flex items-center gap-3 rounded-lg border bg-[#161B22] px-3 py-3 sm:gap-4 sm:px-4 sm:py-3.5", e.is_me ? "border-[#388BFD]/50" : "border-[#30363D]")}
          data-testid={`leaderboard-row-${e.member_id}`}
        >
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border text-sm font-semibold", PODIUM[e.rank - 1] ?? "border-[#30363D] bg-[#21262D] text-[#8B949E]")}>{e.rank}</span>
          <Avatar name={e.nickname} />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate font-medium">{e.nickname}</span>
            {e.is_me && <span className="text-xs text-[#8B949E]">(tu)</span>}
            {e.role === "admin" && <RoleBadge />}
          </div>
          <span className="shrink-0 text-right">
            <span className="text-lg font-semibold tabular-nums">{e.total_points}</span>
            <span className="ml-1 text-xs text-[#8B949E]">pt</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
