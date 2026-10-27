import { parseParams, SPEC_BY_OP } from "./spec";
import type { Arg, SBlock, ScratchProject, SpriteDef, SpriteView, View } from "./types";

export type Val = string | number | boolean;

export interface Host {
  sound: (name: string) => void;
  tone: (note: number, secs: number) => void;
  end: (percent: number) => void;
}

export const STEP = 1 / 30;
export const STAGE_W = 480;
export const STAGE_H = 360;
const MAX_CLONES = 120;
const MAX_DEPTH = 40;

class Stop extends Error {}

interface Inst {
  uid: number;
  def: SpriteDef;
  clone: boolean;
  x: number;
  y: number;
  dir: number;
  size: number;
  visible: boolean;
  costume: number;
  opacity: number;
  z: number;
  say: { text: string; token: number } | null;
  locals: Record<string, Val>;
  lists: Record<string, Val[]>;
}

interface Thread {
  id: number;
  inst: Inst;
  key: string;
  gen: Generator<void, void, void>;
  done: boolean;
  dead: boolean;
}

interface Ctx {
  t: Thread;
  inst: Inst;
  params: Record<string, Val>;
  depth: number;
}

type Gen = Generator<void, void, void>;

export const num = (v: Val | undefined): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v === undefined) return 0;
  const n = Number(String(v).trim().replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export const str = (v: Val | undefined): string => {
  if (v === undefined) return "";
  if (typeof v === "number") return String(Math.round(v * 1e9) / 1e9);
  return String(v);
};

export const bool = (v: Val | undefined): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (v === undefined) return false;
  const s = String(v).trim().toLowerCase();
  return s !== "" && s !== "0" && s !== "false";
};

const isNumeric = (v: Val): boolean => typeof v === "number" || typeof v === "boolean" || (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v.trim().replace(",", "."))));

const compare = (a: Val, b: Val): number => {
  if (isNumeric(a) && isNumeric(b)) return num(a) - num(b);
  const x = str(a).toLowerCase();
  const y = str(b).toLowerCase();
  return x < y ? -1 : x > y ? 1 : 0;
};

