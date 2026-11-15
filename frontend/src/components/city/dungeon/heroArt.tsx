type Look = { skin: string; hair: string; cape: string; style: number };

const Shadow = ({ rx = 24 }: { rx?: number }) => <ellipse cx="0" cy="2" rx={rx} ry={rx * 0.3} fill="#000" opacity="0.4" />;

const Defs = () => (
  <defs>
    <linearGradient id="hr-v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
      <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.38" />
    </linearGradient>
    <linearGradient id="hr-h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#000" stopOpacity="0.28" />
      <stop offset="0.4" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.34" />
    </linearGradient>
    <linearGradient id="hr-metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f8fafc" />
      <stop offset="0.45" stopColor="#aab6c8" />
      <stop offset="1" stopColor="#5b6679" />
    </linearGradient>
    <linearGradient id="hr-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff1b0" />
      <stop offset="0.5" stopColor="#e0b13f" />
      <stop offset="1" stopColor="#8a6a1a" />
    </linearGradient>
    <radialGradient id="hr-orb" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stopColor="#fff" />
      <stop offset="0.35" stopColor="#c4b5fd" />
      <stop offset="1" stopColor="#6d28d9" />
    </radialGradient>
    <radialGradient id="hr-iris" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stopColor="#8a6a4a" />
      <stop offset="1" stopColor="#2b1b12" />
    </radialGradient>
  </defs>
);

const S = ({ d, fill, o = 1 }: { d: string; fill: string; o?: number }) => (
  <g opacity={o}>
    <path d={d} fill={fill} />
    <path d={d} fill="url(#hr-v)" />
    <path d={d} fill="url(#hr-h)" />
  </g>
);

const PALETTE: Record<string, { main: string; dark: string; pants: string; boots: string }> = {
  guerriero: { main: "#8d9ab8", dark: "#5f6b88", pants: "#3b4a6b", boots: "#2a2f45" },
  mago: { main: "#6a46c8", dark: "#46308a", pants: "#46308a", boots: "#2a2142" },
  ranger: { main: "#4d7a3a", dark: "#2f5a2a", pants: "#6b4a2a", boots: "#3a2814" },
  ladro: { main: "#3d4252", dark: "#232632", pants: "#2a2d3a", boots: "#14161f" },
};

function HairBack({ hair, style, cls }: { hair: string; style: number; cls: string }) {
  if (style === 3 || (style === 2 && cls !== "mago")) {
    return (
      <g>
        <S d="M-14 -78 Q-22 -62 -16 -44 Q-12 -50 -11 -62Z" fill={hair} />
        <S d="M14 -78 Q22 -62 16 -44 Q12 -50 11 -62Z" fill={hair} />
        {style === 3 && <S d="M0 -86 Q-26 -80 -20 -52 Q-14 -56 -10 -66Z" fill={hair} />}
      </g>
    );
  }
  if (style === 2) {
    return (
      <g>
        <S d="M-14 -78 Q-24 -60 -18 -40 Q-12 -48 -11 -62Z" fill={hair} />
        <S d="M14 -78 Q24 -60 18 -40 Q12 -48 11 -62Z" fill={hair} />
      </g>
    );
  }
  return null;
}

