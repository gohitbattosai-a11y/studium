import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api/client";
import type { PushState } from "@/lib/api/types";

export type PushStatus = "loading" | "unsupported" | "unavailable" | "denied" | "off" | "on";

function supported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function toKey(value: string) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function usePush() {
  const [status, setStatus] = useState<PushStatus>("loading");

  const refresh = useCallback(async () => {
    if (!supported()) {
      setStatus("unsupported");
      return;
    }
    try {
      const state = await apiGet<PushState>("/push/state");
      if (!state.enabled) {
        setStatus("unavailable");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await apiPost("/push/subscribe", sub.toJSON());
        setStatus("on");
      } else {
        setStatus("off");
      }
    } catch {
      setStatus("off");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enable = useCallback(async () => {
    const state = await apiGet<PushState>("/push/state");
    if (!state.enabled || !state.public_key) throw new Error("unavailable");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus(permission === "denied" ? "denied" : "off");
      return;
    }
    await navigator.serviceWorker.register("/sw.js");
    const reg = await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(state.public_key) }));
    await apiPost("/push/subscribe", sub.toJSON());
    setStatus("on");
  }, []);

  const disable = useCallback(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg ? await reg.pushManager.getSubscription() : null;
    if (sub) {
      await apiPost("/push/unsubscribe", { endpoint: sub.endpoint });
      await sub.unsubscribe();
    }
    setStatus("off");
  }, []);

  return { status, enable, disable };
}
