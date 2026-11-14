import { Brush, Coffee, GlassWater, Hammer, Package, Radar, RefreshCw, Shovel, Zap, MapPin } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { CHISEL_COST, FINISH_AT, GH, GW, MOVE_COST, SITES, SONAR_COST, SONAR_LABEL, TOOLS, chiselAt, condition, digAt, isBroken, isExhausted, newField, progress, sonarAt, type Field, type Site, type Tool } from "@/lib/domain/fossils";
import { FOSSIL_LIMIT, addFossil, getSandbox, useSandbox, type FossilCatch } from "@/lib/runtime/sandbox";
import { sfx } from "@/lib/audio/sfx";
import { levelOf, useCityShop, useShopActions } from "@/lib/domain/shop";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import FossilArt from "./FossilArt";
import FossilBag, { FossilDialog } from "./FossilBag";
import { RarityTag } from "../shared/Bucket";
import "./fossil.css";

const CW = 640;
const CH = 480;
const CELL = CW / GW;
const PING_COLOR = ["#6e8bb0", "#e3d341", "#f0883e", "#ff5d5d"];
const TOOL_ICON = { sonar: Radar, brush: Brush, shovel: Shovel, chisel: Hammer };
const BLOB_RADIUS = ["58% 42% 55% 45% / 48% 56% 44% 52%", "46% 54% 40% 60% / 58% 44% 56% 42%", "52% 48% 60% 40% / 44% 60% 40% 56%", "40% 60% 50% 50% / 52% 42% 58% 48%"];

