import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { packArt } from "@/lib/art/stadiumAssets";
import { sfxGachaBurst, sfxGachaCrack, sfxGachaReveal, sfxGachaShake } from "@/lib/audio/sfx";
import { POS_LABEL, STAT_KEYS, STAT_LABEL } from "@/lib/domain/football";
import type { OpenResult, PackInfo, PulledCard } from "@/lib/domain/stadiumApi";
import PlayerCard from "./PlayerCard";
import "./packs.css";

export const RARITY: Record<string, { name: string; color: string; rank: number }> = {
  comune: { name: "Comune", color: "#9ca3af", rank: 0 },
  raro: { name: "Raro", color: "#60a5fa", rank: 2 },
  epico: { name: "Epico", color: "#c084fc", rank: 3 },
  leggendario: { name: "Leggendario", color: "#fbbf24", rank: 4 },
  mitico: { name: "Mitico", color: "#f472b6", rank: 5 },
};

const rar = (id: string) => RARITY[id] ?? RARITY.comune;
type Phase = "idle" | "shake" | "burst" | "reveal" | "summary";

function Sparks({ color, n = 26 }: { color: string; n?: number }) {
  const items = useMemo(() => Array.from({ length: n }, (_, i) => ({ a: (i / n) * Math.PI * 2 + Math.random() * 0.4, d: 90 + Math.random() * 230, s: Math.random() })), [n]);
  return (
    <>
      {items.map((p, i) => (
        <span key={i} className="pk-spark" style={{ ["--pk" as string]: color, ["--dx" as string]: `${Math.cos(p.a) * p.d}px`, ["--dy" as string]: `${Math.sin(p.a) * p.d}px`, animationDelay: `${p.s * 120}ms`, width: 4 + p.s * 8, height: 4 + p.s * 8 }} />
      ))}
    </>
  );
}


const rnd = (n: number, seed = 1) => {
  let x = seed * 9301 + 49297;
  return Array.from({ length: n }, () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  });
};

function Backdrop({ rank, walk }: { rank: number; walk?: boolean }) {
  const n = 12 + rank * 7;
  const embers = useMemo(() => {
    const r = rnd(n * 5, rank + 3);
    return Array.from({ length: n }, (_, i) => ({ x: r[i * 5] * 100, s: 2 + r[i * 5 + 1] * 5, d: 5 + r[i * 5 + 2] * 7, w: -r[i * 5 + 3] * 10, sx: (r[i * 5 + 4] - 0.5) * 160 }));
  }, [n, rank]);
  return (
    <div className="pk-bg" aria-hidden>
      <div className="pk-aurora a" />
      <div className="pk-aurora b" />
      {rank >= 2 && <div className="pk-god" />}
      {rank >= 3 && <div className="pk-grid" />}
      {rank >= 4 && <div className="pk-prism" />}
      {rank >= 5 && (
        <>
          <div className="pk-bolt" style={{ left: "14%", animationDelay: "0s" }} />
          <div className="pk-bolt" style={{ left: "52%", animationDelay: "0.9s" }} />
          <div className="pk-bolt" style={{ left: "84%", animationDelay: "1.7s" }} />
        </>
      )}
      {walk && (
        <>
          <div className="pk-spot" style={{ left: "14%", ["--sw" as string]: "-16deg" }} />
          <div className="pk-spot" style={{ left: "70%", ["--sw" as string]: "16deg" }} />
          {[0, 0.6, 1.2, 1.8].map((d) => (
            <div key={d} className="pk-tun" style={{ animationDelay: `${d}s` }} />
          ))}
        </>
      )}
      {embers.map((e, i) => (
        <span key={i} className="pk-ember" style={{ left: `${e.x}%`, width: e.s, height: e.s, animationDuration: `${e.d}s`, animationDelay: `${e.w}s`, ["--sx" as string]: `${e.sx}px` }} />
      ))}
    </div>
  );
}

