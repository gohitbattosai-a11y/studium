import type { ComponentType, CSSProperties } from "react";

const pt = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.sin(a), -r * Math.cos(a)];
};

const f = (n: number) => n.toFixed(1);
const xy = (p: [number, number]) => `${f(p[0])} ${f(p[1])}`;
const vars = (v: Record<string, string | number>) => v as unknown as CSSProperties;

const HEART = "M0 3 C-4 0 -4 -3 -2 -3.5 C-1 -3.8 0 -3 0 -2 C0 -3 1 -3.8 2 -3.5 C4 -3 4 0 0 3 Z";
const STAR = "M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z";

const jag = (seed: number, r: number, n: number, amp: number) => {
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const pts = Array.from({ length: n }, (_, i) => xy(pt(r + (i % 2 ? amp : -amp) * (0.5 + rnd()), (360 / n) * i)));
  return `M${pts.join(" L")} Z`;
};

const wave = (y: number, count: number) => `M-80 ${y} q5 -4 10 0${" t10 0".repeat(count)} L${-80 + 10 * (count + 1)} 60 L-80 60 Z`;

const ICE_SPIKES = Array.from({ length: 14 }, (_, i) => ({ a: i * (360 / 14), h: i % 2 ? 9 : 15, w: i % 2 ? 2.2 : 3.2, d: (i % 5) * 0.35 }));

function Ghiaccio() {
  return (
    <g transform="translate(50 50)">
      <defs>
        <linearGradient id="dx-ice" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <circle r="30" fill="none" stroke="#bae6fd" strokeWidth="1.6" opacity="0.85" />
      <circle r="28" fill="none" stroke="#e0f2fe" strokeWidth="0.6" opacity="0.5" />
      {ICE_SPIKES.map((s) => (
        <g key={s.a} transform={`rotate(${s.a}) translate(0 -30)`}>
          <path className="dc-grow" style={{ animationDelay: `${-s.d}s` }} d={`M${-s.w} 0 L0 ${-s.h} L${s.w} 0 L0 1.5 Z`} fill="url(#dx-ice)" stroke="#e0f2fe" strokeWidth="0.4" />
        </g>
      ))}
      <g className="dc-spin-slow">
        <path d={`M${xy(pt(31, 0))} A31 31 0 0 1 ${xy(pt(31, 50))}`} fill="none" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.95" />
      </g>
      {[[-36, -30], [38, -26], [-40, 22], [34, 36]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path className="dc-twinkle" style={{ animationDelay: `${-i * 0.5}s` }} d={STAR} fill="#ffffff" transform="scale(0.7)" />
        </g>
      ))}
    </g>
  );
}

const BOLTS = [
  { a: 45, d: 0 },
  { a: 135, d: 0.9 },
  { a: 225, d: 1.7 },
  { a: 315, d: 0.4 },
];

function Fulmine() {
  return (
    <g transform="translate(50 50)">
      <circle r="30" fill="none" stroke="#facc15" strokeWidth="3" opacity="0.18" className="dc-pulse-slow" />
      <path d={jag(11, 31, 28, 2.4)} fill="none" stroke="#fde047" strokeWidth="1.1" strokeLinejoin="round" filter="url(#dc-soft-glow)" className="dc-crackle" />
      <path d={jag(29, 31, 28, 2.4)} fill="none" stroke="#67e8f9" strokeWidth="0.9" strokeLinejoin="round" className="dc-crackle" style={{ animationDelay: "-0.25s" }} />
      {BOLTS.map((b) => (
        <g key={b.a} transform={`rotate(${b.a})`}>
          <path className="dc-flash" style={{ animationDelay: `${-b.d}s` }} d="M1 -32 L-3.5 -37 L2 -38.5 L-2.5 -44 L3.5 -48 L-0.5 -42 L3.5 -40.5 L-1 -35 Z" fill="#fef08a" stroke="#facc15" strokeWidth="0.5" strokeLinejoin="round" filter="url(#dc-neon-glow)" />
        </g>
      ))}
    </g>
  );
}

