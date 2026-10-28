import type { ComponentType, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { getArt } from "@/lib/svgAssets";
import "./pets.css";

export type PetState = "idle" | "walk" | "hop" | "sleep";

function Leg({ x, y = 58, h = 13, w = 6, color, foot, group }: { x: number; y?: number; h?: number; w?: number; color: string; foot?: string; group: "a" | "b" }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={cn("pt-leg", group === "a" ? "pt-leg-a" : "pt-leg-b")}>
        <rect x={-w / 2} y="0" width={w} height={h} rx={w / 2} fill={color} />
        {foot && <ellipse cx="1" cy={h} rx={w / 2 + 1.6} ry="2.5" fill={foot} />}
      </g>
    </g>
  );
}

const Shadow = ({ rx = 26 }: { rx?: number }) => <ellipse cx="50" cy="73" rx={rx} ry="3.6" fill="#000000" opacity="0.22" />;

const Eye = ({ cx, cy, r = 2.4, color = "#1f2937" }: { cx: number; cy: number; r?: number; color?: string }) => (
  <g className="pt-eye">
    <circle cx={cx} cy={cy} r={r} fill={color} />
    <circle cx={cx + r * 0.35} cy={cy - r * 0.4} r={r * 0.35} fill="#ffffff" />
  </g>
);

function Coniglio() {
  return (
    <g>
      <Shadow />
      <Leg x={30} color="#cbd5e1" foot="#e2e8f0" group="b" />
      <Leg x={58} color="#cbd5e1" foot="#e2e8f0" group="a" />
      <g className="pt-body">
        <circle className="pt-tail" cx="23" cy="49" r="7" fill="#ffffff" style={{ transformOrigin: "30px 50px" }} />
        <ellipse cx="46" cy="51" rx="23" ry="16" fill="#f8fafc" />
        <ellipse cx="50" cy="58" rx="14" ry="7" fill="#e2e8f0" />
        <g className="pt-ear" style={{ transformOrigin: "62px 28px" }}>
          <ellipse cx="62" cy="15" rx="4.6" ry="13.5" fill="#f8fafc" transform="rotate(-10 62 15)" />
          <ellipse cx="62" cy="16" rx="2.2" ry="9" fill="#fda4af" transform="rotate(-10 62 16)" />
        </g>
        <g className="pt-ear" style={{ transformOrigin: "73px 28px", animationDelay: "-1.2s" }}>
          <ellipse cx="73" cy="14" rx="4.6" ry="13.5" fill="#f1f5f9" transform="rotate(9 73 14)" />
          <ellipse cx="73" cy="15" rx="2.2" ry="9" fill="#fda4af" transform="rotate(9 73 15)" />
        </g>
        <circle cx="68" cy="39" r="13" fill="#ffffff" />
        <circle cx="72" cy="45" r="3.4" fill="#fda4af" opacity="0.6" />
        <Eye cx={73} cy={37} />
        <ellipse cx="80.5" cy="40.5" rx="2" ry="1.6" fill="#fb7185" />
        <path d="M78 44 Q80 46 82 44" fill="none" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      </g>
      <Leg x={40} color="#e2e8f0" foot="#ffffff" group="a" />
      <Leg x={67} color="#e2e8f0" foot="#ffffff" group="b" />
    </g>
  );
}

