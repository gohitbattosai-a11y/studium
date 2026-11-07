import type { Rarity } from "@/lib/api/types";

export type FossilKind = "ammonite" | "trilobite" | "brachiopod" | "tooth" | "fish" | "fern" | "amber" | "claw" | "egg" | "tusk" | "skull" | "bird" | "rex" | "geode";

export interface FossilSpecies {
  id: string;
  name: string;
  rarity: Rarity;
  kind: FossilKind;
  era: string;
  w: number;
  h: number;
  description: string;
}

export const FOSSILS: FossilSpecies[] = [
  { id: "ammonite", name: "Ammonite", rarity: "comune", kind: "ammonite", era: "Cretaceo", w: 2, h: 2, description: "Un mollusco marino dalla conchiglia a spirale, parente lontano del nautilus." },
  { id: "trilobite", name: "Trilobite", rarity: "comune", kind: "trilobite", era: "Cambriano", w: 3, h: 2, description: "Artropode dal corpo diviso in tre lobi, tra i primi animali con occhi complessi." },
  { id: "brachiopode", name: "Brachiopode", rarity: "comune", kind: "brachiopod", era: "Ordoviciano", w: 2, h: 2, description: "Sembra una conchiglia, ma è un animale del tutto diverso dai molluschi." },
  { id: "dente_megalodonte", name: "Dente di megalodonte", rarity: "non_comune", kind: "tooth", era: "Miocene", w: 2, h: 2, description: "Apparteneva a uno squalo gigantesco, lungo quanto un autobus." },
  { id: "pesce_fossile", name: "Pesce fossile", rarity: "non_comune", kind: "fish", era: "Eocene", w: 3, h: 2, description: "Uno scheletro perfetto conservato in uno strato di fango di un antico lago." },
  { id: "felce", name: "Impronta di felce", rarity: "non_comune", kind: "fern", era: "Carbonifero", w: 2, h: 3, description: "Le foreste di felci giganti di quest'epoca sono diventate il carbone di oggi." },
  { id: "ambra", name: "Ambra con insetto", rarity: "raro", kind: "amber", era: "Eocene", w: 2, h: 2, description: "Resina d'albero indurita che ha intrappolato un insetto per milioni di anni." },
  { id: "artiglio_raptor", name: "Artiglio di raptor", rarity: "raro", kind: "claw", era: "Cretaceo", w: 3, h: 2, description: "L'unghia a falce di un piccolo dinosauro cacciatore." },
  { id: "uovo_dino", name: "Uovo di dinosauro", rarity: "raro", kind: "egg", era: "Cretaceo", w: 2, h: 2, description: "Un uovo mai schiuso, rimasto sepolto da oltre sessanta milioni di anni." },
  { id: "zanna_mammut", name: "Zanna di mammut", rarity: "epico", kind: "tusk", era: "Pleistocene", w: 3, h: 2, description: "Curva e lunghissima, serviva a spostare la neve in cerca di erba." },
  { id: "cranio_triceratopo", name: "Cranio di triceratopo", rarity: "epico", kind: "skull", era: "Cretaceo", w: 4, h: 3, description: "Tre corna e un enorme collare osseo per difendersi dai predatori." },
  { id: "archaeopteryx", name: "Archaeopteryx", rarity: "leggendario", kind: "bird", era: "Giurassico", w: 4, h: 3, description: "Metà dinosauro e metà uccello: l'anello che unisce i due mondi." },
  { id: "tirannosauro", name: "Scheletro di T-Rex", rarity: "leggendario", kind: "rex", era: "Cretaceo", w: 5, h: 3, description: "Il re dei predatori terrestri, con un morso capace di frantumare le ossa." },
  { id: "geode_stellare", name: "Geode stellare", rarity: "mitico", kind: "geode", era: "Origine ignota", w: 2, h: 2, description: "Una roccia che brilla di una luce propria. Nessuno sa da dove venga." },
];

export const FOSSIL_BY_ID: Record<string, FossilSpecies> = Object.fromEntries(FOSSILS.map((f) => [f.id, f]));

const RARITIES: Rarity[] = ["comune", "non_comune", "raro", "epico", "leggendario", "mitico"];
const ODDS: Record<Rarity, number> = { comune: 50, non_comune: 28, raro: 15, epico: 5, leggendario: 1.6, mitico: 0.4 };

