import { memo, useCallback, useEffect, useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Forest3D, ForestNight, Stadium3D, StadiumNight } from "./Landmarks";
import { Dig3D, DigNight, DigTag, School3D, SchoolNight, SchoolTag } from "./Places";
import { WORLD, WORLD_H, WORLD_W, type House, type Pt } from "./cityWorld";
import "./city.css";
import "./wild.css";

type View = "map" | "lobby" | "room" | "pond" | "forest" | "stadium" | "animals" | "school" | "dig" | "fossils";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function Tree({ x, y, s = 1, t = "oak" }: Pt) {
  if (t === "pine")
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx="2" cy="16" rx="16" ry="5" fill="#000000" opacity="0.18" />
        <rect x="-3" y="2" width="6" height="14" fill="#5b3b1f" />
        <path d="M0 -34 L16 -8 H-16Z" fill="#1f6a3a" />
        <path d="M0 -24 L19 6 H-19Z" fill="#26803f" />
        <path d="M0 -12 L22 16 H-22Z" fill="#2f9a4a" />
        <path d="M0 -34 L6 -20 L-2 -18Z" fill="#ffffff" opacity="0.18" />
      </g>
    );
  const c = t === "cherry" ? ["#e879a6", "#f4a3c4", "#d95f93"] : ["#2f7a3a", "#3c8d47", "#38853f"];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="3" cy="15" rx="20" ry="6" fill="#000000" opacity="0.2" />
      <rect x="-3.5" y="0" width="7" height="16" fill="#6b4a2b" />
      <rect x="-3.5" y="0" width="2.5" height="16" fill="#ffffff" opacity="0.12" />
      <circle cx="0" cy="-6" r="17" fill={c[0]} />
      <circle cx="-9" cy="-1" r="11" fill={c[1]} />
      <circle cx="9" cy="-10" r="10" fill={c[2]} />
      <circle cx="-4" cy="-13" r="6" fill="#ffffff" opacity="0.14" />
      {t === "cherry" && [[-8, -4], [6, -2], [0, -14], [10, -10], [-12, -12]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r="1.8" fill="#ffe4ef" />)}
    </g>
  );
}

function Smoke({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#ffffff" opacity="0">
          <animate attributeName="cy" values={`${y};${y - 30}`} dur="4s" begin={`${i * 1.3}s`} repeatCount="indefinite" />
          <animate attributeName="cx" values={`${x};${x + 8}`} dur="4s" begin={`${i * 1.3}s`} repeatCount="indefinite" />
          <animate attributeName="r" values="2;7" dur="4s" begin={`${i * 1.3}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.6;0" dur="4s" begin={`${i * 1.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  );
}

function Home({ x, y, c, w = "#e8dcc4", smoke }: House) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="3" cy="18" rx="30" ry="6" fill="#000000" opacity="0.2" />
      <rect x="-22" y="-14" width="44" height="30" fill={w} />
      <rect x="10" y="-14" width="12" height="30" fill="#000000" opacity="0.08" />
      <rect x="-22" y="12" width="44" height="4" fill="#000000" opacity="0.12" />
      <rect x="9" y="-34" width="8" height="16" fill="#8a4b36" />
      <rect x="8" y="-36" width="10" height="3" fill="#6d3a29" />
      {smoke && <Smoke x={13} y={-38} />}
      <path d="M-28 -13 L0 -37 L28 -13Z" fill={c} />
      <path d="M-28 -13 L0 -37 L28 -13Z" fill="#000000" opacity="0.1" />
      {[-16, -8, 0, 8, 16].map((a) => (
        <path key={a} d={`M${a * 0.8} -35 L${a * 1.35} -14`} stroke="#000000" strokeOpacity="0.16" />
      ))}
      <path d="M-28 -13 L0 -37 L2 -35 L-24 -13Z" fill="#ffffff" opacity="0.2" />
      <rect x="-5" y="2" width="10" height="14" fill="#6b4a2b" />
      <circle cx="3" cy="9" r="0.9" fill="#f0c25a" />
      {[-17, 9].map((a) => (
        <g key={a}>
          <rect x={a - 1} y="-9" width="10" height="10" fill="#7a5230" />
          <rect x={a} y="-8" width="8" height="8" fill="#ffe9a3" />
          <path d={`M${a + 4} -8 V0 M${a} -4 H${a + 8}`} stroke="#7a5230" strokeWidth="1" />
          <rect x={a - 1} y="1" width="10" height="3" fill="#8a5a34" />
          <circle cx={a + 2} cy="0.5" r="1.3" fill="#f43f5e" />
          <circle cx={a + 6} cy="0.5" r="1.3" fill="#fbbf24" />
        </g>
      ))}
    </g>
  );
}

