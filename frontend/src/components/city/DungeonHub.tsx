import { Coins, Lock, ShoppingBag, Swords, Trophy, User, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { DEF, DUNGEON_LIST, type DungeonId } from "@/lib/domain/dungeon";
import { useDungeonHub, type LootDef, type TrophyDef } from "@/lib/domain/dungeonApi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { RarityTag } from "./Bucket";
import { ENEMY_H, EnemyArt } from "./dungeonArt";
import HeroPanel from "./HeroPanel";
import { LootIcon, TrophyArt } from "./dungeonItems";
import "./dungeon.css";

const RC: Record<string, string> = { comune: "#9ca3af", non_comune: "#4ade80", raro: "#60a5fa", epico: "#c084fc", leggendario: "#fbbf24", mitico: "#f43f5e" };

type Tab = "gates" | "hero" | "hall" | "bag";

function Plaque({ t, owned, size = 56, onClick, count }: { t: TrophyDef; owned: boolean; size?: number; onClick?: () => void; count?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={owned ? t.name : "Trofeo da trovare"}
      style={owned ? { borderColor: RC[t.rarity] ?? "#9ca3af", boxShadow: `0 0 14px ${t.color}33` } : undefined}
      className={cn("relative grid shrink-0 touch-manipulation place-items-center rounded-xl border-2 bg-gradient-to-b from-[#3a2a1a] to-[#1f1610] transition-transform active:scale-95", owned ? "" : "border-white/10 from-[#1a1a22] to-[#101016]")}
    >
      <span style={{ width: size, height: size }} className={cn("grid place-items-center", !owned && "opacity-35 brightness-0")}>
        <TrophyArt art={t.art} color={t.color} size={size - 6} />
      </span>
      {!owned && <Lock className="absolute size-4 text-white/50" />}
      {count !== undefined && count > 0 && <span className="absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-black">{count}</span>}
    </button>
  );
}

function GateCard({ id, name, tag, blurb, floors, record, got, total, onGo }: { id: DungeonId; name: string; tag: string; blurb: string; floors: number; record: { best: number; wins: number }; got: number; total: number; onGo: () => void }) {
  const def = DUNGEON_LIST.find((d) => d.id === id)!;
  const boss = DEF[def.boss];
  const h = ENEMY_H[def.boss];
  const k = Math.min(1, 150 / h);
  return (
    <div className="dg-pop relative overflow-hidden rounded-2xl bg-[#12101f] ring-1 ring-white/15" style={{ boxShadow: `0 0 30px ${def.accent}22` }}>
      <div className="relative h-44 overflow-hidden" style={{ background: `radial-gradient(ellipse at 50% 85%, ${def.accent}55, transparent 65%), linear-gradient(#0b0912, ${def.themes[1].wall2})` }}>
        <svg viewBox="0 0 200 180" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMax meet">
          <defs>
            <radialGradient id={`hg-${id}`} cx="0.5" cy="0.8" r="0.7">
              <stop offset="0" stopColor={def.accent} stopOpacity="0.7" />
              <stop offset="1" stopColor={def.accent} stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M20 180 L20 70 Q20 12 100 12 Q180 12 180 70 L180 180Z" fill="#06040c" stroke="#3a3d4d" strokeWidth="6" />
          <path d="M20 180 L20 70 Q20 12 100 12 Q180 12 180 70 L180 180Z" fill={`url(#hg-${id})`} className="dg-gleam" />
          <ellipse cx="100" cy="176" rx="64" ry="9" fill={def.accent} opacity="0.35" />
          <g transform={`translate(100 174) scale(${k * 0.95})`}>
            <EnemyArt kind={def.boss} />
          </g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} className="dg-mote" cx={46 + i * 22} cy={150} r="1.5" fill={def.themes[1].mote} style={{ animationDelay: `${i * 0.9}s` }} />
          ))}
        </svg>
        <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-white/20" style={{ color: def.accent }}>
          {tag}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-base font-extrabold text-amber-100">{name}</h3>
        <p className="mt-0.5 text-xs text-[#C9D1D9]">{blurb}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#9AA4B2]">
          <span>{floors} piani</span>
          <span>Boss: {boss.name}</span>
          <span>
            Record {record.best}/{floors}
          </span>
          <span>Vittorie {record.wins}</span>
          <span className="text-amber-300">
            Trofei {got}/{total}
          </span>
        </div>
        <Button className="mt-3 w-full" onClick={onGo} data-testid={`dungeon-go-${id}`}>
          <Swords className="size-4" /> Entra
        </Button>
      </div>
    </div>
  );
}

