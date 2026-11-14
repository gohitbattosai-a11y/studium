import "../dungeon/dungeon.css";

type Place = { x: number; y: number; s: number };

const PORTALS = [
  { key: "covo", x: -52, top: -46, w: 17, color: "#84cc16", dark: "#1a2e05", delay: "0.4s" },
  { key: "cripta", x: 0, top: -68, w: 25, color: "#a855f7", dark: "#2e1065", delay: "0s" },
  { key: "antro", x: 52, top: -46, w: 17, color: "#f43f5e", dark: "#4c0519", delay: "0.8s" },
];

function Portal({ x, top, w, color, dark, delay, id }: { x: number; top: number; w: number; color: string; dark: string; delay: string; id: string }) {
  const arch = `M${-w} 16 L${-w} ${top + w} Q${-w} ${top} 0 ${top} Q${w} ${top} ${w} ${top + w} L${w} 16Z`;
  return (
    <g transform={`translate(${x} 0)`}>
      <defs>
        <radialGradient id={`gt-${id}`} cx="0.5" cy="0.75" r="0.8">
          <stop offset="0" stopColor={color} stopOpacity="0.95" />
          <stop offset="0.55" stopColor={color} stopOpacity="0.38" />
          <stop offset="1" stopColor={dark} stopOpacity="1" />
        </radialGradient>
      </defs>
      <path d={`M${-w - 5} 16 L${-w - 5} ${top + w} Q${-w - 5} ${top - 5} 0 ${top - 5} Q${w + 5} ${top - 5} ${w + 5} ${top + w} L${w + 5} 16Z`} fill="#2a2d3a" stroke="#14151c" strokeWidth="1.2" />
      <path d={arch} fill="#07040d" />
      <path d={arch} fill={`url(#gt-${id})`} className="dg-gleam" style={{ animationDelay: delay }} />
      <g className="dg-portal" style={{ animationDelay: delay }}>
        <ellipse cx="0" cy={top + w + 14} rx={w * 0.62} ry={w * 0.95} fill="none" stroke={color} strokeWidth="1.6" opacity="0.7" />
        <ellipse cx="0" cy={top + w + 14} rx={w * 0.34} ry={w * 0.55} fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
      </g>
      <path d={`M${-w - 5} ${top + w} Q${-w - 5} ${top - 5} 0 ${top - 5}`} stroke="#fff" strokeWidth="1.4" fill="none" opacity="0.18" />
      <path d={`M${-4} ${top - 6} L0 ${top - 14} L4 ${top - 6}Z`} fill={color} stroke="#14151c" strokeWidth="0.8" />
      <rect x={-w - 3} y="14" width={w * 2 + 6} height="6" rx="1.5" fill="#8a90a8" />
    </g>
  );
}