function Lamp({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-1.2" y="-20" width="2.4" height="22" fill="#3a3f47" />
      <rect x="-3" y="-25" width="6" height="6" rx="1.5" fill="#ffe9a3" />
      <path d="M-4 -25 L0 -29 L4 -25Z" fill="#3a3f47" />
    </g>
  );
}

function Cloud({ y, d, begin, s = 1 }: { y: number; d: number; begin: number; s?: number }) {
  return (
    <g transform={`translate(0 ${y}) scale(${s})`} opacity="0.85">
      <animateTransform attributeName="transform" type="translate" values={`-200 ${y};${WORLD_W + 200} ${y}`} dur={`${d}s`} begin={`${begin}s`} repeatCount="indefinite" additive="replace" />
      <ellipse cx="0" cy="0" rx="46" ry="12" fill="#ffffff" />
      <ellipse cx="-18" cy="-8" rx="24" ry="12" fill="#ffffff" />
      <ellipse cx="14" cy="-12" rx="26" ry="14" fill="#ffffff" />
      <ellipse cx="8" cy="8" rx="40" ry="6" fill="#000000" opacity="0.05" />
    </g>
  );
}

function Bird({ y, d, begin }: { y: number; d: number; begin: number }) {
  return (
    <g>
      <animateTransform attributeName="transform" type="translate" values={`${WORLD_W + 100} ${y};-100 ${y - 40}`} dur={`${d}s`} begin={`${begin}s`} repeatCount="indefinite" />
      <path d="M-6 0 q3 -5 6 0 q3 -5 6 0" stroke="#1f2937" strokeWidth="1.6" fill="none" strokeLinecap="round">
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
      <ellipse cx="0" cy="2" rx="4" ry="1.6" fill="#000000" opacity="0.22" />
      <rect x="-2.4" y="-8" width="4.8" height="8" rx="2" fill={shirt} />
      <circle cx="0" cy="-11" r="3" fill="#f2c9a0" />
      <path d="M-3 -12 q3 -4 6 0Z" fill="#4a2f1b" />
      <rect x="-2" y="0" width="1.6" height="3" fill="#2b3a55" />
      <rect x="0.4" y="0" width="1.6" height="3" fill="#2b3a55">
        <animate attributeName="height" values="3;1.6;3" dur="0.5s" repeatCount="indefinite" />
      </rect>
    </g>
  );
}

function Fountain({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="8" rx="34" ry="11" fill="#000000" opacity="0.2" />
      <ellipse cx="0" cy="2" rx="32" ry="11" fill="#cfd4da" />
      <ellipse cx="0" cy="0" rx="28" ry="9" fill="#58b9d9" />
      <ellipse cx="-6" cy="-1" rx="12" ry="3" fill="#ffffff" opacity="0.3" />
      <rect x="-3" y="-20" width="6" height="20" fill="#dde1e6" />
      <ellipse cx="0" cy="-20" rx="12" ry="4" fill="#cfd4da" />
      {[-9, 0, 9].map((a, i) => (
        <path key={a} d={`M0 -22 q${a} -14 ${a * 1.6} 6`} stroke="#bfe9f7" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85">
          <animate attributeName="opacity" values="0.4;0.95;0.4" dur="1.6s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </path>
      ))}
      <ellipse cx="0" cy="0" rx="3" ry="3" fill="none" stroke="#ffffff" strokeOpacity="0.7">
        <animate attributeName="rx" values="3;24" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="ry" values="3;8" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.7;0" dur="2.4s" repeatCount="indefinite" />
      </ellipse>
    </g>
  );
}

function Stall({ x, y, c }: { x: number; y: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="16" rx="22" ry="4" fill="#000000" opacity="0.18" />
      <rect x="-18" y="-2" width="36" height="16" fill="#8a6a43" />
      <rect x="-18" y="-2" width="36" height="3" fill="#a37a4d" />
      <rect x="-20" y="-24" width="2" height="38" fill="#5a3d22" />
      <rect x="18" y="-24" width="2" height="38" fill="#5a3d22" />
      <path d="M-24 -24 H24 L20 -12 H-20Z" fill={c} />
      {[-18, -6, 6, 18].map((a) => (
        <path key={a} d={`M${a} -24 L${a * 0.9} -12`} stroke="#ffffff" strokeWidth="4" opacity="0.8" />
      ))}
      <circle cx="-9" cy="-5" r="3" fill="#ef4444" />
      <circle cx="-2" cy="-5" r="3" fill="#f59e0b" />
      <circle cx="6" cy="-5" r="3" fill="#84cc16" />
    </g>
  );
}

