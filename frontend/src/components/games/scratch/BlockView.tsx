import { Fragment } from "react";
import { categoryColor } from "@/lib/scratch/project";
import type { StackRef } from "@/lib/scratch/project";
import { menuOptions, SPEC_BY_OP } from "@/lib/scratch/spec";
import type { OpSpec, Part, SBlock } from "@/lib/scratch/types";
import { cn } from "@/lib/utils";
import { slotKey, stackKey, useEditor, type Mode } from "./editorContext";

const HEX = "polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%)";
const shade = (c: string) => `color-mix(in srgb, ${c} 72%, black)`;
const labelClass = "text-[13px] font-semibold leading-none text-white whitespace-nowrap";

function Marker({ at, index }: { at: StackRef; index: number }) {
  const ctx = useEditor();
  const key = stackKey(at, index);
  return (
    <div
      className="relative h-0 w-full"
      data-ins={key}
      data-ins-script={"script" in at ? at.script : ""}
      data-ins-block={"block" in at ? at.block : ""}
      data-ins-stack={"stack" in at ? at.stack : ""}
      data-ins-index={index}
    >
      {ctx.dropKey === key && <div className="pointer-events-none absolute inset-x-0 -top-[3px] z-30 h-1.5 rounded bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]" />}
    </div>
  );
}

export function StackView({ blocks, at, mode }: { blocks: SBlock[]; at: StackRef; mode: Mode }) {
  const edit = mode === "edit";
  return (
    <div className={cn("flex flex-col items-start", blocks.length === 0 && "min-h-[22px] min-w-[84px]")}>
      {blocks.map((b, i) => (
        <Fragment key={b.id}>
          {edit && <Marker at={at} index={i} />}
          <BlockView block={b} mode={mode} />
        </Fragment>
      ))}
      {edit && <Marker at={at} index={blocks.length} />}
    </div>
  );
}

function Slot({ block, argKey, mode, color }: { block: SBlock; argKey: string; mode: Mode; color: string }) {
  const ctx = useEditor();
  const spec = SPEC_BY_OP[block.op];
  const arg = spec.args[argKey];
  const value = block.args[argKey];
  const active = ctx.dropKey === slotKey(block.id, argKey);
  const ring = active ? "outline outline-2 outline-white" : "";

  if (typeof value === "object") {
    return (
      <span data-slot data-slot-owner={block.id} data-slot-key={argKey} data-slot-kind={arg.slot} className={cn("inline-flex rounded-full", ring)}>
        <BlockView block={value} mode={mode} />
      </span>
    );
  }

  if (arg.slot === "menu") {
    const options = menuOptions(arg.menu!, { project: ctx.project, sprite: ctx.sprite }, arg);
    const current = options.find((o) => o.value === String(value));
    if (mode !== "edit") {
      return <span className="rounded bg-black/25 px-1.5 py-0.5 text-[12px] font-semibold text-white">{current?.label ?? "—"}</span>;
    }
    return (
      <select
        className="max-w-[170px] rounded bg-black/25 px-1 py-0.5 text-[12px] font-semibold text-white outline-none"
        value={String(value)}
        onPointerDown={(e) => e.stopPropagation()}
        onChange={(e) => ctx.onArg(block.id, argKey, e.target.value)}
      >
        {!current && <option value={String(value)}>—</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-black">
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  if (arg.slot === "bool") {
    return <span data-slot data-slot-owner={block.id} data-slot-key={argKey} data-slot-kind="bool" className={cn("inline-block h-5 w-10 bg-black/30", active && "bg-white/70")} style={{ clipPath: HEX }} />;
  }

  const text = String(value);
  const rounded = arg.slot === "num" ? "rounded-full" : "rounded-md";
  if (mode !== "edit") {
    return (
      <span data-slot-kind={arg.slot} className={cn("min-w-[22px] bg-white px-1.5 py-0.5 text-center text-[12px] font-medium text-black", rounded)}>
        {text || "\u00a0"}
      </span>
    );
  }
  return (
    <span data-slot data-slot-owner={block.id} data-slot-key={argKey} data-slot-kind={arg.slot} className={cn("inline-flex bg-white px-1", rounded, ring)} style={{ borderColor: shade(color) }}>
      <input
        className="bg-transparent py-0.5 text-center text-[12px] font-medium text-black outline-none"
        style={{ width: `${Math.min(28, Math.max(2.4, text.length + 1))}ch` }}
        value={text}
        maxLength={200}
        onPointerDown={(e) => e.stopPropagation()}
        onChange={(e) => ctx.onArg(block.id, argKey, e.target.value)}
      />
    </span>
  );
}

function partsOf(block: SBlock, spec: OpSpec, procs: ReturnType<typeof useEditor>["procs"]): Part[] {
  if (block.op === "proc_call") {
    const p = procs.find((x) => x.id === String(block.args.proc));
    if (!p) return ["blocco eliminato"];
    return [p.name || "azione", ...p.params.flatMap((name, i): Part[] => [name, { arg: `a${i}` }])];
  }
  return spec.parts;
}

function Row({ block, spec, mode, color }: { block: SBlock; spec: OpSpec; mode: Mode; color: string }) {
  const ctx = useEditor();
  if (block.op === "var_get") {
    return <span className={labelClass}>{ctx.project.vars.find((v) => v.id === String(block.args.var))?.name ?? "variabile?"}</span>;
  }
  if (block.op === "proc_param") return <span className={labelClass}>{String(block.args.name) || "parametro"}</span>;
  const parts = partsOf(block, spec, ctx.procs);
  return (
    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i} className={labelClass}>
            {p}
          </span>
        ) : (
          <Slot key={i} block={block} argKey={p.arg} mode={mode} color={color} />
        ),
      )}
    </span>
  );
}