function Gatto() {
  return (
    <g>
      <Shadow />
      <Leg x={31} color="#d97706" foot="#fde68a" group="b" />
      <Leg x={59} color="#d97706" foot="#fde68a" group="a" />
      <g className="pt-body">
        <path className="pt-tail" d="M26 52 C10 54 6 36 14 26" fill="none" stroke="#f59e0b" strokeWidth="6.5" strokeLinecap="round" style={{ transformOrigin: "27px 52px" }} />
        <ellipse cx="46" cy="51" rx="23" ry="16" fill="#f59e0b" />
        <ellipse cx="52" cy="59" rx="14" ry="6.5" fill="#fde68a" opacity="0.85" />
        <g fill="none" stroke="#b45309" strokeWidth="2.4" strokeLinecap="round">
          <path d="M34 38 q2 6 0 12" />
          <path d="M42 36 q2 7 0 14" />
          <path d="M50 36 q2 6 0 12" />
        </g>
        <path d="M57 32 L58 13 L70 26 Z" fill="#f59e0b" />
        <path d="M59 28 L60 19 L66 26 Z" fill="#fda4af" />
        <path d="M69 26 L80 13 L81 33 Z" fill="#d97706" />
        <path d="M72 28 L78 20 L78 30 Z" fill="#fda4af" />
        <circle cx="69" cy="39" r="13" fill="#f59e0b" />
        <g fill="none" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round">
          <path d="M66 28 v5" />
          <path d="M70 27 v6" />
        </g>
        <ellipse cx="75" cy="45" rx="6" ry="4.4" fill="#fde68a" />
        <g className="pt-eye">
          <ellipse cx="73" cy="37" rx="2.7" ry="3.2" fill="#4ade80" />
          <ellipse cx="73.4" cy="37" rx="0.9" ry="2.6" fill="#14532d" />
        </g>
        <path d="M78 41 L82 41 L80 44 Z" fill="#fb7185" />
        <path d="M80 44 Q78 47 75 46 M80 44 Q82 47 85 46" fill="none" stroke="#92400e" strokeWidth="0.9" strokeLinecap="round" />
        <g stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.9">
          <path d="M80 43 L91 40" />
          <path d="M80 45 L91 46" />
        </g>
      </g>
      <Leg x={41} color="#f59e0b" foot="#ffffff" group="a" />
      <Leg x={68} color="#f59e0b" foot="#ffffff" group="b" />
    </g>
  );
}

function Cane() {
  return (
    <g>
      <Shadow />
      <Leg x={31} color="#b98448" foot="#8b5a2b" group="b" />
      <Leg x={59} color="#b98448" foot="#8b5a2b" group="a" />
      <g className="pt-body">
        <path className="pt-tail" d="M25 49 C14 48 11 38 16 30" fill="none" stroke="#d6a46a" strokeWidth="6.5" strokeLinecap="round" style={{ transformOrigin: "26px 49px", animationDuration: "0.5s" }} />
        <ellipse cx="46" cy="51" rx="24" ry="16" fill="#d6a46a" />
        <ellipse cx="37" cy="46" rx="10" ry="7.5" fill="#92602f" />
        <ellipse cx="52" cy="60" rx="14" ry="6" fill="#f1d4a8" />
        <ellipse cx="73" cy="29" rx="4.2" ry="8" fill="#92602f" transform="rotate(-28 73 29)" />
        <circle cx="68" cy="39" r="13" fill="#d6a46a" />
        <ellipse cx="78" cy="44" rx="8.5" ry="6.2" fill="#f1d4a8" />
        <ellipse cx="85" cy="42" rx="3" ry="2.4" fill="#1f2937" />
        <ellipse className="pt-tongue" cx="79" cy="51" rx="2.8" ry="3.6" fill="#fb7185" />
        <path d="M75 47 Q80 50 84 46" fill="none" stroke="#7c4a1e" strokeWidth="1" strokeLinecap="round" />
        <Eye cx={72} cy={36} />
        <g className="pt-ear" style={{ transformOrigin: "62px 30px" }}>
          <ellipse cx="60" cy="39" rx="5.8" ry="11.5" fill="#7c4a1e" transform="rotate(16 60 39)" />
        </g>
        <path d="M55 47 Q59 55 57 60" fill="none" stroke="#ef4444" strokeWidth="4.4" strokeLinecap="round" />
        <circle cx="58" cy="61" r="2.1" fill="#fbbf24" />
      </g>
      <Leg x={41} color="#d6a46a" foot="#f1d4a8" group="a" />
      <Leg x={68} color="#d6a46a" foot="#f1d4a8" group="b" />
    </g>
  );
}