export function Dungeon3D() {
  return (
    <g>
      <defs>
        <linearGradient id="gt-rock" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7a7f92" />
          <stop offset="0.5" stopColor="#4b4f5c" />
          <stop offset="1" stopColor="#2c2e38" />
        </linearGradient>
        <linearGradient id="gt-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e94ac" />
          <stop offset="1" stopColor="#555a70" />
        </linearGradient>
        <pattern id="gt-brick" width="16" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 0.4H16M0 5.4H16M8 0V5M0 5V10M16 5V10" stroke="#000" strokeOpacity="0.28" fill="none" strokeWidth="0.8" />
        </pattern>
        <linearGradient id="gt-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <ellipse cx="4" cy="22" rx="116" ry="38" fill="#000" opacity="0.28" />
      <path d="M-114 22 Q-118 -30 -76 -62 Q-46 -92 -18 -110 Q0 -128 22 -112 Q52 -92 80 -62 Q118 -30 114 22 Q0 44 -114 22Z" fill="url(#gt-rock)" />
      <path d="M-114 22 Q-118 -30 -76 -62 Q-46 -92 -18 -110 Q0 -128 -6 -96 Q-40 -64 -58 -24 Q-82 8 -114 22Z" fill="#8a90a6" opacity="0.5" />
      <path d="M114 22 Q118 -30 80 -62 Q56 -48 50 -12 Q80 8 114 22Z" fill="#23252e" opacity="0.6" />
      {[[-90, -14, 16], [88, -18, 14], [-62, -62, 12], [60, -72, 11], [98, 6, 10], [-102, 8, 9], [-22, -102, 9], [20, -104, 8]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r * 1.4} ry={r} fill={i % 2 ? "#6a6f80" : "#3a3d49"} opacity="0.8" />
      ))}
      <path d="M-100 -22 Q-86 -40 -72 -26 M70 -52 Q84 -66 98 -48 M-48 -78 Q-34 -92 -22 -78" stroke="#3f8a3f" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M-104 -14 Q-92 -26 -80 -16 M76 -40 Q88 -50 100 -36" stroke="#66bd68" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
      <g transform="translate(-98 -20)">
        <rect x="-2" width="4" height="14" fill="#5a3a1a" />
        <circle cy="-6" r="11" fill="#2f7a3a" />
        <circle cx="-3" cy="-9" r="6" fill="#3f9248" />
      </g>
      <g transform="translate(96 -24)">
        <rect x="-2" width="4" height="14" fill="#5a3a1a" />
        <circle cy="-6" r="10" fill="#2f7a3a" />
        <circle cx="3" cy="-9" r="5" fill="#3f9248" />
      </g>
      <rect x="-78" y="-90" width="156" height="14" rx="4" fill="#9aa0b8" stroke="#3a3d4d" strokeWidth="1" />
      <rect x="-74" y="-78" width="148" height="96" rx="4" fill="url(#gt-wall)" stroke="#3a3d4d" strokeWidth="1.2" />
      <rect x="-74" y="-78" width="148" height="96" rx="4" fill="url(#gt-brick)" />
      {[-72, -26, 26, 72].map((x) => (
        <g key={x}>
          <rect x={x - 5} y="-80" width="10" height="100" rx="2" fill="#9aa0b8" stroke="#3a3d4d" strokeWidth="0.8" />
          <rect x={x - 7} y="-84" width="14" height="6" rx="2" fill="#aab0c8" />
          <rect x={x - 7} y="14" width="14" height="6" rx="2" fill="#aab0c8" />
        </g>
      ))}
      {PORTALS.map((p) => (
        <Portal key={p.key} id={p.key} x={p.x} top={p.top} w={p.w} color={p.color} dark={p.dark} delay={p.delay} />
      ))}
      <g transform="translate(0 -100)">
        <path d="M-17 -2 Q-19 -22 0 -22 Q19 -22 17 -2 L12 6 L-12 6Z" fill="#ebe5d0" stroke="#8d866f" strokeWidth="1" />
        <ellipse cx="-6.5" cy="-8" rx="4.4" ry="5.2" fill="#14101c" />
        <ellipse cx="6.5" cy="-8" rx="4.4" ry="5.2" fill="#14101c" />
        <circle cx="-6.5" cy="-8" r="2" fill="#c084fc" className="ct-glow" />
        <circle cx="6.5" cy="-8" r="2" fill="#c084fc" className="ct-glow" />
        <path d="M-5 6 L-5 0 M0 6 L0 0 M5 6 L5 0" stroke="#8d866f" strokeWidth="1.4" />
        <path d="M-24 -4 Q-30 -12 -26 -18 M24 -4 Q30 -12 26 -18" stroke="#ebe5d0" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      {[[-36, 0, "#84cc16"], [36, 0, "#f43f5e"]].map(([x, , c]) => (
        <g key={x as number} className="dg-sway" style={{ transformOrigin: `${x}px -76px` }}>
          <path d={`M${(x as number) - 7} -76 L${(x as number) + 7} -76 L${(x as number) + 7} -42 L${x} -48 L${(x as number) - 7} -42Z`} fill={c as string} stroke="#000" strokeOpacity="0.4" />
          <circle cx={x as number} cy="-64" r="3" fill="url(#gt-gold)" />
        </g>
      ))}
      <path d="M-38 18 L38 18 L46 28 L-46 28Z" fill="#a3a9c0" />
      <path d="M-30 12 L30 12 L38 20 L-38 20Z" fill="#b8bed6" />
      <path d="M-46 28 L46 28 L52 34 L-52 34Z" fill="#8a90a8" />
      {[-92, 92].map((x) => (
        <g key={x} transform={`translate(${x} -18)`}>
          <ellipse cy="40" rx="14" ry="5" fill="#000" opacity="0.3" />
          <rect x="-5" y="2" width="10" height="38" rx="2" fill="#6a6f84" stroke="#3a3d4d" />
          <path d="M-12 2 L12 2 L8 -8 L-8 -8Z" fill="#8a90a8" stroke="#3a3d4d" />
          <path d="M0 -30 Q-12 -16 -7 -9 Q0 -4 7 -9 Q12 -16 0 -30Z" fill="#fb923c" className="ct-glow" />
          <path d="M0 -20 Q-5 -12 -3 -9 Q0 -6 3 -9 Q5 -12 0 -20Z" fill="#fff3bf" />
        </g>
      ))}
      {[[-26, 30, 8], [30, 31, 6], [-70, 26, 5], [74, 27, 6]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill="#5d6272" stroke="#2c2e38" strokeWidth="0.8" />
      ))}
      <g className="dg-fog" opacity="0.28">
        <ellipse cx="-30" cy="26" rx="60" ry="8" fill="#e2e8f0" />
        <ellipse cx="40" cy="32" rx="50" ry="6" fill="#e2e8f0" />
      </g>
      {[[-14, -50], [18, -62], [-4, -30], [10, -40]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="#e9d5ff" className="dg-gleam" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
    </g>
  );
}

export function DungeonNight({ x, y, s }: Place) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none">
      <ellipse cx="0" cy="14" rx="96" ry="30" fill="#a855f7" opacity="0.16" />
      <ellipse cx="0" cy="-22" rx="34" ry="46" fill="#c084fc" opacity="0.4" className="ct-glow" />
      <ellipse cx="-50" cy="-12" rx="18" ry="28" fill="#84cc16" opacity="0.3" className="ct-glow" style={{ animationDelay: "0.3s" }} />
      <ellipse cx="50" cy="-12" rx="18" ry="28" fill="#f43f5e" opacity="0.3" className="ct-glow" style={{ animationDelay: "0.8s" }} />
      <circle cx="-84" cy="-34" r="26" fill="url(#cm-lamp)" className="ct-glow" />
      <circle cx="84" cy="-34" r="26" fill="url(#cm-lamp)" className="ct-glow" style={{ animationDelay: "0.5s" }} />
    </g>
  );
}
