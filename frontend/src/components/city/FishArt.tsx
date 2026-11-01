import { useId } from "react";
import type { FishPattern, FishShape } from "@/lib/city";

export interface FishSpec {
  len: number;
  h: number;
  tail: number;
  dorsal: number;
  pelvic: number;
  snout: number;
  whiskers: boolean;
  spikes: boolean;
}

export const SHAPES: Record<FishShape, FishSpec> = {
  fusi: { len: 100, h: 34, tail: 24, dorsal: 9, pelvic: 6, snout: 0.5, whiskers: false, spikes: false },
  tondo: { len: 88, h: 50, tail: 22, dorsal: 11, pelvic: 8, snout: 0.1, whiskers: false, spikes: false },
  lungo: { len: 112, h: 24, tail: 20, dorsal: 7, pelvic: 5, snout: 0.9, whiskers: false, spikes: false },
  anguilla: { len: 120, h: 13, tail: 14, dorsal: 4, pelvic: 2, snout: 0.7, whiskers: false, spikes: false },
  piatto: { len: 80, h: 62, tail: 26, dorsal: 14, pelvic: 12, snout: 0.2, whiskers: false, spikes: false },
  siluro: { len: 108, h: 32, tail: 22, dorsal: 6, pelvic: 5, snout: 0.05, whiskers: true, spikes: false },
  drago: { len: 114, h: 34, tail: 24, dorsal: 16, pelvic: 12, snout: 0.7, whiskers: true, spikes: true },
};

const SPOTS = [[0.3, -0.25], [0.45, 0.15], [0.6, -0.1], [0.72, 0.22], [0.2, 0.1], [0.55, -0.32], [0.8, -0.18], [0.38, 0.3], [0.66, 0.02]];
const PATCHES = [[0.28, -0.1, 0.17, 0.22], [0.55, 0.05, 0.2, 0.26], [0.78, -0.08, 0.1, 0.16]];

function star(cx: number, cy: number, r: number) {
  return `M${cx},${cy - r} L${cx + r * 0.3},${cy - r * 0.3} L${cx + r},${cy} L${cx + r * 0.3},${cy + r * 0.3} L${cx},${cy + r} L${cx - r * 0.3},${cy + r * 0.3} L${cx - r},${cy} L${cx - r * 0.3},${cy - r * 0.3} Z`;
}

