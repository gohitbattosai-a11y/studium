import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Shield } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { COLS, DIE_INFO, FLOOR_NAMES, LAST_FLOOR, ROWS, act, chooseUpgrade, d6roll, lootCount, loadRecord, newRun, rollLoot, saveRecord, type Action, type Dir, type Ev, type Game, type Loot } from "@/lib/domain/dungeon";
import { FOSSIL_BY_ID } from "@/lib/domain/fossils";
import { FOSSIL_LIMIT, addFossil, getSandbox, useSandbox } from "@/lib/runtime/sandbox";
import { sfx } from "@/lib/audio/sfx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { RarityTag } from "./Bucket";
import FossilArt from "./FossilArt";
import { ENEMY_H, EnemyArt, HeroArt, PropArt, Torch } from "./dungeonArt";
import "./dungeon.css";

const W = 640;
const H = 520;
const HOR = 150;
const HC = 340;
const WALLH = 440;
const K = 0.15;
const TW = 110;
const CX = W / 2;

const S = (j: number) => 1 / (1 + (ROWS - j) * K);
const Y = (j: number) => HOR + HC * S(j);
const YT = (j: number) => HOR - (WALLH - HC) * S(j);
const X = (c: number, j: number) => CX + (c - COLS / 2) * TW * S(j);
const quad = (c: number, r: number): [number, number][] => [[X(c, r), Y(r)], [X(c + 1, r), Y(r)], [X(c + 1, r + 1), Y(r + 1)], [X(c, r + 1), Y(r + 1)]];
const pts = (p: [number, number][]) => p.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
const at = (c: number, r: number) => {
  const s = S(r + 0.62);
  return { x: X(c + 0.5, r + 0.62), y: Y(r + 0.62), s };
};

interface Theme {
  bg: string;
  wall: string;
  wall2: string;
  floorA: string;
  floorB: string;
  ceil: string;
  flame: string;
  glow: string;
}
const THEMES: Theme[] = [
  { bg: "#0a0c18", wall: "#3a4263", wall2: "#2c3350", floorA: "#4d5478", floorB: "#444a6b", ceil: "#1a1f36", flame: "#fb923c", glow: "#fb923c" },
  { bg: "#0a0c18", wall: "#3a4263", wall2: "#2c3350", floorA: "#4d5478", floorB: "#444a6b", ceil: "#1a1f36", flame: "#fb923c", glow: "#fb923c" },
  { bg: "#06100c", wall: "#2c4b3e", wall2: "#213a30", floorA: "#3a6350", floorB: "#335644", ceil: "#10231c", flame: "#5eead4", glow: "#2dd4bf" },
  { bg: "#120605", wall: "#5b2c26", wall2: "#47211c", floorA: "#6e3a30", floorB: "#62332a", ceil: "#2a0f0c", flame: "#fdba74", glow: "#f97316" },
  { bg: "#0b0716", wall: "#3d2c61", wall2: "#2f2250", floorA: "#52407f", floorB: "#483872", ceil: "#160f2c", flame: "#d8b4fe", glow: "#a855f7" },
];

