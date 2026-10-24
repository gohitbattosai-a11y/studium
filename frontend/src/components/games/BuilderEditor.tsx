import { useId } from "react";
import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BLOCK_KINDS, blankBlock, blockMeta, sampleCustom, SCENES } from "@/lib/games";
import type { Block, BlockKind, CustomContent, Rules } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Field, NativeSelect, Panel } from "@/components/shop/ui";
import { Scene } from "./engine/scenes";

const replaceAt = <T,>(list: T[], i: number, value: T) => list.map((x, j) => (j === i ? value : x));
const removeAt = <T,>(list: T[], i: number) => list.filter((_, j) => j !== i);

const TIMES = [0, 10, 20, 30, 60, 120];

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" className="size-4 accent-[#388BFD]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function ListEditor({ items, onChange, min, max, placeholder, label }: { items: string[]; onChange: (v: string[]) => void; min: number; max: number; placeholder: string; label: string }) {
  return (
    <div className="space-y-2">
      {items.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#21262D] text-xs">{i + 1}</span>
          <Input className="h-8" value={s} maxLength={80} placeholder={`${placeholder} ${i + 1}`} onChange={(e) => onChange(replaceAt(items, i, e.target.value))} />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Sposta su"
            disabled={i === 0}
            onClick={() => {
              const n = [...items];
              [n[i - 1], n[i]] = [n[i], n[i - 1]];
              onChange(n);
            }}
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Sposta giù"
            disabled={i === items.length - 1}
            onClick={() => {
              const n = [...items];
              [n[i + 1], n[i]] = [n[i], n[i + 1]];
              onChange(n);
            }}
          >
            <ArrowDown className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Elimina" disabled={items.length <= min} onClick={() => onChange(removeAt(items, i))}>
            <Trash2 className="size-3.5 text-[#8B949E]" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" disabled={items.length >= max} onClick={() => onChange([...items, ""])}>
        <Plus className="size-3.5" /> {label}
      </Button>
    </div>
  );
}

function BlockBody({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const set = (patch: Partial<Block>) => onChange({ ...block, ...patch });
  const group = useId();
  if (block.kind === "info") {
    return (
      <textarea
        className="min-h-20 w-full rounded-lg border border-[#30363D] bg-[#0D1117] px-3 py-2 text-sm outline-none transition-colors focus-visible:border-[#388BFD]"
        value={block.prompt}
        maxLength={300}
        placeholder="Testo da mostrare al giocatore (storia, regole, spiegazione)"
        onChange={(e) => set({ prompt: e.target.value })}
        data-testid="block-info-text"
      />
    );
  }
  return (
    <div className="space-y-2.5">
      <Input className="h-9" value={block.prompt} maxLength={300} placeholder={block.kind === "order" || block.kind === "match" ? "Consegna (facoltativa)" : "Scrivi la domanda"} onChange={(e) => set({ prompt: e.target.value })} data-testid="block-prompt" />
      {block.kind === "choice" && (
        <div className="space-y-2">
          {block.options.map((o, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <input type="radio" className="size-4 accent-[#3FB950]" name={group} checked={block.correct === oi} onChange={() => set({ correct: oi })} aria-label="Risposta corretta" />
              <Input className="h-8" value={o} maxLength={80} placeholder={`Risposta ${oi + 1}`} onChange={(e) => set({ options: replaceAt(block.options, oi, e.target.value) })} />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Elimina risposta"
                disabled={block.options.length <= 2}
                onClick={() => set({ options: removeAt(block.options, oi), correct: block.correct === oi ? 0 : block.correct > oi ? block.correct - 1 : block.correct })}
              >
                <Trash2 className="size-3.5 text-[#8B949E]" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={block.options.length >= 6} onClick={() => set({ options: [...block.options, ""] })}>
              <Plus className="size-3.5" /> Risposta
            </Button>
            <Button variant="outline" size="sm" onClick={() => set({ options: ["Vero", "Falso"], correct: 0 })}>
              Vero / Falso
            </Button>
          </div>
        </div>
      )}
      {block.kind === "type" && (
        <>
          <Input className="h-9" value={block.answer} maxLength={80} placeholder="Risposta corretta" onChange={(e) => set({ answer: e.target.value })} data-testid="block-answer" />
          <p className="text-xs text-[#8B949E]">Più risposte valide? Separale con / (es. Roma / roma capitale). Maiuscole e accenti non contano.</p>
        </>
      )}
      {block.kind === "number" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Numero corretto">
            <Input className="h-9" type="number" step="any" value={block.number ?? ""} onChange={(e) => set({ number: e.target.value === "" ? null : Number(e.target.value) })} data-testid="block-number" />
          </Field>
          <Field label="Tolleranza (±)">
            <Input className="h-9" type="number" step="any" min={0} value={block.tolerance} onChange={(e) => set({ tolerance: Math.max(0, Number(e.target.value) || 0) })} />
          </Field>
        </div>
      )}
      {block.kind === "order" && <ListEditor items={block.steps} onChange={(steps) => set({ steps })} min={3} max={8} placeholder="Passaggio" label="Passaggio" />}
      {block.kind === "match" && (
        <div className="space-y-2">
          {block.pairs.map((p, pi) => (
            <div key={pi} className="flex items-center gap-2">
              <Input className="h-8" value={p.left} maxLength={80} placeholder="Termine" onChange={(e) => set({ pairs: replaceAt(block.pairs, pi, { ...p, left: e.target.value }) })} />
              <Input className="h-8" value={p.right} maxLength={80} placeholder="Corrispondenza" onChange={(e) => set({ pairs: replaceAt(block.pairs, pi, { ...p, right: e.target.value }) })} />
              <Button variant="ghost" size="icon-sm" aria-label="Elimina coppia" disabled={block.pairs.length <= 2} onClick={() => set({ pairs: removeAt(block.pairs, pi) })}>
                <Trash2 className="size-3.5 text-[#8B949E]" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" disabled={block.pairs.length >= 6} onClick={() => set({ pairs: [...block.pairs, { left: "", right: "" }] })}>
            <Plus className="size-3.5" /> Coppia
          </Button>
        </div>
      )}
      <Input className="h-8" value={block.explain} maxLength={200} placeholder="Spiegazione mostrata dopo la risposta (facoltativa)" onChange={(e) => set({ explain: e.target.value })} />
    </div>
  );
}

export default function BuilderEditor({ custom, onChange }: { custom: CustomContent; onChange: (c: CustomContent) => void }) {
  const { rules, blocks } = custom;
  const setRules = (patch: Partial<Rules>) => onChange({ ...custom, rules: { ...rules, ...patch } });
  const setBlocks = (next: Block[]) => onChange({ ...custom, blocks: next });
  const add = (kind: BlockKind) => setBlocks([...blocks, blankBlock(kind)]);
  const swap = (i: number, j: number) => {
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    setBlocks(next);
  };
  const untouched = blocks.length === 1 && blocks[0].kind === "choice" && !blocks[0].prompt;

  return (
    <div className="space-y-5" data-testid="editor-builder">
      <Panel
        title="1 · Scena"
        hint="Cosa si vede mentre si gioca: avanza in base ai punti guadagnati."
        action={
          untouched ? (
            <Button variant="outline" size="sm" onClick={() => onChange(sampleCustom())} data-testid="builder-sample">
              <Sparkles className="size-3.5" /> Carica un esempio
            </Button>
          ) : undefined
        }
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {SCENES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange({ ...custom, scene: s.id })}
              data-testid={`scene-pick-${s.id}`}
              title={s.hint}
              className={cn("rounded-lg border px-3 py-1.5 text-sm transition-colors", s.id === custom.scene ? "border-[#388BFD] bg-[#388BFD]/10" : "border-[#30363D] hover:border-[#8B949E]")}
            >
              {s.label}
            </button>
          ))}
        </div>
        {custom.scene !== "none" ? <Scene id={custom.scene} progress={0.5} hit={null} /> : <p className="text-xs text-[#8B949E]">Solo una barra di avanzamento, senza animazioni.</p>}
      </Panel>

      <Panel title="2 · Regole" hint="Rendi il gioco più facile o più sfidante.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Vite">
            <NativeSelect value={rules.lives} onChange={(e) => setRules({ lives: Number(e.target.value) })} data-testid="rule-lives">
              <option value={0}>Illimitate</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Tempo per sfida">
            <NativeSelect value={rules.seconds} onChange={(e) => setRules({ seconds: Number(e.target.value) })} data-testid="rule-seconds">
              {TIMES.map((t) => (
                <option key={t} value={t}>
                  {t === 0 ? "Nessun limite" : `${t} secondi`}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Penalità errore">
            <NativeSelect value={rules.penalty} onChange={(e) => setRules({ penalty: Number(e.target.value) })} data-testid="rule-penalty">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "Nessuna" : `−${n} punti`}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <Check checked={rules.streak_bonus} onChange={(v) => setRules({ streak_bonus: v })} label="Bonus serie (3 giuste di fila: punti ×1,5)" />
          <Check checked={rules.shuffle} onChange={(v) => setRules({ shuffle: v })} label="Mescola le sfide" />
        </div>
      </Panel>

      <Panel title="3 · Blocchi" hint="Ogni blocco è una sfida o una scheda. Il valore in punti decide quanto fa avanzare la scena.">
        <div className="space-y-3">
          {blocks.map((b, i) => {
            const meta = blockMeta(b.kind);
            return (
              <div key={i} className="space-y-2.5 rounded-lg border border-[#30363D] bg-[#0D1117] p-3" data-testid={`block-card-${i}`}>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#21262D] px-2 py-1 text-xs">
                    <meta.icon className="size-3.5 text-[#58A6FF]" /> {meta.label}
                  </span>
                  <span className="flex-1" />
                  {b.kind !== "info" && (
                    <label className="flex items-center gap-1.5 text-xs text-[#8B949E]">
                      Punti
                      <NativeSelect className="h-8 w-16" value={b.value} onChange={(e) => setBlocks(replaceAt(blocks, i, { ...b, value: Number(e.target.value) }))} data-testid={`block-value-${i}`}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </NativeSelect>
                    </label>
                  )}
                  <Button variant="ghost" size="icon-sm" aria-label="Sposta su" disabled={i === 0} onClick={() => swap(i, i - 1)}>
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Sposta giù" disabled={i === blocks.length - 1} onClick={() => swap(i, i + 1)}>
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Elimina blocco" disabled={blocks.length <= 1} onClick={() => setBlocks(removeAt(blocks, i))} data-testid={`block-delete-${i}`}>
                    <Trash2 className="size-4 text-[#8B949E]" />
                  </Button>
                </div>
                <BlockBody block={b} onChange={(nb) => setBlocks(replaceAt(blocks, i, nb))} />
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2" data-testid="block-palette">
          {BLOCK_KINDS.map((k) => (
            <Button key={k.kind} variant="outline" size="sm" disabled={blocks.length >= 40} title={k.hint} onClick={() => add(k.kind)} data-testid={`add-block-${k.kind}`}>
              <k.icon className="size-3.5" /> {k.label}
            </Button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
