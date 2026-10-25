import { useSyncExternalStore } from "react";

export type Chatter = "tanto" | "normale" | "muto";

export interface PetSettings {
  visible: boolean;
  chatter: Chatter;
}

const KEY = "studium:pet:settings";
const DEFAULTS: PetSettings = { visible: true, chatter: "normale" };

const read = (): PetSettings => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<PetSettings>) };
  } catch {
    return DEFAULTS;
  }
  return DEFAULTS;
};

let current = read();
const listeners = new Set<() => void>();

export const setPetSettings = (patch: Partial<PetSettings>) => {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    current = { ...current };
  }
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const usePetSettings = () => useSyncExternalStore(subscribe, () => current, () => DEFAULTS);
