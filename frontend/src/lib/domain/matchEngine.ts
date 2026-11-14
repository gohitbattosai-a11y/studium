import { FORMATIONS, lineup, strength, type Fixture, type LogEntry, type LogType, type Pos, type Team } from "@/lib/domain/football";
import { CFG } from "@/lib/domain/stadiumConfig";

export const PITCH_L = 105;
export const PITCH_W = 68;
const MY = PITCH_W / 2;
const GOAL_HALF = 3.66;
const HALF_MIN = 45;
const GAME_MIN = 90;
const ATTACK_LEAD = CFG.match.attackLead;
const FOUL_LEAD = 4.5;

type Side = 0 | 1;
type Mode = "kickoff" | "open" | "flight" | "shot" | "return" | "celebrate" | "restart" | "foul" | "interval" | "end";
type ShotKind = "goal" | "save" | "post" | "wide" | "over";

interface Ref {
  s: Side;
  i: number;
}
interface Pt {
  x: number;
  y: number;
}
interface Run extends Pt {
  until: number;
}
interface Dive {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t0: number;
  dur: number;
  until: number;
}
interface Seg {
  x0: number;
  y0: number;
  z0: number;
  x1: number;
  y1: number;
  z1: number;
  t0: number;
  dur: number;
  h: number;
  ease: number;
  end: () => void;
}
interface Beat {
  e: LogEntry;
  side: Side;
  kind: "attack" | "foul";
  T: number;
  startT: number;
  done: boolean;
}
interface Act {
  k: "pass" | "shoot" | "dribble" | "cross" | "wall";
  to: number;
  x: number;
  y: number;
  speed: number;
  h: number;
  hold: number;
  bx: number;
  by: number;
}
type Tac = "wing" | "combo" | "dribble" | "through" | "long";
type How = "foot" | "head";
interface Plan {
  beat: Beat;
  acts: Act[];
  spot: Pt;
  shooter: number;
  tac: Tac;
  how: How;
  waiting: boolean;
  since: number;
}
interface Shot {
  beat: Beat;
  kind: ShotKind;
  ty: number;
  shooter: number;
  side: Side;
  tac: Tac;
  how: How;
}
interface Drib {
  s: Side;
  i: number;
  x: number;
  y: number;
  until: number;
  win: boolean;
  victim: number;
  beat: boolean;
}
interface Steal {
  s: Side;
  i: number;
  since: number;
}
interface Foul {
  beat: Beat;
  victim: number;
  booked: number;
  since: number;
  vs: Side;
}

export interface Footballer extends Pt {
  vx: number;
  vy: number;
  h: number;
  n: number;
  name: string;
  pos: Pos;
  d: number;
  hy: number;
  dri: number;
  dif: number;
  speed: number;
  run: Run | null;
  dive: Dive | null;
}

