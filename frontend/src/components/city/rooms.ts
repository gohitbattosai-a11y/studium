import type { CSSProperties } from "react";
import type { Species } from "@/lib/domain/city";

export type Decor = "reeds" | "shoal" | "mud" | "stream" | "predator" | "koi" | "coral" | "abyss" | "ice" | "shrine";
export type Prop = "plant" | "bench" | "window" | "lamp" | "column" | "banner" | "rocks" | "statue" | "lantern" | "ficus" | "fountain" | "pedestal" | "anchor" | "lifebuoy" | "easel" | "barrel" | "jelly" | "bamboo" | "bridge" | "torii" | "brazier" | "log" | "amphora" | "crate" | "coral";
export type ThemeId = "pond" | "lake" | "mud" | "stream" | "predator" | "koi" | "abyss" | "shrine";
export type Surface = "back" | "left" | "right" | "ceil" | "floor" | "island";
export type Arch = "stone" | "rock" | "timber" | "lacquer" | "steel" | "gold";
export type WinShape = "rect" | "arch" | "round";

export interface Theme {
  wall: CSSProperties;
  floor: CSSProperties;
  trim: string;
  plaque: string;
  plaqueInk: string;
  water: [string, string];
  sand: string;
  accent: string;
  dark: boolean;
}

export interface WinDef {
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: WinShape;
}

export interface TunDef {
  x1: number;
  x2: number;
  y: number;
  h: number;
}

export interface SystemDef {
  id: string;
  name: string;
  note: string;
  decor: Decor;
  surface: Surface;
  species: string[];
  wins: WinDef[];
  tunnels?: TunDef[];
  big?: boolean;
  u?: number;
  z?: number;
  w?: number;
}

export interface PropDef {
  p: Prop;
  u: number;
  z: number;
  k?: number;
}

export interface RoomDef {
  id: string;
  name: string;
  subtitle: string;
  theme: ThemeId;
  intro: string;
  systems: SystemDef[];
  props: PropDef[];
}

export const ARCH: Record<ThemeId, Arch> = { pond: "timber", lake: "stone", mud: "timber", stream: "rock", predator: "stone", koi: "lacquer", abyss: "steel", shrine: "gold" };

