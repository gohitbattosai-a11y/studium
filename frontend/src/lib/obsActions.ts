import { useMutation } from "@tanstack/react-query";
import { apiPost } from "./api";
import { queryClient } from "./queryClient";
import type { ObsState } from "./types";

const refresh = () => {
  ["badges", "members", "shop", "pets"].forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
};

export function useObsActions() {
  const onState = (state: ObsState) => {
    queryClient.setQueryData(["obs"], state);
    if (state.finished) refresh();
  };
  return {
    open: useMutation({ mutationFn: () => apiPost<ObsState>("/obs/open"), onSuccess: onState }),
    solve: useMutation({
      mutationFn: (v: { puzzle: string; taps: string[] }) => apiPost<ObsState>("/obs/solve", v),
      onSuccess: onState,
    }),
    pet: useMutation({
      mutationFn: (active: boolean) => apiPost<ObsState>("/obs/pet", { active }),
      onSuccess: (state) => {
        onState(state);
        void queryClient.invalidateQueries({ queryKey: ["members"] });
      },
    }),
  };
}
