import type { ReactNode } from "react";
import { gearPath, lcg } from "./art";
import "./obs.css";

function Defs() {
  return (
    <defs>
      <linearGradient id="ob-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0a4a5e" />
        <stop offset="0.45" stopColor="#06293c" />
        <stop offset="1" stopColor="#020b16" />
      </linearGradient>
      <linearGradient id="ob-ray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#bdfcf0" stopOpacity="0.55" />
        <stop offset="1" stopColor="#5eead4" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="ob-glow-pink" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#f9a8d4" stopOpacity="0.9" />
        <stop offset="1" stopColor="#f472b6" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ob-glow-aqua" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#7ff3e6" stopOpacity="0.85" />
        <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ob-glow-amber" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fde68a" stopOpacity="0.95" />
        <stop offset="1" stopColor="#fb923c" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ob-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3b2a22" />
        <stop offset="1" stopColor="#1b1210" />
      </linearGradient>
      <linearGradient id="ob-metal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#0b2a36" />
        <stop offset="0.45" stopColor="#1f5a6b" />
        <stop offset="1" stopColor="#081d28" />
      </linearGradient>
      <linearGradient id="ob-sand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1d4350" />
        <stop offset="1" stopColor="#06151f" />
      </linearGradient>
      <linearGradient id="ob-coral" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#be123c" />
        <stop offset="1" stopColor="#fb7185" />
      </linearGradient>
    </defs>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      <Defs />
      <rect width="800" height="500" fill="url(#ob-sea)" />
      {children}
    </svg>
  );
}

function Rays({ xs, width = 90, opacity = 1 }: { xs: number[]; width?: number; opacity?: number }) {
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={opacity}>
      {xs.map((x, i) => (
        <path key={x} d={`M${x - width * 0.2} -10 L${x + width * 0.2} -10 L${x + width * 1.1 + i * 12} 420 L${x - width * 1.1 + i * 12} 420Z`} fill="url(#ob-ray)" className="ob-ray" style={{ animationDelay: `${-i * 1.7}s`, animationDuration: `${6 + i}s` }} />
      ))}
    </g>
  );
}

function Bubbles({ count = 22, seed = 5, y = 520 }: { count?: number; seed?: number; y?: number }) {
  const r = lcg(seed);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const x = r() * 800;
        const s = 1.2 + r() * 3.4;
        return <circle key={i} cx={x} cy={y} r={s} fill="none" stroke="#bdfcf0" strokeOpacity="0.55" strokeWidth="0.9" className="ob-bubble" style={{ animationDelay: `${-r() * 11}s`, animationDuration: `${8 + r() * 8}s` }} />;
      })}
    </g>
  );
}

function Snow({ count = 40, seed = 9 }: { count?: number; seed?: number }) {
  const r = lcg(seed);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={r() * 800} cy={r() * 500} r={0.6 + r() * 1.3} fill="#d7f3ee" className="ob-twinkle" style={{ animationDelay: `${-r() * 4}s`, animationDuration: `${3 + r() * 4}s` }} />
      ))}
    </g>
  );
}

function Fish({ x, y, s = 1, color = "#0a2d3d", delay = 0, speed = 40 }: { x: number; y: number; s?: number; color?: string; delay?: number; speed?: number }) {
  return (
    <g transform={`translate(0 ${y}) scale(${s})`}>
      <g className="ob-swim" style={{ animationDelay: `${-delay}s`, animationDuration: `${speed}s` }}>
        <g transform={`translate(${x} 0)`}>
          <path d="M0 0 C10 -8 24 -8 34 0 C24 8 10 8 0 0Z M-8 -6 L0 0 L-8 6Z" fill={color} />
          <circle cx="27" cy="-1.5" r="1.3" fill="#bdfcf0" fillOpacity="0.8" />
        </g>
      </g>
    </g>
  );
}

