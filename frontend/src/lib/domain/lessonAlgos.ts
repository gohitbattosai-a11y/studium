export type AlgoId = "add" | "sub" | "mul" | "div" | "pow" | "gcd" | "succ2" | "pred2" | "succ10" | "pred10" | "addZ" | "opp" | "mulZ" | "divZ" | "powZ";

export interface Trace {
  head: string[];
  rows: string[][];
  notes: string[];
  result: string;
  error?: string;
  warn?: string;
}

export interface AlgoConf {
  title: string;
  labels: string[];
  mins: number[];
  maxs: number[];
  defaults: number[];
}

export const fmt = (n: number) => (n < 0 ? `−${Math.abs(n)}` : String(n));

export const ALGOS: Record<AlgoId, AlgoConf> = {
  add: { title: "Addizione  a + b", labels: ["a", "b"], mins: [0, 0], maxs: [40, 40], defaults: [5, 3] },
  sub: { title: "Sottrazione  a − b", labels: ["a", "b"], mins: [0, 0], maxs: [40, 40], defaults: [5, 3] },
  mul: { title: "Moltiplicazione  a · b", labels: ["a", "b"], mins: [0, 0], maxs: [12, 12], defaults: [2, 3] },
  div: { title: "Divisione con resto  a : b", labels: ["a", "b"], mins: [0, 0], maxs: [60, 12], defaults: [7, 3] },
  pow: { title: "Potenza  aᵇ", labels: ["a", "b"], mins: [0, 0], maxs: [9, 6], defaults: [2, 3] },
  gcd: { title: "MCD con l'algoritmo di Euclide", labels: ["a", "b"], mins: [1, 1], maxs: [400, 400], defaults: [315, 42] },
  succ2: { title: "Successore in base due", labels: ["n"], mins: [0], maxs: [255], defaults: [3] },
  pred2: { title: "Precedente in base due", labels: ["n"], mins: [0], maxs: [255], defaults: [4] },
  succ10: { title: "Successore in base dieci", labels: ["n"], mins: [0], maxs: [9999], defaults: [99] },
  pred10: { title: "Precedente in base dieci", labels: ["n"], mins: [0], maxs: [9999], defaults: [100] },
  addZ: { title: "Addizione in ℤ  a + b", labels: ["a", "b"], mins: [-15, -15], maxs: [15, 15], defaults: [-3, 5] },
  opp: { title: "Opposto di n", labels: ["n"], mins: [-15], maxs: [15], defaults: [3] },
  mulZ: { title: "Moltiplicazione in ℤ  a · b", labels: ["a", "b"], mins: [-12, -9], maxs: [12, 9], defaults: [3, -4] },
  divZ: { title: "Divisione in ℤ  a : b", labels: ["a", "b"], mins: [-60, -12], maxs: [60, 12], defaults: [-7, 3] },
  powZ: { title: "Potenza in ℤ  aⁿ", labels: ["a", "n"], mins: [-5, 0], maxs: [5, 6], defaults: [-3, 3] },
};

function digitsTrace(n: number, base: number, up: boolean): Trace {
  let s = n.toString(base).split("");
  let i = s.length - 1;
  const show = () => s.map((d, k) => (k === i ? `[${d}]` : d)).join(" ");
  const rows: string[][] = [[show()]];
  const notes: string[] = ["Si parte dalla cifra più a destra."];
  const top = String(base - 1);
  const limit = 40;
  let guard = 0;
  while (guard++ < limit) {
    const d = s[i];
    if (up) {
      if (d === top) {
        s[i] = "0";
        if (i === 0) {
          s = ["0", ...s];
          notes.push(`Era ${top}: scriviamo 0 e andiamo a sinistra, dove non c'è nulla: pensiamo uno 0.`);
        } else {
          i -= 1;
          notes.push(`Era ${top}: scriviamo 0 e ci spostiamo a sinistra.`);
        }
        rows.push([show()]);
      } else {
        s[i] = String(Number(d) + 1);
        notes.push(`Non era ${top}: la aumentiamo di 1 e l'algoritmo termina.`);
        rows.push([show()]);
        const clean = s.join("").replace(/^0+(?=.)/, "");
        return { head: ["Stringa"], rows, notes, result: `Successore = ${clean}${base === 2 ? "₂" : ""}  (in base dieci: ${parseInt(clean, base)})` };
      }
    } else {
      if (n === 0) {
        s[i] = top;
        if (i === 0) s = ["0", ...s];
        else i -= 1;
        notes.push(`Era 0: scriviamo ${top} e ci spostiamo a sinistra.`);
        rows.push([show()]);
        if (guard >= 4) return { head: ["Stringa"], rows, notes, result: "", error: "L'algoritmo non termina mai: 0 non ha un precedente in ℕ (0, 0 9, 0 99, 0 999, …)." };
        continue;
      }
      if (d === "0") {
        s[i] = top;
        i -= 1;
        notes.push(`Era 0: scriviamo ${top} e ci spostiamo a sinistra.`);
        rows.push([show()]);
      } else {
        s[i] = String(Number(d) - 1);
        notes.push(`Non era 0: la diminuiamo di 1 e l'algoritmo termina.`);
        rows.push([show()]);
        const clean = s.join("").replace(/^0+(?=.)/, "");
        return { head: ["Stringa"], rows, notes, result: `Precedente = ${clean}${base === 2 ? "₂" : ""}  (in base dieci: ${parseInt(clean, base)})` };
      }
    }
  }
  return { head: ["Stringa"], rows, notes, result: "" };
}

