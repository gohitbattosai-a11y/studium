import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BoxInfo, RollResult } from "@/lib/types";
import { BoxArt } from "./BoxArt";
import { PetSprite } from "./PetSprite";
import { PARTICLES, RARITY } from "./rarity";
import "./gacha.css";

type Phase = "shake" | "burst" | "reveal";

const SHAKE_MS = 1900;
const BURST_MS = 1100;

const particleSet = (n: number) => {
  let s = 987654321;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 + rnd() * 0.5;
    const dist = 110 + rnd() * 170;
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, rot: (rnd() - 0.5) * 720, size: 5 + rnd() * 9, delay: rnd() * 0.18, tone: i % 3 };
  });
};

export default function GachaOpening({ box, result, canAgain, onAgain, onClose }: { box: BoxInfo; result: RollResult | null; canAgain: boolean; onAgain: () => void; onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("shake");
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!result || phase !== "shake") return;
    const wait = Math.max(0, SHAKE_MS - (Date.now() - startedAt));
    const timer = window.setTimeout(() => setPhase("burst"), wait);
    return () => window.clearTimeout(timer);
  }, [result, phase, startedAt]);

  useEffect(() => {
    if (phase !== "burst") return;
    const timer = window.setTimeout(() => setPhase("reveal"), BURST_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const rarity = result?.rarity ?? "comune";
  const color = RARITY[rarity].color;
  const particles = useMemo(() => particleSet(PARTICLES[rarity]), [rarity]);
  const tones = [color, "#ffffff", "#fde68a"];

  return (
    <div className="gc-stage" data-phase={phase} data-rarity={rarity} style={{ ["--gc-color" as string]: result ? color : box.id === "rara" ? "#FBBF24" : "#60A5FA" } as CSSProperties} data-testid="gacha-stage">
      <div className="gc-aura" />
      <div className="gc-rays" />
      <div className="gc-shock" />
      {phase !== "reveal" && (
        <div className="gc-box" data-testid="gacha-box">
          <BoxArt kind={box.id} className="size-full" />
        </div>
      )}
      {result &&
        phase !== "shake" &&
        particles.map((p, i) => (
          <span
            key={i}
            className="gc-particle"
            style={{ width: p.size, height: p.size, background: tones[p.tone], boxShadow: `0 0 10px ${color}`, animationDelay: `${p.delay}s`, ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px`, ["--rot" as string]: `${p.rot}deg` } as CSSProperties}
          />
        ))}
      <div className="gc-flash" />

      {phase === "shake" && <p className="absolute bottom-[18%] text-sm tracking-widest text-[#C9D1D9]/80">Qualcosa si muove là dentro…</p>}

      {phase === "reveal" && result && (
        <div className="gc-card relative mx-4 w-full max-w-xs rounded-2xl border-2 bg-[#0D1117]/95 p-6 text-center" style={{ borderColor: color, boxShadow: `0 0 40px ${color}66` }} data-testid="gacha-reveal">
          <p className="gc-label text-xs font-bold uppercase tracking-[0.35em]" data-testid="gacha-rarity">
            {RARITY[rarity].label}
          </p>
          <div className="gc-pet mx-auto my-3 w-44">
            <PetSprite id={result.pet_id} state="idle" />
          </div>
          <h2 className="text-2xl font-semibold" data-testid="gacha-name">
            {result.name}
          </h2>
          {result.is_new ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#238636]/25 px-3 py-1 text-sm font-medium text-[#56D364]" data-testid="gacha-new">
              <Sparkles className="size-4" /> Nuovo pet!
            </p>
          ) : (
            <p className="mt-2 text-sm text-[#8B949E]" data-testid="gacha-duplicate">
              Doppione (×{result.copies}) · rimborsati <b className="text-[#E3B341]">{result.refund} punti</b>
            </p>
          )}
          <p className="mt-1 text-xs text-[#8B949E]">Saldo: {result.balance} punti</p>
          <div className="mt-5 flex flex-col gap-2">
            <Button className="h-10" disabled={!canAgain} onClick={onAgain} data-testid="gacha-again">
              <Coins className="size-4" /> Apri ancora · {box.price} pt
            </Button>
            <Button variant="outline" className="h-10" onClick={onClose} data-testid="gacha-close">
              Chiudi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
