function Pine({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="2" cy="16" rx="14" ry="4" fill="#000000" opacity="0.25" />
      <rect x="-2.5" y="4" width="5" height="12" fill="#4a2f18" />
      <path d="M0 -34 L14 -8 H-14Z" fill="#14502c" />
      <path d="M0 -24 L17 4 H-17Z" fill="#1b6a38" />
      <path d="M0 -12 L20 14 H-20Z" fill="#24823f" />
      <path d="M0 -34 L5 -22 L-2 -20Z" fill="#ffffff" opacity="0.16" />
    </g>
  );
}

const PINES: [number, number, number][] = [[-72, -14, 1], [-40, -20, 1.1], [-6, -22, 1.15], [30, -20, 1.05], [66, -14, 1], [-84, 14, 1.05], [-52, 10, 1.1], [52, 12, 1.1], [84, 16, 1], [-66, 34, 0.95], [-30, 32, 1], [30, 34, 1.05], [68, 36, 0.95]];

export function Forest3D() {
  return (
    <g>
      <ellipse cx="0" cy="22" rx="112" ry="48" fill="#1c5a2c" opacity="0.55" />
      {[...PINES].sort((a, b) => a[1] - b[1]).map(([x, y, s], i) => (
        <Pine key={i} x={x} y={y} s={s} />
      ))}
      <g transform="translate(0 22)">
        <ellipse cx="0" cy="18" rx="26" ry="5" fill="#000000" opacity="0.22" />
        <rect x="-20" y="-4" width="40" height="22" fill="#8a6a43" />
        {[-14, -8, -2, 4, 10, 16].map((a) => (
          <rect key={a} x={a} y="-4" width="1.2" height="22" fill="#000000" opacity="0.2" />
        ))}
        <path d="M-25 -3 L0 -22 L25 -3Z" fill="#6b3b2a" />
        <path d="M-25 -3 L0 -22 L2 -20 L-21 -3Z" fill="#ffffff" opacity="0.18" />
        <rect x="-4" y="5" width="9" height="13" fill="#4a2f18" />
        <rect x="8" y="2" width="8" height="7" fill="#ffe9a3" />
        <rect x="-16" y="2" width="8" height="7" fill="#ffe9a3" />
      </g>
      <rect x="-50" y="62" width="100" height="26" rx="13" fill="#161B22" stroke="#7EE787" strokeWidth="2" />
      <text x="0" y="80" textAnchor="middle" fontSize="16" fontWeight="600" fill="#F0F6FC">
        Foresta
      </text>
    </g>
  );
}

export function Stadium3D() {
  return (
    <g>
      <ellipse cx="0" cy="26" rx="92" ry="22" fill="#000000" opacity="0.25" />
      <path d="M-80 0 A80 38 0 0 0 80 0 V14 A80 38 0 0 1 -80 14Z" fill="#8f969f" />
      <ellipse cx="0" cy="0" rx="80" ry="38" fill="#b9bfc7" />
      <ellipse cx="0" cy="0" rx="70" ry="32" fill="#6f7782" />
      {Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 62} cy={Math.sin(a) * 27} r="2.2" fill={i % 2 ? "#e11d48" : "#2563eb"} />;
      })}
      <rect x="-50" y="-19" width="100" height="38" rx="16" fill="#2f9a4a" />
      {[-30, -10, 10, 30].map((x) => (
        <rect key={x} x={x - 10} y="-19" width="20" height="38" fill="#3aa956" opacity="0.5" />
      ))}
      <rect x="-50" y="-19" width="100" height="38" rx="16" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.8" />
      <path d="M0 -19 V19" stroke="#ffffff" strokeWidth="1.4" opacity="0.8" />
      <ellipse cx="0" cy="0" rx="9" ry="6" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.8" />
      <rect x="-50" y="-8" width="10" height="16" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
      <rect x="40" y="-8" width="10" height="16" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
      {[[-74, -30], [74, -30], [-74, 18], [74, 18]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 1.2} y={y - 34} width="2.4" height="34" fill="#3a3f47" />
          <rect x={x - 7} y={y - 42} width="14" height="9" rx="1.5" fill="#ffe9a3" />
        </g>
      ))}
      <g>
        <rect x="-0.8" y="-62" width="1.6" height="24" fill="#5a3d22" />
        <path d="M1 -61 h14 l-3 4 l3 4 h-14Z" fill="#e11d48" />
      </g>
      <rect x="-50" y="48" width="100" height="26" rx="13" fill="#161B22" stroke="#A371F7" strokeWidth="2" />
      <text x="0" y="66" textAnchor="middle" fontSize="16" fontWeight="600" fill="#F0F6FC">
        Stadio
      </text>
    </g>
  );
}

export function ForestNight({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none">
      <circle cx="0" cy="34" r="34" fill="url(#cm-lamp)" className="ct-glow" />
      <rect x="8" y="24" width="8" height="7" fill="#ffd36a" />
      <rect x="-16" y="24" width="8" height="7" fill="#ffd36a" />
      {[[-60, 0], [-20, -30], [40, -20], [70, 10], [10, 40]].map(([a, b], i) => (
        <circle key={i} cx={a} cy={b} r="1.8" fill="#e8ff8a" className="ct-twinkle" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
    </g>
  );
}

export function StadiumNight({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none">
      <ellipse cx="0" cy="0" rx="86" ry="42" fill="url(#cm-lamp)" opacity="0.5" className="ct-glow" />
      {[[-74, -72], [74, -72], [-74, -24], [74, -24]].map(([a, b], i) => (
        <g key={i}>
          <circle cx={a} cy={b + 30} r="30" fill="url(#cm-lamp)" className="ct-glow" style={{ animationDelay: `${i * 0.25}s` }} />
          <rect x={a - 7} y={b + 20} width="14" height="9" rx="1.5" fill="#fff3c4" />
        </g>
      ))}
    </g>
  );
}

export function StadiumSketch() {
  return (
    <svg viewBox="0 0 400 120" className="h-28 w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="sk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1740" />
          <stop offset="1" stopColor="#25407a" />
        </linearGradient>
      </defs>
      <rect width="400" height="120" fill="url(#sk-sky)" />
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} cx={(i * 53) % 400} cy={(i * 29) % 50} r="0.9" fill="#ffffff" opacity="0.7" />
      ))}
      <path d="M0 70 L40 40 H360 L400 70V120H0Z" fill="#3a4350" />
      <path d="M20 70 L52 46 H348 L380 70Z" fill="#56606e" />
      {Array.from({ length: 36 }, (_, i) => (
        <rect key={i} x={30 + i * 9.5} y={50 + (i % 3) * 5} width="5" height="4" fill={i % 2 ? "#e11d48" : "#2563eb"} opacity="0.8" />
      ))}
      <path d="M0 120 L60 74 H340 L400 120Z" fill="#2f9a4a" />
      <path d="M60 120 L130 74 M340 120 L270 74 M200 74 V120" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" fill="none" />
      <ellipse cx="200" cy="97" rx="26" ry="8" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
      {[24, 376].map((x) => (
        <g key={x}>
          <rect x={x - 1.5} y="14" width="3" height="56" fill="#3a3f47" />
          <rect x={x - 12} y="6" width="24" height="12" rx="2" fill="#fff3c4" />
        </g>
      ))}
    </svg>
  );
}
