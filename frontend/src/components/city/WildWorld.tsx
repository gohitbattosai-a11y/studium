import { memo, useMemo } from "react";
import "./wild.css";

export const WORLD_W = 3600;
export const WORLD_H = 2200;

export interface Anchor {
  x: number;
  y: number;
  r: number;
}

export const LAKE = { x: 2560, y: 1650, rx: 520, ry: 270 };
export const PLAZA = { x: 1800, y: 1130, r: 175 };

export const ANCHORS: Record<string, Anchor> = {
  meadow: { x: 1250, y: 1350, r: 520 },
  forest: { x: 760, y: 520, r: 520 },
  shore: { x: 2150, y: 1520, r: 330 },
  heights: { x: 2950, y: 360, r: 420 },
  plaza: { x: 1850, y: 1130, r: 360 },
  grove: { x: 2450, y: 1000, r: 380 },
  south: { x: 1500, y: 1900, r: 460 },
  sky: { x: 1800, y: 1100, r: 1500 },
};

export const inLake = (x: number, y: number, pad = 0) => ((x - LAKE.x) / (LAKE.rx + pad)) ** 2 + ((y - LAKE.y) / (LAKE.ry + pad)) ** 2 < 1;

const PATH_PTS: [number, number][] = [
  [120, 2110],
  [520, 1930],
  [900, 1800],
  [1300, 1830],
  [1700, 1700],
  [1850, 1450],
  [1720, 1230],
  [1900, 1030],
  [2300, 930],
  [2650, 800],
  [2820, 640],
  [3050, 480],
  [3300, 310],
];

const STREAM_PTS: [number, number][] = [
  [3280, -60],
  [3120, 180],
  [3010, 400],
  [2980, 620],
  [3020, 860],
  [2900, 1130],
  [2780, 1380],
  [2700, 1560],
];

function smooth(p: [number, number][]) {
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(p.length - 1, i + 2)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function sample(p: [number, number][], n = 18) {
  const out: [number, number][] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(p.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const u = 1 - t;
      out.push([u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0], u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1]]);
    }
  }
  out.push(p[p.length - 1]);
  return out;
}

const PATH_D = smooth(PATH_PTS);
const STREAM_D = smooth(STREAM_PTS);
const PATH_S = sample(PATH_PTS);
const STREAM_S = sample(STREAM_PTS);

const near = (pts: [number, number][], x: number, y: number, r: number) => pts.some(([px, py]) => (px - x) ** 2 + (py - y) ** 2 < r * r);

export const onPath = (x: number, y: number, r = 90) => near(PATH_S, x, y, r);

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type PropKind = "oak" | "birch" | "pine" | "blossom" | "bush" | "rock" | "boulder" | "reed" | "lamp" | "bench" | "sign" | "stump";

interface PropDef {
  k: PropKind;
  x: number;
  y: number;
  s: number;
}

const SIZE: Record<PropKind, [number, number]> = {
  oak: [200, 260],
  birch: [160, 260],
  pine: [160, 290],
  blossom: [200, 250],
  bush: [120, 80],
  rock: [140, 100],
  boulder: [260, 190],
  reed: [90, 110],
  lamp: [50, 150],
  bench: [150, 90],
  sign: [90, 130],
  stump: [80, 60],
};

