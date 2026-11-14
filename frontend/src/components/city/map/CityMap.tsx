import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Forest3D, ForestNight, Stadium3D, StadiumNight } from "./Landmarks";
import { Dungeon3D, DungeonNight } from "./DungeonGate";
import { Dig3D, DigNight, School3D, SchoolNight, Shop3D, ShopNight } from "./Places";
import { WORLD, WORLD_H, WORLD_W, type House, type Pt } from "./cityWorld";
import "../shared/city.css";
import "../animals/wild.css";

type View = "map" | "lobby" | "room" | "pond" | "forest" | "stadium" | "animals" | "school" | "dig" | "fossils" | "shop" | "dungeon";

const OAK = ["#1f5a2b", "#2f7a3a", "#3f9248", "#66bd68"];
const CHERRY = ["#b84a7e", "#da6c9d", "#f19cc0", "#ffd3e5"];

function Tag({ x, y, w = 100, text, color }: { x: number; y: number; w?: number; text: string; color: string }) {
  return (
    <g>
      <rect x={x - w / 2 + 1} y={y + 3} width={w} height="26" rx="13" fill="#000000" opacity="0.35" />
      <rect x={x - w / 2} y={y} width={w} height="26" rx="13" fill="#161B22" stroke={color} strokeWidth="2" />
      <rect x={x - w / 2 + 4} y={y + 2.5} width={w - 8} height="8" rx="4" fill="#ffffff" opacity="0.08" />
      <circle cx={x - w / 2 + 14} cy={y + 13} r="3.2" fill={color} />
      <text x={x + 6} y={y + 18} textAnchor="middle" fontSize="16" fontWeight="600" fill="#F0F6FC">
        {text}
      </text>
    </g>
  );
}

function Tree({ x, y, s = 1, t = "oak" }: Pt) {
  const k = Math.abs(Math.round(x * 7.3 + y * 13.1));
  if (t === "pine") {
    const tiers = [
      [-6, 14, 24, "#1d6637"],
      [-18, 5, 20, "#238044"],
      [-30, -4, 16, "#2a9650"],
      [-42, -13, 12, "#34ad5d"],
    ] as const;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx="4" cy="17" rx="20" ry="5.5" fill="#000000" opacity="0.24" />
        <path d="M-3.4 18 L-2.2 4 H2.2 L3.4 18Z" fill="#4f3319" />
        <rect x="-3.4" y="6" width="1.6" height="12" fill="#ffffff" opacity="0.1" />
        {tiers.map(([a, b, w, c], i) => (
          <g key={i}>
            <path d={`M0 ${a} L${w} ${b} Q0 ${b + 5} ${-w} ${b}Z`} fill={c} />
            <path d={`M0 ${a} L${w} ${b} Q${w / 2} ${b + 3} 0 ${b + 3}Z`} fill="#000000" opacity="0.2" />
            <path d={`M0 ${a} L${-w * 0.6} ${a + (b - a) * 0.6} L${-w * 0.15} ${a + (b - a) * 0.5}Z`} fill="#ffffff" opacity="0.16" />
            <path d={`M${-w * 0.8} ${b - 1} q${w * 0.8} 4.5 ${w * 1.6} 0`} stroke="#0c3a1c" strokeWidth="1.4" opacity="0.4" fill="none" />
          </g>
        ))}
        <path d="M0 -42 L3 -34 L-3 -34Z" fill="#ffffff" opacity="0.25" />
      </g>
    );
  }
  const c = t === "cherry" ? CHERRY : OAK;
  const dots = [[-11, -4], [8, -14], [-3, -18], [12, -3], [-13, -12], [3, 2], [-6, -8], [10, -9]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="5" cy="16" rx="22" ry="6.5" fill="#000000" opacity="0.24" />
      <path d="M-4.5 17 C-3.5 10 -2.6 4 -2.6 -3 H2.6 C2.6 4 3.4 10 5 17Z" fill="#6b4a2b" />
      <rect x="-3.6" y="2" width="2" height="15" fill="#ffffff" opacity="0.12" />
      <path d="M0 -2 L-8 -12 M0 -4 L8 -13" stroke="#5a3b20" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="-11" cy="-1" r="11" fill={c[0]} />
      <circle cx="11" cy="-3" r="11" fill={c[0]} />
      <circle cx="0" cy="-9" r="15" fill={c[0]} />
      <circle cx="0" cy="-6" r="16" fill={c[1]} />
      <circle cx="-10" cy="-1" r="10" fill={c[1]} />
      <circle cx="10" cy="-9" r="9.5" fill={c[2]} />
      <circle cx="-5" cy="-14" r="9" fill={c[2]} />
      <circle cx="-7" cy="-16" r="5.5" fill={c[3]} opacity="0.7" />
      <path d="M-16 4 q16 9 32 0" stroke="#000000" strokeWidth="3" opacity="0.14" fill="none" />
      {dots.map(([a, b], i) => (
        <circle key={i} cx={a} cy={b} r={1.2 + ((k + i) % 3) * 0.5} fill={i % 2 ? c[3] : c[0]} opacity="0.55" />
      ))}
      {t === "cherry" &&
        dots.map(([a, b], i) => <circle key={`p${i}`} cx={a * 0.9} cy={b * 0.9 - 2} r="1.8" fill="#fff0f6" opacity="0.9" />)}
      {t === "cherry" && [[-14, 12], [10, 15], [18, 9]].map(([a, b], i) => <circle key={`f${i}`} cx={a} cy={b} r="1.3" fill="#ffd3e5" opacity="0.8" />)}
    </g>
  );
}

function Smoke({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#dfe6f2" opacity="0">
          <animate attributeName="cy" values={`${y};${y - 30}`} dur="4s" begin={`${i * 1.3}s`} repeatCount="indefinite" />
          <animate attributeName="cx" values={`${x};${x + 8}`} dur="4s" begin={`${i * 1.3}s`} repeatCount="indefinite" />
          <animate attributeName="r" values="2;7" dur="4s" begin={`${i * 1.3}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.55;0" dur="4s" begin={`${i * 1.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  );
}

function Home({ x, y, c, w = "#e8dcc4", smoke }: House) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="5" cy="19" rx="33" ry="6.5" fill="#000000" opacity="0.26" />
      <rect x="-24" y="11" width="48" height="7" rx="1" fill="#8d887c" />
      {[-21, -12, -3, 6, 15].map((a) => (
        <rect key={a} x={a} y="12" width="7" height="4.5" rx="1" fill="#aaa598" opacity="0.85" />
      ))}
      <rect x="-22" y="-14" width="44" height="26" fill={w} />
      <path d="M-22 -5 H22 M-22 3 H22" stroke="#000000" strokeOpacity="0.06" />
      <rect x="-22" y="-14" width="3" height="26" fill="#6b4a2b" opacity="0.5" />
      <rect x="19" y="-14" width="3" height="26" fill="#6b4a2b" opacity="0.5" />
      <rect x="-22" y="-14" width="44" height="26" fill="url(#cm-shade)" />
      <rect x="-22" y="-14" width="44" height="5" fill="#000000" opacity="0.18" />
      <rect x="9" y="-37" width="9" height="20" fill="#8a4b36" />
      <path d="M9 -31 H18 M9 -25 H18 M13 -37 V-31 M16 -31 V-25 M11 -25 V-19" stroke="#5e3224" strokeWidth="0.8" />
      <rect x="7.5" y="-39" width="12" height="3.5" fill="#5e3224" />
      {smoke && <Smoke x={13.5} y={-42} />}
      <path d="M-30 -13 L0 -39 L30 -13Z" fill={c} />
      <path d="M0 -39 L30 -13 H0Z" fill="#000000" opacity="0.14" />
      {[-19, -25, -31].map((a) => {
        const hw = (30 * (a + 39)) / 26;
        return <path key={a} d={`M${-hw} ${a} H${hw}`} stroke="#000000" strokeOpacity="0.17" strokeWidth="1.2" />;
      })}
      {[-20, -10, 0, 10, 20].map((a) => (
        <path key={a} d={`M${a * 0.55} -37 L${a * 1.4} -14`} stroke="#000000" strokeOpacity="0.1" />
      ))}
      <path d="M-30 -13 L0 -39 L2.4 -37 L-26 -13Z" fill="#ffffff" opacity="0.24" />
      <path d="M-30 -13 H30" stroke="#000000" strokeOpacity="0.22" strokeWidth="1.6" />
      <circle cx="-1" cy="-24" r="3.6" fill="#3b2a18" />
      <circle cx="-1" cy="-24" r="2.4" fill="#ffe9a3" />
      <path d="M-1 -26.4 V-21.6 M-3.4 -24 H1.4" stroke="#3b2a18" strokeWidth="0.7" />
      <path d="M-5.5 16 V5 Q-5.5 -1 0 -1 Q5.5 -1 5.5 5 V16Z" fill="#3a2616" />
      <path d="M-4.2 16 V5.4 Q-4.2 0.4 0 0.4 Q4.2 0.4 4.2 5.4 V16Z" fill="#6b4a2b" />
      <path d="M0 0.4 V16 M-4.2 8 H4.2" stroke="#3a2616" strokeWidth="0.8" />
      <circle cx="2.4" cy="9.6" r="0.9" fill="#f0c25a" />
      <rect x="-7.5" y="15" width="15" height="3" rx="0.6" fill="#b9b3a3" />
      {[-17, 9].map((a) => (
        <g key={a}>
          <rect x={a - 3.2} y="-8" width="3" height="8" fill={c} />
          <rect x={a - 3.2} y="-8" width="3" height="8" fill="#000000" opacity="0.14" />
          <rect x={a + 8.2} y="-8" width="3" height="8" fill={c} />
          <rect x={a + 8.2} y="-8" width="3" height="8" fill="#000000" opacity="0.14" />
          <rect x={a - 1} y="-9" width="10" height="10" fill="#7a5230" />
          <rect x={a} y="-8" width="8" height="8" fill="url(#cm-glass)" />
          <rect x={a} y="-8" width="8" height="2.6" fill="#ffffff" opacity="0.28" />
          <path d={`M${a + 4} -8 V0 M${a} -4 H${a + 8}`} stroke="#7a5230" strokeWidth="0.9" />
          <rect x={a - 1.6} y="1" width="11.2" height="3.4" rx="0.6" fill="#8a5a34" />
          <circle cx={a + 1.5} cy="0.4" r="1.2" fill="#f43f5e" />
          <circle cx={a + 4} cy="-0.1" r="1.2" fill="#fbbf24" />
          <circle cx={a + 6.5} cy="0.4" r="1.2" fill="#f9a8d4" />
          <path d={`M${a} 1 q2 1.6 4 1 t4 -1`} stroke="#3f9a4a" strokeWidth="1" fill="none" />
        </g>
      ))}
      <circle cx="-23" cy="4" r="3.4" fill="#3f9a4a" />
      <circle cx="-22" cy="-1" r="2.6" fill="#4fb35a" />
      <circle cx="-24" cy="8" r="2.4" fill="#2f7a3a" />
    </g>
  );
}