function HairFront({ hair, style }: { hair: string; style: number }) {
  const strands = <path d="M-9 -88 Q-2 -92 7 -88" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.2" fill="none" strokeLinecap="round" />;
  if (style === 0)
    return (
      <g>
        <S d="M-13.4 -77 Q-14 -91 0 -91 Q14 -91 13.4 -77 Q9 -83 0 -82 Q-9 -83 -13.4 -77Z" fill={hair} />
        {strands}
      </g>
    );
  if (style === 1)
    return (
      <g>
        <S d="M-13.6 -76 Q-15 -92 2 -91.6 Q15 -91 13.4 -77 Q11 -84 3 -83 Q-4 -80 -9 -73 Q-12 -72 -13.6 -76Z" fill={hair} />
        <S d="M-13 -74 Q-17 -64 -11 -60 L-10 -72Z" fill={hair} />
        {strands}
      </g>
    );
  if (style === 2)
    return (
      <g>
        <S d="M-13.6 -77 Q-14.6 -92 0 -92 Q14.6 -92 13.6 -77 Q7 -80 0 -84 Q-7 -80 -13.6 -77Z" fill={hair} />
        {strands}
      </g>
    );
  return (
    <g>
      <S d="M-13.6 -77 Q-15 -93 0 -93 Q15 -93 13.6 -77 Q10 -84 0 -83 Q-10 -84 -13.6 -77Z" fill={hair} />
      <S d="M-3 -93 L0 -101 L3 -93Z" fill={hair} />
      <S d="M-8 -91 L-9 -98 L-4 -92Z" fill={hair} />
      <S d="M8 -91 L9 -98 L4 -92Z" fill={hair} />
      {strands}
    </g>
  );
}

function Face({ skin, hair, mask = false, glow = false }: { skin: string; hair: string; mask?: boolean; glow?: boolean }) {
  return (
    <g>
      <rect x="-5" y="-66" width="10" height="9" rx="3" fill={skin} />
      <rect x="-5" y="-66" width="10" height="9" rx="3" fill="#000" opacity="0.22" />
      <ellipse cx="-13" cy="-75" rx="2.4" ry="3.4" fill={skin} />
      <ellipse cx="13" cy="-75" rx="2.4" ry="3.4" fill={skin} />
      <ellipse cx="0" cy="-76" rx="13" ry="14" fill={skin} />
      <ellipse cx="0" cy="-76" rx="13" ry="14" fill="url(#hr-h)" />
      <ellipse cx="0" cy="-76" rx="13" ry="14" fill="url(#hr-v)" />
      <ellipse cx="-7.5" cy="-70" rx="3.2" ry="2.2" fill="#ff7a7a" opacity="0.28" />
      <ellipse cx="7.5" cy="-70" rx="3.2" ry="2.2" fill="#ff7a7a" opacity="0.28" />
      <path d="M-9 -81 Q-5.4 -83 -2 -81.4" stroke={hair} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M2 -81.4 Q5.4 -83 9 -81" stroke={hair} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="-5" cy="-76.4" rx="2.7" ry="2.1" fill="#fff" />
      <ellipse cx="5" cy="-76.4" rx="2.7" ry="2.1" fill="#fff" />
      <circle cx="-4.8" cy="-76.2" r="1.6" fill={glow ? "#fde68a" : "url(#hr-iris)"} />
      <circle cx="5.2" cy="-76.2" r="1.6" fill={glow ? "#fde68a" : "url(#hr-iris)"} />
      <circle cx="-4.8" cy="-76.2" r="0.8" fill="#0c0806" />
      <circle cx="5.2" cy="-76.2" r="0.8" fill="#0c0806" />
      <circle cx="-4.2" cy="-77" r="0.55" fill="#fff" />
      <circle cx="5.8" cy="-77" r="0.55" fill="#fff" />
      <path d="M0 -75 Q-1.6 -71 0.4 -70" stroke="#000" strokeOpacity="0.32" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      {!mask && <path d="M-3.4 -66 Q0 -63.6 3.4 -66" stroke="#7a3b2b" strokeWidth="1.4" fill="none" strokeLinecap="round" />}
    </g>
  );
}

