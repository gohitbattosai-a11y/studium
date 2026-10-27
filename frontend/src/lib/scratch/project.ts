import { blocksOf, CATEGORIES, cloneBlocks, defaultArgs, isReporterShape, isTerminal, menuOptions, newBlock, parseParams, procsOf, projectBlockCount, SPEC_BY_OP, SPECS, uid, walkBlocks } from "./spec";
import type { Arg, Backdrop, CategoryId, SBlock, Script, ScratchProject, SpriteDef } from "./types";

export const MAX_SPRITES = 8;
export const MAX_BLOCKS = 800;

export const BACKDROP_PRESETS: Omit<Backdrop, "id">[] = [
  { name: "Cielo", from: "#8EC5FF", to: "#E8F4FF", deco: "☁️" },
  { name: "Notte", from: "#0B1026", to: "#2B2F6B", deco: "✨" },
  { name: "Prato", from: "#9BE37A", to: "#4C9F38", deco: "🌼" },
  { name: "Spazio", from: "#05060F", to: "#1B1038", deco: "⭐" },
  { name: "Mare", from: "#6AD3F5", to: "#0F6FB5", deco: "🫧" },
  { name: "Deserto", from: "#F8D68A", to: "#D9964B", deco: "🌵" },
  { name: "Tramonto", from: "#FF9A62", to: "#6B3A8F", deco: "🌇" },
  { name: "Lavagna", from: "#2F4A3F", to: "#1F332B", deco: "✏️" },
  { name: "Neve", from: "#F2F8FF", to: "#BCD4EA", deco: "❄️" },
  { name: "Vuoto", from: "#161B22", to: "#0D1117", deco: "" },
];

export const EMOJIS = [
  "🐱", "🐶", "🐭", "🐰", "🦊", "🐻", "🐼", "🐸", "🐵", "🦁", "🐯", "🐷", "🐔", "🐧", "🦉", "🦋", "🐝", "🐢", "🐙", "🐟", "🐬", "🦖", "🐉", "👻",
  "🚀", "🚗", "🚁", "🛸", "⛵", "🏎️", "🚲", "✈️", "🧑‍🚀", "🧙", "🦸", "🤖", "👾", "😀", "😎", "🥳",
  "🍎", "🍌", "🍓", "🍕", "🍔", "🍪", "🥕", "🧺", "⚽", "🏀", "🎯", "🧩", "🎈", "🎁", "💎", "⭐", "❤️", "💣", "🔥", "💧",
  "🌳", "🌵", "🌼", "🌙", "☀️", "☁️", "⚡", "🏠", "🏰", "🚪", "🔑", "📘", "✏️", "🧪", "🔬", "🌍",
];

export const blankSprite = (name: string, emoji: string): SpriteDef => ({
  id: uid(),
  name,
  costumes: [emoji],
  x: 0,
  y: 0,
  size: 100,
  dir: 90,
  rotation: "lr",
  visible: true,
  scripts: [],
});

export const blankProject = (): ScratchProject => ({
  v: 1,
  settings: { goal: 10, lives: 0, time: 0 },
  backdrops: [{ id: uid(), ...BACKDROP_PRESETS[0] }],
  messages: [],
  vars: [],
  lists: [],
  sprites: [blankSprite("Sprite1", "🐱")],
});

const script = (x: number, y: number, ...blocks: SBlock[]): Script => ({ id: uid(), x, y, blocks });
const b = newBlock;

