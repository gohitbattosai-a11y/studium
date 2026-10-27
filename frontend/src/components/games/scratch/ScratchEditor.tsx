import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Copy, Eraser, LayoutGrid, Play, Redo2, Sparkles, Square, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addScript, canDropOnSlot, canInsert, detach, dropOnSlot, duplicateFrom, initialView, insertAt, sampleApples, sampleQuiz, setArg, stackAt, tidy, type StackRef } from "@/lib/scratch/project";
import { cloneBlocks, isReporterShape, procsOf, projectBlockCount, SPEC_BY_OP, newBlock } from "@/lib/scratch/spec";
import type { CategoryId, SBlock, Script, ScratchProject } from "@/lib/scratch/types";
import { cn } from "@/lib/utils";
import { Segmented } from "@/components/common";
import { Panel } from "@/components/shop/ui";
import { BlockView, StackView } from "./BlockView";
import { EditorContext, slotKey, stackKey, type EditorCtx } from "./editorContext";
import Palette from "./Palette";
import ScratchRun from "./ScratchRun";
import SpritePanel from "./SpritePanel";
import StageView from "./StageView";

type Target =
  | { kind: "stack"; at: StackRef; index: number; key: string }
  | { kind: "slot"; owner: string; slot: string; key: string }
  | { kind: "free"; x: number; y: number }
  | { kind: "delete" }
  | { kind: "sprite"; id: string }
  | { kind: "cancel" };

interface DragRun {
  startX: number;
  startY: number;
  block: SBlock;
  origin: "palette" | "workspace";
  started: boolean;
  blocks: SBlock[];
  before: ScratchProject;
  offX: number;
  offY: number;
  spriteId: string;
  target: Target | null;
}

const withScripts = (p: ScratchProject, spriteId: string, scripts: Script[]): ScratchProject => ({ ...p, sprites: p.sprites.map((s) => (s.id === spriteId ? { ...s, scripts } : s)) });
const scriptsOf = (p: ScratchProject, spriteId: string) => p.sprites.find((s) => s.id === spriteId)?.scripts ?? [];
const keyOf = (t: Target | null) => (t && (t.kind === "stack" || t.kind === "slot") ? t.key : null);