function Legs({ cls }: { cls: string }) {
  const c = PALETTE[cls] ?? PALETTE.guerriero;
  if (cls === "mago") {
    return (
      <g>
        <S d="M-22 -34 L22 -34 L30 -2 Q0 6 -30 -2Z" fill={c.main} />
        <path d="M-30 -2 Q0 6 30 -2" stroke="#fbbf24" strokeWidth="2.4" fill="none" />
        <path d="M-12 -34 L-16 -2 M0 -34 L0 2 M12 -34 L16 -2" stroke="#000" strokeOpacity="0.2" strokeWidth="1.4" fill="none" />
        <ellipse cx="-9" cy="0" rx="8" ry="3" fill={c.boots} />
        <ellipse cx="9" cy="0" rx="8" ry="3" fill={c.boots} />
      </g>
    );
  }
  return (
    <g>
      <S d="M-14 -34 L-2 -34 L-3 -9 L-14 -9Z" fill={c.pants} />
      <S d="M2 -34 L14 -34 L14 -9 L3 -9Z" fill={c.pants} />
      <S d="M-16 -10 L-2 -10 L-1 -1 Q-1 1 -3 1 L-15 1 Q-18 0 -17 -4Z" fill={c.boots} />
      <S d="M2 -10 L16 -10 L17 -4 Q18 0 15 1 L3 1 Q1 1 1 -1Z" fill={c.boots} />
      <rect x="-16" y="-12" width="14" height="3" rx="1.5" fill="#fff" opacity="0.14" />
      <rect x="2" y="-12" width="14" height="3" rx="1.5" fill="#fff" opacity="0.14" />
    </g>
  );
}

function Torso({ cls }: { cls: string }) {
  const c = PALETTE[cls] ?? PALETTE.guerriero;
  if (cls === "guerriero") {
    return (
      <g>
        <S d="M-22 -66 Q0 -73 22 -66 L26 -34 Q0 -26 -26 -34Z" fill="url(#hr-metal)" />
        <path d="M0 -66 L0 -31" stroke="#000" strokeOpacity="0.3" strokeWidth="1.6" />
        <path d="M-16 -60 Q-8 -52 0 -54 Q8 -52 16 -60" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" fill="none" />
        <path d="M-18 -50 Q0 -44 18 -50 M-20 -42 Q0 -36 20 -42" stroke="#000" strokeOpacity="0.22" strokeWidth="1.2" fill="none" />
        <path d="M0 -64 L6 -54 L0 -46 L-6 -54Z" fill="url(#hr-gold)" stroke="#6b4e12" strokeWidth="0.8" />
        <S d="M-30 -66 Q-30 -76 -18 -72 L-14 -62 Q-24 -60 -30 -66Z" fill="url(#hr-metal)" />
        <S d="M30 -66 Q30 -76 18 -72 L14 -62 Q24 -60 30 -66Z" fill="url(#hr-metal)" />
        <rect x="-25" y="-35" width="50" height="6" rx="2" fill="#6b4a2a" />
        <rect x="-4" y="-36" width="8" height="8" rx="1.5" fill="url(#hr-gold)" />
      </g>
    );
  }
  if (cls === "mago") {
    return (
      <g>
        <S d="M-21 -66 Q0 -72 21 -66 L24 -32 L-24 -32Z" fill={c.main} />
        <path d="M-21 -66 Q0 -60 21 -66" stroke="#fbbf24" strokeWidth="2.4" fill="none" />
        <path d="M0 -64 L0 -32" stroke="#fbbf24" strokeWidth="2.4" />
        <S d="M-27 -66 Q-30 -56 -28 -44 L-20 -44 L-18 -64Z" fill={c.dark} />
        <S d="M27 -66 Q30 -56 28 -44 L20 -44 L18 -64Z" fill={c.dark} />
        <path d="M-24 -37 L24 -37" stroke="#fde68a" strokeWidth="3.2" strokeDasharray="4 2" />
        <circle cx="0" cy="-37" r="3.6" fill="url(#hr-gold)" />
      </g>
    );
  }
  if (cls === "ranger") {
    return (
      <g>
        <S d="M-21 -66 Q0 -72 21 -66 L25 -33 Q0 -26 -25 -33Z" fill={c.main} />
        <S d="M-21 -66 L-8 -64 L-10 -31 Q-18 -30 -25 -33Z" fill={c.dark} />
        <path d="M-14 -62 L12 -38 M14 -62 L-12 -38" stroke="#6b4a2a" strokeWidth="2.4" />
        <rect x="-25" y="-36" width="50" height="5" rx="2" fill="#6b4a2a" />
        <rect x="-3" y="-37" width="6" height="7" rx="1" fill="url(#hr-gold)" />
        <S d="M-28 -66 Q-30 -58 -27 -52 L-18 -52 L-16 -64Z" fill="#6b4a2a" />
      </g>
    );
  }
  return (
    <g>
      <S d="M-21 -66 Q0 -72 21 -66 L24 -33 Q0 -26 -24 -33Z" fill={c.main} />
      <path d="M-18 -62 L18 -40 M18 -62 L-18 -40" stroke="#14161f" strokeWidth="3" />
      <path d="M-20 -50 L20 -50" stroke="#a3a8b8" strokeOpacity="0.4" strokeWidth="1" />
      <rect x="-24" y="-36" width="48" height="5" rx="2" fill="#14161f" />
      <rect x="-3" y="-37" width="6" height="7" rx="1" fill="url(#hr-gold)" />
      <rect x="9" y="-36" width="4" height="12" rx="1.5" fill="#6b4a2a" />
      <S d="M-28 -66 Q-30 -58 -27 -52 L-18 -52 L-16 -64Z" fill={c.dark} />
    </g>
  );
}

