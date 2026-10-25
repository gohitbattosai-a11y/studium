import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { avatarTone, initials } from "@/lib/format";
import { useMembers } from "@/lib/queries";
import { AvatarDecoration } from "@/components/shop/decorations";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("grid size-8 place-items-center rounded-md bg-[#388BFD] text-white", className)} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-[60%]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6.5 12 3l8 3.5-8 3.5L4 6.5Z" />
        <path d="M7 9v5c0 1.6 2.2 3 5 3s5-1.4 5-3V9" />
        <path d="M20 6.5V12" />
      </svg>
    </div>
  );
}

export function Avatar({ name, size = "md", decoration }: { name: string; size?: "sm" | "md"; decoration?: string | null }) {
  const members = useMembers();
  const deco = decoration !== undefined ? decoration : (members.data?.find((m) => m.nickname === name)?.decoration ?? null);
  return (
    <span
      className={cn(
        "relative mx-1 inline-grid shrink-0 place-items-center rounded-full font-semibold",
        size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs",
        avatarTone(name),
      )}
      aria-hidden
    >
      {initials(name)}
      <AvatarDecoration id={deco} />
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-xs font-medium uppercase tracking-wider text-[#8B949E]", className)}>{children}</p>;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  testId,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  testId: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]" data-testid={`${testId}-title`}>
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-[#8B949E]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, hint, testId }: { icon: ReactNode; title: string; hint?: string; testId: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#30363D] px-6 py-10 text-center" data-testid={testId}>
      <div className="mx-auto mb-3 grid size-10 place-items-center rounded-md bg-[#21262D] text-[#8B949E]">{icon}</div>
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-[#8B949E]">{hint}</p>}
    </div>
  );
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" data-testid="skeleton-list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg border border-[#30363D] bg-[#161B22]" />
      ))}
    </div>
  );
}

export function LoadError({ testId }: { testId: string }) {
  return (
    <div className="rounded-lg border border-[#30363D] bg-[#161B22] px-4 py-6 text-sm text-[#8B949E]" data-testid={testId}>
      Impossibile caricare i dati in questo momento. Riprova tra poco.
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  testId,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; activeClass?: string }[];
  testId: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" className={cn("inline-flex rounded-md border border-[#30363D] bg-[#0D1117] p-0.5", className)} data-testid={testId}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            data-testid={`${testId}-${o.value}`}
            className={cn(
              "flex-1 rounded-[5px] px-3 py-1.5 text-sm whitespace-nowrap transition-colors duration-150",
              active ? (o.activeClass ?? "bg-[#21262D] text-[#F0F6FC] shadow-sm") : "text-[#8B949E] hover:text-[#F0F6FC]",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export const PRIORITY_STYLE: Record<string, { label: string; cls: string; dot: string }> = {
  alta: { label: "Alta", cls: "bg-[#3D1316] text-[#FFA198] border-[#FF7B72]/25", dot: "bg-[#FF7B72]" },
  media: { label: "Media", cls: "bg-[#342207] text-[#E3B341] border-[#D29922]/25", dot: "bg-[#D29922]" },
  bassa: { label: "Bassa", cls: "bg-[#12261E] text-[#7EE787] border-[#3FB950]/25", dot: "bg-[#3FB950]" },
};

export const NOTICE_TAG_STYLE: Record<string, { label: string; cls: string }> = {
  urgente: { label: "Urgente", cls: "bg-[#3D1316] text-[#FFA198] border-[#FF7B72]/25" },
  avviso: { label: "Avviso", cls: "bg-[#388BFD]/12 text-[#79B8FF] border-[#388BFD]/25" },
  info: { label: "Info", cls: "bg-[#BC8CFF]/12 text-[#D2A8FF] border-[#BC8CFF]/25" },
};
