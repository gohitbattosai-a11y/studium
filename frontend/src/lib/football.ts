import { useSyncExternalStore } from "react";

export type Pos = "POR" | "DIF" | "CEN" | "ATT";

export interface Player {
  id: string;
  name: string;
  pos: Pos;
  ovr: number;
  goals: number;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  players: Player[];
  mine: boolean;
}

export interface MatchEvent {
  min: number;
  teamId: string;
  player: string;
}

export interface Fixture {
  day: number;
  home: string;
  away: string;
  hg: number | null;
  ag: number | null;
  events: MatchEvent[];
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

export const START_BUDGET = 100;
export const SQUAD_MAX = 18;
export const SQUAD_MIN = 11;
export const TEAMS = 8;
export const TOTAL_DAYS = (TEAMS - 1) * 2;
export const COLORS = ["#E11D48", "#2563EB", "#16A34A", "#F59E0B", "#8B5CF6", "#0EA5E9", "#F97316", "#14B8A6"];
export const POS_LABEL: Record<Pos, string> = { POR: "Portiere", DIF: "Difensore", CEN: "Centrocampista", ATT: "Attaccante" };
export const POS_ORDER: Pos[] = ["POR", "DIF", "CEN", "ATT"];

const PRIZES = [20, 12, 8, 5, 3, 3, 2, 2];
const FIRST = ["Luca", "Marco", "Matteo", "Andrea", "Davide", "Simone", "Federico", "Alessio", "Giorgio", "Riccardo", "Tommaso", "Nicolò", "Edoardo", "Filippo", "Samuele", "Lorenzo", "Gabriele", "Emanuele", "Stefano", "Diego", "Pietro", "Jacopo", "Mattia", "Leonardo"];
const LAST = ["Rossi", "Bianchi", "Ferrari", "Esposito", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Costa", "Giordano", "Mancini", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana", "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferraro", "Galli", "Martini", "Leone", "Longo"];
const BOT_NAMES = ["Real Studium", "Atletico Banco", "Inter Compiti", "Dinamo Cattedra", "Juve Lavagna", "Sporting Quaderno", "Borussia Zaino", "Milan Ricreazione", "Olimpia Interrogati", "Torino Verifica", "Napoli Appunti", "Roma Merenda"];

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const round1 = (n: number) => Math.round(n * 10) / 10;
let seq = 0;
const uid = (p: string) => `${p}${++seq}${Math.random().toString(36).slice(2, 6)}`;

export const priceOf = (ovr: number) => round1(Math.pow(ovr / 50, 6) * 0.8);
export const sellPrice = (p: Player) => round1(priceOf(p.ovr) * 0.7);
export const teamPrice = (t: Team) => round1(t.players.reduce((s, p) => s + priceOf(p.ovr), 0) * 0.85);

function mkPlayer(pos: Pos, ovr: number): Player {
  return { id: uid("p"), name: `${pick(FIRST)} ${pick(LAST)}`, pos, ovr: clamp(ovr, 40, 92), goals: 0 };
}

function mkSquad(base: number): Player[] {
  const plan: [Pos, number][] = [["POR", 2], ["DIF", 5], ["CEN", 5], ["ATT", 3]];
  return plan.flatMap(([pos, n]) => Array.from({ length: n }, () => mkPlayer(pos, base + rnd(-9, 9))));
}

function mkBot(name: string): Team {
  return { id: uid("t"), name, color: pick(COLORS), players: mkSquad(rnd(58, 72)), mine: false };
}

function mkMarket(): Player[] {
  const plan: Pos[] = ["POR", "POR", "POR", "DIF", "DIF", "DIF", "DIF", "DIF", "DIF", "CEN", "CEN", "CEN", "CEN", "CEN", "CEN", "ATT", "ATT", "ATT", "ATT", "ATT"];
  return plan.map((pos) => mkPlayer(pos, rnd(48, 86))).sort((a, b) => b.ovr - a.ovr);
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
  rounds.forEach((m, r) => m.forEach(([h, a]) => out.push({ day: r + 1, home: h, away: a, hg: null, ag: null, events: [] })));
  rounds.forEach((m, r) => m.forEach(([h, a]) => out.push({ day: n - 1 + r + 1, home: a, away: h, hg: null, ag: null, events: [] })));
  return out;
}

function fresh(): StadiumState {
  const names = [...BOT_NAMES].sort(() => Math.random() - 0.5).slice(0, TEAMS - 1);
  return { budget: START_BUDGET, myId: null, teams: names.map(mkBot), market: mkMarket(), fixtures: [], day: 0, season: 1, champion: null, rewarded: false, prize: 0 };
}

interface Slot {
  player: Player | null;
  eff: number;
  pos: Pos;
}

const NEED: Record<Pos, number> = { POR: 1, DIF: 4, CEN: 3, ATT: 3 };
const AW: Record<Pos, number> = { ATT: 1, CEN: 0.5, DIF: 0.1, POR: 0 };
const DW: Record<Pos, number> = { POR: 1.5, DIF: 1, CEN: 0.5, ATT: 0.05 };
const GW: Record<Pos, number> = { ATT: 6, CEN: 2.5, DIF: 0.8, POR: 0 };

export function lineup(team: Team): Slot[] {
  const pool = [...team.players].sort((a, b) => b.ovr - a.ovr);
  const slots: Slot[] = [];
  const left: Player[] = [];
  for (const pos of POS_ORDER) {
    const own = pool.filter((p) => p.pos === pos);
    own.slice(0, NEED[pos]).forEach((p) => slots.push({ player: p, eff: p.ovr, pos }));
    for (let i = own.length; i < NEED[pos]; i++) slots.push({ player: null, eff: 30, pos });
    left.push(...own.slice(NEED[pos]));
  }
  left.sort((a, b) => b.ovr - a.ovr);
  slots
    .filter((s) => !s.player)
    .forEach((s) => {
      const p = left.shift();
      if (p) {
        s.player = p;
        s.eff = p.ovr - 15;
      }
    });
  return slots;
}

const wavg = (slots: Slot[], w: Record<Pos, number>) => {
  const tot = slots.reduce((s, x) => s + w[x.pos], 0);
  return slots.reduce((s, x) => s + x.eff * w[x.pos], 0) / (tot || 1);
};

export function strength(team: Team) {
  const slots = lineup(team);
  return { att: wavg(slots, AW), def: wavg(slots, DW), ovr: round1(slots.reduce((s, x) => s + x.eff, 0) / slots.length) };
}

export const isReady = (t: Team | undefined) => !!t && t.players.length >= SQUAD_MIN && t.players.some((p) => p.pos === "POR");

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

function scorers(team: Team, goals: number): MatchEvent[] {
  const slots = lineup(team).filter((s) => s.player && GW[s.pos] > 0);
  const total = slots.reduce((s, x) => s + GW[x.pos], 0);
  return Array.from({ length: goals }, () => {
    let r = Math.random() * total;
    const slot = slots.find((s) => (r -= GW[s.pos]) <= 0) ?? slots[0];
    if (slot?.player) slot.player.goals += 1;
    return { min: rnd(1, 90), teamId: team.id, player: slot?.player?.name ?? "Sconosciuto" };
  });
}

function simulate(f: Fixture, teams: Map<string, Team>) {
  const h = teams.get(f.home) as Team;
  const a = teams.get(f.away) as Team;
  const sh = strength(h);
  const sa = strength(a);
  f.hg = poisson(lambda(sh.att, sa.def, true));
  f.ag = poisson(lambda(sa.att, sh.def, false));
  f.events = [...scorers(h, f.hg), ...scorers(a, f.ag)].sort((x, y) => x.min - y.min);
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
  const team: Team = { id: uid("t"), name: clean, color, players: [], mine: true };
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
  s.market = [{ ...p, goals: 0 }, ...s.market].sort((a, b) => b.ovr - a.ovr);
  s.budget = round1(s.budget + sellPrice(p));
  commit(s);
  return null;
}

export function refreshMarket(): string | null {
  commit({ ...state, market: mkMarket() });
  return null;
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
  if (!isReady(mine)) return `Rosa incompleta: servono almeno ${SQUAD_MIN} giocatori e un portiere`;
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
      p.ovr = clamp(p.ovr + rnd(-2, 3), 38, 95);
      p.goals = 0;
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
