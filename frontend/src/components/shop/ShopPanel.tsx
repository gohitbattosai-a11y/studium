import { useState } from "react";
import { Check, Clock, Coins, Lock, ShoppingBag, Sparkles, Trophy } from "lucide-react";
import { useMyEvents, useShop, useStatus } from "@/lib/queries";
import { featureOpen, featureStage } from "@/lib/release";
import { useShopActions } from "@/lib/shopActions";
import { avatarTone, initials, relTime } from "@/lib/format";
import { isBackgroundId } from "@/lib/theme";
import type { Me, ShopItem, ShopState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadError, SectionHeader, Segmented, SkeletonList } from "@/components/common";
import { BackgroundPreview } from "@/components/theme/ThemeBackground";
import { RAIL, RAIL_ITEM } from "@/components/layout/rail";
import { AvatarDecoration } from "./decorations";
import AdminView from "./AdminView";
import LeaderboardView from "./LeaderboardView";
import { Panel } from "./ui";
import PetsView from "@/components/pets/PetsView";

type View = "shop" | "pet" | "classifica" | "gestione";
type Actions = ReturnType<typeof useShopActions>;

function DecorationPreview({ id, name }: { id: string; name: string }) {
  return (
    <span className="relative inline-flex">
      <span className={cn("grid size-14 place-items-center rounded-full text-lg font-semibold", avatarTone(name))}>{initials(name)}</span>
      <AvatarDecoration id={id} />
    </span>
  );
}

