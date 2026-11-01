import type { ReactNode } from "react";
import "./hunt.css";

export interface SceneProps {
  taps: string[];
  onTap: (id: string) => void;
  lit?: string | null;
  digits?: number[];
  onDigit?: (index: number, delta: number) => void;
}

const lcg = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

const STARS = (() => {
  const r = lcg(11);
  return Array.from({ length: 90 }, () => ({ x: r() * 320, y: r() * 150, r: 0.4 + r() * 0.9, d: r() * 4, t: 2 + r() * 3 }));
})();

function Stars({ below = 150 }: { below?: number }) {
  return (
    <g>
      {STARS.filter((s) => s.y < below).map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" className="hx-twinkle" style={{ animationDelay: `-${s.d}s`, animationDuration: `${s.t}s` }} />
      ))}
    </g>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 320 240" className="mx-auto block h-auto max-h-[60dvh] w-full select-none" role="group">
      <defs>
        <radialGradient id="hx-fog" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#d8ccff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#d8ccff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {children}
    </svg>
  );
}

function Fog({ y, o = 0.5 }: { y: number; o?: number }) {
  return (
    <g opacity={o}>
      <ellipse cx="90" cy={y} rx="150" ry="16" fill="url(#hx-fog)" className="hx-drift" />
      <ellipse cx="250" cy={y + 10} rx="170" ry="18" fill="url(#hx-fog)" className="hx-drift-b" />
    </g>
  );
}

function Hit({ id, label, onTap, children }: { id: string; label: string; onTap: (id: string) => void; children: ReactNode }) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      className="hx-hit"
      data-testid={`hx-${id}`}
      onClick={() => onTap(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap(id);
        }
      }}
    >
      {children}
    </g>
  );
}

const STONE = "M-9 -3 L-4 -9 L5 -8 L10 -1 L7 8 L-2 10 L-9 5Z";
const STONES = [
  { id: "pietra-1", x: 62, y: 190, r: 9 },
  { id: "pietra-2", x: 118, y: 178, r: 15 },
  { id: "pietra-3", x: 166, y: 204, r: 6 },
  { id: "pietra-4", x: 224, y: 184, r: 19 },
  { id: "pietra-5", x: 275, y: 200, r: 12 },
];

