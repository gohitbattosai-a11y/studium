import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPost } from "./api";
import { errMsg } from "./format";
import { queryClient } from "./queryClient";
import type { Rarity } from "./types";

export type FishShape = "fusi" | "tondo" | "lungo" | "anguilla" | "piatto" | "siluro" | "drago";
export type FishPattern = "none" | "stripes" | "spots" | "patches" | "glow" | "stars" | "scales" | "lateral";

export interface Species {
  id: string;
  rarity: Rarity;
  shape: FishShape;
  colors: string[];
  pattern: FishPattern;
  min_cm: number;
  max_cm: number;
  difficulty: number;
  name: string | null;
  description: string | null;
}

export interface Bait {
  id: string;
  name: string;
  description: string;
}

export interface CatchInfo {
  id: string;
  species_id: string;
  name: string;
  rarity: Rarity;
  length: number;
  caught_at: string;
  donated_by: string | null;
  donated_at: string | null;
}

export interface Donation {
  species_id: string;
  donor_id: string;
  donor: string;
  length: number;
  donated_at: string;
}

export interface CityState {
  species: Species[];
  museum: Donation[];
  bucket: CatchInfo[];
  baits: Bait[];
  bucket_limit: number;
}

export interface CastInfo {
  cast_id: string;
  bite_in: number;
  difficulty: number;
  length: number;
}

export interface ReelResult {
  caught: boolean;
  fish: CatchInfo | null;
}

export const useCity = (enabled: boolean) =>
  useQuery({ queryKey: ["city"], queryFn: () => apiGet<CityState>("/city"), enabled, refetchInterval: 30_000 });

const refresh = () => void queryClient.invalidateQueries({ queryKey: ["city"] });
const fail = (e: unknown) => toast.error(errMsg(e));

export function useCityActions() {
  return {
    cast: useMutation({
      mutationFn: (bait: string) => apiPost<CastInfo>("/fishing/cast", { bait }),
      onError: fail,
    }),
    reel: useMutation({
      mutationFn: (v: { cast_id: string; success: boolean }) => apiPost<ReelResult>("/fishing/reel", v),
      onSuccess: refresh,
      onError: fail,
    }),
    donate: useMutation({
      mutationFn: (catch_id: string) => apiPost<Donation>("/museum/donate", { catch_id }),
      onSuccess: () => {
        toast.success("Pesce donato al museo!");
        refresh();
      },
      onError: (e: unknown) => {
        fail(e);
        refresh();
      },
    }),
    release: useMutation({
      mutationFn: (catch_id: string) => apiPost<{ ok: boolean }>("/fishing/release", { catch_id }),
      onSuccess: refresh,
      onError: fail,
    }),
  };
}
