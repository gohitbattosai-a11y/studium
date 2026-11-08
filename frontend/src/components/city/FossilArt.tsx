import { useId, type ReactNode } from "react";
import type { FossilSpecies } from "@/lib/domain/fossils";
import "./fossil.css";

const INK = "#3d2f1c";
const pr = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type Pt = [number, number];
const cubic = (p: Pt[], t: number): Pt => {
  const m = 1 - t;
  return [m * m * m * p[0][0] + 3 * m * m * t * p[1][0] + 3 * m * t * t * p[2][0] + t * t * t * p[3][0], m * m * m * p[0][1] + 3 * m * m * t * p[1][1] + 3 * m * t * t * p[2][1] + t * t * t * p[3][1]];
};
const tangent = (p: Pt[], t: number): Pt => {
  const a = cubic(p, Math.max(0, t - 0.01));
  const b = cubic(p, Math.min(1, t + 0.01));
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
};
function taper(p: Pt[], w0: number, w1: number, pow = 1, n = 28) {
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const c = cubic(p, t);
    const d = tangent(p, t);
    const w = w1 + (w0 - w1) * Math.pow(1 - t, pow);
    L.push([c[0] - d[1] * w, c[1] + d[0] * w]);
    R.push([c[0] + d[1] * w, c[1] - d[0] * w]);
  }
  return `M${L.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("L")}L${R.reverse().map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("L")}Z`;
}
const along = (p: Pt[], t: number, off: number): Pt => {
  const c = cubic(p, t);
  const d = tangent(p, t);
  return [c[0] - d[1] * off, c[1] + d[0] * off];
};

function Bn({ d, w = 6 }: { d: string; w?: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + 3} />
      <path d={d} stroke="#f0e2bd" strokeWidth={w} />
      <path d={d} stroke="#fffaf0" strokeOpacity="0.7" strokeWidth={Math.max(1, w * 0.25)} transform="translate(-0.6 -1)" />
    </g>
  );
}