function Tartaruga() {
  return (
    <g style={{ ["--pt-slow" as string]: 1.8 } as CSSProperties}>
      <Shadow rx={30} />
      <Leg x={26} y={60} h={11} w={9} color="#65a30d" group="b" />
      <Leg x={60} y={60} h={11} w={9} color="#65a30d" group="a" />
      <g className="pt-body">
        <path className="pt-tail" d="M16 62 L7 66 L17 67 Z" fill="#84cc16" style={{ transformOrigin: "16px 64px" }} />
        <ellipse cx="81" cy="55" rx="9" ry="5" fill="#84cc16" />
        <circle cx="85" cy="51" r="8.5" fill="#84cc16" />
        <Eye cx={88} cy={49} r={2} />
        <path d="M86 55 Q89 57 91 54" fill="none" stroke="#3f6212" strokeWidth="1" strokeLinecap="round" />
        <path d="M14 64 C14 38 32 24 46 24 C60 24 78 38 78 64 Z" fill="#15803d" />
        <rect x="12" y="62" width="68" height="7" rx="3.5" fill="#a16207" />
        <g fill="#22c55e" stroke="#14532d" strokeWidth="1.3" strokeLinejoin="round">
          <path d="M46 36 L54 40 L54 49 L46 53 L38 49 L38 40 Z" />
          <path d="M26 54 L33 49 L38 55 L35 62 L26 62 Z" />
          <path d="M66 54 L59 49 L54 55 L57 62 L66 62 Z" />
          <path d="M36 30 L46 26 L56 30 L54 35 L38 35 Z" />
        </g>
      </g>
      <Leg x={38} y={60} h={11} w={9} color="#84cc16" group="a" />
      <Leg x={70} y={60} h={11} w={9} color="#84cc16" group="b" />
    </g>
  );
}

function Lupo() {
  return (
    <g>
      <Shadow rx={28} />
      <Leg x={30} color="#64748b" foot="#cbd5e1" group="b" />
      <Leg x={58} color="#64748b" foot="#cbd5e1" group="a" />
      <g className="pt-body">
        <g className="pt-tail" style={{ transformOrigin: "26px 48px" }}>
          <path d="M26 50 C8 54 3 34 14 24 C17 34 23 38 29 42 Z" fill="#94a3b8" />
          <path d="M14 24 C10 29 9 34 11 39 C14 35 15 30 17 27 Z" fill="#e2e8f0" />
        </g>
        <ellipse cx="46" cy="51" rx="25" ry="16" fill="#94a3b8" />
        <ellipse cx="49" cy="59" rx="16" ry="7" fill="#cbd5e1" />
        <path d="M24 45 Q46 27 70 40 L70 45 Q46 37 24 50 Z" fill="#64748b" opacity="0.7" />
        <path d="M52 37 L56 28 L59 38 Z M44 36 L47 28 L51 37 Z M36 38 L38 30 L43 38 Z" fill="#64748b" />
        <path d="M60 44 L55 54 L67 49 Z" fill="#cbd5e1" />
        <g className="pt-ear" style={{ transformOrigin: "66px 28px" }}>
          <path d="M60 31 L61 11 L72 26 Z" fill="#94a3b8" />
          <path d="M62 27 L63 17 L69 25 Z" fill="#475569" />
        </g>
        <g className="pt-ear" style={{ transformOrigin: "76px 28px", animationDelay: "-1s" }}>
          <path d="M72 26 L81 11 L83 33 Z" fill="#7b8aa0" />
          <path d="M76 27 L80 18 L80 30 Z" fill="#475569" />
        </g>
        <circle cx="70" cy="39" r="12.8" fill="#94a3b8" />
        <ellipse cx="80" cy="44" rx="9" ry="6.4" fill="#cbd5e1" />
        <circle cx="88" cy="42" r="2.5" fill="#0f172a" />
        <path d="M76 47 Q82 51 88 46" fill="none" stroke="#475569" strokeWidth="1.1" strokeLinecap="round" />
        <circle className="pt-glow" cx="77" cy="36" r="6" fill="#fde68a" />
        <g className="pt-eye">
          <ellipse cx="77" cy="36" rx="3.2" ry="2.1" fill="#fbbf24" transform="rotate(-14 77 36)" />
          <ellipse cx="77.6" cy="36" rx="0.9" ry="1.8" fill="#1f2937" />
        </g>
      </g>
      <Leg x={40} color="#94a3b8" foot="#e2e8f0" group="a" />
      <Leg x={68} color="#94a3b8" foot="#e2e8f0" group="b" />
    </g>
  );
}

