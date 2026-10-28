import { cn } from "@/lib/utils";
import { getArt } from "@/lib/svgAssets";
import "./pets.css";

export type PetState = "idle" | "walk" | "hop" | "sleep";

export function PetSprite({ id, state = "idle", facing = 1, className }: { id: string; state?: PetState; facing?: 1 | -1; className?: string }) {
  const custom = getArt("pets", id);
  if (!custom) return null;
  const html = custom.replace("<svg", `<svg class="${cn("pet", className)}" data-state="${state}" style="transform:scaleX(${facing})" aria-hidden="true"`);
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />;
}
