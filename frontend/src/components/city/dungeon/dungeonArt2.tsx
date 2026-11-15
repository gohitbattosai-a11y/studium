import type { EnemyKind } from "@/lib/domain/dungeon";

const Shadow = ({ rx = 22 }: { rx?: number }) => <ellipse cx="0" cy="2" rx={rx} ry={rx * 0.3} fill="#000" opacity="0.38" />;

const Dizzy = ({ y }: { y: number }) => (
  <g className="dg-spin" style={{ transformOrigin: `0px ${y}px` }}>
    <text x="-26" y={y + 4} fontSize="14">💫</text>
    <text x="12" y={y + 4} fontSize="14">💫</text>
  </g>
);

function Scarab() {
  return (
    <g>
      <defs>
        <linearGradient id="dg-sc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="0.5" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#172554" />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy="2" rx="14" ry="4" fill="#000" opacity="0.28" />
      <g className="dg-hover">
        <g stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path d="M-9 -18 L-20 -10 L-22 -2 M-10 -24 L-24 -22 L-27 -14 M9 -18 L20 -10 L22 -2 M10 -24 L24 -22 L27 -14" />
        </g>
        <ellipse cx="0" cy="-24" rx="14" ry="17" fill="url(#dg-sc)" stroke="#0f172a" strokeWidth="1.2" />
        <path d="M0 -41 L0 -8" stroke="#0f172a" strokeWidth="1.4" />
        <path d="M-9 -30 Q0 -24 9 -30" stroke="#7dd3fc" strokeWidth="1.2" fill="none" opacity="0.7" />
        <circle cx="0" cy="-43" r="8" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1.2" />
        <path d="M-5 -49 Q-9 -58 -14 -56 M5 -49 Q9 -58 14 -56" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="-3.4" cy="-44" r="1.8" fill="#fbbf24" />
        <circle cx="3.4" cy="-44" r="1.8" fill="#fbbf24" />
        <circle cx="0" cy="-26" r="3.4" fill="#fbbf24" className="dg-glow" />
      </g>
    </g>
  );
}

function Mummy() {
  return (
    <g>
      <defs>
        <linearGradient id="dg-mm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3ead0" />
          <stop offset="1" stopColor="#b8a97a" />
        </linearGradient>
      </defs>
      <Shadow rx={22} />
      <g className="dg-bob">
        <rect x="-12" y="-30" width="9" height="30" rx="3" fill="url(#dg-mm)" stroke="#7c6f48" strokeWidth="1" />
        <rect x="3" y="-30" width="9" height="30" rx="3" fill="url(#dg-mm)" stroke="#7c6f48" strokeWidth="1" />
        <rect x="-17" y="-66" width="34" height="42" rx="9" fill="url(#dg-mm)" stroke="#7c6f48" strokeWidth="1.2" />
        <path d="M-17 -56 L17 -48 M-17 -46 L17 -38 M-17 -36 L17 -29 M-17 -62 L10 -66" stroke="#8a7c52" strokeWidth="1.6" fill="none" />
        <path d="M-17 -60 L-33 -46 L-37 -30 M17 -60 L31 -50" stroke="#e7dcb8" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M-33 -46 L-37 -30 M31 -50 L34 -34" stroke="#8a7c52" strokeWidth="1.4" fill="none" />
        <circle cx="0" cy="-80" r="13" fill="url(#dg-mm)" stroke="#7c6f48" strokeWidth="1.2" />
        <path d="M-12 -84 L12 -78 M-12 -76 L12 -71 M-9 -90 L9 -88" stroke="#8a7c52" strokeWidth="1.5" fill="none" />
        <rect x="-9" y="-83" width="18" height="5" rx="2" fill="#1b1308" />
        <circle cx="-4" cy="-80.5" r="2.2" fill="#22d3ee" className="dg-glow" />
        <circle cx="4" cy="-80.5" r="2.2" fill="#22d3ee" className="dg-glow" />
        <path d="M14 -62 Q24 -56 18 -46 Q12 -50 14 -62Z" fill="#d8cca6" stroke="#8a7c52" strokeWidth="1" />
      </g>
    </g>
  );
}

