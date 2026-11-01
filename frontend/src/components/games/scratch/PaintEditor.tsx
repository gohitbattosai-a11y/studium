import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Circle, Eraser, FlipHorizontal2, FlipVertical2, ImagePlus, Minus, PaintBucket, Pencil, Pipette, Redo2, RotateCw, Square, Stamp, Trash2, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isImage } from "./costume";

type Tool = "pencil" | "eraser" | "line" | "rect" | "ellipse" | "fill" | "pick" | "stamp";

const PALETTE = ["#000000", "#ffffff", "#7f7f7f", "#c3c3c3", "#880015", "#ed1c24", "#ff7f27", "#ffc90e", "#fff200", "#22b14c", "#00a2e8", "#3f48cc", "#a349a4", "#b97a57", "#ffaec9", "#99d9ea"];
const STAMPS = ["⭐", "❤️", "🔥", "💧", "🌸", "👀", "👑", "💥", "🍀", "☁️", "🌙", "⚡"];

const TOOLS: { id: Tool; label: string; icon: typeof Pencil }[] = [
  { id: "pencil", label: "Matita", icon: Pencil },
  { id: "eraser", label: "Gomma", icon: Eraser },
  { id: "line", label: "Linea", icon: Minus },
  { id: "rect", label: "Rettangolo", icon: Square },
  { id: "ellipse", label: "Cerchio", icon: Circle },
  { id: "fill", label: "Riempi", icon: PaintBucket },
  { id: "pick", label: "Contagocce", icon: Pipette },
  { id: "stamp", label: "Timbro emoji", icon: Stamp },
];

const toHex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

const hexToRgb = (hex: string): [number, number, number] => {
  const v = hex.replace("#", "");
  return [parseInt(v.slice(0, 2), 16) || 0, parseInt(v.slice(2, 4), 16) || 0, parseInt(v.slice(4, 6), 16) || 0];
};

interface Props {
  title: string;
  initial: string | null;
  width: number;
  height: number;
  maxLength: number;
  bg?: { from: string; to: string };
  canSaveNew?: boolean;
  onSave: (url: string, asNew: boolean) => void;
  onClose: () => void;
}

