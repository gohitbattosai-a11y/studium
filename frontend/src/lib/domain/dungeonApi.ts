import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api/client";
import { errMsg } from "@/lib/utils/format";
import type { Rarity } from "@/lib/api/types";

export interface LootDef {
  id: string;
  name: string;
  rarity: Rarity;
  shape: string;
  color: string;
  value: number;
}

export interface TrophyDef {
  id: string;
  name: string;
  dungeon: string;
  enemy: string;
  rarity: Rarity;
  art: string;
  color: string;
  blurb: string;
}

export interface DungeonRecord {
  best: number;
  wins: number;
  runs: number;
}

export interface DungeonInfo {
  id: string;
  name: string;
  tag: string;
  blurb: string;
  floors: number;
  record: DungeonRecord;
}

export interface Hunter {
  member_id: string;
  nickname: string;
  trophies: string[];
}

export interface DungeonHub {
  dungeons: DungeonInfo[];
  items: LootDef[];
  trophies: TrophyDef[];
  bag: Record<string, number>;
  bag_limit: number;
  mine: string[];
  hunters: Hunter[];
}

export interface FinishResult {
  roll: number;
  loot: string[];
  lost: number;
  trophies: string[];
  record: DungeonRecord;
}

const KEY = ["dungeon"];

export function useDungeonHub(enabled = true) {
  return useQuery({ queryKey: KEY, queryFn: () => apiGet<DungeonHub>("/dungeon"), enabled, staleTime: 10_000 });
}

export function useDungeonActions() {
  const qc = useQueryClient();
  const onError = (e: unknown) => toast.error(errMsg(e));
  return {
    start: useMutation({ mutationFn: (dungeon_id: string) => apiPost<{ run_id: string }>("/dungeon/start", { dungeon_id }), onError }),
    finish: useMutation({
      mutationFn: (v: { run_id: string; cleared: number; won: boolean; kills: Record<string, number> }) => apiPost<FinishResult>("/dungeon/finish", v),
      onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
      onError,
    }),
    sell: useMutation({
      mutationFn: (items: { item_id: string; qty: number }[]) => apiPost<{ earned: number; bag: Record<string, number> }>("/dungeon/sell", { items }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: KEY });
        qc.invalidateQueries({ queryKey: ["cityshop"] });
      },
      onError,
    }),
  };
}