const Room = memo(function Room({ th }: { th: Theme }) {
  const rows = Array.from({ length: ROWS }, (_, r) => r);
  const tiles = rows.flatMap((r) => Array.from({ length: COLS }, (_, c) => ({ c, r })));
  return (
    <g>
      <defs>
        <linearGradient id="dg-fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={th.bg} stopOpacity="0.75" />
          <stop offset="1" stopColor={th.bg} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={th.bg} />
      <polygon points={pts([[X(0, 0), YT(0)], [X(COLS, 0), YT(0)], [X(COLS, ROWS), YT(ROWS)], [X(0, ROWS), YT(ROWS)]])} fill={th.ceil} />
      {rows.map((r) => (
        <line key={r} x1={X(0, r)} y1={YT(r)} x2={X(COLS, r)} y2={YT(r)} stroke="#000" strokeOpacity="0.4" strokeWidth={3 * S(r)} />
      ))}
      <rect x={X(0, 0)} y={YT(0)} width={X(COLS, 0) - X(0, 0)} height={Y(0) - YT(0)} fill={th.wall2} />
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={X(0, 0)} x2={X(COLS, 0)} y1={YT(0) + (Y(0) - YT(0)) * f} y2={YT(0) + (Y(0) - YT(0)) * f} stroke="#000" strokeOpacity="0.22" strokeWidth="2" />
      ))}
      {rows.map((r) => (
        <g key={r}>
          <polygon points={pts([[X(0, r), YT(r)], [X(0, r + 1), YT(r + 1)], [X(0, r + 1), Y(r + 1)], [X(0, r), Y(r)]])} fill={r % 2 ? th.wall2 : th.wall} />
          <polygon points={pts([[X(COLS, r), YT(r)], [X(COLS, r + 1), YT(r + 1)], [X(COLS, r + 1), Y(r + 1)], [X(COLS, r), Y(r)]])} fill={r % 2 ? th.wall : th.wall2} />
          <polygon points={pts([[X(0, r), YT(r)], [X(0, r + 1), YT(r + 1)], [X(0, r + 1), Y(r + 1)], [X(0, r), Y(r)]])} fill="#000" opacity="0.18" />
          <line x1={X(0, r)} y1={YT(r)} x2={X(0, r)} y2={Y(r)} stroke="#000" strokeOpacity="0.45" strokeWidth={3 * S(r)} />
          <line x1={X(COLS, r)} y1={YT(r)} x2={X(COLS, r)} y2={Y(r)} stroke="#000" strokeOpacity="0.45" strokeWidth={3 * S(r)} />
        </g>
      ))}
      {tiles.map(({ c, r }) => (
        <polygon key={`${c}-${r}`} points={pts(quad(c, r))} fill={(c + r) % 2 ? th.floorA : th.floorB} stroke="#000" strokeOpacity="0.3" strokeWidth="1.2" />
      ))}
      <rect x="0" y={YT(0)} width={W} height={Y(4) - YT(0)} fill="url(#dg-fog)" pointerEvents="none" />
      {[1, 3, 5].flatMap((r) =>
        [0, COLS].map((c) => {
          const s = S(r + 0.5);
          const x = X(c, r + 0.5) + (c === 0 ? 3 : -3) * s;
          const y = HOR + 90 * s;
          return (
            <g key={`${c}-${r}`}>
              <circle cx={x} cy={y - 14 * s} r={95 * s} fill={th.glow} opacity="0.1" />
              <g transform={`translate(${x} ${y}) scale(${s * 1.35})`}>
                <Torch flame={th.flame} />
              </g>
            </g>
          );
        }),
      )}
    </g>
  );
});

type Fx = Ev;

function FxView({ f }: { f: Fx }) {
  const { x, y, s } = at(f.c, f.r);
  if (f.k === "num" || f.k === "txt" || f.k === "heal" || f.k === "pick") {
    const big = f.k === "num";
    const label = f.k === "num" ? `${f.foe ? "" : "-"}${f.v}${f.crit ? "!" : ""}` : f.k === "heal" ? `+${f.v}` : f.k === "pick" ? (f.t ?? "") : (f.t ?? "");
    const fill = f.k === "num" ? (f.foe ? (f.crit ? "#fde047" : "#ffffff") : "#f87171") : f.k === "heal" ? "#4ade80" : "#e5e7eb";
    const size = (f.k === "num" ? (f.crit ? 32 : 24) : f.k === "pick" ? 26 : 15) * Math.max(0.8, s * 1.2);
    return (
      <g transform={`translate(${x} ${y - 70 * s})`}>
        <text className="dg-fx" textAnchor="middle" fontSize={size} fontWeight={big ? 800 : 700} fill={fill} stroke="#000" strokeWidth={big ? 4 : 3} paintOrder="stroke" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
          {label}
        </text>
      </g>
    );
  }
  if (f.k === "slash") {
    return (
      <g transform={`translate(${x} ${y - 36 * s}) scale(${s * 1.3})`}>
        <path className="dg-slash" d="M-26 -22 Q0 -4 26 24" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }} />
        <path className="dg-slash" d="M-20 -26 Q4 -8 30 18" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" fill="none" style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }} />
      </g>
    );
  }
  if (f.k === "bolt") {
    return (
      <g transform={`translate(${x} ${y}) scale(${s * 1.2})`}>
        <path className="dg-burst" d="M-4 -160 L8 -100 L-6 -96 L10 -40 L-10 -70 L0 -76 L-12 -120Z" fill="#fde047" stroke="#fff" strokeWidth="2" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }} />
      </g>
    );
  }
  if (f.k === "ice") {
    return (
      <g transform={`translate(${x} ${y - 30 * s})`}>
        <circle className="dg-burst" r={90 * s * 3} fill="#7dd3fc" opacity="0.35" stroke="#e0f2fe" strokeWidth="4" style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }} />
      </g>
    );
  }
  if ((f.k === "fire" || f.k === "slam") && f.cells) {
    const col = f.k === "fire" ? "#fb923c" : "#ef4444";
    return (
      <g>
        {f.cells.map(([c, r]) => (
          <polygon key={`${c}-${r}`} className="dg-burst" points={pts(quad(c, r))} fill={col} opacity="0.8" style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }} />
        ))}
      </g>
    );
  }
  return null;
}