function Pharaoh({ exh }: { exh: boolean }) {
  const eye = exh ? "#475569" : "#22d3ee";
  return (
    <g>
      <defs>
        <linearGradient id="dg-ph-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="dg-ph-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>
      <Shadow rx={44} />
      <g className={exh ? "dg-dizzy" : "dg-bob"}>
        <path d="M-34 0 L-28 -82 L28 -82 L34 0Z" fill="url(#dg-ph-b)" stroke="#0f172a" strokeWidth="1.6" />
        <path d="M-28 -60 L28 -60 M-30 -36 L30 -36 M-32 -14 L32 -14" stroke="url(#dg-ph-g)" strokeWidth="5" />
        <path d="M-28 -82 L-52 -70 L-54 -20 L-38 -20 L-34 -70Z M28 -82 L52 -70 L54 -20 L38 -20 L34 -70Z" fill="url(#dg-ph-b)" stroke="#0f172a" strokeWidth="1.4" />
        <path d="M-54 -50 L-38 -50 M54 -50 L38 -50" stroke="url(#dg-ph-g)" strokeWidth="4" />
        <path d="M-18 -78 L-24 -128 L24 -128 L18 -78Z" fill="url(#dg-ph-g)" stroke="#78350f" strokeWidth="1.6" />
        <path d="M-24 -128 L-42 -108 L-30 -76 L-18 -78Z M24 -128 L42 -108 L30 -76 L18 -78Z" fill="url(#dg-ph-b)" stroke="#0f172a" strokeWidth="1.4" />
        <path d="M-30 -110 L-24 -104 M-34 -96 L-27 -92 M30 -110 L24 -104 M34 -96 L27 -92" stroke="#fde68a" strokeWidth="2" />
        <rect x="-13" y="-114" width="9" height="6" rx="2" fill={eye} />
        <rect x="4" y="-114" width="9" height="6" rx="2" fill={eye} />
        {!exh && <rect x="-16" y="-118" width="32" height="14" fill="#22d3ee" opacity="0.18" />}
        <path d="M-6 -104 L0 -92 L6 -104Z" fill="#78350f" />
        <path d="M0 -128 Q-6 -142 0 -150 Q6 -142 0 -128Z" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
        <path d="M0 -60 L-10 -48 L0 -36 L10 -48Z" fill={exh ? "#475569" : "#22d3ee"} stroke="#0f172a" strokeWidth="1.2" />
        {!exh && <circle cx="0" cy="-48" r="18" fill="#22d3ee" opacity="0.2" className="dg-glow" />}
        {exh && <Dizzy y={-156} />}
      </g>
    </g>
  );
}

function Imp() {
  return (
    <g>
      <defs>
        <linearGradient id="dg-imp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f87171" />
          <stop offset="1" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <Shadow rx={18} />
      <g className="dg-bob">
        <path d="M0 -28 Q18 -20 24 -34" stroke="#991b1b" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M22 -34 L30 -38 L26 -28Z" fill="#7f1d1d" />
        <path d="M-10 -40 Q-30 -62 -36 -38 Q-28 -40 -24 -32 Q-18 -38 -10 -32Z M10 -40 Q30 -62 36 -38 Q28 -40 24 -32 Q18 -38 10 -32Z" fill="#7f1d1d" stroke="#450a0a" strokeWidth="1" opacity="0.9" />
        <rect x="-9" y="-22" width="7" height="22" rx="3" fill="url(#dg-imp)" />
        <rect x="2" y="-22" width="7" height="22" rx="3" fill="url(#dg-imp)" />
        <ellipse cx="0" cy="-36" rx="13" ry="16" fill="url(#dg-imp)" stroke="#450a0a" strokeWidth="1.2" />
        <path d="M-12 -40 L-20 -32 M12 -40 L20 -32" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
        <circle cx="0" cy="-58" r="12" fill="url(#dg-imp)" stroke="#450a0a" strokeWidth="1.2" />
        <path d="M-8 -66 L-12 -80 L-3 -68Z M8 -66 L12 -80 L3 -68Z" fill="#fde68a" stroke="#92400e" strokeWidth="1" />
        <path d="M-6 -60 L-2 -57 M6 -60 L2 -57" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
        <path d="M-5 -52 Q0 -48 5 -52" stroke="#fff" strokeWidth="1.6" fill="none" />
        <path d="M-3 -52 L-2 -49 M3 -52 L2 -49" stroke="#fff" strokeWidth="1.2" />
      </g>
    </g>
  );
}

function Magmaling() {
  return (
    <g>
      <defs>
        <radialGradient id="dg-mg" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="0.5" stopColor="#f97316" />
          <stop offset="1" stopColor="#7c2d12" />
        </radialGradient>
      </defs>
      <Shadow rx={26} />
      <g className="dg-bob">
        <path d="M-26 0 Q-32 -34 -16 -52 Q0 -66 16 -52 Q32 -34 26 0Z" fill="url(#dg-mg)" stroke="#431407" strokeWidth="1.6" />
        <path d="M-18 -44 Q-8 -52 2 -46 M8 -30 Q16 -36 20 -28 M-20 -22 Q-10 -28 -4 -20" stroke="#292524" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M-18 -44 Q-8 -52 2 -46" stroke="#fde047" strokeWidth="1.2" fill="none" opacity="0.8" />
        <ellipse cx="-8" cy="-36" rx="4.4" ry="5.4" fill="#1c0a04" />
        <ellipse cx="8" cy="-36" rx="4.4" ry="5.4" fill="#1c0a04" />
        <circle cx="-8" cy="-36" r="2" fill="#fef08a" className="dg-glow" />
        <circle cx="8" cy="-36" r="2" fill="#fef08a" className="dg-glow" />
        <path d="M-6 -24 Q0 -20 6 -24" stroke="#1c0a04" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="-14" cy="-60" r="3" fill="#fb923c" className="dg-glow" />
        <circle cx="12" cy="-64" r="2.2" fill="#fde047" className="dg-glow" />
      </g>
    </g>
  );
}

