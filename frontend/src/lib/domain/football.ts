import { useSyncExternalStore } from "react";
import { CFG, ROSTER, canInstantBuy, type RosterEntry } from "@/lib/domain/stadiumConfig";
import { readJson, writeJson } from "@/lib/utils/storage";

export type Pos = "POR" | "DIF" | "CEN" | "ATT";
export type StatKey = "rit" | "tir" | "pas" | "dri" | "dif" | "fis";
export type Stats = Record<StatKey, number>;
export type TrainKind = "fisico" | "tecnica" | "tiro" | "difesa";
export type LogType = "kickoff" | "goal" | "save" | "post" | "off" | "yellow" | "red" | "injury" | "half" | "end";

export interface Player {
  id: string;
  out?: { kind: "injury" | "red"; left: number };
  name: string;
  pos: Pos;
  ovr: number;
  pot: number;
  stats: Stats;
  goals: number;
  trained: number;
  training: { kind: TrainKind; end: number } | null;
  price?: number;
  priceAt?: number;
  card?: string;
  look?: { skin?: string; hair?: string; style?: number };
  loan?: { from: string; until: number };
}

export interface Team {
  id: string;
  name: string;
  color: string;
  players: Player[];
  mine: boolean;
  formation: string;
  xi: (string | null)[];
  budget: number;
}

export interface MatchEvent {
  min: number;
  teamId: string;
  player: string;
}

export interface LogEntry {
  id: number;
  min: number;
  type: LogType;
  teamId: string;
  player: string;
  text: string;
  variant?: string;
}

export interface Fixture {
  day: number;
  home: string;
  away: string;
  hg: number | null;
  ag: number | null;
  events: MatchEvent[];
  log: LogEntry[];
  reward?: number;
}

export interface Row {
  team: Team;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
}

export interface StadiumState {
  budget: number;
  myId: string | null;
  teams: Team[];
  market: Player[];
  fixtures: Fixture[];
  day: number;
  season: number;
  champion: string | null;
  rewarded: boolean;
  prize: number;
  auctions: Auction[];
  offers: Offer[];
  ledger: Ledger[];
}

export interface AuctionBot {
  id: string;
  max: number;
  at: number;
}

export interface Auction {
  id: string;
  pid: string;
  seller: string | null;
  bid: number;
  bidder: string | null;
  endsAt: number;
  bots: AuctionBot[];
}

export interface Offer {
  id: string;
  kind: "loan" | "buy";
  team: string;
  pid: string;
  amount: number;
  days: number;
  expires: number;
}

export interface Ledger {
  at: number;
  day: number;
  text: string;
  amount: number;
}

export interface Slot {
  player: Player | null;
  eff: number;
  pos: Pos;
}

export const START_BUDGET = CFG.economy.startBudget;
export const SQUAD_MAX = CFG.economy.squadMax;
export const SQUAD_MIN = CFG.economy.squadMin;
export const TEAMS = 8;
export const MARKET_SIZE = 120;
export const COLORS = CFG.teamColors;
export const POS_LABEL: Record<Pos, string> = { POR: "Portiere", DIF: "Difensore", CEN: "Centrocampista", ATT: "Attaccante" };
export const POS_ORDER: Pos[] = ["POR", "DIF", "CEN", "ATT"];
export const STAT_KEYS: StatKey[] = ["rit", "tir", "pas", "dri", "dif", "fis"];
export const STAT_LABEL: Record<StatKey, string> = { rit: "RIT", tir: "TIR", pas: "PAS", dri: "DRI", dif: "DIF", fis: "FIS" };

export const FORMATIONS: Record<string, [Pos, number, number][]> = {
  "4-3-3": [["POR", 50, 90], ["DIF", 14, 70], ["DIF", 38, 73], ["DIF", 62, 73], ["DIF", 86, 70], ["CEN", 28, 50], ["CEN", 50, 54], ["CEN", 72, 50], ["ATT", 18, 24], ["ATT", 50, 18], ["ATT", 82, 24]],
  "4-4-2": [["POR", 50, 90], ["DIF", 14, 70], ["DIF", 38, 73], ["DIF", 62, 73], ["DIF", 86, 70], ["CEN", 14, 50], ["CEN", 38, 53], ["CEN", 62, 53], ["CEN", 86, 50], ["ATT", 36, 22], ["ATT", 64, 22]],
  "3-5-2": [["POR", 50, 90], ["DIF", 24, 72], ["DIF", 50, 75], ["DIF", 76, 72], ["CEN", 10, 50], ["CEN", 30, 54], ["CEN", 50, 46], ["CEN", 70, 54], ["CEN", 90, 50], ["ATT", 36, 22], ["ATT", 64, 22]],
};
export const FORMATION_LIST = Object.keys(FORMATIONS);

export const TRAIN: Record<TrainKind, { label: string; stats: StatKey[]; hint: string }> = {
  fisico: { label: "Fisico", stats: ["rit", "fis"], hint: "Ritmo e fisico" },
  tecnica: { label: "Tecnica", stats: ["pas", "dri"], hint: "Passaggi e dribbling" },
  tiro: { label: "Tiro", stats: ["tir"], hint: "Precisione e potenza" },
  difesa: { label: "Difesa", stats: ["dif"], hint: "Marcatura e parate" },
};

