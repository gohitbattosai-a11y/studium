import { useId, useMemo } from "react";
import { STAT_KEYS, type Player } from "@/lib/domain/football";
import { tierFor } from "@/lib/domain/stadiumConfig";
import { cardTemplate, customCardTemplate, stadiumArt } from "@/lib/art/stadiumAssets";

export const tierOf = (ovr: number) => tierFor(ovr).id;
export const tierName = (ovr: number) => tierFor(ovr).name;
export const surname = (name: string) => name.split(" ").slice(1).join(" ") || name;

const hash = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};
const SKIN = ["#f1c9a5", "#e0a97f", "#c68a5e", "#a06a43", "#7a4a2b"];
const HAIR = ["#1a1410", "#3b2a1a", "#6b4423", "#c9a24b", "#8a2d1a"];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fill = (source: string, vars: Record<string, string | number>) => source.replace(/\{\{(\w+)\}\}/g, (_, k: string) => (k in vars ? String(vars[k]) : ""));

const scopeIds = (svg: string, prefix: string) => {
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  return ids.reduce((out, id) => out.split(`id="${id}"`).join(`id="${prefix}${id}"`).split(`url(#${id})`).join(`url(#${prefix}${id})`).split(`href="#${id}"`).join(`href="#${prefix}${id}"`), svg);
};

const avatarMarkup = (p: Player, shirt: string) => {
  const h = hash(p.id);
  const style = p.look?.style ?? (h >> 6) % 3;
  let svg = fill(cardTemplate("avatar").replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""), {
    skin: p.look?.skin ?? SKIN[h % SKIN.length],
    hair: p.look?.hair ?? HAIR[(h >> 3) % HAIR.length],
    shirt,
  });
  [0, 1, 2].filter((n) => n !== style).forEach((n) => (svg = svg.replace(new RegExp(`<g id="hair-${n}">[\\s\\S]*?</g>`), "")));
  return svg;
};

interface Props {
  p: Player;
  size?: number;
  color?: string;
  selected?: boolean;
  dim?: boolean;
  onClick?: () => void;
}

export default function PlayerCard({ p, size = 1, color = "#2563eb", selected, dim, onClick }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tier = tierFor(p.ovr);
  const svg = useMemo(() => {
    const base = customCardTemplate(p.card) || cardTemplate(tier.id) || stadiumArt("");
    let out = fill(base, {
      ovr: p.ovr,
      pos: p.pos,
      name: esc(p.name),
      surname: esc(surname(p.name)),
      tier: tier.name,
      shirt: color,
      avatar: avatarMarkup(p, color),
      price: p.price ?? "",
      ...Object.fromEntries(STAT_KEYS.map((k) => [k, p.stats[k]])),
    });
    if (size < 0.8) out = out.replace(/<g id="[^"]*stats"[\s\S]*?<\/g>/, "");
    return scopeIds(out, `c${uid}`);
  }, [p, tier.id, tier.name, color, size, uid]);
  const box = { width: 100 * size, height: 136 * size };
  const filter = selected ? "drop-shadow(0 0 3px #E3B341) drop-shadow(0 0 7px #E3B341)" : p.ovr >= 85 ? "drop-shadow(0 0 5px #67e8f9aa)" : "drop-shadow(0 2px 3px #0008)";
  const inner = <span className="block size-full [&>svg]:block [&>svg]:size-full" style={{ filter, opacity: dim ? 0.55 : 1 }} dangerouslySetInnerHTML={{ __html: svg }} />;
  return onClick ? (
    <button type="button" onClick={onClick} className="relative block shrink-0 outline-none" style={box} aria-label={p.name}>
      {inner}
    </button>
  ) : (
    <div className="relative shrink-0" style={box}>
      {inner}
    </div>
  );
}
