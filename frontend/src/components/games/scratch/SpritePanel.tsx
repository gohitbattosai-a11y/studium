import { useEffect, useState } from "react";
import { FlipHorizontal2, Pencil, Plus, RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BACKDROP_PRESETS, blankSprite, EMOJIS, MAX_BACKDROP_IMAGE, MAX_COSTUME_IMAGE, MAX_SPRITES, purgeSprite } from "@/lib/scratch/project";
import { uid } from "@/lib/scratch/spec";
import type { Backdrop, RotationStyle, ScratchProject, SpriteDef } from "@/lib/scratch/types";
import { cn } from "@/lib/utils/cn";
import { Field, NativeSelect, Panel } from "@/components/shop/ui";
import { STAGE_H, STAGE_W } from "@/lib/scratch/engine";
import { CostumeGlyph } from "./costume";
import PaintEditor from "./PaintEditor";

const wrap180 = (d: number) => {
  const r = ((((d + 180) % 360) + 360) % 360) - 180;
  return r === -180 ? 180 : r;
};

const coverScale = (deg: number) => {
  const r = (deg * Math.PI) / 180;
  const c = Math.abs(Math.cos(r));
  const sn = Math.abs(Math.sin(r));
  return Math.max(c + (STAGE_H / STAGE_W) * sn, (STAGE_W / STAGE_H) * sn + c);
};

type Paint = { kind: "costume"; index: number | null } | { kind: "backdrop"; id: string } | null;