export default function PaintEditor({ title, initial, width: w, height: h, maxLength, bg, canSaveNew, onSave, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const undoRef = useRef<ImageData[]>([]);
  const redoRef = useRef<ImageData[]>([]);
  const drag = useRef<{ start: { x: number; y: number }; last: { x: number; y: number }; base: ImageData | null } | null>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#ed1c24");
  const [size, setSize] = useState(Math.max(2, Math.round(w / 24)));
  const [filled, setFilled] = useState(false);
  const [stamp, setStamp] = useState(STAMPS[0]);
  const [, bump] = useState(0);

  const ctx = () => canvasRef.current!.getContext("2d", { willReadFrequently: true })!;

  useEffect(() => {
    const c = ctx();
    c.clearRect(0, 0, w, h);
    if (initial && isImage(initial)) {
      const img = new Image();
      img.onload = () => c.drawImage(img, 0, 0, w, h);
      img.src = initial;
    } else if (initial) {
      c.font = `${Math.round(Math.min(w, h) * 0.78)}px serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(initial, w / 2, h / 2 + Math.min(w, h) * 0.04);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pushUndo = () => {
    undoRef.current.push(ctx().getImageData(0, 0, w, h));
    if (undoRef.current.length > 30) undoRef.current.shift();
    redoRef.current = [];
    bump((n) => n + 1);
  };

  const undo = () => {
    const prev = undoRef.current.pop();
    if (!prev) return;
    redoRef.current.push(ctx().getImageData(0, 0, w, h));
    ctx().putImageData(prev, 0, 0);
    bump((n) => n + 1);
  };

  const redo = () => {
    const next = redoRef.current.pop();
    if (!next) return;
    undoRef.current.push(ctx().getImageData(0, 0, w, h));
    ctx().putImageData(next, 0, 0);
    bump((n) => n + 1);
  };

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * w) / r.width, y: ((e.clientY - r.top) * h) / r.height };
  };

  const strokeStyle = (c: CanvasRenderingContext2D) => {
    c.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = size;
    c.lineCap = "round";
    c.lineJoin = "round";
  };

  const segment = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const c = ctx();
    strokeStyle(c);
    c.beginPath();
    if (a.x === b.x && a.y === b.y) {
      c.arc(a.x, a.y, size / 2, 0, Math.PI * 2);
      c.fill();
    } else {
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
      c.stroke();
    }
    c.globalCompositeOperation = "source-over";
  };

  const shape = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const c = ctx();
    strokeStyle(c);
    c.beginPath();
    if (tool === "line") {
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
      c.stroke();
    } else if (tool === "rect") {
      c.rect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
      if (filled) c.fill();
      c.stroke();
    } else {
      c.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
      if (filled) c.fill();
      c.stroke();
    }
  };

  const floodFill = (sx: number, sy: number) => {
    const c = ctx();
    const img = c.getImageData(0, 0, w, h);
    const d = img.data;
    const [fr, fg, fb] = hexToRgb(color);
    const at = (x: number, y: number) => (y * w + x) * 4;
    const i0 = at(sx, sy);
    const tr = d[i0];
    const tg = d[i0 + 1];
    const tb = d[i0 + 2];
    const ta = d[i0 + 3];
    if (ta === 255 && tr === fr && tg === fg && tb === fb) return;
    const near = (i: number) => Math.abs(d[i] - tr) + Math.abs(d[i + 1] - tg) + Math.abs(d[i + 2] - tb) + Math.abs(d[i + 3] - ta) <= 70;
    const seen = new Uint8Array(w * h);
    const stack: number[] = [sx, sy];
    while (stack.length) {
      const y = stack.pop()!;
      const x = stack.pop()!;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const k = y * w + x;
      if (seen[k]) continue;
      seen[k] = 1;
      const i = k * 4;
      if (!near(i)) continue;
      d[i] = fr;
      d[i + 1] = fg;
      d[i + 2] = fb;
      d[i + 3] = 255;
      stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
    }
    c.putImageData(img, 0, 0);
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    canvasRef.current!.setPointerCapture(e.pointerId);
    const p = pos(e);
    const c = ctx();
    if (tool === "pick") {
      const px = c.getImageData(Math.max(0, Math.min(w - 1, Math.floor(p.x))), Math.max(0, Math.min(h - 1, Math.floor(p.y))), 1, 1).data;
      if (px[3] > 0) setColor(toHex(px[0], px[1], px[2]));
      return;
    }
    pushUndo();
    if (tool === "fill") {
      floodFill(Math.max(0, Math.min(w - 1, Math.floor(p.x))), Math.max(0, Math.min(h - 1, Math.floor(p.y))));
      return;
    }
    if (tool === "stamp") {
      c.globalCompositeOperation = "source-over";
      c.font = `${Math.max(14, size * 4)}px serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(stamp, p.x, p.y);
      return;
    }
    const isShape = tool === "line" || tool === "rect" || tool === "ellipse";
    drag.current = { start: p, last: p, base: isShape ? c.getImageData(0, 0, w, h) : null };
    if (!isShape) segment(p, p);
  };

  const onMove = (e: React.PointerEvent) => {
    const dr = drag.current;
    if (!dr) return;
    const p = pos(e);
    if (dr.base) {
      ctx().putImageData(dr.base, 0, 0);
      shape(dr.start, p);
    } else {
      segment(dr.last, p);
    }
    dr.last = p;
  };

  const onUp = () => {
    if (drag.current) {
      drag.current = null;
      ctx().globalCompositeOperation = "source-over";
    }
  };

  const transform = (kind: "h" | "v" | "r") => {
    pushUndo();
    const src = document.createElement("canvas");
    src.width = w;
    src.height = h;
    src.getContext("2d")!.drawImage(canvasRef.current!, 0, 0);
    const c = ctx();
    c.save();
    c.clearRect(0, 0, w, h);
    if (kind === "h") {
      c.translate(w, 0);
      c.scale(-1, 1);
    } else if (kind === "v") {
      c.translate(0, h);
      c.scale(1, -1);
    } else {
      c.translate(w / 2, h / 2);
      c.rotate(w === h ? Math.PI / 2 : Math.PI);
      c.translate(-w / 2, -h / 2);
    }
    c.drawImage(src, 0, 0);
    c.restore();
  };

  const clearAll = () => {
    pushUndo();
    ctx().clearRect(0, 0, w, h);
  };

  const importFile = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      pushUndo();
      const cover = !!bg;
      const k = cover ? Math.max(w / img.width, h / img.height) : Math.min(w / img.width, h / img.height);
      const dw = img.width * k;
      const dh = img.height * k;
      ctx().drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("Immagine non leggibile");
    };
    img.src = url;
  };

  const exportImage = (): string | null => {
    const canvas = canvasRef.current!;
    const png = canvas.toDataURL("image/png");
    if (png.length <= maxLength) return png;
    if (bg) {
      const flat = document.createElement("canvas");
      flat.width = w;
      flat.height = h;
      const f = flat.getContext("2d")!;
      const g = f.createLinearGradient(0, 0, w * 0.35, h);
      g.addColorStop(0, bg.from);
      g.addColorStop(1, bg.to);
      f.fillStyle = g;
      f.fillRect(0, 0, w, h);
      f.drawImage(canvas, 0, 0);
      for (const q of [0.85, 0.7, 0.5, 0.35]) {
        const jpg = flat.toDataURL("image/jpeg", q);
        if (jpg.length <= maxLength) return jpg;
      }
      return null;
    }
    for (const k of [0.75, 0.5]) {
      const small = document.createElement("canvas");
      small.width = Math.round(w * k);
      small.height = Math.round(h * k);
      small.getContext("2d")!.drawImage(canvas, 0, 0, small.width, small.height);
      const url = small.toDataURL("image/png");
      if (url.length <= maxLength) return url;
    }
    return null;
  };

  const save = (asNew: boolean) => {
    const url = exportImage();
    if (!url) {
      toast.error("Il disegno è troppo pesante: semplificalo o usa meno colori");
      return;
    }
    onSave(url, asNew);
  };

  const canUndo = undoRef.current.length > 0;
  const canRedo = redoRef.current.length > 0;

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-2 sm:p-4" data-testid="paint-editor">
      <div className="flex max-h-[98dvh] w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-[#30363D] bg-[#161B22] text-[#E6EDF3]">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#30363D] px-3 py-2">
          <p className="text-sm font-medium">{title}</p>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon-sm" aria-label="Annulla" disabled={!canUndo} onClick={undo}>
              <Undo2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Ripeti" disabled={!canRedo} onClick={redo}>
              <Redo2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Chiudi" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          <div
            className="mx-auto w-full overflow-hidden rounded-lg border border-[#30363D]"
            style={{
              aspectRatio: `${w} / ${h}`,
              maxWidth: w >= h ? 520 : Math.round(360 * (w / h)),
              backgroundImage: bg
                ? `linear-gradient(160deg, ${bg.from}, ${bg.to})`
                : "linear-gradient(45deg,#2a2f37 25%,transparent 25%),linear-gradient(-45deg,#2a2f37 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2a2f37 75%),linear-gradient(-45deg,transparent 75%,#2a2f37 75%)",
              backgroundSize: bg ? undefined : "16px 16px",
              backgroundPosition: bg ? undefined : "0 0,0 8px,8px -8px,-8px 0",
              backgroundColor: bg ? undefined : "#1c2128",
            }}
          >
            <canvas
              ref={canvasRef}
              width={w}
              height={h}
              className="block size-full touch-none"
              style={{ cursor: tool === "pick" ? "copy" : "crosshair" }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              data-testid="paint-canvas"
            />
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                title={t.label}
                aria-label={t.label}
                onClick={() => setTool(t.id)}
                className={cn("grid h-9 place-items-center rounded-md border transition-colors", tool === t.id ? "border-[#388BFD] bg-[#388BFD]/15 text-[#79B8FF]" : "border-[#30363D] bg-[#0D1117] text-[#8B949E] hover:border-[#8B949E]")}
              >
                <t.icon className="size-4" />
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => {
                  setColor(c);
                  if (tool === "eraser" || tool === "pick") setTool("pencil");
                }}
                className={cn("size-6 rounded-full border-2", color === c ? "border-white" : "border-[#30363D]")}
                style={{ background: c }}
              />
            ))}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="size-7 cursor-pointer rounded border border-[#30363D] bg-transparent p-0" aria-label="Colore personalizzato" />
          </div>

          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-xs text-[#8B949E]">
              Spessore
              <input type="range" min={1} max={Math.round(Math.max(w, h) / 4)} value={size} onChange={(e) => setSize(Number(e.target.value))} className="flex-1 accent-[#388BFD]" />
              <span className="w-6 text-right tabular-nums text-[#E6EDF3]">{size}</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-[#388BFD]" checked={filled} onChange={(e) => setFilled(e.target.checked)} />
              Forme piene
            </label>
          </div>

          {tool === "stamp" && (
            <div className="flex flex-wrap items-center gap-1">
              {STAMPS.map((s) => (
                <button key={s} type="button" onClick={() => setStamp(s)} className={cn("grid size-8 place-items-center rounded border text-lg", stamp === s ? "border-[#388BFD] bg-[#388BFD]/15" : "border-[#30363D] bg-[#0D1117]")}>
                  {s}
                </button>
              ))}
              <Input className="h-8 w-16" maxLength={4} value={stamp} onChange={(e) => setStamp(e.target.value || STAMPS[0])} aria-label="Emoji timbro" />
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" onClick={() => transform("h")}>
              <FlipHorizontal2 /> Specchia
            </Button>
            <Button variant="outline" size="sm" onClick={() => transform("v")}>
              <FlipVertical2 /> Capovolgi
            </Button>
            <Button variant="outline" size="sm" onClick={() => transform("r")}>
              <RotateCw /> Ruota {w === h ? "90°" : "180°"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <ImagePlus /> Importa foto
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Trash2 /> Svuota
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { importFile(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-[#30363D] px-3 py-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Annulla
          </Button>
          {canSaveNew && (
            <Button variant="outline" size="sm" onClick={() => save(true)} data-testid="paint-save-new">
              Salva come nuovo
            </Button>
          )}
          <Button size="sm" onClick={() => save(false)} data-testid="paint-save">
            <Check /> Salva
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
