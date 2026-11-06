import { useSyncExternalStore } from "react";
import type { CatchInfo, Donation } from "@/lib/domain/city";

export interface Known {
  name: string;
  description: string | null;
}

export interface AnimalCatch {
  id: string;
  species_id: string;
  weight: number;
  caught_at: string;
}

export interface AnimalGift {
  species_id: string;
  donor: string;
  weight: number;
  donated_at: string;
}

export interface Sandbox {
  user: { id: string; nickname: string };
  fishBucket: CatchInfo[];
  fishMuseum: Donation[];
  known: Record<string, Known>;
  animalBag: AnimalCatch[];
  animalMuseum: AnimalGift[];
}

export const FISH_LIMIT = 30;
export const ANIMAL_LIMIT = 20;

const initial = (): Sandbox => ({ user: { id: "test", nickname: "Admin" }, fishBucket: [], fishMuseum: [], known: {}, animalBag: [], animalMuseum: [] });

let state: Sandbox = initial();
const listeners = new Set<() => void>();
const commit = (next: Sandbox) => {
  state = next;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const getSandbox = () => state;
export const useSandbox = () => useSyncExternalStore(subscribe, getSandbox);

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export function setSandboxUser(id: string, nickname: string) {
  if (state.user.id === id && state.user.nickname === nickname) return;
  commit({ ...state, user: { id, nickname } });
}

export function resetSandbox() {
  commit({ ...initial(), user: state.user });
}

export function addFish(fish: CatchInfo) {
  commit({
    ...state,
    fishBucket: [fish, ...state.fishBucket],
    known: { ...state.known, [fish.species_id]: { name: fish.name, description: fish.description ?? null } },
  });
}

export function donateFish(id: string): Donation {
  const fish = state.fishBucket.find((f) => f.id === id);
  if (!fish) throw new Error("Pesce non trovato");
  if (state.fishMuseum.some((d) => d.species_id === fish.species_id)) throw new Error("Questa specie è già stata donata al museo");
  const gift: Donation = { species_id: fish.species_id, donor_id: state.user.id, donor: state.user.nickname, length: fish.length, donated_at: new Date().toISOString() };
  commit({ ...state, fishBucket: state.fishBucket.filter((f) => f.id !== id), fishMuseum: [...state.fishMuseum, gift] });
  return gift;
}

export function releaseFish(id: string) {
  if (!state.fishBucket.some((f) => f.id === id)) throw new Error("Pesce non trovato");
  commit({ ...state, fishBucket: state.fishBucket.filter((f) => f.id !== id) });
  return { ok: true };
}

export function addAnimal(species_id: string, weight: number): AnimalCatch {
  const item: AnimalCatch = { id: newId(), species_id, weight, caught_at: new Date().toISOString() };
  commit({ ...state, animalBag: [item, ...state.animalBag] });
  return item;
}

export function donateAnimal(id: string): AnimalGift {
  const item = state.animalBag.find((a) => a.id === id);
  if (!item) throw new Error("Animale non trovato");
  if (state.animalMuseum.some((g) => g.species_id === item.species_id)) throw new Error("Questa specie è già stata donata al museo");
  const gift: AnimalGift = { species_id: item.species_id, donor: state.user.nickname, weight: item.weight, donated_at: new Date().toISOString() };
  commit({ ...state, animalBag: state.animalBag.filter((a) => a.id !== id), animalMuseum: [...state.animalMuseum, gift] });
  return gift;
}

export function releaseAnimal(id: string) {
  if (!state.animalBag.some((a) => a.id === id)) throw new Error("Animale non trovato");
  commit({ ...state, animalBag: state.animalBag.filter((a) => a.id !== id) });
}
