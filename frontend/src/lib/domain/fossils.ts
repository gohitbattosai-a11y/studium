import type { Rarity } from "@/lib/api/types";

export type FossilKind = "ammonite" | "trilobite" | "brachiopod" | "tooth" | "fish" | "fern" | "amber" | "claw" | "egg" | "tusk" | "skull" | "bird" | "rex" | "geode";

export type HallId = "mari" | "giungla" | "giganti";

export interface FossilSpecies {
  id: string;
  name: string;
  rarity: Rarity;
  kind: FossilKind;
  era: string;
  scale: number;
  hall: HallId;
  description: string;
}

export const FOSSILS: FossilSpecies[] = [
  { id: "ammonite", name: "Ammonite", rarity: "comune", kind: "ammonite", era: "Cretaceo", scale: 0.3, hall: "mari", description: "Un mollusco marino dalla conchiglia a spirale, parente lontano del nautilus." },
  { id: "trilobite", name: "Trilobite", rarity: "comune", kind: "trilobite", era: "Cambriano", scale: 0.32, hall: "mari", description: "Artropode dal corpo diviso in tre lobi, tra i primi animali con occhi complessi." },
  { id: "brachiopode", name: "Brachiopode", rarity: "comune", kind: "brachiopod", era: "Ordoviciano", scale: 0.3, hall: "mari", description: "Sembra una conchiglia, ma è un animale del tutto diverso dai molluschi." },
  { id: "dente_megalodonte", name: "Dente di megalodonte", rarity: "non_comune", kind: "tooth", era: "Miocene", scale: 0.32, hall: "mari", description: "Apparteneva a uno squalo gigantesco, lungo quanto un autobus." },
  { id: "pesce_fossile", name: "Pesce fossile", rarity: "non_comune", kind: "fish", era: "Eocene", scale: 0.4, hall: "mari", description: "Uno scheletro perfetto conservato in uno strato di fango di un antico lago." },
  { id: "felce", name: "Impronta di felce", rarity: "non_comune", kind: "fern", era: "Carbonifero", scale: 0.34, hall: "giungla", description: "Le foreste di felci giganti di quest'epoca sono diventate il carbone di oggi." },
  { id: "ambra", name: "Ambra con insetto", rarity: "raro", kind: "amber", era: "Eocene", scale: 0.3, hall: "giungla", description: "Resina d'albero indurita che ha intrappolato un insetto per milioni di anni." },
  { id: "artiglio_raptor", name: "Artiglio di raptor", rarity: "raro", kind: "claw", era: "Cretaceo", scale: 0.34, hall: "giungla", description: "L'unghia a falce di un piccolo dinosauro cacciatore." },
  { id: "uovo_dino", name: "Uovo di dinosauro", rarity: "raro", kind: "egg", era: "Cretaceo", scale: 0.32, hall: "giungla", description: "Un uovo mai schiuso, rimasto sepolto da oltre sessanta milioni di anni." },
  { id: "archaeopteryx", name: "Archaeopteryx", rarity: "leggendario", kind: "bird", era: "Giurassico", scale: 0.5, hall: "giungla", description: "Metà dinosauro e metà uccello: l'anello che unisce i due mondi." },
  { id: "zanna_mammut", name: "Zanna di mammut", rarity: "epico", kind: "tusk", era: "Pleistocene", scale: 0.42, hall: "giganti", description: "Curva e lunghissima, serviva a spostare la neve in cerca di erba." },
  { id: "cranio_triceratopo", name: "Cranio di triceratopo", rarity: "epico", kind: "skull", era: "Cretaceo", scale: 0.5, hall: "giganti", description: "Tre corna e un enorme collare osseo per difendersi dai predatori." },
  { id: "tirannosauro", name: "Scheletro di T-Rex", rarity: "leggendario", kind: "rex", era: "Cretaceo", scale: 0.66, hall: "giganti", description: "Il re dei predatori terrestri, con un morso capace di frantumare le ossa." },
  { id: "geode_stellare", name: "Geode stellare", rarity: "mitico", kind: "geode", era: "Origine ignota", scale: 0.3, hall: "giganti", description: "Una roccia che brilla di una luce propria. Nessuno sa da dove venga." },
];

export const FOSSIL_BY_ID: Record<string, FossilSpecies> = Object.fromEntries(FOSSILS.map((f) => [f.id, f]));

export interface Hall {
  id: HallId;
  name: string;
  intro: string;
}

export const HALLS: Hall[] = [
  { id: "mari", name: "Mari primordiali", intro: "Quando la vita viveva ancora sott'acqua: conchiglie a spirale, artropodi e squali giganti." },
  { id: "giungla", name: "Giungla del Giurassico", intro: "Felci enormi, resina dorata e i primi dinosauri che imparavano a volare." },
  { id: "giganti", name: "Sala dei giganti", intro: "I colossi che hanno dominato la Terra, e una roccia venuta da molto più lontano." },
];

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