export const sampleApples = (): ScratchProject => {
  const basket: SpriteDef = { ...blankSprite("Cestino", "🧺"), y: -140, size: 130 };
  const apple: SpriteDef = { ...blankSprite("Mela", "🍎"), y: 150, size: 80, visible: false };
  basket.scripts = [
    script(
      24,
      24,
      b("evt_flag"),
      b("ctl_forever", {}, {
        a: [
          b("ctl_if", { cond: b("sen_key", { key: "right" }) }, { a: [b("mot_changex", { n: 12 })] }),
          b("ctl_if", { cond: b("sen_key", { key: "left" }) }, { a: [b("mot_changex", { n: -12 })] }),
        ],
      }),
    ),
    script(24, 230, b("evt_when", { cond: b("op_gt", { a: b("game_score"), b: 9 }) }), b("snd_play", { sound: "win" }), b("game_end")),
  ];
  apple.scripts = [
    script(24, 24, b("evt_flag"), b("look_hide"), b("ctl_forever", {}, { a: [b("ctl_wait", { s: 0.8 }), b("ctl_clone", { who: "_myself_" })] })),
    script(
      24,
      200,
      b("evt_clone"),
      b("mot_goto", { x: b("op_random", { a: -200, b: 200 }), y: 160 }),
      b("look_show"),
      b("ctl_repeat_until", { cond: b("op_or", { a: b("sen_touching", { t: basket.id }), b: b("op_lt", { a: b("mot_y"), b: -165 }) }) }, { a: [b("mot_changey", { n: -7 })] }),
      b("ctl_ifelse", { cond: b("sen_touching", { t: basket.id }) }, {
        a: [b("game_change_score", { n: 1 }), b("snd_play", { sound: "coin" })],
        b: [b("game_change_lives", { n: -1 }), b("snd_play", { sound: "lose" })],
      }),
      b("ctl_clone_delete"),
    ),
  ];
  return {
    v: 1,
    settings: { goal: 10, lives: 3, time: 0 },
    backdrops: [{ id: uid(), ...BACKDROP_PRESETS[0] }],
    messages: [],
    vars: [],
    lists: [],
    sprites: [basket, apple],
  };
};

export const sampleQuiz = (): ScratchProject => {
  const owl: SpriteDef = { ...blankSprite("Professore", "🦉"), size: 160 };
  const define = b("proc_define", { name: "domanda", params: "testo, risposta" });
  const call = (q: string, a: string) => b("proc_call", { proc: define.id, a0: q, a1: a });
  owl.scripts = [
    script(
      24,
      24,
      define,
      b("sen_ask", { q: b("proc_param", { name: "testo" }) }),
      b("ctl_ifelse", { cond: b("op_eq", { a: b("sen_answer"), b: b("proc_param", { name: "risposta" }) }) }, {
        a: [b("game_change_score", { n: 1 }), b("snd_play", { sound: "coin" }), b("look_say_for", { text: "Esatto!", s: 1 })],
        b: [b("snd_play", { sound: "lose" }), b("look_say_for", { text: b("op_join", { a: "No, era ", b: b("proc_param", { name: "risposta" }) }), s: 1.5 })],
      }),
    ),
    script(
      380,
      24,
      b("evt_flag"),
      b("look_say_for", { text: "Rispondi a 3 domande!", s: 1.5 }),
      call("Quanto fa 7 × 8?", "56"),
      call("Capitale d'Italia?", "Roma"),
      call("Quanto fa 15 + 27?", "42"),
      b("look_say_for", { text: "Il quiz è finito!", s: 1 }),
      b("game_end"),
    ),
  ];
  return {
    v: 1,
    settings: { goal: 3, lives: 0, time: 0 },
    backdrops: [{ id: uid(), ...BACKDROP_PRESETS[7] }],
    messages: [],
    vars: [],
    lists: [],
    sprites: [owl],
  };
};

export type StackRef = { script: string } | { block: string; stack: string };

const mapList = (list: SBlock[], fn: (b: SBlock) => SBlock): SBlock[] => list.map(fn);

