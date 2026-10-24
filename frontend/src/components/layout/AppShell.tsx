import { useState } from "react";
import { BarChart3, BookOpen, FolderOpen, Gamepad2, LayoutGrid, LogOut, Megaphone, ShieldCheck, ShoppingBag, Users } from "lucide-react";
import type { Me } from "@/lib/types";
import { endSession } from "@/lib/session";
import { useMembers, useShop } from "@/lib/queries";
import { useShopActions } from "@/lib/shopActions";
import { isBackgroundId, type BackgroundId } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Avatar, BrandMark, Eyebrow } from "@/components/common";
import ThemeBackground from "@/components/theme/ThemeBackground";
import ThemePicker from "@/components/theme/ThemePicker";
import { DecorationDefs } from "@/components/shop/decorations";
import ShopPanel from "@/components/shop/ShopPanel";
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

export default function AppShell({ me }: { me: Me }) {
  const [tab, setTab] = useState<Tab>("home");
  const members = useMembers();
  const shop = useShop();
  const { equip } = useShopActions();
  const equipped = shop.data?.equipped_background;
  const background: BackgroundId = isBackgroundId(equipped) ? equipped : "none";
  const ownedBackgrounds = (shop.data?.items ?? []).filter((i) => i.kind === "background" && i.owned).map((i) => i.id);
  const setBackground = (id: BackgroundId) => equip.mutate({ kind: "background", item_id: id === "none" ? null : id });
  const logout = () => void endSession("/");

  const go = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  const panel = (id: Tab) => cn(tab === id ? "block animate-in fade-in-0 slide-in-from-bottom-1 duration-200" : "hidden");

  return (
    <div className="relative isolate min-h-dvh md:flex" data-background={background}>
      <DecorationDefs />
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
          <ul className="space-y-3" data-testid="sidebar-members">
            {(members.data ?? []).map((m) => (
              <li key={m.nickname} className="flex items-center gap-2 text-sm text-[#C9D1D9]">
                <Avatar name={m.nickname} size="sm" />
                <span className="truncate">{m.nickname}</span>
                {m.nickname === me.nickname && <span className="text-xs text-[#8B949E]">(tu)</span>}
                {m.role === "admin" && <ShieldCheck className="size-3.5 shrink-0 text-[#58A6FF]" aria-label="Admin" />}
              </li>
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
            onChange={setBackground}
            onShop={() => go("shop")}
            testId="sidebar-background-button"
            className="grid size-9 place-items-center rounded-md text-[#8B949E] transition-colors duration-150 hover:bg-[#161B22] hover:text-[#F0F6FC]"
          />
          <button type="button" onClick={logout} className="grid size-9 place-items-center rounded-md text-[#8B949E] transition-colors duration-150 hover:bg-[#161B22] hover:text-[#F0F6FC]" aria-label="Esci" data-testid="sidebar-logout-button">
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#30363D] bg-[#0D1117]/85 px-4 backdrop-blur-xl md:hidden" data-testid="mobile-header">
          <BrandMark className="size-7" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight" data-testid="header-group-name">{me.group_name}</p>
            <p className="truncate text-xs text-[#8B949E]">come {me.nickname}</p>
          </div>
          <ThemePicker
            value={background}
            owned={ownedBackgrounds}
            onChange={setBackground}
            onShop={() => go("shop")}
            testId="header-background-button"
            className="grid size-10 place-items-center rounded-md text-[#8B949E] active:scale-95"
          />
          <button type="button" onClick={logout} className="grid size-10 place-items-center rounded-md text-[#8B949E] active:scale-95" aria-label="Esci" data-testid="header-logout-button">
            <LogOut className="size-4" />
          </button>
        </header>

        <main className="mx-auto max-w-6xl px-4 pt-5 pb-28 md:px-8 md:pt-8 md:pb-12">
          <div className={panel("home")} data-testid="panel-home">
            <Overview me={me} onNavigate={go} />
          </div>
          <div className={panel("compiti")} data-testid="panel-compiti">
            <HomeworkPanel me={me} />
          </div>
          <div className={panel("sondaggi")} data-testid="panel-sondaggi">
            <PollsPanel />
          </div>
          <div className={panel("materiali")} data-testid="panel-materiali">
            <MaterialsPanel />
          </div>
          <div className={panel("bacheca")} data-testid="panel-bacheca">
            <NoticesPanel />
          </div>
          <div className={panel("giochi")} data-testid="panel-giochi">
            <GamesPanel me={me} />
          </div>
          <div className={panel("shop")} data-testid="panel-shop">
            <ShopPanel me={me} />
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#30363D] bg-[#161B22]/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" data-testid="bottom-nav">
        <div className="grid h-16 grid-cols-7">
          {NAV.map((n) => {
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => go(n.id)}
                data-testid={`nav-tab-${n.id}`}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-1 transition-transform duration-100 active:scale-95"
              >
                <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors duration-150", active ? "bg-[#388BFD]/15 text-[#58A6FF]" : "text-[#8B949E]")}>
                  <n.icon className="size-[18px]" />
                </span>
                <span className={cn("text-[10px] leading-none", active ? "text-[#F0F6FC]" : "text-[#8B949E]")}>{n.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