function Jelly({ x, y, s = 1, hue = "#f9a8d4", delay = 0 }: { x: number; y: number; s?: number; hue?: string; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="ob-float" style={{ animationDelay: `${-delay}s` }}>
        <circle r="34" fill="url(#ob-glow-pink)" opacity="0.55" />
        <path d="M-18 4 C-18 -22 18 -22 18 4 C10 8 -10 8 -18 4Z" fill={hue} fillOpacity="0.55" stroke={hue} strokeWidth="1.2" />
        <ellipse cx="-4" cy="-7" rx="7" ry="4" fill="#fff" fillOpacity="0.5" />
        {[-12, -6, 0, 6, 12].map((o, i) => (
          <path key={o} d={`M${o} 6 q${i % 2 ? 6 : -6} 14 0 26 t0 22`} fill="none" stroke={hue} strokeOpacity="0.7" strokeWidth="1.3" strokeLinecap="round" className="ob-sway" style={{ animationDelay: `${-i * 0.6}s` }} />
        ))}
      </g>
    </g>
  );
}

function Seabed({ y = 400 }: { y?: number }) {
  return (
    <g>
      <path d={`M0 ${y + 30} C120 ${y - 10} 240 ${y + 20} 380 ${y} C520 ${y - 18} 660 ${y + 24} 800 ${y - 4} V500 H0Z`} fill="url(#ob-sand)" />
      <path d={`M0 ${y + 52} C140 ${y + 24} 300 ${y + 50} 460 ${y + 30} C620 ${y + 12} 720 ${y + 44} 800 ${y + 30} V500 H0Z`} fill="#04111b" fillOpacity="0.85" />
    </g>
  );
}