export function pickFossil(boost = 0): FossilSpecies {
  const w = (r: Rarity) => ODDS[r] * Math.pow(1 + boost, RARITIES.indexOf(r));
  const total = RARITIES.reduce((s, r) => s + w(r), 0);
  let x = Math.random() * total;
  const rarity = RARITIES.find((r) => (x -= w(r)) <= 0) ?? "comune";
  const list = FOSSILS.filter((f) => f.rarity === rarity);
  return list[Math.floor(Math.random() * list.length)];
}

export function condition(integrity: number): { label: string; color: string } {
  if (integrity >= 90) return { label: "Perfetto", color: "#7EE787" };
  if (integrity >= 65) return { label: "Buono", color: "#58A6FF" };
  if (integrity >= 35) return { label: "Danneggiato", color: "#E3B341" };
  return { label: "Frammentato", color: "#FF7B72" };
}

export type Tool = "brush" | "shovel" | "pick";

export const TOOLS: Record<Tool, { label: string; force: number; cost: number; damage: number; area: boolean }> = {
  brush: { label: "Pennello", force: 1, cost: 1, damage: 0, area: false },
  shovel: { label: "Pala", force: 2, cost: 1, damage: 9, area: false },
  pick: { label: "Piccone", force: 2, cost: 3, damage: 13, area: true },
};

export const COLS = 8;
export const ROWS = 6;
export const START_ENERGY = 45;

export interface Dig {
  sp: FossilSpecies;
  fx: number;
  fy: number;
  depth: number[];
  hit: boolean[];
  integrity: number;
  energy: number;
  touched: boolean;
}

const roll = (weights: number[]) => {
  let x = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < weights.length; i++) {
    x -= weights[i];
    if (x <= 0) return i + 1;
  }
  return weights.length;
};

export function newDig(boost = 0): Dig {
  const sp = pickFossil(boost);
  const fx = Math.floor(Math.random() * (COLS - sp.w + 1));
  const fy = Math.floor(Math.random() * (ROWS - sp.h + 1));
  const depth = Array.from({ length: COLS * ROWS }, () => roll([30, 45, 25]));
  for (let y = fy; y < fy + sp.h; y++) for (let x = fx; x < fx + sp.w; x++) depth[y * COLS + x] = roll([50, 50]);
  return { sp, fx, fy, depth, hit: Array.from({ length: sp.w * sp.h }, () => false), integrity: 100, energy: START_ENERGY, touched: false };
}

export const isFossilCell = (d: Dig, x: number, y: number) => x >= d.fx && x < d.fx + d.sp.w && y >= d.fy && y < d.fy + d.sp.h;

export function applyTool(d: Dig, tool: Tool, cx: number, cy: number): Dig {
  const t = TOOLS[tool];
  if (d.energy < t.cost) return d;
  const targets: [number, number][] = t.area
    ? [[cx, cy], [cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]
    : [[cx, cy]];
  const depth = d.depth.slice();
  const hit = d.hit.slice();
  let integrity = d.integrity;
  let changed = false;
  for (const [x, y] of targets) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue;
    const i = y * COLS + x;
    const fossil = isFossilCell(d, x, y);
    if (depth[i] === 0) {
      if (fossil && t.damage > 0) {
        const fi = (y - d.fy) * d.sp.w + (x - d.fx);
        hit[fi] = true;
        integrity -= t.damage;
        changed = true;
      }
      continue;
    }
    const over = t.force > depth[i];
    depth[i] = Math.max(0, depth[i] - t.force);
    changed = true;
    if (fossil && over && t.damage > 0) {
      const fi = (y - d.fy) * d.sp.w + (x - d.fx);
      hit[fi] = true;
      integrity -= t.damage;
    }
  }
  if (!changed) return d;
  return { ...d, depth, hit, integrity: Math.max(0, integrity), energy: d.energy - t.cost, touched: true };
}

export const isBroken = (d: Dig) => d.integrity <= 0;

export const isUncovered = (d: Dig) => {
  for (let y = d.fy; y < d.fy + d.sp.h; y++) for (let x = d.fx; x < d.fx + d.sp.w; x++) if (d.depth[y * COLS + x] > 0) return false;
  return true;
};
