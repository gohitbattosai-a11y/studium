import type { ReactNode } from "react";

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join("")}`;
};

function Frame({ children, size, id, color }: { children: ReactNode; size: number; id: string; color: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={shade(color, 1.25)} />
          <stop offset="1" stopColor={shade(color, 0.6)} />
        </linearGradient>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1f5f9" />
          <stop offset="1" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
}

export function LootIcon({ shape, color, size = 48 }: { shape: string; color: string; size?: number }) {
  const id = `li-${shape}`;
  const A = `url(#${id}-a)`;
  const M = `url(#${id}-m)`;
  const G = `url(#${id}-g)`;
  const dk = shade(color, 0.4);
  let body: ReactNode;
  switch (shape) {
    case "helm":
      body = (
        <g>
          <path d="M12 40 Q12 14 32 14 Q52 14 52 40 L48 50 L16 50Z" fill={A} stroke={dk} strokeWidth="1.6" />
          <path d="M16 36 L48 36 L48 42 L16 42Z" fill="#0f172a" />
          <path d="M30 14 L34 14 L34 36 L30 36Z" fill={M} />
          <path d="M18 24 Q24 18 30 17" stroke="#fff" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M22 30 L26 34 M40 24 L44 30" stroke={dk} strokeWidth="1.4" />
        </g>
      );
      break;
    case "horned":
      body = (
        <g>
          <path d="M14 30 Q2 22 4 8 Q14 14 20 24Z M50 30 Q62 22 60 8 Q50 14 44 24Z" fill="#f5f5f4" stroke="#a8a29e" strokeWidth="1.2" />
          <path d="M14 42 Q14 18 32 18 Q50 18 50 42 L46 52 L18 52Z" fill={A} stroke={dk} strokeWidth="1.6" />
          <path d="M18 38 L46 38 L46 44 L18 44Z" fill="#0f172a" />
          <circle cx="32" cy="28" r="3" fill={G} />
        </g>
      );
      break;
    case "dagger":
      body = (
        <g transform="rotate(35 32 32)">
          <path d="M32 6 L38 38 L32 42 L26 38Z" fill={M} stroke="#475569" strokeWidth="1.2" />
          <path d="M32 8 L32 40" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
          <rect x="22" y="40" width="20" height="5" rx="2" fill={A} />
          <rect x="29" y="45" width="6" height="12" rx="2" fill={dk} />
          <path d="M28 20 L30 24 M35 14 L36 18" stroke="#92400e" strokeWidth="2" opacity="0.7" />
        </g>
      );
      break;
    case "sword":
    case "greatsword":
      body = (
        <g transform="rotate(40 32 32)">
          <path d="M32 2 L39 40 L32 46 L25 40Z" fill={M} stroke="#475569" strokeWidth="1.2" />
          <path d="M32 6 L32 42" stroke={color} strokeWidth="2" opacity="0.9" />
          <rect x="18" y="44" width="28" height="6" rx="3" fill={G} stroke="#78350f" strokeWidth="1" />
          <rect x="29" y="50" width="6" height="11" rx="2" fill={dk} />
          <circle cx="32" cy="62" r="3" fill={A} />
          {shape === "greatsword" && <path d="M32 14 L35 22 L32 30 L29 22Z" fill={color} opacity="0.85" />}
        </g>
      );
      break;
    case "shield":
      body = (
        <g>
          <path d="M10 12 L54 12 L54 34 Q54 50 32 60 Q10 50 10 34Z" fill={A} stroke={dk} strokeWidth="1.8" />
          <path d="M32 12 L32 58 M10 30 L54 30" stroke={dk} strokeWidth="2" opacity="0.7" />
          <circle cx="32" cy="30" r="6" fill={G} stroke="#78350f" strokeWidth="1" />
          <path d="M44 14 L50 24 L46 28" stroke="#0f172a" strokeWidth="2" fill="none" opacity="0.7" />
        </g>
      );
      break;
    case "pauldron":
      body = (
        <g>
          <path d="M8 40 Q8 14 34 12 Q56 14 56 34 L50 36 Q40 22 22 30 L14 44Z" fill={A} stroke={dk} strokeWidth="1.6" />
          <path d="M18 34 Q30 22 48 32" stroke="#fff" strokeWidth="2" fill="none" opacity="0.45" />
          <circle cx="22" cy="40" r="2.4" fill={G} />
          <circle cx="32" cy="36" r="2.4" fill={G} />
          <circle cx="42" cy="38" r="2.4" fill={G} />
        </g>
      );
      break;
    case "cuirass":
      body = (
        <g>
          <path d="M14 14 L26 10 Q32 18 38 10 L50 14 L56 28 L48 32 L46 54 L18 54 L16 32 L8 28Z" fill={A} stroke={dk} strokeWidth="1.8" />
          <path d="M32 18 L32 54 M20 34 L44 34 M20 44 L44 44" stroke={dk} strokeWidth="1.4" opacity="0.7" />
          <circle cx="32" cy="30" r="4" fill={color} stroke="#fff" strokeOpacity="0.6" />
        </g>
      );
      break;
    case "amulet":
      body = (
        <g>
          <path d="M14 6 Q32 34 50 6" stroke="#fbbf24" strokeWidth="2.4" fill="none" />
          <circle cx="32" cy="38" r="15" fill={G} stroke="#78350f" strokeWidth="1.4" />
          <circle cx="32" cy="38" r="9" fill={A} stroke="#fff" strokeOpacity="0.5" />
          <path d="M32 31 L35 38 L32 45 L29 38Z" fill="#fff" opacity="0.6" />
        </g>
      );
      break;
    case "ring":
      body = (
        <g>
          <ellipse cx="32" cy="38" rx="17" ry="15" fill="none" stroke={M} strokeWidth="7" />
          <ellipse cx="32" cy="38" rx="17" ry="15" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.5" />
          <path d="M24 22 L32 10 L40 22 L32 28Z" fill="#38bdf8" stroke="#0c4a6e" strokeWidth="1.2" />
          <path d="M28 20 L32 14" stroke="#fff" strokeWidth="1.4" opacity="0.7" />
        </g>
      );
      break;
    case "gem":
      body = (
        <g>
          <path d="M18 14 L46 14 L58 28 L32 58 L6 28Z" fill={A} stroke={dk} strokeWidth="1.6" />
          <path d="M6 28 L58 28 M18 14 L26 28 L32 58 L38 28 L46 14 M26 28 L32 14 L38 28" stroke="#fff" strokeWidth="1.1" opacity="0.55" fill="none" />
        </g>
      );
      break;
    case "crown":
      body = (
        <g>
          <path d="M8 46 L12 18 L24 32 L32 12 L40 32 L52 18 L56 46Z" fill={G} stroke="#78350f" strokeWidth="1.6" />
          <rect x="8" y="44" width="48" height="9" rx="2" fill={G} stroke="#78350f" strokeWidth="1.4" />
          <circle cx="32" cy="48.5" r="3" fill="#ef4444" />
          <circle cx="18" cy="48.5" r="2.2" fill="#38bdf8" />
          <circle cx="46" cy="48.5" r="2.2" fill="#34d399" />
          <circle cx="12" cy="17" r="2.4" fill="#fff" opacity="0.8" />
          <circle cx="32" cy="11" r="2.4" fill="#fff" opacity="0.8" />
          <circle cx="52" cy="17" r="2.4" fill="#fff" opacity="0.8" />
        </g>
      );
      break;
    case "axe":
      body = (
        <g transform="rotate(35 32 32)">
          <rect x="29" y="6" width="6" height="54" rx="3" fill={dk} />
          <path d="M35 10 Q56 12 54 30 Q46 28 35 30Z" fill={M} stroke="#475569" strokeWidth="1.2" />
          <path d="M29 12 Q12 14 14 28 Q20 26 29 26Z" fill={A} stroke={dk} strokeWidth="1.2" />
          <path d="M38 14 Q48 16 50 24" stroke="#fff" strokeWidth="1.4" fill="none" opacity="0.6" />
        </g>
      );
      break;
    case "mace":
      body = (
        <g transform="rotate(35 32 32)">
          <rect x="29" y="22" width="6" height="40" rx="3" fill={dk} />
          <circle cx="32" cy="16" r="12" fill={A} stroke={dk} strokeWidth="1.6" />
          <path d="M32 0 L32 6 M32 26 L32 32 M16 16 L22 16 M42 16 L48 16" stroke={M} strokeWidth="3" strokeLinecap="round" />
          <circle cx="28" cy="12" r="3" fill="#fff" opacity="0.5" />
        </g>
      );
      break;
    case "staff":
      body = (
        <g transform="rotate(30 32 32)">
          <rect x="30" y="14" width="4" height="48" rx="2" fill="#7c5a2b" />
          <circle cx="32" cy="10" r="9" fill={A} stroke={dk} strokeWidth="1.6" />
          <circle cx="29" cy="7" r="3" fill="#fff" opacity="0.7" />
          <path d="M24 18 Q32 24 40 18" stroke={dk} strokeWidth="2" fill="none" />
        </g>
      );
      break;
    case "bow":
      body = (
        <g>
          <path d="M20 6 Q58 32 20 58" fill="none" stroke={A} strokeWidth="5" strokeLinecap="round" />
          <path d="M20 6 L20 58" stroke="#e5e7eb" strokeWidth="1.4" />
          <path d="M12 32 L44 32 M44 32 L38 28 M44 32 L38 36" stroke={dk} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "robe":
      body = (
        <g>
          <path d="M20 8 L44 8 L56 26 L48 32 L46 58 L18 58 L16 32 L8 26Z" fill={A} stroke={dk} strokeWidth="1.6" />
          <path d="M28 8 Q32 18 36 8" fill={dk} />
          <path d="M32 18 L32 58" stroke="#fff" strokeWidth="1.2" opacity="0.35" />
          <rect x="18" y="36" width="28" height="4" fill={M} />
        </g>
      );
      break;
    case "leather":
      body = (
        <g>
          <path d="M18 8 L46 8 L58 20 L50 30 L46 26 L46 58 L18 58 L18 26 L14 30 L6 20Z" fill={A} stroke={dk} strokeWidth="1.6" />
          <path d="M18 24 L46 24 M18 38 L46 38" stroke={dk} strokeWidth="1.6" opacity="0.7" />
          <circle cx="24" cy="31" r="1.6" fill={M} />
          <circle cx="32" cy="31" r="1.6" fill={M} />
          <circle cx="40" cy="31" r="1.6" fill={M} />
        </g>
      );
      break;
    case "coin":
      body = (
        <g>
          <circle cx="32" cy="32" r="22" fill={G} stroke="#78350f" strokeWidth="1.8" />
          <circle cx="32" cy="32" r="16" fill="none" stroke="#92400e" strokeWidth="1.6" />
          <path d="M32 20 L35 30 L45 30 L37 36 L40 46 L32 40 L24 46 L27 36 L19 30 L29 30Z" fill="#fef3c7" opacity="0.85" />
        </g>
      );
      break;
    case "bone":
      body = (
        <g transform="rotate(-35 32 32)">
          <rect x="22" y="28" width="30" height="8" rx="4" fill="#f5f0dc" stroke="#a8a08a" strokeWidth="1.2" />
          <circle cx="16" cy="28" r="6" fill="#f5f0dc" stroke="#a8a08a" strokeWidth="1.2" />
          <circle cx="16" cy="38" r="6" fill="#f5f0dc" stroke="#a8a08a" strokeWidth="1.2" />
          <circle cx="56" cy="28" r="5" fill="#f5f0dc" stroke="#a8a08a" strokeWidth="1.2" />
          <path d="M30 32 L40 32" stroke="#a8a08a" strokeWidth="1.4" />
        </g>
      );
      break;
    case "cloth":
      body = (
        <g>
          <path d="M10 14 Q32 6 54 14 L50 34 Q54 46 44 56 L38 46 L30 58 L24 44 L14 52 Q10 34 10 14Z" fill={A} stroke={dk} strokeWidth="1.4" />
          <path d="M18 22 Q32 18 46 22 M18 32 Q32 28 46 32" stroke="#fff" strokeWidth="1.2" opacity="0.35" fill="none" />
        </g>
      );
      break;
    case "web":
      body = (
        <g stroke="#e2e8f0" strokeWidth="1.6" fill="none">
          <path d="M32 6 L32 58 M8 18 L56 46 M56 18 L8 46" />
          <path d="M32 18 L44 25 L44 39 L32 46 L20 39 L20 25Z M32 28 L38 31 L38 37 L32 40 L26 37 L26 31Z" opacity="0.9" />
        </g>
      );
      break;
    default:
      body = (
        <g>
          <path d="M10 44 L18 20 L34 14 L50 24 L54 46 L36 54Z" fill={A} stroke={dk} strokeWidth="1.6" />
          <path d="M18 20 L30 32 L54 46 M34 14 L30 32 L36 54" stroke="#fff" strokeWidth="1.1" opacity="0.35" fill="none" />
          <circle cx="24" cy="42" r="2" fill={dk} />
        </g>
      );
  }
  return <Frame size={size} id={id} color={color}>{body}</Frame>;
}

export function TrophyArt({ art, color, size = 64 }: { art: string; color: string; size?: number }) {
  const id = `tr-${art}`;
  const A = `url(#${id}-a)`;
  const M = `url(#${id}-m)`;
  const G = `url(#${id}-g)`;
  const dk = shade(color, 0.35);
  let body: ReactNode;
  switch (art) {
    case "core":
      body = (
        <g>
          <circle cx="32" cy="34" r="19" fill={A} stroke={dk} strokeWidth="1.6" />
          <circle cx="32" cy="34" r="9" fill="#dcfce7" opacity="0.8" />
          <ellipse cx="25" cy="25" rx="6" ry="3.5" fill="#fff" opacity="0.7" transform="rotate(-30 25 25)" />
        </g>
      );
      break;
    case "skull":
      body = (
        <g>
          <path d="M14 30 Q14 8 32 8 Q50 8 50 30 Q50 38 44 42 L44 52 L20 52 L20 42 Q14 38 14 30Z" fill="#ebe5d0" stroke="#8d866f" strokeWidth="1.6" />
          <ellipse cx="24" cy="30" rx="6" ry="7" fill="#1b1620" />
          <ellipse cx="40" cy="30" rx="6" ry="7" fill="#1b1620" />
          <path d="M32 38 L29 44 L35 44Z" fill="#1b1620" />
          <path d="M26 52 L26 46 M32 52 L32 46 M38 52 L38 46" stroke="#8d866f" strokeWidth="1.6" />
          <path d="M36 10 L33 20 L38 26" stroke="#8d866f" strokeWidth="1.6" fill="none" />
        </g>
      );
      break;
    case "wing":
      body = (
        <g>
          <path d="M6 14 Q30 4 58 24 L52 28 L50 38 L42 32 L38 46 L30 34 L22 46 L20 30 Q10 28 6 14Z" fill={A} stroke={dk} strokeWidth="1.5" />
          <path d="M6 14 L38 46 M6 14 L30 34 M6 14 L50 38" stroke="#ddd6fe" strokeWidth="1.2" opacity="0.7" />
        </g>
      );
      break;
    case "veil":
      body = (
        <g>
          <path d="M14 10 Q32 2 50 10 L52 54 L44 48 L38 56 L32 48 L26 56 L20 48 L12 54Z" fill={A} stroke={dk} strokeWidth="1.4" opacity="0.92" />
          <circle cx="24" cy="26" r="4" fill="#ecfeff" />
          <circle cx="40" cy="26" r="4" fill="#ecfeff" />
          <circle cx="24" cy="26" r="9" fill="#67e8f9" opacity="0.3" />
          <circle cx="40" cy="26" r="9" fill="#67e8f9" opacity="0.3" />
        </g>
      );
      break;
    case "heart":
      body = (
        <g>
          <path d="M32 6 L50 28 L32 58 L14 28Z" fill={A} stroke="#7c2d12" strokeWidth="1.6" />
          <path d="M32 6 L32 58 M14 28 L50 28" stroke="#fff7ed" strokeWidth="1.2" opacity="0.5" />
          <circle cx="32" cy="30" r="18" fill="#fb923c" opacity="0.25" />
        </g>
      );
      break;
    case "goblin":
      body = (
        <g>
          <path d="M14 30 L2 22 L8 38Z M50 30 L62 22 L56 38Z" fill={A} stroke={dk} strokeWidth="1.3" />
          <ellipse cx="32" cy="32" rx="19" ry="20" fill={A} stroke={dk} strokeWidth="1.6" />
          <ellipse cx="25" cy="28" rx="4.5" ry="5.5" fill="#fef9c3" />
          <ellipse cx="39" cy="28" rx="4.5" ry="5.5" fill="#fef9c3" />
          <circle cx="25.5" cy="29" r="2.2" fill="#7f1d1d" />
          <circle cx="39.5" cy="29" r="2.2" fill="#7f1d1d" />
          <path d="M20 21 L28 24 M44 21 L36 24" stroke={dk} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M22 42 Q32 50 42 42 L39 46 L35 42 L32 47 L29 42 L25 46Z" fill="#fff" stroke={dk} strokeWidth="1" />
        </g>
      );
      break;
    case "knife":
      body = (
        <g transform="rotate(40 32 32)">
          <path d="M32 2 L40 36 L32 40 L24 36Z" fill={M} stroke="#475569" strokeWidth="1.2" />
          <path d="M24 12 L28 14 M24 20 L28 22 M24 28 L28 30" stroke="#475569" strokeWidth="1.6" />
          <path d="M32 6 L32 36" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
          <rect x="22" y="38" width="20" height="5" rx="2" fill={A} />
          <rect x="28" y="43" width="8" height="15" rx="3" fill="#78350f" />
          <path d="M28 47 L36 47 M28 52 L36 52" stroke="#451a03" strokeWidth="1.4" />
        </g>
      );
      break;
    case "orccrown":
      body = (
        <g>
          <path d="M6 48 L10 16 L22 30 L32 8 L42 30 L54 16 L58 48Z" fill={G} stroke="#78350f" strokeWidth="1.8" />
          <rect x="6" y="44" width="52" height="10" rx="2" fill={G} stroke="#78350f" strokeWidth="1.4" />
          <path d="M14 46 L18 52 M28 46 L32 52 M42 46 L46 52" stroke="#78350f" strokeWidth="1.6" />
          <circle cx="32" cy="35" r="4" fill="#dc2626" />
          <path d="M10 16 L8 8 M32 8 L32 2 M54 16 L56 8" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
      break;
    case "fang":
      body = (
        <g>
          <path d="M20 6 Q44 8 46 30 Q46 46 34 58 Q36 38 28 28 Q22 20 20 6Z" fill="#f7fee7" stroke="#84cc16" strokeWidth="1.6" />
          <path d="M26 12 Q38 16 40 30" stroke="#d9f99d" strokeWidth="2" fill="none" />
          <circle cx="36" cy="46" r="3" fill={color} className="dg-glow" />
          <circle cx="34" cy="54" r="2" fill={color} className="dg-glow" />
        </g>
      );
      break;
    case "eye":
      body = (
        <g>
          <circle cx="32" cy="32" r="24" fill="#2a0d1a" stroke="#0a0206" strokeWidth="1.6" />
          <circle cx="32" cy="32" r="18" fill={A} />
          <ellipse cx="32" cy="32" rx="5" ry="14" fill="#0a0206" />
          <circle cx="26" cy="24" r="4" fill="#fff" opacity="0.7" />
          <path d="M10 18 L16 24 M54 18 L48 24 M10 46 L16 40 M54 46 L48 40" stroke="#7f1d3a" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
      break;
    default:
      body = <circle cx="32" cy="32" r="20" fill={A} stroke={dk} strokeWidth="1.6" />;
  }
  return <Frame size={size} id={id} color={color}>{body}</Frame>;
}