export interface Site {
  id: string;
  name: string;
  blurb: string;
  boost: number;
  sand: string;
  earth: string;
  deep: string;
  speck: string[];
  sky: [string, string];
  accent: string;
}

export const SITES: Site[] = [
  { id: "canyon", name: "Canyon rosso", blurb: "Strati di arenaria: il posto giusto per cominciare.", boost: 0.1, sand: "#e2b878", earth: "#9a6a3c", deep: "#4a2f1a", speck: ["#f3d39b", "#c89655", "#b07d45", "#fff0c8"], sky: ["#f6d08e", "#e59d5c"], accent: "#E3B341" },
  { id: "ghiaccio", name: "Cava glaciale", blurb: "Permafrost e ghiaia: qui riposano i giganti del ghiaccio.", boost: 0.75, sand: "#dbe9f2", earth: "#7d94a8", deep: "#2c3a4a", speck: ["#ffffff", "#b9d2e3", "#9bb5c9", "#eaf6ff"], sky: ["#bfe0f2", "#7fb2d4"], accent: "#79C0FF" },
  { id: "cratere", name: "Cratere vulcanico", blurb: "Roccia nera e cenere ancora calda. Si trova di tutto, o quasi.", boost: 1.5, sand: "#6f6660", earth: "#3b3431", deep: "#16110f", speck: ["#8a7f78", "#524844", "#a0958d", "#ff8a3d"], sky: ["#5a2c24", "#1d0f12"], accent: "#FF7B72" },
];

export type Tool = "sonar" | "brush" | "shovel" | "chisel";

export const TOOLS: Record<Tool, { label: string; hint: string }> = {
  sonar: { label: "Sonar", hint: "Tocca la terra: più il segnale è forte, più sei vicino al fossile." },
  brush: { label: "Pennello", hint: "Trascina per spolverare. Lento ma non rovina mai il reperto." },
  shovel: { label: "Pala", hint: "Trascina per scavare in fretta. Vicino al fossile può graffiarlo." },
  chisel: { label: "Scalpello", hint: "Tocca un masso al ritmo giusto: colpo verde pulito, rosso rischioso." },
};

export const GW = 64;
export const GH = 48;
export const SONAR_COST = 5;
export const CHISEL_COST = 3;
export const MOVE_COST = { brush: 0.2, shovel: 0.13 };
export const FINISH_AT = 0.9;

export interface Blob {
  x: number;
  y: number;
  rx: number;
  ry: number;
  hp: number;
  max: number;
  over: boolean;
  shape: number;
}

export interface Ping {
  x: number;
  y: number;
  level: 0 | 1 | 2 | 3;
}

