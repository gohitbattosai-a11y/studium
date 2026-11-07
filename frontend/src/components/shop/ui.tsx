import type { ComponentProps, ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Eyebrow } from "@/components/common";

export function Panel({ title, hint, action, children, className, testId }: { title: string; hint?: string; action?: ReactNode; children: ReactNode; className?: string; testId?: string }) {
  return (
    <section className={cn("min-w-0 rounded-xl border border-[#30363D] bg-[#161B22] p-4 sm:p-5", className)} data-testid={testId}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-medium">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-[#8B949E]">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <Eyebrow>{label}</Eyebrow>
      {children}
    </label>
  );
}

export function NativeSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn("h-10 w-full min-w-0 rounded-lg border border-[#30363D] bg-[#0D1117] px-2.5 text-base outline-none md:h-9 md:text-sm transition-colors focus-visible:border-[#388BFD] disabled:opacity-50", className)}
      {...props}
    />
  );
}

export function RoleBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-[#388BFD]/25 bg-[#388BFD]/12 px-1.5 py-0.5 text-[11px] text-[#79B8FF]">
      <ShieldCheck className="size-3" /> Admin
    </span>
  );
}