function Defs({ u }: { u: string }) {
  return (
    <defs>
      <linearGradient id={`${u}-bn`} x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#fff9e6" />
        <stop offset="0.45" stopColor="#ead9ae" />
        <stop offset="1" stopColor="#a58b58" />
      </linearGradient>
      <linearGradient id={`${u}-bd`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#d9c590" />
        <stop offset="1" stopColor="#7d6638" />
      </linearGradient>
      <linearGradient id={`${u}-rk`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#a6957a" />
        <stop offset="0.55" stopColor="#7d6e58" />
        <stop offset="1" stopColor="#4f4434" />
      </linearGradient>
      <radialGradient id={`${u}-am`} cx="0.38" cy="0.32" r="0.8">
        <stop offset="0" stopColor="#ffe9a0" />
        <stop offset="0.5" stopColor="#f2a926" />
        <stop offset="1" stopColor="#8a420a" />
      </radialGradient>
      <radialGradient id={`${u}-ge`} cx="0.5" cy="0.5" r="0.6">
        <stop offset="0" stopColor="#f6dcff" />
        <stop offset="0.45" stopColor="#a56cf5" />
        <stop offset="1" stopColor="#3b1d7a" />
      </radialGradient>
      <radialGradient id={`${u}-eg`} cx="0.36" cy="0.3" r="0.85">
        <stop offset="0" stopColor="#f7efd8" />
        <stop offset="0.6" stopColor="#d5c299" />
        <stop offset="1" stopColor="#8a7447" />
      </radialGradient>
      <filter id={`${u}-sh`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.38" />
      </filter>
    </defs>
  );
}

function Slab({ u, w = 1 }: { u: string; w?: number }) {
  return (
    <g>
      <path d="M22 54 Q30 22 78 24 L318 20 Q372 22 378 70 L384 238 Q380 280 330 280 L84 284 Q26 282 22 236Z" fill={`url(#${u}-rk)`} stroke="#2f271b" strokeWidth="4" />
      <path d="M30 60 Q36 32 80 32 L316 28 Q364 30 368 72" fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="3" />
      {[70, 112, 168, 214, 252].map((y, i) => (
        <path key={y} d={`M26 ${y} Q120 ${y + (i % 2 ? 7 : -6)} 210 ${y} T380 ${y + 2}`} fill="none" stroke="#000" strokeOpacity="0.12" strokeWidth="2" />
      ))}
      {Array.from({ length: 60 * w }, (_, i) => (
        <circle key={i} cx={34 + pr(i + 1) * 332} cy={38 + pr(i + 77) * 238} r={0.8 + pr(i + 9) * 2.2} fill={pr(i + 3) > 0.5 ? "#000" : "#fff"} fillOpacity={0.12 + pr(i + 5) * 0.12} />
      ))}
    </g>
  );
}

function Ammonite({ u }: { u: string }) {
  const cx = 196;
  const cy = 150;
  const r = (t: number) => 8.6 * Math.exp(0.2 * t);
  const P = (t: number, k = 1): string => `${(cx + r(t) * k * Math.cos(t)).toFixed(1)} ${(cy + r(t) * k * Math.sin(t)).toFixed(1)}`;
  const ts: number[] = [];
  for (let t = 0.6; t <= 12.4; t += 0.07) ts.push(t);
  const outline = `M${ts.map((t) => P(t)).join("L")}Z`;
  const ribs: ReactNode[] = [];
  for (let t = 3.6; t <= 12.35; t += 0.24) {
    const k = t < 6 ? 0.55 : 0.4;
    ribs.push(<path key={t} d={`M${P(t, k)} Q${P(t - 0.2, (k + 1) / 2 + 0.06)} ${P(t - 0.04)}`} fill="none" stroke="#4a3920" strokeOpacity="0.75" strokeWidth={1 + t * 0.12} strokeLinecap="round" />);
    ribs.push(<path key={`h${t}`} d={`M${P(t + 0.05, k + 0.02)} Q${P(t - 0.15, (k + 1) / 2 + 0.07)} ${P(t - 0.02, 0.98)}`} fill="none" stroke="#fff8df" strokeOpacity="0.55" strokeWidth={0.8 + t * 0.07} strokeLinecap="round" />);
  }
  return (
    <g filter={`url(#${u}-sh)`}>
      <path d={outline} fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d={`M${ts.map((t) => P(t)).join("L")}`} fill="none" stroke={INK} strokeWidth="2.4" />
      {ribs}
      <path d={`M${ts.filter((t) => t > 9.5).map((t) => P(t, 0.97)).join("L")}`} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx + 7} cy={cy} r="6" fill="#6b5630" stroke={INK} strokeWidth="2" />
    </g>
  );
}

function Trilobite({ u }: { u: string }) {
  const half = (
    <g>
      <path d="M200 38 C152 36 118 58 116 104 L104 120 L130 112 L200 112Z" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M166 68 C160 58 146 60 142 72 C150 80 160 80 166 68Z" fill="#241c10" stroke={INK} strokeWidth="2" />
      <path d="M150 70 L162 70 M148 74 L160 75" stroke="#f0e2bd" strokeWidth="1.2" />
      {Array.from({ length: 9 }, (_, i) => {
        const y = 112 + i * 14;
        const hw = 82 - i * 3.6;
        return (
          <g key={i}>
            <path d={`M200 ${y} L${200 - hw + 6} ${y + 2} Q${200 - hw - 3} ${y + 10} ${200 - hw + 2} ${y + 17} L200 ${y + 14}Z`} fill={i % 2 ? `url(#${u}-bd)` : `url(#${u}-bn)`} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
            <path d={`M${200 - 22} ${y + 2} Q${200 - hw * 0.6} ${y + 4} ${200 - hw + 6} ${y + 6}`} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.6" />
          </g>
        );
      })}
      <path d="M200 238 C170 240 140 250 132 272 C160 278 184 276 200 282" fill={`url(#${u}-bd)`} stroke={INK} strokeWidth="3" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M200 ${244 + i * 8} Q${170 - i * 8} ${248 + i * 8} ${150 - i * 4} ${262 + i * 3}`} fill="none" stroke={INK} strokeOpacity="0.7" strokeWidth="1.8" />
      ))}
    </g>
  );
  return (
    <g filter={`url(#${u}-sh)`}>
      {half}
      <g transform="translate(400 0) scale(-1 1)">{half}</g>
      <path d="M200 38 C214 40 226 60 224 84 C222 112 214 124 200 126 C186 124 178 112 176 84 C174 60 186 40 200 38Z" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="3" />
      <rect x="182" y="124" width="36" height="116" rx="14" fill={`url(#${u}-bd)`} stroke={INK} strokeWidth="2.6" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M184 ${130 + i * 12.4} Q200 ${136 + i * 12.4} 216 ${130 + i * 12.4}`} fill="none" stroke={INK} strokeWidth="1.8" />
      ))}
      {[190, 200, 210].map((x) => (
        <circle key={x} cx={x} cy="58" r="2.2" fill={INK} />
      ))}
    </g>
  );
}

function Brachiopod({ u }: { u: string }) {
  const rays: ReactNode[] = [];
  for (let i = 0; i < 17; i++) {
    const a = ((-72 + i * 9) * Math.PI) / 180;
    const x = 200 + Math.sin(a) * 118;
    const y = 238 - Math.cos(a) * 168;
    rays.push(<path key={i} d={`M200 236 Q${200 + Math.sin(a) * 60} ${236 - Math.cos(a) * 80} ${x} ${y}`} fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="2.4" />);
    rays.push(<path key={`h${i}`} d={`M201 234 Q${201 + Math.sin(a) * 60} ${234 - Math.cos(a) * 80} ${x + 1} ${y + 2}`} fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.4" />);
  }
  return (
    <g filter={`url(#${u}-sh)`}>
      <path d="M200 256 C112 236 70 160 104 102 Q200 28 296 102 C330 160 288 236 200 256Z" fill={`url(#${u}-bd)`} stroke={INK} strokeWidth="3.5" />
      <path d="M200 248 C124 230 88 164 116 110 Q200 46 284 110 C312 164 276 230 200 248Z" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="2.5" />
      {[0.82, 0.64, 0.46, 0.3].map((k, i) => (
        <path key={i} d={`M${200 - 92 * k} ${150 + 6 * i} Q200 ${30 + 100 * (1 - k)} ${200 + 92 * k} ${150 + 6 * i}`} fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="1.8" />
      ))}
      {rays}
      <path d="M176 246 Q200 270 224 246 Q200 236 176 246Z" fill={`url(#${u}-bd)`} stroke={INK} strokeWidth="2.6" />
      <circle cx="200" cy="250" r="5" fill="#241c10" />
    </g>
  );
}

function Tooth({ u }: { u: string }) {
  const edgeR = "M200 20 C226 76 268 130 296 176 C306 196 308 214 304 234";
  const edgeL = "M200 20 C174 76 132 130 104 176 C94 196 92 214 96 234";
  return (
    <g filter={`url(#${u}-sh)`}>
      <path d="M96 232 H304 Q316 262 270 282 Q236 268 200 274 Q164 268 130 282 Q84 262 96 232Z" fill={`url(#${u}-bd)`} stroke={INK} strokeWidth="3.5" />
      <path d="M200 20 C226 76 268 130 296 176 C306 196 308 214 304 234 L96 234 C92 214 94 196 104 176 C132 130 174 76 200 20Z" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M100 224 Q200 192 300 224 L304 238 Q200 208 96 238Z" fill="#6f5a33" stroke={INK} strokeWidth="2" />
      <path d="M200 46 C214 90 244 134 262 172 C270 188 272 200 270 212" fill="none" stroke="#fff" strokeOpacity="0.65" strokeWidth="9" strokeLinecap="round" />
      {[edgeR, edgeL].map((d) => (
        <g key={d} fill="none">
          <path d={d} stroke="#fff4d6" strokeWidth="5" strokeDasharray="1.6 3.4" />
          <path d={d} stroke={INK} strokeWidth="1.6" strokeDasharray="1.6 3.4" strokeDashoffset="2.5" />
        </g>
      ))}
      <path d="M170 262 q30 10 60 0" fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="2" />
    </g>
  );
}

function Fish({ u }: { u: string }) {
  const verts = Array.from({ length: 24 }, (_, i) => i);
  return (
    <g filter={`url(#${u}-sh)`}>
      <path d="M96 150 C120 120 200 112 290 140 L292 160 C200 190 120 184 96 150Z" fill="#000" fillOpacity="0.18" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={`d${i}`} d={`M${176 + i * 10} 128 L${166 + i * 9} ${84 - Math.sin(i / 2.2) * 14}`} stroke="#f0e2bd" strokeWidth="2" strokeLinecap="round" />
      ))}
      <path d="M170 124 Q215 74 262 130" fill="none" stroke={INK} strokeWidth="2" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={`a${i}`} d={`M${214 + i * 8} 170 L${206 + i * 8} ${208 + Math.sin(i / 2) * 6}`} stroke="#f0e2bd" strokeWidth="2" strokeLinecap="round" />
      ))}
      <path d="M290 150 L352 100 Q344 150 352 204 Z" fill={`url(#${u}-bd)`} fillOpacity="0.55" stroke={INK} strokeWidth="2.5" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={`t${i}`} d={`M292 ${150 + (i - 4) * 2} L${348} ${150 + (i - 4) * 12}`} stroke="#f0e2bd" strokeWidth="1.8" strokeLinecap="round" />
      ))}
      {verts.map((i) => {
        const x = 138 + i * 6.8;
        const h = 9 - i * 0.22;
        return <rect key={i} x={x} y={150 + Math.sin(i * 0.1) * 2 - h / 2} width="5.6" height={h} rx="2" fill="#f4e8c8" stroke={INK} strokeWidth="1.4" />;
      })}
      {Array.from({ length: 13 }, (_, i) => {
        const x = 150 + i * 7.4;
        return <Bn key={i} d={`M${x} 150 q-6 ${26 - i * 0.9} -14 ${34 - i}M${x} 152 q-6 -${24 - i * 0.9} -14 -${32 - i}`} w={2.4} />;
      })}
      <Bn d="M138 150 H298" w={3.2} />
      <path d="M98 150 C100 118 140 102 164 130 C176 144 174 160 160 172 C136 190 100 182 98 150Z" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="3" />
      <path d="M100 152 Q130 160 168 152" fill="none" stroke={INK} strokeWidth="2.2" />
      <path d="M104 156 l5 8 l5 -8 M116 158 l5 8 l5 -8 M128 158 l5 8 l5 -8" fill="#fff" stroke={INK} strokeWidth="1" />
      <circle cx="128" cy="136" r="10" fill="#241c10" stroke={INK} strokeWidth="2" />
      <circle cx="125" cy="133" r="3" fill="#fff" fillOpacity="0.7" />
      <path d="M150 128 Q170 120 180 134" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2.4" />
      <path d="M170 166 Q176 188 160 200 Q174 196 184 174Z" fill={`url(#${u}-bd)`} stroke={INK} strokeWidth="2" />
    </g>
  );
}