const wrapDir = (d: number) => {
  let r = d % 360;
  if (r > 180) r -= 360;
  if (r <= -180) r += 360;
  return r;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const normalizeKey = (key: string): string => {
  if (key === " ") return "space";
  if (key === "ArrowUp") return "up";
  if (key === "ArrowDown") return "down";
  if (key === "ArrowLeft") return "left";
  if (key === "ArrowRight") return "right";
  if (key.length === 1) return key.toLowerCase();
  return "";
};

const halfOf = (i: Inst) => (24 * i.size) / 100;

export class Runtime {
  project: ScratchProject;
  host: Host;
  time = 0;
  running = false;
  ended = false;
  score = 0;
  lives = 0;
  backdrop = 0;
  asking: string | null = null;
  keys = new Set<string>();
  mouse = { x: 0, y: 0, down: false };

  private insts: Inst[] = [];
  private threads: Thread[] = [];
  private globals: Record<string, Val> = {};
  private globalLists: Record<string, Val[]> = {};
  private shown = new Set<string>();
  private scopes: Record<string, string> = {};
  private listScopes: Record<string, string> = {};
  private whenPrev = new Map<string, boolean>();
  private nextUid = 1;
  private nextThread = 1;
  private nextSay = 1;
  private zTop = 1;
  private timerStart = 0;
  private answerValue = "";
  private answerReady = false;

  constructor(project: ScratchProject, host: Host) {
    this.project = project;
    this.host = host;
    this.reset();
  }

  private reset() {
    const p = this.project;
    this.time = 0;
    this.timerStart = 0;
    this.ended = false;
    this.score = 0;
    this.lives = p.settings.lives;
    this.backdrop = 0;
    this.asking = null;
    this.answerReady = false;
    this.keys.clear();
    this.threads = [];
    this.whenPrev.clear();
    this.globals = {};
    this.globalLists = {};
    this.shown = new Set();
    this.scopes = {};
    this.listScopes = {};
    this.zTop = 1;
    this.nextUid = 1;
    for (const v of p.vars) {
      this.scopes[v.id] = v.scope;
      if (v.scope === "all") this.globals[v.id] = v.initial;
      if (v.shown) this.shown.add(v.id);
    }
    for (const l of p.lists) {
      this.listScopes[l.id] = l.scope;
      if (l.scope === "all") this.globalLists[l.id] = [];
    }
    this.insts = p.sprites.map((def, i) => {
      const locals: Record<string, Val> = {};
      for (const v of p.vars) if (v.scope === def.id) locals[v.id] = v.initial;
      const lists: Record<string, Val[]> = {};
      for (const l of p.lists) if (l.scope === def.id) lists[l.id] = [];
      return {
        uid: this.nextUid++,
        def,
        clone: false,
        x: def.x,
        y: def.y,
        dir: def.dir,
        size: def.size,
        visible: def.visible,
        costume: 0,
        opacity: 100,
        z: i,
        say: null,
        locals,
        lists,
      };
    });
    this.zTop = this.insts.length;
  }

  start() {
    this.reset();
    this.running = true;
    for (const inst of [...this.insts]) {
      for (const sc of inst.def.scripts) {
        if (sc.blocks[0]?.op === "evt_flag") this.spawn(inst, sc.id, sc.blocks);
      }
    }
  }

  stopAll() {
    this.threads.forEach((t) => (t.dead = true));
    this.threads = [];
    this.running = false;
  }

  percent() {
    const goal = Math.max(1, this.project.settings.goal);
    return clamp(Math.round((this.score / goal) * 100), 0, 100);
  }

  endGame() {
    if (this.ended) return;
    this.ended = true;
    this.running = false;
    this.asking = null;
    this.threads.forEach((t) => (t.dead = true));
    this.host.end(this.percent());
  }

  submitAnswer(text: string) {
    if (this.asking === null) return;
    this.answerValue = text;
    this.answerReady = true;
  }

  keyDown(raw: string) {
    const key = normalizeKey(raw);
    if (!key || !this.running) return;
    const fresh = !this.keys.has(key);
    this.keys.add(key);
    if (!fresh) return;
    for (const inst of [...this.insts]) {
      for (const sc of inst.def.scripts) {
        const h = sc.blocks[0];
        if (h?.op === "evt_key" && (h.args.key === key || h.args.key === "any")) this.spawn(inst, sc.id, sc.blocks);
      }
    }
  }

  keyUp(raw: string) {
    const key = normalizeKey(raw);
    if (key) this.keys.delete(key);
  }

  pointer(x: number, y: number, down: boolean) {
    this.mouse = { x: clamp(x, -STAGE_W / 2, STAGE_W / 2), y: clamp(y, -STAGE_H / 2, STAGE_H / 2), down };
  }

  click(x: number, y: number) {
    if (!this.running) return;
    const hit = [...this.insts]
      .filter((i) => i.visible && Math.abs(x - i.x) <= halfOf(i) && Math.abs(y - i.y) <= halfOf(i))
      .sort((a, b) => b.z - a.z)[0];
    if (hit) {
      for (const sc of hit.def.scripts) if (sc.blocks[0]?.op === "evt_click") this.spawn(hit, sc.id, sc.blocks);
      return;
    }
    for (const inst of [...this.insts]) {
      for (const sc of inst.def.scripts) if (sc.blocks[0]?.op === "evt_stage") this.spawn(inst, sc.id, sc.blocks);
    }
  }

  tick() {
    if (!this.running || this.ended) return;
    this.time += STEP;
    const limit = this.project.settings.time;
    if (limit > 0 && this.time >= limit) {
      this.endGame();
      return;
    }
    this.checkWhen();
    for (const t of [...this.threads]) {
      if (t.done) continue;
      if (t.dead) {
        t.done = true;
        continue;
      }
      try {
        const r = t.gen.next();
        if (r.done) t.done = true;
      } catch {
        t.done = true;
      }
      if (this.ended) break;
    }
    this.threads = this.threads.filter((t) => !t.done);
  }

  view(): View {
    const p = this.project;
    const sprites: SpriteView[] = [...this.insts]
      .sort((a, b) => a.z - b.z)
      .map((i) => ({
        key: i.uid,
        defId: i.def.id,
        emoji: i.def.costumes[i.costume] ?? i.def.costumes[0] ?? "❓",
        x: i.x,
        y: i.y,
        size: i.size,
        dir: i.dir,
        rotation: i.def.rotation,
        visible: i.visible,
        opacity: i.opacity,
        say: i.say && i.say.text ? i.say.text : null,
        z: i.z,
        clone: i.clone,
      }));
    const vars = p.vars
      .filter((v) => this.shown.has(v.id))
      .map((v) => {
        const value = v.scope === "all" ? this.globals[v.id] : this.insts.find((i) => i.def.id === v.scope && !i.clone)?.locals[v.id];
        return { name: v.name, value: str(value) };
      });
    const limit = p.settings.time;
    return {
      sprites,
      backdrop: this.backdrop,
      vars,
      asking: this.asking,
      ended: this.ended,
      score: this.score,
      lives: this.lives,
      timeLeft: limit > 0 ? Math.max(0, limit - this.time) : null,
      percent: this.percent(),
    };
  }

  private spawn(inst: Inst, scriptId: string, blocks: SBlock[]): Thread {
    const key = `${inst.uid}:${scriptId}`;
    for (const t of this.threads) if (t.key === key) t.dead = true;
    const thread = { id: this.nextThread++, inst, key, done: false, dead: false } as Thread;
    thread.gen = this.runScript({ t: thread, inst, params: {}, depth: 0 }, blocks.slice(1));
    this.threads.push(thread);
    return thread;
  }

  private *runScript(c: Ctx, body: SBlock[]): Gen {
    try {
      yield* this.exec(c, body);
    } catch (e) {
      if (!(e instanceof Stop)) throw e;
    }
  }

  private checkWhen() {
    for (const inst of [...this.insts]) {
      for (const sc of inst.def.scripts) {
        const h = sc.blocks[0];
        if (h?.op !== "evt_when") continue;
        const key = `${inst.uid}:${sc.id}`;
        const probe = { t: { dead: false } as Thread, inst, params: {}, depth: 0 };
        const now = bool(this.ev(probe, h.args.cond));
        const before = this.whenPrev.get(key) ?? false;
        this.whenPrev.set(key, now);
        if (now && !before) this.spawn(inst, sc.id, sc.blocks);
      }
    }
  }

  private broadcast(msg: string): Thread[] {
    const out: Thread[] = [];
    if (!msg) return out;
    for (const inst of [...this.insts]) {
      for (const sc of inst.def.scripts) {
        const h = sc.blocks[0];
        if (h?.op === "evt_receive" && h.args.msg === msg) out.push(this.spawn(inst, sc.id, sc.blocks));
      }
    }
    return out;
  }

  private origin(defId: string): Inst | undefined {
    return this.insts.find((i) => i.def.id === defId && !i.clone) ?? this.insts.find((i) => i.def.id === defId);
  }

  private cloneOf(src: Inst) {
    if (this.insts.length >= MAX_CLONES) return;
    const copy: Inst = {
      ...src,
      uid: this.nextUid++,
      clone: true,
      z: ++this.zTop,
      say: null,
      locals: { ...src.locals },
      lists: Object.fromEntries(Object.entries(src.lists).map(([k, v]) => [k, [...v]])),
    };
    this.insts.push(copy);
    for (const sc of copy.def.scripts) if (sc.blocks[0]?.op === "evt_clone") this.spawn(copy, sc.id, sc.blocks);
  }

  private removeInst(inst: Inst) {
    this.insts = this.insts.filter((i) => i !== inst);
    for (const t of this.threads) if (t.inst === inst) t.dead = true;
  }

  private varGet(c: Ctx, id: string): Val {
    if (this.scopes[id] === "all" || this.scopes[id] === undefined) return this.globals[id] ?? 0;
    return c.inst.locals[id] ?? 0;
  }

  private varSet(c: Ctx, id: string, v: Val) {
    if (!id) return;
    if (this.scopes[id] === "all" || this.scopes[id] === undefined) this.globals[id] = v;
    else c.inst.locals[id] = v;
  }

  private listOf(c: Ctx, id: string): Val[] {
    if (this.listScopes[id] === "all" || this.listScopes[id] === undefined) return (this.globalLists[id] ??= []);
    return (c.inst.lists[id] ??= []);
  }

  private targetPoint(c: Ctx, id: string): { x: number; y: number } | null {
    if (id === "mouse") return { x: this.mouse.x, y: this.mouse.y };
    const o = this.origin(id);
    return o ? { x: o.x, y: o.y } : null;
  }

  private touching(inst: Inst, target: string): boolean {
    if (!inst.visible) return false;
    const h = halfOf(inst);
    if (target === "edge") {
      const k = h * 0.9;
      return inst.x + k >= STAGE_W / 2 || inst.x - k <= -STAGE_W / 2 || inst.y + k >= STAGE_H / 2 || inst.y - k <= -STAGE_H / 2;
    }
    if (target === "mouse") return Math.abs(this.mouse.x - inst.x) <= h && Math.abs(this.mouse.y - inst.y) <= h;
    return this.insts.some((o) => {
      if (o === inst || o.def.id !== target || !o.visible) return false;
      const k = (h + halfOf(o)) * 0.8;
      return Math.abs(o.x - inst.x) < k && Math.abs(o.y - inst.y) < k;
    });
  }

  private bounce(inst: Inst) {
    const h = halfOf(inst) * 0.9;
    const r = (wrapDir(inst.dir) * Math.PI) / 180;
    let dx = Math.sin(r);
    let dy = Math.cos(r);
    const maxX = STAGE_W / 2;
    const maxY = STAGE_H / 2;
    let hit = false;
    if (inst.x + h >= maxX) {
      dx = -Math.abs(dx);
      inst.x = maxX - h;
      hit = true;
    } else if (inst.x - h <= -maxX) {
      dx = Math.abs(dx);
      inst.x = -maxX + h;
      hit = true;
    }
    if (inst.y + h >= maxY) {
      dy = -Math.abs(dy);
      inst.y = maxY - h;
      hit = true;
    } else if (inst.y - h <= -maxY) {
      dy = Math.abs(dy);
      inst.y = -maxY + h;
      hit = true;
    }
    if (hit) inst.dir = wrapDir((Math.atan2(dx, dy) * 180) / Math.PI);
  }

  private place(inst: Inst, x: number, y: number) {
    inst.x = clamp(x, -1000, 1000);
    inst.y = clamp(y, -1000, 1000);
  }

  private *wait(secs: number): Gen {
    const end = this.time + secs;
    yield;
    while (this.time < end) yield;
  }

  private ev(c: Ctx, arg: Arg | undefined): Val {
    if (arg === undefined) return "";
    if (typeof arg === "object") return this.report(c, arg);
    return arg;
  }

  private n(c: Ctx, b: SBlock, key: string) {
    return num(this.ev(c, b.args[key]));
  }

  private s(c: Ctx, b: SBlock, key: string) {
    return str(this.ev(c, b.args[key]));
  }

  private report(c: Ctx, b: SBlock): Val {
    const i = c.inst;
    switch (b.op) {
      case "mot_x":
        return Math.round(i.x * 100) / 100;
      case "mot_y":
        return Math.round(i.y * 100) / 100;
      case "mot_dir":
        return Math.round(i.dir * 100) / 100;
      case "look_costume_num":
        return i.costume + 1;
      case "look_size":
        return Math.round(i.size);
      case "sen_touching":
        return this.touching(i, String(b.args.t));
      case "sen_key": {
        const k = String(b.args.key);
        return k === "any" ? this.keys.size > 0 : this.keys.has(k);
      }
      case "sen_mouse_down":
        return this.mouse.down;
      case "sen_mouse_x":
        return Math.round(this.mouse.x);
      case "sen_mouse_y":
        return Math.round(this.mouse.y);
      case "sen_distance": {
        const p = this.targetPoint(c, String(b.args.t));
        return p ? Math.round(Math.hypot(p.x - i.x, p.y - i.y)) : 0;
      }
      case "sen_answer":
        return this.answerValue;
      case "sen_timer":
        return Math.round((this.time - this.timerStart) * 10) / 10;
      case "op_add":
        return this.n(c, b, "a") + this.n(c, b, "b");
      case "op_sub":
        return this.n(c, b, "a") - this.n(c, b, "b");
      case "op_mul":
        return this.n(c, b, "a") * this.n(c, b, "b");
      case "op_div": {
        const d = this.n(c, b, "b");
        return d === 0 ? 0 : this.n(c, b, "a") / d;
      }
      case "op_mod": {
        const d = this.n(c, b, "b");
        return d === 0 ? 0 : ((this.n(c, b, "a") % d) + d) % d;
      }
      case "op_random": {
        const x = this.n(c, b, "a");
        const y = this.n(c, b, "b");
        const lo = Math.min(x, y);
        const hi = Math.max(x, y);
        return Number.isInteger(x) && Number.isInteger(y) ? Math.floor(Math.random() * (hi - lo + 1)) + lo : Math.random() * (hi - lo) + lo;
      }
      case "op_gt":
        return compare(this.ev(c, b.args.a), this.ev(c, b.args.b)) > 0;
      case "op_lt":
        return compare(this.ev(c, b.args.a), this.ev(c, b.args.b)) < 0;
      case "op_eq":
        return compare(this.ev(c, b.args.a), this.ev(c, b.args.b)) === 0;
      case "op_and":
        return bool(this.ev(c, b.args.a)) && bool(this.ev(c, b.args.b));
      case "op_or":
        return bool(this.ev(c, b.args.a)) || bool(this.ev(c, b.args.b));
      case "op_not":
        return !bool(this.ev(c, b.args.a));
      case "op_join":
        return (this.s(c, b, "a") + this.s(c, b, "b")).slice(0, 500);
      case "op_letter":
        return this.s(c, b, "s").charAt(Math.floor(this.n(c, b, "n")) - 1);
      case "op_len":
        return this.s(c, b, "s").length;
      case "op_contains":
        return this.s(c, b, "a").toLowerCase().includes(this.s(c, b, "b").toLowerCase());
      case "op_round":
        return Math.round(this.n(c, b, "n"));
      case "op_math": {
        const v = this.n(c, b, "n");
        const rad = (v * Math.PI) / 180;
        switch (String(b.args.fn)) {
          case "abs":
            return Math.abs(v);
          case "sqrt":
            return v < 0 ? 0 : Math.sqrt(v);
          case "floor":
            return Math.floor(v);
          case "ceiling":
            return Math.ceil(v);
          case "sin":
            return Math.round(Math.sin(rad) * 1e10) / 1e10;
          case "cos":
            return Math.round(Math.cos(rad) * 1e10) / 1e10;
          case "tan":
            return Math.round(Math.tan(rad) * 1e10) / 1e10;
          case "ln":
            return v <= 0 ? 0 : Math.log(v);
          case "log":
            return v <= 0 ? 0 : Math.log10(v);
          default:
            return 0;
        }
      }
      case "var_get":
        return this.varGet(c, String(b.args.var));
      case "list_item": {
        const l = this.listOf(c, String(b.args.list));
        const idx = Math.floor(this.n(c, b, "i"));
        return idx >= 1 && idx <= l.length ? l[idx - 1] : "";
      }
      case "list_len":
        return this.listOf(c, String(b.args.list)).length;
      case "list_contains": {
        const l = this.listOf(c, String(b.args.list));
        const v = this.ev(c, b.args.v);
        return l.some((x) => compare(x, v) === 0);
      }
      case "proc_param":
        return c.params[String(b.args.name)] ?? 0;
      case "game_score":
        return Math.round(this.score * 100) / 100;
      case "game_lives":
        return this.lives;
      case "game_time": {
        const limit = this.project.settings.time;
        return limit > 0 ? Math.max(0, Math.ceil(limit - this.time)) : 0;
      }
      default:
        return 0;
    }
  }

  private *exec(c: Ctx, blocks: SBlock[]): Gen {
    for (const b of blocks) {
      if (this.ended || c.t.dead) throw new Stop();
      yield* this.command(c, b);
    }
  }

  private *command(c: Ctx, b: SBlock): Gen {
    const i = c.inst;
    switch (b.op) {
      case "evt_broadcast":
        this.broadcast(String(b.args.msg));
        return;
      case "evt_broadcast_wait": {
        const started = this.broadcast(String(b.args.msg));
        yield;
        while (started.some((t) => !t.done)) yield;
        return;
      }
      case "mot_move": {
        const r = (i.dir * Math.PI) / 180;
        const s = this.n(c, b, "n");
        this.place(i, i.x + s * Math.sin(r), i.y + s * Math.cos(r));
        return;
      }
      case "mot_turn_r":
        i.dir = wrapDir(i.dir + this.n(c, b, "n"));
        return;
      case "mot_turn_l":
        i.dir = wrapDir(i.dir - this.n(c, b, "n"));
        return;
      case "mot_goto":
        this.place(i, this.n(c, b, "x"), this.n(c, b, "y"));
        return;
      case "mot_goto_target": {
        const to = String(b.args.to);
        if (to === "random") this.place(i, Math.round(Math.random() * 440 - 220), Math.round(Math.random() * 320 - 160));
        else {
          const p = this.targetPoint(c, to);
          if (p) this.place(i, p.x, p.y);
        }
        return;
      }
      case "mot_glide": {
        const secs = this.n(c, b, "s");
        const x0 = i.x;
        const y0 = i.y;
        const x1 = this.n(c, b, "x");
        const y1 = this.n(c, b, "y");
        if (secs <= 0) {
          this.place(i, x1, y1);
          return;
        }
        const start = this.time;
        yield;
        while (this.time - start < secs) {
          const f = (this.time - start) / secs;
          this.place(i, x0 + (x1 - x0) * f, y0 + (y1 - y0) * f);
          yield;
        }
        this.place(i, x1, y1);
        return;
      }
      case "mot_point":
        i.dir = wrapDir(this.n(c, b, "n"));
        return;
      case "mot_point_towards": {
        const p = this.targetPoint(c, String(b.args.to));
        if (p && (p.x !== i.x || p.y !== i.y)) i.dir = wrapDir((Math.atan2(p.x - i.x, p.y - i.y) * 180) / Math.PI);
        return;
      }
      case "mot_changex":
        this.place(i, i.x + this.n(c, b, "n"), i.y);
        return;
      case "mot_setx":
        this.place(i, this.n(c, b, "n"), i.y);
        return;
      case "mot_changey":
        this.place(i, i.x, i.y + this.n(c, b, "n"));
        return;
      case "mot_sety":
        this.place(i, i.x, this.n(c, b, "n"));
        return;
      case "mot_bounce":
        this.bounce(i);
        return;
      case "look_say_for": {
        const token = this.nextSay++;
        i.say = { text: this.s(c, b, "text").slice(0, 120), token };
        yield* this.wait(this.n(c, b, "s"));
        if (i.say && i.say.token === token) i.say = null;
        return;
      }
      case "look_say":
        i.say = { text: this.s(c, b, "text").slice(0, 120), token: this.nextSay++ };
        return;
      case "look_show":
        i.visible = true;
        return;
      case "look_hide":
        i.visible = false;
        return;
      case "look_costume": {
        const idx = Math.floor(num(String(b.args.c))) - 1;
        i.costume = clamp(idx, 0, Math.max(0, i.def.costumes.length - 1));
        return;
      }
      case "look_next_costume":
        i.costume = (i.costume + 1) % Math.max(1, i.def.costumes.length);
        return;
      case "look_backdrop": {
        const idx = Math.floor(num(String(b.args.b))) - 1;
        this.backdrop = clamp(idx, 0, Math.max(0, this.project.backdrops.length - 1));
        return;
      }
      case "look_next_backdrop":
        this.backdrop = (this.backdrop + 1) % Math.max(1, this.project.backdrops.length);
        return;
      case "look_size_set":
        i.size = clamp(this.n(c, b, "n"), 5, 500);
        return;
      case "look_size_change":
        i.size = clamp(i.size + this.n(c, b, "n"), 5, 500);
        return;
      case "look_opacity":
        i.opacity = clamp(this.n(c, b, "n"), 0, 100);
        return;
      case "look_front":
        i.z = ++this.zTop;
        return;
      case "snd_play":
        this.host.sound(String(b.args.sound));
        return;
      case "snd_tone": {
        const secs = clamp(this.n(c, b, "s"), 0, 5);
        this.host.tone(this.n(c, b, "n"), secs);
        yield* this.wait(secs);
        return;
      }
      case "ctl_wait":
        yield* this.wait(Math.max(0, this.n(c, b, "s")));
        return;
      case "ctl_repeat": {
        const times = Math.min(100000, Math.floor(this.n(c, b, "n")));
        for (let k = 0; k < times; k++) {
          yield* this.exec(c, b.stacks?.a ?? []);
          yield;
        }
        return;
      }
      case "ctl_forever":
        while (true) {
          yield* this.exec(c, b.stacks?.a ?? []);
          yield;
        }
      case "ctl_if":
        if (bool(this.ev(c, b.args.cond))) yield* this.exec(c, b.stacks?.a ?? []);
        return;
      case "ctl_ifelse":
        yield* this.exec(c, bool(this.ev(c, b.args.cond)) ? (b.stacks?.a ?? []) : (b.stacks?.b ?? []));
        return;
      case "ctl_wait_until":
        while (!bool(this.ev(c, b.args.cond))) yield;
        return;
      case "ctl_repeat_until":
        while (!bool(this.ev(c, b.args.cond))) {
          yield* this.exec(c, b.stacks?.a ?? []);
          yield;
        }
        return;
      case "ctl_for": {
        const from = Math.floor(this.n(c, b, "from"));
        const to = Math.floor(this.n(c, b, "to"));
        const step = from <= to ? 1 : -1;
        const id = String(b.args.var);
        let guard = 0;
        for (let k = from; step > 0 ? k <= to : k >= to; k += step) {
          if (++guard > 100000) break;
          this.varSet(c, id, k);
          yield* this.exec(c, b.stacks?.a ?? []);
          yield;
        }
        return;
      }
      case "ctl_stop": {
        const what = String(b.args.what);
        if (what === "all") {
          this.endGame();
          throw new Stop();
        }
        if (what === "others") {
          for (const t of this.threads) if (t !== c.t && t.inst === i) t.dead = true;
          return;
        }
        throw new Stop();
      }
      case "ctl_clone": {
        const who = String(b.args.who);
        const src = who === "_myself_" ? i : this.origin(who);
        if (src) this.cloneOf(src);
        return;
      }
      case "ctl_clone_delete":
        if (i.clone) {
          this.removeInst(i);
          throw new Stop();
        }
        return;
      case "sen_ask": {
        this.asking = this.s(c, b, "q") || "?";
        this.answerReady = false;
        yield;
        while (!this.answerReady && !this.ended) yield;
        this.asking = null;
        return;
      }
      case "sen_timer_reset":
        this.timerStart = this.time;
        return;
      case "var_set":
        this.varSet(c, String(b.args.var), this.ev(c, b.args.v));
        return;
      case "var_change": {
        const id = String(b.args.var);
        this.varSet(c, id, num(this.varGet(c, id)) + this.n(c, b, "v"));
        return;
      }
      case "var_show":
        this.shown.add(String(b.args.var));
        return;
      case "var_hide":
        this.shown.delete(String(b.args.var));
        return;
      case "list_add": {
        const l = this.listOf(c, String(b.args.list));
        if (l.length < 500) l.push(this.ev(c, b.args.v));
        return;
      }
      case "list_delete": {
        const l = this.listOf(c, String(b.args.list));
        const raw = this.ev(c, b.args.i);
        if (typeof raw === "string" && ["tutto", "all"].includes(raw.trim().toLowerCase())) l.length = 0;
        else {
          const idx = Math.floor(num(raw));
          if (idx >= 1 && idx <= l.length) l.splice(idx - 1, 1);
        }
        return;
      }
      case "list_insert": {
        const l = this.listOf(c, String(b.args.list));
        const idx = Math.floor(this.n(c, b, "i"));
        if (idx >= 1 && idx <= l.length + 1 && l.length < 500) l.splice(idx - 1, 0, this.ev(c, b.args.v));
        return;
      }
      case "list_replace": {
        const l = this.listOf(c, String(b.args.list));
        const idx = Math.floor(this.n(c, b, "i"));
        if (idx >= 1 && idx <= l.length) l[idx - 1] = this.ev(c, b.args.v);
        return;
      }
      case "list_clear":
        this.listOf(c, String(b.args.list)).length = 0;
        return;
      case "proc_call": {
        if (c.depth >= MAX_DEPTH) throw new Stop();
        const def = c.inst.def.scripts.find((s) => s.blocks[0]?.id === String(b.args.proc))?.blocks[0];
        if (!def) return;
        const names = parseParams(String(def.args.params ?? ""));
        const params: Record<string, Val> = {};
        names.forEach((name, k) => {
          params[name] = this.ev(c, b.args[`a${k}`]);
        });
        const body = c.inst.def.scripts.find((s) => s.blocks[0]?.id === def.id)!.blocks.slice(1);
        yield* this.exec({ t: c.t, inst: i, params, depth: c.depth + 1 }, body);
        return;
      }
      case "game_change_score":
        this.score += this.n(c, b, "n");
        return;
      case "game_set_score":
        this.score = this.n(c, b, "n");
        return;
      case "game_change_lives":
        this.lives += this.n(c, b, "n");
        if (this.project.settings.lives > 0 && this.lives <= 0) {
          this.lives = 0;
          this.endGame();
          throw new Stop();
        }
        return;
      case "game_end":
        this.endGame();
        throw new Stop();
      default:
        if (SPEC_BY_OP[b.op]?.shape === "hat") return;
        return;
    }
  }
}
