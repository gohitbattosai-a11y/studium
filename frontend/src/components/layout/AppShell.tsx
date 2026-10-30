import { useState } from "react";
import { BarChart3, BookOpen, FolderOpen, Gamepad2, LayoutGrid, LogOut, Megaphone, ShoppingBag, Users } from "lucide-react";
import type { Me, SiteStatus } from "@/lib/types";
import { endSession } from "@/lib/session";
import { useMembers, usePets, useShop } from "@/lib/queries";
import { featureOpen } from "@/lib/release";
import { useShopActions } from "@/lib/shopActions";
import { useAmbient } from "@/lib/ambient";
import { BACKGROUNDS, isBackgroundId, type BackgroundId, type BackgroundOption } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Avatar, BrandMark, Eyebrow } from "@/components/common";
import MemberRow from "@/components/layout/MemberRow";
import MobileMembers from "@/components/layout/MobileMembers";
import MobileNav from "@/components/layout/MobileNav";
import ThemeBackground from "@/components/theme/ThemeBackground";
import ThemePicker from "@/components/theme/ThemePicker";
import SoundSettings from "@/components/sound/SoundSettings";
import ShopPanel from "@/components/shop/ShopPanel";
import StatusBanner from "@/components/release/StatusBanner";
import PetCompanion from "@/components/pets/PetCompanion";
import { usePetSettings } from "@/components/pets/petSettings";
import GamesPanel from "@/components/games/GamesPanel";
import Overview from "@/components/Overview";
import HomeworkPanel from "@/components/agenda/HomeworkPanel";
import PollsPanel from "@/components/polls/PollsPanel";
import MaterialsPanel from "@/components/materials/MaterialsPanel";
import NoticesPanel from "@/components/notices/NoticesPanel";

export type Tab = "home" | "compiti" | "sondaggi" | "materiali" | "bacheca" | "shop" | "giochi";

const NAV: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: "home", label: "Home", icon: LayoutGrid },
  { id: "compiti", label: "Compiti", icon: BookOpen },
  { id: "sondaggi", label: "Sondaggi", icon: BarChart3 },
  { id: "materiali", label: "Materiali", icon: FolderOpen },
  { id: "bacheca", label: "Bacheca", icon: Megaphone },
  { id: "giochi", label: "Giochi", icon: Gamepad2 },
  { id: "shop", label: "Shop", icon: ShoppingBag },
];