function BackdropThumb({ b, className }: { b: Backdrop; className?: string }) {
  const rot = b.rot ?? 0;
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <span
        className="absolute inset-0 grid place-items-center text-sm"
        style={{ background: `linear-gradient(160deg, ${b.from}, ${b.to})`, transform: `rotate(${rot}deg) scale(${coverScale(rot)})` }}
      >
        {b.image ? <img src={b.image} alt="" draggable={false} className="size-full object-fill" /> : b.deco}
      </span>
    </span>
  );
}

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
  const [paint, setPaint] = useState<Paint>(null);
  const [bdId, setBdId] = useState<string | null>(null);
  const bd = project.backdrops.find((x) => x.id === bdId) ?? project.backdrops[0];

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

  const turn = (delta: number) => set({ dir: wrap180(sprite.dir + delta), rotation: "all" }, "turn");

  const patchBackdrop = (id: string, patch: Partial<Backdrop>, key: string) => onEdit({ ...project, backdrops: project.backdrops.map((x) => (x.id === id ? { ...x, ...patch } : x)) }, `bd:${id}:${key}`);

  const savePaint = (url: string, asNew: boolean) => {
    if (!paint) return;
    if (paint.kind === "costume") {
      const list = sprite.costumes;
      let next: string[];
      if (paint.index === null || asNew) next = [...list, url].slice(0, 12);
      else next = list.map((c, i) => (i === paint.index ? url : c));
      onProject(replace(project, sprite.id, { costumes: next }));
    } else {
      onProject({ ...project, backdrops: project.backdrops.map((x) => (x.id === paint.id ? { ...x, image: url } : x)) });
    }
    setPaint(null);
  };

  const paintTarget = paint?.kind === "backdrop" ? project.backdrops.find((x) => x.id === paint.id) : undefined;

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
              <CostumeGlyph value={s.costumes[0]} size={34} />
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
                <span key={i} className="inline-flex items-center gap-0.5 rounded-md bg-[#21262D] py-0.5 pl-0.5 pr-0.5">
                  <button type="button" title="Modifica o disegna su questo costume" className="grid size-8 place-items-center rounded hover:bg-[#30363D]" onClick={() => setPaint({ kind: "costume", index: i })}>
                    <CostumeGlyph value={c} size={28} />
                  </button>
                  <Button variant="ghost" size="icon-xs" aria-label="Elimina costume" disabled={sprite.costumes.length <= 1} onClick={() => onProject(replace(project, sprite.id, { costumes: sprite.costumes.filter((_, j) => j !== i) }))}>
                    <Trash2 className="size-3 text-[#8B949E]" />
                  </Button>
                </span>
              ))}
              <Button variant="outline" size="sm" disabled={sprite.costumes.length >= 12} onClick={() => setPicker((v) => !v)} data-testid="scratch-costume-add">
                <Plus className="size-3.5" /> Emoji
              </Button>
              <Button variant="outline" size="sm" disabled={sprite.costumes.length >= 12} onClick={() => setPaint({ kind: "costume", index: null })} data-testid="scratch-costume-draw">
                <Pencil className="size-3.5" /> Disegna
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
          <div className="grid grid-cols-3 gap-3">
            <Field label="x">{numberField(sprite.x, -240, 240, (n) => set({ x: n }, "x"))}</Field>
            <Field label="y">{numberField(sprite.y, -180, 180, (n) => set({ y: n }, "y"))}</Field>
            <Field label="Dimensione %">{numberField(sprite.size, 5, 500, (n) => set({ size: n }, "size"))}</Field>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-[#8B949E]">Rotazione dello sprite</p>
            <div className="flex items-center gap-2">
              <input type="range" min={-180} max={180} step={5} value={sprite.dir} onChange={(e) => set({ dir: Number(e.target.value), rotation: "all" }, "dir")} className="min-w-0 flex-1 accent-[#388BFD]" data-testid="scratch-dir-slider" />
              <div className="w-16 shrink-0">{numberField(sprite.dir, -180, 180, (n) => set({ dir: n }, "dir"))}</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button variant="outline" size="xs" onClick={() => turn(-90)}>
                <RotateCcw /> 90°
              </Button>
              <Button variant="outline" size="xs" onClick={() => turn(90)}>
                <RotateCw /> 90°
              </Button>
              <Button variant="outline" size="xs" onClick={() => turn(180)}>
                180°
              </Button>
              <Button variant="outline" size="xs" onClick={() => set({ dir: wrap180(-sprite.dir) }, "flip")}>
                <FlipHorizontal2 /> Specchia
              </Button>
              <Button variant="ghost" size="xs" onClick={() => set({ dir: 90 }, "dir")}>
                Azzera
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rotazione">
              <NativeSelect className="h-8" value={sprite.rotation} onChange={(e) => onProject(replace(project, sprite.id, { rotation: e.target.value as RotationStyle }))}>
                <option value="all">Libera (ruota con la direzione)</option>
                <option value="lr">Destra / sinistra</option>
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

      <Panel title="Sfondi" hint="Il primo sfondo è quello iniziale. Tocca uno sfondo per modificarlo.">
        <div className="flex flex-wrap gap-2">
          {project.backdrops.map((b, i) => (
            <div key={b.id} className="group relative">
              <button
                type="button"
                title={i === 0 ? `${b.name} (iniziale)` : b.name}
                onClick={() => setBdId(b.id)}
                className={cn("block overflow-hidden rounded-md border-2", b.id === bd.id ? "border-[#388BFD]" : "border-[#30363D] hover:border-[#8B949E]", i === 0 && b.id !== bd.id && "border-[#388BFD]/40")}
              >
                <BackdropThumb b={b} className="h-10 w-14" />
              </button>
              {project.backdrops.length > 1 && (
                <button type="button" aria-label="Elimina sfondo" className="absolute -right-1.5 -top-1.5 hidden size-4 place-items-center rounded-full bg-[#F85149] text-[10px] text-white group-hover:grid" onClick={() => onProject({ ...project, backdrops: project.backdrops.filter((x) => x.id !== b.id) })}>
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3 rounded-lg border border-[#30363D] bg-[#0D1117] p-3" data-testid="scratch-backdrop-editor">
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3">
              <Field label="Nome sfondo">
                <Input className="h-8" value={bd.name} maxLength={30} onChange={(e) => patchBackdrop(bd.id, { name: e.target.value }, "name")} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Decorazione">
                <Input className="h-8" value={bd.deco} maxLength={4} onChange={(e) => patchBackdrop(bd.id, { deco: e.target.value }, "deco")} placeholder="🌼" />
              </Field>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="color" value={bd.from} onChange={(e) => patchBackdrop(bd.id, { from: e.target.value }, "from")} className="size-8 cursor-pointer rounded border border-[#30363D] bg-transparent p-0" />
              Colore alto
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="color" value={bd.to} onChange={(e) => patchBackdrop(bd.id, { to: e.target.value }, "to")} className="size-8 cursor-pointer rounded border border-[#30363D] bg-transparent p-0" />
              Colore basso
            </label>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-[#8B949E]">Rotazione sfondo: {bd.rot ?? 0}°</p>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={359} step={5} value={bd.rot ?? 0} onChange={(e) => patchBackdrop(bd.id, { rot: Number(e.target.value) }, "rot")} className="min-w-0 flex-1 accent-[#388BFD]" data-testid="scratch-backdrop-rot" />
              <Button variant="outline" size="xs" onClick={() => patchBackdrop(bd.id, { rot: (((bd.rot ?? 0) + 90) % 360) }, "rot90")}>
                <RotateCw /> 90°
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" onClick={() => setPaint({ kind: "backdrop", id: bd.id })} data-testid="scratch-backdrop-draw">
              <Pencil className="size-3.5" /> {bd.image ? "Modifica disegno" : "Disegna sullo sfondo"}
            </Button>
            {bd.image && (
              <Button variant="ghost" size="sm" onClick={() => onProject({ ...project, backdrops: project.backdrops.map((x) => (x.id === bd.id ? { ...x, image: undefined } : x)) })}>
                <Trash2 className="size-3.5" /> Rimuovi disegno
              </Button>
            )}
            {project.backdrops[0]?.id !== bd.id && (
              <Button variant="ghost" size="sm" onClick={() => onProject({ ...project, backdrops: [bd, ...project.backdrops.filter((x) => x.id !== bd.id)] })}>
                Rendi iniziale
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Button
            variant="outline"
            size="xs"
            disabled={project.backdrops.length >= 10}
            onClick={() => {
              const next: Backdrop = { id: uid(), name: `Sfondo ${project.backdrops.length + 1}`, from: "#8EC5FF", to: "#E8F4FF", deco: "", rot: 0 };
              onProject({ ...project, backdrops: [...project.backdrops, next] });
              setBdId(next.id);
            }}
          >
            + Vuoto da disegnare
          </Button>
          {BACKDROP_PRESETS.map((p) => (
            <Button key={p.name} variant="outline" size="xs" disabled={project.backdrops.length >= 10} onClick={() => onProject({ ...project, backdrops: [...project.backdrops, { id: uid(), rot: 0, ...p }] })}>
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

      {paint && paint.kind === "costume" && (
        <PaintEditor
          title={paint.index === null ? "Nuovo costume disegnato" : `Modifica costume ${paint.index + 1}`}
          initial={paint.index === null ? null : sprite.costumes[paint.index] ?? null}
          width={128}
          height={128}
          maxLength={MAX_COSTUME_IMAGE}
          canSaveNew={paint.index !== null && sprite.costumes.length < 12}
          onSave={savePaint}
          onClose={() => setPaint(null)}
        />
      )}
      {paint && paint.kind === "backdrop" && paintTarget && (
        <PaintEditor title={`Disegna sullo sfondo «${paintTarget.name}»`} initial={paintTarget.image ?? null} width={240} height={180} maxLength={MAX_BACKDROP_IMAGE} bg={{ from: paintTarget.from, to: paintTarget.to }} onSave={savePaint} onClose={() => setPaint(null)} />
      )}
    </div>
  );
}
