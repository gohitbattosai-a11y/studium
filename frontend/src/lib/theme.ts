export type BackgroundId = "none" | "halloween" | "natale" | "biblioteca" | "spazio" | "oceano" | "tramonto" | "giappone";

export const BACKGROUNDS: { id: BackgroundId; label: string; hint: string }[] = [
  { id: "none", label: "Classico", hint: "Nessuno sfondo" },
  { id: "halloween", label: "Halloween", hint: "Zucche, pipistrelli e luna piena" },
  { id: "natale", label: "Natale", hint: "Neve, albero e baita illuminata" },
  { id: "biblioteca", label: "Biblioteca notturna", hint: "Scaffali, lampada da tavolo e cielo stellato" },
  { id: "spazio", label: "Spazio profondo", hint: "Nebulose, pianeta ad anelli e stelle cadenti" },
  { id: "oceano", label: "Fondale oceanico", hint: "Raggi di luce, pesci e bolle che salgono" },
  { id: "tramonto", label: "Tramonto sui monti", hint: "Sole che scende, montagne e uccelli in volo" },
  { id: "giappone", label: "Notte in Giappone", hint: "Torii, luna piena e petali di ciliegio" },
];

export const isBackgroundId = (value: string | null | undefined): value is BackgroundId =>
  !!value && BACKGROUNDS.some((b) => b.id === value);