function Flowers({ x, y, n = 7 }: { x: number; y: number; n?: number }) {
  const cols = ["#f43f5e", "#fbbf24", "#f9a8d4", "#ffffff", "#a78bfa"];
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${((i * 13) % 26) - 13} ${((i * 7) % 10) - 5})`}>
          <path d="M0 0 v4" stroke="#2f7a3a" strokeWidth="1" />
          <circle r="2" fill={cols[i % cols.length]} />
          <circle r="0.7" fill="#fff6c8" />
        </g>
      ))}
    </g>
  );
}

function Bush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="6" rx="14" ry="4" fill="#000000" opacity="0.18" />
      <circle cx="-7" cy="0" r="8" fill="#2f7a3a" />
      <circle cx="6" cy="-1" r="9" fill="#3c8d47" />
      <circle cx="0" cy="-5" r="7" fill="#46a052" />
    </g>
  );
}

function Bridge({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x="-34" y="-12" width="68" height="24" rx="3" fill="#8a6a43" />
      {[-26, -16, -6, 4, 14, 24].map((a) => (
        <rect key={a} x={a} y="-12" width="1.5" height="24" fill="#000000" opacity="0.2" />
      ))}
      <rect x="-34" y="-14" width="68" height="3" fill="#5a3d22" />
      <rect x="-34" y="11" width="68" height="3" fill="#5a3d22" />
      {[-32, -12, 12, 32].map((a) => (
        <rect key={a} x={a - 1.5} y="-17" width="3" height="6" fill="#5a3d22" />
      ))}
    </g>
  );
}

function Museum3D() {
  return (
    <g>
      <ellipse cx="230" cy="262" rx="132" ry="15" fill="rgba(0,0,0,0.25)" />
      <rect x="132" y="244" width="196" height="12" fill="#c4c9d0" />
      <rect x="140" y="236" width="180" height="10" fill="#cfd4da" />
      <rect x="148" y="228" width="164" height="9" fill="#dde1e6" />
      <rect x="112" y="178" width="38" height="52" fill="#e3ddcd" />
      <rect x="310" y="178" width="38" height="52" fill="#e3ddcd" />
      <rect x="108" y="170" width="46" height="9" fill="#cfc8b4" />
      <rect x="306" y="170" width="46" height="9" fill="#cfc8b4" />
      {[122, 322].map((x) => (
        <g key={x}>
          <path d={`M${x} 226 V196 Q${x} 186 ${x + 8} 186 Q${x + 16} 186 ${x + 16} 196 V226Z`} fill="#3a4a63" />
          <path d={`M${x + 2} 224 V197 Q${x + 2} 189 ${x + 8} 189 Q${x + 14} 189 ${x + 14} 197 V224Z`} fill="#ffe9a3" className="ct-glow" />
          <path d={`M${x + 8} 189 V224`} stroke="#3a4a63" strokeWidth="1.2" />
        </g>
      ))}
      <rect x="158" y="150" width="144" height="78" fill="#ece8de" />
      <rect x="158" y="150" width="144" height="78" fill="url(#cm-shade)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={166 + i * 24} y="152" width="10" height="70" fill="#f8f5ee" />
          <rect x={171 + i * 24} y="152" width="1.2" height="70" fill="#000000" opacity="0.1" />
          <rect x={164 + i * 24} y="148" width="14" height="6" fill="#d8d3c6" />
          <rect x={164 + i * 24} y="220" width="14" height="5" fill="#d8d3c6" />
        </g>
      ))}
      <rect x="150" y="138" width="160" height="12" fill="#d8d3c6" />
      <rect x="150" y="146" width="160" height="4" fill="#000000" opacity="0.1" />
      <path d="M144 138 L230 82 L316 138Z" fill="#c9674b" />
      <path d="M160 134 L230 90 L300 134Z" fill="#dd7e5f" />
      <path d="M144 138 L230 82 L232 86 L152 138Z" fill="#ffffff" opacity="0.2" />
      <circle cx="230" cy="116" r="12" fill="#f6e7b4" stroke="#b9852f" strokeWidth="2.5" />
      <path d="M222 116 q8 -9 16 0 q-8 9 -16 0Z M238 116 l5 -5 v10Z" fill="#2a8fb3" />
      <circle cx="226.6" cy="115" r="1.2" fill="#ffffff" />
      <rect x="226" y="76" width="8" height="8" fill="#b9852f" />
      <g>
        <rect x="229.2" y="56" width="1.6" height="22" fill="#5a3d22" />
        <path d="M231 58 h16 l-4 5 l4 5 h-16Z" fill="#e11d48">
          <animate attributeName="d" values="M231 58 h16 l-4 5 l4 5 h-16Z;M231 58 h14 l-2 5 l2 5 h-14Z;M231 58 h16 l-4 5 l4 5 h-16Z" dur="1.8s" repeatCount="indefinite" />
        </path>
      </g>
      <path d="M214 224 V204 Q214 190 230 190 Q246 190 246 204 V224Z" fill="#6b4a2b" />
      <path d="M217 224 V205 Q217 193 230 193 Q243 193 243 205 V224Z" fill="#ffe9a3" opacity="0.9" className="ct-glow" />
      <path d="M230 193 V224 M217 208 H243" stroke="#6b4a2b" strokeWidth="1.6" />
      <rect x="212" y="223" width="36" height="4" fill="#b9852f" />
      {[200, 260].map((x) => (
        <g key={x}>
          <rect x={x - 1} y="194" width="2" height="22" fill="#3a3f47" />
          <circle cx={x} cy="192" r="9" fill="#ffd36a" opacity="0.3" className="ct-glow" />
          <rect x={x - 3} y="189" width="6" height="6" rx="1.5" fill="#ffe9a3" />
        </g>
      ))}
      <path d="M130 250 q12 -10 22 0Z M308 250 q12 -10 22 0Z" fill="#2f7a3a" />
      <Flowers x={141} y={252} n={5} />
      <Flowers x={319} y={252} n={5} />
      <g transform="translate(180 266)">
        <ellipse cx="0" cy="4" rx="8" ry="2.5" fill="#000000" opacity="0.2" />
        <rect x="-4" y="-2" width="8" height="5" fill="#cfd4da" />
        <path d="M0 -2 q-7 -6 -4 -13 q3 4 4 -1 q1 5 4 1 q3 7 -4 13Z" fill="#58b9d9" />
        <path d="M0 -14 q3 -5 5 -2" stroke="#bfe9f7" strokeWidth="1.5" fill="none">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" repeatCount="indefinite" />
        </path>
      </g>
      <rect x="180" y="274" width="100" height="26" rx="13" fill="#161B22" stroke="#E3B341" strokeWidth="2" />
      <text x="230" y="292" textAnchor="middle" fontSize="16" fontWeight="600" fill="#F0F6FC">
        Museo
      </text>
    </g>
  );
}

function Pond3D() {
  return (
    <g>
      <path d="M458 252 C 458 184, 536 150, 602 158 C 678 166, 730 206, 724 264 C 718 328, 646 358, 580 350 C 502 344, 458 310, 458 252Z" fill="#d8c48f" />
      <path d="M470 250 C 470 190, 540 160, 600 168 C 670 176, 718 214, 712 262 C 706 316, 640 344, 580 338 C 510 332, 470 300, 470 250Z" fill="#6d5a3a" />
      <path d="M480 250 C 480 198, 545 172, 600 179 C 662 187, 704 220, 700 262 C 694 308, 636 332, 582 327 C 520 321, 480 294, 480 250Z" fill="url(#cm-water)" />
      <path d="M500 250 C 500 214, 550 194, 600 199 C 650 205, 682 228, 678 262 C 672 296, 630 312, 584 307 C 536 302, 500 282, 500 250Z" fill="#12445f" opacity="0.45" />
      <path d="M520 226 q30 -14 70 -10 M610 296 q30 -2 54 -22" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2" fill="none" strokeLinecap="round" />
      {[[560, 240, 3, 28, 18, 3], [640, 280, 3, 24, 15, 3.6], [610, 220, 2, 18, 10, 4.4]].map(([cx, cy, r0, rx, ry, d], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={r0} ry={r0} fill="none" stroke="#fff" strokeOpacity="0.7">
          <animate attributeName="rx" values={`${r0};${rx}`} dur={`${d}s`} begin={`${i}s`} repeatCount="indefinite" />
          <animate attributeName="ry" values={`${r0};${ry}`} dur={`${d}s`} begin={`${i}s`} repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.7;0" dur={`${d}s`} begin={`${i}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
      {[[600, 215], [530, 280], [660, 250], [570, 300]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx="14" ry="6" fill="#3f9a4a" />
          <path d={`M${x} ${y} L${x + 14} ${y - 2}`} stroke="#2f7a3a" strokeWidth="1.2" />
          {i % 2 === 0 && <circle cx={x + 4} cy={y - 3} r="3.4" fill="#f9a8d4" />}
        </g>
      ))}
      <g>
        <animateMotion path="M520 250 C 560 220, 640 230, 670 262 C 640 300, 570 300, 520 250" dur="26s" repeatCount="indefinite" />
        <ellipse cx="0" cy="0" rx="7" ry="4.5" fill="#fafafa" />
        <circle cx="6" cy="-3" r="3" fill="#fafafa" />
        <path d="M8.6 -3 l4 1 l-4 1Z" fill="#f59e0b" />
        <path d="M-6 -1 q-4 -2 -6 -5 q4 1 6 2Z" fill="#e5e7eb" />
      </g>
      <path d="M0 0" />
      <g opacity="0">
        <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.02;0.14;0.16;1" dur="8s" repeatCount="indefinite" />
        <animateMotion path="M590 250 q14 -26 30 0" dur="8s" keyPoints="0;1;1" keyTimes="0;0.16;1" calcMode="linear" repeatCount="indefinite" />
        <path d="M-6 0 q6 -5 12 0 q-6 5 -12 0Z M6 0 l5 -4 v8Z" fill="#fbbf24" />
      </g>
      <g>
        <rect x="566" y="324" width="30" height="58" fill="#8a6a43" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x="566" y={330 + i * 10} width="30" height="1.6" fill="rgba(0,0,0,0.28)" />
        ))}
        <rect x="563" y="324" width="4" height="58" fill="#5a3d22" />
        <rect x="595" y="324" width="4" height="58" fill="#5a3d22" />
        <g transform="translate(620 352)">
          <ellipse cx="0" cy="10" rx="20" ry="4" fill="#000000" opacity="0.2" />
          <path d="M-20 0 H20 L14 10 H-14Z" fill="#b5653a" />
          <path d="M-20 0 H20" stroke="#8a4b2b" strokeWidth="2" />
          <animateTransform attributeName="transform" type="translate" values="620 352;620 354;620 352" dur="3s" repeatCount="indefinite" />
        </g>
        <g transform="translate(580 322)">
          <rect x="-4" y="-8" width="8" height="9" rx="2" fill="#388bfd" />
          <circle cx="0" cy="-12" r="3.6" fill="#f2c9a0" />
          <path d="M-5 -13 q5 -7 10 0Z" fill="#e3b341" />
          <path d="M2 -6 L20 -22" stroke="#5b3b1f" strokeWidth="1.5" />
        </g>
      </g>
      {[[484, 292], [496, 304], [690, 292], [700, 300], [524, 316], [664, 316]].map(([x, y], i) => (
        <g key={i}>
          {[-3, 0, 3].map((d) => (
            <path key={d} d={`M${x + d} ${y} q${d} -12 ${d * 2} -22`} stroke="#4d8a3e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          ))}
          {i % 2 === 0 && <rect x={x - 1.5} y={y - 30} width="3" height="9" rx="1.2" fill="#7c4a2a" />}
        </g>
      ))}
      {[[470, 310, 10], [712, 306, 8], [500, 330, 7]].map(([x, y, r], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.75} fill="#7b8087" />
          <ellipse cx={x - r * 0.2} cy={y - r * 0.25} rx={r * 0.45} ry={r * 0.3} fill="#ffffff" opacity="0.2" />
        </g>
      ))}
      <rect x="540" y="392" width="100" height="26" rx="13" fill="#161B22" stroke="#58A6FF" strokeWidth="2" />
      <text x="590" y="410" textAnchor="middle" fontSize="16" fontWeight="600" fill="#F0F6FC">
        Pond
      </text>
    </g>
  );
}

