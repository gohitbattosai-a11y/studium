import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "./api";
import { errMsg } from "./format";
import { queryClient } from "./queryClient";
import type { BadgesState, CapsulesState, HuntState, StudyMode, StudyState } from "./types";

const onError = (e: unknown) => toast.error(errMsg(e));

const refreshBadges = () => {
  ["badges", "members", "shop", "hunt"].forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
};

export function useStudioActions() {
  const onState = (state: StudyState) => {
    queryClient.setQueryData(["studio"], state);
    refreshBadges();
  };
  return {
    start: useMutation({
      mutationFn: (mode: StudyMode) => apiPost<StudyState>("/studio/start", { mode }),
      onSuccess: onState,
      onError,
    }),
    stop: useMutation({
      mutationFn: () => apiPost<StudyState>("/studio/stop"),
      onSuccess: onState,
      onError,
    }),
  };
}

export const pingStudio = () => apiPost<{ ok: boolean }>("/studio/ping").catch(() => ({ ok: false }));

export function useSealCapsule() {
  return useMutation({
    mutationFn: (v: { message: string; open_at: string }) => apiPost<CapsulesState>("/capsules", v),
    onSuccess: (state) => {
      queryClient.setQueryData(["capsules"], state);
      refreshBadges();
      toast.success("Capsula sigillata");
    },
    onError,
  });
}

export function useHuntActions() {
  const onState = (state: HuntState) => {
    queryClient.setQueryData(["hunt"], state);
    refreshBadges();
  };
  return {
    knock: useMutation({ mutationFn: () => apiPost<HuntState>("/hunt/knock"), onSuccess: onState, onError }),
    answer: useMutation({
      mutationFn: (answer: string) => apiPost<HuntState>("/hunt/answer", { answer }),
      onSuccess: onState,
      onError,
    }),
    equip: useMutation({
      mutationFn: (item_id: string | null) => apiPost<BadgesState>("/badges/exclusive/equip", { item_id }),
      onSuccess: (state) => {
        queryClient.setQueryData(["badges"], state);
        refreshBadges();
      },
      onError,
    }),
  };
}