function buildProps(): PropDef[] {
  const r = rng(7);
  const out: PropDef[] = [];
  const free = (x: number, y: number, pathR: number) => x > 20 && x < WORLD_W - 20 && y > 40 && y < WORLD_H - 10 && !near(PATH_S, x, y, pathR) && !near(STREAM_S, x, y, 90) && !inLake(x, y, 60) && (x - PLAZA.x) ** 2 + (y - PLAZA.y) ** 2 > (PLAZA.r + 70) ** 2 && (x - 3380) ** 2 + (y - 300) ** 2 > 260 ** 2;
  const place = (k: PropKind, n: number, box: [number, number, number, number], pathR: number, smin: number, smax: number) => {
    let c = 0;
    let guard = 0;
    while (c < n && guard < n * 40) {
      guard++;
      const x = box[0] + r() * (box[2] - box[0]);
      const y = box[1] + r() * (box[3] - box[1]);
      if (!free(x, y, pathR)) continue;
      out.push({ k, x, y, s: smin + r() * (smax - smin) });
      c++;
    }
  };
  place("pine", 46, [40, 60, 1500, 940], 130, 0.85, 1.35);
  place("oak", 30, [40, 80, 1500, 960], 130, 0.8, 1.25);
  place("birch", 18, [200, 100, 1400, 900], 130, 0.8, 1.15);
  place("bush", 22, [60, 120, 1500, 980], 100, 0.7, 1.2);
  place("stump", 8, [100, 200, 1400, 900], 100, 0.8, 1.2);
  place("oak", 18, [40, 900, 1500, 2150], 140, 0.8, 1.2);
  place("birch", 10, [100, 1000, 1500, 2100], 140, 0.8, 1.1);
  place("blossom", 8, [300, 1000, 1500, 1700], 150, 0.9, 1.2);
  place("bush", 26, [60, 900, 1700, 2150], 100, 0.7, 1.3);
  place("oak", 16, [1900, 1000, 3560, 1350], 140, 0.9, 1.3);
  place("pine", 14, [2300, 860, 3560, 1200], 140, 0.9, 1.3);
  place("bush", 18, [1900, 1000, 3560, 1400], 100, 0.7, 1.2);
  place("oak", 12, [1900, 1900, 3560, 2150], 120, 0.9, 1.3);
  place("blossom", 6, [1950, 1850, 3500, 2150], 120, 1, 1.3);
  place("pine", 22, [2300, 60, 3560, 520], 150, 0.9, 1.5);
  place("boulder", 8, [2300, 80, 3560, 560], 150, 0.8, 1.5);
  place("rock", 26, [1900, 100, 3560, 1000], 110, 0.7, 1.4);
  place("rock", 14, [100, 1000, 1700, 2100], 110, 0.6, 1.1);
  place("oak", 10, [1500, 80, 2300, 700], 140, 0.9, 1.3);
  place("birch", 8, [1500, 100, 2300, 700], 140, 0.9, 1.2);
  place("pine", 14, [1500, 60, 2300, 520], 140, 0.9, 1.3);
  place("bush", 10, [1500, 100, 2300, 760], 100, 0.7, 1.1);
  for (let i = 0; i < 22; i++) {
    const a = r() * Math.PI * 2;
    const x = LAKE.x + Math.cos(a) * (LAKE.rx + 40 + r() * 40);
    const y = LAKE.y + Math.sin(a) * (LAKE.ry + 30 + r() * 30);
    if (y > 40 && y < WORLD_H - 20 && x < WORLD_W - 20 && !near(PATH_S, x, y, 110)) out.push({ k: "reed", x, y, s: 0.8 + r() * 0.6 });
  }
  for (let i = 4; i < PATH_S.length - 6; i += 11) {
    const [px, py] = PATH_S[i];
    const [qx, qy] = PATH_S[i + 1];
    const nx = -(qy - py);
    const ny = qx - px;
    const l = Math.hypot(nx, ny) || 1;
    const side = (i / 11) % 2 === 0 ? 1 : -1;
    const x = px + (nx / l) * 84 * side;
    const y = py + (ny / l) * 84 * side;
    if (!inLake(x, y, 30) && !near(STREAM_S, x, y, 80) && (x - PLAZA.x) ** 2 + (y - PLAZA.y) ** 2 > (PLAZA.r + 20) ** 2) out.push({ k: "lamp", x, y, s: 1 });
  }
  [[430, 1960], [1120, 1880], [2480, 900], [1560, 1560]].forEach(([x, y], i) => out.push({ k: i % 2 ? "bench" : "sign", x, y, s: 1 }));
  return out;
}

const PROPS = buildProps();

const GRASS = (() => {
  const r = rng(21);
  const blobs: { x: number; y: number; rx: number; ry: number; c: number }[] = [];
  for (let i = 0; i < 150; i++) blobs.push({ x: r() * WORLD_W, y: r() * WORLD_H, rx: 80 + r() * 240, ry: 40 + r() * 120, c: i % 4 });
  const tufts: { x: number; y: number; s: number }[] = [];
  for (let i = 0; i < 520; i++) {
    const x = r() * WORLD_W;
    const y = r() * WORLD_H;
    if (!inLake(x, y, 20) && !near(PATH_S, x, y, 70) && !near(STREAM_S, x, y, 70)) tufts.push({ x, y, s: 0.7 + r() * 0.9 });
  }
  const flowers: { x: number; y: number; c: string; s: number }[] = [];
  const cols = ["#ffffff", "#ffd84a", "#ff8fb4", "#b79bff", "#ff7a59", "#8fd3ff"];
  for (let i = 0; i < 640; i++) {
    const x = r() * WORLD_W;
    const y = r() * WORLD_H;
    if (!inLake(x, y, 30) && !near(PATH_S, x, y, 80) && !near(STREAM_S, x, y, 80) && (x - PLAZA.x) ** 2 + (y - PLAZA.y) ** 2 > (PLAZA.r + 30) ** 2) flowers.push({ x, y, c: cols[Math.floor(r() * cols.length)], s: 0.8 + r() * 0.8 });
  }
  const pebbles: { x: number; y: number; s: number }[] = [];
  for (let i = 4; i < PATH_S.length - 2; i += 2) {
    const [px, py] = PATH_S[i];
    for (let k = 0; k < 3; k++) pebbles.push({ x: px + (r() - 0.5) * 80, y: py + (r() - 0.5) * 80, s: 2 + r() * 3 });
  }
  const lilies: { x: number; y: number; s: number; f: boolean }[] = [];
  for (let i = 0; i < 18; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * 0.8;
    lilies.push({ x: LAKE.x + Math.cos(a) * LAKE.rx * d, y: LAKE.y + Math.sin(a) * LAKE.ry * d, s: 0.8 + r() * 0.7, f: r() > 0.55 });
  }
  const cobbles: { x: number; y: number }[] = [];
  for (let i = 0; i < 60; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * PLAZA.r * 0.95;
    cobbles.push({ x: PLAZA.x + Math.cos(a) * d, y: PLAZA.y + Math.sin(a) * d * 0.8 });
  }
  return { blobs, tufts, flowers, pebbles, lilies, cobbles };
})();