function Fern({ u }: { u: string }) {
  const stem: Pt[] = [[120, 268], [150, 170], [168, 90], [262, 36]];
  const leaves: ReactNode[] = [];
  for (let i = 1; i <= 17; i++) {
    const t = i / 18;
    const c = cubic(stem, t);
    const d = tangent(stem, t);
    const len = 14 + 78 * Math.pow(1 - t, 0.75);
    for (const side of [-1, 1]) {
      const ang = Math.atan2(d[1], d[0]) + side * (1.15 - t * 0.35);
      const ex = c[0] + Math.cos(ang) * len;
      const ey = c[1] + Math.sin(ang) * len;
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      const wd = 5.2 * (1 - t * 0.4);
      const mx = (c[0] + ex) / 2;
      const my = (c[1] + ey) / 2;
      leaves.push(
        <g key={`${i}${side}`}>
          <path d={`M${c[0].toFixed(1)} ${c[1].toFixed(1)} Q${(mx + nx * wd).toFixed(1)} ${(my + ny * wd).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${(mx - nx * wd).toFixed(1)} ${(my - ny * wd).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}Z`} fill="#2c2416" stroke="#9a875f" strokeWidth="1" strokeOpacity="0.8" />
          <path d={`M${c[0].toFixed(1)} ${c[1].toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`} stroke="#b7a57a" strokeOpacity="0.55" strokeWidth="0.8" />
        </g>,
      );
    }
  }
  return (
    <g>
      <path d={`M${stem.map((p, i) => (i ? "C" : "M") + p.join(" ")).join(" ").replace("C", "C")}`} fill="none" stroke="#2c2416" strokeWidth="6" strokeLinecap="round" />
      <path d="M120 268 C150 170 168 90 262 36" fill="none" stroke="#b7a57a" strokeOpacity="0.5" strokeWidth="1.4" />
      {leaves}
      <g transform="translate(40 18) scale(0.55)" opacity="0.55">
        <path d="M260 250 C290 200 300 150 330 110" fill="none" stroke="#2c2416" strokeWidth="6" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Amber({ u }: { u: string }) {
  return (
    <g filter={`url(#${u}-sh)`}>
      <path d="M72 262 Q120 236 172 250 Q232 268 300 244 Q338 250 346 276 L60 282Z" fill="#4b3a24" stroke={INK} strokeWidth="3" />
      <path d="M98 126 C98 62 160 30 218 44 C286 60 322 122 306 182 C290 240 220 268 154 250 C106 236 98 180 98 126Z" fill={`url(#${u}-am)`} stroke="#6b2f06" strokeWidth="3.5" />
      <path d="M118 112 C124 76 158 54 190 56" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="7" strokeLinecap="round" />
      <path d="M262 76 C292 100 300 138 292 166" fill="none" stroke="#fff3c0" strokeOpacity="0.45" strokeWidth="5" strokeLinecap="round" />
      <g transform="translate(206 148) rotate(-18)">
        <ellipse cx="-16" cy="-14" rx="34" ry="10" fill="#fff" fillOpacity="0.55" stroke="#7a3a08" strokeWidth="1.4" transform="rotate(-26)" />
        <ellipse cx="14" cy="-18" rx="34" ry="9" fill="#fff" fillOpacity="0.45" stroke="#7a3a08" strokeWidth="1.4" transform="rotate(14)" />
        <ellipse cx="0" cy="4" rx="22" ry="9" fill="#2a1a0a" />
        <ellipse cx="-6" cy="2" rx="12" ry="4" fill="#5a3a18" />
        <circle cx="-26" cy="2" r="8" fill="#2a1a0a" />
        <circle cx="-29" cy="-1" r="3" fill="#c9742a" />
        {[-14, -4, 8].map((x, i) => (
          <path key={i} d={`M${x} 10 L${x - 6 + i * 4} ${24 + i * 2} L${x - 12 + i * 5} ${30 + i * 2}`} fill="none" stroke="#2a1a0a" strokeWidth="1.8" strokeLinecap="round" />
        ))}
        <path d="M-32 -4 Q-48 -16 -56 -10 M-32 0 Q-50 -6 -58 4" fill="none" stroke="#2a1a0a" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      {[[140, 190, 4], [152, 204, 2.6], [250, 210, 3.4], [120, 160, 2.2], [264, 128, 2.6]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" fillOpacity="0.35" stroke="#fff" strokeOpacity="0.7" strokeWidth="1" />
      ))}
    </g>
  );
}

function Claw({ u }: { u: string }) {
  const c: Pt[] = [[104, 262], [92, 112], [232, 30], [318, 168]];
  const g1 = along(c, 0.55, 8);
  const g2 = along(c, 0.9, 3);
  return (
    <g filter={`url(#${u}-sh)`}>
      <path d={taper(c, 36, 2, 0.8)} fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d={taper(c, 12, 0.6, 0.9)} fill="#fff" fillOpacity="0.45" transform="translate(-3 -3)" />
      {[-16, -8, 8, 16].map((o) => (
        <path key={o} d={`M${Array.from({ length: 24 }, (_, i) => along(c, 0.02 + (i / 23) * 0.92, o * (1 - (0.02 + (i / 23) * 0.92) * 0.85)).map((v) => v.toFixed(1)).join(" ")).join("L")}`} fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="1.6" />
      ))}
      <ellipse cx="97" cy="262" rx="46" ry="14" fill={`url(#${u}-bd)`} stroke={INK} strokeWidth="3.5" />
      <ellipse cx="97" cy="258" rx="26" ry="7" fill="#3a2c18" />
      <circle cx={g1[0]} cy={g1[1]} r="2.6" fill="#fff" fillOpacity="0.7" />
      <circle cx={g2[0]} cy={g2[1]} r="2" fill="#fff" fillOpacity="0.6" />
    </g>
  );
}

function Egg({ u }: { u: string }) {
  return (
    <g filter={`url(#${u}-sh)`}>
      <ellipse cx="200" cy="276" rx="104" ry="14" fill="#000" fillOpacity="0.25" />
      <g transform="rotate(12 200 150)">
        <path d="M200 30 C264 30 304 100 300 168 C296 236 250 270 200 270 C150 270 104 236 100 168 C96 100 136 30 200 30Z" fill={`url(#${u}-eg)`} stroke={INK} strokeWidth="3.5" />
        {Array.from({ length: 70 }, (_, i) => {
          const a = pr(i + 40) * Math.PI * 2;
          const rr = Math.sqrt(pr(i + 90));
          return <circle key={i} cx={200 + Math.cos(a) * rr * 88} cy={150 + Math.sin(a) * rr * 104} r={1 + pr(i) * 3.2} fill={pr(i + 5) > 0.45 ? "#7a6234" : "#f5ecd0"} fillOpacity={0.35 + pr(i + 8) * 0.3} />;
        })}
        <path d="M168 54 Q150 72 144 100" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="8" strokeLinecap="round" />
        <path d="M226 56 L214 94 L238 118 L220 160 L248 188 L236 232" fill="none" stroke="#2a1d0e" strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M228 56 L216 94 L240 118 L222 160 L250 188 L238 232" fill="none" stroke="#fff4d0" strokeOpacity="0.7" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M214 94 L186 104 M238 118 L270 112 M222 160 L196 176" fill="none" stroke="#2a1d0e" strokeWidth="2.8" strokeLinecap="round" />
      </g>
      <path d="M70 262 q16 -22 40 -16 q-2 20 -20 28Z M310 266 q18 -24 40 -14 q-8 20 -26 26Z" fill="#d5c299" stroke={INK} strokeWidth="2.5" />
    </g>
  );
}

function Tusk({ u }: { u: string }) {
  const c: Pt[] = [[92, 262], [34, 130], [222, 8], [346, 112]];
  return (
    <g filter={`url(#${u}-sh)`}>
      <path d={taper(c, 34, 3, 0.75)} fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {Array.from({ length: 16 }, (_, i) => {
        const t = 0.08 + i * 0.055;
        const a = along(c, t, 30 * Math.pow(1 - t, 0.75));
        const b = along(c, t, -30 * Math.pow(1 - t, 0.75));
        const m = along(c, t + 0.015, 0);
        return <path key={i} d={`M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${m[0].toFixed(1)} ${m[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`} fill="none" stroke={INK} strokeOpacity="0.28" strokeWidth="1.6" />;
      })}
      <path d={`M${Array.from({ length: 26 }, (_, i) => along(c, 0.06 + (i / 25) * 0.8, 16 * Math.pow(1 - (0.06 + (i / 25) * 0.8), 0.75)).map((v) => v.toFixed(1)).join(" ")).join("L")}`} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="82" cy="266" rx="40" ry="14" fill={`url(#${u}-bd)`} stroke={INK} strokeWidth="3.5" />
      <ellipse cx="82" cy="262" rx="22" ry="6" fill="#3a2c18" />
      <path d="M52 256 l-8 -10 M110 256 l10 -12 M96 252 l2 -14" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

function Skull({ u }: { u: string }) {
  const horn: Pt[] = [[236, 128], [268, 92], [300, 72], [342, 50]];
  const scal: ReactNode[] = [];
  for (let i = 0; i < 13; i++) {
    const a = Math.PI * (1.05 + i * 0.0655);
    scal.push(<ellipse key={i} cx={140 + Math.cos(a) * 100} cy={122 + Math.sin(a) * 112} rx="11" ry="8" transform={`rotate(${(a * 180) / Math.PI + 90} ${140 + Math.cos(a) * 100} ${122 + Math.sin(a) * 112})`} fill={`url(#${u}-bd)`} stroke={INK} strokeWidth="2.2" />);
  }
  return (
    <g filter={`url(#${u}-sh)`}>
      <g transform="translate(14 22) scale(0.94)">
      <path d="M172 176 C86 172 30 108 52 52 C78 0 160 -4 208 40 C236 68 240 124 228 156Z" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {scal}
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI * (1.15 + i * 0.09);
        return <path key={i} d={`M176 160 L${(176 + Math.cos(a) * 110).toFixed(1)} ${(160 + Math.sin(a) * 130).toFixed(1)}`} stroke={INK} strokeOpacity="0.3" strokeWidth="1.6" />;
      })}
      <ellipse cx="104" cy="80" rx="21" ry="28" transform="rotate(-18 104 80)" fill="#241c10" stroke={INK} strokeWidth="3" />
      <ellipse cx="164" cy="96" rx="16" ry="24" transform="rotate(8 164 96)" fill="#241c10" stroke={INK} strokeWidth="3" />
      <path d="M168 160 C186 126 234 114 268 126 C306 138 348 150 366 182 C354 196 336 202 316 202 L262 218 L206 214 C184 204 170 184 168 160Z" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M332 154 Q380 152 388 184 Q374 204 346 196Z" fill={`url(#${u}-bd)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M390 184 q-10 14 -30 12" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" />
      <path d={taper(horn, 18, 1.5, 0.8)} fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M232 128 C260 96 296 76 336 56" fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="1.6" />
      <path d="M334 152 C336 132 346 116 356 108 C358 126 356 142 350 158Z" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="238" cy="146" rx="15" ry="13" fill="#241c10" stroke={INK} strokeWidth="3" />
      <circle cx="234" cy="142" r="3.5" fill="#fff" fillOpacity="0.55" />
      <ellipse cx="338" cy="172" rx="4" ry="3" fill="#241c10" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${262 + i * 7.6} 204 l3.4 10 l3.4 -10Z`} fill="#fff8e1" stroke={INK} strokeWidth="1.2" />
      ))}
      <path d="M284 202 L296 226 L306 204Z" fill={`url(#${u}-bd)`} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M206 198 Q244 212 274 206" fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="2" />
    </g>
    </g>
  );
}

function Bird({ u }: { u: string }) {
  const feathers: ReactNode[] = [];
  for (let i = 0; i < 13; i++) {
    const a = (-168 + i * 11.2) * (Math.PI / 180);
    const len = 118 - Math.abs(i - 6) * 3 + (i > 8 ? 12 : 0);
    const ex = 176 + Math.cos(a) * len;
    const ey = 132 + Math.sin(a) * len;
    const nx = -Math.sin(a) * 6;
    const ny = Math.cos(a) * 6;
    feathers.push(
      <g key={i}>
        <path d={`M176 132 Q${(176 + ex) / 2 + nx} ${(132 + ey) / 2 + ny} ${ex} ${ey} Q${(176 + ex) / 2 - nx} ${(132 + ey) / 2 - ny} 176 132Z`} fill="#241c10" fillOpacity="0.88" stroke="#b7a57a" strokeOpacity="0.75" strokeWidth="1" />
        <path d={`M176 132 L${ex} ${ey}`} stroke="#d9c690" strokeOpacity="0.65" strokeWidth="1.2" />
      </g>,
    );
  }
  const tail: ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const x = 224 + i * 10.5;
    const y = 160 + i * 4.4;
    tail.push(<path key={`a${i}`} d={`M${x} ${y} l12 -${22 - i} M${x} ${y} l-5 ${24 - i}`} stroke="#d9c690" strokeWidth="2" strokeLinecap="round" fill="none" />);
    tail.push(<path key={`b${i}`} d={`M${x} ${y} L${x + 14} ${y - (24 - i) * 0.9} L${x + 4} ${y + (24 - i) * 0.7}Z`} fill="#241c10" fillOpacity="0.7" />);
  }
  return (
    <g>
      {feathers}
      {tail}
      <Bn d="M222 160 C260 168 320 188 376 232" w={4.4} />
      <path d="M180 126 C200 124 224 142 226 164 C222 184 196 188 178 176 C168 160 168 138 180 126Z" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="2.8" />
      <Bn d="M180 134 C186 150 190 162 194 174" w={2.4} />
      <Bn d="M190 130 C200 142 206 156 208 170" w={2.4} />
      <Bn d="M176 128 C150 112 132 98 126 84" w={5.4} />
      <path d="M120 74 C108 70 98 76 96 84 C104 92 118 96 128 92 C134 86 130 78 120 74Z" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="2.6" />
      <path d="M97 84 l-10 3 l10 3Z" fill="#f0e2bd" stroke={INK} strokeWidth="1.6" />
      <circle cx="116" cy="80" r="4.4" fill="#241c10" />
      <path d="M99 88 l3 5 l3 -4 l3 5 l3 -4" fill="none" stroke="#fff" strokeWidth="1.2" />
      <Bn d="M206 180 C202 212 196 238 190 262" w={5} />
      <Bn d="M190 262 L166 274 M190 262 L184 280 M190 262 L206 276" w={3} />
      <Bn d="M214 178 C220 208 226 236 238 258" w={4.4} />
      <Bn d="M238 258 L214 272 M238 258 L234 278 M238 258 L254 272" w={3} />
    </g>
  );
}

