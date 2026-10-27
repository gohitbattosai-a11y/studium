import { useEffect, useRef, useState, type ReactNode } from "react";
import { STAGE_H, STAGE_W } from "@/lib/scratch/engine";
import type { Backdrop, SpriteView, View } from "@/lib/scratch/types";
import { cn } from "@/lib/utils";

const DECO_SPOTS: [number, number, number][] = [
  [6, 10, 26], [24, 62, 20], [41, 22, 30], [58, 74, 24], [72, 14, 22], [88, 52, 28], [14, 84, 22], [50, 48, 18], [80, 86, 24], [92, 20, 20],
];

export const toStage = (clientX: number, clientY: number, rect: DOMRect) => {
  const k = rect.width / STAGE_W;
  return { x: (clientX - rect.left) / k - STAGE_W / 2, y: STAGE_H / 2 - (clientY - rect.top) / k };
};

function SpriteEl({ s, onPointerDown, selected }: { s: SpriteView; onPointerDown?: (e: React.PointerEvent) => void; selected?: boolean }) {
  const box = (48 * s.size) / 100;
  const flip = s.rotation === "lr" && Math.cos(((s.dir - 90) * Math.PI) / 180) < 0 && s.dir !== 90 ? -1 : 1;
  const angle = s.rotation === "all" ? s.dir - 90 : 0;
  return (
    <div
      className={cn("absolute select-none", onPointerDown && "cursor-grab touch-none", selected && "outline outline-2 outline-dashed outline-[#58A6FF]")}
      style={{
        width: box,
        height: box,
        left: STAGE_W / 2 + s.x - box / 2,
        top: STAGE_H / 2 - s.y - box / 2,
        zIndex: s.z,
        opacity: s.opacity / 100,
        display: s.visible ? "block" : "none",
      }}
      onPointerDown={onPointerDown}
    >
      <div className="grid size-full place-items-center leading-none" style={{ fontSize: box * 0.82, transform: `rotate(${angle}deg) scaleX(${flip})` }}>
        {s.emoji}
      </div>
      {s.say && (
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 w-max max-w-[180px] -translate-x-1/2 rounded-xl border border-black/20 bg-white px-2 py-1 text-center text-[13px] font-medium leading-tight text-black shadow">
          {s.say}
        </div>
      )}
    </div>
  );
}

export default function StageView({
  view,
  backdrops,
  className,
  onPointer,
  onClick,
  onSpriteDrag,
  selectedId,
  children,
}: {
  view: View;
  backdrops: Backdrop[];
  className?: string;
  onPointer?: (x: number, y: number, down: boolean) => void;
  onClick?: (x: number, y: number) => void;
  onSpriteDrag?: (defId: string, x: number, y: number) => void;
  selectedId?: string;
  children?: ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const drag = useRef<{ defId: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / STAGE_W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bd = backdrops[Math.min(view.backdrop, backdrops.length - 1)] ?? backdrops[0];

  const rect = () => outer.current!.getBoundingClientRect();

  const startDrag = (s: SpriteView) => (e: React.PointerEvent) => {
    if (!onSpriteDrag) return;
    e.stopPropagation();
    const p = toStage(e.clientX, e.clientY, rect());
    drag.current = { defId: s.defId, dx: s.x - p.x, dy: s.y - p.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onSpriteDrag(s.defId, Math.round(s.x), Math.round(s.y));
  };

  return (
    <div
      ref={outer}
      className={cn("relative w-full touch-none overflow-hidden rounded-lg border border-[#30363D]", className)}
      style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
      onPointerMove={(e) => {
        const p = toStage(e.clientX, e.clientY, rect());
        if (drag.current && onSpriteDrag) {
          onSpriteDrag(drag.current.defId, Math.round(Math.max(-STAGE_W / 2, Math.min(STAGE_W / 2, p.x + drag.current.dx))), Math.round(Math.max(-STAGE_H / 2, Math.min(STAGE_H / 2, p.y + drag.current.dy))));
          return;
        }
        onPointer?.(p.x, p.y, e.buttons > 0);
      }}
      onPointerDown={(e) => {
        const p = toStage(e.clientX, e.clientY, rect());
        onPointer?.(p.x, p.y, true);
        onClick?.(p.x, p.y);
      }}
      onPointerUp={(e) => {
        drag.current = null;
        const p = toStage(e.clientX, e.clientY, rect());
        onPointer?.(p.x, p.y, false);
      }}
      onPointerLeave={() => {
        drag.current = null;
      }}
    >
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, background: bd ? `linear-gradient(160deg, ${bd.from}, ${bd.to})` : "#0D1117" }}>
        {bd?.deco &&
          DECO_SPOTS.map(([l, t, size], i) => (
            <span key={i} className="pointer-events-none absolute select-none opacity-30" style={{ left: `${l}%`, top: `${t}%`, fontSize: size }}>
              {bd.deco}
            </span>
          ))}
        {view.sprites.map((s) => (
          <SpriteEl key={s.key} s={s} onPointerDown={onSpriteDrag ? startDrag(s) : undefined} selected={selectedId === s.defId && !s.clone} />
        ))}
        {view.vars.length > 0 && (
          <div className="pointer-events-none absolute left-2 top-2 z-[1000] flex flex-col gap-1">
            {view.vars.map((v) => (
              <span key={v.name} className="flex w-max items-center gap-1.5 rounded bg-[#FF8C1A] px-1.5 py-0.5 text-[12px] font-semibold text-white shadow">
                {v.name}
                <span className="rounded-sm bg-black/25 px-1 tabular-nums">{v.value}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