function Drago() {
  return (
    <g>
      <Shadow rx={28} />
      <g className="pt-wing" style={{ transformOrigin: "42px 38px" }}>
        <path d="M42 40 C32 18 16 8 4 10 C11 17 13 24 14 31 C19 27 24 29 27 36 C31 32 36 34 40 42 Z" fill="#5b21b6" stroke="#a78bfa" strokeWidth="0.9" strokeLinejoin="round" />
        <path d="M42 40 L8 12 M42 40 L16 30 M42 40 L27 37" fill="none" stroke="#a78bfa" strokeWidth="0.8" opacity="0.8" />
      </g>
      <Leg x={31} color="#5b21b6" foot="#fde68a" group="b" />
      <Leg x={59} color="#5b21b6" foot="#fde68a" group="a" />
      <g className="pt-body">
        <g className="pt-tail" style={{ transformOrigin: "27px 52px" }}>
          <path d="M27 58 C15 62 6 56 4 46 C10 50 17 50 25 46 Z" fill="#7c3aed" />
          <path d="M3 48 L6 38 L12 48 Z" fill="#5eead4" />
        </g>
        <ellipse cx="46" cy="52" rx="23" ry="15.5" fill="#7c3aed" />
        <ellipse cx="50" cy="59" rx="15" ry="7.5" fill="#5eead4" opacity="0.92" />
        <g stroke="#2dd4bf" strokeWidth="0.9" opacity="0.8" fill="none">
          <path d="M40 57 q10 3 20 0" />
          <path d="M42 61 q8 2.4 16 0" />
        </g>
        <path d="M30 41 L34 32 L38 39 Z M40 38 L44 29 L48 37 Z M50 38 L54 30 L58 38 Z" fill="#5eead4" />
        <g className="pt-ear" style={{ transformOrigin: "64px 28px" }}>
          <path d="M62 30 L55 11 L68 27 Z" fill="#fde68a" />
          <path d="M70 28 L73 9 L79 30 Z" fill="#fcd34d" />
        </g>
        <circle cx="68" cy="39" r="12.5" fill="#7c3aed" />
        <ellipse cx="78" cy="44" rx="8.5" ry="5.8" fill="#8b5cf6" />
        <circle cx="83.5" cy="42" r="1.1" fill="#312e81" />
        <path d="M74 47 Q79 50 84 46" fill="none" stroke="#312e81" strokeWidth="1.1" strokeLinecap="round" />
        <path className="pt-flame" d="M86 45 C91 40 96 44 93 47 C96 49 91 52 86 48 Z" fill="#fb923c" />
        <path className="pt-flame" d="M87 46 C90 44 93 46 91 47.5 C93 48.5 90 50 87 48 Z" fill="#fde047" />
        <g className="pt-eye">
          <ellipse cx="73" cy="36" rx="3.2" ry="2.8" fill="#fbbf24" />
          <rect x="72.4" y="33.6" width="1.3" height="4.8" rx="0.6" fill="#1f2937" />
        </g>
      </g>
      <Leg x={41} color="#6d28d9" foot="#fde68a" group="a" />
      <Leg x={68} color="#6d28d9" foot="#fde68a" group="b" />
    </g>
  );
}

