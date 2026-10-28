import { scopeSvg, type ArtFit } from "./svgScope";

export type ArtKind = "decorations" | "backgrounds" | "pets";

const FIT: Record<ArtKind, ArtFit> = { decorations: "meet", backgrounds: "slice", pets: "meet" };

const files = import.meta.glob("../assets/art/**/*.svg", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const store: Record<ArtKind, Map<string, string>> = { decorations: new Map(), backgrounds: new Map(), pets: new Map() };

for (const [path, raw] of Object.entries(files)) {
  const m = /\/art\/(decorations|backgrounds|pets)\/([^/]+)\.svg$/.exec(path);
  if (!m) continue;
  const kind = m[1] as ArtKind;
  const scoped = scopeSvg(raw, `${kind}-${m[2]}`, FIT[kind]);
  if (scoped) store[kind].set(m[2], scoped);
  else console.warn(`SVG non valido: ${path}`);
}

export const getArt = (kind: ArtKind, id: string | null | undefined): string | null => (id ? (store[kind].get(id) ?? null) : null);

export const hasArt = (kind: ArtKind, id: string | null | undefined): boolean => getArt(kind, id) !== null;
