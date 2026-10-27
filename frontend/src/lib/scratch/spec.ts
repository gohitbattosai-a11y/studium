import type { ArgSpec, CategoryId, MenuKind, OpSpec, Part, SBlock, ScratchProject, Shape, SpriteDef } from "./types";

export const CATEGORIES: { id: CategoryId; label: string; color: string }[] = [
  { id: "events", label: "Eventi", color: "#E6A700" },
  { id: "motion", label: "Movimento", color: "#4C97FF" },
  { id: "looks", label: "Aspetto", color: "#9966FF" },
  { id: "sound", label: "Suono", color: "#CF63CF" },
  { id: "control", label: "Controllo", color: "#F2A218" },
  { id: "sensing", label: "Sensori", color: "#3FA9D6" },
  { id: "operators", label: "Operatori", color: "#40BF4A" },
  { id: "variables", label: "Variabili", color: "#FF8C1A" },
  { id: "lists", label: "Liste", color: "#FF661A" },
  { id: "myblocks", label: "Miei blocchi", color: "#FF4D6A" },
  { id: "game", label: "Gioco", color: "#17A589" },
];

export const categoryOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

const a = (arg: string): Part => ({ arg });
const N = (def: number | string = 0): ArgSpec => ({ slot: "num", def });
const T = (def: string | number = ""): ArgSpec => ({ slot: "text", def });
const B: ArgSpec = { slot: "bool", def: false };
const M = (menu: MenuKind, def: string, options?: { value: string; label: string }[]): ArgSpec => ({ slot: "menu", def, menu, options });

export const KEY_OPTIONS: { value: string; label: string }[] = [
  { value: "space", label: "spazio" },
  { value: "up", label: "freccia su" },
  { value: "down", label: "freccia giù" },
  { value: "left", label: "freccia sinistra" },
  { value: "right", label: "freccia destra" },
  { value: "any", label: "qualsiasi" },
  ...[..."abcdefghijklmnopqrstuvwxyz0123456789"].map((c) => ({ value: c, label: c })),
];

export const SOUND_OPTIONS = [
  { value: "coin", label: "moneta" },
  { value: "win", label: "vittoria" },
  { value: "lose", label: "sconfitta" },
  { value: "pop", label: "pop" },
  { value: "laser", label: "laser" },
  { value: "beep", label: "bip" },
];

const MATH_OPTIONS = ["abs", "sqrt", "floor", "ceiling", "sin", "cos", "tan", "ln", "log"].map((v) => ({ value: v, label: v }));
const STOP_OPTIONS = [
  { value: "all", label: "tutto" },
  { value: "this", label: "questo script" },
  { value: "others", label: "altri script dello sprite" },
];

const def = (op: string, cat: CategoryId, shape: Shape, parts: Part[], args: Record<string, ArgSpec> = {}, extra: Partial<OpSpec> = {}): OpSpec => ({ op, cat, shape, parts, args, ...extra });

export const PROC_SLOTS = 5;

