import { FOSSILS } from "@/lib/domain/fossils";
import type { Rarity } from "@/lib/api/types";

export const COLS = 5;
export const ROWS = 7;
export const LAST_FLOOR = 4;

export type Dir = "n" | "s" | "e" | "w";
export type DieKind = "fire" | "ice" | "heal" | "bolt";
export type EnemyKind = "slime" | "skeleton" | "bat" | "wraith" | "golem";
export type PropKind = "chest" | "spikes" | "potion" | "die" | "door";
export type Cell = [number, number];

export interface Tele {
  cells: Cell[];
  dmg: number;
}
export interface Enemy {
  id: number;
  kind: EnemyKind;
  c: number;
  r: number;
  hp: number;
  max: number;
  frozen: number;
  cd: number;
  t: number;
  exh: number;
  tele: Tele | null;
}
export interface Prop {
  id: number;
  kind: PropKind;
  c: number;
  r: number;
  die?: DieKind;
}
export interface Hero {
  c: number;
  r: number;
  hp: number;
  max: number;
  atk: number;
  armor: number;
  slots: number;
  dice: DieKind[];
  guard: boolean;
  guardCd: number;
  guardMax: number;
  vamp: number;
  lucky: boolean;
}
export interface Upgrade {
  id: string;
  name: string;
  text: string;
  icon: string;
}
export type EvKind = "num" | "txt" | "slash" | "slam" | "fire" | "bolt" | "ice" | "heal" | "hurt" | "roll" | "pick" | "win";
export interface Ev {
  id: number;
  k: EvKind;
  c: number;
  r: number;
  v?: number;
  t?: string;
  crit?: boolean;
  foe?: boolean;
  die?: string;
  cells?: Cell[];
}
export interface Game {
  floor: number;
  phase: "play" | "upgrade" | "end";
  over: null | "dead" | "won";
  hero: Hero;
  enemies: Enemy[];
  props: Prop[];
  door: number;
  turn: number;
  kills: number;
  cleared: number;
  nid: number;
  evSeq: number;
  ev: Ev[];
  choices: Upgrade[];
  ups: Record<string, number>;
}
export type Action = { t: "move"; d: Dir } | { t: "guard" } | { t: "die"; i: number };

export const DEF: Record<EnemyKind, { hp: number; dmg: number; name: string }> = {
  slime: { hp: 4, dmg: 2, name: "Slime" },
  skeleton: { hp: 6, dmg: 3, name: "Scheletro" },
  bat: { hp: 3, dmg: 2, name: "Pipistrello" },
  wraith: { hp: 5, dmg: 3, name: "Spettro" },
  golem: { hp: 34, dmg: 0, name: "Golem di pietra" },
};

export const DIE_INFO: Record<DieKind, { name: string; icon: string; text: string; color: string }> = {
  fire: { name: "Dado di fuoco", icon: "🔥", text: "Brucia tutti i nemici nella tua colonna davanti a te (d6+2)", color: "#f97316" },
  ice: { name: "Dado di ghiaccio", icon: "❄️", text: "Congela tutti i nemici per 2 turni (3 con 5 o 6)", color: "#38bdf8" },
  heal: { name: "Dado di cura", icon: "💚", text: "Ti cura di d6+3", color: "#4ade80" },
  bolt: { name: "Dado del fulmine", icon: "⚡", text: "Colpisce fino a 3 nemici a caso (d6+1)", color: "#facc15" },
};

export const FLOOR_NAMES = ["", "Cripta", "Caverna fungina", "Forgia di lava", "Sala del Guardiano"];

const FLOORS: Record<number, EnemyKind[]> = {
  1: ["slime", "slime", "skeleton"],
  2: ["slime", "skeleton", "skeleton", "bat"],
  3: ["skeleton", "bat", "bat", "wraith", "slime"],
  4: ["golem"],
};

