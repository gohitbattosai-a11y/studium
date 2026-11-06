import { useEffect, useState } from "react";
import { scopeSvg, type ArtFit } from "./svgScope";

export type ArtKind = "decorations" | "backgrounds" | "pets" | "boxes";

const FIT: Record<ArtKind, ArtFit> = { decorations: "meet", backgrounds: "slice", pets: "meet", boxes: "meet" };

const loaders = import.meta.glob("/src/assets/art/*/*.svg", { query: "?raw", import: "default" }) as Record<string, () => Promise<string>>;

const index: Record<ArtKind, Map<string, () => Promise<string>>> = { decorations: new Map(), backgrounds: new Map(), pets: new Map(), boxes: new Map() };
const cache = new Map<string, string | null>();
const pending = new Map<string, Promise<string | null>>();

for (const [path, load] of Object.entries(loaders)) {
  const m = /\/art\/(decorations|backgrounds|pets|boxes)\/([^/]+)\.svg$/.exec(path);
  if (m) index[m[1] as ArtKind].set(m[2], load);
}

const keyOf = (kind: ArtKind, id: string) => `${kind}:${id}`;

export const hasArt = (kind: ArtKind, id: string | null | undefined): boolean => !!id && index[kind].has(id);

export const peekArt = (kind: ArtKind, id: string): string | null | undefined => cache.get(keyOf(kind, id));

export function loadArt(kind: ArtKind, id: string): Promise<string | null> {
  const key = keyOf(kind, id);
  if (cache.has(key)) return Promise.resolve(cache.get(key) ?? null);
  const hit = pending.get(key);
  if (hit) return hit;
  const load = index[kind].get(id);
  if (!load) return Promise.resolve(null);
  const job = load()
    .then((source) => {
      const out = scopeSvg(source, key.replace(":", "-"), FIT[kind]);
      if (!out) console.warn(`SVG non valido: ${kind}/${id}`);
      cache.set(key, out);
      return out;
    })
    .catch(() => {
      cache.set(key, null);
      return null;
    })
    .finally(() => pending.delete(key));
  pending.set(key, job);
  return job;
}

export function useArt(kind: ArtKind, id: string | null | undefined): string | null {
  const [, bump] = useState(0);
  const value = id ? peekArt(kind, id) : null;
  useEffect(() => {
    if (!id || value !== undefined) return;
    let live = true;
    void loadArt(kind, id).then(() => {
      if (live) bump((n) => n + 1);
    });
    return () => {
      live = false;
    };
  }, [kind, id, value]);
  return value ?? null;
}

const frozen = new Map<string, string>();

export function staticArtUrl(kind: ArtKind, id: string): string | null {
  const key = keyOf(kind, id);
  const known = frozen.get(key);
  if (known) return known;
  const source = peekArt(kind, id);
  if (!source) return null;
  const still = source.replace(/<\/svg>\s*$/i, '<style>*{animation:none!important;transition:none!important}[class*="-pk-"]{display:none}</style></svg>');
  const url = URL.createObjectURL(new Blob([still], { type: "image/svg+xml" }));
  frozen.set(key, url);
  return url;
}

export function useStaticArt(kind: ArtKind, id: string | null | undefined): string | null {
  const art = useArt(kind, id);
  return art && id ? staticArtUrl(kind, id) : null;
}
