import { ShieldCheck, UserMinus } from "lucide-react";
import type { MemberOut } from "@/lib/api/types";
import { useKickMember } from "@/lib/actions/memberActions";
import { isBackgroundId } from "@/lib/domain/theme";
import { Avatar } from "@/components/common";
import { BackgroundPreview } from "@/components/theme/ThemeBackground";
import { PetWalker } from "@/components/pets/PetWalker";
import { BadgeStrip } from "@/components/badges/badges";

export default function MemberRow({ member, isMe, showPet, canKick = false }: { member: MemberOut; isMe: boolean; showPet: boolean; canKick?: boolean }) {
  const kick = useKickMember();
  const background = isBackgroundId(member.background) ? member.background : null;
  const pet = showPet ? member.pet : null;
  return (
    <li className="bgx-mini-host dc-host relative -mx-2 rounded-md px-2 py-1.5 text-sm text-[#C9D1D9]" data-testid={`member-row-${member.nickname}`}>
      {background && (
        <div className="bgx-mini" aria-hidden>
          <BackgroundPreview id={background} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1117]/85 via-[#0D1117]/45 to-[#0D1117]/10" />
        </div>
      )}
      <div className="relative flex items-center gap-2.5">
        <Avatar name={member.nickname} size="sm" decoration={member.decoration} />
        <span className="truncate">{member.nickname}</span>
        {isMe && <span className="text-xs text-[#8B949E]">(tu)</span>}
        {member.role === "admin" && <ShieldCheck className="size-3.5 shrink-0 text-[#58A6FF]" aria-label="Admin" />}
        <BadgeStrip ids={member.badges ?? []} />
        {canKick && (
          <button
            type="button"
            aria-label={`Espelli ${member.nickname}`}
            disabled={kick.isPending}
            onClick={() => window.confirm(`Espellere ${member.nickname} dal gruppo? Potrà rientrare con la password del gruppo.`) && kick.mutate({ member_id: member.member_id, nickname: member.nickname })}
            className="relative z-10 ml-auto grid size-7 shrink-0 place-items-center rounded-md text-[#8B949E] transition-colors hover:bg-[#21262D] hover:text-[#FF7B72] active:scale-95"
            data-testid={`member-kick-${member.nickname}`}
          >
            <UserMinus className="size-4" />
          </button>
        )}
      </div>
      {pet && (
        <div className="pointer-events-none absolute bottom-0 left-12 w-[38%]" aria-hidden>
          <PetWalker id={pet} />
        </div>
      )}
    </li>
  );
}
