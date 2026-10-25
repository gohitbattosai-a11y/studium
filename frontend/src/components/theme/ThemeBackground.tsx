import { useEffect, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { BackgroundId } from "@/lib/theme";
import "./theme.css";

export type BackgroundId = "halloween" | "natale" | "biblioteca";

const PORTRAIT = "(max-aspect-ratio: 1/1)";

const subscribePortrait = (notify: () => void) => {
  const query = window.matchMedia(PORTRAIT);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

const usePortrait = () => useSyncExternalStore(subscribePortrait, () => window.matchMedia(PORTRAIT).matches, () => false);

const rng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
};

const rand = rng(20261023);

const STARS = Array.from({ length: 70 }, () => ({
  x: rand() * 1600,
  y: rand() * 430,
  r: 0.7 + rand() * 1.5,
  d: rand() * 4,
  t: 2 + rand() * 3,
}));

const EMBERS = Array.from({ length: 26 }, () => ({
  left: rand() * 100,
  size: 2 + rand() * 3,
  dur: 9 + rand() * 8,
  delay: -rand() * 17,
  sway: (rand() - 0.5) * 120,
}));

const SNOW_FAR = Array.from({ length: 40 }, () => ({
  left: rand() * 100,
  size: 2 + rand() * 2,
  dur: 14 + rand() * 10,
  delay: -rand() * 24,
  sway: (rand() - 0.5) * 80,
  op: 0.45 + rand() * 0.3,
}));

const SNOW_NEAR = Array.from({ length: 22 }, () => ({
  left: rand() * 100,
  size: 4 + rand() * 4,
  dur: 8 + rand() * 5,
  delay: -rand() * 13,
  sway: (rand() - 0.5) * 140,
  op: 0.75 + rand() * 0.2,
}));

const DUST = Array.from({ length: 25 }, () => ({
  left: 55 + rand() * 35,
  top: 40 + rand() * 30,
  size: 1.5 + rand() * 2,
  dur: 4 + rand() * 3,
  delay: -rand() * 5,
}));

const BAT = "M0 -4 C-6 -14 -18 -16 -30 -8 C-24 -8 -20 -4 -18 2 C-14 -2 -10 -1 -8 4 C-5 1 -2 2 0 8 C2 2 5 1 8 4 C10 -1 14 -2 18 2 C20 -4 24 -8 30 -8 C18 -16 6 -14 0 -4 Z";

const LIGHT_COLORS = ["#ff5a5a", "#ffd36b", "#6bd0ff", "#9dff8a"];

const along = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    const u = 1 - t;
    return { x: u * u * x0 + 2 * u * t * cx + t * t * x1, y: u * u * y0 + 2 * u * t * cy + t * t * y1 };
  });

const GARLANDS: [number, number, number, number, number, number, number][] = [
  [-87, -70, 0, -2, 87, -70, 7],
  [-65, -170, 0, -106, 65, -170, 6],
  [-51, -262, 0, -206, 51, -262, 5],
  [-38, -340, 0, -296, 38, -340, 4],
];

const LIGHTS = GARLANDS.flatMap((g) => along(...g)).map((p, i) => ({ ...p, color: LIGHT_COLORS[i % 4], dur: 1.2 + (i % 3) * 0.5, delay: (i % 5) * 0.3 }));

const BAUBLES: [number, number, string][] = [
  [-72, -48, "#e5484d"],
  [70, -46, "#4aa8ff"],
  [0, -92, "#ffd36b"],
  [-40, -132, "#c77dff"],
  [44, -128, "#e5484d"],
  [-30, -200, "#4aa8ff"],
  [22, -214, "#ffd36b"],
  [-20, -290, "#e5484d"],
  [18, -300, "#9dff8a"],
];

