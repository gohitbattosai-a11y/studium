import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiPost } from "./api";
import { errMsg } from "./format";
import { queryClient } from "./queryClient";
import type { BonusCreate, GradeCreate, ItemKind, MemberOut, PointEvent, Role, ShopState } from "./types";

const KEYS = ["shop", "leaderboard", "members", "me", "my-events", "group-events"];

const refresh = () => {
  KEYS.forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
};

const onState = (state: ShopState) => {
  queryClient.setQueryData(["shop"], state);
  refresh();
};

const onError = (e: unknown) => toast.error(errMsg(e));

export function useShopActions() {
  return {
    participate: useMutation({
      mutationFn: (participating: boolean) => apiPost<ShopState>("/shop/participation", { participating }),
      onSuccess: onState,
      onError,
    }),
    buy: useMutation({
      mutationFn: (item_id: string) => apiPost<ShopState>("/shop/buy", { item_id }),
      onSuccess: (state) => {
        onState(state);
        toast.success("Acquisto completato");
      },
      onError,
    }),
    equip: useMutation({
      mutationFn: (v: { kind: ItemKind; item_id: string | null }) => apiPost<ShopState>("/shop/equip", v),
      onSuccess: onState,
      onError,
    }),
    grade: useMutation({
      mutationFn: (v: GradeCreate) => apiPost<PointEvent>("/points/grade", v),
      onSuccess: (e) => {
        refresh();
        toast.success(`${e.nickname}: +${e.points} punti`);
      },
      onError,
    }),
    bonus: useMutation({
      mutationFn: (v: BonusCreate) => apiPost<PointEvent>("/points/bonus", v),
      onSuccess: () => {
        refresh();
        toast.success("Movimento registrato");
      },
      onError,
    }),
    removeEvent: useMutation({
      mutationFn: (id: string) => apiDelete<{ ok: boolean }>(`/points/events/${id}`),
      onSuccess: refresh,
      onError,
    }),
    setRole: useMutation({
      mutationFn: (v: { member_id: string; role: Role }) => apiPost<MemberOut>(`/members/${v.member_id}/role`, { role: v.role }),
      onSuccess: () => {
        refresh();
        toast.success("Ruolo aggiornato");
      },
      onError,
    }),
  };
}
