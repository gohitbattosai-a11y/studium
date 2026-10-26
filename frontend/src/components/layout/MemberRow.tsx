import { ShieldCheck } from "lucide-react";
import type { MemberOut } from "@/lib/types";
import { isBackgroundId } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/common";
import { BackgroundPreview } from "@/components/theme/ThemeBackground";
import { PetWalker } from "@/components/pets/PetWalker";

export default function MemberRow({ member, isMe, showPet }: { member: MemberOut; isMe: boolean; showPet: boolean }) {
  const background = isBackgroundId(member.background) ? member.background : null;
  const pet = showPet ? member.pet : null;
  return (
    <li className={cn("bgx-mini-host relative -mx-2 flex items-center gap-2.5 rounded-md px-2 text-sm text-[#C9D1D9]", pet ? "h-10" : "py-1.5")} data-testid={`member-row-${member.nickname}`}>
      {background && (
        <div className="bgx-mini" aria-hidden>
          <div className="absolute inset-x-0 top-1/2 aspect-video -translate-y-1/2">
            <BackgroundPreview id={background} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1117]/85 via-[#0D1117]/45 to-[#0D1117]/10" />
        </div>
      )}
      <Avatar name={member.nickname} size="sm" decoration={member.decoration} />
      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-1.5 leading-4">
          <span className="truncate">{member.nickname}</span>
          {isMe && <span className="text-xs text-[#8B949E]">(tu)</span>}
          {member.role === "admin" && <ShieldCheck className="size-3.5 shrink-0 text-[#58A6FF]" aria-label="Admin" />}
        </div>
        {pet && <PetWalker id={pet} />}
      </div>
    </li>
  );
}
