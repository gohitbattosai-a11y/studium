import type { CSSProperties } from "react";
import type { SceneId } from "@/lib/types";
import "./scenes.css";

export interface SceneProps {
  id: SceneId;
  progress: number;
  hit: { kind: "good" | "bad"; n: number } | null;
}

const slide = (x: number, y = 0, extra = ""): CSSProperties => ({
  transform: `translate(${x}px, ${y}px) ${extra}`,
  transition: "transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)",
});

function Frame({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <svg viewBox="0 0 400 150" className="block h-36 w-full sm:h-44" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="150" fill={bg} />
      {children}
    </svg>
  );
}

function Car({ progress, hit }: SceneProps) {
  const x = 14 + progress * 290;
  return (
    <Frame bg="#16233d">
      <circle cx="330" cy="30" r="14" fill="#fde68a" opacity="0.9" />
      <path d="M0 98 Q60 62 130 92 T270 88 T400 82 V112 H0 Z" fill="#1e3050" />
      <rect y="104" width="400" height="46" fill="#2b3240" />
      <line x1="0" x2="400" y1="128" y2="128" stroke="#e5e7eb" strokeWidth="3" strokeDasharray="22 18" className="sc-road" />
      <rect x="0" y="104" width="400" height="3" fill="#475569" />
      <g transform="translate(366 70)">
        <rect x="0" y="0" width="3" height="40" fill="#cbd5e1" />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={3 + (i % 2) * 8} y={(Math.floor(i / 2)) * 7} width="8" height="7" fill={(i + Math.floor(i / 2)) % 2 ? "#0f172a" : "#f8fafc"} />
        ))}
      </g>
      <g style={slide(x)}>
        <g key={hit?.n ?? 0} className={hit ? (hit.kind === "bad" ? "sc-shake" : "sc-boost") : undefined}>
          {hit?.kind === "good" && <polygon className="sc-flame" points="-2,108 -22,114 -2,120" fill="#fb923c" />}
          <path d="M0 112 L0 102 Q2 96 12 95 L22 86 Q26 84 44 84 L58 95 Q70 96 72 104 L72 112 Z" fill="#ef4444" />
          <path d="M24 88 L44 88 L54 95 L20 95 Z" fill="#bfdbfe" />
          <circle className="sc-wheel" cx="17" cy="113" r="8" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 4" />
          <circle className="sc-wheel" cx="57" cy="113" r="8" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 4" />
        </g>
      </g>
    </Frame>
  );
}

function Rocket({ progress, hit }: SceneProps) {
  const x = 30 + progress * 290;
  const y = 112 - progress * 70;
  return (
    <Frame bg="#070b1e">
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} className="sc-twinkle" cx={(i * 53) % 400} cy={(i * 37) % 140} r={0.8 + (i % 3) * 0.5} fill="#fff" style={{ animationDelay: `${-(i % 6) * 0.4}s` }} />
      ))}
      <circle cx="350" cy="44" r="26" fill="#f97316" />
      <ellipse cx="350" cy="44" rx="42" ry="8" fill="none" stroke="#fdba74" strokeWidth="3" transform="rotate(-18 350 44)" />
      <g style={slide(x, y, "rotate(-32deg)")}>
        <g key={hit?.n ?? 0} className={hit?.kind === "bad" ? "sc-shake" : undefined}>
          <polygon className="sc-rflame" points="-6,18 6,18 0,40" fill="#fb923c" />
          <polygon points="-12,14 -20,26 -8,18" fill="#ef4444" />
          <polygon points="12,14 20,26 8,18" fill="#ef4444" />
          <path d="M0 -26 Q14 -8 12 18 L-12 18 Q-14 -8 0 -26 Z" fill="#f1f5f9" />
          <path d="M0 -26 Q6 -20 8 -12 L-8 -12 Q-6 -20 0 -26 Z" fill="#ef4444" />
          <circle cx="0" cy="-2" r="5" fill="#38bdf8" stroke="#94a3b8" strokeWidth="1.5" />
        </g>
      </g>
    </Frame>
  );
}

function Climb({ progress, hit }: SceneProps) {
  const x = 52 + progress * 196;
  const y = 120 - progress * 88;
  return (
    <Frame bg="#1b2a47">
      <circle cx="70" cy="30" r="12" fill="#fde68a" opacity="0.85" />
      <path d="M30 150 L250 26 L390 150 Z" fill="#475569" />
      <path d="M250 26 L226 44 L240 42 L250 54 L262 42 L276 46 Z" fill="#f8fafc" />
      <g transform="translate(250 26)">
        <rect x="0" y="-18" width="2" height="18" fill="#e2e8f0" />
        <polygon points="2,-18 16,-13 2,-8" fill="#ef4444" />
      </g>
      <g style={slide(x, y)}>
        <g key={hit?.n ?? 0} className={hit?.kind === "bad" ? "sc-shake" : "sc-bob"}>
          <circle cx="0" cy="-16" r="5" fill="#fcd34d" />
          <rect x="-5" y="-11" width="10" height="13" rx="3" fill="#22c55e" />
          <rect x="-9" y="-10" width="5" height="9" rx="2" fill="#a16207" />
          <line x1="5" y1="-8" x2="10" y2="-22" stroke="#e2e8f0" strokeWidth="1.5" />
        </g>
      </g>
    </Frame>
  );
}

