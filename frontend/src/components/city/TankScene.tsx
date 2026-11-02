import { useId, type CSSProperties, type ReactNode } from "react";
import type { Decor, Theme } from "./rooms";

const BASE = 272;

function Rock({ u, x, y = BASE, w, h, c }: { u: string; x: number; y?: number; w: number; h: number; c: string }) {
  const d = `M${x - w / 2} ${y} C${x - w / 2} ${y - h * 0.75} ${x - w * 0.18} ${y - h} ${x + w * 0.1} ${y - h} C${x + w * 0.42} ${y - h} ${x + w / 2} ${y - h * 0.5} ${x + w / 2} ${y}Z`;
  return (
    <g>
      <ellipse cx={x} cy={y + 1} rx={w * 0.64} ry={Math.max(2, h * 0.12)} fill="#000" opacity="0.3" />
      <path d={d} fill={c} />
      <path d={d} fill={`url(#${u}sh)`} />
      <path d={`M${x - w * 0.28} ${y - h * 0.6} Q${x - w * 0.05} ${y - h * 0.95} ${x + w * 0.2} ${y - h * 0.86}`} stroke="#fff" strokeOpacity="0.3" strokeWidth={Math.max(1.5, w * 0.04)} fill="none" strokeLinecap="round" />
      <path d={`M${x + w * 0.1} ${y - h * 0.3} q${w * 0.1} ${h * 0.1} ${w * 0.2} ${h * 0.3}`} stroke="#000" strokeOpacity="0.18" strokeWidth="1.4" fill="none" />
    </g>
  );
}

function Grass({ x, h, c, c2, n = 5, d = 0, y = BASE }: { x: number; h: number; c: string; c2: string; n?: number; d?: number; y?: number }) {
  return (
    <g className="ct-plant" style={{ animationDelay: `${-d}s` } as CSSProperties}>
      {Array.from({ length: n }, (_, i) => {
        const bx = x + (i - (n - 1) / 2) * 6;
        const lean = (i % 2 ? 1 : -1) * (5 + i * 2);
        const hh = h * (0.7 + (i % 3) * 0.14);
        return <path key={i} d={`M${bx - 2.5} ${y} Q${bx + lean * 0.2} ${y - hh * 0.55} ${bx + lean} ${y - hh} Q${bx + lean * 0.5} ${y - hh * 0.5} ${bx + 3} ${y}Z`} fill={i % 2 ? c : c2} />;
      })}
    </g>
  );
}

function Kelp({ x, h, c, d = 0, y = BASE }: { x: number; h: number; c: string; d?: number; y?: number }) {
  return (
    <g className="ct-plant" style={{ animationDelay: `${-d}s`, animationDuration: "4.6s" } as CSSProperties}>
      <path d={`M${x} ${y} C${x - 14} ${y - h * 0.3} ${x + 14} ${y - h * 0.6} ${x} ${y - h}`} stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
      {[0.3, 0.5, 0.7, 0.88].map((t, i) => (
        <ellipse key={i} cx={x + (i % 2 ? 9 : -9) * (1 - t * 0.4)} cy={y - h * t} rx="10" ry="4.5" fill={c} transform={`rotate(${i % 2 ? -28 : 28} ${x} ${y - h * t})`} opacity="0.92" />
      ))}
    </g>
  );
}

function Reed({ x, h, c, d = 0 }: { x: number; h: number; c: string; d?: number }) {
  return (
    <g className="ct-plant" style={{ animationDelay: `${-d}s`, animationDuration: "5.4s" } as CSSProperties}>
      <rect x={x - 1.6} y={BASE - h} width="3.2" height={h} fill={c} />
      <rect x={x - 1.6} y={BASE - h} width="1.2" height={h} fill="#fff" opacity="0.22" />
      <rect x={x - 3} y={BASE - h - 4} width="6" height="22" rx="3" fill="#6b4a2b" />
      <rect x={x - 3} y={BASE - h - 4} width="2" height="22" rx="1" fill="#a07a4a" opacity="0.7" />
    </g>
  );
}

function Bamboo({ x, h, d = 0 }: { x: number; h: number; d?: number }) {
  return (
    <g className="ct-plant" style={{ animationDelay: `${-d}s`, animationDuration: "6s" } as CSSProperties}>
      <rect x={x - 4} y={BASE - h} width="8" height={h} fill="#7fa650" />
      <rect x={x - 4} y={BASE - h} width="3" height={h} fill="#c4e08a" opacity="0.5" />
      {[0.2, 0.42, 0.64, 0.86].map((t) => (
        <rect key={t} x={x - 5} y={BASE - h * t} width="10" height="3" rx="1" fill="#4d6e2e" />
      ))}
    </g>
  );
}

