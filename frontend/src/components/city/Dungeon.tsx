import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Shield } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { COLS, DEF, DIE_INFO, DUNGEONS, ROWS, act, chooseUpgrade, isBoss, newRun, type Action, type DungeonId, type Dir, type Ev, type Game, type Theme } from "@/lib/domain/dungeon";
import { useDungeonActions, useDungeonHub, type FinishResult } from "@/lib/domain/dungeonApi";
import { sfx } from "@/lib/audio/sfx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { RarityTag } from "./Bucket";
import { ENEMY_H, EnemyArt, HeroArt, PropArt, Torch } from "./dungeonArt";
import { LootIcon, TrophyArt } from "./dungeonItems";
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
const hash = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function Decor({ th }: { th: Theme }) {
  const bx = X(0, 0);
  const bw = X(COLS, 0) - bx;
  const by = YT(0);
  const bh = Y(0) - by;
  if (th.decor === "crypt") {
    return (
      <g>
        {[0.2, 0.5, 0.8].map((f) => (
          <g key={f}>
            <path d={`M${bx + bw * f - 20} ${by + bh} L${bx + bw * f - 20} ${by + bh * 0.42} Q${bx + bw * f} ${by + bh * 0.2} ${bx + bw * f + 20} ${by + bh * 0.42} L${bx + bw * f + 20} ${by + bh}Z`} fill="#000" opacity="0.5" />
            <path d={`M${bx + bw * f - 20} ${by + bh * 0.42} Q${bx + bw * f} ${by + bh * 0.2} ${bx + bw * f + 20} ${by + bh * 0.42}`} stroke={th.glow} strokeWidth="1.6" fill="none" opacity="0.35" />
            <circle cx={bx + bw * f} cy={by + bh * 0.62} r="6" fill="#e7e0c8" opacity="0.55" />
            <rect x={bx + bw * f - 3} y={by + bh * 0.62 + 4} width="6" height="4" fill="#e7e0c8" opacity="0.45" />
          </g>
        ))}
      </g>
    );
  }
  if (th.decor === "cave") {
    return (
      <g>
        {Array.from({ length: 9 }, (_, i) => {
          const r = 0.3 + i * 0.75;
          const left = i % 2 === 0;
          const s = S(r);
          const x = X(left ? 0 : COLS, r) + (left ? 8 : -8) * s;
          const y = Y(r) - 6 * s;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s * 1.6})`}>
              <circle cy="-8" r="18" fill={th.glow} opacity="0.14" className="dg-gleam" style={{ animationDelay: `${i * 0.3}s` }} />
              <path d="M-2 0 L-2 -8 M5 0 L5 -5" stroke="#d1fae5" strokeWidth="2" />
              <path d="M-9 -8 Q-2 -20 5 -8Z" fill={th.flame} />
              <path d="M1 -5 Q6 -13 11 -5Z" fill={th.glow} />
            </g>
          );
        })}
        {[0.15, 0.4, 0.62, 0.85].map((f, i) => (
          <path key={f} d={`M${bx + bw * f - 9} ${by} L${bx + bw * f} ${by + 26 + i * 6} L${bx + bw * f + 9} ${by}Z`} fill={th.wall2} stroke="#000" strokeOpacity="0.4" />
        ))}
      </g>
    );
  }
  if (th.decor === "forge") {
    return (
      <g>
        <rect x={bx + bw * 0.28} y={by + bh * 0.4} width={bw * 0.44} height={bh * 0.6} rx="8" fill="#0b0402" opacity="0.7" />
        <rect x={bx + bw * 0.3} y={by + bh * 0.62} width={bw * 0.4} height={bh * 0.38} rx="6" fill={th.glow} opacity="0.5" className="dg-gleam" />
        <ellipse cx={CX} cy={by + bh * 0.9} rx={bw * 0.3} ry={bh * 0.1} fill={th.flame} opacity="0.35" />
        {[[1, 1], [3, 4], [2, 5], [4, 2], [0, 3]].map(([c, r], i) => {
          const q = quad(c, r);
          const cx = (q[0][0] + q[2][0]) / 2;
          const cy = (q[0][1] + q[2][1]) / 2;
          const sc = S(r + 0.5);
          return <path key={i} d={`M${cx - 20 * sc} ${cy - 4 * sc} L${cx - 4 * sc} ${cy + 3 * sc} L${cx + 6 * sc} ${cy - 5 * sc} L${cx + 20 * sc} ${cy + 2 * sc}`} stroke={th.glow} strokeWidth={2.4 * sc} fill="none" opacity="0.85" className="dg-gleam" style={{ animationDelay: `${i * 0.4}s` }} />;
        })}
      </g>
    );
  }
  if (th.decor === "lair") {
    return (
      <g>
        {[0.22, 0.78].map((f) => (
          <g key={f} className="dg-sway">
            <path d={`M${bx + bw * f - 14} ${by + 6} L${bx + bw * f + 14} ${by + 6} L${bx + bw * f + 14} ${by + 70} L${bx + bw * f} ${by + 58} L${bx + bw * f - 14} ${by + 70}Z`} fill="#7f1d1d" stroke="#450a0a" />
            <circle cx={bx + bw * f} cy={by + 28} r="6" fill="#fbbf24" opacity="0.8" />
          </g>
        ))}
        {[[0.5, 0.9], [4.1, 0.6], [1.2, 4.2], [3.6, 5.2]].map(([c, r], i) => {
          const s = S(r + 0.5);
          return (
            <g key={i} transform={`translate(${X(c, r + 0.5)} ${Y(r + 0.5)}) scale(${s * 1.3})`} opacity="0.9">
              <ellipse rx="16" ry="5" fill="#000" opacity="0.3" />
              <path d="M-12 -2 L8 -8 M-6 -6 L12 0 M-10 -8 L14 -4" stroke="#e7e0c8" strokeWidth="3.2" strokeLinecap="round" />
              <circle cx="-14" cy="-6" r="4" fill="#e7e0c8" />
            </g>
          );
        })}
      </g>
    );
  }
  if (th.decor === "web") {
    const strand = (x: number, y: number, dir: number, k: string) => (
      <g key={k} className="dg-sway" stroke="#e5e7eb" strokeWidth="1.1" fill="none" opacity="0.55">
        <path d={`M${x} ${y} L${x + dir * 70} ${y + 8} M${x} ${y} L${x + dir * 60} ${y + 36} M${x} ${y} L${x + dir * 30} ${y + 60} M${x} ${y} L${x} ${y + 66}`} />
        <path d={`M${x + dir * 22} ${y + 3} Q${x + dir * 26} ${y + 20} ${x + dir * 8} ${y + 22} M${x + dir * 42} ${y + 5} Q${x + dir * 44} ${y + 34} ${x + dir * 16} ${y + 40} M${x + dir * 60} ${y + 7} Q${x + dir * 60} ${y + 50} ${x + dir * 24} ${y + 58}`} />
      </g>
    );
    return (
      <g>
        {strand(X(0, 0) + 2, YT(0) + 2, 1, "l")}
        {strand(X(COLS, 0) - 2, YT(0) + 2, -1, "r")}
        {[0.3, 0.68].map((f) => (
          <g key={f} className="dg-sway">
            <path d={`M${CX + (f - 0.5) * 200} ${YT(0)} L${CX + (f - 0.5) * 200} ${YT(0) + 60}`} stroke="#e5e7eb" strokeWidth="1" opacity="0.6" />
            <ellipse cx={CX + (f - 0.5) * 200} cy={YT(0) + 78} rx="9" ry="17" fill="#e5e7eb" opacity="0.75" stroke="#9ca3af" />
          </g>
        ))}
      </g>
    );
  }
  return (
    <g>
      {[0.18, 0.42, 0.7, 0.88].map((f, i) => (
        <g key={f} className="dg-gleam" style={{ animationDelay: `${i * 0.5}s` }}>
          <ellipse cx={bx + bw * f} cy={by + bh * (0.5 + (i % 2) * 0.2)} rx="11" ry="15" fill={th.glow} opacity="0.55" stroke="#000" strokeOpacity="0.4" />
          <ellipse cx={bx + bw * f - 3} cy={by + bh * (0.5 + (i % 2) * 0.2) - 5} rx="3" ry="5" fill="#fff" opacity="0.45" />
        </g>
      ))}
      {[0.1, 0.55, 0.9].map((f) => (
        <path key={f} d={`M${bx + bw * f} ${by} Q${bx + bw * f + 4} ${by + 30} ${bx + bw * f} ${by + 46}`} stroke={th.glow} strokeWidth="3" fill="none" opacity="0.5" />
      ))}
    </g>
  );
}

const Room = memo(function Room({ th, rune }: { th: Theme; rune?: string }) {
  const rows = Array.from({ length: ROWS }, (_, r) => r);
  const tiles = rows.flatMap((r) => Array.from({ length: COLS }, (_, c) => ({ c, r })));
  const bx = X(0, 0);
  const bw = X(COLS, 0) - bx;
  const by = YT(0);
  const bh = Y(0) - by;
  const courses = [0.17, 0.34, 0.51, 0.68, 0.85];
  return (
    <g>
      <defs>
        <linearGradient id="dg-fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={th.bg} stopOpacity="0.75" />
          <stop offset="1" stopColor={th.bg} stopOpacity="0" />
        </linearGradient>
        <pattern id="dg-brick" width="44" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 0.5H44M0 13.5H44M22 0V13M0 13V26M44 13V26" stroke="#000" strokeOpacity="0.32" fill="none" />
          <path d="M1 1.5H21M23 14.5H43" stroke="#fff" strokeOpacity="0.08" />
        </pattern>
        <radialGradient id="dg-back" cx="0.5" cy="0.62" r="0.7">
          <stop offset="0" stopColor={th.glow} stopOpacity="0.28" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id="dg-pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={th.glow} stopOpacity="0.3" />
          <stop offset="1" stopColor={th.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dg-sidel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={th.bg} />
      <polygon points={pts([[X(0, 0), YT(0)], [X(COLS, 0), YT(0)], [X(COLS, ROWS), YT(ROWS)], [X(0, ROWS), YT(ROWS)]])} fill={th.ceil} />
      {rows.map((r) => (
        <g key={r}>
          <line x1={X(0, r)} y1={YT(r)} x2={X(COLS, r)} y2={YT(r)} stroke="#000" strokeOpacity="0.5" strokeWidth={4 * S(r)} />
          <line x1={X(0, r)} y1={YT(r) + 3 * S(r)} x2={X(COLS, r)} y2={YT(r) + 3 * S(r)} stroke="#fff" strokeOpacity="0.05" strokeWidth={2 * S(r)} />
        </g>
      ))}
      <rect x={bx} y={by} width={bw} height={bh} fill={th.wall2} />
      <rect x={bx} y={by} width={bw} height={bh} fill="url(#dg-brick)" />
      <rect x={bx} y={by} width={bw} height={bh} fill="url(#dg-back)" />
      <Decor th={th} />
      {rows.map((r) => {
        const L = (f: number): [number, number, number, number] => [X(0, r), YT(r) + (Y(r) - YT(r)) * f, X(0, r + 1), YT(r + 1) + (Y(r + 1) - YT(r + 1)) * f];
        const R = (f: number): [number, number, number, number] => [X(COLS, r), YT(r) + (Y(r) - YT(r)) * f, X(COLS, r + 1), YT(r + 1) + (Y(r + 1) - YT(r + 1)) * f];
        return (
          <g key={r}>
            <polygon points={pts([[X(0, r), YT(r)], [X(0, r + 1), YT(r + 1)], [X(0, r + 1), Y(r + 1)], [X(0, r), Y(r)]])} fill={r % 2 ? th.wall2 : th.wall} />
            <polygon points={pts([[X(COLS, r), YT(r)], [X(COLS, r + 1), YT(r + 1)], [X(COLS, r + 1), Y(r + 1)], [X(COLS, r), Y(r)]])} fill={r % 2 ? th.wall : th.wall2} />
            <polygon points={pts([[X(0, r), YT(r)], [X(0, r + 1), YT(r + 1)], [X(0, r + 1), Y(r + 1)], [X(0, r), Y(r)]])} fill="#000" opacity="0.18" />
            {courses.map((f) => {
              const a = L(f);
              const b = R(f);
              return (
                <g key={f}>
                  <line x1={a[0]} y1={a[1]} x2={a[2]} y2={a[3]} stroke="#000" strokeOpacity="0.3" strokeWidth={2 * S(r)} />
                  <line x1={b[0]} y1={b[1]} x2={b[2]} y2={b[3]} stroke="#000" strokeOpacity="0.3" strokeWidth={2 * S(r)} />
                </g>
              );
            })}
            <line x1={X(0, r)} y1={YT(r)} x2={X(0, r)} y2={Y(r)} stroke="#000" strokeOpacity="0.5" strokeWidth={3 * S(r)} />
            <line x1={X(COLS, r)} y1={YT(r)} x2={X(COLS, r)} y2={Y(r)} stroke="#000" strokeOpacity="0.5" strokeWidth={3 * S(r)} />
          </g>
        );
      })}
      {tiles.map(({ c, r }) => {
        const q = quad(c, r);
        const h = hash(c, r);
        const cx = (q[0][0] + q[2][0]) / 2;
        const cy = (q[0][1] + q[2][1]) / 2;
        const sc = S(r + 0.5);
        return (
          <g key={`${c}-${r}`}>
            <polygon points={pts(q)} fill={(c + r) % 2 ? th.floorA : th.floorB} stroke="#000" strokeOpacity="0.32" strokeWidth="1.2" />
            <polygon points={pts(q)} fill="#fff" opacity={0.02 + h * 0.05} />
            <line x1={q[3][0]} y1={q[3][1]} x2={q[2][0]} y2={q[2][1]} stroke="#fff" strokeOpacity="0.08" strokeWidth={1.6 * sc} />
            {h > 0.8 && <path d={`M${cx - 14 * sc} ${cy - 3 * sc} L${cx - 2 * sc} ${cy + 2 * sc} L${cx + 4 * sc} ${cy - 4 * sc} L${cx + 15 * sc} ${cy + 3 * sc}`} stroke="#000" strokeOpacity="0.4" strokeWidth={1.3 * sc} fill="none" />}
            {h < 0.1 && <circle cx={cx} cy={cy} r={3 * sc} fill="#000" opacity="0.2" />}
          </g>
        );
      })}
      {rune && (
        <g className="dg-portal" style={{ transformOrigin: `${CX}px ${Y(3.5)}px` }}>
          <ellipse cx={CX} cy={Y(3.5)} rx={150 * S(3.5)} ry={52 * S(3.5)} fill="none" stroke={rune} strokeWidth={3 * S(3.5)} opacity="0.55" />
          <ellipse cx={CX} cy={Y(3.5)} rx={108 * S(3.5)} ry={36 * S(3.5)} fill="none" stroke={rune} strokeWidth={2 * S(3.5)} strokeDasharray="6 7" opacity="0.5" />
        </g>
      )}
      <rect x="0" y={YT(0)} width={W} height={Y(4) - YT(0)} fill="url(#dg-fog)" pointerEvents="none" />
      {[1, 3, 5].flatMap((r) =>
        [0, COLS].map((c) => {
          const s = S(r + 0.5);
          const x = X(c, r + 0.5) + (c === 0 ? 3 : -3) * s;
          const y = HOR + 90 * s;
          return (
            <g key={`${c}-${r}`}>
              <circle cx={x} cy={y - 14 * s} r={110 * s} fill={th.glow} opacity="0.12" />
              <ellipse cx={X(c === 0 ? 0.9 : COLS - 0.9, r + 0.5)} cy={Y(r + 0.5)} rx={90 * s} ry={30 * s} fill="url(#dg-pool)" />
              <g transform={`translate(${x} ${y}) scale(${s * 1.35})`}>
                <Torch flame={th.flame} />
              </g>
            </g>
          );
        }),
      )}
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} className="dg-mote" cx={90 + hash(i, 1) * 460} cy={220 + hash(i, 2) * 260} r={1 + hash(i, 3) * 1.6} fill={th.mote} style={{ animationDelay: `${hash(i, 4) * 7}s`, animationDuration: `${5 + hash(i, 5) * 5}s` }} />
      ))}
    </g>
  );
});

const Vignette = memo(function Vignette() {
  return (
    <g pointerEvents="none">
      <defs>
        <radialGradient id="dg-vig" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#dg-vig)" />
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
  const def = DUNGEONS[g.dungeon];
  const th = def.themes[Math.min(g.floor, def.last)];
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
            {e.frozen > 0 && <ellipse cx="0" cy={-h / 2} rx={isBoss(e.kind) ? 58 : 32} ry={h / 2 + 6} fill="#7dd3fc" opacity="0.4" stroke="#e0f2fe" strokeWidth="2" />}
          </g>
          <g transform={`translate(0 ${-h - 16})`}>
            <rect x="-20" y="-3" width="40" height="6" rx="3" fill="#000" opacity="0.6" />
            <rect x="-20" y="-3" width={Math.max(0, (40 * e.hp) / e.max)} height="6" rx="3" fill={isBoss(e.kind) ? "#f97316" : "#ef4444"} />
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
          <HeroArt guard={g.hero.guard} cls={g.hero.cls} look={g.hero.look} ward={g.hero.ward > 0} />
        </g>
      </g>
    ),
  });
  items.sort((a, b) => a.r - b.r || a.z - b.z);
  const tiles = Array.from({ length: ROWS * COLS }, (_, i) => ({ c: i % COLS, r: Math.floor(i / COLS) }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="block size-full" data-testid="dungeon-scene">
      <g key={shake} className={shake ? "dg-shake" : undefined}>
        <Room th={th} rune={g.floor === g.last ? def.accent : undefined} />
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
        <Vignette />
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

export default function Dungeon({ dungeonId, onExit }: { dungeonId: DungeonId; onExit: () => void }) {
  const def = DUNGEONS[dungeonId];
  const hub = useDungeonHub();
  const actions = useDungeonActions();
  const [g, setG] = useState<Game | null>(null);
  const [fx, setFx] = useState<Fx[]>([]);
  const [roll, setRoll] = useState<{ id: number; die: string; v: number; t?: string } | null>(null);
  const [shake, setShake] = useState(0);
  const [banner, setBanner] = useState<{ id: number; text: string } | null>(null);
  const [runId, setRunId] = useState(0);
  const [endShown, setEndShown] = useState(false);
  const [starting, setStarting] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<FinishResult | null>(null);
  const [failed, setFailed] = useState(false);
  const gRef = useRef<Game | null>(null);
  const lock = useRef(0);
  const finished = useRef(false);
  const token = useRef("");

  const items = useMemo(() => Object.fromEntries((hub.data?.items ?? []).map((i) => [i.id, i])), [hub.data?.items]);
  const trophies = useMemo(() => Object.fromEntries((hub.data?.trophies ?? []).map((t) => [t.id, t])), [hub.data?.trophies]);
  const info = hub.data?.dungeons.find((d) => d.id === dungeonId);
  const bagLeft = hub.data ? hub.data.bag_limit - Object.values(hub.data.bag).reduce((a, b) => a + b, 0) : 0;
  const myTrophies = (hub.data?.trophies ?? []).filter((t) => t.dungeon === dungeonId);

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

  const start = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const r = await actions.start.mutateAsync(dungeonId);
      token.current = r.run_id;
      const ng = newRun(dungeonId, r.loadout);
      gRef.current = ng;
      finished.current = false;
      setG(ng);
      setFx([]);
      setRoll(null);
      setResult(null);
      setFailed(false);
      setRevealed(false);
      setRolling(false);
      setEndShown(false);
      setRunId((n) => n + 1);
      sfx("open");
    } catch {
      sfx("error");
    } finally {
      setStarting(false);
    }
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
    setBanner({ id: Date.now(), text: g.floor === g.last ? `${DEF[def.boss].name} ti attende` : `Piano ${g.floor} · ${def.floorNames[g.floor]}` });
    const t = window.setTimeout(() => setBanner(null), 1600);
    return () => window.clearTimeout(t);
  }, [g?.floor, runId]);

  useEffect(() => {
    if (!g || g.phase !== "end") {
      setEndShown(false);
      return;
    }
    if (!finished.current) {
      finished.current = true;
      actions.finish
        .mutateAsync({ run_id: token.current, cleared: g.cleared, won: g.over === "won", kills: g.killsBy as Record<string, number> })
        .then((r) => {
          setResult(r);
          if (g.cleared < 1) setRevealed(true);
        })
        .catch(() => setFailed(true));
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
      else if ("qwer".includes(k) && k.length === 1) dispatch({ t: "ab", i: "qwer".indexOf(k) });
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
    window.setTimeout(() => {
      setRolling(false);
      setRevealed(true);
      sfx("success");
    }, 900);
  };

  const h = g?.hero;
  const pct = h ? Math.max(0, Math.min(100, (h.hp / h.max) * 100)) : 0;
  const rollColor = roll && roll.die !== "d6" ? DIE_INFO[roll.die as keyof typeof DIE_INFO]?.color : "#f8fafc";
  const lootCounts = useMemo(() => {
    const m: Record<string, number> = {};
    result?.loot.forEach((i) => (m[i] = (m[i] ?? 0) + 1));
    return Object.entries(m);
  }, [result]);

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
            <div className="font-semibold">Piano {g.floor}/{g.last}</div>
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
            <div className="dg-pop w-full max-w-md rounded-2xl bg-[#13102a]/95 p-4 ring-1 ring-white/15 backdrop-blur" data-testid="dungeon-intro" style={{ boxShadow: `0 0 40px ${def.accent}33` }}>
              <h2 className="text-center text-xl font-extrabold text-amber-200">{def.name}</h2>
              <p className="mt-1 text-center text-xs text-[#C9D1D9]">{def.blurb}</p>
              <ul className="mt-3 space-y-1.5 text-xs text-[#E6EDF3]">
                <li>🗡 Cammina contro un nemico per colpirlo: tiri un d6 (con il 6 è critico, danno doppio).</li>
                <li>🟥 Le caselle rosse sono attacchi in arrivo: spostati prima del turno dopo!</li>
                <li>🛡 Lo Scudo (Spazio) para tutto per un turno e rimanda 2 danni a chi ti colpisce.</li>
                <li>🎲 Raccogli i dadi speciali: {Object.values(DIE_INFO).map((d) => d.icon).join(" ")} e lanciali dai tuoi slot (tasti 1-5).</li>
                <li>🛒 In premio: pezzi di armatura, armi e gemme da vendere al negozio, e trofei dei mostri da esporre.</li>
              </ul>
              {myTrophies.length > 0 && (
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  {myTrophies.map((t) => {
                    const own = hub.data?.mine.includes(t.id);
                    return (
                      <span key={t.id} title={own ? t.name : "Trofeo da trovare"} className={cn("grid size-9 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10", !own && "opacity-30 grayscale")}>
                        <TrophyArt art={t.art} color={t.color} size={28} />
                      </span>
                    );
                  })}
                </div>
              )}
              <p className="mt-2 text-center text-[11px] text-[#9AA4B2]">
                Record: piano {info?.record.best ?? 0}/{def.last} · vittorie {info?.record.wins ?? 0} · posti liberi nello zaino: {bagLeft}
              </p>
              <Button size="lg" className="mt-3 w-full" onClick={start} disabled={starting || !hub.data} data-testid="dungeon-start">
                {starting ? "Si apre il portone…" : `Entra: ${def.name}`}
              </Button>
              <Button size="sm" variant="ghost" className="mt-1 w-full" onClick={onExit}>
                Torna all'ingresso
              </Button>
            </div>
          </div>
        )}

        {g?.phase === "end" && endShown && (
          <div className="absolute inset-0 grid touch-pan-y place-items-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm" data-testid="dungeon-end">
            <div className="dg-pop w-full max-w-md rounded-2xl bg-[#13102a]/95 p-4 text-center ring-1 ring-white/15">
              <h2 className={cn("text-xl font-extrabold", g.over === "won" ? "text-amber-200" : "text-rose-300")}>{g.over === "won" ? `🏆 ${DEF[def.boss].name} sconfitto!` : `💀 Sei caduto: ${def.name}`}</h2>
              <p className="mt-1 text-xs text-[#C9D1D9]">
                Piani superati: {g.cleared}/{g.last} · Nemici sconfitti: {g.kills}
              </p>
              {failed && <p className="mt-3 text-sm text-rose-300">Non sono riuscito a salvare il bottino. Controlla la connessione.</p>}
              {!failed && g.cleared < 1 && !result && <p className="mt-3 text-sm text-[#C9D1D9]">Conto il bottino…</p>}
              {!failed && g.cleared < 1 && result && !result.trophies.length && <p className="mt-3 text-sm text-[#C9D1D9]">Nessun tesoro: supera almeno un piano per portare a casa qualcosa.</p>}
              {!failed && g.cleared >= 1 && !revealed && (
                <div className="mt-3">
                  <p className="text-sm text-[#E6EDF3]">Il forziere si apre con un dado: il bottino è già nel tuo zaino, ma il tiro decide cosa hai trovato.</p>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <DiceFace v={rolling ? 6 : 1} className={cn("size-16", rolling && "dg-roll")} color="#fde68a" />
                    <Button size="lg" onClick={claim} disabled={rolling || !result} data-testid="dungeon-claim">
                      {result ? "Lancia il dado del tesoro" : "Conto il bottino…"}
                    </Button>
                  </div>
                </div>
              )}
              {revealed && result && (
                <div className="mt-3">
                  {g.cleared >= 1 && (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <DiceFace v={result.roll} className="size-9" color="#fde68a" />
                      <span>Hai tirato {result.roll}!</span>
                    </div>
                  )}
                  {result.xp > 0 && (
                    <div className="dg-pop mt-2 rounded-xl bg-violet-500/15 p-2 text-sm ring-1 ring-violet-300/30">
                      <span className="font-semibold text-violet-200">+{result.xp} XP</span>
                      {result.leveled && <span className="ml-2 font-bold text-amber-300">Livello {result.level}!</span>}
                      {result.new_abilities.map((id) => {
                        const ab = hub.data?.abilities.find((x) => x.id === id);
                        return ab ? (
                          <div key={id} className="mt-1 text-xs text-[#E6EDF3]">
                            {ab.icon} Nuova abilità: <b>{ab.name}</b> (ricarica {ab.cd} turni)
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                  {result.gear.map((id) => {
                    const gi = hub.data?.gear.find((x) => x.id === id);
                    return gi ? (
                      <div key={id} style={{ borderColor: gi.color }} className="dg-pop mt-2 flex items-center gap-3 rounded-xl border bg-white/5 p-2 text-left">
                        <LootIcon shape={gi.shape} color={gi.color} size={48} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold tracking-wide text-amber-300 uppercase">Equipaggiamento raro trovato!</div>
                          <div className="truncate text-sm font-semibold">{gi.name}</div>
                          <RarityTag rarity={gi.rarity} />
                        </div>
                      </div>
                    ) : null;
                  })}
                  {result.gear_refund > 0 && <p className="mt-2 text-xs text-amber-300">Duplicati convertiti in {result.gear_refund} monete.</p>}
                  {result.trophies.length > 0 && (
                    <div className="mt-2 grid gap-2">
                      {result.trophies.map((id, i) => {
                        const t = trophies[id];
                        if (!t) return null;
                        return (
                          <div key={id} style={{ animationDelay: `${i * 160}ms`, borderColor: t.color }} className="dg-pop flex items-center gap-3 rounded-xl border bg-white/5 p-2 text-left">
                            <TrophyArt art={t.art} color={t.color} size={52} />
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold tracking-wide text-amber-300 uppercase">Nuovo trofeo!</div>
                              <div className="truncate text-sm font-semibold">{t.name}</div>
                              <div className="text-[11px] text-[#9AA4B2]">Ora è esposto nella Sala dei Cacciatori.</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-2 grid gap-2">
                    {lootCounts.map(([id, n], i) => {
                      const it = items[id];
                      if (!it) return null;
                      return (
                        <div key={id} style={{ animationDelay: `${(i + result.trophies.length) * 140}ms` }} className="dg-pop flex items-center gap-3 rounded-xl bg-white/5 p-2 text-left ring-1 ring-white/10">
                          <LootIcon shape={it.shape} color={it.color} size={46} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">
                              {it.name}
                              {n > 1 ? ` ×${n}` : ""}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <RarityTag rarity={it.rarity} />
                              <span className="text-[11px] text-[#9AA4B2]">vale {it.value} monete</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {result.lost > 0 && <p className="mt-2 text-xs text-amber-300">Zaino pieno: {result.lost} oggetti persi. Vendili al negozio prima della prossima discesa!</p>}
                  {result.loot.length > 0 && <p className="mt-2 text-[11px] text-[#9AA4B2]">Trovi tutto nello zaino del dungeon: puoi venderlo nel negozio della città.</p>}
                </div>
              )}
              {(failed || (g.cleared < 1 && result) || revealed) && (
                <div className="mt-3 grid gap-2">
                  <Button size="lg" onClick={start} disabled={starting} data-testid="dungeon-retry">
                    Scendi di nuovo
                  </Button>
                  <Button size="lg" variant="outline" onClick={onExit}>
                    Torna all'ingresso
                  </Button>
                </div>
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
            {h.abs.length > 0 && (
              <div className="flex flex-wrap justify-end gap-1.5">
                {h.abs.map((a, i) => (
                  <button
                    key={a.def.id}
                    type="button"
                    title={`${a.def.name}: ${a.def.text}`}
                    aria-label={a.def.name}
                    onClick={() => dispatch({ t: "ab", i })}
                    className={cn("relative grid size-12 touch-manipulation place-items-center overflow-hidden rounded-xl border-2 text-2xl transition-transform active:scale-90 sm:size-11", a.left > 0 ? "border-white/15 bg-white/5" : "border-amber-300 bg-amber-300/20 shadow-[0_0_12px_#fbbf2466]")}
                  >
                    <span className={cn(a.left > 0 && "opacity-35")}>{a.def.icon}</span>
                    {a.left > 0 && <span className="absolute inset-0 grid place-items-center text-lg font-extrabold text-white drop-shadow">{a.left}</span>}
                    <span className="absolute -top-1 -left-1 grid size-4 place-items-center rounded-full bg-black/70 text-[9px] text-white/80 uppercase">{"qwer"[i]}</span>
                  </button>
                ))}
              </div>
            )}
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