export default function ScratchEditor({ project, onChange }: { project: ScratchProject; onChange: (p: ScratchProject) => void }) {
  const [spriteId, setSpriteId] = useState(project.sprites[0].id);
  const [cat, setCat] = useState<CategoryId>("events");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const [ghost, setGhost] = useState<SBlock[] | null>(null);
  const [tab, setTab] = useState<"code" | "stage">("code");
  const [running, setRunning] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [, bump] = useState(0);

  const sprite = project.sprites.find((s) => s.id === spriteId) ?? project.sprites[0];
  const projectRef = useRef(project);
  projectRef.current = project;
  const spriteRef = useRef(sprite.id);
  spriteRef.current = sprite.id;
  const history = useRef<{ past: ScratchProject[]; future: ScratchProject[] }>({ past: [], future: [] });
  const lastEdit = useRef<{ k: string; t: number } | null>(null);
  const activeScript = useRef<string | null>(null);
  const drag = useRef<DragRun | null>(null);
  const wsRef = useRef<HTMLDivElement>(null);
  const palRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const procs = useMemo(() => procsOf(sprite), [sprite]);

  const transient = (next: ScratchProject) => {
    projectRef.current = next;
    onChange(next);
  };

  const commit = (next: ScratchProject, prev: ScratchProject = projectRef.current) => {
    if (next === prev) return;
    history.current.past.push(prev);
    if (history.current.past.length > 80) history.current.past.shift();
    history.current.future = [];
    lastEdit.current = null;
    transient(next);
    bump((n) => n + 1);
  };

  const edit = (next: ScratchProject, k: string) => {
    const now = Date.now();
    if (lastEdit.current && lastEdit.current.k === k && now - lastEdit.current.t < 1500) {
      lastEdit.current.t = now;
      transient(next);
      return;
    }
    const prev = projectRef.current;
    commit(next, prev);
    lastEdit.current = { k, t: now };
  };

  const undo = () => {
    const prev = history.current.past.pop();
    if (!prev) return;
    history.current.future.push(projectRef.current);
    lastEdit.current = null;
    transient(prev);
    setSelectedId(null);
    bump((n) => n + 1);
  };

  const redo = () => {
    const next = history.current.future.pop();
    if (!next) return;
    history.current.past.push(projectRef.current);
    lastEdit.current = null;
    transient(next);
    setSelectedId(null);
    bump((n) => n + 1);
  };

  const freePosition = () => {
    const ws = wsRef.current;
    if (!ws) return { x: 24, y: 24 };
    const base = ws.getBoundingClientRect();
    let bottom = 0;
    ws.querySelectorAll<HTMLElement>("[data-script]").forEach((el) => {
      const r = el.getBoundingClientRect();
      bottom = Math.max(bottom, r.bottom - base.top + ws.scrollTop);
    });
    return { x: 24, y: bottom > 0 ? bottom + 24 : 24 };
  };

  const addFromPalette = (block: SBlock) => {
    const fresh = cloneBlocks([block]);
    const shape = SPEC_BY_OP[fresh[0].op]?.shape;
    const cur = projectRef.current;
    const scripts = scriptsOf(cur, spriteRef.current);
    const active = activeScript.current ? scripts.find((s) => s.id === activeScript.current) : undefined;
    if (active && shape && !isReporterShape(shape) && canInsert(fresh, active.blocks, active.blocks.length)) {
      commit(withScripts(cur, spriteRef.current, insertAt(scripts, { script: active.id }, active.blocks.length, fresh)));
      return;
    }
    const pos = freePosition();
    const next = addScript(scripts, fresh, pos.x, pos.y);
    activeScript.current = next[next.length - 1].id;
    commit(withScripts(cur, spriteRef.current, next));
  };

  const positionGhost = () => {
    const d = drag.current;
    const el = ghostRef.current;
    if (!d || !el) return;
    el.style.transform = `translate(${pointer.current.x - d.offX}px, ${pointer.current.y - d.offY}px)`;
  };

  useLayoutEffect(positionGhost, [ghost]);

  const hit = (d: DragRun, x: number, y: number): Target => {
    const ws = wsRef.current;
    const pal = palRef.current;
    const els = document.elementsFromPoint(x, y);
    const spriteDrop = els.find((el) => el instanceof HTMLElement && el.dataset.spriteDrop) as HTMLElement | undefined;
    if (spriteDrop) return { kind: "sprite", id: spriteDrop.dataset.spriteDrop! };
    if (pal && els.includes(pal)) return { kind: "delete" };
    if (!ws || !els.includes(ws)) return { kind: "cancel" };
    const scripts = scriptsOf(projectRef.current, d.spriteId);
    const first = SPEC_BY_OP[d.blocks[0].op];
    if (d.blocks.length === 1 && first && isReporterShape(first.shape)) {
      let best: { el: HTMLElement; area: number } | null = null;
      ws.querySelectorAll<HTMLElement>("[data-slot-owner]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const pad = 8;
        if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) return;
        if (!canDropOnSlot(d.blocks, el.dataset.slotKind as "num" | "text" | "bool")) return;
        const area = r.width * r.height;
        if (!best || area < best.area) best = { el, area };
      });
      if (best) {
        const el = (best as { el: HTMLElement }).el;
        const owner = el.dataset.slotOwner!;
        const slot = el.dataset.slotKey!;
        return { kind: "slot", owner, slot, key: slotKey(owner, slot) };
      }
    } else if (first && !isReporterShape(first.shape) && first.shape !== "hat") {
      let best: { target: Target; dist: number } | null = null;
      const gx = x - d.offX;
      const gy = y - d.offY;
      ws.querySelectorAll<HTMLElement>("[data-ins]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const dist = Math.hypot(gx - r.left, gy - r.top);
        if (dist > 64 || (best && dist >= best.dist)) return;
        const index = Number(el.dataset.insIndex);
        const at: StackRef = el.dataset.insScript ? { script: el.dataset.insScript } : { block: el.dataset.insBlock!, stack: el.dataset.insStack! };
        const stack = stackAt(scripts, at);
        if (!stack || !canInsert(d.blocks, stack, index)) return;
        best = { target: { kind: "stack", at, index, key: stackKey(at, index) }, dist };
      });
      if (best) return (best as { target: Target }).target;
    }
    const r = ws.getBoundingClientRect();
    return { kind: "free", x: x - d.offX - r.left + ws.scrollLeft, y: y - d.offY - r.top + ws.scrollTop };
  };

  const startDrag = (d: DragRun) => {
    if (d.origin === "palette") d.blocks = cloneBlocks([d.block]);
    else {
      const cut = detach(scriptsOf(projectRef.current, d.spriteId), d.block.id);
      if (!cut) return false;
      d.blocks = cut.removed;
      transient(withScripts(projectRef.current, d.spriteId, cut.scripts));
    }
    d.started = true;
    setSelectedId(null);
    setGhost(d.blocks);
    return true;
  };

  const finish = (d: DragRun, target: Target) => {
    const base = projectRef.current;
    const scripts = scriptsOf(base, d.spriteId);
    let next = base;
    if (target.kind === "stack") {
      next = withScripts(base, d.spriteId, insertAt(scripts, target.at, target.index, d.blocks));
      if ("script" in target.at) activeScript.current = target.at.script;
    } else if (target.kind === "slot") {
      next = withScripts(base, d.spriteId, dropOnSlot(scripts, target.owner, target.slot, d.blocks[0]));
    } else if (target.kind === "free") {
      const added = addScript(scripts, d.blocks, target.x, target.y);
      activeScript.current = added[added.length - 1].id;
      next = withScripts(base, d.spriteId, added);
    } else if (target.kind === "sprite") {
      const dest = d.before.sprites.find((s) => s.id === target.id);
      const copy = dest ? addScript(dest.scripts, cloneBlocks(d.blocks), 24, 24 + dest.scripts.length * 40) : null;
      next = copy ? withScripts(d.before, target.id, copy) : d.before;
      if (copy) toast.success(`Copiato su ${dest!.name}`);
    } else if (target.kind === "cancel") {
      next = d.before;
    }
    commit(next, d.before);
  };

  const move = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    pointer.current = { x: e.clientX, y: e.clientY };
    if (!d.started) {
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 5) return;
      if (!startDrag(d)) {
        stop();
        return;
      }
    }
    positionGhost();
    const t = hit(d, e.clientX, e.clientY);
    d.target = t;
    setDropKey(keyOf(t));
  };

  const up = (e: PointerEvent) => {
    const d = drag.current;
    stop();
    if (!d) return;
    if (!d.started) {
      if (d.origin === "palette") addFromPalette(d.block);
      else setSelectedId((cur) => (cur === d.block.id ? null : d.block.id));
      return;
    }
    finish(d, hit(d, e.clientX, e.clientY));
    setGhost(null);
    setDropKey(null);
  };

  const cancel = () => {
    const d = drag.current;
    stop();
    if (d?.started) {
      transient(d.before);
      setGhost(null);
      setDropKey(null);
    }
  };

  const handlers = useRef({ move, up, cancel });
  handlers.current = { move, up, cancel };
  const stable = useRef({
    move: (e: PointerEvent) => handlers.current.move(e),
    up: (e: PointerEvent) => handlers.current.up(e),
    cancel: () => handlers.current.cancel(),
  }).current;

  const stop = () => {
    window.removeEventListener("pointermove", stable.move);
    window.removeEventListener("pointerup", stable.up);
    window.removeEventListener("pointercancel", stable.cancel);
    drag.current = null;
  };

  useEffect(() => () => stop(), []);

  const onGrab: EditorCtx["onGrab"] = (e, block, origin) => {
    if (drag.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    pointer.current = { x: e.clientX, y: e.clientY };
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      block,
      origin,
      started: false,
      blocks: [],
      before: projectRef.current,
      offX: e.clientX - rect.left,
      offY: e.clientY - rect.top,
      spriteId: spriteRef.current,
      target: null,
    };
    window.addEventListener("pointermove", stable.move);
    window.addEventListener("pointerup", stable.up);
    window.addEventListener("pointercancel", stable.cancel);
  };

  const onArg: EditorCtx["onArg"] = (blockId, key, value) => {
    const cur = projectRef.current;
    edit(withScripts(cur, spriteRef.current, setArg(scriptsOf(cur, spriteRef.current), blockId, key, value)), `${blockId}:${key}`);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    const cur = projectRef.current;
    const cut = detach(scriptsOf(cur, spriteRef.current), selectedId, true);
    if (!cut) return;
    setSelectedId(null);
    commit(withScripts(cur, spriteRef.current, cut.scripts));
  };

  const duplicateSelected = () => {
    if (!selectedId) return;
    const cur = projectRef.current;
    commit(withScripts(cur, spriteRef.current, duplicateFrom(scriptsOf(cur, spriteRef.current), selectedId)));
    setSelectedId(null);
  };

  const createProc = (name: string, params: string) => {
    const cur = projectRef.current;
    const pos = freePosition();
    const def = newBlock("proc_define", { name, params });
    commit(withScripts(cur, spriteRef.current, addScript(scriptsOf(cur, spriteRef.current), [def], pos.x, pos.y)));
    setCat("myblocks");
  };

  const tidyUp = () => {
    const ws = wsRef.current;
    if (!ws) return;
    const heights: Record<string, number> = {};
    ws.querySelectorAll<HTMLElement>("[data-script]").forEach((el) => {
      heights[el.dataset.script!] = el.getBoundingClientRect().height;
    });
    const cur = projectRef.current;
    commit(withScripts(cur, spriteRef.current, tidy(scriptsOf(cur, spriteRef.current), heights)));
  };

  const loadSample = (make: () => ScratchProject) => {
    const next = make();
    commit(next);
    setSpriteId(next.sprites[0].id);
    setSelectedId(null);
  };

  const ctx: EditorCtx = { project, sprite, procs, selectedId, dropKey, onArg, onGrab };
  const scripts = sprite.scripts;
  const width = Math.max(900, ...scripts.map((s) => s.x + 520));
  const height = Math.max(520, ...scripts.map((s) => s.y + 420));
  const empty = projectBlockCount(project) === 0;
  const hist = history.current;

  return (
    <EditorContext.Provider value={ctx}>
      <div className="space-y-4" data-testid="editor-scratch">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" disabled={hist.past.length === 0} onClick={undo} data-testid="scratch-undo">
              <Undo2 className="size-3.5" /> Annulla
            </Button>
            <Button variant="outline" size="sm" disabled={hist.future.length === 0} onClick={redo}>
              <Redo2 className="size-3.5" /> Ripeti
            </Button>
            <Button variant="outline" size="sm" disabled={scripts.length < 2} onClick={tidyUp}>
              <LayoutGrid className="size-3.5" /> Riordina
            </Button>
            {empty && (
              <>
                <Button variant="outline" size="sm" onClick={() => loadSample(sampleApples)} data-testid="scratch-sample-apples">
                  <Sparkles className="size-3.5" /> Esempio: prendi le mele
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadSample(sampleQuiz)} data-testid="scratch-sample-quiz">
                  <Sparkles className="size-3.5" /> Esempio: quiz
                </Button>
              </>
            )}
          </div>
          <Segmented
            value={tab}
            onChange={setTab}
            testId="scratch-tab"
            className="lg:hidden"
            options={[
              { value: "code", label: "Codice" },
              { value: "stage", label: "Palco e sprite" },
            ]}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className={cn("min-w-0 space-y-4", tab === "code" ? "block" : "hidden", "lg:block")}>
            <div className="grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)]">
              <Palette project={project} sprite={sprite} cat={cat} onCat={setCat} onProject={(p) => commit(p)} onCreateProc={createProc} paletteRef={palRef} />
              <section className="min-w-0 rounded-xl border border-[#30363D] bg-[#161B22]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#30363D] px-3 py-2">
                  <p className="text-sm font-medium">
                    Codice di <span className="text-[#58A6FF]">{sprite.name}</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    {selectedId && (
                      <>
                        <Button variant="outline" size="sm" onClick={duplicateSelected} data-testid="scratch-duplicate">
                          <Copy className="size-3.5" /> Duplica
                        </Button>
                        <Button variant="outline" size="sm" onClick={removeSelected} data-testid="scratch-remove">
                          <Trash2 className="size-3.5" /> Elimina blocco
                        </Button>
                      </>
                    )}
                    {!selectedId && <span className="text-xs text-[#8B949E]">Trascina i blocchi qui, oppure toccali nella palette</span>}
                  </div>
                </div>
                <div
                  ref={wsRef}
                  tabIndex={0}
                  className="relative h-[520px] overflow-auto rounded-b-xl bg-[#0D1117] outline-none [background-image:radial-gradient(#21262D_1px,transparent_1px)] [background-size:20px_20px]"
                  data-testid="scratch-workspace"
                  onPointerDown={() => setSelectedId(null)}
                  onKeyDown={(e) => {
                    if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !(e.target instanceof HTMLInputElement)) {
                      e.preventDefault();
                      removeSelected();
                    }
                    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !(e.target instanceof HTMLInputElement)) {
                      e.preventDefault();
                      if (e.shiftKey) redo();
                      else undo();
                    }
                  }}
                >
                  <div className="relative" style={{ width, height }}>
                    {scripts.map((s) => (
                      <div key={s.id} data-script={s.id} className="absolute" style={{ left: s.x, top: s.y }}>
                        <StackView blocks={s.blocks} at={{ script: s.id }} mode="edit" />
                      </div>
                    ))}
                    {scripts.length === 0 && (
                      <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-2 text-sm text-[#8B949E]">
                        <Eraser className="size-4" /> Nessun blocco: parti da «Eventi» e trascina «quando si clicca 🏁»
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className={cn("min-w-0 space-y-4", tab === "stage" ? "block" : "hidden", "lg:block")}>
            <Panel
              title="Palco"
              hint={running ? "Il gioco è in esecuzione." : "Trascina gli sprite per scegliere dove iniziano."}
              action={
                running ? (
                  <Button variant="outline" size="sm" onClick={() => setRunning(false)} data-testid="scratch-stop">
                    <Square className="size-3.5" /> Ferma
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setRunKey((k) => k + 1);
                      setRunning(true);
                    }}
                    data-testid="scratch-run"
                  >
                    <Play className="size-3.5" /> Prova
                  </Button>
                )
              }
            >
              {running ? (
                <ScratchRun
                  key={runKey}
                  project={project}
                  autoStart
                  onStop={() => setRunning(false)}
                  onFinish={(p) => {
                    setRunning(false);
                    toast.message(`Partita finita: ${p}%`);
                  }}
                />
              ) : (
                <StageView
                  view={initialView(project)}
                  backdrops={project.backdrops}
                  selectedId={sprite.id}
                  onSpriteDrag={(id, x, y) => {
                    setSpriteId(id);
                    const cur = projectRef.current;
                    edit({ ...cur, sprites: cur.sprites.map((s) => (s.id === id ? { ...s, x, y } : s)) }, `drag:${id}`);
                  }}
                />
              )}
            </Panel>
            <SpritePanel
              project={project}
              sprite={sprite}
              onSelect={(id) => {
                setSpriteId(id);
                setSelectedId(null);
              }}
              onProject={(p, select) => {
                commit(p);
                if (select) setSpriteId(select);
              }}
              onEdit={edit}
            />
          </div>
        </div>
      </div>

      {ghost && (
        <div ref={ghostRef} className="pointer-events-none fixed left-0 top-0 z-[100] w-max opacity-90" style={{ transform: `translate(${pointer.current.x - (drag.current?.offX ?? 0)}px, ${pointer.current.y - (drag.current?.offY ?? 0)}px)` }}>
          <div className="flex flex-col items-start">
            {ghost.map((b) => (
              <BlockView key={b.id} block={b} mode="ghost" />
            ))}
          </div>
        </div>
      )}
    </EditorContext.Provider>
  );
}
