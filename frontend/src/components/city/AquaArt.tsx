import { memo, type ReactNode } from "react";
import { shade } from "./FishArt";
import type { Decor, Theme, ThemeId } from "./rooms";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const H = 700;

function Rock({ x, y, s, c, moss = true }: { x: number; y: number; s: number; c: string; moss?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="8" rx="84" ry="11" fill="#000" opacity="0.28" />
      <path d="M-80 6 Q-74 -50 -26 -64 Q28 -74 62 -38 Q88 -12 80 6Z" fill={c} />
      <path d="M-26 -64 Q28 -74 62 -38 Q34 -48 -6 -38Z" fill={shade(c, 0.28)} />
      <path d="M62 -38 Q88 -12 80 6 L46 6 Q58 -16 62 -38Z" fill={shade(c, -0.32)} />
      <path d="M-60 -10 q20 -14 40 -6 M10 -30 q18 -8 32 2" stroke={shade(c, -0.4)} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.7" />
      {moss && <ellipse cx="-30" cy="-52" rx="30" ry="8" fill="#4f9a46" opacity="0.75" />}
    </g>
  );
}

function Weed({ x, y, h, c, n = 4 }: { x: number; y: number; h: number; c: string; n?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }, (_, i) => {
        const o = (i - (n - 1) / 2) * 10;
        const lean = (i % 2 ? 1 : -1) * (8 + i * 3);
        return <path key={i} d={`M${o} 0 Q${o + lean} ${-h * 0.5} ${o + lean * 0.4} ${-h * (0.8 + (i % 3) * 0.12)}`} stroke={i % 2 ? c : shade(c, 0.2)} strokeWidth={5 - i * 0.4} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
}

function Coral({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 V-60 M0 -30 L-24 -64 M0 -44 L26 -80 M-24 -64 L-34 -90 M26 -80 L38 -104 M26 -80 L12 -102" stroke={c} strokeWidth="9" strokeLinecap="round" fill="none" />
      {[[-34, -92], [38, -106], [12, -104], [0, -62]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="7" fill={shade(c, 0.35)} />
      ))}
    </g>
  );
}

function Crystal({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="6" rx="60" ry="9" fill={c} opacity="0.25" />
      <path d="M-30 4 L-22 -70 L-8 4Z" fill={shade(c, 0.2)} />
      <path d="M-8 4 L8 -120 L28 4Z" fill={c} />
      <path d="M8 -120 L28 4 L14 4Z" fill={shade(c, -0.3)} />
      <path d="M26 4 L40 -56 L52 4Z" fill={shade(c, 0.1)} />
      <path d="M8 -120 L2 -60" stroke="#fff" strokeWidth="2" opacity="0.6" />
    </g>
  );
}

function Lantern({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="6" rx="40" ry="7" fill="#000" opacity="0.28" />
      <rect x="-22" y="-14" width="44" height="18" rx="3" fill={shade(c, -0.1)} />
      <rect x="-8" y="-70" width="16" height="58" fill={c} />
      <rect x="-26" y="-112" width="52" height="42" rx="3" fill={shade(c, -0.15)} />
      <rect x="-16" y="-104" width="32" height="26" fill="#ffd36a" opacity="0.85" />
      <path d="M-40 -112 L0 -136 L40 -112Z" fill={shade(c, 0.1)} />
    </g>
  );
}

function Column({ x, y, s, c, broken }: { x: number; y: number; s: number; c: string; broken: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="6" rx="52" ry="8" fill="#000" opacity="0.28" />
      <rect x="-40" y="-12" width="80" height="18" fill={shade(c, -0.1)} />
      <rect x="-26" y={broken ? -150 : -250} width="52" height={broken ? 140 : 240} fill={c} />
      <rect x="-26" y={broken ? -150 : -250} width="14" height={broken ? 140 : 240} fill={shade(c, 0.22)} />
      {[-16, -2, 12].map((dx) => (
        <path key={dx} d={`M${dx} ${broken ? -146 : -246} V-14`} stroke={shade(c, -0.3)} strokeWidth="1.6" opacity="0.6" />
      ))}
      {!broken && <rect x="-38" y="-268" width="76" height="20" fill={shade(c, 0.1)} />}
      {broken && <path d="M-26 -150 L-8 -164 L10 -148 L26 -160 V-150Z" fill={c} />}
    </g>
  );
}

