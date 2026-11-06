import { STAT_KEYS, STAT_LABEL, type Player } from "@/lib/domain/football";

const TIERS = {
  bronzo: { bg: "linear-gradient(160deg,#6b4423,#c58b4e 55%,#8a5a2b)", ink: "#2a1608", edge: "#e0a96a", name: "Bronzo" },
  argento: { bg: "linear-gradient(160deg,#6d7684,#dde2e8 55%,#9aa3b0)", ink: "#1b222b", edge: "#f1f4f8", name: "Argento" },
  oro: { bg: "linear-gradient(160deg,#a8740b,#f7d774 55%,#c8921a)", ink: "#2e1f03", edge: "#ffe9a0", name: "Oro" },
  elite: { bg: "linear-gradient(160deg,#1b1646,#5b2fc9 55%,#0e7490)", ink: "#ffffff", edge: "#67e8f9", name: "Élite" },
};

export const tierOf = (ovr: number) => (ovr >= 85 ? "elite" : ovr >= 75 ? "oro" : ovr >= 65 ? "argento" : "bronzo") as keyof typeof TIERS;
export const tierName = (ovr: number) => TIERS[tierOf(ovr)].name;
export const surname = (name: string) => name.split(" ").slice(1).join(" ") || name;

const hash = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};
const SKIN = ["#f1c9a5", "#e0a97f", "#c68a5e", "#a06a43", "#7a4a2b"];
const HAIR = ["#1a1410", "#3b2a1a", "#6b4423", "#c9a24b", "#8a2d1a"];

export function Avatar({ id, shirt, className }: { id: string; shirt: string; className?: string }) {
  const h = hash(id);
  const skin = SKIN[h % SKIN.length];
  const hair = HAIR[(h >> 3) % HAIR.length];
  const style = (h >> 6) % 3;
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <path d="M6 60 C6 44 18 40 30 40 C42 40 54 44 54 60Z" fill={shirt} />
      <path d="M24 40 L30 48 L36 40Z" fill="#ffffff" opacity="0.55" />
      <rect x="25" y="32" width="10" height="10" rx="3" fill={skin} />
      <ellipse cx="30" cy="22" rx="12" ry="14" fill={skin} />
      {style === 0 && <path d="M17 20 Q18 6 30 7 Q42 6 43 20 Q38 12 30 13 Q22 12 17 20Z" fill={hair} />}
      {style === 1 && <path d="M17 22 Q14 4 30 6 Q46 4 43 22 Q40 10 30 11 Q20 10 17 22Z" fill={hair} />}
      {style === 2 && <path d="M18 17 Q30 3 42 17 Q36 11 30 12 Q24 11 18 17Z" fill={hair} />}
      <circle cx="25.5" cy="23" r="1.4" fill="#1a1a1a" />
      <circle cx="34.5" cy="23" r="1.4" fill="#1a1a1a" />
      <path d="M26 29 Q30 32 34 29" stroke="#8a4b3a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

interface Props {
  p: Player;
  size?: number;
  color?: string;
  selected?: boolean;
  dim?: boolean;
  onClick?: () => void;
}

export default function PlayerCard({ p, size = 1, color = "#2563eb", selected, dim, onClick }: Props) {
  const t = TIERS[tierOf(p.ovr)];
  const box = { width: 100 * size, height: 136 * size };
  const inner = (
    <div
      className="absolute top-0 left-0 overflow-hidden"
      style={{
        width: 100,
        height: 136,
        transform: `scale(${size})`,
        transformOrigin: "top left",
        background: t.bg,
        color: t.ink,
        borderRadius: "10px 10px 30px 30px",
        border: `2px solid ${t.edge}`,
        boxShadow: selected ? "0 0 0 3px #E3B341, 0 0 16px #E3B341" : p.ovr >= 85 ? "0 0 12px #67e8f9aa" : "0 2px 6px #0008",
        opacity: dim ? 0.55 : 1,
      }}
    >
      <div className="absolute inset-0 opacity-25" style={{ background: "radial-gradient(circle at 70% 25%,#ffffff,transparent 60%)" }} />
      <div className="absolute leading-none font-extrabold" style={{ left: 8, top: 7, fontSize: 25 }}>
        {p.ovr}
      </div>
      <div className="absolute leading-none font-bold" style={{ left: 9, top: 34, fontSize: 11 }}>
        {p.pos}
      </div>
      <div className="absolute" style={{ right: 4, top: 8, width: 66, height: 66 }}>
        <Avatar id={p.id} shirt={color} className="size-full" />
      </div>
      <div className="absolute inset-x-1 truncate text-center leading-none font-extrabold uppercase" style={{ top: 80, fontSize: 11 }}>
        {surname(p.name)}
      </div>
      <div className="absolute inset-x-3" style={{ top: 96, height: 1, background: t.ink, opacity: 0.35 }} />
      {size >= 0.8 && (
        <div className="absolute inset-x-2 grid grid-cols-3 gap-x-1 gap-y-0.5 text-center leading-none" style={{ top: 101, fontSize: 9 }}>
          {STAT_KEYS.map((k) => (
            <div key={k}>
              <b>{p.stats[k]}</b> <span style={{ opacity: 0.75, fontSize: 7 }}>{STAT_LABEL[k]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className="relative block shrink-0 outline-none" style={box} aria-label={p.name}>
      {inner}
    </button>
  ) : (
    <div className="relative shrink-0" style={box}>
      {inner}
    </div>
  );
}
