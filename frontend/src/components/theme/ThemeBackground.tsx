import { useEffect, useId, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { BackgroundId } from "@/lib/theme";
import "./theme.css";

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

const BUBBLES = Array.from({ length: 26 }, () => ({
  left: rand() * 100,
  size: 4 + rand() * 12,
  dur: 10 + rand() * 9,
  delay: -rand() * 19,
  sway: (rand() - 0.5) * 90,
}));

const PETALS = Array.from({ length: 34 }, () => ({
  left: rand() * 100,
  size: 6 + rand() * 7,
  dur: 11 + rand() * 9,
  delay: -rand() * 20,
  sway: 40 + rand() * 120,
  op: 0.6 + rand() * 0.35,
}));

const FIREFLIES = Array.from({ length: 30 }, () => ({
  left: rand() * 100,
  top: 35 + rand() * 55,
  size: 2 + rand() * 2.5,
  dur: 4 + rand() * 4,
  delay: -rand() * 8,
  sway: (rand() - 0.5) * 70,
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
            className="bgx-dust" 
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

function SpaceScene() {
  return (
    <>
      <div className="bgx-fill" style={{ background: "linear-gradient(180deg, #04010d 0%, #0a0a2b 55%, #1b0c3d 100%)" }} />
      <Layer depth={2}>
        <Stars />
      </Layer>
      <Layer depth={4}>
        <Svg sky>
          <defs>
            <radialGradient id="sp-neb1" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#a855f7" stopOpacity="0.5" />
              <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sp-neb2" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="520" cy="260" rx="460" ry="220" fill="url(#sp-neb1)" className="bgx-aurora" />
          <ellipse cx="1180" cy="520" rx="420" ry="200" fill="url(#sp-neb2)" className="bgx-aurora" style={{ animationDelay: "-6s" }} />
        </Svg>
      </Layer>
      <Layer depth={10}>
        <Svg>
          <defs>
            <radialGradient id="sp-planet" cx="0.32" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#fdba74" />
              <stop offset="0.55" stopColor="#c2410c" />
              <stop offset="1" stopColor="#431407" />
            </radialGradient>
            <radialGradient id="sp-moon" cx="0.35" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#e2e8f0" />
              <stop offset="1" stopColor="#475569" />
            </radialGradient>
          </defs>
          <g className="bgx-bob">
            <circle cx="1180" cy="300" r="120" fill="url(#sp-planet)" />
            <ellipse cx="1180" cy="300" rx="215" ry="38" fill="none" stroke="#fde68a" strokeWidth="6" opacity="0.55" transform="rotate(-18 1180 300)" />
          </g>
          <g className="bgx-bob" style={{ animationDelay: "-3s" }}>
            <circle cx="330" cy="620" r="44" fill="url(#sp-moon)" />
            <circle cx="318" cy="610" r="9" fill="#334155" opacity="0.6" />
            <circle cx="346" cy="636" r="6" fill="#334155" opacity="0.6" />
          </g>
          <g className="bgx-shoot">
            <line x1="300" y1="120" x2="230" y2="85" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g className="bgx-shoot" style={{ animationDelay: "-5s" }}>
            <line x1="900" y1="60" x2="830" y2="25" stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </Svg>
      </Layer>
      <Vignette />
    </>
  );
}

const orand = rng(4242);

const ribbonCache = new Map<string, string>();

const ribbon = (h: number, amp: number, waves: number, w: number, phase = 0) => {
  const key = `${h}|${amp}|${waves}|${w}|${phase}`;
  const cached = ribbonCache.get(key);
  if (cached) return cached;
  const n = 22;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const cx = Math.sin(t * Math.PI * 2 * waves + phase) * amp * (0.3 + t);
    const half = (w / 2) * (1 - t * 0.72);
    const y = -h * t;
    left.push(`${(cx - half).toFixed(1)} ${y.toFixed(1)}`);
    right.push(`${(cx + half).toFixed(1)} ${y.toFixed(1)}`);
  }
  const d = `M${left.join(" L")} L${right.reverse().join(" L")} Z`;
  ribbonCache.set(key, d);
  return d;
};

const branchPaths = (len: number, depth: number, spread: number) => {
  const levels: string[][] = Array.from({ length: depth }, () => []);
  const tips: [number, number][] = [];
  const walk = (x: number, y: number, a: number, l: number, d: number) => {
    const x2 = x + Math.sin(a) * l;
    const y2 = y - Math.cos(a) * l;
    levels[d].push(`M${x.toFixed(1)} ${y.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`);
    if (d + 1 < depth) {
      walk(x2, y2, a - spread, l * 0.74, d + 1);
      walk(x2, y2, a + spread * 0.9, l * 0.72, d + 1);
      if (d % 2 === 0) walk(x2, y2, a + 0.04, l * 0.66, d + 1);
    } else {
      tips.push([x2, y2]);
    }
  };
  walk(0, 0, 0, len, 0);
  return { levels: levels.map((l) => l.join(" ")), tips };
};

const CORAL_BIG = branchPaths(66, 5, 0.5);
const CORAL_MID = branchPaths(50, 4, 0.58);
const CORAL_SMALL = branchPaths(36, 4, 0.52);

const SCHOOL = Array.from({ length: 18 }, () => ({
  x: (orand() - 0.5) * 170,
  y: (orand() - 0.5) * 70,
  r: (orand() - 0.5) * 16,
  s: 0.8 + orand() * 0.35,
}));

const SEAGRASS = Array.from({ length: 26 }, (_, i) => ({
  x: 60 + i * 60 + (orand() - 0.5) * 30,
  h: 50 + orand() * 60,
  d: -orand() * 6,
  tone: orand() > 0.5 ? "#2f9e6e" : "#1f7a63",
}));

function Kelp({ x, y, h, s = 1, tones, delay = 0 }: { x: number; y: number; h: number; s?: number; tones: [string, string]; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="bgx-sway" style={{ animationDelay: `${delay}s` }}>
        <path d={ribbon(h, 16, 1.6, 16)} fill={tones[0]} />
        <path d={ribbon(h * 0.8, 20, 1.3, 12, 1.4)} fill={tones[1]} />
        <path d={ribbon(h * 0.6, 12, 2, 9, 2.6)} fill={tones[0]} opacity="0.85" />
      </g>
    </g>
  );
}

function BranchCoral({ x, y, s, data, color, tip, widths }: { x: number; y: number; s: number; data: { levels: string[]; tips: [number, number][] }; color: string; tip: string; widths: number[] }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {data.levels.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={widths[i]} strokeLinecap="round" />
      ))}
      {data.tips.map(([tx, ty], i) => (
        <circle key={i} cx={tx} cy={ty} r="2.4" fill={tip} />
      ))}
    </g>
  );
}

function SeaFan({ x, y, s, color, light }: { x: number; y: number; s: number; color: string; light: string }) {
  const rays = Array.from({ length: 15 }, (_, i) => -64 + i * 9.1);
  const arc = (r: number) => {
    const a = (64 * Math.PI) / 180;
    const sx = Math.sin(a) * r;
    const sy = -22 - Math.cos(a) * r;
    return `M${-sx.toFixed(1)} ${sy.toFixed(1)} A${r} ${r} 0 0 1 ${sx.toFixed(1)} ${sy.toFixed(1)}`;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-5 0 L-2 -22 L2 -22 L5 0 Z" fill={color} />
      {rays.map((a, i) => {
        const r = (a * Math.PI) / 180;
        return <line key={i} x1="0" y1="-22" x2={(Math.sin(r) * 84).toFixed(1)} y2={(-22 - Math.cos(r) * 84).toFixed(1)} stroke={color} strokeWidth="2" strokeLinecap="round" />;
      })}
      {[26, 44, 62, 80].map((r) => (
        <path key={r} d={arc(r)} fill="none" stroke={light} strokeWidth="1.1" opacity="0.8" />
      ))}
    </g>
  );
}

function BrainCoral({ x, y, s, k }: { x: number; y: number; s: number; k: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-50 2 C-52 -38 -24 -62 0 -62 C26 -62 52 -38 50 2 Z" fill={`url(#${k}brain)`} />
      <g fill="none" stroke="#9a3412" strokeWidth="2.6" strokeLinecap="round" opacity="0.5">
        <path d="M-36 -14 C-28 -26 -18 -16 -10 -30 S6 -42 12 -28 S28 -26 36 -14" />
        <path d="M-42 -28 C-34 -40 -24 -34 -16 -46 S2 -54 8 -44" />
        <path d="M-22 -8 C-14 -16 -6 -8 2 -18 S18 -16 24 -6" />
        <path d="M16 -50 C24 -48 30 -40 28 -34" />
      </g>
      <ellipse cx="-16" cy="-44" rx="14" ry="7" fill="#fed7aa" opacity="0.35" transform="rotate(-24 -16 -44)" />
    </g>
  );
}

function TubeSponges({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[
        [-22, 62, 15],
        [0, 88, 17],
        [24, 50, 14],
      ].map(([dx, h, w], i) => (
        <g key={i}>
          <rect x={dx - w / 2} y={-h} width={w} height={h} rx={w / 2.4} fill={i === 1 ? "#f59e0b" : "#eab308"} />
          <rect x={dx - w / 2 + 2} y={-h + 4} width="2.4" height={h - 8} rx="1.2" fill="#fde68a" opacity="0.6" />
          <ellipse cx={dx} cy={-h + 1} rx={w / 2 - 1.5} ry="3" fill="#78350f" />
        </g>
      ))}
    </g>
  );
}