const UPGRADES: (Upgrade & { max: number })[] = [
  { id: "hp", name: "Cuore di pietra", text: "+6 vita massima e ti cura di 6", icon: "❤️", max: 9 },
  { id: "atk", name: "Lama affilata", text: "+1 al danno di ogni colpo", icon: "⚔️", max: 9 },
  { id: "slot", name: "Tasca profonda", text: "+1 posto per i dadi speciali", icon: "🎒", max: 2 },
  { id: "vamp", name: "Sete di sangue", text: "Recuperi 2 vita per ogni nemico sconfitto", icon: "🩸", max: 1 },
  { id: "guard", name: "Scudo rapido", text: "La parata si ricarica un turno prima", icon: "🛡️", max: 2 },
  { id: "lucky", name: "Dado fortunato", text: "Se col dado d'attacco tiri 1 o 2, ritiri", icon: "🍀", max: 1 },
  { id: "armor", name: "Armatura", text: "Ogni colpo subito fa 1 danno in meno", icon: "🧱", max: 2 },
  { id: "dice", name: "Scorta di dadi", text: "Ottieni 2 dadi speciali a caso", icon: "🎲", max: 9 },
];

const rnd = (n: number) => Math.floor(Math.random() * n);
const d6 = () => rnd(6) + 1;
const pick = <T>(a: T[]): T => a[rnd(a.length)];
const clone = <T>(x: T): T => structuredClone(x);
const DIE_KINDS: DieKind[] = ["fire", "ice", "heal", "bolt"];
const DC = { n: 0, s: 0, e: 1, w: -1 };
const DR = { n: -1, s: 1, e: 0, w: 0 };

const push = (g: Game, e: Omit<Ev, "id">) => {
  g.ev.push({ ...e, id: ++g.evSeq });
};
const txt = (g: Game, c: number, r: number, t: string) => push(g, { k: "txt", c, r, t });

const enemyAt = (g: Game, c: number, r: number) => g.enemies.find((e) => e.hp > 0 && e.c === c && e.r === r);
const propAt = (g: Game, c: number, r: number) => g.props.find((p) => p.c === c && p.r === r);
const inside = (c: number, r: number) => c >= 0 && c < COLS && r >= 0 && r < ROWS;

const freeCell = (g: Game, c: number, r: number, fly = false) => {
  if (!inside(c, r) || enemyAt(g, c, r) || (g.hero.c === c && g.hero.r === r)) return false;
  const p = propAt(g, c, r);
  if (p && (p.kind === "chest" || p.kind === "door" || (p.kind === "spikes" && !fly))) return false;
  return true;
};

const makeEnemy = (g: Game, kind: EnemyKind, c: number, r: number): Enemy => ({ id: ++g.nid, kind, c, r, hp: DEF[kind].hp, max: DEF[kind].hp, frozen: 0, cd: 0, t: 0, exh: 0, tele: null });

export function genFloor(g: Game) {
  const f = g.floor;
  g.enemies = [];
  g.props = [];
  g.hero.c = 2;
  g.hero.r = ROWS - 1;
  g.hero.guard = false;
  const taken = new Set<string>(["2,6", "2,5", "1,6", "3,6"]);
  const free = (minR: number, maxR: number): Cell | null => {
    for (let i = 0; i < 80; i++) {
      const c = rnd(COLS);
      const r = minR + rnd(maxR - minR + 1);
      if (!taken.has(`${c},${r}`)) {
        taken.add(`${c},${r}`);
        return [c, r];
      }
    }
    return null;
  };
  const prop = (kind: PropKind, cell: Cell | null, die?: DieKind) => {
    if (cell) g.props.push({ id: ++g.nid, kind, c: cell[0], r: cell[1], die });
  };
  if (f === LAST_FLOOR) {
    g.door = -1;
    taken.add("2,1");
    g.enemies.push(makeEnemy(g, "golem", 2, 1));
    prop("potion", free(3, 5));
    prop("die", free(3, 5), pick(DIE_KINDS));
    prop("die", free(3, 5), pick(DIE_KINDS));
    return;
  }
  g.door = rnd(COLS);
  taken.add(`${g.door},0`);
  g.props.push({ id: ++g.nid, kind: "door", c: g.door, r: 0 });
  FLOORS[f].forEach((k) => {
    const cell = free(1, 4);
    if (cell) g.enemies.push(makeEnemy(g, k, cell[0], cell[1]));
  });
  for (let i = 0; i < 1 + f; i++) prop("spikes", free(2, 5));
  prop("chest", free(1, 5));
  prop("die", free(1, 5), pick(DIE_KINDS));
  if (f > 1) prop("die", free(1, 5), pick(DIE_KINDS));
  if (f > 1) prop("potion", free(2, 5));
}