export const THEMES: Record<ThemeId, Theme> = {
  lake: {
    wall: { backgroundColor: "#cfdcc6", backgroundImage: "repeating-linear-gradient(90deg, rgba(60,90,70,0.12) 0 3px, transparent 3px 60px), linear-gradient(180deg, rgba(255,255,255,0.35), rgba(0,0,0,0.08))" },
    floor: { backgroundColor: "#7d5733", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.22) 0 2px, transparent 2px 90px), linear-gradient(180deg, rgba(255,255,255,0.14), rgba(0,0,0,0.3))" },
    trim: "#3f5a4a",
    plaque: "#9fd6b0",
    plaqueInk: "#0f2a1a",
    water: ["#6fc4cf", "#1f6f86"],
    sand: "#c7b98a",
    accent: "#4aa3a0",
    dark: false,
  },
  pond: {
    wall: { backgroundColor: "#dde7c9", backgroundImage: "repeating-linear-gradient(90deg, rgba(90,110,60,0.10) 0 3px, transparent 3px 52px), linear-gradient(180deg, rgba(255,255,255,0.4), rgba(0,0,0,0.05))" },
    floor: { backgroundColor: "#8a5a34", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0 2px, transparent 2px 76px), linear-gradient(180deg, rgba(255,255,255,0.14), rgba(0,0,0,0.3))" },
    trim: "#5a3d22",
    plaque: "#e3b341",
    plaqueInk: "#3b2a0f",
    water: ["#86d6d8", "#2a7f8f"],
    sand: "#cdb982",
    accent: "#3f9a4a",
    dark: false,
  },
  mud: {
    wall: { backgroundColor: "#4a4436", backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, rgba(0,0,0,0.18) 0 4px, transparent 5px), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.3))", backgroundSize: "34px 34px, 52px 52px, 100% 100%" },
    floor: { backgroundColor: "#352c20", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 60px), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.4))" },
    trim: "#6e5a3a",
    plaque: "#b08d57",
    plaqueInk: "#1f1608",
    water: ["#4d8a86", "#14383f"],
    sand: "#7a6845",
    accent: "#b08d57",
    dark: true,
  },
  stream: {
    wall: { backgroundColor: "#7d8a93", backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 38px), repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 74px), linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.2))" },
    floor: { backgroundColor: "#5d6770", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 90px), linear-gradient(180deg, rgba(255,255,255,0.14), rgba(0,0,0,0.3))" },
    trim: "#3a444c",
    plaque: "#9fd6ee",
    plaqueInk: "#0b2a3d",
    water: ["#98e0f3", "#2b7fa6"],
    sand: "#a9a08a",
    accent: "#38bdf8",
    dark: true,
  },
  predator: {
    wall: { backgroundColor: "#26352b", backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 40px), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.35))" },
    floor: { backgroundColor: "#2b2418", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 64px), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.4))" },
    trim: "#4d3b22",
    plaque: "#a3d94a",
    plaqueInk: "#14230a",
    water: ["#4a9a68", "#0f3a2a"],
    sand: "#5b5a3a",
    accent: "#84cc16",
    dark: true,
  },
  koi: {
    wall: { backgroundColor: "#f1e4cf", backgroundImage: "repeating-linear-gradient(90deg, rgba(180,60,50,0.12) 0 4px, transparent 4px 64px), linear-gradient(180deg, rgba(255,255,255,0.5), rgba(0,0,0,0.04))" },
    floor: { backgroundColor: "#7a3b2a", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.22) 0 2px, transparent 2px 80px), linear-gradient(180deg, rgba(255,255,255,0.14), rgba(0,0,0,0.3))" },
    trim: "#8c2a24",
    plaque: "#f0c25a",
    plaqueInk: "#4a1210",
    water: ["#94dbea", "#2f86a8"],
    sand: "#d9c79a",
    accent: "#ef4444",
    dark: false,
  },
  abyss: {
    wall: { backgroundColor: "#0b1533", backgroundImage: "radial-gradient(circle at 15% 25%, rgba(56,189,248,0.18) 0 2px, transparent 3px), radial-gradient(circle at 75% 55%, rgba(167,139,250,0.2) 0 2px, transparent 3px), linear-gradient(180deg, rgba(56,189,248,0.1), rgba(0,0,0,0.5))", backgroundSize: "70px 70px, 110px 110px, 100% 100%" },
    floor: { backgroundColor: "#0a1128", backgroundImage: "repeating-linear-gradient(90deg, rgba(56,189,248,0.1) 0 1px, transparent 1px 80px), linear-gradient(180deg, rgba(56,189,248,0.12), rgba(0,0,0,0.5))" },
    trim: "#1d2f66",
    plaque: "#38bdf8",
    plaqueInk: "#04132b",
    water: ["#1e3a8a", "#030b24"],
    sand: "#1b2447",
    accent: "#38bdf8",
    dark: true,
  },
  shrine: {
    wall: { backgroundColor: "#1a1536", backgroundImage: "radial-gradient(circle at 50% 0%, rgba(251,191,36,0.22), transparent 55%), repeating-linear-gradient(90deg, rgba(251,191,36,0.08) 0 2px, transparent 2px 70px), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.4))" },
    floor: { backgroundColor: "#241c4a", backgroundImage: "repeating-conic-gradient(rgba(251,191,36,0.08) 0 25%, transparent 0 50%)", backgroundSize: "70px 70px" },
    trim: "#8a6a1f",
    plaque: "#fbbf24",
    plaqueInk: "#2a1d05",
    water: ["#5b4fc0", "#150f3d"],
    sand: "#4a3d78",
    accent: "#fbbf24",
    dark: true,
  },
};