export default function AppShell({ me, status }: { me: Me; status?: SiteStatus }) {
  const [tab, setTab] = useState<Tab>("home");
  const members = useMembers();
  const shop = useShop();
  const petsOpen = featureOpen(status, "pets", me.role);
  const pets = usePets(petsOpen);
  const petSettings = usePetSettings();
  const { equip } = useShopActions();
  const equipped = shop.data?.equipped_background;
  const background: BackgroundId = isBackgroundId(equipped) ? equipped : "none";
  const ownedBackgrounds = (shop.data?.items ?? []).filter((i) => i.kind === "background" && i.owned).map((i) => i.id);
  const customBackgrounds: BackgroundOption[] = (shop.data?.items ?? [])
    .filter((i) => i.kind === "background" && !BACKGROUNDS.some((b) => b.id === i.id))
    .map((i) => ({ id: i.id, label: i.name, hint: i.description }));
  const setBackground = (id: BackgroundId) => equip.mutate({ kind: "background", item_id: id === "none" ? null : id });
  useAmbient(background);
  const logout = () => void endSession("/");

  const go = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  const panel = (id: Tab) => cn(tab === id ? "block animate-in fade-in-0 slide-in-from-bottom-1 duration-200" : "hidden");

  return (
    <div className="relative isolate min-h-screen md:flex" data-background={background}>
      {petsOpen && petSettings.visible && pets.data?.active_pet && <PetCompanion key={pets.data.active_pet} petId={pets.data.active_pet} me={me} />}
      <ThemeBackground id={background} />
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-[#30363D] bg-[#0D1117] md:flex" data-testid="sidebar">
        <div className="flex h-14 items-center gap-2.5 px-5">
          <BrandMark className="size-7" />
          <span className="font-semibold tracking-tight">Studium</span>
        </div>
        <div className="mx-3 rounded-lg border border-[#30363D] bg-[#161B22] p-3">
          <Eyebrow>Gruppo</Eyebrow>
          <p className="mt-1 truncate font-medium" data-testid="sidebar-group-name">{me.group_name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#8B949E]">
            <Users className="size-3.5" /> {members.data?.length ?? me.member_count} membri
          </p>
        </div>
        <nav className="mt-4 space-y-0.5 px-3">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => go(n.id)}
              data-testid={`sidebar-tab-${n.id}`}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                tab === n.id ? "bg-[#161B22] text-[#F0F6FC] shadow-[inset_2px_0_0_#388BFD]" : "text-[#8B949E] hover:bg-[#161B22]/60 hover:text-[#F0F6FC]",
              )}
            >
              <n.icon className={cn("size-4", tab === n.id && "text-[#58A6FF]")} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-5">
          <Eyebrow className="mb-2">Compagni</Eyebrow>
          <ul className="space-y-1.5" data-testid="sidebar-members">
            {(members.data ?? []).map((m) => (
              <MemberRow key={m.nickname} member={m} isMe={m.nickname === me.nickname} showPet={petsOpen && petSettings.visible} />
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2.5 border-t border-[#30363D] p-3">
          <Avatar name={me.nickname} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" data-testid="sidebar-nickname">{me.nickname}</p>
            <p className="text-xs text-[#8B949E]">Connesso</p>
          </div>
          <ThemePicker
            value={background}
            owned={ownedBackgrounds}
            extra={customBackgrounds}
            onChange={setBackground}
            onShop={() => go("shop")}
            testId="sidebar-background-button"
            className="grid size-9 place-items-center rounded-md text-[#8B949E] transition-colors duration-150 hover:bg-[#161B22] hover:text-[#F0F6FC]"
          />
          <SoundSettings testId="sidebar-sound-button" className="grid size-9 place-items-center rounded-md text-[#8B949E] transition-colors duration-150 hover:bg-[#161B22] hover:text-[#F0F6FC]" />
          <button type="button" onClick={logout} className="grid size-9 place-items-center rounded-md text-[#8B949E] transition-colors duration-150 hover:bg-[#161B22] hover:text-[#F0F6FC]" aria-label="Esci" data-testid="sidebar-logout-button">
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#30363D] bg-[#0D1117]/95 px-4 md:hidden" data-testid="mobile-header">
          <BrandMark className="size-7" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight" data-testid="header-group-name">{me.group_name}</p>
            <p className="truncate text-xs text-[#8B949E]">come {me.nickname}</p>
          </div>
          <ThemePicker
            value={background}
            owned={ownedBackgrounds}
            extra={customBackgrounds}
            onChange={setBackground}
            onShop={() => go("shop")}
            testId="header-background-button"
            className="grid size-10 place-items-center rounded-md text-[#8B949E] active:scale-95"
          />
          <SoundSettings testId="header-sound-button" className="grid size-10 place-items-center rounded-md text-[#8B949E] active:scale-95" />
          <button type="button" onClick={logout} className="grid size-10 place-items-center rounded-md text-[#8B949E] active:scale-95" aria-label="Esci" data-testid="header-logout-button">
            <LogOut className="size-4" />
          </button>
        </header>

        <main className="mx-auto max-w-6xl px-4 pt-4 pb-24 md:px-8 md:pt-8 md:pb-12">
          <div className="mb-4 empty:hidden">
            <StatusBanner status={status} />
          </div>
          <div className={panel("home")} data-testid="panel-home">
            <MobileMembers me={me} members={members.data ?? []} showPet={petsOpen && petSettings.visible} />
            <Overview me={me} onNavigate={go} />
          </div>
          <div className={panel("compiti")} data-testid="panel-compiti">
            <HomeworkPanel me={me} />
          </div>
          <div className={panel("sondaggi")} data-testid="panel-sondaggi">
            <PollsPanel me={me} />
          </div>
          <div className={panel("materiali")} data-testid="panel-materiali">
            <MaterialsPanel me={me} />
          </div>
          <div className={panel("bacheca")} data-testid="panel-bacheca">
            <NoticesPanel me={me} />
          </div>
          <div className={panel("giochi")} data-testid="panel-giochi">
            <GamesPanel me={me} />
          </div>
          <div className={panel("shop")} data-testid="panel-shop">
            <ShopPanel me={me} />
          </div>
        </main>
      </div>

      <MobileNav items={NAV} tab={tab} onGo={go} />
    </div>
  );
}