export function newRun(): Game {
  const g: Game = {
    floor: 1,
    phase: "play",
    over: null,
    hero: { c: 2, r: ROWS - 1, hp: 24, max: 24, atk: 0, armor: 0, slots: 3, dice: ["heal"], guard: false, guardCd: 0, guardMax: 3, vamp: 0, lucky: false },
    enemies: [],
    props: [],
    door: 0,
    turn: 0,
    kills: 0,
    cleared: 0,
    nid: 0,
    evSeq: 0,
    ev: [],
    choices: [],
    ups: {},
  };
  genFloor(g);
  return g;
}

const dropDie = (g: Game, c: number, r: number) => {
  if (!propAt(g, c, r) && Math.random() < 0.3) g.props.push({ id: ++g.nid, kind: "die", c, r, die: pick(DIE_KINDS) });
};

const kill = (g: Game, e: Enemy) => {
  g.kills++;
  txt(g, e.c, e.r, e.kind === "golem" ? "Distrutto!" : "Sconfitto!");
  if (g.hero.vamp && g.hero.hp > 0) {
    g.hero.hp = Math.min(g.hero.max, g.hero.hp + g.hero.vamp);
    push(g, { k: "heal", c: g.hero.c, r: g.hero.r, v: g.hero.vamp });
  }
  if (e.kind === "golem") {
    g.cleared = LAST_FLOOR;
    g.over = "won";
    g.phase = "end";
    push(g, { k: "win", c: e.c, r: e.r });
    return;
  }
  dropDie(g, e.c, e.r);
};

const hitEnemy = (g: Game, e: Enemy, dmg: number, crit = false, kind: EvKind = "slash") => {
  if (e.hp <= 0) return;
  e.hp -= dmg;
  push(g, { k: kind, c: e.c, r: e.r });
  push(g, { k: "num", c: e.c, r: e.r, v: dmg, crit, foe: true });
  if (e.hp <= 0) kill(g, e);
};

const hurt = (g: Game, dmg: number, src?: Enemy) => {
  const h = g.hero;
  if (g.over) return;
  if (h.guard) {
    txt(g, h.c, h.r, "Parata!");
    if (src && src.hp > 0) hitEnemy(g, src, 2);
    return;
  }
  const v = Math.max(1, dmg - h.armor);
  h.hp -= v;
  push(g, { k: "num", c: h.c, r: h.r, v });
  push(g, { k: "hurt", c: h.c, r: h.r });
  if (h.hp <= 0) {
    h.hp = 0;
    g.over = "dead";
    g.phase = "end";
  }
};

const melee = (g: Game, e: Enemy) => {
  const h = g.hero;
  const first = d6();
  let v = first;
  if (h.lucky && v <= 2) v = d6();
  push(g, { k: "roll", c: h.c, r: h.r, die: "d6", v, t: v !== first ? "rilancio" : undefined });
  const crit = v === 6;
  let dmg = v + h.atk;
  if (crit) dmg *= 2;
  if (e.exh > 0) {
    dmg += 3;
    txt(g, e.c, e.r, "Punto debole!");
  }
  hitEnemy(g, e, dmg, crit);
};

const giveDie = (g: Game, k: DieKind) => {
  const h = g.hero;
  if (h.dice.length >= h.slots) {
    txt(g, h.c, h.r, "Tasche piene");
    return false;
  }
  h.dice.push(k);
  push(g, { k: "pick", c: h.c, r: h.r, t: DIE_INFO[k].icon });
  return true;
};

const heal = (g: Game, n: number) => {
  const h = g.hero;
  const v = Math.min(n, h.max - h.hp);
  h.hp += v;
  push(g, { k: "heal", c: h.c, r: h.r, v });
};

type Res = "invalid" | "msg" | "used";

const openChest = (g: Game, p: Prop) => {
  g.props = g.props.filter((x) => x !== p);
  const v = d6();
  push(g, { k: "roll", c: p.c, r: p.r, die: "d6", v, t: "forziere" });
  if (v >= 6) {
    g.hero.atk++;
    txt(g, p.c, p.r, "+1 attacco!");
    giveDie(g, pick(DIE_KINDS));
  } else if (v >= 4) {
    heal(g, 8);
    giveDie(g, pick(DIE_KINDS));
  } else {
    giveDie(g, pick(DIE_KINDS));
  }
};

