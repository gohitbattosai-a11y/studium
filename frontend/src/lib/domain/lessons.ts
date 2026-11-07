import { useCallback, useState } from "react";
import { readJson, writeJson } from "@/lib/utils/storage";

export type Block =
  | { t: "h"; text: string }
  | { t: "p"; text: string }
  | { t: "list"; items: string[] }
  | { t: "note"; title?: string; text: string }
  | { t: "formula"; text: string; caption?: string };

export interface Subject {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface Lesson {
  id: string;
  subject: string;
  title: string;
  summary: string;
  blocks: Block[];
}

export const SUBJECTS: Subject[] = [
  { id: "matematica", name: "Matematica", emoji: "📐", color: "#58A6FF" },
  { id: "fisica", name: "Fisica", emoji: "⚛️", color: "#39D0D8" },
  { id: "italiano", name: "Italiano", emoji: "📖", color: "#FF7B72" },
  { id: "latino", name: "Latino", emoji: "🏛️", color: "#E3B341" },
  { id: "storia", name: "Storia", emoji: "🏺", color: "#F0883E" },
  { id: "filosofia", name: "Filosofia", emoji: "🦉", color: "#BC8CFF" },
  { id: "inglese", name: "Inglese", emoji: "🇬🇧", color: "#F778BA" },
  { id: "scienze", name: "Scienze", emoji: "🧪", color: "#7EE787" },
  { id: "arte", name: "Arte", emoji: "🎨", color: "#FFA657" },
  { id: "informatica", name: "Informatica", emoji: "💻", color: "#79C0FF" },
];

export const LESSONS: Lesson[] = [];

export const lessonsOf = (subject: string) => LESSONS.filter((l) => l.subject === subject);

const doneKey = (memberId: string) => `studium.school.done.${memberId}`;

export function useStudied(memberId: string) {
  const [done, setDone] = useState<string[]>(() => readJson<string[]>(doneKey(memberId), []));

  const toggle = useCallback(
    (id: string) => {
      setDone((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        writeJson(doneKey(memberId), next);
        return next;
      });
    },
    [memberId],
  );

  return { done, toggle };
}
