import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { setSoundSettings, sfx, useSoundSettings } from "@/lib/sfx";

function Row({ label, hint, checked, onChange, testId }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void; testId: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-[#30363D] bg-[#161B22] p-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-[#8B949E]">{hint}</span>
      </span>
      <input type="checkbox" className="size-4 shrink-0 accent-[#388BFD]" checked={checked} onChange={(e) => onChange(e.target.checked)} data-testid={testId} />
    </label>
  );
}

export default function SoundSettings({ className, testId }: { className?: string; testId: string }) {
  const [open, setOpen] = useState(false);
  const s = useSoundSettings();
  const muted = !s.sfx && !s.ambient;
  const Icon = muted || s.volume === 0 ? VolumeX : Volume2;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} aria-label="Suoni" data-testid={testId}>
        <Icon className="size-4" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm" data-testid="sound-dialog">
          <DialogHeader>
            <DialogTitle>Suoni</DialogTitle>
            <DialogDescription>Effetti e musica d'ambiente dello sfondo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Row label="Effetti" hint="Click, passaggio del mouse, notifiche e giochi" checked={s.sfx} onChange={(v) => setSoundSettings({ sfx: v })} testId="sound-sfx" />
            <Row label="Ambiente" hint="Atmosfera sonora dello sfondo scelto" checked={s.ambient} onChange={(v) => setSoundSettings({ ambient: v })} testId="sound-ambient" />
            <div className="rounded-lg border border-[#30363D] bg-[#161B22] p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Volume</span>
                <span className="text-xs text-[#8B949E]">{Math.round(s.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(s.volume * 100)}
                onChange={(e) => setSoundSettings({ volume: Number(e.target.value) / 100 })}
                onPointerUp={() => sfx("pop")}
                className="w-full accent-[#388BFD]"
                data-sfx="none"
                data-testid="sound-volume"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
