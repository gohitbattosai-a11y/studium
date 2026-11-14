import { cityArt, cityInner } from "@/lib/art/cityAssets";

type Place = { x: number; y: number; s: number };

export function Forest3D() {
  return <g dangerouslySetInnerHTML={{ __html: cityInner("landmarks", "forest") }} />;
}

export function Stadium3D() {
  return <g dangerouslySetInnerHTML={{ __html: cityInner("landmarks", "stadium") }} />;
}

export function ForestNight({ x, y, s }: Place) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none" dangerouslySetInnerHTML={{ __html: cityInner("landmarks", "forest-night") }} />;
}

export function StadiumNight({ x, y, s }: Place) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none" dangerouslySetInnerHTML={{ __html: cityInner("landmarks", "stadium-night") }} />;
}

export function StadiumBack() {
  return <span className="absolute inset-0 block [&>svg]:size-full" aria-hidden dangerouslySetInnerHTML={{ __html: cityArt("landmarks", "stadium-back") ?? "" }} />;
}
