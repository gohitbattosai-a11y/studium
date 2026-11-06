import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Hand, Package, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useCityActions, type CastInfo, type CatchInfo, type CityState } from "@/lib/domain/city";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { CatchDialog } from "./Bucket";
import { SHAPES } from "./FishArt";
import ReelGame from "./ReelGame";

type Phase = "idle" | "casting" | "waiting" | "bite" | "reel" | "result";

interface Shadow {
  x: number;
  y: number;
  a: number;
  speed: number;
  len: number;
  h: number;
  ph: number;
  tx: number;
  ty: number;
  retarget: number;
  interest: number;
  orbit: number;
  target: boolean;
}

interface Ripple {
  x: number;
  y: number;
  t0: number;
  life: number;
  max: number;
}

interface Decor {
  x: number;
  y: number;
  r: number;
  k: number;
}

interface World {
  W: number;
  H: number;
  dpr: number;
  ctx: CanvasRenderingContext2D | null;
  path: Path2D | null;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  k: number;
  reeds: Decor[];
  rocks: Decor[];
  pads: Decor[];
  blots: Decor[];
  tufts: Decor[];
  trees: Decor[];
  flowers: Decor[];
  stones: Decor[];
  flies: Decor[];
  leaves: Decor[];
  shadows: Shadow[];
  ripples: Ripple[];
  bob: { x: number; y: number; tx: number; ty: number; dip: number };
  cast: CastInfo | null;
  t0: number;
  reduction: number;
  lastJig: number;
  lastRipple: number;
  phase: Phase;
  biteAt: number;
  biteWindow: number;
}

const BITE_WINDOW = 2400;
const JIG_COOLDOWN = 2500;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pxLen = (cm: number, k: number) => Math.min(150, 16 + Math.sqrt(cm) * 9) * k;

