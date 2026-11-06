import type { CSSProperties } from "react";
import { cityArt } from "@/lib/art/cityAssets";
import type { Prop, Theme } from "./rooms";

export const BASE_W: Record<Prop, number> = { plant: 130, bench: 260, window: 140, lamp: 90, column: 100, banner: 110, rocks: 230, statue: 150, lantern: 100, ficus: 150, fountain: 260, pedestal: 120, anchor: 130, lifebuoy: 110, easel: 130, barrel: 100, jelly: 120, bamboo: 120, bridge: 320, torii: 270, brazier: 100, log: 250, amphora: 90, crate: 120, coral: 150 };

function Lamp({ th }: { th: Theme }) {
  return (
    <div className="flex flex-col items-center" aria-hidden>
      <div className="ct-glow size-16 rounded-full bg-[radial-gradient(circle,rgba(255,226,140,0.9),transparent_70%)]" />
      <div className="-mt-10 h-5 w-4 rounded-sm" style={{ background: th.plaque }} />
      <div className="h-24 w-1.5" style={{ background: th.trim }} />
      <div className="h-2 w-10 rounded-full" style={{ background: th.trim }} />
    </div>
  );
}

export function PropArt({ p, th }: { p: Prop; th: Theme }) {
  if (p === "lamp") return <Lamp th={th} />;
  const html = cityArt("props", p);
  if (!html) return null;
  const vars = { "--c-trim": th.trim, "--c-plaque": th.plaque, "--c-accent": th.accent, "--c-ink": th.plaqueInk, "--c-sand": th.sand } as CSSProperties;
  return <span className="block [&>svg]:block" style={vars} dangerouslySetInnerHTML={{ __html: html }} />;
}
