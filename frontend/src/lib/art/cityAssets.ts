export type CityGroup = "props" | "landmarks";

const files = import.meta.glob("/src/assets/art/city/*/*.svg", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const store: Record<CityGroup, Map<string, string>> = { props: new Map(), landmarks: new Map() };

for (const [path, source] of Object.entries(files)) {
  const m = /\/city\/(props|landmarks)\/([^/]+)\.svg$/.exec(path);
  if (m) store[m[1] as CityGroup].set(m[2], source.trim());
}

export const cityArt = (group: CityGroup, id: string): string | null => store[group].get(id) ?? null;

export const cityInner = (group: CityGroup, id: string): string => {
  const source = cityArt(group, id);
  return source ? source.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "") : "";
};
