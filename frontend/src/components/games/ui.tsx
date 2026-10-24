import { cn } from "@/lib/utils";

export function Progress({ value, max, label }: { value: number; max: number; label?: string }) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between text-xs text-[#8B949E]">
        <span>{label}</span>
        <span className="tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#21262D]">
        <div className="h-full rounded-full bg-[#388BFD] transition-all duration-300" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

export const choiceClass = (state: "idle" | "selected" | "correct" | "wrong" | "dim") =>
  cn(
    "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors duration-150",
    state === "idle" && "border-[#30363D] bg-[#161B22] hover:border-[#8B949E]",
    state === "selected" && "border-[#388BFD] bg-[#388BFD]/10",
    state === "correct" && "border-[#3FB950] bg-[#3FB950]/12",
    state === "wrong" && "border-[#F85149] bg-[#F85149]/12",
    state === "dim" && "border-[#30363D] bg-[#161B22] opacity-50",
  );
