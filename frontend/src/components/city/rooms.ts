import type { CSSProperties } from "react";
import type { Species } from "@/lib/city";

export type Decor = "reeds" | "shoal" | "mud" | "stream" | "predator" | "koi" | "coral" | "abyss" | "ice" | "shrine";
export type Prop = "plant" | "bench" | "window" | "lamp" | "column" | "banner" | "rocks" | "statue" | "lantern";
export type ThemeId = "pond" | "mud" | "stream" | "predator" | "koi" | "abyss" | "shrine";

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

export type ItemDef = { k: "tank"; id: string; name: string; note: string; decor: Decor; species: string[] } | { k: "hung"; species: string } | { k: "prop"; p: Prop };

export interface RoomDef {
  id: string;
  name: string;
  subtitle: string;
  theme: ThemeId;
  intro: string;
  items: ItemDef[];
}

export const THEMES: Record<ThemeId, Theme> = {
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
    items: [
      { k: "prop", p: "window" },
      { k: "tank", id: "canneto", name: "Il canneto", note: "Tra le canne e le ninfee", decor: "reeds", species: ["gambusia", "rutilo", "scardola", "persico_sole"] },
      { k: "prop", p: "bench" },
      { k: "tank", id: "banco", name: "Banco d'argento", note: "Pesci di superficie che nuotano in branco", decor: "shoal", species: ["alborella", "latterino", "avannotto", "rovella", "triotto", "gardon"] },
      { k: "prop", p: "plant" },
    ],
  },
  {
    id: "fondale",
    name: "Fondale Fangoso",
    subtitle: "Tane, baffi e giganti del fondo",
    theme: "mud",
    intro: "Sul fondo la luce arriva a fatica: qui vivono pesci pazienti, baffuti e antichi.",
    items: [
      { k: "prop", p: "lamp" },
      { k: "tank", id: "tane", name: "Le tane", note: "Nascondigli tra sassi e radici", decor: "mud", species: ["cobite", "ghiozzo", "tinca", "barbo"] },
      { k: "hung", species: "siluro" },
      { k: "tank", id: "baffi", name: "Baffi nel buio", note: "Cacciatori notturni che sentono tutto", decor: "mud", species: ["pesce_gatto", "anguilla"] },
      { k: "hung", species: "storione" },
      { k: "prop", p: "rocks" },
    ],
  },
  {
    id: "torrente",
    name: "Torrente di Montagna",
    subtitle: "Acque fredde e correnti veloci",
    theme: "stream",
    intro: "Acqua limpida, ciottoli e corrente: solo i pesci più agili la domano.",
    items: [
      { k: "prop", p: "banner" },
      { k: "tank", id: "rapida", name: "La rapida", note: "Trote e salmerini nella corrente", decor: "stream", species: ["trota_fario", "trota_iridea", "salmerino"] },
      { k: "prop", p: "rocks" },
      { k: "tank", id: "ciottoli", name: "Letto di ciottoli", note: "Pesci da corrente moderata", decor: "stream", species: ["cavedano", "savetta"] },
      { k: "prop", p: "lamp" },
    ],
  },
  {
    id: "predatori",
    name: "Tana dei Predatori",
    subtitle: "Denti, agguati e velocità",
    theme: "predator",
    intro: "Qui ogni ombra è un agguato. Silenzio, e guarda dove nuoti.",
    items: [
      { k: "prop", p: "column" },
      { k: "hung", species: "luccio" },
      { k: "tank", id: "agguato", name: "L'agguato", note: "Predatori tra tronchi sommersi", decor: "predator", species: ["persico_reale", "black_bass", "lucioperca"] },
      { k: "prop", p: "column" },
    ],
  },
  {
    id: "giardino",
    name: "Giardino dei Koi",
    subtitle: "Carpe d'oro e pesci ornamentali",
    theme: "koi",
    intro: "Un giardino giapponese al coperto: lanterne, ponticelli e pesci da collezione.",
    items: [
      { k: "prop", p: "lantern" },
      { k: "tank", id: "koi", name: "Laghetto dei Koi", note: "Macchie rosse, nere e oro", decor: "koi", species: ["carpa_koi", "koi_showa", "carpa_imperiale"] },
      { k: "prop", p: "bench" },
      { k: "tank", id: "dorato", name: "Fondale dorato", note: "Carpe e pesci rossi", decor: "koi", species: ["pesce_rosso", "carpa", "carpa_specchio"] },
      { k: "tank", id: "barriera", name: "Angolo di barriera", note: "Un ospite esotico tra i coralli", decor: "coral", species: ["pesce_corallo"] },
      { k: "prop", p: "lantern" },
    ],
  },
  {
    id: "abissi",
    name: "Galleria degli Abissi",
    subtitle: "Luci nel buio e cristalli di ghiaccio",
    theme: "abyss",
    intro: "Le luci si abbassano: ciò che brilla qui non ha bisogno del sole.",
    items: [
      { k: "prop", p: "lamp" },
      { k: "tank", id: "ghiaccio", name: "Grotta di cristallo", note: "Acque gelide e trasparenti", decor: "ice", species: ["pesce_ghiaccio"] },
      { k: "tank", id: "lanterne", name: "Giardino di lanterne", note: "Pesci che brillano da soli", decor: "abyss", species: ["pesce_lanterna", "pesce_stellato"] },
      { k: "hung", species: "luccio_spettrale" },
      { k: "prop", p: "lamp" },
    ],
  },
  {
    id: "santuario",
    name: "Santuario del Pond",
    subtitle: "Le creature leggendarie",
    theme: "shrine",
    intro: "L'ultima stanza custodisce ciò che lo stagno ha di più antico e misterioso.",
    items: [
      { k: "prop", p: "statue" },
      { k: "hung", species: "drago_pond" },
      { k: "prop", p: "column" },
      { k: "hung", species: "pesce_lunare" },
      { k: "prop", p: "statue" },
    ],
  },
];

export type ResolvedItem = { k: "tank"; id: string; name: string; note: string; decor: Decor; species: Species[] } | { k: "hung"; species: Species } | { k: "prop"; p: Prop };

export interface ResolvedRoom {
  def: RoomDef;
  items: ResolvedItem[];
  list: Species[];
}

export function buildRooms(all: Species[]): ResolvedRoom[] {
  const byId = new Map(all.map((s) => [s.id, s]));
  const used = new Set<string>();
  const rooms: ResolvedRoom[] = ROOMS.map((def) => {
    const items: ResolvedItem[] = [];
    const list: Species[] = [];
    def.items.forEach((it) => {
      if (it.k === "prop") {
        items.push(it);
      } else if (it.k === "hung") {
        const s = byId.get(it.species);
        if (s) {
          used.add(s.id);
          list.push(s);
          items.push({ k: "hung", species: s });
        }
      } else {
        const sp = it.species.map((id) => byId.get(id)).filter((s): s is Species => !!s);
        sp.forEach((s) => used.add(s.id));
        list.push(...sp);
        if (sp.length) items.push({ ...it, species: sp });
      }
    });
    return { def, items, list };
  });
  const extra = all.filter((s) => !used.has(s.id));
  if (extra.length) {
    const first = rooms[0];
    first.items.splice(first.items.length - 1, 0, { k: "tank", id: "nuovi", name: "Nuovi arrivi", note: "Ospiti appena arrivati", decor: "shoal", species: extra });
    first.list.push(...extra);
  }
  return rooms;
}

export const isBig = (s: Species) => s.max_cm >= 80;
