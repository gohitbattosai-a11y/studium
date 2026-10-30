import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Coins, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BoxInfo, RollResult } from "@/lib/types";
import { BoxArt } from "./BoxArt";
import { PetSprite } from "./PetSprite";
import { PARTICLES, RARITY, TIER } from "./rarity";
import { sfxGachaBurst, sfxGachaCrack, sfxGachaReveal, sfxGachaShake } from "@/lib/sfx";
import "./gacha.css";

type Phase = "shake" | "crack" | "burst" | "reveal";

const SHAKE_MS = 1900;
const CRACK_MS = 650;
const burstMs = (tier: number) => 1250 + tier * 110;

const BASE_COLOR: Record<string, string> = { base: "#7DB7FF", rara: "#FBBF24" };
const CONFETTI_COUNT = [0, 0, 0, 24, 38, 54];
const CONFETTI_COLORS = ["#ffffff", "#fde68a", "#f472b6", "#67e8f9", "#a78bfa"];
const TWINKLES = [
  { x: "-6%", y: "8%", s: 14, d: 0 },
  { x: "96%", y: "16%", s: 11, d: 0.5 },
  { x: "102%", y: "62%", s: 16, d: 1 },
  { x: "-10%", y: "70%", s: 12, d: 1.4 },
  { x: "46%", y: "-4%", s: 10, d: 0.8 },
];

const rng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
};

const particleSet = (n: number, tier: number) => {
  const rnd = rng(987654321);
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 + rnd() * 0.5;
    const dist = 120 + tier * 14 + rnd() * (170 + tier * 20);
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist - 30, rot: (rnd() - 0.5) * 720, size: 5 + rnd() * 9, delay: rnd() * 0.18, tone: i % 3, star: i % 4 === 0 };
  });
};

const confettiSet = (n: number) => {
  const rnd = rng(24680135);
  return Array.from({ length: n }, (_, i) => ({
    left: rnd() * 100,
    w: 6 + rnd() * 6,
    h: 10 + rnd() * 8,
    dur: 3 + rnd() * 2.4,
    delay: 0.15 + rnd() * 1.6,
    sway: (rnd() - 0.5) * 160,
    spin: (rnd() - 0.5) * 1080,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));
};

const motes = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 + (i % 2) * 0.2;
  const r = 190 + (i % 4) * 36;
  return { ax: Math.cos(a) * r, ay: Math.sin(a) * r * 0.8, delay: (i % 8) * 0.17, dur: 1.15 + (i % 3) * 0.2 };
});