export function Soglia({ taps, onTap }: SceneProps) {
  const n = taps.length;
  return (
    <Frame>
      <defs>
        <linearGradient id="sg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#04050e" />
          <stop offset="0.55" stopColor="#1a1038" />
          <stop offset="1" stopColor="#3a1c5c" />
        </linearGradient>
        <radialGradient id="sg-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.3" stopColor="#e9e4ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8b7cf0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sg-seam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7d6" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fde68a" />
          <stop offset="1" stopColor="#fff7d6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sg-door" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1b1438" />
          <stop offset="0.5" stopColor="#2d2160" />
          <stop offset="1" stopColor="#1b1438" />
        </linearGradient>
        <linearGradient id="sg-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d1240" />
          <stop offset="1" stopColor="#07040f" />
        </linearGradient>
        <radialGradient id="sg-stone" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#9a9ec6" />
          <stop offset="1" stopColor="#2a2c44" />
        </radialGradient>
        <radialGradient id="sg-stoneOn" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fff7d6" />
          <stop offset="1" stopColor="#c2862a" />
        </radialGradient>
        <radialGradient id="sg-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fde68a" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="240" fill="url(#sg-sky)" />
      <Stars below={120} />
      <circle cx="258" cy="46" r="34" fill="url(#sg-moon)" className="hx-pulse" />
      <circle cx="258" cy="46" r="15" fill="#f3f0ff" />
      <circle cx="253" cy="42" r="3" fill="#d6d0f0" />
      <circle cx="263" cy="50" r="2.2" fill="#d6d0f0" />
      <path d="M0 140 L38 106 L78 132 L128 92 L190 134 L240 102 L292 130 L320 112 V170 H0Z" fill="#150b2e" />
      <path d="M14 160 V96 L20 90 L28 98 L34 92 V160Z" fill="#0d0720" />
      <path d="M286 160 V84 L292 78 L300 88 L308 80 V160Z" fill="#0d0720" />
      <path d="M0 156 Q160 142 320 156 V240 H0Z" fill="url(#sg-ground)" />
      <path d="M138 156 L182 156 L250 240 L70 240Z" fill="#33225e" opacity="0.45" />
      <path d="M110 160 V104 A50 50 0 0 1 210 104 V160Z" fill="#0c0820" stroke="#5b4d9a" strokeWidth="3" />
      <path d="M119 160 V106 A41 41 0 0 1 201 106 V160Z" fill="url(#sg-door)" />
      <ellipse cx="160" cy="112" rx="30" ry="62" fill="url(#sg-glow)" opacity={n * 0.18} />
      <rect x="158.5" y="60" width="3" height="100" fill="url(#sg-seam)" opacity={0.25 + 0.15 * n} className="hx-pulse" />
      {Array.from({ length: 5 }, (_, i) => {
        const a = ((-60 + i * 30) * Math.PI) / 180;
        return <circle key={i} cx={160 + 56 * Math.sin(a)} cy={106 - 56 * Math.cos(a)} r="3" fill={i < n ? "#fde68a" : "#2c2552"} stroke="#5b4d9a" strokeWidth="1" />;
      })}
      <Fog y={168} o={0.55} />
      {STONES.map((s, i) => {
        const on = taps.includes(s.id);
        return (
          <Hit key={s.id} id={s.id} label="Pietra runica" onTap={onTap}>
            <g transform={`translate(${s.x} ${s.y})`}>
              <g className="hx-float" style={{ animationDelay: `-${i * 1.1}s`, animationDuration: `${4.5 + i * 0.4}s` }}>
                <circle r={s.r + 9} fill="transparent" />
                {on && <circle r={s.r + 9} fill="url(#sg-glow)" className="hx-pulse" />}
                <g transform={`scale(${s.r / 10})`}>
                  <path d={STONE} fill={on ? "url(#sg-stoneOn)" : "url(#sg-stone)"} stroke={on ? "#fff7d6" : "#6c6f93"} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                  <path d="M-3 0 L0 -4 L3 0 L0 4Z" fill="none" stroke={on ? "#7a4a08" : "#555a80"} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                </g>
              </g>
            </g>
          </Hit>
        );
      })}
    </Frame>
  );
}

const BOOKS = [
  { id: "libro-rosso", c: "#D6453D", h: 58 },
  { id: "libro-blu", c: "#2347B8", h: 64 },
  { id: "libro-giallo", c: "#F5C542", h: 52 },
  { id: "libro-viola", c: "#7B4BB7", h: 60 },
  { id: "libro-arancio", c: "#F28C28", h: 56 },
];

const DECOR_TONES = ["#3b2a3f", "#2c3446", "#4a3326", "#2f3d36", "#40303a", "#33394d"];

const DECOR = (() => {
  const r = lcg(5);
  return Array.from({ length: 4 }, () => Array.from({ length: 6 }, () => ({ h: 22 + Math.floor(r() * 16), c: DECOR_TONES[Math.floor(r() * DECOR_TONES.length)] })));
})();

function SideShelf({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="36" width="70" height="170" fill="#1a0f0b" stroke="#3a2417" strokeWidth="2" />
      {DECOR.map((row, ri) => {
        const base = 74 + ri * 40;
        let cx = x + 5;
        return (
          <g key={ri}>
            {row.map((b, bi) => {
              const w = 8 + (bi % 3) * 2;
              const el = <rect key={bi} x={cx} y={base - b.h} width={w} height={b.h} rx="1" fill={b.c} />;
              cx += w + 1.5;
              return el;
            })}
            <rect x={x} y={base} width="70" height="4" fill="#4a2f1d" />
          </g>
        );
      })}
    </g>
  );
}

function Candle({ x, y, d }: { x: number; y: number; d: number }) {
  return (
    <g>
      <circle cx={x} cy={y - 8} r="36" fill="url(#bk-warm)" className="hx-pulse" style={{ animationDelay: `-${d}s` }} />
      <rect x={x - 3} y={y} width="6" height="16" rx="1" fill="#f1e7cf" />
      <path d={`M${x} ${y - 11} Q${x + 4} ${y - 4} ${x} ${y - 1} Q${x - 4} ${y - 4} ${x} ${y - 11}Z`} fill="#ffd166" className="hx-flicker" style={{ animationDelay: `-${d}s` }} />
    </g>
  );
}

