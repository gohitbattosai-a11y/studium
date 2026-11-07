import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { usePush } from "@/lib/runtime/push";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useChangeGroupPassword, useChangePin, useRenameMe } from "@/lib/actions/memberActions";
import type { Me } from "@/lib/api/types";
import { BadgesSection } from "@/components/badges/badges";

const PIN = /^\d{4,6}$/;

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-t border-[#30363D] pt-4 first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-[#8B949E]">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function NameSection({ me }: { me: Me }) {
  const [nickname, setNickname] = useState(me.nickname);
  const [pin, setPin] = useState("");
  const rename = useRenameMe();
  const until = me.next_nickname_change ? new Date(me.next_nickname_change) : null;
  const locked = !!until && until.getTime() > Date.now();
  const clean = nickname.trim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    rename.mutate({ nickname: clean, pin }, { onSuccess: () => setPin("") });
  };

  return (
    <Section
      title="Nome"
      hint={locked && until ? `Prossimo cambio disponibile dal ${until.toLocaleDateString("it-IT", { day: "numeric", month: "long" })}.` : "Puoi cambiarlo una volta a settimana. Punti, acquisti e pet restano tuoi."}
    >
      <form onSubmit={submit} className="space-y-3">
        <Field id="pf-nick" label="Nuovo nome">
          <Input id="pf-nick" value={nickname} onChange={(e) => setNickname(e.target.value)} minLength={2} maxLength={30} disabled={locked} data-testid="profile-nickname-input" />
        </Field>
        <Field id="pf-nick-pin" label="PIN personale">
          <Input id="pf-nick-pin" type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={6} disabled={locked} data-testid="profile-nickname-pin" />
        </Field>
        <Button type="submit" disabled={locked || rename.isPending || clean.length < 2 || clean === me.nickname || !PIN.test(pin)} data-testid="profile-nickname-submit">
          {rename.isPending ? "Salvo…" : "Cambia nome"}
        </Button>
      </form>
    </Section>
  );
}

function PinSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const change = useChangePin();
  const mismatch = again.length > 0 && next !== again;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    change.mutate(
      { current_pin: current, new_pin: next },
      {
        onSuccess: () => {
          setCurrent("");
          setNext("");
          setAgain("");
        },
      },
    );
  };

  return (
    <Section title="PIN personale" hint="Da 4 a 6 cifre. Gli altri dispositivi dovranno rientrare con il nuovo PIN.">
      <form onSubmit={submit} className="space-y-3">
        <Field id="pf-pin-old" label="PIN attuale">
          <Input id="pf-pin-old" type="password" inputMode="numeric" autoComplete="off" value={current} onChange={(e) => setCurrent(e.target.value)} maxLength={6} data-testid="profile-pin-current" />
        </Field>
        <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
          <Field id="pf-pin-new" label="Nuovo PIN">
            <Input id="pf-pin-new" type="password" inputMode="numeric" autoComplete="off" value={next} onChange={(e) => setNext(e.target.value)} maxLength={6} data-testid="profile-pin-new" />
          </Field>
          <Field id="pf-pin-again" label="Ripeti">
            <Input id="pf-pin-again" type="password" inputMode="numeric" autoComplete="off" value={again} onChange={(e) => setAgain(e.target.value)} maxLength={6} aria-invalid={mismatch} data-testid="profile-pin-again" />
          </Field>
        </div>
        {mismatch && <p className="text-xs text-[#FFA198]">I due PIN non coincidono.</p>}
        <Button type="submit" disabled={change.isPending || !PIN.test(current) || !PIN.test(next) || next !== again} data-testid="profile-pin-submit">
          {change.isPending ? "Salvo…" : "Cambia PIN"}
        </Button>
      </form>
    </Section>
  );
}

function GroupPasswordSection() {
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const change = useChangeGroupPassword();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    change.mutate(
      { pin, new_password: password.trim() },
      {
        onSuccess: () => {
          setPin("");
          setPassword("");
        },
      },
    );
  };

  return (
    <Section title="Password del gruppo" hint="Solo tu, che hai creato il gruppo, puoi cambiarla. Chi è già dentro resta dentro.">
      <form onSubmit={submit} className="space-y-3">
        <Field id="pf-group-pw" label="Nuova password">
          <Input id="pf-group-pw" type="text" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} minLength={3} maxLength={100} data-testid="profile-group-password" />
        </Field>
        <Field id="pf-group-pin" label="Il tuo PIN personale">
          <Input id="pf-group-pin" type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={6} data-testid="profile-group-pin" />
        </Field>
        <Button type="submit" disabled={change.isPending || password.trim().length < 3 || !PIN.test(pin)} data-testid="profile-group-submit">
          {change.isPending ? "Salvo…" : "Cambia password del gruppo"}
        </Button>
      </form>
    </Section>
  );
}

function NotificationsSection() {
  const { status, enable, disable } = usePush();
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>, done: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(done);
    } catch {
      toast.error("Impossibile aggiornare le notifiche, riprova");
    } finally {
      setBusy(false);
    }
  };

  const hint =
    status === "unsupported"
      ? "Questo browser non supporta le notifiche. Su iPhone e iPad aggiungi prima Studium alla schermata Home."
      : status === "unavailable"
        ? "Le notifiche non sono ancora attive sul server."
        : status === "denied"
          ? "Le notifiche sono bloccate: abilitale dalle impostazioni del browser per questo sito."
          : "Ricevi compiti, sondaggi, avvisi, materiali e giochi su questo dispositivo, anche ad app chiusa.";

  return (
    <Section title="Notifiche" hint={hint}>
      {status === "on" ? (
        <Button type="button" variant="outline" disabled={busy} onClick={() => void run(disable, "Notifiche disattivate")} data-testid="profile-push-disable">
          Disattiva su questo dispositivo
        </Button>
      ) : (
        <Button type="button" disabled={busy || status === "loading" || status === "unsupported" || status === "unavailable" || status === "denied"} onClick={() => void run(enable, "Notifiche attivate")} data-testid="profile-push-enable">
          Attiva notifiche
        </Button>
      )}
    </Section>
  );
}

export default function ProfileDialog({ me, className, testId, children }: { me: Me; className?: string; testId: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} aria-label="Il tuo profilo" data-testid={testId}>
        {children}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))] max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:w-full max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none sm:max-w-md" data-testid="profile-dialog">
          <DialogHeader>
            <DialogTitle>Il tuo profilo</DialogTitle>
            <DialogDescription>
              Connesso come <b className="text-[#C9D1D9]">{me.nickname}</b> in {me.group_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <BadgesSection nickname={me.nickname} />
            <NotificationsSection />
            <NameSection me={me} />
            <PinSection />
            {me.is_owner && <GroupPasswordSection />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