export interface FeedItem {
  id: number;
  min: number;
  type: LogType;
  teamId: string;
  player: string;
  text: string;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
const wrap = (a: number) => {
  let v = a;
  while (v > Math.PI) v -= Math.PI * 2;
  while (v < -Math.PI) v += Math.PI * 2;
  return v;
};
const seedOf = (s: string) => {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const mulberry = (seed: number) => {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export class Match {
  readonly teams: [Team, Team];
  readonly P: Footballer[][];
  readonly ball = { x: PITCH_L / 2, y: MY, z: 0 };
  readonly feed: FeedItem[] = [];
  readonly score: [number, number] = [0, 0];
  readonly K: number;
  owner: Ref | null = null;
  poss: Side = 0;
  dir: [number, number] = [1, -1];
  mode: Mode = "kickoff";
  half = 1;
  t = 0;
  mt = 0;
  ended = false;
  version = 0;
  goalAt = -99;
  goalItem: FeedItem | null = null;
  card: { s: Side; i: number; until: number; red: boolean } | null = null;
  private r: () => number;
  private beats: Beat[] = [];
  private plan: Plan | null = null;
  private shot: Shot | null = null;
  private foul: Foul | null = null;
  private seg: Seg | null = null;
  private holdLeft = 0;
  private wait = 0;
  private waitMax = 0;
  private kickSide: Side = 0;
  private takers: [number, number] = [0, 0];
  private timers: { at: number; fn: () => void }[] = [];
  private press: [number, number] = [-1, -1];
  private edge: [number, number];
  private drib: Drib | null = null;
  private steal: Steal | null = null;
  private after: (() => void) | null = null;

  constructor(fx: Fixture, h: Team, a: Team) {
    this.teams = [h, a];
    this.K = CFG.match.secondsPerMinute;
    this.r = mulberry(seedOf(`${fx.day}|${h.id}|${a.id}|${fx.log.length}`));
    const sh = strength(h);
    const sa = strength(a);
    this.edge = [sh.ovr - sa.ovr, sa.ovr - sh.ovr];
    this.P = [h, a].map((team, s) => {
      const slots = lineup(team);
      const f = FORMATIONS[team.formation];
      return slots.map((slot, i) => {
        const rit = slot.player?.stats.rit ?? 60;
        return {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          h: s === 0 ? 0 : Math.PI,
          n: i + 1,
          name: slot.player?.name ?? `Giocatore ${i + 1}`,
          pos: f[i][0],
          d: clamp((90 - f[i][2]) / 72, 0, 1),
          hy: (f[i][1] / 100) * PITCH_W,
          dri: slot.player?.stats.dri ?? 60,
          dif: slot.player?.stats.dif ?? 60,
          speed: (i === 0 ? CFG.match.gkSpeed : CFG.match.playerSpeed) * (0.84 + (rit / 100) * 0.24),
          run: null,
          dive: null,
        } as Footballer;
      });
    });
    this.takers = [this.pickTaker(0), this.pickTaker(1)];
    fx.log.forEach((e) => {
      const side: Side = e.teamId === h.id ? 0 : 1;
      if (e.type === "goal" || e.type === "save" || e.type === "post" || e.type === "off") this.beats.push({ e, side, kind: "attack", T: e.min * this.K, startT: e.min * this.K - ATTACK_LEAD, done: false });
      else if (e.type === "yellow" || e.type === "red" || e.type === "injury") this.beats.push({ e, side, kind: "foul", T: e.min * this.K, startT: e.min * this.K - FOUL_LEAD, done: false });
    });
    this.beats.sort((x, y) => x.T - y.T);
    for (let s = 0; s < 2; s++)
      this.P[s].forEach((p, i) => {
        const k = this.kickPos(s as Side, i);
        p.x = k.x;
        p.y = k.y;
      });
    this.owner = { s: 0, i: this.takers[0] };
    this.mode = "kickoff";
    this.wait = 1.2;
    this.waitMax = 1.2;
    const kick = fx.log.find((e) => e.type === "kickoff");
    this.say({ type: "kickoff", teamId: h.id, player: "", text: kick?.text ?? `Fischio d'inizio: ${h.name} - ${a.name}` });
  }

  get minute() {
    return Math.min(GAME_MIN, Math.floor(this.mt / this.K));
  }

  get holderName() {
    return this.owner ? this.P[this.owner.s][this.owner.i].name : "";
  }

  get phase() {
    return this.ended ? "end" : this.mode === "interval" ? "interval" : "play";
  }

  scorers(teamId: string) {
    return this.feed.filter((f) => f.type === "goal" && f.teamId === teamId).map((f) => `${f.player} ${f.min}'`);
  }

  advance(dt: number) {
    let left = dt;
    while (left > 1e-6 && !this.ended) {
      const d = Math.min(left, 1 / 60);
      this.step(d);
      left -= d;
    }
  }

  finish() {
    let n = 0;
    while (!this.ended && n++ < 40000) this.step(1 / 30);
    if (!this.ended) this.forceEnd();
  }

  private say(e: { type: LogType; teamId: string; player: string; text: string; min?: number }) {
    const item: FeedItem = { id: this.feed.length, min: e.min ?? this.minute, type: e.type, teamId: e.teamId, player: e.player, text: e.text };
    this.feed.push(item);
    this.version++;
    return item;
  }

  private x0(s: Side) {
    return this.dir[s] > 0 ? 0 : PITCH_L;
  }

  private prog(x: number, s: Side) {
    return this.dir[s] > 0 ? x / PITCH_L : (PITCH_L - x) / PITCH_L;
  }

  private find(s: Side, name: string) {
    return this.P[s].findIndex((p) => p.name === name);
  }

  private pickTaker(s: number) {
    let best = 1;
    this.P[s].forEach((p, i) => {
      if (i === 0) return;
      const b = this.P[s][best];
      if (p.d > b.d + 0.001 || (Math.abs(p.d - b.d) <= 0.001 && Math.abs(p.hy - MY) < Math.abs(b.hy - MY))) best = i;
    });
    return best;
  }

  private later(sec: number, fn: () => void) {
    this.timers.push({ at: this.t + sec, fn });
  }

  private runTimers() {
    if (!this.timers.length) return;
    const due = this.timers.filter((x) => x.at <= this.t);
    if (!due.length) return;
    this.timers = this.timers.filter((x) => x.at > this.t);
    due.forEach((x) => x.fn());
  }

  private kickPos(s: Side, i: number): Pt {
    const p = this.P[s][i];
    const dr = this.dir[s];
    const x0 = this.x0(s);
    if (i === 0) return { x: x0 + dr * 4, y: MY };
    if (this.kickSide === s && i === this.takers[s]) return { x: PITCH_L / 2 - dr * 0.8, y: MY };
    let x = x0 + dr * (4 + p.d * 47);
    let y = MY + (p.hy - MY) * 0.9;
    const R = this.kickSide === s ? 5 : 10.6;
    if (dist(x, y, PITCH_L / 2, MY) < R) {
      const dy = clamp(y - MY, -R * 0.9, R * 0.9);
      y = MY + dy;
      x = PITCH_L / 2 - dr * Math.sqrt(R * R - dy * dy);
    }
    return { x, y };
  }

  private shape(s: Side, i: number) {
    const p = this.P[s][i];
    const dr = this.dir[s];
    const x0 = this.x0(s);
    if (i === 0) return { x: x0 + dr * 3.4, y: MY + clamp((this.ball.y - MY) * 0.14, -3.5, 3.5), sp: p.speed * 0.7 };
    const bp = this.prog(this.ball.x, s);
    const k = p.d < 0.4 ? 0.75 : p.d < 0.75 ? 1 : 0.85;
    const off = clamp(5 + 57 * p.d + (bp - 0.5) * 32 * k + (this.poss === s ? 3 * p.d : -2.5) + (this.plan && this.plan.beat.side === s ? 5 * p.d : 0), 7, 100);
    const sway = Math.sin(this.t * 0.6 + i * 1.7 + s * 2.3) * 0.9;
    return {
      x: x0 + dr * off + Math.cos(this.t * 0.5 + i) * 0.7,
      y: clamp(MY + (p.hy - MY) * 0.92 + (this.ball.y - MY) * 0.2 + sway, 4, PITCH_W - 4),
      sp: p.speed * 0.82,
    };
  }

  private carry(s: Side, i: number) {
    const p = this.P[s][i];
    const dr = this.dir[s];
    const ds = CFG.match.dribbleSpeed;
    if (this.foul && this.foul.vs === s && this.foul.victim === i) return { x: p.x + dr * 3, y: p.y, sp: ds * 0.5 };
    if (this.steal && this.steal.s !== s) return { x: p.x + dr * 2, y: p.y, sp: ds * 0.35 };
    if (this.plan && this.plan.waiting && this.plan.beat.side === s) return { x: p.x, y: p.y, sp: 0 };
    const d = this.drib;
    if (d && d.s === s && d.i === i) {
      const left = dist(p.x, p.y, d.x, d.y);
      return { x: d.x, y: clamp(d.y + (left > 6 ? Math.sin(this.t * 5) * 2.4 : 0), 3, PITCH_W - 3), sp: ds * (d.beat ? 1.4 : 1) };
    }
    if (this.plan && this.plan.beat.side === s && this.plan.shooter === i) return { x: this.plan.spot.x, y: this.plan.spot.y, sp: ds };
    if (i === 0) return { x: this.x0(s) + dr * 5.8, y: MY, sp: ds * 0.6 };
    return { x: clamp(p.x + dr * 7, 3, PITCH_L - 3), y: p.y + (MY - p.y) * 0.12, sp: ds };
  }

  private aim(s: Side, i: number) {
    const p = this.P[s][i];
    const m = this.mode;
    if (p.run && p.run.until > this.t) return { x: p.run.x, y: p.run.y, sp: p.speed };
    if (m === "end") return { x: p.x, y: p.y, sp: 0 };
    if (m === "interval" || m === "restart" || m === "kickoff" || m === "celebrate") {
      const k = this.kickPos(s, i);
      return { x: k.x, y: k.y, sp: p.speed * (m === "interval" ? 0.75 : 1.1) };
    }
    if (m === "foul" && this.foul) {
      const f = this.foul;
      if ((s === f.vs && i === f.victim) || (s === f.beat.side && i === f.booked)) return { x: p.x, y: p.y, sp: 0 };
    }
    if (this.owner && this.owner.s === s && this.owner.i === i) return this.carry(s, i);
    if (this.press[s] === i) {
      const dr = this.dir[s];
      return { x: clamp(this.ball.x - dr * 2.8, 1, PITCH_L - 1), y: this.ball.y, sp: p.speed * 0.9 };
    }
    return this.shape(s, i);
  }

  private pickPressers() {
    this.press = [-1, -1];
    if (this.mode !== "open" && this.mode !== "flight") return;
    const d: Side = this.poss === 0 ? 1 : 0;
    let best = -1;
    let bd = 1e9;
    for (let i = 1; i < 11; i++) {
      const p = this.P[d][i];
      if ((p.run && p.run.until > this.t) || p.dive) continue;
      const dd = dist(p.x, p.y, this.ball.x, this.ball.y);
      if (dd < bd) {
        bd = dd;
        best = i;
      }
    }
    this.press[d] = best;
  }

  private move(dt: number) {
    const ACC = 24;
    for (let s = 0; s < 2; s++) {
      for (let i = 0; i < 11; i++) {
        const p = this.P[s][i];
        if (p.dive) {
          const dv = p.dive;
          const u = clamp((this.t - dv.t0) / dv.dur, 0, 1);
          const e = u * (2 - u);
          const nx = dv.x0 + (dv.x1 - dv.x0) * e;
          const ny = dv.y0 + (dv.y1 - dv.y0) * e;
          p.vx = (nx - p.x) / dt;
          p.vy = (ny - p.y) / dt;
          p.x = nx;
          p.y = ny;
          if (this.t >= dv.until) p.dive = null;
          continue;
        }
        const a = this.aim(s as Side, i);
        const dx = a.x - p.x;
        const dy = a.y - p.y;
        const dd = Math.hypot(dx, dy);
        const want = Math.min(a.sp, dd * 2.4);
        let vx = dd > 1e-6 ? (dx / dd) * want : 0;
        let vy = dd > 1e-6 ? (dy / dd) * want : 0;
        for (let s2 = 0; s2 < 2; s2++)
          for (let j = 0; j < 11; j++) {
            if (s2 === s && j === i) continue;
            const q = this.P[s2][j];
            const ox = p.x - q.x;
            const oy = p.y - q.y;
            const od = Math.hypot(ox, oy);
            if (od < 5.5 && od > 1e-6) {
              const k = ((5.5 - od) / 5.5) * 3.2;
              vx += (ox / od) * k;
              vy += (oy / od) * k;
            }
          }
        let ax = vx - p.vx;
        let ay = vy - p.vy;
        const am = Math.hypot(ax, ay);
        const lim = ACC * dt;
        if (am > lim) {
          ax *= lim / am;
          ay *= lim / am;
        }
        p.vx += ax;
        p.vy += ay;
        const sp = Math.hypot(p.vx, p.vy);
        const cap = p.speed * 1.15;
        if (sp > cap) {
          p.vx *= cap / sp;
          p.vy *= cap / sp;
        }
        p.x = clamp(p.x + p.vx * dt, -3, PITCH_L + 3);
        p.y = clamp(p.y + p.vy * dt, -1.5, PITCH_W + 1.5);
      }
    }
    for (let s = 0; s < 2; s++)
      for (let i = 0; i < 11; i++) {
        const p = this.P[s][i];
        if (Math.hypot(p.vx, p.vy) > 0.6) p.h += wrap(Math.atan2(p.vy, p.vx) - p.h) * Math.min(1, dt * 9);
      }
  }

  private separate() {
    const minD = CFG.match.minSeparation;
    const all: Footballer[] = [...this.P[0], ...this.P[1]];
    for (let a = 0; a < all.length; a++)
      for (let b = a + 1; b < all.length; b++) {
        const p = all[a];
        const q = all[b];
        let dx = q.x - p.x;
        let dy = q.y - p.y;
        let d = Math.hypot(dx, dy);
        if (d >= minD) continue;
        if (d < 1e-4) {
          dx = 1;
          dy = 0.001;
          d = 1;
        }
        const push = (minD - d) / d;
        const wa = p.dive ? 0 : q.dive ? 1 : 0.5;
        const wb = q.dive ? 0 : p.dive ? 1 : 0.5;
        p.x -= dx * push * wa;
        p.y -= dy * push * wa;
        q.x += dx * push * wb;
        q.y += dy * push * wb;
      }
  }

  private moveBall(dt: number) {
    const sg = this.seg;
    if (sg) {
      const u = clamp((this.t - sg.t0) / sg.dur, 0, 1);
      const e = sg.ease === 1 ? u : 1 - Math.pow(1 - u, sg.ease);
      this.ball.x = sg.x0 + (sg.x1 - sg.x0) * e;
      this.ball.y = sg.y0 + (sg.y1 - sg.y0) * e;
      this.ball.z = sg.z0 + (sg.z1 - sg.z0) * u + 4 * sg.h * u * (1 - u);
      if (u >= 1) {
        this.seg = null;
        sg.end();
      }
      return;
    }
    if (this.owner) {
      const p = this.P[this.owner.s][this.owner.i];
      const k = Math.min(1, dt * 18);
      const osc = Math.sin(this.t * 10) * 0.75 * Math.min(1, Math.hypot(p.vx, p.vy) / 6);
      let mx = (p.x + Math.cos(p.h) * 1.55 - Math.sin(p.h) * osc - this.ball.x) * k;
      let my = (p.y + Math.sin(p.h) * 1.55 + Math.cos(p.h) * osc - this.ball.y) * k;
      const lim = 30 * dt;
      const ml = Math.hypot(mx, my);
      if (ml > lim) {
        mx *= lim / ml;
        my *= lim / ml;
      }
      this.ball.x += mx;
      this.ball.y += my;
      this.ball.z *= 0.7;
    }
  }

  private fly(x1: number, y1: number, z1: number, dur: number, h: number, ease: number, end: () => void) {
    this.seg = { x0: this.ball.x, y0: this.ball.y, z0: this.ball.z, x1, y1, z1, t0: this.t, dur: Math.max(0.15, dur), h, ease, end };
  }

  step(dt: number) {
    this.t += dt;
    if (this.mode !== "interval" && this.mode !== "end") this.mt += dt;
    this.runTimers();
    this.flow(dt);
    this.pickPressers();
    this.move(dt);
    this.separate();
    this.moveBall(dt);
  }

  private flow(dt: number) {
    switch (this.mode) {
      case "kickoff":
        if (this.owner && this.t >= this.wait && (this.settled() || this.t >= this.waitMax)) this.kickoffPass();
        break;
      case "open":
        this.openPlay(dt);
        break;
      case "foul":
        if (this.t >= this.wait) {
          this.foul = null;
          this.mode = "open";
          this.holdLeft = 0.7;
        }
        break;
      default:
        break;
    }
    if (this.mt > GAME_MIN * this.K + 60 && !this.ended) this.forceEnd();
  }

  private settled() {
    for (let s = 0; s < 2; s++)
      for (let i = 0; i < 11; i++) {
        const p = this.P[s][i];
        if ((p.x - PITCH_L / 2) * this.dir[s] > 1.5) return false;
      }
    return true;
  }

  private nextBeat() {
    return this.beats.find((b) => !b.done);
  }

  private openPlay(dt: number) {
    if (!this.owner) return;
    if (this.foul) {
      this.checkFoul();
      return;
    }
    if (this.steal) {
      this.checkSteal();
      return;
    }
    if (!this.plan) {
      if (this.half === 1 && this.mt >= HALF_MIN * this.K) {
        this.startInterval();
        return;
      }
      if (this.mt >= GAME_MIN * this.K) {
        this.finalWhistle();
        return;
      }
    }
    this.holdLeft -= dt;
    if (this.holdLeft > 0) return;
    this.decide();
  }

  private decide() {
    const o = this.owner as Ref;
    if (this.after) {
      const f = this.after;
      this.after = null;
      f();
      return;
    }
    if (this.drib) {
      this.driveDrib();
      return;
    }
    if (this.plan) {
      this.runPlan();
      return;
    }
    const b = this.nextBeat();
    if (b && this.mt >= b.startT) {
      if (b.kind === "attack") {
        if (o.s === b.side) {
          this.buildPlan(b);
          this.runPlan();
        } else this.takeBall(b.side);
        return;
      }
      if (o.s !== b.side) {
        this.startFoul(b);
        return;
      }
      const bi = this.find(b.side, b.e.player);
      const bp = this.P[b.side][bi < 0 ? 1 : bi];
      this.turnover((1 - b.side) as Side, { x: bp.x, y: bp.y });
      return;
    }
    this.fillerPass();
  }

  private takeBall(side: Side) {
    const o = this.owner as Ref;
    const me = this.P[o.s][o.i];
    let best = -1;
    let bd = 1e9;
    for (let i = 1; i < 11; i++) {
      const q = this.P[side][i];
      const d = dist(q.x, q.y, me.x, me.y);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    if (best > 0 && bd < 24) {
      this.drib = null;
      this.steal = { s: side, i: best, since: this.t };
      return;
    }
    this.turnover(side);
  }

  private checkSteal() {
    const st = this.steal as Steal;
    const o = this.owner;
    if (!o || o.s === st.s) {
      this.steal = null;
      return;
    }
    const d = this.P[st.s][st.i];
    const h = this.P[o.s][o.i];
    d.run = { x: h.x + h.vx * 0.25, y: h.y + h.vy * 0.25, until: this.t + 0.3 };
    if (dist(d.x, d.y, this.ball.x, this.ball.y) < 2.6 || this.t - st.since > 7) {
      d.run = null;
      this.steal = null;
      this.drib = null;
      this.owner = { s: st.s, i: st.i };
      this.poss = st.s;
      this.holdLeft = 0.5;
    }
  }

  private startDrib(s: Side, i: number, x: number, y: number, winP: number | null) {
    const me = this.P[s][i];
    let v = -1;
    let bd = 1e9;
    for (let j = 1; j < 11; j++) {
      const q = this.P[1 - s][j];
      if ((q.x - me.x) * this.dir[s] < -1) continue;
      const d = dist(q.x, q.y, me.x, me.y);
      if (d < bd) {
        bd = d;
        v = j;
      }
    }
    const dv = v >= 0 ? this.P[1 - s][v].dif : 60;
    const win = winP === null || v < 0 || this.r() < clamp(winP + (me.dri - dv) / 160, 0.35, 0.9);
    const len = dist(me.x, me.y, x, y);
    this.drib = { s, i, x, y, until: this.t + len / 4 + 1.5, win, victim: v, beat: false };
    if (!win) this.steal = { s: (1 - s) as Side, i: v, since: this.t };
  }

  private driveDrib() {
    const d = this.drib as Drib;
    const o = this.owner as Ref;
    if (o.s !== d.s || o.i !== d.i) {
      this.drib = null;
      return;
    }
    const me = this.P[d.s][d.i];
    if (!d.beat && d.victim >= 0) {
      const v = this.P[1 - d.s][d.victim];
      if (dist(me.x, me.y, v.x, v.y) < 4.4) {
        d.beat = true;
        if (d.win) v.run = { x: v.x, y: v.y, until: this.t + 1 };
      }
    }
    if (dist(me.x, me.y, d.x, d.y) < 2.2 || this.t > d.until) {
      this.drib = null;
      this.holdLeft = 0.2;
      return;
    }
    this.holdLeft = 0.08;
  }

  private turnover(side: Side, focus?: Pt) {
    const f = focus ?? { x: this.ball.x, y: this.ball.y };
    let best = 1;
    let bd = 1e9;
    for (let i = 1; i < 11; i++) {
      const q = this.P[side][i];
      const d = dist(q.x, q.y, f.x, f.y);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    const q = this.P[side][best];
    this.pass(side, best, { x: (q.x * 2 + this.ball.x) / 3, y: (q.y * 2 + this.ball.y) / 3 }, CFG.match.passSpeed * 0.8, 0.1, 0.3);
  }

  private fillerPass() {
    const o = this.owner as Ref;
    const s = o.s;
    const me = this.P[s][o.i];
    const dr = this.dir[s];
    const opp = this.P[1 - s];
    if (o.i !== 0 && this.r() < 0.18) {
      this.holdLeft = 0.7;
      return;
    }
    const b = this.nextBeat();
    const soon = !!b && b.startT - this.mt < 4;
    let front = 99;
    for (let j = 1; j < 11; j++) {
      const q = opp[j];
      const dx = (q.x - me.x) * dr;
      if (dx > 0.5 && dx < 13 && Math.abs(q.y - me.y) < 7) front = Math.min(front, dist(me.x, me.y, q.x, q.y));
    }
    const pd = front < 13 ? CFG.match.dribbleChance : CFG.match.dribbleChance * 0.4;
    if (o.i !== 0 && this.prog(me.x, s) < 0.88 && this.r() < pd) {
      const tx = clamp(me.x + dr * (9 + this.r() * 6), 4, PITCH_L - 4);
      const ty = clamp(me.y + (this.r() - 0.5) * 18, 6, PITCH_W - 6);
      this.startDrib(s, o.i, tx, ty, soon ? null : 0.62);
      this.holdLeft = 0.08;
      return;
    }
    let best = -1;
    let bs = -1e9;
    for (let i = 0; i < 11; i++) {
      if (i === o.i) continue;
      const q = this.P[s][i];
      const d = dist(me.x, me.y, q.x, q.y);
      if (d < 6) continue;
      let near = 20;
      for (let j = 0; j < 11; j++) near = Math.min(near, dist(opp[j].x, opp[j].y, q.x, q.y));
      let sc = (q.x - me.x) * dr * 0.06 + Math.min(near, 10) * 0.35 - Math.abs(d - 17) * 0.08 - Math.max(0, d - 24) * 0.15 + (this.r() - 0.5) * 2.4;
      if (i === 0) sc -= 4;
      if (sc > bs) {
        bs = sc;
        best = i;
      }
    }
    if (best < 0) {
      this.holdLeft = 0.5;
      return;
    }
    const q = this.P[s][best];
    const dest = { x: q.x + dr * 3.5, y: q.y + (this.r() - 0.5) * 3 };
    const pOk = soon ? 1 : clamp(0.88 + this.edge[s] / 200, 0.78, 0.95);
    if (this.r() > pOk) {
      this.turnover((1 - s) as Side, dest);
      return;
    }
    this.pass(s, best, dest, CFG.match.passSpeed, 0.15, 0.5 + this.r() * 0.8);
  }

  private pass(ts: Side, ti: number, want: Pt, speed: number, h: number, hold: number, z1 = 0) {
    const r = this.P[ts][ti];
    let px = clamp(want.x, 1.5, PITCH_L - 1.5);
    let py = clamp(want.y, 1.5, PITCH_W - 1.5);
    for (let k = 0; k < 5; k++) {
      const dur = Math.max(0.4, dist(this.ball.x, this.ball.y, px, py) / speed);
      const reach = r.speed * dur * 0.8;
      const dr = dist(r.x, r.y, px, py);
      if (dr <= reach || dr < 0.01) break;
      const f = reach / dr;
      px = r.x + (px - r.x) * f;
      py = r.y + (py - r.y) * f;
    }
    const len = dist(this.ball.x, this.ball.y, px, py);
    const lob = len > CFG.match.lobDistance;
    const dur = Math.max(0.4, len / (lob ? speed * CFG.match.lobSpeed : speed));
    const hh = lob ? Math.max(h, clamp((len - 12) / 5.5, 0.6, 4.4)) : h;
    this.owner = null;
    this.drib = null;
    this.mode = "flight";
    r.run = { x: px, y: py, until: this.t + dur + 1.2 };
    this.fly(px, py, z1, dur, hh, lob ? 1.1 : 1.8, () => this.land(ts, ti, hold, 0));
  }

  private land(ts: Side, ti: number, hold: number, tries: number) {
    const r = this.P[ts][ti];
    const d = dist(r.x, r.y, this.ball.x, this.ball.y);
    if (d > 2.2 && tries < 5) {
      this.fly(r.x, r.y, 0, clamp(d / 9, 0.15, 0.9), 0, 1, () => this.land(ts, ti, hold, tries + 1));
      return;
    }
    r.run = null;
    this.owner = { s: ts, i: ti };
    this.poss = ts;
    this.mode = "open";
    this.holdLeft = hold;
  }

  private kickoffPass() {
    const o = this.owner as Ref;
    const me = this.P[o.s][o.i];
    let best = 1;
    let bd = 1e9;
    for (let i = 1; i < 11; i++) {
      if (i === o.i) continue;
      const d = dist(me.x, me.y, this.P[o.s][i].x, this.P[o.s][i].y);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    const q = this.P[o.s][best];
    this.poss = o.s;
    this.pass(o.s, best, { x: q.x - this.dir[o.s] * 1.5, y: q.y }, 11, 0.05, 0.5);
  }

  private act(k: Act["k"], o: Partial<Act> = {}): Act {
    return { k, to: 0, x: 0, y: 0, speed: CFG.match.passSpeed, h: 0.15, hold: 0.25, bx: 0, by: 0, ...o };
  }

  private chain(s: Side, from: Pt, to: Pt, skip: number[], n: number): Act[] {
    const used = new Set<number>(skip);
    const out: Act[] = [];
    for (let k = 0; k < n; k++) {
      const u = (k + 1) / (n + 1);
      const px = from.x + (to.x - from.x) * u;
      const py = clamp(from.y + (to.y - from.y) * u + (k % 2 ? 1 : -1) * (3 + this.r() * 5), 6, PITCH_W - 6);
      let best = -1;
      let bd = 1e9;
      for (let i = 1; i < 11; i++) {
        if (used.has(i)) continue;
        const q = this.P[s][i];
        const d = dist(q.x, q.y, px, py);
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      if (best < 0) break;
      used.add(best);
      out.push(this.act("pass", { to: best, x: px, y: py, h: 0.15, hold: 0.3 }));
    }
    return out;
  }

  private buildPlan(b: Beat) {
    const o = this.owner as Ref;
    const s = b.side;
    const dr = this.dir[s];
    const gx = dr > 0 ? PITCH_L : 0;
    let si = this.find(s, b.e.player);
    if (si <= 0) {
      si = 1;
      this.P[s].forEach((p, i) => {
        if (i > 0 && p.d > this.P[s][si].d) si = i;
      });
    }
    const sh = this.P[s][si];
    const rem = b.T - this.mt;
    const here = { x: this.ball.x, y: this.ball.y };
    let wing = -1;
    let wd = 0;
    for (let i = 1; i < 11; i++) {
      if (i === si || i === o.i) continue;
      const p = this.P[s][i];
      const wide = Math.abs(p.hy - MY);
      if (p.d >= 0.3 && wide > wd) {
        wd = wide;
        wing = i;
      }
    }
    if (wd < 10) wing = -1;
    const goal = b.e.type === "goal";
    const weights: [Tac, number][] = goal
      ? [["wing", 0.3], ["combo", 0.2], ["dribble", 0.2], ["through", 0.2], ["long", 0.1]]
      : [["long", 0.3], ["wing", 0.2], ["combo", 0.15], ["dribble", 0.15], ["through", 0.2]];
    const own = o.i === si && Math.abs(here.x - gx) < 32;
    const pool = weights.filter(([t]) => (t === "wing" ? wing >= 0 && !own : t === "combo" || t === "through" ? !own : true));
    let roll = this.r() * pool.reduce((a, [, x]) => a + x, 0);
    let tac: Tac = pool[0][0];
    for (const [t, x] of pool) {
      roll -= x;
      if (roll <= 0) {
        tac = t;
        break;
      }
    }
    const how: How = tac === "wing" ? "head" : "foot";
    let spot: Pt;
    if (tac === "wing") spot = { x: gx - dr * (8 + this.r() * 3), y: clamp(MY + (this.r() - 0.5) * 8, 25, 43) };
    else if (tac === "long") spot = { x: gx - dr * (21 + this.r() * 4.5), y: clamp(MY + (this.r() - 0.5) * 14, 20, 48) };
    else spot = { x: gx - dr * (12 + this.r() * 6), y: clamp(MY + (sh.hy - MY) * 0.35 + (this.r() - 0.5) * 12, 21, 47) };
    const count = (to: Pt) => {
      const need = clamp(Math.ceil(dist(here.x, here.y, to.x, to.y) / 20) - 1, o.i === si ? 1 : 0, 5);
      return Math.min(5, Math.max(need, Math.min(Math.floor((rem - 4) / 1.7), 3)));
    };
    const acts: Act[] = [];
    const sp = CFG.match.passSpeed;
    if (own) {
      acts.push(this.act("dribble", { x: spot.x, y: spot.y }));
    } else if (tac === "wing") {
      const wsg = this.P[s][wing].hy >= MY ? 1 : -1;
      const flank = wsg > 0 ? PITCH_W - 6 : 6;
      const zone = { x: this.x0(s) + dr * PITCH_L * 0.55, y: flank - wsg * 3 };
      const pre = { x: zone.x - dr * 17, y: clamp(zone.y + (MY - zone.y) * 0.4, 8, 60) };
      acts.push(...this.chain(s, here, pre, [o.i, si, wing], count(pre)));
      acts.push(this.act("pass", { to: wing, x: zone.x, y: zone.y, hold: 0.2 }));
      acts.push(this.act("dribble", { x: gx - dr * (15 + this.r() * 3), y: flank }));
      acts.push(this.act("cross", { to: si, x: spot.x, y: spot.y, speed: 15.5, h: 3.2, hold: 0 }));
    } else {
      const pre = { x: spot.x - dr * (tac === "dribble" ? 32 : 17), y: clamp(spot.y + (this.r() - 0.5) * 14, 8, 60) };
      acts.push(...this.chain(s, here, pre, [o.i, si], count(pre)));
      if (tac === "dribble") {
        acts.push(this.act("pass", { to: si, x: spot.x - dr * 19, y: clamp(spot.y + (this.r() - 0.5) * 8, 8, 60), hold: 0.2 }));
        acts.push(this.act("dribble", { x: spot.x, y: spot.y }));
      } else if (tac === "combo") {
        const lay = { x: spot.x - dr * 8, y: clamp(MY + (spot.y < MY ? -1 : 1) * (6 + this.r() * 6), 10, 58) };
        const back = { x: spot.x - dr * 3, y: clamp(spot.y + (this.r() - 0.5) * 10, 8, 60) };
        acts.push(this.act("wall", { to: si, x: lay.x, y: lay.y, bx: back.x, by: back.y, hold: 0.1 }));
        acts.push(this.act("pass", { to: si, x: spot.x, y: spot.y, speed: sp * 1.1, h: 0.1, hold: 0.2 }));
      } else {
        acts.push(this.act("pass", { to: si, x: spot.x, y: spot.y, speed: sp * (tac === "through" ? 1.12 : 1), h: 0.1, hold: 0.2 }));
      }
    }
    acts.push(this.act("shoot"));
    if (!own) sh.run = { x: tac === "wing" ? gx - dr * 30 : spot.x - dr * 4, y: spot.y, until: this.t + 9 };
    this.plan = { beat: b, acts, spot, shooter: si, tac, how, waiting: false, since: this.t };
  }

  private runPlan() {
    const plan = this.plan as Plan;
    const act = plan.acts[0];
    const o = this.owner as Ref;
    if (act.k === "shoot") {
      if (plan.how === "foot" && this.mt < plan.beat.T - 0.1) {
        plan.waiting = true;
        this.holdLeft = 0.1;
        return;
      }
      const gx = this.dir[o.s] > 0 ? PITCH_L : 0;
      if (dist(this.ball.x, this.ball.y, gx, MY) > CFG.match.shotRange && this.t - plan.since < 40) {
        plan.waiting = false;
        this.startDrib(o.s, o.i, plan.spot.x, plan.spot.y, null);
        this.holdLeft = 0.08;
        return;
      }
      this.plan = null;
      this.shoot(plan.beat, plan.shooter, plan.tac, plan.how);
      return;
    }
    plan.waiting = false;
    if (act.k === "cross") {
      if (plan.beat.T - this.mt - 1.9 > 0) {
        plan.waiting = true;
        this.holdLeft = 0.1;
        return;
      }
      plan.acts.shift();
      this.pass(o.s, act.to, { x: act.x, y: act.y }, act.speed, act.h, act.hold, 1.9);
      return;
    }
    if (act.k === "dribble") {
      plan.acts.shift();
      if (plan.tac === "wing") this.P[o.s][plan.shooter].run = { x: plan.spot.x, y: plan.spot.y, until: this.t + 7 };
      this.startDrib(o.s, o.i, act.x, act.y, null);
      this.holdLeft = 0.08;
      return;
    }
    if (act.k === "wall") {
      plan.acts.shift();
      const s = o.s;
      const me = o.i;
      this.pass(s, act.to, { x: act.x, y: act.y }, act.speed, act.h, act.hold);
      this.P[s][me].run = { x: act.bx, y: act.by, until: this.t + 2.6 };
      this.after = () => this.pass(s, me, { x: act.bx, y: act.by }, act.speed, 0.1, 0.2);
      return;
    }
    plan.acts.shift();
    this.pass(o.s, act.to, { x: act.x, y: act.y }, act.speed, act.h, act.hold);
  }

  private shoot(b: Beat, shooter: number, tac: Tac, how: How) {
    const s = b.side;
    const dr = this.dir[s];
    const gx = dr > 0 ? PITCH_L : 0;
    const v = b.e.variant;
    const kind: ShotKind = b.e.type === "goal" ? "goal" : b.e.type === "save" ? "save" : b.e.type === "post" ? "post" : v === "over" ? "over" : "wide";
    const sg = this.r() < 0.5 ? -1 : 1;
    const rr = this.r();
    let ty = MY;
    let ex = gx;
    let z1 = 0.5;
    let h = 0.4;
    if (kind === "goal") {
      ty = MY + sg * (1.2 + rr * 2);
      ex = gx + dr * 1.1;
      z1 = 0.7 + rr * 0.8;
      h = 0.5;
    } else if (kind === "save") {
      ty = MY + sg * (0.4 + rr * 2.4);
      ex = gx - dr * 0.9;
      z1 = 0.5 + rr * 0.9;
    } else if (kind === "post") {
      ty = MY + sg * GOAL_HALF;
      z1 = 1.1;
      h = 0.3;
    } else if (kind === "wide") {
      ty = MY + sg * (5 + rr * 3.5);
      ex = gx + dr * 3;
      h = 0.3;
    } else {
      ty = MY + (rr - 0.5) * 5;
      ex = gx + dr * 4.5;
      z1 = 3.8;
      h = 0.8;
    }
    if (tac === "long") h += 1.4;
    if (how === "head") this.ball.z = 1.9;
    const dur = Math.max(0.5, dist(this.ball.x, this.ball.y, ex, ty) / (how === "head" ? CFG.match.shotSpeed * 0.75 : CFG.match.shotSpeed));
    const gk = this.P[1 - s][0];
    const gkx = gx - dr * 1;
    const target: Pt = kind === "goal" ? { x: gkx, y: MY + (ty - MY) * 0.5 } : kind === "save" ? { x: ex, y: ty } : kind === "post" ? { x: gkx, y: MY + (ty - MY) * 0.7 } : { x: gx - dr * 1.4, y: MY + (ty - MY) * 0.3 };
    gk.run = null;
    gk.dive = { x0: gk.x, y0: gk.y, x1: target.x, y1: target.y, t0: this.t, dur: Math.max(0.4, dur * 0.95), until: this.t + dur + 1.1 };
    b.done = true;
    this.owner = null;
    this.drib = null;
    this.steal = null;
    this.after = null;
    this.mode = "shot";
    this.shot = { beat: b, kind, ty, shooter, side: s, tac, how };
    this.fly(ex, ty, z1, dur, h, 1, () => this.shotEnd());
  }

  private line(sh: Shot, e: LogEntry) {
    const p = e.player;
    const t = this.teams[sh.side].name;
    const lead = {
      wing: `Cross dalla fascia, ${p} di testa`,
      combo: `Triangolazione e conclusione di ${p}`,
      dribble: `Dribbling di ${p} e tiro`,
      through: `Filtrante per ${p}, tiro`,
      long: `${p} ci prova da fuori`,
    }[sh.tac];
    if (sh.kind === "goal") return `${lead}: GOL per ${t}!`;
    if (sh.kind === "save") return `${lead}: ${e.variant === "caught" ? "presa sicura del portiere." : "grande parata del portiere!"}`;
    if (sh.kind === "post") return `${lead}: palo!`;
    if (sh.kind === "over") return `${lead}: sopra la traversa.`;
    return `${lead}: palla fuori di poco.`;
  }

  private shotEnd() {
    const sh = this.shot as Shot;
    this.shot = null;
    const b = sh.beat;
    const s = sh.side;
    const d = (1 - s) as Side;
    const item = this.say({ type: b.e.type, teamId: b.e.teamId, player: b.e.player, text: this.line(sh, b.e), min: b.e.min });
    if (sh.kind === "goal") {
      this.score[s]++;
      this.goalAt = this.t;
      this.goalItem = item;
      this.celebrate(s, sh.shooter);
      return;
    }
    if (sh.kind === "save" && b.e.variant === "caught") {
      this.owner = { s: d, i: 0 };
      this.poss = d;
      this.mode = "open";
      this.holdLeft = 1.7;
      return;
    }
    if (sh.kind === "save" || sh.kind === "post") {
      const dr = this.dir[s];
      const gx = dr > 0 ? PITCH_L : 0;
      const sg = sh.ty >= MY ? 1 : -1;
      const q = { x: gx - dr * (5 + this.r() * 3.5), y: MY + sg * (4 + this.r() * 5) };
      let best = 1;
      let bd = 1e9;
      for (let i = 1; i < 11; i++) {
        const p = this.P[d][i];
        const dd = dist(p.x, p.y, q.x, q.y);
        if (dd < bd) {
          bd = dd;
          best = i;
        }
      }
      this.pass(d, best, q, 13, 0.3, 0.6);
      return;
    }
    this.mode = "return";
    this.later(0.8, () => this.fetch(d));
  }

  private fetch(side: Side) {
    const gk = this.P[side][0];
    const dr = this.dir[side];
    const spot = { x: this.x0(side) + dr * 5.5, y: MY };
    gk.run = { x: spot.x, y: spot.y, until: this.t + 4 };
    this.mode = "return";
    this.fly(spot.x, spot.y, 0, clamp(dist(this.ball.x, this.ball.y, spot.x, spot.y) / 8, 1, 2.4), 0.6, 1.5, () => {
      gk.run = null;
      this.owner = { s: side, i: 0 };
      this.poss = side;
      this.mode = "open";
      this.holdLeft = 1.3;
    });
  }

  private celebrate(s: Side, si: number) {
    const dr = this.dir[s];
    const gx = dr > 0 ? PITCH_L : 0;
    const sc = this.P[s][si];
    const spot = { x: gx - dr * 7, y: sc.y < MY ? 5 : PITCH_W - 5 };
    const until = this.t + CFG.match.celebrationSeconds * 0.7;
    sc.run = { x: spot.x, y: spot.y, until };
    const mates: number[] = [];
    for (let i = 1; i < 11; i++) if (i !== si) mates.push(i);
    mates.sort((a, c) => dist(this.P[s][a].x, this.P[s][a].y, spot.x, spot.y) - dist(this.P[s][c].x, this.P[s][c].y, spot.x, spot.y));
    const sy = spot.y < MY ? 1 : -1;
    mates.slice(0, 2).forEach((m, k) => {
      this.P[s][m].run = { x: spot.x - dr * 4.2, y: spot.y + sy * (k === 0 ? 3.6 : 7.2), until };
    });
    this.kickSide = (1 - s) as Side;
    this.owner = null;
    this.mode = "celebrate";
    this.later(CFG.match.celebrationSeconds, () => this.restartKick((1 - s) as Side));
  }

  private restartKick(side: Side) {
    this.kickSide = side;
    this.mode = "restart";
    this.owner = null;
    const tk = this.takers[side];
    const dr = this.dir[side];
    this.P[side][tk].run = { x: PITCH_L / 2 - dr * 0.8, y: MY, until: this.t + 8 };
    const d = dist(this.ball.x, this.ball.y, PITCH_L / 2, MY);
    this.fly(PITCH_L / 2, MY, 0, clamp(d / 14, 1.2, 3), 3.2, 1.4, () => {
      this.P[side][tk].run = null;
      this.owner = { s: side, i: tk };
      this.poss = side;
      this.mode = "kickoff";
      this.wait = this.t + 0.9;
      this.waitMax = this.t + 5;
    });
  }

  private startFoul(b: Beat) {
    const o = this.owner as Ref;
    const bi = this.find(b.side, b.e.player);
    this.foul = { beat: b, victim: o.i, booked: bi < 0 ? 1 : bi, since: this.t, vs: o.s };
    this.holdLeft = 0.2;
  }

  private checkFoul() {
    const f = this.foul as Foul;
    const v = this.P[f.vs][f.victim];
    const k = this.P[f.beat.side][f.booked];
    k.run = { x: v.x, y: v.y, until: this.t + 0.3 };
    if (dist(k.x, k.y, v.x, v.y) < 4.4 || this.t - f.since > 6) {
      k.run = null;
      f.beat.done = true;
      this.say(f.beat.e);
      this.card = f.beat.e.type === "injury" ? null : { s: f.beat.side, i: f.booked, until: this.t + 2.8, red: f.beat.e.type === "red" };
      this.mode = "foul";
      this.wait = this.t + 2.8;
    }
  }

  private startInterval() {
    this.half = 2;
    this.dir = [-1, 1];
    this.kickSide = 1;
    this.mode = "interval";
    this.drib = null;
    this.steal = null;
    this.after = null;
    this.say({ type: "half", teamId: this.teams[0].id, player: "", text: `Fine primo tempo: ${this.teams[0].name} ${this.score[0]}-${this.score[1]} ${this.teams[1].name}` });
    this.later(CFG.match.intervalSeconds, () => this.restartKick(1));
  }

  private finalWhistle() {
    this.mode = "end";
    this.ended = true;
    this.say({ type: "end", teamId: this.teams[0].id, player: "", text: `Finita: ${this.teams[0].name} ${this.score[0]}-${this.score[1]} ${this.teams[1].name}` });
  }

  private forceEnd() {
    this.beats.forEach((b) => {
      if (b.done) return;
      b.done = true;
      const item = this.say(b.e);
      if (b.e.type === "goal") {
        this.score[b.side]++;
        this.goalItem = item;
      }
    });
    this.owner = null;
    this.seg = null;
    this.finalWhistle();
  }
}
