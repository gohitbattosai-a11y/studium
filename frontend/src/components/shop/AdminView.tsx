import { useState, type FormEvent } from "react";
import { Award, ClipboardCheck, Gift, Trash2, Users } from "lucide-react";
import { useGroupEvents, useMembers, usePets, usePointsTable, useShop } from "@/lib/queries";
import { useShopActions } from "@/lib/shopActions";
import { relTime } from "@/lib/format";
import type { Me } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, EmptyState } from "@/components/common";
import { Field, NativeSelect, Panel, RoleBadge } from "./ui";

export default function AdminView({ me }: { me: Me }) {
  const members = useMembers();
  const events = useGroupEvents(true);
  const actions = useShopActions();
  const table = usePointsTable();
  const shop = useShop();
  const pets = usePets(true);

  const [gradeMember, setGradeMember] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [bonusMember, setBonusMember] = useState("");
  const [bonusPoints, setBonusPoints] = useState("");
  const [bonusReason, setBonusReason] = useState("");
  const [giftMember, setGiftMember] = useState("");
  const [giftKind, setGiftKind] = useState<"background" | "decoration" | "pet">("background");
  const [giftItem, setGiftItem] = useState("");

  const all = members.data ?? [];
  const participants = all.filter((m) => m.participating);
  const g = Number(grade.replace(",", "."));
  const rounded = Math.min(10, Math.max(1, Math.floor(g + 0.5)));
  const gradePoints = table.data?.grades.find((r) => r.grade === rounded)?.points ?? 0;
  const gradeValid = grade.trim() !== "" && Number.isFinite(g) && g >= 1 && g <= 10;
  const bonusValue = Number(bonusPoints);
  const bonusValid = Number.isInteger(bonusValue) && bonusValue !== 0 && Math.abs(bonusValue) <= 50;

  const giftOptions =
    giftKind === "pet"
      ? (pets.data?.pets ?? []).map((p) => ({ id: p.id, label: `${p.name} · ${p.rarity.replace("_", " ")}` }))
      : (shop.data?.items ?? []).filter((i) => i.kind === giftKind).map((i) => ({ id: i.id, label: i.window_label ? `${i.name} (${i.window_label})` : i.name }));
  const giftPending = actions.giftItem.isPending || actions.giftPet.isPending;

  const submitGift = (e: FormEvent) => {
    e.preventDefault();
    const onSuccess = () => setGiftItem("");
    if (giftKind === "pet") actions.giftPet.mutate({ member_id: giftMember, pet_id: giftItem }, { onSuccess });
    else actions.giftItem.mutate({ member_id: giftMember, item_id: giftItem }, { onSuccess });
  };

  const submitGrade = (e: FormEvent) => {
    e.preventDefault();
    actions.grade.mutate(
      { member_id: gradeMember, subject: subject.trim(), grade: g },
      {
        onSuccess: () => {
          setSubject("");
          setGrade("");
        },
      },
    );
  };

  const submitBonus = (e: FormEvent) => {
    e.preventDefault();
    actions.bonus.mutate(
      { member_id: bonusMember, points: bonusValue, reason: bonusReason.trim() },
      {
        onSuccess: () => {
          setBonusPoints("");
          setBonusReason("");
        },
      },
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2" data-testid="admin-view">
      <Panel title="Inserisci un voto" hint="Il voto, arrotondato all'intero, diventa punti secondo la tabella." testId="admin-grade-panel">
        {participants.length === 0 ? (
          <p className="text-sm text-[#8B949E]">Nessun compagno partecipa ancora alla classifica.</p>
        ) : (
          <form onSubmit={submitGrade} className="space-y-3">
            <Field label="Compagno">
              <NativeSelect value={gradeMember} onChange={(e) => setGradeMember(e.target.value)} data-testid="grade-member">
                <option value="">Scegli…</option>
                {participants.map((m) => (
                  <option key={m.member_id} value={m.member_id}>
                    {m.nickname}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <div className="grid grid-cols-[1fr_7rem] gap-3">
              <Field label="Materia">
                <Input className="h-9" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={40} placeholder="Matematica" data-testid="grade-subject" />
              </Field>
              <Field label="Voto">
                <Input className="h-9" inputMode="decimal" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="8,5" data-testid="grade-value" />
              </Field>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[#8B949E]" data-testid="grade-preview">
                {gradeValid ? (
                  <>
                    <b className="text-[#F0F6FC]">{gradePoints} punti</b>
                    {!Number.isInteger(g) && <> · voto arrotondato a {Math.floor(g + 0.5)}</>}
                  </>
                ) : (
                  "Voto da 1 a 10"
                )}
              </p>
              <Button type="submit" className="h-9" disabled={!gradeMember || !subject.trim() || !gradeValid || actions.grade.isPending} data-testid="grade-submit">
                <ClipboardCheck className="size-4" /> Assegna
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 border-t border-[#30363D] pt-3" data-testid="grade-table">
              {(table.data?.grades ?? []).map((r) => (
                <span key={r.grade} className="rounded border border-[#30363D] bg-[#21262D] px-2 py-0.5 text-xs text-[#C9D1D9]">
                  {r.grade} → {r.points}
                </span>
              ))}
            </div>
          </form>
        )}
      </Panel>

      <Panel title="Bonus o correzione" hint="Aggiungi o togli punti con una motivazione." testId="admin-bonus-panel">
        <form onSubmit={submitBonus} className="space-y-3">
          <Field label="Compagno">
            <NativeSelect value={bonusMember} onChange={(e) => setBonusMember(e.target.value)} data-testid="bonus-member">
              <option value="">Scegli…</option>
              {participants.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.nickname}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <div className="grid grid-cols-[7rem_1fr] gap-3">
            <Field label="Punti">
              <Input className="h-9" inputMode="numeric" value={bonusPoints} onChange={(e) => setBonusPoints(e.target.value)} placeholder="+2 / -1" data-testid="bonus-points" />
            </Field>
            <Field label="Motivo">
              <Input className="h-9" value={bonusReason} onChange={(e) => setBonusReason(e.target.value)} maxLength={80} placeholder="Interrogazione volontaria" data-testid="bonus-reason" />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="h-9" disabled={!bonusMember || !bonusReason.trim() || !bonusValid || actions.bonus.isPending} data-testid="bonus-submit">
              <Award className="size-4" /> Registra
            </Button>
          </div>
        </form>
      </Panel>

      <Panel title="Regala" hint="Consegna sfondi, immagini profilo e pet, anche quelli a tempo limitato." testId="admin-gift-panel" action={<Gift className="size-4 text-[#8B949E]" />}>
        <form onSubmit={submitGift} className="space-y-3">
          <Field label="Compagno">
            <NativeSelect value={giftMember} onChange={(e) => setGiftMember(e.target.value)} data-testid="gift-member">
              <option value="">Scegli…</option>
              {all.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.nickname}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <NativeSelect
                value={giftKind}
                onChange={(e) => {
                  setGiftKind(e.target.value as "background" | "decoration" | "pet");
                  setGiftItem("");
                }}
                data-testid="gift-kind"
              >
                <option value="background">Sfondo</option>
                <option value="decoration">Immagine profilo</option>
                <option value="pet">Pet</option>
              </NativeSelect>
            </Field>
            <Field label="Oggetto">
              <NativeSelect value={giftItem} onChange={(e) => setGiftItem(e.target.value)} data-testid="gift-item">
                <option value="">Scegli…</option>
                {giftOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="h-9" disabled={!giftMember || !giftItem || giftPending} data-testid="gift-submit">
              <Gift className="size-4" /> Regala
            </Button>
          </div>
        </form>
      </Panel>

      <Panel title="Ruoli" hint="Gli admin inseriscono i voti e gestiscono i ruoli." testId="admin-roles-panel" action={<Users className="size-4 text-[#8B949E]" />}>
        <ul className="space-y-2">
          {all.map((m) => (
            <li key={m.member_id} className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Avatar name={m.nickname} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm">
                {m.nickname}
                {m.nickname === me.nickname && <span className="ml-1.5 text-xs text-[#8B949E]">(tu)</span>}
              </span>
              {m.role === "admin" && <RoleBadge />}
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                disabled={actions.setRole.isPending}
                onClick={() => actions.setRole.mutate({ member_id: m.member_id, role: m.role === "admin" ? "member" : "admin" })}
                data-testid={`role-toggle-${m.member_id}`}
              >
                {m.role === "admin" ? "Rimuovi admin" : "Rendi admin"}
              </Button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Ultimi movimenti" testId="admin-events-panel">
        {!events.data || events.data.length === 0 ? (
          <EmptyState icon={<ClipboardCheck className="size-5" />} title="Nessun movimento" hint="I voti inseriti compariranno qui." testId="admin-events-empty" />
        ) : (
          <ul className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {events.data.map((ev) => (
              <li key={ev.id} className="flex items-center gap-3 text-sm" data-testid={`event-${ev.id}`}>
                <span className={cn("w-10 shrink-0 text-right font-semibold tabular-nums", ev.points >= 0 ? "text-[#7EE787]" : "text-[#FFA198]")}>
                  {ev.points > 0 ? "+" : ""}
                  {ev.points}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">
                    <b className="font-medium">{ev.nickname}</b> · {ev.kind === "grade" ? `${ev.subject} ${String(ev.grade).replace(".", ",")}` : ev.reason}
                  </span>
                  <span className="block text-xs text-[#8B949E]">
                    {ev.created_by} · {relTime(ev.created_at)}
                  </span>
                </span>
                <Button variant="ghost" size="icon-sm" aria-label="Annulla movimento" disabled={actions.removeEvent.isPending} onClick={() => actions.removeEvent.mutate(ev.id)} data-testid={`event-delete-${ev.id}`}>
                  <Trash2 className="size-4 text-[#8B949E]" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
