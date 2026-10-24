import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiPost, apiPut } from "./api";
import { errMsg } from "./format";
import { queryClient } from "./queryClient";
import type { FinishResult, GameInput, GameOut, GameSummary } from "./types";

const KEYS = ["games", "games-review", "shop", "leaderboard", "members", "me", "my-events", "group-events"];

const refresh = () => {
  KEYS.forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
};

const onError = (e: unknown) => toast.error(errMsg(e));

export function useGameActions() {
  return {
    save: useMutation({
      mutationFn: async (v: { id?: string; input: GameInput; submit: boolean }) => {
        const game = v.id ? await apiPut<GameOut>(`/games/${v.id}`, v.input) : await apiPost<GameOut>("/games", v.input);
        if (!v.submit) return game;
        return apiPost<GameSummary>(`/games/${game.id}/submit`, {});
      },
      onSuccess: refresh,
      onError,
    }),
    submit: useMutation({
      mutationFn: (id: string) => apiPost<GameSummary>(`/games/${id}/submit`, {}),
      onSuccess: () => {
        refresh();
        toast.success("Inviato agli admin per la revisione");
      },
      onError,
    }),
    review: useMutation({
      mutationFn: (v: { id: string; approve: boolean; note: string }) =>
        apiPost<GameSummary>(`/games/${v.id}/review`, { approve: v.approve, note: v.note }),
      onSuccess: (g) => {
        refresh();
        toast.success(g.status === "published" ? "Gioco pubblicato" : "Gioco rifiutato");
      },
      onError,
    }),
    remove: useMutation({
      mutationFn: (id: string) => apiDelete<{ ok: boolean }>(`/games/${id}`),
      onSuccess: refresh,
      onError,
    }),
    finish: useMutation({
      mutationFn: (v: { id: string; score: number }) => apiPost<FinishResult>(`/games/${v.id}/finish`, { score: v.score }),
      onSuccess: refresh,
      onError,
    }),
    claim: useMutation({
      mutationFn: (id: string) => apiPost<FinishResult>(`/games/${id}/claim`, {}),
      onSuccess: (r) => {
        refresh();
        toast.success(`+${r.claimed_points} punti!`);
      },
      onError,
    }),
  };
}
