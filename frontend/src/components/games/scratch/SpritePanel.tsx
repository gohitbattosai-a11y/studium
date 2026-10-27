import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BACKDROP_PRESETS, blankSprite, EMOJIS, MAX_SPRITES, purgeSprite } from "@/lib/scratch/project";
import { uid } from "@/lib/scratch/spec";
import type { RotationStyle, ScratchProject, SpriteDef } from "@/lib/scratch/types";
import { cn } from "@/lib/utils";
import { Field, NativeSelect, Panel } from "@/components/shop/ui";

const replace = (p: ScratchProject, id: string, patch: Partial<SpriteDef>): ScratchProject => ({ ...p, sprites: p.sprites.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

function NumInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    if (Number(text) !== value) setText(String(value));
  }, [value]);
  return (
    <Input
      className="h-8"
      inputMode="numeric"
      value={text}
      onChange={(e) => {
        const t = e.target.value;
        setText(t);
        if (t.trim() !== "" && Number.isFinite(Number(t))) onChange(Math.min(max, Math.max(min, Number(t))));
      }}
      onBlur={() => setText(String(value))}
    />
  );
}

const numberField = (value: number, min: number, max: number, onChange: (n: number) => void) => <NumInput value={value} min={min} max={max} onChange={onChange} />;

