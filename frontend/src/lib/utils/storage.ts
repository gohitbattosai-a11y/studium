export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
}

export function whenIdle(fn: () => void, timeout = 2000): void {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(fn, { timeout });
  else window.setTimeout(fn, 200);
}