const starPoints = (r1: number, r2: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? r1 : r2;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");

function Layer({ depth = 0, children }: { depth?: number; children: ReactNode }) {
  return (
    <div className="bgx-layer" style={{ "--depth": depth } as CSSProperties}>
      {children}
    </div>
  );
}

function Svg({ children, sky = false }: { children: ReactNode; sky?: boolean }) {
  const portrait = usePortrait();
  if (!portrait) {
    return (
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden>
        {children}
      </svg>
    );
  }
  return (
    <svg viewBox={sky ? "400 -150 800 1050" : "400 0 800 1000"} preserveAspectRatio={sky ? "xMidYMin meet" : "xMidYMax meet"} aria-hidden>
      {children}
    </svg>
  );
}

function Stars() {
  return (
    <Svg sky>
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" className="bgx-twinkle" style={{ animationDelay: `${s.d}s`, animationDuration: `${s.t}s` }} />
      ))}
    </Svg>
  );
}

function Vignette() {
  return (
    <div
      className="bgx-fill"
      style={{ background: "linear-gradient(180deg, rgba(13,17,23,0.5) 0%, rgba(13,17,23,0) 30%, rgba(13,17,23,0) 68%, rgba(13,17,23,0.6) 100%)" }}
    />
  );
}

function Pumpkin({ x, y, s, face = false, delay = 0 }: { x: number; y: number; s: number; face?: boolean; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="86" rx="125" ry="14" fill="#000000" opacity="0.45" />
      <ellipse cx="-72" cy="6" rx="36" ry="62" fill="url(#hw-pk-side)" />
      <ellipse cx="72" cy="6" rx="36" ry="62" fill="url(#hw-pk-side)" />
      <ellipse cx="-42" cy="4" rx="50" ry="76" fill="url(#hw-pk)" />
      <ellipse cx="42" cy="4" rx="50" ry="76" fill="url(#hw-pk)" />
      <ellipse cx="0" cy="2" rx="48" ry="80" fill="url(#hw-pk)" />
      <g fill="none" stroke="#7a2a03" strokeWidth="3" opacity="0.45" strokeLinecap="round">
        <path d="M-24 -70 C-34 -20 -34 30 -24 74" />
        <path d="M24 -70 C34 -20 34 30 24 74" />
        <path d="M-62 -52 C-76 -10 -76 30 -62 62" />
        <path d="M62 -52 C76 -10 76 30 62 62" />
      </g>
      <path d="M-9 -74 C-12 -100 -2 -110 12 -116 L18 -102 C9 -98 7 -88 9 -74 Z" fill="#4a3a14" />
      <path d="M12 -112 C34 -120 42 -104 30 -96" fill="none" stroke="#5f8f2e" strokeWidth="4" strokeLinecap="round" />
      {face && (
        <g className="bgx-flicker" style={{ animationDelay: `${delay}s` }} filter="url(#hw-glow)" fill="#ffe27a">
          <path d="M-40 -22 L-14 -22 L-27 -46 Z" />
          <path d="M14 -22 L40 -22 L27 -46 Z" />
          <path d="M-6 -6 L6 -6 L0 -19 Z" />
          <path d="M-46 14 L-31 8 L-19 20 L-6 10 L6 10 L19 20 L31 8 L46 14 C42 40 22 54 0 54 C-22 54 -42 40 -46 14 Z" />
        </g>
      )}
    </g>
  );
}

function DeadTree({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke="#07030d" strokeLinecap="round">
      <path d="M0 0 C-8 -70 10 -130 0 -200" strokeWidth="16" />
      <path d="M2 -110 C-30 -140 -60 -150 -90 -190" strokeWidth="8" />
      <path d="M-40 -140 C-50 -170 -45 -190 -60 -215" strokeWidth="5" />
      <path d="M4 -150 C30 -180 60 -190 85 -235" strokeWidth="8" />
      <path d="M50 -185 C70 -190 90 -185 110 -200" strokeWidth="4" />
      <path d="M0 -200 C-6 -230 4 -250 -4 -275" strokeWidth="6" />
    </g>
  );
}