function Anemone({ x, y, s, color, tip }: { x: number; y: number; s: number; color: string; tip: string }) {
  const arms = Array.from({ length: 17 }, (_, i) => -64 + i * 8);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-26 0 C-26 -16 -14 -22 0 -22 C14 -22 26 -16 26 0 Z" fill="#9d174d" />
      {arms.map((a, i) => {
        const r = (a * Math.PI) / 180;
        const ex = Math.sin(r) * 46;
        const ey = -18 - Math.cos(r) * 40;
        const cx = Math.sin(r) * 18 + (i % 2 ? 8 : -8);
        const cy = -22 - Math.cos(r) * 24;
        return (
          <g key={i}>
            <path d={`M${(Math.sin(r) * 14).toFixed(1)} -18 Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`} fill="none" stroke={color} strokeWidth="4.4" strokeLinecap="round" />
            <circle cx={ex.toFixed(1)} cy={ey.toFixed(1)} r="3.2" fill={tip} />
          </g>
        );
      })}
    </g>
  );
}

function Starfish({ x, y, s, color, rot = 0 }: { x: number; y: number; s: number; color: string; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <polygon points={starPoints(22, 9)} fill={color} stroke={color} strokeWidth="6" strokeLinejoin="round" />
      <g fill="#fed7aa" opacity="0.8">
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={(Math.sin((a * Math.PI) / 180) * 14).toFixed(1)} cy={(-Math.cos((a * Math.PI) / 180) * 14).toFixed(1)} r="1.6" />
        ))}
      </g>
    </g>
  );
}

function FishBody({ kind, k }: { kind: "tang" | "clown" | "butter"; k: string }) {
  if (kind === "clown") {
    return (
      <>
        <path d="M-17 0 L-33 -10 C-30 -3 -30 3 -33 10 Z" fill="#ea580c" stroke="#0b1220" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M-6 -11 C0 -19 10 -18 14 -9 Z" fill="#ea580c" stroke="#0b1220" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M-20 0 C-18 -11 -4 -14 8 -11 C16 -8 22 -3 23 0 C22 3 16 8 8 11 C-4 14 -18 11 -20 0 Z" fill={`url(#${k}clown)`} />
        <g clipPath={`url(#${k}clownclip)`}>
          <rect x="-17" y="-16" width="5" height="32" fill="#fff" stroke="#0b1220" strokeWidth="0.9" />
          <rect x="-2" y="-16" width="6" height="32" fill="#fff" stroke="#0b1220" strokeWidth="0.9" />
          <rect x="14" y="-16" width="4.5" height="32" fill="#fff" stroke="#0b1220" strokeWidth="0.9" />
        </g>
        <path d="M-20 0 C-18 -11 -4 -14 8 -11 C16 -8 22 -3 23 0 C22 3 16 8 8 11 C-4 14 -18 11 -20 0 Z" fill="none" stroke="#0b1220" strokeWidth="1.1" />
        <circle cx="13" cy="-2.4" r="2.6" fill="#fefce8" />
        <circle cx="13.6" cy="-2.4" r="1.4" fill="#0b1220" />
        <circle cx="14" cy="-3" r="0.5" fill="#fff" />
        <path d="M2 4 C6 9 11 8 12 5 C9 5 5 4 2 4 Z" fill="#fb923c" />
      </>
    );
  }
  if (kind === "butter") {
    return (
      <>
        <path d="M-17 0 L-30 -7 L-30 7 Z" fill="#fde047" stroke="#a16207" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M-14 -13 C-6 -26 12 -24 18 -10 Z" fill="#fde047" stroke="#a16207" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M-12 12 C-4 22 8 20 12 11 Z" fill="#fde047" stroke="#a16207" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M-19 0 C-18 -13 -4 -17 8 -15 C19 -12 24 -4 25 1 C23 8 16 14 6 15 C-6 16 -18 12 -19 0 Z" fill={`url(#${k}butter)`} stroke="#a16207" strokeWidth="0.9" />
        <path d="M13 -14 C16 -8 16 0 12 9" fill="none" stroke="#0b1220" strokeWidth="3.2" strokeLinecap="round" opacity="0.9" />
        <path d="M-8 -10 C-6 -2 -6 6 -10 11 M-2 -12 C0 -4 0 6 -3 13" fill="none" stroke="#ca8a04" strokeWidth="0.8" opacity="0.7" />
        <circle cx="16.5" cy="-3" r="2.2" fill="#fff" />
        <circle cx="17" cy="-3" r="1.2" fill="#0b1220" />
        <path d="M25 2 L31 3.6 L25 4.6 Z" fill="#facc15" stroke="#a16207" strokeWidth="0.6" />
      </>
    );
  }
  return (
    <>
      <path d="M-20 0 L-40 -14 C-35 -5 -35 5 -40 14 Z" fill="#facc15" />
      <path d="M-16 -10 C-8 -23 8 -21 16 -9 Z" fill="#1d4ed8" />
      <path d="M-14 9 C-6 19 6 17 10 9 Z" fill="#1d4ed8" />
      <path d="M-24 0 C-22 -13 -6 -17 8 -13 C18 -10 25 -4 28 0 C25 4 18 10 8 13 C-6 17 -22 13 -24 0 Z" fill={`url(#${k}tang)`} />
      <path d="M-8 -12 C4 -6 8 4 0 13" fill="none" stroke="#0b1220" strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
      <path d="M-18 -4 C-10 -8 0 -8 6 -4" fill="none" stroke="#93c5fd" strokeWidth="0.8" opacity="0.7" />
      <path d="M6 4 C12 10 18 9 20 5 C16 5 10 4 6 4 Z" fill="#facc15" />
      <circle cx="17" cy="-3" r="3.1" fill="#fefce8" />
      <circle cx="17.6" cy="-3" r="1.6" fill="#0b1220" />
      <circle cx="18.1" cy="-3.6" r="0.6" fill="#fff" />
      <path d="M25 3 C26 4 27 3 28 2" fill="none" stroke="#0b1220" strokeWidth="0.8" />
    </>
  );
}