function Rex({ u }: { u: string }) {
  const neck: Pt[] = [[142, 118], [166, 96], [176, 118], [200, 132]];
  const back: Pt[] = [[200, 132], [226, 108], [252, 108], [276, 124]];
  const tail: Pt[] = [[276, 124], [316, 126], [352, 160], [388, 218]];
  const vs: ReactNode[] = [];
  const addV = (curve: Pt[], n: number, w0: number, w1: number, key: string, spine: number) => {
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const c = cubic(curve, t);
      const d = tangent(curve, t);
      const w = w0 + (w1 - w0) * t;
      const ang = (Math.atan2(d[1], d[0]) * 180) / Math.PI;
      vs.push(
        <g key={`${key}${i}`} transform={`translate(${c[0].toFixed(1)} ${c[1].toFixed(1)}) rotate(${ang.toFixed(1)})`}>
          <path d={`M${-w * 0.2} ${-w * 0.5} L${w * 0.1} ${-w * 0.5 - spine * (1 - t * 0.5)}`} stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d={`M${-w * 0.2} ${-w * 0.5} L${w * 0.1} ${-w * 0.5 - spine * (1 - t * 0.5)}`} stroke="#f0e2bd" strokeWidth="1.6" strokeLinecap="round" />
          <rect x={-w * 0.55} y={-w * 0.5} width={w * 1.1} height={w} rx={w * 0.3} fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="1.8" />
        </g>,
      );
    }
  };
  addV(neck, 7, 8, 9.5, "n", 5);
  addV(back, 8, 9.5, 11, "b", 7);
  addV(tail, 17, 11, 3, "t", 6);
  return (
    <g filter={`url(#${u}-sh)`}>
      <ellipse cx="206" cy="282" rx="170" ry="9" fill="#000" fillOpacity="0.28" />
      {vs}
      {Array.from({ length: 9 }, (_, i) => {
        const x = 198 + i * 8.6;
        const top = 124 - Math.sin((i / 8) * Math.PI) * 14;
        const len = 40 + Math.sin((i / 8) * Math.PI) * 38;
        return <Bn key={i} d={`M${x} ${top + 8} Q${x - 22} ${top + len * 0.7} ${x - 10 - i * 0.6} ${top + len}`} w={4.2} />;
      })}
      <Bn d="M190 150 Q186 196 214 204" w={3.4} />
      <path d="M270 112 C288 108 296 126 284 142 C274 152 262 144 264 128Z" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="2.4" />
      <Bn d="M278 138 L292 170 Q300 180 306 174" w={5} />
      <Bn d="M188 150 L172 176" w={5} />
      <Bn d="M172 176 L166 188 M172 176 L178 190" w={2.8} />
      <Bn d="M262 148 L238 200" w={11} />
      <circle cx="238" cy="200" r="9" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="2.6" />
      <Bn d="M238 200 L254 244" w={9} />
      <Bn d="M254 244 L256 262" w={6} />
      <Bn d="M256 262 L214 272 M256 262 L238 278 M256 262 L282 272" w={4.6} />
      {[[214, 272], [238, 278], [282, 272]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} l${i === 2 ? 8 : -8} 4 l${i === 2 ? -2 : 2} -7Z`} fill="#fff8e1" stroke={INK} strokeWidth="1.6" />
      ))}
      <path d="M32 120 L56 96 L98 88 Q124 80 146 94 L156 128 L142 152 L100 150 L52 148 Q34 142 32 120Z" fill={`url(#${u}-bn)`} stroke={INK} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M36 128 L120 134" stroke={INK} strokeWidth="2.6" />
      <path d="M36 128 Q70 146 140 150" fill="none" stroke={INK} strokeWidth="2.4" />
      <ellipse cx="114" cy="106" rx="12" ry="10" fill="#241c10" stroke={INK} strokeWidth="2.4" />
      <ellipse cx="86" cy="112" rx="14" ry="8" fill="#241c10" fillOpacity="0.85" stroke={INK} strokeWidth="2" />
      <ellipse cx="52" cy="106" rx="4" ry="3" fill="#241c10" />
      <path d="M98 94 Q116 84 138 98" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="3" />
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <path d={`M${44 + i * 8.2} 128 l3.4 11 l3.4 -11Z`} fill="#fff8e1" stroke={INK} strokeWidth="1" />
          <path d={`M${46 + i * 8} 134 l3 -10 l3 10Z`} fill="#fff8e1" stroke={INK} strokeWidth="1" />
        </g>
      ))}
    </g>
  );
}

