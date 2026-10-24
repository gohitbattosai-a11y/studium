import { useState, type FormEvent } from "react";
import { Award, ClipboardCheck, Trash2, Users } from "lucide-react";
import { useGroupEvents, useMembers } from "@/lib/queries";
import { gradeToPoints, useShopActions } from "@/lib/shopActions";
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

  const [gradeMember, setGradeMember] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [bonusMember, setBonusMember] = useState("");
  const [bonusPoints, setBonusPoints] = useState("");
  const [bonusReason, setBonusReason] = useState("");

  const all = members.data ?? [];
  const participants = all.filter((m) => m.participating);
  const g = Number(grade.replace(",", "."));
  const gradeValid = grade.trim() !== "" && Number.isFinite(g) && g >= 1 && g <= 10;
  const bonusValue = Number(bonusPoints);
  const bonusValid = Number.isInteger(bonusValue) && bonusValue !== 0 && Math.abs(bonusValue) <= 50;

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
      <Panel title="Inserisci un voto" hint="Un voto da 1 a 10 vale altrettanti punti, senza decimali." testId="admin-grade-panel">
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
                    <b className="text-[#F0F6FC]">{gradeToPoints(g)} punti</b>
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

      <Panel title="Ruoli" hint="Gli admin inseriscono i voti e gestiscono i ruoli." testId="admin-roles-panel" action={<Users className="size-4 text-[#8B949E]" />}>
        <ul className="space-y-2">
          {all.map((m) => (
            <li key={m.member_id} className="flex items-center gap-3">
              <Avatar name={m.nickname} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm">
                {m.nickname}
                {m.nickname === me.nickname && <span className="ml-1.5 text-xs text-[#8B949E]">(tu)</span>}
              </span>
              {m.role === "admin" && <RoleBadge />}
              <Button
                variant="outline"
                size="sm"
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
