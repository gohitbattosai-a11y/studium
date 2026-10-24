import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, Plus, Save, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGameActions } from "@/lib/gameActions";
import { blankBlock, cleanInput, defaultRules, emptyContent, templateOf, TEMPLATES, validateInput } from "@/lib/games";
import type { GameContent, GameInput, GameOut, GameTemplate, Me } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Field, NativeSelect, Panel } from "@/components/shop/ui";
import BuilderEditor from "./BuilderEditor";
import GameRunner from "./GameRunner";

const blankQuestion = () => ({ prompt: "", options: ["", ""], correct: 0 });

const starter = (t: GameTemplate): GameContent => {
  const c = emptyContent();
  if (t === "custom") c.custom = { scene: "car", rules: defaultRules(), blocks: [blankBlock("choice")] };
  if (t === "quiz") c.questions = [blankQuestion()];
  if (t === "sort") {
    c.categories = ["", ""];
    c.sort_items = [{ text: "", category: 0 }, { text: "", category: 1 }];
  }
  if (t === "abbina" || t === "memory") c.pairs = [{ left: "", right: "" }, { left: "", right: "" }];
  if (t === "indovina") c.pairs = [{ left: "", right: "" }];
  if (t === "ordina") c.steps = ["", "", ""];
  return c;
};

const replaceAt = <T,>(list: T[], i: number, value: T) => list.map((x, j) => (j === i ? value : x));
const removeAt = <T,>(list: T[], i: number) => list.filter((_, j) => j !== i);

const PAIR_LABELS: Record<string, [string, string, string]> = {
  abbina: ["Termine", "Corrispondenza", "Coppie da abbinare"],
  memory: ["Carta A", "Carta B", "Coppie di carte"],
  indovina: ["Indizio", "Risposta (più risposte valide con /)", "Indizi e risposte"],
};