function Arms({ cls, skin }: { cls: string; skin: string }) {
  const c = PALETTE[cls] ?? PALETTE.guerriero;
  const sleeve = cls === "guerriero" ? "url(#hr-metal)" : c.dark;
  return (
    <g>
      <S d="M-20 -64 Q-31 -58 -32 -42 L-27 -39 Q-25 -52 -17 -57Z" fill={sleeve} />
      <S d="M20 -64 Q31 -58 32 -42 L27 -39 Q25 -52 17 -57Z" fill={sleeve} />
      <circle cx="-29.6" cy="-39" r="4" fill={skin} />
      <circle cx="29.6" cy="-39" r="4" fill={skin} />
    </g>
  );
}

function Headgear({ cls }: { cls: string }) {
  if (cls === "guerriero")
    return (
      <g>
        <S d="M-15.4 -78 Q-16.4 -99 0 -99 Q16.4 -99 15.4 -78 Q8 -84.6 0 -84.6 Q-8 -84.6 -15.4 -78Z" fill="url(#hr-metal)" />
        <S d="M-15.4 -79 L-14.4 -63 L-11 -65 L-12.4 -79Z" fill="url(#hr-metal)" />
        <S d="M15.4 -79 L14.4 -63 L11 -65 L12.4 -79Z" fill="url(#hr-metal)" />
        <path d="M-14 -88 Q0 -94 14 -88" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.4" fill="none" />
        <rect x="-1.6" y="-99" width="3.2" height="9" rx="1.4" fill="#8a97b6" />
        <path d="M-3 -98 Q-13 -114 3 -116 Q-2 -107 6 -99Z" fill="#e11d48" />
        <path d="M-1 -99 Q-6 -110 3 -115" stroke="#fda4af" strokeWidth="1" fill="none" opacity="0.7" />
      </g>
    );
  if (cls === "mago")
    return (
      <g>
        <S d="M-24 -82 Q0 -72 24 -82 Q0 -90 -24 -82Z" fill={PALETTE.mago.dark} />
        <S d="M-15 -84 Q-8 -104 4 -126 Q10 -110 15 -84Q0 -78 -15 -84Z" fill={PALETTE.mago.main} />
        <path d="M-15 -84 Q0 -78 15 -84" stroke="#fbbf24" strokeWidth="3" fill="none" />
        <path d="M1 -112 L2.4 -108 L6.4 -108 L3.2 -105.6 L4.4 -101.6 L1 -104 L-2.4 -101.6 L-1.2 -105.6 L-4.4 -108 L-0.4 -108Z" fill="#fde68a" />
      </g>
    );
  if (cls === "ranger")
    return (
      <g>
        <S d="M-17 -72 Q-19 -101 0 -102 Q19 -101 17 -72 L20 -63 Q10 -69 13.4 -80 Q0 -90 -13.4 -80 Q-10 -69 -20 -63Z" fill={PALETTE.ranger.main} />
        <S d="M-17 -72 Q-19 -101 0 -102 L0 -90 Q-10 -88 -13.4 -80Z" fill={PALETTE.ranger.dark} />
        <path d="M8 -94 Q20 -102 24 -116" stroke="#f1f5f9" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M10 -95 Q18 -100 22 -108 M12 -93 Q22 -96 25 -104" stroke="#cbd5e1" strokeWidth="1" fill="none" />
      </g>
    );
  return (
    <g>
      <S d="M-17 -72 Q-19 -101 0 -102 Q19 -101 17 -72 L20 -63 Q10 -69 13.4 -80 Q0 -90 -13.4 -80 Q-10 -69 -20 -63Z" fill={PALETTE.ladro.main} />
      <S d="M-14 -71 Q0 -65 14 -71 L14.6 -61 Q0 -55.6 -14.6 -61Z" fill="#14161f" />
      <path d="M-10 -66 Q0 -61 10 -66" stroke="#fff" strokeOpacity="0.14" strokeWidth="1" fill="none" />
    </g>
  );
}

