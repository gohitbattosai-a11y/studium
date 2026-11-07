import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Package } from "lucide-react";
import { ANIMALS, type AnimalSpecies } from "@/lib/domain/animals";
import { useSandbox } from "@/lib/runtime/sandbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AnimalArt from "./AnimalArt";
import Wings from "./Wings";
import AnimalBag from "./AnimalBag";
import { RarityTag, fmtWhen } from "./Bucket";
import { ANCHORS, LAKE, MINI, WORLD_H, WORLD_W, WildWorld, inLake, type Anchor } from "./WildWorld";
import "./city.css";
import "./forest.css";
import "./wild.css";

type Mode = "walk" | "hop" | "fly" | "idle";

interface Sim {
  sp: AnimalSpecies;
  home: Anchor;
  fly: boolean;
  hop: boolean;
  w: number;
  h: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  hx: number;
  hy: number;
  v: number;
  max: number;
  wait: number;
  dir: 1 | -1;
  mode: Mode;
  seed: number;
  z: number;
  sd: number;
}

interface Node {
  root: HTMLDivElement | null;
  flip: HTMLDivElement | null;
  inner: HTMLDivElement | null;
  shadow: HTMLDivElement | null;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const BIOMES = {
  graze: ["meadow", "shore", "grove", "south", "plaza", "meadow"],
  hop: ["meadow", "grove", "south", "forest", "shore"],
  other: ["forest", "heights", "grove", "forest", "heights", "south"],
};

function pickPoint(home: Anchor, fly: boolean) {
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.sqrt(Math.random()) * home.r;
    const x = clamp(home.x + Math.cos(a) * d, 90, WORLD_W - 90);
    const y = clamp(home.y + Math.sin(a) * d * 0.75, 200, WORLD_H - 40);
    if (fly || !inLake(x, y, 30)) return { x, y };
  }
  return { x: home.x, y: home.y };
}

function makeSim(sp: AnimalSpecies): Sim {
  const fly = sp.behavior === "fly";
  const hop = sp.behavior === "hop";
  const set = fly ? ["sky"] : hop ? BIOMES.hop : sp.behavior === "graze" ? BIOMES.graze : BIOMES.other;
  const home = ANCHORS[set[hash(sp.id) % set.length]];
  const p = pickPoint(home, fly);
  const t = pickPoint(home, fly);
  const w = clamp(Math.round(125 * sp.scale), 70, 260);
  const base = fly ? 95 : hop ? 70 : sp.behavior === "graze" ? 30 : 42;
  return { sp, home, fly, hop, w, h: w * 0.75, x: p.x, y: p.y, tx: t.x, ty: t.y, hx: 1, hy: 0, v: 0, max: base * Math.max(0.6, sp.speed), wait: Math.random() * 3, dir: Math.random() < 0.5 ? 1 : -1, mode: "idle", seed: Math.random() * 10, z: -1, sd: -1 };
}

