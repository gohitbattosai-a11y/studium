import type { AnimalSpecies } from "@/lib/domain/animals";
import { shade } from "./animalSvg";

export default function Wings({ a, silhouette }: { a: AnimalSpecies; silhouette?: boolean }) {
  const base = silhouette ? "#141b24" : a.colors[0];
  const tip = silhouette ? "#0e141b" : a.colors[2];
  const near = silhouette ? "#1b2430" : shade(base, -0.1);
  const far = silhouette ? "#0e141b" : shade(base, -0.35);
  const wing = "M80 60 C66 40 42 30 10 36 C26 42 36 50 44 58 C34 58 24 62 14 70 C32 72 50 70 70 70Z";
  return (
    <svg viewBox="0 0 160 120" className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
      <g className="fo-wing fo-wing-far">
        <path d={wing} fill={far} />
        <path d="M44 58 C34 58 24 62 14 70 C32 72 50 70 70 70Z" fill={tip} opacity="0.8" />
      </g>
      <g className="fo-wing fo-wing-near">
        <path d={wing} fill={near} />
        <path d="M44 58 C34 58 24 62 14 70 C32 72 50 70 70 70Z" fill={tip} opacity="0.85" />
        <path d="M70 62 C56 50 36 44 18 44" stroke={shade(base, 0.25)} strokeWidth="1.4" fill="none" opacity="0.5" />
      </g>
    </svg>
  );
}
