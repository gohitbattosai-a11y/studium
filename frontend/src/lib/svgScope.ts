export type ArtFit = "meet" | "slice";

const SHARED = /^(dc|pt|bgx)-/;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const scopeCss = (css: string, prefix: string, classes: Set<string>, ids: Set<string>) => {
  let out = css.replace(/<!\[CDATA\[|\]\]>/g, "");
  if (ids.size) {
    out = out.replace(/([^{}]+)\{/g, (m, sel: string) => {
      if (sel.trim().startsWith("@")) return m;
      let s = sel;
      for (const id of ids) s = s.replace(new RegExp(`#${esc(id)}(?![\\w-])`, "g"), `#${prefix}${id}`);
      return `${s}{`;
    });
  }
  const frames = new Set([...out.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
  for (const m of out.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) if (!SHARED.test(m[1])) classes.add(m[1]);
  for (const c of classes) out = out.replace(new RegExp(`\\.${esc(c)}(?![\\w-])`, "g"), `.${prefix}${c}`);
  for (const f of frames) out = out.replace(new RegExp(`(?<![\\w.-])${esc(f)}(?![\\w-])`, "g"), `${prefix}${f}`);
  return out;
};

export function scopeSvg(markup: string, key: string, fit: ArtFit): string | null {
  const prefix = `a-${key.replace(/[^\w-]/g, "")}-`;
  let out = markup
    .replace(/<\?xml[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .trim();
  if (!/^<svg\b/i.test(out)) return null;

  const ids = new Set([...out.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const id of ids) {
    const e = esc(id);
    out = out
      .replace(new RegExp(`\\bid="${e}"`, "g"), `id="${prefix}${id}"`)
      .replace(new RegExp(`url\\(\\s*['"]?#${e}['"]?\\s*\\)`, "g"), `url(#${prefix}${id})`)
      .replace(new RegExp(`(href\\s*=\\s*")#${e}"`, "g"), `$1#${prefix}${id}"`);
  }

  const classes = new Set<string>();
  out = out.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, css: string) => `<style>${scopeCss(css, prefix, classes, ids)}</style>`);
  if (classes.size) {
    out = out.replace(/\bclass="([^"]*)"/g, (_, list: string) => {
      const mapped = list
        .split(/\s+/)
        .filter(Boolean)
        .map((c) => (classes.has(c) ? `${prefix}${c}` : c));
      return `class="${mapped.join(" ")}"`;
    });
  }

  out = out.replace(/<svg\b([^>]*)>/i, (_, attrs: string) => {
    let a = attrs;
    if (!/\bviewBox=/.test(a)) {
      const w = /\bwidth="([\d.]+)(?:px)?"/.exec(a);
      const h = /\bheight="([\d.]+)(?:px)?"/.exec(a);
      if (w && h) a += ` viewBox="0 0 ${w[1]} ${h[1]}"`;
    }
    a = a.replace(/\s(?:width|height|preserveAspectRatio)="[^"]*"/g, "");
    return `<svg${a} preserveAspectRatio="xMidYMid ${fit}">`;
  });
  return out;
}