function Weapons({ cls }: { cls: string }) {
  if (cls === "mago")
    return (
      <g transform="rotate(8 30 -50)">
        <rect x="27" y="-112" width="4.4" height="76" rx="2.2" fill="#7c5a2b" />
        <rect x="27" y="-112" width="1.6" height="76" fill="#fff" opacity="0.2" />
        <path d="M23 -108 Q29 -122 35 -108 Q29 -114 23 -108Z" fill="url(#hr-gold)" />
        <circle cx="29.2" cy="-114" r="7.6" fill="url(#hr-orb)" className="dg-glow" />
        <circle cx="26.4" cy="-116.6" r="2.2" fill="#fff" opacity="0.85" />
      </g>
    );
  if (cls === "ranger")
    return (
      <g>
        <path d="M-40 -100 Q-62 -68 -40 -30" fill="none" stroke="#6b4a2a" strokeWidth="5" strokeLinecap="round" />
        <path d="M-40 -100 Q-62 -68 -40 -30" fill="none" stroke="#c08a4a" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        <path d="M-40 -100 L-40 -30" stroke="#e5e7eb" strokeWidth="1.2" />
        <g transform="rotate(14 22 -86)">
          <rect x="17" y="-112" width="10" height="30" rx="3" fill="#5a3a1c" />
          <path d="M19 -112 L18 -120 M22 -112 L22 -122 M25 -112 L26 -120" stroke="#e5e7eb" strokeWidth="1.4" />
          <path d="M18 -120 l-2 -3 l4 0Z M22 -122 l-2 -3 l4 0Z M26 -120 l-2 -3 l4 0Z" fill="#cbd5e1" />
        </g>
      </g>
    );
  if (cls === "ladro")
    return (
      <g>
        <g transform="rotate(18 34 -40)">
          <rect x="31" y="-70" width="5" height="30" rx="2" fill="url(#hr-metal)" />
          <rect x="28" y="-42" width="11" height="3.6" rx="1.6" fill="url(#hr-gold)" />
          <rect x="31.6" y="-40" width="3.8" height="8" rx="1.4" fill="#3a2814" />
        </g>
        <g transform="rotate(-18 -34 -40)">
          <rect x="-37" y="-68" width="5" height="28" rx="2" fill="url(#hr-metal)" />
          <rect x="-40" y="-42" width="11" height="3.6" rx="1.6" fill="url(#hr-gold)" />
          <rect x="-35.4" y="-40" width="3.8" height="8" rx="1.4" fill="#3a2814" />
        </g>
      </g>
    );
  return (
    <g>
      <g transform="rotate(12 32 -40)">
        <path d="M32 -108 L36 -100 L36 -52 L28 -52 L28 -100Z" fill="url(#hr-metal)" stroke="#475569" strokeWidth="0.8" />
        <path d="M32 -106 L32 -54" stroke="#fff" strokeOpacity="0.55" strokeWidth="1" />
        <rect x="21" y="-54" width="22" height="5" rx="2.4" fill="url(#hr-gold)" />
        <rect x="29.6" y="-49" width="4.8" height="12" rx="2" fill="#5a3a1c" />
        <circle cx="32" cy="-35" r="3.2" fill="url(#hr-gold)" />
      </g>
      <g>
        <path d="M-44 -66 L-24 -66 L-24 -44 Q-24 -32 -34 -28 Q-44 -32 -44 -44Z" fill="#2563eb" stroke="#1e3a8a" strokeWidth="1.4" />
        <path d="M-44 -66 L-24 -66 L-24 -44 Q-24 -32 -34 -28 Q-44 -32 -44 -44Z" fill="url(#hr-h)" />
        <path d="M-34 -62 L-34 -34 M-42 -50 L-26 -50" stroke="#fde68a" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M-44 -66 L-24 -66" stroke="url(#hr-gold)" strokeWidth="3" />
      </g>
    </g>
  );
}

export function HeroArt({ guard, cls = "guerriero", look, ward = false }: { guard: boolean; cls?: string; look?: Look | null; ward?: boolean }) {
  const skin = look?.skin ?? "#f1c9a5";
  const hair = look?.hair ?? "#3b2a1a";
  const cape = look?.cape ?? "#b3202f";
  const style = look?.style ?? 0;
  return (
    <g>
      <Defs />
      <Shadow rx={26} />
      <g className="dg-bob">
        <S d="M-19 -64 L19 -64 L36 -6 Q24 3 12 -3 Q0 5 -12 -3 Q-24 3 -36 -6Z" fill={cape} o={0.92} />
        <path d="M-10 -62 L-14 -8 M10 -62 L14 -8" stroke="#000" strokeOpacity="0.18" strokeWidth="1.6" />
        {cls === "ranger" && <S d="M-26 -62 L-14 -64 L-12 -30 L-24 -34Z" fill="#5a3a1c" o={0.9} />}
        <Legs cls={cls} />
        <HairBack hair={hair} style={style} cls={cls} />
        <Torso cls={cls} />
        <rect x="-17" y="-67" width="34" height="8" rx="4" fill={cape} />
        <rect x="-17" y="-67" width="34" height="8" rx="4" fill="url(#hr-v)" />
        <Arms cls={cls} skin={skin} />
        <Face skin={skin} hair={hair} mask={cls === "ladro"} glow={cls === "ladro"} />
        {cls !== "ladro" && <HairFront hair={hair} style={style} />}
        <Headgear cls={cls} />
        <Weapons cls={cls} />
      </g>
      {guard && (
        <g className="dg-guard">
          <ellipse cx="0" cy="-52" rx="42" ry="58" fill="#67e8f9" opacity="0.18" />
          <ellipse cx="0" cy="-52" rx="42" ry="58" fill="none" stroke="#a5f3fc" strokeWidth="3" />
        </g>
      )}
      {ward && (
        <g className="dg-guard">
          <ellipse cx="0" cy="-52" rx="46" ry="62" fill="#fde68a" opacity="0.16" />
          <ellipse cx="0" cy="-52" rx="46" ry="62" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="6 4" />
        </g>
      )}
    </g>
  );
}

export function HeroPortrait({ cls, look, size = 120 }: { cls: string; look?: Look | null; size?: number }) {
  return (
    <svg viewBox="-66 -130 132 140" width={size} height={(size * 140) / 132} aria-hidden>
      <HeroArt guard={false} cls={cls} look={look} />
    </svg>
  );
}
