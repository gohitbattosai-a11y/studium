type Place = { x: number; y: number; s: number };

export function School3D() {
  return (
    <g>
      <ellipse cx="0" cy="16" rx="78" ry="14" fill="#000000" opacity="0.22" />
      <rect x="-62" y="-30" width="124" height="44" fill="#e9d9b8" />
      <rect x="30" y="-30" width="32" height="44" fill="#000000" opacity="0.08" />
      <rect x="-62" y="10" width="124" height="4" fill="#000000" opacity="0.14" />
      <path d="M-68 -30 L0 -58 L68 -30Z" fill="#a8483a" />
      <path d="M-68 -30 L0 -58 L68 -30Z" fill="#000000" opacity="0.1" />
      <rect x="-14" y="-82" width="28" height="40" fill="#d9c7a0" />
      <path d="M-18 -82 L0 -100 L18 -82Z" fill="#8a3a30" />
      <circle cx="0" cy="-66" r="8" fill="#fff8e1" stroke="#6b4a2b" strokeWidth="2" />
      <path d="M0 -66 V-72 M0 -66 L4 -63" stroke="#3a2616" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M0 -100 V-112" stroke="#4a3320" strokeWidth="1.6" />
      <path d="M0 -112 L14 -108 L0 -104Z" fill="#e11d48">
        <animate attributeName="d" values="M0 -112 L14 -108 L0 -104Z;M0 -112 L12 -110 L0 -104Z;M0 -112 L14 -108 L0 -104Z" dur="2s" repeatCount="indefinite" />
      </path>
      {[-48, -30, 18, 36].map((x) => (
        <g key={x}>
          <rect x={x - 1} y="-20" width="14" height="16" fill="#6b4a2b" />
          <rect x={x} y="-19" width="12" height="14" fill="#9fd3ee" />
          <rect x={x} y="-19" width="12" height="5" fill="#ffffff" opacity="0.3" />
          <path d={`M${x + 6} -19 V-5 M${x} -12 H${x + 12}`} stroke="#6b4a2b" strokeWidth="1" />
        </g>
      ))}
      <rect x="-9" y="-10" width="18" height="24" rx="2" fill="#5a3b20" />
      <path d="M-9 -10 Q0 -20 9 -10Z" fill="#5a3b20" />
      <circle cx="5" cy="3" r="1.2" fill="#f0c25a" />
      <rect x="-16" y="12" width="32" height="4" fill="#bdb29a" />
      <rect x="-20" y="15" width="40" height="3" fill="#a89d85" />
      <path d="M-76 14 H-64 M64 14 H76" stroke="#6b4a2b" strokeWidth="2" />
      {[-74, -68, 68, 74].map((x) => (
        <rect key={x} x={x - 1} y="4" width="2" height="12" fill="#8a6a43" />
      ))}
      <g transform="translate(-48 6)">
        <rect x="-8" y="-12" width="16" height="12" rx="1" fill="#f8f3e4" stroke="#6b4a2b" strokeWidth="1.2" />
        <path d="M-5 -8 H5 M-5 -5 H3" stroke="#6b4a2b" strokeWidth="1" />
        <rect x="-1" y="0" width="2" height="6" fill="#6b4a2b" />
      </g>
    </g>
  );
}

export function SchoolNight({ x, y, s }: Place) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none">
      {[-48, -30, 18, 36].map((wx) => (
        <g key={wx}>
          <rect x={wx} y="-19" width="12" height="14" fill="#ffe08a" opacity="0.9" />
          <circle cx={wx + 6} cy="-12" r="16" fill="url(#cm-lamp)" />
        </g>
      ))}
      <circle cx="0" cy="-66" r="8" fill="#ffe9a3" opacity="0.8" />
    </g>
  );
}

export function Dig3D() {
  return (
    <g>
      <ellipse cx="0" cy="14" rx="86" ry="34" fill="#000000" opacity="0.2" />
      <ellipse cx="0" cy="8" rx="80" ry="30" fill="#8a6540" />
      <ellipse cx="0" cy="6" rx="70" ry="24" fill="#a47a4c" />
      <ellipse cx="-4" cy="9" rx="48" ry="14" fill="#5e4326" />
      <ellipse cx="-4" cy="8" rx="42" ry="11" fill="#7a5834" />
      {[-44, -20, 4, 28].map((x) => (
        <path key={x} d={`M${x} 6 H${x + 18}`} stroke="#4a3320" strokeWidth="1" opacity="0.5" />
      ))}
      {[[-48, -6], [38, -4], [-42, 22], [44, 20]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 1.5} y={y - 14} width="3" height="16" fill="#8a5a34" />
          <circle cx={x} cy={y - 14} r="2.4" fill="#e11d48" />
        </g>
      ))}
      <path d="M-48 -20 L38 -18 L44 6 L-42 8Z" fill="none" stroke="#f1e6c9" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
      <g transform="translate(-6 2)">
        <path d="M-12 4 q4 -12 12 -12 q8 0 12 12 q-12 4 -24 0Z" fill="#f1e6c9" stroke="#6b5a3c" strokeWidth="1.5" />
        <path d="M-6 -2 q6 -5 12 0 M-8 1 q8 -5 16 0" fill="none" stroke="#6b5a3c" strokeWidth="1" />
      </g>
      <g transform="translate(54 -6)">
        <path d="M0 24 L18 -20 L36 24Z" fill="#d9c9a4" stroke="#6b5a3c" strokeWidth="1.5" />
        <path d="M18 -20 V24" stroke="#6b5a3c" strokeWidth="1.2" />
        <path d="M11 24 L18 4 L25 24Z" fill="#3a2a18" />
        <path d="M18 -20 V-30 L30 -26 L18 -22Z" fill="#2f81f7" />
      </g>
      <g transform="translate(-60 -4)">
        <rect x="-1.5" y="-26" width="3" height="30" fill="#8a5a34" transform="rotate(14)" />
        <path d="M-8 -30 L8 -26 L4 -18 L-10 -22Z" fill="#9aa4ae" stroke="#3a3f47" strokeWidth="1" transform="rotate(14)" />
      </g>
      <g transform="translate(-30 26)">
        <rect x="-10" y="-10" width="20" height="12" rx="1" fill="#8a5a34" stroke="#4a3320" strokeWidth="1.2" />
        <path d="M-10 -4 H10" stroke="#4a3320" strokeWidth="1" />
      </g>
      <path d="M26 20 q8 -14 16 0Z" fill="#7a5834" />
      <path d="M32 20 q5 -9 10 0Z" fill="#8f6a3e" />
    </g>
  );
}

export function DigNight({ x, y, s }: Place) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none">
      <circle cx="-48" cy="-20" r="20" fill="url(#cm-lamp)" />
      <circle cx="38" cy="-20" r="20" fill="url(#cm-lamp)" />
      <circle cx="72" cy="2" r="22" fill="url(#cm-lamp)" opacity="0.7" />
    </g>
  );
}