function Lamp({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="1.5" cy="3" rx="5" ry="1.8" fill="#000000" opacity="0.28" />
      <rect x="-3" y="-1" width="6" height="4" rx="1" fill="#2b3038" />
      <rect x="-1.3" y="-19" width="2.6" height="19" fill="#3a4049" />
      <rect x="-1.3" y="-19" width="0.9" height="19" fill="#ffffff" opacity="0.16" />
      <circle cx="0" cy="-9" r="2.1" fill="#4a515c" />
      <path d="M-5 -19 H5 L3.6 -21 H-3.6Z" fill="#2b3038" />
      <rect x="-3.4" y="-27" width="6.8" height="6.2" rx="1.6" fill="url(#cm-glass)" />
      <rect x="-3.4" y="-27" width="2.4" height="6.2" rx="1" fill="#ffffff" opacity="0.3" />
      <path d="M-4.8 -27 L0 -32 L4.8 -27Z" fill="#2b3038" />
      <circle cx="0" cy="-33" r="1" fill="#2b3038" />
    </g>
  );
}

function Cloud({ y, d, begin, s = 1 }: { y: number; d: number; begin: number; s?: number }) {
  return (
    <g transform={`translate(0 ${y}) scale(${s})`} opacity="0.8">
      <animateTransform attributeName="transform" type="translate" values={`-200 ${y};${WORLD_W + 200} ${y}`} dur={`${d}s`} begin={`${begin}s`} repeatCount="indefinite" additive="replace" />
      <ellipse cx="8" cy="9" rx="44" ry="7" fill="#9fb0cc" opacity="0.45" />
      <ellipse cx="0" cy="0" rx="46" ry="12" fill="#eef3fb" />
      <ellipse cx="-18" cy="-8" rx="24" ry="12" fill="#f6f9ff" />
      <ellipse cx="14" cy="-12" rx="26" ry="14" fill="#ffffff" />
      <ellipse cx="8" cy="6" rx="38" ry="5" fill="#b9c6dd" opacity="0.5" />
    </g>
  );
}

function Bird({ y, d, begin }: { y: number; d: number; begin: number }) {
  return (
    <g>
      <animateTransform attributeName="transform" type="translate" values={`${WORLD_W + 100} ${y};-100 ${y - 40}`} dur={`${d}s`} begin={`${begin}s`} repeatCount="indefinite" />
      <path d="M-6 0 q3 -5 6 0 q3 -5 6 0" stroke="#111827" strokeWidth="1.7" fill="none" strokeLinecap="round">
        <animate attributeName="d" values="M-6 0 q3 -5 6 0 q3 -5 6 0;M-6 -3 q3 3 6 3 q3 0 6 -3;M-6 0 q3 -5 6 0 q3 -5 6 0" dur="0.5s" repeatCount="indefinite" />
      </path>
    </g>
  );
}

function Walker({ path, dur, begin, shirt }: { path: string; dur: number; begin: number; shirt: string }) {
  return (
    <g>
      <animateMotion path={path} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
      <g transform="scale(1.7)">
      <ellipse cx="0.5" cy="2.4" rx="4.4" ry="1.7" fill="#000000" opacity="0.26" />
      <rect x="-2.2" y="-1" width="1.7" height="3.4" rx="0.6" fill="#2b3a55" />
      <rect x="0.5" y="-1" width="1.7" height="3.4" rx="0.6" fill="#2b3a55">
        <animate attributeName="height" values="3.4;1.8;3.4" dur="0.5s" repeatCount="indefinite" />
      </rect>
      <rect x="-2.7" y="-9" width="5.4" height="8.6" rx="2.2" fill={shirt} />
      <rect x="-2.7" y="-9" width="2" height="8.6" rx="1" fill="#ffffff" opacity="0.16" />
      <circle cx="0" cy="-12" r="3.1" fill="#f2c9a0" />
      <path d="M-3.4 -12.6 q3.4 -5 6.8 0 q-1 -1.4 -3.4 -1.4 q-2.4 0 -3.4 1.4Z" fill="#3b2415" />
      <circle cx="3.6" cy="-5" r="1.4" fill="#ffd36a" opacity="0.9" />
      </g>
    </g>
  );
}

