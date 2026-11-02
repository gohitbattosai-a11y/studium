import type { CSSProperties } from "react";
import type { Species } from "@/lib/city";

export type Decor = "reeds" | "shoal" | "mud" | "stream" | "predator" | "koi" | "coral" | "abyss" | "ice" | "shrine";
export type Prop = "plant" | "bench" | "window" | "lamp" | "column" | "banner" | "rocks" | "statue" | "lantern";
export type ThemeId = "pond" | "lake" | "mud" | "stream" | "predator" | "koi" | "abyss" | "shrine";
export type Wall = "back" | "left" | "right" | "floor";

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

export interface TankDef {
  id: string;
  name: string;
  note: string;
  decor: Decor;
  species: string[];
  wall: Wall;
  at: number;
  w: number;
  y?: number;
  h?: number;
  big?: boolean;
  u?: number;
  z?: number;
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
  tanks: TankDef[];
  props: PropDef[];
}

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
    intro: "Le acque calme e basse dove tutto comincia: piccoli pesci, canne e ninfee.",
    tanks: [
      { id: "canneto", name: "Il canneto", note: "Tra le canne", decor: "reeds", species: ["gambusia", "rutilo"], wall: "back", at: 4, w: 44 },
      { id: "banco", name: "Banco d'argento", note: "Pesci in branco", decor: "shoal", species: ["alborella", "latterino", "rovella"], wall: "back", at: 52, w: 44 },
      { id: "basse", name: "Acque basse", note: "Sotto la superficie", decor: "shoal", species: ["triotto", "scardola"], wall: "left", at: 30, w: 64 },
      { id: "ninfee", name: "Sotto le ninfee", note: "All'ombra delle foglie", decor: "reeds", species: ["persico_sole", "gardon"], wall: "right", at: 30, w: 64 },
      { id: "girini", name: "Vasca dei piccoli", note: "Avannotti appena nati", decor: "reeds", species: ["avannotto"], wall: "floor", at: 0, w: 300, u: 0.5, z: 0.3 },
    ],
    props: [{ p: "plant", u: 0.1, z: 0.3 }, { p: "plant", u: 0.9, z: 0.3 }, { p: "bench", u: 0.28, z: 0.2 }, { p: "bench", u: 0.72, z: 0.2 }],
  },
  {
    id: "lago",
    name: "Sala del Lago",
    subtitle: "Acque aperte e predatori",
    theme: "lake",
    intro: "Il lago è più profondo: carpe lente in mezzo e predatori ai bordi.",
    tanks: [
      { id: "lago", name: "Il lago aperto", note: "Carpe e tinche", decor: "shoal", species: ["carpa", "carpa_specchio", "tinca"], wall: "back", at: 5, w: 90, y: 20, h: 58 },
      { id: "predlago", name: "Predatori del lago", note: "Denti e pazienza", decor: "predator", species: ["persico_reale", "black_bass", "lucioperca"], wall: "left", at: 30, w: 64 },
      { id: "luccio", name: "Tana del luccio", note: "Un agguato dopo l'altro", decor: "predator", species: ["luccio"], wall: "right", at: 30, w: 64, big: true },
    ],
    props: [{ p: "bench", u: 0.3, z: 0.22 }, { p: "bench", u: 0.7, z: 0.22 }, { p: "plant", u: 0.1, z: 0.35 }, { p: "plant", u: 0.9, z: 0.35 }, { p: "lamp", u: 0.5, z: 0.5 }],
  },
  {
    id: "torrente",
    name: "Torrente di Montagna",
    subtitle: "Acque fredde e correnti veloci",
    theme: "stream",
    intro: "Acqua limpida, ciottoli e corrente: solo i pesci più agili la domano.",
    tanks: [
      { id: "cascata", name: "La cascata", note: "Trote e salmerini", decor: "stream", species: ["trota_fario", "trota_iridea", "salmerino"], wall: "back", at: 5, w: 90, y: 20, h: 58 },
      { id: "rapide", name: "Le rapide", note: "Pesci da corrente", decor: "stream", species: ["cavedano", "savetta"], wall: "left", at: 30, w: 64 },
      { id: "ciottoli", name: "Letto di ciottoli", note: "Sul fondo del torrente", decor: "stream", species: ["barbo", "ghiozzo"], wall: "right", at: 30, w: 64 },
      { id: "pozza", name: "Pozza tranquilla", note: "Un angolo di riposo", decor: "stream", species: ["cobite"], wall: "floor", at: 0, w: 300, u: 0.5, z: 0.3 },
    ],
    props: [{ p: "rocks", u: 0.14, z: 0.3 }, { p: "rocks", u: 0.86, z: 0.3 }, { p: "banner", u: 0.28, z: 0.15 }, { p: "bench", u: 0.74, z: 0.18 }],
  },
  {
    id: "fondale",
    name: "Fondale Fangoso",
    subtitle: "Tane, baffi e giganti del fondo",
    theme: "mud",
    intro: "Sul fondo la luce arriva a fatica: qui vivono pesci pazienti, baffuti e antichi.",
    tanks: [
      { id: "baffi", name: "Baffi nel buio", note: "Cacciatori notturni", decor: "mud", species: ["pesce_gatto", "anguilla"], wall: "back", at: 4, w: 40, y: 22, h: 54 },
      { id: "siluro", name: "Il gigante del fondo", note: "Il siluro", decor: "mud", species: ["siluro"], wall: "back", at: 48, w: 48, y: 18, h: 60, big: true },
      { id: "storione", name: "L'antico storione", note: "Un fossile vivente", decor: "mud", species: ["storione"], wall: "left", at: 28, w: 66, big: true },
    ],
    props: [{ p: "lamp", u: 0.12, z: 0.3 }, { p: "rocks", u: 0.82, z: 0.22 }, { p: "bench", u: 0.4, z: 0.2 }],
  },
  {
    id: "giardino",
    name: "Giardino dei Koi",
    subtitle: "Carpe d'oro e pesci ornamentali",
    theme: "koi",
    intro: "Un giardino giapponese al coperto: lanterne, ponticelli e pesci da collezione.",
    tanks: [
      { id: "koi", name: "Laghetto dei Koi", note: "Macchie rosse, nere e oro", decor: "koi", species: ["carpa_koi", "koi_showa", "carpa_imperiale"], wall: "back", at: 5, w: 90, y: 20, h: 58 },
      { id: "oro", name: "Gocce d'oro", note: "Pesci rossi ornamentali", decor: "koi", species: ["pesce_rosso"], wall: "left", at: 30, w: 64 },
      { id: "barriera", name: "Angolo di barriera", note: "Un ospite esotico", decor: "coral", species: ["pesce_corallo"], wall: "right", at: 30, w: 64 },
    ],
    props: [{ p: "lantern", u: 0.1, z: 0.28 }, { p: "lantern", u: 0.9, z: 0.28 }, { p: "bench", u: 0.5, z: 0.22 }],
  },
  {
    id: "abissi",
    name: "Galleria degli Abissi",
    subtitle: "Luci nel buio e cristalli di ghiaccio",
    theme: "abyss",
    intro: "Le luci si abbassano: ciò che brilla qui non ha bisogno del sole.",
    tanks: [
      { id: "lanterne", name: "Giardino di lanterne", note: "Pesci che brillano da soli", decor: "abyss", species: ["pesce_lanterna", "pesce_stellato"], wall: "back", at: 3, w: 94, y: 16, h: 64, big: true },
      { id: "spettro", name: "Il fantasma", note: "Il luccio spettrale", decor: "abyss", species: ["luccio_spettrale"], wall: "left", at: 28, w: 66, big: true },
      { id: "ghiaccio", name: "Grotta di cristallo", note: "Acque gelide", decor: "ice", species: ["pesce_ghiaccio"], wall: "right", at: 30, w: 64 },
    ],
    props: [{ p: "lamp", u: 0.15, z: 0.3 }, { p: "lamp", u: 0.85, z: 0.3 }, { p: "bench", u: 0.5, z: 0.18 }],
  },
  {
    id: "santuario",
    name: "Santuario del Pond",
    subtitle: "Le creature leggendarie",
    theme: "shrine",
    intro: "L'ultima sala custodisce ciò che lo stagno ha di più antico e misterioso.",
    tanks: [{ id: "santuario", name: "La vasca sacra", note: "Il drago e la luna", decor: "shrine", species: ["drago_pond", "pesce_lunare"], wall: "back", at: 3, w: 94, y: 12, h: 68, big: true }],
    props: [{ p: "statue", u: 0.12, z: 0.3 }, { p: "statue", u: 0.88, z: 0.3 }, { p: "column", u: 0.3, z: 0.4 }, { p: "column", u: 0.7, z: 0.4 }],
  },
];

