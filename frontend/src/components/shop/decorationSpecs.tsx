export type Shape = "dot" | "star" | "heart" | "petal" | "shard" | "bolt";
export type Spin = "slow" | "fast" | "rev" | "none";

export interface RingSpec {
  r: number;
  color?: string;
  width?: number;
  dash?: string;
  opacity?: number;
  spin?: Spin;
  segments?: string[];
}

export interface OrbitSpec {
  shape: Shape;
  count: number;
  radius: number;
  size: number;
  colors: string[];
  spin?: Spin;
  twinkle?: boolean;
  flicker?: boolean;
}

export interface DecorationSpec {
  rings?: RingSpec[];
  orbits?: OrbitSpec[];
}

export const SPECS: Record<string, DecorationSpec> = {
  "ghiaccio-cristalli": {
    rings: [
      { r: 31.5, color: "#bae6fd", width: 1.2, opacity: 0.85 },
      { r: 35, color: "#e0f2fe", width: 0.8, dash: "1 5", spin: "rev" },
    ],
    orbits: [
      { shape: "shard", count: 10, radius: 37, size: 1.5, colors: ["#e0f2fe", "#7dd3fc", "#bae6fd"], spin: "slow" },
      { shape: "star", count: 6, radius: 43, size: 0.7, colors: ["#ffffff"], spin: "rev", twinkle: true },
    ],
  },
  "fulmine-elettrico": {
    rings: [{ r: 30.5, color: "#facc15", width: 1.4, dash: "6 3 2 3", spin: "fast" }],
    orbits: [
      { shape: "bolt", count: 6, radius: 37, size: 1.5, colors: ["#fde047", "#67e8f9"], spin: "fast", flicker: true },
      { shape: "dot", count: 8, radius: 43, size: 0.7, colors: ["#67e8f9"], spin: "rev", twinkle: true },
    ],
  },
  sakura: {
    rings: [{ r: 31, color: "#f9a8d4", width: 1, opacity: 0.7 }],
    orbits: [
      { shape: "petal", count: 9, radius: 37, size: 1.5, colors: ["#fbcfe8", "#f9a8d4", "#f472b6"], spin: "slow" },
      { shape: "petal", count: 5, radius: 44, size: 1.1, colors: ["#fce7f3"], spin: "rev", twinkle: true },
    ],
  },
  cuori: {
    rings: [{ r: 31, color: "#fb7185", width: 1.2, opacity: 0.8 }],
    orbits: [
      { shape: "heart", count: 8, radius: 37, size: 1.4, colors: ["#fb7185", "#f43f5e", "#fda4af"], spin: "slow" },
      { shape: "heart", count: 5, radius: 44, size: 0.9, colors: ["#ffe4e6"], spin: "rev", twinkle: true },
    ],
  },
  "bolle-acqua": {
    rings: [
      { r: 31, color: "#67e8f9", width: 1, opacity: 0.7 },
      { r: 35, color: "#a5f3fc", width: 0.8, dash: "1 5", spin: "rev" },
    ],
    orbits: [
      { shape: "dot", count: 10, radius: 38, size: 1.3, colors: ["#22d3ee", "#38bdf8", "#a5f3fc"], spin: "slow", twinkle: true },
      { shape: "dot", count: 6, radius: 44, size: 0.8, colors: ["#ffffff"], spin: "rev", twinkle: true },
    ],
  },
  "veleno-tossico": {
    rings: [{ r: 31, color: "#84cc16", width: 1.6, dash: "5 3", spin: "fast" }],
    orbits: [
      { shape: "shard", count: 8, radius: 37, size: 1.4, colors: ["#a3e635", "#4d7c0f", "#bef264"], spin: "slow", flicker: true },
      { shape: "dot", count: 6, radius: 43, size: 0.9, colors: ["#d9f99d"], spin: "rev", twinkle: true },
    ],
  },
  "stelle-notte": {
    rings: [{ r: 32, width: 3, segments: ["#312e81", "#4338ca", "#6366f1", "#818cf8"], spin: "slow" }],
    orbits: [
      { shape: "star", count: 8, radius: 38, size: 1, colors: ["#fde68a", "#ffffff"], spin: "rev", twinkle: true },
      { shape: "star", count: 4, radius: 44, size: 1.4, colors: ["#fef08a"], spin: "slow" },
    ],
  },
  arcobaleno: {
    rings: [
      { r: 33, width: 4, segments: ["#ef4444", "#f97316", "#facc15", "#22c55e", "#06b6d4", "#6366f1", "#a855f7", "#ec4899"], spin: "slow" },
      { r: 38.5, color: "#ffffff", width: 0.6, dash: "1 6", opacity: 0.7, spin: "rev" },
    ],
  },
};

