import { useSyncExternalStore } from "react";
import { getActiveTab, subscribeActivity } from "@/lib/runtime/activity";
import { queryClient } from "@/lib/api/queryClient";

type PollOptions = { tabs?: readonly string[]; whileOverlay?: boolean };

const overlayOpen = () => document.documentElement.hasAttribute("data-paused") && !document.hidden;
const key = () => `${getActiveTab()}|${overlayOpen() ? 1 : 0}`;

export function usePoll(ms: number, { tabs, whileOverlay = false }: PollOptions = {}): number | false {
  const state = useSyncExternalStore(subscribeActivity, key, key);
  const [tab, overlay] = state.split("|");
  if (overlay === "1" && !whileOverlay) return false;
  if (tabs && !tabs.includes(tab)) return false;
  return ms;
}

const TAB_QUERIES: Record<string, readonly string[]> = {
  home: ["homework", "polls", "notices", "folders"],
  compiti: ["homework"],
  sondaggi: ["polls"],
  materiali: ["materials", "folders"],
  bacheca: ["notices"],
  giochi: ["games", "games-review"],
  shop: ["shop", "leaderboard", "pets"],
};

export function refreshTab(tab: string) {
  for (const key of TAB_QUERIES[tab] ?? []) void queryClient.refetchQueries({ queryKey: [key], type: "active", stale: true });
}