function Fish({ y, s, dur, delay, kind, k }: { y: number; s: number; dur: number; delay: number; kind: "tang" | "clown" | "butter"; k: string }) {
  return (
    <g className="bgx-fly" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
      <g transform={`translate(0 ${y}) scale(${s})`}>
        <FishBody kind={kind} k={k} />
      </g>
    </g>
  );
}

function School({ y, s, dur, delay }: { y: number; s: number; dur: number; delay: number }) {
  return (
    <g className="bgx-fly" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
      <g transform={`translate(0 ${y}) scale(${s})`}>
        {SCHOOL.map((f, i) => (
          <g key={i} transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.r.toFixed(1)}) scale(${f.s.toFixed(2)})`}>
            <path d="M-8 0 L-15 -4 L-15 4 Z" fill="#8fcbe8" />
            <path d="M-9 0 C-6 -4.2 4 -4.2 9 0 C4 4.2 -6 4.2 -9 0 Z" fill="#d4f1ff" />
            <path d="M-6 -1.8 C-2 -3.2 3 -3.2 7 -1.5" fill="none" stroke="#6fb7dc" strokeWidth="1" />
            <circle cx="5.4" cy="-0.8" r="0.9" fill="#0b1220" />
          </g>
        ))}
      </g>
    </g>
  );
}

function Turtle({ y, s, dur, delay, k }: { y: number; s: number; dur: number; delay: number; k: string }) {
  return (
    <g className="bgx-fly" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
      <g transform={`translate(0 ${y}) scale(${s})`}>
        <path d="M-34 2 C-44 6 -50 12 -54 18 C-46 16 -40 12 -32 10 Z" fill="#3f8f5a" />
        <path d="M-14 8 C-20 20 -30 28 -42 32 C-30 34 -16 28 -6 12 Z" fill="#3f8f5a" />
        <path d="M-36 4 C-36 -22 -12 -36 12 -32 C30 -28 40 -12 38 4 C20 12 -16 12 -36 4 Z" fill={`url(#${k}shell)`} stroke="#14532d" strokeWidth="1.2" />
        <g fill="none" stroke="#14532d" strokeWidth="1.2" opacity="0.7" strokeLinejoin="round">
          <path d="M-14 -28 L-8 -10 L14 -8 L18 -29" />
          <path d="M-8 -10 L-24 0" />
          <path d="M14 -8 L30 -1" />
          <path d="M-8 -10 L-4 4 M14 -8 L12 5" />
        </g>
        <path d="M-35 4 C-18 12 20 12 38 4 C30 14 -26 14 -35 4 Z" fill="#fde68a" stroke="#a16207" strokeWidth="0.8" />
        <path d="M36 -6 C44 -10 52 -8 54 -2 C54 4 48 8 40 6 C37 5 36 0 36 -6 Z" fill="#4da36a" />
        <path d="M52 2 C54 3 55 2 56 0" fill="none" stroke="#14532d" strokeWidth="0.9" />
        <circle cx="49" cy="-3" r="1.8" fill="#fefce8" />
        <circle cx="49.4" cy="-3" r="0.9" fill="#0b1220" />
        <g className="bgx-paddle">
          <path d="M16 4 C30 8 44 22 52 40 C40 38 22 28 10 8 Z" fill="#4da36a" stroke="#14532d" strokeWidth="1" />
          <path d="M22 12 C30 18 38 26 44 34" fill="none" stroke="#14532d" strokeWidth="0.8" opacity="0.6" />
        </g>
      </g>
    </g>
  );
}

function Whale({ k }: { k: string }) {
  return (
    <g>
      <path d="M-250 -2 C-290 -20 -322 -46 -356 -42 C-338 -30 -328 -12 -320 4 C-328 20 -340 32 -358 46 C-322 48 -290 30 -250 10 Z" fill={`url(#${k}whale)`} />
      <path d="M-262 2 C-244 -48 -120 -80 40 -66 C140 -58 216 -32 256 6 C264 14 260 26 246 26 C200 28 150 24 102 42 C42 66 -40 74 -122 58 C-202 44 -252 24 -262 2 Z" fill={`url(#${k}whale)`} />
      <path d="M-40 62 C40 70 100 52 148 34 C170 28 220 28 246 26 C238 40 150 60 60 70 C0 74 -30 70 -40 62 Z" fill="#7cc3e0" opacity="0.5" />
      <g fill="none" stroke="#7cc3e0" strokeWidth="1.4" opacity="0.4">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path key={i} d={`M${60 + i * 24} ${40 - i * 1.5} C${70 + i * 24} ${52 + i} ${72 + i * 24} ${60 + i} ${66 + i * 24} ${66 + i}`} />
        ))}
      </g>
      <path d="M70 40 C100 72 150 98 200 100 C170 76 138 52 118 34 Z" fill={`url(#${k}whale)`} />
      <path d="M178 0 C184 2 190 2 196 0" fill="none" stroke="#04243a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="186" cy="2" r="1.8" fill="#04243a" />
      <path d="M-120 -64 C-110 -76 -96 -76 -88 -66 Z" fill={`url(#${k}whale)`} />
    </g>
  );
}

function Jelly({ x, y, s, tone, delay, dur, k }: { x: number; y: number; s: number; tone: "a" | "b"; delay: number; dur: number; k: string }) {
  const rim = tone === "a" ? "#f5d0fe" : "#a5f3fc";
  const arm = tone === "a" ? "#e879f9" : "#22d3ee";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="bgx-bob" style={{ animationDelay: `${delay}s`, animationDuration: `${dur}s` }}>
        <g fill="none" stroke={arm} strokeWidth="2.2" strokeLinecap="round" opacity="0.55">
          <path d="M-14 6 C-20 24 -8 36 -16 56 S-10 80 -14 96" />
          <path d="M-5 8 C-10 28 2 40 -4 62 S2 84 -2 104" />
          <path d="M6 8 C12 28 0 40 8 62 S2 86 6 100" />
          <path d="M15 6 C21 24 9 38 17 54 S11 76 16 92" />
        </g>
        <g fill="none" stroke={rim} strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
          <path d="M-9 8 C-3 22 -10 34 -4 48 S-8 66 -6 74" />
          <path d="M10 8 C4 20 12 32 6 46 S10 60 8 70" />
        </g>
        <path d="M-30 4 C-30 -36 30 -36 30 4 C22 10 12 4 4 10 C-2 4 -8 10 -16 4 C-22 10 -26 8 -30 4 Z" fill={`url(#${k}jelly${tone})`} stroke={rim} strokeWidth="1" opacity="0.9" />
        <path d="M-18 -16 C-12 -26 -2 -28 6 -24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <g fill={rim} opacity="0.8">
          {[-22, -14, -6, 2, 10, 18, 26].map((dx) => (
            <circle key={dx} cx={dx} cy={dx % 8 === 0 ? 2 : 5} r="1.4" />
          ))}
        </g>
      </g>
    </g>
  );
}

