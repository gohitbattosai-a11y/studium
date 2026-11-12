import type { DieKind, EnemyKind, PropKind } from "@/lib/domain/dungeon";
import { DIE_INFO } from "@/lib/domain/dungeon";

const Shadow = ({ rx = 22 }: { rx?: number }) => <ellipse cx="0" cy="2" rx={rx} ry={rx * 0.3} fill="#000" opacity="0.38" />;

export function HeroArt({ guard }: { guard: boolean }) {
  return (
    <g>
      <Shadow rx={24} />
      <g className="dg-bob">
        <rect x="-13" y="-24" width="10" height="24" rx="3" fill="#3b4a6b" />
        <rect x="3" y="-24" width="10" height="24" rx="3" fill="#33415f" />
        <rect x="-15" y="-7" width="13" height="8" rx="3" fill="#232840" />
        <rect x="2" y="-7" width="13" height="8" rx="3" fill="#1d2237" />
        <path d="M-21 -64 L21 -64 L28 -12 Q0 -2 -28 -12 Z" fill="#b3202f" />
        <path d="M-21 -64 L-6 -64 L-8 -8 Q-18 -9 -28 -12 Z" fill="#8f1624" />
        <path d="M0 -64 L0 -6" stroke="#6e101b" strokeWidth="2" opacity="0.7" />
        <rect x="-17" y="-66" width="34" height="14" rx="6" fill="#8d9ab8" />
        <ellipse cx="-20" cy="-60" rx="9" ry="7" fill="#aab6d3" />
        <ellipse cx="20" cy="-60" rx="9" ry="7" fill="#aab6d3" />
        <ellipse cx="-20" cy="-62" rx="5" ry="2.4" fill="#d6deef" opacity="0.7" />
        <circle cx="0" cy="-76" r="13" fill="#b9c4de" />
        <path d="M-13 -76 Q0 -92 13 -76 L13 -70 Q0 -74 -13 -70Z" fill="#d7dff2" />
        <path d="M0 -89 L0 -64" stroke="#8a97b6" strokeWidth="2.4" />
        <path d="M-3 -88 Q-12 -104 4 -108 Q-2 -98 6 -90Z" fill="#e11d48" />
        <rect x="24" y="-100" width="5" height="46" rx="2" fill="#eef2fb" transform="rotate(14 26 -54)" />
        <rect x="19" y="-58" width="16" height="4" rx="2" fill="#d4a63c" transform="rotate(14 26 -54)" />
        <rect x="-37" y="-62" width="16" height="30" rx="7" fill="#2563eb" />
        <rect x="-35" y="-60" width="12" height="26" rx="5" fill="#3b82f6" />
        <path d="M-29 -56 L-29 -38 M-34 -47 L-24 -47" stroke="#fde68a" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      {guard && (
        <g className="dg-guard">
          <ellipse cx="0" cy="-48" rx="40" ry="54" fill="#67e8f9" opacity="0.18" />
          <ellipse cx="0" cy="-48" rx="40" ry="54" fill="none" stroke="#a5f3fc" strokeWidth="3" />
        </g>
      )}
    </g>
  );
}

const Lin = ({ id, a, b, v = true }: { id: string; a: string; b: string; v?: boolean }) => (
  <linearGradient id={id} x1="0" y1="0" x2={v ? 0 : 1} y2={v ? 1 : 0}>
    <stop offset="0" stopColor={a} />
    <stop offset="1" stopColor={b} />
  </linearGradient>
);

