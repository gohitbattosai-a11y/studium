import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Anchor, ArrowRightLeft, Bell, Bug, Coffee, Coins, Fish, GlassWater, Landmark, Shovel, Sparkles } from "lucide-react";
import type { CityState } from "@/lib/domain/city";
import { ANIMAL_BY_ID } from "@/lib/domain/animals";
import { FOSSIL_BY_ID } from "@/lib/domain/fossils";
import { addBudget } from "@/lib/domain/football";
import { fmtMoney, sellValue, spanFactor, useCityShop, useShopActions, type SellLine, type ShopItem, type ShopUpgrade } from "@/lib/domain/shop";
import { discardFossil, releaseAnimal, releaseFish, useSandbox } from "@/lib/runtime/sandbox";
import type { Rarity } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { LoadError, SkeletonList } from "@/components/common";
import { RarityTag } from "./Bucket";

type Tab = "buy" | "sell" | "swap";

interface Row {
  id: string;
  name: string;
  rarity: Rarity;
  info: string;
  value: number;
  fresh: boolean;
  line: SellLine;
  remove: () => unknown;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "buy", label: "Vetrina" },
  { id: "sell", label: "Vendi" },
  { id: "swap", label: "Cambio" },
];

const ICONS: Record<string, ReactNode> = {
  verme: <Bug />,
  mosca: <Bug />,
  brillante: <Sparkles />,
  fischietto_bosco: <Bell />,
  fischietto_argento: <Bell />,
  fischietto_oro: <Bell />,
  caffe: <Coffee />,
  borraccia: <GlassWater />,
  fondi_5: <Landmark />,
  fondi_20: <Landmark />,
  fondi_50: <Landmark />,
  pala: <Shovel />,
  canna: <Anchor />,
};

const TINT: Record<string, string> = { esca: "#58A6FF", richiamo: "#7EE787", energia: "#E3B341", stadio: "#A371F7", upgrade: "#F0883E" };

const SECTIONS: { id: "esca" | "richiamo" | "energia" | "stadio"; title: string; sub: string }[] = [
  { id: "esca", title: "Esche", sub: "Il pane resta gratis. Queste attirano pesci migliori." },
  { id: "richiamo", title: "Fischietti per la foresta", sub: "Richiami più potenti di quello gratuito, senza attesa." },
  { id: "energia", title: "Energia per lo scavo", sub: "Per non fermarti proprio sul fossile giusto." },
  { id: "stadio", title: "Fondi per lo stadio", sub: "Monete in budget: non tornano indietro." },
];

