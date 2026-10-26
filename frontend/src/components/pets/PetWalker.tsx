import type { CSSProperties } from "react";
import { PetSprite } from "./PetSprite";
import "./pets.css";

const DURATION: Record<string, number> = { tartaruga: 16, drago: 8 };

export function PetWalker({ id }: { id: string }) {
  return (
    <div className="pw relative" style={{ "--pw-dur": `${DURATION[id] ?? 11}s` } as CSSProperties} aria-hidden>
      <span className="pw-move">
        <span className="pw-flip">
          <PetSprite id={id} state="walk" className="pw-sprite" />
        </span>
      </span>
    </div>
  );
}
