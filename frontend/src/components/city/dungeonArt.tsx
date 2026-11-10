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

function Slime() {
  return (
    <g>
      <Shadow rx={26} />
      <g className="dg-squish">
        <path d="M-26 0 Q-30 -34 0 -38 Q30 -34 26 0 Q0 7 -26 0Z" fill="#4ade80" />
        <path d="M-26 0 Q0 7 26 0 Q24 -8 0 -9 Q-24 -8 -26 0Z" fill="#22a55a" />
        <ellipse cx="-11" cy="-27" rx="7" ry="4" fill="#d9fbe5" opacity="0.75" transform="rotate(-24 -11 -27)" />
        <circle cx="-8" cy="-17" r="5.5" fill="#fff" />
        <circle cx="9" cy="-17" r="5.5" fill="#fff" />
        <circle cx="-7" cy="-16" r="2.6" fill="#0f2a1a" />
        <circle cx="10" cy="-16" r="2.6" fill="#0f2a1a" />
        <path d="M-6 -7 Q1 -2 8 -7" stroke="#14532d" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Skeleton() {
  const bone = "#ebe5d0";
  return (
    <g>
      <Shadow rx={22} />
      <g className="dg-bob">
        <g stroke={bone} strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M-6 -24 L-8 -2 M6 -24 L8 -2" />
          <path d="M0 -50 L0 -26" />
          <path d="M-12 -46 Q0 -42 12 -46 M-11 -39 Q0 -35 11 -39 M-9 -32 Q0 -29 9 -32" strokeWidth="3.6" />
          <path d="M-12 -50 L-22 -34 L-24 -22 M12 -50 L22 -38" />
        </g>
        <ellipse cx="-9" cy="-1" rx="7" ry="3" fill={bone} />
        <ellipse cx="9" cy="-1" rx="7" ry="3" fill={bone} />
        <rect x="-6" y="-26" width="12" height="6" rx="2" fill={bone} />
        <circle cx="0" cy="-64" r="13" fill={bone} />
        <rect x="-8" y="-55" width="16" height="9" rx="3" fill={bone} />
        <ellipse cx="-5" cy="-65" rx="3.6" ry="4.4" fill="#1b1620" />
        <ellipse cx="5" cy="-65" rx="3.6" ry="4.4" fill="#1b1620" />
        <circle cx="-5" cy="-65" r="1.3" fill="#ef4444" />
        <circle cx="5" cy="-65" r="1.3" fill="#ef4444" />
        <path d="M-5 -53 L-5 -48 M0 -53 L0 -48 M5 -53 L5 -48" stroke="#8d866f" strokeWidth="1.6" />
        <rect x="21" y="-62" width="5" height="40" rx="2" fill="#a8a29e" />
        <rect x="16" y="-26" width="15" height="4" rx="2" fill="#78716c" />
        <circle cx="-24" cy="-20" r="5" fill={bone} />
      </g>
    </g>
  );
}

function Bat() {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="14" ry="4" fill="#000" opacity="0.28" />
      <g className="dg-hover">
        <g className="dg-flap" style={{ transformOrigin: "-6px -38px" }}>
          <path d="M-6 -38 Q-26 -62 -48 -40 Q-40 -36 -36 -30 Q-30 -36 -24 -28 Q-16 -34 -6 -26Z" fill="#4c2a7a" />
          <path d="M-6 -38 Q-26 -56 -42 -41" stroke="#7c4fb8" strokeWidth="2" fill="none" />
        </g>
        <g className="dg-flap" style={{ transformOrigin: "6px -38px" }}>
          <path d="M6 -38 Q26 -62 48 -40 Q40 -36 36 -30 Q30 -36 24 -28 Q16 -34 6 -26Z" fill="#4c2a7a" />
          <path d="M6 -38 Q26 -56 42 -41" stroke="#7c4fb8" strokeWidth="2" fill="none" />
        </g>
        <ellipse cx="0" cy="-34" rx="11" ry="14" fill="#2d1b4e" />
        <path d="M-9 -44 L-7 -56 L-2 -47Z M9 -44 L7 -56 L2 -47Z" fill="#2d1b4e" />
        <circle cx="-4.5" cy="-37" r="2.6" fill="#f43f5e" />
        <circle cx="4.5" cy="-37" r="2.6" fill="#f43f5e" />
        <path d="M-3 -29 L-2 -25 L0 -29 L2 -25 L3 -29" fill="#fff" />
      </g>
    </g>
  );
}

function Wraith() {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="18" ry="5" fill="#000" opacity="0.25" />
      <g className="dg-hover">
        <path d="M-22 -6 Q-28 -46 -11 -68 Q0 -80 11 -68 Q28 -46 22 -6 Q15 -14 8 -4 Q0 -14 -8 -4 Q-15 -14 -22 -6Z" fill="#5b4bc4" opacity="0.88" />
        <path d="M-22 -6 Q-28 -46 -11 -68 Q-6 -52 -9 -30 Q-12 -14 -22 -6Z" fill="#3f2f95" opacity="0.7" />
        <ellipse cx="0" cy="-56" rx="10" ry="12" fill="#120b2b" />
        <circle cx="-4.5" cy="-57" r="3.6" fill="#67e8f9" />
        <circle cx="4.5" cy="-57" r="3.6" fill="#67e8f9" />
        <circle cx="-4.5" cy="-57" r="7" fill="#67e8f9" opacity="0.25" />
        <circle cx="4.5" cy="-57" r="7" fill="#67e8f9" opacity="0.25" />
        <path d="M-20 -34 Q-34 -30 -36 -18 M20 -34 Q34 -30 36 -18" stroke="#8f84e6" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
    </g>
  );
}

