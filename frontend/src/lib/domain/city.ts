import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api/client";
import { usePoll } from "@/lib/api/polling";
import { errMsg } from "@/lib/utils/format";
import { FISH_LIMIT, addFish, donateFish, getSandbox, releaseFish, useSandbox, type Sandbox } from "@/lib/runtime/sandbox";
import type { Rarity } from "@/lib/api/types";

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
  description?: string | null;
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
  shape: FishShape;
  strength: number;
  dash: number;
  bite_window: number;
}

export interface ReelResult {
  caught: boolean;
  fish: CatchInfo | null;
}

function mergeState(server: CityState, sb: Sandbox): CityState {
  const donated = new Map(sb.fishMuseum.map((d) => [d.species_id, d]));
  const known = new Set([...donated.keys(), ...sb.fishBucket.map((c) => c.species_id)]);
  const species = server.species.map((s) => {
    const k = sb.known[s.id];
    return known.has(s.id) && k ? { ...s, name: k.name, description: k.description } : { ...s, name: null, description: null };
  });
  const bucket = sb.fishBucket.map((c) => {
    const g = donated.get(c.species_id);
    return { ...c, donated_by: g?.donor ?? null, donated_at: g?.donated_at ?? null };
  });
  return { ...server, species, museum: sb.fishMuseum, bucket, bucket_limit: FISH_LIMIT };
}

export function useCity(enabled: boolean) {
  const query = useQuery({ queryKey: ["city"], queryFn: () => apiGet<CityState>("/city"), enabled, refetchInterval: usePoll(30_000, { whileOverlay: true }) });
  const sb = useSandbox();
  const data = useMemo(() => (query.data ? mergeState(query.data, sb) : undefined), [query.data, sb]);
  return { ...query, data };
}

const fail = (e: unknown) => toast.error(errMsg(e));

export function useCityActions() {
  return {
    cast: useMutation({
      mutationFn: (bait: string) => {
        if (getSandbox().fishBucket.length >= FISH_LIMIT) return Promise.reject(new Error("Il secchio è pieno: dona o rilascia qualche pesce"));
        return apiPost<CastInfo>("/fishing/cast", { bait });
      },
      onError: fail,
    }),
    reel: useMutation({
      mutationFn: async (v: { cast_id: string; success: boolean }) => {
        const res = await apiPost<ReelResult>("/fishing/reel", v);
        if (res.caught && res.fish) {
          if (getSandbox().fishBucket.length >= FISH_LIMIT) throw new Error("Il secchio è pieno: dona o rilascia qualche pesce");
          addFish(res.fish);
        }
        return res;
      },
      onError: fail,
    }),
    donate: useMutation({
      mutationFn: async (catch_id: string) => donateFish(catch_id),
      onSuccess: () => toast.success("Pesce donato al museo!"),
      onError: fail,
    }),
    release: useMutation({
      mutationFn: async (catch_id: string) => releaseFish(catch_id),
      onError: fail,
    }),
  };
}