const WEIGHTS: Record<Pos, Stats> = {
  POR: { rit: 0.2, tir: 0, pas: 0.15, dri: 0.1, dif: 0.4, fis: 0.15 },
  DIF: { rit: 0.15, tir: 0.02, pas: 0.13, dri: 0.1, dif: 0.4, fis: 0.2 },
  CEN: { rit: 0.1, tir: 0.12, pas: 0.3, dri: 0.25, dif: 0.1, fis: 0.13 },
  ATT: { rit: 0.2, tir: 0.35, pas: 0.1, dri: 0.2, dif: 0.02, fis: 0.13 },
};
const OFFSETS: Record<Pos, Stats> = {
  POR: { rit: -5, tir: -35, pas: -8, dri: -12, dif: 6, fis: 0 },
  DIF: { rit: -2, tir: -18, pas: -5, dri: -10, dif: 8, fis: 5 },
  CEN: { rit: 0, tir: -4, pas: 6, dri: 4, dif: -6, fis: -2 },
  ATT: { rit: 4, tir: 8, pas: -4, dri: 4, dif: -25, fis: -3 },
};
const AW: Record<Pos, number> = { ATT: 1, CEN: 0.5, DIF: 0.1, POR: 0 };
const DW: Record<Pos, number> = { POR: 1.5, DIF: 1, CEN: 0.5, ATT: 0.05 };
const FIRST = ["Luca", "Marco", "Matteo", "Andrea", "Davide", "Simone", "Federico", "Alessio", "Giorgio", "Riccardo", "Tommaso", "Nicolò", "Edoardo", "Filippo", "Samuele", "Lorenzo", "Gabriele", "Emanuele", "Stefano", "Diego", "Pietro", "Jacopo", "Mattia", "Leonardo", "Carlos", "Mateo", "Hugo", "Lucas", "Noah", "Kylian", "Jules", "Thomas", "Yannick", "Joshua", "Emre", "Karim", "Omar", "Sven", "Jonas", "Rafael"];
const LAST = ["Rossi", "Bianchi", "Ferrari", "Esposito", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Costa", "Giordano", "Mancini", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana", "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferraro", "Galli", "Martini", "Leone", "Longo", "Silva", "Garcia", "Lopez", "Dubois", "Martin", "Müller", "Schmidt", "Kovač", "Nowak", "Haddad", "Yilmaz", "Santos", "Oliveira", "Costa Lima", "Moreau", "Bernard", "Fischer", "Novak", "Petrov", "Jansen"];
const BOT_NAMES = ["Real Studium", "Atletico Banco", "Inter Compiti", "Dinamo Cattedra", "Juve Lavagna", "Sporting Quaderno", "Borussia Zaino", "Milan Ricreazione", "Olimpia Interrogati", "Torino Verifica", "Napoli Appunti", "Roma Merenda"];

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const round1 = (n: number) => Math.round(n * 10) / 10;
let seq = 0;
const uid = (p: string) => `${p}${++seq}${Math.random().toString(36).slice(2, 6)}`;

export const calcOvr = (pos: Pos, st: Stats) => Math.round(STAT_KEYS.reduce((s, k) => s + WEIGHTS[pos][k] * st[k], 0));
export const priceOf = (ovr: number) => round1(Math.pow(ovr / CFG.price.pivot, CFG.price.exponent) * CFG.price.base);
export const playerPrice = (p: Player) => (p.price !== undefined && p.priceAt === p.ovr ? p.price : priceOf(p.ovr));
export const sellPrice = (p: Player) => round1(playerPrice(p) * CFG.economy.sellRatio);
export const teamPrice = (t: Team) => round1(t.players.reduce((s, p) => s + playerPrice(p), 0) * CFG.economy.teamPriceRatio);
export const trainCost = (p: Player) => round1(CFG.training.costBase + p.ovr * CFG.training.costPerOvr);
export const trainSeconds = (p: Player) => CFG.training.secondsBase + Math.round(p.ovr * CFG.training.secondsPerOvr);

function mkStats(pos: Pos, ovr: number): Stats {
  const raw = {} as Stats;
  STAT_KEYS.forEach((k) => (raw[k] = OFFSETS[pos][k] + rnd(-5, 5)));
  const d = ovr - STAT_KEYS.reduce((s, k) => s + WEIGHTS[pos][k] * raw[k], 0);
  const out = {} as Stats;
  STAT_KEYS.forEach((k) => (out[k] = clamp(Math.round(raw[k] + d), 20, 99)));
  return out;
}

function mkPlayer(pos: Pos, ovr: number): Player {
  const stats = mkStats(pos, clamp(ovr, 40, 92));
  const o = calcOvr(pos, stats);
  return { id: uid("p"), name: `${pick(FIRST)} ${pick(LAST)}`, pos, ovr: o, pot: clamp(o + rnd(2, 14), o, 99), stats, goals: 0, trained: -1, training: null };
}

function fromRoster(r: RosterEntry): Player {
  const ovr = clamp(Math.round(r.ovr), 30, 99);
  const stats = mkStats(r.pos, clamp(ovr, 40, 92));
  (Object.keys(r.stats ?? {}) as StatKey[]).forEach((k) => {
    const v = r.stats?.[k];
    if (typeof v === "number") stats[k] = clamp(Math.round(v), 20, 99);
  });
  return {
    id: r.id,
    name: r.name,
    pos: r.pos,
    ovr,
    pot: clamp(Math.round(r.pot ?? ovr + rnd(2, 8)), ovr, 99),
    stats,
    goals: 0,
    trained: -1,
    training: null,
    price: r.price,
    priceAt: r.price !== undefined ? ovr : undefined,
    card: r.card,
    look: r.skin || r.hair || r.hairStyle !== undefined ? { skin: r.skin, hair: r.hair, style: r.hairStyle } : undefined,
  };
}

