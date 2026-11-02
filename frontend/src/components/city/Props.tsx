import type { Prop, Theme } from "./rooms";

export const BASE_W: Record<Prop, number> = { plant: 130, bench: 260, window: 140, lamp: 90, column: 100, banner: 110, rocks: 230, statue: 150, lantern: 100, ficus: 150, fountain: 260, pedestal: 120, anchor: 130, lifebuoy: 110, easel: 130, barrel: 100, jelly: 120, bamboo: 120, bridge: 320, torii: 270, brazier: 100, log: 250, amphora: 90, crate: 120, coral: 150 };

export function PropArt({ p, th }: { p: Prop; th: Theme }) {
  if (p === "plant")
    return (
      <svg viewBox="0 0 80 130" className="w-16 sm:w-20" aria-hidden>
        <path d="M40 80 q-34 -8 -34 -50 q26 2 34 50Z M40 80 q34 -10 34 -56 q-30 6 -34 56Z M40 80 q-8 -30 2 -70 q12 34 -2 70Z M40 84 q-20 -20 -26 -44 q24 8 26 44Z" fill="#3f9a4a" />
        <path d="M40 80 q-30 -8 -34 -50 q10 2 20 14" fill="#5bc06a" opacity="0.5" />
        <path d="M16 82 h48 l-6 44 h-36Z" fill="#b5653a" />
        <rect x="13" y="76" width="54" height="10" rx="3" fill="#c97a4a" />
      </svg>
    );
  if (p === "bench")
    return (
      <svg viewBox="0 0 180 80" className="w-32 sm:w-44" aria-hidden>
        <ellipse cx="90" cy="76" rx="80" ry="5" fill="#000000" opacity="0.25" />
        <rect x="14" y="30" width="152" height="30" rx="9" fill="#4d8a52" />
        <rect x="14" y="30" width="152" height="9" rx="6" fill="#6aa86d" />
        <path d="M90 32 V58" stroke="#3a6e40" strokeWidth="2" />
        <rect x="24" y="60" width="8" height="16" rx="2" fill="#7a5230" />
        <rect x="148" y="60" width="8" height="16" rx="2" fill="#7a5230" />
        <rect x="14" y="56" width="152" height="6" rx="3" fill="#6b4a2b" />
      </svg>
    );
  if (p === "window")
    return (
      <svg viewBox="0 0 120 170" className="w-24 sm:w-28" aria-hidden>
        <path d="M10 170 V50 Q10 8 60 8 Q110 8 110 50 V170Z" fill={th.trim} />
        <path d="M18 162 V52 Q18 16 60 16 Q102 16 102 52 V162Z" fill="url(#cw-sky)" />
        <defs>
          <linearGradient id="cw-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fd3ff" />
            <stop offset="1" stopColor="#e9f7d8" />
          </linearGradient>
        </defs>
        <path d="M60 16 V162 M18 90 H102" stroke={th.trim} strokeWidth="5" />
        <ellipse cx="42" cy="48" rx="14" ry="6" fill="#ffffff" opacity="0.85" />
        <ellipse cx="82" cy="70" rx="10" ry="4" fill="#ffffff" opacity="0.7" />
        <path d="M18 162 V120 q20 -14 42 0 q22 -14 42 0 V162Z" fill="#4d8f4a" opacity="0.8" />
      </svg>
    );
  if (p === "lamp")
    return (
      <div className="flex flex-col items-center" aria-hidden>
        <div className="ct-glow size-16 rounded-full bg-[radial-gradient(circle,rgba(255,226,140,0.9),transparent_70%)]" />
        <div className="-mt-10 h-5 w-4 rounded-sm" style={{ background: th.plaque }} />
        <div className="h-24 w-1.5" style={{ background: th.trim }} />
        <div className="h-2 w-10 rounded-full" style={{ background: th.trim }} />
      </div>
    );
  if (p === "column")
    return (
      <svg viewBox="0 0 60 190" className="w-12 sm:w-14" aria-hidden>
        <rect x="2" y="0" width="56" height="12" rx="2" fill="#d8d3c6" />
        <rect x="8" y="12" width="44" height="6" fill="#bdb7a6" />
        <rect x="12" y="18" width="36" height="150" fill="#ece8de" />
        {[18, 26, 34, 42].map((x) => (
          <rect key={x} x={x} y="18" width="2" height="150" fill="#000000" opacity="0.08" />
        ))}
        <rect x="8" y="168" width="44" height="8" fill="#bdb7a6" />
        <rect x="2" y="176" width="56" height="14" rx="2" fill="#d8d3c6" />
      </svg>
    );
  if (p === "banner")
    return (
      <svg viewBox="0 0 90 170" className="w-16 sm:w-20" aria-hidden>
        <rect x="4" y="4" width="82" height="7" rx="3" fill="#5a3d22" />
        <path d="M12 11 H78 V140 L45 160 L12 140Z" fill="#1f6f93" />
        <path d="M20 20 H70 V132 L45 148 L20 132Z" fill="none" stroke="#9fd6ee" strokeWidth="2" />
        <path d="M30 78 q15 -22 34 0 q-19 22 -34 0Z M64 78 l10 -10 v20Z" fill="#e0f2fe" />
        <circle cx="38" cy="75" r="2.4" fill="#0b2a3d" />
      </svg>
    );
  if (p === "rocks")
    return (
      <svg viewBox="0 0 150 80" className="w-28 sm:w-36" aria-hidden>
        <ellipse cx="50" cy="56" rx="44" ry="26" fill="#7b8087" />
        <ellipse cx="40" cy="44" rx="20" ry="9" fill="#ffffff" opacity="0.2" />
        <ellipse cx="104" cy="62" rx="34" ry="18" fill="#6a6f76" />
        <path d="M30 40 q10 -16 24 -8 q-12 2 -24 8Z" fill="#4d8a3e" />
        <path d="M118 30 q6 -18 16 -22 q0 12 -6 24Z" fill="#3f9a4a" />
      </svg>
    );
  if (p === "statue")
    return (
      <svg viewBox="0 0 100 200" className="w-16 sm:w-20" aria-hidden>
        <rect x="14" y="170" width="72" height="26" rx="3" fill="#8b84c4" />
        <rect x="24" y="150" width="52" height="22" fill="#a49ddb" />
        <path d="M50 148 C 20 130, 24 80, 50 50 C 76 80, 80 130, 50 148Z" fill="#c4b5fd" />
        <path d="M50 148 C 36 130, 38 90, 50 56" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="3" fill="none" />
        <circle cx="50" cy="36" r="16" fill="#c4b5fd" />
        <circle cx="50" cy="20" r="26" fill="#fbbf24" opacity="0.2" className="ct-glow" />
      </svg>
    );
  if (p === "ficus")
    return (
      <svg viewBox="0 0 100 190" className="w-24" aria-hidden>
        <ellipse cx="50" cy="184" rx="30" ry="5" fill="#000000" opacity="0.25" />
        <path d="M50 120 V84" stroke="#6b4a2b" strokeWidth="6" />
        {[[50, 60, 30], [26, 80, 22], [74, 80, 22], [34, 40, 20], [66, 44, 20], [50, 24, 16]].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={i % 2 ? "#2f8a45" : "#3fa055"} />
            <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.4} fill="#ffffff" opacity="0.14" />
          </g>
        ))}
        <path d="M24 120 h52 l-6 62 h-40Z" fill="#c9784a" />
        <rect x="20" y="114" width="60" height="10" rx="3" fill="#d98a58" />
      </svg>
    );
  if (p === "fountain")
    return (
      <svg viewBox="0 0 200 130" className="w-52" aria-hidden>
        <ellipse cx="100" cy="116" rx="92" ry="12" fill="#000000" opacity="0.25" />
        <ellipse cx="100" cy="98" rx="86" ry="22" fill="#cfd4da" />
        <ellipse cx="100" cy="92" rx="76" ry="17" fill="#58b9d9" />
        <ellipse cx="80" cy="90" rx="26" ry="5" fill="#ffffff" opacity="0.3" />
        <rect x="92" y="40" width="16" height="52" fill="#dde1e6" />
        <ellipse cx="100" cy="42" rx="26" ry="8" fill="#cfd4da" />
        <ellipse cx="100" cy="40" rx="20" ry="5" fill="#58b9d9" />
        {[-26, -12, 0, 12, 26].map((a, i) => (
          <path key={a} d={`M100 38 q${a} -34 ${a * 1.8} 28`} stroke="#bfe9f7" strokeWidth="2.4" fill="none" strokeLinecap="round" className="ct-glow" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </svg>
    );
  if (p === "pedestal")
    return (
      <svg viewBox="0 0 90 170" className="w-20" aria-hidden>
        <ellipse cx="45" cy="164" rx="34" ry="5" fill="#000000" opacity="0.25" />
        <rect x="12" y="132" width="66" height="30" rx="3" fill="#cfc8b4" />
        <rect x="20" y="70" width="50" height="64" fill="#efeadf" />
        <path d="M14 70 Q45 -4 76 70Z" fill="#9fd6ee" opacity="0.5" />
        <path d="M14 70 Q45 -4 76 70" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
        <path d="M30 56 q12 -10 24 0 q-12 10 -24 0Z M54 56 l8 -7 v14Z" fill="#fbbf24" className="ct-float" />
      </svg>
    );
  if (p === "anchor")
    return (
      <svg viewBox="0 0 100 130" className="w-24" aria-hidden>
        <ellipse cx="50" cy="124" rx="36" ry="5" fill="#000000" opacity="0.25" />
        <circle cx="50" cy="16" r="9" fill="none" stroke="#4b5563" strokeWidth="5" />
        <path d="M50 25 V110 M30 44 H70 M16 86 Q20 116 50 114 Q80 116 84 86" stroke="#4b5563" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M16 86 l-8 8 l14 2Z M84 86 l8 8 l-14 2Z" fill="#4b5563" />
      </svg>
    );
  if (p === "lifebuoy")
    return (
      <svg viewBox="0 0 110 120" className="w-20" aria-hidden>
        <ellipse cx="55" cy="112" rx="36" ry="5" fill="#000000" opacity="0.25" />
        <circle cx="55" cy="56" r="44" fill="#f8fafc" />
        <circle cx="55" cy="56" r="20" fill="#2a2f38" />
        {[0, 90, 180, 270].map((a) => (
          <path key={a} d="M55 12 a44 44 0 0 1 31 13 l-14 14 a24 24 0 0 0 -17 -7Z" fill="#ef4444" transform={`rotate(${a} 55 56)`} opacity={a % 180 ? 0 : 1} />
        ))}
        <circle cx="55" cy="56" r="44" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      </svg>
    );
  if (p === "easel")
    return (
      <svg viewBox="0 0 110 160" className="w-24" aria-hidden>
        <ellipse cx="55" cy="154" rx="36" ry="4" fill="#000000" opacity="0.25" />
        <path d="M30 150 L48 24 M80 150 L62 24 M55 150 V60" stroke="#6b4a2b" strokeWidth="5" strokeLinecap="round" />
        <rect x="14" y="40" width="82" height="62" rx="3" fill="#f8f1dc" stroke="#6b4a2b" strokeWidth="4" />
        <path d="M30 72 q16 -16 32 0 q-16 16 -32 0Z M62 72 l12 -10 v20Z" fill="#2a8fb3" />
        <path d="M24 90 h50" stroke="#8a7348" strokeWidth="2" />
      </svg>
    );
  if (p === "barrel")
    return (
      <svg viewBox="0 0 90 110" className="w-20" aria-hidden>
        <ellipse cx="45" cy="104" rx="32" ry="5" fill="#000000" opacity="0.25" />
        <path d="M14 20 Q4 56 14 92 H76 Q86 56 76 20Z" fill="#8a5a34" />
        <path d="M14 20 Q45 6 76 20" fill="#a37a4d" />
        {[34, 56, 78].map((y) => (
          <path key={y} d={`M${8 + (y > 56 ? 4 : 0)} ${y} Q45 ${y + 8} ${82 - (y > 56 ? 4 : 0)} ${y}`} stroke="#3a3f47" strokeWidth="4" fill="none" />
        ))}
        <path d="M24 24 V90" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="5" />
      </svg>
    );
  if (p === "jelly")
    return (
      <svg viewBox="0 0 100 180" className="w-24" aria-hidden>
        <g className="ct-float">
          <circle cx="50" cy="52" r="50" fill="#a78bfa" opacity="0.22" className="ct-glow" />
          <path d="M14 56 Q14 10 50 10 Q86 10 86 56 Q70 48 50 56 Q30 48 14 56Z" fill="#c4b5fd" opacity="0.85" />
          <path d="M26 40 Q36 22 54 20" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round" />
          {[24, 36, 50, 64, 76].map((x, i) => (
            <path key={x} d={`M${x} 56 q${i % 2 ? 8 : -8} 28 0 56 q${i % 2 ? -6 : 6} 16 0 28`} stroke="#e9d5ff" strokeWidth="2.4" fill="none" opacity="0.8" />
          ))}
        </g>
      </svg>
    );
  if (p === "bamboo")
    return (
      <svg viewBox="0 0 90 190" className="w-20" aria-hidden>
        <ellipse cx="45" cy="184" rx="26" ry="4" fill="#000000" opacity="0.25" />
        {[26, 46, 64].map((x, i) => (
          <g key={x}>
            <rect x={x - 5} y={10 + i * 12} width="10" height={160 - i * 12} fill="#7fa650" />
            <rect x={x - 5} y={10 + i * 12} width="3" height={160 - i * 12} fill="#ffffff" opacity="0.2" />
            {[50, 90, 130].map((y) => (
              <rect key={y} x={x - 6} y={y + i * 6} width="12" height="3" fill="#4d6e2e" />
            ))}
          </g>
        ))}
        <path d="M26 30 q-22 -4 -20 14 M64 40 q22 -6 20 12" stroke="#4d8a3e" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="14" y="166" width="62" height="18" rx="4" fill="#7a5230" />
      </svg>
    );
  if (p === "bridge")
    return (
      <svg viewBox="0 0 320 120" className="w-80" aria-hidden>
        <ellipse cx="160" cy="108" rx="140" ry="8" fill="#000000" opacity="0.2" />
        <path d="M14 98 Q160 -6 306 98 L306 108 Q160 10 14 108Z" fill="#c4302b" />
        <path d="M14 98 Q160 -6 306 98" stroke="#7f1d1d" strokeWidth="5" fill="none" />
        <path d="M14 70 Q160 -34 306 70" stroke="#7f1d1d" strokeWidth="5" fill="none" />
        {Array.from({ length: 11 }, (_, i) => {
          const x = 34 + i * 25;
          const y0 = 76 - Math.sin(((x - 14) / 292) * Math.PI) * 76;
          return <path key={i} d={`M${x} ${y0 + 22} V${y0 - 2 + 22 - 22}`} stroke="#7f1d1d" strokeWidth="3" />;
        })}
        <path d="M14 108 V90 M306 108 V90" stroke="#4a1210" strokeWidth="8" />
      </svg>
    );
  if (p === "torii")
    return (
      <svg viewBox="0 0 260 200" className="w-64" aria-hidden>
        <ellipse cx="130" cy="194" rx="100" ry="6" fill="#000000" opacity="0.2" />
        <rect x="40" y="52" width="16" height="140" fill="#c4302b" />
        <rect x="204" y="52" width="16" height="140" fill="#c4302b" />
        <path d="M6 44 Q130 56 254 44 L246 26 Q130 38 14 26Z" fill="#1f1f1f" />
        <rect x="24" y="64" width="212" height="12" fill="#c4302b" />
        <rect x="116" y="46" width="28" height="22" fill="#c4302b" />
        <rect x="116" y="46" width="28" height="22" fill="none" stroke="#e3b341" strokeWidth="2" />
      </svg>
    );
  if (p === "brazier")
    return (
      <svg viewBox="0 0 90 150" className="w-20" aria-hidden>
        <ellipse cx="45" cy="144" rx="28" ry="4" fill="#000000" opacity="0.25" />
        <path d="M20 60 H70 Q66 86 50 90 V130 H62 V138 H28 V130 H40 V90 Q24 86 20 60Z" fill="#8a6a1f" />
        <ellipse cx="45" cy="60" rx="25" ry="7" fill="#fbbf24" />
        <path d="M45 56 q-22 -10 -10 -34 q4 14 12 8 q-2 -14 8 -24 q2 22 8 28 q8 16 -18 22Z" fill="#fb923c" className="ct-glow" />
        <path d="M45 54 q-10 -6 -4 -18 q10 6 4 18Z" fill="#fde68a" />
      </svg>
    );
  if (p === "log")
    return (
      <svg viewBox="0 0 250 80" className="w-60" aria-hidden>
        <ellipse cx="125" cy="72" rx="110" ry="6" fill="#000000" opacity="0.22" />
        <rect x="14" y="26" width="222" height="44" rx="22" fill="#6b4a2b" />
        <rect x="14" y="26" width="222" height="12" rx="6" fill="#8a6a43" />
        <ellipse cx="226" cy="48" rx="12" ry="22" fill="#a37a4d" />
        <ellipse cx="226" cy="48" rx="6" ry="12" fill="none" stroke="#6b4a2b" strokeWidth="2" />
        <path d="M60 28 q10 -14 22 -4 M130 28 q8 -18 22 -8" stroke="#4d8a3e" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="90" cy="30" rx="20" ry="6" fill="#4d8a3e" />
      </svg>
    );
  if (p === "amphora")
    return (
      <svg viewBox="0 0 80 130" className="w-16" aria-hidden>
        <ellipse cx="40" cy="124" rx="24" ry="4" fill="#000000" opacity="0.25" />
        <path d="M28 10 H52 V24 Q74 34 70 70 Q66 108 44 118 H36 Q14 108 10 70 Q6 34 28 24Z" fill="#b5653a" />
        <path d="M28 10 H52" stroke="#8a4b2b" strokeWidth="6" />
        <path d="M20 56 H60 M18 72 H62" stroke="#e3b341" strokeWidth="3" opacity="0.7" />
        <path d="M24 38 Q18 70 26 100" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="5" fill="none" />
        <path d="M28 14 q-16 8 -10 34 M52 14 q16 8 10 34" stroke="#8a4b2b" strokeWidth="4" fill="none" />
      </svg>
    );
  if (p === "crate")
    return (
      <svg viewBox="0 0 110 100" className="w-24" aria-hidden>
        <ellipse cx="55" cy="94" rx="44" ry="5" fill="#000000" opacity="0.25" />
        <rect x="10" y="24" width="90" height="68" fill="#a37a4d" />
        <rect x="10" y="24" width="90" height="10" fill="#c49a66" />
        <path d="M10 24 L100 92 M100 24 L10 92" stroke="#6b4a2b" strokeWidth="5" />
        <rect x="10" y="24" width="90" height="68" fill="none" stroke="#6b4a2b" strokeWidth="5" />
        <path d="M40 24 q10 -16 30 -6" stroke="#d6c28a" strokeWidth="3" fill="none" />
      </svg>
    );
  if (p === "coral")
    return (
      <svg viewBox="0 0 130 120" className="w-28" aria-hidden>
        <ellipse cx="65" cy="112" rx="50" ry="6" fill="#000000" opacity="0.25" />
        <ellipse cx="65" cy="98" rx="48" ry="18" fill="#5b5f73" />
        <path d="M34 98 q-10 -34 -26 -44 M40 98 q4 -40 14 -66 M66 98 q-6 -30 6 -58 M82 98 q10 -34 36 -52" stroke="#f43f5e" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M54 32 q-12 -18 4 -26 M72 40 q-4 -20 14 -26 M118 46 q8 -14 0 -26" stroke="#fb923c" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="100" cy="94" r="9" fill="#e879f9" />
        <circle cx="26" cy="92" r="7" fill="#fbbf24" />
      </svg>
    );
  return (
    <svg viewBox="0 0 70 160" className="w-12 sm:w-14" aria-hidden>
      <rect x="31" y="0" width="8" height="30" fill="#4a1210" />
      <path d="M12 30 H58 L50 62 H20Z" fill="#c4302b" />
      <rect x="22" y="40" width="26" height="14" fill="#ffd36a" className="ct-glow" />
      <rect x="16" y="62" width="38" height="8" fill="#4a1210" />
      <rect x="31" y="70" width="8" height="70" fill="#8c2a24" />
      <ellipse cx="35" cy="146" rx="26" ry="9" fill="#4a1210" />
    </svg>
  );
}

