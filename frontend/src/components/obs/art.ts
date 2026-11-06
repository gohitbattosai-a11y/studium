export const lcg = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

export const gearPath = (r: number, teeth: number, depth: number) => {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const spans: [number, number][] = [
      [a - step * 0.32, r],
      [a - step * 0.18, r + depth],
      [a + step * 0.18, r + depth],
      [a + step * 0.32, r],
    ];
    spans.forEach(([t, rr]) => pts.push(`${(Math.cos(t) * rr).toFixed(1)},${(Math.sin(t) * rr).toFixed(1)}`));
  }
  return `M${pts.join("L")}Z`;
};

export const starPath = (r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.38;
    pts.push(`${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
};

export const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

export const neighbors = (cell: number) => {
  const r = Math.floor(cell / 3);
  const c = cell % 3;
  const out = [cell];
  if (r > 0) out.push(cell - 3);
  if (r < 2) out.push(cell + 3);
  if (c > 0) out.push(cell - 1);
  if (c < 2) out.push(cell + 1);
  return out;
};
