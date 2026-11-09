export const WORLD_W = 2400;
export const WORLD_H = 1500;

export type Kind = "oak" | "pine" | "cherry";
export type Pt = { x: number; y: number; s?: number; t?: Kind };
export type House = { x: number; y: number; c: string; w?: string; smoke?: boolean };
type P2 = [number, number];

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const smooth = (p: P2[]) => {
  if (p.length < 3) return `M${p[0][0]} ${p[0][1]} L${p[p.length - 1][0]} ${p[p.length - 1][1]}`;
  let d = `M${p[0][0]} ${p[0][1]} L${(p[0][0] + p[1][0]) / 2} ${(p[0][1] + p[1][1]) / 2}`;
  for (let i = 1; i < p.length - 1; i++) d += ` Q${p[i][0]} ${p[i][1]} ${(p[i][0] + p[i + 1][0]) / 2} ${(p[i][1] + p[i + 1][1]) / 2}`;
  return `${d} L${p[p.length - 1][0]} ${p[p.length - 1][1]}`;
};

const segDist = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};

const lineDist = (p: P2[], x: number, y: number) => {
  let m = Infinity;
  for (let i = 0; i < p.length - 1; i++) m = Math.min(m, segDist(x, y, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]));
  return m;
};

const lineLen = (p: P2[]) => p.reduce((a, q, i) => (i ? a + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0), 0);

