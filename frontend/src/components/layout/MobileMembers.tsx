import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ShieldCheck, X } from "lucide-react";
import type { MemberOut, Me } from "@/lib/types";
import { isBackgroundId } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/common";
import MemberRow from "@/components/layout/MemberRow";
import { BackgroundPreview } from "@/components/theme/ThemeBackground";
import { PetWalker } from "@/components/pets/PetWalker";
import { RAIL } from "@/components/layout/rail";

function MemberCard({ member, isMe, showPet }: { member: MemberOut; isMe: boolean; showPet: boolean }) {
  const background = isBackgroundId(member.background) ? member.background : null;
  const pet = showPet ? member.pet : null;
  return (
    <li
      className={cn("bgx-mini-host dc-host relative h-[104px] w-[112px] shrink-0 snap-start rounded-xl border bg-[#161B22]", isMe ? "border-[#388BFD]/60" : "border-[#30363D]")}
      data-testid={`member-card-${member.nickname}`}
    >
      {background && (
        <div className="bgx-mini" aria-hidden style={{ borderRadius: 11 }}>
          <div className="absolute inset-x-0 top-1/2 aspect-video -translate-y-1/2">
            <BackgroundPreview id={background} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/80 via-[#0D1117]/30 to-transparent" />
        </div>
      )}
      <div className="relative flex h-full flex-col items-center justify-center gap-1.5 px-2 pb-3">
        <Avatar name={member.nickname} decoration={member.decoration} />
        <p className="flex max-w-full items-center gap-1 text-xs font-medium text-[#F0F6FC]">
          <span className="truncate">{member.nickname}</span>
          {member.role === "admin" && <ShieldCheck className="size-3 shrink-0 text-[#58A6FF]" aria-label="Admin" />}
        </p>
      </div>
      {pet && (
        <div className="pointer-events-none absolute inset-x-2 bottom-0" aria-hidden>
          <PetWalker id={pet} />
        </div>
      )}
    </li>
  );
}

function MembersSheet({ me, members, showPet, onClose }: { me: Me; members: MemberOut[]; showPet: boolean; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 md:hidden" data-testid="mobile-members-sheet">
      <button type="button" aria-label="Chiudi" className="absolute inset-0 bg-black/60 animate-in fade-in-0 duration-150" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[82dvh] flex-col rounded-t-2xl border-t border-[#30363D] bg-[#0D1117] pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom duration-200">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[#30363D]" />
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <p className="text-sm font-medium">
            Compagni <span className="ml-1 text-[#8B949E]">{members.length}</span>
          </p>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-md text-[#8B949E] active:scale-95" aria-label="Chiudi">
            <X className="size-4" />
          </button>
        </div>
        <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-5 pb-5" data-testid="mobile-members-list">
          {members.map((m) => (
            <MemberRow key={m.nickname} member={m} isMe={m.nickname === me.nickname} showPet={showPet} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function MobileMembers({ me, members, showPet }: { me: Me; members: MemberOut[]; showPet: boolean }) {
  const [open, setOpen] = useState(false);
  const ordered = useMemo(() => [...members].sort((a, b) => Number(b.nickname === me.nickname) - Number(a.nickname === me.nickname)), [members, me.nickname]);
  if (members.length === 0) return null;
  return (
    <section className="mb-6 md:hidden" data-testid="mobile-members">
      <button type="button" onClick={() => setOpen(true)} className="mb-2.5 flex w-full items-center justify-between text-left" data-testid="mobile-members-toggle">
        <span className="text-sm font-medium">
          Compagni <span className="ml-1 text-[#8B949E]">{members.length}</span>
        </span>
        <span className="flex items-center gap-0.5 text-xs text-[#8B949E]">
          Vedi tutti <ChevronRight className="size-3.5" />
        </span>
      </button>
      <ul className={RAIL} data-testid="mobile-members-rail">
        {ordered.map((m) => (
          <MemberCard key={m.nickname} member={m} isMe={m.nickname === me.nickname} showPet={showPet} />
        ))}
      </ul>
      {open && <MembersSheet me={me} members={ordered} showPet={showPet} onClose={() => setOpen(false)} />}
    </section>
  );
}