function Gufo() {
  return (
    <g>
      <Shadow rx={24} />
      <Leg x={40} y={60} h={11} w={5} color="#f59e0b" foot="#d97706" group="b" />
      <Leg x={56} y={60} h={11} w={5} color="#f59e0b" foot="#d97706" group="a" />
      <g className="pt-body">
        <g className="pt-tail" style={{ transformOrigin: "28px 56px" }}>
          <path d="M28 50 L9 62 L14 67 L31 62 Z" fill="#78350f" />
        </g>
        <ellipse cx="46" cy="50" rx="23" ry="17" fill="#92400e" />
        <ellipse cx="52" cy="54" rx="14" ry="11" fill="#fde68a" />
        <path d="M46 50 q3 3 6 0 M52 56 q3 3 6 0 M44 57 q3 3 6 0" fill="none" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" />
        <g className="pt-wing" style={{ transformOrigin: "36px 44px" }}>
          <path d="M40 40 C24 40 18 54 24 64 C34 62 44 54 46 44 Z" fill="#78350f" stroke="#451a03" strokeWidth="0.8" strokeLinejoin="round" />
        </g>
        <g className="pt-ear" style={{ transformOrigin: "62px 24px" }}>
          <path d="M55 24 L57 11 L65 21 Z" fill="#78350f" />
        </g>
        <g className="pt-ear" style={{ transformOrigin: "74px 24px", animationDelay: "-1.4s" }}>
          <path d="M69 21 L77 11 L79 24 Z" fill="#78350f" />
        </g>
        <circle cx="67" cy="34" r="14" fill="#a16207" />
        <circle cx="61" cy="34" r="6.8" fill="#fef3c7" />
        <circle cx="73" cy="34" r="6.8" fill="#fef3c7" />
        <g className="pt-eye">
          <circle cx="61" cy="34" r="4" fill="#fbbf24" />
          <circle cx="61.6" cy="34" r="2" fill="#111827" />
          <circle cx="73" cy="34" r="4" fill="#fbbf24" />
          <circle cx="73.6" cy="34" r="2" fill="#111827" />
        </g>
        <path d="M64.5 38 L67 45 L69.5 38 Z" fill="#f97316" />
      </g>
    </g>
  );
}

function Volpe() {
  return (
    <g>
      <Shadow rx={27} />
      <Leg x={30} color="#9a3412" foot="#1f2937" group="b" />
      <Leg x={58} color="#9a3412" foot="#1f2937" group="a" />
      <g className="pt-body">
        <g className="pt-tail" style={{ transformOrigin: "26px 50px" }}>
          <path d="M26 52 C6 58 -2 38 10 26 C14 36 21 40 29 43 Z" fill="#ea580c" />
          <path d="M10 26 C5 31 3 37 5 43 C10 40 12 33 15 30 Z" fill="#fff7ed" />
        </g>
        <ellipse cx="46" cy="51" rx="24" ry="16" fill="#ea580c" />
        <ellipse cx="50" cy="59" rx="15" ry="7" fill="#fff7ed" />
        <g className="pt-ear" style={{ transformOrigin: "66px 28px" }}>
          <path d="M60 31 L61 10 L72 26 Z" fill="#ea580c" />
          <path d="M62 27 L63 16 L69 25 Z" fill="#1f2937" />
        </g>
        <g className="pt-ear" style={{ transformOrigin: "76px 28px", animationDelay: "-1s" }}>
          <path d="M72 26 L81 10 L83 33 Z" fill="#c2410c" />
          <path d="M76 27 L80 17 L80 30 Z" fill="#1f2937" />
        </g>
        <circle cx="70" cy="39" r="12.8" fill="#ea580c" />
        <ellipse cx="80" cy="45" rx="9" ry="5.6" fill="#fff7ed" />
        <circle cx="88" cy="43" r="2.2" fill="#1f2937" />
        <path d="M76 48 Q82 51 87 47" fill="none" stroke="#9a3412" strokeWidth="1" strokeLinecap="round" />
        <Eye cx={76} cy={36} r={2.2} />
      </g>
      <Leg x={40} color="#ea580c" foot="#fff7ed" group="a" />
      <Leg x={68} color="#ea580c" foot="#fff7ed" group="b" />
    </g>
  );
}