function Amphora({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${s > 1 ? -18 : 0})`}>
      <ellipse cx="0" cy="6" rx="34" ry="6" fill="#000" opacity="0.3" />
      <path d="M-24 -40 Q-34 -4 -10 4 H10 Q34 -4 24 -40 Q18 -56 8 -62 V-80 H-8 V-62 Q-18 -56 -24 -40Z" fill={c} />
      <path d="M-24 -40 Q-34 -4 -10 4 L-6 4 Q-20 -8 -16 -44Z" fill={shade(c, 0.25)} opacity="0.6" />
      <path d="M-22 -34 H22 M-24 -22 H24" stroke={shade(c, -0.35)} strokeWidth="3" opacity="0.7" />
      <path d="M-8 -80 q-18 8 -16 30 M8 -80 q18 8 16 30" stroke={shade(c, -0.2)} strokeWidth="5" fill="none" />
    </g>
  );
}

function Boat({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(-6)`}>
      <ellipse cx="0" cy="12" rx="130" ry="12" fill="#000" opacity="0.3" />
      <path d="M-120 -30 Q-100 20 -10 22 Q90 22 128 -36 L100 -36 Q70 -8 -10 -8 Q-80 -8 -100 -36Z" fill={c} />
      <path d="M-120 -30 H128" stroke={shade(c, 0.3)} strokeWidth="5" />
      <path d="M-60 -8 L-52 -36 M10 -8 L16 -36 M70 -8 L80 -36" stroke={shade(c, -0.4)} strokeWidth="5" />
      <path d="M-20 -36 L-30 -120 L-22 -122 L-4 -40Z" fill={shade(c, -0.2)} />
    </g>
  );
}

function Torii({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="6" rx="110" ry="9" fill="#000" opacity="0.28" />
      <rect x="-86" y="-230" width="20" height="236" fill="#c0392b" />
      <rect x="66" y="-230" width="20" height="236" fill="#c0392b" />
      <rect x="-86" y="-230" width="8" height="236" fill="#e2594a" />
      <rect x="-110" y="-250" width="220" height="22" rx="4" fill="#2a1d1a" />
      <path d="M-120 -256 Q0 -232 120 -256 L110 -246 Q0 -224 -110 -246Z" fill="#7a2018" />
      <rect x="-96" y="-196" width="192" height="14" fill="#c0392b" />
    </g>
  );
}

function Statue({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="6" rx="56" ry="8" fill="#000" opacity="0.3" />
      <rect x="-40" y="-22" width="80" height="26" fill={shade(c, -0.1)} />
      <rect x="-30" y="-44" width="60" height="22" fill={c} />
      <path d="M-18 -44 Q-22 -110 -10 -130 Q-14 -146 0 -150 Q14 -146 10 -130 Q22 -110 18 -44Z" fill={shade(c, 0.12)} />
      <path d="M-18 -90 Q-44 -120 -52 -150 M18 -90 Q44 -120 52 -150" stroke={shade(c, 0.12)} strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="0" cy="-156" r="14" fill="#fde68a" opacity="0.3" />
    </g>
  );
}