function Fountain({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="3" cy="11" rx="42" ry="13" fill="#000000" opacity="0.24" />
      <path d="M-37 3 V8 A37 12.5 0 0 0 37 8 V3Z" fill="#8f97a1" />
      <ellipse cx="0" cy="3" rx="37" ry="12.5" fill="#c9cfd7" />
      <ellipse cx="0" cy="2" rx="32.5" ry="10" fill="#aeb5bf" />
      <ellipse cx="0" cy="1.4" rx="30.5" ry="9" fill="url(#cm-water)" />
      <ellipse cx="-8" cy="0" rx="14" ry="3" fill="#ffffff" opacity="0.28" />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 34.8} cy={3 + Math.sin(a) * 11.2} r="1.5" fill="#e4e8ed" />;
      })}
      <rect x="-4" y="-18" width="8" height="19" fill="#d5dae0" />
      <rect x="-4" y="-18" width="3" height="19" fill="#ffffff" opacity="0.3" />
      <path d="M-15 -14 V-11 A15 5 0 0 0 15 -11 V-14Z" fill="#8f97a1" />
      <ellipse cx="0" cy="-14" rx="15" ry="5" fill="#cfd4da" />
      <ellipse cx="0" cy="-14.4" rx="12.4" ry="3.7" fill="url(#cm-water)" />
      <rect x="-2.4" y="-27" width="4.8" height="13" fill="#d5dae0" />
      <ellipse cx="0" cy="-27" rx="6.5" ry="2.2" fill="#cfd4da" />
      <circle cx="0" cy="-31" r="3.6" fill="#e4e8ed" />
      <circle cx="-1.2" cy="-32" r="1.2" fill="#ffffff" />
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M${d * 3} -30 q${d * 12} -6 ${d * 13} 14`} stroke="#cdeefa" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.85">
            <animate attributeName="opacity" values="0.45;0.95;0.45" dur="1.6s" begin={`${d > 0 ? 0 : 0.5}s`} repeatCount="indefinite" />
          </path>
          <path d={`M${d * 14} -12 q${d * 10} 2 ${d * 14} 16`} stroke="#cdeefa" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.8">
            <animate attributeName="opacity" values="0.35;0.9;0.35" dur="1.9s" begin={`${d > 0 ? 0.3 : 0.9}s`} repeatCount="indefinite" />
          </path>
        </g>
      ))}
      <ellipse cx="0" cy="2" rx="3" ry="1" fill="none" stroke="#ffffff" strokeOpacity="0.7">
        <animate attributeName="rx" values="3;28" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="ry" values="1;8.4" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.7;0" dur="2.6s" repeatCount="indefinite" />
      </ellipse>
    </g>
  );
}

function Stall({ x, y, c }: { x: number; y: number; c: string }) {
  const n = 8;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="4" cy="17" rx="27" ry="4.6" fill="#000000" opacity="0.22" />
      <rect x="-18" y="-2" width="36" height="17" fill="#8a6a43" />
      {[-12, -6, 0, 6, 12].map((a) => (
        <rect key={a} x={a} y="-2" width="1" height="17" fill="#000000" opacity="0.18" />
      ))}
      <rect x="-18" y="4" width="36" height="8" fill={c} opacity="0.9" />
      <path d="M-18 12 q3 3 6 0 t6 0 t6 0 t6 0 t6 0 t6 0Z" fill={c} opacity="0.9" />
      <rect x="-19" y="-3.6" width="38" height="4.4" rx="1" fill="#b08556" />
      <rect x="-19" y="-3.6" width="38" height="1.4" rx="0.7" fill="#ffffff" opacity="0.25" />
      <rect x="-21" y="-26" width="2.4" height="40" fill="#5a3d22" />
      <rect x="18.6" y="-26" width="2.4" height="40" fill="#5a3d22" />
      {Array.from({ length: n }, (_, i) => {
        const x0 = -26 + i * 6.5;
        const t0 = -22 + i * 5.5;
        return (
          <g key={i}>
            <path d={`M${t0} -26 H${t0 + 5.5} L${x0 + 6.5} -12 H${x0}Z`} fill={i % 2 ? "#fff6e4" : c} />
            <path d={`M${x0} -12 q3.25 5 6.5 0Z`} fill={i % 2 ? "#fff6e4" : c} />
          </g>
        );
      })}
      <path d="M-22 -26 H22 L26 -12 H-26Z" fill="#000000" opacity="0.1" />
      <rect x="-22" y="-28" width="44" height="3" rx="1" fill="#000000" opacity="0.22" />
      <path d="M0 -12 V-8" stroke="#3a3f47" strokeWidth="0.8" />
      <circle cx="0" cy="-6.6" r="2.4" fill="#ffd36a" />
      <rect x="-15" y="-9" width="8" height="7" rx="1" fill="#6b4a2b" />
      {[[-12.8, -9.6, "#ef4444"], [-9.2, -9.6, "#f59e0b"], [-11, -12, "#84cc16"]].map(([a, b, f], i) => (
        <circle key={i} cx={a as number} cy={b as number} r="2.3" fill={f as string} />
      ))}
      <rect x="6" y="-8" width="9" height="6" rx="1" fill="#ffffff" opacity="0.88" />
      <path d="M8 -6 H13 M8 -4.2 H11.4" stroke="#6b4a2b" strokeWidth="0.9" />
      {[[-12, 3, "#fbbf24"], [-4, 2.6, "#ef4444"], [4, 3, "#84cc16"], [12, 2.6, "#fb923c"]].map(([a, b, f], i) => (
        <g key={i}>
          <circle cx={a as number} cy={(b as number) - 2} r="3.2" fill={f as string} />
          <circle cx={(a as number) - 1} cy={(b as number) - 3} r="1" fill="#ffffff" opacity="0.5" />
        </g>
      ))}
    </g>
  );
}

function Flowers({ x, y, n = 7 }: { x: number; y: number; n?: number }) {
  const cols = ["#f43f5e", "#fbbf24", "#f9a8d4", "#ffffff", "#a78bfa", "#60a5fa"];
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="3" rx="16" ry="6" fill="#1f5a2b" opacity="0.28" />
      {Array.from({ length: n }, (_, i) => {
        const c = cols[i % cols.length];
        return (
          <g key={i} transform={`translate(${((i * 13) % 26) - 13} ${((i * 7) % 10) - 5})`}>
            <path d="M0 5 q-0.6 -3 0 -5" stroke="#2f7a3a" strokeWidth="1" fill="none" />
            <path d="M0 3.4 q-3 -0.6 -3.6 -3.2 q3 0 3.6 3.2Z" fill="#3f9a4a" />
            {[0, 90, 180, 270].map((a) => (
              <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 1.7} cy={Math.sin((a * Math.PI) / 180) * 1.7} r="1.3" fill={c} />
            ))}
            <circle r="0.8" fill="#fff0a8" />
          </g>
        );
      })}
    </g>
  );
}

function Bush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="2" cy="6" rx="16" ry="4.4" fill="#000000" opacity="0.22" />
      <circle cx="-8" cy="1" r="8" fill="#256a30" />
      <circle cx="8" cy="0" r="9" fill="#2f7a3a" />
      <circle cx="0" cy="-3" r="9" fill="#3a8d44" />
      <circle cx="-6" cy="-5" r="5" fill="#4fae59" opacity="0.8" />
      <circle cx="5" cy="-7" r="3.4" fill="#68c372" opacity="0.7" />
      {[[-9, 1], [6, -2], [11, 3], [-2, -6]].map(([a, b], i) => (
        <circle key={i} cx={a} cy={b} r="1.3" fill="#ef4444" />
      ))}
    </g>
  );
}

function Rock({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="3" cy="6" rx="15" ry="4" fill="#000000" opacity="0.24" />
      <path d="M-13 5 L-9 -5 L0 -9 L10 -6 L14 5Z" fill="#7b8087" />
      <path d="M0 -9 L10 -6 L14 5 L2 5Z" fill="#000000" opacity="0.16" />
      <path d="M-9 -5 L0 -9 L-2 -2Z" fill="#ffffff" opacity="0.25" />
      <path d="M-14 6 q-4 -8 -1 -12 q4 4 4 12Z" fill="#6b7076" />
      <path d="M13 6 q3 -5 6 -4 q0 4 -3 4Z" fill="#8a9097" />
      <path d="M-4 5 q2 -5 6 -4" stroke="#3f9a4a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Bench({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="2" cy="7" rx="17" ry="3.6" fill="#000000" opacity="0.24" />
      <rect x="-14" y="2" width="2.4" height="6" fill="#3a3f47" />
      <rect x="11.6" y="2" width="2.4" height="6" fill="#3a3f47" />
      <rect x="-16" y="-9" width="32" height="2.6" rx="1" fill="#8a5a34" />
      <rect x="-16" y="-5.4" width="32" height="2.6" rx="1" fill="#9b6a3e" />
      <rect x="-16" y="-9" width="32" height="1" fill="#ffffff" opacity="0.2" />
      <rect x="-17" y="-2" width="34" height="3.4" rx="1" fill="#a97849" />
      <rect x="-17" y="-2" width="34" height="1.2" rx="0.6" fill="#ffffff" opacity="0.22" />
      <rect x="-17" y="1.2" width="34" height="1.6" fill="#5a3d22" />
    </g>
  );
}

function Bridge({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x="-33" y="-9" width="70" height="26" rx="3" fill="#000000" opacity="0.2" />
      <rect x="-34" y="-12" width="68" height="24" rx="3" fill="#9a7548" />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          <rect x={-33 + i * 5.7} y="-11" width="4.7" height="22" fill={i % 2 ? "#a77f50" : "#936d42"} />
          <rect x={-33 + i * 5.7} y="-11" width="4.7" height="2" fill="#ffffff" opacity="0.14" />
        </g>
      ))}
      <rect x="-34" y="-14" width="68" height="3.4" rx="1" fill="#5a3d22" />
      <rect x="-34" y="10.6" width="68" height="3.4" rx="1" fill="#5a3d22" />
      {[-32, -11, 11, 32].map((a) => (
        <g key={a}>
          <rect x={a - 1.8} y="-18" width="3.6" height="8" rx="0.8" fill="#6b4a2b" />
          <rect x={a - 2.2} y="-19.4" width="4.4" height="2" rx="1" fill="#8a5a34" />
          <rect x={a - 1.8} y="10" width="3.6" height="8" rx="0.8" fill="#6b4a2b" />
          <rect x={a - 2.2} y="8.6" width="4.4" height="2" rx="1" fill="#8a5a34" />
        </g>
      ))}
      <path d="M-32 -15 Q-21 -11 -11 -15 T11 -15 T32 -15 M-32 14 Q-21 18 -11 14 T11 14 T32 14" stroke="#d6c08a" strokeWidth="1" fill="none" />
    </g>
  );
}
function Museum3D() {
  const cols = [164, 184, 204, 246, 266, 286];
  const tile = (y: number) => {
    const hw = (86 * (y - 82)) / 56;
    return <path key={y} d={`M${230 - hw} ${y} H${230 + hw}`} stroke="#000000" strokeOpacity="0.16" strokeWidth="1.2" />;
  };
  return (
    <g>
      <ellipse cx="236" cy="264" rx="142" ry="17" fill="#000000" opacity="0.28" />
      <ellipse cx="230" cy="256" rx="150" ry="21" fill="#b4b9c1" />
      <ellipse cx="230" cy="255" rx="142" ry="17" fill="url(#cm-plaza)" />
      <rect x="128" y="244" width="204" height="13" fill="#c4c9d0" />
      <rect x="128" y="254" width="204" height="3" fill="#000000" opacity="0.14" />
      <rect x="136" y="236" width="188" height="10" fill="#cfd4da" />
      <rect x="136" y="244" width="188" height="2" fill="#000000" opacity="0.12" />
      <rect x="144" y="229" width="172" height="8" fill="#dde1e6" />
      <rect x="144" y="235" width="172" height="2" fill="#000000" opacity="0.1" />
      <rect x="150" y="224" width="160" height="6" fill="#e9ecef" />
      <rect x="128" y="244" width="204" height="1.4" fill="#ffffff" opacity="0.4" />
      <rect x="136" y="236" width="188" height="1.4" fill="#ffffff" opacity="0.4" />
      {[108, 310].map((x) => (
        <g key={x}>
          <rect x={x + 2} y="228" width="42" height="4" fill="#bdb7a3" />
          <rect x={x} y="178" width="46" height="52" fill="#e3ddcd" />
          <rect x={x} y="178" width="46" height="52" fill="url(#cm-shade)" />
          <rect x={x - 2} y="168" width="50" height="10" fill="#cfc8b4" />
          <rect x={x - 2} y="176" width="50" height="2" fill="#000000" opacity="0.16" />
          <rect x={x - 2} y="168" width="50" height="1.6" fill="#ffffff" opacity="0.35" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={x + 1 + i * 8} y="160" width="3" height="8" rx="1" fill="#e9e4d4" />
          ))}
          <rect x={x - 1} y="159" width="48" height="2.4" fill="#d8d3c6" />
          <path d={`M${x - 4} 160 L${x + 23} 140 L${x + 50} 160Z`} fill="#c9674b" />
          <path d={`M${x + 23} 140 L${x + 50} 160 H${x + 23}Z`} fill="#000000" opacity="0.14" />
          <path d={`M${x - 4} 160 L${x + 23} 140 L${x + 25.4} 142 L${x} 160Z`} fill="#ffffff" opacity="0.22" />
          <path d={`M${x + 4} 153 H${x + 42} M${x + 10} 147 H${x + 36}`} stroke="#000000" strokeOpacity="0.16" />
        </g>
      ))}
      {[122, 322].map((x) => (
        <g key={x}>
          <path d={`M${x - 3} 228 V196 Q${x - 3} 184 ${x + 8} 184 Q${x + 19} 184 ${x + 19} 196 V228Z`} fill="#cfc8b4" />
          <path d={`M${x} 226 V196 Q${x} 187 ${x + 8} 187 Q${x + 16} 187 ${x + 16} 196 V226Z`} fill="#3a4a63" />
          <path d={`M${x + 2} 224 V197 Q${x + 2} 189 ${x + 8} 189 Q${x + 14} 189 ${x + 14} 197 V224Z`} fill="#ffe9a3" className="ct-glow" />
          <path d={`M${x + 8} 189 V224 M${x + 2} 206 H${x + 14}`} stroke="#3a4a63" strokeWidth="1.2" />
          <rect x={x + 5.4} y="181" width="5.2" height="4.6" rx="1" fill="#b9852f" />
          <rect x={x - 4} y="226" width="24" height="3" fill="#bdb7a3" />
        </g>
      ))}
      <rect x="158" y="150" width="144" height="78" fill="#cfc8b6" />
      <rect x="158" y="150" width="144" height="78" fill="url(#cm-shade)" />
      <rect x="158" y="150" width="144" height="10" fill="#000000" opacity="0.14" />
      {cols.map((x) => (
        <g key={x}>
          <ellipse cx={x + 7} cy="224" rx="9" ry="2" fill="#000000" opacity="0.2" />
          <rect x={x} y="152" width="10" height="70" fill="#f8f5ee" />
          <rect x={x + 6.4} y="152" width="3.6" height="70" fill="#000000" opacity="0.1" />
          <rect x={x + 1.6} y="152" width="1" height="70" fill="#000000" opacity="0.08" />
          <rect x={x + 4.6} y="152" width="1" height="70" fill="#000000" opacity="0.08" />
          <rect x={x - 2} y="148" width="14" height="6" rx="1" fill="#e2dccb" />
          <rect x={x - 3} y="146" width="16" height="3" rx="1" fill="#d8d3c6" />
          <rect x={x - 2} y="220" width="14" height="5" rx="1" fill="#d8d3c6" />
        </g>
      ))}
      {[199, 261].map((x) => (
        <g key={x}>
          <rect x={x - 1} y="194" width="2" height="22" fill="#3a3f47" />
          <circle cx={x} cy="192" r="9" fill="#ffd36a" opacity="0.3" className="ct-glow" />
          <rect x={x - 3} y="189" width="6" height="6" rx="1.5" fill="#ffe9a3" />
          <path d={`M${x - 4} 189 L${x} 185 L${x + 4} 189Z`} fill="#3a3f47" />
        </g>
      ))}
      {[179, 281].map((x, i) => (
        <g key={x}>
          <rect x={x - 5} y="156" width="10" height="2.4" rx="1" fill="#b9852f" />
          <path d={`M${x - 4.4} 158 H${x + 4.4} V184 L${x} 179 L${x - 4.4} 184Z`} fill={i ? "#2563eb" : "#e11d48"} />
          <path d={`M${x - 4.4} 158 H${x - 1.6} V183 L${x - 4.4} 184Z`} fill="#ffffff" opacity="0.2" />
          <circle cx={x} cy="165" r="2" fill="#f6e7b4" />
        </g>
      ))}
      <rect x="150" y="138" width="160" height="12" fill="#d8d3c6" />
      <rect x="150" y="138" width="160" height="2" fill="#ffffff" opacity="0.4" />
      {Array.from({ length: 19 }, (_, i) => (
        <rect key={i} x={153 + i * 8.3} y="141.5" width="2.6" height="6" fill="#b9b3a0" />
      ))}
      <rect x="150" y="147" width="160" height="4" fill="#000000" opacity="0.12" />
      <path d="M142 139 L230 80 L318 139Z" fill="#c9674b" />
      <path d="M230 80 L318 139 H230Z" fill="#000000" opacity="0.15" />
      {[96, 106, 116, 126].map(tile)}
      <path d="M142 139 L230 80 L232.6 83 L150 139Z" fill="#ffffff" opacity="0.22" />
      <path d="M158 134 L230 92 L302 134Z" fill="#ece6d4" />
      <path d="M158 134 L230 92 L302 134Z" fill="url(#cm-shade)" />
      <path d="M158 134 L230 92 L302 134Z" fill="none" stroke="#b9852f" strokeWidth="1.4" />
      <path d="M200 124 q-12 -4 -16 8 M200 124 q-8 -10 -22 -4 M260 124 q12 -4 16 8 M260 124 q8 -10 22 -4" fill="none" stroke="#b9852f" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="230" cy="116" r="13" fill="#f6e7b4" stroke="#b9852f" strokeWidth="2.6" />
      <circle cx="230" cy="116" r="9.6" fill="none" stroke="#b9852f" strokeWidth="0.8" opacity="0.7" />
      <path d="M222 116 q8 -9 16 0 q-8 9 -16 0Z M238 116 l5 -5 v10Z" fill="#2a8fb3" />
      <circle cx="226.6" cy="115" r="1.2" fill="#ffffff" />
      <path d="M223 78 q7 -9 14 0 l-3 4 h-8Z" fill="#b9852f" />
      <rect x="226" y="76" width="8" height="8" fill="#b9852f" />
      <g>
        <rect x="229.2" y="54" width="1.6" height="24" fill="#5a3d22" />
        <circle cx="230" cy="53" r="1.8" fill="#f6c453" />
        <path d="M231 58 h16 l-4 5 l4 5 h-16Z" fill="#e11d48">
          <animate attributeName="d" values="M231 58 h16 l-4 5 l4 5 h-16Z;M231 58 h14 l-2 5 l2 5 h-14Z;M231 58 h16 l-4 5 l4 5 h-16Z" dur="1.8s" repeatCount="indefinite" />
        </path>
      </g>
      <path d="M208 226 V204 Q208 186 230 186 Q252 186 252 204 V226Z" fill="#d6cfbb" />
      <path d="M208 226 V204 Q208 186 230 186 Q252 186 252 204 V226Z" fill="url(#cm-shade)" />
      <path d="M212 226 V205 Q212 190 230 190 Q248 190 248 205 V226Z" fill="#6b4a2b" />
      <path d="M215 224 V206 Q215 193 230 193 Q245 193 245 206 V224Z" fill="#ffe9a3" opacity="0.92" className="ct-glow" />
      <path d="M230 193 V224 M215 207 H245 M215 216 H245" stroke="#6b4a2b" strokeWidth="1.6" />
      <path d="M218 203 Q230 192 242 203" stroke="#6b4a2b" strokeWidth="1" fill="none" />
      <circle cx="226.6" cy="214" r="1.3" fill="#f0c25a" />
      <circle cx="233.4" cy="214" r="1.3" fill="#f0c25a" />
      <rect x="226" y="180" width="8" height="5" rx="1" fill="#b9852f" />
      <rect x="206" y="223" width="48" height="4" fill="#bdb7a3" />
      {[[134, 262], [326, 262]].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <ellipse cx="2" cy="6" rx="10" ry="3" fill="#000000" opacity="0.25" />
          <rect x="-7" y="-4" width="14" height="10" rx="1" fill="#cfd4da" />
          <rect x="-7" y="-4" width="5" height="10" fill="#ffffff" opacity="0.25" />
          <rect x="-5" y="-8" width="10" height="5" fill="#dde1e6" />
          <path d="M0 -8 q-6 -4 -3 -12 q3 3 3 -2 q0 5 3 2 q3 8 -3 12Z" fill="#e7e2d2" />
          <circle cx="0" cy="-23" r="3.2" fill="#e7e2d2" />
        </g>
      ))}
      {[176, 284].map((x, i) => (
        <g key={x} transform={`translate(${x} 268)`}>
          <ellipse cx="2" cy="6" rx="9" ry="2.6" fill="#000000" opacity="0.22" />
          <path d="M-5 6 L-3 -2 H3 L5 6Z" fill="#8a8f98" />
          <ellipse cx="0" cy="-3" rx="7" ry="2.4" fill="#b7bcc4" />
          <path d="M0 -4 q-6 -6 -3 -12 q3 4 3 -1 q0 5 3 1 q3 6 -3 12Z" fill="#f59e0b">
            <animate attributeName="opacity" values="0.7;1;0.7" dur={`${1.1 + i * 0.3}s`} repeatCount="indefinite" />
          </path>
          <path d="M0 -4 q-2 -3 0 -7 q2 4 0 7Z" fill="#fde68a" />
        </g>
      ))}
      <path d="M130 250 q12 -12 22 0Z M308 250 q12 -12 22 0Z" fill="#2f7a3a" />
      <path d="M134 250 q8 -9 14 0Z M312 250 q8 -9 14 0Z" fill="#4fae59" opacity="0.7" />
      <Flowers x={141} y={252} n={5} />
      <Flowers x={319} y={252} n={5} />
      <Tag x={230} y={274} text="Museo" color="#E3B341" />
    </g>
  );
}

function Pond3D() {
  return (
    <g>
      <path d="M452 252 C 452 180, 534 144, 604 152 C 684 160, 736 204, 730 266 C 724 334, 650 364, 580 356 C 500 350, 452 316, 452 252Z" fill="#2a6a35" opacity="0.55" />
      <path d="M458 252 C 458 184, 536 150, 602 158 C 678 166, 730 206, 724 264 C 718 328, 646 358, 580 350 C 502 344, 458 310, 458 252Z" fill="#d8c48f" />
      <path d="M466 252 C 466 188, 538 156, 602 164 C 674 172, 722 210, 716 264 C 710 322, 644 352, 580 344 C 508 338, 466 306, 466 252Z" fill="#b99e68" />
      <path d="M470 250 C 470 190, 540 160, 600 168 C 670 176, 718 214, 712 262 C 706 316, 640 344, 580 338 C 510 332, 470 300, 470 250Z" fill="#6d5a3a" />
      <path d="M480 250 C 480 198, 545 172, 600 179 C 662 187, 704 220, 700 262 C 694 308, 636 332, 582 327 C 520 321, 480 294, 480 250Z" fill="url(#cm-water)" />
      <path d="M500 250 C 500 214, 550 194, 600 199 C 650 205, 682 228, 678 262 C 672 296, 630 312, 584 307 C 536 302, 500 282, 500 250Z" fill="#0f3d57" opacity="0.5" />
      <path d="M526 250 C 526 228, 560 214, 600 218 C 636 222, 656 238, 654 260 C 650 282, 620 292, 588 288 C 552 284, 526 272, 526 250Z" fill="#0b2f45" opacity="0.4" />
      <path d="M520 226 q30 -14 70 -10 M610 296 q30 -2 54 -22 M500 262 q14 14 38 16 M640 226 q22 6 30 20" stroke="#ffffff" strokeOpacity="0.24" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M498 238 q18 -18 44 -22" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" fill="none" strokeLinecap="round" />
      {[[560, 240, 3, 28, 18, 3], [640, 280, 3, 24, 15, 3.6], [610, 220, 2, 18, 10, 4.4]].map(([cx, cy, r0, rx, ry, d], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={r0} ry={r0} fill="none" stroke="#fff" strokeOpacity="0.7">
          <animate attributeName="rx" values={`${r0};${rx}`} dur={`${d}s`} begin={`${i}s`} repeatCount="indefinite" />
          <animate attributeName="ry" values={`${r0};${ry}`} dur={`${d}s`} begin={`${i}s`} repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.7;0" dur={`${d}s`} begin={`${i}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
      {[[600, 215], [530, 280], [660, 250], [570, 300], [632, 296]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x + 1} cy={y + 2} rx="14" ry="6" fill="#0b2f45" opacity="0.35" />
          <ellipse cx={x} cy={y} rx="14" ry="6" fill="#3f9a4a" />
          <ellipse cx={x - 3} cy={y - 1.4} rx="7" ry="2.4" fill="#68c372" opacity="0.7" />
          <path d={`M${x} ${y} L${x + 14} ${y - 2}`} stroke="#256a30" strokeWidth="1.4" />
          {i % 2 === 0 && (
            <g>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx={x + 4 + Math.cos((a * Math.PI) / 180) * 3.2} cy={y - 3 + Math.sin((a * Math.PI) / 180) * 2.4} rx="2.2" ry="1.4" fill="#fbcfe8" />
              ))}
              <circle cx={x + 4} cy={y - 3} r="1.6" fill="#fde68a" />
            </g>
          )}
        </g>
      ))}
      <g>
        <animateMotion path="M520 250 C 560 220, 640 230, 670 262 C 640 300, 570 300, 520 250" dur="26s" repeatCount="indefinite" />
        <ellipse cx="0" cy="3" rx="8" ry="2.6" fill="#0b2f45" opacity="0.35" />
        <ellipse cx="0" cy="0" rx="7.5" ry="4.6" fill="#fafafa" />
        <path d="M-6 -1 q-4 -3 -7 -6 q5 0 7 3Z" fill="#e5e7eb" />
        <circle cx="6" cy="-4" r="3" fill="#fafafa" />
        <path d="M8.6 -4 l4 1 l-4 1Z" fill="#f59e0b" />
        <circle cx="6.8" cy="-4.6" r="0.6" fill="#111827" />
      </g>
      <g opacity="0">
        <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.02;0.14;0.16;1" dur="8s" repeatCount="indefinite" />
        <animateMotion path="M590 250 q14 -26 30 0" dur="8s" keyPoints="0;1;1" keyTimes="0;0.16;1" calcMode="linear" repeatCount="indefinite" />
        <path d="M-6 0 q6 -5 12 0 q-6 5 -12 0Z M6 0 l5 -4 v8Z" fill="#fbbf24" />
        <circle cx="-3" cy="-0.6" r="0.8" fill="#111827" />
      </g>
      <g>
        <rect x="570" y="326" width="30" height="58" fill="#000000" opacity="0.18" />
        <rect x="566" y="324" width="30" height="58" fill="#8a6a43" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <rect x="566" y={329 + i * 9} width="30" height="1.6" fill="rgba(0,0,0,0.28)" />
            <rect x="566" y={324 + i * 9} width="30" height="1.2" fill="#ffffff" opacity="0.12" />
          </g>
        ))}
        <rect x="563" y="324" width="4" height="58" fill="#5a3d22" />
        <rect x="595" y="324" width="4" height="58" fill="#5a3d22" />
        {[326, 352, 378].map((y) => (
          <g key={y}>
            <rect x="561" y={y} width="8" height="4" rx="1" fill="#6b4a2b" />
            <rect x="593" y={y} width="8" height="4" rx="1" fill="#6b4a2b" />
          </g>
        ))}
        <g transform="translate(620 352)">
          <ellipse cx="2" cy="12" rx="22" ry="4.4" fill="#000000" opacity="0.2" />
          <path d="M-22 0 H22 L15 11 H-15Z" fill="#b5653a" />
          <path d="M-22 0 H22" stroke="#8a4b2b" strokeWidth="2.4" />
          <path d="M-22 0 L-15 11 H-6 L-10 0Z" fill="#ffffff" opacity="0.14" />
          <path d="M-19 4 H19" stroke="#f6e7b4" strokeWidth="1" opacity="0.7" />
          <path d="M-2 0 V-26" stroke="#5a3d22" strokeWidth="1.6" />
          <path d="M-2 -26 L12 -14 H-2Z" fill="#f8f3e4" />
          <path d="M-2 -26 L-14 -10 H-2Z" fill="#e5dcc2" />
          <animateTransform attributeName="transform" type="translate" values="620 352;620 354;620 352" dur="3s" repeatCount="indefinite" />
        </g>
        <g transform="translate(580 322)">
          <ellipse cx="1" cy="2" rx="6" ry="1.8" fill="#000000" opacity="0.22" />
          <rect x="-4" y="-8" width="8" height="9" rx="2" fill="#388bfd" />
          <rect x="-4" y="-8" width="3" height="9" rx="1.4" fill="#ffffff" opacity="0.16" />
          <circle cx="0" cy="-12" r="3.6" fill="#f2c9a0" />
          <path d="M-5.6 -12.4 q5.6 -7.4 11.2 0 q-5.6 -1.8 -11.2 0Z" fill="#e3b341" />
          <path d="M-7 -12.6 H7" stroke="#c18f1f" strokeWidth="1.2" />
          <path d="M2 -6 L22 -24" stroke="#5b3b1f" strokeWidth="1.5" />
          <path d="M22 -24 q4 10 0 28" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="0.7" fill="none" />
        </g>
      </g>
      {[[484, 292], [496, 304], [690, 292], [700, 300], [524, 316], [664, 316], [478, 260]].map(([x, y], i) => (
        <g key={i}>
          {[-3, 0, 3].map((d) => (
            <path key={d} d={`M${x + d} ${y} q${d} -12 ${d * 2} -22`} stroke={d ? "#4d8a3e" : "#3b7432"} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          ))}
          {i % 2 === 0 && <rect x={x - 1.5} y={y - 31} width="3" height="10" rx="1.4" fill="#7c4a2a" />}
        </g>
      ))}
      {[[470, 310, 10], [712, 306, 8], [500, 330, 7], [715, 240, 6], [494, 218, 7]].map(([x, y, r], i) => (
        <g key={i}>
          <ellipse cx={x + 2} cy={y + 3} rx={r} ry={r * 0.6} fill="#000000" opacity="0.22" />
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.75} fill="#7b8087" />
          <ellipse cx={x - r * 0.2} cy={y - r * 0.25} rx={r * 0.45} ry={r * 0.3} fill="#ffffff" opacity="0.24" />
        </g>
      ))}
      {[[500, 200], [540, 172], [690, 190], [706, 330]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3.4" fill={["#f9a8d4", "#fde68a", "#ffffff", "#c4b5fd"][i]} />
          <circle cx={x} cy={y} r="1.2" fill="#fff0a8" />
        </g>
      ))}
      <Tag x={590} y={392} text="Pond" color="#58A6FF" />
    </g>
  );
}