export default function Pond({ city, onBucket }: { city: CityState; onBucket: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [bait, setBait] = useState("pane");
  const [caught, setCaught] = useState<CatchInfo | null>(null);
  const [fight, setFight] = useState({ difficulty: 1, strength: 0.5, dash: 0.5, head: 0 });
  const { cast, reel } = useCityActions();
  const cityRef = useRef(city);
  const baitRef = useRef(bait);
  const reelRef = useRef(reel.mutate);
  const world = useRef<World>({
    W: 0,
    H: 0,
    dpr: 1,
    ctx: null,
    path: null,
    cx: 0,
    cy: 0,
    rx: 0,
    ry: 0,
    k: 1,
    reeds: [],
    rocks: [],
    pads: [],
    blots: [],
    tufts: [],
    trees: [],
    flowers: [],
    stones: [],
    flies: [],
    leaves: [],
    shadows: [],
    ripples: [],
    bob: { x: 0, y: 0, tx: 0, ty: 0, dip: 0 },
    cast: null,
    t0: 0,
    reduction: 0,
    lastJig: 0,
    lastRipple: 0,
    phase: "idle",
    biteAt: 0,
    biteWindow: BITE_WINDOW,
  });

  useEffect(() => {
    cityRef.current = city;
  }, [city]);

  useEffect(() => {
    baitRef.current = bait;
    reelRef.current = reel.mutate;
  });

  const setPhase = useCallback((p: Phase) => {
    world.current.phase = p;
    setPhaseState(p);
  }, []);

  const inPond = (x: number, y: number) => {
    const w = world.current;
    return !!(w.ctx && w.path && w.ctx.isPointInPath(w.path, x, y));
  };

  const makeShadow = (cm: number, shape: keyof typeof SHAPES, x: number, y: number, target: boolean): Shadow => {
    const w = world.current;
    const spec = SHAPES[shape];
    const len = pxLen(cm, w.k);
    return { x, y, a: Math.random() * Math.PI * 2, speed: 14 + Math.random() * 18, len, h: (len * spec.h) / spec.len, ph: Math.random() * 6, tx: x, ty: y, retarget: 0, interest: 0, orbit: 0, target };
  };

  const randomWater = () => {
    const w = world.current;
    for (let i = 0; i < 40; i++) {
      const x = w.cx + (Math.random() * 2 - 1) * w.rx * 0.9;
      const y = w.cy + (Math.random() * 2 - 1) * w.ry * 0.9;
      if (inPond(x, y)) return { x, y };
    }
    return { x: w.cx, y: w.cy };
  };

  const layout = useCallback(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const w = world.current;
    const W = el.clientWidth;
    const H = el.clientHeight;
    if (W === 0 || H === 0) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w.W = W;
    w.H = H;
    w.dpr = dpr;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    w.ctx = cv.getContext("2d");
    w.cx = W / 2;
    w.cy = H * 0.45;
    w.rx = Math.min(W * 0.45, H * 0.85);
    w.ry = H * 0.39;
    w.k = Math.max(0.55, Math.min(1.25, Math.min(W, H * 1.1) / 700));
    const path = new Path2D();
    for (let i = 0; i <= 90; i++) {
      const t = (i / 90) * Math.PI * 2;
      const r = 1 + 0.07 * Math.sin(3 * t + 1.3) + 0.05 * Math.sin(5 * t + 0.4) + 0.03 * Math.sin(7 * t + 2);
      const x = w.cx + w.rx * r * Math.cos(t);
      const y = w.cy + w.ry * r * Math.sin(t);
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    path.closePath();
    w.path = path;
    const rand = rng(1234);
    const ring = (n: number, spread: number, rMin: number, rMax: number) =>
      Array.from({ length: n }, () => {
        const t = rand() * Math.PI * 2;
        const q = spread + rand() * 0.06;
        return { x: w.cx + w.rx * q * Math.cos(t), y: w.cy + w.ry * q * Math.sin(t), r: rMin + rand() * (rMax - rMin), k: rand() };
      });
    w.reeds = ring(34, 1.0, 10, 20);
    w.rocks = ring(12, 1.1, 6, 14);
    w.pads = ring(9, 0.72, 10, 18);
    w.blots = Array.from({ length: 10 }, () => ({ x: w.cx + (rand() * 2 - 1) * w.rx * 0.8, y: w.cy + (rand() * 2 - 1) * w.ry * 0.8, r: 30 + rand() * 70, k: rand() }));
    w.tufts = Array.from({ length: 70 }, () => ({ x: rand() * W, y: rand() * H, r: 3 + rand() * 5, k: rand() }));
    const outside = (x: number, y: number, m: number) => ((x - w.cx) / (w.rx * m)) ** 2 + ((y - w.cy) / (w.ry * m)) ** 2 > 1;
    const clearOfPier = (x: number, y: number) => !(Math.abs(x - W / 2) < 52 && y > H * 0.76);
    const place = (tries: number, max: number, margin: number, rMin: number, rMax: number) => {
      const out: Decor[] = [];
      for (let i = 0; i < tries && out.length < max; i++) {
        const x = rand() * W;
        const y = rand() * H * 0.92;
        if (outside(x, y, margin) && clearOfPier(x, y)) out.push({ x, y, r: rMin + rand() * (rMax - rMin), k: rand() });
      }
      return out;
    };
    w.trees = place(60, 16, 1.28, 22, 46).sort((a, b) => a.y - b.y);
    w.flowers = place(140, 70, 1.12, 2, 4);
    w.stones = place(80, 26, 1.1, 3, 8);
    w.flies = Array.from({ length: 5 }, () => ({ x: w.cx + (rand() * 2 - 1) * w.rx, y: w.cy + (rand() * 2 - 1) * w.ry * 0.8, r: 18 + rand() * 40, k: rand() }));
    w.leaves = Array.from({ length: 6 }, () => ({ x: w.cx + (rand() * 2 - 1) * w.rx * 0.7, y: w.cy + (rand() * 2 - 1) * w.ry * 0.7, r: 3 + rand() * 2, k: rand() }));
    if (w.shadows.length === 0) {
      const list = cityRef.current.species;
      for (let i = 0; i < 7; i++) {
        const s = list[Math.floor(Math.random() * list.length)];
        const p = randomWater();
        w.shadows.push(makeShadow(s.min_cm + Math.random() * (s.max_cm - s.min_cm) * 0.5, s.shape, p.x, p.y, false));
      }
    } else {
      w.shadows.forEach((s) => {
        if (!inPond(s.x, s.y)) {
          const p = randomWater();
          s.x = p.x;
          s.y = p.y;
        }
      });
    }
  }, []);

  const addRipple = (x: number, y: number, max = 46, life = 1400) => {
    const w = world.current;
    w.ripples.push({ x, y, t0: performance.now(), life, max });
    if (w.ripples.length > 40) w.ripples.shift();
  };

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const steer = (s: Shadow, dt: number, tx: number, ty: number, turn: number) => {
      if (Math.hypot(tx - s.x, ty - s.y) < 4) return;
      let da = Math.atan2(ty - s.y, tx - s.x) - s.a;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      s.a += Math.max(-turn * dt, Math.min(turn * dt, da));
    };

    const update = (now: number, dt: number) => {
      const w = world.current;
      const k = w.k;
      w.ripples = w.ripples.filter((r) => now - r.t0 < r.life);
      w.bob.x += (w.bob.tx - w.bob.x) * Math.min(1, dt * 6);
      w.bob.y += (w.bob.ty - w.bob.y) * Math.min(1, dt * 6);
      let elapsed = 0;
      let remaining = 99;
      if (w.phase === "waiting" && w.cast) {
        elapsed = (now - w.t0) / 1000 + w.reduction;
        remaining = Math.max(w.cast.bite_in - elapsed, 0.25);
        if (now - w.lastRipple > 2600) {
          w.lastRipple = now;
          addRipple(w.bob.x, w.bob.y, 22, 1600);
        }
        if (elapsed >= w.cast.bite_in) {
          w.phase = "bite";
          w.biteAt = now;
          setPhaseState("bite");
          navigator.vibrate?.(80);
        }
      }
      if (w.phase === "bite") {
        w.bob.dip = 0.6 + 0.4 * Math.sin(now * 0.03);
        if (now - w.lastRipple > 260) {
          w.lastRipple = now;
          addRipple(w.bob.x, w.bob.y, 34, 900);
        }
        if (now - w.biteAt > w.biteWindow) {
          const c = w.cast;
          w.cast = null;
          w.bob.dip = 0;
          setPhase("idle");
          toast("Il pesce è scappato…");
          if (c) reelRef.current({ cast_id: c.cast_id, success: false });
        }
      } else if (w.phase === "reel") {
        w.bob.dip = 0.5 + 0.5 * Math.sin(now * 0.02);
        if (now - w.lastRipple > 200) {
          w.lastRipple = now;
          addRipple(w.bob.x, w.bob.y, 40, 800);
        }
      } else {
        w.bob.dip *= 0.85;
      }

      const wander = (s: Shadow, turn: number) => {
        if (s.retarget <= 0 || Math.hypot(s.tx - s.x, s.ty - s.y) < 14) {
          let p = randomWater();
          for (let i = 0; i < 6 && w.cast && Math.hypot(p.x - w.bob.x, p.y - w.bob.y) < 70; i++) p = randomWater();
          s.tx = p.x;
          s.ty = p.y;
          s.retarget = 3 + Math.random() * 4;
        }
        s.retarget -= dt;
        steer(s, dt, s.tx, s.ty, turn);
        const nx = s.x + Math.cos(s.a) * s.speed * k * dt;
        const ny = s.y + Math.sin(s.a) * s.speed * k * dt;
        if (inPond(nx, ny)) {
          s.x = nx;
          s.y = ny;
        } else {
          s.retarget = 0;
          steer(s, dt, w.cx, w.cy, 3);
        }
      };

      for (const s of w.shadows) {
        s.ph += dt * 5;
        const lureOn = !!w.cast && w.phase !== "idle";
        const dl = lureOn ? Math.hypot(s.x - w.bob.x, s.y - w.bob.y) : 9999;
        if (s.target && w.cast) {
          if (w.phase === "waiting" && remaining > 7) {
            wander(s, 1.4);
          } else {
            const near = Math.max(10, s.len * 0.6);
            if (dl > near + 3) {
              const sp = Math.max(12, Math.min(280, (dl - near) / Math.max(remaining, 0.3)));
              steer(s, dt, w.bob.x, w.bob.y, 3);
              s.x += Math.cos(s.a) * sp * dt;
              s.y += Math.sin(s.a) * sp * dt;
            } else {
              const thrash = w.phase === "reel" ? 26 : 6;
              s.x += Math.sin(now * (w.phase === "reel" ? 0.02 : 0.004) + s.ph) * thrash * dt;
              s.y += Math.cos(now * (w.phase === "reel" ? 0.017 : 0.0035) + s.ph) * thrash * dt;
            }
          }
          continue;
        }
        if (s.interest > 0 && w.phase === "waiting") {
          s.interest -= dt;
          const r = s.len * 0.7 + 30;
          s.tx = w.bob.x + Math.cos(s.orbit) * r;
          s.ty = w.bob.y + Math.sin(s.orbit) * r;
          const dd = Math.hypot(s.tx - s.x, s.ty - s.y);
          if (dd > 8) {
            steer(s, dt, s.tx, s.ty, 2.2);
            const sp = Math.min(s.speed * 1.6 * k, dd * 2);
            const nx = s.x + Math.cos(s.a) * sp * dt;
            const ny = s.y + Math.sin(s.a) * sp * dt;
            if (inPond(nx, ny)) {
              s.x = nx;
              s.y = ny;
            }
          } else {
            steer(s, dt, w.bob.x, w.bob.y, 1);
          }
          continue;
        }
        if (dl < 40) {
          s.x += ((s.x - w.bob.x) / Math.max(dl, 1)) * 35 * dt;
          s.y += ((s.y - w.bob.y) / Math.max(dl, 1)) * 35 * dt;
          s.retarget = 0;
        }
        wander(s, 1.3);
      }
    };

    const fishPath = (ctx: CanvasRenderingContext2D, s: Shadow) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.a);
      const L = s.len;
      const h = s.h;
      const wig = Math.sin(s.ph) * L * 0.1;
      const bend = Math.sin(s.ph) * h * 0.14;
      ctx.beginPath();
      ctx.moveTo(L * 0.5, 0);
      ctx.bezierCurveTo(L * 0.36, -h * 0.5, -L * 0.05, -h * 0.55, -L * 0.4, -h * 0.12 + bend);
      ctx.lineTo(-L * 0.42, h * 0.12 + bend);
      ctx.bezierCurveTo(-L * 0.05, h * 0.55, L * 0.36, h * 0.5, L * 0.5, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-L * 0.38, bend);
      ctx.lineTo(-L * 0.8, wig - h * 0.55);
      ctx.quadraticCurveTo(-L * 0.64, wig, -L * 0.8, wig + h * 0.55);
      ctx.closePath();
      ctx.fill();
      const fl = Math.sin(s.ph * 0.8) * h * 0.14;
      for (const sg of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(L * 0.2, sg * h * 0.36);
        ctx.lineTo(L * 0.04, sg * (h * 0.82 + fl));
        ctx.lineTo(-L * 0.06, sg * h * 0.4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };

    const draw = (now: number) => {
      const w = world.current;
      const ctx = w.ctx;
      if (!ctx || !w.path) return;
      const path = w.path;
      ctx.setTransform(w.dpr, 0, 0, w.dpr, 0, 0);
      const t = now / 1000;
      const px = w.W / 2;
      const py = w.H - 20;
      const bg = ctx.createLinearGradient(0, 0, 0, w.H);
      bg.addColorStop(0, "#2c5a2f");
      bg.addColorStop(1, "#244a27");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w.W, w.H);
      w.tufts.forEach((tf) => {
        ctx.fillStyle = tf.k > 0.5 ? "#2f6232" : "#356b38";
        ctx.beginPath();
        ctx.ellipse(tf.x, tf.y, tf.r * 1.8, tf.r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#3f7d42";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tf.x - 2, tf.y);
        ctx.lineTo(tf.x - 3, tf.y - tf.r * 1.6);
        ctx.moveTo(tf.x + 1, tf.y);
        ctx.lineTo(tf.x + 2, tf.y - tf.r * 2);
        ctx.stroke();
      });
      const cols = ["#f9a8d4", "#fde68a", "#ffffff", "#c4b5fd", "#fca5a5"];
      w.flowers.forEach((f, i) => {
        ctx.fillStyle = cols[i % cols.length];
        for (let a = 0; a < 5; a++) {
          ctx.beginPath();
          ctx.arc(f.x + Math.cos(a * 1.256) * f.r * 0.8, f.y + Math.sin(a * 1.256) * f.r * 0.8, f.r * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });
      const dirt = ctx.createLinearGradient(0, w.H * 0.7, 0, w.H);
      dirt.addColorStop(0, "rgba(140,112,70,0)");
      dirt.addColorStop(1, "rgba(140,112,70,0.85)");
      ctx.fillStyle = dirt;
      ctx.beginPath();
      ctx.moveTo(px - 26, w.H * 0.7);
      ctx.lineTo(px + 26, w.H * 0.7);
      ctx.lineTo(px + 70, w.H);
      ctx.lineTo(px - 70, w.H);
      ctx.closePath();
      ctx.fill();
      ctx.lineJoin = "round";
      ctx.lineWidth = 40;
      ctx.strokeStyle = "#1f4222";
      ctx.stroke(path);
      ctx.lineWidth = 28;
      ctx.strokeStyle = "#5c4a2e";
      ctx.stroke(path);
      ctx.lineWidth = 18;
      ctx.strokeStyle = "#a8926a";
      ctx.stroke(path);
      ctx.lineWidth = 9;
      ctx.strokeStyle = "#d8c593";
      ctx.stroke(path);
      const g = ctx.createRadialGradient(w.cx, w.cy - w.ry * 0.2, 10, w.cx, w.cy, w.rx * 1.05);
      g.addColorStop(0, "#3fb0d0");
      g.addColorStop(0.45, "#2184a8");
      g.addColorStop(0.8, "#175c7e");
      g.addColorStop(1, "#0f3d58");
      ctx.fillStyle = g;
      ctx.fill(path);
      [0.86, 0.68, 0.48].forEach((sc) => {
        ctx.save();
        ctx.translate(w.cx, w.cy);
        ctx.scale(sc, sc);
        ctx.translate(-w.cx, -w.cy);
        ctx.fillStyle = "rgba(4,32,54,0.2)";
        ctx.fill(path);
        ctx.restore();
      });
      ctx.save();
      ctx.clip(path);
      w.blots.forEach((b, i) => {
        ctx.fillStyle = `rgba(6,30,48,${0.08 + b.k * 0.1})`;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.r, b.r * 0.6, b.k * 3, 0, Math.PI * 2);
        ctx.fill();
        const lx = w.cx + Math.sin(t * 0.15 + i * 1.7) * w.rx * 0.6;
        const ly = w.cy + Math.cos(t * 0.12 + i * 2.3) * w.ry * 0.6;
        const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 70);
        lg.addColorStop(0, "rgba(255,255,255,0.09)");
        lg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = lg;
        ctx.fillRect(lx - 70, ly - 70, 140, 140);
      });
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 9; i++) {
        const y0 = w.cy - w.ry + (i / 8) * w.ry * 2;
        ctx.strokeStyle = `rgba(255,255,255,${0.035 + (i % 3) * 0.015})`;
        ctx.beginPath();
        for (let x = w.cx - w.rx; x <= w.cx + w.rx; x += 14) {
          const y = y0 + Math.sin(x * 0.03 + t * 0.8 + i) * 5 + Math.sin(x * 0.011 - t * 0.5) * 6;
          if (x === w.cx - w.rx) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      w.blots.forEach((b, i) => {
        const a = 0.5 + 0.5 * Math.sin(t * 1.8 + i * 2.1);
        ctx.fillStyle = `rgba(255,255,255,${0.18 * a})`;
        ctx.beginPath();
        ctx.arc(b.x + b.r * 0.4, b.y - b.r * 0.2, 1.8, 0, Math.PI * 2);
        ctx.arc(b.x - b.r * 0.5, b.y + b.r * 0.15, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
      w.shadows.forEach((s) => {
        ctx.fillStyle = "rgba(3,16,26,0.16)";
        fishPath(ctx, { ...s, x: s.x + 3, y: s.y + 4, len: s.len * 1.08, h: s.h * 1.2 });
        ctx.fillStyle = "rgba(3,16,26,0.34)";
        fishPath(ctx, s);
      });
      w.leaves.forEach((l, i) => {
        const lx = l.x + Math.sin(t * 0.2 + i) * 30;
        const ly = l.y + Math.cos(t * 0.17 + i * 1.3) * 18;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(t * 0.3 + i);
        ctx.fillStyle = i % 2 ? "#d97706" : "#84a331";
        ctx.beginPath();
        ctx.ellipse(0, 0, l.r * 1.4, l.r * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      w.ripples.forEach((r) => {
        const p = (now - r.t0) / r.life;
        ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - p)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, 4 + r.max * p, (4 + r.max * p) * 0.8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${0.22 * (1 - p)})`;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, (4 + r.max * p) * 0.6, (4 + r.max * p) * 0.48, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
      w.pads.forEach((p) => {
        const bx = p.x;
        const by = p.y + Math.sin(t * 0.6 + p.k * 6) * 1.2;
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.beginPath();
        ctx.ellipse(bx + 2, by + 3, p.r, p.r * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(p.k * 6);
        ctx.fillStyle = "#3f9a4a";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, p.r, 0.35, Math.PI * 2 - 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#58b862";
        ctx.beginPath();
        ctx.arc(-p.r * 0.2, -p.r * 0.2, p.r * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(20,70,30,0.5)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(p.r * 0.9, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(-p.r * 0.5, p.r * 0.7);
        ctx.moveTo(0, 0);
        ctx.lineTo(-p.r * 0.5, -p.r * 0.7);
        ctx.stroke();
        ctx.restore();
        if (p.k > 0.55) {
          ctx.fillStyle = "#fbcfe8";
          for (let a = 0; a < 6; a++) {
            ctx.beginPath();
            ctx.ellipse(bx + Math.cos(a * 1.047) * 3.4, by + Math.sin(a * 1.047) * 3.4, 2.6, 1.6, a * 1.047, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
      w.stones.forEach((r) => {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(r.x + 1, r.y + 2, r.r, r.r * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = r.k > 0.5 ? "#8b9097" : "#a29a8a";
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.r, r.r * 0.72, r.k, 0, Math.PI * 2);
        ctx.fill();
      });
      w.rocks.forEach((r) => {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(r.x + 2, r.y + 3, r.r * 1.05, r.r * 0.8, r.k, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#6c7279";
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.r, r.r * 0.75, r.k, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#858b92";
        ctx.beginPath();
        ctx.ellipse(r.x - r.r * 0.15, r.y - r.r * 0.15, r.r * 0.75, r.r * 0.5, r.k, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.beginPath();
        ctx.ellipse(r.x - r.r * 0.3, r.y - r.r * 0.3, r.r * 0.35, r.r * 0.22, r.k, 0, Math.PI * 2);
        ctx.fill();
        if (r.k > 0.5) {
          ctx.fillStyle = "rgba(77,138,62,0.75)";
          ctx.beginPath();
          ctx.ellipse(r.x + r.r * 0.3, r.y + r.r * 0.3, r.r * 0.45, r.r * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.lineCap = "round";
      w.reeds.forEach((r) => {
        const sway = Math.sin(t * 1.2 + r.k * 9) * 3;
        for (let i = -2; i <= 2; i++) {
          ctx.strokeStyle = i % 2 ? "#4d8a3e" : "#3f7a34";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(r.x + i * 2.6, r.y);
          ctx.quadraticCurveTo(r.x + i * 4 + sway * 0.5, r.y - r.r * 0.6, r.x + i * 6 + sway, r.y - r.r * (1 - Math.abs(i) * 0.12));
          ctx.stroke();
        }
        if (r.k > 0.5) {
          ctx.strokeStyle = "#5b8a3a";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(r.x + 2, r.y);
          ctx.quadraticCurveTo(r.x + 3 + sway * 0.6, r.y - r.r * 0.7, r.x + 3 + sway, r.y - r.r * 1.35);
          ctx.stroke();
          ctx.fillStyle = "#7c4a2a";
          ctx.beginPath();
          ctx.roundRect(r.x + 1.6 + sway, r.y - r.r * 1.35 - 5, 3.4, 10, 1.5);
          ctx.fill();
          ctx.fillStyle = "#a0653a";
          ctx.fillRect(r.x + 2.2 + sway, r.y - r.r * 1.35 - 4, 1, 8);
        }
      });
      w.trees.forEach((tr) => {
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.ellipse(tr.x + tr.r * 0.3, tr.y + tr.r * 0.45, tr.r * 1.05, tr.r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        const sw = Math.sin(t * 0.7 + tr.k * 8) * 1.2;
        const base = tr.k > 0.5 ? ["#1f5a2c", "#2a7038", "#388a45"] : ["#26602f", "#2f7a3a", "#3f9a4a"];
        ctx.fillStyle = base[0];
        ctx.beginPath();
        ctx.arc(tr.x + sw * 0.4, tr.y, tr.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = base[1];
        ctx.beginPath();
        ctx.arc(tr.x - tr.r * 0.14 + sw, tr.y - tr.r * 0.16, tr.r * 0.78, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = base[2];
        ctx.beginPath();
        ctx.arc(tr.x - tr.r * 0.28 + sw, tr.y - tr.r * 0.3, tr.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath();
        ctx.arc(tr.x - tr.r * 0.34 + sw, tr.y - tr.r * 0.38, tr.r * 0.2, 0, Math.PI * 2);
        ctx.fill();
      });
      w.flies.forEach((f, i) => {
        const fx = f.x + Math.sin(t * (0.5 + f.k) + i) * f.r + Math.sin(t * 2.3 + i) * 4;
        const fy = f.y + Math.cos(t * (0.4 + f.k * 0.6) + i * 2) * f.r * 0.6;
        const flap = Math.sin(t * 40 + i) * 0.5;
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(Math.atan2(Math.cos(t * (0.5 + f.k) + i), -Math.sin(t * (0.4 + f.k * 0.6) + i * 2)));
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.beginPath();
        ctx.ellipse(3, 10, 5, 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = i % 2 ? "#38bdf8" : "#f97316";
        ctx.fillRect(-6, -0.8, 12, 1.6);
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.beginPath();
        ctx.ellipse(1, -3.5, 4, 1.2 + Math.abs(flap), 0.3, 0, Math.PI * 2);
        ctx.ellipse(1, 3.5, 4, 1.2 + Math.abs(flap), -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      const py0 = w.H * 0.84;
      for (let y = py0, i = 0; y < w.H; y += 9, i++) {
        ctx.fillStyle = i % 2 ? "#8a6a43" : "#7d5f3b";
        ctx.fillRect(px - 24, y, 48, 8);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(px - 24, y, 48, 1.5);
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.fillRect(px - 24, y + 7.5, 48, 0.8);
      }
      ctx.strokeStyle = "#b58a58";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px - 24, py0);
      ctx.lineTo(px - 24, w.H);
      ctx.moveTo(px + 24, py0);
      ctx.lineTo(px + 24, w.H);
      ctx.stroke();
      ctx.fillStyle = "#6b7280";
      ctx.beginPath();
      ctx.ellipse(px + 17, py + 2, 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#374151";
      ctx.beginPath();
      ctx.ellipse(px + 17, py + 1, 4.2, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      const active = w.phase !== "idle";
      const tipX = active ? px + (w.bob.x - px) * 0.18 : px;
      const tipY = py - 38;
      ctx.strokeStyle = "#3f2a16";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(px, py - 4);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ctx.strokeStyle = "#8a5a34";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py - 4);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(px + 1, py + 3, 12, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2b6fd6";
      ctx.beginPath();
      ctx.ellipse(px, py, 11, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#388bfd";
      ctx.beginPath();
      ctx.ellipse(px - 1, py - 1, 8.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f2c9a0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px - 6, py - 4);
      ctx.lineTo(px - 2, py - 10);
      ctx.moveTo(px + 6, py - 4);
      ctx.lineTo(px + 1, py - 9);
      ctx.stroke();
      ctx.fillStyle = "#c9d1d9";
      ctx.beginPath();
      ctx.arc(px, py - 8, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f2c9a0";
      ctx.beginPath();
      ctx.arc(px, py + 1, 5.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e3b341";
      ctx.beginPath();
      ctx.arc(px, py + 1, 7.5, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#c99a2a";
      ctx.beginPath();
      ctx.ellipse(px, py - 1.5, 9.5, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
      if (active) {
        const b = w.bob;
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.quadraticCurveTo((tipX + b.x) / 2, Math.max(tipY, b.y) + 16, b.x, b.y);
        ctx.stroke();
        const sc = 1 - 0.35 * b.dip;
        ctx.save();
        ctx.translate(b.x, b.y + b.dip * 2);
        ctx.scale(sc, sc);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.arc(2, 3, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(0, 0, 7, Math.PI, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath();
        ctx.arc(-2.2, -2.8, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      const vg = ctx.createRadialGradient(w.W / 2, w.H * 0.45, Math.min(w.W, w.H) * 0.35, w.W / 2, w.H * 0.5, Math.max(w.W, w.H) * 0.75);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,12,4,0.38)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w.W, w.H);
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (world.current.W > 0) {
        update(now, dt);
        draw(now);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [setPhase]);

  const startCast = async (x: number, y: number) => {
    const w = world.current;
    if (cast.isPending) return;
    setPhase("casting");
    w.bob.x = w.W / 2;
    w.bob.y = w.H - 50;
    w.bob.tx = x;
    w.bob.ty = y;
    w.bob.dip = 0;
    try {
      const info = await cast.mutateAsync(baitRef.current);
      const far = randomWater();
      w.shadows = w.shadows.filter((s) => !s.target);
      w.shadows.forEach((s) => (s.interest = 0));
      w.shadows.push(makeShadow(info.length, info.shape as keyof typeof SHAPES, far.x, far.y, true));
      w.cast = info;
      w.t0 = performance.now();
      w.reduction = 0;
      w.lastJig = performance.now();
      w.lastRipple = performance.now();
      w.biteWindow = info.bite_window * 1000;
      setFight({ difficulty: info.difficulty, strength: info.strength, dash: info.dash, head: 0 });
      addRipple(x, y, 50, 1200);
      window.setTimeout(() => addRipple(x, y, 30, 900), 180);
      window.setTimeout(() => addRipple(x, y, 18, 700), 360);
      setPhase("waiting");
    } catch {
      setPhase("idle");
    }
  };

  const jig = (x: number, y: number) => {
    const w = world.current;
    const now = performance.now();
    w.bob.tx = x;
    w.bob.ty = y;
    addRipple(x, y, 44, 1200);
    if (now - w.lastJig < JIG_COOLDOWN || !w.cast) return;
    w.lastJig = now;
    const cap = w.cast.bite_in * 0.4;
    w.reduction = Math.min(cap, w.reduction + 1.5 + Math.random() * 1.5);
    w.shadows.forEach((s) => {
      if (!s.target && Math.hypot(s.x - x, s.y - y) < 190) {
        s.interest = 3 + Math.random() * 3;
        s.orbit = Math.random() * Math.PI * 2;
      }
    });
  };

  const pull = () => {
    const w = world.current;
    if (w.phase !== "bite") return;
    navigator.vibrate?.(40);
    const react = performance.now() - w.biteAt;
    const head = react < 450 ? 0.3 : react < 1000 ? 0.18 : 0.06;
    if (react < 450) toast("Reazione fulminea!");
    setFight((f) => ({ ...f, head }));
    setPhase("reel");
  };

  const retract = () => {
    const w = world.current;
    const c = w.cast;
    w.cast = null;
    w.bob.dip = 0;
    w.shadows = w.shadows.filter((s) => !s.target);
    setPhase("idle");
    if (c) reel.mutate({ cast_id: c.cast_id, success: false });
  };

  const onPointer = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const w = world.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * w.W) / rect.width;
    const y = ((e.clientY - rect.top) * w.H) / rect.height;
    if (w.phase === "bite") return pull();
    if (w.phase !== "idle" && w.phase !== "waiting") return;
    if (!inPond(x, y)) {
      toast("Tocca un punto dell'acqua");
      return;
    }
    if (w.phase === "idle") void startCast(x, y);
    else jig(x, y);
  };

  const onReelEnd = async (ok: boolean) => {
    const w = world.current;
    const c = w.cast;
    w.cast = null;
    w.bob.dip = 0;
    w.shadows = w.shadows.filter((s) => !s.target);
    if (!c) return setPhase("idle");
    try {
      const res = await reel.mutateAsync({ cast_id: c.cast_id, success: ok });
      if (ok && res.fish) {
        setCaught(res.fish);
        setPhase("result");
      } else {
        toast("Il pesce è scappato…");
        setPhase("idle");
      }
    } catch {
      setPhase("idle");
    }
  };

  const closeCatch = () => {
    setCaught(null);
    setPhase("idle");
  };

  const hint: Record<Phase, string> = {
    idle: "Scegli l'esca e tocca un punto dell'acqua per lanciare.",
    casting: "Lancio in corso…",
    waiting: "Aspetta che abbocchi. Tocca un altro punto per muovere l'esca e attirare i pesci (ogni tanto).",
    bite: "Abbocca! Tocca subito per tirare: più sei veloce, più vantaggio hai!",
    reel: "Recupera il pesce!",
    result: "",
  };

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="pond-view">
      <div ref={wrap} className="relative min-h-0 flex-1 overflow-hidden bg-[#274e2a]">
        <canvas ref={canvas} onPointerDown={onPointer} className="absolute inset-0 size-full touch-manipulation" style={{ cursor: phase === "idle" || phase === "waiting" ? "crosshair" : "default" }} data-testid="pond-canvas" />
        {hint[phase] && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-4">
            <p className={cn("max-w-xl rounded-full px-4 py-1.5 text-center text-sm text-white shadow-lg backdrop-blur", phase === "bite" ? "animate-bounce bg-[#F85149] font-semibold" : "bg-black/55")} data-testid="pond-hint">
              {hint[phase]}
            </p>
          </div>
        )}
        {phase === "reel" && <ReelGame difficulty={fight.difficulty} strength={fight.strength} dash={fight.dash} head={fight.head} onEnd={onReelEnd} />}
      </div>

      <div className="border-t border-[#30363D] bg-[#161B22] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Esca">
            {city.baits.map((b) => (
              <button
                key={b.id}
                type="button"
                role="radio"
                aria-checked={bait === b.id}
                disabled={phase !== "idle"}
                title={b.description}
                onClick={() => setBait(b.id)}
                data-testid={`bait-${b.id}`}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-colors duration-150 disabled:opacity-50",
                  bait === b.id ? "border-[#388BFD] bg-[#388BFD]/15 text-[#F0F6FC]" : "border-[#30363D] bg-[#0D1117] text-[#8B949E] hover:text-[#F0F6FC]",
                )}
              >
                {b.name}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            {phase === "bite" && (
              <Button size="lg" onClick={pull} data-testid="pond-pull">
                <Hand /> Tira!
              </Button>
            )}
            {phase === "waiting" && (
              <Button size="lg" variant="outline" onClick={retract} data-testid="pond-retract">
                <Undo2 /> Ritira
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={onBucket} data-testid="pond-bucket-button">
              <Package /> Secchio ({city.bucket.length})
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-[#8B949E]">{city.baits.find((b) => b.id === bait)?.description}</p>
      </div>

      <CatchDialog fish={caught} city={city} onClose={closeCatch} />
    </div>
  );
}
