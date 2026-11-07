import { Brush, Package, Pickaxe, RefreshCw, Shovel, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { COLS, ROWS, START_ENERGY, TOOLS, applyTool, condition, isBroken, isFossilCell, isUncovered, newDig, type Dig as DigState, type Tool } from "@/lib/domain/fossils";
import { FOSSIL_LIMIT, addFossil, getSandbox, useSandbox, type FossilCatch } from "@/lib/runtime/sandbox";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import FossilArt from "./FossilArt";
import FossilBag, { FossilDialog } from "./FossilBag";

const SHADE = ["", "#a37e4f", "#85613a", "#654626"];

const TOOL_ICON = { brush: Brush, shovel: Shovel, pick: Pickaxe };

function Crack() {
  return (
    <svg viewBox="0 0 40 40" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
      <path d="M6 4 L16 18 L10 24 L22 38 M22 12 L34 20 L28 30" fill="none" stroke="#2a1d10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dig() {
  const sb = useSandbox();
  const [dig, setDig] = useState<DigState>(() => newDig());
  const [tool, setTool] = useState<Tool>("shovel");
  const [bag, setBag] = useState(false);
  const [found, setFound] = useState<FossilCatch | null>(null);
  const uncovered = isUncovered(dig);
  const broken = isBroken(dig);
  const exhausted = !uncovered && !broken && dig.energy < TOOLS.brush.cost;
  const over = uncovered || broken || exhausted;
  const cond = condition(dig.integrity);
  const cells = useMemo(() => Array.from({ length: COLS * ROWS }, (_, i) => ({ i, x: i % COLS, y: Math.floor(i / COLS) })), []);

  const act = (x: number, y: number) => {
    if (over) return;
    setDig((d) => applyTool(d, tool, x, y));
  };

  const extract = () => {
    if (getSandbox().fossilBag.length >= FOSSIL_LIMIT) {
      setBag(true);
      return;
    }
    const item = addFossil(dig.sp.id, dig.integrity);
    setDig(newDig());
    setFound(item);
  };

  const restart = () => setDig(newDig());

  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ background: "linear-gradient(180deg, #f2c887 0%, #e0a35f 22%, #8a5d34 22.1%, #4a3018 100%)" }} data-testid="dig-site">
      <svg viewBox="0 0 800 140" preserveAspectRatio="xMidYMax slice" className="pointer-events-none absolute inset-x-0 top-0 h-[22%] w-full" aria-hidden>
        <circle cx="660" cy="46" r="26" fill="#fff4c8" opacity="0.9" />
        <path d="M0 140 V96 L70 70 L120 90 L200 50 L260 84 L340 60 L420 96 L520 64 L600 92 L700 58 L800 90 V140Z" fill="#b97c47" opacity="0.8" />
        <path d="M0 140 V114 L90 96 L170 118 L280 92 L380 120 L500 98 L620 122 L720 100 L800 116 V140Z" fill="#9b6537" />
        <g transform="translate(110 100)">
          <path d="M0 40 L30 -10 L60 40Z" fill="#e8dcc0" stroke="#6b5a3c" strokeWidth="2" />
          <path d="M30 -10 L30 40" stroke="#6b5a3c" strokeWidth="2" />
          <path d="M22 40 L30 20 L38 40Z" fill="#3a2a18" />
        </g>
      </svg>

      <div className="absolute inset-x-0 top-14 z-[2] flex flex-wrap items-center justify-center gap-2 px-3">
        <div className="flex items-center gap-2 rounded-full border border-[#e3b341]/60 bg-[#2a1d0f]/85 px-3 py-1.5 text-xs text-[#fff3c4] shadow-lg backdrop-blur">
          <Zap className="size-3.5 text-[#E3B341]" />
          <span className="font-semibold tabular-nums">{dig.energy}</span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full bg-gradient-to-r from-[#e3b341] to-[#f0883e] transition-[width]" style={{ width: `${(dig.energy / START_ENERGY) * 100}%` }} />
          </div>
        </div>
        <div className="rounded-full border border-white/20 bg-[#2a1d0f]/85 px-3 py-1.5 text-xs shadow-lg backdrop-blur" style={{ color: dig.touched ? cond.color : "#d8cdb6" }}>
          {dig.touched ? `Integrità ${dig.integrity}% · ${cond.label}` : "Qualcosa è sepolto qui sotto…"}
        </div>
      </div>

      <div className="absolute inset-x-0 top-[21%] bottom-[104px] flex items-center justify-center px-3 pt-8">
        <div className="relative aspect-[8/6] w-full rounded-xl border-[8px] border-[#4a3320] bg-[#2b1d10] shadow-2xl" style={{ maxWidth: "min(100%, calc((100dvh - 330px) * 4 / 3), 760px)" }} data-testid="dig-board">
          <div className="absolute inset-0 overflow-hidden rounded-md">
            <div className="absolute" style={{ left: `${(dig.fx / COLS) * 100}%`, top: `${(dig.fy / ROWS) * 100}%`, width: `${(dig.sp.w / COLS) * 100}%`, height: `${(dig.sp.h / ROWS) * 100}%` }}>
              <FossilArt s={dig.sp} className="size-full" />
              {dig.hit.map((h, i) => (
                <div key={i} className="absolute" style={{ left: `${((i % dig.sp.w) / dig.sp.w) * 100}%`, top: `${(Math.floor(i / dig.sp.w) / dig.sp.h) * 100}%`, width: `${100 / dig.sp.w}%`, height: `${100 / dig.sp.h}%` }}>
                  {h && <Crack />}
                </div>
              ))}
            </div>
            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
              {cells.map(({ i, x, y }) => {
                const d = dig.depth[i];
                const clue = d === 1 && isFossilCell(dig, x, y);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={over || d === 0}
                    onClick={() => act(x, y)}
                    className={cn("relative border border-black/25 outline-none transition-[background-color,opacity] duration-150", d === 0 ? "pointer-events-none opacity-0" : "cursor-pointer hover:brightness-110 active:brightness-125")}
                    style={d ? { background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18), transparent 55%), ${SHADE[d]}` } : undefined}
                    aria-label={`Scava ${x + 1},${y + 1}`}
                    data-testid={`dig-cell-${x}-${y}`}
                  >
                    {d > 0 && <span className="pointer-events-none absolute right-1 bottom-0.5 text-[9px] font-bold text-black/30">{d}</span>}
                    {clue && (
                      <span className="pointer-events-none absolute inset-0 grid place-items-center">
                        <span className="size-1/3 rounded-full bg-[#f1e6c9] opacity-80 shadow-[0_0_6px_rgba(255,244,200,0.9)]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[3] flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-3">
        <div className="flex gap-1.5">
          {(Object.keys(TOOLS) as Tool[]).map((t) => {
            const Icon = TOOL_ICON[t];
            return (
              <button key={t} type="button" onClick={() => setTool(t)} className={cn("flex min-w-[68px] flex-col items-center rounded-xl border px-2.5 py-1.5 text-[11px] font-medium transition-colors", tool === t ? "border-[#E3B341] bg-[#E3B341]/20 text-[#fff3c4]" : "border-white/20 bg-black/40 text-[#d8cdb6]")} data-testid={`dig-tool-${t}`}>
                <Icon className="size-5" />
                {TOOLS[t].label}
                <span className="text-[10px] opacity-70">-{TOOLS[t].cost} en.</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-1.5">
          <Button variant="secondary" size="lg" onClick={restart} aria-label="Nuovo scavo">
            <RefreshCw />
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setBag(true)} data-testid="dig-bag">
            <Package /> Zaino ({sb.fossilBag.length})
          </Button>
        </div>
      </div>

      {over && (
        <div className="absolute inset-0 z-[4] grid place-items-center bg-black/55 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl border border-[#e3b341]/60 bg-[#2a1d0f] p-5 text-center shadow-2xl">
            {uncovered && !broken ? (
              <>
                <FossilArt s={dig.sp} bare className="mx-auto max-h-40 w-full max-w-[240px]" />
                <h3 className="mt-3 text-lg font-bold text-[#fff3c4]">{dig.sp.name} scoperto!</h3>
                <p className="mt-1 text-sm" style={{ color: cond.color }}>
                  {cond.label} · {dig.integrity}%
                </p>
                <Button size="lg" className="mt-4 w-full" onClick={extract} data-testid="dig-extract">
                  Estrai il fossile
                </Button>
              </>
            ) : broken ? (
              <>
                <p className="text-4xl">💥</p>
                <h3 className="mt-2 text-lg font-bold text-[#fff3c4]">Il fossile è andato in frantumi</h3>
                <p className="mt-1 text-sm text-[#d8cdb6]">Quando vedi un puntino chiaro, usa il pennello: pala e piccone colpiscono la roccia.</p>
                <Button size="lg" className="mt-4 w-full" onClick={restart}>
                  Nuovo scavo
                </Button>
              </>
            ) : (
              <>
                <p className="text-4xl">😮‍💨</p>
                <h3 className="mt-2 text-lg font-bold text-[#fff3c4]">Energia finita</h3>
                <p className="mt-1 text-sm text-[#d8cdb6]">Il fossile è rimasto sepolto. Prova in un'altra zona.</p>
                <Button size="lg" className="mt-4 w-full" onClick={restart}>
                  Nuovo scavo
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <FossilBag open={bag} onClose={() => setBag(false)} />
      <FossilDialog item={found} onClose={() => setFound(null)} />
    </div>
  );
}
