import { SvgArt } from "@/components/art/SvgArt";

export function BoxArt({ kind, className }: { kind: string; className?: string }) {
  return <SvgArt kind="boxes" id={kind} className={className} />;
}
