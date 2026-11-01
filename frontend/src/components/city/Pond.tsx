import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Hand, Package, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useCityActions, type CastInfo, type CatchInfo, type CityState } from "@/lib/city";
import { cn } from "@/lib/utils";
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
  reeds: Decor[];
  rocks: Decor[];
  pads: Decor[];
  blots: Decor[];
  tufts: Decor[];
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

const pxLen = (cm: number, W: number) => Math.min(150, 16 + Math.sqrt(cm) * 9) * Math.max(0.55, Math.min(1.1, W / 700));

export default function Pond({ city, onBucket }: { city: CityState; onBucket: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [bait, setBait] = useState("pane");
  const [caught, setCaught] = useState<CatchInfo | null>(null);
  const [difficulty, setDifficulty] = useState(1);
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
    reeds: [],
    rocks: [],
    pads: [],
    blots: [],
    tufts: [],
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
    const len = pxLen(cm, w.W);
    return { x, y, a: Math.random() * Math.PI * 2, speed: 14 + Math.random() * 18, len, h: (len * spec.h) / spec.len, ph: Math.random() * 6, tx: x, ty: y, retarget: 0, interest: 0, target };
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
    w.rx = W * 0.45;
    w.ry = H * 0.39;
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
      let da = Math.atan2(ty - s.y, tx - s.x) - s.a;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      s.a += Math.max(-turn * dt, Math.min(turn * dt, da));
    };

    const update = (now: number, dt: number) => {
      const w = world.current;
      const k = Math.max(0.55, Math.min(1.1, w.W / 700));
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
        if (now - w.biteAt > BITE_WINDOW) {
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

      for (const s of w.shadows) {
        s.ph += dt * 5;
        const nearLure = w.cast && w.phase !== "idle" ? Math.hypot(s.x - w.bob.x, s.y - w.bob.y) : 9999;
        if (s.target && w.cast) {
          if (w.phase === "waiting" && remaining > 7) {
            if (s.retarget <= 0 || Math.hypot(s.tx - s.x, s.ty - s.y) < 12) {
              const p = randomWater();
              s.tx = p.x;
              s.ty = p.y;
              s.retarget = 3 + Math.random() * 3;
            }
            s.retarget -= dt;
            steer(s, dt, s.tx, s.ty, 1.4);
            s.x += Math.cos(s.a) * s.speed * k * dt;
            s.y += Math.sin(s.a) * s.speed * k * dt;
            if (!inPond(s.x, s.y)) {
              s.a += Math.PI;
              s.retarget = 0;
            }
          } else {
            const dist = Math.hypot(w.bob.x - s.x, w.bob.y - s.y);
            const near = Math.max(8, s.len * 0.55);
            if (dist > near) {
              const sp = Math.max(12, Math.min(280, (dist - near) / Math.max(remaining, 0.3)));
              steer(s, dt, w.bob.x, w.bob.y, 4);
              s.x += Math.cos(s.a) * sp * dt;
              s.y += Math.sin(s.a) * sp * dt;
            } else {
              s.x += Math.sin(now * 0.02 + s.ph) * 20 * dt;
              s.y += Math.cos(now * 0.017 + s.ph) * 20 * dt;
            }
          }
          continue;
        }
        if (s.interest > 0 && w.phase === "waiting") {
          s.interest -= dt;
          s.tx = w.bob.x + Math.cos(s.ph * 0.4) * (s.len * 0.7 + 26);
          s.ty = w.bob.y + Math.sin(s.ph * 0.4) * (s.len * 0.7 + 26);
          steer(s, dt, s.tx, s.ty, 2.6);
          s.x += Math.cos(s.a) * s.speed * 1.6 * k * dt;
          s.y += Math.sin(s.a) * s.speed * 1.6 * k * dt;
          continue;
        }
        if (s.retarget <= 0 || Math.hypot(s.tx - s.x, s.ty - s.y) < 14) {
          const p = randomWater();
          s.tx = p.x;
          s.ty = p.y;
          s.retarget = 3 + Math.random() * 4;
        }
        s.retarget -= dt;
        steer(s, dt, s.tx, s.ty, 1.3);
        const nx = s.x + Math.cos(s.a) * s.speed * k * dt;
        const ny = s.y + Math.sin(s.a) * s.speed * k * dt;
        if (inPond(nx, ny) && nearLure > 18) {
          s.x = nx;
          s.y = ny;
        } else {
          s.a += Math.PI * 0.7;
          s.retarget = 0;
        }
      }
    };

    const fishPath = (ctx: CanvasRenderingContext2D, s: Shadow) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.a);
      const wig = Math.sin(s.ph) * s.len * 0.12;
      ctx.beginPath();
      ctx.ellipse(0, 0, s.len * 0.5, s.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s.len * 0.42, 0);
      ctx.lineTo(-s.len * 0.82, wig - s.h * 0.45);
      ctx.lineTo(-s.len * 0.7, wig);
      ctx.lineTo(-s.len * 0.82, wig + s.h * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const draw = (now: number) => {
      const w = world.current;
      const ctx = w.ctx;
      if (!ctx || !w.path) return;
      ctx.setTransform(w.dpr, 0, 0, w.dpr, 0, 0);
      ctx.fillStyle = "#274e2a";
      ctx.fillRect(0, 0, w.W, w.H);
      ctx.fillStyle = "#2f5e31";
      w.tufts.forEach((t) => {
        ctx.beginPath();
        ctx.ellipse(t.x, t.y, t.r * 1.6, t.r, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.lineWidth = 14;
      ctx.strokeStyle = "#6d5a3a";
      ctx.stroke(w.path);
      const g = ctx.createRadialGradient(w.cx, w.cy, 10, w.cx, w.cy, w.rx);
      g.addColorStop(0, "#2a8fb3");
      g.addColorStop(0.6, "#1d6f93");
      g.addColorStop(1, "#12445f");
      ctx.fillStyle = g;
      ctx.fill(w.path);
      ctx.save();
      ctx.clip(w.path);
      const t = now / 1000;
      w.blots.forEach((b, i) => {
        ctx.fillStyle = `rgba(6,30,48,${0.1 + b.k * 0.1})`;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.r, b.r * 0.6, b.k * 3, 0, Math.PI * 2);
        ctx.fill();
        const lx = w.cx + Math.sin(t * 0.15 + i * 1.7) * w.rx * 0.6;
        const ly = w.cy + Math.cos(t * 0.12 + i * 2.3) * w.ry * 0.6;
        const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 60);
        lg.addColorStop(0, "rgba(255,255,255,0.07)");
        lg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = lg;
        ctx.fillRect(lx - 60, ly - 60, 120, 120);
      });
      w.shadows.forEach((s) => {
        ctx.fillStyle = "rgba(3,16,26,0.2)";
        fishPath(ctx, { ...s, len: s.len * 1.08, h: s.h * 1.2 });
        ctx.fillStyle = "rgba(3,16,26,0.3)";
        fishPath(ctx, s);
      });
      w.ripples.forEach((r) => {
        const p = (now - r.t0) / r.life;
        ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - p)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 4 + r.max * p, 0, Math.PI * 2);
        ctx.stroke();
      });
      w.pads.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y + Math.sin(t * 0.6 + p.k * 6) * 1.2);
        ctx.rotate(p.k * 6);
        ctx.fillStyle = "#3f9a4a";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, p.r, 0.35, Math.PI * 2 - 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        if (p.k > 0.7) {
          ctx.fillStyle = "#f9a8d4";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
      w.rocks.forEach((r) => {
        ctx.fillStyle = "#7b8087";
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.r, r.r * 0.75, r.k, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.beginPath();
        ctx.ellipse(r.x - r.r * 0.2, r.y - r.r * 0.2, r.r * 0.45, r.r * 0.3, r.k, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.strokeStyle = "#4d8a3e";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      w.reeds.forEach((r) => {
        const sway = Math.sin(t * 1.2 + r.k * 9) * 3;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(r.x + i * 3, r.y);
          ctx.quadraticCurveTo(r.x + i * 4 + sway * 0.5, r.y - r.r * 0.6, r.x + i * 6 + sway, r.y - r.r);
          ctx.stroke();
        }
        if (r.k > 0.6) {
          ctx.fillStyle = "#7c4a2a";
          ctx.fillRect(r.x + sway - 1.5, r.y - r.r - 3, 3, 7);
        }
      });
      const px = w.W / 2;
      const py = w.H - 20;
      ctx.fillStyle = "#8a6a43";
      ctx.fillRect(px - 15, w.H * 0.9, 30, w.H * 0.1);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      for (let i = 0; i < 4; i++) ctx.fillRect(px - 15, w.H * 0.9 + i * 10, 30, 1.5);
      const active = w.phase !== "idle";
      const tipX = active ? px + (w.bob.x - px) * 0.18 : px;
      const tipY = py - 38;
      ctx.strokeStyle = "#5b3b1f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, py - 4);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ctx.fillStyle = "#388bfd";
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f2c9a0";
      ctx.beginPath();
      ctx.arc(px, py, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e3b341";
      ctx.beginPath();
      ctx.arc(px, py + 1, 8, Math.PI, Math.PI * 2);
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
        ctx.restore();
      }
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
      const spec = cityRef.current.species.filter((s) => info.length >= s.min_cm && info.length <= s.max_cm);
      const pool = spec.length ? spec : cityRef.current.species;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const far = randomWater();
      w.shadows = w.shadows.filter((s) => !s.target);
      w.shadows.forEach((s) => (s.interest = 0));
      w.shadows.push(makeShadow(info.length, pick.shape, far.x, far.y, true));
      w.cast = info;
      w.t0 = performance.now();
      w.reduction = 0;
      w.lastJig = performance.now();
      w.lastRipple = performance.now();
      setDifficulty(info.difficulty);
      addRipple(x, y, 50, 1200);
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
      if (!s.target && Math.hypot(s.x - x, s.y - y) < 190) s.interest = 3 + Math.random() * 3;
    });
  };

  const pull = () => {
    const w = world.current;
    if (w.phase !== "bite") return;
    navigator.vibrate?.(40);
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
    bite: "Abbocca! Tocca per tirare!",
    reel: "Recupera il pesce!",
    result: "",
  };

  return (
    <div className="space-y-3" data-testid="pond-view">
      <div ref={wrap} className="relative h-[60dvh] min-h-[380px] w-full overflow-hidden rounded-xl border border-[#30363D] bg-[#274e2a] sm:h-[540px]">
        <canvas ref={canvas} onPointerDown={onPointer} className="absolute inset-0 size-full touch-manipulation" style={{ cursor: phase === "idle" || phase === "waiting" ? "crosshair" : "default" }} data-testid="pond-canvas" />
        {phase === "bite" && (
          <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
            <span className="animate-bounce rounded-full bg-[#F85149] px-4 py-1.5 text-sm font-semibold text-white shadow-lg">Abbocca!</span>
          </div>
        )}
        {phase === "reel" && <ReelGame difficulty={difficulty} onEnd={onReelEnd} />}
      </div>

      <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-3">
        <p className="mb-3 min-h-5 text-sm text-[#C9D1D9]" data-testid="pond-hint">
          {hint[phase]}
        </p>
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
