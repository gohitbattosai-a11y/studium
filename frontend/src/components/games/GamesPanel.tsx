import { useState } from "react";
import { Check, Gamepad2, Pencil, Play, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { useGameActions } from "@/lib/gameActions";
import { errMsg } from "@/lib/format";
import { templateOf } from "@/lib/games";
import { useGames, usePointsTable, useReviewQueue } from "@/lib/queries";
import type { GameOut, GameStatus, GameSummary, Me } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyState, LoadError, SectionHeader, Segmented, SkeletonList } from "@/components/common";
import GameEditor from "./GameEditor";
import GameRunner from "./GameRunner";
import ReviewView from "./ReviewView";

type View = "tutti" | "miei" | "revisione";
type Screen = { name: "hub" } | { name: "play"; game: GameOut; preview: boolean } | { name: "edit"; game?: GameOut };

const STATUS: Record<GameStatus, { label: string; tone: string }> = {
  draft: { label: "Bozza", tone: "border-[#30363D] bg-[#21262D] text-[#8B949E]" },
  pending: { label: "In revisione", tone: "border-[#D29922]/30 bg-[#342207] text-[#E3B341]" },
  published: { label: "Pubblicato", tone: "border-[#238636]/40 bg-[#0F2A18] text-[#56D364]" },
  rejected: { label: "Rifiutato", tone: "border-[#F85149]/30 bg-[#3B1219] text-[#FFA198]" },
};