const BLOB = ["#5aa34f", "#8ccf6a", "#4b9248", "#a3d978"];

function Symbols() {
  return (
    <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden>
      <defs>
        <symbol id="wl-oak" viewBox="0 0 200 260">
          <ellipse cx="100" cy="248" rx="74" ry="13" fill="#0b2a12" opacity="0.3" />
          <path d="M86 250 C90 212 84 184 78 150 L122 150 C116 184 110 212 114 250Z" fill="#7a5632" />
          <path d="M104 250 C108 212 106 184 112 150 L122 150 C116 184 110 212 114 250Z" fill="#583a1f" />
          <path d="M74 250 q10 -10 14 -22 M126 250 q-10 -10 -14 -22" stroke="#583a1f" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="58" cy="118" r="46" fill="#2c7a38" />
          <circle cx="144" cy="116" r="48" fill="#2c7a38" />
          <circle cx="100" cy="98" r="68" fill="#348a40" />
          <ellipse cx="100" cy="150" rx="70" ry="22" fill="#1d5a2a" opacity="0.55" />
          <circle cx="86" cy="76" r="46" fill="#46a24b" />
          <circle cx="132" cy="64" r="32" fill="#5bb757" />
          <circle cx="70" cy="58" r="24" fill="#74c868" />
          <circle cx="116" cy="46" r="14" fill="#93dc82" opacity="0.85" />
          {[[60, 110], [92, 128], [130, 104], [150, 130], [110, 88], [74, 90], [100, 62]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={4 + (i % 3)} fill={i % 2 ? "#6cc364" : "#276f32"} opacity="0.7" />
          ))}
        </symbol>
        <symbol id="wl-birch" viewBox="0 0 160 260">
          <ellipse cx="80" cy="248" rx="52" ry="10" fill="#0b2a12" opacity="0.28" />
          <path d="M72 250 L76 130 L90 130 L94 250Z" fill="#ece8dc" />
          <path d="M84 250 L87 130 L90 130 L94 250Z" fill="#c9c3b2" />
          {[160, 184, 208, 230].map((y, i) => (
            <rect key={y} x={i % 2 ? 78 : 74} y={y} width="9" height="3" fill="#3c3a33" />
          ))}
          <circle cx="50" cy="104" r="38" fill="#7ab94c" />
          <circle cx="112" cy="100" r="42" fill="#7ab94c" />
          <circle cx="80" cy="84" r="52" fill="#8fcd5a" />
          <ellipse cx="80" cy="130" rx="52" ry="16" fill="#4f8a35" opacity="0.5" />
          <circle cx="68" cy="62" r="34" fill="#a6dc6c" />
          <circle cx="98" cy="48" r="20" fill="#c4ee8a" opacity="0.9" />
          {[[44, 96], [100, 112], [74, 100], [122, 82], [62, 60]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3.5} fill={i % 2 ? "#d8f59a" : "#659e3c"} opacity="0.75" />
          ))}
        </symbol>
        <symbol id="wl-pine" viewBox="0 0 160 290">
          <ellipse cx="80" cy="278" rx="50" ry="10" fill="#07200f" opacity="0.32" />
          <rect x="70" y="220" width="20" height="58" fill="#5a3d22" />
          <rect x="80" y="220" width="10" height="58" fill="#432c16" />
          <path d="M80 118 L132 232 H28Z" fill="#1b5237" />
          <path d="M80 118 L132 232 H80Z" fill="#14402b" />
          <path d="M80 70 L122 168 H38Z" fill="#23653f" />
          <path d="M80 70 L122 168 H80Z" fill="#194d32" />
          <path d="M80 22 L110 112 H50Z" fill="#2d7a4c" />
          <path d="M80 22 L110 112 H80Z" fill="#205c3a" />
          <path d="M80 22 L62 96 M80 70 L52 150 M80 118 L42 214" stroke="#5fb07a" strokeWidth="2.4" opacity="0.5" strokeLinecap="round" />
        </symbol>
        <symbol id="wl-blossom" viewBox="0 0 200 250">
          <ellipse cx="100" cy="240" rx="70" ry="12" fill="#2a1020" opacity="0.28" />
          <path d="M90 242 C92 210 86 182 80 152 L120 152 C114 182 110 210 112 242Z" fill="#6a4630" />
          <path d="M106 242 C108 210 106 182 112 152 L120 152 C114 182 110 210 112 242Z" fill="#4a2f1e" />
          <circle cx="56" cy="116" r="44" fill="#e07aa6" />
          <circle cx="146" cy="114" r="46" fill="#e07aa6" />
          <circle cx="100" cy="94" r="66" fill="#ec8fb7" />
          <ellipse cx="100" cy="148" rx="68" ry="20" fill="#b44f7d" opacity="0.5" />
          <circle cx="84" cy="70" r="44" fill="#f4a9c8" />
          <circle cx="126" cy="58" r="30" fill="#f9c4da" />
          <circle cx="70" cy="52" r="20" fill="#fddbe9" opacity="0.9" />
          {[[60, 110], [96, 124], [140, 100], [152, 128], [112, 84], [76, 88]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3.5} fill={i % 2 ? "#fff0f6" : "#c9628f"} opacity="0.8" />
          ))}
        </symbol>
        <symbol id="wl-bush" viewBox="0 0 120 80">
          <ellipse cx="60" cy="74" rx="48" ry="7" fill="#0b2a12" opacity="0.3" />
          <circle cx="34" cy="50" r="26" fill="#2f7a3a" />
          <circle cx="88" cy="50" r="28" fill="#2f7a3a" />
          <circle cx="60" cy="40" r="34" fill="#3b8e45" />
          <circle cx="48" cy="30" r="22" fill="#52a955" />
          <circle cx="74" cy="24" r="12" fill="#72c36a" opacity="0.9" />
          {[[40, 52], [66, 44], [86, 56], [54, 62]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#e34b5a" />
          ))}
        </symbol>
        <symbol id="wl-rock" viewBox="0 0 140 100">
          <ellipse cx="70" cy="92" rx="58" ry="8" fill="#0b1a12" opacity="0.32" />
          <path d="M12 88 L22 46 L50 22 L92 20 L124 44 L130 88Z" fill="#8d968f" />
          <path d="M50 22 L92 20 L124 44 L100 50 L64 44Z" fill="#b4bcb5" />
          <path d="M92 20 L124 44 L130 88 L100 88 L98 50Z" fill="#6a736d" />
          <path d="M22 46 L50 22 L64 44 L40 60Z" fill="#a1aaa3" />
          <path d="M30 80 q14 -10 28 -4" stroke="#5a625c" strokeWidth="2" fill="none" />
          <ellipse cx="30" cy="84" rx="14" ry="5" fill="#4b9248" opacity="0.8" />
        </symbol>
        <symbol id="wl-boulder" viewBox="0 0 260 190">
          <ellipse cx="130" cy="178" rx="116" ry="12" fill="#0b1a12" opacity="0.34" />
          <path d="M14 172 L30 96 L78 38 L150 20 L214 52 L246 110 L250 172Z" fill="#838c86" />
          <path d="M78 38 L150 20 L214 52 L170 74 L110 70Z" fill="#b7bfb8" />
          <path d="M150 20 L214 52 L246 110 L250 172 L190 172 L184 90 L170 74Z" fill="#646d67" />
          <path d="M30 96 L78 38 L110 70 L70 112Z" fill="#a0a9a2" />
          <path d="M70 150 q30 -20 62 -10 M130 120 q24 -14 46 -4" stroke="#545c56" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="56" cy="160" rx="30" ry="9" fill="#4b9248" opacity="0.85" />
          <ellipse cx="214" cy="162" rx="22" ry="7" fill="#4b9248" opacity="0.8" />
        </symbol>
        <symbol id="wl-reed" viewBox="0 0 90 110">
          <ellipse cx="45" cy="104" rx="34" ry="5" fill="#0b2a12" opacity="0.25" />
          {[[16, 20], [30, 6], [44, 14], [58, 2], [72, 22]].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x - 4 + i} 104 Q${x} 60 ${x + (i % 2 ? 5 : -5)} ${y + 20}`} stroke="#3f8f4a" strokeWidth="3.2" fill="none" strokeLinecap="round" />
              <ellipse cx={x + (i % 2 ? 5 : -5)} cy={y + 14} rx="3.4" ry="11" fill="#8a5a34" />
            </g>
          ))}
        </symbol>
        <symbol id="wl-lamp" viewBox="0 0 50 150">
          <ellipse cx="25" cy="144" rx="14" ry="4" fill="#000" opacity="0.28" />
          <rect x="22" y="40" width="6" height="104" fill="#3a2a1a" />
          <rect x="16" y="130" width="18" height="14" fill="#4a3624" />
          <rect x="12" y="14" width="26" height="30" rx="4" fill="#2a1f14" />
          <rect x="16" y="18" width="18" height="22" rx="3" fill="#ffd36a" />
          <path d="M10 14 L25 2 L40 14Z" fill="#2a1f14" />
          <circle cx="25" cy="29" r="26" fill="#ffd36a" opacity="0.2" />
        </symbol>
        <symbol id="wl-bench" viewBox="0 0 150 90">
          <ellipse cx="75" cy="82" rx="62" ry="6" fill="#000" opacity="0.28" />
          <rect x="14" y="52" width="10" height="28" fill="#4a3320" />
          <rect x="126" y="52" width="10" height="28" fill="#4a3320" />
          <rect x="8" y="44" width="134" height="12" rx="3" fill="#a8763f" />
          <rect x="8" y="44" width="134" height="4" rx="2" fill="#c89256" />
          <rect x="10" y="14" width="130" height="10" rx="3" fill="#8f6232" />
          <rect x="10" y="28" width="130" height="10" rx="3" fill="#8f6232" />
          <rect x="18" y="12" width="8" height="36" fill="#6b4724" />
          <rect x="124" y="12" width="8" height="36" fill="#6b4724" />
        </symbol>
        <symbol id="wl-sign" viewBox="0 0 90 130">
          <ellipse cx="45" cy="124" rx="24" ry="5" fill="#000" opacity="0.28" />
          <rect x="40" y="30" width="10" height="96" fill="#5a3d22" />
          <path d="M6 22 H62 L74 34 L62 46 H6Z" fill="#b58348" />
          <path d="M6 22 H62 L74 34 H6Z" fill="#cf9a5c" />
          <path d="M16 62 H82 V84 H28 L16 73Z" fill="#a8763f" />
          <path d="M14 34 H54 M26 73 H70" stroke="#4a3320" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </symbol>
        <symbol id="wl-stump" viewBox="0 0 80 60">
          <ellipse cx="40" cy="54" rx="32" ry="5" fill="#000" opacity="0.28" />
          <path d="M12 52 L16 22 H64 L68 52Z" fill="#7a5632" />
          <ellipse cx="40" cy="22" rx="24" ry="8" fill="#c79a62" />
          <ellipse cx="40" cy="22" rx="14" ry="4.5" fill="none" stroke="#9c733f" strokeWidth="1.5" />
          <ellipse cx="22" cy="48" rx="10" ry="4" fill="#4b9248" opacity="0.85" />
        </symbol>
      </defs>
    </svg>
  );
}

function Plaza() {
  return (
    <g transform={`translate(${PLAZA.x} ${PLAZA.y})`}>
      <ellipse cx="0" cy="12" rx={PLAZA.r + 18} ry={(PLAZA.r + 18) * 0.82} fill="#6a5a3f" />
      <ellipse cx="0" cy="0" rx={PLAZA.r} ry={PLAZA.r * 0.82} fill="#d9c9a0" />
      <ellipse cx="0" cy="0" rx={PLAZA.r * 0.86} ry={PLAZA.r * 0.7} fill="#cdbb8d" />
      {GRASS.cobbles.map((c, i) => (
        <ellipse key={i} cx={c.x - PLAZA.x} cy={c.y - PLAZA.y} rx="9" ry="6" fill={i % 2 ? "#b8a67a" : "#e6d8b0"} opacity="0.8" />
      ))}
      <ellipse cx="0" cy="18" rx="74" ry="52" fill="#4a5560" />
      <ellipse cx="0" cy="8" rx="74" ry="52" fill="#aab4bd" />
      <ellipse cx="0" cy="8" rx="62" ry="42" fill="#7ec7e0" />
      <ellipse cx="0" cy="8" rx="62" ry="42" fill="#bfeaf6" opacity="0.4" className="wl-sparkle" />
      <ellipse cx="0" cy="8" rx="40" ry="26" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" className="wl-rip" />
      <ellipse cx="0" cy="8" rx="52" ry="34" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" className="wl-rip" style={{ ["--rd" as string]: "1.6s" }} />
      <rect x="-11" y="-52" width="22" height="62" rx="5" fill="#9aa5ae" />
      <rect x="-11" y="-52" width="10" height="62" rx="5" fill="#c3ccd3" />
      <ellipse cx="0" cy="-54" rx="30" ry="11" fill="#aab4bd" />
      <ellipse cx="0" cy="-56" rx="24" ry="8" fill="#7ec7e0" />
      <path d="M0 -62 C-6 -86 -30 -80 -34 -50 M0 -62 C6 -86 30 -80 34 -50 M0 -62 V-92" stroke="#d8f3fb" strokeWidth="3.4" fill="none" strokeLinecap="round" className="wl-water" />
      <circle cx="0" cy="-94" r="6" fill="#ffffff" opacity="0.8" className="wl-sparkle" />
    </g>
  );
}

function Gate() {
  return (
    <g transform="translate(150 2090)">
      <ellipse cx="0" cy="12" rx="170" ry="22" fill="#000" opacity="0.25" />
      <rect x="-150" y="-190" width="26" height="206" fill="#6b4724" />
      <rect x="124" y="-190" width="26" height="206" fill="#6b4724" />
      <rect x="-150" y="-190" width="10" height="206" fill="#8f6232" />
      <rect x="124" y="-190" width="10" height="206" fill="#8f6232" />
      <path d="M-176 -176 Q0 -250 176 -176 L176 -150 Q0 -222 -176 -150Z" fill="#7a5230" />
      <path d="M-176 -176 Q0 -250 176 -176 L176 -166 Q0 -240 -176 -166Z" fill="#a8763f" />
      <rect x="-74" y="-212" width="148" height="40" rx="8" fill="#3b2a18" />
      <rect x="-68" y="-206" width="136" height="28" rx="6" fill="#d9b574" />
      <path d="M-50 -192 H50" stroke="#5a3d22" strokeWidth="6" strokeLinecap="round" />
      <circle cx="-110" cy="-120" r="16" fill="#ffd36a" opacity="0.35" className="wl-sparkle" />
      <circle cx="110" cy="-120" r="16" fill="#ffd36a" opacity="0.35" className="wl-sparkle" />
      <rect x="-118" y="-136" width="12" height="30" rx="3" fill="#ffd36a" />
      <rect x="106" y="-136" width="12" height="30" rx="3" fill="#ffd36a" />
    </g>
  );
}

function Bridge() {
  return (
    <g transform="translate(3000 520) rotate(-30)">
      <rect x="-124" y="-52" width="248" height="104" rx="8" fill="#3b2a18" opacity="0.4" transform="translate(0 14)" />
      <rect x="-120" y="-44" width="240" height="88" rx="6" fill="#8f6232" />
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x={-116 + i * 18.4} y="-42" width="15" height="84" rx="2" fill={i % 2 ? "#a8763f" : "#b98445"} />
      ))}
      <rect x="-124" y="-56" width="248" height="12" rx="4" fill="#5a3d22" />
      <rect x="-124" y="44" width="248" height="12" rx="4" fill="#5a3d22" />
      {[-110, -55, 0, 55, 110].map((x) => (
        <g key={x}>
          <rect x={x - 5} y="-72" width="10" height="26" fill="#6b4724" />
          <rect x={x - 5} y="46" width="10" height="26" fill="#6b4724" />
        </g>
      ))}
    </g>
  );
}

function Tree() {
  return (
    <g transform="translate(3390 300)">
      <ellipse cx="0" cy="10" rx="200" ry="34" fill="#0b2a12" opacity="0.32" />
      <path d="M-46 8 C-30 -60 -40 -150 -26 -220 L26 -220 C40 -150 30 -60 48 8Z" fill="#6f4e2b" />
      <path d="M10 8 C14 -60 12 -150 22 -220 L26 -220 C40 -150 30 -60 48 8Z" fill="#4e3319" />
      <path d="M-46 8 q-30 10 -60 4 M48 8 q30 10 64 2" stroke="#4e3319" strokeWidth="14" fill="none" strokeLinecap="round" />
      <circle cx="-120" cy="-250" r="110" fill="#2c7a38" />
      <circle cx="130" cy="-250" r="116" fill="#2c7a38" />
      <circle cx="0" cy="-300" r="150" fill="#348a40" />
      <circle cx="-40" cy="-340" r="110" fill="#4aa64e" />
      <circle cx="50" cy="-370" r="70" fill="#6cc364" />
      <circle cx="-60" cy="-390" r="40" fill="#92dc84" opacity="0.9" />
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={-150 + (i * 53) % 300} cy={-330 + ((i * 97) % 160)} r="5" fill="#fff6a8" className="wl-sparkle" style={{ ["--rd" as string]: `${(i % 6) * 0.5}s` }} />
      ))}
    </g>
  );
}

function Ground() {
  return (
    <svg viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} width={WORLD_W} height={WORLD_H} className="absolute top-0 left-0" aria-hidden>
      <defs>
        <linearGradient id="wl-grass" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#7cc56a" />
          <stop offset="0.5" stopColor="#6bb85d" />
          <stop offset="1" stopColor="#58a255" />
        </linearGradient>
        <linearGradient id="wl-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fd4e4" />
          <stop offset="1" stopColor="#1f7fa5" />
        </linearGradient>
        <linearGradient id="wl-stream" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a6e6f2" />
          <stop offset="1" stopColor="#4aa9c9" />
        </linearGradient>
        <radialGradient id="wl-hill" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#a5aaa0" />
          <stop offset="1" stopColor="#6e7a6f" />
        </radialGradient>
        <radialGradient id="wl-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6c8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff6c8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={WORLD_W} height={WORLD_H} fill="url(#wl-grass)" />
      {GRASS.blobs.map((b, i) => (
        <ellipse key={i} cx={b.x} cy={b.y} rx={b.rx} ry={b.ry} fill={BLOB[b.c]} opacity="0.2" />
      ))}
      <path d="M2200 0 H3600 V520 C3400 600 3100 520 2900 600 C2700 640 2500 520 2300 480 C2200 400 2160 200 2200 0Z" fill="url(#wl-hill)" opacity="0.55" />
      <path d="M2240 0 H3600 V420 C3380 480 3120 410 2920 480 C2720 520 2540 420 2340 380 C2260 300 2210 160 2240 0Z" fill="#8a948a" opacity="0.5" />
      <path d="M0 0 H1500 V860 C1260 960 960 900 700 960 C400 1020 160 940 0 980Z" fill="#2f7a3a" opacity="0.22" />
      <path d={STREAM_D} fill="none" stroke="#3b6a4a" strokeWidth="150" strokeLinecap="round" opacity="0.5" />
      <path d={STREAM_D} fill="none" stroke="#d9c9a0" strokeWidth="132" strokeLinecap="round" />
      <path d={STREAM_D} fill="none" stroke="url(#wl-stream)" strokeWidth="108" strokeLinecap="round" />
      <path d={STREAM_D} fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.7" className="wl-water" />
      <path d={STREAM_D} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.5" className="wl-water" style={{ strokeDashoffset: 40, transform: "translateX(20px)" }} />
      <ellipse cx={LAKE.x} cy={LAKE.y + 16} rx={LAKE.rx + 46} ry={LAKE.ry + 40} fill="#3b6a4a" opacity="0.45" />
      <ellipse cx={LAKE.x} cy={LAKE.y} rx={LAKE.rx + 40} ry={LAKE.ry + 30} fill="#e0cf9e" />
      <ellipse cx={LAKE.x} cy={LAKE.y} rx={LAKE.rx + 14} ry={LAKE.ry + 10} fill="#c9ba86" />
      <ellipse cx={LAKE.x} cy={LAKE.y} rx={LAKE.rx} ry={LAKE.ry} fill="url(#wl-lake)" />
      <ellipse cx={LAKE.x - 40} cy={LAKE.y - 40} rx={LAKE.rx * 0.74} ry={LAKE.ry * 0.66} fill="#8fe0ee" opacity="0.35" />
      <ellipse cx={LAKE.x + 60} cy={LAKE.y + 50} rx={LAKE.rx * 0.5} ry={LAKE.ry * 0.4} fill="#1f6f93" opacity="0.4" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ellipse key={i} cx={LAKE.x - 260 + i * 110} cy={LAKE.y - 60 + (i % 3) * 56} rx="54" ry="16" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.7" className="wl-rip" style={{ ["--rd" as string]: `${i * 0.9}s` }} />
      ))}
      {GRASS.lilies.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) scale(${l.s})`}>
          <ellipse cx="0" cy="0" rx="26" ry="9" fill="#3f9a4a" />
          <ellipse cx="-4" cy="-2" rx="18" ry="5" fill="#5bb757" />
          {l.f && <circle cx="6" cy="-6" r="6" fill="#f9a8d4" />}
        </g>
      ))}
      <g transform={`translate(${LAKE.x - LAKE.rx - 20} ${LAKE.y - 20})`}>
        <rect x="-140" y="-22" width="170" height="44" rx="4" fill="#8f6232" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-136 + i * 18.6} y="-20" width="15" height="40" rx="2" fill={i % 2 ? "#a8763f" : "#b98445"} />
        ))}
        {[-130, -70, -10, 20].map((x) => (
          <rect key={x} x={x - 4} y="18" width="8" height="20" fill="#4a3320" />
        ))}
      </g>
      <path d={PATH_D} fill="none" stroke="#6a5030" strokeWidth="132" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      <path d={PATH_D} fill="none" stroke="#b08e57" strokeWidth="118" strokeLinecap="round" strokeLinejoin="round" />
      <path d={PATH_D} fill="none" stroke="#d4b57c" strokeWidth="98" strokeLinecap="round" strokeLinejoin="round" />
      <path d={PATH_D} fill="none" stroke="#e3c98f" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      {GRASS.pebbles.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={p.s} ry={p.s * 0.7} fill={i % 3 ? "#9c8458" : "#f0e2b8"} opacity="0.85" />
      ))}
      <Plaza />
      {GRASS.tufts.map((t, i) => (
        <path key={i} d={`M${t.x - 6 * t.s} ${t.y} q2 -${12 * t.s} -1 -${18 * t.s} M${t.x} ${t.y} q0 -${16 * t.s} 3 -${22 * t.s} M${t.x + 6 * t.s} ${t.y} q-2 -${12 * t.s} 1 -${17 * t.s}`} stroke={i % 3 ? "#3f8f48" : "#8ccf6a"} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      ))}
      {GRASS.flowers.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y}) scale(${f.s})`}>
          <path d="M0 0 V8" stroke="#3f8f48" strokeWidth="1.6" />
          <circle cx="0" cy="0" r="4" fill={f.c} />
          <circle cx="0" cy="0" r="1.6" fill="#ffe27a" />
        </g>
      ))}
      <Bridge />
      <Gate />
      <Tree />
      {[[2400, 560], [1100, 420], [3200, 1500], [900, 1500], [2000, 1900]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="300" ry="190" fill="url(#wl-glow)" className="wl-ray" style={{ ["--rd" as string]: `${i * 1.3}s` }} />
      ))}
    </svg>
  );
}

const Props = memo(function Props() {
  return (
    <>
      {PROPS.map((p, i) => {
        const [w, h] = SIZE[p.k];
        const sc = p.s * (p.k === "pine" || p.k === "oak" || p.k === "birch" || p.k === "blossom" ? 1.25 : 1);
        return (
          <svg key={i} viewBox={`0 0 ${w} ${h}`} className="pointer-events-none absolute" style={{ left: p.x - (w * sc) / 2, top: p.y - h * sc * 0.97, width: w * sc, height: h * sc, zIndex: Math.round(p.y) }} aria-hidden>
            <use href={`#wl-${p.k}`} />
          </svg>
        );
      })}
    </>
  );
});