export function run(id: AlgoId, v: number[]): Trace {
  const rows: string[][] = [];
  const notes: string[] = [];
  const push = (r: (number | string)[], note: string) => {
    rows.push(r.map((x) => (typeof x === "number" ? fmt(x) : x)));
    notes.push(note);
  };
  if (id === "succ2") return digitsTrace(v[0], 2, true);
  if (id === "pred2") return digitsTrace(v[0], 2, false);
  if (id === "succ10") return digitsTrace(v[0], 10, true);
  if (id === "pred10") return digitsTrace(v[0], 10, false);
  if (id === "add") {
    let [a, b] = v;
    const s0 = a + b;
    push([a, b], `Partiamo con a = ${a} e b = ${b}.`);
    while (!(a === 0 || b === 0)) {
      a -= 1;
      b += 1;
      push([a, b], `Togliamo 1 ad a e lo diamo a b: la somma resta sempre ${s0}.`);
    }
    return { head: ["a", "b"], rows, notes, result: `s = ${a === 0 ? b : a}` };
  }
  if (id === "sub") {
    let [a, b] = v;
    push([a, b], `Partiamo con a = ${a} e b = ${b}.`);
    while (b !== 0) {
      if (a === 0) return { head: ["a", "b"], rows, notes, result: "", error: `Ora a = 0 ma b = ${b} non è zero: servirebbe il precedente di 0, che in ℕ non esiste. Per questo ${v[0]} − ${v[1]} non ha risultato in ℕ.` };
      a -= 1;
      b -= 1;
      push([a, b], "Togliamo 1 sia ad a sia a b: la differenza non cambia.");
    }
    return { head: ["a", "b"], rows, notes, result: `d = ${a}` };
  }
  if (id === "mul") {
    let [a, b] = v;
    let p = 0;
    push([p, a, b], `Partiamo con p = 0, a = ${a}, b = ${b}.`);
    while (!(a === 0 || b === 0)) {
      p += a;
      b -= 1;
      push([p, a, b], `Sommiamo a al prodotto parziale e contiamo un giro in meno.`);
    }
    return { head: ["p", "a", "b"], rows, notes, result: `p = ${p}` };
  }
  if (id === "div") {
    const [a, b] = v;
    let q = 0;
    let r = a;
    push([a, b, q, r], `Partiamo con q = 0 e r = a = ${a}.`);
    if (b === 0) return { head: ["a", "b", "q", "r"], rows, notes, result: "", error: "La condizione 0 ≤ r < 0 non può mai essere vera: l'algoritmo non termina. Dividere per 0 non ha significato." };
    while (r >= b) {
      q += 1;
      r -= b;
      push([a, b, q, r], `Togliamo b dal resto e contiamo un giro in più.`);
    }
    return { head: ["a", "b", "q", "r"], rows, notes, result: `q = ${q},  r = ${r}   →   ${a} = ${b}·${q} + ${r}` };
  }
  if (id === "pow") {
    const a = v[0];
    let b = v[1];
    let p = 1;
    push([a, b, p], "Partiamo con p = 1.");
    while (b !== 0) {
      p *= a;
      b -= 1;
      push([a, b, p], "Moltiplichiamo p per la base e consumiamo un esponente.");
    }
    const warn = a === 0 && v[1] === 0 ? "Attenzione: l'algoritmo termina con 1, ma 0⁰ è volutamente privo di significato: qui prevale la definizione." : undefined;
    return { head: ["a", "b", "p"], rows, notes, result: `p = ${p}`, warn };
  }
  if (id === "gcd") {
    let [a, b] = v;
    push([a, b], `Partiamo con a = ${a} e b = ${b}.`);
    let guard = 0;
    while (a !== b) {
      if (guard++ > 150) return { head: ["a", "b"], rows: rows.slice(0, 12), notes: notes.slice(0, 12), result: "", error: "Servono troppi passaggi: scegli numeri più piccoli oppure più vicini tra loro." };
      if (a > b) {
        a -= b;
        push([a, b], "a è maggiore: sostituiamo a con a − b.");
      } else {
        b -= a;
        push([a, b], "b è maggiore: sostituiamo b con b − a.");
      }
    }
    return { head: ["a", "b"], rows, notes, result: `MCD = ${a}` };
  }
  if (id === "addZ") {
    let [a, b] = v;
    push([a, b], `Partiamo con a = ${fmt(a)} e b = ${fmt(b)}.`);
    if (a < b) {
      [a, b] = [b, a];
      push([a, b], "a < b: scambiamo i due numeri, così l'algoritmo termina sempre.");
    }
    while (!(a === 0 || b === 0)) {
      a -= 1;
      b += 1;
      push([a, b], "Togliamo 1 ad a e lo diamo a b: la somma non cambia.");
    }
    return { head: ["a", "b"], rows, notes, result: `s = ${fmt(a === 0 ? b : a)}` };
  }
  if (id === "opp") {
    let n = v[0];
    let s = 0;
    push([n, s], `Partiamo con n = ${fmt(n)} e s = 0.`);
    while (n !== 0) {
      if (n > 0) {
        n -= 1;
        s -= 1;
        push([n, s], "n è positivo: lo diminuiamo di 1 e portiamo s verso il negativo.");
      } else {
        n += 1;
        s += 1;
        push([n, s], "n è negativo: lo aumentiamo di 1 e portiamo s verso il positivo.");
      }
    }
    return { head: ["n", "s"], rows, notes, result: `opposto di ${fmt(v[0])} = ${fmt(s)}   (${fmt(v[0])} + ${s < 0 ? `(${fmt(s)})` : fmt(s)} = 0)` };
  }
  if (id === "mulZ") {
    const [a, b] = v;
    let p = 0;
    let n = Math.abs(b);
    push([p, n], `Partiamo con p = 0 e n = |b| = ${n}.`);
    while (n !== 0) {
      p += a;
      n -= 1;
      push([p, n], "Sommiamo a e contiamo un giro in meno.");
    }
    if (b < 0) {
      p = -p;
      push([p, n], "b < 0: cambiamo il segno al risultato.");
    }
    return { head: ["p", "n"], rows, notes, result: `p = ${fmt(p)}` };
  }
  if (id === "divZ") {
    const [a, b] = v;
    let q = 0;
    let r = Math.abs(a);
    const n = Math.abs(b);
    push([q, r], `Lavoriamo sui valori assoluti: r = |a| = ${r}, n = |b| = ${n}.`);
    if (b === 0) return { head: ["q", "r"], rows, notes, result: "", error: "Dividere per 0 non ha significato: il ciclo non finirebbe mai." };
    while (r >= n) {
      r -= n;
      q += 1;
      push([q, r], "Togliamo n dal resto e contiamo un giro in più.");
    }
    if (a < 0 && r > 0) {
      r = n - r;
      q += 1;
      push([q, r], "a è negativo e il resto non è nullo: sistemiamo r := n − r e q := q + 1, così il resto resta non negativo.");
    }
    if (a * b < 0) {
      q = -q;
      push([q, r], "I segni di a e b sono diversi: il quoziente diventa negativo.");
    }
    return { head: ["q", "r"], rows, notes, result: `q = ${fmt(q)},  r = ${r}   →   ${fmt(a)} = (${fmt(b)})·(${fmt(q)}) + ${r}` };
  }
  const a = v[0];
  let k = v[1];
  let p = 1;
  push([p, k], "Partiamo con p = 1.");
  while (k !== 0) {
    p *= a;
    k -= 1;
    push([p, k], `Moltiplichiamo p per ${fmt(a)} e consumiamo un esponente.`);
  }
  const warn = a === 0 && v[1] === 0 ? "0⁰ è volutamente privo di significato." : undefined;
  return { head: ["p", "k"], rows, notes, result: `p = ${fmt(p)}`, warn };
}

export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export function factorize(n: number): Map<number, number> {
  const m = new Map<number, number>();
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    while (x % p === 0) {
      m.set(p, (m.get(p) ?? 0) + 1);
      x /= p;
    }
  }
  if (x > 1) m.set(x, (m.get(x) ?? 0) + 1);
  return m;
}

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
export const sup = (n: number) => String(n).split("").map((d) => SUP[Number(d)]).join("");

export function factorString(m: Map<number, number>): string {
  if (m.size === 0) return "1";
  return [...m.entries()].sort((x, y) => x[0] - y[0]).map(([p, e]) => (e === 1 ? String(p) : `${p}${sup(e)}`)).join(" · ");
}
