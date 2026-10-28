import "./decorations.css";
import { SvgArt } from "@/components/art/SvgArt";
import { hasArt } from "@/lib/svgAssets";

export function AvatarDecoration({ id }: { id: string | null | undefined }) {
  if (!id || !hasArt("decorations", id)) return null;
  return (
    <span className="dc pointer-events-none absolute -inset-[50%] z-10" aria-hidden>
      <SvgArt kind="decorations" id={id} className="size-full" />
    </span>
  );
}
