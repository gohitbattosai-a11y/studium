import { useCallback, useState } from "react";

export type BackgroundId = "none" | "halloween" | "natale";

export const BACKGROUNDS: { id: BackgroundId; label: string; hint: string }[] = [
  { id: "none", label: "Classico", hint: "Nessuno sfondo" },
  { id: "halloween", label: "Halloween", hint: "Zucche, pipistrelli e luna piena" },
  { id: "natale", label: "Natale", hint: "Neve, albero e baita illuminata" },
];

const storageKey = (groupId: string) => `studium:background:${groupId}`;

function readBackground(groupId: string): BackgroundId {
  try {
    const value = localStorage.getItem(storageKey(groupId));
    if (value && BACKGROUNDS.some((b) => b.id === value)) return value as BackgroundId;
  } catch {
    return "none";
  }
  return "none";
}

export function useBackground(groupId: string) {
  const [background, setBackgroundState] = useState<BackgroundId>(() => readBackground(groupId));

  const setBackground = useCallback(
    (id: BackgroundId) => {
      setBackgroundState(id);
      try {
        localStorage.setItem(storageKey(groupId), id);
      } catch {
        return;
      }
    },
    [groupId],
  );

  return [background, setBackground] as const;
}