function Slime() {
  return (
    <g>
      <defs>
        <radialGradient id="dg-slime" cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#bbf7d0" />
          <stop offset="0.5" stopColor="#4ade80" />
          <stop offset="1" stopColor="#15803d" />
        </radialGradient>
      </defs>
      <Shadow rx={26} />
      <g className="dg-squish">
        <path d="M-27 0 Q-31 -35 0 -39 Q31 -35 27 0 Q0 8 -27 0Z" fill="url(#dg-slime)" stroke="#166534" strokeWidth="1.6" />
        <path d="M-20 -10 Q-12 -6 -6 -12 M10 -8 Q18 -5 22 -12" stroke="#bbf7d0" strokeWidth="1.4" fill="none" opacity="0.6" />
        <circle cx="-17" cy="-6" r="2.4" fill="#bbf7d0" opacity="0.7" />
        <circle cx="15" cy="-24" r="2" fill="#dcfce7" opacity="0.7" />
        <ellipse cx="-11" cy="-28" rx="8" ry="4" fill="#f0fdf4" opacity="0.8" transform="rotate(-24 -11 -28)" />
        <circle cx="-8" cy="-17" r="6" fill="#fff" />
        <circle cx="9" cy="-17" r="6" fill="#fff" />
        <circle cx="-7" cy="-16" r="3" fill="#0f2a1a" />
        <circle cx="10" cy="-16" r="3" fill="#0f2a1a" />
        <circle cx="-6" cy="-17.5" r="1" fill="#fff" />
        <circle cx="11" cy="-17.5" r="1" fill="#fff" />
        <path d="M-6 -7 Q1 -2 8 -7" stroke="#14532d" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Skeleton() {
  const bone = "#ebe5d0";
  return (
    <g>
      <defs>
        <Lin id="dg-bone" a="#fffbeb" b="#cfc6a6" />
        <Lin id="dg-blade" a="#e5e7eb" b="#6b7280" v={false} />
      </defs>
      <Shadow rx={22} />
      <g className="dg-bob">
        <g stroke={bone} strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M-6 -24 L-8 -2 M6 -24 L8 -2" />
          <path d="M0 -50 L0 -26" />
          <path d="M-13 -47 Q0 -42 13 -47 M-12 -40 Q0 -35 12 -40 M-10 -33 Q0 -29 10 -33" strokeWidth="3.6" />
          <path d="M-12 -50 L-23 -34 L-25 -22 M12 -50 L22 -40" />
        </g>
        <ellipse cx="-9" cy="-1" rx="7" ry="3" fill={bone} />
        <ellipse cx="9" cy="-1" rx="7" ry="3" fill={bone} />
        <rect x="-7" y="-27" width="14" height="7" rx="3" fill="url(#dg-bone)" />
        <circle cx="0" cy="-64" r="13.5" fill="url(#dg-bone)" stroke="#8d866f" strokeWidth="1" />
        <rect x="-8.5" y="-55" width="17" height="9" rx="3" fill="url(#dg-bone)" />
        <path d="M-3 -77 L-6 -70 M4 -76 L2 -71" stroke="#8d866f" strokeWidth="1.2" />
        <ellipse cx="-5" cy="-65" rx="3.8" ry="4.6" fill="#1b1620" />
        <ellipse cx="5" cy="-65" rx="3.8" ry="4.6" fill="#1b1620" />
        <circle cx="-5" cy="-65" r="1.6" fill="#ef4444" className="dg-glow" />
        <circle cx="5" cy="-65" r="1.6" fill="#ef4444" className="dg-glow" />
        <path d="M-5 -53 L-5 -47 M0 -53 L0 -47 M5 -53 L5 -47" stroke="#8d866f" strokeWidth="1.6" />
        <rect x="21" y="-64" width="6" height="42" rx="2" fill="url(#dg-blade)" stroke="#4b5563" strokeWidth="0.8" />
        <rect x="16" y="-26" width="16" height="4.5" rx="2" fill="#78716c" />
        <circle cx="-25" cy="-20" r="5" fill={bone} />
      </g>
    </g>
  );
}

function Bat() {
  return (
    <g>
      <defs>
        <Lin id="dg-wing" a="#6d3fb2" b="#2b1650" />
      </defs>
      <ellipse cx="0" cy="2" rx="14" ry="4" fill="#000" opacity="0.28" />
      <g className="dg-hover">
        <g className="dg-flap" style={{ transformOrigin: "-6px -38px" }}>
          <path d="M-6 -38 Q-26 -64 -50 -40 Q-42 -36 -38 -29 Q-31 -36 -25 -27 Q-17 -34 -6 -26Z" fill="url(#dg-wing)" stroke="#1e0f38" strokeWidth="1" />
          <path d="M-6 -38 Q-28 -52 -44 -40 M-6 -36 L-30 -31 M-6 -34 L-22 -27" stroke="#a37be0" strokeWidth="1.3" fill="none" opacity="0.8" />
        </g>
        <g className="dg-flap" style={{ transformOrigin: "6px -38px" }}>
          <path d="M6 -38 Q26 -64 50 -40 Q42 -36 38 -29 Q31 -36 25 -27 Q17 -34 6 -26Z" fill="url(#dg-wing)" stroke="#1e0f38" strokeWidth="1" />
          <path d="M6 -38 Q28 -52 44 -40 M6 -36 L30 -31 M6 -34 L22 -27" stroke="#a37be0" strokeWidth="1.3" fill="none" opacity="0.8" />
        </g>
        <ellipse cx="0" cy="-34" rx="11" ry="14" fill="#2d1b4e" stroke="#1e0f38" strokeWidth="1" />
        <ellipse cx="0" cy="-30" rx="6" ry="8" fill="#47306f" />
        <path d="M-9 -44 L-7 -57 L-2 -47Z M9 -44 L7 -57 L2 -47Z" fill="#2d1b4e" />
        <circle cx="-4.5" cy="-37" r="2.8" fill="#f43f5e" />
        <circle cx="4.5" cy="-37" r="2.8" fill="#f43f5e" />
        <circle cx="-4.5" cy="-37" r="5.5" fill="#f43f5e" opacity="0.25" />
        <circle cx="4.5" cy="-37" r="5.5" fill="#f43f5e" opacity="0.25" />
        <path d="M-3 -29 L-2 -24 L0 -29 L2 -24 L3 -29" fill="#fff" />
      </g>
    </g>
  );
}

function Wraith() {
  return (
    <g>
      <defs>
        <Lin id="dg-wr" a="#8b7cf0" b="#2f2380" />
        <radialGradient id="dg-wr-aura" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#67e8f9" stopOpacity="0.35" />
          <stop offset="1" stopColor="#67e8f9" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="2" rx="18" ry="5" fill="#000" opacity="0.25" />
      <g className="dg-hover">
        <ellipse cx="0" cy="-42" rx="46" ry="54" fill="url(#dg-wr-aura)" />
        <path d="M-23 -6 Q-30 -46 -11 -69 Q0 -82 11 -69 Q30 -46 23 -6 Q16 -15 8 -4 Q0 -15 -8 -4 Q-16 -15 -23 -6Z" fill="url(#dg-wr)" opacity="0.92" />
        <path d="M-23 -6 Q-30 -46 -11 -69 Q-6 -52 -9 -30 Q-12 -14 -23 -6Z" fill="#2a1f78" opacity="0.7" />
        <path d="M-14 -62 Q-8 -66 0 -66 Q8 -66 14 -62" stroke="#c4b8ff" strokeWidth="1.4" fill="none" opacity="0.6" />
        <ellipse cx="0" cy="-56" rx="10.5" ry="12.5" fill="#0f0826" />
        <circle cx="-4.5" cy="-57" r="3.8" fill="#a5f3fc" />
        <circle cx="4.5" cy="-57" r="3.8" fill="#a5f3fc" />
        <circle cx="-4.5" cy="-57" r="8" fill="#67e8f9" opacity="0.25" className="dg-glow" />
        <circle cx="4.5" cy="-57" r="8" fill="#67e8f9" opacity="0.25" className="dg-glow" />
        <path d="M-20 -34 Q-35 -30 -37 -17 M20 -34 Q35 -30 37 -17" stroke="#9a90ee" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
        <path d="M-5 -2 Q-6 8 -3 14 M6 -2 Q7 9 4 15" stroke="#7a6ee0" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" />
      </g>
    </g>
  );
}

function Golem({ exh }: { exh: boolean }) {
  const eye = exh ? "#475569" : "#fb923c";
  return (
    <g>
      <defs>
        <Lin id="dg-stone" a="#a3acbd" b="#59616f" />
        <Lin id="dg-stone2" a="#8a93a6" b="#4a5160" />
        <radialGradient id="dg-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3bf" />
          <stop offset="0.5" stopColor="#fb923c" />
          <stop offset="1" stopColor="#c2410c" />
        </radialGradient>
      </defs>
      <Shadow rx={46} />
      <g className={exh ? "dg-dizzy" : "dg-bob"}>
        <rect x="-31" y="-34" width="23" height="34" rx="6" fill="url(#dg-stone2)" stroke="#3b414d" strokeWidth="1.4" />
        <rect x="8" y="-34" width="23" height="34" rx="6" fill="url(#dg-stone2)" stroke="#3b414d" strokeWidth="1.4" />
        <rect x="-45" y="-97" width="90" height="70" rx="14" fill="url(#dg-stone)" stroke="#3b414d" strokeWidth="1.6" />
        <path d="M-45 -50 L45 -50" stroke="#4a5160" strokeWidth="3" />
        <path d="M-20 -97 L-14 -76 L-24 -62 M22 -97 L16 -80 L26 -64 M-34 -44 L-28 -34 M30 -46 L36 -36" stroke="#3b414d" strokeWidth="2.4" fill="none" />
        <path d="M-40 -90 Q-30 -94 -20 -92" stroke="#cbd5e1" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M-34 -30 Q-30 -36 -24 -32 Q-20 -38 -14 -33" stroke="#4d7c0f" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
        <rect x="-72" y="-91" width="27" height="60" rx="10" fill="url(#dg-stone2)" stroke="#3b414d" strokeWidth="1.4" />
        <rect x="45" y="-91" width="27" height="60" rx="10" fill="url(#dg-stone2)" stroke="#3b414d" strokeWidth="1.4" />
        <rect x="-76" y="-40" width="33" height="27" rx="9" fill="url(#dg-stone)" stroke="#3b414d" strokeWidth="1.4" />
        <rect x="43" y="-40" width="33" height="27" rx="9" fill="url(#dg-stone)" stroke="#3b414d" strokeWidth="1.4" />
        <rect x="-23" y="-130" width="46" height="38" rx="10" fill="url(#dg-stone)" stroke="#3b414d" strokeWidth="1.6" />
        <rect x="-14" y="-116" width="11" height="8" rx="2" fill={eye} />
        <rect x="3" y="-116" width="11" height="8" rx="2" fill={eye} />
        {!exh && <rect x="-19" y="-121" width="38" height="17" fill="#fb923c" opacity="0.18" />}
        <path d="M0 -86 L-13 -67 L0 -47 L13 -67Z" fill={exh ? "#475569" : "url(#dg-core)"} stroke="#7c2d12" strokeWidth="1.2" />
        {!exh && <circle cx="0" cy="-67" r="20" fill="#fb923c" opacity="0.2" className="dg-glow" />}
        {exh && (
          <g className="dg-spin" style={{ transformOrigin: "0px -140px" }}>
            <text x="-26" y="-136" fontSize="14">💫</text>
            <text x="12" y="-136" fontSize="14">💫</text>
          </g>
        )}
      </g>
    </g>
  );
}

function Goblin() {
  return (
    <g>
      <defs>
        <Lin id="dg-gob" a="#a3e635" b="#4d7c0f" />
        <Lin id="dg-gobcloth" a="#92400e" b="#451a03" />
      </defs>
      <Shadow rx={20} />
      <g className="dg-hop-loop">
        <path d="M-9 -24 L-11 -2 M9 -24 L11 -2" stroke="#4d7c0f" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="-12" cy="-1" rx="8" ry="3.4" fill="#3f2a14" />
        <ellipse cx="12" cy="-1" rx="8" ry="3.4" fill="#3f2a14" />
        <path d="M-15 -52 Q-17 -22 0 -20 Q17 -22 15 -52 Q0 -58 -15 -52Z" fill="url(#dg-gobcloth)" stroke="#2a1205" strokeWidth="1" />
        <path d="M-15 -34 L15 -34" stroke="#d6a469" strokeWidth="2.5" />
        <rect x="-3" y="-37" width="6" height="6" rx="1" fill="#facc15" />
        <path d="M-14 -48 L-27 -34 M14 -48 L27 -38" stroke="#65a30d" strokeWidth="5" strokeLinecap="round" />
        <circle cx="-28" cy="-33" r="4" fill="#84cc16" />
        <circle cx="28" cy="-37" r="4" fill="#84cc16" />
        <path d="M29 -41 L40 -62 L44 -58 L33 -36Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
        <path d="M-17 -64 L-36 -72 L-30 -60Z M17 -64 L36 -72 L30 -60Z" fill="url(#dg-gob)" stroke="#3f6212" strokeWidth="1" />
        <ellipse cx="0" cy="-64" rx="17" ry="15" fill="url(#dg-gob)" stroke="#3f6212" strokeWidth="1.2" />
        <ellipse cx="-6" cy="-67" rx="4.2" ry="5" fill="#fef9c3" />
        <ellipse cx="6" cy="-67" rx="4.2" ry="5" fill="#fef9c3" />
        <circle cx="-5.5" cy="-66" r="2" fill="#7f1d1d" />
        <circle cx="6.5" cy="-66" r="2" fill="#7f1d1d" />
        <path d="M-9 -73 L-3 -71 M9 -73 L3 -71" stroke="#2a3d0a" strokeWidth="2" strokeLinecap="round" />
        <path d="M-8 -56 Q0 -50 8 -56 L6 -53 L3 -56 L0 -52 L-3 -56 L-6 -53Z" fill="#fff" stroke="#3f6212" strokeWidth="1" />
        <circle cx="0" cy="-62" r="2" fill="#4d7c0f" />
      </g>
    </g>
  );
}

function Orc() {
  return (
    <g>
      <defs>
        <Lin id="dg-orc" a="#65a30d" b="#365314" />
        <Lin id="dg-orcarm" a="#9ca3af" b="#374151" />
      </defs>
      <Shadow rx={34} />
      <g className="dg-bob">
        <rect x="-22" y="-30" width="17" height="30" rx="5" fill="#4d7c0f" />
        <rect x="5" y="-30" width="17" height="30" rx="5" fill="#3f6212" />
        <rect x="-25" y="-6" width="21" height="8" rx="3" fill="#292524" />
        <rect x="4" y="-6" width="21" height="8" rx="3" fill="#292524" />
        <path d="M-32 -78 Q-36 -30 0 -26 Q36 -30 32 -78 Q0 -90 -32 -78Z" fill="url(#dg-orc)" stroke="#1a2e05" strokeWidth="1.4" />
        <path d="M-30 -66 Q0 -50 30 -66 L30 -52 Q0 -38 -30 -52Z" fill="#78350f" stroke="#451a03" strokeWidth="1" />
        <path d="M-18 -64 L-18 -46 M0 -60 L0 -44 M18 -64 L18 -46" stroke="#a16207" strokeWidth="2" />
        <rect x="-50" y="-78" width="19" height="38" rx="8" fill="url(#dg-orc)" stroke="#1a2e05" strokeWidth="1.2" />
        <rect x="31" y="-78" width="19" height="38" rx="8" fill="url(#dg-orc)" stroke="#1a2e05" strokeWidth="1.2" />
        <circle cx="-40" cy="-38" r="9" fill="#65a30d" />
        <circle cx="40" cy="-38" r="9" fill="#65a30d" />
        <circle cx="-34" cy="-80" r="10" fill="url(#dg-orcarm)" stroke="#111827" strokeWidth="1" />
        <circle cx="34" cy="-80" r="10" fill="url(#dg-orcarm)" stroke="#111827" strokeWidth="1" />
        <path d="M-37 -88 L-34 -98 L-31 -88 M31 -88 L34 -98 L37 -88" fill="#e5e7eb" />
        <path d="M44 -34 L54 -88 L60 -86 L50 -32Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
        <path d="M44 -34 L50 -32 L48 -26 L42 -28Z" fill="#78350f" />
        <ellipse cx="0" cy="-92" rx="17" ry="16" fill="url(#dg-orc)" stroke="#1a2e05" strokeWidth="1.2" />
        <path d="M-13 -97 L-4 -94 M13 -97 L4 -94" stroke="#1a2e05" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="-6" cy="-93" r="2.6" fill="#fbbf24" />
        <circle cx="6" cy="-93" r="2.6" fill="#fbbf24" />
        <path d="M-9 -83 Q0 -78 9 -83" stroke="#1a2e05" strokeWidth="2" fill="none" />
        <path d="M-8 -83 L-9 -92 M8 -83 L9 -92" stroke="#fff7ed" strokeWidth="3" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Warlord({ exh }: { exh: boolean }) {
  return (
    <g>
      <defs>
        <Lin id="dg-wl" a="#84cc16" b="#3f6212" />
        <Lin id="dg-wlmetal" a="#a8a29e" b="#44403c" />
        <Lin id="dg-gold" a="#fde68a" b="#b45309" />
      </defs>
      <Shadow rx={52} />
      <g className={exh ? "dg-dizzy" : "dg-bob"}>
        <rect x="-30" y="-36" width="24" height="36" rx="7" fill="#4d7c0f" />
        <rect x="6" y="-36" width="24" height="36" rx="7" fill="#3f6212" />
        <rect x="-33" y="-8" width="28" height="10" rx="4" fill="#1c1917" />
        <rect x="5" y="-8" width="28" height="10" rx="4" fill="#1c1917" />
        <path d="M-46 -100 Q-52 -34 0 -28 Q52 -34 46 -100 Q0 -114 -46 -100Z" fill="url(#dg-wl)" stroke="#1a2e05" strokeWidth="1.6" />
        <path d="M-42 -84 Q0 -62 42 -84 L42 -64 Q0 -42 -42 -64Z" fill="url(#dg-wlmetal)" stroke="#1c1917" strokeWidth="1.4" />
        <path d="M-26 -80 L-26 -54 M0 -72 L0 -48 M26 -80 L26 -54" stroke="#292524" strokeWidth="2.4" />
        <circle cx="0" cy="-60" r="9" fill="url(#dg-gold)" stroke="#78350f" strokeWidth="1.4" />
        <path d="M0 -66 L3 -60 L0 -54 L-3 -60Z" fill="#dc2626" />
        <rect x="-76" y="-100" width="30" height="58" rx="11" fill="url(#dg-wl)" stroke="#1a2e05" strokeWidth="1.4" />
        <rect x="46" y="-100" width="30" height="58" rx="11" fill="url(#dg-wl)" stroke="#1a2e05" strokeWidth="1.4" />
        <circle cx="-61" cy="-40" r="12" fill="#65a30d" />
        <circle cx="61" cy="-40" r="12" fill="#65a30d" />
        <path d="M-80 -106 L-66 -126 L-54 -104Z M80 -106 L66 -126 L54 -104Z" fill="url(#dg-wlmetal)" stroke="#1c1917" strokeWidth="1.2" />
        <path d="M70 -36 L84 -128 L94 -124 L80 -32Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" />
        <path d="M70 -36 L80 -32 L77 -22 L67 -26Z" fill="#78350f" />
        <ellipse cx="0" cy="-124" rx="22" ry="20" fill="url(#dg-wl)" stroke="#1a2e05" strokeWidth="1.4" />
        <path d="M-20 -142 L-14 -158 L-6 -144 L0 -162 L6 -144 L14 -158 L20 -142Z" fill="url(#dg-gold)" stroke="#78350f" strokeWidth="1.3" />
        <circle cx="0" cy="-150" r="2.6" fill="#ef4444" />
        <path d="M-16 -130 L-5 -126 M16 -130 L5 -126" stroke="#1a2e05" strokeWidth="3" strokeLinecap="round" />
        <circle cx="-8" cy="-126" r="3" fill={exh ? "#475569" : "#fbbf24"} />
        <circle cx="8" cy="-126" r="3" fill={exh ? "#475569" : "#fbbf24"} />
        <path d="M-12 -114 Q0 -108 12 -114" stroke="#1a2e05" strokeWidth="2.4" fill="none" />
        <path d="M-11 -114 L-13 -124 M11 -114 L13 -124" stroke="#fff7ed" strokeWidth="4" strokeLinecap="round" />
        {exh && (
          <g className="dg-spin" style={{ transformOrigin: "0px -166px" }}>
            <text x="-26" y="-162" fontSize="14">💫</text>
            <text x="12" y="-162" fontSize="14">💫</text>
          </g>
        )}
      </g>
    </g>
  );
}

function Legs({ w = 1, c = "#27272a" }: { w?: number; c?: string }) {
  return (
    <g stroke={c} strokeWidth={3.4 * w} strokeLinecap="round" fill="none">
      <path d="M-10 -14 Q-26 -30 -34 -8 M-10 -12 Q-30 -20 -40 -2 M10 -14 Q26 -30 34 -8 M10 -12 Q30 -20 40 -2" />
      <path d="M-8 -18 Q-20 -40 -28 -22 M8 -18 Q20 -40 28 -22" />
    </g>
  );
}

function Spider() {
  return (
    <g>
      <defs>
        <radialGradient id="dg-spi" cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#6b7280" />
          <stop offset="1" stopColor="#111827" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="2" rx="22" ry="6" fill="#000" opacity="0.3" />
      <g className="dg-hover">
        <path d="M0 -62 L0 -86" stroke="#e5e7eb" strokeWidth="1" opacity="0.6" />
        <Legs />
        <ellipse cx="0" cy="-26" rx="15" ry="13" fill="url(#dg-spi)" stroke="#030712" strokeWidth="1" />
        <ellipse cx="0" cy="-42" rx="13" ry="15" fill="url(#dg-spi)" stroke="#030712" strokeWidth="1" />
        <path d="M-4 -52 L0 -40 L4 -52 M0 -46 L0 -32" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="-5" cy="-23" r="2.4" fill="#ef4444" />
        <circle cx="5" cy="-23" r="2.4" fill="#ef4444" />
        <circle cx="-2" cy="-28" r="1.6" fill="#fca5a5" />
        <circle cx="2" cy="-28" r="1.6" fill="#fca5a5" />
        <path d="M-5 -15 L-7 -9 M5 -15 L7 -9" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Broodmother({ exh }: { exh: boolean }) {
  const eyes: [number, number, number][] = [[-12, -86, 5], [12, -86, 5], [-24, -78, 3.4], [24, -78, 3.4], [-6, -98, 3], [6, -98, 3]];
  return (
    <g>
      <defs>
        <radialGradient id="dg-bm" cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#7f1d3a" />
          <stop offset="1" stopColor="#1f0a14" />
        </radialGradient>
        <radialGradient id="dg-bm2" cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#5b2740" />
          <stop offset="1" stopColor="#160710" />
        </radialGradient>
      </defs>
      <Shadow rx={56} />
      <g className={exh ? "dg-dizzy" : "dg-bob"}>
        <g stroke="#2a0d1a" strokeWidth="9" strokeLinecap="round" fill="none">
          <path d="M-26 -40 Q-62 -76 -78 -20 L-82 0 M-30 -30 Q-76 -40 -90 -8 M26 -40 Q62 -76 78 -20 L82 0 M30 -30 Q76 -40 90 -8" />
          <path d="M-20 -52 Q-50 -100 -70 -64 M20 -52 Q50 -100 70 -64" />
        </g>
        <g stroke="#7f1d3a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6">
          <path d="M-26 -40 Q-62 -76 -78 -20 M26 -40 Q62 -76 78 -20" />
        </g>
        <ellipse cx="0" cy="-46" rx="44" ry="38" fill="url(#dg-bm2)" stroke="#0a0206" strokeWidth="1.6" />
        <path d="M-20 -62 Q0 -50 20 -62 M-26 -48 Q0 -36 26 -48 M-22 -34 Q0 -24 22 -34" stroke="#f43f5e" strokeWidth="2" fill="none" opacity="0.7" />
        <circle cx="0" cy="-44" r="7" fill="#f43f5e" opacity="0.8" className="dg-glow" />
        <ellipse cx="0" cy="-84" rx="29" ry="25" fill="url(#dg-bm)" stroke="#0a0206" strokeWidth="1.6" />
        {eyes.map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={exh ? "#475569" : "#fb7185"} />
            <circle cx={x} cy={y} r={r * 1.9} fill="#fb7185" opacity={exh ? 0 : 0.2} className="dg-glow" />
            <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#fff" />
          </g>
        ))}
        <path d="M-16 -66 L-20 -48 L-10 -62 M16 -66 L20 -48 L10 -62" fill="#f5f5f4" stroke="#a8a29e" strokeWidth="1" />
        {exh && (
          <g className="dg-spin" style={{ transformOrigin: "0px -118px" }}>
            <text x="-26" y="-114" fontSize="14">💫</text>
            <text x="12" y="-114" fontSize="14">💫</text>
          </g>
        )}
      </g>
    </g>
  );
}

export function EnemyArt({ kind, exh }: { kind: EnemyKind; exh?: boolean }) {
  if (kind === "slime") return <Slime />;
  if (kind === "skeleton") return <Skeleton />;
  if (kind === "bat") return <Bat />;
  if (kind === "wraith") return <Wraith />;
  if (kind === "goblin") return <Goblin />;
  if (kind === "orc") return <Orc />;
  if (kind === "warlord") return <Warlord exh={!!exh} />;
  if (kind === "spider") return <Spider />;
  if (kind === "broodmother") return <Broodmother exh={!!exh} />;
  return <Golem exh={!!exh} />;
}

export const ENEMY_H: Record<EnemyKind, number> = { slime: 44, skeleton: 82, bat: 60, wraith: 84, golem: 142, goblin: 82, orc: 104, warlord: 168, spider: 56, broodmother: 112 };

export function PropArt({ kind, die, open }: { kind: PropKind; die?: DieKind; open?: boolean }) {
  if (kind === "chest")
    return (
      <g>
        <Shadow rx={26} />
        <rect x="-26" y="-26" width="52" height="26" rx="4" fill="#8a5a2b" />
        <path d="M-26 -26 Q-26 -46 0 -46 Q26 -46 26 -26Z" fill="#a8703a" />
        <rect x="-26" y="-30" width="52" height="6" fill="#d4a63c" />
        <rect x="-26" y="-12" width="52" height="3" fill="#6a4320" />
        <rect x="-5" y="-34" width="10" height="14" rx="2" fill="#fcd34d" />
        <circle cx="0" cy="-27" r="2" fill="#7c4a0a" />
        <path d="M-18 -42 Q0 -50 18 -42" stroke="#d6a469" strokeWidth="2" fill="none" opacity="0.7" />
      </g>
    );
  if (kind === "spikes")
    return (
      <g>
        <ellipse cx="0" cy="0" rx="34" ry="10" fill="#1f2230" />
        {[-22, -11, 0, 11, 22].map((x, i) => (
          <path key={x} d={`M${x - 5} ${i % 2 ? 0 : 2} L${x} ${-18 - (i % 2) * 4} L${x + 5} ${i % 2 ? 0 : 2}Z`} fill="#c3c9d6" stroke="#6b7280" strokeWidth="1" />
        ))}
      </g>
    );
  if (kind === "potion")
    return (
      <g>
        <Shadow rx={14} />
        <g className="dg-hover">
          <circle cx="0" cy="-20" r="22" fill="#f43f5e" opacity="0.18" />
          <path d="M-5 -42 L5 -42 L5 -32 Q18 -26 16 -14 Q14 -4 0 -4 Q-14 -4 -16 -14 Q-18 -26 -5 -32Z" fill="#e11d48" />
          <path d="M-12 -18 Q0 -22 12 -18 Q12 -8 0 -6 Q-12 -8 -12 -18Z" fill="#fb7185" opacity="0.8" />
          <rect x="-4" y="-48" width="8" height="8" rx="2" fill="#a16207" />
          <ellipse cx="-7" cy="-22" rx="2.6" ry="5" fill="#fff" opacity="0.55" />
        </g>
      </g>
    );
  if (kind === "die" && die) {
    const info = DIE_INFO[die];
    return (
      <g>
        <Shadow rx={14} />
        <g className="dg-hover">
          <circle cx="0" cy="-22" r="24" fill={info.color} opacity="0.2" />
          <g transform="rotate(-10 0 -22)">
            <rect x="-15" y="-37" width="30" height="30" rx="7" fill={info.color} />
            <rect x="-15" y="-37" width="30" height="12" rx="6" fill="#fff" opacity="0.22" />
            <rect x="-15" y="-37" width="30" height="30" rx="7" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" />
            <text x="0" y="-15" textAnchor="middle" fontSize="19">{info.icon}</text>
          </g>
        </g>
      </g>
    );
  }
  return (
    <g>
      <rect x="-40" y="-104" width="80" height="104" rx="6" fill="#4a4f66" />
      <path d="M-30 0 L-30 -66 Q0 -108 30 -66 L30 0Z" fill={open ? "#1b4b6e" : "#0b0a14"} />
      {open ? (
        <g className="dg-glow">
          <path d="M-30 0 L-30 -66 Q0 -108 30 -66 L30 0Z" fill="#67e8f9" opacity="0.55" />
          <ellipse cx="0" cy="-48" rx="14" ry="30" fill="#e0f7ff" opacity="0.8" />
        </g>
      ) : (
        <g>
          <path d="M-30 -30 L30 -62 M-30 -62 L30 -30" stroke="#6b7280" strokeWidth="5" />
          <circle cx="0" cy="-46" r="7" fill="#ef4444" opacity="0.85" className="dg-glow" />
        </g>
      )}
      <path d="M-40 -104 L40 -104 L34 -94 L-34 -94Z" fill="#6a7089" />
      <path d="M-40 0 L-40 -104 M40 0 L40 -104" stroke="#2d3145" strokeWidth="2" />
    </g>
  );
}

export function Torch({ flame }: { flame: string }) {
  return (
    <g>
      <rect x="-2.5" y="-4" width="5" height="22" rx="2" fill="#3a2a1a" />
      <path d="M-7 -4 L7 -4 L4 4 L-4 4Z" fill="#59422a" />
      <g className="dg-flicker" style={{ transformOrigin: "0px -4px" }}>
        <path d="M0 -30 Q-10 -14 -6 -6 Q0 -2 6 -6 Q10 -14 0 -30Z" fill={flame} />
        <path d="M0 -20 Q-5 -11 -3 -6 Q0 -4 3 -6 Q5 -11 0 -20Z" fill="#fff3bf" />
      </g>
    </g>
  );
}
