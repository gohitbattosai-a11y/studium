import type { BackgroundId } from "@/lib/theme";
import { hasArt } from "@/lib/svgAssets";
import { SvgArt } from "@/components/art/SvgArt";
import "./theme.css";

function Scene({ id }: { id: BackgroundId }) {
  if (!hasArt("backgrounds", id)) return null;
  return <SvgArt kind="backgrounds" id={id} className="absolute inset-0 size-full" />;
}

export function BackgroundPreview({ id }: { id: BackgroundId }) {
  return (
    <div className="bgx-fill">
      <Scene id={id} />
    </div>
  );
}

export default function ThemeBackground({ id }: { id: BackgroundId }) {
  if (id === "none") return null;
  return (
    <div className="bgx" aria-hidden>
      <Scene id={id} />
    </div>
  );
}
