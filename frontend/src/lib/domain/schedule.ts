import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson } from "@/lib/utils/storage";

export interface Slot {
  subject: string;
  color: string;
  room: string;
}

export interface Timetable {
  from: number;
  to: number;
  slots: Record<string, Slot>;
}

export const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
export const DAYS_LONG = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

export const SLOT_COLORS = ["#58A6FF", "#7EE787", "#F0883E", "#BC8CFF", "#FF7B72", "#E3B341", "#39D0D8", "#F778BA"];

export const slotKey = (day: number, hour: number) => `${day}-${hour}`;

export const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;

export const dayIndexOf = (iso: string) => (new Date(`${iso}T12:00:00`).getDay() + 6) % 7;

const empty = (): Timetable => ({ from: 8, to: 14, slots: {} });

const storeKey = (memberId: string) => `studium.timetable.${memberId}`;

function load(memberId: string): Timetable {
  const raw = readJson<Partial<Timetable>>(storeKey(memberId), {});
  const base = empty();
  const from = typeof raw.from === "number" ? raw.from : base.from;
  const to = typeof raw.to === "number" ? raw.to : base.to;
  return { from: Math.min(from, to), to: Math.max(from, to), slots: raw.slots && typeof raw.slots === "object" ? raw.slots : {} };
}

export function useTimetable(memberId: string) {
  const [table, setTable] = useState<Timetable>(() => load(memberId));

  useEffect(() => {
    setTable(load(memberId));
  }, [memberId]);

  const commit = useCallback(
    (fn: (t: Timetable) => Timetable) => {
      setTable((prev) => {
        const next = fn(prev);
        writeJson(storeKey(memberId), next);
        return next;
      });
    },
    [memberId],
  );

  const setSlot = useCallback(
    (days: number[], hour: number, slot: Slot | null) => {
      commit((t) => {
        const slots = { ...t.slots };
        days.forEach((d) => {
          if (slot) slots[slotKey(d, hour)] = slot;
          else delete slots[slotKey(d, hour)];
        });
        return { ...t, slots };
      });
    },
    [commit],
  );

  const setRange = useCallback(
    (from: number, to: number) => {
      commit((t) => ({ ...t, from: Math.min(from, to), to: Math.max(from, to) }));
    },
    [commit],
  );

  const clearAll = useCallback(() => {
    commit((t) => ({ ...t, slots: {} }));
  }, [commit]);

  return { table, setSlot, setRange, clearAll };
}