function ItemCard({ item, state, nickname, actions, className }: { item: ShopItem; state: ShopState; nickname: string; actions: Actions; className?: string }) {
  const missing = item.price - state.balance;
  const busy = actions.buy.isPending || actions.equip.isPending;

  let action;
  if (item.owned && item.equipped) {
    action = (
      <Button variant="outline" className="h-9 w-full" disabled={busy} onClick={() => actions.equip.mutate({ kind: item.kind, item_id: null })} data-testid={`item-unequip-${item.id}`}>
        <Check className="size-4 text-[#3FB950]" /> Equipaggiato · Rimuovi
      </Button>
    );
  } else if (item.owned) {
    action = (
      <Button className="h-9 w-full" disabled={busy} onClick={() => actions.equip.mutate({ kind: item.kind, item_id: item.id })} data-testid={`item-equip-${item.id}`}>
        Equipaggia
      </Button>
    );
  } else if (!item.available) {
    action = (
      <Button variant="outline" className="h-9 w-full" disabled data-testid={`item-unavailable-${item.id}`}>
        <Lock className="size-4" /> Non disponibile ora
      </Button>
    );
  } else if (missing > 0) {
    action = (
      <Button variant="outline" className="h-9 w-full" disabled data-testid={`item-short-${item.id}`}>
        Ti mancano {missing} pt
      </Button>
    );
  } else {
    action = (
      <Button className="h-9 w-full" disabled={busy} onClick={() => actions.buy.mutate(item.id)} data-testid={`item-buy-${item.id}`}>
        <Coins className="size-4" /> Compra · {item.price} pt
      </Button>
    );
  }

  return (
    <article className={cn("dc-host flex flex-col overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22]", className)} tabIndex={0} data-testid={`item-${item.id}`}>
      {item.kind === "decoration" ? (
        <div className="grid h-32 place-items-center bg-[#0D1117]">
          <DecorationPreview id={item.id} name={nickname} />
        </div>
      ) : (
        <div className="bgx-still relative h-32 overflow-hidden bg-[#0D1117]">{isBackgroundId(item.id) && <BackgroundPreview id={item.id} />}</div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium">{item.name}</h3>
            <span className="shrink-0 text-sm tabular-nums text-[#E3B341]">{item.price} pt</span>
          </div>
          <p className="mt-1 text-sm text-[#8B949E]">{item.description}</p>
          {item.window_label && (
            <p className="mt-2 inline-flex items-center gap-1 rounded border border-[#D29922]/25 bg-[#342207] px-1.5 py-0.5 text-xs text-[#E3B341]">
              <Clock className="size-3" /> A tempo · {item.window_label}
            </p>
          )}
        </div>
        {action}
      </div>
    </article>
  );
}

function ClassicBackgroundCard({ state, actions, className }: { state: ShopState; actions: Actions; className?: string }) {
  const active = state.equipped_background === null;
  return (
    <article className={cn("flex flex-col overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22]", className)} data-testid="item-classico">
      <div className="grid h-32 place-items-center bg-[#0D1117] text-sm text-[#8B949E]">Nessuno sfondo</div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <h3 className="font-medium">Classico</h3>
          <p className="mt-1 text-sm text-[#8B949E]">Il tema scuro di sempre. Sempre disponibile.</p>
        </div>
        <Button variant={active ? "outline" : "default"} className="h-9 w-full" disabled={active || actions.equip.isPending} onClick={() => actions.equip.mutate({ kind: "background", item_id: null })} data-testid="item-equip-classico">
          {active ? (
            <>
              <Check className="size-4 text-[#3FB950]" /> Equipaggiato
            </>
          ) : (
            "Equipaggia"
          )}
        </Button>
      </div>
    </article>
  );
}

function ShopView({ state, nickname, actions }: { state: ShopState; nickname: string; actions: Actions }) {
  const history = useMyEvents(true);
  const decorations = state.items.filter((i) => i.kind === "decoration");
  const backgrounds = state.items.filter((i) => i.kind === "background");

  return (
    <div className="space-y-6 md:space-y-6" data-testid="shop-view">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#30363D] bg-[#161B22] p-4 md:gap-4 md:p-5" data-testid="shop-balance">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#8B949E]">Il tuo saldo</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {state.balance} <span className="text-base font-normal text-[#8B949E]">punti</span>
          </p>
          <p className="mt-0.5 text-xs text-[#8B949E]">
            {state.total_points} guadagnati · {state.spent} spesi
          </p>
        </div>
        <Button variant="outline" className="h-9" disabled={actions.participate.isPending} onClick={() => actions.participate.mutate(false)} data-testid="leave-leaderboard-button">
          Lascia la classifica
        </Button>
      </section>

      <div>
        <h2 className="mb-3 flex items-baseline justify-between text-sm font-medium">
          Icone profilo animate
          <span className="text-xs font-normal text-[#8B949E] sm:hidden">{decorations.length}</span>
        </h2>
        <div className={cn(RAIL, "sm:grid-cols-2 xl:grid-cols-3")}>
          {decorations.map((i) => (
            <ItemCard key={i.id} item={i} state={state} nickname={nickname} actions={actions} className={RAIL_ITEM} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 flex items-baseline justify-between text-sm font-medium">
          Sfondi
          <span className="text-xs font-normal text-[#8B949E] sm:hidden">{backgrounds.length + 1}</span>
        </h2>
        <div className={cn(RAIL, "sm:grid-cols-2 xl:grid-cols-3")}>
          <ClassicBackgroundCard state={state} actions={actions} className={RAIL_ITEM} />
          {backgrounds.map((i) => (
            <ItemCard key={i.id} item={i} state={state} nickname={nickname} actions={actions} className={RAIL_ITEM} />
          ))}
        </div>
      </div>

      <Panel title="I tuoi punti" testId="shop-history">
        {!history.data || history.data.length === 0 ? (
          <p className="text-sm text-[#8B949E]">Ancora nessun punto: arriveranno quando l'admin inserirà i voti.</p>
        ) : (
          <ul className="space-y-2">
            {history.data.slice(0, 8).map((ev) => (
              <li key={ev.id} className="flex items-center gap-3 text-sm">
                <span className={cn("w-10 shrink-0 text-right font-semibold tabular-nums", ev.points >= 0 ? "text-[#7EE787]" : "text-[#FFA198]")}>
                  {ev.points > 0 ? "+" : ""}
                  {ev.points}
                </span>
                <span className="min-w-0 flex-1 truncate">{ev.kind === "grade" ? `${ev.subject} · voto ${String(ev.grade).replace(".", ",")}` : ev.reason}</span>
                <span className="shrink-0 text-xs text-[#8B949E]">{relTime(ev.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function OptIn({ actions }: { actions: Actions }) {
  return (
    <section className="rounded-xl border border-dashed border-[#30363D] px-6 py-10 text-center" data-testid="shop-optin">
      <div className="mx-auto mb-3 grid size-10 place-items-center rounded-md bg-[#21262D] text-[#E3B341]">
        <Sparkles className="size-5" />
      </div>
      <p className="font-medium">Partecipare è facoltativo</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-[#8B949E]">
        Se partecipi i tuoi voti diventano punti, compari in classifica e puoi comprare icone animate e sfondi nello shop. Se non vuoi, non succede nulla: puoi cambiare idea quando vuoi.
      </p>
      <Button className="mt-5 h-9" disabled={actions.participate.isPending} onClick={() => actions.participate.mutate(true)} data-testid="join-leaderboard-button">
        Partecipa
      </Button>
    </section>
  );
}

export default function ShopPanel({ me }: { me: Me }) {
  const shop = useShop();
  const status = useStatus();
  const actions = useShopActions();
  const [view, setView] = useState<View>("shop");

  const isAdmin = (shop.data?.role ?? me.role) === "admin";
  const role = shop.data?.role ?? me.role;
  const petsOpen = featureOpen(status.data, "pets", role);
  const petsBeta = featureStage(status.data, "pets") === "admins";
  const current: View = (view === "gestione" && !isAdmin) || (view === "pet" && !petsOpen) ? "shop" : view;

  const options: { value: View; label: string }[] = [
    { value: "shop", label: "Shop" },
    ...(petsOpen ? [{ value: "pet" as View, label: petsBeta ? "Pet (beta)" : "Pet" }] : []),
    { value: "classifica", label: "Classifica" },
    ...(isAdmin ? [{ value: "gestione" as View, label: "Gestione" }] : []),
  ];

  let body;
  if (current === "classifica") body = <LeaderboardView />;
  else if (current === "pet") body = <PetsView />;
  else if (current === "gestione") body = <AdminView me={me} />;
  else if (shop.isPending) body = <SkeletonList rows={3} />;
  else if (shop.isError) body = <LoadError testId="shop-error" />;
  else if (!shop.data.participating) body = <OptIn actions={actions} />;
  else body = <ShopView state={shop.data} nickname={me.nickname} actions={actions} />;

  return (
    <div>
      <SectionHeader
        title="Shop & Classifica"
        subtitle="Ogni voto vale punti da spendere in icone e sfondi."
        testId="shop"
        action={current === "shop" ? <ShoppingBag className="size-5 text-[#8B949E]" /> : current === "classifica" ? <Trophy className="size-5 text-[#8B949E]" /> : undefined}
      />
      <div className="no-scrollbar -mx-4 mb-4 overflow-x-auto px-4">
        <Segmented value={current} onChange={setView} testId="shop-view-switch" options={options} />
      </div>
      {body}
    </div>
  );
}