export function Biblioteca({ taps, onTap }: SceneProps) {
  return (
    <Frame>
      <defs>
        <linearGradient id="bk-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#120a14" />
          <stop offset="1" stopColor="#2a160f" />
        </linearGradient>
        <linearGradient id="bk-sunset" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2347B8" />
          <stop offset="0.28" stopColor="#7B4BB7" />
          <stop offset="0.52" stopColor="#D6453D" />
          <stop offset="0.76" stopColor="#F28C28" />
          <stop offset="1" stopColor="#F5C542" />
        </linearGradient>
        <linearGradient id="bk-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5a33" />
          <stop offset="1" stopColor="#3b2412" />
        </linearGradient>
        <linearGradient id="bk-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="bk-warm" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffb347" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="240" fill="url(#bk-wall)" />
      <SideShelf x={6} />
      <SideShelf x={244} />
      <path d="M116 108 V56 A44 44 0 0 1 204 56 V108Z" fill="url(#bk-sunset)" />
      <path d="M142 108 A18 18 0 0 1 178 108Z" fill="#fff4c2" />
      {[[134, 24], [150, 18], [172, 22], [188, 30], [160, 34]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.9" fill="#fff" className="hx-twinkle" style={{ animationDelay: `-${i * 0.6}s` }} />
      ))}
      <path d="M116 108 V56 A44 44 0 0 1 204 56 V108Z" fill="none" stroke="#6b4a2a" strokeWidth="4" />
      <path d="M160 12 V108 M116 64 H204" stroke="#6b4a2a" strokeWidth="2.5" />
      <rect x="110" y="107" width="100" height="7" rx="1" fill="url(#bk-wood)" />
      <rect x="0" y="206" width="320" height="34" fill="#1a0e09" />
      <rect x="76" y="178" width="168" height="11" rx="2" fill="url(#bk-wood)" />
      <rect x="84" y="189" width="6" height="18" fill="#2a170c" />
      <rect x="230" y="189" width="6" height="18" fill="#2a170c" />
      <Candle x={60} y={190} d={0} />
      <Candle x={262} y={190} d={0.8} />
      {BOOKS.map((b, i) => {
        const on = taps.includes(b.id);
        const x = 92 + i * 30;
        return (
          <Hit key={b.id} id={b.id} label="Libro" onTap={onTap}>
            <g transform={`translate(${x} ${178 - b.h})`} style={{ transform: `translate(${x}px, ${178 - b.h - (on ? 10 : 0)}px)`, transition: "transform 0.25s ease" }}>
              <rect x="-3" y="-8" width="30" height={b.h + 12} fill="transparent" />
              {on && <rect x="-3" y="-3" width="30" height={b.h + 6} rx="4" fill="#fde68a" opacity="0.35" />}
              <rect width="24" height={b.h} rx="2" fill={b.c} />
              <rect width="24" height={b.h} rx="2" fill="url(#bk-shade)" />
              <rect y="6" width="24" height="2.4" fill="#f6d77a" opacity="0.9" />
              <rect y={b.h - 10} width="24" height="2.4" fill="#f6d77a" opacity="0.9" />
              <circle cx="12" cy={b.h / 2} r="3.2" fill="none" stroke="#f6d77a" strokeWidth="1" />
              {on && <rect width="24" height={b.h} rx="2" fill="none" stroke="#fff7d6" strokeWidth="1.6" />}
            </g>
          </Hit>
        );
      })}
      {[[40, 150], [96, 130], [220, 120], [286, 160], [150, 150], [196, 168]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.3" fill="#ffe3a8" opacity="0.6" className="hx-float" style={{ animationDelay: `-${i * 0.9}s`, animationDuration: `${5 + i}s` }} />
      ))}
    </Frame>
  );
}

const FLIES = [
  { x: 52, y: 128, d: 1.2 },
  { x: 108, y: 160, d: 1.6 },
  { x: 158, y: 108, d: 1.1 },
  { x: 206, y: 150, d: 1.8 },
  { x: 252, y: 122, d: 5 },
  { x: 84, y: 196, d: 1.4 },
  { x: 236, y: 198, d: 1.7 },
];

const BLADES = (() => {
  const r = lcg(23);
  return Array.from({ length: 34 }, () => ({ x: r() * 320, h: 10 + r() * 16, d: r() * 3 }));
})();