function mkSquad(base: number): Player[] {
  const plan: [Pos, number][] = [["POR", 2], ["DIF", 6], ["CEN", 5], ["ATT", 4]];
  return plan.flatMap(([pos, n]) => Array.from({ length: n }, () => mkPlayer(pos, base + rnd(-9, 9))));
}

export function autoXI(players: Player[], formation: string): (string | null)[] {
  const slots = FORMATIONS[formation];
  const pool = players.filter((p) => !p.out).sort((a, b) => b.ovr - a.ovr);
  const used = new Set<string>();
  const xi: (string | null)[] = slots.map(() => null);
  slots.forEach(([pos], i) => {
    const p = pool.find((x) => x.pos === pos && !used.has(x.id));
    if (p) {
      xi[i] = p.id;
      used.add(p.id);
    }
  });
  slots.forEach((_, i) => {
    if (xi[i]) return;
    const p = pool.find((x) => !used.has(x.id));
    if (p) {
      xi[i] = p.id;
      used.add(p.id);
    }
  });
  return xi;
}

function fillEmpty(t: Team) {
  const used = new Set(t.xi.filter(Boolean) as string[]);
  FORMATIONS[t.formation].forEach(([pos], i) => {
    if (t.xi[i]) return;
    const p = t.players.filter((x) => x.pos === pos && !x.out && !used.has(x.id)).sort((a, b) => b.ovr - a.ovr)[0];
    if (p) {
      t.xi[i] = p.id;
      used.add(p.id);
    }
  });
}

function mkBot(name: string): Team {
  const players = mkSquad(rnd(CFG.random.botOvrMin, CFG.random.botOvrMax));
  ROSTER.filter((r) => r.team === name).forEach((r) => {
    const worst = players.filter((p) => p.pos === r.pos).sort((a, b) => a.ovr - b.ovr)[0];
    const at = worst ? players.indexOf(worst) : -1;
    if (at >= 0) players[at] = fromRoster(r);
    else players.push(fromRoster(r));
  });
  return { id: uid("t"), name, color: pick(COLORS), players, mine: false, formation: "4-3-3", xi: autoXI(players, "4-3-3"), budget: rnd(CFG.auction.botBudgetMin, CFG.auction.botBudgetMax) };
}

function mkMarket(owned: Set<string> = new Set()): Player[] {
  const plan = (Object.entries(CFG.random.market) as [Pos, number][]).filter(() => CFG.random.enabled);
  const list = plan.flatMap(([pos, n]) => Array.from({ length: n }, () => mkPlayer(pos, Math.round(CFG.random.marketOvrMin + Math.pow(Math.random(), 2.3) * CFG.random.marketOvrSpread))));
  const fixed = ROSTER.filter((r) => !owned.has(r.id)).map(fromRoster);
  return [...list, ...fixed].sort((a, b) => b.ovr - a.ovr);
}

const ownedIds = (s: StadiumState) => new Set(s.teams.flatMap((t) => t.players.map((p) => p.id)));

function fresh(): StadiumState {
  const names = [...BOT_NAMES].sort(() => Math.random() - 0.5).slice(0, TEAMS - 1);
  const s: StadiumState = { budget: START_BUDGET, myId: null, teams: names.map(mkBot), market: [], fixtures: [], day: 0, season: 1, champion: null, rewarded: false, prize: 0, auctions: [], offers: [], ledger: [] };
  s.market = mkMarket(ownedIds(s));
  return s;
}

export function lineup(team: Team): Slot[] {
  return FORMATIONS[team.formation].map(([pos], i) => {
    const p = team.players.find((x) => x.id === team.xi[i]) ?? null;
    return { player: p, pos, eff: p ? (p.pos === pos ? p.ovr : p.ovr - 12) : 30 };
  });
}

const wavg = (slots: Slot[], w: Record<Pos, number>) => {
  const tot = slots.reduce((s, x) => s + w[x.pos], 0);
  return slots.reduce((s, x) => s + x.eff * w[x.pos], 0) / (tot || 1);
};

export function strength(team: Team) {
  const slots = lineup(team);
  return { att: wavg(slots, AW), def: wavg(slots, DW), ovr: round1(slots.reduce((s, x) => s + x.eff, 0) / slots.length) };
}

export const isReady = (t: Team | undefined) => !!t && t.xi.length === 11 && t.xi.every((id) => !!id && t.players.some((p) => p.id === id && !p.out));

export const myTeam = (s: StadiumState) => s.teams.find((t) => t.id === s.myId);

const KEY = "studium.stadium.v2";

function load(): StadiumState {
  const raw = readJson<StadiumState | null>(KEY, null);
  if (!raw || !Array.isArray(raw.teams) || !Array.isArray(raw.market) || !Array.isArray(raw.fixtures)) return fresh();
  raw.auctions = raw.auctions ?? [];
  raw.offers = raw.offers ?? [];
  raw.ledger = raw.ledger ?? [];
  raw.teams.forEach((t) => (t.budget = t.budget ?? 0));
  return raw;
}

