import type { ComponentType } from "react";
import "./decorations.css";
import { SPECS, SpecArt } from "./decorationSpecs";

const pt = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.sin(a), -r * Math.cos(a)];
};

const fmt = (p: [number, number]) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

const DRAGON_R = 37;
const DRAGON_END = 296;
const dragonWidth = (t: number) => 0.9 + 7.4 * Math.pow(t / DRAGON_END, 1.15);
const SEG = 44;
const ts = Array.from({ length: SEG + 1 }, (_, i) => (DRAGON_END * i) / SEG);
const outer = ts.map((t) => pt(DRAGON_R + dragonWidth(t) / 2, t));
const inner = ts.map((t) => pt(DRAGON_R - dragonWidth(t) / 2, t)).reverse();
const DRAGON_BODY = `M${fmt(outer[0])} ${outer.slice(1).map((p) => `L${fmt(p)}`).join(" ")} ${inner.map((p) => `L${fmt(p)}`).join(" ")} Z`;
const DRAGON_SPIKES = Array.from({ length: 11 }, (_, k) => {
  const t = 30 + k * 24;
  const ro = DRAGON_R + dragonWidth(t) / 2;
  return `M${fmt(pt(ro - 0.5, t - 3.5))} L${fmt(pt(ro + 4.5, t - 7))} L${fmt(pt(ro - 0.5, t + 3.5))} Z`;
});
const DRAGON_SPINE = `M${fmt(pt(DRAGON_R, 24))} A${DRAGON_R} ${DRAGON_R} 0 1 1 ${fmt(pt(DRAGON_R, 284))}`;
const EMBERS = [
  [20, 41], [75, 44], [130, 40], [185, 45], [240, 42], [300, 44], [340, 40],
] as const;

const BAT = "M0 -4 C-6 -14 -18 -16 -30 -8 C-24 -8 -20 -4 -18 2 C-14 -2 -10 -1 -8 4 C-5 1 -2 2 0 8 C2 2 5 1 8 4 C10 -1 14 -2 18 2 C20 -4 24 -8 30 -8 C18 -16 6 -14 0 -4 Z";
const SPARK = "M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z";

const FLAMES = Array.from({ length: 16 }, (_, i) => ({ a: i * 22.5, h: i % 2 ? 0.6 : 1, d: (i % 5) * 0.22 }));
const WISPS = Array.from({ length: 9 }, (_, i) => ({ a: i * 40 + 8, d: (i % 4) * 0.25 }));
const SPARKLES = Array.from({ length: 8 }, (_, i) => ({ a: i * 45 + 10, s: 0.7 + (i % 3) * 0.3, d: (i % 4) * 0.5 }));
const LEAVES = Array.from({ length: 28 }, (_, i) => ({ a: i * (360 / 28), tone: i % 2 ? "#166534" : "#22c55e", tilt: i % 2 ? 38 : -38 }));
const BERRIES = Array.from({ length: 8 }, (_, i) => i * 45 + 12);
const WREATH_LIGHTS = Array.from({ length: 12 }, (_, i) => ({ a: i * 30 + 15, c: ["#fde047", "#f87171", "#60a5fa", "#4ade80"][i % 4], d: (i % 4) * 0.35 }));