function branch(x: number, y: number, a: number, len: number, depth: number, rnd: () => number, out: { d: string; w: number }[], tips: [number, number][]) {
  const x2 = x + Math.cos(a) * len;
  const y2 = y + Math.sin(a) * len;
  out.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`, w: depth * 1.7 + 1 });
  if (depth <= 0) {
    tips.push([x2, y2]);
    return;
  }
  const n = depth > 2 ? 2 : rnd() > 0.35 ? 2 : 3;
  for (let i = 0; i < n; i++) {
    const spread = (i - (n - 1) / 2) * (0.55 + rnd() * 0.3);
    branch(x2, y2, a + spread + (rnd() - 0.5) * 0.25, len * (0.68 + rnd() * 0.12), depth - 1, rnd, out, tips);
  }
}

function Coral({ x, y, s = 1, seed = 3, depth = 4, glow = "#fb7185" }: { x: number; y: number; s?: number; seed?: number; depth?: number; glow?: string }) {
  const rnd = lcg(seed);
  const parts: { d: string; w: number }[] = [];
  const tips: [number, number][] = [];
  branch(0, 0, -Math.PI / 2, 34, depth, rnd, parts, tips);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {parts.map((p, i) => (
        <path key={i} d={p.d} stroke="url(#ob-coral)" strokeWidth={p.w} strokeLinecap="round" fill="none" />
      ))}
      {tips.map(([tx, ty], i) => (
        <g key={i}>
          <circle cx={tx} cy={ty} r="6" fill={glow} fillOpacity="0.35" className="ob-twinkle" style={{ animationDelay: `${-(i % 7) * 0.5}s` }} />
          <circle cx={tx} cy={ty} r="2.2" fill="#ffe4e6" />
        </g>
      ))}
    </g>
  );
}

function Plank({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <rect x={x} y={y} width={w} height={h} fill="url(#ob-wood)" stroke="#0a0605" strokeWidth="1.5" />;
}

function Ponte() {
  return (
    <Frame>
      <Rays xs={[120, 300, 470, 640]} width={80} />
      <g opacity="0.55">
        <path d="M560 330 L640 250 L650 120 L690 120 L690 330Z" fill="#06202d" />
        <path d="M0 330 L70 300 L90 180 L130 180 L120 330Z" fill="#06202d" />
      </g>
      <Fish x={-40} y={110} s={0.8} delay={3} speed={34} />
      <Fish x={-10} y={126} s={0.6} delay={5} speed={34} />
      <Fish x={-70} y={96} s={0.7} delay={1} speed={34} />
      <Fish x={-30} y={148} s={0.5} delay={7} speed={34} />
      <g className="ob-drift">
        <path d="M400 40 C470 24 520 52 600 44 C560 74 470 76 400 40Z" fill="#031018" fillOpacity="0.7" />
      </g>
      <path d="M330 340 L330 70 L342 70 L342 340Z" fill="#2a1d18" />
      <path d="M342 80 C400 100 420 150 390 230 C380 200 360 170 342 170Z" fill="#c7b79a" fillOpacity="0.22" className="ob-sway" style={{ transformOrigin: "342px 80px" }} />
      <path d="M330 96 C280 120 276 180 304 250 C312 210 322 190 330 190Z" fill="#c7b79a" fillOpacity="0.16" className="ob-sway" style={{ animationDelay: "-2s", transformOrigin: "330px 96px" }} />
      <path d="M0 330 H800 V500 H0Z" fill="#0b1a22" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${400 + (i - 4) * 18} 330 L${400 + (i - 4) * 150} 500`} stroke="#050c10" strokeWidth="3" />
      ))}
      {[340, 372, 412, 462].map((yy, i) => (
        <path key={yy} d={`M0 ${yy} H800`} stroke="#050c10" strokeWidth={2 + i * 0.6} />
      ))}
      <path d="M0 330 H800 V345 H0Z" fill="#17313b" />
      <path d="M0 345 H800" stroke="#7ff3e6" strokeOpacity="0.2" />
      <g>
        <rect x="38" y="262" width="14" height="86" rx="3" fill="#0f2b36" />
        <rect x="748" y="262" width="14" height="86" rx="3" fill="#0f2b36" />
        <path d="M45 270 Q400 330 755 270" fill="none" stroke="#1d4a5a" strokeWidth="6" />
        <path d="M45 292 Q400 352 755 292" fill="none" stroke="#17404f" strokeWidth="4" />
        {[110, 210, 300, 500, 590, 690].map((x) => (
          <rect key={x} x={x} y="276" width="6" height="64" rx="2" fill="#12333f" />
        ))}
      </g>
      <g transform="translate(610 328)">
        <circle r="64" fill="url(#ob-glow-aqua)" opacity="0.35" className="ob-pulse" />
        <g className="ob-sway" style={{ animationDuration: "9s", transformOrigin: "0 0" }}>
          <circle r="52" fill="none" stroke="#6b4a2b" strokeWidth="10" />
          <circle r="52" fill="none" stroke="#b98a52" strokeWidth="3" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <g key={i}>
                <path d={`M0 0 L${Math.cos(a) * 70} ${Math.sin(a) * 70}`} stroke="#6b4a2b" strokeWidth="6" strokeLinecap="round" />
                <circle cx={Math.cos(a) * 70} cy={Math.sin(a) * 70} r="5" fill="#b98a52" />
              </g>
            );
          })}
          <circle r="11" fill="#2a1d18" stroke="#b98a52" strokeWidth="2" />
        </g>
        <path d="M-10 52 L-18 130 L18 130 L10 52Z" fill="#1d1511" />
      </g>
      <g transform="translate(150 360)">
        <path d="M0 -8 C-30 -10 -34 40 -20 52 L22 52 C36 40 30 -10 0 -8Z" fill="#2d1f19" stroke="#0b0705" strokeWidth="2" />
        <path d="M-26 8 H26 M-28 26 H28" stroke="#6b4a2b" strokeWidth="4" />
        <g transform="translate(54 14)">
          <circle r="22" fill="#2d1f19" stroke="#0b0705" strokeWidth="2" />
          <path d="M-18 -4 H18 M-18 8 H18" stroke="#6b4a2b" strokeWidth="3" />
        </g>
        <Coral x={-14} y={-4} s={0.34} seed={11} depth={3} />
      </g>
      <g transform="translate(450 395)">
        <path d="M0 -50 V40 M-26 -34 H26" stroke="#9fb4bb" strokeWidth="7" strokeLinecap="round" />
        <circle cy="-56" r="8" fill="none" stroke="#9fb4bb" strokeWidth="5" />
        <path d="M-40 18 C-38 46 -14 52 0 52 C14 52 38 46 40 18" fill="none" stroke="#9fb4bb" strokeWidth="7" strokeLinecap="round" />
        <path d="M-46 22 L-34 14 L-34 30Z M46 22 L34 14 L34 30Z" fill="#9fb4bb" />
        <path d="M-6 -4 C-4 -14 4 -14 6 -4" stroke="#fb7185" strokeWidth="2" fill="none" />
      </g>
      <Jelly x={210} y={170} s={1} delay={0} />
      <Jelly x={690} y={90} s={0.7} delay={3} hue="#7ff3e6" />
      <Bubbles seed={2} />
      <Snow seed={4} />
      <rect width="800" height="500" fill="#02080f" fillOpacity="0.18" />
    </Frame>
  );
}