export default function SpritePanel({
  project,
  sprite,
  onSelect,
  onProject,
  onEdit,
}: {
  project: ScratchProject;
  sprite: SpriteDef;
  onSelect: (id: string) => void;
  onProject: (p: ScratchProject, select?: string) => void;
  onEdit: (p: ScratchProject, key: string) => void;
}) {
  const [picker, setPicker] = useState(false);

  const addSprite = () => {
    if (project.sprites.length >= MAX_SPRITES) return;
    const used = new Set(project.sprites.flatMap((s) => s.costumes));
    const emoji = EMOJIS.find((e) => !used.has(e)) ?? "⭐";
    const next = blankSprite(`Sprite${project.sprites.length + 1}`, emoji);
    onProject({ ...project, sprites: [...project.sprites, next] }, next.id);
  };

  const removeSprite = () => {
    if (project.sprites.length <= 1) return;
    const rest = project.sprites.filter((s) => s.id !== sprite.id);
    onProject(purgeSprite(project, sprite.id), rest[0].id);
  };

  const set = (patch: Partial<SpriteDef>, key: string) => onEdit(replace(project, sprite.id, patch), `${sprite.id}:${key}`);

  return (
    <div className="space-y-4">
      <Panel
        title="Sprite"
        hint="Trascina un blocco su uno sprite per copiarlo."
        action={
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" disabled={project.sprites.length >= MAX_SPRITES} onClick={addSprite} data-testid="scratch-add-sprite">
              <Plus className="size-3.5" /> Aggiungi
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Elimina sprite" disabled={project.sprites.length <= 1} onClick={removeSprite}>
              <Trash2 className="size-4 text-[#8B949E]" />
            </Button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2" data-testid="scratch-sprites">
          {project.sprites.map((s) => (
            <button
              key={s.id}
              type="button"
              data-sprite-drop={s.id}
              title={s.name}
              onClick={() => onSelect(s.id)}
              className={cn("grid size-12 place-items-center rounded-lg border text-2xl transition-colors", s.id === sprite.id ? "border-[#388BFD] bg-[#388BFD]/10" : "border-[#30363D] bg-[#0D1117] hover:border-[#8B949E]")}
            >
              {s.costumes[0]}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <Field label="Nome">
            <Input className="h-8" value={sprite.name} maxLength={30} onChange={(e) => set({ name: e.target.value }, "name")} />
          </Field>
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#8B949E]">Costumi</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {sprite.costumes.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-0.5 rounded-md bg-[#21262D] py-0.5 pl-1.5 pr-0.5 text-lg">
                  {c}
                  <Button variant="ghost" size="icon-xs" aria-label="Elimina costume" disabled={sprite.costumes.length <= 1} onClick={() => onProject(replace(project, sprite.id, { costumes: sprite.costumes.filter((_, j) => j !== i) }))}>
                    <Trash2 className="size-3 text-[#8B949E]" />
                  </Button>
                </span>
              ))}
              <Button variant="outline" size="sm" disabled={sprite.costumes.length >= 12} onClick={() => setPicker((v) => !v)} data-testid="scratch-costume-add">
                <Plus className="size-3.5" /> Costume
              </Button>
            </div>
            {picker && (
              <div className="mt-2 grid max-h-40 grid-cols-8 gap-1 overflow-y-auto rounded-lg border border-[#30363D] bg-[#0D1117] p-1.5" data-testid="scratch-emoji-grid">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className="grid size-8 place-items-center rounded text-xl hover:bg-[#21262D]"
                    onClick={() => {
                      onProject(replace(project, sprite.id, { costumes: [...sprite.costumes, e].slice(0, 12) }));
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="x">{numberField(sprite.x, -240, 240, (n) => set({ x: n }, "x"))}</Field>
            <Field label="y">{numberField(sprite.y, -180, 180, (n) => set({ y: n }, "y"))}</Field>
            <Field label="Dimensione %">{numberField(sprite.size, 5, 500, (n) => set({ size: n }, "size"))}</Field>
            <Field label="Direzione">{numberField(sprite.dir, -180, 180, (n) => set({ dir: n }, "dir"))}</Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rotazione">
              <NativeSelect className="h-8" value={sprite.rotation} onChange={(e) => onProject(replace(project, sprite.id, { rotation: e.target.value as RotationStyle }))}>
                <option value="lr">Destra / sinistra</option>
                <option value="all">Libera</option>
                <option value="none">Nessuna</option>
              </NativeSelect>
            </Field>
            <label className="flex items-end gap-2 pb-1.5 text-sm">
              <input type="checkbox" className="size-4 accent-[#388BFD]" checked={sprite.visible} onChange={(e) => onProject(replace(project, sprite.id, { visible: e.target.checked }))} />
              Visibile all'inizio
            </label>
          </div>
        </div>
      </Panel>

      <Panel title="Sfondi" hint="Il primo sfondo è quello iniziale.">
        <div className="flex flex-wrap gap-2">
          {project.backdrops.map((b, i) => (
            <div key={b.id} className="group relative">
              <button
                type="button"
                title={i === 0 ? `${b.name} (iniziale)` : `${b.name}: rendi iniziale`}
                onClick={() => i > 0 && onProject({ ...project, backdrops: [b, ...project.backdrops.filter((x) => x.id !== b.id)] })}
                className={cn("grid h-10 w-14 place-items-center rounded-md border text-sm", i === 0 ? "border-[#388BFD]" : "border-[#30363D] hover:border-[#8B949E]")}
                style={{ background: `linear-gradient(160deg, ${b.from}, ${b.to})` }}
              >
                {b.deco}
              </button>
              {project.backdrops.length > 1 && (
                <button type="button" aria-label="Elimina sfondo" className="absolute -right-1.5 -top-1.5 hidden size-4 place-items-center rounded-full bg-[#F85149] text-[10px] text-white group-hover:grid" onClick={() => onProject({ ...project, backdrops: project.backdrops.filter((x) => x.id !== b.id) })}>
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {BACKDROP_PRESETS.map((p) => (
            <Button key={p.name} variant="outline" size="xs" disabled={project.backdrops.length >= 10} onClick={() => onProject({ ...project, backdrops: [...project.backdrops, { id: uid(), ...p }] })}>
              + {p.name}
            </Button>
          ))}
        </div>
      </Panel>

      <Panel title="Regole del gioco" hint="La percentuale finale è punteggio ÷ obiettivo: decide i punti che il giocatore può riscuotere.">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Obiettivo (pt)">{numberField(project.settings.goal, 1, 1000, (n) => onEdit({ ...project, settings: { ...project.settings, goal: n } }, "goal"))}</Field>
          <Field label="Vite (0 = no)">{numberField(project.settings.lives, 0, 9, (n) => onEdit({ ...project, settings: { ...project.settings, lives: n } }, "lives"))}</Field>
          <Field label="Tempo s (0 = no)">{numberField(project.settings.time, 0, 600, (n) => onEdit({ ...project, settings: { ...project.settings, time: n } }, "time"))}</Field>
        </div>
      </Panel>
    </div>
  );
}