function Dinosauro() {
  return (
    <g>
      <Shadow rx={30} />
      <Leg x={42} w={9} h={15} color="#15803d" foot="#14532d" group="b" />
      <Leg x={56} w={9} h={15} color="#16a34a" foot="#14532d" group="a" />
      <g className="pt-body">
        <g className="pt-tail" style={{ transformOrigin: "28px 52px" }}>
          <path d="M30 42 C16 44 6 52 0 62 C10 59 19 60 31 59 Z" fill="#16a34a" />
          <path d="M20 50 L16 44 L24 47 Z M11 56 L8 50 L16 53 Z" fill="#f97316" />
        </g>
        <ellipse cx="46" cy="50" rx="22" ry="17" fill="#22c55e" />
        <ellipse cx="50" cy="58" rx="14" ry="7.5" fill="#bbf7d0" />
        <g stroke="#86efac" strokeWidth="0.8" opacity="0.8" fill="none">
          <path d="M42 57 q8 2.4 16 0" />
          <path d="M44 61 q6 2 12 0" />
        </g>
        <path d="M29 38 L33 27 L38 36 Z M38 34 L43 23 L48 33 Z M48 33 L53 24 L58 35 Z" fill="#f97316" />
        <g fill="#15803d" opacity="0.6">
          <circle cx="36" cy="48" r="2" />
          <circle cx="44" cy="44" r="2.4" />
          <circle cx="52" cy="46" r="1.8" />
        </g>
        <path d="M60 51 L67 55 L64.5 58" fill="none" stroke="#15803d" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M61 25 L63 16 L67 25 Z M69 22 L73 13 L75 24 Z" fill="#f97316" />
        <circle cx="68" cy="37" r="13" fill="#22c55e" />
        <ellipse cx="79" cy="41" rx="11.5" ry="7" fill="#4ade80" />
        <path d="M68 46 Q80 53 91 45 L89 43.5 L71 44 Z" fill="#16a34a" />
        <path d="M73 45 L75 48.6 L77 45 Z M79 45.4 L81 49 L83 45.4 Z M85 45 L86.6 48 L88.2 44.6 Z" fill="#fffbeb" />
        <circle cx="87" cy="38.5" r="1.1" fill="#14532d" />
        <path d="M65 31 Q71 29 77 33" fill="none" stroke="#14532d" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M60 36 q3 3 1 7 M64 33 q3 3 1 8" fill="none" stroke="#15803d" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        <g className="pt-eye">
          <ellipse cx="73" cy="35" rx="3.2" ry="2.8" fill="#fde047" />
          <rect x="72.4" y="32.7" width="1.3" height="4.6" rx="0.6" fill="#1f2937" />
        </g>
      </g>
    </g>
  );
}