function Tomb({ x, y, s, cross = false }: { x: number; y: number; s: number; cross?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#241240" stroke="#4a2a78" strokeWidth="2">
      {cross ? (
        <>
          <rect x="-5" y="-58" width="10" height="58" />
          <rect x="-18" y="-44" width="36" height="9" />
        </>
      ) : (
        <path d="M-17 0 L-17 -36 Q-17 -54 0 -54 Q17 -54 17 -36 L17 0 Z" />
      )}
    </g>
  );
}

function Bat({ y, s, dur, delay }: { y: number; s: number; dur: number; delay: number }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <g className="bgx-fly" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        <g transform={`scale(${s})`}>
          <path className="bgx-flap" d={BAT} fill="#07030d" />
        </g>
      </g>
    </g>
  );
}

function HauntedHouse({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="#0a0414" stroke="#2a1245" strokeWidth="2">
      <rect x="-95" y="-120" width="190" height="125" />
      <path d="M-112 -118 L0 -196 L112 -118 Z" />
      <rect x="62" y="-205" width="54" height="210" />
      <path d="M54 -203 L89 -285 L124 -203 Z" />
      <rect x="-66" y="-180" width="20" height="60" />
      <g className="bgx-flicker" fill="#ffb23a" stroke="none" filter="url(#hw-glow)">
        <rect x="-66" y="-92" width="28" height="38" />
        <rect x="-12" y="-92" width="28" height="38" style={{ animationDelay: "0.8s" }} />
        <rect x="72" y="-165" width="22" height="32" />
        <rect x="72" y="-100" width="22" height="30" />
      </g>
      <path d="M34 5 L34 -30 Q34 -48 49 -48 Q64 -48 64 -30 L64 5 Z" fill="#1a0a0a" stroke="none" />
    </g>
  );
}

