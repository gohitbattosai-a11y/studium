import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./city.css";

export interface Geo {
  w: number;
  h: number;
  D: number;
  P: number;
  ox: number;
  oy: number;
}

export function useGeo() {
  const ref = useRef<HTMLDivElement>(null);
  const [g, setG] = useState<Geo | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const upd = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const P = Math.round(Math.max(w, h) * 0.7);
      setG({ w, h, D: Math.round(P * 0.55), P, ox: w / 2, oy: h * 0.4 });
    };
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, g };
}

const scale = (g: Geo, z: number) => g.P / (g.P + z);

export function floorPt(g: Geo, u: number, zf: number) {
  const s = scale(g, zf * g.D);
  return { x: g.ox + (u * g.w - g.ox) * s, y: g.oy + (g.h - g.oy) * s, s };
}

export function wallPt(g: Geo, side: "back" | "left" | "right", pos: number, yPct: number) {
  const y = (yPct / 100) * g.h;
  if (side === "back") {
    const s = scale(g, g.D);
    return { x: g.ox + ((pos / 100) * g.w - g.ox) * s, y: g.oy + (y - g.oy) * s, s };
  }
  const s = scale(g, (pos / 100) * g.D);
  return { x: g.ox + ((side === "left" ? 0 : g.w) - g.ox) * s, y: g.oy + (y - g.oy) * s, s };
}

function Plane({ style, children, className }: { style: CSSProperties; children?: ReactNode; className?: string }) {
  return (
    <div className={`absolute overflow-hidden ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

export function Scene3D({ g, back, left, right, floor, ceil, wallBack, wallSide, wallFloor, wallCeil, children }: { g: Geo; back?: ReactNode; left?: ReactNode; right?: ReactNode; floor?: ReactNode; ceil?: ReactNode; wallBack: CSSProperties; wallSide: CSSProperties; wallFloor: CSSProperties; wallCeil: CSSProperties; children?: ReactNode }) {
  const { w, h, D } = g;
  return (
    <div className="absolute inset-0 overflow-hidden bg-black" style={{ perspective: g.P, perspectiveOrigin: `${g.ox}px ${g.oy}px` }}>
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        <Plane style={{ ...wallCeil, left: 0, top: 0, width: w, height: D, transformOrigin: "50% 0", transform: "rotateX(-90deg)" }}>{ceil}</Plane>
        <Plane style={{ ...wallFloor, left: 0, top: h - D, width: w, height: D, transformOrigin: "50% 100%", transform: "rotateX(90deg)" }}>{floor}</Plane>
        <Plane style={{ ...wallSide, left: 0, top: 0, width: D, height: h, transformOrigin: "0 50%", transform: "rotateY(90deg)" }}>{left}</Plane>
        <Plane style={{ ...wallSide, left: w - D, top: 0, width: D, height: h, transformOrigin: "100% 50%", transform: "rotateY(-90deg)" }}>{right}</Plane>
        <Plane style={{ ...wallBack, left: 0, top: 0, width: w, height: h, transform: `translateZ(${-D}px)` }}>{back}</Plane>
      </div>
      <div className="pointer-events-none absolute inset-0">{children}</div>
    </div>
  );
}

export type PlaneId = "back" | "left" | "right" | "floor" | "ceil";

export function planePt(g: Geo, plane: PlaneId, xp: number, yp: number) {
  let wx = 0;
  let wy = 0;
  let z = 0;
  if (plane === "back") {
    wx = (xp / 100) * g.w;
    wy = (yp / 100) * g.h;
    z = g.D;
  } else if (plane === "left") {
    wy = (yp / 100) * g.h;
    z = (xp / 100) * g.D;
  } else if (plane === "right") {
    wx = g.w;
    wy = (yp / 100) * g.h;
    z = ((100 - xp) / 100) * g.D;
  } else if (plane === "floor") {
    wx = (xp / 100) * g.w;
    wy = g.h;
    z = ((100 - yp) / 100) * g.D;
  } else {
    wx = (xp / 100) * g.w;
    z = (yp / 100) * g.D;
  }
  const s = scale(g, z);
  return { x: g.ox + (wx - g.ox) * s, y: g.oy + (wy - g.oy) * s, s };
}

export function quadPts(g: Geo, plane: PlaneId, x: number, y: number, w: number, h: number) {
  return [planePt(g, plane, x, y), planePt(g, plane, x + w, y), planePt(g, plane, x + w, y + h), planePt(g, plane, x, y + h)].map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

export interface HotDef {
  key: string;
  pts: string;
  label: string;
  onClick?: () => void;
  tone?: string;
}

export function Hotspots({ items }: { items: HotDef[] }) {
  return (
    <svg className="absolute inset-0 size-full" aria-hidden={false}>
      {items.map((h) => (
        <polygon
          key={h.key}
          points={h.pts}
          role="button"
          tabIndex={h.onClick ? 0 : -1}
          aria-label={h.label}
          onClick={h.onClick}
          onKeyDown={(e) => {
            if (h.onClick && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              h.onClick();
            }
          }}
          className="ct-hot outline-none"
          style={{ pointerEvents: h.onClick ? "all" : "none", cursor: h.onClick ? "pointer" : "default", ["--tone" as string]: h.tone ?? "#ffffff" }}
        />
      ))}
    </svg>
  );
}
