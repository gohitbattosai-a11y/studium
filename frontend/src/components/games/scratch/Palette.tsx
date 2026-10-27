import { useMemo, useState, type FormEvent, type RefObject } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearRefs, paletteBlocks } from "@/lib/scratch/project";
import { CATEGORIES, uid } from "@/lib/scratch/spec";
import type { CategoryId, ScratchProject, SpriteDef } from "@/lib/scratch/types";
import { cn } from "@/lib/utils";
import { NativeSelect } from "@/components/shop/ui";
import { BlockView } from "./BlockView";

function NameForm({ placeholder, button, onSubmit, children }: { placeholder: string; button: string; onSubmit: (name: string) => boolean; children?: React.ReactNode }) {
  const [name, setName] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim() && onSubmit(name.trim())) setName("");
  };
  return (
    <form onSubmit={submit} className="mb-3 space-y-2 rounded-lg border border-[#30363D] bg-[#0D1117] p-2.5">
      <div className="flex gap-2">
        <Input className="h-8" value={name} maxLength={30} placeholder={placeholder} onChange={(e) => setName(e.target.value)} />
        <Button type="submit" size="sm" disabled={!name.trim()}>
          <Plus className="size-3.5" /> {button}
        </Button>
      </div>
      {children}
    </form>
  );
}

