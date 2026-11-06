import { useEffect, useSyncExternalStore } from "react";

const IDLE_AFTER_MS = 60_000;
const SCROLL_SETTLE_MS = 160;
const INPUT_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"] as const;

let overlays = 0;
let idle = false;
let scrolling = false;
let tab = "home";
let lastInput = Date.now();
let lastScroll = 0;
let scrollTimer = 0;
let version = 0;
const listeners = new Set<() => void>();

const hidden = () => typeof document !== "undefined" && document.hidden;

export const isPaused = () => overlays > 0 || hidden();
export const isDormant = () => hidden() || idle;
export const getActiveTab = () => tab;

const toggle = (root: HTMLElement, name: string, on: boolean) => {
  if (on) root.setAttribute(name, "");
  else root.removeAttribute(name);
};

const sync = () => {
  version += 1;
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    toggle(root, "data-paused", isPaused());
    toggle(root, "data-idle", idle);
    toggle(root, "data-scrolling", scrolling);
  }
  listeners.forEach((l) => l());
};

export const subscribeActivity = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function setActiveTab(next: string) {
  if (next === tab) return;
  tab = next;
  sync();
}

const onInput = () => {
  lastInput = Date.now();
  if (idle) {
    idle = false;
    sync();
  }
};

const onScroll = () => {
  lastScroll = Date.now();
  if (!scrolling) {
    scrolling = true;
    sync();
  }
  if (scrollTimer) return;
  const settle = () => {
    scrollTimer = 0;
    if (Date.now() - lastScroll < SCROLL_SETTLE_MS) {
      scrollTimer = window.setTimeout(settle, SCROLL_SETTLE_MS);
      return;
    }
    scrolling = false;
    sync();
  };
  scrollTimer = window.setTimeout(settle, SCROLL_SETTLE_MS);
};

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) onInput();
    sync();
  });
  for (const name of INPUT_EVENTS) window.addEventListener(name, onInput, { passive: true, capture: true });
  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  window.setInterval(() => {
    if (hidden() || idle) return;
    if (Date.now() - lastInput > IDLE_AFTER_MS) {
      idle = true;
      sync();
    }
  }, 10_000);
}

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

const snapshot = () => `${version}`;

export function useActivity() {
  useSyncExternalStore(subscribeActivity, snapshot, snapshot);
  return { tab, overlay: overlays > 0, dormant: isDormant() };
}