function Cabina() {
  return (
    <Frame>
      <rect width="800" height="500" fill="#0c1a20" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={i * 68 - 8} y="0" width="64" height="500" fill="url(#ob-wood)" stroke="#070c0e" strokeWidth="2" opacity="0.92" />
      ))}
      <rect width="800" height="500" fill="#04222b" fillOpacity="0.45" />
      <g transform="translate(400 190)">
        <circle r="146" fill="#0a1214" stroke="#4a3626" strokeWidth="16" />
        <circle r="134" fill="#0a1214" stroke="#9a7440" strokeWidth="5" />
        <clipPath id="ob-port">
          <circle r="128" />
        </clipPath>
        <g clipPath="url(#ob-port)">
          <rect x="-140" y="-140" width="280" height="280" fill="url(#ob-sea)" />
          <g transform="translate(-400 -190)">
            <Rays xs={[300, 420, 520]} width={50} opacity={0.9} />
          </g>
          <g transform="translate(-400 -190)">
            <Fish x={-40} y={170} s={0.9} color="#0d3a4a" delay={2} speed={22} />
            <Fish x={-70} y={200} s={0.6} color="#0d3a4a" delay={6} speed={22} />
            <Fish x={-20} y={236} s={0.7} color="#0d3a4a" delay={9} speed={22} />
          </g>
          <g transform="translate(40 40) scale(0.9)">
            <Jelly x={0} y={0} s={0.8} delay={2} hue="#7ff3e6" />
          </g>
          <path d="M-130 70 C-60 40 40 90 130 56 V140 H-130Z" fill="#061a24" />
          <Coral x={-70} y={96} s={0.55} seed={21} depth={3} />
          <Coral x={60} y={100} s={0.45} seed={22} depth={3} glow="#f472b6" />
        </g>
        <circle r="134" fill="none" stroke="#e8d6a8" strokeOpacity="0.14" strokeWidth="2" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(a) * 140} cy={Math.sin(a) * 140} r="4.5" fill="#c9a15a" stroke="#4a3626" />;
        })}
        <path d="M-70 -84 C-50 -112 -10 -118 20 -112" stroke="#fff" strokeOpacity="0.2" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(90 40)">
        <path d="M0 0 V70" stroke="#6b5a40" strokeWidth="3" />
        <g className="ob-swing" style={{ transformOrigin: "0px 70px" }}>
          <circle cy="130" r="70" fill="url(#ob-glow-amber)" opacity="0.7" className="ob-pulse" />
          <path d="M-18 76 H18 L24 94 H-24Z" fill="#5a4326" />
          <rect x="-22" y="94" width="44" height="50" rx="8" fill="#fde68a" fillOpacity="0.25" stroke="#b58b4a" strokeWidth="3" />
          <path d="M-4 138 Q0 108 4 138 Q0 142 -4 138Z" fill="#fff7d1" className="ob-flame" />
          <path d="M-24 144 H24 L18 156 H-18Z" fill="#5a4326" />
        </g>
      </g>
      <g transform="translate(704 50)">
        <path d="M0 0 V50" stroke="#6b5a40" strokeWidth="3" />
        <g className="ob-swing" style={{ animationDelay: "-1.2s", transformOrigin: "0px 50px" }}>
          <circle cy="108" r="60" fill="url(#ob-glow-amber)" opacity="0.6" className="ob-pulse" style={{ animationDelay: "-1s" }} />
          <rect x="-18" y="74" width="36" height="42" rx="7" fill="#fde68a" fillOpacity="0.22" stroke="#b58b4a" strokeWidth="3" />
          <path d="M-3 110 Q0 88 3 110 Q0 114 -3 110Z" fill="#fff7d1" className="ob-flame" />
          <path d="M-20 54 H20 L14 74 H-14Z M-20 116 H20 L14 128 H-14Z" fill="#5a4326" />
        </g>
      </g>
      <rect x="40" y="330" width="720" height="14" rx="3" fill="#4a3626" />
      <rect x="40" y="344" width="720" height="156" fill="#1c130f" />
      <rect x="60" y="360" width="150" height="120" rx="4" fill="#241811" stroke="#4a3626" strokeWidth="3" />
      <rect x="590" y="360" width="150" height="120" rx="4" fill="#241811" stroke="#4a3626" strokeWidth="3" />
      <g transform="translate(260 326)">
        <path d="M0 0 L190 -10 L210 16 L-6 24Z" fill="#cdbf9a" fillOpacity="0.85" />
        <path d="M20 8 C50 -4 70 14 100 4 S150 -2 180 6 M30 14 L60 6 M120 12 L170 4" stroke="#5a4326" strokeWidth="1.5" fill="none" />
        <path d="M50 10 l8 -6 M140 4 l8 6 M96 8 l0 -8 M100 4 h-8" stroke="#be123c" strokeWidth="2" />
        <circle cx="170" cy="-14" r="18" fill="#3a2a16" stroke="#c9a15a" strokeWidth="3" />
        <circle cx="170" cy="-14" r="14" fill="#06202d" />
        <g className="ob-sway" style={{ transformOrigin: "170px -14px", animationDuration: "3s" }}>
          <path d="M170 -26 L174 -14 L170 -2 L166 -14Z" fill="#f43f5e" />
          <path d="M170 -2 L174 -14 L170 -26" fill="#e2e8f0" />
        </g>
      </g>
      <g transform="translate(120 322)">
        <path d="M-14 -34 L14 -34 L12 -4 H-12Z" fill="#7ff3e6" fillOpacity="0.22" stroke="#7ff3e6" strokeOpacity="0.6" />
        <rect x="-5" y="-48" width="10" height="14" fill="#7ff3e6" fillOpacity="0.3" />
        <circle cy="-18" r="4" fill="#7ff3e6" className="ob-twinkle" />
        <path d="M30 -2 H80 L72 -22 H38Z" fill="#6b4a2b" />
        <path d="M56 -22 V-64 L84 -30 H56 M56 -64 L36 -30 H56" fill="#e7dcc0" fillOpacity="0.7" />
      </g>
      <g transform="translate(660 322)">
        <path d="M-50 0 V-120 H50 V0" fill="none" />
        <rect x="-52" y="-96" width="104" height="6" fill="#4a3626" />
        <rect x="-52" y="-50" width="104" height="6" fill="#4a3626" />
        {[-36, -10, 16, 38].map((x, i) => (
          <rect key={x} x={x - 7} y={-130 + (i % 2) * 8} width="14" height={34 - (i % 2) * 8} rx="2" fill={["#be123c", "#0f766e", "#7c3aed", "#b45309"][i]} fillOpacity="0.85" />
        ))}
        {[-34, -6, 26].map((x, i) => (
          <path key={x} d={`M${x - 6} -50 V${-76 - i * 4} h12 V-50`} fill="#7ff3e6" fillOpacity="0.25" stroke="#7ff3e6" strokeOpacity="0.5" />
        ))}
      </g>
      <Jelly x={90} y={290} s={0.6} delay={4} />
      <Bubbles count={10} seed={31} />
      <Snow count={26} seed={14} />
      <rect width="800" height="500" fill="#02080f" fillOpacity="0.2" />
    </Frame>
  );
}