function Log({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(-4)`}>
      <ellipse cx="0" cy="12" rx="120" ry="10" fill="#000" opacity="0.3" />
      <path d="M-110 4 Q-114 -26 -90 -30 H92 Q116 -26 112 4Z" fill={c} />
      <path d="M-110 4 Q-114 -26 -90 -30 H92 L84 -16 H-84Z" fill={shade(c, 0.22)} />
      <ellipse cx="108" cy="-13" rx="12" ry="18" fill={shade(c, 0.35)} />
      <ellipse cx="108" cy="-13" rx="6" ry="10" fill="none" stroke={shade(c, -0.2)} strokeWidth="2" />
      <ellipse cx="-30" cy="-30" rx="44" ry="8" fill="#3f8f48" opacity="0.8" />
    </g>
  );
}

function Floor({ w, th, r }: { w: number; th: Theme; r: () => number }) {
  const s1 = shade(th.sand, -0.08);
  const s2 = shade(th.sand, -0.38);
  const peb = Array.from({ length: Math.round(w / 38) }, () => ({ x: r() * w, y: 640 + r() * 54, s: 2 + r() * 5, l: r() > 0.5 }));
  const rip = Array.from({ length: Math.round(w / 140) }, () => ({ x: r() * w, y: 610 + r() * 70, l: 40 + r() * 90 }));
  return (
    <g>
      <path d={`M0 ${H} V608 Q${w * 0.12} 590 ${w * 0.25} 610 T${w * 0.5} 602 T${w * 0.75} 612 T${w} 598 V${H}Z`} fill={s1} />
      <path d={`M0 ${H} V640 Q${w * 0.2} 628 ${w * 0.4} 644 T${w * 0.7} 638 T${w} 646 V${H}Z`} fill={s2} />
      <path d={`M0 608 Q${w * 0.12} 590 ${w * 0.25} 610 T${w * 0.5} 602 T${w * 0.75} 612 T${w} 598`} stroke="#fff" strokeOpacity="0.2" strokeWidth="3" fill="none" />
      {rip.map((p, i) => (
        <path key={i} d={`M${p.x} ${p.y} q${p.l * 0.25} -6 ${p.l * 0.5} 0 t${p.l * 0.5} 0`} stroke="#fff" strokeOpacity="0.16" strokeWidth="2" fill="none" />
      ))}
      {peb.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={p.s} ry={p.s * 0.65} fill={p.l ? shade(th.sand, 0.3) : shade(th.sand, -0.5)} opacity="0.75" />
      ))}
    </g>
  );
}

function Hanging({ decor, w, th, r }: { decor: Decor; w: number; th: Theme; r: () => number }) {
  const out: ReactNode[] = [];
  const n = Math.round(w / 190);
  for (let i = 0; i < n; i++) {
    const x = (i + 0.2 + r() * 0.6) * (w / n);
    const l = 40 + r() * 90;
    if (decor === "ice") out.push(<path key={i} d={`M${x - 18} 0 L${x} ${l + 40} L${x + 18} 0Z`} fill="#dff6ff" opacity="0.8" />);
    else if (decor === "mud" || decor === "predator") out.push(<path key={i} d={`M${x} 0 q${r() * 20 - 10} ${l * 0.5} ${r() * 14 - 7} ${l}`} stroke="#4a3320" strokeWidth={4 + r() * 4} fill="none" strokeLinecap="round" />);
    else if (decor === "abyss") out.push(<g key={i}><path d={`M${x} 0 V${l}`} stroke="#334155" strokeWidth="2" /><circle cx={x} cy={l} r="7" fill="#7dd3fc" /><circle cx={x} cy={l} r="22" fill="#7dd3fc" opacity="0.25" /></g>);
    else if (decor === "shrine") out.push(<g key={i}><path d={`M${x} 0 V${l}`} stroke="#8a6a1f" strokeWidth="3" /><rect x={x - 10} y={l} width="20" height="26" rx="4" fill="#fbbf24" /><circle cx={x} cy={l + 13} r="26" fill="#fde68a" opacity="0.25" /></g>);
    else out.push(<g key={i}><path d={`M${x} 0 q6 ${l * 0.5} 0 ${l}`} stroke="#2f7a3a" strokeWidth="3" fill="none" /><ellipse cx={x} cy={l + 4} rx="30" ry="7" fill="#3f9a4a" opacity="0.9" />{decor === "koi" && <circle cx={x + 8} cy={l} r="6" fill="#f9a8d4" />}</g>);
  }
  void th;
  return <g>{out}</g>;
}

const LANDMARKS: Record<ThemeId, ((x: number, y: number, c: string) => ReactNode)[]> = {
  pond: [(x, y, c) => <Log key="l" x={x} y={y} s={1.2} c={c} />, (x, y, c) => <Boat key="b" x={x} y={y} s={0.9} c={c} />],
  lake: [(x, y, c) => <Column key="c1" x={x} y={y} s={1.2} c={shade(c, 0.5)} broken={false} />, (x, y, c) => <Boat key="b" x={x} y={y} s={1.1} c={c} />, (x, y, c) => <Column key="c2" x={x} y={y} s={1.4} c={shade(c, 0.5)} broken />],
  stream: [(x, y, c) => <Rock key="r" x={x} y={y} s={2} c={c} />, (x, y, c) => <Log key="l" x={x} y={y} s={1} c={shade(c, -0.2)} />],
  predator: [(x, y, c) => <Log key="l" x={x} y={y} s={1.3} c={c} />],
  mud: [(x, y, c) => <Amphora key="a1" x={x} y={y} s={1.5} c={c} />, (x, y, c) => <Boat key="b" x={x} y={y} s={1.2} c={shade(c, -0.3)} />, (x, y, c) => <Log key="l" x={x} y={y} s={1.1} c={c} />],
  koi: [(x, y) => <Torii key="t" x={x} y={y} s={1.2} />, (x, y, c) => <Lantern key="l" x={x} y={y} s={1.3} c={shade(c, 0.4)} />],
  abyss: [(x, y) => <Crystal key="c" x={x} y={y} s={1.6} c="#38bdf8" />, (x, y) => <Crystal key="c2" x={x} y={y} s={1.3} c="#a78bfa" />],
  shrine: [(x, y, c) => <Statue key="s" x={x} y={y} s={1.5} c={shade(c, 0.4)} />, (x, y, c) => <Column key="c" x={x} y={y} s={1.3} c={shade(c, 0.4)} broken={false} />],
};

function Flora({ decor, w, th, r }: { decor: Decor; w: number; th: Theme; r: () => number }) {
  const out: ReactNode[] = [];
  const n = Math.round(w / 90);
  const rock = shade(th.trim, th.dark ? 0.1 : -0.1);
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    const y = 626 + r() * 40;
    const k = r();
    if (decor === "reeds" || decor === "shoal" || decor === "koi") {
      out.push(<Weed key={`w${i}`} x={x} y={y} h={120 + r() * 200} c={decor === "koi" ? "#3f8f5a" : "#3f9a4a"} n={3 + Math.floor(r() * 3)} />);
      if (k > 0.7) out.push(<g key={`t${i}`}><path d={`M${x + 20} ${y} q6 -80 0 -150`} stroke="#4d8a3e" strokeWidth="4" fill="none" /><ellipse cx={x + 20} cy={y - 148} rx="5" ry="16" fill="#7c4a2a" /></g>);
    } else if (decor === "stream") {
      out.push(<Weed key={`w${i}`} x={x} y={y} h={60 + r() * 80} c="#5aa05a" n={3} />);
    } else if (decor === "predator" || decor === "mud") {
      out.push(<Weed key={`w${i}`} x={x} y={y} h={90 + r() * 170} c={decor === "mud" ? "#5a6a2a" : "#2d6a46"} n={3} />);
    } else if (decor === "coral") {
      out.push(<Coral key={`c${i}`} x={x} y={y} s={0.9 + r() * 1.2} c={["#f472b6", "#fb923c", "#a78bfa", "#facc15"][i % 4]} />);
    } else if (decor === "abyss") {
      if (k > 0.5) out.push(<Crystal key={`c${i}`} x={x} y={y} s={0.5 + r() * 0.9} c={i % 2 ? "#38bdf8" : "#a78bfa"} />);
      else out.push(<g key={`w${i}`}><Weed x={x} y={y} h={90 + r() * 100} c="#0e7490" n={3} /><circle cx={x} cy={y - 110} r="5" fill="#7dd3fc" /></g>);
    } else if (decor === "ice") {
      out.push(<Crystal key={`c${i}`} x={x} y={y} s={0.5 + r() * 1.1} c="#bae6fd" />);
    } else {
      if (k > 0.6) out.push(<Weed key={`w${i}`} x={x} y={y} h={80 + r() * 90} c="#6d5bd0" n={3} />);
      else out.push(<g key={`g${i}`}><ellipse cx={x} cy={y} rx="20" ry="7" fill="#fbbf24" opacity="0.25" /><circle cx={x} cy={y - 6} r="4" fill="#fde68a" /></g>);
    }
  }
  const nr = Math.round(w / 420);
  for (let i = 0; i < nr; i++) out.push(<Rock key={`r${i}`} x={(i + 0.15 + r() * 0.7) * (w / nr)} y={640 + r() * 30} s={0.8 + r() * 1.1} c={rock} moss={decor !== "abyss" && decor !== "ice"} />);
  return <g>{out}</g>;
}

function Ridge({ w, th, r }: { w: number; th: Theme; r: () => number }) {
  let d = `M0 ${H} V470`;
  const step = 120;
  for (let x = 0; x <= w + step; x += step) d += ` Q${x + step * 0.5} ${380 + r() * 130} ${x + step} ${440 + r() * 60}`;
  d += ` V${H}Z`;
  return <path d={d} fill={shade(th.water[1], 0.02)} opacity="0.5" />;
}

export const ZoneArt = memo(function ZoneArt({ decor, theme, zi, w, h, th }: { decor: Decor; theme: ThemeId; zi: number; w: number; h: number; th: Theme }) {
  const s = h / H;
  const W = Math.round(w / s);
  const r = rng(zi * 977 + decor.length * 131 + theme.length * 17);
  const lm = LANDMARKS[theme];
  const pick = lm[(zi + (theme.length % 2)) % lm.length];
  const rock = shade(th.trim, th.dark ? 0.1 : -0.1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={w} height={h} className="pointer-events-none absolute top-0 left-0" aria-hidden>
      <Ridge w={W} th={th} r={r} />
      <Hanging decor={decor} w={W} th={th} r={r} />
      <Floor w={W} th={th} r={r} />
      <Flora decor={decor} w={W} th={th} r={r} />
      {pick(W * (0.3 + r() * 0.4), 650, rock)}
      {lm.length > 1 && lm[(zi + 1) % lm.length](W * (0.78 + r() * 0.15), 656, rock)}
    </svg>
  );
});
