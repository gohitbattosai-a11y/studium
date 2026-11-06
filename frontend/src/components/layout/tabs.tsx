import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { BarChart3, BookOpen, Building2, FolderOpen, Gamepad2, LayoutGrid, Megaphone, ShoppingBag, type LucideIcon } from "lucide-react";
import type { Me } from "@/lib/api/types";
import HomeTab from "./HomeTab";

export type TabId = "home" | "compiti" | "sondaggi" | "materiali" | "bacheca" | "shop" | "giochi" | "citta";

export interface PanelProps {
  me: Me;
  go: (tab: TabId) => void;
}

export interface ScreenProps {
  me: Me;
  onClose: () => void;
}

interface BaseTab {
  id: TabId;
  label: string;
  icon: LucideIcon;
  feature?: string;
}

export type TabDef =
  | (BaseTab & { panel: ComponentType<PanelProps> | LazyExoticComponent<ComponentType<PanelProps>>; screen?: never })
  | (BaseTab & { screen: LazyExoticComponent<ComponentType<ScreenProps>>; panel?: never });

const page = (load: () => Promise<{ default: ComponentType<{ me: Me }> }>) =>
  lazy(async () => {
    const { default: Page } = await load();
    return { default: ({ me }: PanelProps) => <Page me={me} /> };
  });

export const TABS: TabDef[] = [
  { id: "home", label: "Home", icon: LayoutGrid, panel: HomeTab },
  { id: "compiti", label: "Compiti", icon: BookOpen, panel: page(() => import("@/components/agenda/HomeworkPanel")) },
  { id: "sondaggi", label: "Sondaggi", icon: BarChart3, panel: page(() => import("@/components/polls/PollsPanel")) },
  { id: "materiali", label: "Materiali", icon: FolderOpen, panel: page(() => import("@/components/materials/MaterialsPanel")) },
  { id: "bacheca", label: "Bacheca", icon: Megaphone, panel: page(() => import("@/components/notices/NoticesPanel")) },
  { id: "giochi", label: "Giochi", icon: Gamepad2, panel: page(() => import("@/components/games/GamesPanel")) },
  { id: "citta", label: "Città", icon: Building2, feature: "citta", screen: lazy(() => import("@/components/city/CityPanel")) },
  { id: "shop", label: "Shop", icon: ShoppingBag, panel: page(() => import("@/components/shop/ShopPanel")) },
];
