import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "@/lib/api/client";
import { errMsg } from "@/lib/utils/format";
import { queryClient } from "@/lib/api/queryClient";
import type { PetsState, RollResult } from "@/lib/api/types";

const KEYS = ["pets", "shop", "leaderboard", "me", "members"];

const refresh = () => {
  KEYS.forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
};

export function usePetActions() {
  return {
    roll: useMutation({
      mutationFn: (box_id: string) => apiPost<RollResult>("/pets/roll", { box_id }),
      onSuccess: refresh,
      onError: (e: unknown) => toast.error(errMsg(e)),
    }),
    setActive: useMutation({
      mutationFn: (pet_id: string | null) => apiPost<PetsState>("/pets/active", { pet_id }),
      onSuccess: (state) => {
        queryClient.setQueryData(["pets"], state);
        refresh();
      },
      onError: (e: unknown) => toast.error(errMsg(e)),
    }),
  };
}