export default function FishArt({
  shape,
  colors,
  pattern,
  silhouette = false,
  className,
}: {
  shape: FishShape;
  colors: string[];
  pattern: FishPattern;
  silhouette?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const sp = SHAPES[shape];
  const [c1, c2, c3] = silhouette ? ["#2A313A", "#232A32", "#2A313A"] : colors;
  const pat = silhouette ? "none" : pattern;
  const cy = 40;
  const x1 = 148;
  const x0 = x1 - sp.len;
  const H = sp.h / 2;
  const L = sp.len;
  const body = [
    `M${x1},${cy}`,
    `C${x1 - L * 0.06},${cy - H * (1 - 0.5 * sp.snout)} ${x1 - L * 0.35},${cy - H * 1.05} ${x1 - L * 0.55},${cy - H * 0.95}`,
    `C${x1 - L * 0.78},${cy - H * 0.85} ${x0 + L * 0.08},${cy - H * 0.4} ${x0},${cy - H * 0.28}`,
    `L${x0},${cy + H * 0.28}`,
    `C${x0 + L * 0.08},${cy + H * 0.4} ${x1 - L * 0.78},${cy + H * 0.85} ${x1 - L * 0.55},${cy + H * 0.95}`,
    `C${x1 - L * 0.35},${cy + H * 1.05} ${x1 - L * 0.06},${cy + H * (1 - 0.5 * sp.snout)} ${x1},${cy}Z`,
  ].join(" ");
  const tail = `M${x0 + 3},${cy - H * 0.25} Q${x0 - sp.tail * 0.4},${cy - sp.tail * 0.7} ${x0 - sp.tail},${cy - sp.tail * 0.6} Q${x0 - sp.tail * 0.6},${cy} ${x0 - sp.tail},${cy + sp.tail * 0.6} Q${x0 - sp.tail * 0.4},${cy + sp.tail * 0.7} ${x0 + 3},${cy + H * 0.25}Z`;
  const dxa = x1 - L * 0.66;
  const dxb = x1 - L * 0.3;
  const dorsal = `M${dxa},${cy - H * 0.92} Q${(dxa + dxb) / 2 - 6},${cy - H - sp.dorsal * 1.8} ${dxb},${cy - H * 1.0}Z`;
  const pxa = x1 - L * 0.5;
  const pxb = x1 - L * 0.3;
  const pelvic = `M${pxa},${cy + H * 0.95} Q${(pxa + pxb) / 2 - 4},${cy + H + sp.pelvic * 1.6} ${pxb},${cy + H * 1.0}Z`;
  const gx = x1 - L * 0.26;
  const eye = { x: x1 - L * 0.14, y: cy - H * 0.18, r: Math.max(2.2, H * 0.2) };
  const spikes = sp.spikes
    ? Array.from({ length: 6 }, (_, i) => {
        const sx = x1 - L * (0.3 + i * 0.1);
        return `M${sx},${cy - H * 1.0} L${sx - 4},${cy - H - 9 - (i % 2) * 3} L${sx - 8},${cy - H * 0.98}Z`;
      }).join(" ")
    : "";
  const finFill = silhouette ? c1 : c3;

  return (
    <svg viewBox="0 0 160 80" className={className} role="img" aria-hidden>
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="0.55" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <clipPath id={`${uid}c`}>
          <path d={body} />
        </clipPath>
        <pattern id={`${uid}s`} width="9" height="7" patternUnits="userSpaceOnUse">
          <path d="M0,7 Q4.5,-1 9,7" fill="none" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="1" />
        </pattern>
        <filter id={`${uid}b`} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {pat === "glow" && <path d={body} fill={c3} opacity="0.7" filter={`url(#${uid}b)`} />}
      <path d={tail} fill={finFill} opacity="0.9" />
      <path d={dorsal} fill={finFill} opacity="0.92" />
      <path d={pelvic} fill={finFill} opacity="0.85" />
      {spikes && <path d={spikes} fill={finFill} />}
      {sp.whiskers && !silhouette && (
        <g stroke={c2} strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d={`M${x1 - 3},${cy + H * 0.1} q8,4 4,13`} />
          <path d={`M${x1 - 8},${cy + H * 0.25} q7,7 1,14`} />
          <path d={`M${x1 - 3},${cy - H * 0.1} q9,-2 8,-10`} />
        </g>
      )}
      <path d={body} fill={`url(#${uid}g)`} />
      <g clipPath={`url(#${uid}c)`}>
        {pat === "stripes" &&
          [0.28, 0.42, 0.56, 0.7].map((f) => <rect key={f} x={x1 - L * f} y={cy - H * 1.2} width="5" height={H * 2.4} fill={c3} opacity="0.55" transform={`skewX(-8)`} />)}
        {pat === "spots" && SPOTS.map(([fx, fy], i) => <circle key={i} cx={x1 - L * fx} cy={cy + fy * H * 2} r={1.6 + (i % 3) * 0.7} fill={c3} opacity="0.8" />)}
        {pat === "patches" && PATCHES.map(([fx, fy, rx, ry], i) => <ellipse key={i} cx={x1 - L * fx} cy={cy + fy * H * 2} rx={L * rx * 0.5} ry={H * ry * 2} fill={c3} opacity="0.85" />)}
        {pat === "scales" && <rect x={x0} y={cy - H * 1.1} width={L} height={H * 2.2} fill={`url(#${uid}s)`} />}
        {pat === "lateral" && <rect x={x0} y={cy - H * 0.12} width={L * 0.82} height={Math.max(2.5, H * 0.22)} fill={c3} opacity="0.75" />}
        {pat === "glow" && SPOTS.map(([fx, fy], i) => <circle key={i} cx={x1 - L * fx} cy={cy + fy * H * 1.6} r={1.8} fill="#ffffff" opacity="0.9" />)}
        {pat === "stars" && [[0.3, -0.2, 4], [0.5, 0.2, 5], [0.65, -0.15, 3.4], [0.4, 0.05, 2.6], [0.75, 0.18, 3]].map(([fx, fy, r], i) => <path key={i} d={star(x1 - L * fx, cy + fy * H * 2, r)} fill={c3} />)}
      </g>
      <path d={`M${gx},${cy - H * 0.65} Q${gx - 5},${cy} ${gx},${cy + H * 0.65}`} fill="none" stroke="#000000" strokeOpacity={silhouette ? 0 : 0.25} strokeWidth="1.3" />
      {!silhouette && (
        <>
          <circle cx={eye.x} cy={eye.y} r={eye.r} fill="#ffffff" />
          <circle cx={eye.x + 0.6} cy={eye.y} r={eye.r * 0.55} fill="#0b0f14" />
        </>
      )}
    </svg>
  );
}
