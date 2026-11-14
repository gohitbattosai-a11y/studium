import { useId } from "react";
import type { FishPattern, FishShape } from "@/lib/domain/city";

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

const SPOTS = [[0.3, -0.25], [0.45, 0.15], [0.6, -0.1], [0.72, 0.22], [0.2, 0.1], [0.55, -0.32], [0.8, -0.18], [0.38, 0.3], [0.66, 0.02], [0.5, -0.02], [0.28, 0.24], [0.86, 0.05]];
const PATCHES = [[0.28, -0.1, 0.17, 0.22, 0.3], [0.55, 0.05, 0.2, 0.26, -0.2], [0.78, -0.08, 0.1, 0.16, 0.5], [0.42, -0.24, 0.1, 0.12, 0.1]];

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

export function shade(c: string, f: number) {
  const [r, g, b] = rgb(c);
  const t = f < 0 ? 0 : 255;
  const p = Math.abs(f);
  return hex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p);
}

export function mix(a: string, b: string, t: number) {
  const x = rgb(a);
  const y = rgb(b);
  return hex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
}

function star(cx: number, cy: number, r: number) {
  return `M${cx},${cy - r} L${cx + r * 0.3},${cy - r * 0.3} L${cx + r},${cy} L${cx + r * 0.3},${cy + r * 0.3} L${cx},${cy + r} L${cx - r * 0.3},${cy + r * 0.3} L${cx - r},${cy} L${cx - r * 0.3},${cy - r * 0.3} Z`;
}

