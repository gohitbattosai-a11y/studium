type Place = { x: number; y: number; s: number };

export function School3D() {
  const win = [-48, -30, 18, 36];
  return (
    <g>
      <ellipse cx="4" cy="17" rx="82" ry="14" fill="#000000" opacity="0.26" />
      <rect x="-72" y="14" width="144" height="4" rx="1" fill="#a9a190" />
      <rect x="-62" y="-30" width="124" height="44" fill="#e9d9b8" />
      <path d="M-62 -22 H62 M-62 -12 H62 M-62 -2 H62 M-62 8 H62" stroke="#a88a5c" strokeOpacity="0.16" />
      <rect x="-62" y="-30" width="124" height="44" fill="url(#cm-shade)" />
      <rect x="-62" y="-30" width="124" height="6" fill="#000000" opacity="0.14" />
      <rect x="-62" y="9" width="124" height="5" fill="#8d887c" />
      {[-56, -40, -24, 24, 40, 56].map((x) => (
        <rect key={x} x={x} y="10" width="6" height="3.4" rx="0.8" fill="#aaa598" opacity="0.85" />
      ))}
      <path d="M-70 -30 L0 -60 L70 -30Z" fill="#a8483a" />
      <path d="M0 -60 L70 -30 H0Z" fill="#000000" opacity="0.15" />
      {[-36, -42, -48, -54].map((y) => {
        const hw = (70 * (y + 60)) / 30;
        return <path key={y} d={`M${-hw} ${y} H${hw}`} stroke="#000000" strokeOpacity="0.17" strokeWidth="1.2" />;
      })}
      <path d="M-70 -30 L0 -60 L2.6 -58 L-65 -30Z" fill="#ffffff" opacity="0.22" />
      <path d="M-70 -30 H70" stroke="#000000" strokeOpacity="0.25" strokeWidth="1.8" />
      <rect x="-15" y="-84" width="30" height="42" fill="#d9c7a0" />
      <rect x="-15" y="-84" width="30" height="42" fill="url(#cm-shade)" />
      <path d="M-15 -62 H15 M-15 -52 H15" stroke="#a88a5c" strokeOpacity="0.3" />
      <path d="M-20 -84 L0 -103 L20 -84Z" fill="#8a3a30" />
      <path d="M0 -103 L20 -84 H0Z" fill="#000000" opacity="0.15" />
      <path d="M-20 -84 L0 -103 L2 -101 L-16 -84Z" fill="#ffffff" opacity="0.2" />
      <path d="M-9 -45 V-72 Q-9 -78 -3 -78 H3 Q9 -78 9 -72 V-45Z" fill="#3a2a18" />
      <path d="M-6 -47 V-72 Q-6 -75 -3 -75 H3 Q6 -75 6 -72 V-47Z" fill="#ffe08a" opacity="0.4" />
      <path d="M-3 -62 q3 -5 6 0 l-1.4 6 h-3.2Z" fill="#c9962e" />
      <circle cx="0" cy="-92" r="8.6" fill="#6b4a2b" />
      <circle cx="0" cy="-92" r="7.2" fill="#fff8e1" />
      <circle cx="0" cy="-92" r="7.2" fill="none" stroke="#c9962e" strokeWidth="0.8" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <path key={i} d={`M${Math.cos(a) * 5.6} ${-92 + Math.sin(a) * 5.6} L${Math.cos(a) * 6.6} ${-92 + Math.sin(a) * 6.6}`} stroke="#6b4a2b" strokeWidth="0.6" />;
      })}
      <path d="M0 -92 V-97 M0 -92 L4 -89" stroke="#3a2616" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M0 -103 V-118" stroke="#4a3320" strokeWidth="1.6" />
      <circle cx="0" cy="-119" r="1.6" fill="#f6c453" />
      <path d="M0 -116 L16 -111 L0 -106Z" fill="#e11d48">
        <animate attributeName="d" values="M0 -116 L16 -111 L0 -106Z;M0 -116 L13 -113 L0 -106Z;M0 -116 L16 -111 L0 -106Z" dur="2s" repeatCount="indefinite" />
      </path>
      {win.map((x) => (
        <g key={x}>
          <rect x={x - 2} y="-23" width="16" height="3" fill="#cfc4aa" />
          <rect x={x - 1} y="-20" width="14" height="16" fill="#6b4a2b" />
          <rect x={x} y="-19" width="12" height="14" fill="#9fd3ee" />
          <rect x={x} y="-19" width="12" height="5" fill="#ffffff" opacity="0.3" />
          <path d={`M${x + 6} -19 V-5 M${x} -12 H${x + 12}`} stroke="#6b4a2b" strokeWidth="1" />
          <rect x={x - 2} y="-4" width="16" height="3.4" rx="0.6" fill="#8a5a34" />
          <circle cx={x + 1.6} cy="-4.6" r="1.3" fill="#f43f5e" />
          <circle cx={x + 6} cy="-5" r="1.3" fill="#fbbf24" />
          <circle cx={x + 10.4} cy="-4.6" r="1.3" fill="#f9a8d4" />
        </g>
      ))}
      <path d="M-13 14 V-8 Q-13 -20 0 -20 Q13 -20 13 -8 V14Z" fill="#cfc4aa" />
      <rect x="-9" y="-10" width="18" height="24" rx="2" fill="#5a3b20" />
      <path d="M-9 -10 Q0 -22 9 -10Z" fill="#5a3b20" />
      <path d="M0 -16 V14 M-9 0 H9" stroke="#3a2616" strokeWidth="1" />
      <path d="M-7 -10 Q0 -17 7 -10" stroke="#9fd3ee" strokeWidth="2" fill="none" opacity="0.8" />
      <circle cx="3" cy="4" r="1.2" fill="#f0c25a" />
      <circle cx="-3" cy="4" r="1.2" fill="#f0c25a" />
      <rect x="-18" y="12" width="36" height="4" fill="#bdb29a" />
      <rect x="-22" y="15" width="44" height="3" fill="#a89d85" />
      <path d="M-76 14 H-64 M64 14 H76" stroke="#6b4a2b" strokeWidth="2" />
      {[-74, -68, 68, 74].map((x) => (
        <rect key={x} x={x - 1} y="4" width="2" height="12" fill="#8a6a43" />
      ))}
      <g transform="translate(-50 8)">
        <rect x="-9" y="-13" width="18" height="13" rx="1" fill="#f8f3e4" stroke="#6b4a2b" strokeWidth="1.2" />
        <path d="M-6 -9 H6 M-6 -6 H4" stroke="#6b4a2b" strokeWidth="1" />
        <rect x="3" y="-12" width="4" height="4" fill="#e11d48" opacity="0.8" />
        <rect x="-1" y="0" width="2" height="6" fill="#6b4a2b" />
      </g>
      <g transform="translate(54 14)">
        <path d="M0 0 L8 -14 L16 0" stroke="#3a3f47" strokeWidth="1.6" fill="none" />
        <circle cx="0" cy="0" r="4" fill="none" stroke="#3a3f47" strokeWidth="1.2" />
        <circle cx="16" cy="0" r="4" fill="none" stroke="#3a3f47" strokeWidth="1.2" />
        <path d="M6 -16 H11" stroke="#3a3f47" strokeWidth="1.6" />
      </g>
      <ellipse cx="-70" cy="22" rx="10" ry="4" fill="#2f7a3a" />
      <ellipse cx="70" cy="22" rx="10" ry="4" fill="#2f7a3a" />
      <circle cx="-70" cy="19" r="6" fill="#3a8d44" />
      <circle cx="70" cy="19" r="6" fill="#3a8d44" />
      <circle cx="-72" cy="17" r="3" fill="#68c372" opacity="0.7" />
      <circle cx="68" cy="17" r="3" fill="#68c372" opacity="0.7" />
    </g>
  );
}