export function Giardino({ taps, onTap }: SceneProps) {
  return (
    <Frame>
      <defs>
        <linearGradient id="jd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#040712" />
          <stop offset="0.6" stopColor="#0d1b3a" />
          <stop offset="1" stopColor="#16384a" />
        </linearGradient>
        <linearGradient id="jd-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c2418" />
          <stop offset="1" stopColor="#030906" />
        </linearGradient>
        <radialGradient id="jd-fly" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3ffb0" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#c6f24e" stopOpacity="0.5" />
          <stop offset="1" stopColor="#8be04e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="jd-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.35" stopColor="#dff1ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7dc4ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="240" fill="url(#jd-sky)" />
      <Stars below={100} />
      <circle cx="74" cy="52" r="46" fill="url(#jd-moon)" className="hx-pulse" />
      <circle cx="74" cy="52" r="21" fill="#eef7ff" />
      <circle cx="68" cy="47" r="4" fill="#cfe3f3" />
      <circle cx="80" cy="58" r="3" fill="#cfe3f3" />
      <path d="M0 150 Q40 120 80 146 T160 142 T240 146 T320 134 V190 H0Z" fill="#06150e" />
      <path d="M-10 190 V96 Q-8 70 18 62 Q8 44 34 40 Q60 36 64 62 Q96 64 92 100 Q84 118 64 124 L58 190Z" fill="#050f0a" />
      <path d="M262 190 V110 Q252 92 270 78 Q268 52 296 50 Q326 52 330 84 Q340 112 322 128 V190Z" fill="#050f0a" />
      <rect x="0" y="176" width="320" height="64" fill="url(#jd-ground)" />
      {BLADES.map((b, i) => (
        <path key={i} d={`M${b.x} 240 Q${b.x + 2} ${240 - b.h * 0.6} ${b.x + 4} ${240 - b.h}`} stroke="#14552f" strokeWidth="1.4" fill="none" className="hx-sway" style={{ animationDelay: `-${b.d}s` }} />
      ))}
      <Fog y={182} o={0.4} />
      {FLIES.map((f, i) => {
        const id = `lucciola-${i + 1}`;
        const on = taps.includes(id);
        return (
          <Hit key={id} id={id} label="Lucciola" onTap={onTap}>
            <g transform={`translate(${f.x} ${f.y})`}>
              <g className="hx-wander" style={{ animationDuration: `${7 + i * 1.3}s`, animationDelay: `-${i * 1.7}s` }}>
                <circle r="16" fill="transparent" />
                <circle r="10" fill="url(#jd-fly)" className="hx-breath" style={{ animationDuration: `${f.d}s`, animationDelay: `-${i * 0.37}s` }} />
                <circle r="2" fill="#f6ffc2" className="hx-breath" style={{ animationDuration: `${f.d}s`, animationDelay: `-${i * 0.37}s` }} />
                {on && <circle r="9" fill="none" stroke="#fff7d6" strokeWidth="1" />}
              </g>
            </g>
          </Hit>
        );
      })}
    </Frame>
  );
}

function gearPath(r: number, teeth: number, depth: number) {
  const step = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const marks: [number, number][] = [
      [a, r],
      [a + step * 0.12, r + depth],
      [a + step * 0.42, r + depth],
      [a + step * 0.54, r],
    ];
    marks.forEach(([ang, rad]) => pts.push(`${(Math.cos(ang) * rad).toFixed(1)} ${(Math.sin(ang) * rad).toFixed(1)}`));
  }
  return `M${pts.join(" L")}Z`;
}

const GEARS = [
  { x: 46, y: 62, r: 34, t: 12, s: 26, rev: false },
  { x: 108, y: 30, r: 20, t: 8, s: 17, rev: true },
  { x: 276, y: 68, r: 40, t: 14, s: 32, rev: true },
  { x: 302, y: 204, r: 28, t: 10, s: 22, rev: false },
  { x: 30, y: 206, r: 30, t: 11, s: 24, rev: true },
];

function Gear({ x, y, r, t, s, rev }: (typeof GEARS)[number]) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={rev ? "hx-spin-rev" : "hx-spin"} style={{ animationDuration: `${s}s` }}>
        <path d={gearPath(r, t, r * 0.18)} fill="url(#tw-gear)" stroke="#d6a24a" strokeOpacity="0.55" strokeWidth="1" />
        <circle r={r * 0.55} fill="none" stroke="#1a1006" strokeWidth={r * 0.14} />
        <path d={`M${-r * 0.55} 0 H${r * 0.55} M0 ${-r * 0.55} V${r * 0.55}`} stroke="#1a1006" strokeWidth={r * 0.1} />
        <circle r={r * 0.16} fill="#e7b75a" />
      </g>
    </g>
  );
}