const doMove = (g: Game, d: Dir): Res => {
  const h = g.hero;
  const nc = h.c + DC[d];
  const nr = h.r + DR[d];
  if (!inside(nc, nr)) return "invalid";
  const e = enemyAt(g, nc, nr);
  if (e) {
    melee(g, e);
    return "used";
  }
  const p = propAt(g, nc, nr);
  if (p?.kind === "chest") {
    openChest(g, p);
    return "used";
  }
  if (p?.kind === "door") {
    if (g.enemies.some((x) => x.hp > 0)) {
      txt(g, nc, nr, "Sigillata!");
      return "msg";
    }
    g.cleared = g.floor;
    h.hp = Math.min(h.max, h.hp + 4);
    g.phase = "upgrade";
    g.choices = rollChoices(g);
    return "used";
  }
  h.c = nc;
  h.r = nr;
  if (p?.kind === "spikes") {
    const v = Math.max(1, 3 - h.armor);
    h.hp -= v;
    push(g, { k: "num", c: nc, r: nr, v });
    push(g, { k: "hurt", c: nc, r: nr });
    if (h.hp <= 0) {
      h.hp = 0;
      g.over = "dead";
      g.phase = "end";
    }
  } else if (p?.kind === "potion") {
    g.props = g.props.filter((x) => x !== p);
    heal(g, 6);
  } else if (p?.kind === "die" && p.die) {
    if (giveDie(g, p.die)) g.props = g.props.filter((x) => x !== p);
  }
  return "used";
};

const doGuard = (g: Game): Res => {
  const h = g.hero;
  if (h.guardCd > 0) {
    txt(g, h.c, h.r, "In ricarica");
    return "msg";
  }
  h.guard = true;
  h.guardCd = h.guardMax;
  txt(g, h.c, h.r, "Scudo alzato");
  return "used";
};

const doDie = (g: Game, i: number): Res => {
  const h = g.hero;
  const k = h.dice[i];
  if (!k) return "invalid";
  h.dice.splice(i, 1);
  const v = d6();
  push(g, { k: "roll", c: h.c, r: h.r, die: k, v });
  const alive = g.enemies.filter((e) => e.hp > 0);
  if (k === "heal") heal(g, v + 3);
  if (k === "ice") {
    push(g, { k: "ice", c: h.c, r: h.r });
    alive.forEach((e) => {
      e.frozen = e.kind === "golem" ? (v >= 5 ? 2 : 1) : v >= 5 ? 3 : 2;
      e.tele = null;
      txt(g, e.c, e.r, "Congelato");
    });
  }
  if (k === "fire") {
    const cells: Cell[] = [];
    for (let r = 0; r < h.r; r++) cells.push([h.c, r]);
    push(g, { k: "fire", c: h.c, r: h.r, cells });
    alive.filter((e) => e.c === h.c && e.r < h.r).forEach((e) => hitEnemy(g, e, v + 2, false, "fire"));
  }
  if (k === "bolt") {
    const pool = [...alive];
    for (let n = 0; n < 3 && pool.length; n++) {
      const e = pool.splice(rnd(pool.length), 1)[0];
      hitEnemy(g, e, v + 1, false, "bolt");
    }
  }
  return "used";
};

const step = (g: Game, e: Enemy, fly = false): boolean => {
  const h = g.hero;
  const dr = h.r - e.r;
  const dc = h.c - e.c;
  const vert = Math.abs(dr) > Math.abs(dc) || (Math.abs(dr) === Math.abs(dc) && Math.random() < 0.5);
  const opts: Cell[] = vert ? [[e.c, e.r + Math.sign(dr)], [e.c + Math.sign(dc), e.r]] : [[e.c + Math.sign(dc), e.r], [e.c, e.r + Math.sign(dr)]];
  for (const [c, r] of opts) {
    if ((c !== e.c || r !== e.r) && freeCell(g, c, r, fly)) {
      e.c = c;
      e.r = r;
      return true;
    }
  }
  return false;
};