export function SchoolNight({ x, y, s }: Place) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none">
      <ellipse cx="0" cy="-10" rx="86" ry="36" fill="url(#cm-lamp)" opacity="0.3" />
      {[-48, -30, 18, 36].map((wx) => (
        <g key={wx}>
          <rect x={wx} y="-19" width="12" height="14" fill="#ffe08a" opacity="0.92" />
          <rect x={wx} y="-19" width="12" height="4" fill="#fff6d0" opacity="0.6" />
          <path d={`M${wx + 6} -19 V-5 M${wx} -12 H${wx + 12}`} stroke="#8a5a34" strokeWidth="1" />
          <circle cx={wx + 6} cy="-12" r="18" fill="url(#cm-lamp)" />
        </g>
      ))}
      <path d="M-6 -47 V-72 Q-6 -75 -3 -75 H3 Q6 -75 6 -72 V-47Z" fill="#ffe08a" opacity="0.8" />
      <circle cx="0" cy="-92" r="22" fill="url(#cm-lamp)" opacity="0.7" />
      <circle cx="0" cy="-92" r="7.2" fill="#ffe9a3" opacity="0.85" />
      <path d="M0 -92 V-97 M0 -92 L4 -89" stroke="#6b4a2b" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M-7 -10 Q0 -17 7 -10" stroke="#ffe08a" strokeWidth="2.4" fill="none" />
      <path d="M-8 14 L-16 24 H16 L8 14Z" fill="#ffb64a" opacity="0.22" />
      <circle cx="0" cy="2" r="24" fill="url(#cm-lamp)" opacity="0.5" />
    </g>
  );
}