const PETAL_FALL = [
  { x: -36, y: -26, dx: -6, d: 0 },
  { x: -42, y: -6, dx: 8, d: 1.2 },
  { x: -34, y: 12, dx: -8, d: 2.4 },
  { x: 38, y: -22, dx: 7, d: 0.7 },
  { x: 43, y: 0, dx: -6, d: 1.9 },
  { x: 36, y: 18, dx: 9, d: 3 },
];

function Flower({ x, y, d }: { x: number; y: number; d: number }) {
  return (
    <g transform={`translate(${f(x)} ${f(y)})`}>
      <g className="dc-sway" style={{ animationDelay: `${-d}s` }}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-2.6" rx="1.9" ry="2.7" fill="#fbcfe8" stroke="#f472b6" strokeWidth="0.3" transform={`rotate(${a})`} />
        ))}
        <circle r="1.1" fill="#fde047" />
      </g>
    </g>
  );
}

function Sakura() {
  const flowers = [25, 60, 95, 130].map((a, i) => ({ p: pt(33, a), d: i * 0.8 }));
  return (
    <g transform="translate(50 50)">
      <path d={`M${xy(pt(33, 8))} A33 33 0 0 1 ${xy(pt(33, 150))}`} fill="none" stroke="#78350f" strokeWidth="2.4" strokeLinecap="round" />
      <path d={`M${xy(pt(33, 40))} q4 -6 9 -7 M${xy(pt(33, 78))} q5 -5 10 -4 M${xy(pt(33, 112))} q5 -3 9 1`} fill="none" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
      {flowers.map((fl, i) => (
        <Flower key={i} x={fl.p[0]} y={fl.p[1]} d={fl.d} />
      ))}
      {PETAL_FALL.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <g className="dc-fall" style={vars({ "--dx": `${p.dx}px`, animationDelay: `${-p.d}s` })}>
            <path d="M0 -3 C2.6 -1.8 2.6 1.8 0 3 C-2.6 1.8 -2.6 -1.8 0 -3 Z" fill="#f9a8d4" />
          </g>
        </g>
      ))}
    </g>
  );
}

const RAINBOW = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#06b6d4", "#6366f1", "#a855f7"];

function Arcobaleno() {
  return (
    <g transform="translate(50 50)">
      <g className="dc-pulse-slow">
        {RAINBOW.map((c, i) => {
          const r = 30 + i * 2.1;
          return <path key={c} d={`M${xy(pt(r, -108))} A${r} ${r} 0 1 1 ${xy(pt(r, 108))}`} fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" opacity="0.95" />;
        })}
      </g>
      <path className="dc-dash" d={`M${xy(pt(37, -108))} A37 37 0 1 1 ${xy(pt(37, 108))}`} fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="10 150" opacity="0.8" />
      {[-112, 112].map((a) => {
        const [x, y] = pt(37, a);
        return (
          <g key={a} transform={`translate(${f(x)} ${f(y)})`}>
            <circle cx="-3" cy="1" r="4" fill="#ffffff" />
            <circle cx="2" cy="-1" r="5" fill="#ffffff" />
            <circle cx="6" cy="2" r="3.5" fill="#e0f2fe" />
          </g>
        );
      })}
      {[-60, 0, 60].map((a, i) => {
        const [x, y] = pt(44, a);
        return (
          <g key={a} transform={`translate(${f(x)} ${f(y)})`}>
            <path className="dc-twinkle" style={{ animationDelay: `${-i * 0.6}s` }} d={STAR} fill="#fff7ae" transform="scale(0.6)" />
          </g>
        );
      })}
    </g>
  );
}

const HEARTS = [
  { x: -36, y: 10, dx: -3, d: 0, c: "#fb7185" },
  { x: 36, y: 6, dx: 3, d: 0.9, c: "#f43f5e" },
  { x: -26, y: 28, dx: -4, d: 1.8, c: "#fda4af" },
  { x: 28, y: 26, dx: 4, d: 2.7, c: "#fb7185" },
  { x: -41, y: -10, dx: -2, d: 1.3, c: "#f43f5e" },
  { x: 41, y: -12, dx: 2, d: 2.2, c: "#fda4af" },
  { x: 0, y: 38, dx: 0, d: 0.5, c: "#f43f5e" },
];

