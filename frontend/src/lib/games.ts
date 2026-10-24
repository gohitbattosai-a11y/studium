import { ArrowDownUp, Brain, FolderTree, Keyboard, Link2, ListChecks, type LucideIcon } from "lucide-react";
import type { GameContent, GameInput, GameOut, GameTemplate, QuizQuestion } from "./types";

export const GAME_TIERS: [number, number][] = [
  [100, 5],
  [90, 4],
  [75, 3],
  [60, 2],
  [40, 1],
];

export const gamePoints = (percent: number) => GAME_TIERS.find(([min]) => percent >= min)?.[1] ?? 0;

export const TEMPLATES: { id: GameTemplate; label: string; tagline: string; icon: LucideIcon }[] = [
  { id: "quiz", label: "Quiz", tagline: "Domande a risposta multipla, anche vero o falso", icon: ListChecks },
  { id: "sort", label: "Categorie", tagline: "Smista gli elementi nel gruppo giusto", icon: FolderTree },
  { id: "abbina", label: "Abbina", tagline: "Collega ogni termine alla sua coppia", icon: Link2 },
  { id: "memory", label: "Memory", tagline: "Scopri le coppie girando le carte", icon: Brain },
  { id: "indovina", label: "Indovina", tagline: "Scrivi la risposta a ogni indizio", icon: Keyboard },
  { id: "ordina", label: "Ordina", tagline: "Rimetti i passaggi nell'ordine giusto", icon: ArrowDownUp },
];

export const templateOf = (id: GameTemplate) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

export const emptyContent = (): GameContent => ({ questions: [], pairs: [], categories: [], sort_items: [], steps: [] });

export const shuffle = <T,>(items: T[]): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const acceptedAnswers = (answer: string) => answer.split("/").map(normalize).filter(Boolean);

export const toQuestions = (game: Pick<GameOut, "template" | "content">): QuizQuestion[] => {
  if (game.template === "sort") {
    return game.content.sort_items.map((i) => ({
      prompt: `In quale categoria va «${i.text}»?`,
      options: game.content.categories,
      correct: i.category,
    }));
  }
  return game.content.questions;
};

export const countItems = (template: GameTemplate, c: GameContent) => {
  if (template === "quiz") return c.questions.length;
  if (template === "sort") return c.sort_items.length;
  if (template === "ordina") return c.steps.length;
  return c.pairs.length;
};

const clean = (c: GameContent): GameContent => {
  const t = (s: string) => s.trim();
  return {
    questions: c.questions
      .map((q) => ({ ...q, prompt: t(q.prompt), options: q.options.map(t) }))
      .filter((q) => q.prompt || q.options.some(Boolean)),
    pairs: c.pairs.map((p) => ({ left: t(p.left), right: t(p.right) })).filter((p) => p.left || p.right),
    categories: c.categories.map(t),
    sort_items: c.sort_items.map((i) => ({ ...i, text: t(i.text) })).filter((i) => i.text),
    steps: c.steps.map(t).filter(Boolean),
  };
};

export const cleanInput = (input: GameInput): GameInput => ({
  ...input,
  title: input.title.trim(),
  description: input.description.trim(),
  content: clean(input.content),
});

export function validateInput(input: GameInput): string | null {
  const { template, content: c } = input;
  if (input.title.length < 2) return "Dai un titolo al gioco";
  if (template === "quiz") {
    if (c.questions.length < 1) return "Aggiungi almeno una domanda";
    for (const q of c.questions) {
      if (!q.prompt) return "Ogni domanda ha bisogno del testo";
      if (q.options.length < 2 || q.options.some((o) => !o)) return "Ogni domanda ha almeno due risposte, tutte compilate";
    }
  } else if (template === "sort") {
    if (c.categories.length < 2 || c.categories.some((x) => !x)) return "Servono almeno due categorie compilate";
    if (c.sort_items.length < 2) return "Aggiungi almeno due elementi da smistare";
  } else if (template === "abbina" || template === "memory") {
    if (c.pairs.length < 2) return "Servono almeno due coppie";
    if (c.pairs.length > 12) return "Massimo 12 coppie";
    if (c.pairs.some((p) => !p.left || !p.right)) return "Compila entrambi i lati di ogni coppia";
  } else if (template === "indovina") {
    if (c.pairs.length < 1) return "Aggiungi almeno un indizio";
    if (c.pairs.some((p) => !p.left || !p.right)) return "Ogni indizio ha bisogno di una risposta";
  } else if (template === "ordina") {
    if (c.steps.length < 3) return "Servono almeno tre passaggi";
    if (c.steps.length > 12) return "Massimo 12 passaggi";
  }
  return null;
}