const WINDOW_X = [78, 122, 166, 210];

export function Torre({ digits = [0, 0, 0, 0], onDigit }: SceneProps) {
  const step = (i: number, delta: number) => () => onDigit?.(i, delta);
  return (
    <Frame>
      <defs>
        <linearGradient id="tw-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d0804" />
          <stop offset="1" stopColor="#2a1a0a" />
        </linearGradient>
        <linearGradient id="tw-gear" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a5f22" />
          <stop offset="1" stopColor="#3c2610" />
        </linearGradient>
        <linearGradient id="tw-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d77a" />
          <stop offset="0.5" stopColor="#b8862b" />
          <stop offset="1" stopColor="#6b4713" />
        </linearGradient>
        <linearGradient id="tw-win" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050302" />
          <stop offset="0.5" stopColor="#1a1208" />
          <stop offset="1" stopColor="#050302" />
        </linearGradient>
        <radialGradient id="tw-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffb347" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="240" fill="url(#tw-bg)" />
      <ellipse cx="160" cy="124" rx="170" ry="100" fill="url(#tw-glow)" className="hx-pulse" />
      {GEARS.map((g, i) => (
        <Gear key={i} {...g} />
      ))}
      <circle cx="160" cy="34" r="25" fill="#e8d7a8" stroke="url(#tw-brass)" strokeWidth="4" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <line key={i} x1={160 + 19 * Math.sin(a)} y1={34 - 19 * Math.cos(a)} x2={160 + 22 * Math.sin(a)} y2={34 - 22 * Math.cos(a)} stroke="#3a2610" strokeWidth="1.4" />;
      })}
      <g transform="translate(160 34)">
        <line x1="0" y1="0" x2="0" y2="-15" stroke="#2a1a0a" strokeWidth="2" strokeLinecap="round" className="hx-spin" style={{ animationDuration: "120s" }} />
        <line x1="0" y1="0" x2="0" y2="-19" stroke="#2a1a0a" strokeWidth="1.2" strokeLinecap="round" className="hx-spin" style={{ animationDuration: "10s" }} />
        <circle r="2" fill="#2a1a0a" />
      </g>
      <rect x="58" y="72" width="204" height="110" rx="12" fill="url(#tw-brass)" stroke="#3a2610" strokeWidth="2" />
      <rect x="64" y="78" width="192" height="98" rx="8" fill="#241608" opacity="0.85" />
      {[[68, 82], [252, 82], [68, 172], [252, 172]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.4" fill="#e7b75a" stroke="#3a2610" strokeWidth="0.8" />
      ))}
      {WINDOW_X.map((x, i) => (
        <g key={x}>
          <rect x={x - 2} y="100" width="40" height="48" rx="4" fill="#3a2610" />
          <rect x={x} y="102" width="36" height="44" rx="3" fill="url(#tw-win)" />
          <text x={x + 18} y="135" textAnchor="middle" fontSize="32" fontWeight="700" fontFamily="ui-monospace, Menlo, monospace" fill="#fde68a" data-testid={`hx-digit-${i}`}>
            {digits[i] ?? 0}
          </text>
          <Hit id={`su-${i}`} label="Aumenta la cifra" onTap={step(i, 1)}>
            <rect x={x} y="80" width="36" height="20" fill="transparent" />
            <path d={`M${x + 8} 94 L${x + 18} 84 L${x + 28} 94Z`} fill="#f6d77a" />
          </Hit>
          <Hit id={`giu-${i}`} label="Diminuisci la cifra" onTap={step(i, -1)}>
            <rect x={x} y="148" width="36" height="22" fill="transparent" />
            <path d={`M${x + 8} 156 L${x + 18} 166 L${x + 28} 156Z`} fill="#f6d77a" />
          </Hit>
        </g>
      ))}
      <rect x="132" y="196" width="56" height="22" rx="6" fill="url(#tw-brass)" stroke="#3a2610" strokeWidth="1.5" />
      <circle cx="160" cy="205" r="3.2" fill="#1a1006" />
      <path d="M160 208 L158 214 H162Z" fill="#1a1006" />
    </Frame>
  );
}