function HalloweenScene() {
  return (
    <>
      <div
        className="bgx-fill"
        style={{
          background:
            "radial-gradient(ellipse 80% 45% at 50% 100%, rgba(190,80,20,0.55), rgba(190,80,20,0) 70%), linear-gradient(180deg, #0e0520 0%, #26104a 55%, #4a1a52 100%)",
        }}
      />
      <Layer depth={2}>
        <Stars />
      </Layer>
      <Layer depth={5}>
        <Svg sky>
          <defs>
            <radialGradient id="hw-moon" cx="0.4" cy="0.38" r="0.7">
              <stop offset="0" stopColor="#fff4cf" />
              <stop offset="0.6" stopColor="#ffcf7a" />
              <stop offset="1" stopColor="#e9954a" />
            </radialGradient>
            <radialGradient id="hw-moonglow">
              <stop offset="0" stopColor="#ffb347" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="hw-text" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffd27a" />
              <stop offset="1" stopColor="#ff7a1a" />
            </linearGradient>
          </defs>
          <circle cx="800" cy="400" r="330" fill="url(#hw-moonglow)" />
          <circle cx="800" cy="400" r="118" fill="url(#hw-moon)" />
          <g fill="#e9954a" opacity="0.35">
            <circle cx="765" cy="370" r="22" />
            <circle cx="835" cy="425" r="30" />
            <circle cx="780" cy="450" r="12" />
            <circle cx="850" cy="355" r="10" />
          </g>
          <g className="bgx-bob" fontFamily="Chiller, Creepster, Georgia, serif" textAnchor="middle">
            <text x="800" y="122" fontSize="40" fontStyle="italic" fill="#ffb347" letterSpacing="8">
              Happy
            </text>
            <g className="bgx-flicker" filter="url(#hw-glow)">
              <text
                x="800"
                y="210"
                fontSize="104"
                fontWeight="800"
                fill="url(#hw-text)"
                stroke="#3b0f00"
                strokeWidth="3"
                paintOrder="stroke"
                textLength="480"
                lengthAdjust="spacingAndGlyphs"
              >
                Halloween
              </text>
            </g>
            <text x="800" y="252" fontSize="26" fill="#d9b8ff" opacity="0.9" letterSpacing="4">
              dolcetto o scherzetto?
            </text>
          </g>
        </Svg>
      </Layer>
      <Layer depth={8}>
        <Svg sky>
          <g className="bgx-drift" style={{ animationDuration: "38s" }}>
            <ellipse cx="640" cy="360" rx="240" ry="22" fill="#1d0c35" opacity="0.75" />
            <ellipse cx="720" cy="346" rx="150" ry="18" fill="#1d0c35" opacity="0.75" />
          </g>
          <g className="bgx-drift" style={{ animationDuration: "52s", animationDirection: "alternate-reverse" }}>
            <ellipse cx="1000" cy="440" rx="260" ry="24" fill="#1d0c35" opacity="0.7" />
            <ellipse cx="1080" cy="426" rx="150" ry="16" fill="#1d0c35" opacity="0.7" />
          </g>
        </Svg>
      </Layer>
      <Layer depth={10}>
        <Svg>
          <defs>
            <linearGradient id="hw-hill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1b0b2c" />
              <stop offset="1" stopColor="#0c0516" />
            </linearGradient>
            <filter id="hw-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d="M0 690 C220 640 420 650 620 676 C820 702 1000 650 1240 648 C1400 646 1500 676 1600 664 L1600 1100 L0 1100 Z" fill="url(#hw-hill)" />
          <HauntedHouse x={640} y={690} />
        </Svg>
      </Layer>
      <Layer depth={14}>
        <Svg>
          <path d="M0 760 C300 730 600 770 900 750 C1200 730 1400 760 1600 745 L1600 1100 L0 1100 Z" fill="#0f0719" />
          <DeadTree x={250} y={772} s={1.2} />
          <DeadTree x={1390} y={762} s={1.3} />
          <DeadTree x={975} y={752} s={0.85} />
          <DeadTree x={470} y={758} s={0.65} />
          <Tomb x={1070} y={776} s={0.9} />
          <Tomb x={1130} y={784} s={0.75} cross />
          <Tomb x={560} y={782} s={0.85} cross />
          <Tomb x={400} y={776} s={0.8} />
          <Tomb x={1250} y={774} s={1} />
          <Tomb x={150} y={790} s={0.9} cross />
          <Tomb x={1500} y={786} s={0.85} />
        </Svg>
      </Layer>
      <Layer depth={18}>
        <Svg>
          <defs>
            <radialGradient id="hw-fog">
              <stop offset="0" stopColor="#c9b3ff" stopOpacity="0.3" />
              <stop offset="1" stopColor="#c9b3ff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="bgx-drift" style={{ animationDuration: "30s" }}>
            <ellipse cx="500" cy="770" rx="420" ry="70" fill="url(#hw-fog)" />
          </g>
          <g className="bgx-drift" style={{ animationDuration: "40s", animationDirection: "alternate-reverse" }}>
            <ellipse cx="1100" cy="790" rx="460" ry="80" fill="url(#hw-fog)" />
          </g>
          <g className="bgx-drift" style={{ animationDuration: "55s" }}>
            <ellipse cx="800" cy="730" rx="520" ry="60" fill="url(#hw-fog)" />
          </g>
        </Svg>
      </Layer>
      <Layer depth={22}>
        <Svg sky>
          <Bat y={120} s={1.3} dur={16} delay={-3} />
          <Bat y={210} s={0.9} dur={22} delay={-9} />
          <Bat y={310} s={1.1} dur={13} delay={-1} />
          <Bat y={440} s={0.7} dur={28} delay={-14} />
          <Bat y={180} s={0.8} dur={19} delay={-12} />
        </Svg>
      </Layer>
      <Layer depth={28}>
        <Svg>
          <defs>
            <radialGradient id="hw-pk" cx="0.35" cy="0.3" r="0.85">
              <stop offset="0" stopColor="#ffb347" />
              <stop offset="0.45" stopColor="#f4731a" />
              <stop offset="1" stopColor="#b53d06" />
            </radialGradient>
            <radialGradient id="hw-pk-side" cx="0.35" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#e8620f" />
              <stop offset="1" stopColor="#8f2c04" />
            </radialGradient>
            <radialGradient id="hw-ground-glow">
              <stop offset="0" stopColor="#ff8a1f" stopOpacity="0.5" />
              <stop offset="1" stopColor="#ff8a1f" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse className="bgx-flicker" cx="800" cy="800" rx="340" ry="110" fill="url(#hw-ground-glow)" />
          <Pumpkin x={330} y={808} s={0.7} />
          <Pumpkin x={1250} y={800} s={0.8} face delay={1.2} />
          <Pumpkin x={985} y={812} s={0.62} />
          <Pumpkin x={615} y={815} s={0.55} face delay={0.6} />
          <Pumpkin x={800} y={770} s={1} face />
        </Svg>
      </Layer>
      <Layer depth={32}>
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="bgx-ember"
            style={{ left: `${e.left}%`, width: e.size, height: e.size, animationDuration: `${e.dur}s`, animationDelay: `${e.delay}s`, "--sway": `${e.sway}px` } as CSSProperties}
          />
        ))}
      </Layer>
      <Vignette />
    </>
  );
}

