import { useId, useMemo } from "react";
import type { AnimalSpecies } from "@/lib/domain/animals";
import { animalSvg } from "./animalSvg";
import "./city.css";
import "./forest.css";

export default function AnimalArt({ a, silhouette, className }: { a: AnimalSpecies; silhouette?: boolean; className?: string }) {
  const uid = useId();
  const markup = useMemo(() => animalSvg(a, !!silhouette, uid), [a, silhouette, uid]);
  return <svg viewBox="0 0 160 120" className={className} aria-hidden dangerouslySetInnerHTML={{ __html: markup }} />;
}
