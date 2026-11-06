import type { Rarity } from "@/lib/api/types";

export type AnimalKind = "quad" | "deer" | "hare" | "squirrel" | "bird" | "owl";

export type AnimalBehavior = "walk" | "hop" | "fly" | "graze" | "skulk";

export interface AnimalSpecies {
  id: string;
  name: string;
  rarity: Rarity;
  kind: AnimalKind;
  colors: [string, string, string];
  tusks?: boolean;
  tufts?: boolean;
  bulk?: boolean;
  glow?: boolean;
  min_kg: number;
  max_kg: number;
  difficulty: number;
  description: string;
  behavior: AnimalBehavior;
  scale: number;
  speed: number;
}

export const ANIMALS: AnimalSpecies[] = [
  { id: "coniglio", name: "Coniglio selvatico", rarity: "comune", kind: "hare", colors: ["#a8927a", "#efe6d6", "#7a6650"], min_kg: 1, max_kg: 2.5, difficulty: 1, description: "Veloce a nascondersi tra l'erba alta.", behavior: "hop", scale: 0.8, speed: 1.5 },
  { id: "scoiattolo", name: "Scoiattolo", rarity: "comune", kind: "squirrel", colors: ["#b4562b", "#f3e1c8", "#7a3a1c"], min_kg: 0.2, max_kg: 0.4, difficulty: 2, description: "Raccoglie ghiande e si dimentica dove le ha messe.", behavior: "hop", scale: 0.6, speed: 1.7 },
  { id: "fagiano", name: "Fagiano", rarity: "comune", kind: "bird", colors: ["#a9622f", "#d9a441", "#2f6b4f"], min_kg: 0.8, max_kg: 1.6, difficulty: 2, description: "Dal piumaggio vistoso, parte in volo all'improvviso.", behavior: "walk", scale: 0.85, speed: 1.1 },
  { id: "cornacchia", name: "Cornacchia", rarity: "comune", kind: "bird", colors: ["#2b2f3a", "#4a5060", "#14161c"], min_kg: 0.4, max_kg: 0.7, difficulty: 2, description: "Furba e curiosa, ricorda chi la disturba.", behavior: "fly", scale: 0.8, speed: 1.3 },
  { id: "volpe", name: "Volpe rossa", rarity: "non_comune", kind: "quad", colors: ["#d9672b", "#f6e7d0", "#4a2a1a"], min_kg: 4, max_kg: 8, difficulty: 4, description: "Scaltra e silenziosa, la coda è il suo vanto.", behavior: "skulk", scale: 1.0, speed: 1.2 },
  { id: "tasso", name: "Tasso", rarity: "non_comune", kind: "quad", colors: ["#6b7280", "#e5e7eb", "#1f2937"], min_kg: 7, max_kg: 14, difficulty: 4, description: "Esce al tramonto e scava tane profonde.", behavior: "skulk", scale: 0.95, speed: 0.8 },
  { id: "cinghiale", name: "Cinghiale", rarity: "non_comune", kind: "quad", colors: ["#5b4636", "#8a6f58", "#2a1d14"], tusks: true, bulk: true, min_kg: 50, max_kg: 120, difficulty: 5, description: "Robusto e testardo, rivolta il terreno in cerca di radici.", behavior: "walk", scale: 1.15, speed: 0.9 },
  { id: "cervo", name: "Cervo", rarity: "raro", kind: "deer", colors: ["#9a6b3c", "#e6cfa6", "#5a3a1c"], min_kg: 80, max_kg: 160, difficulty: 6, description: "Le sue corna maestose cambiano ogni anno.", behavior: "graze", scale: 1.35, speed: 1.0 },
  { id: "lupo", name: "Lupo grigio", rarity: "raro", kind: "quad", colors: ["#7b8088", "#d6d9de", "#3b3f46"], min_kg: 25, max_kg: 50, difficulty: 6, description: "Vive in branco e controlla il bosco di notte.", behavior: "skulk", scale: 1.15, speed: 1.2 },
  { id: "gufo_reale", name: "Gufo reale", rarity: "raro", kind: "owl", colors: ["#8a6a43", "#e8d9b5", "#e3a53a"], min_kg: 1.5, max_kg: 3, difficulty: 6, description: "Occhi arancioni che vedono tutto al buio.", behavior: "fly", scale: 0.95, speed: 1.0 },
  { id: "lince", name: "Lince", rarity: "raro", kind: "quad", colors: ["#b08a5a", "#efe3c8", "#4a3a28"], tufts: true, min_kg: 12, max_kg: 30, difficulty: 7, description: "Ciuffi sulle orecchie e passo felpato: quasi mai si vede.", behavior: "skulk", scale: 1.05, speed: 1.3 },
  { id: "orso", name: "Orso bruno", rarity: "epico", kind: "quad", colors: ["#5a3d28", "#8a6a4d", "#2a1a10"], bulk: true, min_kg: 150, max_kg: 350, difficulty: 8, description: "Il re del bosco: enorme, lento e pericoloso.", behavior: "walk", scale: 1.45, speed: 0.7 },
  { id: "alce", name: "Alce", rarity: "epico", kind: "deer", colors: ["#4a3a2e", "#8c7a66", "#2a2018"], min_kg: 200, max_kg: 450, difficulty: 8, description: "Palchi larghissimi e passo pesante.", behavior: "graze", scale: 1.5, speed: 0.8 },
  { id: "aquila", name: "Aquila reale", rarity: "epico", kind: "bird", colors: ["#5b4630", "#e0b04a", "#2b1f14"], min_kg: 3, max_kg: 6.5, difficulty: 7, description: "Domina il cielo sopra la foresta.", behavior: "fly", scale: 1.1, speed: 1.5 },
  { id: "lupo_bianco", name: "Lupo bianco", rarity: "leggendario", kind: "quad", colors: ["#f3f4f6", "#ffffff", "#9ca3af"], glow: true, min_kg: 30, max_kg: 55, difficulty: 9, description: "Si dice compaia solo nelle notti di luna piena.", behavior: "skulk", scale: 1.15, speed: 1.3 },
  { id: "cervo_bianco", name: "Cervo bianco", rarity: "leggendario", kind: "deer", colors: ["#f8fafc", "#ffffff", "#cbd5e1"], glow: true, min_kg: 90, max_kg: 170, difficulty: 9, description: "Chi lo vede, secondo le storie, avrà fortuna.", behavior: "graze", scale: 1.35, speed: 1.1 },
  { id: "spirito_bosco", name: "Spirito del bosco", rarity: "mitico", kind: "deer", colors: ["#6ee7b7", "#d1fae5", "#10b981"], glow: true, min_kg: 60, max_kg: 120, difficulty: 10, description: "Nessuno sa se sia davvero un animale.", behavior: "graze", scale: 1.4, speed: 1.4 },
];

export const ANIMAL_BY_ID: Record<string, AnimalSpecies> = Object.fromEntries(ANIMALS.map((a) => [a.id, a]));

const RARITIES: Rarity[] = ["comune", "non_comune", "raro", "epico", "leggendario", "mitico"];
const ODDS: Record<Rarity, number> = { comune: 52, non_comune: 28, raro: 14, epico: 4.5, leggendario: 1.2, mitico: 0.3 };

export function pickAnimal(boost = 0): AnimalSpecies {
  const w = (r: Rarity) => ODDS[r] * Math.pow(1 + boost, RARITIES.indexOf(r));
  const total = RARITIES.reduce((s, r) => s + w(r), 0);
  let x = Math.random() * total;
  const rarity = RARITIES.find((r) => (x -= w(r)) <= 0) ?? "comune";
  const list = ANIMALS.filter((a) => a.rarity === rarity);
  return list[Math.floor(Math.random() * list.length)];
}

export function rollWeight(a: AnimalSpecies): number {
  const span = a.max_kg - a.min_kg;
  const t = (Math.random() + Math.random()) / 2;
  return Math.round((a.min_kg + span * t) * 10) / 10;
}
