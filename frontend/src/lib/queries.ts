import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api";
import type { Folder, Homework, LeaderboardEntry, Material, MemberOut, Notice, PointEvent, Poll, ShopState } from "./types";

const REFRESH = 30_000;

export const useHomework = () =>
  useQuery({ queryKey: ["homework"], queryFn: () => apiGet<Homework[]>("/homework"), refetchInterval: REFRESH });
export const usePolls = () =>
  useQuery({ queryKey: ["polls"], queryFn: () => apiGet<Poll[]>("/polls"), refetchInterval: REFRESH });
export const useFolders = () =>
  useQuery({ queryKey: ["folders"], queryFn: () => apiGet<Folder[]>("/folders"), refetchInterval: REFRESH });
export const useMaterials = () =>
  useQuery({ queryKey: ["materials"], queryFn: () => apiGet<Material[]>("/materials"), refetchInterval: REFRESH });
export const useNotices = () =>
  useQuery({ queryKey: ["notices"], queryFn: () => apiGet<Notice[]>("/notices"), refetchInterval: REFRESH });
export const useMembers = () =>
  useQuery({ queryKey: ["members"], queryFn: () => apiGet<MemberOut[]>("/members"), refetchInterval: 60_000 });
export const useShop = () =>
  useQuery({ queryKey: ["shop"], queryFn: () => apiGet<ShopState>("/shop"), refetchInterval: REFRESH });
export const useLeaderboard = () =>
  useQuery({ queryKey: ["leaderboard"], queryFn: () => apiGet<LeaderboardEntry[]>("/leaderboard"), refetchInterval: REFRESH });
export const useMyEvents = (enabled: boolean) =>
  useQuery({ queryKey: ["my-events"], queryFn: () => apiGet<PointEvent[]>("/points/mine"), enabled });
export const useGroupEvents = (enabled: boolean) =>
  useQuery({ queryKey: ["group-events"], queryFn: () => apiGet<PointEvent[]>("/points/events"), enabled });