function Cuori() {
  return (
    <g transform="translate(50 50)">
      <circle className="dc-beat" r="30" fill="none" stroke="#fb7185" strokeWidth="1.6" opacity="0.85" />
      <circle className="dc-beat" r="33" fill="none" stroke="#fecdd3" strokeWidth="0.6" strokeDasharray="1 4" style={{ animationDelay: "-0.2s" }} />
      <g transform="translate(0 -37)">
        <g className="dc-beat" style={{ animationDelay: "-0.1s" }}>
          <path d={HEART} fill="#f43f5e" stroke="#be123c" strokeWidth="0.4" transform="scale(2.4)" />
        </g>
      </g>
      {HEARTS.map((h, i) => (
        <g key={i} transform={`translate(${h.x} ${h.y})`}>
          <g className="dc-rise" style={vars({ "--dx": `${h.dx}px`, animationDelay: `${-h.d}s` })}>
            <path d={HEART} fill={h.c} transform="scale(1.4)" />
          </g>
        </g>
      ))}
    </g>
  );
}

const BUBBLE_SPOTS = [
  { a: 128, r: 36, s: 1.8, dx: -3, d: 0 },
  { a: 150, r: 39, s: 1.2, dx: 2, d: 1.1 },
  { a: 172, r: 35, s: 2.2, dx: -2, d: 2.2 },
  { a: 194, r: 38, s: 1.4, dx: 3, d: 0.6 },
  { a: 216, r: 36, s: 1.9, dx: -3, d: 1.7 },
  { a: 238, r: 39, s: 1.3, dx: 2, d: 2.8 },
];

function Bolle() {
  return (
    <g transform="translate(50 50)">
      <defs>
        <clipPath id="dx-bo-clip">
          <path clipRule="evenodd" d="M-42 0 a42 42 0 1 0 84 0 a42 42 0 1 0 -84 0 M-29 0 a29 29 0 1 1 58 0 a29 29 0 1 1 -58 0" />
        </clipPath>
        <linearGradient id="dx-bo-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#67e8f9" stopOpacity="0.85" />
          <stop offset="1" stopColor="#0369a1" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <circle r="29" fill="none" stroke="#a5f3fc" strokeWidth="1" opacity="0.7" />
      <circle r="42" fill="none" stroke="#67e8f9" strokeWidth="0.6" opacity="0.4" />
      <g clipPath="url(#dx-bo-clip)">
        <g transform="translate(0 14)">
          <path className="dc-wave" d={wave(0, 16)} fill="#7dd3fc" opacity="0.55" style={{ animationDuration: "4.4s" }} />
          <path className="dc-wave" d={wave(3, 16)} fill="url(#dx-bo-water)" />
        </g>
      </g>
      {BUBBLE_SPOTS.map((b, i) => {
        const [x, y] = pt(b.r, b.a);
        return (
          <g key={i} transform={`translate(${f(x)} ${f(y)})`}>
            <g className="dc-rise" style={vars({ "--dx": `${b.dx}px`, animationDelay: `${-b.d}s`, animationDuration: "4.2s" })}>
              <circle r={b.s} fill="#e0f2fe" fillOpacity="0.25" stroke="#e0f2fe" strokeWidth="0.5" />
              <circle cx={-b.s * 0.3} cy={-b.s * 0.3} r={b.s * 0.25} fill="#ffffff" />
            </g>
          </g>
        );
      })}
    </g>
  );
}

const DRIPS = [
  { a: 132, d: 0, s: 1 },
  { a: 156, d: 1.2, s: 1.3 },
  { a: 180, d: 0.5, s: 0.9 },
  { a: 204, d: 1.8, s: 1.2 },
  { a: 228, d: 0.9, s: 1 },
];

const POPS = [
  { a: -64, r: 37, s: 2.4, d: 0 },
  { a: -30, r: 40, s: 1.6, d: 1.1 },
  { a: 6, r: 38, s: 2.1, d: 2.1 },
  { a: 38, r: 41, s: 1.5, d: 0.6 },
  { a: 70, r: 37, s: 2.2, d: 1.7 },
];