function Fiamma() {
  return (
    <g transform="translate(50 50)">
      <circle r="31.5" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.8" className="dc-spin-rev" />
      <circle r="29.3" fill="none" stroke="#a78bfa" strokeWidth="1.6" opacity="0.9" />
      <g className="dc-spin-slow">
        {FLAMES.map((f) => (
          <g key={f.a} transform={`rotate(${f.a})`}>
            <g transform={`translate(0 -28.5) scale(1 ${f.h}) translate(0 28.5)`}>
              <path className="dc-flame" style={{ animationDelay: `${-f.d}s` }} d="M-3.4 -28.5 C-6.6 -34 -2 -38.5 2.8 -46 C4.6 -39 6.8 -34 3.4 -28.5 Z" fill="url(#dc-flame)" />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

function Aura() {
  return (
    <g transform="translate(50 50)">
      <circle r="32" fill="none" stroke="#fcd34d" strokeWidth="5" opacity="0.18" />
      <circle r="33.5" fill="none" stroke="#fbbf24" strokeWidth="1.4" strokeDasharray="3 5 9 5" className="dc-spin" />
      <circle r="38.5" fill="none" stroke="#fde68a" strokeWidth="0.9" strokeDasharray="1 7" strokeLinecap="round" className="dc-spin-rev" />
      <g className="dc-spin-slow">
        {SPARKLES.map((s) => (
          <g key={s.a} transform={`rotate(${s.a}) translate(0 -41)`}>
            <path className="dc-twinkle" style={{ animationDelay: `${-s.d}s` }} d={SPARK} fill="#fff1b8" transform={`scale(${s.s})`} />
          </g>
        ))}
      </g>
    </g>
  );
}

function Drago() {
  return (
    <g transform="translate(50 50)">
      <circle r="29.4" fill="none" stroke="#7c3aed" strokeWidth="1.2" opacity="0.7" />
      <g className="dc-spin-rev">
        {WISPS.map((w) => (
          <g key={w.a} transform={`rotate(${w.a})`}>
            <g transform="translate(0 -29.5) scale(0.55) translate(0 29.5)">
              <path className="dc-flame" style={{ animationDelay: `${-w.d}s` }} d="M-3.4 -28.5 C-6.6 -34 -2 -38.5 2.8 -46 C4.6 -39 6.8 -34 3.4 -28.5 Z" fill="url(#dc-flame)" opacity="0.55" />
            </g>
          </g>
        ))}
        {EMBERS.map(([a, r]) => {
          const [x, y] = pt(r, a);
          return <circle key={a} cx={x} cy={y} r="1" fill="#a5f3fc" className="dc-twinkle" style={{ animationDelay: `${-(a % 7) * 0.3}s` }} />;
        })}
      </g>
      <g className="dc-spin">
        <path d={DRAGON_BODY} fill="url(#dc-dragon)" stroke="#312e81" strokeWidth="0.5" strokeLinejoin="round" />
        {DRAGON_SPIKES.map((d, i) => (
          <path key={i} d={d} fill="#5eead4" opacity="0.9" />
        ))}
        <path d={DRAGON_SPINE} fill="none" stroke="#e0f2fe" strokeWidth="0.7" strokeLinecap="round" opacity="0.5" />
        <g transform={`rotate(${DRAGON_END})`}>
          <path d="M-2 -41 L-9 -50 L3 -43.5 Z" fill="#6d28d9" />
          <path d="M2 -42 L0 -51 L7 -43 Z" fill="#6d28d9" />
          <path d="M-3 -41.8 L8 -42.8 L16 -38 L9 -35.8 L4 -33.2 L-3 -32.6 Z" fill="url(#dc-dragon)" stroke="#312e81" strokeWidth="0.5" strokeLinejoin="round" />
          <circle cx="6" cy="-39" r="2.5" fill="#67e8f9" opacity="0.55" />
          <circle cx="6" cy="-39" r="1.1" fill="#ffffff" />
          <path d="M13 -38.5 Q18 -34 23 -36" fill="none" stroke="#67e8f9" strokeWidth="0.8" strokeLinecap="round" />
          <path className="dc-flicker" d="M15.5 -38 C18 -40.5 21 -38.5 24.5 -40 C21.5 -37.5 20 -35 15.5 -36.6 Z" fill="#e0f2fe" opacity="0.85" />
        </g>
      </g>
    </g>
  );
}

function Zucca() {
  const [px, py] = pt(36, 135);
  return (
    <g transform="translate(50 50)">
      <circle r="32.5" fill="none" stroke="#fb923c" strokeWidth="3" strokeDasharray="2 3.2" opacity="0.85" className="dc-flicker" />
      <circle r="29.6" fill="none" stroke="#7c2d12" strokeWidth="1.2" opacity="0.75" />
      <g className="dc-spin" style={{ animationDuration: "7s" }}>
        {[0, 180].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <g transform="translate(0 -43) scale(0.27)">
              <path className="dc-flap" d={BAT} fill="#1c0b2e" stroke="#a78bfa" strokeWidth="3" />
            </g>
          </g>
        ))}
      </g>
      <g transform={`translate(${px.toFixed(1)} ${py.toFixed(1)})`}>
        <ellipse cx="0" cy="8" rx="9" ry="1.8" fill="#000000" opacity="0.3" />
        <ellipse cx="-3.4" cy="0" rx="5.2" ry="6.6" fill="url(#dc-pumpkin)" />
        <ellipse cx="3.4" cy="0" rx="5.2" ry="6.6" fill="url(#dc-pumpkin)" />
        <ellipse cx="0" cy="0" rx="4.8" ry="7" fill="url(#dc-pumpkin)" />
        <path d="M-1 -6.4 C-1.5 -9 0 -10 1.8 -10.4 L2.4 -8.8 C1.2 -8.4 1 -7.6 1.2 -6.4 Z" fill="#4a3a14" />
        <g className="dc-flicker" fill="#ffe27a">
          <path d="M-4 -1.4 L-1.2 -1.4 L-2.6 -4 Z" />
          <path d="M1.2 -1.4 L4 -1.4 L2.6 -4 Z" />
          <path d="M-4.4 2 L-2.6 1.2 L-1.4 2.6 L0 1.4 L1.4 2.6 L2.6 1.2 L4.4 2 C4 4.8 2 5.8 0 5.8 C-2 5.8 -4 4.8 -4.4 2 Z" />
        </g>
      </g>
    </g>
  );
}

function Corona() {
  return (
    <g transform="translate(50 50)">
      <circle r="33.5" fill="none" stroke="#14532d" strokeWidth="5.5" />
      {LEAVES.map((l) => (
        <g key={l.a} transform={`rotate(${l.a}) translate(0 -33.5)`}>
          <ellipse rx="2.3" ry="5.2" fill={l.tone} transform={`rotate(${l.tilt})`} />
        </g>
      ))}
      {BERRIES.map((a) => {
        const [x, y] = pt(33.5, a);
        return <circle key={a} cx={x} cy={y} r="1.7" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.4" />;
      })}
      {WREATH_LIGHTS.map((l) => {
        const [x, y] = pt(37.5, l.a);
        return (
          <g key={l.a} className="dc-blink" style={{ animationDelay: `${-l.d}s` }}>
            <circle cx={x} cy={y} r="3" fill={l.c} opacity="0.35" />
            <circle cx={x} cy={y} r="1.4" fill={l.c} />
          </g>
        );
      })}
      <g transform="translate(0 33.5)">
        <path d="M0 0 C-9 -6 -12.5 3 -10 6.5 C-6 8 -2 4 0 0 Z" fill="#dc2626" />
        <path d="M0 0 C9 -6 12.5 3 10 6.5 C6 8 2 4 0 0 Z" fill="#dc2626" />
        <path d="M-1 1 L-5.5 11 L-1.2 9 L0 12.5 Z" fill="#b91c1c" />
        <path d="M1 1 L5.5 11 L1.2 9 L0 12.5 Z" fill="#b91c1c" />
        <circle r="2.4" fill="#991b1b" />
      </g>
    </g>
  );
}

const SPEC_ART: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(SPECS).map(([id, spec]) => [id, () => <SpecArt spec={spec} />]),
);

const ART: Record<string, ComponentType> = {
  ...SPEC_ART,
  "fiamma-spettrale": Fiamma,
  "aura-oro": Aura,
  "drago-spettrale": Drago,
  "zucca-halloween": Zucca,
  "corona-natale": Corona,
};

export function AvatarDecoration({ id }: { id: string | null | undefined }) {
  const Art = id ? ART[id] : undefined;
  if (!Art) return null;
  return (
    <span className="dc pointer-events-none absolute -inset-[40%] z-10" aria-hidden>
      <svg viewBox="0 0 100 100" className="size-full overflow-visible">
        <Art />
      </svg>
    </span>
  );
}

export function DecorationDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <linearGradient id="dc-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="0.55" stopColor="#6366f1" />
          <stop offset="1" stopColor="#67e8f9" />
        </linearGradient>
        <linearGradient id="dc-dragon" gradientUnits="userSpaceOnUse" x1="-40" y1="-40" x2="40" y2="40">
          <stop offset="0" stopColor="#4c1d95" />
          <stop offset="0.5" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="dc-pumpkin" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#ffb347" />
          <stop offset="0.5" stopColor="#f4731a" />
          <stop offset="1" stopColor="#b53d06" />
        </radialGradient>
      </defs>
    </svg>
  );
}