function Panda() {
  return (
    <g>
      <Shadow rx={28} />
      <circle className="pt-glow" cx="50" cy="42" r="37" fill="#fb7185" fillOpacity="0.1" stroke="#fb7185" strokeWidth="1.2" />
      <g className="pt-glow" fill="#fde68a" style={{ animationDelay: "-1s" }}>
        <path d="M14 20 L15.2 23.2 L18.4 24.4 L15.2 25.6 L14 28.8 L12.8 25.6 L9.6 24.4 L12.8 23.2 Z" />
        <path d="M89 16 L90 18.6 L92.6 19.6 L90 20.6 L89 23.2 L88 20.6 L85.4 19.6 L88 18.6 Z" />
        <path d="M90 62 L91 64.4 L93.4 65.4 L91 66.4 L90 68.8 L89 66.4 L86.6 65.4 L89 64.4 Z" />
      </g>
      <Leg x={31} w={9} color="#1f2937" foot="#111827" group="b" />
      <Leg x={58} w={9} color="#1f2937" foot="#111827" group="a" />
      <g className="pt-body">
        <circle className="pt-tail" cx="22" cy="49" r="4.6" fill="#ffffff" style={{ transformOrigin: "27px 50px" }} />
        <ellipse cx="46" cy="51" rx="24" ry="17" fill="#f8fafc" />
        <ellipse cx="30" cy="58" rx="9" ry="9.5" fill="#1f2937" />
        <ellipse cx="62" cy="54" rx="8" ry="15" fill="#1f2937" />
        <path d="M44 40 q4 -3 8 0" fill="none" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round" />
        <g className="pt-ear" style={{ transformOrigin: "58px 26px" }}>
          <circle cx="58" cy="24" r="5.4" fill="#1f2937" />
          <circle cx="58" cy="24.6" r="2.4" fill="#475569" />
        </g>
        <g className="pt-ear" style={{ transformOrigin: "79px 26px", animationDelay: "-1.3s" }}>
          <circle cx="79" cy="24" r="5.4" fill="#1f2937" />
          <circle cx="79" cy="24.6" r="2.4" fill="#475569" />
        </g>
        <circle cx="68.5" cy="36" r="14.6" fill="#ffffff" />
        <ellipse cx="63" cy="36.4" rx="4.2" ry="5.8" fill="#1f2937" transform="rotate(20 63 36.4)" />
        <ellipse cx="75" cy="36.4" rx="4.2" ry="5.8" fill="#1f2937" transform="rotate(-20 75 36.4)" />
        <g className="pt-eye">
          <circle cx="63.4" cy="36" r="2.2" fill="#ffffff" />
          <circle cx="63.9" cy="36.2" r="1.2" fill="#111827" />
          <circle cx="74.6" cy="36" r="2.2" fill="#ffffff" />
          <circle cx="75.1" cy="36.2" r="1.2" fill="#111827" />
        </g>
        <circle cx="58.6" cy="43" r="2.6" fill="#fda4af" opacity="0.55" />
        <circle cx="79.4" cy="43" r="2.6" fill="#fda4af" opacity="0.55" />
        <ellipse cx="69" cy="42.4" rx="3.2" ry="2.2" fill="#111827" />
        <path d="M69 44.4 Q69 47.6 65.8 48 M69 44.4 Q69 47.6 72.2 48" fill="none" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
        <path d="M68.6 21.6 L71 26.2 L68.6 30.8 L66.2 26.2 Z" fill="#f43f5e" stroke="#fbbf24" strokeWidth="0.8" strokeLinejoin="round" />
        <circle cx="68.6" cy="26.2" r="0.9" fill="#fef3c7" />
      </g>
      <g transform="rotate(12 82 64)">
        <rect x="79.6" y="48" width="4.6" height="26" rx="2.2" fill="#86efac" stroke="#16a34a" strokeWidth="0.7" />
        <path d="M79.6 56 H84.2 M79.6 64 H84.2" stroke="#16a34a" strokeWidth="0.8" />
        <path d="M84 50 C91 45 96 47 98 51 C92 53 88 53 84 51 Z" fill="#4ade80" />
        <path d="M80 58 C74 54 70 55 68 58 C73 60 77 60 80 59 Z" fill="#4ade80" />
      </g>
      <Leg x={42} w={9} color="#111827" foot="#1f2937" group="a" />
      <Leg x={69} w={9} color="#111827" foot="#1f2937" group="b" />
    </g>
  );
}

const ART: Record<string, ComponentType> = {
  coniglio: Coniglio,
  gatto: Gatto,
  cane: Cane,
  tartaruga: Tartaruga,
  gufo: Gufo,
  lupo: Lupo,
  volpe: Volpe,
  drago: Drago,
  dinosauro: Dinosauro,
  panda: Panda,
};

export function PetSprite({ id, state = "idle", facing = 1, className }: { id: string; state?: PetState; facing?: 1 | -1; className?: string }) {
  const custom = getArt("pets", id);
  if (custom) {
    const html = custom.replace("<svg", `<svg class="${cn("pet", className)}" data-state="${state}" style="transform:scaleX(${facing})" aria-hidden="true"`);
    return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  const Art = ART[id];
  if (!Art) return null;
  return (
    <svg viewBox="0 0 100 80" className={cn("pet", className)} data-state={state} style={{ transform: `scaleX(${facing})` }} aria-hidden>
      <Art />
    </svg>
  );
}
