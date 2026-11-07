import { useId, type ReactNode } from "react";
import type { FossilSpecies } from "@/lib/domain/fossils";

const B1 = "#f1e6c9";
const B2 = "#c9b98c";
const B3 = "#6b5a3c";
const ROCK = "#7b6c55";

function Bone({ d, w = 7 }: { d: string; w?: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={B3} strokeWidth={w + 5} />
      <path d={d} stroke={B1} strokeWidth={w} />
    </g>
  );
}

function Art({ s, uid }: { s: FossilSpecies; uid: string }): ReactNode {
  switch (s.kind) {
    case "ammonite":
      return (
        <g stroke={B3} strokeWidth="3">
          {[[100, 72, B2], [106, 54, B1], [110, 38, B2], [112, 24, B1], [113, 12, B2]].map(([cx, r, f], i) => (
            <circle key={i} cx={cx as number} cy={100} r={r as number} fill={f as string} />
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <line key={i} x1="100" y1="100" x2="100" y2="34" transform={`rotate(${i * 22.5} 100 100)`} stroke={B3} strokeOpacity="0.45" strokeWidth="2.5" />
          ))}
          <circle cx="113" cy="100" r="5" fill={B3} />
        </g>
      );
    case "trilobite":
      return (
        <g stroke={B3} strokeWidth="3">
          <path d="M30 100 C30 55 70 38 105 38 L105 162 C70 162 30 145 30 100Z" fill={B1} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={105 + i * 20} y={42 + i * 2} width="20" height={116 - i * 4} rx="8" fill={i % 2 ? B2 : B1} />
          ))}
          <path d="M225 66 C275 72 280 128 225 134Z" fill={B1} />
          <rect x="30" y="88" width="240" height="24" rx="12" fill={B2} fillOpacity="0.7" stroke="none" />
          <ellipse cx="62" cy="76" rx="9" ry="13" fill={B3} />
          <ellipse cx="62" cy="124" rx="9" ry="13" fill={B3} />
        </g>
      );
    case "brachiopod":
      return (
        <g stroke={B3} strokeWidth="3">
          <path d="M100 168 C40 142 22 82 55 55 Q100 22 145 55 C178 82 160 142 100 168Z" fill={B1} />
          {Array.from({ length: 9 }, (_, i) => {
            const a = -64 + i * 16;
            const x = 100 + Math.sin((a * Math.PI) / 180) * 78;
            const y = 108 - Math.cos((a * Math.PI) / 180) * 78;
            return <line key={i} x1="100" y1="160" x2={x} y2={y} stroke={B2} strokeWidth="4" />;
          })}
          <ellipse cx="100" cy="162" rx="14" ry="9" fill={B2} />
        </g>
      );
    case "tooth":
      return (
        <g stroke={B3} strokeWidth="3">
          <path d="M45 165 h110 v20 q-55 12 -110 0Z" fill={B2} />
          <path d="M100 22 C122 70 162 112 152 165 L48 165 C38 112 78 70 100 22Z" fill={B1} />
          <path d="M100 40 C108 80 128 110 134 150" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="6" />
        </g>
      );
    case "fish":
      return (
        <g>
          <Bone d="M70 100 H235" w={6} />
          {Array.from({ length: 10 }, (_, i) => {
            const x = 100 + i * 14;
            return <Bone key={i} d={`M${x} 100 q-8 -22 -16 -34 M${x} 100 q-8 22 -16 34`} w={3} />;
          })}
          <ellipse cx="62" cy="100" rx="38" ry="32" fill={B1} stroke={B3} strokeWidth="3" />
          <circle cx="52" cy="92" r="8" fill={ROCK} stroke={B3} strokeWidth="2" />
          <path d="M235 100 L282 60 L268 100 L282 140Z" fill={B1} stroke={B3} strokeWidth="3" />
          <path d="M110 66 L150 40 L190 66" fill="none" stroke={B3} strokeWidth="3" />
          <path d="M110 134 L150 160 L190 134" fill="none" stroke={B3} strokeWidth="3" />
        </g>
      );
    case "fern":
      return (
        <g fill="#3a3225" stroke="none">
          <path d="M100 285 C96 200 108 110 100 28" fill="none" stroke="#3a3225" strokeWidth="5" strokeLinecap="round" />
          {Array.from({ length: 12 }, (_, i) => {
            const y = 262 - i * 20;
            const l = 52 - i * 2.8;
            return (
              <g key={i}>
                <ellipse cx={100 - l / 2 - 4} cy={y} rx={l / 2} ry="6" transform={`rotate(-24 ${100 - 4} ${y})`} />
                <ellipse cx={100 + l / 2 + 4} cy={y} rx={l / 2} ry="6" transform={`rotate(24 ${100 + 4} ${y})`} />
              </g>
            );
          })}
        </g>
      );
    case "amber":
      return (
        <g>
          <defs>
            <radialGradient id={`${uid}-am`} cx="0.4" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#ffd37a" />
              <stop offset="1" stopColor="#c9701a" />
            </radialGradient>
          </defs>
          <path d="M100 28 C150 24 178 70 170 118 C164 160 126 176 92 170 C48 162 26 122 36 80 C44 46 68 30 100 28Z" fill={`url(#${uid}-am)`} stroke="#8a4a12" strokeWidth="3" />
          <ellipse cx="78" cy="62" rx="14" ry="8" fill="#ffffff" fillOpacity="0.4" transform="rotate(-30 78 62)" />
          <g stroke="#3a2410" strokeWidth="2" fill="#3a2410">
            <ellipse cx="100" cy="106" rx="9" ry="16" />
            <circle cx="100" cy="86" r="6" />
            <path d="M92 100 C70 80 62 96 80 112Z M108 100 C130 80 138 96 120 112Z" fill="#ffffff" fillOpacity="0.55" stroke="#3a2410" />
            <path d="M93 108 L74 124 M93 114 L76 136 M107 108 L126 124 M107 114 L124 136" fill="none" />
          </g>
        </g>
      );
    case "claw":
      return (
        <g stroke={B3} strokeWidth="3">
          <path d="M40 152 C90 140 150 92 252 38 C238 102 192 162 122 176 C86 184 56 172 40 152Z" fill={B1} />
          <path d="M60 156 C120 140 180 100 238 52" fill="none" stroke={B2} strokeWidth="8" />
          <ellipse cx="52" cy="158" rx="16" ry="22" fill={B2} />
        </g>
      );
    case "egg":
      return (
        <g stroke={B3} strokeWidth="3">
          <ellipse cx="100" cy="105" rx="58" ry="76" fill={B1} />
          <path d="M70 62 L88 88 L74 108 L96 128 L84 152" fill="none" strokeWidth="4" />
          {[[78, 52], [118, 70], [124, 120], [76, 140], [104, 150], [96, 40]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.5" fill={B2} stroke="none" />
          ))}
          <ellipse cx="78" cy="70" rx="10" ry="22" fill="#ffffff" fillOpacity="0.35" stroke="none" />
        </g>
      );
    case "tusk":
      return (
        <g stroke={B3} strokeWidth="3">
          <path d="M30 150 C58 38 200 6 272 92 C236 66 124 72 66 176Z" fill={B1} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M${64 + i * 32} ${120 - i * 20} q10 -26 28 -34`} fill="none" stroke={B2} strokeWidth="5" />
          ))}
          <ellipse cx="46" cy="164" rx="22" ry="14" fill={B2} />
        </g>
      );
    case "skull":
      return (
        <g stroke={B3} strokeWidth="4">
          <path d="M200 70 C260 18 382 38 388 130 C392 202 332 238 250 228Z" fill={B2} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = -70 + i * 22;
            return <circle key={i} cx={296 + Math.sin((a * Math.PI) / 180) * 92} cy={132 - Math.cos((a * Math.PI) / 180) * 98} r="9" fill={B1} />;
          })}
          <path d="M40 190 L90 150 C130 130 190 120 230 130 L262 222 C200 246 110 236 60 216Z" fill={B1} />
          <path d="M40 190 L18 208 L62 218Z" fill={B2} />
          <path d="M120 138 L92 52 L142 128Z" fill={B1} />
          <path d="M168 128 L158 46 L196 126Z" fill={B1} />
          <path d="M70 160 L54 118 L88 150Z" fill={B1} />
          <circle cx="156" cy="168" r="15" fill={ROCK} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={72 + i * 16} y="212" width="8" height="14" fill={B1} strokeWidth="2" />
          ))}
        </g>
      );
    case "bird":
      return (
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const a = -80 + i * 15;
            const x = 170 + Math.sin((a * Math.PI) / 180) * 150;
            const y = 130 - Math.cos((a * Math.PI) / 180) * 110;
            return <Bone key={i} d={`M170 130 L${x} ${y}`} w={4} />;
          })}
          <Bone d="M112 118 C160 138 220 150 280 200 L362 258" w={7} />
          {Array.from({ length: 8 }, (_, i) => (
            <Bone key={i} d={`M${290 + i * 9} ${208 + i * 6} l-14 18 M${290 + i * 9} ${208 + i * 6} l16 -10`} w={3} />
          ))}
          <Bone d="M200 156 L186 220 L166 246 M200 156 L222 214 L240 244" w={6} />
          <circle cx="90" cy="108" r="24" fill={B1} stroke={B3} strokeWidth="3" />
          <circle cx="84" cy="102" r="6" fill={ROCK} />
          <path d="M68 112 L38 124 L68 126Z" fill={B2} stroke={B3} strokeWidth="3" />
          <Bone d="M110 120 C140 128 160 130 176 132" w={6} />
        </g>
      );
    case "rex":
      return (
        <g>
          <Bone d="M122 96 C170 70 250 78 322 112 C380 140 430 180 480 252" w={9} />
          {Array.from({ length: 8 }, (_, i) => (
            <Bone key={i} d={`M${188 + i * 20} ${92 + i * 3} q-4 44 14 76`} w={4} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={340 + i * 16} cy={120 + i * 14.5} r={Math.max(2.5, 8 - i * 0.6)} fill={B1} stroke={B3} strokeWidth="2" />
          ))}
          <Bone d="M262 138 L244 206 L206 262 L168 276 M300 140 L292 210 L274 258 L240 276" w={9} />
          <Bone d="M148 128 L132 150 L148 158" w={4} />
          <path d="M20 96 C20 64 70 44 118 58 C140 66 150 90 142 114 L112 130 L34 128Z" fill={B1} stroke={B3} strokeWidth="4" />
          <path d="M22 112 L134 122" stroke={B3} strokeWidth="3" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${36 + i * 16} 114 l4 14 l4 -14Z`} fill="#ffffff" stroke={B3} strokeWidth="1.5" />
          ))}
          <circle cx="98" cy="84" r="12" fill={ROCK} stroke={B3} strokeWidth="3" />
        </g>
      );
    case "geode":
      return (
        <g>
          <defs>
            <radialGradient id={`${uid}-ge`} cx="0.5" cy="0.5" r="0.6">
              <stop offset="0" stopColor="#f5d0ff" />
              <stop offset="0.6" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#3b1d7a" />
            </radialGradient>
          </defs>
          <path d="M100 18 L168 46 L184 112 L150 176 L82 186 L26 140 L30 66Z" fill="#6b6475" stroke={B3} strokeWidth="3" />
          <path d="M100 46 L146 66 L156 112 L130 154 L84 160 L48 128 L52 80Z" fill={`url(#${uid}-ge)`} stroke="#2a1458" strokeWidth="2" />
          {[[78, 96, 18], [108, 84, 22], [124, 118, 16], [90, 128, 20], [64, 116, 14]].map(([x, y, h], i) => (
            <path key={i} d={`M${x} ${y} l${-6} ${h} h12Z`} fill="#c4f1ff" fillOpacity="0.85" stroke="#ffffff" strokeWidth="1" transform={`rotate(${i * 72} ${x} ${y})`} />
          ))}
          {[[60, 40], [150, 140], [40, 150]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 9} L${x + 2.5} ${y - 2.5} L${x + 9} ${y} L${x + 2.5} ${y + 2.5} L${x} ${y + 9} L${x - 2.5} ${y + 2.5} L${x - 9} ${y} L${x - 2.5} ${y - 2.5}Z`} fill="#fff7c2">
              <animate attributeName="opacity" values="0.2;1;0.2" dur={`${1.6 + i * 0.5}s`} repeatCount="indefinite" />
            </path>
          ))}
        </g>
      );
  }
}

export default function FossilArt({ s, bare, silhouette, className }: { s: FossilSpecies; bare?: boolean; silhouette?: boolean; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const W = s.w * 100;
  const H = s.h * 100;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} style={silhouette ? { filter: "brightness(0) opacity(0.55)" } : undefined} aria-hidden>
      {!bare && (
        <>
          <defs>
            <linearGradient id={`${uid}-rk`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#9a8a70" />
              <stop offset="1" stopColor="#5e5240" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width={W - 6} height={H - 6} rx="22" fill={`url(#${uid}-rk)`} />
          {Array.from({ length: s.w * s.h * 5 }, (_, i) => (
            <circle key={i} cx={(i * 53) % (W - 20) + 10} cy={(i * 37) % (H - 20) + 10} r={1.5 + (i % 3)} fill="#000000" fillOpacity="0.14" />
          ))}
        </>
      )}
      <Art s={s} uid={uid} />
    </svg>
  );
}
