import { gearPath, lcg } from "./art";
import "./obs.css";

const STARS = (() => {
  const r = lcg(31);
  return Array.from({ length: 110 }, () => ({ x: r() * 800, y: r() * 330, r: 0.5 + r() * 1.3, d: r() * 4, t: 2 + r() * 3 }));
})();

const DUST = (() => {
  const r = lcg(7);
  return Array.from({ length: 22 }, () => ({ x: r() * 800, y: 260 + r() * 240, r: 0.8 + r() * 1.6, d: r() * 14, t: 10 + r() * 8 }));
})();

function Stars({ below = 330, tint = "#fff" }: { below?: number; tint?: string }) {
  return (
    <g>
      {STARS.filter((s) => s.y < below).map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={tint} className="ob-twinkle" style={{ animationDelay: `-${s.d}s`, animationDuration: `${s.t}s` }} />
      ))}
    </g>
  );
}

function Dust({ color = "#ffe9a8" }: { color?: string }) {
  return (
    <g fill={color}>
      {DUST.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} className="ob-dust" style={{ animationDelay: `-${d.d}s`, animationDuration: `${d.t}s` }} />
      ))}
    </g>
  );
}

function Flame({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="-6" rx="22" ry="26" fill="url(#ob-fire-glow)" />
      <g className="ob-flame">
        <path d="M0 -34 C10 -20 14 -10 8 0 C4 6 -4 6 -8 0 C-14 -10 -8 -22 0 -34Z" fill="#ff8a1f" />
        <path d="M0 -24 C6 -14 8 -8 4 -1 C2 3 -2 3 -4 -1 C-8 -8 -4 -16 0 -24Z" fill="#ffd36b" />
      </g>
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <radialGradient id="ob-fire-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffb44a" stopOpacity="0.55" />
        <stop offset="1" stopColor="#ffb44a" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ob-brass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f6d98a" />
        <stop offset="0.5" stopColor="#b9822c" />
        <stop offset="1" stopColor="#5e3a10" />
      </linearGradient>
      <linearGradient id="ob-night" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#060a24" />
        <stop offset="1" stopColor="#241a52" />
      </linearGradient>
    </defs>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      <Defs />
      {children}
    </svg>
  );
}

function Atrio() {
  return (
    <Frame>
      <rect width="800" height="500" fill="#0b0d22" />
      <clipPath id="ob-arch">
        <path d="M270 340 V170 A130 130 0 0 1 530 170 V340Z" />
      </clipPath>
      <g clipPath="url(#ob-arch)">
        <rect x="270" y="30" width="260" height="320" fill="url(#ob-night)" />
        <g transform="translate(210 -10)">
          <Stars below={340} />
        </g>
        <circle cx="470" cy="110" r="30" fill="#f3ecd2" />
        <circle cx="482" cy="104" r="26" fill="#0f1334" opacity="0.55" />
      </g>
      <path d="M270 340 V170 A130 130 0 0 1 530 170 V340" fill="none" stroke="url(#ob-brass)" strokeWidth="9" />
      <path d="M254 340 V170 A146 146 0 0 1 546 170 V340" fill="none" stroke="#3b2a12" strokeWidth="5" />
      {[90, 180, 620, 710].map((x) => (
        <g key={x}>
          <rect x={x - 22} y="30" width="44" height="320" fill="#14172f" />
          <rect x={x - 22} y="30" width="8" height="320" fill="#1f2347" />
          <rect x={x - 30} y="330" width="60" height="22" fill="url(#ob-brass)" />
          <rect x={x - 30} y="24" width="60" height="14" fill="url(#ob-brass)" />
        </g>
      ))}
      <polygon points="0,500 800,500 800,350 0,350" fill="#10122b" />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={400 + (i - 4) * 14} y1="350" x2={400 + (i - 4) * 120} y2="500" stroke="#26285a" strokeWidth="1.4" />
      ))}
      {[372, 398, 432, 480].map((y) => (
        <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#26285a" strokeWidth="1.2" />
      ))}
      {[150, 650].map((x) => (
        <g key={x}>
          <path d={`M${x - 26} 420 H${x + 26} L${x + 18} 462 H${x - 18}Z`} fill="url(#ob-brass)" />
          <rect x={x - 6} y="462" width="12" height="26" fill="#3b2a12" />
          <Flame x={x} y={420} s={1.4} />
        </g>
      ))}
      {[40, 760].map((x, i) => (
        <g key={x} className="ob-sway" style={{ animationDelay: `-${i * 2}s` }}>
          <line x1={x} y1="0" x2={x} y2="70" stroke="#6b4b1c" strokeWidth="2" />
          <path d={`M${x - 14} 70 H${x + 14} L${x + 10} 108 H${x - 10}Z`} fill="url(#ob-brass)" />
          <ellipse cx={x} cy="92" rx="26" ry="30" fill="url(#ob-fire-glow)" />
          <ellipse cx={x} cy="92" rx="5" ry="9" fill="#ffd36b" className="ob-flame" />
        </g>
      ))}
      <Dust />
    </Frame>
  );
}

