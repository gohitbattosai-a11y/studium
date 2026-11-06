import { focusManager, type QueryClient } from "@tanstack/react-query";
import { readJson, removeKey, whenIdle, writeJson } from "@/lib/utils/storage";
import { isDormant, subscribeActivity } from "@/lib/runtime/activity";

const KEY = "studium:cache:v1";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_BYTES = 1_500_000;
const SAVE_DELAY_MS = 2500;
const KEEP = new Set(["members", "shop", "homework", "polls", "folders", "materials", "notices", "games", "leaderboard", "points-table", "pets", "badges"]);

type Entry = { key: readonly unknown[]; data: unknown; at: number };
type Blob = { uid: string; saved: number; entries: Entry[] };

let owner: string | null = null;
let timer = 0;
let attached: QueryClient | null = null;

const save = (client: QueryClient) => {
  timer = 0;
  if (!owner) return;
  const entries: Entry[] = [];
  for (const q of client.getQueryCache().findAll()) {
    const head = q.queryKey[0];
    if (typeof head !== "string" || !KEEP.has(head) || q.state.status !== "success") continue;
    entries.push({ key: q.queryKey, data: q.state.data, at: q.state.dataUpdatedAt });
  }
  const blob: Blob = { uid: owner, saved: Date.now(), entries };
  if (JSON.stringify(blob).length > MAX_BYTES) {
    removeKey(KEY);
    return;
  }
  writeJson(KEY, blob);
};

const schedule = (client: QueryClient) => {
  if (!owner || timer) return;
  timer = window.setTimeout(() => whenIdle(() => save(client)), SAVE_DELAY_MS);
};

export function attachPersistence(client: QueryClient) {
  if (attached) return;
  attached = client;
  client.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "success") schedule(client);
  });
  window.addEventListener("pagehide", () => {
    if (owner) save(client);
  });
  focusManager.setEventListener((setFocused) => {
    const sync = () => setFocused(!isDormant());
    const off = subscribeActivity(sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      off();
      document.removeEventListener("visibilitychange", sync);
    };
  });
}

export function hydrateFor(client: QueryClient, memberId: string) {
  if (owner === memberId) return;
  owner = memberId;
  const blob = readJson<Blob | null>(KEY, null);
  if (!blob || blob.uid !== memberId || Date.now() - blob.saved > MAX_AGE_MS) {
    removeKey(KEY);
    return;
  }
  for (const e of blob.entries) {
    if (client.getQueryData(e.key) === undefined) client.setQueryData(e.key, e.data, { updatedAt: e.at });
  }
}

export function forgetPersisted() {
  owner = null;
  if (timer) window.clearTimeout(timer);
  timer = 0;
  removeKey(KEY);
}
