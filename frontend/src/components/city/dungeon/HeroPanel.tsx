import { Coins, Lock, Shield, Sword } from "lucide-react";
import { useMemo, useState } from "react";
import type { Look } from "@/lib/domain/dungeon";
import { useDungeonActions, type DungeonHub, type GearInfo } from "@/lib/domain/dungeonApi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { RarityTag } from "../shared/Bucket";
import { HeroPortrait } from "./dungeonArt";
import { LootIcon } from "./dungeonItems";

const RC: Record<string, string> = { comune: "#9ca3af", non_comune: "#4ade80", raro: "#60a5fa", epico: "#c084fc", leggendario: "#fbbf24" };
const STAT_LABEL: Record<string, string> = { hp: "Vita", atk: "Attacco", armor: "Armatura", crit: "Critico", vamp: "Vampirismo", regen: "Rigenerazione", guard: "Parata", power: "Potere magico", cdr: "Ricarica -" };

const statText = (stats: Record<string, number>) =>
  Object.entries(stats)
    .map(([k, v]) => `+${v} ${STAT_LABEL[k] ?? k}`)
    .join(" · ");

function Swatches({ label, values, value, onPick }: { label: string; values: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-[11px] text-[#9AA4B2]">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <button key={v} type="button" aria-label={`${label} ${v}`} onClick={() => onPick(v)} style={{ background: v }} className={cn("size-7 touch-manipulation rounded-full ring-2 transition-transform active:scale-90", value === v ? "ring-amber-300" : "ring-white/10")} />
        ))}
      </div>
    </div>
  );
}

