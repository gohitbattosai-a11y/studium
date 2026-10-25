import { cn } from "@/lib/utils";

const SPARKS = [
  [22, 38],
  [140, 30],
  [150, 96],
  [12, 100],
];

export function BoxArt({ kind, className }: { kind: string; className?: string }) {
  const rare = kind === "rara";
  return (
    <svg viewBox="0 0 160 150" className={cn("block", className)} aria-hidden>
      <defs>
        <linearGradient id={`bx-wood-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={rare ? "#fcd34d" : "#b45309"} />
          <stop offset="1" stopColor={rare ? "#b45309" : "#78350f"} />
        </linearGradient>
        <linearGradient id={`bx-lid-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={rare ? "#fde68a" : "#d97706"} />
          <stop offset="1" stopColor={rare ? "#d97706" : "#92400e"} />
        </linearGradient>
        <linearGradient id="gc-beamgrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" style={{ stopColor: "var(--gc-color, #ffffff)" }} stopOpacity="0.95" />
          <stop offset="1" style={{ stopColor: "var(--gc-color, #ffffff)" }} stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="140" rx="52" ry="7" fill="#000000" opacity="0.35" />
      <path className="gc-beam" d="M34 66 L126 66 L170 -90 L-10 -90 Z" fill="url(#gc-beamgrad)" />
      <g className="gc-body">
        <rect x="30" y="62" width="100" height="72" rx="6" fill={`url(#bx-wood-${kind})`} />
        {rare ? (
          <g fill="none" stroke="#fef3c7" strokeWidth="1.6" opacity="0.8">
            <path d="M40 76 H120 M40 120 H120" />
            <path d="M52 76 Q80 100 108 76" />
          </g>
        ) : (
          <g stroke="#78350f" strokeWidth="1.6" opacity="0.7">
            <path d="M30 86 H130 M30 110 H130" />
          </g>
        )}
        <rect x="30" y="62" width="12" height="72" fill={rare ? "#92400e" : "#cbd5e1"} opacity={rare ? 0.55 : 0.9} />
        <rect x="118" y="62" width="12" height="72" fill={rare ? "#92400e" : "#cbd5e1"} opacity={rare ? 0.55 : 0.9} />
        <circle cx="80" cy="88" r="11" fill={rare ? "#7c2d12" : "#fde68a"} />
        <circle cx="80" cy="88" r="7" fill={rare ? "#fde047" : "#b45309"} />
        {rare ? <path d="M80 82 L84 88 L80 94 L76 88 Z" fill="#ef4444" /> : <path d="M77 90 q3 -7 6 0 q-3 3 -6 0 Z" fill="#fde68a" />}
      </g>
      <g className="gc-lid">
        <rect x="26" y="40" width="108" height="26" rx="8" fill={`url(#bx-lid-${kind})`} />
        <rect x="26" y="40" width="12" height="26" rx="4" fill={rare ? "#92400e" : "#cbd5e1"} opacity={rare ? 0.55 : 0.9} />
        <rect x="122" y="40" width="12" height="26" rx="4" fill={rare ? "#92400e" : "#cbd5e1"} opacity={rare ? 0.55 : 0.9} />
        {rare && (
          <g>
            <circle cx="62" cy="52" r="4.2" fill="#ef4444" />
            <circle cx="80" cy="50" r="5" fill="#38bdf8" />
            <circle cx="98" cy="52" r="4.2" fill="#4ade80" />
          </g>
        )}
        <line className="gc-leak" x1="32" y1="66" x2="128" y2="66" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" />
      </g>
      {rare &&
        SPARKS.map(([x, y], i) => (
          <path key={i} className="gc-sparkle" style={{ animationDelay: `${-i * 0.35}s` }} d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z" fill="#fff7c2" transform={`translate(${x} ${y})`} />
        ))}
    </svg>
  );
}