function Confetti({ color, n = 48 }: { color: string; n?: number }) {
  const items = useMemo(() => {
    const r = rnd(n * 4, 11);
    const pal = [color, "#ffffff", "#fbbf24", color];
    return Array.from({ length: n }, (_, i) => ({ x: r[i * 4] * 100, w: 5 + r[i * 4 + 1] * 6, d: 2.2 + r[i * 4 + 2] * 2.4, c: pal[i % pal.length], del: r[i * 4 + 3] * 1.4 }));
  }, [n, color]);
  return (
    <>
      {items.map((c, i) => (
        <span key={i} className="pk-conf" style={{ left: `${c.x}%`, width: c.w, height: c.w * 1.6, background: c.c, animationDuration: `${c.d}s`, animationDelay: `${c.del}s` }} />
      ))}
    </>
  );
}

const flag = (code?: string) => (code && /^[A-Za-z]{2}$/.test(code) ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))) : "");

interface WStep {
  k: string;
  label: string;
  value: string;
  color: string;
  ms: number;
  icon?: string;
}

function walkSteps(card: PulledCard): WStep[] {
  const r = rar(card.rarity);
  const p = card.player;
  const hot = r.rank >= 4;
  const out: WStep[] = [];
  if (p.nation) out.push({ k: "nat", label: "Nazionalità", value: p.nation.toUpperCase(), icon: flag(p.nation), color: "#ffffff", ms: 1500 });
  if (p.league) out.push({ k: "lg", label: "Campionato", value: p.league, color: "#93c5fd", ms: 1400 });
  if (p.club) out.push({ k: "club", label: "Club", value: p.club, color: "#ffffff", ms: 1600 });
  out.push({ k: "pos", label: "Ruolo", value: POS_LABEL[p.pos], color: "#ffffff", ms: 1400 });
  out.push({ k: "rar", label: card.exclusive ? "Giocatore esclusivo" : "Rarità", value: r.name, color: r.color, ms: hot ? 2000 : 1500 });
  return out;
}

function Counter({ to, color, onDone }: { to: number; color: string; onDone: () => void }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const dur = 1600 + to * 18;
    const t0 = performance.now();
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      const x = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - x, 3.2);
      const n = Math.round(e * to);
      if (n !== last) {
        last = n;
        setV(n);
      }
      if (x < 1) raf = requestAnimationFrame(tick);
      else onDone();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <div className="pk-ovr pk-count" style={{ color, textShadow: `0 0 ${12 + v / 3}px ${color}` }}>
      {v}
    </div>
  );
}

type WPhase = "dark" | "steps" | "ovr" | "pot" | "name" | "done";

