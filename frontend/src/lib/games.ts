import { ArrowDownUp, Blocks, Brain, FileText, FolderTree, Hash, Keyboard, Link2, ListChecks, type LucideIcon } from "lucide-react";
import type { Block, BlockKind, CustomContent, GameContent, GameInput, GameOut, GameTemplate, QuizQuestion, Rules, SceneId } from "./types";

export const TEMPLATES: { id: GameTemplate; label: string; tagline: string; icon: LucideIcon }[] = [
  { id: "custom", label: "Costruttore", tagline: "Componi il gioco a blocchi, con scene e regole tue", icon: Blocks },
  { id: "quiz", label: "Quiz", tagline: "Domande a risposta multipla, anche vero o falso", icon: ListChecks },
  { id: "sort", label: "Categorie", tagline: "Smista gli elementi nel gruppo giusto", icon: FolderTree },
  { id: "abbina", label: "Abbina", tagline: "Collega ogni termine alla sua coppia", icon: Link2 },
  { id: "memory", label: "Memory", tagline: "Scopri le coppie girando le carte", icon: Brain },
  { id: "indovina", label: "Indovina", tagline: "Scrivi la risposta a ogni indizio", icon: Keyboard },
  { id: "ordina", label: "Ordina", tagline: "Rimetti i passaggi nell'ordine giusto", icon: ArrowDownUp },
];

export const BLOCK_KINDS: { kind: BlockKind; label: string; hint: string; icon: LucideIcon }[] = [
  { kind: "choice", label: "Scelta", hint: "Risposta multipla o vero/falso", icon: ListChecks },
  { kind: "type", label: "Risposta scritta", hint: "Il giocatore scrive la risposta", icon: Keyboard },
  { kind: "number", label: "Numero", hint: "Risposta numerica con tolleranza", icon: Hash },
  { kind: "order", label: "Ordina", hint: "Rimetti i passaggi in ordine", icon: ArrowDownUp },
  { kind: "match", label: "Abbina", hint: "Collega le coppie", icon: Link2 },
  { kind: "info", label: "Testo", hint: "Una scheda da leggere, senza punti", icon: FileText },
];

export const SCENES: { id: SceneId; label: string; hint: string }[] = [
  { id: "none", label: "Solo barra", hint: "Una barra di avanzamento" },
  { id: "car", label: "Auto", hint: "L'auto avanza con i punti" },
  { id: "rocket", label: "Razzo", hint: "Il razzo vola verso il pianeta" },
  { id: "climb", label: "Scalata", hint: "Sali fino alla cima" },
  { id: "boss", label: "Boss", hint: "Ogni risposta ferisce il mostro" },
  { id: "plant", label: "Pianta", hint: "La pianta cresce e fiorisce" },
];

export const templateOf = (id: GameTemplate) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[1];
export const blockMeta = (kind: BlockKind) => BLOCK_KINDS.find((b) => b.kind === kind) ?? BLOCK_KINDS[0];

export const defaultRules = (): Rules => ({ lives: 0, seconds: 0, penalty: 0, streak_bonus: false, shuffle: true });

export const blankBlock = (kind: BlockKind): Block => ({
  kind,
  prompt: "",
  value: kind === "info" ? 0 : 1,
  explain: "",
  options: kind === "choice" ? ["", ""] : [],
  correct: 0,
  answer: "",
  number: null,
  tolerance: 0,
  steps: kind === "order" ? ["", "", ""] : [],
  pairs: kind === "match" ? [{ left: "", right: "" }, { left: "", right: "" }] : [],
});

export const emptyContent = (): GameContent => ({ questions: [], pairs: [], categories: [], sort_items: [], steps: [], custom: null });

export const sampleCustom = (): CustomContent => ({
  scene: "car",
  rules: { lives: 3, seconds: 20, penalty: 1, streak_bonus: true, shuffle: true },
  blocks: [
    { ...blankBlock("info"), prompt: "Rispondi bene per far correre l'auto: le domande difficili valgono di più!" },
    { ...blankBlock("choice"), prompt: "Quanto fa 7 × 8?", options: ["54", "56", "64"], correct: 1, value: 2, explain: "7 × 8 = 56" },
    { ...blankBlock("type"), prompt: "Capitale d'Italia?", answer: "Roma", value: 1 },
    { ...blankBlock("number"), prompt: "Quanto fa 15 + 27?", number: 42, value: 3 },
  ],
});

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
  if (template === "custom") return (c.custom?.blocks ?? []).filter((b) => b.kind !== "info").length;
  return c.pairs.length;
};

const sanitizeBlock = (b: Block): Block => {
  const t = (s: string) => s.trim();
  const base: Block = { ...blankBlock(b.kind), prompt: t(b.prompt), value: b.kind === "info" ? 0 : b.value, explain: b.kind === "info" ? "" : t(b.explain) };
  if (b.kind === "choice") return { ...base, options: b.options.map(t), correct: b.correct };
  if (b.kind === "type") return { ...base, answer: t(b.answer) };
  if (b.kind === "number") return { ...base, number: b.number, tolerance: b.tolerance };
  if (b.kind === "order") return { ...base, steps: b.steps.map(t).filter(Boolean) };
  if (b.kind === "match") return { ...base, pairs: b.pairs.map((p) => ({ left: t(p.left), right: t(p.right) })).filter((p) => p.left || p.right) };
  return base;
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
    custom: c.custom ? { ...c.custom, blocks: c.custom.blocks.map(sanitizeBlock) } : null,
  };
};

export const cleanInput = (input: GameInput): GameInput => ({
  ...input,
  title: input.title.trim(),
  description: input.description.trim(),
  content: clean(input.content),
});

function validateCustom(custom: CustomContent | null): string | null {
  if (!custom) return "Manca il contenuto del gioco";
  const blocks = custom.blocks;
  if (blocks.length < 1) return "Aggiungi almeno un blocco";
  if (blocks.length > 40) return "Massimo 40 blocchi";
  if (!blocks.some((b) => b.kind !== "info" && b.value >= 1)) return "Serve almeno una sfida che assegni punti";
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const where = `Blocco ${i + 1}: `;
    if (b.kind === "choice") {
      if (!b.prompt) return where + "manca la domanda";
      if (b.options.length < 2 || b.options.some((o) => !o)) return where + "servono almeno due risposte, tutte compilate";
    } else if (b.kind === "type") {
      if (!b.prompt || !b.answer) return where + "servono domanda e risposta";
    } else if (b.kind === "number") {
      if (!b.prompt || b.number === null || Number.isNaN(b.number)) return where + "servono domanda e numero";
    } else if (b.kind === "order") {
      if (b.steps.length < 3) return where + "servono almeno tre passaggi";
    } else if (b.kind === "match") {
      if (b.pairs.length < 2 || b.pairs.some((p) => !p.left || !p.right)) return where + "servono almeno due coppie complete";
    } else if (b.kind === "info" && !b.prompt) {
      return where + "manca il testo";
    }
  }
  return null;
}

export function validateInput(input: GameInput): string | null {
  const { template, content: c } = input;
  if (input.title.length < 2) return "Dai un titolo al gioco";
  if (template === "custom") return validateCustom(c.custom);
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