const mapDeep = (blk: SBlock, id: string, fn: (b: SBlock) => SBlock): SBlock => {
  if (blk.id === id) return fn(blk);
  let args = blk.args;
  for (const [k, v] of Object.entries(blk.args)) {
    if (typeof v === "object") {
      const next = mapDeep(v, id, fn);
      if (next !== v) {
        if (args === blk.args) args = { ...blk.args };
        args[k] = next;
      }
    }
  }
  let stacks = blk.stacks;
  if (stacks) {
    for (const [k, st] of Object.entries(stacks)) {
      const next = mapList(st, (x) => mapDeep(x, id, fn));
      if (next.some((n, i) => n !== st[i])) {
        if (stacks === blk.stacks) stacks = { ...blk.stacks };
        stacks[k] = next;
      }
    }
  }
  return args === blk.args && stacks === blk.stacks ? blk : { ...blk, args, ...(stacks ? { stacks } : {}) };
};

export const updateBlock = (scripts: Script[], id: string, fn: (b: SBlock) => SBlock): Script[] =>
  scripts.map((s) => {
    const next = mapList(s.blocks, (x) => mapDeep(x, id, fn));
    return next.some((n, i) => n !== s.blocks[i]) ? { ...s, blocks: next } : s;
  });

export const setArg = (scripts: Script[], id: string, key: string, value: Arg): Script[] => updateBlock(scripts, id, (blk) => ({ ...blk, args: { ...blk.args, [key]: value } }));

export const findBlock = (scripts: Script[], id: string): SBlock | null => {
  let found: SBlock | null = null;
  for (const s of scripts) walkBlocks(s.blocks, (blk) => (blk.id === id ? (found = blk) : undefined));
  return found;
};

const fallbackArg = (parent: SBlock, key: string): Arg => defaultArgs(parent.op)[key] ?? "";

interface Cut {
  list: SBlock[];
  removed: SBlock[];
  heal?: boolean;
}

const cutInBlock = (blk: SBlock, id: string, heal: boolean): { block: SBlock; removed: SBlock[] } | null => {
  for (const [k, v] of Object.entries(blk.args)) {
    if (typeof v !== "object") continue;
    if (v.id === id) return { block: { ...blk, args: { ...blk.args, [k]: fallbackArg(blk, k) } }, removed: [v] };
    const inner = cutInBlock(v, id, heal);
    if (inner) return { block: { ...blk, args: { ...blk.args, [k]: inner.block } }, removed: inner.removed };
  }
  if (blk.stacks) {
    for (const [k, st] of Object.entries(blk.stacks)) {
      const cut = cutInList(st, id, heal);
      if (cut) return { block: { ...blk, stacks: { ...blk.stacks, [k]: cut.list } }, removed: cut.removed };
    }
  }
  return null;
};

const cutInList = (list: SBlock[], id: string, heal: boolean): Cut | null => {
  const idx = list.findIndex((x) => x.id === id);
  if (idx >= 0) {
    return heal ? { list: [...list.slice(0, idx), ...list.slice(idx + 1)], removed: [list[idx]] } : { list: list.slice(0, idx), removed: list.slice(idx) };
  }
  for (let i = 0; i < list.length; i++) {
    const r = cutInBlock(list[i], id, heal);
    if (r) return { list: list.map((x, j) => (j === i ? r.block : x)), removed: r.removed };
  }
  return null;
};

export const detach = (scripts: Script[], id: string, heal = false): { scripts: Script[]; removed: SBlock[] } | null => {
  for (const s of scripts) {
    const cut = cutInList(s.blocks, id, heal);
    if (!cut) continue;
    const next = cut.list.length === 0 ? scripts.filter((x) => x.id !== s.id) : scripts.map((x) => (x.id === s.id ? { ...x, blocks: cut.list } : x));
    return { scripts: next, removed: cut.removed };
  }
  return null;
};

export const stackAt = (scripts: Script[], ref: StackRef): SBlock[] | null => {
  if ("script" in ref) return scripts.find((s) => s.id === ref.script)?.blocks ?? null;
  const blk = findBlock(scripts, ref.block);
  return blk?.stacks?.[ref.stack] ?? null;
};

