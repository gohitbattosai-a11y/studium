import { useState } from "react";
import { Check, Lock, Palette } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BACKGROUNDS, type BackgroundId } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { BackgroundPreview } from "./ThemeBackground";

export default function ThemePicker({
  value,
  owned,
  onChange,
  onShop,
  className,
  testId,
}: {
  value: BackgroundId;
  owned: string[];
  onChange: (id: BackgroundId) => void;
  onShop: () => void;
  className?: string;
  testId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} aria-label="Cambia sfondo" data-testid={testId}>
        <Palette className="size-4" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg" data-testid="background-dialog">
          <DialogHeader>
            <DialogTitle>Sfondo della classe</DialogTitle>
            <DialogDescription>Gli sfondi a tema si sbloccano nello shop con i punti.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {BACKGROUNDS.map((b) => {
              const active = b.id === value;
              const locked = b.id !== "none" && !owned.includes(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (locked) onShop();
                    else onChange(b.id);
                  }}
                  data-testid={`background-option-${b.id}`}
                  className={cn(
                    "relative h-36 overflow-hidden rounded-lg border bg-[#0D1117] text-left transition-colors duration-150",
                    active ? "border-[#388BFD] ring-2 ring-[#388BFD]/40" : "border-[#30363D] hover:border-[#8B949E]",
                  )}
                >
                  <div className={cn("absolute inset-0", locked && "opacity-50 saturate-50")}>
                    <BackgroundPreview id={b.id} />
                  </div>
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-[#0D1117]/85 px-3 py-2">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{b.label}</span>
                      <span className="block truncate text-[11px] text-[#8B949E]">{locked ? "Sbloccalo nello shop" : b.hint}</span>
                    </span>
                    {active && <Check className="size-4 shrink-0 text-[#58A6FF]" />}
                    {locked && <Lock className="size-4 shrink-0 text-[#8B949E]" />}
                  </span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