const lampsAlong = (p: P2[], gap: number, off: number) => {
  const out: P2[] = [];
  let acc = gap / 2;
  let side = 1;
  for (let i = 0; i < p.length - 1; i++) {
    const [ax, ay] = p[i];
    const [bx, by] = p[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    while (acc <= len) {
      out.push([Math.round(ax + ((bx - ax) * acc) / len + nx * off * side), Math.round(ay + ((by - ay) * acc) / len + ny * off * side)]);
      side = -side;
      acc += gap;
    }
    acc -= len;
  }
  return out;
};

const PLAZA: P2 = [1100, 740];

const MAIN: P2[] = [[366, 1098], [470, 1070], [640, 992], [900, 880], [1100, 764], [1350, 862], [1600, 946], [1780, 1060], [1900, 1132]];
const MUSEUM: P2[] = [[1100, 764], [930, 700], [760, 640], [620, 556]];
const POND: P2[] = [[1100, 764], [1290, 700], [1430, 640], [1500, 606]];
const FOREST: P2[] = [[1100, 764], [1200, 560], [1380, 360], [1600, 252], [1850, 252], [2010, 262]];
const DIG: P2[] = [[1100, 764], [1085, 920], [1055, 1090], [1050, 1228]];
const STREAM: P2[] = [[1700, 540], [1770, 700], [1690, 850], [1620, 960], [1530, 1070], [1500, 1250], [1560, 1530]];
const SHOP: P2[] = [[868, 902], [828, 960], [806, 1004]];
const ROADS = [MAIN, MUSEUM, POND, FOREST, DIG, SHOP];

const SPOTS: [number, number, number][] = [[620, 430, 200], [1650, 480, 250], [2080, 270, 170], [1900, 1150, 150], [360, 1070, 140], [1050, 1290, 120], [800, 1030, 100], [PLAZA[0], PLAZA[1] + 6, 150]];

const clear = (x: number, y: number, m: number) => SPOTS.every(([a, b, r]) => Math.hypot(x - a, y - b) > r) && ROADS.every((p) => lineDist(p, x, y) > m) && lineDist(STREAM, x, y) > m + 12;

const HOUSES: House[] = [
  { x: 560, y: 800, c: "#c2553f", smoke: true },
  { x: 250, y: 830, c: "#4d6fb3" },
  { x: 200, y: 1260, c: "#d29b3a", smoke: true },
  { x: 540, y: 1290, c: "#8a5ab0", w: "#efe3d0" },
  { x: 780, y: 1180, c: "#2f8f83", w: "#f1e9d6" },
  { x: 1380, y: 770, c: "#c2553f" },
  { x: 1330, y: 1190, c: "#4d6fb3", smoke: true },
  { x: 1720, y: 1350, c: "#d29b3a" },
  { x: 2260, y: 760, c: "#8a5ab0" },
  { x: 2240, y: 1050, c: "#2f8f83", smoke: true },
  { x: 2210, y: 1360, c: "#c2553f" },
  { x: 920, y: 300, c: "#d29b3a" },
  { x: 250, y: 300, c: "#4d6fb3", smoke: true },
  { x: 1280, y: 220, c: "#2f8f83" },
];

const houses = HOUSES.filter((h) => clear(h.x, h.y, 66)).sort((a, b) => a.y - b.y);

const scatter = (seed: number, tries: number, max: number, margin: number, gap: number, minY: number, avoid: P2[], avoidR: number) => {
  const r = rng(seed);
  const out: P2[] = [];
  for (let i = 0; i < tries && out.length < max; i++) {
    const x = 40 + r() * (WORLD_W - 80);
    const y = minY + r() * (WORLD_H - minY - 30);
    if (!clear(x, y, margin)) continue;
    if (avoid.some(([a, b]) => Math.hypot(x - a, y - b) < avoidR)) continue;
    if (out.some(([a, b]) => Math.hypot(x - a, y - b) < gap)) continue;
    out.push([Math.round(x), Math.round(y)]);
  }
  return out;
};

const housePts: P2[] = houses.map((h) => [h.x, h.y]);
const treePts = scatter(7, 1600, 190, 58, 66, 100, housePts, 62);
const rt = rng(11);
const trees: Pt[] = treePts
  .map(([x, y]) => {
    const q = rt();
    return { x, y, s: Math.round((0.85 + rt() * 0.55) * 100) / 100, t: (q < 0.42 ? "oak" : q < 0.78 ? "pine" : "cherry") as Kind };
  })
  .sort((a, b) => a.y - b.y);

const bushes = scatter(23, 700, 44, 40, 70, 80, [...housePts, ...treePts], 34);
const flowers = scatter(31, 700, 46, 36, 90, 80, [...housePts, ...treePts, ...bushes], 28);
const rp = rng(5);
const patches = Array.from({ length: 16 }, () => [Math.round(rp() * WORLD_W), Math.round(rp() * WORLD_H), 70 + Math.round(rp() * 70), 30 + Math.round(rp() * 30)]);

const lamps = ROADS.flatMap((p) => lampsAlong(p, 200, 30)).filter(([x, y]) => Math.hypot(x - PLAZA[0], y - PLAZA[1]) > 100 && SPOTS.slice(0, 7).every(([a, b]) => Math.hypot(x - a, y - b) > 70));

const rev = (p: P2[]) => [...p].reverse();

export const WORLD = {
  museum: [390, 230] as P2,
  pond: [1060, 200] as P2,
  moon: [240, 150] as P2,
  forest: [2080, 260, 1.15] as [number, number, number],
  stadium: [1900, 1150, 1.15] as [number, number, number],
  school: [360, 1060, 1.15] as [number, number, number],
  dig: [1050, 1290, 0.95] as [number, number, number],
  shop: [800, 1030, 0.95] as [number, number, number],
  plaza: PLAZA,
  roads: ROADS.map(smooth),
  stream: smooth(STREAM),
  bridge: { x: 1620, y: 955, r: 34 },
  fountain: PLAZA,
  stalls: [{ x: 982, y: 800, c: "#e11d48" }, { x: 1220, y: 806, c: "#2563eb" }],
  lamps,
  flowers,
  bushes,
  patches,
  trees,
  houses,
  walkers: [
    { path: smooth(MAIN), dur: Math.round(lineLen(MAIN) / 24), begin: 0, shirt: "#e11d48" },
    { path: smooth(rev(MAIN)), dur: Math.round(lineLen(MAIN) / 20), begin: 9, shirt: "#2563eb" },
    { path: smooth(MUSEUM), dur: Math.round(lineLen(MUSEUM) / 18), begin: 3, shirt: "#16a34a" },
    { path: smooth(rev(FOREST)), dur: Math.round(lineLen(FOREST) / 22), begin: 6, shirt: "#a855f7" },
    { path: smooth(DIG), dur: Math.round(lineLen(DIG) / 18), begin: 12, shirt: "#f59e0b" },
    { path: smooth(rev(POND)), dur: Math.round(lineLen(POND) / 18), begin: 1, shirt: "#0ea5e9" },
  ],
};
