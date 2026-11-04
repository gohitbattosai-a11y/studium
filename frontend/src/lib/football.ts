import { useSyncExternalStore } from "react";

export type Pos = "POR" | "DIF" | "CEN" | "ATT";
export type StatKey = "rit" | "tir" | "pas" | "dri" | "dif" | "fis";
export type Stats = Record<StatKey, number>;
export type TrainKind = "fisico" | "tecnica" | "tiro" | "difesa";
export type LogType = "kickoff" | "goal" | "save" | "post" | "off" | "yellow" | "half" | "end";

export interface Player {
  id: string;
  name: string;
  pos: Pos;
  ovr: number;
  pot: number;
  stats: Stats;
  goals: number;
  trained: number;
  training: { kind: TrainKind; end: number } | null;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  players: Player[];
  mine: boolean;
  formation: string;
  xi: (string | null)[];
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
}

export interface Fixture {
  day: number;
  home: string;
  away: string;
  hg: number | null;
  ag: number | null;
  events: MatchEvent[];
  log: LogEntry[];
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
}

export interface Slot {
  player: Player | null;
  eff: number;
  pos: Pos;
}

export const START_BUDGET = 100;
export const SQUAD_MAX = 24;
export const SQUAD_MIN = 11;
export const TEAMS = 8;
export const TOTAL_DAYS = (TEAMS - 1) * 2;
export const MARKET_SIZE = 120;
export const COLORS = ["#E11D48", "#2563EB", "#16A34A", "#F59E0B", "#8B5CF6", "#0EA5E9", "#F97316", "#14B8A6"];
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
const GW: Record<Pos, number> = { ATT: 6, CEN: 2.5, DIF: 0.8, POR: 0 };
const PRIZES = [20, 12, 8, 5, 3, 3, 2, 2];
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
export const priceOf = (ovr: number) => round1(Math.pow(ovr / 50, 6) * 0.8);
export const sellPrice = (p: Player) => round1(priceOf(p.ovr) * 0.7);
export const teamPrice = (t: Team) => round1(t.players.reduce((s, p) => s + priceOf(p.ovr), 0) * 0.85);
export const trainCost = (p: Player) => round1(0.2 + p.ovr / 100);
export const trainSeconds = (p: Player) => 25 + Math.round(p.ovr / 3);

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

function mkSquad(base: number): Player[] {
  const plan: [Pos, number][] = [["POR", 2], ["DIF", 6], ["CEN", 5], ["ATT", 4]];
  return plan.flatMap(([pos, n]) => Array.from({ length: n }, () => mkPlayer(pos, base + rnd(-9, 9))));
}

export function autoXI(players: Player[], formation: string): (string | null)[] {
  const slots = FORMATIONS[formation];
  const pool = [...players].sort((a, b) => b.ovr - a.ovr);
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
    const p = t.players.filter((x) => x.pos === pos && !used.has(x.id)).sort((a, b) => b.ovr - a.ovr)[0];
    if (p) {
      t.xi[i] = p.id;
      used.add(p.id);
    }
  });
}

function mkBot(name: string): Team {
  const players = mkSquad(rnd(58, 72));
  return { id: uid("t"), name, color: pick(COLORS), players, mine: false, formation: "4-3-3", xi: autoXI(players, "4-3-3") };
}

function mkMarket(): Player[] {
  const plan: [Pos, number][] = [["POR", 12], ["DIF", 38], ["CEN", 40], ["ATT", 30]];
  const list = plan.flatMap(([pos, n]) => Array.from({ length: n }, () => mkPlayer(pos, Math.round(44 + Math.pow(Math.random(), 2.3) * 46))));
  return list.sort((a, b) => b.ovr - a.ovr);
}

function schedule(ids: string[]): Fixture[] {
  const n = ids.length;
  const arr = [...ids];
  const rounds: [string, string][][] = [];
  for (let r = 0; r < n - 1; r++) {
    const m: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      m.push(r % 2 === 0 ? [a, b] : [b, a]);
    }
    rounds.push(m);
    arr.splice(1, 0, arr.pop() as string);
  }
  const out: Fixture[] = [];
  rounds.forEach((m, r) => m.forEach(([h, a]) => out.push({ day: r + 1, home: h, away: a, hg: null, ag: null, events: [], log: [] })));
  rounds.forEach((m, r) => m.forEach(([h, a]) => out.push({ day: n - 1 + r + 1, home: a, away: h, hg: null, ag: null, events: [], log: [] })));
  return out;
}