export const SPECS: OpSpec[] = [
  def("evt_flag", "events", "hat", ["quando si clicca 🏁"]),
  def("evt_key", "events", "hat", ["quando si preme il tasto", a("key")], { key: M("key", "space", KEY_OPTIONS) }),
  def("evt_click", "events", "hat", ["quando si clicca questo sprite"]),
  def("evt_stage", "events", "hat", ["quando si clicca lo sfondo"]),
  def("evt_receive", "events", "hat", ["quando ricevo", a("msg")], { msg: M("message", "") }),
  def("evt_clone", "events", "hat", ["quando vengo clonato"]),
  def("evt_when", "events", "hat", ["quando", a("cond"), "diventa vero"], { cond: B }),
  def("evt_broadcast", "events", "stack", ["invia", a("msg")], { msg: M("message", "") }),
  def("evt_broadcast_wait", "events", "stack", ["invia", a("msg"), "e attendi"], { msg: M("message", "") }),

  def("mot_move", "motion", "stack", ["muovi di", a("n"), "passi"], { n: N(10) }),
  def("mot_turn_r", "motion", "stack", ["ruota ↻ di", a("n"), "gradi"], { n: N(15) }),
  def("mot_turn_l", "motion", "stack", ["ruota ↺ di", a("n"), "gradi"], { n: N(15) }),
  def("mot_goto", "motion", "stack", ["vai a x:", a("x"), "y:", a("y")], { x: N(0), y: N(0) }),
  def("mot_goto_target", "motion", "stack", ["vai a", a("to")], { to: M("pointTarget", "random") }),
  def("mot_glide", "motion", "stack", ["scivola in", a("s"), "sec. a x:", a("x"), "y:", a("y")], { s: N(1), x: N(0), y: N(0) }),
  def("mot_point", "motion", "stack", ["punta in direzione", a("n")], { n: N(90) }),
  def("mot_point_towards", "motion", "stack", ["punta verso", a("to")], { to: M("aimTarget", "mouse") }),
  def("mot_changex", "motion", "stack", ["cambia x di", a("n")], { n: N(10) }),
  def("mot_setx", "motion", "stack", ["porta x a", a("n")], { n: N(0) }),
  def("mot_changey", "motion", "stack", ["cambia y di", a("n")], { n: N(10) }),
  def("mot_sety", "motion", "stack", ["porta y a", a("n")], { n: N(0) }),
  def("mot_bounce", "motion", "stack", ["rimbalza se tocchi il bordo"]),
  def("mot_x", "motion", "reporter", ["posizione x"]),
  def("mot_y", "motion", "reporter", ["posizione y"]),
  def("mot_dir", "motion", "reporter", ["direzione"]),

  def("look_say_for", "looks", "stack", ["dì", a("text"), "per", a("s"), "secondi"], { text: T("Ciao!"), s: N(2) }),
  def("look_say", "looks", "stack", ["dì", a("text")], { text: T("Ciao!") }),
  def("look_show", "looks", "stack", ["mostrati"]),
  def("look_hide", "looks", "stack", ["nasconditi"]),
  def("look_costume", "looks", "stack", ["passa al costume", a("c")], { c: M("costume", "1") }),
  def("look_next_costume", "looks", "stack", ["costume successivo"]),
  def("look_backdrop", "looks", "stack", ["cambia sfondo in", a("b")], { b: M("backdrop", "1") }),
  def("look_next_backdrop", "looks", "stack", ["sfondo successivo"]),
  def("look_size_set", "looks", "stack", ["porta dimensione a", a("n"), "%"], { n: N(100) }),
  def("look_size_change", "looks", "stack", ["cambia dimensione di", a("n")], { n: N(10) }),
  def("look_opacity", "looks", "stack", ["porta visibilità a", a("n"), "%"], { n: N(100) }),
  def("look_front", "looks", "stack", ["vai in primo piano"]),
  def("look_costume_num", "looks", "reporter", ["numero costume"]),
  def("look_size", "looks", "reporter", ["dimensione"]),

  def("snd_play", "sound", "stack", ["suona", a("sound")], { sound: M("sound", "coin", SOUND_OPTIONS) }),
  def("snd_tone", "sound", "stack", ["suona la nota", a("n"), "per", a("s"), "secondi"], { n: N(60), s: N(0.5) }),

  def("ctl_wait", "control", "stack", ["attendi", a("s"), "secondi"], { s: N(1) }),
  def("ctl_repeat", "control", "c", ["ripeti", a("n"), "volte"], { n: N(10) }, { stacks: ["a"] }),
  def("ctl_forever", "control", "c", ["per sempre"], {}, { stacks: ["a"], terminal: true }),
  def("ctl_if", "control", "c", ["se", a("cond"), "allora"], { cond: B }, { stacks: ["a"] }),
  def("ctl_ifelse", "control", "c", ["se", a("cond"), "allora"], { cond: B }, { stacks: ["a", "b"], stackLabels: ["", "altrimenti"] }),
  def("ctl_wait_until", "control", "stack", ["attendi finché", a("cond")], { cond: B }),
  def("ctl_repeat_until", "control", "c", ["ripeti fino a", a("cond")], { cond: B }, { stacks: ["a"] }),
  def("ctl_for", "control", "c", ["per", a("var"), "da", a("from"), "a", a("to")], { var: M("var", ""), from: N(1), to: N(10) }, { stacks: ["a"] }),
  def("ctl_stop", "control", "cap", ["ferma", a("what")], { what: M("static", "all", STOP_OPTIONS) }),
  def("ctl_clone", "control", "stack", ["crea clone di", a("who")], { who: M("cloneTarget", "_myself_") }),
  def("ctl_clone_delete", "control", "cap", ["elimina questo clone"]),

  def("sen_touching", "sensing", "boolean", ["tocca", a("t"), "?"], { t: M("target", "edge") }),
  def("sen_key", "sensing", "boolean", ["tasto", a("key"), "premuto?"], { key: M("key", "space", KEY_OPTIONS) }),
  def("sen_mouse_down", "sensing", "boolean", ["mouse premuto?"]),
  def("sen_mouse_x", "sensing", "reporter", ["mouse x"]),
  def("sen_mouse_y", "sensing", "reporter", ["mouse y"]),
  def("sen_distance", "sensing", "reporter", ["distanza da", a("t")], { t: M("aimTarget", "mouse") }),
  def("sen_ask", "sensing", "stack", ["chiedi", a("q"), "e attendi"], { q: T("Come ti chiami?") }),
  def("sen_answer", "sensing", "reporter", ["risposta"]),
  def("sen_timer", "sensing", "reporter", ["cronometro"]),
  def("sen_timer_reset", "sensing", "stack", ["azzera cronometro"]),

  def("op_add", "operators", "reporter", [a("a"), "+", a("b")], { a: N(""), b: N("") }),
  def("op_sub", "operators", "reporter", [a("a"), "−", a("b")], { a: N(""), b: N("") }),
  def("op_mul", "operators", "reporter", [a("a"), "×", a("b")], { a: N(""), b: N("") }),
  def("op_div", "operators", "reporter", [a("a"), "÷", a("b")], { a: N(""), b: N("") }),
  def("op_mod", "operators", "reporter", [a("a"), "resto di", a("b")], { a: N(""), b: N("") }),
  def("op_random", "operators", "reporter", ["numero a caso tra", a("a"), "e", a("b")], { a: N(1), b: N(10) }),
  def("op_gt", "operators", "boolean", [a("a"), ">", a("b")], { a: T(""), b: T(50) }),
  def("op_lt", "operators", "boolean", [a("a"), "<", a("b")], { a: T(""), b: T(50) }),
  def("op_eq", "operators", "boolean", [a("a"), "=", a("b")], { a: T(""), b: T(50) }),
  def("op_and", "operators", "boolean", [a("a"), "e", a("b")], { a: B, b: B }),
  def("op_or", "operators", "boolean", [a("a"), "o", a("b")], { a: B, b: B }),
  def("op_not", "operators", "boolean", ["non", a("a")], { a: B }),
  def("op_join", "operators", "reporter", ["unisci", a("a"), "e", a("b")], { a: T("ciao "), b: T("mondo") }),
  def("op_letter", "operators", "reporter", ["lettera", a("n"), "di", a("s")], { n: N(1), s: T("ciao") }),
  def("op_len", "operators", "reporter", ["lunghezza di", a("s")], { s: T("ciao") }),
  def("op_contains", "operators", "boolean", [a("a"), "contiene", a("b"), "?"], { a: T("ciao"), b: T("a") }),
  def("op_round", "operators", "reporter", ["arrotonda", a("n")], { n: N("") }),
  def("op_math", "operators", "reporter", [a("fn"), "di", a("n")], { fn: M("static", "abs", MATH_OPTIONS), n: N(9) }),

  def("var_set", "variables", "stack", ["porta", a("var"), "a", a("v")], { var: M("var", ""), v: T(0) }),
  def("var_change", "variables", "stack", ["cambia", a("var"), "di", a("v")], { var: M("var", ""), v: N(1) }),
  def("var_get", "variables", "reporter", [a("var")], { var: M("var", "") }),
  def("var_show", "variables", "stack", ["mostra variabile", a("var")], { var: M("var", "") }),
  def("var_hide", "variables", "stack", ["nascondi variabile", a("var")], { var: M("var", "") }),

  def("list_add", "lists", "stack", ["aggiungi", a("v"), "a", a("list")], { v: T("cosa"), list: M("list", "") }),
  def("list_delete", "lists", "stack", ["elimina elemento", a("i"), "da", a("list")], { i: N(1), list: M("list", "") }),
  def("list_insert", "lists", "stack", ["inserisci", a("v"), "in posizione", a("i"), "di", a("list")], { v: T("cosa"), i: N(1), list: M("list", "") }),
  def("list_replace", "lists", "stack", ["sostituisci elemento", a("i"), "di", a("list"), "con", a("v")], { i: N(1), list: M("list", ""), v: T("cosa") }),
  def("list_clear", "lists", "stack", ["svuota", a("list")], { list: M("list", "") }),
  def("list_item", "lists", "reporter", ["elemento", a("i"), "di", a("list")], { i: N(1), list: M("list", "") }),
  def("list_len", "lists", "reporter", ["lunghezza di", a("list")], { list: M("list", "") }),
  def("list_contains", "lists", "boolean", [a("list"), "contiene", a("v"), "?"], { list: M("list", ""), v: T("cosa") }),

  def("proc_define", "myblocks", "hat", ["definisci", a("name"), "con parametri", a("params")], { name: T("azione"), params: T("") }),
  def(
    "proc_call",
    "myblocks",
    "stack",
    [],
    { proc: T(""), ...Object.fromEntries(Array.from({ length: PROC_SLOTS }, (_, i) => [`a${i}`, T("")])) },
  ),
  def("proc_param", "myblocks", "reporter", [a("name")], { name: T("") }),

  def("game_score", "game", "reporter", ["punteggio"]),
  def("game_change_score", "game", "stack", ["cambia punteggio di", a("n")], { n: N(1) }),
  def("game_set_score", "game", "stack", ["porta punteggio a", a("n")], { n: N(0) }),
  def("game_lives", "game", "reporter", ["vite"]),
  def("game_change_lives", "game", "stack", ["cambia vite di", a("n")], { n: N(-1) }),
  def("game_time", "game", "reporter", ["tempo rimasto"]),
  def("game_end", "game", "cap", ["termina il gioco"]),
];

