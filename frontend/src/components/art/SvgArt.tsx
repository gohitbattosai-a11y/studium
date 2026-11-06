import { useId, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useArt, type ArtKind } from "@/lib/art/svgAssets";
import "./art.css";

export function SvgArt({ kind, id, className }: { kind: ArtKind; id: string; className?: string }) {
  const uid = useId().replace(/[^\w]/g, "");
  const source = useArt(kind, id);
  const html = useMemo(() => {
    if (!source) return null;
    const prefix = `a-${`${kind}-${id}`.replace(/[^\w-]/g, "")}-`;
    return source.split(prefix).join(`${prefix}${uid}-`);
  }, [source, kind, id, uid]);
  if (!html) return null;
  return <span className={cn("art-svg", `art-${kind}`, className)} dangerouslySetInnerHTML={{ __html: html }} aria-hidden />;
}
