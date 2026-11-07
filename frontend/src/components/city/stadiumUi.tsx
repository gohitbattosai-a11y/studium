import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { Pos, Team } from "@/lib/domain/football";
import { tierFor } from "@/lib/domain/stadiumConfig";

export const PANEL = "st-panel";
export const eur = (n: number) => `€${n.toFixed(1)}M`;

export const run = (fn: () => string | null, ok?: string) => {
  const err = fn();
  if (err) toast.error(err);
  else if (ok) toast.success(ok);
  return !err;
};

export function Dot({ color }: { color: string }) {
  return <span className="inline-block size-2.5 shrink-0 rounded-full ring-1 ring-white/30" style={{ background: color }} />;
}

const TONE: Record<Pos, string> = { POR: "#E3B341", DIF: "#58A6FF", CEN: "#3FB950", ATT: "#F85149" };

export function PosBadge({ pos }: { pos: Pos }) {
  return (
    <span className="w-9 shrink-0 rounded border px-1 py-0.5 text-center text-[10px] font-semibold" style={{ borderColor: `${TONE[pos]}66`, color: TONE[pos], background: `${TONE[pos]}14` }}>
      {pos}
    </span>
  );
}

export function TierTag({ ovr }: { ovr: number }) {
  const t = tierFor(ovr);
  return <span className={cn("st-tier", `st-tier-${t.id}`)}>{t.name}</span>;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function Crest({ team, size = 40 }: { team: Pick<Team, "name" | "color">; size?: number }) {
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 50 56" aria-hidden className="shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
      <path d="M4 4H46V30Q46 46 25 54Q4 46 4 30Z" fill={team.color} stroke="#ffffff" strokeWidth="2.4" />
      <path d="M4 4H46V16H4Z" fill="#ffffff" opacity="0.22" />
      <path d="M25 8L28 15L35 15.6L29.8 20.2L31.4 27L25 23.4L18.6 27L20.2 20.2L15 15.6L22 15Z" fill="#ffffff" opacity="0.35" />
      <text x="25" y="42" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontSize="15" fontWeight="900" fill="#ffffff" stroke="#000000" strokeOpacity="0.35" strokeWidth="0.6">
        {initials(team.name)}
      </text>
    </svg>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="st-empty">{children}</p>;
}
