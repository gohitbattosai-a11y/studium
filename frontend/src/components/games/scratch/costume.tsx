import { cn } from "@/lib/utils/cn";

export const isImage = (value: string) => value.startsWith("data:image/");

export function CostumeGlyph({ value, size, className }: { value: string; size: number; className?: string }) {
  if (isImage(value)) {
    return <img src={value} alt="" draggable={false} className={cn("pointer-events-none select-none object-contain", className)} style={{ width: size, height: size }} />;
  }
  return (
    <span className={cn("select-none leading-none", className)} style={{ fontSize: size * 0.82 }}>
      {value}
    </span>
  );
}