function Walkout({ card, onDone }: { card: PulledCard; onDone: () => void }) {
  const r = rar(card.rarity);
  const steps = useMemo(() => walkSteps(card), [card]);
  const lines = useMemo(() => {
    const parts = card.player.name.trim().toUpperCase().split(/\s+/);
    return parts.length > 1 ? [[...parts[0]], [...parts.slice(1).join(" ")]] : [[...parts[0]]];
  }, [card]);
  const [phase, setPhase] = useState<WPhase>("dark");
  const [i, setI] = useState(0);
  const [boom, setBoom] = useState(0);
  const hot = r.rank >= 4;

  useEffect(() => {
    if (phase !== "dark") return;
    sfxGachaShake();
    const id = window.setTimeout(() => setPhase("steps"), 1700);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "steps") return;
    const s = steps[i];
    if (!s) {
      setPhase("ovr");
      return;
    }
    sfxGachaReveal(Math.min(5, 1 + i));
    const id = window.setTimeout(() => setI((n) => n + 1), s.ms);
    return () => window.clearTimeout(id);
  }, [phase, i, steps]);

  useEffect(() => {
    if (phase === "pot") {
      sfxGachaReveal(4);
      const id = window.setTimeout(() => setPhase("name"), 1700);
      return () => window.clearTimeout(id);
    }
    if (phase === "name") {
      sfxGachaBurst(r.rank);
      setBoom((n) => n + 1);
      const id = window.setTimeout(() => setPhase("done"), lines.flat().length * 70 + 1500);
      return () => window.clearTimeout(id);
    }
  }, [phase]);

  const cur = phase === "steps" ? steps[i] : null;
  const progress = phase === "dark" ? 0 : phase === "steps" ? (i + 1) / (steps.length + 3) : phase === "ovr" ? (steps.length + 1) / (steps.length + 3) : phase === "pot" ? (steps.length + 2) / (steps.length + 3) : 1;
  const skip = () => (phase === "done" ? onDone() : setPhase("done"));
  return (
    <div className={cn("pk-walk", phase === "ovr" && hot && "pk-quake")} style={{ ["--pk" as string]: r.color }} onClick={skip} data-testid="pack-walkout">
      <div className="pk-vig" />
      {phase !== "dark" && <Backdrop rank={Math.max(2, r.rank)} walk />}
      <div className="pk-beam" />
      {phase !== "dark" && <div className="pk-glow" style={{ opacity: 0.1 + progress * 0.3 }} />}
      {boom > 0 && <div key={boom} className="pk-whiteout" />}
      {boom > 0 && <div className="pk-ring" key={`r${boom}`} />}
      <div className="relative flex w-full max-w-md flex-col items-center gap-5 px-4 text-center">
        {phase === "dark" && (
          <div className="pk-heart">
            <p className="text-[11px] font-bold tracking-[0.5em] text-white/60 uppercase">Walkout</p>
            <div className="pk-pulse" />
          </div>
        )}
        <div className="grid min-h-[220px] place-items-center">
          {cur && (
            <div key={cur.k} className="pk-step">
              <p className="text-[11px] font-bold tracking-[0.4em] text-white/60 uppercase">{cur.label}</p>
              {cur.icon && <p className="pk-flag">{cur.icon}</p>}
              <p className="pk-step-v" style={{ color: cur.color, textShadow: `0 0 28px ${cur.color}` }}>
                {cur.value}
              </p>
            </div>
          )}
          {phase === "ovr" && (
            <div className="flex flex-col items-center">
              <p className="mb-2 text-[11px] font-bold tracking-[0.4em] text-white/60 uppercase">Overall</p>
              <Counter to={card.player.ovr} color={r.color} onDone={() => window.setTimeout(() => setPhase("pot"), 900)} />
              <p className="mt-1 text-sm font-bold tracking-widest text-white/80">{card.player.pos}</p>
            </div>
          )}
          {(phase === "pot" || phase === "name" || phase === "done") && (
            <div className="flex flex-col items-center">
              <div className="pk-ovr" style={{ color: r.color, textShadow: `0 0 30px ${r.color}` }}>
                {card.player.ovr}
              </div>
              <p className="pk-step mt-2 text-sm font-bold tracking-widest text-[#E3B341] uppercase">Potenziale {card.player.pot}</p>
            </div>
          )}
        </div>
        <p className="pk-name min-h-[2.4em]">
          {(phase === "name" || phase === "done") &&
            lines.map((line, li) => (
              <span key={li} className="block">
                {line.map((c, k) => (
                  <span key={k} className="pk-letter" style={{ animationDelay: `${(li * 6 + k) * 70}ms` }}>
                    {c === " " ? "\u00A0" : c}
                  </span>
                ))}
              </span>
            ))}
        </p>
        <div className="pk-bar">
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="h-4 text-xs text-white/60">{phase === "done" ? "Tocca per scoprire la carta" : "Tocca per saltare"}</p>
      </div>
      {(phase === "name" || phase === "done") && <Sparks color={r.color} n={hot ? 60 : 36} />}
      {(phase === "name" || phase === "done") && <Confetti color={r.color} n={hot ? 70 : 40} />}
    </div>
  );
}