function Wall({ trophies, mine, counts, onPick }: { trophies: TrophyDef[]; mine: Set<string>; counts?: Record<string, number>; onPick: (t: TrophyDef) => void }) {
  return (
    <div className="space-y-3">
      {DUNGEON_LIST.map((d) => (
        <div key={d.id}>
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold" style={{ color: d.accent }}>
            <span className="h-px flex-1" style={{ background: `${d.accent}55` }} />
            {d.name}
            <span className="h-px flex-1" style={{ background: `${d.accent}55` }} />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {trophies
              .filter((t) => t.dungeon === d.id)
              .map((t) => (
                <Plaque key={t.id} t={t} owned={mine.has(t.id)} count={counts?.[t.id]} onClick={() => onPick(t)} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DungeonHub({ memberId, onRun, onShop }: { memberId: string; onRun: (id: DungeonId) => void; onShop: () => void }) {
  const hub = useDungeonHub();
  const [tab, setTab] = useState<Tab>("gates");
  const [pick, setPick] = useState<TrophyDef | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const data = hub.data;
  const mine = useMemo(() => new Set(data?.mine ?? []), [data?.mine]);
  const holders = useMemo(() => {
    const m: Record<string, number> = {};
    data?.hunters.forEach((h) => h.trophies.forEach((t) => (m[t] = (m[t] ?? 0) + 1)));
    return m;
  }, [data?.hunters]);
  const byId = useMemo(() => Object.fromEntries((data?.trophies ?? []).map((t) => [t.id, t])), [data?.trophies]);
  const items = useMemo(() => Object.fromEntries((data?.items ?? []).map((i) => [i.id, i])) as Record<string, LootDef>, [data?.items]);
  const bag = useMemo(() => Object.entries(data?.bag ?? {}).filter(([id]) => items[id]).sort((a, b) => items[b[0]].value - items[a[0]].value), [data?.bag, items]);
  const bagCount = bag.reduce((s, [, n]) => s + n, 0);
  const bagValue = bag.reduce((s, [id, n]) => s + items[id].value * n, 0);

  if (!data) {
    return <div className="grid size-full place-items-center pt-12 text-sm text-[#C9D1D9]">{hub.isError ? "Impossibile aprire i sotterranei." : "Apro i portoni…"}</div>;
  }

  const tabs: { id: Tab; label: string; icon: typeof Swords }[] = [
    { id: "gates", label: "Sotterranei", icon: Swords },
    { id: "hero", label: data.char ? "Eroe" : "Crea eroe", icon: User },
    { id: "hall", label: "Cacciatori", icon: Trophy },
    { id: "bag", label: `Zaino ${bagCount}/${data.bag_limit}`, icon: ShoppingBag },
  ];

  return (
    <div className="absolute inset-0 flex flex-col bg-[radial-gradient(ellipse_at_50%_0%,#2a1f4d,#07050d_70%)] pt-12 text-[#E6EDF3]" data-testid="dungeon-hub">
      <div className="flex justify-center gap-1.5 px-3 pb-2">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cn("flex touch-manipulation items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors", tab === t.id ? "bg-amber-300/20 text-amber-100 ring-amber-300/50" : "bg-white/5 text-[#C9D1D9] ring-white/10")}>
            <t.icon className="size-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto px-3 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tab === "gates" && (
          <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.dungeons.map((d) => {
              const ts = data.trophies.filter((t) => t.dungeon === d.id);
              return <GateCard key={d.id} id={d.id as DungeonId} name={d.name} tag={d.tag} blurb={d.blurb} floors={d.floors} record={d.record} got={ts.filter((t) => mine.has(t.id)).length} total={ts.length} onGo={() => (data.char ? onRun(d.id as DungeonId) : setTab("hero"))} />;
            })}
          </div>
        )}

        {tab === "hero" && <HeroPanel data={data} />}

        {tab === "hall" && (
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="rounded-2xl bg-gradient-to-b from-[#2b1d12] to-[#150e09] p-3 ring-1 ring-amber-900/50">
              <h2 className="mb-2 text-center text-sm font-bold text-amber-200">La tua parete dei trofei</h2>
              <Wall trophies={data.trophies} mine={mine} counts={holders} onPick={setPick} />
              <p className="mt-2 text-center text-[11px] text-[#9AA4B2]">
                {mine.size}/{data.trophies.length} trofei · il numero giallo dice quanti cacciatori lo hanno
              </p>
              {pick && (
                <div className="dg-pop mt-3 flex items-center gap-3 rounded-xl bg-black/40 p-2.5 ring-1 ring-white/10">
                  <TrophyArt art={pick.art} color={pick.color} size={56} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{mine.has(pick.id) ? pick.name : "Trofeo misterioso"}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <RarityTag rarity={pick.rarity} />
                      <span className="text-[11px] text-[#9AA4B2]">{holders[pick.id] ?? 0} cacciatori lo hanno</span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#C9D1D9]">{mine.has(pick.id) ? pick.blurb : `Lo droppa ${DEF[pick.enemy as keyof typeof DEF]?.name ?? "un mostro"} nel dungeon ${DUNGEON_LIST.find((d) => d.id === pick.dungeon)?.name}.`}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-2 flex items-center justify-center gap-2 text-sm font-bold text-amber-200">
                <Users className="size-4" /> Sala dei Cacciatori
              </h2>
              {data.hunters.length === 0 && <p className="text-center text-xs text-[#9AA4B2]">Nessuno ha ancora un trofeo. Sii il primo!</p>}
              <div className="space-y-2">
                {data.hunters.map((h, i) => {
                  const set = new Set(h.trophies);
                  const me = h.member_id === memberId;
                  return (
                    <div key={h.member_id} className={cn("rounded-xl bg-white/5 p-2.5 ring-1", me ? "ring-amber-300/50" : "ring-white/10")}>
                      <button type="button" className="flex w-full touch-manipulation items-center gap-2 text-left" onClick={() => setOpen(open === h.member_id ? null : h.member_id)}>
                        <span className="grid size-6 place-items-center rounded-full bg-black/40 text-[11px] font-bold text-amber-200">{i + 1}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                          {h.nickname}
                          {me ? " (tu)" : ""}
                        </span>
                        <span className="flex -space-x-1.5">
                          {h.trophies.slice(0, 6).map((id) => byId[id] && (
                            <span key={id} className="grid size-7 place-items-center rounded-full bg-[#1f1610] ring-1 ring-white/15">
                              <TrophyArt art={byId[id].art} color={byId[id].color} size={22} />
                            </span>
                          ))}
                        </span>
                        <span className="w-10 shrink-0 text-right text-xs font-bold text-amber-300">
                          {h.trophies.length}/{data.trophies.length}
                        </span>
                      </button>
                      {open === h.member_id && (
                        <div className="mt-2 rounded-lg bg-gradient-to-b from-[#2b1d12] to-[#150e09] p-2">
                          <Wall trophies={data.trophies} mine={set} onPick={setPick} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "bag" && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 flex items-center justify-between rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div>
                <div className="text-sm font-bold">Bottino dei sotterranei</div>
                <div className="flex items-center gap-1 text-xs text-[#C9D1D9]">
                  <Coins className="size-3.5 text-amber-300" /> Valore totale: {bagValue} monete
                </div>
              </div>
              <Button size="sm" onClick={onShop} disabled={!bag.length}>
                Vendi al negozio
              </Button>
            </div>
            {!bag.length && <p className="py-10 text-center text-sm text-[#9AA4B2]">Lo zaino è vuoto. Scendi in un dungeon e riporta armature, armi e gemme.</p>}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {bag.map(([id, n]) => {
                const it = items[id];
                return (
                  <div key={id} className="dg-pop flex items-center gap-2 rounded-xl bg-white/5 p-2 ring-1 ring-white/10" style={{ borderLeft: `3px solid ${RC[it.rarity]}` }}>
                    <LootIcon shape={it.shape} color={it.color} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold">{it.name}</div>
                      <div className="text-[11px] text-[#9AA4B2]">
                        ×{n} · {it.value} monete
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