function Pine({ x, y, s }: { x: number; y: number; s: number }) {
  const tiers: [number, number, number][] = [
    [46, -70, 0],
    [38, -104, -38],
    [28, -138, -78],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-6" y="-4" width="12" height="26" fill="#3b2a1e" />
      {tiers.map(([hw, top, bot], i) => {
        const y1 = top + 0.45 * (bot - top);
        const w2 = hw * 0.45;
        return (
          <g key={i}>
            <path d={`M${-hw} ${bot} L0 ${top} L${hw} ${bot} Z`} fill="#0f3d2e" />
            <path d={`M0 ${top} L${-w2} ${y1} L${-w2 / 2} ${y1 - 4} L0 ${y1 + 5} L${w2 / 2} ${y1 - 4} L${w2} ${y1} Z`} fill="#eef6ff" />
          </g>
        );
      })}
    </g>
  );
}

function Gift({ x, y, w, h, color, ribbon }: { x: number; y: number; w: number; h: number; color: string; ribbon: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={color} />
      <rect x={x + w / 2 - 4} y={y} width="8" height={h} fill={ribbon} />
      <rect x={x} y={y + h / 2 - 4} width={w} height="8" fill={ribbon} />
      <ellipse cx={x + w / 2 - 8} cy={y - 4} rx="9" ry="6" fill={ribbon} />
      <ellipse cx={x + w / 2 + 8} cy={y - 4} rx="9" ry="6" fill={ribbon} />
    </g>
  );
}

function Cabin({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="8" rx="130" ry="18" fill="url(#xm-warm)" />
      <rect x="30" y="-118" width="18" height="46" fill="#6b4a3a" />
      {[0, 1.6, 3.2].map((d, i) => (
        <circle key={i} className="bgx-smoke" cx="39" cy="-124" r="9" fill="#dbe7f5" style={{ animationDelay: `${d}s` }} />
      ))}
      <rect x="-70" y="-70" width="140" height="70" fill="#5b3a24" />
      <path d="M-86 -66 L0 -122 L86 -66 L70 -64 L50 -72 L30 -62 L0 -74 L-30 -62 L-50 -72 L-70 -64 Z" fill="#f2f8ff" />
      <rect x="-90" y="-66" width="180" height="5" fill="#3a2416" />
      <g className="bgx-flicker" fill="#ffc857" filter="url(#xm-glow)">
        <rect x="-52" y="-50" width="30" height="26" />
        <rect x="22" y="-50" width="30" height="26" />
      </g>
      <rect x="-10" y="-34" width="20" height="34" fill="#3a2416" />
    </g>
  );
}