const RUNES = [
  { id: "runa-0", x: 160, y: 56, c: "#FDE68A", label: "Sole" },
  { id: "runa-1", x: 238, y: 114, c: "#FB7185", label: "Fuoco" },
  { id: "runa-2", x: 160, y: 172, c: "#7DD3FC", label: "Luna" },
  { id: "runa-3", x: 82, y: 114, c: "#86EFAC", label: "Stella" },
];

function Symbol({ id, c }: { id: string; c: string }) {
  if (id === "runa-0")
    return (
      <g stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none">
        <circle r="5.5" fill={c} fillOpacity="0.4" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return <line key={i} x1={8.5 * Math.sin(a)} y1={-8.5 * Math.cos(a)} x2={12 * Math.sin(a)} y2={-12 * Math.cos(a)} />;
        })}
      </g>
    );
  if (id === "runa-1") return <path d="M0 -11 L10 8 L-10 8Z" fill={c} fillOpacity="0.35" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />;
  if (id === "runa-2") return <path d="M3 -11 A11 11 0 1 0 3 11 A8 8 0 1 1 3 -11Z" fill={c} fillOpacity="0.35" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />;
  return <path d="M0 -12 L8 0 L0 12 L-8 0Z" fill={c} fillOpacity="0.35" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />;
}

export function Eco({ lit, onTap }: SceneProps) {
  return (
    <Frame>
      <defs>
        <radialGradient id="ec-bg" cx="0.5" cy="0.47" r="0.8">
          <stop offset="0" stopColor="#2a1260" />
          <stop offset="0.6" stopColor="#10062c" />
          <stop offset="1" stopColor="#04010d" />
        </radialGradient>
        <radialGradient id="ec-orb" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#f3e8ff" />
          <stop offset="0.5" stopColor="#a855f7" />
          <stop offset="1" stopColor="#3b0b7a" />
        </radialGradient>
        <radialGradient id="ec-dais" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3a1c7a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#10062c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="240" fill="url(#ec-bg)" />
      <Stars below={240} />
      <ellipse cx="160" cy="196" rx="140" ry="24" fill="url(#ec-dais)" />
      <circle cx="160" cy="114" r="100" fill="none" stroke="#a78bfa" strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="3 8 14 8" className="hx-spin" />
      <circle cx="160" cy="114" r="84" fill="none" stroke="#fde68a" strokeOpacity="0.3" strokeWidth="0.8" strokeDasharray="1 6" className="hx-spin-rev" />
      {RUNES.map((r) => (
        <line key={r.id} x1="160" y1="114" x2={r.x} y2={r.y} stroke={r.c} strokeWidth={lit === r.id ? 2.4 : 0.6} strokeOpacity={lit === r.id ? 0.9 : 0.25} />
      ))}
      <circle cx="160" cy="114" r="14" fill="url(#ec-orb)" className="hx-pulse" />
      <circle cx="160" cy="114" r="24" fill="none" stroke="#c084fc" strokeOpacity="0.4" className="hx-pulse" />
      {RUNES.map((r) => {
        const on = lit === r.id;
        return (
          <Hit key={r.id} id={r.id} label={`Runa ${r.label}`} onTap={onTap}>
            <g transform={`translate(${r.x} ${r.y})`}>
              <g className="hx-rune" style={{ transform: on ? "scale(1.18)" : "scale(1)" }}>
                <circle r="34" fill="transparent" />
                {on && <circle r="38" fill={r.c} opacity="0.35" />}
                <circle r="23" fill={on ? r.c : "#120a2a"} fillOpacity={on ? 0.45 : 1} stroke={r.c} strokeWidth={on ? 3 : 1.6} strokeOpacity={on ? 1 : 0.7} />
                <circle r="19" fill="none" stroke={r.c} strokeOpacity="0.3" strokeWidth="0.8" />
                <Symbol id={r.id} c={r.c} />
              </g>
            </g>
          </Hit>
        );
      })}
    </Frame>
  );
}

export const SCENES: Record<string, (p: SceneProps) => ReactNode> = {
  soglia: Soglia,
  biblioteca: Biblioteca,
  giardino: Giardino,
  torre: Torre,
  eco: Eco,
};