function Money({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold tabular-nums text-[#F6D77A]", className)}>
      <Coins className="size-3.5" /> {fmtMoney(n)}
    </span>
  );
}

function Case({ tint, icon, children }: { tint: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="relative flex gap-3 overflow-hidden rounded-xl border bg-gradient-to-b from-white/[0.07] to-black/30 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_16px_rgba(0,0,0,0.35)]" style={{ borderColor: `${tint}55` }}>
      <div className="pointer-events-none absolute -top-6 -left-6 h-16 w-32 rotate-12 bg-white/[0.05] blur-md" />
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border [&>svg]:size-6" style={{ borderColor: `${tint}66`, background: `radial-gradient(circle at 50% 30%, ${tint}33, transparent 70%)`, color: tint }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default function Shop({ city, participating }: { city: CityState; participating: boolean }) {
  const [tab, setTab] = useState<Tab>("buy");
  const shop = useCityShop(true);
  const act = useShopActions();
  const sb = useSandbox();
  const data = shop.data;
  const busy = act.sell.isPending || act.buy.isPending || act.upgrade.isPending || act.convert.isPending;

  const speciesById = useMemo(() => new Map(city.species.map((s) => [s.id, s])), [city.species]);

  const fishRows = sb.fishBucket.map((f) => {
    const sp = speciesById.get(f.species_id);
    const factor = sp ? spanFactor(f.length, sp.min_cm, sp.max_cm) : 0.5;
    return {
      id: f.id,
      name: f.name,
      rarity: f.rarity,
      info: `${f.length} cm`,
      value: sellValue("fish", f.rarity, factor),
      fresh: !sb.fishMuseum.some((d) => d.species_id === f.species_id),
      line: { kind: "fish", species_id: f.species_id, length: f.length } as SellLine,
      remove: () => releaseFish(f.id),
    };
  });

  const animalRows = sb.animalBag.flatMap((a) => {
    const sp = ANIMAL_BY_ID[a.species_id];
    if (!sp) return [];
    const factor = spanFactor(a.weight, sp.min_kg, sp.max_kg);
    return [
      {
        id: a.id,
        name: sp.name,
        rarity: sp.rarity as Rarity,
        info: `${a.weight} kg`,
        value: sellValue("animal", sp.rarity, factor),
        fresh: !sb.animalMuseum.some((d) => d.species_id === a.species_id),
        line: { kind: "animal", rarity: sp.rarity, factor } as SellLine,
        remove: () => releaseAnimal(a.id),
      },
    ];
  });

  const fossilRows = sb.fossilBag.flatMap((x) => {
    const sp = FOSSIL_BY_ID[x.species_id];
    if (!sp) return [];
    const factor = x.integrity / 100;
    return [
      {
        id: x.id,
        name: sp.name,
        rarity: sp.rarity,
        info: `Integrità ${Math.round(x.integrity)}%`,
        value: sellValue("fossil", sp.rarity, factor),
        fresh: !sb.fossilMuseum.some((d) => d.species_id === x.species_id),
        line: { kind: "fossil", rarity: sp.rarity, factor } as SellLine,
        remove: () => discardFossil(x.id),
      },
    ];
  });

  const sellRows = async (rows: Row[]) => {
    if (rows.length === 0 || busy) return;
    try {
      const res = await act.sell.mutateAsync(rows.map((r) => r.line));
      rows.forEach((r) => r.remove());
      toast.success(`Venduto: +${fmtMoney(res.earned ?? 0)} monete`);
    } catch {
      return;
    }
  };

  const buy = async (item: ShopItem, qty: number) => {
    try {
      const res = await act.buy.mutateAsync({ item_id: item.id, qty });
      if (res.granted) {
        addBudget(res.granted);
        toast.success(`Budget dello stadio +${res.granted} M`);
      } else {
        toast.success(`${item.name} ×${qty}`);
      }
    } catch {
      return;
    }
  };

  const upgrade = async (u: ShopUpgrade) => {
    try {
      await act.upgrade.mutateAsync(u.id);
      toast.success(`${u.name}: livello ${u.level + 1}`);
    } catch {
      return;
    }
  };

  const convert = async () => {
    try {
      await act.convert.mutateAsync(1);
      toast.success("Hai guadagnato 1 punto!");
    } catch {
      return;
    }
  };

  const sections: { title: string; rows: Row[] }[] = [
    { title: "Pesci nel secchio", rows: fishRows },
    { title: "Animali nello zaino", rows: animalRows },
    { title: "Fossili nello zaino", rows: fossilRows },
  ];

  return (
    <div className="absolute inset-0 overflow-y-auto bg-[radial-gradient(ellipse_at_50%_0%,#5a3b21,#2a1a0e_70%)] text-[#F3E7D3]" data-testid="city-shop">
      <div className="h-12" />
      <div className="h-3 w-full bg-[repeating-linear-gradient(90deg,#c2553f_0_28px,#fff3dc_28px_56px)] shadow-[0_4px_10px_rgba(0,0,0,0.45)]" />
      <div className="mx-auto max-w-3xl px-3 pb-10">
        <div className="sticky top-0 z-[3] -mx-3 mb-3 flex items-center justify-between gap-2 border-b border-white/10 bg-[#2a1a0e]/90 px-3 py-2 backdrop-blur">
          <div className="flex gap-1 rounded-full border border-white/10 bg-black/30 p-1" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                data-testid={`shop-tab-${t.id}`}
                className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors", tab === t.id ? "bg-[#E3B341] text-[#2a1a0e]" : "text-[#d8c8ac] hover:text-white")}
              >
                {t.label}
              </button>
            ))}
          </div>
          {data && <Money n={data.money} className="rounded-full border border-[#E3B341]/40 bg-black/30 px-3 py-1.5 text-sm" />}
        </div>

        {shop.isPending ? (
          <SkeletonList />
        ) : shop.isError || !data ? (
          <LoadError testId="shop-error" />
        ) : tab === "buy" ? (
          <div className="space-y-6">
            {SECTIONS.map((sec) => (
              <section key={sec.id}>
                <h2 className="text-sm font-semibold tracking-wide text-[#F6D77A] uppercase">{sec.title}</h2>
                <p className="mb-2 text-xs text-[#bfae92]">{sec.sub}</p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {data.items
                    .filter((i) => i.category === sec.id)
                    .map((i) => (
                      <Case key={i.id} tint={TINT[i.category]} icon={ICONS[i.id]}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold">{i.name}</p>
                          {i.category !== "stadio" && <span className="shrink-0 rounded-full bg-black/40 px-2 py-0.5 text-[11px] tabular-nums text-[#d8c8ac]">hai {i.owned}</span>}
                        </div>
                        <p className="mt-0.5 text-xs leading-snug text-[#bfae92]">{i.description}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <Money n={i.price} className="text-sm" />
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="secondary" disabled={busy || data.money < i.price} onClick={() => buy(i, 1)} data-testid={`shop-buy-${i.id}`}>
                              Compra
                            </Button>
                            {i.category !== "stadio" && (
                              <Button size="sm" variant="outline" disabled={busy || data.money < i.price * 5} onClick={() => buy(i, 5)}>
                                ×5
                              </Button>
                            )}
                          </div>
                        </div>
                      </Case>
                    ))}
                </div>
              </section>
            ))}
            <section>
              <h2 className="text-sm font-semibold tracking-wide text-[#F6D77A] uppercase">Banco degli attrezzi</h2>
              <p className="mb-2 text-xs text-[#bfae92]">Potenziamenti permanenti.</p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {data.upgrades.map((u) => (
                  <Case key={u.id} tint={TINT.upgrade} icon={ICONS[u.id]}>
                    <p className="text-sm font-semibold">{u.name}</p>
                    <p className="mt-0.5 text-xs leading-snug text-[#bfae92]">{u.description}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex gap-1" aria-label={`Livello ${u.level} di ${u.max_level}`}>
                        {Array.from({ length: u.max_level }, (_, k) => (
                          <span key={k} className={cn("h-2 w-5 rounded-full", k < u.level ? "bg-[#F0883E]" : "bg-black/40")} />
                        ))}
                      </div>
                      {u.next_price === null ? (
                        <span className="text-xs font-semibold text-[#7EE787]">Massimo</span>
                      ) : (
                        <Button size="sm" variant="secondary" disabled={busy || data.money < u.next_price} onClick={() => upgrade(u)} data-testid={`shop-upgrade-${u.id}`}>
                          <Money n={u.next_price} className="text-[#2a1a0e]" />
                        </Button>
                      )}
                    </div>
                  </Case>
                ))}
              </div>
            </section>
          </div>
        ) : tab === "sell" ? (
          <div className="space-y-6">
            <p className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-[#bfae92]">Quello che vendi sparisce dallo zaino: le specie nuove per il museo conviene donarle prima.</p>
            {sections.map((sec) => (
              <section key={sec.title}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold tracking-wide text-[#F6D77A] uppercase">{sec.title}</h2>
                  {sec.rows.length > 1 && (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => sellRows(sec.rows)}>
                      Vendi tutto <Money n={sec.rows.reduce((t, r) => t + r.value, 0)} />
                    </Button>
                  )}
                </div>
                {sec.rows.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-white/15 px-3 py-4 text-center text-xs text-[#bfae92]">Niente da vendere qui.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {sec.rows.map((r) => (
                      <li key={r.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{r.name}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#bfae92]">
                            <RarityTag rarity={r.rarity} />
                            <span className="tabular-nums">{r.info}</span>
                            {r.fresh && <span className="rounded border border-[#3FB950]/40 px-1.5 py-0.5 text-[10px] text-[#7EE787]">Nuova per il museo</span>}
                          </div>
                        </div>
                        <Button size="sm" variant="secondary" disabled={busy} onClick={() => sellRows([r])} data-testid="shop-sell">
                          <Money n={r.value} className="text-[#2a1a0e]" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <Case tint="#E3B341" icon={<ArrowRightLeft />}>
              <p className="text-sm font-semibold">Cambio in punti</p>
              <p className="mt-0.5 text-xs leading-snug text-[#bfae92]">
                {fmtMoney(data.convert.rate)} monete = 1 punto. Il cambio va solo in questa direzione e ogni giorno puoi cambiare al massimo {data.convert.daily_cap} {data.convert.daily_cap === 1 ? "punto" : "punti"}.
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
                <div className="h-full rounded-full bg-gradient-to-r from-[#E3B341] to-[#F0883E] transition-[width]" style={{ width: `${Math.min(100, (data.money / data.convert.rate) * 100)}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-[#bfae92]">
                <Money n={data.money} />
                <span className="tabular-nums">{fmtMoney(data.convert.rate)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-[#d8c8ac]">Oggi: ancora {data.convert.left_today}</span>
                <Button size="sm" disabled={busy || !participating || data.convert.left_today < 1 || data.money < data.convert.rate} onClick={convert} data-testid="shop-convert">
                  Cambia 1 punto
                </Button>
              </div>
              {!participating && <p className="mt-2 text-xs text-[#FF7B72]">Attiva la partecipazione nello shop per poter cambiare le monete in punti.</p>}
            </Case>
            <p className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-[#bfae92]">Un pesce mitico vale al massimo 600 monete: per un punto ne servono tanti.</p>
          </div>
        )}
      </div>
    </div>
  );
}