const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};

function DiceFace({ v, color = "#f8fafc", className }: { v: number; color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className ?? "size-12"}>
      <rect x="3" y="3" width="42" height="42" rx="10" fill={color} stroke="#0f172a" strokeOpacity="0.5" strokeWidth="2" />
      <rect x="6" y="6" width="36" height="14" rx="7" fill="#fff" opacity="0.28" />
      {(PIPS[v] ?? PIPS[1]).map(([a, b], i) => (
        <circle key={i} cx={12 + a * 12} cy={12 + b * 12} r="4.2" fill="#111827" />
      ))}
    </svg>
  );
}

function Scene({ g, fx, shake, onTap }: { g: Game; fx: Fx[]; shake: number; onTap: (c: number, r: number) => void }) {
  const th = THEMES[Math.min(g.floor, LAST_FLOOR)];
  const danger = useMemo(() => {
    const s = new Set<string>();
    g.enemies.forEach((e) => e.tele?.cells.forEach(([c, r]) => s.add(`${c},${r}`)));
    return [...s].map((k) => k.split(",").map(Number) as [number, number]);
  }, [g.enemies]);
  const open = g.enemies.length === 0;
  const items: { key: string; r: number; z: number; node: ReactNode }[] = [];
  g.props.forEach((p) => {
    if (p.kind === "door") {
      const s = S(0.25);
      items.push({
        key: `p${p.id}`,
        r: 0,
        z: -1,
        node: (
          <g transform={`translate(${X(p.c + 0.5, 0.25)} ${Y(0.25)}) scale(${s * 1.7})`}>
            <PropArt kind="door" open={open} />
          </g>
        ),
      });
      return;
    }
    const a = at(p.c, p.r);
    items.push({
      key: `p${p.id}`,
      r: p.r,
      z: p.kind === "chest" ? 1 : 0,
      node: (
        <g transform={`translate(${a.x} ${a.y}) scale(${a.s * 1.15})`}>
          <PropArt kind={p.kind} die={p.die} />
        </g>
      ),
    });
  });
  g.enemies.forEach((e) => {
    const a = at(e.c, e.r);
    const h = ENEMY_H[e.kind];
    items.push({
      key: `e${e.id}`,
      r: e.r,
      z: 2,
      node: (
        <g transform={`translate(${a.x} ${a.y}) scale(${a.s * 1.12})`}>
          <g key={`${e.c},${e.r}`} className="dg-hop">
            <EnemyArt kind={e.kind} exh={e.exh > 0} />
            {e.frozen > 0 && <ellipse cx="0" cy={-h / 2} rx={e.kind === "golem" ? 58 : 32} ry={h / 2 + 6} fill="#7dd3fc" opacity="0.4" stroke="#e0f2fe" strokeWidth="2" />}
          </g>
          <g transform={`translate(0 ${-h - 16})`}>
            <rect x="-20" y="-3" width="40" height="6" rx="3" fill="#000" opacity="0.6" />
            <rect x="-20" y="-3" width={Math.max(0, (40 * e.hp) / e.max)} height="6" rx="3" fill={e.kind === "golem" ? "#f97316" : "#ef4444"} />
          </g>
        </g>
      ),
    });
  });
  const ha = at(g.hero.c, g.hero.r);
  items.push({
    key: "hero",
    r: g.hero.r,
    z: 3,
    node: (
      <g transform={`translate(${ha.x} ${ha.y}) scale(${ha.s * 1.12})`}>
        <circle cx="0" cy="-40" r="70" fill={th.glow} opacity="0.1" />
        <g key={`${g.hero.c},${g.hero.r}`} className="dg-hop">
          <HeroArt guard={g.hero.guard} />
        </g>
      </g>
    ),
  });
  items.sort((a, b) => a.r - b.r || a.z - b.z);
  const tiles = Array.from({ length: ROWS * COLS }, (_, i) => ({ c: i % COLS, r: Math.floor(i / COLS) }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="block size-full" data-testid="dungeon-scene">
      <g key={shake} className={shake ? "dg-shake" : undefined}>
        <Room th={th} />
        {danger.map(([c, r]) => (
          <g key={`d${c}-${r}`} className="dg-pulse">
            <polygon points={pts(quad(c, r))} fill="#ef4444" opacity="0.5" stroke="#fecaca" strokeWidth="2" />
          </g>
        ))}
        {items.map((it) => (
          <g key={it.key}>{it.node}</g>
        ))}
        {fx.map((f) => (
          <FxView key={f.id} f={f} />
        ))}
        {tiles.map(({ c, r }) => (
          <polygon key={`t${c}-${r}`} points={pts(quad(c, r))} fill="transparent" onPointerDown={() => onTap(c, r)} className="cursor-pointer" />
        ))}
      </g>
    </svg>
  );
}

const Pad = ({ onClick, children, label }: { onClick: () => void; children: ReactNode; label: string }) => (
  <button type="button" aria-label={label} onClick={onClick} className="grid size-12 touch-manipulation place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 transition-colors active:bg-white/30 sm:size-11">
    {children}
  </button>
);

export default function Dungeon() {
  const sb = useSandbox();
  const [g, setG] = useState<Game | null>(null);
  const [fx, setFx] = useState<Fx[]>([]);
  const [roll, setRoll] = useState<{ id: number; die: string; v: number; t?: string } | null>(null);
  const [shake, setShake] = useState(0);
  const [banner, setBanner] = useState<{ id: number; text: string } | null>(null);
  const [runId, setRunId] = useState(0);
  const [endShown, setEndShown] = useState(false);
  const [rec, setRec] = useState(loadRecord);
  const [rolling, setRolling] = useState(false);
  const [loot, setLoot] = useState<{ roll: number; items: Loot[]; lost: number } | null>(null);
  const gRef = useRef<Game | null>(null);
  const lock = useRef(0);
  const saved = useRef(false);

  const dispatch = useCallback((a: Action) => {
    const cur = gRef.current;
    if (!cur || cur.phase !== "play") return;
    const now = performance.now();
    if (now < lock.current) return;
    const nx = act(cur, a);
    if (!nx) return;
    lock.current = now + 110;
    gRef.current = nx;
    setG(nx);
  }, []);

  const start = () => {
    const ng = newRun();
    gRef.current = ng;
    saved.current = false;
    setG(ng);
    setFx([]);
    setRoll(null);
    setLoot(null);
    setEndShown(false);
    setRunId((n) => n + 1);
    sfx("open");
  };

  useEffect(() => {
    if (!g || !g.ev.length) return;
    const add: Fx[] = [];
    for (const e of g.ev) {
      if (e.k === "roll") {
        setRoll({ id: e.id, die: e.die ?? "d6", v: e.v ?? 1, t: e.t });
        window.setTimeout(() => setRoll((r) => (r && r.id === e.id ? null : r)), 2800);
        sfx("swoosh");
      } else if (e.k === "hurt") {
        setShake((n) => n + 1);
        sfx("error");
      } else if (e.k === "win") {
        sfx("win");
      } else {
        if (e.k === "slash" || e.k === "bolt" || e.k === "fire") sfx("pop");
        if (e.k === "heal" || e.k === "pick") sfx("coin");
        add.push(e);
      }
    }
    if (!add.length) return;
    setFx((f) => [...f, ...add]);
    const ids = new Set(add.map((e) => e.id));
    window.setTimeout(() => setFx((f) => f.filter((x) => !ids.has(x.id))), 1100);
  }, [g?.evSeq]);

  useEffect(() => {
    if (!g || g.phase !== "play" || g.turn !== 0) return;
    setBanner({ id: Date.now(), text: g.floor === LAST_FLOOR ? "Il Guardiano ti attende" : `Piano ${g.floor} · ${FLOOR_NAMES[g.floor]}` });
    const t = window.setTimeout(() => setBanner(null), 1600);
    return () => window.clearTimeout(t);
  }, [g?.floor, runId]);

  useEffect(() => {
    if (!g || g.phase !== "end") {
      setEndShown(false);
      return;
    }
    if (!saved.current) {
      saved.current = true;
      setRec(saveRecord(g));
    }
    const t = window.setTimeout(() => setEndShown(true), g.over === "won" ? 1300 : 900);
    return () => window.clearTimeout(t);
  }, [g?.phase]);

  useEffect(() => {
    const map: Record<string, Dir> = { arrowup: "n", w: "n", arrowdown: "s", s: "s", arrowleft: "w", a: "w", arrowright: "e", d: "e" };
    const kd = (e: KeyboardEvent) => {
      if (document.querySelector("[data-slot='dialog-content']")) return;
      const k = e.key.toLowerCase();
      if (map[k]) {
        e.preventDefault();
        dispatch({ t: "move", d: map[k] });
      } else if (k === " ") {
        e.preventDefault();
        dispatch({ t: "guard" });
      } else if (/^[1-5]$/.test(k)) dispatch({ t: "die", i: Number(k) - 1 });
    };
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, [dispatch]);

  const tap = (c: number, r: number) => {
    const h = gRef.current?.hero;
    if (!h) return;
    const dc = c - h.c;
    const dr = r - h.r;
    if (!dc && !dr) return dispatch({ t: "guard" });
    if (Math.abs(dr) >= Math.abs(dc)) dispatch({ t: "move", d: dr < 0 ? "n" : "s" });
    else dispatch({ t: "move", d: dc < 0 ? "w" : "e" });
  };

  const pickUpgrade = (id: string) => {
    if (!g) return;
    const nx = chooseUpgrade(g, id);
    if (!nx) return;
    gRef.current = nx;
    setG(nx);
    setFx([]);
    sfx("success");
  };

  const claim = () => {
    if (!g || rolling) return;
    setRolling(true);
    sfx("swoosh");
    const v = d6roll();
    window.setTimeout(() => {
      const items = rollLoot(g, v);
      const kept: Loot[] = [];
      let lost = 0;
      for (const it of items) {
        if (getSandbox().fossilBag.length >= FOSSIL_LIMIT) {
          lost++;
          continue;
        }
        addFossil(it.id, it.integrity);
        kept.push(it);
      }
      setLoot({ roll: v, items: kept, lost });
      setRolling(false);
      sfx(kept.length ? "success" : "error");
    }, 800);
  };

  const bagLeft = FOSSIL_LIMIT - sb.fossilBag.length;
  const h = g?.hero;
  const pct = h ? Math.max(0, Math.min(100, (h.hp / h.max) * 100)) : 0;
  const rollColor = roll && roll.die !== "d6" ? DIE_INFO[roll.die as keyof typeof DIE_INFO]?.color : "#f8fafc";

  return (
    <div className="absolute inset-0 flex touch-none flex-col bg-[#05040a] pt-12 text-[#E6EDF3] select-none" data-testid="dungeon">
      {g && h && (
        <div className="flex items-center gap-3 px-3 pb-1.5">
          <div className="relative h-6 min-w-0 flex-1 overflow-hidden rounded-full bg-black/60 ring-1 ring-white/15">
            <div className="h-full bg-gradient-to-r from-rose-700 to-rose-400 transition-[width] duration-300" style={{ width: `${pct}%` }} />
            <span className="absolute inset-0 grid place-items-center text-xs font-bold drop-shadow">
              ❤ {h.hp}/{h.max}
            </span>
          </div>
          <div className="shrink-0 text-right text-[11px] leading-tight text-[#C9D1D9]">
            <div className="font-semibold">Piano {g.floor}/{LAST_FLOOR}</div>
            <div>
              ⚔ {h.atk >= 0 ? `+${h.atk}` : h.atk} · 🧱 {h.armor} · ☠ {g.kills}
            </div>
          </div>
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        {g ? <Scene g={g} fx={fx} shake={shake} onTap={tap} /> : <div className="size-full bg-[radial-gradient(ellipse_at_50%_40%,#2a1f4d,#05040a_70%)]" />}

        {roll && (
          <div key={roll.id} className="pointer-events-none absolute top-2 right-3 flex flex-col items-center gap-0.5 rounded-xl bg-black/55 p-2 ring-1 ring-white/15 backdrop-blur">
            <DiceFace v={roll.v} color={rollColor} className="dg-roll size-14" />
            <span className="text-[11px] font-semibold">{roll.die === "d6" ? (roll.t === "forziere" ? "Forziere" : "Attacco") : DIE_INFO[roll.die as keyof typeof DIE_INFO]?.name}</span>
            {roll.t === "rilancio" && <span className="text-[10px] text-emerald-300">Dado fortunato!</span>}
          </div>
        )}

        {banner && (
          <div key={banner.id} className="dg-banner pointer-events-none absolute inset-x-0 top-1/4 grid place-items-center">
            <span className="rounded-xl bg-black/60 px-5 py-2 text-lg font-extrabold tracking-wide text-amber-200 ring-1 ring-amber-200/30 backdrop-blur">{banner.text}</span>
          </div>
        )}

        {g?.phase === "upgrade" && (
          <div className="absolute inset-0 grid place-items-center bg-black/70 p-3 backdrop-blur-sm" data-testid="dungeon-upgrade">
            <div className="w-full max-w-lg">
              <h2 className="mb-1 text-center text-lg font-bold text-amber-200">Piano superato!</h2>
              <p className="mb-3 text-center text-xs text-[#C9D1D9]">Hai recuperato un po' di vita. Scegli un potenziamento.</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {g.choices.map((u, i) => (
                  <button key={u.id} type="button" onClick={() => pickUpgrade(u.id)} style={{ animationDelay: `${i * 80}ms` }} className="dg-pop flex items-center gap-3 rounded-xl bg-[#1b1633] p-3 text-left ring-1 ring-white/15 transition-colors hover:bg-[#2a2150] active:scale-[0.98] sm:flex-col sm:text-center">
                    <span className="text-3xl">{u.icon}</span>
                    <span>
                      <span className="block text-sm font-bold">{u.name}</span>
                      <span className="block text-xs text-[#C9D1D9]">{u.text}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!g && (
          <div className="absolute inset-0 grid touch-pan-y place-items-center overflow-y-auto p-3">
            <div className="dg-pop w-full max-w-md rounded-2xl bg-[#13102a]/95 p-4 ring-1 ring-white/15 backdrop-blur" data-testid="dungeon-intro">
              <h2 className="text-center text-xl font-extrabold text-amber-200">🎲 Cripta dei Dadi</h2>
              <p className="mt-1 text-center text-xs text-[#C9D1D9]">Quattro piani, un Guardiano di pietra e tanti dadi da lanciare.</p>
              <ul className="mt-3 space-y-1.5 text-xs text-[#E6EDF3]">
                <li>🗡 Cammina contro un nemico per colpirlo: tiri un d6 (con il 6 è critico, danno doppio).</li>
                <li>🟥 Le caselle rosse sono attacchi in arrivo: spostati prima del turno dopo!</li>
                <li>🛡 Lo Scudo (Spazio) para tutto per un turno e rimanda 2 danni a chi ti colpisce.</li>
                <li>🎲 Raccogli i dadi speciali: {Object.values(DIE_INFO).map((d) => d.icon).join(" ")} e lanciali dai tuoi slot (tasti 1-5).</li>
                <li>🚪 Sconfiggi tutti per aprire la porta, poi scegli un potenziamento.</li>
                <li>🦴 In premio: reliquie fossili per il tuo zaino. Più piani superi, più sono rare.</li>
              </ul>
              <p className="mt-2 text-center text-[11px] text-[#9AA4B2]">
                Record: piano {rec.best}/{LAST_FLOOR} · vittorie {rec.wins} · zaino fossili: {bagLeft} posti liberi
              </p>
              <Button size="lg" className="mt-3 w-full" onClick={start} data-testid="dungeon-start">
                Entra nella cripta
              </Button>
            </div>
          </div>
        )}

        {g?.phase === "end" && endShown && (
          <div className="absolute inset-0 grid touch-pan-y place-items-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm" data-testid="dungeon-end">
            <div className="dg-pop w-full max-w-md rounded-2xl bg-[#13102a]/95 p-4 text-center ring-1 ring-white/15">
              <h2 className={cn("text-xl font-extrabold", g.over === "won" ? "text-amber-200" : "text-rose-300")}>{g.over === "won" ? "🏆 Guardiano sconfitto!" : "💀 Sei caduto nella cripta"}</h2>
              <p className="mt-1 text-xs text-[#C9D1D9]">
                Piani superati: {g.cleared}/{LAST_FLOOR} · Nemici sconfitti: {g.kills}
              </p>
              {!loot && g.cleared < 1 && <p className="mt-3 text-sm text-[#C9D1D9]">Nessun tesoro: supera almeno un piano per portare a casa qualcosa.</p>}
              {!loot && g.cleared >= 1 && (
                <div className="mt-3">
                  <p className="text-sm text-[#E6EDF3]">Il forziere del bottino si apre con un dado: più alto tiri, più reliquie rare ottieni.</p>
                  <p className="mt-1 text-[11px] text-[#9AA4B2]">Reliquie garantite: da {lootCount(g, 1)} a {lootCount(g, 6)} · posti liberi nello zaino: {bagLeft}</p>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <DiceFace v={rolling ? 6 : 1} className={cn("size-16", rolling && "dg-roll")} color="#fde68a" />
                    <Button size="lg" onClick={claim} disabled={rolling} data-testid="dungeon-claim">
                      Lancia il dado del tesoro
                    </Button>
                  </div>
                </div>
              )}
              {loot && (
                <div className="mt-3">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <DiceFace v={loot.roll} className="size-9" color="#fde68a" />
                    <span>Hai tirato {loot.roll}!</span>
                  </div>
                  <div className="mt-2 grid gap-2">
                    {loot.items.map((it, i) => {
                      const sp = FOSSIL_BY_ID[it.id];
                      return (
                        <div key={i} style={{ animationDelay: `${i * 140}ms` }} className="dg-pop flex items-center gap-3 rounded-xl bg-white/5 p-2 text-left ring-1 ring-white/10">
                          <FossilArt s={sp} bare className="h-14 w-16 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">{sp.name}</div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <RarityTag rarity={sp.rarity} />
                              <span className="text-[11px] text-[#9AA4B2]">integrità {it.integrity}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {loot.lost > 0 && <p className="mt-2 text-xs text-amber-300">Zaino pieno: {loot.lost} reliquie perse. Svuotalo prima della prossima discesa!</p>}
                  {loot.items.length > 0 && <p className="mt-2 text-[11px] text-[#9AA4B2]">Le reliquie sono nel tuo zaino fossili: donale al museo o vendile.</p>}
                </div>
              )}
              {(loot || g.cleared < 1) && (
                <Button size="lg" variant="outline" className="mt-3 w-full" onClick={start} data-testid="dungeon-retry">
                  Scendi di nuovo
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {g && h && (
        <div className="flex items-end justify-between gap-2 px-3 pt-1.5 pb-3">
          <div className="grid grid-cols-3 gap-1">
            <span />
            <Pad label="Avanti" onClick={() => dispatch({ t: "move", d: "n" })}>
              <ChevronUp />
            </Pad>
            <span />
            <Pad label="Sinistra" onClick={() => dispatch({ t: "move", d: "w" })}>
              <ChevronLeft />
            </Pad>
            <Pad label="Indietro" onClick={() => dispatch({ t: "move", d: "s" })}>
              <ChevronDown />
            </Pad>
            <Pad label="Destra" onClick={() => dispatch({ t: "move", d: "e" })}>
              <ChevronRight />
            </Pad>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
            <div className="flex flex-wrap justify-end gap-1.5">
              {Array.from({ length: h.slots }, (_, i) => {
                const k = h.dice[i];
                const info = k ? DIE_INFO[k] : null;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!k}
                    title={info ? `${info.name}: ${info.text}` : "Slot vuoto"}
                    aria-label={info ? info.name : "Slot vuoto"}
                    onClick={() => dispatch({ t: "die", i })}
                    style={info ? { background: `${info.color}33`, borderColor: info.color } : undefined}
                    className={cn("relative grid size-12 touch-manipulation place-items-center rounded-xl border-2 text-2xl transition-transform active:scale-90 sm:size-11", !info && "border-dashed border-white/20 bg-white/5")}
                  >
                    {info?.icon}
                    <span className="absolute -top-1 -left-1 grid size-4 place-items-center rounded-full bg-black/70 text-[9px] text-white/80">{i + 1}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => dispatch({ t: "guard" })}
              disabled={h.guardCd > 0}
              className={cn("flex h-11 touch-manipulation items-center gap-2 rounded-xl px-4 text-sm font-semibold ring-1 transition-colors active:scale-95", h.guardCd > 0 ? "bg-white/5 text-white/40 ring-white/10" : "bg-cyan-500/25 text-cyan-100 ring-cyan-300/50")}
            >
              <Shield className="size-4" /> Scudo {h.guardCd > 0 ? `(${h.guardCd})` : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