function Veleno() {
  return (
    <g transform="translate(50 50)">
      <circle r="30" fill="none" stroke="#365314" strokeWidth="5" />
      <circle r="30" fill="none" stroke="#84cc16" strokeWidth="1.6" opacity="0.9" className="dc-flicker" />
      <circle r="27.4" fill="none" stroke="#bef264" strokeWidth="0.5" strokeDasharray="1 5" opacity="0.7" className="dc-spin-rev" />
      {DRIPS.map((dr) => {
        const [x, y] = pt(30, dr.a);
        return (
          <g key={dr.a} transform={`translate(${f(x)} ${f(y)}) scale(${dr.s})`}>
            <path className="dc-drip" style={{ animationDelay: `${-dr.d}s` }} d="M-2 -1 C-2 4 -3.4 7.5 0 11 C3.4 7.5 2 4 2 -1 Z" fill="#84cc16" stroke="#365314" strokeWidth="0.5" />
          </g>
        );
      })}
      {POPS.map((p, i) => {
        const [x, y] = pt(p.r, p.a);
        return (
          <g key={i} transform={`translate(${f(x)} ${f(y)})`}>
            <g className="dc-pop" style={{ animationDelay: `${-p.d}s` }}>
              <circle r={p.s} fill="#a3e635" fillOpacity="0.3" stroke="#d9f99d" strokeWidth="0.6" />
              <circle cx={-p.s * 0.3} cy={-p.s * 0.3} r={p.s * 0.28} fill="#f7fee7" />
            </g>
          </g>
        );
      })}
    </g>
  );
}

const SWIRL = (r: number, amp: number, waves: number, phase: number) =>
  `M${Array.from({ length: 96 }, (_, i) => xy(pt(r + amp * Math.sin((i / 96) * Math.PI * 2 * waves + phase), (360 / 96) * i))).join(" L")} Z`;

function StelleNotte() {
  return (
    <g transform="translate(50 50)">
      <g className="dc-spin-slow">
        <path d={SWIRL(31, 1.8, 7, 0)} fill="none" stroke="#6366f1" strokeWidth="1.6" strokeLinejoin="round" />
      </g>
      <g className="dc-spin-rev">
        <path d={SWIRL(33, 1.4, 5, 1.6)} fill="none" stroke="#a5b4fc" strokeWidth="0.9" strokeLinejoin="round" opacity="0.85" />
      </g>
      <g transform="translate(30 -28)">
        <g className="dc-glow">
          <path d="M0 -8 A8 8 0 1 0 0 8 A6 6 0 1 1 0 -8 Z" fill="#fde68a" filter="url(#dc-soft-glow)" transform="rotate(20)" />
        </g>
      </g>
      {[[-34, -24, 0.9], [-40, 14, 0.6], [34, 32, 0.8], [-12, 42, 0.6], [6, -42, 0.7]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path className="dc-twinkle" style={{ animationDelay: `${-i * 0.45}s` }} d={STAR} fill={i % 2 ? "#ffffff" : "#fef08a"} transform={`scale(${s})`} />
        </g>
      ))}
      <g transform="translate(-30 -36)">
        <g className="dc-shoot">
          <path d="M0 0 L-12 -7" stroke="#c7d2fe" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <circle r="1.6" fill="#ffffff" filter="url(#dc-soft-glow)" />
        </g>
      </g>
    </g>
  );
}

const SNOW_FALL = [
  { x: -38, y: -20, dx: -5, d: 0 },
  { x: -43, y: 2, dx: 6, d: 1.4 },
  { x: -35, y: 20, dx: -6, d: 2.6 },
  { x: 38, y: -16, dx: 6, d: 0.8 },
  { x: 43, y: 6, dx: -5, d: 2 },
  { x: 36, y: 24, dx: 5, d: 3.2 },
  { x: -22, y: 36, dx: 3, d: 1 },
  { x: 24, y: 38, dx: -3, d: 2.3 },
];

