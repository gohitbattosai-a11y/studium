import { hasArt } from "./svgAssets";

export type BuiltinBackgroundId = "none" | "halloween" | "natale" | "biblioteca" | "spazio" | "oceano" | "tramonto" | "giappone" | "foresta" | "deserto" | "citta" | "aurora";

export type BackgroundId = BuiltinBackgroundId | (string & {});

export type BackgroundOption = { id: BackgroundId; label: string; hint: string };

export const BACKGROUNDS: BackgroundOption[] = [
  { id: "none", label: "Classico", hint: "Nessuno sfondo" },
  { id: "halloween", label: "Halloween", hint: "Zucche, pipistrelli e luna piena" },
  { id: "natale", label: "Natale", hint: "Neve, albero e baita illuminata" },
  { id: "biblioteca", label: "Biblioteca notturna", hint: "Scaffali, lampada da tavolo e cielo stellato" },
  { id: "spazio", label: "Spazio profondo", hint: "Nebulose, pianeta ad anelli e stelle cadenti" },
  { id: "oceano", label: "Fondale oceanico", hint: "Raggi di luce, pesci e bolle che salgono" },
  { id: "tramonto", label: "Tramonto sui monti", hint: "Sole che scende, montagne e uccelli in volo" },
  { id: "giappone", label: "Notte in Giappone", hint: "Torii, luna piena e petali di ciliegio" },
  { id: "foresta", label: "Foresta incantata", hint: "Alberi scuri, lucciole e funghi luminosi" },
  { id: "deserto", label: "Deserto di notte", hint: "Dune, cactus e luna crescente" },
  { id: "citta", label: "Città al neon", hint: "Grattacieli, finestre accese e sole synthwave" },
  { id: "aurora", label: "Aurora boreale", hint: "Bande luminose sopra montagne innevate" },
];

export const isBackgroundId = (value: string | null | undefined): value is BackgroundId =>
  !!value && (BACKGROUNDS.some((b) => b.id === value) || hasArt("backgrounds", value));