function QuizEditor({ content, onChange }: { content: GameContent; onChange: (c: GameContent) => void }) {
  const qs = content.questions;
  const set = (questions: GameContent["questions"]) => onChange({ ...content, questions });
  return (
    <div className="space-y-3" data-testid="editor-quiz">
      {qs.map((q, qi) => (
        <div key={qi} className="space-y-2 rounded-lg border border-[#30363D] bg-[#0D1117] p-3">
          <div className="flex items-center gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#21262D] text-xs">{qi + 1}</span>
            <Input className="h-9" value={q.prompt} maxLength={160} placeholder="Scrivi la domanda" onChange={(e) => set(replaceAt(qs, qi, { ...q, prompt: e.target.value }))} data-testid={`quiz-prompt-${qi}`} />
            <Button variant="ghost" size="icon-sm" aria-label="Elimina domanda" disabled={qs.length <= 1} onClick={() => set(removeAt(qs, qi))}>
              <Trash2 className="size-4 text-[#8B949E]" />
            </Button>
          </div>
          {q.options.map((o, oi) => (
            <div key={oi} className="flex items-center gap-2 pl-8">
              <input type="radio" className="size-4 accent-[#3FB950]" name={`correct-${qi}`} checked={q.correct === oi} onChange={() => set(replaceAt(qs, qi, { ...q, correct: oi }))} aria-label="Risposta corretta" />
              <Input className="h-8" value={o} maxLength={80} placeholder={`Risposta ${oi + 1}`} onChange={(e) => set(replaceAt(qs, qi, { ...q, options: replaceAt(q.options, oi, e.target.value) }))} data-testid={`quiz-option-input-${qi}-${oi}`} />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Elimina risposta"
                disabled={q.options.length <= 2}
                onClick={() => set(replaceAt(qs, qi, { ...q, options: removeAt(q.options, oi), correct: q.correct === oi ? 0 : q.correct > oi ? q.correct - 1 : q.correct }))}
              >
                <Trash2 className="size-3.5 text-[#8B949E]" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pl-8">
            <Button variant="outline" size="sm" disabled={q.options.length >= 6} onClick={() => set(replaceAt(qs, qi, { ...q, options: [...q.options, ""] }))}>
              <Plus className="size-3.5" /> Risposta
            </Button>
            <Button variant="outline" size="sm" onClick={() => set(replaceAt(qs, qi, { ...q, options: ["Vero", "Falso"], correct: 0 }))}>
              Vero / Falso
            </Button>
          </div>
        </div>
      ))}
      <Button variant="outline" disabled={qs.length >= 30} onClick={() => set([...qs, blankQuestion()])} data-testid="quiz-add">
        <Plus className="size-4" /> Aggiungi domanda
      </Button>
      <p className="text-xs text-[#8B949E]">Il pallino verde indica la risposta corretta.</p>
    </div>
  );
}

function SortEditor({ content, onChange }: { content: GameContent; onChange: (c: GameContent) => void }) {
  const { categories: cats, sort_items: items } = content;
  const removeCategory = (ci: number) =>
    onChange({
      ...content,
      categories: removeAt(cats, ci),
      sort_items: items.map((i) => ({ ...i, category: i.category === ci ? 0 : i.category > ci ? i.category - 1 : i.category })),
    });
  return (
    <div className="space-y-5" data-testid="editor-sort">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Categorie</h3>
        {cats.map((c, ci) => (
          <div key={ci} className="flex items-center gap-2">
            <Input className="h-9" value={c} maxLength={40} placeholder={`Categoria ${ci + 1}`} onChange={(e) => onChange({ ...content, categories: replaceAt(cats, ci, e.target.value) })} data-testid={`sort-category-${ci}`} />
            <Button variant="ghost" size="icon-sm" aria-label="Elimina categoria" disabled={cats.length <= 2} onClick={() => removeCategory(ci)}>
              <Trash2 className="size-4 text-[#8B949E]" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" disabled={cats.length >= 6} onClick={() => onChange({ ...content, categories: [...cats, ""] })}>
          <Plus className="size-3.5" /> Categoria
        </Button>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Elementi da smistare</h3>
        {items.map((it, ii) => (
          <div key={ii} className="flex items-center gap-2">
            <Input className="h-9" value={it.text} maxLength={80} placeholder="Elemento" onChange={(e) => onChange({ ...content, sort_items: replaceAt(items, ii, { ...it, text: e.target.value }) })} data-testid={`sort-item-${ii}`} />
            <NativeSelect className="w-40 shrink-0" value={it.category} onChange={(e) => onChange({ ...content, sort_items: replaceAt(items, ii, { ...it, category: Number(e.target.value) }) })}>
              {cats.map((c, ci) => (
                <option key={ci} value={ci}>
                  {c.trim() || `Categoria ${ci + 1}`}
                </option>
              ))}
            </NativeSelect>
            <Button variant="ghost" size="icon-sm" aria-label="Elimina elemento" disabled={items.length <= 2} onClick={() => onChange({ ...content, sort_items: removeAt(items, ii) })}>
              <Trash2 className="size-4 text-[#8B949E]" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" disabled={items.length >= 30} onClick={() => onChange({ ...content, sort_items: [...items, { text: "", category: 0 }] })}>
          <Plus className="size-3.5" /> Elemento
        </Button>
      </div>
    </div>
  );
}

function PairsEditor({ template, content, onChange }: { template: GameTemplate; content: GameContent; onChange: (c: GameContent) => void }) {
  const [a, b, title] = PAIR_LABELS[template];
  const pairs = content.pairs;
  const max = template === "indovina" ? 30 : 12;
  const min = template === "indovina" ? 1 : 2;
  return (
    <div className="space-y-2" data-testid="editor-pairs">
      <h3 className="text-sm font-medium">{title}</h3>
      {pairs.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input className="h-9" value={p.left} maxLength={80} placeholder={a} onChange={(e) => onChange({ ...content, pairs: replaceAt(pairs, i, { ...p, left: e.target.value }) })} data-testid={`pair-left-${i}`} />
          <Input className="h-9" value={p.right} maxLength={80} placeholder={b} onChange={(e) => onChange({ ...content, pairs: replaceAt(pairs, i, { ...p, right: e.target.value }) })} data-testid={`pair-right-${i}`} />
          <Button variant="ghost" size="icon-sm" aria-label="Elimina riga" disabled={pairs.length <= min} onClick={() => onChange({ ...content, pairs: removeAt(pairs, i) })}>
            <Trash2 className="size-4 text-[#8B949E]" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" disabled={pairs.length >= max} onClick={() => onChange({ ...content, pairs: [...pairs, { left: "", right: "" }] })} data-testid="pair-add">
        <Plus className="size-3.5" /> Aggiungi
      </Button>
    </div>
  );
}

function StepsEditor({ content, onChange }: { content: GameContent; onChange: (c: GameContent) => void }) {
  const steps = content.steps;
  const swap = (i: number, j: number) => {
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ ...content, steps: next });
  };
  return (
    <div className="space-y-2" data-testid="editor-steps">
      <h3 className="text-sm font-medium">Passaggi nell'ordine corretto</h3>
      <p className="text-xs text-[#8B949E]">Scrivili già nell'ordine giusto: chi gioca li troverà mescolati.</p>
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#21262D] text-xs">{i + 1}</span>
          <Input className="h-9" value={s} maxLength={100} placeholder={`Passaggio ${i + 1}`} onChange={(e) => onChange({ ...content, steps: replaceAt(steps, i, e.target.value) })} data-testid={`step-${i}`} />
          <Button variant="ghost" size="icon-sm" aria-label="Sposta su" disabled={i === 0} onClick={() => swap(i, i - 1)}>
            <ArrowUp className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Sposta giù" disabled={i === steps.length - 1} onClick={() => swap(i, i + 1)}>
            <ArrowDown className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Elimina passaggio" disabled={steps.length <= 3} onClick={() => onChange({ ...content, steps: removeAt(steps, i) })}>
            <Trash2 className="size-4 text-[#8B949E]" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" disabled={steps.length >= 12} onClick={() => onChange({ ...content, steps: [...steps, ""] })}>
        <Plus className="size-3.5" /> Aggiungi passaggio
      </Button>
    </div>
  );
}

export default function GameEditor({ me, initial, onDone, onCancel }: { me: Me; initial?: GameOut; onDone: () => void; onCancel: () => void }) {
  const actions = useGameActions();
  const [template, setTemplate] = useState<GameTemplate>(initial?.template ?? "custom");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState<GameContent>(() => (initial ? structuredClone(initial.content) : starter("custom")));
  const [previewing, setPreviewing] = useState(false);

  const isAdmin = me.role === "admin";
  const input = cleanInput({ title, description, template, content });
  const problem = validateInput(input);

  const pick = (t: GameTemplate) => {
    if (initial || t === template) return;
    setTemplate(t);
    setContent(starter(t));
  };

  const save = (submit: boolean) => {
    if (problem) {
      toast.error(problem);
      return;
    }
    actions.save.mutate(
      { id: initial?.id, input, submit },
      {
        onSuccess: () => {
          toast.success(submit ? (isAdmin ? "Gioco pubblicato" : "Inviato agli admin per la revisione") : "Bozza salvata");
          onDone();
        },
      },
    );
  };

  const previewGame: GameOut = {
    id: "preview",
    title: input.title || "Anteprima",
    description: input.description,
    template,
    status: "draft",
    author: me.nickname,
    author_id: me.member_id,
    plays: 0,
    item_count: 0,
    created_at: "",
    review_note: null,
    is_mine: true,
    my_best: null,
    my_claimed: null,
    content: input.content,
  };

  return (
    <div className="space-y-5" data-testid="game-editor">
      <h1 className="text-lg font-semibold">{initial ? "Modifica gioco" : "Crea un gioco"}</h1>

      {!initial && (
        <Panel title="Che tipo di gioco vuoi creare?" hint="Scegli un preset: potrai riempirlo con i tuoi contenuti.">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pick(t.id)}
                data-testid={`template-${t.id}`}
                className={cn("rounded-lg border p-3 text-left transition-colors duration-150", t.id === template ? "border-[#388BFD] bg-[#388BFD]/10" : "border-[#30363D] hover:border-[#8B949E]")}
              >
                <t.icon className="mb-2 size-5 text-[#58A6FF]" />
                <span className="block text-sm font-medium">{t.label}</span>
                <span className="mt-0.5 block text-xs text-[#8B949E]">{t.tagline}</span>
              </button>
            ))}
          </div>
        </Panel>
      )}

      <Panel title={initial ? templateOf(template).label : "Titolo e descrizione"}>
        <div className="space-y-3">
          <Field label="Titolo">
            <Input className="h-9" value={title} maxLength={60} placeholder="Es. Le capitali d'Europa" onChange={(e) => setTitle(e.target.value)} data-testid="game-title" />
          </Field>
          <Field label="Descrizione (facoltativa)">
            <Input className="h-9" value={description} maxLength={200} placeholder="Di cosa parla il gioco?" onChange={(e) => setDescription(e.target.value)} data-testid="game-description" />
          </Field>
        </div>
      </Panel>

      {template === "custom" && content.custom && <BuilderEditor custom={content.custom} onChange={(custom) => setContent({ ...content, custom })} />}

      <Panel title="Contenuto" className={template === "custom" ? "hidden" : undefined}>
        {template === "quiz" && <QuizEditor content={content} onChange={setContent} />}
        {template === "sort" && <SortEditor content={content} onChange={setContent} />}
        {(template === "abbina" || template === "memory" || template === "indovina") && <PairsEditor template={template} content={content} onChange={setContent} />}
        {template === "ordina" && <StepsEditor content={content} onChange={setContent} />}
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#F0883E]" data-testid="game-problem">
          {problem ?? ""}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" className="h-9" onClick={onCancel} data-testid="game-cancel">
            Annulla
          </Button>
          <Button variant="outline" className="h-9" disabled={!!problem} onClick={() => setPreviewing(true)} data-testid="game-preview">
            <Eye className="size-4" /> Anteprima
          </Button>
          <Button variant="outline" className="h-9" disabled={actions.save.isPending} onClick={() => save(false)} data-testid="game-save">
            <Save className="size-4" /> Salva bozza
          </Button>
          <Button className="h-9" disabled={actions.save.isPending} onClick={() => save(true)} data-testid="game-submit">
            <Send className="size-4" /> {isAdmin ? "Pubblica" : "Invia in revisione"}
          </Button>
        </div>
      </div>

      <Dialog open={previewing} onOpenChange={setPreviewing}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl" data-testid="game-preview-dialog">
          <DialogHeader>
            <DialogTitle className="sr-only">Anteprima del gioco</DialogTitle>
          </DialogHeader>
          {previewing && <GameRunner game={previewGame} preview onExit={() => setPreviewing(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
