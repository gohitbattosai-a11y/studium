import { useEffect, useRef, useState } from "react";
import type { BackgroundId } from "@/lib/domain/theme";
import { hasArt, useStaticArt } from "@/lib/art/svgAssets";
import { SvgArt } from "@/components/art/SvgArt";
import "./theme.css";

function Scene({ id }: { id: BackgroundId }) {
  if (!hasArt("backgrounds", id)) return null;
  return <SvgArt kind="backgrounds" id={id} className="absolute inset-0 size-full" />;
}

export function BackgroundPreview({ id }: { id: BackgroundId }) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const still = useStaticArt("backgrounds", id);

  useEffect(() => {
    const host = ref.current?.closest<HTMLElement>(".bgx-mini-host, .dc-host");
    if (!host) return;
    const on = () => setLive(true);
    const off = () => setLive(false);
    host.addEventListener("pointerenter", on);
    host.addEventListener("pointerleave", off);
    host.addEventListener("focusin", on);
    host.addEventListener("focusout", off);
    return () => {
      host.removeEventListener("pointerenter", on);
      host.removeEventListener("pointerleave", off);
      host.removeEventListener("focusin", on);
      host.removeEventListener("focusout", off);
    };
  }, []);

  return (
    <div ref={ref} className="bgx-fill bgx-still bgx-lite">
      {live ? <Scene id={id} /> : still && <img src={still} alt="" decoding="async" draggable={false} className="absolute inset-0 size-full object-cover" />}
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
