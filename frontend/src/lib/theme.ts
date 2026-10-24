export type BackgroundId = "none" | "halloween" | "natale";

export const BACKGROUNDS: { id: BackgroundId; label: string; hint: string }[] = [
  { id: "none", label: "Classico", hint: "Nessuno sfondo" },
  { id: "halloween", label: "Halloween", hint: "Zucche, pipistrelli e luna piena" },
  { id: "natale", label: "Natale", hint: "Neve, albero e baita illuminata" },
];

export const isBackgroundId = (value: string | null | undefined): value is BackgroundId =>
  !!value && BACKGROUNDS.some((b) => b.id === value);