export const SPEC_BY_OP: Record<string, OpSpec> = Object.fromEntries(SPECS.map((s) => [s.op, s]));

export const isReporterShape = (shape: Shape) => shape === "reporter" || shape === "boolean";
export const isTerminal = (spec: OpSpec) => spec.shape === "cap" || !!spec.terminal;

let counter = 0;
export const uid = () => `${Date.now().toString(36).slice(-4)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const defaultArgs = (op: string): Record<string, string | number | boolean> => {
  const spec = SPEC_BY_OP[op];
  if (!spec) return {};
  return Object.fromEntries(Object.entries(spec.args).map(([k, v]) => [k, v.def]));
};

export const newBlock = (op: string, args: Record<string, SBlock["args"][string]> = {}, stacks?: Record<string, SBlock[]>): SBlock => {
  const spec = SPEC_BY_OP[op];
  const block: SBlock = { id: uid(), op, args: { ...defaultArgs(op), ...args } };
  const names = spec?.stacks ?? [];
  if (names.length || stacks) {
    block.stacks = Object.fromEntries(names.map((n) => [n, stacks?.[n] ?? []]));
  }
  return block;
};

export const cloneBlocks = (blocks: SBlock[]): SBlock[] =>
  blocks.map((b) => ({
    id: uid(),
    op: b.op,
    args: Object.fromEntries(Object.entries(b.args).map(([k, v]) => [k, typeof v === "object" ? cloneBlocks([v])[0] : v])),
    ...(b.stacks ? { stacks: Object.fromEntries(Object.entries(b.stacks).map(([k, v]) => [k, cloneBlocks(v)])) } : {}),
  }));

export interface Proc {
  id: string;
  name: string;
  params: string[];
}

export const parseParams = (raw: string) =>
  String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, PROC_SLOTS);

export const procsOf = (sprite: SpriteDef): Proc[] =>
  sprite.scripts.flatMap((s) => {
    const first = s.blocks[0];
    if (!first || first.op !== "proc_define") return [];
    return [{ id: first.id, name: String(first.args.name ?? ""), params: parseParams(String(first.args.params ?? "")) }];
  });

export interface MenuCtx {
  project: ScratchProject;
  sprite: SpriteDef | undefined;
}

export const messageOptions = (project: ScratchProject) => project.messages.map((m) => ({ value: m, label: m }));

export const menuOptions = (kind: MenuKind, ctx: MenuCtx, spec: ArgSpec): { value: string; label: string }[] => {
  const { project, sprite } = ctx;
  const others = project.sprites.filter((s) => s.id !== sprite?.id).map((s) => ({ value: s.id, label: s.name }));
  const all = project.sprites.map((s) => ({ value: s.id, label: s.name }));
  switch (kind) {
    case "static":
    case "key":
    case "sound":
      return spec.options ?? [];
    case "var":
      return project.vars.filter((v) => v.scope === "all" || v.scope === sprite?.id).map((v) => ({ value: v.id, label: v.name }));
    case "list":
      return project.lists.filter((l) => l.scope === "all" || l.scope === sprite?.id).map((l) => ({ value: l.id, label: l.name }));
    case "message":
      return messageOptions(project);
    case "sprite":
      return all;
    case "target":
      return [{ value: "edge", label: "bordo" }, { value: "mouse", label: "puntatore" }, ...others];
    case "aimTarget":
      return [{ value: "mouse", label: "puntatore" }, ...others];
    case "pointTarget":
      return [{ value: "random", label: "posizione a caso" }, { value: "mouse", label: "puntatore" }, ...others];
    case "cloneTarget":
      return [{ value: "_myself_", label: "me stesso" }, ...others];
    case "costume":
      return (sprite?.costumes ?? []).map((c, i) => ({ value: String(i + 1), label: `${i + 1} ${c}` }));
    case "backdrop":
      return project.backdrops.map((b, i) => ({ value: String(i + 1), label: `${i + 1} ${b.name}` }));
    default:
      return [];
  }
};

export const blocksOf = (blocks: SBlock[]): number =>
  blocks.reduce(
    (n, b) =>
      n +
      1 +
      Object.values(b.args).reduce<number>((m, v) => m + (typeof v === "object" ? blocksOf([v]) : 0), 0) +
      Object.values(b.stacks ?? {}).reduce((m, st) => m + blocksOf(st), 0),
    0,
  );

export const projectBlockCount = (p: ScratchProject) => p.sprites.reduce((n, s) => n + s.scripts.reduce((m, sc) => m + blocksOf(sc.blocks), 0), 0);

export const walkBlocks = (blocks: SBlock[], fn: (b: SBlock) => void) => {
  for (const b of blocks) {
    fn(b);
    for (const v of Object.values(b.args)) if (typeof v === "object") walkBlocks([v], fn);
    for (const st of Object.values(b.stacks ?? {})) walkBlocks(st, fn);
  }
};