export interface ResolvedTank extends Omit<TankDef, "species"> {
  species: Species[];
}

export interface ResolvedRoom {
  def: RoomDef;
  tanks: ResolvedTank[];
  list: Species[];
}

export function buildRooms(all: Species[]): ResolvedRoom[] {
  const byId = new Map(all.map((s) => [s.id, s]));
  const used = new Set<string>();
  const rooms: ResolvedRoom[] = ROOMS.map((def) => {
    const tanks: ResolvedTank[] = [];
    const list: Species[] = [];
    def.tanks.forEach((t) => {
      const sp = t.species.map((id) => byId.get(id)).filter((s): s is Species => !!s);
      sp.forEach((s) => used.add(s.id));
      if (sp.length) {
        tanks.push({ ...t, species: sp });
        list.push(...sp);
      }
    });
    return { def, tanks, list };
  });
  const extra = all.filter((s) => !used.has(s.id));
  if (extra.length) {
    rooms[0].tanks.push({ id: "nuovi", name: "Nuovi arrivi", note: "Ospiti appena arrivati", decor: "shoal", species: extra, wall: "floor", at: 0, w: 280, u: 0.82, z: 0.55 });
    rooms[0].list.push(...extra);
  }
  return rooms;
}

export const isBig = (s: Species) => s.max_cm >= 80;