function Branch({ x, h, c, tip, d = 0 }: { x: number; h: number; c: string; tip: string; d?: number }) {
  return (
    <g className="ct-plant" style={{ animationDelay: `${-d}s`, animationDuration: "7s" } as CSSProperties}>
      <path d={`M${x} ${BASE} q-2 ${-h * 0.4} -${h * 0.25} ${-h * 0.6} M${x} ${BASE} q2 ${-h * 0.5} ${h * 0.12} ${-h * 0.8} M${x} ${BASE - h * 0.3} q${h * 0.2} ${-h * 0.15} ${h * 0.3} ${-h * 0.4}`} stroke={c} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d={`M${x} ${BASE} q-2 ${-h * 0.4} -${h * 0.25} ${-h * 0.6}`} stroke="#fff" strokeOpacity="0.25" strokeWidth="2" fill="none" strokeLinecap="round" transform="translate(-1.5 0)" />
      {[[-h * 0.25, -h * 0.6], [h * 0.12, -h * 0.8], [h * 0.3, -h * 0.7]].map(([dx, dy], i) => (
        <circle key={i} cx={x + dx} cy={BASE + dy} r="4.5" fill={tip} />
      ))}
    </g>
  );
}

function Fan({ x, h, c }: { x: number; h: number; c: string }) {
  return (
    <g className="ct-plant" style={{ animationDuration: "6.5s" } as CSSProperties}>
      <path d={`M${x} ${BASE} L${x - h * 0.55} ${BASE - h} Q${x} ${BASE - h * 1.25} ${x + h * 0.55} ${BASE - h}Z`} fill={c} opacity="0.88" />
      {[-0.4, -0.2, 0, 0.2, 0.4].map((f) => (
        <path key={f} d={`M${x} ${BASE} L${x + f * h * 1.3} ${BASE - h * 1.05}`} stroke="#000" strokeOpacity="0.2" strokeWidth="1.2" />
      ))}
      <path d={`M${x - h * 0.5} ${BASE - h * 0.98} Q${x} ${BASE - h * 1.2} ${x + h * 0.5} ${BASE - h * 0.98}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="2" fill="none" />
    </g>
  );
}

function Brain({ u, x, r, c }: { u: string; x: number; r: number; c: string }) {
  return (
    <g>
      <ellipse cx={x} cy={BASE} rx={r * 1.15} ry={r * 0.2} fill="#000" opacity="0.28" />
      <path d={`M${x - r} ${BASE} A${r} ${r * 0.9} 0 0 1 ${x + r} ${BASE}Z`} fill={c} />
      <path d={`M${x - r} ${BASE} A${r} ${r * 0.9} 0 0 1 ${x + r} ${BASE}Z`} fill={`url(#${u}sh)`} />
      <path d={`M${x - r * 0.6} ${BASE - r * 0.3} q${r * 0.3} -${r * 0.4} ${r * 0.6} 0 t${r * 0.6} 0 M${x - r * 0.5} ${BASE - r * 0.65} q${r * 0.25} -${r * 0.25} ${r * 0.5} 0 t${r * 0.5} 0`} stroke="#000" strokeOpacity="0.28" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Crystal({ x, w, h, c, a = 0, y = BASE }: { x: number; w: number; h: number; c: string; a?: number; y?: number }) {
  return (
    <g transform={`rotate(${a} ${x} ${y})`}>
      <polygon points={`${x - w / 2},${y} ${x - w * 0.36},${y - h * 0.82} ${x},${y - h} ${x + w * 0.36},${y - h * 0.82} ${x + w / 2},${y}`} fill={c} opacity="0.9" />
      <polygon points={`${x},${y - h} ${x + w * 0.36},${y - h * 0.82} ${x + w / 2},${y} ${x},${y}`} fill="#fff" opacity="0.28" />
      <polygon points={`${x - w / 2},${y} ${x - w * 0.36},${y - h * 0.82} ${x - w * 0.1},${y - h * 0.9} ${x - w * 0.1},${y}`} fill="#fff" opacity="0.18" />
    </g>
  );
}

function Orb({ x, y, r, c, d = 0 }: { x: number; y: number; r: number; c: string; d?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 3.2} fill={c} opacity="0.12" className="ct-glow" style={{ animationDelay: `${-d}s` }} />
      <circle cx={x} cy={y} r={r * 1.8} fill={c} opacity="0.28" className="ct-glow" style={{ animationDelay: `${-d}s` }} />
      <circle cx={x} cy={y} r={r} fill={c} />
      <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#fff" opacity="0.8" />
    </g>
  );
}

function Tube({ x, h, c, d = 0 }: { x: number; h: number; c: string; d?: number }) {
  return (
    <g>
      <path d={`M${x} ${BASE} C${x - 10} ${BASE - h * 0.4} ${x + 12} ${BASE - h * 0.7} ${x + 2} ${BASE - h}`} stroke={c} strokeOpacity="0.55" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Orb x={x + 2} y={BASE - h} r={5} c={c} d={d} />
    </g>
  );
}

function Log({ u, x, y = BASE, len, c }: { u: string; x: number; y?: number; len: number; c: string }) {
  return (
    <g>
      <ellipse cx={x + len / 2} cy={y + 1} rx={len * 0.55} ry="4" fill="#000" opacity="0.3" />
      <rect x={x} y={y - 20} width={len} height="20" rx="9" fill={c} />
      <rect x={x} y={y - 20} width={len} height="20" rx="9" fill={`url(#${u}sh)`} />
      <ellipse cx={x + len - 3} cy={y - 10} rx="5" ry="9" fill="#00000030" />
      <ellipse cx={x + len - 3} cy={y - 10} rx="2" ry="4" fill="none" stroke="#00000040" strokeWidth="1" />
      <path d={`M${x + 12} ${y - 14} h${len * 0.4} M${x + 20} ${y - 7} h${len * 0.5}`} stroke="#000" strokeOpacity="0.22" strokeWidth="1.4" />
    </g>
  );
}

function Amphora({ u, x }: { u: string; x: number }) {
  const d = `M${x - 10} ${BASE} C${x - 26} ${BASE - 22} ${x - 20} ${BASE - 46} ${x - 8} ${BASE - 54} L${x - 8} ${BASE - 66} L${x + 8} ${BASE - 66} L${x + 8} ${BASE - 54} C${x + 20} ${BASE - 46} ${x + 26} ${BASE - 22} ${x + 10} ${BASE}Z`;
  return (
    <g>
      <ellipse cx={x} cy={BASE + 1} rx="20" ry="3.5" fill="#000" opacity="0.3" />
      <path d={d} fill="#a0623a" />
      <path d={d} fill={`url(#${u}sh)`} />
      <path d={`M${x - 20} ${BASE - 30} h40`} stroke="#e3b341" strokeOpacity="0.6" strokeWidth="2" />
      <ellipse cx={x} cy={BASE - 66} rx="8" ry="2.4" fill="#2a1608" />
    </g>
  );
}

function Lantern({ u, x }: { u: string; x: number }) {
  return (
    <g>
      <ellipse cx={x} cy={BASE + 1} rx="24" ry="4" fill="#000" opacity="0.3" />
      <rect x={x - 18} y={BASE - 10} width="36" height="10" rx="2" fill="#bdb7a6" />
      <rect x={x - 6} y={BASE - 46} width="12" height="36" fill="#cfc9b8" />
      <rect x={x - 16} y={BASE - 62} width="32" height="16" rx="2" fill="#d8d3c6" />
      <rect x={x - 8} y={BASE - 59} width="16" height="10" fill="#ffd36a" opacity="0.85" className="ct-glow" />
      <path d={`M${x - 24} ${BASE - 62} L${x} ${BASE - 80} L${x + 24} ${BASE - 62}Z`} fill="#b8b2a2" />
      <path d={`M${x - 24} ${BASE - 62} L${x} ${BASE - 80} L${x + 24} ${BASE - 62}Z`} fill={`url(#${u}sh)`} />
    </g>
  );
}

function Pillar({ u, x, h, broken }: { u: string; x: number; h: number; broken?: boolean }) {
  const top = BASE - h;
  return (
    <g>
      <ellipse cx={x} cy={BASE + 1} rx="26" ry="4" fill="#000" opacity="0.3" />
      <rect x={x - 22} y={BASE - 10} width="44" height="10" rx="2" fill="#b8a46a" />
      <path d={broken ? `M${x - 15} ${BASE - 10} V${top + 14} L${x - 6} ${top + 2} L${x + 4} ${top + 12} L${x + 15} ${top} V${BASE - 10}Z` : `M${x - 15} ${BASE - 10} V${top} H${x + 15} V${BASE - 10}Z`} fill="#d9c88a" />
      <path d={broken ? `M${x - 15} ${BASE - 10} V${top + 14} L${x - 6} ${top + 2} L${x + 4} ${top + 12} L${x + 15} ${top} V${BASE - 10}Z` : `M${x - 15} ${BASE - 10} V${top} H${x + 15} V${BASE - 10}Z`} fill={`url(#${u}sh)`} />
      {[-8, 0, 8].map((dx) => (
        <rect key={dx} x={x + dx - 1} y={broken ? top + 16 : top + 4} width="2" height={h - (broken ? 28 : 18)} fill="#000" opacity="0.1" />
      ))}
    </g>
  );
}

function Cluster({ kind, u, side }: { kind: Decor; u: string; side: 0 | 1 }) {
  const o = side ? 7 : 0;
  switch (kind) {
    case "reeds":
      return (
        <>
          <Reed x={18} h={170 - o * 3} c="#4a7a38" d={o} />
          <Reed x={32} h={210 - o * 2} c="#3f6a30" d={o + 1} />
          <Reed x={47} h={150} c="#4f8a3c" d={o + 2} />
          <Grass x={70} h={78} c="#3fb36a" c2="#2f8a50" d={o} />
          <Rock u={u} x={106} w={52} h={30} c="#8a8468" />
          <Grass x={132} h={58} c="#5bc06a" c2="#3f9a4a" n={4} d={o + 1} />
        </>
      );
    case "shoal":
      return (
        <>
          <Grass x={20} h={120} c="#4fcf84" c2="#2f9a56" n={6} d={o} />
          <Grass x={52} h={76} c="#8fe3a3" c2="#4fb36a" d={o + 1} />
          <Rock u={u} x={92} w={60} h={38} c="#9aa0aa" />
          <Rock u={u} x={128} w={30} h={20} c="#b3b8c0" />
          <Grass x={146} h={48} c="#7bd88f" c2="#3fb36a" n={3} d={o} />
        </>
      );
    case "mud":
      return (
        <>
          <Log u={u} x={10} len={92} c="#6b4a2b" />
          <path d={`M14 ${BASE - 14} q-12 -22 -4 -48 M24 ${BASE - 14} q-6 -34 8 -58`} stroke="#5a3d22" strokeWidth="4" fill="none" strokeLinecap="round" />
          <Rock u={u} x={118} w={58} h={40} c="#6e5a3c" />
          <Amphora u={u} x={146} />
          <Grass x={96} h={44} c="#6e7a3a" c2="#4a5a2a" n={3} d={o} />
        </>
      );
    case "stream":
      return (
        <>
          <Rock u={u} x={44} w={92} h={74} c="#8a929a" />
          <Rock u={u} x={104} w={56} h={40} c="#a1a8ae" />
          <Rock u={u} x={140} w={40} h={28} c="#7b838b" />
          <Grass x={86} h={52} c="#4f9a5a" c2="#2f7a3a" n={4} d={o} />
        </>
      );
    case "predator":
      return (
        <>
          <Log u={u} x={-6} len={118} c="#4a3822" />
          <path d={`M60 ${BASE - 18} L98 ${BASE - 74} M84 ${BASE - 18} L128 ${BASE - 58}`} stroke="#3a2c19" strokeWidth="6" strokeLinecap="round" />
          <Kelp x={126} h={190} c="#1f5a3a" d={o} />
          <Kelp x={146} h={140} c="#2a6a44" d={o + 2} />
          <Rock u={u} x={100} w={46} h={26} c="#4a5a52" />
        </>
      );
    case "koi":
      return (
        <>
          <Bamboo x={14} h={250} d={o} />
          <Bamboo x={30} h={200} d={o + 2} />
          <Rock u={u} x={72} w={62} h={34} c="#cfc9b8" />
          <Rock u={u} x={112} w={38} h={22} c="#b8b2a4" />
          <Grass x={136} h={70} c="#5fd08a" c2="#3fa862" n={5} d={o} />
          <Lantern u={u} x={90} />
        </>
      );
    case "coral":
      return (
        <>
          <Branch x={26} h={120} c="#f43f5e" tip="#fda4af" d={o} />
          <Fan x={70} h={90} c="#fb923c" />
          <Brain u={u} x={112} r={26} c="#fbbf24" />
          <Branch x={146} h={90} c="#e879f9" tip="#f5d0fe" d={o + 2} />
        </>
      );
    case "ice":
      return (
        <>
          <Crystal x={26} w={34} h={170} c="#bae6fd" a={-4} />
          <Crystal x={58} w={28} h={110} c="#7dd3fc" a={8} />
          <Crystal x={92} w={40} h={80} c="#e0f2fe" a={-6} />
          <Crystal x={130} w={26} h={130} c="#93c5fd" a={5} />
          <Rock u={u} x={110} w={46} h={20} c="#7aa6c8" />
        </>
      );
    case "abyss":
      return (
        <>
          <Tube x={22} h={190} c="#22d3ee" d={o} />
          <Tube x={52} h={120} c="#a78bfa" d={o + 1} />
          <Rock u={u} x={90} w={56} h={34} c="#232a52" />
          <Tube x={116} h={160} c="#34d399" d={o + 2} />
          <Tube x={144} h={90} c="#f0abfc" d={o + 3} />
        </>
      );
    case "shrine":
      return (
        <>
          <Pillar u={u} x={34} h={220} />
          <Crystal x={78} w={26} h={90} c="#c4b5fd" a={-6} />
          <Crystal x={104} w={34} h={130} c="#a78bfa" a={5} />
          <Pillar u={u} x={142} h={120} broken />
          <Orb x={70} y={BASE - 150} r={5} c="#fde68a" d={o} />
        </>
      );
  }
}

function Center({ kind, u }: { kind: Decor; u: string }): ReactNode {
  switch (kind) {
    case "reeds":
    case "shoal":
      return <Rock u={u} x={60} w={64} h={34} c="#8c8f98" />;
    case "mud":
      return <Log u={u} x={4} len={100} c="#5b4328" />;
    case "stream":
      return <Rock u={u} x={60} w={78} h={52} c="#98a0a8" />;
    case "predator":
      return <Kelp x={60} h={150} c="#2a6a44" />;
    case "koi":
      return (
        <>
          <Rock u={u} x={30} w={44} h={22} c="#d8d2c0" />
          <Rock u={u} x={80} w={36} h={18} c="#c4bdac" />
        </>
      );
    case "coral":
      return <Brain u={u} x={60} r={30} c="#f472b6" />;
    case "ice":
      return <Crystal x={60} w={44} h={90} c="#dbeafe" />;
    case "abyss":
      return <Orb x={60} y={BASE - 60} r={7} c="#38bdf8" d={2} />;
    case "shrine":
      return <Orb x={60} y={BASE - 80} r={8} c="#fde68a" d={1} />;
  }
}

function Surface({ kind }: { kind: Decor }) {
  const pads = kind === "reeds" || kind === "koi";
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-[9%] w-full" aria-hidden>
      <path d="M0 14 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" fill="none" className="ct-flow" />
      <path d="M0 24 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" fill="none" className="ct-flow" style={{ animationDelay: "-1.2s" }} />
      {pads &&
        [[70, 12], [190, 18], [310, 10]].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx="26" ry="5" fill="#2f8a48" />
            <ellipse cx={x} cy={y - 1.2} rx="22" ry="3.4" fill="#4fb36a" />
            {kind === "koi" ? <path d={`M${x + 6} ${y - 3} l5 -10 l5 10Z`} fill="#fbcfe8" /> : <circle cx={x + 8} cy={y - 5} r="4" fill="#f9a8d4" />}
          </g>
        ))}
    </svg>
  );
}