export const insertAt = (scripts: Script[], ref: StackRef, index: number, blocks: SBlock[]): Script[] => {
  if ("script" in ref) {
    return scripts.map((s) => (s.id === ref.script ? { ...s, blocks: [...s.blocks.slice(0, index), ...blocks, ...s.blocks.slice(index)] } : s));
  }
  return updateBlock(scripts, ref.block, (blk) => {
    const st = blk.stacks?.[ref.stack] ?? [];
    return { ...blk, stacks: { ...blk.stacks, [ref.stack]: [...st.slice(0, index), ...blocks, ...st.slice(index)] } };
  });
};

export const addScript = (scripts: Script[], blocks: SBlock[], x: number, y: number): Script[] => [...scripts, { id: uid(), x: Math.max(0, Math.round(x)), y: Math.max(0, Math.round(y)), blocks }];

export const shapeOf = (blk: SBlock) => SPEC_BY_OP[blk.op]?.shape ?? "stack";

export const canInsert = (dragged: SBlock[], stack: SBlock[], index: number): boolean => {
  if (dragged.length === 0) return false;
  const first = SPEC_BY_OP[dragged[0].op];
  const last = SPEC_BY_OP[dragged[dragged.length - 1].op];
  if (!first || !last) return false;
  if (first.shape === "hat" || isReporterShape(first.shape)) return false;
  const prev = stack[index - 1];
  const next = stack[index];
  if (prev) {
    const ps = SPEC_BY_OP[prev.op];
    if (!ps) return false;
    if (ps.shape !== "hat" && isTerminal(ps)) return false;
  }
  if (next && SPEC_BY_OP[next.op]?.shape === "hat") return false;
  if (next && isTerminal(last)) return false;
  return true;
};

export const canDropOnSlot = (dragged: SBlock[], slot: "num" | "text" | "bool"): boolean => {
  if (dragged.length !== 1) return false;
  const shape = SPEC_BY_OP[dragged[0].op]?.shape;
  if (!shape || !isReporterShape(shape)) return false;
  return slot === "bool" ? shape === "boolean" : true;
};

export const dropOnSlot = (scripts: Script[], ownerId: string, key: string, blk: SBlock): Script[] => setArg(scripts, ownerId, key, blk);

export const tidy = (scripts: Script[], heights: Record<string, number>): Script[] => {
  let y = 16;
  return scripts.map((s) => {
    const out = { ...s, x: 16, y };
    y += (heights[s.id] ?? 80) + 16;
    return out;
  });
};

export const duplicateFrom = (scripts: Script[], id: string): Script[] => {
  const cut = detach(scripts, id, false);
  if (!cut) return scripts;
  const copy = cloneBlocks(cut.removed);
  const src = scripts.find((s) => s.blocks.some((x) => x.id === id));
  return addScript(scripts, copy, (src?.x ?? 0) + 32, (src?.y ?? 0) + 32);
};

export const paletteBlocks = (cat: CategoryId, project: ScratchProject, sprite: SpriteDef | undefined): SBlock[] => {
  const ctx = { project, sprite };
  const firstOf = (kind: "var" | "list" | "message") => {
    const spec = { slot: "menu" as const, def: "", menu: kind };
    return menuOptions(kind, ctx, spec)[0]?.value ?? null;
  };
  const out: SBlock[] = [];
  for (const spec of SPECS) {
    if (spec.cat !== cat) continue;
    if (spec.op === "proc_call" || spec.op === "proc_param") continue;
    if (spec.op === "var_get") continue;
    const overrides: Record<string, string> = {};
    let missing = false;
    for (const [k, a] of Object.entries(spec.args)) {
      if (a.slot !== "menu" || !a.menu) continue;
      if (a.menu === "var" || a.menu === "list" || a.menu === "message") {
        const first = firstOf(a.menu);
        if (first === null) missing = true;
        else overrides[k] = first;
      }
    }
    if (missing) continue;
    out.push(newBlock(spec.op, overrides));
  }
  if (cat === "variables") {
    const vars = project.vars.filter((v) => v.scope === "all" || v.scope === sprite?.id);
    out.splice(2, 0, ...vars.map((v) => newBlock("var_get", { var: v.id })));
  }
  if (cat === "myblocks" && sprite) {
    for (const p of procsOf(sprite)) {
      const args: Record<string, string> = { proc: p.id };
      out.push(newBlock("proc_call", args));
    }
    const names = new Set<string>();
    for (const p of procsOf(sprite)) for (const n of p.params) names.add(n);
    for (const n of names) out.push(newBlock("proc_param", { name: n }));
  }
  return out;
};