function Neve() {
  const puffs = Array.from({ length: 15 }, (_, i) => ({ a: -80 + i * (160 / 14), r: i % 2 ? 2.8 : 3.8 }));
  return (
    <g transform="translate(50 50)">
      <circle r="30" fill="none" stroke="#dbeafe" strokeWidth="0.9" opacity="0.6" />
      {puffs.map((p, i) => {
        const [x, y] = pt(29.5, p.a);
        return <circle key={`s${i}`} cx={x + 0.4} cy={y + 1.2} r={p.r} fill="#bfdbfe" />;
      })}
      {puffs.map((p, i) => {
        const [x, y] = pt(29.5, p.a);
        return <circle key={i} cx={x} cy={y} r={p.r} fill="#ffffff" />;
      })}
      {[-48, -12, 28, 62].map((a, i) => {
        const [x, y] = pt(31.5, a);
        return (
          <g key={a} transform={`translate(${f(x)} ${f(y)})`}>
            <path className="dc-twinkle" style={{ animationDelay: `${-i * 0.6}s` }} d={STAR} fill="#e0f2fe" transform="scale(0.5)" />
          </g>
        );
      })}
      {SNOW_FALL.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`}>
          <g className="dc-fall" style={vars({ "--dx": `${s.dx}px`, animationDelay: `${-s.d}s`, animationDuration: "5s" })}>
            <path d="M0 -2.6V2.6M-2.2 -1.3L2.2 1.3M-2.2 1.3L2.2 -1.3" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          </g>
        </g>
      ))}
    </g>
  );
}

const EMBERS_LAVA = [
  { a: 100, dx: 4, d: 0, c: "#fb923c" },
  { a: 125, dx: -3, d: 0.8, c: "#fde047" },
  { a: 150, dx: 5, d: 1.6, c: "#f97316" },
  { a: 175, dx: -4, d: 2.4, c: "#fdba74" },
  { a: 200, dx: 3, d: 0.4, c: "#fb923c" },
  { a: 225, dx: -5, d: 1.2, c: "#fde047" },
  { a: 250, dx: 4, d: 2, c: "#f97316" },
  { a: 80, dx: -3, d: 2.8, c: "#fdba74" },
  { a: 280, dx: 3, d: 3.2, c: "#fb923c" },
];

function Lava() {
  return (
    <g transform="translate(50 50)">
      <circle r="35" fill="#ea580c" opacity="0.18" filter="url(#dc-heavy-glow)" className="dc-pulse-slow" />
      <circle r="31" fill="none" stroke="#2a0f08" strokeWidth="6.5" />
      <circle r="31" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="6 3 10 2 4 7 3 5" strokeLinecap="round" filter="url(#dc-soft-glow)" className="dc-lava" />
      <circle r="31" fill="none" stroke="#fde047" strokeWidth="0.7" strokeDasharray="2 9" className="dc-lava" style={{ animationDelay: "-0.8s" }} />
      {[20, 80, 140, 200, 260, 320].map((a) => (
        <g key={a} transform={`rotate(${a}) translate(0 -34.5)`}>
          <path d="M-3 2 L-1.5 -2.5 L2 -3 L3.5 1 L0 3 Z" fill="#1c0a05" stroke="#f97316" strokeWidth="0.5" strokeLinejoin="round" />
        </g>
      ))}
      {EMBERS_LAVA.map((e, i) => {
        const [x, y] = pt(33, e.a);
        return (
          <g key={i} transform={`translate(${f(x)} ${f(y)})`}>
            <g className="dc-rise" style={vars({ "--dx": `${e.dx}px`, animationDelay: `${-e.d}s`, animationDuration: "2.6s" })}>
              <circle r="1.2" fill={e.c} filter="url(#dc-soft-glow)" />
            </g>
          </g>
        );
      })}
    </g>
  );
}

const LEAF_TONES = ["#15803d", "#22c55e", "#4ade80", "#166534"];

function Foglie() {
  const leaves = [...Array.from({ length: 8 }, (_, i) => ({ a: 188 + i * 18, side: 1 })), ...Array.from({ length: 8 }, (_, i) => ({ a: 172 - i * 18, side: -1 }))];
  return (
    <g transform="translate(50 50)">
      <path d={`M${xy(pt(31, 182))} A31 31 0 0 1 ${xy(pt(31, 322))}`} fill="none" stroke="#3f6212" strokeWidth="1.5" strokeLinecap="round" />
      <path d={`M${xy(pt(31, 178))} A31 31 0 0 0 ${xy(pt(31, 38))}`} fill="none" stroke="#3f6212" strokeWidth="1.5" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <g key={i} transform={`rotate(${l.a}) translate(0 -31)`}>
          <g className="dc-leaf" style={{ animationDelay: `${(i % 8) * 0.35}s` }}>
            <ellipse cx="0" cy="-4.5" rx="2.3" ry="5" fill={LEAF_TONES[i % 4]} transform={`rotate(${i % 2 ? 40 : -40})`} />
          </g>
        </g>
      ))}
      {[322, 38].map((a) => {
        const [x, y] = pt(32, a);
        return (
          <g key={a} transform={`translate(${f(x)} ${f(y)})`}>
            <circle r="2.4" fill="#fef9c3" />
            <circle r="1" fill="#f59e0b" />
          </g>
        );
      })}
      <g className="dc-fly">
        <g className="dc-wing">
          <ellipse cx="-3.2" cy="-1.4" rx="3.4" ry="2.4" fill="#fb923c" stroke="#7c2d12" strokeWidth="0.3" />
          <ellipse cx="3.2" cy="-1.4" rx="3.4" ry="2.4" fill="#fb923c" stroke="#7c2d12" strokeWidth="0.3" />
          <ellipse cx="-2.4" cy="1.6" rx="2.2" ry="1.7" fill="#fbbf24" />
          <ellipse cx="2.4" cy="1.6" rx="2.2" ry="1.7" fill="#fbbf24" />
        </g>
        <rect x="-0.4" y="-3" width="0.8" height="6.5" rx="0.4" fill="#292524" />
      </g>
    </g>
  );
}

const TENDRILS = Array.from({ length: 9 }, (_, i) => ({ a: 20 + i * 40, d: (i % 4) * 0.5, h: i % 2 ? 0 : 3 }));

function Ombra() {
  return (
    <g transform="translate(50 50)">
      <circle r="36" fill="#7c3aed" opacity="0.14" filter="url(#dc-heavy-glow)" className="dc-pulse-slow" />
      <circle r="30" fill="none" stroke="#2e1065" strokeWidth="3.4" />
      {TENDRILS.map((t) => (
        <g key={t.a} transform={`rotate(${t.a}) translate(0 -29)`}>
          <g className="dc-sway" style={{ animationDelay: `${-t.d}s` }}>
            <path d={`M0 0 C-5 -6 5 -10 0 ${-17 - t.h}`} fill="none" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round" />
            <path d={`M0 0 C-5 -6 5 -10 0 ${-17 - t.h}`} fill="none" stroke="#c084fc" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
          </g>
        </g>
      ))}
      <g transform="translate(0 -39)">
        <g className="dc-eye">
          <path d="M-9 0 Q0 -8 9 0 Q0 8 -9 0 Z" fill="#1e1033" stroke="#a855f7" strokeWidth="0.8" filter="url(#dc-soft-glow)" />
          <circle r="3.6" fill="#c084fc" />
          <ellipse rx="0.9" ry="3" fill="#0f0720" />
          <circle cx="-1.2" cy="-1.2" r="0.7" fill="#ffffff" />
        </g>
      </g>
    </g>
  );
}

export const SPEC_ART: Record<string, ComponentType> = {
  "ghiaccio-cristalli": Ghiaccio,
  "fulmine-elettrico": Fulmine,
  sakura: Sakura,
  arcobaleno: Arcobaleno,
  cuori: Cuori,
  "bolle-acqua": Bolle,
  "veleno-tossico": Veleno,
  "stelle-notte": StelleNotte,
  "neve-fiocchi": Neve,
  "lava-fuoco": Lava,
  "foglie-bosco": Foglie,
  "ombra-viola": Ombra,
};