function Golem({ exh }: { exh: boolean }) {
  return (
    <g>
      <Shadow rx={44} />
      <g className={exh ? "dg-dizzy" : "dg-bob"}>
        <rect x="-30" y="-34" width="22" height="34" rx="6" fill="#6b7280" />
        <rect x="8" y="-34" width="22" height="34" rx="6" fill="#5f6672" />
        <rect x="-44" y="-96" width="88" height="68" rx="14" fill="#7b8494" />
        <rect x="-44" y="-96" width="88" height="20" rx="10" fill="#97a1b4" />
        <path d="M-44 -50 L44 -50" stroke="#59616f" strokeWidth="3" />
        <path d="M-20 -96 L-14 -76 L-24 -62 M22 -96 L16 -80 L26 -64" stroke="#59616f" strokeWidth="2.6" fill="none" />
        <rect x="-70" y="-90" width="26" height="58" rx="10" fill="#6b7280" />
        <rect x="44" y="-90" width="26" height="58" rx="10" fill="#6b7280" />
        <rect x="-74" y="-40" width="32" height="26" rx="9" fill="#8a93a6" />
        <rect x="42" y="-40" width="32" height="26" rx="9" fill="#8a93a6" />
        <rect x="-22" y="-128" width="44" height="36" rx="10" fill="#8a93a6" />
        <rect x="-22" y="-128" width="44" height="12" rx="6" fill="#a8b1c3" />
        <rect x="-14" y="-116" width="10" height="7" rx="2" fill={exh ? "#475569" : "#fb923c"} />
        <rect x="4" y="-116" width="10" height="7" rx="2" fill={exh ? "#475569" : "#fb923c"} />
        {!exh && <rect x="-18" y="-120" width="36" height="16" fill="#fb923c" opacity="0.16" />}
        <path d="M0 -84 L-12 -66 L0 -48 L12 -66Z" fill={exh ? "#475569" : "#f97316"} />
        {!exh && <path d="M0 -84 L-12 -66 L0 -48 L12 -66Z" fill="#fdba74" opacity="0.45" className="dg-glow" />}
        {exh && (
          <g className="dg-spin" style={{ transformOrigin: "0px -138px" }}>
            <text x="-26" y="-134" fontSize="14">💫</text>
            <text x="12" y="-134" fontSize="14">💫</text>
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
  return <Golem exh={!!exh} />;
}

export const ENEMY_H: Record<EnemyKind, number> = { slime: 44, skeleton: 82, bat: 60, wraith: 84, golem: 142 };

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