export const ROOMS: RoomDef[] = [
  {
    id: "stagno",
    name: "Sala dello Stagno",
    subtitle: "Canneti e banchi d'argento",
    theme: "pond",
    intro: "Le acque calme e basse dove tutto comincia: piccoli pesci, canne e ninfee. Le vasche sono collegate da tunnel di vetro.",
    systems: [
      { id: "canneto", name: "Canneto e banco d'argento", note: "Branchi tra le canne", decor: "reeds", surface: "back", species: ["gambusia", "rutilo", "alborella", "latterino", "rovella"], wins: [{ x: 3, y: 22, w: 26, h: 50 }, { x: 35, y: 22, w: 30, h: 50 }, { x: 71, y: 22, w: 26, h: 50 }], tunnels: [{ x1: 29, x2: 35, y: 44, h: 8 }, { x1: 65, x2: 71, y: 44, h: 8 }] },
      { id: "basse", name: "Acque basse", note: "Sotto la superficie", decor: "shoal", surface: "left", species: ["triotto", "scardola"], wins: [{ x: 30, y: 28, w: 30, h: 42 }, { x: 64, y: 28, w: 30, h: 42 }], tunnels: [{ x1: 60, x2: 64, y: 46, h: 7 }] },
      { id: "ninfee", name: "Sotto le ninfee", note: "All'ombra delle foglie", decor: "reeds", surface: "right", species: ["persico_sole", "gardon"], wins: [{ x: 30, y: 28, w: 30, h: 42 }, { x: 64, y: 28, w: 30, h: 42 }], tunnels: [{ x1: 60, x2: 64, y: 46, h: 7 }] },
      { id: "girini", name: "Vasca dei piccoli", note: "Avannotti appena nati", decor: "reeds", surface: "island", species: ["avannotto"], wins: [], u: 0.5, z: 0.32, w: 300 },
    ],
    props: [{ p: "ficus", u: 0.08, z: 0.3 }, { p: "ficus", u: 0.92, z: 0.3 }, { p: "bench", u: 0.3, z: 0.2 }, { p: "bench", u: 0.7, z: 0.2 }, { p: "easel", u: 0.5, z: 0.52 }, { p: "barrel", u: 0.16, z: 0.58 }, { p: "log", u: 0.84, z: 0.62, k: 0.8 }],
  },
  {
    id: "lago",
    name: "Sala del Lago",
    subtitle: "Acque aperte e predatori",
    theme: "lake",
    intro: "Il lago è più profondo: carpe lente sotto un colonnato di archi e predatori ai bordi.",
    systems: [
      { id: "lago", name: "Il lago aperto", note: "Carpe e tinche sotto gli archi", decor: "shoal", surface: "back", species: ["carpa", "carpa_specchio", "tinca"], wins: [{ x: 4, y: 14, w: 27, h: 64, shape: "arch" }, { x: 36.5, y: 14, w: 27, h: 64, shape: "arch" }, { x: 69, y: 14, w: 27, h: 64, shape: "arch" }], tunnels: [{ x1: 31, x2: 36.5, y: 52, h: 9 }, { x1: 63.5, x2: 69, y: 52, h: 9 }] },
      { id: "predlago", name: "Predatori del lago", note: "Denti e pazienza", decor: "predator", surface: "left", species: ["persico_reale", "black_bass", "lucioperca"], wins: [{ x: 30, y: 28, w: 30, h: 42 }, { x: 64, y: 28, w: 30, h: 42 }], tunnels: [{ x1: 60, x2: 64, y: 46, h: 7 }] },
      { id: "luccio", name: "Tana del luccio", note: "Un agguato dopo l'altro", decor: "predator", surface: "right", species: ["luccio"], wins: [{ x: 28, y: 22, w: 66, h: 52 }], big: true },
      { id: "volta", name: "Volta d'acqua", note: "Le carpe nuotano sopra la tua testa", decor: "shoal", surface: "ceil", species: ["carpa", "tinca"], wins: [{ x: 28, y: 12, w: 44, h: 64 }] },
    ],
    props: [{ p: "bench", u: 0.3, z: 0.2 }, { p: "bench", u: 0.7, z: 0.2 }, { p: "ficus", u: 0.1, z: 0.35 }, { p: "ficus", u: 0.9, z: 0.35 }, { p: "fountain", u: 0.5, z: 0.34 }, { p: "lifebuoy", u: 0.2, z: 0.6 }, { p: "anchor", u: 0.82, z: 0.58 }, { p: "barrel", u: 0.9, z: 0.7 }],
  },
  {
    id: "torrente",
    name: "Torrente di Montagna",
    subtitle: "Acque fredde e correnti veloci",
    theme: "stream",
    intro: "Acqua limpida, ciottoli e corrente: i pesci attraversano la roccia dentro gallerie scavate.",
    systems: [
      { id: "cascata", name: "La cascata", note: "Trote e salmerini", decor: "stream", surface: "back", species: ["trota_fario", "trota_iridea", "salmerino"], wins: [{ x: 4, y: 18, w: 42, h: 58 }, { x: 54, y: 18, w: 42, h: 58 }], tunnels: [{ x1: 46, x2: 54, y: 50, h: 10 }] },
      { id: "rapide", name: "Le rapide", note: "Pesci da corrente", decor: "stream", surface: "left", species: ["cavedano", "savetta"], wins: [{ x: 30, y: 28, w: 30, h: 42 }, { x: 64, y: 28, w: 30, h: 42 }], tunnels: [{ x1: 60, x2: 64, y: 46, h: 7 }] },
      { id: "ciottoli", name: "Letto di ciottoli", note: "Sul fondo del torrente", decor: "stream", surface: "right", species: ["barbo", "ghiozzo"], wins: [{ x: 30, y: 28, w: 30, h: 42 }, { x: 64, y: 28, w: 30, h: 42 }], tunnels: [{ x1: 60, x2: 64, y: 46, h: 7 }] },
      { id: "pozza", name: "Pozza tranquilla", note: "Un angolo di riposo", decor: "stream", surface: "island", species: ["cobite"], wins: [], u: 0.5, z: 0.32, w: 300 },
      { id: "letto", name: "Il letto del torrente", note: "Si cammina sull'acqua", decor: "stream", surface: "floor", species: ["trota_fario"], wins: [{ x: 28, y: 52, w: 44, h: 40 }] },
    ],
    props: [{ p: "rocks", u: 0.12, z: 0.3 }, { p: "rocks", u: 0.88, z: 0.3 }, { p: "log", u: 0.5, z: 0.5 }, { p: "bench", u: 0.74, z: 0.18 }, { p: "easel", u: 0.28, z: 0.2 }, { p: "banner", u: 0.5, z: 0.2 }, { p: "barrel", u: 0.92, z: 0.6 }],
  },
  {
    id: "fondale",
    name: "Fondale Fangoso",
    subtitle: "Tane, baffi e giganti del fondo",
    theme: "mud",
    intro: "Sul fondo la luce arriva a fatica: travi di legno, anfore e pesci pazienti, baffuti e antichi.",
    systems: [
      { id: "fondale", name: "Il fondale", note: "Baffi nel buio e il gigante", decor: "mud", surface: "back", species: ["pesce_gatto", "anguilla", "siluro"], wins: [{ x: 4, y: 24, w: 34, h: 50 }, { x: 46, y: 16, w: 50, h: 62 }], tunnels: [{ x1: 38, x2: 46, y: 50, h: 9 }] },
      { id: "storione", name: "L'antico storione", note: "Un fossile vivente", decor: "mud", surface: "left", species: ["storione"], wins: [{ x: 28, y: 20, w: 66, h: 56 }], big: true },
      { id: "fango", name: "Fango profondo", note: "Un buco nel pavimento", decor: "mud", surface: "floor", species: ["anguilla"], wins: [{ x: 28, y: 50, w: 44, h: 42 }] },
    ],
    props: [{ p: "amphora", u: 0.12, z: 0.3 }, { p: "barrel", u: 0.88, z: 0.3 }, { p: "crate", u: 0.8, z: 0.5 }, { p: "anchor", u: 0.2, z: 0.55 }, { p: "lamp", u: 0.5, z: 0.38 }, { p: "bench", u: 0.5, z: 0.2 }, { p: "log", u: 0.7, z: 0.7, k: 0.8 }],
  },
  {
    id: "giardino",
    name: "Giardino dei Koi",
    subtitle: "Carpe d'oro e pesci ornamentali",
    theme: "koi",
    intro: "Un giardino giapponese al coperto: pilastri laccati, lanterne, un ponticello e pesci da collezione.",
    systems: [
      { id: "koi", name: "Laghetto dei Koi", note: "Macchie rosse, nere e oro", decor: "koi", surface: "back", species: ["carpa_koi", "koi_showa", "carpa_imperiale"], wins: [{ x: 4, y: 18, w: 20, h: 60, shape: "arch" }, { x: 28, y: 18, w: 20, h: 60, shape: "arch" }, { x: 52, y: 18, w: 20, h: 60, shape: "arch" }, { x: 76, y: 18, w: 20, h: 60, shape: "arch" }], tunnels: [{ x1: 24, x2: 28, y: 54, h: 8 }, { x1: 48, x2: 52, y: 54, h: 8 }, { x1: 72, x2: 76, y: 54, h: 8 }] },
      { id: "oro", name: "Gocce d'oro", note: "Pesci rossi ornamentali", decor: "koi", surface: "left", species: ["pesce_rosso"], wins: [{ x: 30, y: 26, w: 64, h: 46 }] },
      { id: "barriera", name: "Angolo di barriera", note: "Un ospite esotico", decor: "coral", surface: "right", species: ["pesce_corallo"], wins: [{ x: 30, y: 26, w: 64, h: 46 }] },
      { id: "specchio", name: "Specchio dorato", note: "Koi sotto il pavimento di vetro", decor: "koi", surface: "floor", species: ["carpa_koi"], wins: [{ x: 28, y: 52, w: 44, h: 40 }] },
    ],
    props: [{ p: "bridge", u: 0.5, z: 0.44 }, { p: "torii", u: 0.5, z: 0.8, k: 1.1 }, { p: "lantern", u: 0.1, z: 0.3 }, { p: "lantern", u: 0.9, z: 0.3 }, { p: "bamboo", u: 0.2, z: 0.5 }, { p: "bamboo", u: 0.8, z: 0.5 }, { p: "bench", u: 0.35, z: 0.16 }, { p: "bench", u: 0.65, z: 0.16 }],
  },
  {
    id: "abissi",
    name: "Galleria degli Abissi",
    subtitle: "Luci nel buio e cristalli di ghiaccio",
    theme: "abyss",
    intro: "Le luci si abbassano: ciò che brilla qui non ha bisogno del sole. Meduse luminose e vetro ovunque.",
    systems: [
      { id: "lanterne", name: "Giardino di lanterne", note: "Pesci che brillano da soli", decor: "abyss", surface: "back", species: ["pesce_lanterna", "pesce_stellato"], wins: [{ x: 3, y: 12, w: 94, h: 70 }], big: true },
      { id: "spettro", name: "Il fantasma", note: "Il luccio spettrale", decor: "abyss", surface: "left", species: ["luccio_spettrale"], wins: [{ x: 28, y: 20, w: 66, h: 56 }], big: true },
      { id: "ghiaccio", name: "Grotta di cristallo", note: "Acque gelide", decor: "ice", surface: "right", species: ["pesce_ghiaccio"], wins: [{ x: 30, y: 24, w: 64, h: 50 }] },
      { id: "volta", name: "Volta abissale", note: "Stelle che nuotano", decor: "abyss", surface: "ceil", species: ["pesce_stellato"], wins: [{ x: 26, y: 12, w: 48, h: 64 }] },
      { id: "vetro", name: "Pavimento di vetro", note: "Sotto i tuoi piedi", decor: "abyss", surface: "floor", species: ["pesce_lanterna"], wins: [{ x: 24, y: 50, w: 52, h: 42 }] },
    ],
    props: [{ p: "jelly", u: 0.15, z: 0.3 }, { p: "jelly", u: 0.85, z: 0.3 }, { p: "jelly", u: 0.5, z: 0.55, k: 1.3 }, { p: "anchor", u: 0.22, z: 0.5 }, { p: "coral", u: 0.8, z: 0.52 }, { p: "bench", u: 0.5, z: 0.2 }],
  },
  {
    id: "santuario",
    name: "Santuario del Pond",
    subtitle: "Le creature leggendarie",
    theme: "shrine",
    intro: "L'ultima sala custodisce ciò che lo stagno ha di più antico e misterioso, sotto una cupola di luna.",
    systems: [
      { id: "sacra", name: "La vasca sacra", note: "Il drago e la luna", decor: "shrine", surface: "back", species: ["drago_pond", "pesce_lunare"], wins: [{ x: 4, y: 16, w: 24, h: 62, shape: "arch" }, { x: 36, y: 8, w: 28, h: 76, shape: "round" }, { x: 72, y: 16, w: 24, h: 62, shape: "arch" }], tunnels: [{ x1: 28, x2: 36, y: 46, h: 8 }, { x1: 64, x2: 72, y: 46, h: 8 }], big: true },
      { id: "cupola", name: "Cupola lunare", note: "La luna nuota sopra di te", decor: "shrine", surface: "ceil", species: ["pesce_lunare"], wins: [{ x: 30, y: 12, w: 40, h: 64 }] },
      { id: "drago", name: "Specchio del drago", note: "Il drago sotto il vetro", decor: "shrine", surface: "floor", species: ["drago_pond"], wins: [{ x: 26, y: 50, w: 48, h: 42 }] },
    ],
    props: [{ p: "statue", u: 0.12, z: 0.3 }, { p: "statue", u: 0.88, z: 0.3 }, { p: "brazier", u: 0.3, z: 0.25 }, { p: "brazier", u: 0.7, z: 0.25 }, { p: "column", u: 0.3, z: 0.5 }, { p: "column", u: 0.7, z: 0.5 }, { p: "pedestal", u: 0.5, z: 0.3 }, { p: "fountain", u: 0.5, z: 0.62 }],
  },
];

