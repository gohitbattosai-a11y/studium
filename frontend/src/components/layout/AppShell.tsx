import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { LogOut, User, Users } from "lucide-react";
import type { Me, SiteStatus } from "@/lib/api/types";
import { endSession } from "@/lib/api/session";
import { useMembers, usePets, useShop } from "@/lib/api/queries";
import { featureOpen } from "@/lib/runtime/release";
import { useShopActions } from "@/lib/actions/shopActions";
import { useAmbient } from "@/lib/audio/ambient";
import { BACKGROUNDS, isBackgroundId, type BackgroundId, type BackgroundOption } from "@/lib/domain/theme";
import { cn } from "@/lib/utils/cn";
import { Avatar, BrandMark, Eyebrow, SkeletonList } from "@/components/common";
import MemberRow from "@/components/layout/MemberRow";
import MobileNav from "@/components/layout/MobileNav";
import ThemeBackground from "@/components/theme/ThemeBackground";
import ThemePicker from "@/components/theme/ThemePicker";
import SoundSettings from "@/components/sound/SoundSettings";
import ProfileDialog from "@/components/profile/ProfileDialog";
import StatusBanner from "@/components/release/StatusBanner";
import PetCompanion from "@/components/pets/PetCompanion";
import { usePetSettings } from "@/components/pets/petSettings";
import SecretPassage, { SecretLogo } from "@/components/hunt/SecretPassage";
import { OBS_SEQUENCE, OBS_WINDOW } from "@/components/obs/entry";
import { setActiveTab } from "@/lib/runtime/activity";
import { refreshTab } from "@/lib/api/polling";
import { TABS, type TabId } from "@/components/layout/tabs";

const Observatory = lazy(() => import("@/components/obs/Observatory"));

export type Tab = TabId;

export default function AppShell({ me, status }: { me: Me; status?: SiteStatus }) {
  const [tab, setTab] = useState<Tab>("home");
  const [visited, setVisited] = useState<Tab[]>(["home"]);
  const [secretOpen, setSecretOpen] = useState(false);
  const [obsOpen, setObsOpen] = useState(false);
  const [screen, setScreen] = useState<Tab | null>(null);
  const trail = useRef<{ id: Tab; at: number }[]>([]);
  const members = useMembers();
  const shop = useShop();
  const petsOpen = featureOpen(status, "pets", me.role);
  const nav = TABS.filter((t) => !t.feature || featureOpen(status, t.feature, me.role));
  const screenDef = TABS.find((t) => t.id === screen && t.screen);
  const Screen = screenDef?.screen;
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
  useEffect(() => setActiveTab("home"), []);
  const logout = () => void endSession("/");

  const go = (t: Tab) => {
    if (TABS.find((x) => x.id === t)?.screen) {
      setScreen(t);
      return;
    }
    setTab(t);
    setActiveTab(t);
    refreshTab(t);
    setVisited((v) => (v.includes(t) ? v : [...v, t]));
    window.scrollTo({ top: 0 });
    const now = Date.now();
    trail.current = [...trail.current.filter((x) => now - x.at < OBS_WINDOW), { id: t, at: now }].slice(-OBS_SEQUENCE.length);
    if (trail.current.length === OBS_SEQUENCE.length && trail.current.every((x, i) => x.id === OBS_SEQUENCE[i])) {
      trail.current = [];
      setObsOpen(true);
    }
  };

  const panel = (id: Tab) => cn(tab === id ? "block animate-in fade-in-0 slide-in-from-bottom-1 duration-200" : "hidden");

  return (
    <div className="relative isolate min-h-screen md:flex" data-background={background}>
      {petsOpen && petSettings.visible && pets.data?.active_pet && <PetCompanion key={pets.data.active_pet} petId={pets.data.active_pet} me={me} />}
      <ThemeBackground id={background} />
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-[#30363D] bg-[#0D1117] md:flex" data-testid="sidebar">
        <div className="flex h-14 items-center gap-2.5 px-5">
          <SecretLogo onOpen={() => setSecretOpen(true)}>
            <BrandMark className="size-7" />
          </SecretLogo>
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
          {nav.map((n) => (
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
              <MemberRow key={m.member_id} member={m} isMe={m.nickname === me.nickname} showPet={petsOpen && petSettings.visible} canKick={me.role === "admin" && m.nickname !== me.nickname && m.role !== "admin"} />
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2.5 border-t border-[#30363D] p-3">
          <ProfileDialog me={me} testId="sidebar-profile-button" className="-m-1 flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-1 text-left transition-colors duration-150 hover:bg-[#161B22]/60">
            <Avatar name={me.nickname} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium" data-testid="sidebar-nickname">{me.nickname}</span>
              <span className="block text-xs text-[#8B949E]">Profilo</span>
            </span>
          </ProfileDialog>
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
          <SecretLogo onOpen={() => setSecretOpen(true)}>
            <BrandMark className="size-7" />
          </SecretLogo>
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
            className="grid size-9 place-items-center rounded-md text-[#8B949E] active:scale-95"
          />
          <ProfileDialog me={me} testId="header-profile-button" className="grid size-9 place-items-center rounded-md text-[#8B949E] active:scale-95">
            <User className="size-4" />
          </ProfileDialog>
          <SoundSettings testId="header-sound-button" className="grid size-9 place-items-center rounded-md text-[#8B949E] active:scale-95" />
          <button type="button" onClick={logout} className="grid size-9 place-items-center rounded-md text-[#8B949E] active:scale-95" aria-label="Esci" data-testid="header-logout-button">
            <LogOut className="size-4" />
          </button>
        </header>

        <main className="mx-auto max-w-6xl px-4 pt-4 pb-24 md:px-8 md:pt-8 md:pb-12">
          <div className="mb-4 empty:hidden">
            <StatusBanner status={status} role={me.role} />
          </div>
          {TABS.map((t) => {
            const Panel = t.panel;
            if (!Panel || !visited.includes(t.id)) return null;
            return (
              <div key={t.id} className={panel(t.id)} data-testid={`panel-${t.id}`}>
                <Suspense fallback={<SkeletonList />}>
                  <Panel me={me} go={go} />
                </Suspense>
              </div>
            );
          })}
        </main>
      </div>

      <MobileNav items={nav} tab={tab} onGo={go} />
      <SecretPassage me={me} open={secretOpen} onOpenChange={setSecretOpen} />
      {Screen && (
        <Suspense fallback={null}>
          <Screen me={me} onClose={() => setScreen(null)} />
        </Suspense>
      )}
      {obsOpen && (
        <Suspense fallback={null}>
          <Observatory me={me} open={obsOpen} onClose={() => setObsOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