function OceanScene() {
  const k = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <>
      <div className="bgx-fill" style={{ background: "linear-gradient(180deg, #1190bf 0%, #0a6491 24%, #07446d 52%, #042b4a 76%, #021626 100%)" }} />
      <Layer depth={3}>
        <Svg sky>
          <defs>
            <linearGradient id={`${k}ray`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e6f9ff" stopOpacity="0.7" />
              <stop offset="1" stopColor="#e6f9ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${k}tang`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#60a5fa" />
              <stop offset="1" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id={`${k}clown`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fb923c" />
              <stop offset="1" stopColor="#ea580c" />
            </linearGradient>
            <clipPath id={`${k}clownclip`}>
              <path d="M-20 0 C-18 -11 -4 -14 8 -11 C16 -8 22 -3 23 0 C22 3 16 8 8 11 C-4 14 -18 11 -20 0 Z" />
            </clipPath>
            <linearGradient id={`${k}butter`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fef08a" />
              <stop offset="1" stopColor="#facc15" />
            </linearGradient>
            <linearGradient id={`${k}shell`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8a9a4b" />
              <stop offset="1" stopColor="#3f6b3a" />
            </linearGradient>
            <linearGradient id={`${k}whale`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0c4468" stopOpacity="0.85" />
              <stop offset="1" stopColor="#0f5c86" stopOpacity="0.85" />
            </linearGradient>
            <radialGradient id={`${k}brain`} cx="0.35" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#fdba74" />
              <stop offset="0.6" stopColor="#f97316" />
              <stop offset="1" stopColor="#c2410c" />
            </radialGradient>
            <radialGradient id={`${k}jellya`} cx="0.5" cy="0.85" r="0.9">
              <stop offset="0" stopColor="#f0abfc" stopOpacity="0.95" />
              <stop offset="0.6" stopColor="#a855f7" stopOpacity="0.55" />
              <stop offset="1" stopColor="#6366f1" stopOpacity="0.25" />
            </radialGradient>
            <radialGradient id={`${k}jellyb`} cx="0.5" cy="0.85" r="0.9">
              <stop offset="0" stopColor="#a5f3fc" stopOpacity="0.95" />
              <stop offset="0.6" stopColor="#22d3ee" stopOpacity="0.5" />
              <stop offset="1" stopColor="#0ea5e9" stopOpacity="0.2" />
            </radialGradient>
            <linearGradient id={`${k}sand`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c9b27c" />
              <stop offset="0.5" stopColor="#7d8a78" />
              <stop offset="1" stopColor="#1a4458" />
            </linearGradient>
            <linearGradient id={`${k}rock`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1d4659" />
              <stop offset="1" stopColor="#082235" />
            </linearGradient>
          </defs>
          <path d="M0 -150 H1600 V28 C1400 52 1200 10 1000 38 C800 62 600 14 400 42 C200 64 100 20 0 36 Z" fill="#b6ecff" opacity="0.2" />
          {[
            [200, 70],
            [520, 130],
            [860, 90],
            [1140, 160],
            [1430, 80],
          ].map(([x, w], i) => (
            <polygon key={x} points={`${x},-40 ${x + w},-40 ${x + w - 280},780 ${x - 280 - w * 0.6},780`} fill={`url(#${k}ray)`} opacity="0.55" className="bgx-aurora" style={{ animationDelay: `${-i * 3.2}s` }} />
          ))}
        </Svg>
      </Layer>
      <Layer depth={5}>
        <Svg>
          <g className="bgx-fly" style={{ animationDuration: "130s", animationDelay: "-52s" }}>
            <g transform="translate(0 230) scale(0.8)">
              <Whale k={k} />
            </g>
          </g>
          <path d="M0 770 C100 712 180 700 260 730 C340 650 420 640 500 700 C600 668 700 708 800 738 C900 690 1000 660 1100 708 C1200 648 1300 668 1400 718 C1480 698 1550 708 1600 728 L1600 900 L0 900 Z" fill="#0a4263" opacity="0.85" />
          {[
            [90, 150],
            [330, 120],
            [1250, 140],
            [1510, 160],
          ].map(([x, h], i) => (
            <g key={x} opacity="0.55">
              <Kelp x={x} y={760} h={h} s={0.9} tones={["#0b5a63", "#0a4a5c"]} delay={-i * 1.7} />
            </g>
          ))}
        </Svg>
      </Layer>
      <Layer depth={8}>
        <Svg>
          <School y={360} s={1} dur={72} delay={-12} />
          <School y={520} s={0.7} dur={90} delay={-58} />
          <Fish y={300} s={1} dur={40} delay={-8} kind="tang" k={k} />
          <Fish y={450} s={0.9} dur={52} delay={-28} kind="butter" k={k} />
          <Fish y={190} s={0.6} dur={60} delay={-44} kind="tang" k={k} />
          <Turtle y={600} s={1.1} dur={100} delay={-34} k={k} />
          <Jelly x={1040} y={260} s={1} tone="a" delay={0} dur={7} k={k} />
          <Jelly x={400} y={400} s={0.7} tone="b" delay={-2.4} dur={6} k={k} />
          <Jelly x={1360} y={470} s={1.15} tone="b" delay={-4} dur={8} k={k} />
          <Jelly x={720} y={170} s={0.55} tone="a" delay={-1.2} dur={6.5} k={k} />
        </Svg>
      </Layer>
      <Layer depth={13}>
        <Svg>
          <path d="M0 800 C200 778 380 806 600 796 C820 786 1000 810 1200 798 C1380 788 1500 804 1600 792 L1600 900 L0 900 Z" fill={`url(#${k}sand)`} />
          <g fill="none" stroke="#e8d9a8" strokeWidth="2" opacity="0.28" strokeLinecap="round">
            <path d="M120 836 C220 826 300 842 400 832" />
            <path d="M520 850 C640 838 740 856 860 844" />
            <path d="M980 840 C1100 830 1200 848 1320 836" />
            <path d="M1380 860 C1440 852 1500 862 1560 854" />
          </g>
          {SEAGRASS.map((g, i) => (
            <g key={i} transform={`translate(${g.x.toFixed(0)} ${i % 2 ? 806 : 812})`}>
              <g className="bgx-sway" style={{ animationDelay: `${g.d.toFixed(1)}s` }}>
                <path d={ribbon(g.h, 7, 1.2, 6, i)} fill={g.tone} opacity="0.85" />
              </g>
            </g>
          ))}
          <BranchCoral x={780} y={812} s={1.25} data={CORAL_BIG} color="#e0495b" tip="#ffb3bd" widths={[8, 6, 4.6, 3.2, 2]} />
          <BranchCoral x={410} y={822} s={1} data={CORAL_MID} color="#d946ef" tip="#f5c2fb" widths={[6, 4.4, 3.2, 2.2]} />
          <BranchCoral x={1240} y={820} s={1.1} data={CORAL_MID} color="#f59e0b" tip="#fde68a" widths={[6.4, 4.6, 3.4, 2.4]} />
          <BranchCoral x={600} y={830} s={0.8} data={CORAL_SMALL} color="#fb7185" tip="#ffe4e6" widths={[5, 3.6, 2.6, 1.8]} />
          <BrainCoral x={520} y={826} s={1.1} k={k} />
          <SeaFan x={985} y={822} s={1.15} color="#a21caf" light="#f0abfc" />
          <TubeSponges x={1130} y={826} s={1} />
          <Anemone x={690} y={834} s={0.85} color="#f472b6" tip="#fde4f1" />
          <g className="bgx-bob" style={{ animationDuration: "5s" }}>
            <g transform="translate(676 770) scale(0.9)">
              <FishBody kind="clown" k={k} />
            </g>
          </g>
          <g className="bgx-bob" style={{ animationDuration: "6.4s", animationDelay: "-2s" }}>
            <g transform="translate(722 790) scale(-0.7 0.7)">
              <FishBody kind="clown" k={k} />
            </g>
          </g>
          <Starfish x={866} y={856} s={0.9} color="#f97316" rot={14} />
          <Starfish x={1046} y={866} s={0.7} color="#ef4444" rot={-22} />
          <Starfish x={330} y={860} s={0.8} color="#fb923c" rot={40} />
          <ellipse cx="930" cy="866" rx="14" ry="7" fill="#fde68a" opacity="0.85" />
          <path d="M920 866 C924 860 936 860 940 866 M924 868 C927 862 933 862 936 868" fill="none" stroke="#a16207" strokeWidth="1.1" />
        </Svg>
      </Layer>
      <Layer depth={19}>
        <Svg>
          <path d="M-20 900 L-20 760 C40 740 120 770 170 820 C200 850 240 880 260 900 Z" fill={`url(#${k}rock)`} />
          <path d="M1620 900 L1620 740 C1550 730 1470 770 1420 830 C1390 860 1370 884 1360 900 Z" fill={`url(#${k}rock)`} />
          <Kelp x={60} y={870} h={430} s={1.1} tones={["#0f5a46", "#0b4538"]} delay={-1} />
          <Kelp x={150} y={880} h={300} s={1} tones={["#12705a", "#0e5a4a"]} delay={-3.2} />
          <Kelp x={1540} y={870} h={460} s={1.15} tones={["#0f5a46", "#0b4538"]} delay={-2} />
          <Kelp x={1450} y={880} h={320} s={1} tones={["#12705a", "#0e5a4a"]} delay={-4.4} />
        </Svg>
      </Layer>
      <Layer depth={22}>
        {BUBBLES.map((b, i) => (
          <span key={i} className="bgx-bubble" style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, "--sway": `${b.sway}px` } as CSSProperties} />
        ))}
      </Layer>
      <Vignette />
    </>
  );
}

function SunsetScene() {
  return (
    <>
      <div className="bgx-fill" style={{ background: "linear-gradient(180deg, #1b1038 0%, #6b2a6e 38%, #e8664a 68%, #ffc872 100%)" }} />
      <Layer depth={2}>
        <div className="bgx-fill" style={{ opacity: 0.45 }}>
          <Stars />
        </div>
      </Layer>
      <Layer depth={5}>
        <Svg>
          <defs>
            <radialGradient id="sn-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff1b8" stopOpacity="0.9" />
              <stop offset="0.45" stopColor="#ffb347" stopOpacity="0.35" />
              <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="800" cy="560" r="330" fill="url(#sn-glow)" className="bgx-pulse" />
          <circle cx="800" cy="560" r="105" fill="#fff3c4" />
          <ellipse cx="400" cy="250" rx="150" ry="22" fill="#ffd2a1" opacity="0.35" className="bgx-drift" />
          <ellipse cx="1150" cy="190" rx="190" ry="26" fill="#ffd2a1" opacity="0.3" className="bgx-drift" style={{ animationDelay: "-8s" }} />
        </Svg>
      </Layer>
      <Layer depth={8}>
        <Svg>
          <path d="M0 640 L180 520 L330 600 L520 470 L700 590 L880 500 L1060 600 L1250 480 L1430 580 L1600 520 L1600 900 L0 900 Z" fill="#6b2d6b" />
        </Svg>
      </Layer>
      <Layer depth={12}>
        <Svg>
          <path d="M0 720 L220 600 L400 690 L640 570 L860 700 L1100 610 L1330 710 L1600 620 L1600 900 L0 900 Z" fill="#3f1d4f" />
          {[0, 1, 2].map((i) => (
            <g key={i} className="bgx-fly" style={{ animationDuration: `${36 + i * 9}s`, animationDelay: `${-i * 11}s` }}>
              <g transform={`translate(0 ${200 + i * 70}) scale(${0.5 - i * 0.08})`}>
                <path className="bgx-flap" d={BAT} fill="#1a0d2b" />
              </g>
            </g>
          ))}
        </Svg>
      </Layer>
      <Layer depth={18}>
        <Svg>
          <path d="M0 800 L260 710 L520 790 L800 700 L1080 800 L1360 720 L1600 790 L1600 900 L0 900 Z" fill="#1d0d2c" />
        </Svg>
      </Layer>
      <Vignette />
    </>
  );
}

const jrand = rng(7171);

const SAKURA = (
  [
    [1350, 500, 95],
    [1250, 545, 70],
    [1160, 495, 55],
    [1480, 470, 105],
    [1550, 570, 80],
    [1420, 390, 80],
    [1300, 410, 70],
    [1570, 410, 70],
    [1190, 590, 40],
  ] as [number, number, number][]
).flatMap(([cx, cy, R]) =>
  Array.from({ length: 11 }, () => {
    const a = jrand() * Math.PI * 2;
    const d = Math.sqrt(jrand()) * R;
    return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.8, r: 16 + jrand() * 20, c: ["#fbcfe8", "#f9a8d4", "#f472b6", "#fce7f3"][Math.floor(jrand() * 4)], o: 0.82 + jrand() * 0.16 };
  }),
);

const SAKURA_DOTS = Array.from({ length: 110 }, () => {
  const b = SAKURA[Math.floor(jrand() * SAKURA.length)];
  return { x: b.x + (jrand() - 0.5) * b.r * 2, y: b.y + (jrand() - 0.5) * b.r * 2, r: 2 + jrand() * 3.4 };
});

const WINDOWS = Array.from({ length: 34 }, () => ({ x: jrand() * 1600, y: 624 + jrand() * 60, o: 0.4 + jrand() * 0.5 }));

function Pagoda({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const w = 62 - i * 7.5;
        const r = w + 26 - i * 3;
        const by = -i * 52;
        return (
          <g key={i} transform={`translate(0 ${by})`}>
            <rect x={-w * 0.8} y="-30" width={w * 1.6} height="30" fill="#1b1233" />
            <rect x={-w * 0.8} y="-30" width={w * 1.6} height="4" fill="#0e0a20" />
            <g fill="#fbbf24" className={i % 2 ? "bgx-flicker" : undefined}>
              {[-0.5, 0, 0.5].map((f) => (
                <rect key={f} x={w * f * 1.2 - 4} y="-22" width="8" height="13" rx="1" opacity="0.92" />
              ))}
            </g>
            <g transform="translate(0 -30)">
              <path d={`M${-r} -5 Q${-r * 0.55} 9 0 9 Q${r * 0.55} 9 ${r} -5 L${r * 0.62} -9 L0 -22 L${-r * 0.62} -9 Z`} fill="#2a1f4d" stroke="#7c6bc4" strokeWidth="1.4" strokeOpacity="0.55" strokeLinejoin="round" />
              <path d={`M${-r} -5 Q${-r * 0.55} 9 0 9 Q${r * 0.55} 9 ${r} -5`} fill="none" stroke="#0e0a20" strokeWidth="2" />
            </g>
          </g>
        );
      })}
      <rect x="-2.5" y="-312" width="5" height="52" fill="#2b1d3a" />
      {[-300, -290, -280, -270].map((yy) => (
        <ellipse key={yy} cx="0" cy={yy} rx="7" ry="2" fill="#4b3a72" />
      ))}
      <circle cx="0" cy="-316" r="4" fill="#fbbf24" opacity="0.9" />
    </g>
  );
}