export default function TankScene({ kind, th, deep = false }: { kind: Decor; th: Theme; deep?: boolean }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  const dim = kind === "abyss" || kind === "shrine";
  const sand = kind === "ice" ? "#cfe6f5" : th.sand;
  const mid = kind === "abyss" ? "#0c2a78" : kind === "shrine" ? "#3b2f9a" : th.water[0];
  const bg = `linear-gradient(180deg, ${th.water[0]} 0%, ${mid} 32%, ${th.water[1]} 100%)`;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ background: bg }} aria-hidden>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={`${u}sh`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={`${u}sd`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sand} />
            <stop offset="1" stopColor={sand} stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`${u}sdk`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.45" />
          </linearGradient>
        </defs>
      </svg>

      {!dim && (
        <>
          <div className="ct-ray absolute top-0 h-full w-[26%] bg-gradient-to-b from-white/35 to-transparent [clip-path:polygon(34%_0,66%_0,100%_100%,0_100%)]" style={{ left: "6%" }} />
          <div className="ct-ray absolute top-0 h-full w-[30%] bg-gradient-to-b from-white/28 to-transparent [clip-path:polygon(38%_0,62%_0,100%_100%,0_100%)]" style={{ left: "38%", animationDelay: "-2s" }} />
          <div className="ct-ray absolute top-0 h-full w-[22%] bg-gradient-to-b from-white/30 to-transparent [clip-path:polygon(32%_0,68%_0,100%_100%,0_100%)]" style={{ left: "72%", animationDelay: "-4s" }} />
        </>
      )}

      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full" opacity={dim ? 0.55 : 0.4}>
        <path d="M0 300 V170 Q40 120 90 160 Q130 190 170 150 Q220 100 270 160 Q330 210 360 140 Q380 120 400 150 V300Z" fill={th.water[1]} opacity="0.7" />
        <path d="M0 300 V210 Q60 170 120 205 Q200 240 280 190 Q340 160 400 200 V300Z" fill={th.water[1]} opacity="0.55" />
      </svg>

      <div className="ct-caustic absolute inset-0" style={{ opacity: dim ? 0.18 : 0.42 }} />

      <svg viewBox="0 0 120 300" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-[22%] bottom-0 h-[78%] w-[56%]">
        <Center kind={kind} u={u} />
      </svg>

      <svg viewBox="0 0 160 300" preserveAspectRatio="xMinYMax meet" className="absolute bottom-0 left-0 h-[88%] w-[52%]">
        <Cluster kind={kind} u={u} side={0} />
      </svg>
      <svg viewBox="0 0 160 300" preserveAspectRatio="xMinYMax meet" className="absolute right-0 bottom-0 h-[76%] w-[46%]" style={{ transform: "scaleX(-1)" }}>
        <Cluster kind={kind} u={u} side={1} />
      </svg>

      <svg viewBox="0 0 400 90" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[20%] w-full">
        <path d="M0 26 Q50 12 110 24 T220 20 T320 26 T400 18 V90 H0Z" fill={`url(#${u}sd)`} />
        <path d="M0 26 Q50 12 110 24 T220 20 T320 26 T400 18" stroke="#fff" strokeOpacity="0.4" strokeWidth="2.4" fill="none" />
        <path d="M0 26 Q50 12 110 24 T220 20 T320 26 T400 18 V90 H0Z" fill={`url(#${u}sdk)`} />
        {[[30, 52, 8], [92, 64, 5], [170, 58, 9], [250, 66, 6], [320, 54, 8], [372, 68, 5], [210, 40, 4]].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.55} fill="#000" opacity="0.2" />
        ))}
        {[[60, 40], [140, 46], [280, 42], [350, 48]].map(([x, y], i) => (
          <path key={i} d={`M${x - 16} ${y} q8 -5 16 0 t16 0`} stroke="#fff" strokeOpacity="0.2" strokeWidth="1.6" fill="none" />
        ))}
      </svg>

      <svg viewBox="0 0 160 300" preserveAspectRatio="xMinYMax meet" className="absolute bottom-[-3%] left-[-6%] h-[44%] w-[34%]" style={{ filter: "brightness(0.7) saturate(0.9)" }}>
        {kind === "ice" || kind === "abyss" || kind === "shrine" ? <Crystal x={50} w={40} h={90} c={th.accent} /> : <Grass x={50} h={100} c="#2f7a3a" c2="#1f5a2a" n={6} />}
      </svg>
      <svg viewBox="0 0 160 300" preserveAspectRatio="xMinYMax meet" className="absolute right-[-6%] bottom-[-3%] h-[38%] w-[30%]" style={{ transform: "scaleX(-1)", filter: "brightness(0.7) saturate(0.9)" }}>
        {kind === "ice" || kind === "abyss" || kind === "shrine" ? <Crystal x={50} w={34} h={70} c={th.accent} a={6} /> : <Grass x={50} h={80} c="#2f7a3a" c2="#1f5a2a" n={5} />}
      </svg>

      <Surface kind={kind} />
      <div className="absolute inset-x-0 top-0 h-[16%] bg-gradient-to-b from-white/35 to-transparent" />
      {Array.from({ length: deep ? 16 : 11 }, (_, i) => (
        <span key={i} className="ct-snow" style={{ left: `${(i * 37 + 8) % 96}%`, top: `${(i * 53) % 80}%`, width: 2 + (i % 3), height: 2 + (i % 3), animationDelay: `${-i * 0.8}s`, animationDuration: `${7 + (i % 5)}s` } as CSSProperties} />
      ))}
      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,8,24,0.55)]" />
    </div>
  );
}
