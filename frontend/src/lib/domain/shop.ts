import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";
import { usePoll } from "@/lib/api/polling";
import { errMsg } from "@/lib/utils/format";
import type { Rarity } from "@/lib/api/types";

export type SellKind = "fish" | "animal" | "fossil";
export type ShopCategory = "esca" | "richiamo" | "energia" | "stadio";

export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  description: string;
  price: number;
  owned: number;
  boost: number | null;
  energy: number | null;
  millions: number | null;
}

export interface ShopUpgrade {
  id: string;
  name: string;
  description: string;
  level: number;
  max_level: number;
  next_price: number | null;
}

export interface ShopState {
  money: number;
  items: ShopItem[];
  upgrades: ShopUpgrade[];
  convert: { rate: number; daily_cap: number; left_today: number };
  earned: number | null;
  granted: number | null;
}

export interface SellLine {
  kind: SellKind;
  species_id?: string;
  length?: number;
  rarity?: Rarity;
  factor?: number;
}

const RARITY_BASE: Record<Rarity, number> = { comune: 1, non_comune: 4, raro: 14, epico: 45, leggendario: 130, mitico: 500 };
const KIND_MULT: Record<SellKind, number> = { fish: 1, animal: 0.5, fossil: 1 };

export const sellValue = (kind: SellKind, rarity: Rarity, factor: number) => Math.max(1, Math.round(RARITY_BASE[rarity] * KIND_MULT[kind] * (0.8 + 0.4 * Math.min(1, Math.max(0, factor)))));

export const spanFactor = (value: number, min: number, max: number) => (max > min ? (value - min) / (max - min) : 0.5);

export const fmtMoney = (n: number) => n.toLocaleString("it-IT");

export const stockOf = (s: ShopState | undefined, id: string) => s?.items.find((i) => i.id === id)?.owned ?? 0;
export const levelOf = (s: ShopState | undefined, id: string) => s?.upgrades.find((u) => u.id === id)?.level ?? 0;

const KEY = ["cityshop"];

export function useCityShop(enabled = true) {
  return useQuery({ queryKey: KEY, queryFn: () => apiGet<ShopState>("/city/shop"), enabled, refetchInterval: usePoll(30_000, { whileOverlay: true }) });
}

export function useShopActions() {
  const qc = useQueryClient();
  const put = (s: ShopState) => qc.setQueryData(KEY, s);
  const onError = (e: unknown) => toast.error(errMsg(e));
  return {
    sell: useMutation({ mutationFn: (items: SellLine[]) => apiPost<ShopState>("/city/shop/sell", { items }), onSuccess: put, onError }),
    buy: useMutation({ mutationFn: (v: { item_id: string; qty: number }) => apiPost<ShopState>("/city/shop/buy", v), onSuccess: put, onError }),
    use: useMutation({ mutationFn: (item_id: string) => apiPost<ShopState>("/city/shop/use", { item_id }), onSuccess: put, onError }),
    upgrade: useMutation({ mutationFn: (upgrade_id: string) => apiPost<ShopState>("/city/shop/upgrade", { upgrade_id }), onSuccess: put, onError }),
    convert: useMutation({
      mutationFn: (points: number) => apiPost<ShopState>("/city/shop/convert", { points }),
      onSuccess: (s) => {
        put(s);
        qc.invalidateQueries({ queryKey: ["shop"] });
      },
      onError,
    }),
  };
}