function fresh(): StadiumState {
  const names = [...BOT_NAMES].sort(() => Math.random() - 0.5).slice(0, TEAMS - 1);
  return { budget: START_BUDGET, myId: null, teams: names.map(mkBot), market: mkMarket(), fixtures: [], day: 0, season: 1, champion: null, rewarded: false, prize: 0 };
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

export const isReady = (t: Team | undefined) => !!t && t.xi.length === 11 && t.xi.every((id) => !!id && t.players.some((p) => p.id === id));

const poisson = (l: number) => {
  const L = Math.exp(-l);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
};

const lambda = (att: number, def: number, home: boolean) => clamp(1.35 * Math.exp((att - def) / 30) * (home ? 1.1 : 0.95), 0.25, 4.2);

const shooter = (team: Team) => {
  const slots = lineup(team).filter((s) => s.player && GW[s.pos] > 0);
  const total = slots.reduce((s, x) => s + GW[x.pos], 0);
  return () => {
    let r = Math.random() * total;
    return (slots.find((s) => (r -= GW[s.pos]) <= 0) ?? slots[0])?.player ?? null;
  };
};

const anyPlayer = (team: Team) => pick(lineup(team).filter((s) => s.player)).player as Player;

const GOAL_T = [
  (p: string, t: string) => `GOL! ${p} la mette dentro per ${t}!`,
  (p: string, t: string) => `Rete di ${p}! ${t} colpisce!`,
  (p: string, t: string) => `${p} non sbaglia: gol per ${t}!`,
];
const SAVE_T = [(p: string) => `${p} calcia forte, ma il portiere si salva!`, (p: string) => `Tiro di ${p}: grande parata!`];
const OFF_T = [(p: string) => `${p} ci prova, palla fuori di poco.`, (p: string) => `Conclusione di ${p} che sorvola la traversa.`];

function simulate(f: Fixture, teams: Map<string, Team>) {
  const h = teams.get(f.home) as Team;
  const a = teams.get(f.away) as Team;
  const sh = strength(h);
  const sa = strength(a);
  const lh = lambda(sh.att, sa.def, true);
  const la = lambda(sa.att, sh.def, false);
  f.hg = poisson(lh);
  f.ag = poisson(la);
  const goals: MatchEvent[] = [];
  const raw: Omit<LogEntry, "id">[] = [];
  const side = (team: Team, g: number, lam: number) => {
    const shoot = shooter(team);
    for (let i = 0; i < g; i++) {
      const p = shoot();
      if (p) p.goals += 1;
      const min = rnd(1, 90);
      const name = p?.name ?? "Sconosciuto";
      goals.push({ min, teamId: team.id, player: name });
      raw.push({ min, type: "goal", teamId: team.id, player: name, text: pick(GOAL_T)(name, team.name) });
    }
    const chances = clamp(Math.round(lam * 2.2 + rnd(1, 3)), 2, 9);
    for (let i = 0; i < chances; i++) {
      const p = shoot();
      if (!p) continue;
      const r = Math.random();
      const type: LogType = r < 0.5 ? "save" : r < 0.65 ? "post" : "off";
      const text = type === "save" ? pick(SAVE_T)(p.name) : type === "post" ? `Palo clamoroso di ${p.name}!` : pick(OFF_T)(p.name);
      raw.push({ min: rnd(2, 89), type, teamId: team.id, player: p.name, text });
    }
    for (let i = rnd(0, 2); i > 0; i--) {
      const p = anyPlayer(team);
      raw.push({ min: rnd(5, 88), type: "yellow", teamId: team.id, player: p.name, text: `Cartellino giallo per ${p.name} (${team.name}).` });
    }
  };
  side(h, f.hg, lh);
  side(a, f.ag, la);
  const h1 = goals.filter((g) => g.min <= 45 && g.teamId === h.id).length;
  const a1 = goals.filter((g) => g.min <= 45 && g.teamId === a.id).length;
  const order = (e: Omit<LogEntry, "id">) => (e.type === "kickoff" ? -1 : e.type === "half" || e.type === "end" ? 1 : 0);
  const all: Omit<LogEntry, "id">[] = [
    { min: 0, type: "kickoff", teamId: h.id, player: "", text: `Fischio d'inizio: ${h.name} - ${a.name}` },
    ...raw,
    { min: 45, type: "half", teamId: h.id, player: "", text: `Fine primo tempo: ${h.name} ${h1}-${a1} ${a.name}` },
    { min: 90, type: "end", teamId: h.id, player: "", text: `Finita: ${h.name} ${f.hg}-${f.ag} ${a.name}` },
  ];
  f.log = all.sort((x, y) => x.min - y.min || order(x) - order(y)).map((e, i) => ({ ...e, id: i }));
  f.events = goals.sort((x, y) => x.min - y.min);
}

export function table(s: StadiumState): Row[] {
  const rows = new Map<string, Row>(s.teams.map((t) => [t.id, { team: t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }]));
  for (const f of s.fixtures) {
    if (f.hg === null || f.ag === null) continue;
    const h = rows.get(f.home);
    const a = rows.get(f.away);
    if (!h || !a) continue;
    h.p++;
    a.p++;
    h.gf += f.hg;
    h.ga += f.ag;
    a.gf += f.ag;
    a.ga += f.hg;
    if (f.hg > f.ag) {
      h.w++;
      a.l++;
      h.pts += 3;
    } else if (f.hg < f.ag) {
      a.w++;
      h.l++;
      a.pts += 3;
    } else {
      h.d++;
      a.d++;
      h.pts++;
      a.pts++;
    }
  }
  return [...rows.values()].sort((x, y) => y.pts - x.pts || y.gf - y.ga - (x.gf - x.ga) || y.gf - x.gf || x.team.name.localeCompare(y.team.name));
}

export const myTeam = (s: StadiumState) => s.teams.find((t) => t.id === s.myId);

let state: StadiumState = fresh();
const listeners = new Set<() => void>();
const commit = (next: StadiumState) => {
  state = next;
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
  const team: Team = { id: uid("t"), name: clean, color, players: [], mine: true, formation: "4-3-3", xi: Array(11).fill(null) };
  s.teams.push(team);
  s.myId = team.id;
  s.fixtures = schedule(s.teams.map((t) => t.id));
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
  s.fixtures = schedule(s.teams.map((x) => x.id));
  s.day = 0;
  commit(s);
  return null;
}

export function buyPlayer(pid: string): string | null {
  const mine = myTeam(state);
  if (!mine) return "Prima crea o compra una squadra";
  const p = state.market.find((x) => x.id === pid);
  if (!p) return "Giocatore non disponibile";
  if (mine.players.length >= SQUAD_MAX) return `Rosa piena (massimo ${SQUAD_MAX} giocatori)`;
  const price = priceOf(p.ovr);
  if (state.budget < price) return `Budget insufficiente: servono €${price.toFixed(1)}M`;
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

export function refreshMarket(): string | null {
  commit({ ...state, market: mkMarket() });
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
    if (!t.players.some((p) => p.id === pid)) return "Giocatore non trovato";
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

function runDay(s: StadiumState) {
  const map = new Map(s.teams.map((t) => [t.id, t]));
  s.fixtures.filter((f) => f.day === s.day + 1).forEach((f) => simulate(f, map));
  s.day += 1;
  if (s.day >= TOTAL_DAYS && !s.rewarded) {
    const rows = table(s);
    const idx = rows.findIndex((r) => r.team.id === s.myId);
    s.champion = rows[0].team.id;
    s.prize = idx >= 0 ? PRIZES[idx] ?? 2 : 0;
    s.budget = round1(s.budget + s.prize);
    s.rewarded = true;
  }
}

function playable(): string | null {
  const mine = myTeam(state);
  if (!mine) return "Prima crea o compra una squadra";
  if (!isReady(mine)) return "Formazione incompleta: servono 11 titolari in campo (vai in Rosa)";
  if (state.day >= TOTAL_DAYS) return "Campionato finito: avvia una nuova stagione";
  return null;
}

export function playDay(): string | null {
  const err = playable();
  if (err) return err;
  const s = structuredClone(state);
  runDay(s);
  commit(s);
  return null;
}

export function playSeason(): string | null {
  const err = playable();
  if (err) return err;
  const s = structuredClone(state);
  while (s.day < TOTAL_DAYS) runDay(s);
  commit(s);
  return null;
}

export function newSeason(): string | null {
  if (!state.myId) return "Prima crea o compra una squadra";
  const s = structuredClone(state);
  s.teams.forEach((t) =>
    t.players.forEach((p) => {
      const sh = rnd(-2, 3);
      STAT_KEYS.forEach((k) => (p.stats[k] = clamp(p.stats[k] + sh, 20, 99)));
      p.ovr = calcOvr(p.pos, p.stats);
      p.pot = Math.max(p.pot, p.ovr);
      p.goals = 0;
      p.trained = -1;
      p.training = null;
    }),
  );
  s.fixtures = schedule(s.teams.map((t) => t.id));
  s.day = 0;
  s.season += 1;
  s.champion = null;
  s.rewarded = false;
  s.prize = 0;
  s.market = mkMarket();
  commit(s);
  return null;
}

export function addBudget(n: number) {
  commit({ ...state, budget: round1(state.budget + n) });
}

export function resetStadium() {
  commit(fresh());
}