export function Dig3D() {
  return (
    <g>
      <ellipse cx="4" cy="16" rx="90" ry="35" fill="#000000" opacity="0.24" />
      <ellipse cx="0" cy="8" rx="82" ry="31" fill="#7a5834" />
      <ellipse cx="0" cy="6" rx="76" ry="27" fill="#a47a4c" />
      <ellipse cx="0" cy="5" rx="68" ry="23" fill="#b98d5a" />
      {[[-56, 6, 4], [56, 4, 4], [-30, -14, 3], [34, -12, 3], [-40, 22, 3], [44, 20, 3]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r * 1.6} ry={r * 0.8} fill="#8d683d" opacity="0.7" />
      ))}
      <ellipse cx="-4" cy="10" rx="50" ry="15" fill="#4a3320" />
      <ellipse cx="-4" cy="9" rx="48" ry="14" fill="#5e4326" />
      <ellipse cx="-4" cy="9.5" rx="42" ry="11.5" fill="#7a5834" />
      <ellipse cx="-4" cy="10.4" rx="34" ry="8.4" fill="#8a6540" />
      <ellipse cx="-4" cy="11" rx="24" ry="5.6" fill="#6b4a2b" />
      {[-44, -20, 4, 28].map((x) => (
        <path key={x} d={`M${x} 7 H${x + 18}`} stroke="#4a3320" strokeWidth="1" opacity="0.5" />
      ))}
      <path d="M-46 4 q10 -3 22 0 M10 14 q10 3 24 -1" stroke="#c9a66b" strokeOpacity="0.5" strokeWidth="1" fill="none" />
      {[[-48, -6], [38, -4], [-42, 22], [44, 20]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x + 1} cy={y + 2} rx="3" ry="1.2" fill="#000000" opacity="0.25" />
          <rect x={x - 1.5} y={y - 14} width="3" height="16" fill="#8a5a34" />
          <path d={`M${x} ${y - 14} h10 l-3 3 l3 3 h-10Z`} fill={i % 2 ? "#2f81f7" : "#e11d48"} />
        </g>
      ))}
      <path d="M-48 -20 L38 -18 L44 6 L-42 8Z" fill="none" stroke="#f1e6c9" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
      <path d="M-24 -19 L-20 7 M0 -19 L2 7 M20 -18 L24 6 M-45 -8 L41 -6" stroke="#f1e6c9" strokeWidth="0.7" opacity="0.4" />
      <g transform="translate(-8 4)">
        <path d="M-14 5 q4 -14 14 -14 q10 0 14 14 q-14 5 -28 0Z" fill="#f1e6c9" stroke="#6b5a3c" strokeWidth="1.5" />
        <path d="M-7 -2 q7 -6 14 0 M-9 2 q9 -6 18 0" fill="none" stroke="#6b5a3c" strokeWidth="1" />
        <circle cx="-5" cy="-3" r="1.3" fill="#6b5a3c" />
        <circle cx="5" cy="-3" r="1.3" fill="#6b5a3c" />
        <path d="M-16 7 q-8 2 -12 -2 M16 7 q8 2 12 -2" stroke="#e9dcb8" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M-30 4 q-3 -2 -6 0 M30 4 q3 -2 6 0" stroke="#e9dcb8" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(54 -6)">
        <ellipse cx="18" cy="26" rx="24" ry="5" fill="#000000" opacity="0.22" />
        <path d="M0 24 L18 -20 L36 24Z" fill="#d9c9a4" stroke="#6b5a3c" strokeWidth="1.5" />
        <path d="M18 -20 L36 24 H18Z" fill="#000000" opacity="0.14" />
        <path d="M18 -20 V24" stroke="#6b5a3c" strokeWidth="1.2" />
        <path d="M6 10 H30 M10 0 H26" stroke="#6b5a3c" strokeOpacity="0.4" />
        <path d="M11 24 L18 4 L25 24Z" fill="#3a2a18" />
        <path d="M18 -20 V-30 L30 -26 L18 -22Z" fill="#2f81f7" />
        <circle cx="18" cy="-31" r="1.4" fill="#f6c453" />
        <rect x="24" y="14" width="8" height="10" fill="#8a5a34" />
      </g>
      <g transform="translate(-60 -4)">
        <ellipse cx="2" cy="6" rx="10" ry="3" fill="#000000" opacity="0.22" />
        <rect x="-1.5" y="-26" width="3" height="30" fill="#8a5a34" transform="rotate(14)" />
        <path d="M-8 -30 L8 -26 L4 -18 L-10 -22Z" fill="#9aa4ae" stroke="#3a3f47" strokeWidth="1" transform="rotate(14)" />
        <path d="M-8 -30 L8 -26 L6.6 -24 L-9 -28Z" fill="#ffffff" opacity="0.35" transform="rotate(14)" />
      </g>
      <g transform="translate(-30 26)">
        <ellipse cx="2" cy="4" rx="13" ry="3" fill="#000000" opacity="0.22" />
        <rect x="-10" y="-10" width="20" height="12" rx="1" fill="#8a5a34" stroke="#4a3320" strokeWidth="1.2" />
        <path d="M-10 -4 H10 M-3 -10 V2" stroke="#4a3320" strokeWidth="1" />
        <rect x="-10" y="-10" width="20" height="2" fill="#ffffff" opacity="0.2" />
      </g>
      <g transform="translate(-4 30)">
        <path d="M-10 0 H10 L7 -8 H-7Z" fill="#c2a06a" stroke="#6b5a3c" strokeWidth="1" />
        <path d="M-6 -4 H6 M-3 -8 V0 M3 -8 V0" stroke="#6b5a3c" strokeWidth="0.6" opacity="0.7" />
      </g>
      <g transform="translate(70 24)">
        <circle cx="0" cy="0" r="4" fill="none" stroke="#3a3f47" strokeWidth="1.4" />
        <path d="M0 0 L-12 -4 H-18 L-14 -12 H-4 Z" fill="#c9a66b" stroke="#6b5a3c" strokeWidth="1" />
        <path d="M-18 -4 L-24 -10" stroke="#8a5a34" strokeWidth="1.6" />
      </g>
      <path d="M26 20 q8 -14 16 0Z" fill="#7a5834" />
      <path d="M32 20 q5 -9 10 0Z" fill="#8f6a3e" />
      <path d="M-76 14 q8 -10 16 0Z" fill="#7a5834" />
      <path d="M-70 14 q4 -7 8 0Z" fill="#8f6a3e" />
      <path d="M-46 -20 Q-5 -34 38 -18" fill="none" stroke="#3a3f47" strokeWidth="0.8" />
      {[-30, -12, 6, 24].map((x, i) => (
        <circle key={i} cx={x} cy={-26 + Math.abs(x + 4) * 0.12} r="2" fill="#ffe9a3" />
      ))}
    </g>
  );
}

