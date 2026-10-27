import { useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import type { MemberOut, Me } from "@/lib/types";
import { cn } from "@/lib/utils";
import MemberRow from "@/components/layout/MemberRow";

export default function MobileMembers({ me, members, showPet }: { me: Me; members: MemberOut[]; showPet: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mb-4 rounded-lg border border-[#30363D] bg-[#161B22] md:hidden" data-testid="mobile-members">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-2 px-4 py-3 text-left" data-testid="mobile-members-toggle">
        <Users className="size-4 text-[#8B949E]" />
        <span className="flex-1 text-sm font-medium">Compagni</span>
        <span className="text-xs text-[#8B949E]">{members.length}</span>
        <ChevronDown className={cn("size-4 text-[#8B949E] transition-transform duration-150", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="max-h-80 space-y-1.5 overflow-y-auto overscroll-contain px-4 pb-3" data-testid="mobile-members-list">
          {members.map((m) => (
            <MemberRow key={m.nickname} member={m} isMe={m.nickname === me.nickname} showPet={showPet} />
          ))}
        </ul>
      )}
    </section>
  );
}