export default function Palette({
  project,
  sprite,
  cat,
  onCat,
  onProject,
  onCreateProc,
  paletteRef,
}: {
  project: ScratchProject;
  sprite: SpriteDef | undefined;
  cat: CategoryId;
  onCat: (c: CategoryId) => void;
  onProject: (p: ScratchProject) => void;
  onCreateProc: (name: string, params: string) => void;
  paletteRef: RefObject<HTMLDivElement | null>;
}) {
  const blocks = useMemo(() => paletteBlocks(cat, project, sprite), [cat, project, sprite]);
  const [scope, setScope] = useState<"all" | "this">("all");
  const [params, setParams] = useState("");
  const here = (s: string) => s === "all" || s === sprite?.id;
  const vars = project.vars.filter((v) => here(v.scope));
  const lists = project.lists.filter((l) => here(l.scope));

  const scopeSelect = (
    <NativeSelect className="h-8" value={scope} onChange={(e) => setScope(e.target.value as "all" | "this")}>
      <option value="all">Per tutti gli sprite</option>
      <option value="this">Solo per questo sprite</option>
    </NativeSelect>
  );

  const empty =
    blocks.length === 0 && (cat === "variables" || cat === "lists" || cat === "events" || cat === "myblocks") ? (
      <p className="px-1 text-xs text-[#8B949E]">
        {cat === "variables" && "Crea una variabile per usare i blocchi."}
        {cat === "lists" && "Crea una lista per usare i blocchi."}
        {cat === "events" && "Crea un messaggio per usare i blocchi."}
        {cat === "myblocks" && "Crea un blocco: poi potrai richiamarlo da qui."}
      </p>
    ) : null;

  return (
    <div ref={paletteRef} className="rounded-xl border border-[#30363D] bg-[#161B22]" data-testid="scratch-palette">
      <div className="flex flex-wrap gap-1.5 border-b border-[#30363D] p-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onCat(c.id)}
            data-testid={`scratch-cat-${c.id}`}
            className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors", c.id === cat ? "border-[#388BFD] bg-[#388BFD]/10" : "border-[#30363D] hover:border-[#8B949E]")}
          >
            <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
            {c.label}
          </button>
        ))}
      </div>
      <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2.5 lg:max-h-[470px]">
        {cat === "variables" && (
          <>
            <NameForm
              placeholder="Nome variabile"
              button="Crea"
              onSubmit={(name) => {
                if (project.vars.length >= 30 || project.vars.some((v) => v.name.toLowerCase() === name.toLowerCase())) return false;
                onProject({ ...project, vars: [...project.vars, { id: uid(), name, initial: 0, scope: scope === "all" || !sprite ? "all" : sprite.id, shown: true }] });
                return true;
              }}
            >
              {scopeSelect}
            </NameForm>
            {vars.length > 0 && (
              <ul className="mb-3 space-y-1">
                {vars.map((v) => (
                  <li key={v.id} className="flex items-center gap-1.5 rounded-md bg-[#21262D] px-2 py-1 text-xs">
                    <span className="min-w-0 flex-1 truncate">
                      {v.name}
                      {v.scope !== "all" && <span className="text-[#8B949E]"> · sprite</span>}
                    </span>
                    <input
                      className="h-6 w-14 rounded border border-[#30363D] bg-[#0D1117] px-1 text-center"
                      type="number"
                      value={v.initial}
                      title="Valore iniziale"
                      onChange={(e) => onProject({ ...project, vars: project.vars.map((x) => (x.id === v.id ? { ...x, initial: Number(e.target.value) || 0 } : x)) })}
                    />
                    <Button variant="ghost" size="icon-xs" aria-label="Mostra o nascondi sul palco" onClick={() => onProject({ ...project, vars: project.vars.map((x) => (x.id === v.id ? { ...x, shown: !x.shown } : x)) })}>
                      {v.shown ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5 text-[#8B949E]" />}
                    </Button>
                    <Button variant="ghost" size="icon-xs" aria-label="Elimina variabile" onClick={() => onProject({ ...clearRefs(project, "var", v.id), vars: project.vars.filter((x) => x.id !== v.id) })}>
                      <Trash2 className="size-3.5 text-[#8B949E]" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {cat === "lists" && (
          <>
            <NameForm
              placeholder="Nome lista"
              button="Crea"
              onSubmit={(name) => {
                if (project.lists.length >= 10 || project.lists.some((l) => l.name.toLowerCase() === name.toLowerCase())) return false;
                onProject({ ...project, lists: [...project.lists, { id: uid(), name, scope: scope === "all" || !sprite ? "all" : sprite.id }] });
                return true;
              }}
            >
              {scopeSelect}
            </NameForm>
            {lists.length > 0 && (
              <ul className="mb-3 space-y-1">
                {lists.map((l) => (
                  <li key={l.id} className="flex items-center gap-1.5 rounded-md bg-[#21262D] px-2 py-1 text-xs">
                    <span className="min-w-0 flex-1 truncate">{l.name}</span>
                    <Button variant="ghost" size="icon-xs" aria-label="Elimina lista" onClick={() => onProject({ ...clearRefs(project, "list", l.id), lists: project.lists.filter((x) => x.id !== l.id) })}>
                      <Trash2 className="size-3.5 text-[#8B949E]" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {cat === "events" && (
          <>
            <NameForm
              placeholder="Nuovo messaggio"
              button="Crea"
              onSubmit={(name) => {
                if (project.messages.length >= 30 || project.messages.includes(name)) return false;
                onProject({ ...project, messages: [...project.messages, name] });
                return true;
              }}
            />
            {project.messages.length > 0 && (
              <ul className="mb-3 flex flex-wrap gap-1.5">
                {project.messages.map((m) => (
                  <li key={m} className="inline-flex items-center gap-1 rounded-md bg-[#21262D] py-0.5 pl-2 pr-0.5 text-xs">
                    {m}
                    <Button variant="ghost" size="icon-xs" aria-label="Elimina messaggio" onClick={() => onProject({ ...clearRefs(project, "message", m), messages: project.messages.filter((x) => x !== m) })}>
                      <Trash2 className="size-3 text-[#8B949E]" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {cat === "myblocks" && (
          <NameForm
            placeholder="Nome del blocco"
            button="Crea"
            onSubmit={(name) => {
              onCreateProc(name, params);
              setParams("");
              return true;
            }}
          >
            <Input className="h-8" value={params} maxLength={80} placeholder="Parametri separati da virgola (facoltativi)" onChange={(e) => setParams(e.target.value)} />
          </NameForm>
        )}
        {empty}
        <div className="flex flex-col items-start gap-2.5" data-testid="scratch-palette-blocks">
          {blocks.map((b, i) => (
            <BlockView key={`${b.op}-${i}`} block={b} mode="palette" />
          ))}
        </div>
      </div>
    </div>
  );
}