function StoneLantern({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14 0 L14 0 L10 -8 L-10 -8 Z" fill="#2a2540" />
      <rect x="-4" y="-34" width="8" height="26" fill="#332d4f" />
      <rect x="-12" y="-42" width="24" height="9" fill="#2a2540" />
      <rect x="-8" y="-62" width="16" height="20" fill="#fbbf24" opacity="0.9" className="bgx-flicker" />
      <rect x="-8" y="-62" width="16" height="20" fill="none" stroke="#2a2540" strokeWidth="3" />
      <path d="M-20 -62 L0 -80 L20 -62 Z" fill="#2f2848" />
      <circle cx="0" cy="-83" r="3" fill="#2f2848" />
    </g>
  );
}

function MatsuPine({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-5 0 C-4 -30 -10 -50 -2 -78 L4 -78 C0 -50 6 -30 5 0 Z" fill="#150f26" />
      {[
        [-34, -74, 30],
        [30, -88, 28],
        [0, -112, 34],
        [-20, -50, 24],
        [26, -58, 22],
      ].map(([dx, dy, rr], i) => (
        <ellipse key={i} cx={dx} cy={dy} rx={rr * 1.5} ry={rr * 0.6} fill="#0d1d2c" />
      ))}
    </g>
  );
}

function JapanScene() {
  const k = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `url(#${k}${n})`;
  const lanterns: [number, number][] = [
    [1150, 565],
    [1210, 580],
    [1270, 575],
  ];
  return (
    <>
      <div className="bgx-fill" style={{ background: "linear-gradient(180deg, #03051a 0%, #0c1240 36%, #261d5c 62%, #55336e 80%, #8a4a7c 100%)" }} />
      <Layer depth={2}>
        <Stars />
      </Layer>
      <Layer depth={5}>
        <Svg sky>
          <defs>
            <radialGradient id={`${k}halo`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.3" stopColor="#fef9c3" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fef9c3" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${k}moon`} cx="0.4" cy="0.35" r="0.75">
              <stop offset="0" stopColor="#fffdf0" />
              <stop offset="1" stopColor="#f3ecbd" />
            </radialGradient>
            <radialGradient id={`${k}glow`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fbbf24" stopOpacity="0.6" />
              <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${k}red`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#7f1d1d" />
              <stop offset="0.45" stopColor="#e0302a" />
              <stop offset="1" stopColor="#8f1d1d" />
            </linearGradient>
            <linearGradient id={`${k}fuji`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#151a4a" />
              <stop offset="1" stopColor="#3b4696" />
            </linearGradient>
            <linearGradient id={`${k}snow`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#a5b4fc" />
              <stop offset="1" stopColor="#eef2ff" />
            </linearGradient>
            <linearGradient id={`${k}lake`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a3a80" />
              <stop offset="0.4" stopColor="#1f1d58" />
              <stop offset="1" stopColor="#090a22" />
            </linearGradient>
            <linearGradient id={`${k}mist`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b8a6ee" stopOpacity="0" />
              <stop offset="1" stopColor="#b8a6ee" stopOpacity="0.4" />
            </linearGradient>
            <g id={`${k}torii`}>
              <path d="M-112 0 L-106 -200 L-86 -200 L-82 0 Z" fill={u("red")} />
              <path d="M82 0 L86 -200 L106 -200 L112 0 Z" fill={u("red")} />
              <rect x="-116" y="-16" width="38" height="16" rx="2" fill="#1a1226" />
              <rect x="78" y="-16" width="38" height="16" rx="2" fill="#1a1226" />
              <rect x="-126" y="-160" width="252" height="16" fill={u("red")} />
              <rect x="-150" y="-200" width="300" height="17" fill={u("red")} />
              <rect x="-14" y="-184" width="28" height="26" fill="#1a1226" stroke="#d4a017" strokeWidth="1" strokeOpacity="0.7" />
              <path d="M-4 -178 H4 M-4 -172 H4 M-4 -166 H4" stroke="#d4a017" strokeWidth="1.4" opacity="0.8" />
              <path d="M-184 -240 C-150 -214 -80 -208 0 -208 C80 -208 150 -214 184 -240 L178 -228 C150 -202 80 -198 0 -198 C-80 -198 -150 -202 -178 -228 Z" fill="#17101f" />
              <path d="M-184 -240 C-150 -214 -80 -208 0 -208 C80 -208 150 -214 184 -240" fill="none" stroke="#6a5aa8" strokeWidth="1.4" opacity="0.6" />
            </g>
          </defs>
          <circle cx="1180" cy="190" r="240" fill={u("halo")} className="bgx-pulse" />
          <circle cx="1180" cy="190" r="80" fill={u("moon")} />
          <g fill="#d8d09a" opacity="0.38">
            <circle cx="1156" cy="170" r="16" />
            <circle cx="1204" cy="214" r="12" />
            <circle cx="1170" cy="222" r="8" />
            <circle cx="1212" cy="166" r="6" />
            <ellipse cx="1150" cy="205" rx="10" ry="6" />
          </g>
          <g className="bgx-drift" style={{ animationDuration: "70s" }}>
            <path d="M980 215 C1020 198 1080 196 1120 208 C1150 190 1210 194 1240 214 C1190 226 1040 228 980 215 Z" fill="#2c2866" opacity="0.8" />
            <path d="M980 215 C1020 198 1080 196 1120 208" fill="none" stroke="#fef9c3" strokeWidth="1.6" opacity="0.35" />
          </g>
          <g className="bgx-drift" style={{ animationDuration: "95s", animationDelay: "-30s" }}>
            <path d="M1100 142 C1140 128 1190 130 1230 140 C1260 128 1300 136 1320 150 C1260 160 1150 158 1100 142 Z" fill="#26235c" opacity="0.7" />
          </g>
          <g transform="translate(420 110)">
            <g className="bgx-shoot">
              <path d="M0 0 L-70 -30" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
            </g>
          </g>
        </Svg>
      </Layer>
      <Layer depth={8}>
        <Svg>
          <path d="M0 690 C140 650 260 630 400 660 C520 686 640 640 760 650 C900 660 1000 620 1140 650 C1260 676 1420 640 1600 670 L1600 740 L0 740 Z" fill="#171a4a" />
          <path d="M470 705 C560 645 650 525 760 398 C800 352 830 334 860 332 C890 334 920 352 960 398 C1070 525 1160 645 1250 705 Z" fill={u("fuji")} />
          <path d="M760 398 C790 362 830 338 860 336 C890 338 930 362 960 398 L940 420 L918 398 L896 432 L872 404 L850 438 L826 402 L804 426 L782 402 Z" fill={u("snow")} />
          <path d="M860 332 C890 334 920 352 960 398 C1070 525 1160 645 1250 705 L1180 705 C1090 600 1010 480 930 380 Z" fill="#8ea0ff" opacity="0.12" />
          <rect x="0" y="640" width="1600" height="70" fill={u("mist")} />
          <path d="M0 720 C120 690 240 680 380 700 C520 720 660 690 800 704 C960 720 1100 686 1240 700 C1380 714 1500 692 1600 706 L1600 760 L0 760 Z" fill="#101340" />
          {WINDOWS.map((w, i) => (
            <rect key={i} x={w.x.toFixed(0)} y={w.y.toFixed(0)} width="3" height="3" fill="#fcd34d" opacity={w.o.toFixed(2)} />
          ))}
        </Svg>
      </Layer>
      <Layer depth={12}>
        <Svg>
          <rect x="0" y="730" width="1600" height="170" fill={u("lake")} />
          <g fill="#fef3b0">
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={i} x={1180 - (26 - i * 1.4) * 1.2} y={744 + i * 11} width={(26 - i * 1.4) * 2.4} height="2.6" rx="1.3" opacity={0.5 - i * 0.025} className="bgx-twinkle" style={{ animationDelay: `${-i * 0.4}s`, animationDuration: `${3 + (i % 3)}s` }} />
            ))}
          </g>
          <g fill="none" stroke="#a79bd8" strokeWidth="1.6" opacity="0.22" strokeLinecap="round">
            <path d="M300 800 H420 M640 830 H780 M900 790 H1010 M1300 840 H1440 M120 860 H240 M980 870 H1120" />
          </g>
          <use href={`#${k}torii`} transform="translate(760 796) scale(0.8)" />
          <g opacity="0.22">
            <use href={`#${k}torii`} transform="translate(760 796) scale(0.8 -0.8)" />
          </g>
          <path d="M0 900 L0 668 C60 650 130 640 210 642 C300 644 360 664 420 690 C480 712 540 724 580 752 C540 776 470 786 400 790 C260 800 120 800 0 810 Z" fill="#0b0d2c" />
          <path d="M0 810 C120 804 260 802 400 792 C470 788 540 778 580 754 L600 800 C520 830 400 846 260 850 C160 852 60 850 0 856 Z" fill="#0b0d2c" opacity="0.5" />
          <MatsuPine x={70} y={668} s={1.1} />
          <MatsuPine x={500} y={706} s={0.7} />
          <Pagoda x={270} y={652} s={1} />
          <StoneLantern x={420} y={688} s={0.9} />
          <circle cx="420" cy="640" r="34" fill={u("glow")} className="bgx-flicker" />
        </Svg>
      </Layer>
      <Layer depth={18}>
        <Svg>
          <path d="M1470 900 C1475 820 1440 760 1380 705 C1340 665 1328 600 1350 540 L1374 548 C1362 600 1374 640 1412 678 C1470 732 1500 792 1522 900 Z" fill="#2b1824" />
          <path d="M1362 610 C1300 580 1220 566 1140 504 L1150 490 C1230 540 1312 548 1376 584 Z" fill="#2b1824" />
          <path d="M1390 560 C1420 500 1480 440 1540 410 L1550 424 C1494 454 1442 508 1412 566 Z" fill="#2b1824" />
          <path d="M1090 520 Q1210 610 1330 540" fill="none" stroke="#3a2230" strokeWidth="2.4" />
          {SAKURA.map((b, i) => (
            <circle key={i} cx={b.x.toFixed(0)} cy={b.y.toFixed(0)} r={b.r.toFixed(0)} fill={b.c} opacity={b.o.toFixed(2)} />
          ))}
          {SAKURA_DOTS.map((d, i) => (
            <circle key={i} cx={d.x.toFixed(0)} cy={d.y.toFixed(0)} r={d.r.toFixed(1)} fill="#fff1f6" opacity="0.85" />
          ))}
          {lanterns.map(([lx, ly], i) => (
            <g key={i}>
              <circle cx={lx} cy={ly + 12} r="46" fill={u("glow")} className="bgx-flicker" style={{ animationDelay: `${-i * 1.1}s` }} />
              <line x1={lx} y1={ly - 6} x2={lx} y2={ly} stroke="#3a2230" strokeWidth="1.6" />
              <rect x={lx - 7} y={ly} width="14" height="4" fill="#1a1226" />
              <ellipse cx={lx} cy={ly + 15} rx="13" ry="16" fill="#dc2626" />
              <path d={`M${lx - 12} ${ly + 9} H${lx + 12} M${lx - 13} ${ly + 15} H${lx + 13} M${lx - 12} ${ly + 21} H${lx + 12}`} stroke="#7f1d1d" strokeWidth="1.2" />
              <rect x={lx - 7} y={ly + 28} width="14" height="4" fill="#1a1226" />
            </g>
          ))}
        </Svg>
      </Layer>
      <Layer depth={22}>
        {PETALS.map((p, i) => (
          <span key={i} className="bgx-petal" style={{ left: `${p.left}%`, width: p.size, height: p.size, opacity: p.op, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, "--sway": `${p.sway}px` } as CSSProperties} />
        ))}
      </Layer>
      <Vignette />
    </>
  );
}

function ForestScene() {
  return (
    <>
      <div className="bgx-fill" style={{ background: "linear-gradient(180deg, #03100c 0%, #0a2a1e 55%, #123b2b 100%)" }} />
      <Layer depth={2}>
        <Stars />
      </Layer>
      <Layer depth={5}>
        <Svg sky>
          <defs>
            <radialGradient id="fo-moon" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.3" stopColor="#d9f99d" stopOpacity="0.55" />
              <stop offset="1" stopColor="#d9f99d" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="1180" cy="170" r="190" fill="url(#fo-moon)" className="bgx-pulse" />
          <circle cx="1180" cy="170" r="70" fill="#f7fee7" />
        </Svg>
      </Layer>
      <Layer depth={9}>
        <Svg>
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i} transform={`translate(${i * 150 + 20} ${470 + (i % 3) * 30})`}>
              <rect x="-8" y="120" width="16" height="320" fill="#06180f" />
              <circle cx="0" cy="90" r="80" fill="#0a2417" />
              <circle cx="-40" cy="140" r="55" fill="#0a2417" />
              <circle cx="42" cy="140" r="55" fill="#0a2417" />
            </g>
          ))}
        </Svg>
      </Layer>
      <Layer depth={15}>
        <Svg>
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i} transform={`translate(${i * 300 + 90} 560)`}>
              <rect x="-14" y="60" width="28" height="360" fill="#03100a" />
              <circle cx="0" cy="40" r="110" fill="#05160e" />
              <circle cx="-70" cy="110" r="80" fill="#05160e" />
              <circle cx="72" cy="110" r="80" fill="#05160e" />
            </g>
          ))}
          <path d="M0 820 C300 790 600 840 900 805 C1200 770 1400 830 1600 800 L1600 900 L0 900 Z" fill="#020b07" />
          {[[260, 840], [740, 850], [1240, 842]].map(([x, y], i) => (
            <g key={i} className="bgx-flicker" style={{ animationDelay: `${-i}s` }}>
              <ellipse cx={x} cy={y} rx="26" ry="14" fill="#34d399" opacity="0.25" />
              <path d={`M${x - 14} ${y} C${x - 14} ${y - 20} ${x + 14} ${y - 20} ${x + 14} ${y} Z`} fill="#6ee7b7" />
              <rect x={x - 3} y={y} width="6" height="12" fill="#d1fae5" />
            </g>
          ))}
        </Svg>
      </Layer>
      <Layer depth={20}>
        {FIREFLIES.map((f, i) => (
          <span key={i} className="bgx-dust" style={{ left: `${f.left}%`, top: `${f.top}%`, width: f.size, height: f.size, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`, "--sway": `${f.sway}px` } as CSSProperties} />
        ))}
      </Layer>
      <Vignette />
    </>
  );
}

function DesertScene() {
  return (
    <>
      <div className="bgx-fill" style={{ background: "linear-gradient(180deg, #060a24 0%, #1d2457 50%, #6b3f6b 85%, #c2703d 100%)" }} />
      <Layer depth={2}>
        <Stars />
      </Layer>
      <Layer depth={5}>
        <Svg sky>
          <defs>
            <radialGradient id="de-moon" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.3" stopColor="#fef3c7" stopOpacity="0.5" />
              <stop offset="1" stopColor="#fef3c7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="400" cy="190" r="170" fill="url(#de-moon)" className="bgx-pulse" />
          <circle cx="400" cy="190" r="64" fill="#fef3c7" />
          <circle cx="425" cy="176" r="58" fill="#1a2152" />
          <g className="bgx-shoot">
            <line x1="1000" y1="90" x2="930" y2="55" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          </g>
        </Svg>
      </Layer>
      <Layer depth={8}>
        <Svg>
          <path d="M980 700 L1100 520 L1220 700 Z" fill="#3a2550" />
          <path d="M1160 700 L1250 570 L1340 700 Z" fill="#33204a" />
        </Svg>
      </Layer>
      <Layer depth={12}>
        <Svg>
          <path d="M0 720 C250 660 500 740 800 690 C1100 640 1350 730 1600 680 L1600 900 L0 900 Z" fill="#3b2447" />
        </Svg>
      </Layer>
      <Layer depth={18}>
        <Svg>
          <path d="M0 810 C300 740 560 830 880 770 C1180 715 1400 810 1600 760 L1600 900 L0 900 Z" fill="#241433" />
          <g transform="translate(250 650)" fill="#160c22">
            <rect x="-9" y="0" width="18" height="150" rx="9" />
            <rect x="-36" y="40" width="14" height="50" rx="7" />
            <rect x="-36" y="76" width="30" height="14" rx="7" />
            <rect x="22" y="20" width="14" height="50" rx="7" />
            <rect x="6" y="56" width="30" height="14" rx="7" />
          </g>
          <g transform="translate(1320 690) scale(0.8)" fill="#160c22">
            <rect x="-9" y="0" width="18" height="150" rx="9" />
            <rect x="-36" y="40" width="14" height="50" rx="7" />
            <rect x="-36" y="76" width="30" height="14" rx="7" />
          </g>
        </Svg>
      </Layer>
      <Vignette />
    </>
  );
}

function CityScene() {
  const towers = Array.from({ length: 14 }, (_, i) => ({ x: i * 120 - 20, w: 90 + ((i * 37) % 50), h: 220 + ((i * 83) % 300) }));
  return (
    <>
      <div className="bgx-fill" style={{ background: "linear-gradient(180deg, #08011a 0%, #1c0637 55%, #4a0a54 100%)" }} />
      <Layer depth={2}>
        <Stars />
      </Layer>
      <Layer depth={5}>
        <Svg sky>
          <defs>
            <linearGradient id="ci-sun" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fde047" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <circle cx="800" cy="330" r="170" fill="url(#ci-sun)" opacity="0.9" className="bgx-pulse" />
          {[250, 275, 300, 325, 350].map((y, i) => (
            <rect key={y} x="610" y={y + 60} width="380" height={4 + i * 2} fill="#1c0637" />
          ))}
        </Svg>
      </Layer>
      <Layer depth={9}>
        <Svg>
          {towers.map((t, i) => (
            <rect key={i} x={t.x} y={900 - t.h - 60} width={t.w} height={t.h + 60} fill="#12052a" />
          ))}
        </Svg>
      </Layer>
      <Layer depth={16}>
        <Svg>
          {towers.map((t, i) => {
            const x = t.x + 50;
            const w = t.w + 10;
            const h = t.h * 0.8;
            return (
              <g key={i}>
                <rect x={x} y={900 - h} width={w} height={h} fill="#0a0318" stroke={i % 2 ? "#22d3ee" : "#f472b6"} strokeWidth="2" opacity="0.95" />
                {Array.from({ length: Math.floor(h / 36) }, (_, r) =>
                  Array.from({ length: Math.floor(w / 22) }, (__, c) => ((i * 7 + r * 3 + c * 5) % 4 === 0 ? (
                    <rect key={`${r}-${c}`} x={x + 8 + c * 22} y={900 - h + 14 + r * 36} width="10" height="14" fill={(r + c) % 3 ? "#fde047" : "#22d3ee"} className="bgx-blink" style={{ animationDuration: `${3 + ((r + c + i) % 5)}s`, animationDelay: `${-((r * c + i) % 6)}s` }} />
                  ) : null)),
                )}
              </g>
            );
          })}
        </Svg>
      </Layer>
      <Vignette />
    </>
  );
}

function AuroraScene() {
  return (
    <>
      <div className="bgx-fill" style={{ background: "linear-gradient(180deg, #010412 0%, #07203a 55%, #0f3c4e 100%)" }} />
      <Layer depth={2}>
        <Stars />
      </Layer>
      <Layer depth={6}>
        <Svg sky>
          <defs>
            <linearGradient id="au-a" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#34d399" stopOpacity="0" />
              <stop offset="0.45" stopColor="#34d399" stopOpacity="0.7" />
              <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="au-b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a855f7" stopOpacity="0" />
              <stop offset="0.5" stopColor="#c084fc" stopOpacity="0.55" />
              <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M-100 380 C200 60 500 420 800 160 C1100 -60 1300 300 1700 100 L1700 380 C1300 520 1100 240 800 400 C500 560 200 260 -100 480 Z" fill="url(#au-a)" className="bgx-aurora" />
          <path d="M-100 460 C250 220 520 520 820 300 C1120 120 1350 400 1700 260 L1700 480 C1350 620 1120 380 820 520 C520 680 250 420 -100 560 Z" fill="url(#au-b)" className="bgx-aurora" style={{ animationDelay: "-7s" }} />
        </Svg>
      </Layer>
      <Layer depth={12}>
        <Svg>
          <path d="M0 700 L220 480 L360 620 L560 400 L760 640 L960 470 L1180 660 L1400 500 L1600 640 L1600 900 L0 900 Z" fill="#0a1d33" />
          <path d="M560 400 L620 470 L580 460 L560 490 L530 455 Z M220 480 L270 540 L235 530 L215 560 L190 525 Z M1400 500 L1450 560 L1415 550 L1395 580 L1370 545 Z" fill="#e0f2fe" opacity="0.85" />
        </Svg>
      </Layer>
      <Layer depth={18}>
        <Svg>
          <path d="M0 800 L300 700 L560 790 L860 690 L1160 790 L1420 710 L1600 780 L1600 900 L0 900 Z" fill="#051121" />
          <rect x="0" y="840" width="1600" height="60" fill="#0b3b4a" opacity="0.6" />
        </Svg>
      </Layer>
      <Vignette />
    </>
  );
}

function Scene({ id }: { id: BackgroundId }) {
  switch (id) {
    case "halloween":
      return <HalloweenScene />;
    case "natale":
      return <ChristmasScene />;
    case "biblioteca":
      return <LibraryScene />;
    case "spazio":
      return <SpaceScene />;
    case "oceano":
      return <OceanScene />;
    case "tramonto":
      return <SunsetScene />;
    case "giappone":
      return <JapanScene />;
    case "foresta":
      return <ForestScene />;
    case "deserto":
      return <DesertScene />;
    case "citta":
      return <CityScene />;
    case "aurora":
      return <AuroraScene />;
    default:
      return null;
  }
}

export function BackgroundPreview({ id }: { id: BackgroundId }) {
  return (
    <div className="bgx-fill">
      <Scene id={id} />
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
      <Scene id={id} />
    </div>
  );
}