function Glow({ x, y, r, d = 0 }: { x: number; y: number; r: number; d?: number }) {
  return <circle cx={x} cy={y} r={r} fill="url(#cm-lamp)" className="ct-glow" style={{ animationDelay: `${d}s` }} pointerEvents="none" />;
}

function Night({ L }: { L: typeof WORLD }) {
  const [mx, my] = L.moon;
  const [ox, oy] = L.museum;
  const [qx, qy] = L.pond;
  const stars = Array.from({ length: 150 }, (_, i) => [(i * 137) % WORLD_W, (i * 211) % WORLD_H, 0.6 + (i % 3) * 0.4, (i % 7) * 0.4]);
  const flies = Array.from({ length: 40 }, (_, i) => [((i * 197) % (WORLD_W - 60)) + 30, ((i * 113) % (WORLD_H - 120)) + 60, 3 + (i % 4)]);
  return (
    <g pointerEvents="none">
      {stars.map(([x, y, r, d], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" className="ct-twinkle" style={{ animationDelay: `${d}s` }} />
      ))}
      <circle cx={mx} cy={my} r="70" fill="url(#cm-moon)" />
      <circle cx={mx} cy={my} r="24" fill="#f3f0dc" />
      <circle cx={mx - 7} cy={my - 5} r="5" fill="#d9d4b8" />
      <circle cx={mx + 8} cy={my + 7} r="3.4" fill="#d9d4b8" />
      {L.lamps.map(([x, y], i) => (
        <g key={i}>
          <Glow x={x} y={y - 22} r={34} d={i * 0.3} />
          <circle cx={x} cy={y - 22} r="3" fill="#fff3c4" />
          <ellipse cx={x} cy={y + 2} rx="22" ry="7" fill="url(#cm-lamp)" opacity="0.5" />
        </g>
      ))}
      {L.houses.map((h, i) => (
        <g key={i}>
          {[-17, 9].map((a) => (
            <g key={a}>
              <circle cx={h.x + a + 4} cy={h.y - 4} r="13" fill="url(#cm-lamp)" opacity="0.7" />
              <rect x={h.x + a} y={h.y - 8} width="8" height="8" fill="#ffd36a" />
              <path d={`M${h.x + a + 4} ${h.y - 8} V${h.y} M${h.x + a} ${h.y - 4} H${h.x + a + 8}`} stroke="#8a5a34" strokeWidth="1" />
            </g>
          ))}
          <rect x={h.x - 5} y={h.y + 2} width="10" height="14" fill="#ffb64a" opacity="0.55" />
        </g>
      ))}
      <g transform={`translate(${ox} ${oy})`}>
        <ellipse cx="230" cy="236" rx="120" ry="30" fill="url(#cm-lamp)" opacity="0.45" />
        {[122, 322].map((x) => (
          <g key={x}>
            <circle cx={x + 8} cy="206" r="30" fill="url(#cm-lamp)" opacity="0.6" />
            <path d={`M${x + 2} 224 V197 Q${x + 2} 189 ${x + 8} 189 Q${x + 14} 189 ${x + 14} 197 V224Z`} fill="#ffd36a" />
            <path d={`M${x + 8} 189 V224`} stroke="#3a4a63" strokeWidth="1.2" />
          </g>
        ))}
        <circle cx="230" cy="208" r="40" fill="url(#cm-lamp)" opacity="0.75" />
        <path d="M217 224 V205 Q217 193 230 193 Q243 193 243 205 V224Z" fill="#ffd36a" />
        <path d="M230 193 V224 M217 208 H243" stroke="#6b4a2b" strokeWidth="1.6" />
        {[200, 260].map((x) => (
          <g key={x}>
            <Glow x={x} y={192} r={26} />
            <circle cx={x} cy="192" r="3" fill="#fff3c4" />
          </g>
        ))}
        <circle cx="230" cy="116" r="12" fill="#f6e7b4" opacity="0.9" />
        <path d="M222 116 q8 -9 16 0 q-8 9 -16 0Z M238 116 l5 -5 v10Z" fill="#2a8fb3" />
        <rect x="180" y="274" width="100" height="26" rx="13" fill="#161B22" stroke="#E3B341" strokeWidth="2" />
        <text x="230" y="292" textAnchor="middle" fontSize="16" fontWeight="600" fill="#F0F6FC">
          Museo
        </text>
      </g>
      <g transform={`translate(${qx} ${qy})`}>
        <ellipse cx="590" cy="250" rx="108" ry="64" fill="#9cc4ff" opacity="0.1" />
        <ellipse cx={mx > 100 ? 560 : 560} cy="230" rx="18" ry="6" fill="#f3f0dc" opacity="0.18" />
        <Glow x={604} y={316} r={30} />
        <rect x="602" y="318" width="2.4" height="10" fill="#3a3f47" />
        <circle cx="603" cy="316" r="3" fill="#fff3c4" />
        <rect x="540" y="392" width="100" height="26" rx="13" fill="#161B22" stroke="#58A6FF" strokeWidth="2" />
        <text x="590" y="410" textAnchor="middle" fontSize="16" fontWeight="600" fill="#F0F6FC">
          Pond
        </text>
      </g>
      {flies.map(([x, y, d], i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill="#e8ff8a">
          <animate attributeName="cx" values={`${x};${x + 14};${x - 8};${x}`} dur={`${d + 5}s`} repeatCount="indefinite" />
          <animate attributeName="cy" values={`${y};${y - 12};${y + 6};${y}`} dur={`${d + 4}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;0.2;1;0" dur={`${d + 2}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  );
}

const Scene = memo(function Scene({ onGo }: { onGo: (v: View) => void }) {
  const L = WORLD;
  const hot = (v: View, label: string) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": label,
    onClick: () => onGo(v),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onGo(v);
      }
    },
  });
  const big = { x: -400, y: -400, width: WORLD_W + 800, height: WORLD_H + 800 };
  return (
    <>
      <defs>
        <linearGradient id="cm-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#53a653" />
          <stop offset="1" stopColor="#3b8541" />
        </linearGradient>
        <linearGradient id="cm-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3aa3c7" />
          <stop offset="1" stopColor="#1d6f93" />
        </linearGradient>
        <linearGradient id="cm-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
        <radialGradient id="cm-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd36a" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#ffb64a" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ffb64a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cm-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#dbe7ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#dbe7ff" stopOpacity="0" />
        </radialGradient>
        <pattern id="cm-tex" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M3 18 q1 -6 3 -8 M12 8 q1 -5 3 -6 M17 20 q1 -5 3 -7" stroke="#2c7433" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
        </pattern>
      </defs>
      <rect {...big} fill="url(#cm-grass)" />
      <rect {...big} fill="url(#cm-tex)" />
      {L.patches.map(([x, y, rx, ry], i) => (
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#5bb25a" opacity="0.35" />
      ))}
      <path d={L.stream} fill="none" stroke="#2d6f8f" strokeWidth="26" strokeLinecap="round" />
      <path d={L.stream} fill="none" stroke="#4cb0d4" strokeWidth="19" strokeLinecap="round" />
      <path d={L.stream} fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" className="ct-flow" />
      {L.roads.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="#a98b55" strokeWidth={i === 0 ? 34 : 26} strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke="#c9a66b" strokeWidth={i === 0 ? 27 : 19} strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke="#e0c690" strokeWidth="12" strokeLinecap="round" strokeDasharray="2 14" />
        </g>
      ))}
      <ellipse cx={L.plaza[0]} cy={L.plaza[1] + 10} rx="150" ry="88" fill="#a98b55" />
      <ellipse cx={L.plaza[0]} cy={L.plaza[1] + 8} rx="142" ry="82" fill="#c9a66b" />
      <ellipse cx={L.plaza[0]} cy={L.plaza[1] + 8} rx="118" ry="66" fill="none" stroke="#e0c690" strokeWidth="3" strokeDasharray="3 9" strokeLinecap="round" />
      <Bridge {...L.bridge} />
      {L.flowers.map(([x, y], i) => (
        <Flowers key={i} x={x} y={y} n={6 + (i % 3)} />
      ))}
      {L.bushes.map(([x, y], i) => (
        <Bush key={i} x={x} y={y} s={0.9 + (i % 3) * 0.15} />
      ))}
      <Fountain x={L.fountain[0]} y={L.fountain[1]} />
      {L.stalls.map((t, i) => (
        <Stall key={i} {...t} />
      ))}
      {L.trees.map((t, i) => (
        <Tree key={i} {...t} />
      ))}
      {L.houses.map((h, i) => (
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
          <ellipse cx="0" cy="-4" rx="92" ry="72" className="fill-white opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-20" />
          <School3D />
        </g>
      </g>

      <g transform={`translate(${L.dig[0]} ${L.dig[1]}) scale(${L.dig[2]})`}>
        <g {...hot("dig", "Vai al sito di scavo")} className="group cursor-pointer outline-none" data-testid="city-dig">
          <ellipse cx="0" cy="16" rx="96" ry="62" className="fill-white opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-20" />
          <Dig3D />
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
      <Cloud y={140} d={170} begin={0} />
      <Cloud y={430} d={230} begin={-70} s={0.8} />
      <Cloud y={80} d={200} begin={-120} s={1.1} />
      <Cloud y={760} d={250} begin={-40} s={0.9} />
      <Cloud y={1120} d={210} begin={-150} s={1} />
      <Bird y={300} d={60} begin={0} />
      <Bird y={700} d={80} begin={-30} />
      <Bird y={1000} d={70} begin={-50} />
      <rect {...big} fill="#070f2c" opacity="0.62" pointerEvents="none" />
      <Night L={L} />
      <ForestNight x={L.forest[0]} y={L.forest[1]} s={L.forest[2]} />
      <StadiumNight x={L.stadium[0]} y={L.stadium[1]} s={L.stadium[2]} />
      <SchoolNight x={L.school[0]} y={L.school[1]} s={L.school[2]} />
      <DigNight x={L.dig[0]} y={L.dig[1]} s={L.dig[2]} />
      <SchoolTag x={L.school[0]} y={L.school[1]} s={L.school[2]} />
      <DigTag x={L.dig[0]} y={L.dig[1]} s={L.dig[2]} />
    </>
  );
});

export default function CityMap({ onGo }: { onGo: (v: View) => void }) {
  const view = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const cam = useRef({ x: 0, y: 0, vx: 0, vy: 0, k: 1, vw: 0, vh: 0, t: 0, ready: false });
  const keys = useRef(new Set<string>());
  const drag = useRef({ on: false, moved: false, sx: 0, sy: 0, cx: 0, cy: 0, lx: 0, ly: 0, lt: 0 });

  const apply = useCallback(() => {
    const c = cam.current;
    const w = c.vw / c.k;
    const h = c.vh / c.k;
    c.x = clamp(c.x, 0, Math.max(0, WORLD_W - w));
    c.y = clamp(c.y, 0, Math.max(0, WORLD_H - h));
    svg.current?.setAttribute("viewBox", `${c.x.toFixed(1)} ${c.y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
  }, []);

  const step = useCallback(
    (now: number) => {
      const c = cam.current;
      const dt = Math.min(0.05, (now - c.t) / 1000);
      c.t = now;
      const kk = keys.current;
      const ax = (kk.has("arrowright") || kk.has("d") ? 1 : 0) - (kk.has("arrowleft") || kk.has("a") ? 1 : 0);
      const ay = (kk.has("arrowdown") || kk.has("s") ? 1 : 0) - (kk.has("arrowup") || kk.has("w") ? 1 : 0);
      if (ax || ay) {
        c.vx += (ax * 800 - c.vx) * Math.min(1, dt * 6);
        c.vy += (ay * 800 - c.vy) * Math.min(1, dt * 6);
      } else if (!drag.current.on) {
        const f = Math.exp(-4 * dt);
        c.vx *= f;
        c.vy *= f;
      }
      if (!drag.current.on) {
        c.x += (c.vx * dt) / c.k;
        c.y += (c.vy * dt) / c.k;
        apply();
      }
      if (ax || ay || Math.hypot(c.vx, c.vy) > 8) raf.current = requestAnimationFrame(step);
      else {
        raf.current = 0;
        c.vx = 0;
        c.vy = 0;
      }
    },
    [apply],
  );

  const kick = useCallback(() => {
    if (raf.current) return;
    cam.current.t = performance.now();
    raf.current = requestAnimationFrame(step);
  }, [step]);

  useEffect(() => {
    const el = view.current;
    if (!el) return;
    const measure = () => {
      const c = cam.current;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      if (!vw || !vh) return;
      const cx = c.ready ? c.x + c.vw / c.k / 2 : WORLD.plaza[0];
      const cy = c.ready ? c.y + c.vh / c.k / 2 : WORLD.plaza[1] - 40;
      c.vw = vw;
      c.vh = vh;
      c.k = Math.max(clamp(Math.min(vh / 700, vw / 560), 0.75, 1.25), vw / WORLD_W, vh / WORLD_H);
      c.ready = true;
      c.x = cx - vw / c.k / 2;
      c.y = cy - vh / c.k / 2;
      apply();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) return;
      cam.current.x += e.deltaX / cam.current.k;
      cam.current.y += e.deltaY / cam.current.k;
      apply();
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
  }, [apply]);

  useEffect(() => {
    const kd = (e: globalThis.KeyboardEvent) => {
      if (document.querySelector("[data-slot='dialog-content']")) return;
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        e.preventDefault();
        keys.current.add(k);
        kick();
      }
    };
    const ku = (e: globalThis.KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [kick]);

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
      if (!d.moved && Math.hypot(dx, dy) > 6) {
        d.moved = true;
        hint.current?.classList.add("opacity-0");
      }
      if (!d.moved) return;
      c.x = d.cx - dx / c.k;
      c.y = d.cy - dy / c.k;
      apply();
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
      kick();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (!drag.current.moved) return;
    e.stopPropagation();
    e.preventDefault();
    drag.current.moved = false;
  };

  return (
    <div ref={view} className="absolute inset-0 touch-none overflow-hidden bg-[#3b8541] select-none" onPointerDown={onDown} onClickCapture={onClickCapture}>
      <svg ref={svg} viewBox="0 0 560 700" preserveAspectRatio="none" className="absolute inset-0 size-full" data-testid="city-map">
        <Scene onGo={onGo} />
      </svg>
      <div ref={hint} className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center transition-opacity duration-500 wl-hint">
        <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">Trascina per esplorare · tocca un luogo per entrare</span>
      </div>
    </div>
  );
}