function Geode({ u }: { u: string }) {
  const cr: ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    const a = pr(i + 2) * Math.PI * 2;
    const rr = 20 + pr(i + 12) * 52;
    const x = 200 + Math.cos(a) * rr;
    const y = 156 + Math.sin(a) * rr * 0.85;
    const h = 22 + pr(i + 4) * 30;
    const rot = (a * 180) / Math.PI + 90;
    cr.push(
      <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`}>
        <path d={`M-7 0 L-4 -${h} L4 -${h} L7 0Z`} fill="#d6f4ff" fillOpacity="0.88" stroke="#fff" strokeWidth="1.2" />
        <path d={`M-4 -${h} L0 -${h + 9} L4 -${h}Z`} fill="#fff" fillOpacity="0.9" />
        <path d={`M-1 0 L-1 -${h - 4}`} stroke="#8fd3ff" strokeWidth="2" />
      </g>,
    );
  }
  return (
    <g filter={`url(#${u}-sh)`}>
      <path d="M200 20 L290 44 L346 118 L324 214 L254 272 L150 280 L72 232 L46 140 L88 54Z" fill="#6b6475" stroke="#2f2a38" strokeWidth="4" strokeLinejoin="round" />
      <path d="M200 30 L282 52 L334 120 L314 208 L248 262 L152 270 L82 226 L58 142 L96 62Z" fill="#8d8698" stroke="#4a4458" strokeWidth="2" />
      <path d="M200 52 L266 70 L306 124 L292 196 L240 240 L158 246 L102 208 L82 146 L112 84Z" fill="#f3e9ff" stroke="#5d3aa8" strokeWidth="2.5" />
      <path d="M200 66 L256 82 L290 126 L278 190 L234 226 L162 230 L116 198 L100 148 L124 98Z" fill={`url(#${u}-ge)`} stroke="#2a1458" strokeWidth="2.5" />
      <path d="M200 84 L244 96 L270 130 L262 182 L226 210 L168 212 L132 186 L122 148 L142 112Z" fill="#c9a3ff" fillOpacity="0.6" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.5" />
      {cr}
      {[[96, 58, 9], [320, 60, 7], [338, 196, 8], [60, 220, 6], [210, 40, 6]].map(([x, y, s], i) => (
        <path key={i} className="fa-twinkle" style={{ animationDelay: `${i * 0.4}s` }} d={`M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28}Z`} fill="#fff7c2" />
      ))}
    </g>
  );
}

const SLAB_KINDS = new Set(["ammonite", "trilobite", "brachiopod", "fish", "fern", "bird"]);

function Body({ s, u }: { s: FossilSpecies; u: string }): ReactNode {
  switch (s.kind) {
    case "ammonite":
      return <Ammonite u={u} />;
    case "trilobite":
      return <Trilobite u={u} />;
    case "brachiopod":
      return <Brachiopod u={u} />;
    case "tooth":
      return <Tooth u={u} />;
    case "fish":
      return <Fish u={u} />;
    case "fern":
      return <Fern u={u} />;
    case "amber":
      return <Amber u={u} />;
    case "claw":
      return <Claw u={u} />;
    case "egg":
      return <Egg u={u} />;
    case "tusk":
      return <Tusk u={u} />;
    case "skull":
      return <Skull u={u} />;
    case "bird":
      return <Bird u={u} />;
    case "rex":
      return <Rex u={u} />;
    case "geode":
      return <Geode u={u} />;
  }
}

export default function FossilArt({ s, bare, silhouette, className }: { s: FossilSpecies; bare?: boolean; silhouette?: boolean; className?: string }) {
  const u = useId().replace(/:/g, "");
  const slab = SLAB_KINDS.has(s.kind) && !bare;
  return (
    <svg viewBox="0 0 400 300" className={className} style={silhouette ? { filter: "brightness(0) opacity(0.55)" } : undefined} aria-hidden>
      <Defs u={u} />
      {slab && <Slab u={u} />}
      <Body s={s} u={u} />
    </svg>
  );
}
