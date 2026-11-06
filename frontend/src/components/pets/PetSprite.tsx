import { cn } from "@/lib/utils/cn";
import { useArt } from "@/lib/art/svgAssets";
import "./pets.css";

export type PetState = "idle" | "walk" | "hop" | "sleep";

export function PetSprite({ id, state = "idle", facing = 1, className }: { id: string; state?: PetState; facing?: 1 | -1; className?: string }) {
  const art = useArt("pets", id);
  if (!art) return null;
  const html = art.replace("<svg", `<svg class="${cn("pet pet-art", className)}" data-state="${state}" style="transform:scaleX(${facing})" aria-hidden="true"`);
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />;
}
