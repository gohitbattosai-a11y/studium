import { ShieldCheck } from "lucide-react";
import type { MemberOut } from "@/lib/types";
import { isBackgroundId } from "@/lib/theme";
import { Avatar } from "@/components/common";
import { BackgroundPreview } from "@/components/theme/ThemeBackground";
import { PetWalker } from "@/components/pets/PetWalker";

export default function MemberRow({ member, isMe, showPet }: { member: MemberOut; isMe: boolean; showPet: boolean }) {
  const background = isBackgroundId(member.background) ? member.background : null;
  const pet = showPet ? member.pet : null;
  return (
    <li className="bgx-mini-host dc-host relative -mx-2 rounded-md px-2 py-1.5 text-sm text-[#C9D1D9]" data-testid={`member-row-${member.nickname}`}>
      {background && (
        <div className="bgx-mini" aria-hidden>
          <div className="absolute inset-x-0 top-1/2 aspect-video -translate-y-1/2">
            <BackgroundPreview id={background} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1117]/85 via-[#0D1117]/45 to-[#0D1117]/10" />
        </div>
      )}
      <div className="relative flex items-center gap-2.5">
        <Avatar name={member.nickname} size="sm" decoration={member.decoration} />
        <span className="truncate">{member.nickname}</span>
        {isMe && <span className="text-xs text-[#8B949E]">(tu)</span>}
        {member.role === "admin" && <ShieldCheck className="size-3.5 shrink-0 text-[#58A6FF]" aria-label="Admin" />}
      </div>
      {pet && (
        <div className="pointer-events-none absolute bottom-0 left-12 w-[38%]" aria-hidden>
          <PetWalker id={pet} />
        </div>
      )}
    </li>
  );
}