export const countBlocks = (p: ScratchProject) => projectBlockCount(p);

export const cleanScratch = (p: ScratchProject): ScratchProject => {
  const t = (s: string) => s.trim();
  const int = (n: number) => Math.round(Number.isFinite(n) ? n : 0);
  return {
    v: 1,
    settings: { goal: Math.max(1, int(p.settings.goal)), lives: Math.max(0, int(p.settings.lives)), time: Math.max(0, int(p.settings.time)) },
    backdrops: p.backdrops.map((x) => ({ ...x, name: t(x.name) || "Sfondo" })),
    messages: [...new Set(p.messages.map(t).filter(Boolean))],
    vars: p.vars.map((v) => ({ ...v, name: t(v.name), initial: Number.isFinite(v.initial) ? v.initial : 0 })),
    lists: p.lists.map((l) => ({ ...l, name: t(l.name) })),
    sprites: p.sprites.map((s) => ({
      ...s,
      name: t(s.name) || "Sprite",
      x: int(s.x),
      y: int(s.y),
      size: Math.min(500, Math.max(5, int(s.size))),
      dir: int(s.dir),
      scripts: s.scripts.filter((sc) => sc.blocks.length > 0).map((sc) => ({ ...sc, x: int(sc.x), y: int(sc.y) })),
    })),
  };
};

export function validateScratch(p: ScratchProject | null): string | null {
  if (!p) return "Manca il contenuto del gioco";
  if (p.sprites.length < 1) return "Serve almeno uno sprite";
  if (p.sprites.length > MAX_SPRITES) return `Massimo ${MAX_SPRITES} sprite`;
  if (p.sprites.some((s) => s.costumes.length < 1)) return "Ogni sprite ha bisogno di almeno un costume";
  if (p.backdrops.length < 1) return "Serve almeno uno sfondo";
  const { goal, lives, time } = p.settings;
  if (!(goal >= 1 && goal <= 1000)) return "L'obiettivo di punti deve essere tra 1 e 1000";
  if (lives < 0 || lives > 9) return "Le vite vanno da 0 a 9";
  if (time < 0 || time > 600) return "Il tempo massimo va da 0 a 600 secondi";
  if (projectBlockCount(p) > MAX_BLOCKS) return `Massimo ${MAX_BLOCKS} blocchi`;
  let flag = false;
  let scoring = false;
  let ends = false;
  let bad: string | null = null;
  const varIds = new Set(p.vars.map((v) => v.id));
  const listIds = new Set(p.lists.map((l) => l.id));
  for (const sp of p.sprites) {
    for (const sc of sp.scripts) {
      if (sc.blocks[0]?.op === "evt_flag") flag = true;
      walkBlocks(sc.blocks, (blk) => {
        if (blk.op === "game_change_score" || blk.op === "game_set_score") scoring = true;
        if (blk.op === "game_end") ends = true;
        const spec = SPEC_BY_OP[blk.op];
        if (!spec || bad) return;
        for (const [k, a] of Object.entries(spec.args)) {
          if (a.slot !== "menu") continue;
          const v = blk.args[k];
          if (typeof v === "object") continue;
          if (a.menu === "var" && !varIds.has(String(v))) bad = "Un blocco usa una variabile non scelta o eliminata";
          if (a.menu === "list" && !listIds.has(String(v))) bad = "Un blocco usa una lista non scelta o eliminata";
          if (a.menu === "message" && !p.messages.includes(String(v))) bad = "Un blocco usa un messaggio non scelto o eliminato";
        }
      });
    }
  }
  if (bad) return bad;
  if (!flag) return "Aggiungi un blocco «quando si clicca 🏁» per far partire il gioco";
  if (!scoring) return "Assegna punti con «cambia punteggio di» o «porta punteggio a»";
  if (!ends && time === 0 && lives === 0) return "Aggiungi «termina il gioco», oppure imposta un tempo massimo o delle vite";
  return null;
}