function LookEditor({ look, looks, onChange }: { look: Look; looks: DungeonHub["looks"]; onChange: (l: Look) => void }) {
  return (
    <div className="space-y-2">
      <Swatches label="Pelle" values={looks.skins} value={look.skin} onPick={(skin) => onChange({ ...look, skin })} />
      <Swatches label="Capelli" values={looks.hairs} value={look.hair} onPick={(hair) => onChange({ ...look, hair })} />
      <Swatches label="Mantello" values={looks.capes} value={look.cape} onPick={(cape) => onChange({ ...look, cape })} />
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0 text-[11px] text-[#9AA4B2]">Stile</span>
        {[0, 1, 2, 3].map((n) => (
          <button key={n} type="button" onClick={() => onChange({ ...look, style: n })} className={cn("size-7 touch-manipulation rounded-lg text-xs font-bold ring-1", look.style === n ? "bg-amber-300/25 text-amber-100 ring-amber-300/60" : "bg-white/5 ring-white/10")}>
            {n + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function Creator({ data }: { data: DungeonHub }) {
  const act = useDungeonActions();
  const [name, setName] = useState("");
  const [cls, setCls] = useState(data.classes[0]?.id ?? "guerriero");
  const [look, setLook] = useState<Look>({ skin: data.looks.skins[0], hair: data.looks.hairs[0], cape: data.looks.capes[0], style: 0 });
  const c = data.classes.find((x) => x.id === cls);
  const abilities = data.abilities.filter((a) => a.cls === cls);
  return (
    <div className="mx-auto max-w-2xl space-y-3" data-testid="hero-creator">
      <div className="rounded-2xl bg-gradient-to-b from-[#2b1d12] to-[#150e09] p-3 ring-1 ring-amber-900/50">
        <h2 className="text-center text-base font-extrabold text-amber-200">Crea il tuo eroe</h2>
        <div className="mt-3 flex items-center gap-3">
          <div className="grid shrink-0 place-items-center rounded-xl bg-black/40 p-2 ring-1 ring-white/10" style={{ boxShadow: `0 0 24px ${c?.color ?? "#fff"}33` }}>
            <HeroPortrait cls={cls} look={look} size={110} />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <input value={name} maxLength={16} onChange={(e) => setName(e.target.value)} placeholder="Nome dell'eroe" className="w-full rounded-lg bg-black/40 px-3 py-2 text-sm ring-1 ring-white/15 outline-none focus:ring-amber-300/60" data-testid="hero-name" />
            <LookEditor look={look} looks={data.looks} onChange={setLook} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {data.classes.map((k) => (
          <button key={k.id} type="button" onClick={() => setCls(k.id)} style={cls === k.id ? { borderColor: k.color, boxShadow: `0 0 16px ${k.color}44` } : undefined} className={cn("touch-manipulation rounded-xl border-2 bg-white/5 p-2.5 text-left transition-transform active:scale-[0.98]", cls !== k.id && "border-white/10")}>
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="text-xl">{k.icon}</span>
              {k.name}
            </div>
            <p className="mt-1 text-[11px] leading-snug text-[#C9D1D9]">{k.blurb}</p>
            <p className="mt-1 text-[10px] text-[#9AA4B2]">
              Vita {k.hp} · Att +{k.atk} · Crit +{k.crit} · Dadi {k.slots} · {k.weapon_kind}
            </p>
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10">
        <div className="mb-1 text-xs font-bold text-amber-200">Abilità di {c?.name}</div>
        <div className="space-y-1">
          {abilities.map((a) => (
            <div key={a.id} className="flex items-start gap-2 text-[11px]">
              <span className="text-base">{a.icon}</span>
              <span className="min-w-0 flex-1">
                <b>{a.name}</b> <span className="text-[#9AA4B2]">· liv. {a.unlock} · ricarica {a.cd}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <Button size="lg" className="w-full" disabled={name.trim().length < 2 || act.createChar.isPending} onClick={() => act.createChar.mutate({ name: name.trim(), cls, look })} data-testid="hero-create">
        Crea e scendi nei sotterranei
      </Button>
    </div>
  );
}

function GearRow({ g, equipped, money, onEquip, onBuy, busy }: { g: GearInfo; equipped: boolean; money: number; onEquip: () => void; onBuy: () => void; busy: boolean }) {
  const buyable = g.source === "shop" && !g.owned;
  return (
    <div className={cn("flex items-center gap-2 rounded-xl bg-white/5 p-2 ring-1", equipped ? "ring-amber-300/60" : "ring-white/10", !g.usable && !buyable && "opacity-60")} style={{ borderLeft: `3px solid ${RC[g.rarity]}` }}>
      <LootIcon shape={g.shape} color={g.color} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 truncate text-xs font-semibold">
          {g.name}
          <RarityTag rarity={g.rarity} />
        </div>
        <div className="text-[10px] text-emerald-300">{statText(g.stats)}</div>
        <div className="text-[10px] text-[#9AA4B2]">{g.usable ? "Tuo" : g.how}</div>
      </div>
      {equipped ? (
        <span className="text-[11px] font-bold text-amber-300">Equipaggiato</span>
      ) : g.usable ? (
        <Button size="sm" variant="outline" disabled={busy} onClick={onEquip}>
          Equipaggia
        </Button>
      ) : buyable ? (
        <Button size="sm" disabled={busy || money < g.price} onClick={onBuy}>
          <Coins className="size-3.5" /> {g.price}
        </Button>
      ) : (
        <Lock className="size-4 text-white/40" />
      )}
    </div>
  );
}

export default function HeroPanel({ data }: { data: DungeonHub }) {
  const act = useDungeonActions();
  const ch = data.char;
  const [editing, setEditing] = useState(false);
  const [look, setLook] = useState<Look | null>(null);
  const [slot, setSlot] = useState<"weapon" | "armor">("weapon");
  const [confirm, setConfirm] = useState(false);
  const cls = data.classes.find((c) => c.id === ch?.cls);
  const gearList = useMemo(() => {
    if (!ch) return [];
    const order = ["comune", "non_comune", "raro", "epico", "leggendario"];
    return data.gear.filter((g) => g.slot === slot && (!g.classes.length || g.classes.includes(ch.cls))).sort((a, b) => order.indexOf(a.rarity) - order.indexOf(b.rarity));
  }, [data.gear, slot, ch]);
  const abilities = useMemo(() => (ch ? data.abilities.filter((a) => a.cls === ch.cls) : []), [data.abilities, ch]);

  if (!ch) return <Creator data={data} />;

  const chosen = new Set(ch.abilities);
  const toggle = (id: string) => {
    const next = chosen.has(id) ? ch.abilities.filter((x) => x !== id) : [...ch.abilities, id];
    if (next.length > ch.slots || !next.length) return;
    act.setAbilities.mutate(next);
  };
  const pct = ch.xp_next ? Math.min(100, ((ch.xp - ch.xp_base) / (ch.xp_next - ch.xp_base)) * 100) : 100;
  const curLook = look ?? ch.look;

  return (
    <div className="mx-auto max-w-2xl space-y-3" data-testid="hero-panel">
      <div className="rounded-2xl bg-gradient-to-b from-[#2b1d12] to-[#150e09] p-3 ring-1 ring-amber-900/50">
        <div className="flex items-center gap-3">
          <div className="grid shrink-0 place-items-center rounded-xl bg-black/40 p-2 ring-1 ring-white/10" style={{ boxShadow: `0 0 24px ${cls?.color ?? "#fff"}33` }}>
            <HeroPortrait cls={ch.cls} look={curLook} size={96} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-extrabold text-amber-100">{ch.name}</div>
            <div className="text-xs" style={{ color: cls?.color }}>
              {cls?.icon} {cls?.name} · Livello {ch.level}
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-black/50 ring-1 ring-white/10">
              <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-400" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-0.5 text-[10px] text-[#9AA4B2]">{ch.xp_next ? `${ch.xp - ch.xp_base}/${ch.xp_next - ch.xp_base} XP al livello ${ch.level + 1}` : "Livello massimo"}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-amber-200">
              <Coins className="size-3.5" /> {data.money} monete
            </div>
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>
            Aspetto
          </Button>
          {!confirm ? (
            <Button size="sm" variant="ghost" onClick={() => setConfirm(true)}>
              Ricomincia
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => act.resetChar.mutate(undefined, { onSuccess: () => setConfirm(false) })}>
              Conferma: perdi livelli e abilità
            </Button>
          )}
        </div>
        {editing && (
          <div className="dg-pop mt-3 space-y-2 rounded-xl bg-black/30 p-2.5">
            <LookEditor look={curLook} looks={data.looks} onChange={setLook} />
            <Button
              size="sm"
              disabled={!look || act.editChar.isPending}
              onClick={() =>
                look &&
                act.editChar.mutate(
                  { look },
                  {
                    onSuccess: () => {
                      setLook(null);
                      setEditing(false);
                    },
                  },
                )
              }
            >
              Salva aspetto
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-amber-200">Abilità</h3>
          <span className="text-[11px] text-[#9AA4B2]">
            Attive {ch.abilities.length}/{ch.slots} · non si consumano: vanno in ricarica
          </span>
        </div>
        <div className="space-y-1.5">
          {abilities.map((a) => {
            const locked = a.unlock > ch.level;
            const on = chosen.has(a.id);
            return (
              <button key={a.id} type="button" disabled={locked || act.setAbilities.isPending} onClick={() => toggle(a.id)} className={cn("flex w-full touch-manipulation items-start gap-2 rounded-xl p-2 text-left ring-1 transition-colors", on ? "bg-amber-300/15 ring-amber-300/50" : "bg-black/20 ring-white/10", locked && "opacity-45")}>
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-black/40 text-xl">{locked ? <Lock className="size-4" /> : a.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-xs font-bold">
                    {a.name}
                    <span className="rounded-full bg-black/40 px-1.5 text-[10px] font-semibold text-cyan-200">ricarica {a.cd} turni</span>
                  </span>
                  <span className="block text-[11px] leading-snug text-[#C9D1D9]">{a.text}</span>
                  {locked && <span className="text-[10px] text-rose-300">Si sblocca al livello {a.unlock}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
        <div className="mb-2 flex gap-1.5">
          <button type="button" onClick={() => setSlot("weapon")} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1", slot === "weapon" ? "bg-amber-300/20 text-amber-100 ring-amber-300/50" : "bg-white/5 ring-white/10")}>
            <Sword className="size-3.5" /> Armi
          </button>
          <button type="button" onClick={() => setSlot("armor")} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1", slot === "armor" ? "bg-amber-300/20 text-amber-100 ring-amber-300/50" : "bg-white/5 ring-white/10")}>
            <Shield className="size-3.5" /> Armature
          </button>
        </div>
        <div className="space-y-1.5">
          {gearList.map((g) => (
            <GearRow key={g.id} g={g} equipped={(ch.equip[slot] ?? null) === g.id} money={data.money} busy={act.equip.isPending || act.buyGear.isPending} onEquip={() => act.equip.mutate({ slot, gear_id: g.id })} onBuy={() => act.buyGear.mutate(g.id)} />
          ))}
        </div>
        <p className="mt-2 text-[10px] text-[#9AA4B2]">Gli oggetti più forti non si comprano: si sbloccano con trofei e vittorie, oppure si trovano nei sotterranei.</p>
      </div>
    </div>
  );
}
