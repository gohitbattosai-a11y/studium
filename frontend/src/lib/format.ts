import { format, formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { ApiError } from "./api";

function utcDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** Days from server-anchored `today` to `due` (both YYYY-MM-DD). */
export function dayDiff(due: string, today: string): number {
  return utcDay(due) - utcDay(today);
}

export type DueTone = "late" | "today" | "soon" | "later";

export function dueInfo(due: string, today: string): { label: string; tone: DueTone } {
  const n = dayDiff(due, today);
  if (n < 0) return { label: n === -1 ? "Scaduto ieri" : `Scaduto da ${-n} giorni`, tone: "late" };
  if (n === 0) return { label: "Oggi", tone: "today" };
  if (n === 1) return { label: "Domani", tone: "soon" };
  if (n <= 6) return { label: `Tra ${n} giorni`, tone: "soon" };
  return { label: formatDay(due), tone: "later" };
}

export function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return format(new Date(y, m - 1, d), "EEE d MMM", { locale: it });
}

export function formatLongDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return format(new Date(y, m - 1, d), "EEEE d MMMM", { locale: it });
}

export function addDays(iso: string, n: number): string {
  const t = new Date((utcDay(iso) + n) * 86_400_000);
  return t.toISOString().slice(0, 10);
}

export function relTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: it });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_TONES = [
  "bg-[#388BFD]/15 text-[#79B8FF]",
  "bg-[#BC8CFF]/15 text-[#D2A8FF]",
  "bg-[#3FB950]/15 text-[#7EE787]",
  "bg-[#D29922]/15 text-[#E3B341]",
  "bg-[#FF7B72]/15 text-[#FFA198]",
];

export function avatarTone(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

export function fileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Human message from an ApiError (FastAPI `detail` string or 422 list). */
export function errMsg(e: unknown): string {
  if (e instanceof ApiError) {
    const body = e.body as { detail?: unknown } | null;
    if (typeof body?.detail === "string") return body.detail;
    if (Array.isArray(body?.detail)) return "Controlla i campi: alcuni valori non sono validi";
    if (e.status >= 500) return "Errore del server, riprova tra poco";
  }
  return "Qualcosa è andato storto, riprova";
}