const rnd = (seed: number) => {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

function paintLayer(ctx: CanvasRenderingContext2D, base: string, dark: string, speck: string[], seed: number, strata: boolean) {
  const r = rnd(seed);
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, CW, CH);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, CW, CH);
  const g = ctx.createLinearGradient(0, 0, 0, CH);
  g.addColorStop(0, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CW, CH);
  for (let i = 0; i < 3200; i++) {
    ctx.globalAlpha = 0.25 + r() * 0.5;
    ctx.fillStyle = speck[Math.floor(r() * speck.length)];
    const s = 1 + r() * 3.2;
    ctx.fillRect(r() * CW, r() * CH, s, s * (0.6 + r()));
  }
  ctx.globalAlpha = 1;
  if (strata) {
    for (let i = 0; i < 14; i++) {
      const y = r() * CH;
      ctx.strokeStyle = dark;
      ctx.globalAlpha = 0.18 + r() * 0.15;
      ctx.lineWidth = 1 + r() * 2.4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= CW; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 6 + (r() - 0.5) * 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  for (let i = 0; i < (strata ? 70 : 24); i++) {
    const x = r() * CW;
    const y = r() * CH;
    const rad = 2 + r() * (strata ? 6 : 3);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(x + 1, y + 1.5, rad, rad * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = speck[Math.floor(r() * speck.length)];
    ctx.beginPath();
    ctx.ellipse(x, y, rad, rad * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function erase(ctx: CanvasRenderingContext2D, cells: number[], r: number) {
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "#000";
  ctx.beginPath();
  for (const i of cells) {
    const x = ((i % GW) + 0.5) * CELL;
    const y = (Math.floor(i / GW) + 0.5) * CELL;
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
}

const triangle = (t: number) => {
  const p = (t * 0.95) % 1;
  return p < 0.5 ? p * 2 : 2 - p * 2;
};

function Polish({ field, onDone, onBag }: { field: Field; onDone: (bonus: number) => void; onBag: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const flags = useRef(new Uint8Array(40 * 30));
  const [pct, setPct] = useState(0);
  const down = useRef(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    paintLayer(ctx, field.site.earth, field.site.deep, field.site.speck, 4242, false);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = field.site.sand;
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillRect(0, 0, CW, CH);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    flags.current.fill(0);
  }, [field]);

  const brushAt = (e: RPointerEvent<HTMLCanvasElement>) => {
    const c = ref.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * CW;
    const y = ((e.clientY - r.top) / r.height) * CH;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    const fx = Math.floor((x / CW) * 40);
    const fy = Math.floor((y / CH) * 30);
    for (let yy = fy - 2; yy <= fy + 2; yy++) for (let xx = fx - 2; xx <= fx + 2; xx++) if (xx >= 0 && yy >= 0 && xx < 40 && yy < 30) flags.current[yy * 40 + xx] = 1;
    let n = 0;
    for (const v of flags.current) n += v;
    setPct(Math.min(100, Math.round((n / 1200) * 100)));
  };

  const bonus = Math.round(Math.min(1, pct / 85) * 8);
  const final = Math.min(100, Math.round(field.integrity) + bonus);
  const cond = condition(final);

  return (
    <div className="absolute inset-0 z-[5] grid place-items-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm">
      <div className="fd-rise w-full max-w-md rounded-2xl border border-[#e3b341]/60 bg-[#2a1d0f] p-4 text-center shadow-2xl">
        <p className="text-[11px] font-semibold tracking-widest text-[#e3b341] uppercase">Reperto scoperto</p>
        <h3 className="text-lg font-bold text-[#fff3c4]">{field.sp.name}</h3>
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-[#d8cdb6]">
          <RarityTag rarity={field.sp.rarity} />
          <span>{field.sp.era}</span>
        </div>
        <div className="relative mx-auto mt-3 aspect-[4/3] w-full touch-none overflow-hidden rounded-xl border border-white/15 bg-[radial-gradient(ellipse_at_50%_30%,#8a7658,#3a2d1d)]">
          <FossilArt s={field.sp} className="absolute inset-0 size-full p-1" />
          <canvas
            ref={ref}
            width={CW}
            height={CH}
            className="absolute inset-0 size-full cursor-crosshair touch-none"
            onPointerDown={(e) => {
              down.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              brushAt(e);
            }}
            onPointerMove={(e) => down.current && brushAt(e)}
            onPointerUp={() => (down.current = false)}
            onPointerCancel={() => (down.current = false)}
            data-testid="dig-polish"
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[#d8cdb6]">Spolvera col pennello: {pct}%</span>
          <span className="font-medium tabular-nums" style={{ color: cond.color }}>
            {cond.label} · {final}%{bonus > 0 ? ` (+${bonus})` : ""}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/40">
          <div className="h-full rounded-full bg-gradient-to-r from-[#e3b341] to-[#f0883e] transition-[width]" style={{ width: `${pct}%` }} />
        </div>
        {onBag && <p className="mt-2 text-xs text-[#FF7B72]">Lo zaino è pieno: libera un posto per estrarlo.</p>}
        <Button size="lg" className="mt-4 w-full" onClick={() => onDone(bonus)} data-testid="dig-extract">
          Estrai il fossile
        </Button>
      </div>
    </div>
  );
}

export default function Dig() {
  const sb = useSandbox();
  const [site, setSite] = useState<Site | null>(null);
  const [fieldId, setFieldId] = useState(0);
  const [phase, setPhase] = useState<"pick" | "dig" | "found" | "broken" | "empty">("pick");
  const [tool, setTool] = useState<Tool>("brush");
  const [bag, setBag] = useState(false);
  const [bagFull, setBagFull] = useState(false);
  const [found, setFound] = useState<FossilCatch | null>(null);
  const [msg, setMsg] = useState<{ text: string; tone: string } | null>(null);
  const [, setVer] = useState(0);
  const shop = useCityShop(true);
  const shopAct = useShopActions();
  const palaRef = useRef(0);
  palaRef.current = levelOf(shop.data, "pala");
  const energyItems = (shop.data?.items ?? []).filter((i) => i.category === "energia" && i.owned > 0);

  const F = useRef<Field | null>(null);
  const sandRef = useRef<HTMLCanvasElement>(null);
  const earthRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const floorRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const sparks = useRef<Spark[]>([]);
  const loop = useRef(0);
  const last = useRef<[number, number] | null>(null);
  const pending = useRef(0);
  const sfxAt = useRef(0);
  const msgTimer = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const f = F.current;
  const bump = useCallback(() => {
    if (pending.current) return;
    pending.current = requestAnimationFrame(() => {
      pending.current = 0;
      setVer((v) => v + 1);
    });
  }, []);

  const say = useCallback((text: string, tone = "#fff3c4") => {
    setMsg({ text, tone });
    window.clearTimeout(msgTimer.current);
    msgTimer.current = window.setTimeout(() => setMsg(null), 2600);
  }, []);

  const start = useCallback((s: Site) => {
    F.current = newField(s);
    if (palaRef.current > 0) {
      F.current.maxEnergy = Math.round(F.current.maxEnergy * (1 + 0.15 * palaRef.current));
      F.current.energy = F.current.maxEnergy;
    }
    sparks.current = [];
    setSite(s);
    setPhase("dig");
    setFieldId((n) => n + 1);
    setMsg(null);
  }, []);

  useEffect(() => {
    const field = F.current;
    if (!field || !sandRef.current || !earthRef.current) return;
    const sctx = sandRef.current.getContext("2d");
    const ectx = earthRef.current.getContext("2d");
    const fctx = floorRef.current?.getContext("2d");
    if (!sctx || !ectx) return;
    if (fctx) paintLayer(fctx, field.site.deep, "#000000", field.site.speck, 313 + fieldId, true);
    paintLayer(ectx, field.site.earth, field.site.deep, field.site.speck, 77 + fieldId, true);
    paintLayer(sctx, field.site.sand, field.site.earth, field.site.speck, 191 + fieldId, false);
    fxRef.current?.getContext("2d")?.clearRect(0, 0, CW, CH);
  }, [fieldId]);

  useEffect(
    () => () => {
      cancelAnimationFrame(loop.current);
      cancelAnimationFrame(pending.current);
      window.clearTimeout(msgTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (tool !== "chisel" || phase !== "dig") return;
    let id = 0;
    const tick = () => {
      if (markRef.current) markRef.current.style.left = `${triangle(performance.now() / 1000) * 100}%`;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [tool, phase]);

  const runFx = useCallback(() => {
    if (loop.current) return;
    const step = () => {
      const c = fxRef.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) {
        loop.current = 0;
        return;
      }
      ctx.clearRect(0, 0, CW, CH);
      const list = sparks.current;
      for (const p of list) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.life -= 1;
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      sparks.current = list.filter((p) => p.life > 0);
      loop.current = sparks.current.length ? requestAnimationFrame(step) : 0;
    };
    loop.current = requestAnimationFrame(step);
  }, []);

  const burst = useCallback(
    (gx: number, gy: number, n: number, colors: string[], power = 1) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = (0.8 + Math.random() * 2.4) * power;
        sparks.current.push({ x: gx * CELL, y: gy * CELL, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.4 * power, life: 20 + Math.random() * 18, max: 38, size: 2 + Math.random() * 3.2, color: colors[Math.floor(Math.random() * colors.length)] });
      }
      if (sparks.current.length > 260) sparks.current.splice(0, sparks.current.length - 260);
      runFx();
    },
    [runFx],
  );

  const shake = useCallback(() => {
    const el = boardRef.current;
    if (!el) return;
    el.classList.remove("fd-shake");
    void el.offsetWidth;
    el.classList.add("fd-shake");
  }, []);

  const settle = useCallback(() => {
    const field = F.current;
    if (!field || phaseRef.current !== "dig") return;
    if (isBroken(field)) {
      setPhase("broken");
      sfx("error");
    } else if (progress(field) >= FINISH_AT) {
      setPhase("found");
      sfx("win");
    } else if (isExhausted(field)) {
      setPhase("empty");
      sfx("wrong");
    }
  }, []);

  const toGrid = (e: RPointerEvent<HTMLDivElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * GW, ((e.clientY - r.top) / r.height) * GH];
  };

  const stroke = (a: [number, number], b: [number, number]) => {
    const field = F.current;
    if (!field || (tool !== "brush" && tool !== "shovel")) return;
    const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const steps = Math.max(1, Math.ceil(dist / 1.1));
    const sctx = sandRef.current?.getContext("2d");
    const ectx = earthRef.current?.getContext("2d");
    if (!sctx || !ectx) return;
    let dmg = 0;
    let cleared = 0;
    for (let s = 1; s <= steps; s++) {
      if (field.energy <= 0) break;
      const x = a[0] + ((b[0] - a[0]) * s) / steps;
      const y = a[1] + ((b[1] - a[1]) * s) / steps;
      const res = digAt(field, tool, x, y);
      field.energy = Math.max(0, field.energy - (dist / steps) * MOVE_COST[tool]);
      if (res.sand.length) erase(sctx, res.sand, CELL * 0.85);
      if (res.earth.length) {
        erase(ectx, res.earth, CELL * 0.85);
        if (Math.random() < 0.5) burst(x, y, 3, field.site.speck, 0.8);
      }
      cleared += res.sand.length + res.earth.length;
      dmg += res.damage;
    }
    const now = performance.now();
    if (cleared && now - sfxAt.current > 110) {
      sfxAt.current = now;
      sfx("hover");
    }
    if (dmg > 0) {
      shake();
      if (now - sfxAt.current > 60) sfx("error");
      say("Graffiato! La pala è troppo vicina al fossile.", "#FF7B72");
    }
    bump();
    settle();
  };

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    const field = F.current;
    if (!field || phase !== "dig") return;
    const p = toGrid(e);
    if (tool === "sonar") {
      if (field.energy < SONAR_COST) return say("Energia insufficiente per il sonar.", "#FF7B72");
      field.energy -= SONAR_COST;
      const ping = sonarAt(field, p[0], p[1]);
      sfx(ping.level === 3 ? "match" : ping.level === 0 ? "click" : "open");
      say(SONAR_LABEL[ping.level], PING_COLOR[ping.level]);
      bump();
      settle();
      return;
    }
    if (tool === "chisel") {
      if (field.energy < CHISEL_COST) return say("Energia insufficiente.", "#FF7B72");
      const res = chiselAt(field, p[0], p[1], triangle(performance.now() / 1000));
      if (!res.hit) return say("Scalpella un masso già scoperto dalla terra.", "#d8cdb6");
      field.energy = Math.max(0, field.energy - CHISEL_COST);
      const col = res.quality === "perfect" ? "#7EE787" : res.quality === "good" ? "#E3B341" : "#FF7B72";
      say(res.quality === "perfect" ? "Colpo perfetto!" : res.quality === "good" ? "Colpo buono" : "Scheggiato! Hai graffiato il fossile", col);
      sfx(res.quality === "perfect" ? "correct" : res.quality === "good" ? "click" : "wrong");
      burst(p[0], p[1], res.broke ? 26 : 10, ["#8d8579", "#5f574d", "#b5ab9b"], res.broke ? 1.6 : 1);
      if (res.quality === "slip" || res.broke) shake();
      if (res.broke) sfx("pop");
      bump();
      settle();
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = p;
    stroke(p, p);
  };

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!last.current) return;
    const p = toGrid(e);
    stroke(last.current, p);
    last.current = p;
  };

  const onUp = () => {
    last.current = null;
  };

  const extract = (bonus: number) => {
    const field = F.current;
    if (!field || !site) return;
    if (getSandbox().fossilBag.length >= FOSSIL_LIMIT) {
      setBagFull(true);
      setBag(true);
      return;
    }
    setBagFull(false);
    const item = addFossil(field.sp.id, Math.min(100, Math.round(field.integrity) + bonus));
    sfx("success");
    setFound(item);
    start(site);
  };

  const restart = () => {
    if (site) start(site);
  };

  const drink = async (id: string, energy: number) => {
    const field = F.current;
    if (!field || shopAct.use.isPending || (phase !== "dig" && phase !== "empty")) return;
    try {
      await shopAct.use.mutateAsync(id);
    } catch {
      return;
    }
    field.energy = energy === 0 ? field.maxEnergy : Math.min(field.maxEnergy, field.energy + energy);
    if (phase === "empty") setPhase("dig");
    setVer((v) => v + 1);
  };

  const energyButtons = energyItems.map((i) => (
    <Button key={i.id} size="sm" variant="outline" disabled={shopAct.use.isPending} onClick={() => drink(i.id, i.energy ?? 0)} data-testid={`dig-${i.id}`}>
      {i.id === "borraccia" ? <GlassWater /> : <Coffee />} {i.name} ×{i.owned}
    </Button>
  ));

  const cond = f ? condition(f.integrity) : condition(100);
  const prog = f ? Math.round((phase === "found" ? 1 : Math.min(1, progress(f) / FINISH_AT)) * 100) : 0;
  const blobs = useMemo(() => f?.blobs ?? [], [f, fieldId]);

  if (phase === "pick" || !site || !f) {
    return (
      <div className="absolute inset-0 overflow-y-auto bg-[#1d140a] px-4 pt-16 pb-8 select-none" style={{ background: "radial-gradient(ellipse at 50% 0%, #5a3f22 0%, #2a1c0e 55%, #130d07 100%)" }} data-testid="dig-site">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-xl font-bold text-[#fff3c4]">Dove vuoi scavare?</h2>
          <p className="mx-auto mt-1 max-w-md text-center text-sm text-[#d8cdb6]">Ogni sito nasconde fossili diversi. I più difficili custodiscono i reperti più rari.</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {SITES.map((s, i) => (
              <li key={s.id}>
                <button type="button" onClick={() => start(s)} className="group flex w-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-black/30 text-left shadow-xl transition-transform hover:-translate-y-1 focus-visible:-translate-y-1" data-testid={`dig-site-${s.id}`}>
                  <div className="relative h-36 overflow-hidden" style={{ background: `linear-gradient(180deg, ${s.sky[0]}, ${s.sky[1]} 48%, ${s.sand} 48.5%, ${s.earth} 72%, ${s.deep})` }}>
                    <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-1/2 w-full" aria-hidden>
                      <path d={`M0 50 L30 ${22 + i * 4} L54 40 L90 ${10 + i * 6} L130 38 L160 ${20 + i * 3} L200 44 V50Z`} fill={s.earth} opacity="0.85" />
                      <circle cx="160" cy="16" r="9" fill="#fff4c8" opacity={i === 2 ? 0.25 : 0.85} />
                    </svg>
                    {Array.from({ length: 14 }, (_, k) => (
                      <span key={k} className="absolute rounded-full" style={{ left: `${(k * 37) % 96}%`, top: `${54 + ((k * 23) % 40)}%`, width: 4 + (k % 3) * 3, height: 3 + (k % 3) * 2, background: s.speck[k % s.speck.length], opacity: 0.7 }} />
                    ))}
                    <span className="fd-glint absolute right-4 bottom-4 size-2 rounded-full" style={{ background: s.accent, boxShadow: `0 0 10px ${s.accent}` }} />
                  </div>
                  <div className="p-3">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-[#fff3c4]">
                      <MapPin className="size-4" style={{ color: s.accent }} />
                      {s.name}
                    </p>
                    <p className="mt-1 text-xs text-[#d8cdb6]">{s.blurb}</p>
                    <p className="mt-2 text-[11px] font-medium" style={{ color: s.accent }}>
                      {i === 0 ? "Difficoltà ★" : i === 1 ? "Difficoltà ★★" : "Difficoltà ★★★"}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" size="lg" onClick={() => setBag(true)} data-testid="dig-bag">
              <Package /> Zaino ({sb.fossilBag.length})
            </Button>
          </div>
        </div>
        <FossilBag open={bag} onClose={() => setBag(false)} />
        <FossilDialog item={found} onClose={() => setFound(null)} />
      </div>
    );
  }

  const over = phase !== "dig";
  const stack = f.sp.scale * 100;

  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ background: `linear-gradient(180deg, ${site.sky[0]} 0%, ${site.sky[1]} 20%, ${site.earth} 20.1%, ${site.deep} 100%)` }} data-testid="dig-site">
      <svg viewBox="0 0 800 140" preserveAspectRatio="xMidYMax slice" className="pointer-events-none absolute inset-x-0 top-0 h-[22%] w-full" aria-hidden>
        <circle cx="660" cy="46" r="26" fill="#fff4c8" opacity="0.85" />
        <path d="M0 140 V96 L70 70 L120 90 L200 50 L260 84 L340 60 L420 96 L520 64 L600 92 L700 58 L800 90 V140Z" fill={site.sand} opacity="0.75" />
        <path d="M0 140 V114 L90 96 L170 118 L280 92 L380 120 L500 98 L620 122 L720 100 L800 116 V140Z" fill={site.earth} />
        <g transform="translate(110 100)">
          <path d="M0 40 L30 -10 L60 40Z" fill="#e8dcc0" stroke="#6b5a3c" strokeWidth="2" />
          <path d="M30 -10 L30 40" stroke="#6b5a3c" strokeWidth="2" />
          <path d="M22 40 L30 20 L38 40Z" fill="#3a2a18" />
        </g>
      </svg>

      <div className="absolute inset-x-0 top-14 z-[2] flex flex-wrap items-center justify-center gap-2 px-3">
        <div className="flex items-center gap-2 rounded-full border border-[#e3b341]/60 bg-[#2a1d0f]/85 px-3 py-1.5 text-xs text-[#fff3c4] shadow-lg backdrop-blur">
          <Zap className="size-3.5 text-[#E3B341]" />
          <span className="font-semibold tabular-nums">{Math.ceil(f.energy)}</span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full bg-gradient-to-r from-[#e3b341] to-[#f0883e] transition-[width]" style={{ width: `${(f.energy / f.maxEnergy) * 100}%` }} />
          </div>
        </div>
        {phase === "dig" && energyItems.length > 0 && <div className="flex gap-1.5">{energyButtons}</div>}
        <div className="rounded-full border border-white/20 bg-[#2a1d0f]/85 px-3 py-1.5 text-xs shadow-lg backdrop-blur" style={{ color: f.touched ? cond.color : "#d8cdb6" }}>
          {f.touched ? `Integrità ${Math.round(f.integrity)}% · ${cond.label}` : "Qualcosa è sepolto qui sotto…"}
        </div>
        <div className="rounded-full border border-white/20 bg-[#2a1d0f]/85 px-3 py-1.5 text-xs text-[#d8cdb6] shadow-lg backdrop-blur">Scoperto {prog}%</div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[104px] z-[3] flex justify-center px-3">
        {msg && (
          <div key={msg.text} className="fd-rise rounded-full border border-white/20 bg-black/70 px-4 py-1.5 text-xs font-semibold shadow-lg" style={{ color: msg.tone }}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 top-[132px] bottom-[128px] flex items-center justify-center px-3">
        <div ref={boardRef} className="relative aspect-[4/3] w-full touch-none rounded-xl border-[8px] border-[#4a3320] shadow-2xl" style={{ maxWidth: "min(100%, calc((100dvh - 275px) * 4 / 3), 840px)", background: site.deep }} data-testid="dig-board">
          <div className="absolute inset-0 touch-none overflow-hidden rounded-md" style={{ cursor: tool === "sonar" ? "crosshair" : tool === "chisel" ? "pointer" : "grab" }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <canvas ref={floorRef} width={CW} height={CH} className="pointer-events-none absolute inset-0 size-full" />
            <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.45))` }} />
            <div className="pointer-events-none absolute" style={{ left: `${((f.cx - f.bw / 2) / GW) * 100}%`, top: `${((f.cy - f.bh / 2) / GH) * 100}%`, width: `${stack}%`, height: `${stack}%` }}>
              <FossilArt s={f.sp} className="size-full" />
            </div>
            {blobs.map((b, i) => {
              const cr = Math.round(((b.max - b.hp) / b.max) * 3);
              return (
                <div key={i} className="fd-blob pointer-events-none absolute" data-broken={b.hp <= 0} style={{ left: `${((b.x - b.rx) / GW) * 100}%`, top: `${((b.y - b.ry) / GH) * 100}%`, width: `${((b.rx * 2) / GW) * 100}%`, height: `${((b.ry * 2) / GH) * 100}%`, borderRadius: BLOB_RADIUS[b.shape], background: `radial-gradient(circle at 32% 26%, #b5ab9b, #7a7266 55%, #4a443c)`, boxShadow: "inset -6px -8px 14px rgba(0,0,0,0.45), 0 6px 12px rgba(0,0,0,0.5)" }}>
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
                    {cr >= 1 && <path d="M18 20 L40 46 L30 58 L52 84" fill="none" stroke="#1e1a15" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
                    {cr >= 2 && <path d="M80 18 L62 44 L74 56 L58 80" fill="none" stroke="#1e1a15" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
                    {cr >= 3 && <path d="M12 56 L36 52 L50 64 L84 58" fill="none" stroke="#1e1a15" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
                  </svg>
                </div>
              );
            })}
            <canvas ref={earthRef} width={CW} height={CH} className="pointer-events-none absolute inset-0 size-full" />
            <canvas ref={sandRef} width={CW} height={CH} className="pointer-events-none absolute inset-0 size-full" />
            <canvas ref={fxRef} width={CW} height={CH} className="pointer-events-none absolute inset-0 size-full" />
            {f.pings.map((p, i) => (
              <div key={i} className="pointer-events-none absolute" style={{ left: `${(p.x / GW) * 100}%`, top: `${(p.y / GH) * 100}%`, ["--tone" as string]: PING_COLOR[p.level] }}>
                <span className="fd-ring" style={{ width: 130, height: 130 }} />
                <span className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 shadow-lg" style={{ background: PING_COLOR[p.level] }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[3] bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pt-6 pb-3">
        <div className="mx-auto max-w-xl">
          <div className="h-8">
            {tool === "chisel" ? (
              <div className="relative mx-auto mt-1 h-4 w-full max-w-xs overflow-hidden rounded-full border border-white/25 bg-[#5a1f1f]">
                <div className="absolute inset-y-0 left-[20%] w-[60%] bg-[#8a6a1a]" />
                <div className="absolute inset-y-0 left-[38%] w-[24%] bg-[#2e9e4f]" />
                <div ref={markRef} className="absolute inset-y-0 w-1.5 -translate-x-1/2 rounded bg-white shadow-[0_0_6px_#fff]" style={{ left: "0%" }} />
              </div>
            ) : (
              <p className="text-center text-[11px] text-[#d8cdb6]">{TOOLS[tool].hint}</p>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {(Object.keys(TOOLS) as Tool[]).map((t) => {
                const Icon = TOOL_ICON[t];
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={over}
                    onClick={() => {
                      setTool(t);
                      sfx("click");
                    }}
                    className={cn("flex min-w-[62px] flex-col items-center rounded-xl border px-2 py-1.5 text-[11px] font-medium transition-colors", tool === t ? "border-[#E3B341] bg-[#E3B341]/20 text-[#fff3c4]" : "border-white/20 bg-black/40 text-[#d8cdb6]")}
                    data-testid={`dig-tool-${t}`}
                  >
                    <Icon className="size-5" />
                    {TOOLS[t].label}
                    <span className="text-[10px] opacity-70">{t === "sonar" ? `-${SONAR_COST} en.` : t === "chisel" ? `-${CHISEL_COST} en.` : "a tratto"}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1.5">
              <Button variant="secondary" size="lg" onClick={() => setPhase("pick")} aria-label="Cambia sito">
                <MapPin />
              </Button>
              <Button variant="secondary" size="lg" onClick={restart} aria-label="Nuovo scavo">
                <RefreshCw />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setBag(true)} data-testid="dig-bag">
                <Package /> {sb.fossilBag.length}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {phase === "found" && <Polish key={fieldId} field={f} onDone={extract} onBag={bagFull} />}

      {(phase === "broken" || phase === "empty") && (
        <div className="absolute inset-0 z-[5] grid place-items-center bg-black/60 p-4 backdrop-blur-[2px]">
          <div className="fd-rise w-full max-w-sm rounded-2xl border border-[#e3b341]/60 bg-[#2a1d0f] p-5 text-center shadow-2xl">
            <p className="text-4xl">{phase === "broken" ? "💥" : "😮‍💨"}</p>
            <h3 className="mt-2 text-lg font-bold text-[#fff3c4]">{phase === "broken" ? "Il fossile è andato in frantumi" : "Energia finita"}</h3>
            <p className="mt-1 text-sm text-[#d8cdb6]">{phase === "broken" ? "Usa il sonar per trovarlo, il pennello vicino al reperto e scalpella al momento giusto." : "Il fossile è rimasto sepolto. Con il sonar sprechi meno fatica."}</p>
            {phase === "empty" && energyItems.length > 0 && <div className="mt-4 flex flex-wrap justify-center gap-2">{energyButtons}</div>}
            <Button size="lg" className="mt-4 w-full" onClick={restart}>
              Nuovo scavo
            </Button>
          </div>
        </div>
      )}

      <FossilBag open={bag} onClose={() => setBag(false)} />
      <FossilDialog item={found} onClose={() => setFound(null)} />
    </div>
  );
}