const Life = memo(function Life() {
  const bf = useMemo(() => {
    const r = rng(99);
    return Array.from({ length: 16 }, (_, i) => ({ x: 200 + r() * 3000, y: 900 + r() * 1100, d: 12 + r() * 10, dl: -r() * 12, c: ["#ffd84a", "#ff8fb4", "#8fd3ff", "#ffffff"][i % 4] }));
  }, []);
  const leaves = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 22 }, () => ({ x: 100 + r() * 1400, y: 100 + r() * 500, d: 8 + r() * 6, dl: -r() * 10, c: ["#d9a441", "#9fd05a", "#e07a3c"][Math.floor(r() * 3)] }));
  }, []);
  const clouds = useMemo(() => [[200, 1500, 120], [1400, 700, 160], [900, 1900, 180], [2200, 1100, 140]], []);
  return (
    <>
      {bf.map((b, i) => (
        <div key={i} className="wl-bf pointer-events-none absolute" style={{ left: b.x, top: b.y, zIndex: 2000, ["--bd" as string]: `${b.d}s`, ["--bdl" as string]: `${b.dl}s` }}>
          <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden>
            <g className="wl-wing">
              <ellipse cx="6" cy="6" rx="6" ry="5" fill={b.c} />
              <ellipse cx="16" cy="6" rx="6" ry="5" fill={b.c} />
              <ellipse cx="7" cy="12" rx="4" ry="3" fill={b.c} opacity="0.8" />
              <ellipse cx="15" cy="12" rx="4" ry="3" fill={b.c} opacity="0.8" />
            </g>
            <rect x="10.2" y="2" width="1.6" height="12" rx="0.8" fill="#2a1f14" />
          </svg>
        </div>
      ))}
      {leaves.map((l, i) => (
        <span key={i} className="wl-leaf pointer-events-none absolute h-2.5 w-1.5 rounded-[60%_0_60%_0]" style={{ left: l.x, top: l.y, zIndex: 2000, background: l.c, ["--ld" as string]: `${l.d}s`, ["--ldl" as string]: `${l.dl}s` }} />
      ))}
      {clouds.map(([x, y, w], i) => (
        <div key={i} className="pointer-events-none absolute" style={{ left: 0, top: y, width: WORLD_W, height: 260, zIndex: 3000 }}>
          <div className="wl-cloud absolute rounded-[50%] bg-[radial-gradient(ellipse,rgba(10,30,20,0.16),transparent_70%)]" style={{ left: x - 300, top: 0, width: w * 5, height: w * 2, ["--cd" as string]: `${120 + i * 30}s`, ["--cdl" as string]: `${-i * 40}s` }} />
        </div>
      ))}
    </>
  );
});

export const WildWorld = memo(function WildWorld() {
  return (
    <>
      <Symbols />
      <Ground />
      <Props />
      <Life />
    </>
  );
});

export const MINI = { path: PATH_D, stream: STREAM_D };