const BOOKS = (() => {
  const r = lcg(19);
  const palette = ["#7a2d2d", "#2d5a7a", "#3f6b3a", "#8a6a2a", "#5a3a7a", "#7a4a2a", "#2d4a5a"];
  return Array.from({ length: 4 }, () => {
    let x = 0;
    const row: { x: number; w: number; h: number; c: string }[] = [];
    while (x < 190) {
      const w = 9 + r() * 10;
      row.push({ x, w, h: 46 + r() * 22, c: palette[Math.floor(r() * palette.length)] });
      x += w + 1;
    }
    return row;
  });
})();

function Shelf({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 40)`}>
      <rect x="-8" y="-12" width="206" height="410" fill="#241508" />
      {BOOKS.map((row, ri) => (
        <g key={ri} transform={`translate(0 ${ri * 96 + 20})`}>
          {row.map((b, i) => (
            <rect key={i} x={b.x} y={72 - b.h} width={b.w} height={b.h} fill={b.c} stroke="#14090a" strokeWidth="0.8" />
          ))}
          <rect x="-8" y="72" width="206" height="8" fill="#4a2c12" />
        </g>
      ))}
    </g>
  );
}

function Biblioteca() {
  return (
    <Frame>
      <rect width="800" height="500" fill="#150d08" />
      <Shelf x={20} />
      <Shelf x={590} />
      <polygon points="300,0 500,0 640,500 160,500" fill="#ffe3a0" opacity="0.07" />
      <rect x="330" y="40" width="140" height="190" rx="70" fill="#1b2a52" stroke="url(#ob-brass)" strokeWidth="6" />
      <g transform="translate(330 40)">
        <Stars below={190} />
      </g>
      <rect x="150" y="380" width="500" height="22" rx="4" fill="#4a2a10" />
      <rect x="170" y="402" width="26" height="98" fill="#2e1a0a" />
      <rect x="604" y="402" width="26" height="98" fill="#2e1a0a" />
      <g transform="translate(400 340)">
        <rect x="-4" y="26" width="8" height="14" fill="url(#ob-brass)" />
        <rect x="-26" y="38" width="52" height="8" rx="3" fill="url(#ob-brass)" />
        <circle r="38" fill="#1c4a6a" />
        <circle r="38" fill="none" stroke="url(#ob-brass)" strokeWidth="4" />
        <g className="ob-spin-fast">
          <ellipse rx="14" ry="38" fill="none" stroke="#9fd0ea" strokeWidth="1.2" />
          <ellipse rx="30" ry="38" fill="none" stroke="#9fd0ea" strokeWidth="1.2" />
          <path d="M-38 0 H38" stroke="#9fd0ea" strokeWidth="1.2" />
        </g>
      </g>
      <g transform="translate(250 372)">
        <rect x="-5" y="-4" width="10" height="26" fill="#e9d9b0" />
        <Flame x={0} y={-4} s={0.9} />
      </g>
      <rect x="500" y="378" width="70" height="8" fill="#6a2d2d" />
      <rect x="506" y="370" width="58" height="8" fill="#2d5a7a" />
      <Dust />
    </Frame>
  );
}

function Torre() {
  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <Frame>
      <rect width="800" height="500" fill="#07131a" />
      <g transform="translate(400 230)">
        <circle r="215" fill="#0d2230" stroke="url(#ob-brass)" strokeWidth="10" />
        <circle r="190" fill="none" stroke="#1d4a60" strokeWidth="2" />
        {ticks.map((a) => (
          <line key={a} x1="0" y1="-190" x2="0" y2="-166" stroke="#d9a441" strokeWidth="5" transform={`rotate(${a})`} />
        ))}
        <g className="ob-spin" style={{ animationDuration: "720s" }}>
          <path d="M-5 20 L0 -130 L5 20Z" fill="#d9a441" />
        </g>
        <g className="ob-spin" style={{ animationDuration: "60s" }}>
          <path d="M-4 20 L0 -170 L4 20Z" fill="#f6d98a" />
        </g>
        <circle r="10" fill="url(#ob-brass)" />
      </g>
      <g transform="translate(110 150)" opacity="0.9">
        <path className="ob-spin" d={gearPath(70, 14, 14)} fill="#16384a" stroke="#d9a441" strokeWidth="2" />
        <circle r="22" fill="#07131a" />
      </g>
      <g transform="translate(200 270)" opacity="0.9">
        <path className="ob-spin-rev" d={gearPath(44, 9, 11)} fill="#1b4258" stroke="#d9a441" strokeWidth="2" />
        <circle r="14" fill="#07131a" />
      </g>
      <g transform="translate(700 340)" opacity="0.9">
        <path className="ob-spin-rev" d={gearPath(84, 16, 15)} fill="#16384a" stroke="#d9a441" strokeWidth="2" />
        <circle r="26" fill="#07131a" />
      </g>
      <g transform="translate(610 190)" opacity="0.9">
        <path className="ob-spin" d={gearPath(36, 8, 9)} fill="#1b4258" stroke="#d9a441" strokeWidth="2" />
        <circle r="11" fill="#07131a" />
      </g>
      <g transform="translate(400 20)">
        <g className="ob-swing">
          <line x1="0" y1="0" x2="0" y2="470" stroke="#8a6320" strokeWidth="3" />
          <circle cx="0" cy="470" r="22" fill="url(#ob-brass)" />
        </g>
      </g>
      <rect y="470" width="800" height="30" fill="#0a1c26" />
      <Dust color="#9fd0ea" />
    </Frame>
  );
}

function Cupola() {
  return (
    <Frame>
      <rect width="800" height="500" fill="#05060f" />
      <clipPath id="ob-slit">
        <path d="M330 0 H470 L520 400 H280Z" />
      </clipPath>
      <path d="M0 500 V220 C0 70 190 -20 400 -20 C610 -20 800 70 800 220 V500Z" fill="#101534" />
      <g clipPath="url(#ob-slit)">
        <rect width="800" height="500" fill="url(#ob-night)" />
        <Stars below={400} />
        <ellipse cx="400" cy="170" rx="150" ry="26" fill="#b89cff" opacity="0.3" transform="rotate(-24 400 170)" />
        <ellipse cx="400" cy="170" rx="80" ry="12" fill="#f5e7ff" opacity="0.35" transform="rotate(-24 400 170)" />
        <g className="ob-shoot">
          <line x1="480" y1="60" x2="500" y2="48" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
      <path d="M330 0 L280 400 M470 0 L520 400" stroke="url(#ob-brass)" strokeWidth="6" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M${60 + i * 5} ${400 - i * 52} Q400 ${330 - i * 60} ${740 - i * 5} ${400 - i * 52}`} stroke="#1d2350" strokeWidth="2" fill="none" />
      ))}
      <g transform="translate(130 260)">
        <circle r="70" fill="none" stroke="url(#ob-brass)" strokeWidth="3" className="ob-spin" />
        <ellipse rx="70" ry="24" fill="none" stroke="#d9a441" strokeWidth="2.5" className="ob-spin-rev" />
        <ellipse rx="24" ry="70" fill="none" stroke="#f6d98a" strokeWidth="2.5" className="ob-spin" style={{ animationDuration: "40s" }} />
        <circle r="9" fill="#f6d98a" className="ob-glow" />
      </g>
      <g transform="translate(640 330) rotate(-38)">
        <rect x="-16" y="-110" width="32" height="150" rx="6" fill="url(#ob-brass)" />
        <rect x="-22" y="-124" width="44" height="18" rx="4" fill="#5e3a10" />
        <rect x="-8" y="30" width="16" height="70" fill="#3b2a12" />
      </g>
      <polygon points="0,500 800,500 800,420 0,420" fill="#0a0d24" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={400 + (i - 6) * 20} y1="420" x2={400 + (i - 6) * 150} y2="500" stroke="#1f2552" strokeWidth="1.3" />
      ))}
      <Dust color="#c9b8ff" />
    </Frame>
  );
}

const SCENES: Record<string, () => React.ReactElement> = { atrio: Atrio, biblioteca: Biblioteca, torre: Torre, cupola: Cupola };

export function RoomScene({ id }: { id: string }) {
  const Scene = SCENES[id] ?? Atrio;
  return <Scene />;
}
