import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "./api";
import { errMsg } from "./format";
import { queryClient } from "./queryClient";
import type { Me } from "./types";

const refreshAll = () => void queryClient.invalidateQueries();
const onError = (e: unknown) => toast.error(errMsg(e));

export function useKickMember() {
  return useMutation({
    mutationFn: (v: { member_id: string; nickname: string }) => apiPost<{ ok: boolean }>(`/members/${v.member_id}/kick`),
    onSuccess: (_res, v) => {
      refreshAll();
      toast.success(`${v.nickname} è stato espulso dal gruppo`);
    },
    onError,
  });
}

export function useRenameMe() {
  return useMutation({
    mutationFn: (v: { nickname: string; pin: string }) => apiPost<Me>("/auth/nickname", v),
    onSuccess: (me) => {
      queryClient.setQueryData(["me"], me);
      refreshAll();
      toast.success("Nome aggiornato");
    },
    onError,
  });
}

export function useChangePin() {
  return useMutation({
    mutationFn: (v: { current_pin: string; new_pin: string }) => apiPost<{ ok: boolean }>("/auth/pin", v),
    onSuccess: () => toast.success("PIN aggiornato"),
    onError,
  });
}

export function useChangeGroupPassword() {
  return useMutation({
    mutationFn: (v: { pin: string; new_password: string }) => apiPost<{ ok: boolean }>("/group/password", v),
    onSuccess: () => toast.success("Password del gruppo aggiornata"),
    onError,
  });
}