export interface Field {
  site: Site;
  sp: FossilSpecies;
  cx: number;
  cy: number;
  bw: number;
  bh: number;
  rx: number;
  ry: number;
  mask: number[];
  sand: Uint8Array;
  earth: Float32Array;
  blobs: Blob[];
  energy: number;
  maxEnergy: number;
  integrity: number;
  pings: Ping[];
  touched: boolean;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function newField(site: Site): Field {
  const sp = pickFossil(site.boost);
  const bw = sp.scale * GW;
  const bh = sp.scale * GH;
  const cx = rand(bw / 2 + 2, GW - bw / 2 - 2);
  const cy = rand(bh / 2 + 2, GH - bh / 2 - 2);
  const rx = bw * 0.46;
  const ry = bh * 0.4;
  const mask: number[] = [];
  for (let y = 0; y < GH; y++)
    for (let x = 0; x < GW; x++) {
      const dx = Math.abs(x + 0.5 - cx) / rx;
      const dy = Math.abs(y + 0.5 - cy) / ry;
      if (dx ** 3 + dy ** 3 <= 1) mask.push(y * GW + x);
    }
  const rank = ["comune", "non_comune", "raro", "epico", "leggendario", "mitico"].indexOf(sp.rarity);
  const n = 3 + (rank >= 2 ? 1 : 0) + (rank >= 3 ? 1 : 0);
  const blobs: Blob[] = [];
  for (let i = 0; i < n; i++) {
    const onFossil = i < Math.ceil(n * 0.7);
    const rBlob = rand(4.2, 6.8);
    let x = rand(rBlob + 1, GW - rBlob - 1);
    let y = rand(rBlob + 1, GH - rBlob - 1);
    if (onFossil) {
      const m = mask[Math.floor(Math.random() * mask.length)];
      x = (m % GW) + 0.5;
      y = Math.floor(m / GW) + 0.5;
    }
    const max = rank >= 4 ? 4 : 3;
    blobs.push({ x, y, rx: rBlob, ry: rBlob * rand(0.72, 0.9), hp: max, max, over: false, shape: i % 4 });
  }
  for (const b of blobs) b.over = mask.some((m) => (((m % GW) + 0.5 - b.x) / b.rx) ** 2 + ((Math.floor(m / GW) + 0.5 - b.y) / b.ry) ** 2 <= 1);
  const maxEnergy = 90 + Math.round(sp.scale * 100);
  return { site, sp, cx, cy, bw, bh, rx, ry, mask, sand: new Uint8Array(GW * GH).fill(1), earth: new Float32Array(GW * GH).fill(3), blobs, energy: maxEnergy, maxEnergy, integrity: 100, pings: [], touched: false };
}

export const covered = (f: Field, x: number, y: number) => f.blobs.some((b) => b.hp > 0 && ((x + 0.5 - b.x) / b.rx) ** 2 + ((y + 0.5 - b.y) / b.ry) ** 2 <= 1);

export const isMask = (f: Field, i: number) => {
  const dx = Math.abs((i % GW) + 0.5 - f.cx) / f.rx;
  const dy = Math.abs(Math.floor(i / GW) + 0.5 - f.cy) / f.ry;
  return dx ** 3 + dy ** 3 <= 1;
};

export interface DigResult {
  sand: number[];
  earth: number[];
  damage: number;
}

export function digAt(f: Field, tool: "brush" | "shovel", gx: number, gy: number): DigResult {
  const R = tool === "brush" ? 2.6 : 4.2;
  const out: DigResult = { sand: [], earth: [], damage: 0 };
  const x0 = Math.max(0, Math.floor(gx - R));
  const x1 = Math.min(GW - 1, Math.ceil(gx + R));
  const y0 = Math.max(0, Math.floor(gy - R));
  const y1 = Math.min(GH - 1, Math.ceil(gy + R));
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      if (Math.hypot(x + 0.5 - gx, y + 0.5 - gy) > R) continue;
      const i = y * GW + x;
      if (f.sand[i]) {
        f.sand[i] = 0;
        out.sand.push(i);
        if (tool === "brush") continue;
      }
      if (f.earth[i] > 0) {
        f.earth[i] -= tool === "brush" ? 0.55 : 1.4;
        if (f.earth[i] <= 0) {
          f.earth[i] = 0;
          out.earth.push(i);
          if (tool === "shovel" && isMask(f, i) && !covered(f, x, y)) out.damage += 0.09;
        }
      }
    }
  if (out.sand.length || out.earth.length) f.touched = true;
  f.integrity = Math.max(0, f.integrity - out.damage);
  return out;
}

export type Strike = "perfect" | "good" | "slip";

export function strikeQuality(phase: number): Strike {
  const d = Math.abs(phase - 0.5);
  return d < 0.12 ? "perfect" : d < 0.3 ? "good" : "slip";
}

export interface ChiselResult {
  hit: boolean;
  quality: Strike;
  broke: boolean;
  blob: Blob | null;
  damage: number;
}

export function chiselAt(f: Field, gx: number, gy: number, phase: number): ChiselResult {
  const quality = strikeQuality(phase);
  const blob = f.blobs.find((b) => b.hp > 0 && ((gx - b.x) / b.rx) ** 2 + ((gy - b.y) / b.ry) ** 2 <= 1);
  const i = Math.floor(gy) * GW + Math.floor(gx);
  if (!blob || f.sand[i] || f.earth[i] > 0) return { hit: false, quality, broke: false, blob: null, damage: 0 };
  blob.hp = Math.max(0, blob.hp - (quality === "perfect" ? 2 : 1));
  const damage = blob.over ? (quality === "perfect" ? 0 : quality === "good" ? 2 : 9) : 0;
  f.integrity = Math.max(0, f.integrity - damage);
  f.touched = true;
  return { hit: true, quality, broke: blob.hp <= 0, blob, damage };
}

export function sonarAt(f: Field, gx: number, gy: number): Ping {
  const d = Math.hypot(gx - f.cx, gy - f.cy);
  const m = Math.max(f.rx, f.ry);
  const level = d < m * 0.9 ? 3 : d < m + 9 ? 2 : d < m + 20 ? 1 : 0;
  const ping: Ping = { x: gx, y: gy, level };
  f.pings = [...f.pings, ping];
  return ping;
}

export const SONAR_LABEL = ["Nessun segnale", "Segnale debole", "Segnale forte", "Sei sopra il fossile!"];

export function progress(f: Field): number {
  let n = 0;
  for (const i of f.mask) if (!f.sand[i] && f.earth[i] <= 0 && !covered(f, i % GW, Math.floor(i / GW))) n++;
  return n / Math.max(1, f.mask.length);
}

export const isBroken = (f: Field) => f.integrity <= 0;
export const isUncovered = (f: Field) => progress(f) >= FINISH_AT;
export const isExhausted = (f: Field) => f.energy < 1;