export function DigNight({ x, y, s }: Place) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none">
      <ellipse cx="0" cy="8" rx="78" ry="28" fill="url(#cm-lamp)" opacity="0.28" />
      <circle cx="-48" cy="-20" r="22" fill="url(#cm-lamp)" className="ct-glow" />
      <circle cx="38" cy="-18" r="22" fill="url(#cm-lamp)" className="ct-glow" style={{ animationDelay: "0.6s" }} />
      <circle cx="72" cy="2" r="22" fill="url(#cm-lamp)" opacity="0.75" />
      <path d="M11 24 L18 4 L25 24Z" transform="translate(54 -6)" fill="#ffb64a" opacity="0.6" />
      {[-30, -12, 6, 24].map((px, i) => (
        <g key={i}>
          <circle cx={px} cy={-26 + Math.abs(px + 4) * 0.12} r="9" fill="url(#cm-lamp)" opacity="0.8" />
          <circle cx={px} cy={-26 + Math.abs(px + 4) * 0.12} r="2.2" fill="#fff6d0" />
        </g>
      ))}
      <ellipse cx="-8" cy="10" rx="30" ry="9" fill="#ffe9a3" opacity="0.14" />
      <circle cx="-8" cy="4" r="3" fill="#fff6d0" className="ct-twinkle" />
    </g>
  );
}
