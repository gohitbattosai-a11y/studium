import type { Species } from "@/lib/city";

export type Decor = "reeds" | "shoal" | "mud" | "stream" | "predator" | "koi" | "coral" | "abyss" | "ice" | "shrine";
export type ThemeId = "pond" | "mud" | "stream" | "predator" | "koi" | "abyss" | "shrine";

export interface Theme {
  wallA: string;
  wallB: string;
  floorA: string;
  floorB: string;
  trim: string;
  plaque: string;
  plaqueInk: string;
  water: [string, string];
  sand: string;
  accent: string;
  glow: string;
  lamp: string;
  dark: boolean;
}

export type ItemDef = { k: "tank"; id: string; name: string; note: string; decor: Decor; species: string[]; at?: "wall" | "island"; span?: number } | { k: "hung"; species: string; span?: number };

export interface RoomDef {
  id: string;
  name: string;
  subtitle: string;
  theme: ThemeId;
  intro: string;
  items: ItemDef[];
}

export const THEMES: Record<ThemeId, Theme> = {
  pond: { wallA: "#e6efd2", wallB: "#b9cb98", floorA: "#a8703f", floorB: "#5c3a1e", trim: "#5a3d22", plaque: "#e3b341", plaqueInk: "#3b2a0f", water: ["#9be4dd", "#2a7f8f"], sand: "#d8c48a", accent: "#4fae5a", glow: "#7fe0d0", lamp: "#ffe9a3", dark: false },
  mud: { wallA: "#6a6250", wallB: "#3a3428", floorA: "#4a3b29", floorB: "#201910", trim: "#7a6440", plaque: "#b08d57", plaqueInk: "#1f1608", water: ["#5fa39b", "#10343b"], sand: "#8a7650", accent: "#c79e5b", glow: "#6fc2b4", lamp: "#ffd48a", dark: true },
  stream: { wallA: "#9aa8b2", wallB: "#5d6a74", floorA: "#6b7680", floorB: "#2f373e", trim: "#3a444c", plaque: "#9fd6ee", plaqueInk: "#0b2a3d", water: ["#a8ecfa", "#2b7fa6"], sand: "#b3aa94", accent: "#38bdf8", glow: "#8fe3f7", lamp: "#e8f6ff", dark: true },
  predator: { wallA: "#3a5242", wallB: "#1d2b22", floorA: "#3a2f1d", floorB: "#17120a", trim: "#5a4527", plaque: "#a3d94a", plaqueInk: "#14230a", water: ["#58b078", "#0c3526"], sand: "#6a6840", accent: "#84cc16", glow: "#7fe09a", lamp: "#e9ffb0", dark: true },
  koi: { wallA: "#f6ead4", wallB: "#dcc7a2", floorA: "#8c4630", floorB: "#43190f", trim: "#8c2a24", plaque: "#f0c25a", plaqueInk: "#4a1210", water: ["#a6e6f2", "#2f86a8"], sand: "#e2d2a2", accent: "#ef4444", glow: "#9fe4f2", lamp: "#ffd28a", dark: false },
  abyss: { wallA: "#16224a", wallB: "#070d22", floorA: "#101a3c", floorB: "#040716", trim: "#1d2f66", plaque: "#38bdf8", plaqueInk: "#04132b", water: ["#1f46a8", "#020718"], sand: "#1e2858", accent: "#38bdf8", glow: "#3b82f6", lamp: "#8fd8ff", dark: true },
  shrine: { wallA: "#2a2155", wallB: "#100b2a", floorA: "#31265f", floorB: "#0d0820", trim: "#8a6a1f", plaque: "#fbbf24", plaqueInk: "#2a1d05", water: ["#7364dd", "#150f3d"], sand: "#52448a", accent: "#fbbf24", glow: "#a78bfa", lamp: "#ffe08a", dark: true },
};

