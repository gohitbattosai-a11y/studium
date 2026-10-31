import { scopeSvg, type ArtFit } from "./svgScope";

export type ArtKind = "decorations" | "backgrounds" | "pets" | "boxes";

const FIT: Record<ArtKind, ArtFit> = { decorations: "meet", backgrounds: "slice", pets: "meet", boxes: "meet" };

const files = import.meta.glob("../assets/art/**/*.svg", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const raw: Record<ArtKind, Map<string, string>> = { decorations: new Map(), backgrounds: new Map(), pets: new Map(), boxes: new Map() };
const scoped = new Map<string, string | null>();

for (const [path, source] of Object.entries(files)) {
  const m = /\/art\/(decorations|backgrounds|pets|boxes)\/([^/]+)\.svg$/.exec(path);
  if (m) raw[m[1] as ArtKind].set(m[2], source);
}

export const getArt = (kind: ArtKind, id: string | null | undefined): string | null => {
  if (!id) return null;
  const key = `${kind}:${id}`;
  if (scoped.has(key)) return scoped.get(key) ?? null;
  const source = raw[kind].get(id);
  if (!source) return null;
  const out = scopeSvg(source, `${kind}-${id}`, FIT[kind]);
  if (!out) console.warn(`SVG non valido: ${kind}/${id}`);
  scoped.set(key, out);
  return out;
};

export const hasArt = (kind: ArtKind, id: string | null | undefined): boolean => !!id && raw[kind].has(id);