function Glow({ x, y, r, d = 0 }: { x: number; y: number; r: number; d?: number }) {
  return <circle cx={x} cy={y} r={r} fill="url(#cm-lamp)" className="ct-glow" style={{ animationDelay: `${d}s` }} pointerEvents="none" />;
}

type Spot = { museum: number[]; pond: number[]; moon: number[]; fountain: number[]; stalls: { x: number; y: number; c: string }[]; lamps: number[][]; houses: House[] };

function Night({ L }: { L: Spot }) {
  const [mx, my] = L.moon;
  const [ox, oy] = L.museum;
  const [qx, qy] = L.pond;
  const [fx, fy] = L.fountain;
  const stars = Array.from({ length: 90 }, (_, i) => [(i * 211) % WORLD_W, (i * 97) % 700, 0.8 + (i % 3) * 0.5, (i % 7) * 0.4]);
  const flies = Array.from({ length: 40 }, (_, i) => [((i * 331) % (WORLD_W - 100)) + 50, ((i * 173) % (WORLD_H - 500)) + 380, 3 + (i % 4)]);
  return (
    <g pointerEvents="none">
      {stars.map(([x, y, r, d], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" className="ct-twinkle" style={{ animationDelay: `${d}s` }} />
      ))}
      <ellipse cx={mx} cy={my} rx="900" ry="640" fill="url(#cm-moonlit)" />
      <circle cx={mx} cy={my} r="130" fill="url(#cm-moon)" />
      <circle cx={mx} cy={my} r="25" fill="#f6f2dc" />
      <circle cx={mx - 7} cy={my - 5} r="5" fill="#ddd8bd" />
      <circle cx={mx + 8} cy={my + 7} r="3.4" fill="#ddd8bd" />
      <circle cx={mx + 3} cy={my - 11} r="2.4" fill="#e6e1c6" />
      <circle cx={mx - 6} cy={my - 7} r="19" fill="#ffffff" opacity="0.12" />
      {L.lamps.map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y + 3} rx="34" ry="11" fill="url(#cm-lamp)" opacity="0.5" />
          <Glow x={x} y={y - 22} r={36} d={i * 0.3} />
          <circle cx={x} cy={y - 24} r="3.4" fill="#fff6d0" />
        </g>
      ))}
      <ellipse cx={fx} cy={fy + 2} rx="56" ry="22" fill="url(#cm-aqua)" />
      <ellipse cx={fx} cy={fy} rx="30" ry="9" fill="#a8e8ff" opacity="0.2" className="ct-glow" />
      {L.stalls.map((s, i) => (
        <g key={i}>
          <Glow x={s.x} y={s.y - 7} r={26} d={i * 0.4} />
          <circle cx={s.x} cy={s.y - 7} r="2.6" fill="#fff6d0" />
          <ellipse cx={s.x} cy={s.y + 12} rx="30" ry="9" fill="url(#cm-lamp)" opacity="0.35" />
        </g>
      ))}
      {L.houses.map((h, i) => (
        <g key={i}>
          <ellipse cx={h.x} cy={h.y + 18} rx="30" ry="8" fill="url(#cm-lamp)" opacity="0.3" />
          {[-17, 9].map((a) => (
            <g key={a}>
              <circle cx={h.x + a + 4} cy={h.y - 4} r="15" fill="url(#cm-lamp)" opacity="0.75" />
              <rect x={h.x + a} y={h.y - 8} width="8" height="8" fill="#ffd36a" />
              <rect x={h.x + a} y={h.y - 8} width="8" height="2.6" fill="#fff3c4" opacity="0.6" />
              <path d={`M${h.x + a + 4} ${h.y - 8} V${h.y} M${h.x + a} ${h.y - 4} H${h.x + a + 8}`} stroke="#8a5a34" strokeWidth="1" />
            </g>
          ))}
          <circle cx={h.x - 1} cy={h.y - 24} r="2.4" fill="#ffe9a3" opacity="0.9" />
          <path d={`M${h.x - 5.5} ${h.y + 16} V${h.y + 5} Q${h.x - 5.5} ${h.y - 1} ${h.x} ${h.y - 1} Q${h.x + 5.5} ${h.y - 1} ${h.x + 5.5} ${h.y + 5} V${h.y + 16}Z`} fill="#ffb64a" opacity="0.5" />
          <path d={`M${h.x - 8} ${h.y + 17} L${h.x - 14} ${h.y + 24} H${h.x + 14} L${h.x + 8} ${h.y + 17}Z`} fill="#ffb64a" opacity="0.18" />
        </g>
      ))}
      <g transform={`translate(${ox} ${oy})`}>
        <ellipse cx="230" cy="238" rx="132" ry="32" fill="url(#cm-lamp)" opacity="0.5" />
        {[122, 322].map((x) => (
          <g key={x}>
            <circle cx={x + 8} cy="206" r="32" fill="url(#cm-lamp)" opacity="0.65" />
            <path d={`M${x + 2} 224 V197 Q${x + 2} 189 ${x + 8} 189 Q${x + 14} 189 ${x + 14} 197 V224Z`} fill="#ffd36a" />
            <path d={`M${x + 8} 189 V224 M${x + 2} 206 H${x + 14}`} stroke="#3a4a63" strokeWidth="1.2" />
          </g>
        ))}
        <circle cx="230" cy="208" r="46" fill="url(#cm-lamp)" opacity="0.8" />
        <path d="M215 224 V206 Q215 193 230 193 Q245 193 245 206 V224Z" fill="#ffd36a" />
        <path d="M230 193 V224 M215 207 H245 M215 216 H245" stroke="#6b4a2b" strokeWidth="1.6" />
        {[199, 261].map((x) => (
          <g key={x}>
            <Glow x={x} y={192} r={28} />
            <circle cx={x} cy="192" r="3.4" fill="#fff6d0" />
          </g>
        ))}
        {[176, 284].map((x) => (
          <g key={x}>
            <circle cx={x} cy="258" r="26" fill="url(#cm-lamp)" className="ct-glow" />
          </g>
        ))}
        <circle cx="230" cy="116" r="26" fill="url(#cm-lamp)" opacity="0.5" />
        <circle cx="230" cy="116" r="12" fill="#f6e7b4" opacity="0.9" />
        <path d="M222 116 q8 -9 16 0 q-8 9 -16 0Z M238 116 l5 -5 v10Z" fill="#2a8fb3" />
        <path d="M158 134 L230 92 L302 134Z" fill="#fff3c4" opacity="0.1" />
        <Tag x={230} y={274} text="Museo" color="#E3B341" />
      </g>
      <g transform={`translate(${qx} ${qy})`}>
        <ellipse cx="590" cy="250" rx="118" ry="70" fill="#9cc4ff" opacity="0.1" />
        <ellipse cx="560" cy="232" rx="24" ry="7" fill="#f3f0dc" opacity="0.2" />
        <ellipse cx="560" cy="232" rx="9" ry="2.6" fill="#ffffff" opacity="0.35" />
        {[[540, 250], [600, 232], [640, 262], [580, 280], [620, 300], [520, 268]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill="#ffffff" className="ct-twinkle" style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
        <Glow x={604} y={316} r={32} />
        <rect x="602" y="318" width="2.4" height="10" fill="#3a3f47" />
        <circle cx="603" cy="316" r="3.4" fill="#fff6d0" />
        <Tag x={590} y={392} text="Pond" color="#58A6FF" />
      </g>
      {flies.map(([x, y, d], i) => (
        <g key={i}>
          <animateTransform attributeName="transform" type="translate" values={`0 0;14 -12;-8 6;0 0`} dur={`${d + 5}s`} repeatCount="indefinite" />
          <circle cx={x} cy={y} r="6" fill="url(#cm-fly)" />
          <circle cx={x} cy={y} r="1.8" fill="#f3ffb0" />
          <animate attributeName="opacity" values="0;1;0.3;1;0" dur={`${d + 2}s`} repeatCount="indefinite" />
        </g>
      ))}
    </g>
  );
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const DARK = [[120, 120, 220, 110], [2250, 140, 240, 120], [1200, 1440, 260, 100], [2300, 1400, 200, 90]];
const CLOUDS = [[60, 95, 0, 1], [140, 130, -40, 0.8], [30, 110, -70, 1.1], [320, 150, -20, 1], [620, 120, -90, 0.9], [980, 140, -55, 1.2], [1320, 160, -10, 0.9]];
const BIRDS = [[160, 34, 0], [260, 46, -18], [520, 40, -9], [880, 52, -30]];

export default function CityMap({ onGo }: { onGo: (v: View) => void }) {
  const L = WORLD;
  const view = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const cam = useRef({ x: 0, y: 0, vx: 0, vy: 0, k: 0.8, vw: 0, vh: 0, ready: false });
  const keys = useRef(new Set<string>());
  const drag = useRef({ on: false, moved: false, sx: 0, sy: 0, cx: 0, cy: 0, lx: 0, ly: 0, lt: 0 });
  const [hint, setHint] = useState(true);

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
      const prevCx = c.ready ? (c.x + c.vw / 2) / c.k : L.plaza[0];
      const prevCy = c.ready ? (c.y + c.vh / 2) / c.k : L.plaza[1] - 40;
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
  }, [centerOn, clampCam, L.plaza]);

  useEffect(() => {
    const kd = (e: globalThis.KeyboardEvent) => {
      if (document.querySelector("[data-slot='dialog-content']")) return;
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        e.preventDefault();
        keys.current.add(k);
      }
    };
    const ku = (e: globalThis.KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
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
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [clampCam]);

  useEffect(() => {
    const t = window.setTimeout(() => setHint(false), 6000);
    return () => window.clearTimeout(t);
  }, []);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
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

  const go = (v: View) => {
    if (drag.current.moved) return;
    onGo(v);
  };

  const hot = (v: View, label: string) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": label,
    onClick: () => go(v),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onGo(v);
      }
    },
  });

  const [fx, fy] = L.fountain;
  const [px, py] = L.plaza;

  return (
    <div ref={view} className="absolute inset-0 touch-none overflow-hidden bg-[#3b8541] select-none" onPointerDown={onDown} data-testid="city-map">
      <div ref={world} className="absolute top-0 left-0 isolate origin-top-left will-change-transform" style={{ width: WORLD_W, height: WORLD_H }}>
        <svg viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} width={WORLD_W} height={WORLD_H} className="block max-w-none">
          <defs>
            <linearGradient id="cm-grass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5bb25a" />
              <stop offset="0.5" stopColor="#47994a" />
              <stop offset="1" stopColor="#367c3d" />
            </linearGradient>
            <linearGradient id="cm-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#47b6d8" />
              <stop offset="1" stopColor="#1a6a8f" />
            </linearGradient>
            <linearGradient id="cm-shade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="1" stopColor="#000000" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="cm-glass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffeeb0" />
              <stop offset="1" stopColor="#f2b556" />
            </linearGradient>
            <radialGradient id="cm-lamp" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffd36a" stopOpacity="0.9" />
              <stop offset="0.45" stopColor="#ffb64a" stopOpacity="0.32" />
              <stop offset="1" stopColor="#ffb64a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cm-aqua" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#8fe6ff" stopOpacity="0.55" />
              <stop offset="0.5" stopColor="#4fb8e6" stopOpacity="0.2" />
              <stop offset="1" stopColor="#4fb8e6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cm-fly" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#e8ff8a" stopOpacity="0.8" />
              <stop offset="1" stopColor="#e8ff8a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cm-moon" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#dbe7ff" stopOpacity="0.6" />
              <stop offset="1" stopColor="#dbe7ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cm-moonlit" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#bcd2ff" stopOpacity="0.2" />
              <stop offset="1" stopColor="#bcd2ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cm-patch" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#8fdc78" stopOpacity="0.5" />
              <stop offset="1" stopColor="#8fdc78" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cm-dark" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#0f3a1c" stopOpacity="0.4" />
              <stop offset="1" stopColor="#0f3a1c" stopOpacity="0" />
            </radialGradient>
            <pattern id="cm-tex" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M3 18 q1 -6 3 -8 M12 8 q1 -5 3 -6 M17 20 q1 -5 3 -7 M30 36 q1 -6 3 -8 M38 14 q1 -5 3 -6 M24 40 q1 -5 3 -7" stroke="#2c7433" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.55" />
              <path d="M8 34 q1 -5 3 -6 M34 24 q1 -5 3 -6 M20 26 q1 -4 2 -5" stroke="#6fcf72" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.45" />
              <circle cx="28" cy="10" r="1" fill="#fff6c8" opacity="0.7" />
              <circle cx="6" cy="26" r="0.9" fill="#f9a8d4" opacity="0.7" />
              <circle cx="36" cy="40" r="0.9" fill="#fde68a" opacity="0.7" />
              <circle cx="16" cy="38" r="1.2" fill="#2a6a31" opacity="0.4" />
            </pattern>
            <pattern id="cm-cobble" width="16" height="12" patternUnits="userSpaceOnUse">
              <rect width="16" height="12" fill="#c9a66b" />
              <rect x="0.6" y="0.6" width="7" height="5" rx="1.4" fill="#d6b87e" />
              <rect x="8.6" y="0.6" width="6.8" height="5" rx="1.4" fill="#c29f64" />
              <rect x="4.6" y="6.6" width="7" height="5" rx="1.4" fill="#d1b178" />
              <rect x="-3.4" y="6.6" width="7" height="5" rx="1.4" fill="#c7a56a" />
              <rect x="12.6" y="6.6" width="6" height="5" rx="1.4" fill="#c7a56a" />
            </pattern>
            <pattern id="cm-plaza" width="14" height="10" patternUnits="userSpaceOnUse">
              <rect width="14" height="10" fill="#b8bec6" />
              <rect x="0.5" y="0.5" width="6" height="4" rx="1" fill="#cfd4da" />
              <rect x="7.5" y="0.5" width="6" height="4" rx="1" fill="#c3c9d0" />
              <rect x="3.5" y="5.5" width="6" height="4" rx="1" fill="#c9ced5" />
              <rect x="-3.5" y="5.5" width="6" height="4" rx="1" fill="#c3c9d0" />
              <rect x="10.5" y="5.5" width="6" height="4" rx="1" fill="#cfd4da" />
            </pattern>
          </defs>
          <rect width={WORLD_W} height={WORLD_H} fill="url(#cm-grass)" />
          <rect width={WORLD_W} height={WORLD_H} fill="url(#cm-tex)" />
          {L.patches.map(([x, y, rx, ry], i) => (
            <ellipse key={i} cx={x} cy={y} rx={rx * 1.6} ry={ry * 1.6} fill="url(#cm-patch)" />
          ))}
          {DARK.map(([x, y, rx, ry], i) => (
            <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="url(#cm-dark)" />
          ))}
          <path d={L.stream} fill="none" stroke="#2a5a2f" strokeOpacity="0.5" strokeWidth="38" strokeLinecap="round" />
          <path d={L.stream} fill="none" stroke="#bda76d" strokeWidth="32" strokeLinecap="round" />
          <path d={L.stream} fill="none" stroke="#2d6f8f" strokeWidth="26" strokeLinecap="round" />
          <path d={L.stream} fill="none" stroke="#4cb0d4" strokeWidth="19" strokeLinecap="round" />
          <path d={L.stream} fill="none" stroke="#86d8ee" strokeOpacity="0.55" strokeWidth="8" strokeLinecap="round" />
          <path d={L.stream} fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" className="ct-flow" />
          <path d={L.stream} fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.4" strokeLinecap="round" className="ct-flow" style={{ animationDelay: "-1.2s" }} />
          {L.roads.map((d, i) => {
            const w = i === 0 ? 36 : 28;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="#3b2f18" strokeOpacity="0.35" strokeWidth={w + 5} strokeLinecap="round" />
                <path d={d} fill="none" stroke="#a88a52" strokeWidth={w + 2} strokeLinecap="round" />
                <path d={d} fill="none" stroke="url(#cm-cobble)" strokeWidth={w - 3} strokeLinecap="round" />
                <path d={d} fill="none" stroke="#fff3cf" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 12" />
              </g>
            );
          })}
          <ellipse cx={px + 2} cy={py + 14} rx="132" ry="52" fill="#000000" opacity="0.18" />
          <ellipse cx={px} cy={py + 10} rx="130" ry="50" fill="#8c929b" />
          <ellipse cx={px} cy={py + 8} rx="124" ry="46" fill="url(#cm-plaza)" />
          <ellipse cx={px} cy={py + 8} rx="104" ry="35" fill="none" stroke="#e8c777" strokeOpacity="0.55" strokeWidth="2.4" strokeDasharray="1 7" strokeLinecap="round" />
          <ellipse cx={px} cy={py + 8} rx="88" ry="29" fill="none" stroke="#8c929b" strokeOpacity="0.7" strokeWidth="1.4" />
          {L.bridge && <Bridge {...L.bridge} />}
          {L.flowers.map(([x, y], i) => (
            <Flowers key={i} x={x} y={y} n={6 + (i % 3)} />
          ))}
          {L.bushes.map(([x, y], i) => (
            <Bush key={i} x={x} y={y} s={0.9 + (i % 3) * 0.15} />
          ))}
          <Fountain x={fx} y={fy} />
          {L.stalls.map((s, i) => (
            <Stall key={i} {...s} />
          ))}
          {L.trees.map((t: Pt, i) => (
            <Tree key={i} {...t} />
          ))}
          {L.houses.map((h: House, i) => (
            <Home key={i} {...h} />
          ))}
          {L.lamps.map(([x, y], i) => (
            <Lamp key={i} x={x} y={y} />
          ))}

          <g transform={`translate(${L.forest[0]} ${L.forest[1]}) scale(${L.forest[2]})`}>
            <g {...hot("forest", "Vai nella foresta")} className="group cursor-pointer outline-none" data-testid="city-forest">
              <ellipse cx="0" cy="22" rx="118" ry="80" className="fill-white opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-20" />
              <Forest3D />
            </g>
          </g>

          <g transform={`translate(${L.stadium[0]} ${L.stadium[1]}) scale(${L.stadium[2]})`}>
            <g {...hot("stadium", "Vai allo stadio")} className="group cursor-pointer outline-none" data-testid="city-stadium">
              <ellipse cx="0" cy="14" rx="100" ry="62" className="fill-white opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-20" />
              <Stadium3D />
            </g>
          </g>

          <g transform={`translate(${L.school[0]} ${L.school[1]}) scale(${L.school[2]})`}>
            <g {...hot("school", "Entra a scuola")} className="group cursor-pointer outline-none" data-testid="city-school">
              <ellipse cx="0" cy="-10" rx="92" ry="62" className="fill-white opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-20" />
              <School3D />
            </g>
          </g>

          <g transform={`translate(${L.dig[0]} ${L.dig[1]}) scale(${L.dig[2]})`}>
            <g {...hot("dig", "Vai al sito di scavo")} className="group cursor-pointer outline-none" data-testid="city-dig">
              <ellipse cx="0" cy="6" rx="96" ry="48" className="fill-white opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-20" />
              <Dig3D />
            </g>
          </g>

          <g transform={`translate(${L.dungeon[0]} ${L.dungeon[1]}) scale(${L.dungeon[2]})`}>
            <g {...hot("dungeon", "Entra nei sotterranei")} className="group cursor-pointer outline-none" data-testid="city-dungeon">
              <ellipse cx="0" cy="-40" rx="124" ry="100" className="fill-white opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-20" />
              <Dungeon3D />
            </g>
          </g>

          <g transform={`translate(${L.shop[0]} ${L.shop[1]}) scale(${L.shop[2]})`}>
            <g {...hot("shop", "Entra nel negozio")} className="group cursor-pointer outline-none" data-testid="city-shop">
              <ellipse cx="0" cy="-14" rx="64" ry="40" className="fill-white opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-20" />
              <Shop3D />
            </g>
          </g>

          <g transform={`translate(${L.museum[0]} ${L.museum[1]})`}>
            <g {...hot("lobby", "Entra nel museo")} className="group cursor-pointer outline-none" data-testid="city-museum">
              <ellipse cx="230" cy="215" rx="150" ry="100" className="fill-white opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-20" />
              <Museum3D />
            </g>
          </g>

          <g transform={`translate(${L.pond[0]} ${L.pond[1]})`}>
            <g {...hot("pond", "Vai al pond")} className="group cursor-pointer outline-none" data-testid="city-pond">
              <ellipse cx="590" cy="250" rx="165" ry="105" className="fill-white opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-20" />
              <Pond3D />
            </g>
          </g>

          {L.walkers.map((w, i) => (
            <Walker key={i} {...w} />
          ))}
          {CLOUDS.map(([y, d, b, s], i) => (
            <Cloud key={i} y={y} d={d * 1.8} begin={b} s={s} />
          ))}
          {BIRDS.map(([y, d, b], i) => (
            <Bird key={i} y={y} d={d * 1.8} begin={b} />
          ))}
          <rect width={WORLD_W} height={WORLD_H} fill="#070f2c" opacity="0.56" pointerEvents="none" />
          <Night L={L} />
          <ForestNight x={L.forest[0]} y={L.forest[1]} s={L.forest[2]} />
          <StadiumNight x={L.stadium[0]} y={L.stadium[1]} s={L.stadium[2]} />
          <SchoolNight x={L.school[0]} y={L.school[1]} s={L.school[2]} />
          <DigNight x={L.dig[0]} y={L.dig[1]} s={L.dig[2]} />
          <DungeonNight x={L.dungeon[0]} y={L.dungeon[1]} s={L.dungeon[2]} />
          <ShopNight x={L.shop[0]} y={L.shop[1]} s={L.shop[2]} />
        </svg>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_60%,rgba(6,24,13,0.5))]" />
      {hint && (
        <div className="wl-hint pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">Trascina per esplorare · tocca un luogo per entrare</span>
        </div>
      )}
    </div>
  );
}