function Dragon({ exh }: { exh: boolean }) {
  const eye = exh ? "#475569" : "#fde047";
  return (
    <g>
      <defs>
        <linearGradient id="dg-dr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="1" stopColor="#450a0a" />
        </linearGradient>
        <linearGradient id="dg-dr2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7f1d1d" />
          <stop offset="1" stopColor="#1c0505" />
        </linearGradient>
      </defs>
      <Shadow rx={58} />
      <g className={exh ? "dg-dizzy" : "dg-bob"}>
        <path d="M-30 -60 Q-92 -108 -100 -40 Q-78 -52 -70 -34 Q-56 -50 -44 -30Z M30 -60 Q92 -108 100 -40 Q78 -52 70 -34 Q56 -50 44 -30Z" fill="url(#dg-dr2)" stroke="#1c0505" strokeWidth="1.6" />
        <path d="M-30 -60 Q-70 -80 -88 -50 M30 -60 Q70 -80 88 -50" stroke="#f87171" strokeWidth="1.4" fill="none" opacity="0.6" />
        <path d="M30 -20 Q70 -10 74 -36 Q64 -30 56 -34" stroke="url(#dg-dr)" strokeWidth="10" strokeLinecap="round" fill="none" />
        <rect x="-26" y="-28" width="18" height="28" rx="6" fill="url(#dg-dr2)" stroke="#1c0505" strokeWidth="1.2" />
        <rect x="8" y="-28" width="18" height="28" rx="6" fill="url(#dg-dr2)" stroke="#1c0505" strokeWidth="1.2" />
        <path d="M-24 0 L-22 6 M-18 0 L-16 6 M12 0 L14 6 M18 0 L20 6" stroke="#fde68a" strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="0" cy="-58" rx="38" ry="38" fill="url(#dg-dr)" stroke="#1c0505" strokeWidth="1.6" />
        <path d="M-22 -36 Q0 -28 22 -36 M-26 -50 Q0 -42 26 -50 M-24 -64 Q0 -56 24 -64" stroke="#fbbf24" strokeWidth="2.2" fill="none" opacity="0.8" />
        <path d="M-6 -90 L0 -108 L6 -90Z M-20 -84 L-18 -100 L-12 -86Z M20 -84 L18 -100 L12 -86Z" fill="#7f1d1d" stroke="#1c0505" strokeWidth="1" />
        <ellipse cx="0" cy="-104" rx="26" ry="22" fill="url(#dg-dr)" stroke="#1c0505" strokeWidth="1.6" />
        <path d="M-20 -118 L-30 -140 L-12 -122Z M20 -118 L30 -140 L12 -122Z" fill="#fde68a" stroke="#92400e" strokeWidth="1.2" />
        <ellipse cx="-10" cy="-108" rx="5.4" ry="4" fill={eye} />
        <ellipse cx="10" cy="-108" rx="5.4" ry="4" fill={eye} />
        <rect x="-9" y="-109" width="2.6" height="6" rx="1" fill="#1c0505" />
        <rect x="6.4" y="-109" width="2.6" height="6" rx="1" fill="#1c0505" />
        {!exh && <circle cx="0" cy="-108" r="26" fill="#fde047" opacity="0.14" className="dg-glow" />}
        <ellipse cx="-4" cy="-94" rx="3" ry="2" fill="#1c0505" />
        <ellipse cx="4" cy="-94" rx="3" ry="2" fill="#1c0505" />
        <path d="M-14 -90 Q0 -80 14 -90" stroke="#1c0505" strokeWidth="2" fill="none" />
        <path d="M-9 -88 L-8 -82 M0 -86 L0 -80 M9 -88 L8 -82" stroke="#fff" strokeWidth="2" />
        {!exh && <path d="M0 -58 Q-8 -50 0 -42 Q8 -50 0 -58Z" fill="#fde047" className="dg-glow" />}
        {exh && <Dizzy y={-146} />}
      </g>
    </g>
  );
}

export const EXTRA_KINDS: EnemyKind[] = ["scarab", "mummy", "pharaoh", "imp", "magmaling", "dragon"];
export const EXTRA_H: Partial<Record<EnemyKind, number>> = { scarab: 58, mummy: 94, pharaoh: 152, imp: 80, magmaling: 66, dragon: 142 };

export function ExtraEnemyArt({ kind, exh }: { kind: EnemyKind; exh?: boolean }) {
  if (kind === "scarab") return <Scarab />;
  if (kind === "mummy") return <Mummy />;
  if (kind === "pharaoh") return <Pharaoh exh={!!exh} />;
  if (kind === "imp") return <Imp />;
  if (kind === "magmaling") return <Magmaling />;
  if (kind === "dragon") return <Dragon exh={!!exh} />;
  return null;
}
