import { useState } from "react";
import { Check, ClipboardList, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameActions } from "@/lib/gameActions";
import { relTime } from "@/lib/format";
import { templateOf } from "@/lib/games";
import type { GameSummary } from "@/lib/types";
import { EmptyState } from "@/components/common";

export default function ReviewView({ games, onPreview }: { games: GameSummary[]; onPreview: (id: string) => void }) {
  const actions = useGameActions();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote] = useState("");

  if (games.length === 0) {
    return <EmptyState icon={<ClipboardList className="size-5" />} title="Nessun gioco da revisionare" hint="I giochi inviati dai compagni compariranno qui." testId="review-empty" />;
  }

  return (
    <ul className="space-y-3" data-testid="review-list">
      {games.map((g) => {
        const meta = templateOf(g.template);
        return (
          <li key={g.id} className="rounded-xl border border-[#30363D] bg-[#161B22] p-4" data-testid={`review-${g.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{g.title}</p>
                <p className="mt-0.5 text-xs text-[#8B949E]">
                  {meta.label} · {g.item_count} elementi · di {g.author} · {relTime(g.created_at)}
                </p>
                {g.description && <p className="mt-1.5 text-sm text-[#C9D1D9]">{g.description}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="h-9" onClick={() => onPreview(g.id)} data-testid={`review-try-${g.id}`}>
                  <Play className="size-4" /> Prova
                </Button>
                <Button variant="outline" className="h-9" onClick={() => setRejecting(rejecting === g.id ? null : g.id)} data-testid={`review-reject-${g.id}`}>
                  <X className="size-4" /> Rifiuta
                </Button>
                <Button className="h-9" disabled={actions.review.isPending} onClick={() => actions.review.mutate({ id: g.id, approve: true, note: "" })} data-testid={`review-approve-${g.id}`}>
                  <Check className="size-4" /> Approva
                </Button>
              </div>
            </div>
            {rejecting === g.id && (
              <div className="mt-3 flex items-center gap-2">
                <Input className="h-9" value={note} maxLength={200} placeholder="Cosa va sistemato? (facoltativo)" onChange={(e) => setNote(e.target.value)} data-testid="review-note" />
                <Button
                  className="h-9"
                  disabled={actions.review.isPending}
                  onClick={() =>
                    actions.review.mutate(
                      { id: g.id, approve: false, note },
                      {
                        onSuccess: () => {
                          setRejecting(null);
                          setNote("");
                        },
                      },
                    )
                  }
                  data-testid="review-reject-confirm"
                >
                  Conferma
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