function Boss({ progress, hit }: SceneProps) {
  const hp = Math.max(0, 1 - progress);
  const dead = progress >= 1;
  return (
    <Frame bg="#241633">
      <rect y="116" width="400" height="34" fill="#150d20" />
      <g transform="translate(70 100)">
        <g key={`h${hit?.n ?? 0}`} className={hit?.kind === "bad" ? "sc-shake" : "sc-bob"}>
          <circle cx="0" cy="-22" r="8" fill="#fcd34d" />
          <rect x="-8" y="-14" width="16" height="22" rx="4" fill="#3b82f6" />
          <rect x="8" y="-10" width="3" height="26" fill="#e2e8f0" />
        </g>
      </g>
      <g transform="translate(310 96)" opacity={dead ? 0.35 : 1} style={{ transition: "opacity 0.6s" }}>
        <g key={`m${hit?.n ?? 0}`} className={hit?.kind === "good" ? "sc-hit" : undefined}>
          <path d="M-34 24 Q-40 -30 0 -34 Q40 -30 34 24 Z" fill="#7c3aed" />
          <polygon points="-26,-24 -34,-44 -14,-30" fill="#a78bfa" />
          <polygon points="26,-24 34,-44 14,-30" fill="#a78bfa" />
          {dead ? (
            <g stroke="#f8fafc" strokeWidth="3" strokeLinecap="round">
              <path d="M-18 -10 L-8 0 M-8 -10 L-18 0 M8 -10 L18 0 M18 -10 L8 0" />
            </g>
          ) : (
            <>
              <circle cx="-12" cy="-6" r="6" fill="#f8fafc" />
              <circle cx="12" cy="-6" r="6" fill="#f8fafc" />
              <circle cx="-11" cy="-5" r="2.5" fill="#0f172a" />
              <circle cx="13" cy="-5" r="2.5" fill="#0f172a" />
            </>
          )}
          <path d="M-14 12 Q0 22 14 12" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
      <rect x="250" y="38" width="120" height="9" rx="4.5" fill="#0f172a" />
      <rect x="250" y="38" width={120 * hp} height="9" rx="4.5" fill={hp > 0.5 ? "#22c55e" : hp > 0.25 ? "#eab308" : "#ef4444"} style={{ transition: "width 0.6s ease" }} />
    </Frame>
  );
}

function Plant({ progress, hit }: SceneProps) {
  const stemScale = 0.08 + progress * 0.92;
  return (
    <Frame bg="#16324a">
      <g className="sc-sun" transform="translate(60 36)">
        <circle r="13" fill="#fde047" />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="0" y1="-19" x2="0" y2="-26" stroke="#fde047" strokeWidth="3" strokeLinecap="round" transform={`rotate(${i * 45})`} />
        ))}
      </g>
      {hit?.kind === "good" && (
        <g key={hit.n} className="sc-drop">
          <path d="M200 20 Q206 32 200 38 Q194 32 200 20 Z" fill="#38bdf8" />
        </g>
      )}
      <rect y="124" width="400" height="26" fill="#3f2a1d" />
      <path d="M176 118 H224 L216 146 H184 Z" fill="#c2410c" />
      <g style={{ transform: `scaleY(${stemScale})`, transformOrigin: "200px 120px", transition: "transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
        <rect x="197" y="26" width="6" height="94" rx="3" fill="#22c55e" />
      </g>
      <g style={{ opacity: progress > 0.25 ? 1 : 0, transition: "opacity 0.5s" }}>
        <ellipse cx="184" cy="92" rx="14" ry="6" fill="#4ade80" transform="rotate(-25 184 92)" />
      </g>
      <g style={{ opacity: progress > 0.5 ? 1 : 0, transition: "opacity 0.5s" }}>
        <ellipse cx="216" cy="74" rx="14" ry="6" fill="#4ade80" transform="rotate(25 216 74)" />
      </g>
      <g style={{ opacity: progress > 0.75 ? 1 : 0, transition: "opacity 0.5s" }}>
        <ellipse cx="184" cy="54" rx="13" ry="6" fill="#4ade80" transform="rotate(-25 184 54)" />
      </g>
      <g className={progress >= 0.95 ? "sc-bloom" : undefined} style={{ opacity: progress >= 0.95 ? 1 : 0, transition: "opacity 0.6s" }}>
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx="200" cy="18" rx="5" ry="9" fill="#f472b6" transform={`rotate(${i * 60} 200 26)`} />
        ))}
        <circle cx="200" cy="26" r="6" fill="#fde047" />
      </g>
    </Frame>
  );
}

export function Scene(props: SceneProps) {
  if (props.id === "none") return null;
  const Art = { car: Car, rocket: Rocket, climb: Climb, boss: Boss, plant: Plant }[props.id];
  return (
    <div className="overflow-hidden rounded-xl border border-[#30363D]" data-testid={`scene-${props.id}`}>
      <Art {...props} />
    </div>
  );
}
