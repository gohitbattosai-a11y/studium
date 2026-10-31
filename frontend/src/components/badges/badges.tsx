import { Brain, Crown, Hourglass, KeyRound, Lock, Mail, Sparkles, Timer, type LucideIcon } from "lucide-react";
import { useBadges } from "@/lib/queries";
import { useHuntActions } from "@/lib/extraActions";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/common";
import { Button } from "@/components/ui/button";

interface BadgeStyle {
  icon: LucideIcon;
  from: string;
  to: string;
  label: string;
}

const STYLE: Record<string, BadgeStyle> = {
  "primo-pomodoro": { icon: Timer, from: "#FF7B72", to: "#D29922", label: "Primo pomodoro" },
  "mente-di-ferro": { icon: Brain, from: "#388BFD", to: "#BC8CFF", label: "Mente di ferro" },
  "monaco-studioso": { icon: Crown, from: "#E3B341", to: "#F0883E", label: "Monaco studioso" },
  messaggero: { icon: Mail, from: "#2DD4BF", to: "#3FB950", label: "Messaggero" },
  "viaggiatore-del-tempo": { icon: Hourglass, from: "#F778BA", to: "#A371F7", label: "Viaggiatore del tempo" },
  "custode-del-segreto": { icon: KeyRound, from: "#FDE68A", to: "#C084FC", label: "Custode del segreto" },
};

const FALLBACK: BadgeStyle = { icon: Sparkles, from: "#58A6FF", to: "#BC8CFF", label: "Badge" };

const styleOf = (id: string): BadgeStyle => STYLE[id] ?? FALLBACK;

const gradient = (s: BadgeStyle) => ({ backgroundImage: `linear-gradient(135deg, ${s.from}, ${s.to})` });

export function BadgeDot({ id, className }: { id: string; className?: string }) {
  const s = styleOf(id);
  return (
    <span
      className={cn("grid size-4 shrink-0 place-items-center rounded-full text-[#0D1117] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]", className)}
      style={gradient(s)}
      title={s.label}
      aria-label={s.label}
      data-testid={`badge-dot-${id}`}
    >
      <s.icon className="size-2.5" strokeWidth={2.6} />
    </span>
  );
}

export function BadgeStrip({ ids, max = 3 }: { ids: string[]; max?: number }) {
  if (!ids.length) return null;
  const shown = ids.slice(0, max);
  const extra = ids.length - shown.length;
  return (
    <span className="flex shrink-0 items-center gap-0.5" data-testid="badge-strip">
      {shown.map((id) => (
        <BadgeDot key={id} id={id} />
      ))}
      {extra > 0 && <span className="pl-0.5 text-[10px] text-[#8B949E]">+{extra}</span>}
    </span>
  );
}

export function BadgesBody({ nickname }: { nickname: string }) {
  const badges = useBadges();
  const { equip } = useHuntActions();
  const data = badges.data;
  if (!data) return <div className="h-16 animate-pulse rounded-lg bg-[#161B22]" />;
  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-2 gap-2" data-testid="badges-grid">
        {data.badges.map((b) => {
          const s = styleOf(b.id);
          return (
            <li
              key={b.id}
              className={cn("flex items-start gap-2 rounded-lg border p-2", b.owned ? "border-white/10" : "border-[#30363D] bg-[#0D1117] opacity-60")}
              style={b.owned ? { backgroundImage: `linear-gradient(135deg, ${s.from}22, ${s.to}22)` } : undefined}
              data-testid={`badge-${b.id}`}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full text-[#0D1117]" style={b.owned ? gradient(s) : { backgroundColor: "#21262D" }}>
                {b.owned ? <s.icon className="size-4" strokeWidth={2.4} /> : <Lock className="size-3.5 text-[#8B949E]" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium">{b.name}</span>
                <span className="block text-[11px] leading-snug text-[#8B949E]">{b.description}</span>
              </span>
            </li>
          );
        })}
      </ul>
      {data.exclusives.length > 0 && (
        <div className="space-y-2" data-testid="exclusives-list">
          <p className="text-xs font-medium uppercase tracking-wider text-[#8B949E]">Esclusivi</p>
          {data.exclusives.map((x) => (
            <div key={x.id} className="flex items-center gap-3 rounded-lg border border-[#30363D] bg-[#0D1117] p-2">
              <Avatar name={nickname} decoration={x.id} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{x.name}</p>
                <p className="text-[11px] leading-snug text-[#8B949E]">{x.description}</p>
              </div>
              <Button size="sm" variant={x.equipped ? "outline" : "default"} disabled={equip.isPending} onClick={() => equip.mutate(x.equipped ? null : x.id)} data-testid={`exclusive-equip-${x.id}`}>
                {x.equipped ? "Togli" : "Indossa"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