const SHAPES: Record<Shape, string> = {
  dot: "M0 -2 A2 2 0 1 1 0 2 A2 2 0 1 1 0 -2 Z",
  star: "M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z",
  heart: "M0 3 C-4 0 -4 -3 -2 -3.5 C-1 -3.8 0 -3 0 -2 C0 -3 1 -3.8 2 -3.5 C4 -3 4 0 0 3 Z",
  petal: "M0 -3.5 C3 -2 3 2 0 3.5 C-3 2 -3 -2 0 -3.5 Z",
  shard: "M0 -4.5 L1.6 0 L0 4.5 L-1.6 0 Z",
  bolt: "M1.5 -4.5 L-2 0.3 L0 0.3 L-1.5 4.5 L2.5 -0.8 L0.4 -0.8 Z",
};

const SPIN_CLASS: Record<Spin, string | undefined> = { slow: "dc-spin-slow", fast: "dc-spin", rev: "dc-spin-rev", none: undefined };

const polar = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.sin(a), -r * Math.cos(a)];
};

function Ring({ ring }: { ring: RingSpec }) {
  const spin = SPIN_CLASS[ring.spin ?? "none"];
  if (ring.segments) {
    const n = ring.segments.length;
    const gap = 3;
    return (
      <g className={spin}>
        {ring.segments.map((color, i) => {
          const [x0, y0] = polar(ring.r, (360 / n) * i + gap / 2);
          const [x1, y1] = polar(ring.r, (360 / n) * (i + 1) - gap / 2);
          return <path key={i} d={`M${x0.toFixed(2)} ${y0.toFixed(2)} A${ring.r} ${ring.r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`} fill="none" stroke={color} strokeWidth={ring.width ?? 2} strokeLinecap="round" opacity={ring.opacity ?? 1} />;
        })}
      </g>
    );
  }
  return <circle className={spin} r={ring.r} fill="none" stroke={ring.color ?? "#ffffff"} strokeWidth={ring.width ?? 1} strokeDasharray={ring.dash} strokeLinecap="round" opacity={ring.opacity ?? 1} />;
}

function Orbit({ orbit }: { orbit: OrbitSpec }) {
  const spin = SPIN_CLASS[orbit.spin ?? "slow"];
  return (
    <g className={spin}>
      {Array.from({ length: orbit.count }, (_, i) => {
        const angle = (360 / orbit.count) * i;
        const color = orbit.colors[i % orbit.colors.length];
        const cls = orbit.twinkle ? "dc-twinkle" : orbit.flicker ? "dc-flicker" : undefined;
        return (
          <g key={i} transform={`rotate(${angle}) translate(0 ${-orbit.radius})`}>
            <path className={cls} style={cls ? { animationDelay: `${-(i % 4) * 0.45}s` } : undefined} d={SHAPES[orbit.shape]} fill={color} transform={`scale(${orbit.size})`} />
          </g>
        );
      })}
    </g>
  );
}

export function SpecArt({ spec }: { spec: DecorationSpec }) {
  return (
    <g transform="translate(50 50)">
      {spec.rings?.map((ring, i) => (
        <Ring key={i} ring={ring} />
      ))}
      {spec.orbits?.map((orbit, i) => (
        <Orbit key={i} orbit={orbit} />
      ))}
    </g>
  );
}
