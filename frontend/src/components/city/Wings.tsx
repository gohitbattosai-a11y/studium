import type { AnimalSpecies } from "@/lib/domain/animals";
import { shade } from "./animalSvg";

export default function Wings({ a, silhouette }: { a: AnimalSpecies; silhouette?: boolean }) {
  const base = silhouette ? "#141b24" : a.colors[0];
  const tip = silhouette ? "#0e141b" : a.colors[2];
  const near = silhouette ? "#1b2430" : shade(base, -0.1);
  const far = silhouette ? "#0e141b" : shade(base, -0.35);
  const owl = a.kind === "owl";
  const wing = "M80 62 C68 48 50 42 28 46 C40 52 48 58 54 64 C46 64 38 66 30 72 C46 74 62 72 78 70Z";
  const side = "M0 0 C-12 -14 -30 -20 -50 -16 C-40 -8 -34 -2 -30 4 C-38 4 -46 8 -52 14 C-36 16 -18 12 0 10Z";
  if (owl) {
    return (
      <svg viewBox="0 0 160 120" className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
        <g transform="translate(58 70)">
          <g className="fo-wing-s fo-wing-sl">
            <path d={side} fill={near} />
            <path d="M-30 4 C-38 4 -46 8 -52 14 C-36 16 -18 12 0 10Z" fill={tip} opacity="0.85" />
          </g>
        </g>
        <g transform="translate(102 70) scale(-1 1)">
          <g className="fo-wing-s fo-wing-sr">
            <path d={side} fill={near} />
            <path d="M-30 4 C-38 4 -46 8 -52 14 C-36 16 -18 12 0 10Z" fill={tip} opacity="0.85" />
          </g>
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 120" className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
      <g className="fo-wing fo-wing-far">
        <path d={wing} fill={far} />
      </g>
      <g className="fo-wing fo-wing-near">
        <path d={wing} fill={near} />
        <path d="M54 64 C46 64 38 66 30 72 C46 74 62 72 78 70Z" fill={tip} opacity="0.85" />
        <path d="M74 64 C60 54 46 50 32 50" stroke={shade(base, 0.25)} strokeWidth="1.3" fill="none" opacity="0.5" />
      </g>
    </svg>
  );
}