let state: StadiumState = load();
const listeners = new Set<() => void>();
const commit = (next: StadiumState) => {
  state = next;
  writeJson(KEY, next);
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const getStadium = () => state;
export const useStadium = () => useSyncExternalStore(subscribe, () => state);

const refill = (s: StadiumState) => {
  const used = new Set(s.teams.map((t) => t.name));
  while (s.teams.length < TEAMS) {
    const name = BOT_NAMES.find((n) => !used.has(n)) ?? `FC ${pick(LAST)}`;
    used.add(name);
    s.teams.push(mkBot(name));
  }
};

export function createTeam(name: string, color: string): string | null {
  if (state.myId) return "Hai già una squadra";
  const clean = name.trim();
  if (clean.length < 3 || clean.length > 24) return "Il nome deve avere tra 3 e 24 caratteri";
  const s = structuredClone(state);
  const team: Team = { id: uid("t"), name: clean, color, players: [], mine: true, formation: "4-3-3", xi: Array(11).fill(null), budget: 0 };
  s.teams.push(team);
  s.myId = team.id;
  s.day = 0;
  commit(s);
  return null;
}

export function buyTeam(id: string): string | null {
  if (state.myId) return "Hai già una squadra";
  const team = state.teams.find((t) => t.id === id);
  if (!team) return "Squadra non trovata";
  const price = teamPrice(team);
  if (state.budget < price) return `Budget insufficiente: servono €${price.toFixed(1)}M`;
  const s = structuredClone(state);
  const t = s.teams.find((x) => x.id === id) as Team;
  t.mine = true;
  s.myId = id;
  s.budget = round1(s.budget - price);
  refill(s);
  s.day = 0;
  commit(s);
  return null;
}

export function buyPlayer(pid: string): string | null {
  const mine = myTeam(state);
  if (!mine) return "Prima crea o compra una squadra";
  const p = state.market.find((x) => x.id === pid);
  if (!p) return "Giocatore non disponibile";
  if (!canInstantBuy(p.ovr, p.card)) return "Questo giocatore si prende solo all'asta";
  if (state.auctions.some((a) => a.pid === pid)) return "Giocatore già all'asta";
  if (mine.players.length >= SQUAD_MAX) return `Rosa piena (massimo ${SQUAD_MAX} giocatori)`;
  const price = playerPrice(p);
  if (state.budget - reserved(state) < price) return `Budget insufficiente: servono €${price.toFixed(1)}M`;
  const s = structuredClone(state);
  const t = myTeam(s) as Team;
  t.players.push(p);
  fillEmpty(t);
  s.market = s.market.filter((x) => x.id !== pid);
  s.budget = round1(s.budget - price);
  commit(s);
  return null;
}

export function sellPlayer(pid: string): string | null {
  const mine = myTeam(state);
  const p = mine?.players.find((x) => x.id === pid);
  if (!mine || !p) return "Giocatore non trovato";
  if (p.loan) return "Un giocatore in prestito non si può vendere";
  if (p.id.startsWith("pk-")) return "Le carte dei pack si svincolano dalla scheda del giocatore";
  if (state.auctions.some((a) => a.pid === pid)) return "Giocatore già all'asta";
  if (mine.players.length <= SQUAD_MIN) return `Rosa troppo corta: servono almeno ${SQUAD_MIN} giocatori`;
  const s = structuredClone(state);
  const t = myTeam(s) as Team;
  t.players = t.players.filter((x) => x.id !== pid);
  t.xi = t.xi.map((id) => (id === pid ? null : id));
  fillEmpty(t);
  s.market = [{ ...p, goals: 0 }, ...s.market].sort((a, b) => b.ovr - a.ovr);
  s.budget = round1(s.budget + sellPrice(p));
  commit(s);
  return null;
}

export function setFormation(f: string): string | null {
  if (!FORMATIONS[f]) return "Modulo non valido";
  const s = structuredClone(state);
  const t = myTeam(s);
  if (!t) return "Prima crea o compra una squadra";
  t.formation = f;
  t.xi = autoXI(t.players, f);
  commit(s);
  return null;
}

export function autoLineup(): string | null {
  const s = structuredClone(state);
  const t = myTeam(s);
  if (!t) return "Prima crea o compra una squadra";
  t.xi = autoXI(t.players, t.formation);
  commit(s);
  return null;
}

export function setSlot(i: number, pid: string | null): string | null {
  const s = structuredClone(state);
  const t = myTeam(s);
  if (!t || i < 0 || i > 10) return "Posizione non valida";
  if (pid === null) {
    t.xi[i] = null;
  } else {
    const cand = t.players.find((p) => p.id === pid);
    if (!cand) return "Giocatore non trovato";
    if (cand.out) return cand.out.kind === "red" ? "Squalificato: salta ancora delle partite" : "Infortunato: non può giocare";
    const j = t.xi.indexOf(pid);
    if (j >= 0) t.xi[j] = t.xi[i];
    t.xi[i] = pid;
  }
  commit(s);
  return null;
}

function applyTrain(p: Player, kind: TrainKind) {
  TRAIN[kind].stats.forEach((k) => {
    const g = p.ovr >= p.pot ? rnd(0, 1) : rnd(1, 3);
    p.stats[k] = clamp(p.stats[k] + g, 20, 99);
  });
  p.ovr = calcOvr(p.pos, p.stats);
}

export function train(pid: string, kind: TrainKind): string | null {
  const s = structuredClone(state);
  const t = myTeam(s);
  const p = t?.players.find((x) => x.id === pid);
  if (!t || !p) return "Giocatore non trovato";
  if (p.training) return "Si sta già allenando";
  if (p.trained === s.day) return "Si è già allenato in questa giornata";
  const cost = trainCost(p);
  if (s.budget < cost) return `Budget insufficiente: servono €${cost.toFixed(1)}M`;
  s.budget = round1(s.budget - cost);
  p.trained = s.day;
  p.training = { kind, end: Date.now() + trainSeconds(p) * 1000 };
  commit(s);
  return null;
}

export function trainTeam(kind: TrainKind): string | null {
  const s = structuredClone(state);
  const t = myTeam(s);
  if (!t) return "Prima crea o compra una squadra";
  const list = t.players.filter((p) => p.trained !== s.day && !p.training);
  if (!list.length) return "Tutta la squadra si è già allenata in questa giornata";
  const cost = round1(list.reduce((sum, p) => sum + trainCost(p), 0));
  if (s.budget < cost) return `Budget insufficiente: servono €${cost.toFixed(1)}M`;
  s.budget = round1(s.budget - cost);
  const now = Date.now();
  list.forEach((p) => {
    p.trained = s.day;
    p.training = { kind, end: now + trainSeconds(p) * 1000 };
  });
  commit(s);
  return null;
}

export function collectTraining(now = Date.now()): { name: string; d: number }[] {
  const t = myTeam(state);
  if (!t || !t.players.some((p) => p.training && p.training.end <= now)) return [];
  const s = structuredClone(state);
  const tt = myTeam(s) as Team;
  const out: { name: string; d: number }[] = [];
  tt.players.forEach((p) => {
    if (p.training && p.training.end <= now) {
      const before = p.ovr;
      applyTrain(p, p.training.kind);
      out.push({ name: p.name, d: p.ovr - before });
      p.training = null;
    }
  });
  commit(s);
  return out;
}

export function resetTraining() {
  const s = structuredClone(state);
  const t = myTeam(s);
  if (t) t.players.forEach((p) => (p.trained = -1));
  commit(s);
}

export interface ServerCard {
  id: string;
  player: Player;
}

export function applyServer(status: Record<string, { kind: "injury" | "red"; left: number }>, cards: ServerCard[]) {
  const s = structuredClone(state);
  const t = myTeam(s);
  if (!t) return;
  const ids = new Set(cards.map((c) => c.id));
  t.players = t.players.filter((p) => !p.id.startsWith("pk-") || ids.has(p.id));
  t.xi = t.xi.map((id) => (id && t.players.some((p) => p.id === id) ? id : null));
  cards.forEach((c) => {
    const have = t.players.find((p) => p.id === c.id);
    if (!have) t.players.push({ ...c.player, trained: -1, training: null, goals: c.player.goals ?? 0 });
    else if (have.name !== c.player.name || have.card !== c.player.card) Object.assign(have, { name: c.player.name, card: c.player.card, look: c.player.look });
  });
  t.players.forEach((p) => {
    const st = status[p.id];
    if (st) p.out = { kind: st.kind, left: st.left };
    else delete p.out;
  });
  t.xi = t.xi.map((id) => (id && t.players.some((p) => p.id === id && !p.out) ? id : null));
  fillEmpty(t);
  if (JSON.stringify(s.teams) === JSON.stringify(state.teams)) return;
  commit(s);
}

export function syncDay(played: number) {
  if (played === state.day) return;
  const s = structuredClone(state);
  if (played > s.day && played - s.day <= 60) {
    while (s.day < played) {
      s.day += 1;
      dayEnd(s);
    }
  } else s.day = played;
  commit(s);
}

export function addBudget(n: number) {
  commit({ ...state, budget: round1(state.budget + n) });
}

export function resetStadium() {
  commit(fresh());
}


const fr = (a: number, b: number) => a + Math.random() * (b - a);

export const reserved = (s: StadiumState) => round1(s.auctions.filter((a) => a.bidder === s.myId && a.seller !== s.myId).reduce((t, a) => t + a.bid, 0));
export const available = (s: StadiumState) => round1(s.budget - reserved(s));
export const auctionStep = (price: number) => Math.max(CFG.auction.minStep, round1(price * CFG.auction.stepRatio));
export const auctionStart = (p: Player) => Math.max(CFG.auction.minStep, round1(playerPrice(p) * CFG.auction.startRatio));
export const borrowFee = (p: Player, days: number) => round1(Math.max(CFG.loan.minFee, playerPrice(p) * CFG.loan.borrowRatio * days));
export const auctionOf = (s: StadiumState, pid: string) => s.auctions.find((a) => a.pid === pid);
export const isFree = (s: StadiumState, p: Player) => !p.loan && !p.id.startsWith("pk-") && !auctionOf(s, p.id);

const note = (s: StadiumState, text: string, amount: number) => {
  s.ledger = [{ at: Date.now(), day: s.day, text, amount }, ...s.ledger].slice(0, 40);
};

const locate = (s: StadiumState, pid: string): { p: Player; team: Team | null } | null => {
  for (const t of s.teams) {
    const p = t.players.find((x) => x.id === pid);
    if (p) return { p, team: t };
  }
  const m = s.market.find((x) => x.id === pid);
  return m ? { p: m, team: null } : null;
};

const fixXI = (t: Team) => {
  if (t.mine) fillEmpty(t);
  else t.xi = autoXI(t.players, t.formation);
};

const detach = (t: Team, pid: string): Player | null => {
  const p = t.players.find((x) => x.id === pid);
  if (!p) return null;
  t.players = t.players.filter((x) => x.id !== pid);
  t.xi = t.xi.map((id) => (id === pid ? null : id));
  return p;
};

const attach = (t: Team, p: Player) => {
  t.players.push(p);
  fixXI(t);
};

const pay = (s: StadiumState, t: Team, delta: number) => {
  if (t.mine) s.budget = round1(s.budget + delta);
  else t.budget = round1(t.budget + delta);
};

const funds = (s: StadiumState, t: Team) => (t.mine ? s.budget : t.budget);

const wants = (t: Team, pos: Pos) => t.players.filter((x) => x.pos === pos).length < { POR: 2, DIF: 5, CEN: 5, ATT: 3 }[pos];

const dropWorst = (s: StadiumState, t: Team) => {
  while (t.players.length >= SQUAD_MAX) {
    const w = [...t.players].filter((x) => !x.loan).sort((a, b) => a.ovr - b.ovr)[0];
    if (!w) return;
    detach(t, w.id);
    s.market.push(w);
  }
};

function interested(s: StadiumState, p: Player, seller: string | null, floor: number, now: number): AuctionBot[] {
  return s.teams
    .filter((t) => !t.mine && t.id !== seller && t.budget >= floor)
    .map((t) => ({ id: t.id, max: Math.min(t.budget, round1(playerPrice(p) * fr(CFG.auction.botMaxMin, CFG.auction.botMaxMax) * (wants(t, p.pos) ? 1.12 : 0.78))), at: now + fr(CFG.auction.botDelayMin, CFG.auction.botDelayMax) * 1000 }))
    .filter((b) => b.max >= floor);
}

export function openAuction(pid: string, amount: number): string | null {
  const mine = myTeam(state);
  if (!mine) return "Prima crea o compra una squadra";
  const found = locate(state, pid);
  if (!found) return "Giocatore non disponibile";
  if (found.p.loan) return "Un giocatore in prestito non si può mettere all'asta";
  if (found.p.id.startsWith("pk-")) return "Le carte dei pack non si possono mettere all'asta";
  if (auctionOf(state, pid)) return "Già all'asta";
  if (state.auctions.length >= CFG.auction.maxActive) return `Massimo ${CFG.auction.maxActive} aste contemporanee`;
  const now = Date.now();
  const s = structuredClone(state);
  const p = (locate(s, pid) as { p: Player }).p;
  if (found.team?.mine) {
    if (mine.players.length <= SQUAD_MIN) return `Rosa troppo corta: servono almeno ${SQUAD_MIN} giocatori`;
    const ask = round1(Math.max(CFG.auction.minStep, amount));
    const bots = interested(s, p, mine.id, ask, now);
    if (!bots.length) return "Nessun club ha i fondi per questa base d'asta";
    s.auctions.push({ id: uid("a"), pid, seller: mine.id, bid: ask, bidder: null, endsAt: now + CFG.auction.firstSeconds * 1000, bots });
    commit(s);
    return null;
  }
  if (found.team) return "Questo giocatore appartiene a un altro club: proponi uno scambio o un prestito";
  const min = auctionStart(p);
  const bid = round1(amount);
  if (bid < min) return `Offerta minima €${min.toFixed(1)}M`;
  if (available(state) < bid) return `Budget disponibile insufficiente: €${available(state).toFixed(1)}M`;
  if (mine.players.length >= SQUAD_MAX) return `Rosa piena (massimo ${SQUAD_MAX} giocatori)`;
  const bots = interested(s, p, null, bid + auctionStep(bid), now);
  s.auctions.push({ id: uid("a"), pid, seller: null, bid, bidder: mine.id, endsAt: now + CFG.auction.firstSeconds * 1000, bots });
  commit(s);
  return null;
}

export function placeBid(aid: string, amount: number): string | null {
  const a = state.auctions.find((x) => x.id === aid);
  const mine = myTeam(state);
  if (!a || !mine) return "Asta non trovata";
  if (a.seller === mine.id) return "Non puoi rilanciare sulla tua asta";
  if (a.bidder === mine.id) return "Sei già in testa";
  if (Date.now() >= a.endsAt) return "Asta chiusa";
  const min = round1(a.bid + auctionStep(a.bid));
  const bid = round1(amount);
  if (bid < min) return `Rilancio minimo €${min.toFixed(1)}M`;
  if (available(state) < bid) return `Budget disponibile insufficiente: €${available(state).toFixed(1)}M`;
  const s = structuredClone(state);
  const x = s.auctions.find((y) => y.id === aid) as Auction;
  const now = Date.now();
  x.bid = bid;
  x.bidder = mine.id;
  x.endsAt = Math.max(x.endsAt, now + CFG.auction.extendSeconds * 1000);
  x.bots.forEach((b) => (b.at = now + fr(CFG.auction.botDelayMin, CFG.auction.botDelayMax) * 1000));
  commit(s);
  return null;
}

function stepAuction(s: StadiumState, a: Auction, now: number): boolean {
  for (let guard = 0; guard < 400; guard++) {
    const bot = [...a.bots].sort((x, y) => x.at - y.at)[0];
    if (bot && bot.at < a.endsAt && bot.at <= now) {
      const team = s.teams.find((t) => t.id === bot.id);
      const min = a.bidder ? round1(a.bid + auctionStep(a.bid)) : a.bid;
      if (!team || min > bot.max || min > team.budget) {
        a.bots = a.bots.filter((b) => b !== bot);
        continue;
      }
      if (a.bidder === bot.id) {
        bot.at += fr(CFG.auction.botDelayMin, CFG.auction.botDelayMax) * 1000;
        continue;
      }
      const amt = round1(Math.min(bot.max, team.budget, min + auctionStep(a.bid) * Math.floor(Math.random() * 3)));
      a.bid = Math.max(amt, min);
      a.bidder = bot.id;
      a.endsAt = Math.max(a.endsAt, bot.at + CFG.auction.extendSeconds * 1000);
      bot.at += fr(CFG.auction.botDelayMin, CFG.auction.botDelayMax) * 1000;
      continue;
    }
    return a.endsAt <= now;
  }
  return a.endsAt <= now;
}

function closeAuction(s: StadiumState, a: Auction): { text: string; good: boolean } {
  const found = locate(s, a.pid);
  if (!found) return { text: "Asta annullata", good: false };
  const { p } = found;
  const winner = s.teams.find((t) => t.id === a.bidder);
  const mine = myTeam(s);
  if (!winner) return { text: a.seller ? `${p.name}: nessuna offerta, resta in rosa` : `${p.name}: asta chiusa senza offerte`, good: false };
  if (!a.seller) {
    if (winner.mine) {
      if (winner.players.length >= SQUAD_MAX) return { text: `Rosa piena: asta di ${p.name} annullata`, good: false };
      if (s.budget < a.bid) return { text: `Fondi insufficienti: asta di ${p.name} annullata`, good: false };
    } else dropWorst(s, winner);
    s.market = s.market.filter((x) => x.id !== p.id);
    pay(s, winner, -a.bid);
    attach(winner, p);
    if (winner.mine) {
      note(s, `Asta vinta: ${p.name}`, -a.bid);
      return { text: `Asta vinta! ${p.name} è tuo per €${a.bid.toFixed(1)}M`, good: true };
    }
    return { text: `${p.name} è andato a ${winner.name} per €${a.bid.toFixed(1)}M`, good: false };
  }
  if (!mine) return { text: "Asta annullata", good: false };
  detach(mine, p.id);
  fillEmpty(mine);
  dropWorst(s, winner);
  pay(s, winner, -a.bid);
  attach(winner, p);
  s.budget = round1(s.budget + a.bid);
  note(s, `Asta chiusa: ${p.name} a ${winner.name}`, a.bid);
  return { text: `${p.name} venduto a ${winner.name} per €${a.bid.toFixed(1)}M`, good: true };
}

export function settleAuctions(now = Date.now()): { text: string; good: boolean }[] {
  const due = state.auctions.some((a) => a.bots.some((b) => b.at <= now && b.at < a.endsAt) || a.endsAt <= now);
  if (!due) return [];
  const s = structuredClone(state);
  const out: { text: string; good: boolean }[] = [];
  const left: Auction[] = [];
  s.auctions.forEach((a) => {
    if (stepAuction(s, a, now)) out.push(closeAuction(s, a));
    else left.push(a);
  });
  s.auctions = left;
  commit(s);
  return out;
}

export function acceptOffer(oid: string): string | null {
  const o = state.offers.find((x) => x.id === oid);
  const mine = myTeam(state);
  if (!o || !mine) return "Offerta scaduta";
  const p = mine.players.find((x) => x.id === o.pid);
  const bot = state.teams.find((t) => t.id === o.team);
  if (!p || !bot || !isFree(state, p)) return "L'offerta non è più valida";
  if (mine.players.length <= SQUAD_MIN) return `Rosa troppo corta: servono almeno ${SQUAD_MIN} giocatori`;
  if (bot.budget < o.amount) return `${bot.name} non ha più i fondi`;
  const s = structuredClone(state);
  const m = myTeam(s) as Team;
  const b = s.teams.find((t) => t.id === o.team) as Team;
  const pl = detach(m, o.pid) as Player;
  fillEmpty(m);
  b.budget = round1(b.budget - o.amount);
  s.budget = round1(s.budget + o.amount);
  if (o.kind === "loan") pl.loan = { from: m.id, until: s.day + o.days };
  b.players.push(pl);
  b.xi = autoXI(b.players, b.formation);
  s.offers = s.offers.filter((x) => x.id !== oid);
  note(s, o.kind === "loan" ? `Prestito di ${pl.name} a ${b.name}` : `Cessione di ${pl.name} a ${b.name}`, o.amount);
  commit(s);
  return null;
}

export function declineOffer(oid: string): string | null {
  commit({ ...state, offers: state.offers.filter((o) => o.id !== oid) });
  return null;
}

export function borrowPlayer(pid: string, days: number): string | null {
  const mine = myTeam(state);
  if (!mine) return "Prima crea o compra una squadra";
  const found = locate(state, pid);
  const host = found?.team;
  if (!found || !host || host.mine) return "Giocatore non trovato";
  if (!isFree(state, found.p)) return "Giocatore non disponibile";
  if (mine.players.length >= SQUAD_MAX) return `Rosa piena (massimo ${SQUAD_MAX} giocatori)`;
  if (host.players.length <= SQUAD_MIN) return `${host.name} ha la rosa troppo corta`;
  if (found.p.pos === "POR" && host.players.filter((x) => x.pos === "POR").length < 2) return `${host.name} non può cedere il suo portiere`;
  const fee = borrowFee(found.p, days);
  if (available(state) < fee) return `Budget disponibile insufficiente: servono €${fee.toFixed(1)}M`;
  const s = structuredClone(state);
  const m = myTeam(s) as Team;
  const h = s.teams.find((t) => t.id === host.id) as Team;
  const pl = detach(h, pid) as Player;
  h.xi = autoXI(h.players, h.formation);
  pl.loan = { from: h.id, until: s.day + days };
  s.budget = round1(s.budget - fee);
  h.budget = round1(h.budget + fee);
  attach(m, pl);
  note(s, `Prestito di ${pl.name} da ${h.name}`, -fee);
  commit(s);
  return null;
}

export function tradeQuote(s: StadiumState, botId: string, give: string[], get: string[], cash: number): { need: number; error: string | null } {
  const mine = myTeam(s);
  const bot = s.teams.find((t) => t.id === botId);
  if (!mine || !bot) return { need: 0, error: "Squadra non trovata" };
  if (!give.length && !get.length) return { need: 0, error: "Scegli almeno un giocatore" };
  const mine_ = give.map((id) => mine.players.find((p) => p.id === id));
  const theirs = get.map((id) => bot.players.find((p) => p.id === id));
  if (mine_.some((p) => !p || !isFree(s, p)) || theirs.some((p) => !p || !isFree(s, p))) return { need: 0, error: "Un giocatore scelto non è disponibile" };
  const myAfter = mine.players.length - give.length + get.length;
  const botAfter = bot.players.length + give.length - get.length;
  if (myAfter > SQUAD_MAX || myAfter < SQUAD_MIN) return { need: 0, error: `La tua rosa deve restare tra ${SQUAD_MIN} e ${SQUAD_MAX} giocatori` };
  if (botAfter > SQUAD_MAX || botAfter < SQUAD_MIN) return { need: 0, error: `${bot.name} deve restare tra ${SQUAD_MIN} e ${SQUAD_MAX} giocatori` };
  const botGk = bot.players.filter((p) => p.pos === "POR" && !get.includes(p.id)).length + mine.players.filter((p) => give.includes(p.id) && p.pos === "POR").length;
  if (botGk < 1) return { need: 0, error: `${bot.name} non può restare senza portiere` };
  if (cash > 0 && available(s) < cash) return { need: 0, error: "Budget disponibile insufficiente" };
  if (cash < 0 && bot.budget < -cash) return { need: 0, error: `${bot.name} non ha i fondi per pagarti` };
  const v = (list: (Player | undefined)[]) => list.reduce((t, p) => t + (p ? playerPrice(p) : 0), 0);
  const need = round1(Math.max(0, v(theirs) * CFG.trade.margin - (v(mine_) + cash)));
  return { need, error: null };
}

export function proposeTrade(botId: string, give: string[], get: string[], cash: number): string | null {
  const q = tradeQuote(state, botId, give, get, cash);
  if (q.error) return q.error;
  if (q.need > 0) return `${(state.teams.find((t) => t.id === botId) as Team).name} chiede ancora €${q.need.toFixed(1)}M`;
  const s = structuredClone(state);
  const m = myTeam(s) as Team;
  const b = s.teams.find((t) => t.id === botId) as Team;
  const out = give.map((id) => detach(m, id) as Player);
  const inn = get.map((id) => detach(b, id) as Player);
  out.forEach((p) => b.players.push(p));
  inn.forEach((p) => m.players.push(p));
  s.budget = round1(s.budget - cash);
  b.budget = round1(b.budget + cash);
  fixXI(m);
  b.xi = autoXI(b.players, b.formation);
  note(s, `Scambio con ${b.name}`, -cash);
  commit(s);
  return null;
}

function returnLoans(s: StadiumState) {
  s.teams.forEach((host) => {
    host.players
      .filter((p) => p.loan && s.day >= p.loan.until)
      .forEach((p) => {
        const home = s.teams.find((t) => t.id === p.loan?.from);
        detach(host, p.id);
        delete p.loan;
        fixXI(host);
        if (home) attach(home, p);
        else s.market.push(p);
      });
  });
}

function botMarket(s: StadiumState) {
  const bots = s.teams.filter((t) => !t.mine).sort(() => Math.random() - 0.5);
  for (let i = 0; i < CFG.auction.botBuysPerDay && i < bots.length; i++) {
    const t = bots[i];
    const pool = s.market.filter((p) => !auctionOf(s, p.id) && playerPrice(p) <= t.budget * 0.5 && wants(t, p.pos) && t.players.length < SQUAD_MAX);
    if (!pool.length) continue;
    const p = pool.sort((a, b) => b.ovr - a.ovr)[Math.floor(Math.random() * Math.min(3, pool.length))];
    s.market = s.market.filter((x) => x.id !== p.id);
    t.budget = round1(t.budget - playerPrice(p));
    attach(t, p);
  }
}

function makeOffers(s: StadiumState) {
  const mine = myTeam(s);
  if (!mine) return;
  const L = CFG.loan;
  s.offers = s.offers.filter((o) => o.expires > s.day && mine.players.some((p) => p.id === o.pid && isFree(s, p)));
  let n = Math.random() < L.offerChance ? 1 + Math.floor(Math.random() * 2) : 0;
  const pool = mine.players.filter((p) => isFree(s, p) && !s.offers.some((o) => o.pid === p.id)).sort((a, b) => b.ovr - a.ovr).slice(0, 10);
  const bots = s.teams.filter((t) => !t.mine);
  while (n-- > 0 && pool.length && bots.length && s.offers.length < L.maxOffers) {
    const p = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const team = pick(bots);
    const loan = Math.random() < 0.6;
    const days = rnd(L.minDays, L.maxDays);
    const amount = loan ? round1(Math.max(L.minFee, playerPrice(p) * L.feeRatio * days)) : round1(playerPrice(p) * fr(L.buyMin, L.buyMax));
    if (team.budget < amount) continue;
    s.offers.push({ id: uid("o"), kind: loan ? "loan" : "buy", team: team.id, pid: p.id, amount, days: loan ? days : 0, expires: s.day + L.offerLifeDays });
  }
}

function dayEnd(s: StadiumState) {
  s.teams.forEach((t) => {
    if (!t.mine) t.budget = round1(t.budget + CFG.auction.botIncomePerDay);
  });
  returnLoans(s);
  botMarket(s);
  makeOffers(s);
}
