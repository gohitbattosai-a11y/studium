import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./api";
import type { Folder, Homework, Material, MemberOut, Notice, Poll } from "./types";

// Background refresh keeps class data fresh; form drafts live in component state, never in these caches.
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