const MACH_GEARS: [number, number, number, number, boolean][] = [
  [110, 120, 70, 14, false],
  [236, 66, 44, 10, true],
  [690, 130, 80, 16, true],
  [570, 60, 40, 9, false],
  [740, 350, 56, 12, false],
];

function Gauge({ x, y, r = 34, delay = 0 }: { x: number; y: number; r?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 6} fill="#0a2430" stroke="#4b8a99" strokeWidth="3" />
      <circle r={r} fill="#051820" stroke="#2dd4bf" strokeOpacity="0.5" />
      {Array.from({ length: 11 }, (_, i) => {
        const a = (-210 + i * 24) * (Math.PI / 180);
        return <path key={i} d={`M${Math.cos(a) * (r - 8)} ${Math.sin(a) * (r - 8)} L${Math.cos(a) * (r - 2)} ${Math.sin(a) * (r - 2)}`} stroke={i > 8 ? "#fb7185" : "#7ff3e6"} strokeWidth="1.6" />;
      })}
      <g className="ob-sway" style={{ animationDuration: "2.6s", animationDelay: `${-delay}s`, transformOrigin: "0px 0px", transformBox: "view-box" }}>
        <path d="M0 0 L0 -23" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      <circle r="3.5" fill="#fef08a" />
    </g>
  );
}

