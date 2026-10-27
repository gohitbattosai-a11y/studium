export type Arg = string | number | boolean | SBlock;

export interface SBlock {
  id: string;
  op: string;
  args: Record<string, Arg>;
  stacks?: Record<string, SBlock[]>;
}

export interface Script {
  id: string;
  x: number;
  y: number;
  blocks: SBlock[];
}

export type RotationStyle = "all" | "lr" | "none";

export interface SpriteDef {
  id: string;
  name: string;
  costumes: string[];
  x: number;
  y: number;
  size: number;
  dir: number;
  rotation: RotationStyle;
  visible: boolean;
  scripts: Script[];
}

export interface Backdrop {
  id: string;
  name: string;
  from: string;
  to: string;
  deco: string;
}

export interface VarDef {
  id: string;
  name: string;
  initial: number;
  scope: string;
  shown: boolean;
}

export interface ListDef {
  id: string;
  name: string;
  scope: string;
}

export interface ScratchSettings {
  goal: number;
  lives: number;
  time: number;
}

export interface ScratchProject {
  v: 1;
  settings: ScratchSettings;
  backdrops: Backdrop[];
  messages: string[];
  vars: VarDef[];
  lists: ListDef[];
  sprites: SpriteDef[];
}

export type Shape = "hat" | "stack" | "cap" | "c" | "reporter" | "boolean";

export type SlotKind = "num" | "text" | "bool" | "menu";

export type MenuKind = "static" | "var" | "list" | "message" | "sprite" | "target" | "aimTarget" | "pointTarget" | "key" | "costume" | "backdrop" | "sound" | "cloneTarget" | "text";

export interface ArgSpec {
  slot: SlotKind;
  def: string | number | boolean;
  menu?: MenuKind;
  options?: { value: string; label: string }[];
}

export type Part = string | { arg: string };

export interface OpSpec {
  op: string;
  cat: CategoryId;
  shape: Shape;
  parts: Part[];
  args: Record<string, ArgSpec>;
  stacks?: string[];
  stackLabels?: string[];
  terminal?: boolean;
}

export type CategoryId = "events" | "motion" | "looks" | "sound" | "control" | "sensing" | "operators" | "variables" | "lists" | "myblocks" | "game";

export interface View {
  sprites: SpriteView[];
  backdrop: number;
  vars: { name: string; value: string }[];
  asking: string | null;
  ended: boolean;
  score: number;
  lives: number;
  timeLeft: number | null;
  percent: number;
}

export interface SpriteView {
  key: number;
  defId: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  dir: number;
  rotation: RotationStyle;
  visible: boolean;
  opacity: number;
  say: string | null;
  z: number;
  clone: boolean;
}