function MagicCircle() {
  const ticks = Array.from({ length: 24 }, (_, i) => i);
  const glyphs = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg viewBox="0 0 400 400" className="gc-circle" aria-hidden>
      <g className="gc-circle-a">
        <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="200" cy="200" r="176" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 7" />
        {glyphs.map((i) => (
          <g key={i} transform={`rotate(${i * 30} 200 200)`}>
            <path d="M200 14 v16 M194 22 h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>
        ))}
      </g>
      <g className="gc-circle-b">
        <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <polygon points="200,60 321,270 79,270" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="200,340 79,130 321,130" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        {ticks.map((i) => (
          <line key={i} x1="200" y1="112" x2="200" y2={i % 2 ? 120 : 126} stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 15} 200 200)`} />
        ))}
        <circle cx="200" cy="200" r="34" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="200" cy="200" r="6" fill="currentColor" />
      </g>
    </svg>
  );
}

export default function GachaOpening({ box, result, canAgain, onAgain, onClose }: { box: BoxInfo; result: RollResult | null; canAgain: boolean; onAgain: () => void; onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("shake");
  const [startedAt] = useState(() => Date.now());

  const rarity = result?.rarity ?? "comune";
  const tier = TIER[rarity];
  const color = RARITY[rarity].color;
  const base = BASE_COLOR[box.id] ?? "#7DB7FF";

  useEffect(() => {
    if (!result || phase !== "shake") return;
    const wait = Math.max(0, SHAKE_MS - (Date.now() - startedAt));
    const timer = window.setTimeout(() => setPhase("crack"), wait);
    return () => window.clearTimeout(timer);
  }, [result, phase, startedAt]);

  useEffect(() => {
    if (phase !== "crack") return;
    const timer = window.setTimeout(() => setPhase("burst"), CRACK_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "burst") return;
    const timer = window.setTimeout(() => setPhase("reveal"), burstMs(tier));
    return () => window.clearTimeout(timer);
  }, [phase, tier]);

  const tierRef = useRef(tier);
  useEffect(() => {
    tierRef.current = tier;
  });

  useEffect(() => {
    if (phase === "shake") return sfxGachaShake();
    if (phase === "crack") return sfxGachaCrack();
    if (phase === "burst") return sfxGachaBurst(tierRef.current);
    return sfxGachaReveal(tierRef.current);
  }, [phase]);

  const particles = useMemo(() => particleSet(PARTICLES[rarity], tier), [rarity, tier]);
  const confetti = useMemo(() => confettiSet(CONFETTI_COUNT[tier]), [tier]);
  const tones = [color, "#ffffff", "#fde68a"];
  const tell = result !== null && phase !== "shake";
  const bursting = phase === "burst" || phase === "reveal";

  return (
    <div
      className="gc-stage"
      data-phase={phase}
      data-rarity={rarity}
      data-tier={tier}
      role="dialog"
      aria-modal="true"
      aria-label="Apertura della box"
      style={{ ["--gc-color" as string]: tell ? color : base, ["--gc-base" as string]: base } as CSSProperties}
      data-testid="gacha-stage"
    >
      <div className="gc-aura" />
      <div className="gc-rays" />
      <div className="gc-floor" style={{ color: tell ? color : base }}>
        <MagicCircle />
      </div>
      <div className="gc-pillar" />
      <div className="gc-shock" />
      <div className="gc-shock gc-shock-b" />
      <div className="gc-shock gc-shock-c" />
      <div className="gc-implode" />
      {(phase === "shake" || phase === "crack") &&
        motes.map((m, i) => <span key={i} className="gc-mote" style={{ ["--ax" as string]: `${m.ax}px`, ["--ay" as string]: `${m.ay}px`, ["--delay" as string]: `${m.delay}s`, ["--dur" as string]: `${m.dur}s` } as CSSProperties} />)}
      {phase !== "reveal" && (
        <div className="gc-box" data-testid="gacha-box">
          <BoxArt kind={box.id} className="size-full" />
        </div>
      )}
      {result &&
        bursting &&
        particles.map((p, i) => (
          <span
            key={i}
            className="gc-particle"
            data-shape={p.star ? "star" : "dot"}
            style={{ width: p.size * (p.star ? 1.7 : 1), height: p.size * (p.star ? 1.7 : 1), background: tones[p.tone], boxShadow: p.star ? undefined : `0 0 10px ${color}`, animationDelay: `${p.delay}s`, ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px`, ["--rot" as string]: `${p.rot}deg` } as CSSProperties}
          />
        ))}
      {result &&
        bursting &&
        confetti.map((c, i) => <span key={i} className="gc-confetti" style={{ left: `${c.left}%`, width: c.w, height: c.h, background: c.color, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s`, ["--sway" as string]: `${c.sway}px`, ["--spin" as string]: `${c.spin}deg` } as CSSProperties} />)}
      <div className="gc-flash" />
      <div className="gc-vignette" />

      {phase === "shake" && <p className="gc-hint">Qualcosa si muove là dentro…</p>}
      {phase === "crack" && <p className="gc-hint gc-hint-strong">Ci siamo!</p>}

      {result && phase !== "reveal" && (
        <button type="button" className="gc-skip" onClick={() => setPhase("reveal")} data-testid="gacha-skip">
          Salta
        </button>
      )}

      {phase === "reveal" && result && (
        <div className="gc-frame" data-testid="gacha-reveal">
          <div className="gc-card">
            <div className="gc-twinkles" aria-hidden>
              {tier >= 3 && TWINKLES.map((t, i) => <span key={i} className="gc-twinkle" style={{ left: t.x, top: t.y, width: t.s, height: t.s, animationDelay: `${t.d}s` }} />)}
            </div>
            <p className="gc-label" data-testid="gacha-rarity">
              {RARITY[rarity].label}
            </p>
            <div className="gc-stars" aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <Star key={i} className="gc-star" data-on={i <= tier} style={{ animationDelay: `${0.35 + i * 0.09}s` }} />
              ))}
            </div>
            <div className="gc-podium">
              <div className="gc-podium-glow" />
              <div className="gc-podium-base" />
              <div className="gc-pet">
                <PetSprite id={result.pet_id} state="idle" />
              </div>
            </div>
            <h2 className="gc-name" data-testid="gacha-name">
              {result.name}
            </h2>
            {result.is_new ? (
              <p className="gc-new" data-testid="gacha-new">
                <Sparkles className="size-4" /> Nuovo pet!
              </p>
            ) : (
              <p className="gc-dup" data-testid="gacha-duplicate">
                Doppione (×{result.copies}) · rimborsati <b>{result.refund} punti</b>
              </p>
            )}
            <p className="gc-balance">Saldo: {result.balance} punti</p>
            <div className="gc-actions">
              <Button className="h-10" disabled={!canAgain} onClick={onAgain} data-testid="gacha-again">
                <Coins className="size-4" /> Apri ancora · {box.price} pt
              </Button>
              <Button variant="outline" className="h-10" onClick={onClose} data-testid="gacha-close">
                Chiudi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
