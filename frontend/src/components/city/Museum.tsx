import { ArrowRight, Lock, Package } from "lucide-react";
import type { CityState } from "@/lib/city";
import { Button } from "@/components/ui/button";
import FishArt from "./FishArt";
import "./city.css";

function Owl() {
  return (
    <svg viewBox="0 0 80 90" className="w-16 drop-shadow-md sm:w-20" aria-hidden>
      <ellipse cx="40" cy="58" rx="26" ry="28" fill="#8a6a43" />
      <ellipse cx="40" cy="64" rx="16" ry="19" fill="#e8d9b5" />
      <circle cx="40" cy="30" r="22" fill="#9b7a50" />
      <path d="M22 14 L28 24 L18 24Z M58 14 L52 24 L62 24Z" fill="#7a5a36" />
      <circle cx="31" cy="30" r="9" fill="#f8f3e4" />
      <circle cx="49" cy="30" r="9" fill="#f8f3e4" />
      <circle cx="31" cy="31" r="4" fill="#1b1b1b" />
      <circle cx="49" cy="31" r="4" fill="#1b1b1b" />
      <path d="M36 38 L40 46 L44 38Z" fill="#e3a53a" />
      <rect x="30" y="18" width="20" height="3" rx="1.5" fill="#2b2b2b" opacity="0.55" />
    </svg>
  );
}

export default function Museum({ city, onFish, onBucket, onExit }: { city: CityState; onFish: () => void; onBucket: () => void; onExit: () => void }) {
  const done = city.museum.length;
  const total = city.species.length;
  const sample = city.species.filter((s) => s.pattern !== "glow").slice(0, 3);
  return (
    <div className="relative flex h-full flex-col overflow-hidden" data-testid="museum-lobby">
      <div className="ct-wall relative flex min-h-0 flex-[3] items-end justify-center gap-3 px-3 pb-0 sm:gap-8 sm:px-10">
        <div className="absolute inset-x-0 bottom-0 h-3 bg-[#7a5230]" />
        <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-black/15 to-transparent" />

        <div className="relative z-[1] flex w-[28%] max-w-[240px] flex-col items-center" data-testid="lobby-left-passage">
          <div className="mb-2 rounded-md border-2 border-[#5a3d22] bg-[#6b4a2b] px-3 py-1 text-center text-[11px] font-semibold text-[#f6e7b4] shadow sm:text-sm">
            Animali
            <span className="block text-[10px] font-normal opacity-80">Prossimamente</span>
          </div>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[999px] border-x-[10px] border-t-[10px] border-[#6b4a2b] bg-gradient-to-b from-[#1b1e24] to-[#2b2f38]">
            <div className="absolute inset-0 grid place-items-center">
              <Lock className="size-7 text-[#8B949E] sm:size-10" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </div>

        <div className="relative z-[1] flex w-[34%] max-w-[300px] flex-col items-center pb-2">
          <div className="mb-3 rounded-lg border-4 border-[#6b4a2b] bg-[#f8f1dc] px-3 py-2 text-center shadow-md">
            <p className="text-[10px] font-medium tracking-wider text-[#7a5230] uppercase">Collezione</p>
            <p className="text-lg font-bold tabular-nums text-[#3b2a17] sm:text-2xl">
              {done}/{total}
            </p>
            <p className="text-[10px] text-[#7a5230]">pesci donati</p>
          </div>
          <Owl />
          <div className="-mt-2 h-8 w-full rounded-t-md border-2 border-[#5a3d22] bg-gradient-to-b from-[#8a6a43] to-[#6b4a2b] shadow-lg sm:h-10" />
        </div>

        <button
          type="button"
          onClick={onFish}
          className="group relative z-[1] flex w-[28%] max-w-[240px] flex-col items-center outline-none"
          data-testid="lobby-fish-passage"
          aria-label="Entra nella sala dei pesci"
        >
          <div className="mb-2 rounded-md border-2 border-[#1f5d7a] bg-[#2a8fb3] px-3 py-1 text-center text-[11px] font-semibold text-white shadow transition-transform duration-150 group-hover:scale-105 group-focus-visible:scale-105 sm:text-sm">
            Pesci
            <span className="flex items-center justify-center gap-1 text-[10px] font-normal opacity-90">
              Entra <ArrowRight className="size-3" />
            </span>
          </div>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[999px] border-x-[10px] border-t-[10px] border-[#6b4a2b] bg-gradient-to-b from-[#58b9d9] to-[#1f6f93] transition-transform duration-200 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]">
            <div className="ct-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.45),transparent_60%)]" />
            {sample.map((s, i) => (
              <div key={s.id} className="ct-float absolute w-[44%]" style={{ left: `${10 + i * 22}%`, top: `${22 + i * 20}%`, animationDelay: `${i * 0.7}s` }}>
                <FishArt shape={s.shape} colors={s.colors} pattern={s.pattern} className="w-full" />
              </div>
            ))}
          </div>
        </button>
      </div>

      <div className="ct-floor relative flex min-h-0 flex-[1.2] items-end justify-center">
        <div className="ct-checker absolute inset-x-[10%] top-0 bottom-0 [clip-path:polygon(12%_0,88%_0,100%_100%,0_100%)] opacity-90" />
        <div className="absolute inset-x-[34%] top-0 bottom-0 [clip-path:polygon(6%_0,94%_0,100%_100%,0_100%)] bg-[#9c3b3b]/80" />
        <button
          type="button"
          onClick={onExit}
          className="relative z-[1] mb-0 flex h-[70%] w-24 flex-col items-center justify-end rounded-t-xl border-4 border-b-0 border-[#4a3320] bg-gradient-to-b from-[#7a5230] to-[#5b3b1f] pb-2 text-xs font-medium text-[#f6e7b4] transition-transform duration-150 hover:scale-105 sm:w-32"
          data-testid="lobby-exit"
        >
          <span className="mb-2 size-2.5 self-end rounded-full bg-[#e3b341] sm:mr-3" />
          Esci
        </button>
        <div className="absolute right-3 bottom-3 z-[2]">
          <Button variant="secondary" size="lg" onClick={onBucket} data-testid="lobby-bucket-button">
            <Package /> Secchio ({city.bucket.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
