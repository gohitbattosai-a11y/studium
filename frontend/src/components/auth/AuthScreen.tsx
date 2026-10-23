import { useRef, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, BarChart3, BookOpen, FolderOpen, Lock, Megaphone, Sparkles } from "lucide-react";
import { apiPost } from "@/lib/api";
import { beginSession } from "@/lib/session";
import { queryClient } from "@/lib/queryClient";
import { errMsg } from "@/lib/format";
import type { JoinRequest, Me } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark, Segmented } from "@/components/common";

const FEATURES = [
  { icon: BookOpen, title: "Compiti condivisi", text: "Una spunta vale per tutta la classe." },
  { icon: BarChart3, title: "Sondaggi", text: "Voto palese o anonimo, sempre definitivo." },
  { icon: FolderOpen, title: "Materiali", text: "Cartelle per materia: link, appunti, PDF." },
  { icon: Megaphone, title: "Bacheca", text: "Avvisi trasparenti, visibili a tutti." },
];

export default function AuthScreen({ onJoined }: { onJoined: () => void }) {
  const [mode, setMode] = useState<JoinRequest["mode"]>("join");
  const [groupName, setGroupName] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const nickRef = useRef<HTMLInputElement>(null);

  const join = useMutation({
    mutationFn: (body: JoinRequest) => apiPost<Me>("/auth/join", body),
    onSuccess: (me) => {
      beginSession();
      queryClient.setQueryData(["me"], me);
      onJoined(); // re-render the parent so its ["me"] observer re-attaches to the fresh cache entry
    },
    onError: (e) => setError(errMsg(e)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{4,6}$/.test(pin)) {
      setError("Il PIN personale deve avere da 4 a 6 cifre");
      return;
    }
    join.mutate({ mode, group_name: groupName.trim(), group_password: password, nickname: nickname.trim(), pin });
  };

  const fillDemo = () => {
    setMode("join");
    setGroupName("3°B Liceo");
    setPassword("1234");
    setError(null);
    nickRef.current?.focus();
  };

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,rgba(56,139,253,0.10),transparent_60%)]">
      <div className="mx-auto grid min-h-dvh max-w-6xl grid-cols-1 gap-10 px-5 py-10 md:grid-cols-12 md:items-center md:px-10">
        {/* Brand / pitch */}
        <section className="md:col-span-6 lg:col-span-7" data-testid="auth-intro">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-lg font-semibold tracking-tight">Studium</span>
          </div>
          <h1 className="mt-8 max-w-lg text-[32px] font-semibold leading-[1.1] tracking-tight md:text-5xl">
            L'agenda condivisa
            <br />
            <span className="text-[#8B949E]">della tua classe.</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#8B949E]">
            Un gruppo protetto da password, un nickname per ognuno. Compiti, sondaggi, materiali e avvisi restano visibili a tutti: niente si cancella, tutto è trasparente.
          </p>
          <div className="mt-8 hidden max-w-lg grid-cols-2 gap-3 md:grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-lg border border-[#30363D] bg-[#161B22]/70 p-4">
                <f.icon className="size-4 text-[#58A6FF]" />
                <p className="mt-3 text-sm font-medium">{f.title}</p>
                <p className="mt-0.5 text-[13px] text-[#8B949E]">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Form */}
        <section className="md:col-span-6 lg:col-span-5">
          <button
            type="button"
            onClick={fillDemo}
            data-testid="demo-login-button"
            className="group mb-4 flex w-full items-center gap-3 rounded-lg border border-[#30363D] bg-[#161B22] px-4 py-3 text-left transition-colors duration-150 hover:border-[#58A6FF]/40 hover:bg-[#1C2128]"
          >
            <span className="grid size-9 place-items-center rounded-md bg-[#3FB950]/12 text-[#7EE787]">
              <Sparkles className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Prova il gruppo demo «3°B Liceo»</span>
              <span className="block text-[13px] text-[#8B949E]">Compila gruppo e password, scegli solo il tuo nickname</span>
            </span>
            <ArrowRight className="size-4 text-[#8B949E] transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>

          <form onSubmit={submit} className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 md:p-6" data-testid="auth-form">
            <Segmented
              value={mode}
              onChange={(v) => {
                setMode(v);
                setError(null);
              }}
              testId="auth-mode"
              className="mb-6 w-full"
              options={[
                { value: "join", label: "Entra in un gruppo" },
                { value: "create", label: "Crea gruppo" },
              ]}
            />

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="group-name">Nome del gruppo</Label>
                <Input id="group-name" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="es. 3°B Liceo" required minLength={2} maxLength={60} autoComplete="off" className="h-10" data-testid="auth-group-name-input" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="group-password">Password del gruppo</Label>
                <Input id="group-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "create" ? "Almeno 3 caratteri" : "Chiedila ai compagni"} required minLength={3} className="h-10" data-testid="auth-group-password-input" />
              </div>
              <div className="h-px bg-[#30363D]" />
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3 space-y-1.5">
                  <Label htmlFor="nickname">Il tuo nickname</Label>
                  <Input id="nickname" ref={nickRef} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="es. Giulia" required minLength={2} maxLength={30} autoComplete="off" className="h-10" data-testid="auth-nickname-input" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="pin">PIN personale</Label>
                  <Input id="pin" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="4-6 cifre" required className="h-10 font-mono tracking-widest" data-testid="auth-pin-input" />
                </div>
              </div>
              <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[#8B949E]">
                <Lock className="mt-0.5 size-3.5 shrink-0" />
                Al primo accesso il PIN riserva il tuo nickname nel gruppo: usalo per rientrare da qualsiasi dispositivo.
              </p>
            </div>

            {error && (
              <p className="mt-4 rounded-md border border-[#FF7B72]/30 bg-[#3D1316]/60 px-3 py-2 text-sm text-[#FFA198]" role="alert" data-testid="auth-error">
                {error}
              </p>
            )}

            <Button type="submit" disabled={join.isPending} className="mt-5 h-10 w-full text-sm font-medium" data-testid="login-submit-button">
              {join.isPending ? "Un attimo…" : mode === "create" ? "Crea il gruppo ed entra" : "Entra nel gruppo"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