export default function PackOpening({ pack, run, onClose, onAgain }: { pack: PackInfo; run: () => Promise<OpenResult>; onClose: () => void; onAgain?: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [res, setRes] = useState<OpenResult | null>(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [walk, setWalk] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [err, setErr] = useState(false);
  const started = useRef(false);
  const best = res ? res.cards.reduce((m, c) => Math.max(m, rar(c.rarity).rank), 0) : 0;
  const bestColor = res ? Object.values(RARITY).find((x) => x.rank === best)?.color ?? pack.tone : pack.tone;
  const color = phase === "burst" || phase === "reveal" ? bestColor : pack.tone;

  const begin = () => {
    if (started.current) return;
    started.current = true;
    setPhase("shake");
    sfxGachaShake();
    const min = new Promise((r) => window.setTimeout(r, 2100));
    Promise.all([run(), min])
      .then(([r]) => {
        setRes(r);
        sfxGachaCrack();
        setPhase("burst");
        const top = r.cards.reduce((m, c) => Math.max(m, rar(c.rarity).rank), 0);
        window.setTimeout(() => sfxGachaBurst(top), 120);
        window.setTimeout(() => setPhase("reveal"), 900);
      })
      .catch(() => {
        setErr(true);
        started.current = false;
        setPhase("idle");
      });
  };

  useEffect(() => {
    const kd = (e: KeyboardEvent) => e.key === "Escape" && phase !== "shake" && phase !== "burst" && onClose();
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, [phase, onClose]);

  const cur = res?.cards[idx];
  const next = () => {
    if (!res) return;
    if (idx >= res.cards.length - 1) {
      setPhase("summary");
      return;
    }
    setLeaving(true);
    window.setTimeout(() => {
      setLeaving(false);
      setIdx((i) => i + 1);
    }, 380);
  };

  const tapCard = () => {
    if (!cur || leaving) return;
    if (!flipped[idx]) {
      const r = rar(cur.rarity);
      if (cur.exclusive || r.rank >= 4 || cur.player.ovr >= 85) {
        setWalk(idx);
        return;
      }
      setFlipped((f) => ({ ...f, [idx]: true }));
      sfxGachaReveal(r.rank);
    } else next();
  };

  const skipAll = () => {
    if (!res) return;
    const all: Record<number, boolean> = {};
    res.cards.forEach((_, i) => (all[i] = true));
    setFlipped(all);
    setWalk(null);
    setPhase("summary");
    sfxGachaReveal(best);
  };

  const finishWalk = () => {
    if (walk === null) return;
    setFlipped((f) => ({ ...f, [walk]: true }));
    setWalk(null);
  };

  return createPortal(
    <div className="pk-root" style={{ ["--pk" as string]: color }} data-testid="pack-opening">
      <div className="pk-glow" />
      <div className="pk-rays" />
      {phase === "reveal" && cur && <Backdrop key={idx} rank={rar(cur.rarity).rank} />}
      {phase === "summary" && <Backdrop rank={best} />}
      {phase !== "shake" && phase !== "burst" && (
        <button type="button" onClick={onClose} aria-label="Chiudi" className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-20 grid size-10 place-items-center rounded-full border border-white/20 bg-black/60">
          <X className="size-5" />
        </button>
      )}
      {phase === "reveal" && res && (
        <button type="button" onClick={skipAll} className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 z-20 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-semibold">
          Salta tutto
        </button>
      )}

      {(phase === "idle" || phase === "shake") && (
        <div className="relative flex flex-col items-center gap-6">
          <button type="button" onClick={begin} disabled={phase === "shake"} className={cn("pk-pack", phase === "idle" ? "pk-idle" : "pk-charge")} aria-label={`Apri ${pack.name}`} data-testid="pack-tap">
            <span className={cn("block size-full", phase === "shake" && "pk-shake")} dangerouslySetInnerHTML={{ __html: packArt(pack.id) }} />
          </button>
          <div className="text-center">
            <p className="text-lg font-black tracking-wider uppercase">{pack.name}</p>
            <p className="mt-1 text-xs text-white/70">{phase === "idle" ? (err ? "Qualcosa è andato storto: riprova." : `Tocca il pack per aprirlo · ${pack.cards} carte`) : "Si sta aprendo…"}</p>
          </div>
        </div>
      )}

      {phase === "burst" && (
        <>
          <div className="pk-pack pk-tear">
            <span className="block size-full" dangerouslySetInnerHTML={{ __html: packArt(pack.id) }} />
          </div>
          <div className="pk-flash" />
          <div className="pk-pillar" />
          <div className="pk-ring" />
          <div className="pk-ring" style={{ animationDelay: "180ms" }} />
          <Sparks color={bestColor} n={34} />
        </>
      )}

      {phase === "reveal" && res && cur && (
        <div className="relative flex flex-col items-center gap-5">
          <p className="text-xs font-bold tracking-[0.3em] text-white/70 uppercase">
            Carta {idx + 1} di {res.cards.length}
          </p>
          <div className={cn("pk-stage", leaving ? "pk-out" : "pk-in")} key={idx} style={{ ["--pk" as string]: rar(cur.rarity).color }}>
            <div className={cn("pk-halo", flipped[idx] && "on")} />
            {flipped[idx] && <div className="pk-shock" />}
            {flipped[idx] && <Sparks color={rar(cur.rarity).color} n={14 + rar(cur.rarity).rank * 8} />}
            <div className={cn("pk-card", flipped[idx] && "pk-flipped")} onClick={tapCard} role="button" tabIndex={0} aria-label="Gira la carta" onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && tapCard()} data-testid="pack-card">
              <div className={cn("pk-back", rar(cur.rarity).rank >= 3 && "pk-hot")} />
              <div className="pk-face">
                <PlayerCard p={cur.player} size={3.2} color="#2563eb" />
                {rar(cur.rarity).rank >= 2 && <div className="pk-sheen" />}
              </div>
            </div>
          </div>
          <div className="h-12 text-center">
            {flipped[idx] ? (
              <>
                <p className="text-sm font-black tracking-widest uppercase" style={{ color: rar(cur.rarity).color }}>
                  {cur.exclusive ? "Esclusivo · " : ""}
                  {rar(cur.rarity).name}
                </p>
                <p className="text-xs text-white/70">{idx >= res.cards.length - 1 ? "Tocca per vedere il riepilogo" : "Tocca per la prossima carta"}</p>
              </>
            ) : (
              <p className="text-xs text-white/70">Tocca la carta per girarla</p>
            )}
          </div>
        </div>
      )}
      {phase === "reveal" && res && walk !== null && <Walkout card={res.cards[walk]} onDone={finishWalk} />}

      {phase === "summary" && res && (
        <div className="relative flex max-h-full w-full flex-col items-center gap-4 overflow-y-auto px-3 py-16">
          <h2 className="text-xl font-black tracking-wider uppercase">Il tuo bottino</h2>
          <div className="pk-sum">
            {res.cards.map((c, i) => (
              <div key={c.id} className="relative" style={{ animationDelay: `${i * 90}ms`, ["--pk" as string]: rar(c.rarity).color }}>
                {c.exclusive && <span className="pk-new">ESCLUSIVO</span>}
                <PlayerCard p={c.player} size={0.95} color="#2563eb" />
                <p className="mt-1 text-center text-[10px] font-bold uppercase" style={{ color: rar(c.rarity).color }}>
                  {rar(c.rarity).name}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/70">Le carte sono già nella tua rosa (Riserve).</p>
          <div className="flex gap-2">
            {onAgain && (
              <Button size="lg" onClick={onAgain}>
                Apri un altro
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={onClose}>
              Chiudi
            </Button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