export const ROOMS: RoomDef[] = [
  {
    id: "stagno",
    name: "Sala dello Stagno",
    subtitle: "Canneti e banchi d'argento",
    theme: "pond",
    intro: "Le acque calme e basse dove tutto comincia.",
    items: [
      { k: "tank", id: "canneto", name: "Il canneto", note: "Tra le canne e le ninfee", decor: "reeds", species: ["gambusia", "rutilo", "scardola"] },
      { k: "tank", id: "banco", name: "Banco d'argento", note: "Pesci di superficie in branco", decor: "shoal", species: ["alborella", "latterino"] },
      { k: "tank", id: "ninfee", name: "Laghetto delle ninfee", note: "Ombra e foglie galleggianti", decor: "reeds", species: ["rovella", "triotto", "gardon"] },
      { k: "tank", id: "pozza", name: "Pozza bassa", note: "Una vetrina al centro della sala", decor: "shoal", species: ["persico_sole", "avannotto"], at: "island" },
    ],
  },
  {
    id: "fondale",
    name: "Fondale Fangoso",
    subtitle: "Tane, baffi e giganti del fondo",
    theme: "mud",
    intro: "Sul fondo la luce arriva a fatica: qui vivono pesci pazienti, baffuti e antichi.",
    items: [
      { k: "tank", id: "tane", name: "Le tane", note: "Nascondigli tra sassi e radici", decor: "mud", species: ["cobite", "ghiozzo"] },
      { k: "hung", species: "siluro", span: 1.8 },
      { k: "tank", id: "baffi", name: "Baffi nel buio", note: "Cacciatori notturni", decor: "mud", species: ["pesce_gatto", "anguilla"] },
      { k: "hung", species: "storione", span: 1.8 },
      { k: "tank", id: "radici", name: "Tra le radici", note: "Pesci pazienti del fondo", decor: "mud", species: ["tinca", "barbo"], at: "island" },
    ],
  },
  {
    id: "torrente",
    name: "Torrente di Montagna",
    subtitle: "Acque fredde e correnti veloci",
    theme: "stream",
    intro: "Acqua limpida, ciottoli e corrente: solo i pesci più agili la domano.",
    items: [
      { k: "tank", id: "rapida", name: "La rapida", note: "Trote nella corrente", decor: "stream", species: ["trota_fario", "trota_iridea"] },
      { k: "tank", id: "ciottoli", name: "Letto di ciottoli", note: "Corrente moderata", decor: "stream", species: ["cavedano"] },
      { k: "tank", id: "cascata", name: "Sotto la cascata", note: "Acqua ossigenata e fredda", decor: "stream", species: ["savetta"] },
      { k: "tank", id: "salmerino", name: "Pozza fredda", note: "Il re dei laghi alpini", decor: "stream", species: ["salmerino"], at: "island" },
    ],
  },
  {
    id: "predatori",
    name: "Tana dei Predatori",
    subtitle: "Denti, agguati e velocità",
    theme: "predator",
    intro: "Qui ogni ombra è un agguato. Silenzio, e guarda dove nuoti.",
    items: [
      { k: "hung", species: "luccio", span: 1.8 },
      { k: "tank", id: "agguato", name: "L'agguato", note: "Tra tronchi sommersi", decor: "predator", species: ["persico_reale"] },
      { k: "tank", id: "bass", name: "Il cacciatore", note: "Scatto e morso", decor: "predator", species: ["black_bass"] },
      { k: "tank", id: "luci", name: "Acque scure", note: "Occhi nel buio verde", decor: "predator", species: ["lucioperca"], at: "island" },
    ],
  },
  {
    id: "giardino",
    name: "Giardino dei Koi",
    subtitle: "Carpe d'oro e pesci ornamentali",
    theme: "koi",
    intro: "Un giardino giapponese al coperto: lanterne, ponticelli e pesci da collezione.",
    items: [
      { k: "tank", id: "koi", name: "Laghetto dei Koi", note: "Macchie rosse, nere e oro", decor: "koi", species: ["carpa_koi", "koi_showa"] },
      { k: "tank", id: "imperiale", name: "Il sovrano", note: "Una carpa da imperatori", decor: "koi", species: ["carpa_imperiale"] },
      { k: "tank", id: "dorato", name: "Fondale dorato", note: "Pesci rossi e carpe", decor: "koi", species: ["pesce_rosso", "carpa"] },
      { k: "tank", id: "barriera", name: "Angolo di barriera", note: "Un ospite tra i coralli", decor: "coral", species: ["pesce_corallo"] },
      { k: "tank", id: "specchio", name: "Specchio d'acqua", note: "Squame come specchi", decor: "koi", species: ["carpa_specchio"], at: "island" },
    ],
  },
  {
    id: "abissi",
    name: "Galleria degli Abissi",
    subtitle: "Luci nel buio e cristalli di ghiaccio",
    theme: "abyss",
    intro: "Le luci si abbassano: ciò che brilla qui non ha bisogno del sole.",
    items: [
      { k: "tank", id: "ghiaccio", name: "Grotta di cristallo", note: "Acque gelide e trasparenti", decor: "ice", species: ["pesce_ghiaccio"], span: 1.3 },
      { k: "tank", id: "lanterne", name: "Giardino di lanterne", note: "Pesci che brillano da soli", decor: "abyss", species: ["pesce_lanterna", "pesce_stellato"], span: 1.5 },
      { k: "hung", species: "luccio_spettrale", span: 2.1 },
    ],
  },
  {
    id: "santuario",
    name: "Santuario del Pond",
    subtitle: "Le creature leggendarie",
    theme: "shrine",
    intro: "L'ultima stanza custodisce ciò che lo stagno ha di più antico e misterioso.",
    items: [
      { k: "hung", species: "drago_pond", span: 2.4 },
      { k: "hung", species: "pesce_lunare", span: 2.4 },
    ],
  },
];

export type ResolvedItem = { k: "tank"; id: string; name: string; note: string; decor: Decor; species: Species[]; at: "wall" | "island"; span: number } | { k: "hung"; species: Species; span: number };

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
      if (it.k === "hung") {
        const s = byId.get(it.species);
        if (s) {
          used.add(s.id);
          list.push(s);
          items.push({ k: "hung", species: s, span: it.span ?? 1.8 });
        }
      } else {
        const sp = it.species.map((id) => byId.get(id)).filter((s): s is Species => !!s);
        sp.forEach((s) => used.add(s.id));
        list.push(...sp);
        if (sp.length) items.push({ ...it, species: sp, at: it.at ?? "wall", span: it.span ?? (sp.length > 2 ? 1.25 : 1) });
      }
    });
    return { def, items, list };
  });
  const extra = all.filter((s) => !used.has(s.id));
  if (extra.length) {
    const first = rooms[0];
    first.items.splice(first.items.length - 1, 0, { k: "tank", id: "nuovi", name: "Nuovi arrivi", note: "Ospiti appena arrivati", decor: "shoal", species: extra, at: "wall", span: 1.4 });
    first.list.push(...extra);
  }
  return rooms;
}

export const isBig = (s: Species) => s.max_cm >= 80;
