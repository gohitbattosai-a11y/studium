import { cn } from "@/lib/utils";
import { getArt, type ArtKind } from "@/lib/svgAssets";
import "./art.css";

export function SvgArt({ kind, id, className }: { kind: ArtKind; id: string; className?: string }) {
  const html = getArt(kind, id);
  if (!html) return null;
  return <span className={cn("art-svg", className)} dangerouslySetInnerHTML={{ __html: html }} aria-hidden />;
}
