import { useState } from "react";
import { Swords } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useFriendlies, useStadiumActions, type FriendlyRow } from "@/lib/domain/stadiumApi";
import { ReplayHost } from "./Leagues";
import { Dot, PANEL } from "./stadiumUi";

const STATUS: Record<string, string> = { pending: "In attesa", playing: "In corso", played: "Giocata", declined: "Rifiutata", cancelled: "Annullata", expired: "Scaduta" };

function Row({ f, me, onWatch }: { f: FriendlyRow; me: string | null; onWatch: (id: string) => void }) {
  const act = useStadiumActions();
  const incoming = f.to_club === me;
  return (
    <li className={cn("rounded-lg border px-3 py-2 text-sm", PANEL)}>
      <div className="flex items-center gap-2">
        <span className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
          <span className="truncate">{f.from_name}</span>
          <Dot color={f.from_color} />
        </span>
        <span className="w-14 shrink-0 text-center font-bold tabular-nums">{f.status === "played" ? `${f.hg} - ${f.ag}` : "vs"}</span>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <Dot color={f.to_color} />
          <span className="truncate">{f.to_name}</span>
        </span>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-[#8B949E]">
        <span>{f.status === "pending" ? (incoming ? "Ti hanno sfidato" : "Sfida inviata") : STATUS[f.status]}</span>
        <span className="flex gap-1.5">
          {f.status === "pending" && incoming && (
            <>
              <Button size="sm" disabled={act.acceptFriendly.isPending} onClick={() => act.acceptFriendly.mutate(f.id, { onSuccess: (r) => (toast.success(`Amichevole finita ${r.hg}-${r.ag}`), onWatch(r.fixture_id)) })}>
                Accetta e gioca
              </Button>
              <Button size="sm" variant="outline" onClick={() => act.declineFriendly.mutate(f.id)}>
                Rifiuta
              </Button>
            </>
          )}
          {f.status === "pending" && !incoming && (
            <Button size="sm" variant="outline" onClick={() => act.declineFriendly.mutate(f.id)}>
              Annulla
            </Button>
          )}
          {f.status === "played" && f.fixture_id && (
            <Button size="sm" variant="secondary" onClick={() => onWatch(f.fixture_id!)}>
              Rivedi
            </Button>
          )}
        </span>
      </div>
    </li>
  );
}

export default function Friendlies() {
  const q = useFriendlies();
  const act = useStadiumActions();
  const [watch, setWatch] = useState<string | null>(null);
  const d = q.data;
  if (!d) return <p className="py-10 text-center text-sm text-[#8B949E]">Carico…</p>;
  const sent = new Set(d.mine.filter((f) => f.status === "pending" && f.from_club === d.club_id).map((f) => f.to_club));
  return (
    <div className="flex flex-col gap-4">
      <div className={cn("rounded-xl p-3", PANEL)}>
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Swords className="size-4 text-[#E3B341]" /> Amichevoli
        </h3>
        <p className="mt-1 text-[11px] text-[#8B949E]">Sfida un compagno quando vuoi. Le amichevoli non stancano i giocatori, non causano infortuni né squalifiche e non danno premi.</p>
      </div>
      {d.mine.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold tracking-wider text-[#8B949E] uppercase">Le tue sfide</h4>
          <ul className="flex flex-col gap-1.5">
            {d.mine.map((f) => (
              <Row key={f.id} f={f} me={d.club_id} onWatch={setWatch} />
            ))}
          </ul>
        </div>
      )}
      <div>
        <h4 className="mb-2 text-xs font-semibold tracking-wider text-[#8B949E] uppercase">Squadre del gruppo</h4>
        <ul className="flex flex-col gap-1.5">
          {d.rivals.length === 0 && <li className="rounded-lg border border-dashed border-[#30363D] bg-[#0D1117]/70 px-4 py-6 text-center text-sm text-[#8B949E]">Nessun'altra squadra nel gruppo, per ora.</li>}
          {d.rivals.map((r) => (
            <li key={r.id} className={cn("flex items-center gap-3 rounded-xl px-3 py-2", PANEL)}>
              <Dot color={r.color} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <p className="text-[11px] text-[#8B949E]">Overall {r.rating || "—"}</p>
              </div>
              <Button size="sm" disabled={sent.has(r.id) || act.challenge.isPending} onClick={() => act.challenge.mutate(r.id, { onSuccess: () => toast.success(`Sfida inviata a ${r.name}`) })}>
                {sent.has(r.id) ? "Inviata" : "Sfida"}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      {watch && <ReplayHost id={watch} onClose={() => setWatch(null)} />}
    </div>
  );
}
