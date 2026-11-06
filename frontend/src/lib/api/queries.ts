import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { usePoll } from "@/lib/api/polling";
import type { BadgesState, Folder, Homework, GameSummary, LeaderboardEntry, Material, MemberOut, Notice, PetsState, PointEvent, PointsTable, Poll, ShopState, SiteStatus } from "@/lib/api/types";

const FAST = 30_000;
const SLOW = 90_000;
const HOME = "home";

export const useHomework = () =>
  useQuery({ queryKey: ["homework"], queryFn: () => apiGet<Homework[]>("/homework"), refetchInterval: usePoll(FAST, { tabs: [HOME, "compiti"] }) });
export const usePolls = () =>
  useQuery({ queryKey: ["polls"], queryFn: () => apiGet<Poll[]>("/polls"), refetchInterval: usePoll(FAST, { tabs: [HOME, "sondaggi"] }) });
export const useFolders = () =>
  useQuery({ queryKey: ["folders"], queryFn: () => apiGet<Folder[]>("/folders"), refetchInterval: usePoll(SLOW, { tabs: [HOME, "materiali"] }) });
export const useMaterials = () =>
  useQuery({ queryKey: ["materials"], queryFn: () => apiGet<Material[]>("/materials"), refetchInterval: usePoll(SLOW, { tabs: ["materiali"] }) });
export const useNotices = () =>
  useQuery({ queryKey: ["notices"], queryFn: () => apiGet<Notice[]>("/notices"), refetchInterval: usePoll(FAST, { tabs: [HOME, "bacheca"] }) });
export const useMembers = () =>
  useQuery({ queryKey: ["members"], queryFn: () => apiGet<MemberOut[]>("/members"), staleTime: 60_000, refetchInterval: usePoll(120_000) });
export const useShop = () =>
  useQuery({ queryKey: ["shop"], queryFn: () => apiGet<ShopState>("/shop"), refetchInterval: usePoll(FAST, { tabs: ["shop"] }) });
export const useLeaderboard = () =>
  useQuery({ queryKey: ["leaderboard"], queryFn: () => apiGet<LeaderboardEntry[]>("/leaderboard"), refetchInterval: usePoll(SLOW, { tabs: ["shop"] }) });
export const useMyEvents = (enabled: boolean) =>
  useQuery({ queryKey: ["my-events"], queryFn: () => apiGet<PointEvent[]>("/points/mine"), enabled });
export const useGroupEvents = (enabled: boolean) =>
  useQuery({ queryKey: ["group-events"], queryFn: () => apiGet<PointEvent[]>("/points/events"), enabled });
export const useGames = () =>
  useQuery({ queryKey: ["games"], queryFn: () => apiGet<GameSummary[]>("/games"), refetchInterval: usePoll(FAST, { tabs: ["giochi"] }) });
export const useReviewQueue = (enabled: boolean) =>
  useQuery({ queryKey: ["games-review"], queryFn: () => apiGet<GameSummary[]>("/games/review"), enabled, refetchInterval: usePoll(SLOW, { tabs: ["giochi"] }) });
export const usePointsTable = () =>
  useQuery({ queryKey: ["points-table"], queryFn: () => apiGet<PointsTable>("/points/table"), staleTime: 60 * 60 * 1000 });
export const useStatus = () =>
  useQuery({ queryKey: ["status"], queryFn: () => apiGet<SiteStatus>("/status"), refetchInterval: usePoll(30_000), retry: false });
export const usePets = (enabled: boolean) =>
  useQuery({ queryKey: ["pets"], queryFn: () => apiGet<PetsState>("/pets"), enabled, refetchInterval: usePoll(SLOW, { tabs: ["shop"] }) });
export const useBadges = () =>
  useQuery({ queryKey: ["badges"], queryFn: () => apiGet<BadgesState>("/badges"), staleTime: 5 * 60_000 });