export default function FishArt({
  shape,
  colors,
  pattern,
  silhouette = false,
  swim = false,
  className,
}: {
  shape: FishShape;
  colors: string[];
  pattern: FishPattern;
  silhouette?: boolean;
  swim?: boolean;
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
  const back = shade(c1, -0.32);
  const belly = shade(c2, 0.18);
  const dark = shade(c3, -0.45);
  const eel = shape === "anguilla";
  const body = [
    `M${x1},${cy}`,
    `C${x1 - L * 0.06},${cy - H * (1 - 0.5 * sp.snout)} ${x1 - L * 0.35},${cy - H * 1.05} ${x1 - L * 0.55},${cy - H * 0.95}`,
    `C${x1 - L * 0.78},${cy - H * 0.85} ${x0 + L * 0.08},${cy - H * 0.4} ${x0},${cy - H * 0.28}`,
    `L${x0},${cy + H * 0.28}`,
    `C${x0 + L * 0.08},${cy + H * 0.4} ${x1 - L * 0.78},${cy + H * 0.85} ${x1 - L * 0.55},${cy + H * 0.95}`,
    `C${x1 - L * 0.35},${cy + H * 1.05} ${x1 - L * 0.06},${cy + H * (1 - 0.5 * sp.snout)} ${x1},${cy}Z`,
  ].join(" ");
  const tl = sp.tail;
  const tail = `M${x0 + 4},${cy - H * 0.26} Q${x0 - tl * 0.3},${cy - tl * 0.8} ${x0 - tl},${cy - tl * 0.7} Q${x0 - tl * 0.55},${cy - tl * 0.18} ${x0 - tl * 0.62},${cy} Q${x0 - tl * 0.55},${cy + tl * 0.18} ${x0 - tl},${cy + tl * 0.7} Q${x0 - tl * 0.3},${cy + tl * 0.8} ${x0 + 4},${cy + H * 0.26}Z`;
  const tailRays = [-0.62, -0.34, -0.1, 0.1, 0.34, 0.62].map((f) => `M${x0 + 2},${cy + f * H * 0.3} L${x0 - tl * (0.95 - Math.abs(f) * 0.25)},${cy + f * tl}`).join(" ");
  const dxa = x1 - L * 0.66;
  const dxb = x1 - L * 0.3;
  const dTop = cy - H - sp.dorsal * 1.8;
  const dorsal = `M${dxa},${cy - H * 0.92} Q${dxa + 4},${dTop - 2} ${(dxa + dxb) / 2},${dTop} Q${dxb - 4},${dTop + 6} ${dxb},${cy - H * 1.0}Z`;
  const dorsalRays = [0.12, 0.3, 0.48, 0.66, 0.84].map((f) => `M${dxa + (dxb - dxa) * f},${cy - H * 0.97} L${dxa + (dxb - dxa) * (f - 0.08) + 2},${dTop + 3 + Math.abs(f - 0.4) * 10}`).join(" ");
  const pxa = x1 - L * 0.5;
  const pxb = x1 - L * 0.3;
  const pelvic = `M${pxa},${cy + H * 0.95} Q${(pxa + pxb) / 2 - 4},${cy + H + sp.pelvic * 1.6} ${pxb},${cy + H * 1.0}Z`;
  const axa = x1 - L * 0.8;
  const axb = x1 - L * 0.62;
  const anal = `M${axa},${cy + H * 0.8} Q${(axa + axb) / 2 - 3},${cy + H + sp.pelvic * 1.2} ${axb},${cy + H * 0.9}Z`;
  const gx = x1 - L * 0.26;
  const pecX = gx - 2;
  const pecY = cy + H * 0.28;
  const pec = `M${pecX},${pecY} Q${pecX - 8},${pecY + 2 + sp.pelvic * 0.5} ${pecX - 14 - sp.pelvic * 0.5},${pecY + 7 + sp.pelvic * 0.5} Q${pecX - 5},${pecY + 7} ${pecX + 1},${pecY + 3}Z`;
  const eye = { x: x1 - L * 0.14, y: cy - H * 0.2, r: Math.max(2.4, H * 0.21) };
  const spikes = sp.spikes
    ? Array.from({ length: 7 }, (_, i) => {
        const sx = x1 - L * (0.22 + i * 0.09);
        return `M${sx},${cy - H * 1.0} L${sx - 3},${cy - H - 11 - (i % 2) * 4} L${sx - 8},${cy - H * 0.97}Z`;
      }).join(" ")
    : "";
  const finFill = silhouette ? c1 : mix(c3, c1, 0.25);
  const finStroke = silhouette ? c1 : dark;
  const gwid = x1 - x0;
  const rows = Math.max(3, Math.round(sp.h / 9));

  return (
    <svg viewBox="0 0 160 80" className={className} role="img" aria-hidden>
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={back} />
          <stop offset="0.28" stopColor={c1} />
          <stop offset="0.6" stopColor={mix(c1, c2, 0.55)} />
          <stop offset="1" stopColor={belly} />
        </linearGradient>
        <linearGradient id={`${uid}h`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id={`${uid}f`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={finFill} stopOpacity="0.55" />
          <stop offset="1" stopColor={finFill} stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id={`${uid}e`} cx="0.4" cy="0.4" r="0.7">
          <stop offset="0" stopColor={silhouette ? c1 : shade(c3, 0.45)} />
          <stop offset="1" stopColor={silhouette ? c1 : shade(c3, -0.25)} />
        </radialGradient>
        <clipPath id={`${uid}c`}>
          <path d={body} />
        </clipPath>
        <pattern id={`${uid}s`} width="8" height="6" patternUnits="userSpaceOnUse">
          <path d="M0,6 Q4,-1.5 8,6" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="0.8" />
          <path d="M-4,3 Q0,-1.5 4,3" fill="none" stroke="#000000" strokeOpacity="0.28" strokeWidth="0.6" />
        </pattern>
        <filter id={`${uid}b`} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {pat === "glow" && <path d={body} fill={c3} opacity="0.7" filter={`url(#${uid}b)`} />}
      <g className={swim ? "ct-tail" : undefined}>
        <path d={tail} fill={`url(#${uid}f)`} stroke={finStroke} strokeOpacity="0.35" strokeWidth="0.6" />
        {!silhouette && <path d={tailRays} stroke={dark} strokeOpacity="0.32" strokeWidth="0.55" fill="none" />}
      </g>
      <path d={dorsal} fill={`url(#${uid}f)`} stroke={finStroke} strokeOpacity="0.35" strokeWidth="0.6" />
      {!silhouette && !eel && <path d={dorsalRays} stroke={dark} strokeOpacity="0.32" strokeWidth="0.55" fill="none" />}
      <path d={pelvic} fill={`url(#${uid}f)`} stroke={finStroke} strokeOpacity="0.35" strokeWidth="0.6" />
      <path d={anal} fill={`url(#${uid}f)`} stroke={finStroke} strokeOpacity="0.3" strokeWidth="0.6" />
      {spikes && <path d={spikes} fill={silhouette ? c1 : shade(c3, -0.15)} stroke={finStroke} strokeOpacity="0.4" strokeWidth="0.5" />}
      {sp.whiskers && !silhouette && (
        <g stroke={shade(c2, -0.3)} strokeWidth="1.3" fill="none" strokeLinecap="round">
          <path d={`M${x1 - 3},${cy + H * 0.1} q8,4 4,13`} />
          <path d={`M${x1 - 8},${cy + H * 0.25} q7,7 1,14`} />
          <path d={`M${x1 - 3},${cy - H * 0.1} q9,-2 8,-10`} />
          <path d={`M${x1 - 12},${cy + H * 0.3} q3,9 -4,13`} />
        </g>
      )}
      <path d={body} fill={`url(#${uid}g)`} />
      {!silhouette && <path d={body} fill={`url(#${uid}h)`} />}
      <g clipPath={`url(#${uid}c)`}>
        {!silhouette && !eel && <rect x={x0} y={cy - H * 1.1} width={gwid} height={H * 2.2} fill={`url(#${uid}s)`} opacity={pat === "scales" ? 0.5 : 0.16} />}
        {!silhouette && <path d={`M${x0},${cy + H * 0.55} Q${x0 + L * 0.5},${cy + H * 1.05} ${x1},${cy + H * 0.3} L${x1},${cy + H * 1.3} L${x0},${cy + H * 1.3}Z`} fill={belly} opacity="0.55" />}
        {pat === "stripes" &&
          Array.from({ length: rows + 1 }, (_, i) => 0.24 + i * (0.5 / rows)).map((f, i) => (
            <path key={i} d={`M${x1 - L * f},${cy - H * 1.2} q-4,${H * 1.2} 0,${H * 2.4}`} stroke={c3} strokeOpacity="0.6" strokeWidth={4.2 - (i % 2) * 1.2} fill="none" strokeLinecap="round" />
          ))}
        {pat === "spots" &&
          SPOTS.map(([fx, fy], i) => (
            <g key={i}>
              <circle cx={x1 - L * fx} cy={cy + fy * H * 2} r={1.7 + (i % 3) * 0.7} fill={c3} opacity="0.85" />
              <circle cx={x1 - L * fx} cy={cy + fy * H * 2} r={0.7 + (i % 3) * 0.3} fill="#ffffff" opacity="0.35" />
            </g>
          ))}
        {pat === "patches" && PATCHES.map(([fx, fy, rx, ry, rot], i) => <ellipse key={i} cx={x1 - L * fx} cy={cy + fy * H * 2} rx={L * rx * 0.5} ry={H * ry * 2} fill={c3} opacity="0.88" transform={`rotate(${rot * 40} ${x1 - L * fx} ${cy + fy * H * 2})`} />)}
        {pat === "lateral" && (
          <>
            <rect x={x0} y={cy - H * 0.14} width={L * 0.86} height={Math.max(3, H * 0.3)} rx="1.5" fill={c3} opacity="0.7" />
            <rect x={x0} y={cy - H * 0.14} width={L * 0.86} height={Math.max(1, H * 0.08)} fill="#ffffff" opacity="0.35" />
          </>
        )}
        {pat === "glow" && SPOTS.map(([fx, fy], i) => <circle key={i} cx={x1 - L * fx} cy={cy + fy * H * 1.6} r={1.9} fill="#ffffff" opacity="0.92" />)}
        {pat === "glow" && Array.from({ length: 9 }, (_, i) => <circle key={`p${i}`} cx={x1 - L * (0.22 + i * 0.07)} cy={cy + H * 0.62} r="1.2" fill={c3} />)}
        {pat === "stars" &&
          [[0.3, -0.2, 4], [0.5, 0.2, 5], [0.65, -0.15, 3.4], [0.4, 0.05, 2.6], [0.75, 0.18, 3], [0.56, -0.3, 2], [0.2, 0.2, 2.2]].map(([fx, fy, r], i) => <path key={i} d={star(x1 - L * fx, cy + fy * H * 2, r)} fill={c3} />)}
        {!silhouette && <path d={`M${x1 - L * 0.22},${cy - H * 0.05} Q${x1 - L * 0.55},${cy - H * 0.1} ${x0},${cy - H * 0.04}`} stroke="#ffffff" strokeOpacity="0.22" strokeWidth="0.7" strokeDasharray="1.6 1.4" fill="none" />}
        {!silhouette && <path d={`M${x1 - L * 0.12},${cy - H * 0.8} Q${x1 - L * 0.4},${cy - H * 0.98} ${x1 - L * 0.62},${cy - H * 0.86}`} stroke="#ffffff" strokeOpacity="0.38" strokeWidth="1.2" strokeLinecap="round" fill="none" />}
      </g>
      {!silhouette && (
        <>
          <path d={body} fill="none" stroke={dark} strokeOpacity="0.3" strokeWidth="0.8" />
          <path d={`M${gx},${cy - H * 0.7} Q${gx - 5},${cy} ${gx},${cy + H * 0.7}`} fill="none" stroke="#000000" strokeOpacity="0.28" strokeWidth="1.2" />
          <path d={`M${gx + 3},${cy - H * 0.6} Q${gx - 2},${cy} ${gx + 3},${cy + H * 0.6}`} fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="0.8" />
          <path d={`M${x1 - 0.5},${cy + 0.6} Q${x1 - L * 0.05},${cy + H * 0.2} ${x1 - L * 0.11},${cy + H * 0.16}`} fill="none" stroke="#000000" strokeOpacity="0.45" strokeWidth="0.9" strokeLinecap="round" />
          <circle cx={x1 - L * 0.06} cy={cy - H * 0.14} r="0.8" fill="#000000" opacity="0.4" />
        </>
      )}
      <g className={swim ? "ct-fin" : undefined}>
        <path d={pec} fill={`url(#${uid}f)`} stroke={finStroke} strokeOpacity="0.4" strokeWidth="0.6" />
        {!silhouette && <path d={`M${pecX - 1},${pecY + 1} l-10,5 M${pecX},${pecY + 1.5} l-7,6 M${pecX + 1},${pecY + 2} l-4,5`} stroke={dark} strokeOpacity="0.35" strokeWidth="0.5" fill="none" />}
      </g>
      {!silhouette && (
        <>
          <circle cx={eye.x} cy={eye.y} r={eye.r + 0.9} fill="#000000" opacity="0.28" />
          <circle cx={eye.x} cy={eye.y} r={eye.r} fill={`url(#${uid}e)`} />
          <circle cx={eye.x + 0.5} cy={eye.y} r={eye.r * 0.58} fill="#05080c" />
          <circle cx={eye.x - eye.r * 0.28} cy={eye.y - eye.r * 0.32} r={eye.r * 0.26} fill="#ffffff" />
          <circle cx={eye.x + eye.r * 0.25} cy={eye.y + eye.r * 0.3} r={eye.r * 0.12} fill="#ffffff" opacity="0.7" />
        </>
      )}
    </svg>
  );
}