export const categoryColor = (cat: CategoryId) => CATEGORIES.find((c) => c.id === cat)?.color ?? "#888";

export { blocksOf, parseParams };

export const initialView = (p: ScratchProject): import("./types").View => ({
  sprites: p.sprites.map((s, i) => ({
    key: i + 1,
    defId: s.id,
    emoji: s.costumes[0] ?? "❓",
    x: s.x,
    y: s.y,
    size: s.size,
    dir: s.dir,
    rotation: s.rotation,
    visible: s.visible,
    opacity: 100,
    say: null,
    z: i,
    clone: false,
  })),
  backdrop: 0,
  vars: p.vars.filter((v) => v.shown && v.scope === "all").map((v) => ({ name: v.name, value: String(v.initial) })),
  asking: null,
  ended: false,
  score: 0,
  lives: p.settings.lives,
  timeLeft: p.settings.time > 0 ? p.settings.time : null,
  percent: 0,
});

export const usedKeys = (p: ScratchProject): string[] => {
  const keys = new Set<string>();
  for (const sp of p.sprites) {
    for (const sc of sp.scripts) {
      walkBlocks(sc.blocks, (blk) => {
        if ((blk.op === "evt_key" || blk.op === "sen_key") && typeof blk.args.key === "string" && blk.args.key !== "any") keys.add(blk.args.key);
      });
    }
  }
  return [...keys];
};

export const clearRefs = (p: ScratchProject, kind: "var" | "list" | "message", value: string): ScratchProject => {
  const fix = (blk: SBlock): SBlock => {
    const spec = SPEC_BY_OP[blk.op];
    const args: Record<string, Arg> = {};
    for (const [k, v] of Object.entries(blk.args)) {
      if (typeof v === "object") args[k] = fix(v);
      else if (spec?.args[k]?.menu === kind && String(v) === value) args[k] = "";
      else args[k] = v;
    }
    const stacks = blk.stacks ? Object.fromEntries(Object.entries(blk.stacks).map(([k, st]) => [k, st.map(fix)])) : undefined;
    return { ...blk, args, ...(stacks ? { stacks } : {}) };
  };
  return { ...p, sprites: p.sprites.map((s) => ({ ...s, scripts: s.scripts.map((sc) => ({ ...sc, blocks: sc.blocks.map(fix) })) })) };
};

export const purgeSprite = (p: ScratchProject, spriteId: string): ScratchProject => {
  const kinds = new Set(["target", "aimTarget", "pointTarget", "cloneTarget", "sprite"]);
  const fix = (blk: SBlock): SBlock => {
    const spec = SPEC_BY_OP[blk.op];
    const args: Record<string, Arg> = {};
    for (const [k, v] of Object.entries(blk.args)) {
      if (typeof v === "object") args[k] = fix(v);
      else if (spec?.args[k]?.menu && kinds.has(spec.args[k].menu!) && String(v) === spriteId) args[k] = spec.args[k].def;
      else args[k] = v;
    }
    const stacks = blk.stacks ? Object.fromEntries(Object.entries(blk.stacks).map(([k, st]) => [k, st.map(fix)])) : undefined;
    return { ...blk, args, ...(stacks ? { stacks } : {}) };
  };
  return {
    ...p,
    vars: p.vars.filter((v) => v.scope !== spriteId),
    lists: p.lists.filter((l) => l.scope !== spriteId),
    sprites: p.sprites.filter((s) => s.id !== spriteId).map((s) => ({ ...s, scripts: s.scripts.map((sc) => ({ ...sc, blocks: sc.blocks.map(fix) })) })),
  };
};
