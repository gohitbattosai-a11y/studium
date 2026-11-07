import { CalendarDays, Settings2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Me } from "@/lib/api/types";
import { DAYS, DAYS_LONG, SLOT_COLORS, dayIndexOf, hourLabel, slotKey, useTimetable, type Slot } from "@/lib/domain/schedule";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Editing {
  day: number;
  hour: number;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6);

function Cell({ slot, now, onClick, tall }: { slot?: Slot; now: boolean; onClick: () => void; tall?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full min-w-0 flex-col justify-center overflow-hidden rounded-md border px-2 text-left transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]",
        tall ? "min-h-14 py-2" : "h-12",
        slot ? "border-transparent" : "border-dashed border-[#30363D] hover:border-[#58A6FF]/50 hover:bg-[#1c2230]",
        now && "ring-1 ring-[#E3B341]/70",
      )}
      style={slot ? { background: `${slot.color}26`, boxShadow: `inset 3px 0 0 ${slot.color}` } : undefined}
    >
      {slot ? (
        <>
          <span className="truncate text-xs font-semibold text-[#F0F6FC]">{slot.subject}</span>
          {slot.room && <span className="truncate text-[10px] text-[#8B949E]">{slot.room}</span>}
        </>
      ) : (
        <span className="text-center text-sm text-[#30363D] transition-colors group-hover:text-[#58A6FF]">+</span>
      )}
    </button>
  );
}

