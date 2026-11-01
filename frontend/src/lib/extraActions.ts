import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "./api";
import { errMsg } from "./format";
import { queryClient } from "./queryClient";
import type { BadgesState, HuntState } from "./types";

const onError = (e: unknown) => toast.error(errMsg(e));

const refreshBadges = () => {
  ["badges", "members", "shop", "hunt"].forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
};

export function useHuntActions() {
  const onState = (state: HuntState) => {
    queryClient.setQueryData(["hunt"], state);
    refreshBadges();
  };
  return {
    knock: useMutation({ mutationFn: () => apiPost<HuntState>("/hunt/knock"), onSuccess: onState, onError }),
    solve: useMutation({
      mutationFn: (taps: string[]) => apiPost<HuntState>("/hunt/solve", { taps }),
      onSuccess: onState,
    }),
    equip: useMutation({
      mutationFn: (v: { kind: "decoration" | "background"; item_id: string | null }) => apiPost<BadgesState>("/badges/exclusive/equip", v),
      onSuccess: (state) => {
        queryClient.setQueryData(["badges"], state);
        refreshBadges();
      },
      onError,
    }),
  };
}