function ChristmasScene() {
  return (
    <>
      <div className="bgx-fill" style={{ background: "linear-gradient(180deg, #050d24 0%, #0e2a5a 55%, #2d6a97 100%)" }} />
      <Layer depth={2}>
        <Stars />
      </Layer>
      <Layer depth={3}>
        <Svg sky>
          <defs>
            <radialGradient id="xm-aur1">
              <stop offset="0" stopColor="#4cffb0" stopOpacity="0.35" />
              <stop offset="1" stopColor="#4cffb0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="xm-aur2">
              <stop offset="0" stopColor="#8a7cff" stopOpacity="0.3" />
              <stop offset="1" stopColor="#8a7cff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="bgx-aurora">
            <ellipse cx="800" cy="300" rx="640" ry="110" fill="url(#xm-aur1)" />
          </g>
          <g className="bgx-aurora" style={{ animationDelay: "-8s" }}>
            <ellipse cx="900" cy="360" rx="560" ry="90" fill="url(#xm-aur2)" />
          </g>
          <g transform="translate(560 90)">
            <g className="bgx-shoot">
              <line x1="0" y1="0" x2="-90" y2="-43" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>
        </Svg>
      </Layer>
      <Layer depth={5}>
        <Svg sky>
          <defs>
            <linearGradient id="xm-text" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#a9d4ff" />
            </linearGradient>
            <radialGradient id="xm-moonglow">
              <stop offset="0" stopColor="#cfe6ff" stopOpacity="0.5" />
              <stop offset="1" stopColor="#cfe6ff" stopOpacity="0" />
            </radialGradient>
            <filter id="xm-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="1330" cy="220" r="170" fill="url(#xm-moonglow)" />
          <circle cx="1330" cy="220" r="58" fill="#eaf4ff" />
          <circle cx="1350" cy="205" r="14" fill="#cfe0f2" opacity="0.7" />
          <g className="bgx-bob" textAnchor="middle" fontFamily="'Brush Script MT', 'Segoe Script', Georgia, serif" fontStyle="italic">
            <g filter="url(#xm-glow)">
              <text x="800" y="200" fontSize="120" fill="url(#xm-text)" textLength="500" lengthAdjust="spacingAndGlyphs">
                Buon Natale
              </text>
            </g>
            <text x="800" y="248" fontSize="28" fill="#cfe6ff" letterSpacing="3" fontStyle="normal">
              tanti auguri dalla classe
            </text>
          </g>
        </Svg>
      </Layer>
      <Layer depth={8}>
        <Svg>
          <defs>
            <linearGradient id="xm-mount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a5f93" />
              <stop offset="1" stopColor="#1a2f55" />
            </linearGradient>
          </defs>
          <path d="M0 640 L180 470 L300 560 L470 400 L640 580 L760 500 L900 600 L1100 430 L1290 590 L1420 500 L1600 620 L1600 1100 L0 1100 Z" fill="url(#xm-mount)" />
          {[
            [180, 470],
            [470, 400],
            [760, 500],
            [1100, 430],
            [1420, 500],
          ].map(([px, py]) => (
            <path key={px} d={`M${px} ${py} L${px - 30} ${py + 24} L${px - 14} ${py + 20} L${px} ${py + 34} L${px + 14} ${py + 21} L${px + 30} ${py + 26} Z`} fill="#e9f3ff" />
          ))}
        </Svg>
      </Layer>
      <Layer depth={12}>
        <Svg>
          <defs>
            <linearGradient id="xm-hill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e4f0ff" />
              <stop offset="1" stopColor="#9fbfe3" />
            </linearGradient>
            <radialGradient id="xm-warm">
              <stop offset="0" stopColor="#ffc857" stopOpacity="0.5" />
              <stop offset="1" stopColor="#ffc857" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M0 700 C260 650 520 690 800 680 C1100 670 1350 640 1600 690 L1600 1100 L0 1100 Z" fill="url(#xm-hill)" />
          <Pine x={120} y={700} s={1.1} />
          <Pine x={250} y={712} s={0.8} />
          <Pine x={430} y={704} s={0.7} />
          <Pine x={1180} y={684} s={0.75} />
          <Pine x={1330} y={680} s={1.2} />
          <Pine x={1470} y={700} s={0.9} />
          <Pine x={1550} y={712} s={0.7} />
          <Cabin x={640} y={712} />
        </Svg>
      </Layer>
      <Layer depth={22}>
        <Svg>
          <defs>
            <linearGradient id="xm-pine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#25885a" />
              <stop offset="1" stopColor="#0d3f2a" />
            </linearGradient>
          </defs>
          <g transform="translate(880 800)">
            <ellipse cx="0" cy="10" rx="190" ry="22" fill="#000000" opacity="0.18" />
            <rect x="-14" y="-40" width="28" height="52" fill="#4a2e1c" />
            {(
              [
                [135, -150, -26],
                [112, -250, -112],
                [88, -340, -206],
                [62, -410, -296],
              ] as [number, number, number][]
            ).map(([hw, top, bot], i) => (
              <path key={i} d={`M${-hw} ${bot} L0 ${top} L${hw} ${bot} Z`} fill="url(#xm-pine)" stroke="#0a2a1d" strokeWidth="2" strokeLinejoin="round" />
            ))}
            <g fill="none" stroke="#ffd36b" strokeWidth="4" strokeLinecap="round" opacity="0.9">
              <path d="M-87 -70 Q0 -2 87 -70" />
              <path d="M-65 -170 Q0 -106 65 -170" />
              <path d="M-51 -262 Q0 -206 51 -262" />
              <path d="M-38 -340 Q0 -296 38 -340" />
            </g>
            {LIGHTS.map((l, i) => (
              <g key={i} className="bgx-blink" style={{ animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s` }}>
                <circle cx={l.x} cy={l.y} r="10" fill={l.color} opacity="0.35" />
                <circle cx={l.x} cy={l.y} r="5" fill={l.color} />
              </g>
            ))}
            {BAUBLES.map(([bx, by, color], i) => (
              <g key={i}>
                <circle cx={bx} cy={by} r="9" fill={color} />
                <circle cx={bx - 3} cy={by - 3} r="2.5" fill="#ffffff" opacity="0.75" />
              </g>
            ))}
            <circle cx="0" cy="-424" r="46" fill="#ffd84a" opacity="0.25" />
            <polygon className="bgx-pulse" points={starPoints(26, 11)} transform="translate(0 -424)" fill="#ffd84a" filter="url(#xm-glow)" />
            <Gift x={-140} y={-6} w={62} h={46} color="#e5484d" ribbon="#ffd36b" />
            <Gift x={76} y={0} w={52} h={40} color="#4aa8ff" ribbon="#ffffff" />
            <Gift x={-66} y={12} w={42} h={30} color="#9a5bd6" ribbon="#ffd36b" />
          </g>
        </Svg>
      </Layer>
      <Layer depth={26}>
        <Svg>
          <path d="M0 850 C300 820 600 860 900 840 C1200 820 1400 850 1600 835 L1600 1100 L0 1100 Z" fill="#f4f9ff" />
        </Svg>
      </Layer>
      <Layer depth={14}>
        {SNOW_FAR.map((f, i) => (
          <span key={i} className="bgx-flake" style={{ left: `${f.left}%`, width: f.size, height: f.size, opacity: f.op, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`, "--sway": `${f.sway}px` } as CSSProperties} />
        ))}
      </Layer>
      <Layer depth={34}>
        {SNOW_NEAR.map((f, i) => (
          <span key={i} className="bgx-flake" style={{ left: `${f.left}%`, width: f.size, height: f.size, opacity: f.op, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`, "--sway": `${f.sway}px`, filter: "blur(0.6px)" } as CSSProperties} />
        ))}
      </Layer>
      <Vignette />
    </>
  );
}

function LibraryScene() {
  return (
    <>
      <div className="bgx-fill" style={{ background: "linear-gradient(180deg, #090612 0%, #171126 50%, #201732 100%)" }} />
      
      <Layer depth={2}>
        <Stars />
      </Layer>

      <Layer depth={5}>
        <Svg sky>
          <rect x="550" y="50" width="420" height="550" fill="#120c1f" stroke="#251a38" strokeWidth="2" />
          {Array.from({ length: 3 }).map((_, r) => (
            <g key={r} transform={`translate(550, ${150 + r * 140})`}>
              <rect x="0" y="0" width="420" height="12" fill="#1f1630" />
              {Array.from({ length: 12 }).map((__, b) => {
                const bw = 18 + ((b * 7) % 15);
                const bh = 70 + ((b * 13) % 40);
                const bx = 15 + b * 33;
                const colors = ["#2d2242", "#3a2a52", "#241b36", "#45325c", "#1d152b"];
                return <rect key={b} x={bx} y={12 - bh} width={bw} height={bh} fill={colors[b % colors.length]} rx="2" />;
              })}
            </g>
          ))}
        </Svg>
      </Layer>

      <Layer depth={12}>
        <Svg>
          <defs>
            <radialGradient id="lib-lamp-glow" cx="0.5" cy="0.3" r="0.7">
              <stop offset="0" stopColor="#ffda73" stopOpacity="0.7" />
              <stop offset="0.5" stopColor="#ffb347" stopOpacity="0.3" />
              <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="760" cy="350" rx="220" ry="180" fill="url(#lib-lamp-glow)" className="bgx-flicker" />
          
          <path d="M450 680 L1150 640 L1250 900 L350 900 Z" fill="#181026" />
          <path d="M420 660 L1200 660 L1240 700 L380 700 Z" fill="#2d1e3e" />
          
          <g transform="translate(730 550)">
            <ellipse cx="0" cy="115" rx="35" ry="10" fill="#0d0814" />
            <path d="M-12 110 C-12 70 15 60 15 25 C15 5 -10 -5 -10 -25 L10 -25 C10 -10 25 0 25 30 C25 65 -5 75 -5 110 Z" fill="#26222b" />
            <path d="M-22 -28 L22 -28 L15 -45 L-15 -45 Z" fill="#1c1920" />
            <path d="M-35 -45 L35 -45 L20 -70 L-20 -70 Z" fill="#ffda73" className="bgx-flicker" />
          </g>

          <g transform="translate(480 620)">
            <rect x="0" y="0" width="160" height="25" fill="#251a38" rx="3" />
            <rect x="5" y="-22" width="150" height="24" fill="#322247" rx="3" />
            <rect x="10" y="-40" width="140" height="20" fill="#1c142b" rx="2" />
          </g>

          <g transform="translate(980 600)">
            <rect x="0" y="0" width="150" height="22" fill="#251a38" rx="2" />
            <rect x="8" y="-18" width="134" height="20" fill="#3b2b52" rx="2" />
          </g>
        </Svg>
      </Layer>

      <Layer depth={20}>
        {DUST.map((d, i) => (
          <span 
            key={i} 
            className="bgx-ember" 
            style={{ 
              left: `${d.left}%`, 
              top: `${d.top}%`, 
              width: d.size, 
              height: d.size, 
              animationDuration: `${d.dur}s`, 
              animationDelay: `${d.delay}s`, 
              "--sway": "30px" 
            } as CSSProperties} 
          />
        ))}
      </Layer>

      <Vignette />
    </>
  );
}

export function BackgroundPreview({ id }: { id: BackgroundId }) {
  return (
    <div className="bgx-fill">
      {id === "halloween" ? <HalloweenScene /> : id === "natale" ? <ChristmasScene /> : id === "biblioteca" ? <LibraryScene /> : null}
    </div>
  );
}

export default function ThemeBackground({ id }: { id: BackgroundId }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || id === "none") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--px", String((e.clientX / window.innerWidth - 0.5) * -2));
        el.style.setProperty("--py", String((e.clientY / window.innerHeight - 0.5) * -2));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [id]);

  if (id === "none") return null;

  return (
    <div ref={ref} className="bgx" aria-hidden>
      {id === "halloween" ? <HalloweenScene /> : id === "natale" ? <ChristmasScene /> : <LibraryScene />}
    </div>
  );
}
