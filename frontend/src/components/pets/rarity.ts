import type { Rarity } from "@/lib/types";

export const RARITY: Record<Rarity, { label: string; color: string }> = {
  comune: { label: "Comune", color: "#9CA3AF" },
  non_comune: { label: "Non comune", color: "#4ADE80" },
  raro: { label: "Raro", color: "#38BDF8" },
  epico: { label: "Epico", color: "#C084FC" },
  leggendario: { label: "Leggendario", color: "#FBBF24" },
  mitico: { label: "Mitico", color: "#F43F5E" },
};

export const PARTICLES: Record<Rarity, number> = { comune: 14, non_comune: 18, raro: 24, epico: 32, leggendario: 44, mitico: 60 };

export const TIER: Record<Rarity, number> = { comune: 0, non_comune: 1, raro: 2, epico: 3, leggendario: 4, mitico: 5 };