const wander = (g: Game, e: Enemy, fly = false) => {
  const opts = (
    [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as Cell[]
  ).filter(([a, b]) => freeCell(g, e.c + a, e.r + b, fly));
  if (!opts.length) return false;
  const [a, b] = pick(opts);
  e.c += a;
  e.r += b;
  return true;
};

const adjacent = (g: Game, e: Enemy) => Math.abs(g.hero.c - e.c) + Math.abs(g.hero.r - e.r) === 1;
const rowCells = (r: number): Cell[] => Array.from({ length: COLS }, (_, c) => [c, r]);
const colCells = (c: number): Cell[] => Array.from({ length: ROWS }, (_, r) => [c, r]);
const checker = (par: number): Cell[] => {
  const out: Cell[] = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if ((c + r) % 2 === par) out.push([c, r]);
  return out;
};

const fireTele = (g: Game, e: Enemy) => {
  const t = e.tele;
  if (!t) return;
  push(g, { k: "slam", c: e.c, r: e.r, cells: t.cells });
  if (t.cells.some(([c, r]) => c === g.hero.c && r === g.hero.r)) hurt(g, t.dmg);
  e.tele = null;
  if (e.kind === "golem") e.exh = 1;
};

const bossTurn = (g: Game, e: Enemy) => {
  const h = g.hero;
  if (e.exh > 0) {
    e.exh = 0;
    return;
  }
  const rage = e.hp <= e.max / 2;
  e.t++;
  if (e.t % (rage ? 2 : 3) === 0) {
    const spots: Cell[] = [];
    for (let r = 1; r <= 3; r++) for (let c = 0; c < COLS; c++) if (freeCell(g, c, r)) spots.push([c, r]);
    for (let n = 0; n < 2 && spots.length; n++) {
      const [c, r] = spots.splice(rnd(spots.length), 1)[0];
      g.enemies.push(makeEnemy(g, "slime", c, r));
    }
    txt(g, e.c, e.r, "Evoca!");
    return;
  }
  if (rage) e.tele = { cells: checker((h.c + h.r) % 2), dmg: 6 };
  else e.tele = { cells: e.t % 2 === 1 ? rowCells(h.r) : colCells(h.c), dmg: 6 };
  txt(g, e.c, e.r, rage ? "Scacchiera!" : e.t % 2 === 1 ? "Spazzata!" : "Colonna!");
};

const enemyTurn = (g: Game, e: Enemy) => {
  const dmg = DEF[e.kind].dmg;
  if (e.kind === "golem") return bossTurn(g, e);
  if (e.kind === "slime") {
    if (adjacent(g, e)) hurt(g, dmg, e);
    else if (e.cd === 0) {
      step(g, e);
      e.cd = 1;
    } else e.cd = 0;
    return;
  }
  if (e.kind === "skeleton") {
    if (adjacent(g, e)) hurt(g, dmg, e);
    else step(g, e);
    return;
  }
  if (e.kind === "bat") {
    for (let n = 0; n < 2 && !g.over && e.hp > 0; n++) {
      if (adjacent(g, e)) {
        hurt(g, dmg, e);
        break;
      }
      if (Math.random() < 0.25) wander(g, e, true);
      else step(g, e, true);
    }
    return;
  }
  if (adjacent(g, e)) {
    hurt(g, dmg, e);
    return;
  }
  if (e.cd > 0) {
    e.cd--;
    wander(g, e);
    return;
  }
  const h = g.hero;
  e.tele = { cells: Math.random() < 0.5 ? colCells(h.c) : rowCells(h.r), dmg: 4 };
  e.cd = 2;
  txt(g, e.c, e.r, "Mira!");
};

const enemyPhase = (g: Game) => {
  for (const e of [...g.enemies].sort((a, b) => a.id - b.id)) {
    if (g.over || g.phase !== "play") return;
    if (e.hp <= 0) continue;
    if (e.frozen > 0) {
      e.frozen--;
      e.tele = null;
      continue;
    }
    if (e.tele) fireTele(g, e);
    else enemyTurn(g, e);
  }
};

export function act(g0: Game, a: Action): Game | null {
  if (g0.phase !== "play") return null;
  const g = clone(g0);
  g.ev = [];
  g.hero.guard = false;
  const res = a.t === "move" ? doMove(g, a.d) : a.t === "guard" ? doGuard(g) : doDie(g, a.i);
  if (res === "invalid") return null;
  g.enemies = g.enemies.filter((e) => e.hp > 0);
  if (res === "msg" || g.phase !== "play") return g;
  enemyPhase(g);
  g.enemies = g.enemies.filter((e) => e.hp > 0);
  g.turn++;
  if (g.hero.guardCd > 0) g.hero.guardCd--;
  return g;
}

function rollChoices(g: Game): Upgrade[] {
  const ok = UPGRADES.filter((u) => (g.ups[u.id] ?? 0) < u.max && !(u.id === "guard" && g.hero.guardMax <= 1));
  const out: Upgrade[] = [];
  while (out.length < 3 && ok.length) {
    const [u] = ok.splice(rnd(ok.length), 1);
    out.push({ id: u.id, name: u.name, text: u.text, icon: u.icon });
  }
  return out;
}

export function chooseUpgrade(g0: Game, id: string): Game | null {
  if (g0.phase !== "upgrade" || !g0.choices.some((c) => c.id === id)) return null;
  const g = clone(g0);
  const h = g.hero;
  g.ups[id] = (g.ups[id] ?? 0) + 1;
  if (id === "hp") {
    h.max += 6;
    h.hp = Math.min(h.max, h.hp + 6);
  }
  if (id === "atk") h.atk++;
  if (id === "slot") h.slots++;
  if (id === "vamp") h.vamp = 2;
  if (id === "guard") h.guardMax = Math.max(1, h.guardMax - 1);
  if (id === "lucky") h.lucky = true;
  if (id === "armor") h.armor++;
  if (id === "dice") for (let i = 0; i < 2; i++) if (h.dice.length < h.slots) h.dice.push(pick(DIE_KINDS));
  g.floor++;
  g.phase = "play";
  g.choices = [];
  g.ev = [];
  h.guardCd = 0;
  genFloor(g);
  return g;
}

const ODDS: Record<Rarity, number> = { comune: 52, non_comune: 28, raro: 14, epico: 4.5, leggendario: 1.2, mitico: 0.3 };
const RARITIES: Rarity[] = ["comune", "non_comune", "raro", "epico", "leggendario", "mitico"];

export interface Loot {
  id: string;
  integrity: number;
}

export const lootCount = (g: Game, roll: number) => {
  if (g.cleared < 1) return 0;
  return 1 + (g.cleared >= 3 ? 1 : 0) + (g.over === "won" ? 1 : 0) + (roll >= 5 ? 1 : 0);
};

export function rollLoot(g: Game, roll: number): Loot[] {
  const boost = 0.08 * g.cleared + 0.06 * (roll - 1) + (g.over === "won" ? 0.25 : 0);
  const w = (r: Rarity) => ODDS[r] * Math.pow(1 + boost, RARITIES.indexOf(r));
  const total = RARITIES.reduce((s, r) => s + w(r), 0);
  return Array.from({ length: lootCount(g, roll) }, () => {
    let x = Math.random() * total;
    const rarity = RARITIES.find((r) => (x -= w(r)) <= 0) ?? "comune";
    const sp = pick(FOSSILS.filter((f) => f.rarity === rarity));
    const base = g.over === "won" ? 80 : 60;
    return { id: sp.id, integrity: Math.min(100, Math.round(base + Math.random() * (g.over === "won" ? 20 : 40))) };
  });
}

export const d6roll = d6;

const KEY = "studium-dungeon";
export interface DungeonRecord {
  best: number;
  wins: number;
  runs: number;
}
export const loadRecord = (): DungeonRecord => {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<DungeonRecord>;
    return { best: p.best ?? 0, wins: p.wins ?? 0, runs: p.runs ?? 0 };
  } catch {
    return { best: 0, wins: 0, runs: 0 };
  }
};
export const saveRecord = (g: Game): DungeonRecord => {
  const r = loadRecord();
  const next = { best: Math.max(r.best, g.cleared), wins: r.wins + (g.over === "won" ? 1 : 0), runs: r.runs + 1 };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage non disponibile */
  }
  return next;
};
