import type { ComponentType, CSSProperties } from "react";
import "./decorations.css";
import { SPEC_ART } from "./decorationSpecs";
import { SvgArt } from "@/components/art/SvgArt";
import { hasArt } from "@/lib/svgAssets";

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

function CyberGlitch() {
  return (
    <g transform="translate(50 50)">
      <circle r="36" fill="none" stroke="url(#dc-cyber-grad)" strokeWidth="6" filter="url(#dc-neon-glow)" opacity="0.85" />
      <g className="dc-cyber-glitch-layer">
        <path d="M-38 -15 L-48 -18 L-42 -8 Z" fill="#00f0ff" filter="url(#dc-neon-glow)" />
        <path d="M35 12 L46 8 L40 22 Z" fill="#ff0055" filter="url(#dc-neon-glow)" />
        <rect x="-20" y="-45" width="40" height="3" fill="#00f0ff" opacity="0.9" />
        <rect x="-30" y="42" width="60" height="2" fill="#ff0055" opacity="0.9" />
      </g>
      <g className="dc-spin-fast">
        <circle cx="0" cy="-36" r="3.5" fill="#ffffff" filter="url(#dc-neon-glow)" />
        <circle cx="0" cy="36" r="2.5" fill="#00f0ff" />
      </g>
      <path d="M-28 -28 L-34 -34 M28 28 L34 34 M-28 28 L-34 34 M28 -28 L34 -34" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" filter="url(#dc-neon-glow)" />
    </g>
  );
}

function NebulosaCosmica() {
  return (
    <g transform="translate(50 50)">
      <circle r="42" fill="url(#dc-nebula-bg)" opacity="0.4" filter="url(#dc-heavy-glow)" className="dc-pulse-slow" />
      <g className="dc-spin-slow">
        <ellipse cx="0" cy="0" rx="44" ry="16" fill="none" stroke="url(#dc-nebula-ring)" strokeWidth="3" transform="rotate(-28)" filter="url(#dc-soft-glow)" />
        <ellipse cx="0" cy="0" rx="44" ry="16" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 12" transform="rotate(-28)" />
      </g>
      <g className="dc-spin-rev">
        <path d="M-32 -32 L-20 -28 L-28 -20 Z" fill="#a855f7" filter="url(#dc-soft-glow)" />
        <path d="M25 25 L38 20 L30 35 Z" fill="#ec4899" filter="url(#dc-soft-glow)" />
        <circle cx="28" cy="-28" r="2" fill="#ffffff" className="dc-twinkle" />
        <circle cx="-30" cy="25" r="2.5" fill="#38bdf8" className="dc-twinkle" style={{ animationDelay: "0.7s" }} />
      </g>
      <g className="dc-comet-path">
        <path d="M-45 -40 Q0 -30 45 35" fill="none" stroke="url(#dc-comet-grad)" strokeWidth="2" strokeLinecap="round" filter="url(#dc-soft-glow)" />
      </g>
    </g>
  );
}

function Dinosauri() {
  const fern = Array.from({ length: 8 }, (_, i) => ({ y: -3 - i * 3.1, l: 5.4 - i * 0.45 }));
  return (
    <g transform="translate(50 50)">
      <circle r="31.5" fill="none" stroke="#1c1917" strokeWidth="6" />
      <circle r="34.6" fill="none" stroke="#57534e" strokeWidth="0.7" strokeDasharray="7 3 2 4" />
      <g className="dc-lava">
        <circle r="31.5" fill="none" stroke="url(#dc-magma)" strokeWidth="1.5" strokeDasharray="5 2.5 1.5 3 8 2" strokeLinecap="round" />
        <circle r="28.5" fill="none" stroke="#f97316" strokeWidth="0.7" opacity="0.8" />
      </g>
      <g transform="translate(0 -33)">
        <circle cx="-2" cy="-17" r="3.6" fill="#57534e" opacity="0.6" className="dc-rise" style={{ "--dx": "-3px" } as CSSProperties} />
        <circle cx="3" cy="-17" r="3" fill="#78716c" opacity="0.55" className="dc-rise" style={{ "--dx": "4px", animationDelay: "-1.4s" } as CSSProperties} />
        <path d="M-11 4 L-3.4 -9 L3.4 -9 L11 4 Z" fill="url(#dc-basalt)" />
        <path d="M-1.4 -9 L-3.2 -2 L-1 2 L0.4 -4 L1.8 -9 Z" fill="url(#dc-magma)" />
        <path d="M4 -7 L6 -1 L4.6 2" fill="none" stroke="#f97316" strokeWidth="0.8" strokeLinecap="round" />
        <ellipse cx="0" cy="-9.2" rx="3.6" ry="1.3" fill="#fde047" />
        <circle cx="-1" cy="-11" r="0.9" fill="#fdba74" className="dc-rise" style={{ "--dx": "-4px" } as CSSProperties} />
        <circle cx="1.5" cy="-11" r="0.8" fill="#fde047" className="dc-rise" style={{ "--dx": "3px", animationDelay: "-1s" } as CSSProperties} />
        <circle cx="0" cy="-11" r="0.7" fill="#fb923c" className="dc-rise" style={{ "--dx": "7px", animationDelay: "-2.1s" } as CSSProperties} />
      </g>
      <g transform="rotate(80) translate(0 -33)">
        <g className="dc-lava">
          {[-3.4, 0, 3.4].map((dx, i) => (
            <path key={dx} d={`M${dx - 1.4} -6.5 C${dx - 0.4} -2.5 ${dx + 0.4} 2 ${dx + 1} 6.5`} fill="none" stroke="url(#dc-magma)" strokeWidth={i === 1 ? 1.7 : 1.3} strokeLinecap="round" />
          ))}
        </g>
        <path d="M-6.4 -7 C-5 -2 -4 2 -3.4 7 M-3 -7 C-1.6 -2 -0.6 2 0 7 M0.4 -7 C1.8 -2 2.8 2 3.4 7" fill="none" stroke="#7c2d12" strokeWidth="0.5" opacity="0.7" />
      </g>
      <g transform={`translate(${(Math.sin((138 * Math.PI) / 180) * 35.5).toFixed(1)} ${(-Math.cos((138 * Math.PI) / 180) * 35.5).toFixed(1)}) rotate(30) scale(0.95)`}>
        <path d="M-12.6 2.2 L-2 3.6 L6 6.5 L-11 8 Z" fill="#3b0a0a" />
        <path d="M6 6.5 C2 9 -4 12 -10 13 C-13 13.4 -14 12 -13.2 10.6 L-11 8 L2 5.6 Z" fill="#bbf7d0" stroke="#052e16" strokeWidth="0.6" strokeLinejoin="round" />
        <path d="M-14 -1.5 C-14 -4.5 -10 -6 -5 -6.4 C-3 -6.4 -2 -7.6 -1 -9.4 C1 -11.4 5 -11.4 8 -9 C12 -6.4 14 -1 12.4 4 C11.5 7 9 8.4 6 7.4 L-2 3.6 L-12.6 2.2 C-14 2 -14.4 0.4 -14 -1.5 Z" fill="url(#dc-rex)" stroke="#052e16" strokeWidth="0.7" strokeLinejoin="round" />
        <g fill="#fffbeb" stroke="#78350f" strokeWidth="0.25">
          {[-11.5, -8.6, -5.7, -2.8].map((x) => (
            <path key={x} d={`M${x} ${2.3 + (x + 12.6) * 0.132} L${x + 1.6} ${2.4 + (x + 12.6) * 0.132} L${x + 0.8} ${5.4 + (x + 12.6) * 0.132} Z`} />
          ))}
          {[-9.5, -6.4, -3.3, -0.2].map((x) => (
            <path key={x} d={`M${x} ${7.9 - (x + 11) * 0.185} L${x + 1.4} ${7.8 - (x + 11) * 0.185} L${x + 0.7} ${5.3 - (x + 11) * 0.185} Z`} />
          ))}
        </g>
        <g fill="none" stroke="#052e16" strokeLinecap="round" opacity="0.5" strokeWidth="1">
          <path d="M3 -8 C4 -5 4.4 -2 3.4 1" />
          <path d="M6.4 -6.4 C7.4 -3.6 7.6 -0.6 6.6 2.4" />
          <path d="M9.6 -3.6 C10.4 -1.4 10.4 1 9.6 3" />
        </g>
        <path d="M-1.4 -8.4 C0.6 -7.4 3.6 -7.6 5 -8.6" fill="none" stroke="#052e16" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="2" cy="-5.2" r="1.8" fill="#facc15" stroke="#052e16" strokeWidth="0.4" />
        <ellipse cx="2" cy="-5.2" rx="0.5" ry="1.3" fill="#0b0b0b" />
        <ellipse cx="-10.6" cy="-3.4" rx="0.9" ry="0.55" fill="#052e16" />
      </g>
      <g transform="translate(-1.5 33) rotate(188) translate(0 0)">
        {[
          [-7.5, 1.5, 0],
          [0, 0.2, 1],
          [7.4, 1.6, 2],
        ].map(([dx, dy, i]) => (
          <g key={i} transform={`translate(${dx} ${dy}) rotate(${(i - 1) * 10})`}>
            <ellipse cx="0" cy="-4" rx="3.5" ry="4.5" fill="#fef3c7" stroke="#a16207" strokeWidth="0.5" />
            <g fill="#a16207" opacity="0.65">
              <circle cx="-1.2" cy="-5.2" r="0.55" />
              <circle cx="1.1" cy="-3" r="0.6" />
              <circle cx="-0.4" cy="-2.2" r="0.4" />
            </g>
          </g>
        ))}
        <path d="M6.6 -6 L8 -4.6 L7 -3.2 L8.2 -2" fill="none" stroke="#7c2d12" strokeWidth="0.5" />
      </g>
      <g transform="rotate(252) translate(0 -31.5)">
        <g className="dc-sway">
          <path d="M0 0 C1 -8 -1 -16 2 -26" fill="none" stroke="#166534" strokeWidth="1" strokeLinecap="round" />
          {fern.map((f, i) => (
            <g key={i}>
              <ellipse cx={-2.6} cy={f.y} rx="0.9" ry={f.l} fill="url(#dc-fern)" transform={`rotate(-62 0 ${f.y})`} />
              <ellipse cx={2.6} cy={f.y} rx="0.9" ry={f.l} fill="url(#dc-fern)" transform={`rotate(62 0 ${f.y})`} />
            </g>
          ))}
        </g>
      </g>
      <g transform="rotate(300) translate(0 -32.5)">
        <circle r="5.6" fill="url(#dc-bone)" stroke="#8a6a3b" strokeWidth="0.5" />
        <path d="M0.6 0 C0.6 -1.4 -1.2 -1.6 -1.8 -0.4 C-2.6 1.4 -0.8 3.2 1.2 3 C3.6 2.8 4.4 0 3.6 -2 C2.6 -4.4 -0.8 -5 -3 -3.8" fill="none" stroke="#8a6a3b" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M-3 -3.8 C-4.6 -2.6 -5 0 -4.4 1.6" fill="none" stroke="#8a6a3b" strokeWidth="0.5" strokeDasharray="0.7 0.9" />
      </g>
      <g transform="rotate(334) translate(0 -31)">
        <g className="dc-sway" style={{ animationDelay: "-2s" }}>
          <path d="M0 0 C-1 -6 1 -12 -1 -18" fill="none" stroke="#166534" strokeWidth="0.9" strokeLinecap="round" />
          {fern.slice(0, 6).map((f, i) => (
            <g key={i}>
              <ellipse cx={-2.2} cy={f.y * 0.7} rx="0.8" ry={f.l * 0.8} fill="url(#dc-fern)" transform={`rotate(-62 0 ${f.y * 0.7})`} />
              <ellipse cx={2.2} cy={f.y * 0.7} rx="0.8" ry={f.l * 0.8} fill="url(#dc-fern)" transform={`rotate(62 0 ${f.y * 0.7})`} />
            </g>
          ))}
        </g>
      </g>
      <g className="dc-spin" style={{ animationDuration: "14s" }}>
        <g transform="translate(0 -43.5) rotate(90) scale(0.9)">
          <g className="dc-flap">
            <path d="M0 -0.8 C-1 -5 -4 -9 -10 -11.4 C-6 -7 -4.6 -4 -3.4 -0.6 Z" fill="#312e81" stroke="#c7d2fe" strokeWidth="0.3" />
          </g>
          <g className="dc-flap">
            <path d="M0 0.8 C-1 5 -4 9 -10 11.4 C-6 7 -4.6 4 -3.4 0.6 Z" fill="#312e81" stroke="#c7d2fe" strokeWidth="0.3" />
          </g>
          <ellipse cx="0" cy="0" rx="3.2" ry="1.2" fill="#3730a3" />
          <path d="M2.8 -0.5 L10 -0.4 L10 0.4 L2.8 0.7 Z" fill="#4338ca" />
          <path d="M1.2 -0.8 L-2.8 -2.4 L-0.4 0 Z" fill="#4338ca" />
          <path d="M-3 0 L-8 0.2" stroke="#3730a3" strokeWidth="0.5" />
        </g>
      </g>
    </g>
  );
}

const ART: Record<string, ComponentType> = {
  ...SPEC_ART,
  "fiamma-spettrale": Fiamma,
  "aura-oro": Aura,
  "drago-spettrale": Drago,
  "zucca-halloween": Zucca,
  "corona-natale": Corona,
  "cyber-glitch": CyberGlitch,
  "nebulosa-cosmica": NebulosaCosmica,
  "dinosauri": Dinosauri,
};

export function AvatarDecoration({ id }: { id: string | null | undefined }) {
  if (id && hasArt("decorations", id)) {
    return (
      <span className="dc pointer-events-none absolute -inset-[50%] z-10" aria-hidden>
        <SvgArt kind="decorations" id={id} className="size-full" />
      </span>
    );
  }
  const Art = id ? ART[id] : undefined;
  if (!Art) return null;
  return (
    <span className="dc pointer-events-none absolute -inset-[50%] z-10" aria-hidden>
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
        <filter id="dc-neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dc-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dc-heavy-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
        </filter>
        <linearGradient id="dc-cyber-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="50%" stopColor="#7000ff" />
          <stop offset="100%" stopColor="#ff0055" />
        </linearGradient>
        <radialGradient id="dc-nebula-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dc-nebula-ring" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="dc-comet-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="dc-magma" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#b91c1c" />
          <stop offset="0.5" stopColor="#f97316" />
          <stop offset="1" stopColor="#fde047" />
        </linearGradient>
        <linearGradient id="dc-basalt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#57534e" />
          <stop offset="1" stopColor="#1c1917" />
        </linearGradient>
        <linearGradient id="dc-rex" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14532d" />
          <stop offset="0.6" stopColor="#16a34a" />
          <stop offset="1" stopColor="#86efac" />
        </linearGradient>
        <linearGradient id="dc-fern" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#86efac" />
          <stop offset="1" stopColor="#15803d" />
        </linearGradient>
        <radialGradient id="dc-bone" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#c9a86a" />
        </radialGradient>
        <linearGradient id="dc-dino-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="dc-dino-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
        <linearGradient id="dc-dino-orange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9a3412" />
          <stop offset="60%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
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