export default function AnimalRoom() {
  const sb = useSandbox();
  const [bag, setBag] = useState(false);
  const [sel, setSel] = useState<AnimalSpecies | null>(null);
  const gifts = useMemo(() => new Map(sb.animalMuseum.map((g) => [g.species_id, g])), [sb.animalMuseum]);
  const sims = useMemo(() => ANIMALS.map(makeSim), []);
  const total = ANIMALS.length;
  const done = gifts.size;
  const gift = sel ? gifts.get(sel.id) : undefined;

  const view = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const rect = useRef<SVGRectElement>(null);
  const nodes = useRef<Node[]>([]);
  const cam = useRef({ x: 0, y: 0, vx: 0, vy: 0, k: 0.8, vw: 0, vh: 0, ready: false });
  const keys = useRef(new Set<string>());
  const drag = useRef({ on: false, moved: false, sx: 0, sy: 0, cx: 0, cy: 0, lx: 0, ly: 0, lt: 0 });

  const clampCam = useCallback(() => {
    const c = cam.current;
    c.x = clamp(c.x, 0, Math.max(0, WORLD_W * c.k - c.vw));
    c.y = clamp(c.y, 0, Math.max(0, WORLD_H * c.k - c.vh));
  }, []);

  const centerOn = useCallback(
    (lx: number, ly: number) => {
      const c = cam.current;
      c.x = lx * c.k - c.vw / 2;
      c.y = ly * c.k - c.vh / 2;
      c.vx = 0;
      c.vy = 0;
      clampCam();
    },
    [clampCam],
  );

  useEffect(() => {
    const el = view.current;
    if (!el) return;
    const measure = () => {
      const c = cam.current;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      if (!vw || !vh) return;
      const prevCx = c.ready ? (c.x + c.vw / 2) / c.k : 900;
      const prevCy = c.ready ? (c.y + c.vh / 2) / c.k : 1700;
      c.vw = vw;
      c.vh = vh;
      c.k = Math.max(clamp(Math.min(vh / 820, vw / 1000), 0.5, 1.15), vw / WORLD_W, vh / WORLD_H);
      c.ready = true;
      centerOn(prevCx, prevCy);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) return;
      cam.current.x += e.deltaX;
      cam.current.y += e.deltaY;
      clampCam();
    };
    const gesture = (e: Event) => e.preventDefault();
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("gesturestart", gesture);
    el.addEventListener("gesturechange", gesture);
    return () => {
      ro.disconnect();
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("gesturestart", gesture);
      el.removeEventListener("gesturechange", gesture);
    };
  }, [centerOn, clampCam]);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (document.querySelector("[data-slot='dialog-content']")) return;
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        e.preventDefault();
        keys.current.add(k);
      }
    };
    const ku = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const pause = (s: Sim) => (s.fly ? 0 : s.hop ? 0.6 + Math.random() * 1.6 : s.sp.behavior === "graze" ? 2 + Math.random() * 4 : 1.5 + Math.random() * 3);
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const c = cam.current;
      if (c.ready) {
        const kk = keys.current;
        const ax = (kk.has("arrowright") || kk.has("d") ? 1 : 0) - (kk.has("arrowleft") || kk.has("a") ? 1 : 0);
        const ay = (kk.has("arrowdown") || kk.has("s") ? 1 : 0) - (kk.has("arrowup") || kk.has("w") ? 1 : 0);
        if (ax || ay) {
          c.vx += (ax * 900 - c.vx) * Math.min(1, dt * 6);
          c.vy += (ay * 900 - c.vy) * Math.min(1, dt * 6);
        }
        if (!drag.current.on) {
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          if (!ax && !ay) {
            const f = Math.exp(-4 * dt);
            c.vx *= f;
            c.vy *= f;
          }
        }
        clampCam();
        if (world.current) world.current.style.transform = `translate3d(${-c.x}px, ${-c.y}px, 0) scale(${c.k})`;
        if (rect.current) {
          rect.current.setAttribute("x", String(c.x / c.k));
          rect.current.setAttribute("y", String(c.y / c.k));
          rect.current.setAttribute("width", String(c.vw / c.k));
          rect.current.setAttribute("height", String(c.vh / c.k));
        }
      }
      const t = now / 1000;
      sims.forEach((s, i) => {
        const n = nodes.current[i];
        if (!n?.root) return;
        if (s.wait > 0) {
          s.wait -= dt;
          s.v = Math.max(0, s.v - 140 * dt);
        } else {
          const dx = s.tx - s.x;
          const dy = s.ty - s.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 12) {
            const p = pickPoint(s.home, s.fly);
            s.tx = p.x;
            s.ty = p.y;
            s.wait = pause(s);
          } else {
            s.hx += (dx / dist - s.hx) * Math.min(1, dt * 2.4);
            s.hy += (dy / dist - s.hy) * Math.min(1, dt * 2.4);
            const hl = Math.hypot(s.hx, s.hy) || 1;
            s.hx /= hl;
            s.hy /= hl;
            s.v += (s.max - s.v) * Math.min(1, dt * 1.6);
            const nx = clamp(s.x + s.hx * s.v * dt, 90, WORLD_W - 90);
            const ny = clamp(s.y + s.hy * s.v * dt, 200, WORLD_H - 30);
            if (!s.fly && inLake(nx, ny, 24)) {
              const p = pickPoint(s.home, false);
              s.tx = p.x;
              s.ty = p.y;
              s.v = 0;
              s.wait = 0.4;
            } else {
              s.x = nx;
              s.y = ny;
            }
          }
        }
        const moving = s.wait <= 0 && s.v > 6;
        const mode: Mode = s.fly ? "fly" : moving ? (s.hop ? "hop" : "walk") : "idle";
        if (moving && Math.abs(s.hx) > 0.25) {
          const d: 1 | -1 = s.hx > 0 ? 1 : -1;
          if (d !== s.dir) {
            s.dir = d;
            if (n.flip) n.flip.style.transform = `scaleX(${d})`;
          }
        }
        if (mode !== s.mode) {
          s.mode = mode;
          if (n.inner) n.inner.className = `wl-${mode}`;
        }
        const alt = s.fly ? 90 * s.sp.scale + 40 + Math.sin(t * 0.8 + s.seed) * 14 : 0;
        n.root.style.transform = `translate3d(${s.x - s.w / 2}px, ${s.y - s.h * 0.94 - alt}px, 0)`;
        const z = Math.round((s.y + (s.fly ? 600 : 0)) / 6);
        if (z !== s.z) {
          s.z = z;
          n.root.style.zIndex = String(z * 6);
          if (n.shadow) n.shadow.style.zIndex = String(Math.round(s.y) - 1);
        }
        const sd = Math.round(clamp(0.9 - s.v / 140, 0.32, 0.9) * 10) / 10;
        if (sd !== s.sd) {
          s.sd = sd;
          if (n.inner) n.inner.style.setProperty("--sd", `${sd}s`);
        }
        if (n.shadow) {
          n.shadow.style.transform = `translate3d(${s.x - s.w * 0.35}px, ${s.y - 8}px, 0) scale(${clamp(1 - alt / 420, 0.5, 1)})`;
        }
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [sims, clampCam]);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-slot='dialog-content'],[data-slot='dialog-overlay']")) return;
    const d = drag.current;
    const c = cam.current;
    d.on = true;
    d.moved = false;
    d.sx = e.clientX;
    d.sy = e.clientY;
    d.cx = c.x;
    d.cy = c.y;
    d.lx = e.clientX;
    d.ly = e.clientY;
    d.lt = performance.now();
    c.vx = 0;
    c.vy = 0;
    const move = (ev: PointerEvent) => {
      if (!d.on) return;
      const dx = ev.clientX - d.sx;
      const dy = ev.clientY - d.sy;
      if (!d.moved && Math.hypot(dx, dy) > 6) d.moved = true;
      if (!d.moved) return;
      c.x = d.cx - dx;
      c.y = d.cy - dy;
      clampCam();
      const now = performance.now();
      const dtm = Math.max(1, now - d.lt) / 1000;
      c.vx = c.vx * 0.6 + (-(ev.clientX - d.lx) / dtm) * 0.4;
      c.vy = c.vy * 0.6 + (-(ev.clientY - d.ly) / dtm) * 0.4;
      d.lx = ev.clientX;
      d.ly = ev.clientY;
      d.lt = now;
    };
    const up = () => {
      d.on = false;
      if (performance.now() - d.lt > 90) {
        c.vx = 0;
        c.vy = 0;
      }
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const open = (s: Sim) => {
    if (drag.current.moved) return;
    s.wait = 3;
    s.v = 0;
    setSel(s.sp);
  };

  const jump = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    centerOn(((e.clientX - r.left) / r.width) * WORLD_W, ((e.clientY - r.top) / r.height) * WORLD_H);
  };

  return (
    <div ref={view} className="absolute inset-0 touch-none overflow-hidden bg-[#4f9a4f] select-none" onPointerDown={onDown} data-testid="animal-room">
      <div ref={world} className="absolute top-0 left-0 isolate origin-top-left will-change-transform" style={{ width: WORLD_W, height: WORLD_H }}>
        <WildWorld />
        {sims.map((s, i) => {
          const owned = gifts.has(s.sp.id);
          const setNode = (k: keyof Node) => (el: HTMLDivElement | null) => {
            const n = nodes.current[i] ?? (nodes.current[i] = { root: null, flip: null, inner: null, shadow: null });
            n[k] = el;
          };
          return (
            <div key={s.sp.id}>
              {s.fly && <div ref={setNode("shadow")} className="pointer-events-none absolute top-0 left-0 rounded-[50%] bg-black/25" style={{ width: s.w * 0.7, height: s.w * 0.16 }} />}
              <div ref={setNode("root")} className="absolute top-0 left-0" style={{ width: s.w, height: s.h, willChange: "transform" }}>
                <button type="button" onClick={() => open(s)} className="block size-full cursor-pointer outline-none" aria-label={owned ? s.sp.name : "Animale sconosciuto"} data-testid={`park-animal-${s.sp.id}`}>
                  <div ref={setNode("flip")} className="size-full" style={{ transform: `scaleX(${s.dir})` }}>
                    <div ref={setNode("inner")} className="wl-idle relative size-full">
                      {s.fly && <Wings a={s.sp} silhouette={!owned} />}
                      <AnimalArt a={s.sp} silhouette={!owned} className="size-full overflow-visible" />
                    </div>
                  </div>
                </button>
                {!owned && <span className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-1.5 text-[11px] font-bold text-[#E3B341]">?</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,246,200,0.28),transparent_55%),radial-gradient(ellipse_at_50%_50%,transparent_60%,rgba(8,30,16,0.5))]" />
      <div className="pointer-events-none absolute inset-x-0 top-14 flex justify-center px-3">
        <div className="rounded-xl border border-[#e3b341]/70 bg-[#2a1d0f]/85 px-4 py-1.5 text-center shadow-xl backdrop-blur">
          <p className="text-[10px] font-medium tracking-wider text-[#e3cfa0] uppercase">Riserva naturale</p>
          <p className="text-lg leading-none font-bold tabular-nums text-[#fff3c4]">
            {done}/{total}
          </p>
          <div className="mx-auto mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full bg-gradient-to-r from-[#e3b341] to-[#f0883e]" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </div>
        </div>
      </div>
      <div className="wl-hint pointer-events-none absolute inset-x-0 bottom-24 flex justify-center">
        <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">Trascina per esplorare · tocca un animale per conoscerlo</span>
      </div>
      <div className="absolute bottom-4 left-4 z-[3] overflow-hidden rounded-lg border border-white/25 bg-[#12301c]/80 shadow-xl backdrop-blur" style={{ width: 150 }} onPointerDown={jump} data-testid="animal-minimap">
        <svg viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} className="block w-full" aria-hidden>
          <rect width={WORLD_W} height={WORLD_H} fill="#6bb85d" />
          <path d="M2200 0 H3600 V520 C3200 600 2600 520 2300 480 C2200 400 2160 200 2200 0Z" fill="#8a948a" />
          <ellipse cx={LAKE.x} cy={LAKE.y} rx={LAKE.rx} ry={LAKE.ry} fill="#4aa9c9" />
          <path d={MINI.stream} fill="none" stroke="#4aa9c9" strokeWidth="90" strokeLinecap="round" />
          <path d={MINI.path} fill="none" stroke="#e3c98f" strokeWidth="110" strokeLinecap="round" />
          <rect ref={rect} fill="rgba(255,255,255,0.18)" stroke="#ffffff" strokeWidth="26" />
        </svg>
      </div>
      <Button variant="secondary" size="lg" className="absolute right-4 bottom-4 z-[3]" onClick={() => setBag(true)} onPointerDown={(e) => e.stopPropagation()} data-testid="animal-room-bag">
        <Package /> Zaino ({sb.animalBag.length})
      </Button>
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="sm:max-w-md">
          {sel && (
            <>
              <DialogHeader>
                <DialogTitle>{gift ? sel.name : "Animale sconosciuto"}</DialogTitle>
                <DialogDescription>{gift ? sel.description : "Nessuno ha ancora donato questa specie. Cercala nella foresta!"}</DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border border-[#30363D] bg-[#12261E] p-4">
                <AnimalArt a={sel} silhouette={!gift} className="mx-auto w-full max-w-[260px]" />
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <RarityTag rarity={sel.rarity} />
                {gift && <span className="tabular-nums text-[#C9D1D9]">{gift.weight} kg</span>}
              </div>
              {gift && <p className="rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-2 text-xs text-[#8B949E]">Donato da {gift.donor} il {fmtWhen(gift.donated_at)}.</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
      <AnimalBag open={bag} onClose={() => setBag(false)} />
    </div>
  );
}
