import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { AbilityDef, Look, Loadout } from "@/lib/domain/dungeon";
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

export interface CharInfo {
  name: string;
  cls: string;
  look: Look;
  xp: number;
  level: number;
  xp_base: number;
  xp_next: number | null;
  equip: { weapon: string | null; armor: string | null };
  abilities: string[];
  slots: number;
}

export interface ClassInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  blurb: string;
  hp: number;
  atk: number;
  crit: number;
  slots: number;
  weapon_kind: string;
}

export interface AbilityInfo extends AbilityDef {
  cls: string;
  unlock: number;
}

export interface GearInfo {
  id: string;
  name: string;
  slot: "weapon" | "armor";
  rarity: Rarity;
  shape: string;
  color: string;
  stats: Record<string, number>;
  source: "start" | "shop" | "unlock" | "drop";
  classes: string[];
  price: number;
  owned: boolean;
  usable: boolean;
  how: string;
}

export interface DungeonHub {
  dungeons: DungeonInfo[];
  items: LootDef[];
  trophies: TrophyDef[];
  bag: Record<string, number>;
  bag_limit: number;
  mine: string[];
  hunters: Hunter[];
  char: CharInfo | null;
  classes: ClassInfo[];
  abilities: AbilityInfo[];
  gear: GearInfo[];
  money: number;
  looks: { skins: string[]; hairs: string[]; capes: string[] };
}

export interface FinishResult {
  roll: number;
  loot: string[];
  lost: number;
  trophies: string[];
  record: DungeonRecord;
  xp: number;
  level: number;
  leveled: boolean;
  new_abilities: string[];
  gear: string[];
  gear_refund: number;
}

const KEY = ["dungeon"];

export function useDungeonHub(enabled = true) {
  return useQuery({ queryKey: KEY, queryFn: () => apiGet<DungeonHub>("/dungeon"), enabled, staleTime: 10_000 });
}

export function useDungeonActions() {
  const qc = useQueryClient();
  const onError = (e: unknown) => toast.error(errMsg(e));
  const refresh = () => qc.invalidateQueries({ queryKey: KEY });
  return {
    start: useMutation({ mutationFn: (dungeon_id: string) => apiPost<{ run_id: string; loadout: Loadout }>("/dungeon/start", { dungeon_id }), onError }),
    finish: useMutation({
      mutationFn: (v: { run_id: string; cleared: number; won: boolean; kills: Record<string, number> }) => apiPost<FinishResult>("/dungeon/finish", v),
      onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
      onError,
    }),
    createChar: useMutation({ mutationFn: (v: { name: string; cls: string; look: Look }) => apiPost<CharInfo>("/dungeon/char", v), onSuccess: refresh, onError }),
    editChar: useMutation({ mutationFn: (v: { name?: string; look: Look }) => apiPatch<CharInfo>("/dungeon/char", v), onSuccess: refresh, onError }),
    resetChar: useMutation({ mutationFn: () => apiDelete("/dungeon/char"), onSuccess: refresh, onError }),
    equip: useMutation({ mutationFn: (v: { slot: string; gear_id: string | null }) => apiPost<CharInfo>("/dungeon/char/equip", v), onSuccess: refresh, onError }),
    setAbilities: useMutation({ mutationFn: (ids: string[]) => apiPost<CharInfo>("/dungeon/char/abilities", { ids }), onSuccess: refresh, onError }),
    buyGear: useMutation({
      mutationFn: (gear_id: string) => apiPost("/dungeon/gear/buy", { gear_id }),
      onSuccess: () => {
        refresh();
        qc.invalidateQueries({ queryKey: ["cityshop"] });
      },
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