function GameCard({ game, onOpen }: { game: GameSummary; onOpen: () => void }) {
  const meta = templateOf(game.template);
  return (
    <button type="button" onClick={onOpen} className="flex flex-col rounded-xl border border-[#30363D] bg-[#161B22] p-4 text-left transition-colors duration-150 hover:border-[#8B949E]" data-testid={`game-card-${game.id}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#21262D] px-2 py-1 text-xs text-[#C9D1D9]">
          <meta.icon className="size-3.5 text-[#58A6FF]" /> {meta.label}
        </span>
        {game.my_claimed !== null ? (
          <span className="inline-flex items-center gap-1 text-xs text-[#56D364]">
            <Check className="size-3.5" /> +{game.my_claimed} pt
          </span>
        ) : game.my_best !== null ? (
          <span className="text-xs text-[#8B949E]">Migliore {game.my_best}%</span>
        ) : null}
      </div>
      <p className="font-medium">{game.title}</p>
      {game.description && <p className="mt-1 line-clamp-2 text-sm text-[#8B949E]">{game.description}</p>}
      <p className="mt-3 text-xs text-[#8B949E]">
        {game.author} · {game.item_count} elementi · {game.plays} partite
      </p>
    </button>
  );
}

function MineRow({ game, onPlay, onEdit }: { game: GameSummary; onPlay: () => void; onEdit: () => void }) {
  const actions = useGameActions();
  const meta = templateOf(game.template);
  const status = STATUS[game.status];
  const editable = game.status === "draft" || game.status === "rejected";
  return (
    <li className="rounded-xl border border-[#30363D] bg-[#161B22] p-4" data-testid={`mine-${game.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{game.title}</p>
            <span className={cn("rounded border px-1.5 py-0.5 text-[11px]", status.tone)}>{status.label}</span>
          </div>
          <p className="mt-0.5 text-xs text-[#8B949E]">
            {meta.label} · {game.item_count} elementi · {game.plays} partite
          </p>
          {game.review_note && <p className="mt-1.5 text-sm text-[#FFA198]">Nota degli admin: {game.review_note}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-9" onClick={onPlay}>
            <Play className="size-4" /> Gioca
          </Button>
          {editable && (
            <Button variant="outline" className="h-9" onClick={onEdit} data-testid={`mine-edit-${game.id}`}>
              <Pencil className="size-4" /> Modifica
            </Button>
          )}
          {editable && (
            <Button className="h-9" disabled={actions.submit.isPending} onClick={() => actions.submit.mutate(game.id)} data-testid={`mine-submit-${game.id}`}>
              <Send className="size-4" /> Invia
            </Button>
          )}
          <Button variant="ghost" size="icon" aria-label="Elimina gioco" disabled={actions.remove.isPending} onClick={() => actions.remove.mutate(game.id)} data-testid={`mine-delete-${game.id}`}>
            <Trash2 className="size-4 text-[#8B949E]" />
          </Button>
        </div>
      </div>
    </li>
  );
}

export default function GamesPanel({ me }: { me: Me }) {
  const games = useGames();
  const isAdmin = me.role === "admin";
  const queue = useReviewQueue(isAdmin);
  const table = usePointsTable();
  const [view, setView] = useState<View>("tutti");
  const [screen, setScreen] = useState<Screen>({ name: "hub" });

  const load = async (id: string, preview = false) => {
    try {
      setScreen({ name: "play", game: await apiGet<GameOut>(`/games/${id}`), preview });
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const edit = async (id?: string) => {
    if (!id) {
      setScreen({ name: "edit" });
      return;
    }
    try {
      setScreen({ name: "edit", game: await apiGet<GameOut>(`/games/${id}`) });
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const back = () => setScreen({ name: "hub" });

  if (screen.name === "play") return <GameRunner game={screen.game} preview={screen.preview} onExit={back} />;
  if (screen.name === "edit") {
    return (
      <GameEditor
        me={me}
        initial={screen.game}
        onCancel={back}
        onDone={() => {
          setView("miei");
          back();
        }}
      />
    );
  }

  const current: View = view === "revisione" && !isAdmin ? "tutti" : view;
  const pending = queue.data?.length ?? 0;
  const published = (games.data ?? []).filter((g) => g.status === "published");
  const mine = (games.data ?? []).filter((g) => g.is_mine);

  let body;
  if (current === "revisione") body = <ReviewView games={queue.data ?? []} onPreview={(id) => void load(id, true)} />;
  else if (games.isPending) body = <SkeletonList rows={3} />;
  else if (games.isError) body = <LoadError testId="games-error" />;
  else if (current === "miei") {
    body =
      mine.length === 0 ? (
        <EmptyState icon={<Gamepad2 className="size-5" />} title="Non hai ancora creato giochi" hint="Crea il tuo primo gioco: quiz, memory, abbinamenti e altro." testId="games-mine-empty" />
      ) : (
        <ul className="space-y-3" data-testid="games-mine">
          {mine.map((g) => (
            <MineRow key={g.id} game={g} onPlay={() => void load(g.id)} onEdit={() => void edit(g.id)} />
          ))}
        </ul>
      );
  } else {
    body =
      published.length === 0 ? (
        <EmptyState icon={<Gamepad2 className="size-5" />} title="Nessun gioco pubblicato" hint="Crea il primo e fallo approvare dagli admin." testId="games-empty" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="games-grid">
          {published.map((g) => (
            <GameCard key={g.id} game={g} onOpen={() => void load(g.id)} />
          ))}
        </div>
      );
  }

  return (
    <div>
      <SectionHeader
        title="Game hub"
        subtitle="Gioca e crea giochi per studiare. Con i giochi puoi guadagnare punti."
        testId="games"
        action={
          <Button className="h-9" onClick={() => void edit()} data-testid="create-game-button">
            <Plus className="size-4" /> Crea gioco
          </Button>
        }
      />
      {table.data && (
        <p className="mb-3 text-xs text-[#8B949E]" data-testid="games-tiers">
          A fine round, dal {table.data.game_tiers[0]?.min_percent}% in su puoi riscuotere punti: {table.data.game_tiers.map((t) => `${t.min_percent}% → ${t.points}`).join(" · ")}. Una volta sola per gioco.
        </p>
      )}
      <div className="no-scrollbar -mx-4 mb-4 overflow-x-auto px-4">
        <Segmented
          value={current}
          onChange={setView}
          testId="games-view-switch"
          options={[
            { value: "tutti", label: "Giochi" },
            { value: "miei", label: "I miei" },
            ...(isAdmin ? [{ value: "revisione" as View, label: pending > 0 ? `Revisione (${pending})` : "Revisione" }] : []),
          ]}
        />
      </div>
      {body}
    </div>
  );
}