export default function WeekPlanner({ me }: { me: Me }) {
  const { table, setSlot, setRange, clearAll } = useTimetable(me.member_id);
  const todayIdx = dayIndexOf(me.today);
  const [mobileDay, setMobileDay] = useState(todayIdx > 5 ? 0 : todayIdx);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [settings, setSettings] = useState(false);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  const hours = useMemo(() => Array.from({ length: table.to - table.from + 1 }, (_, i) => table.from + i), [table.from, table.to]);
  const nowHour = clock.getHours();
  const isNow = (day: number, hour: number) => day === todayIdx && hour === nowHour;
  const filled = Object.keys(table.slots).length;

  return (
    <section className="mt-3 rounded-xl border border-[#30363D] bg-[#161B22] p-4 md:mt-5 md:p-5" data-testid="week-planner">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-[#8B949E]">
            <CalendarDays className="size-4" />
          </span>
          Orario settimanale
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSettings(true)} data-testid="week-planner-settings">
          <Settings2 /> Ore
        </Button>
      </div>

      <div className="hidden md:block">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: "52px repeat(6, minmax(0, 1fr))" }}>
          <span />
          {DAYS.map((d, i) => (
            <span key={d} className={cn("pb-1 text-center text-xs font-medium", i === todayIdx ? "text-[#E3B341]" : "text-[#8B949E]")}>
              {DAYS_LONG[i]}
            </span>
          ))}
          {hours.map((h) => (
            <div key={h} className="contents">
              <span className="flex items-center justify-end pr-2 font-mono text-[11px] text-[#8B949E]">{hourLabel(h)}</span>
              {DAYS.map((d, i) => (
                <Cell key={d} slot={table.slots[slotKey(i, h)]} now={isNow(i, h)} onClick={() => setEditing({ day: i, hour: h })} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="md:hidden">
        <div className="no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1">
          {DAYS.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => setMobileDay(i)}
              className={cn("shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors", mobileDay === i ? "border-[#58A6FF] bg-[#58A6FF]/15 text-[#F0F6FC]" : "border-[#30363D] text-[#8B949E]")}
            >
              {d}
              {i === todayIdx && <span className="ml-1 text-[#E3B341]">•</span>}
            </button>
          ))}
        </div>
        <ul className="space-y-1.5">
          {hours.map((h) => (
            <li key={h} className="flex items-stretch gap-2">
              <span className="flex w-11 shrink-0 items-center font-mono text-[11px] text-[#8B949E]">{hourLabel(h)}</span>
              <Cell tall slot={table.slots[slotKey(mobileDay, h)]} now={isNow(mobileDay, h)} onClick={() => setEditing({ day: mobileDay, hour: h })} />
            </li>
          ))}
        </ul>
      </div>

      {filled === 0 && <p className="mt-3 text-xs text-[#8B949E]">Tocca una casella per inserire la materia di quell'ora.</p>}

      <SlotDialog
        key={editing ? `${editing.day}-${editing.hour}` : "closed"}
        editing={editing}
        current={editing ? table.slots[slotKey(editing.day, editing.hour)] : undefined}
        known={Object.values(table.slots)}
        onClose={() => setEditing(null)}
        onSave={(days, slot) => {
          if (editing) setSlot(days, editing.hour, slot);
          setEditing(null);
        }}
      />

      <Dialog open={settings} onOpenChange={setSettings}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Ore di scuola</DialogTitle>
            <DialogDescription>Scegli la prima e l'ultima ora da mostrare nell'orario.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-xs text-[#8B949E]">
              Dalle
              <select value={table.from} onChange={(e) => setRange(Number(e.target.value), table.to)} className="h-9 w-full rounded-lg border border-[#30363D] bg-[#0D1117] px-2 text-sm text-[#F0F6FC]">
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {hourLabel(h)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs text-[#8B949E]">
              Alle
              <select value={table.to} onChange={(e) => setRange(table.from, Number(e.target.value))} className="h-9 w-full rounded-lg border border-[#30363D] bg-[#0D1117] px-2 text-sm text-[#F0F6FC]">
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {hourLabel(h)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={clearAll} disabled={filled === 0}>
              <Trash2 /> Svuota orario
            </Button>
            <Button onClick={() => setSettings(false)}>Fatto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function SlotDialog({ editing, current, known, onClose, onSave }: { editing: Editing | null; current?: Slot; known: Slot[]; onClose: () => void; onSave: (days: number[], slot: Slot | null) => void }) {
  const [subject, setSubject] = useState(current?.subject ?? "");
  const [room, setRoom] = useState(current?.room ?? "");
  const [color, setColor] = useState(current?.color ?? SLOT_COLORS[0]);
  const [days, setDays] = useState<number[]>(editing ? [editing.day] : []);
  const names = useMemo(() => Array.from(new Set(known.map((k) => k.subject))), [known]);

  const pick = (value: string) => {
    setSubject(value);
    const match = known.find((k) => k.subject.toLowerCase() === value.trim().toLowerCase());
    if (match) setColor(match.color);
  };

  const toggle = (d: number) => {
    if (editing && d === editing.day) return;
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const save = () => {
    const name = subject.trim();
    if (!name) return;
    onSave(days, { subject: name, color, room: room.trim() });
  };

  return (
    <Dialog open={!!editing} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        {editing && (
          <>
            <DialogHeader>
              <DialogTitle>
                {DAYS_LONG[editing.day]} · {hourLabel(editing.hour)}
              </DialogTitle>
              <DialogDescription>Che materia hai in quest'ora?</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Input value={subject} onChange={(e) => pick(e.target.value)} placeholder="Materia (es. Matematica)" list="week-planner-subjects" maxLength={40} autoFocus data-testid="week-planner-subject" />
                <datalist id="week-planner-subjects">
                  {names.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
                <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Aula o professore (facoltativo)" maxLength={40} />
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Colore">
                {SLOT_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)} aria-label={c} className={cn("size-7 rounded-full border-2 transition-transform", color === c ? "scale-110 border-white" : "border-transparent")} style={{ background: c }} />
                ))}
              </div>
              <div>
                <p className="mb-1.5 text-xs text-[#8B949E]">Ripeti anche in</p>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((d, i) => (
                    <button key={d} type="button" onClick={() => toggle(i)} className={cn("rounded-full border px-2.5 py-1 text-xs transition-colors", days.includes(i) ? "border-[#58A6FF] bg-[#58A6FF]/15 text-[#F0F6FC]" : "border-[#30363D] text-[#8B949E]", i === editing.day && "cursor-default")}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              {current && (
                <Button variant="destructive" onClick={() => onSave(days, null)}>
                  <Trash2 /> Svuota
                </Button>
              )}
              <Button onClick={save} disabled={!subject.trim()} data-testid="week-planner-save">
                Salva
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
