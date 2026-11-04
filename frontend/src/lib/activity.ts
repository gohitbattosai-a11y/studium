import { useEffect } from "react";

let overlays = 0;

export const isPaused = () => overlays > 0 || document.hidden;

const sync = () => {
  const root = document.documentElement;
  if (isPaused()) root.setAttribute("data-paused", "");
  else root.removeAttribute("data-paused");
};

if (typeof document !== "undefined") document.addEventListener("visibilitychange", sync);

export function useOverlay(active = true) {
  useEffect(() => {
    if (!active) return;
    overlays += 1;
    sync();
    return () => {
      overlays = Math.max(0, overlays - 1);
      sync();
    };
  }, [active]);
}