function Macchine() {
  return (
    <Frame>
      <rect width="800" height="500" fill="#06161d" />
      {MACH_GEARS.map(([x, y, r, t, rev], i) => (
        <g key={i} transform={`translate(${x} ${y})`} opacity="0.5">
          <g className={rev ? "ob-spin-rev" : "ob-spin"} style={{ animationDuration: `${30 + i * 6}s` }}>
            <path d={gearPath(r, t, r * 0.18)} fill="#0b2e3a" stroke="#2dd4bf" strokeOpacity="0.5" strokeWidth="2" />
            <circle r={r * 0.62} fill="#051820" stroke="#2dd4bf" strokeOpacity="0.4" />
            {Array.from({ length: 5 }, (_, k) => (
              <path key={k} d={`M0 0 L${Math.cos((k / 5) * 6.283) * r * 0.62} ${Math.sin((k / 5) * 6.283) * r * 0.62}`} stroke="#2dd4bf" strokeOpacity="0.4" strokeWidth="5" />
            ))}
            <circle r={r * 0.14} fill="#7ff3e6" fillOpacity="0.6" />
          </g>
        </g>
      ))}
      <rect x="0" y="420" width="800" height="80" fill="#04111a" />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M${i * 54} 420 l27 20 l27 -20`} fill="none" stroke="#2dd4bf" strokeOpacity="0.18" strokeWidth="3" />
      ))}
      <rect x="0" y="414" width="800" height="8" fill="#1f5a6b" />
      <g>
        <rect x="0" y="80" width="800" height="20" fill="url(#ob-metal)" />
        <rect x="0" y="82" width="800" height="3" fill="#7ff3e6" fillOpacity="0.25" />
        {[90, 270, 520, 710].map((x) => (
          <rect key={x} x={x} y="76" width="16" height="28" rx="3" fill="#2b7285" />
        ))}
        <rect x="140" y="0" width="22" height="82" fill="url(#ob-metal)" />
        <rect x="640" y="0" width="22" height="82" fill="url(#ob-metal)" />
        <rect x="60" y="190" width="680" height="16" fill="url(#ob-metal)" />
        <rect x="100" y="206" width="18" height="214" fill="url(#ob-metal)" />
        <rect x="690" y="206" width="18" height="214" fill="url(#ob-metal)" />
      </g>
      <g transform="translate(400 300)">
        <ellipse cy="116" rx="130" ry="14" fill="#02080f" fillOpacity="0.6" />
        <path d="M-120 -90 C-120 -122 120 -122 120 -90 V100 C120 128 -120 128 -120 100Z" fill="url(#ob-metal)" stroke="#0a2330" strokeWidth="3" />
        <path d="M-120 -40 H120 M-120 30 H120" stroke="#04141c" strokeWidth="5" />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <circle cx={-96 + i * 24} cy={-44} r="3.4" fill="#5eb6c8" />
            <circle cx={-96 + i * 24} cy={26} r="3.4" fill="#5eb6c8" />
          </g>
        ))}
        <rect x="-70" y="-14" width="140" height="34" rx="8" fill="#031018" stroke="#2dd4bf" strokeOpacity="0.6" strokeWidth="2" />
        <g>
          {[-48, -24, 0, 24, 48].map((x, i) => (
            <circle key={x} cx={x} cy="3" r="7" fill={["#4ade80", "#fb7185", "#4ade80", "#fde047", "#38bdf8"][i]} className="ob-twinkle" style={{ animationDelay: `${-i * 0.7}s`, animationDuration: "2s" }} />
          ))}
        </g>
        <path d="M-96 -80 C-60 -96 60 -96 96 -80" stroke="#7ff3e6" strokeOpacity="0.35" strokeWidth="4" fill="none" strokeLinecap="round" />
        <g transform="translate(0 70)">
          <circle r="26" fill="#0a2430" stroke="#4b8a99" strokeWidth="4" />
          <g className="ob-spin-fast" style={{ animationDuration: "8s" }}>
            {Array.from({ length: 6 }, (_, k) => (
              <path key={k} d={`M0 0 L${Math.cos((k / 6) * 6.283) * 22} ${Math.sin((k / 6) * 6.283) * 22}`} stroke="#7ff3e6" strokeWidth="3" strokeLinecap="round" />
            ))}
          </g>
        </g>
      </g>
      <Gauge x={225} y={300} delay={0} />
      <Gauge x={575} y={300} delay={1.3} />
      <Gauge x={225} y={380} r={24} delay={0.6} />
      <Gauge x={575} y={380} r={24} delay={2} />
      {[[300, 140], [500, 140]].map(([x, y], i) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <circle r="24" fill="#0a2430" stroke="#4b8a99" strokeWidth="4" />
          <g className="ob-spin-fast" style={{ animationDuration: `${12 + i * 4}s` }}>
            <path d="M-20 0 H20 M0 -20 V20" stroke="#fb7185" strokeWidth="5" strokeLinecap="round" />
          </g>
          <circle r="5" fill="#fb7185" />
        </g>
      ))}
      <g transform="translate(400 30)">
        <circle cy="130" r="100" fill="url(#ob-glow-aqua)" opacity="0.15" className="ob-pulse" />
        <circle cx="-60" cy="130" r="4" fill="#7ff3e6" className="ob-twinkle" />
        <circle cx="70" cy="140" r="3" fill="#7ff3e6" className="ob-twinkle" style={{ animationDelay: "-1.4s" }} />
      </g>
      <Jelly x={70} y={310} s={0.7} delay={2} hue="#7ff3e6" />
      <Bubbles count={26} seed={44} />
      <Snow count={22} seed={52} />
      <rect width="800" height="500" fill="#02080f" fillOpacity="0.25" />
    </Frame>
  );
}

function Whale() {
  return (
    <g className="ob-swim" style={{ animationDuration: "70s" }}>
      <g transform="translate(-120 70) scale(1.1)" opacity="0.4">
        <path d="M0 40 C30 -2 100 -10 170 20 C210 36 240 40 270 24 C262 44 268 64 288 74 C262 70 248 62 238 52 C206 70 140 82 90 76 C50 72 20 62 0 40Z" fill="#031018" />
        <path d="M60 64 C80 82 120 90 150 80" fill="none" stroke="#7ff3e6" strokeOpacity="0.2" strokeWidth="2" />
        <circle cx="30" cy="44" r="2" fill="#7ff3e6" fillOpacity="0.6" />
      </g>
    </g>
  );
}

function Campana() {
  return (
    <Frame>
      <Rays xs={[80, 230, 400, 560, 700]} width={100} opacity={1.1} />
      <Whale />
      <Fish x={-30} y={190} s={0.9} delay={2} speed={30} />
      <Fish x={-60} y={206} s={0.7} delay={4} speed={30} />
      <Fish x={-10} y={176} s={0.6} delay={6} speed={30} />
      <Fish x={-80} y={224} s={0.8} delay={8} speed={30} />
      <path d="M0 330 C90 300 140 330 220 310 C320 286 360 320 460 306 C560 292 640 322 800 300 V500 H0Z" fill="#07202c" />
      <Seabed y={392} />
      <g opacity="0.9">
        <Coral x={96} y={420} s={1.15} seed={4} depth={4} />
        <Coral x={188} y={440} s={0.7} seed={8} depth={3} glow="#f472b6" />
        <Coral x={632} y={430} s={1.05} seed={13} depth={4} glow="#f472b6" />
        <Coral x={728} y={446} s={0.8} seed={19} depth={3} />
      </g>
      <g transform="translate(400 430)">
        <ellipse cy="14" rx="120" ry="14" fill="#02080f" fillOpacity="0.6" />
        <circle cy="-110" r="170" fill="url(#ob-glow-pink)" opacity="0.4" className="ob-pulse" />
        <Coral x={0} y={0} s={2.6} seed={2} depth={5} />
      </g>
      <g transform="translate(300 450)">
        <path d="M0 0 C-14 -26 8 -40 26 -20 C40 -4 30 10 12 6 C0 4 2 -10 12 -8" fill="none" stroke="#e7d5c6" strokeWidth="3" strokeLinecap="round" />
      </g>
      {[[160, 470, 16], [520, 470, 22], [690, 480, 14]].map(([x, y, r]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <path d={`M${-r} 0 C${-r} ${-r * 1.3} ${r} ${-r * 1.3} ${r} 0Z`} fill="#c9b8a8" />
          <path d={`M0 0 V${-r * 1.1} M${-r * 0.5} 0 L${-r * 0.35} ${-r} M${r * 0.5} 0 L${r * 0.35} ${-r}`} stroke="#7d6a5c" strokeWidth="1.4" />
        </g>
      ))}
      <Jelly x={230} y={170} s={1.1} delay={0} />
      <Jelly x={570} y={130} s={0.8} delay={2.5} hue="#7ff3e6" />
      <Jelly x={720} y={220} s={0.6} delay={5} />
      <Bubbles count={30} seed={61} />
      <Snow count={46} seed={72} />
    </Frame>
  );
}

const SCENES: Record<string, () => ReactNode> = {
  ponte: Ponte,
  cabina: Cabina,
  macchine: Macchine,
  campana: Campana,
};

export function RoomScene({ id }: { id: string }) {
  const Scene = SCENES[id] ?? Ponte;
  return <Scene />;
}
