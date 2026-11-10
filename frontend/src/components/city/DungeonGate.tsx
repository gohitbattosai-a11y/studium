type Place = { x: number; y: number; s: number };

export function Dungeon3D() {
  return (
    <g>
      <ellipse cx="4" cy="20" rx="104" ry="36" fill="#000" opacity="0.26" />
      <path d="M-96 18 Q-98 -34 -60 -64 Q-30 -96 0 -98 Q34 -96 62 -66 Q98 -34 96 18 Q0 40 -96 18Z" fill="#4b4f5c" />
      <path d="M-96 18 Q-98 -34 -60 -64 Q-30 -96 0 -98 Q-24 -60 -40 -20 Q-60 8 -96 18Z" fill="#5d6272" />
      <path d="M96 18 Q98 -34 62 -66 Q40 -50 38 -14 Q60 6 96 18Z" fill="#3a3d49" />
      {[[-70, -20, 14], [66, -24, 12], [-44, -64, 10], [40, -70, 9], [78, 2, 9], [-82, 4, 8]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r * 1.4} ry={r} fill={i % 2 ? "#6a6f80" : "#3f424e"} opacity="0.85" />
      ))}
      <path d="M-70 -30 Q-60 -44 -48 -34 M52 -42 Q62 -54 72 -42" stroke="#3a7a3a" strokeWidth="5" strokeLinecap="round" fill="none" />
      <rect x="-48" y="-62" width="96" height="74" rx="10" fill="#6a6f84" />
      <rect x="-48" y="-62" width="96" height="14" rx="7" fill="#8a90a8" />
      <path d="M-30 14 L-30 -22 Q-30 -50 0 -50 Q30 -50 30 -22 L30 14Z" fill="#0a0612" />
      <path d="M-30 14 L-30 -22 Q-30 -50 0 -50 Q30 -50 30 -22 L30 14Z" fill="#7c3aed" opacity="0.3" />
      <path d="M-18 14 L-18 -18 Q-18 -38 0 -38 Q18 -38 18 -18 L18 14Z" fill="#a855f7" opacity="0.32" />
      <path d="M-34 10 L34 10 L40 22 L-40 22Z" fill="#8a90a8" />
      <path d="M-28 4 L28 4 L34 14 L-34 14Z" fill="#a3a9c0" />
      <rect x="-9" y="-70" width="18" height="14" rx="5" fill="#ebe5d0" />
      <rect x="-5" y="-60" width="10" height="7" rx="2" fill="#ebe5d0" />
      <circle cx="-3.6" cy="-65" r="2.2" fill="#1b1620" />
      <circle cx="3.6" cy="-65" r="2.2" fill="#1b1620" />
      {[-40, 40].map((x) => (
        <g key={x} transform={`translate(${x} -22)`}>
          <rect x="-2" y="0" width="4" height="22" rx="1.5" fill="#3a2a1a" />
          <path d="M0 -16 Q-7 -6 -4 -1 Q0 2 4 -1 Q7 -6 0 -16Z" fill="#fb923c" className="ct-glow" />
          <path d="M0 -10 Q-3 -4 -2 -1 Q0 1 2 -1 Q3 -4 0 -10Z" fill="#fff3bf" />
        </g>
      ))}
      <path d="M-14 -34 L-14 -20 M0 -40 L0 -22 M14 -34 L14 -20" stroke="#c084fc" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
    </g>
  );
}

export function DungeonNight({ x, y, s }: Place) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none">
      <ellipse cx="0" cy="14" rx="96" ry="30" fill="#a855f7" opacity="0.16" />
      <ellipse cx="0" cy="-16" rx="30" ry="40" fill="#c084fc" opacity="0.38" className="ct-glow" />
      <circle cx="-40" cy="-30" r="24" fill="url(#cm-lamp)" className="ct-glow" />
      <circle cx="40" cy="-30" r="24" fill="url(#cm-lamp)" className="ct-glow" style={{ animationDelay: "0.5s" }} />
    </g>
  );
}
