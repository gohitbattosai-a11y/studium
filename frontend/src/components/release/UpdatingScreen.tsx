import { Cog } from "lucide-react";
import { BrandMark } from "@/components/common";
import type { SiteStatus } from "@/lib/types";
import "./updating.css";

export default function UpdatingScreen({ status }: { status: SiteStatus }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center" data-testid="updating-screen">
      <div className="upd-glow" aria-hidden />
      <BrandMark className="mb-8 size-12" />
      <div className="relative mb-8 h-24 w-32" aria-hidden>
        <Cog className="upd-gear absolute left-0 top-2 size-16 text-[#58A6FF]" strokeWidth={1.4} />
        <Cog className="upd-gear-rev absolute right-0 top-8 size-14 text-[#BC8CFF]" strokeWidth={1.4} />
        <Cog className="upd-gear absolute left-14 top-0 size-8 text-[#3FB950]" strokeWidth={1.6} />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Il sito si sta aggiornando</h1>
      <p className="mt-2 max-w-sm text-sm text-[#8B949E]" data-testid="updating-message">
        {status.message}
      </p>
      <div className="upd-bar mt-8 h-1.5 w-56 overflow-hidden rounded-full bg-[#21262D]" aria-hidden>
        <div className="upd-bar-fill h-full w-1/3 rounded-full bg-[#388BFD]" />
      </div>
      <p className="mt-4 text-xs text-[#8B949E]">Questa pagina si riaprirà da sola appena è tutto pronto.</p>
    </div>
  );
}
