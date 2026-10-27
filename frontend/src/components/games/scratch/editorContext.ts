import { createContext, useContext } from "react";
import type { Proc } from "@/lib/scratch/spec";
import type { StackRef } from "@/lib/scratch/project";
import type { SBlock, ScratchProject, SpriteDef } from "@/lib/scratch/types";

export type Mode = "edit" | "palette" | "ghost";

export interface EditorCtx {
  project: ScratchProject;
  sprite: SpriteDef | undefined;
  procs: Proc[];
  selectedId: string | null;
  dropKey: string | null;
  onArg: (blockId: string, key: string, value: string) => void;
  onGrab: (e: React.PointerEvent, block: SBlock, origin: "palette" | "workspace") => void;
}

export const EditorContext = createContext<EditorCtx | null>(null);

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("EditorContext mancante");
  return ctx;
};

export const stackKey = (at: StackRef, index: number) => ("script" in at ? `s:${at.script}:${index}` : `b:${at.block}:${at.stack}:${index}`);
export const slotKey = (owner: string, key: string) => `slot:${owner}:${key}`;
