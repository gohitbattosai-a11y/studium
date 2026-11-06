const stadium = import.meta.glob("/src/assets/art/stadium/*.svg", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const cards = import.meta.glob("/src/assets/art/cards/*.svg", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const custom = import.meta.glob("/src/assets/art/cards/players/*.svg", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const index = (files: Record<string, string>, re: RegExp) => {
  const out = new Map<string, string>();
  for (const [path, source] of Object.entries(files)) {
    const m = re.exec(path);
    if (m) out.set(m[1], source.trim());
  }
  return out;
};

const stadiumFiles = index(stadium, /\/stadium\/([^/]+)\.svg$/);
const cardFiles = index(cards, /\/cards\/([^/]+)\.svg$/);
const customFiles = index(custom, /\/cards\/players\/([^/]+)\.svg$/);

const inner = (source: string) => source.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");

export const stadiumArt = (id: string): string => stadiumFiles.get(id) ?? "";
export const stadiumInner = (id: string): string => inner(stadiumArt(id));
export const cardTemplate = (id: string): string => cardFiles.get(id) ?? "";
export const customCardTemplate = (id: string | undefined): string => (id ? customFiles.get(id) ?? "" : "");