export interface ResolvedSystem extends Omit<SystemDef, "species"> {
  species: Species[];
}

export interface ResolvedRoom {
  def: RoomDef;
  systems: ResolvedSystem[];
  list: Species[];
}

export function buildRooms(all: Species[]): ResolvedRoom[] {
  const byId = new Map(all.map((s) => [s.id, s]));
  const used = new Set<string>();
  const out: ResolvedRoom[] = ROOMS.map((def) => {
    const systems: ResolvedSystem[] = [];
    const seen = new Set<string>();
    const list: Species[] = [];
    def.systems.forEach((t) => {
      const sp = t.species.map((id) => byId.get(id)).filter((s): s is Species => !!s);
      if (!sp.length) return;
      systems.push({ ...t, species: sp });
      sp.forEach((s) => {
        used.add(s.id);
        if (!seen.has(s.id)) {
          seen.add(s.id);
          list.push(s);
        }
      });
    });
    return { def, systems, list };
  });
  const extra = all.filter((s) => !used.has(s.id));
  if (extra.length) {
    out[0].systems.push({ id: "nuovi", name: "Nuovi arrivi", note: "Ospiti appena arrivati", decor: "shoal", surface: "island", species: extra, wins: [], u: 0.82, z: 0.6, w: 280 });
    out[0].list.push(...extra);
  }
  return out;
}

export const isBig = (s: Species) => s.max_cm >= 80;