export function BlockView({ block, mode }: { block: SBlock; mode: Mode }) {
  const ctx = useEditor();
  const spec = SPEC_BY_OP[block.op];
  if (!spec) return null;
  const color = categoryColor(spec.cat);
  const selected = mode === "edit" && ctx.selectedId === block.id;
  const down = (e: React.PointerEvent) => {
    if (mode === "ghost" || e.button !== 0) return;
    e.stopPropagation();
    ctx.onGrab(e, block, mode === "palette" ? "palette" : "workspace");
  };
  const touch = mode === "palette" ? "touch-pan-y" : "touch-none";
  const common = { onPointerDown: down, "data-block": block.id };
  const outline = selected ? "outline outline-2 outline-offset-1 outline-white" : "";

  if (spec.shape === "reporter" || spec.shape === "boolean") {
    const bool = spec.shape === "boolean";
    return (
      <span
        {...common}
        className={cn("inline-flex min-h-[24px] cursor-grab select-none items-center py-0.5 shadow-sm", bool ? "px-3.5" : "rounded-full px-2.5", touch, outline)}
        style={{ backgroundColor: color, ...(bool ? { clipPath: HEX } : {}) }}
      >
        <Row block={block} spec={spec} mode={mode} color={color} />
      </span>
    );
  }

  if (spec.shape === "c") {
    const names = spec.stacks ?? ["a"];
    return (
      <div {...common} className={cn("inline-flex cursor-grab select-none flex-col shadow-sm", touch, outline)}>
        <div className="flex min-h-[34px] items-center rounded-t-md px-2.5 py-1.5" style={{ backgroundColor: color }}>
          <Row block={block} spec={spec} mode={mode} color={color} />
        </div>
        {names.map((name, i) => (
          <Fragment key={name}>
            {i > 0 && (
              <div className="flex min-h-[26px] items-center px-2.5" style={{ backgroundColor: color }}>
                <span className={labelClass}>{spec.stackLabels?.[i] ?? ""}</span>
              </div>
            )}
            <div className="flex">
              <div className="w-3.5 shrink-0" style={{ backgroundColor: color }} />
              <div className="py-[3px] pr-2">
                <StackView blocks={block.stacks?.[name] ?? []} at={{ block: block.id, stack: name }} mode={mode} />
              </div>
            </div>
          </Fragment>
        ))}
        <div className={cn("h-[18px] rounded-b-md", spec.terminal ? "w-full" : "w-full")} style={{ backgroundColor: color }} />
      </div>
    );
  }

  const hat = spec.shape === "hat";
  return (
    <div
      {...common}
      className={cn("inline-flex min-h-[34px] cursor-grab select-none items-center px-2.5 py-1.5 shadow-sm", hat ? "mt-3 rounded-b-md rounded-t-[22px] pt-2" : "rounded-md", touch, outline)}
      style={{ backgroundColor: color }}
    >
      <Row block={block} spec={spec} mode={mode} color={color} />
    </div>
  );
}
