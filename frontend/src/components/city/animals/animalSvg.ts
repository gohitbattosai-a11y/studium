import type { AnimalSpecies } from "@/lib/domain/animals";

const rgb = (h: string): [number, number, number] => {
  const s = h.replace("#", "");
  const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toHex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;

export const shade = (c: string, f: number) => {
  const [r, g, b] = rgb(c);
  const t = f < 0 ? 0 : 255;
  const p = Math.abs(f);
  return toHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p);
};

interface Ctx {
  u: string;
  c0: string;
  c1: string;
  c2: string;
  sil: boolean;
  body: string;
  belly: string;
  dark: string;
  hi: string;
  lo: string;
}

const P = (d: string, fill: string, extra = "") => `<path d="${d}" fill="${fill}" ${extra}/>`;
const E = (cx: number, cy: number, rx: number, ry: number, fill: string, extra = "") => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const S = (d: string, stroke: string, w: number, op = 1, extra = "") => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" ${extra}/>`;
const clip = (id: string, d: string) => `<clipPath id="${id}"><path d="${d}"/></clipPath>`;

const eye = (c: Ctx, x: number, y: number, r = 2.1, iris = "#2a1a0e") =>
  c.sil
    ? `<circle cx="${x}" cy="${y}" r="${r + 0.6}" fill="#e3b341"/><circle cx="${x}" cy="${y}" r="${r * 0.4}" fill="#3a2a08"/>`
    : `<circle cx="${x}" cy="${y}" r="${r}" fill="${iris}"/><circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="#0a0806"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.32}" fill="#ffffff" opacity="0.95"/>`;

const fur = (c: Ctx, x0: number, x1: number, y0: number, y1: number, n: number, len = 4, op = 0.28) => {
  let out = "";
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * (0.5 + 0.5 * Math.sin(i * 2.3));
    out += `M${x.toFixed(1)} ${y.toFixed(1)} l${(-len * 0.6).toFixed(1)} ${len.toFixed(1)} `;
  }
  return S(out, c.lo, 0.9, op);
};

const ground = (cx = 80, rx = 50) => E(cx, 113, rx, 4, "#000000", 'opacity="0.28"');

const canid = (c: Ctx, o: { tip?: string; snout?: number; ear?: number; bulk?: number; ruff?: boolean; cheek?: boolean; socks?: boolean; stripe?: boolean; eyeCol?: string }) => {
  const sn = o.snout ?? 1;
  const ear = o.ear ?? 1;
  const tailPath = "M42 66 C24 56 4 70 6 98 C12 106 28 102 36 92 C42 84 46 76 44 70Z";
  const torso = "M38 74 C36 56 56 46 82 48 C104 50 120 58 118 74 C116 88 98 93 78 93 C56 93 40 90 38 74Z";
  const eyeCol = o.eyeCol ?? "#e8b23c";
  const noseX = 132 + 22 * sn;
  return `
  <g class="fo-breathe">
    <g class="ct-tail">
      ${clip(`tl${c.u}`, tailPath)}
      ${P(tailPath, c.body)}
      <g clip-path="url(#tl${c.u})">
        ${o.tip ? P("M0 92 C14 90 24 96 34 90 L40 120 L0 120Z", o.tip) : ""}
        ${S("M38 70 C22 70 12 82 12 98", c.lo, 1, 0.3)}${S("M42 74 C30 76 20 86 18 100", c.hi, 1, 0.25)}
      </g>
    </g>
    ${P("M58 80 L55 111 L65 111 L67 82Z", c.dark)}
    ${P("M96 80 L94 111 L104 111 L106 80Z", c.dark)}
    ${P(torso, c.body)}
    ${clip(`to${c.u}`, torso)}
    <g clip-path="url(#to${c.u})">
      ${E(80, 90, 38, 11, c.belly, 'opacity="0.95"')}
      ${E(52, 74, 18, 20, c.hi, 'opacity="0.18"')}
      ${fur(c, 44, 112, 52, 70, 22, 5, 0.3)}
      ${o.stripe ? S("M60 52 C66 66 66 78 62 90 M74 50 C80 64 80 78 76 92 M88 50 C94 62 94 74 92 88", c.lo, 1.2, 0.35) : ""}
    </g>
    ${S("M40 66 C52 56 68 66 64 86", c.lo, 1.1, 0.2)}
    ${P("M45 88 C38 98 43 104 45 111 L57 111 L55 101 C62 95 64 90 62 83Z", c.body)}
    ${o.socks === false ? "" : P("M44 104 C45 107 45 109 45 111 L57 111 L56 104Z", c.c2)}
    ${P("M95 82 C92 96 97 104 97 111 L109 111 L107 99 C112 92 114 86 109 79Z", c.body)}
    ${o.socks === false ? "" : P("M97 104 L97 111 L109 111 L108 104Z", c.c2)}
    ${P("M100 58 C108 44 120 40 128 44 L134 64 C124 76 110 80 100 74Z", c.body)}
    ${o.ruff ? P("M102 66 l-4 8 l8 -3 l-2 10 l8 -6 l3 8 l5 -8 l7 4 l-1 -12Z", c.belly, 'opacity="0.95"') : ""}
    ${P(`M116 42 L112 ${22 - 6 * ear} L128 36Z`, c.c2)}
    ${P(`M126 38 L${130} ${20 - 8 * ear} L140 40Z`, c.body)}
    ${P("M129 37 L131 26 L136 37Z", c.c2, 'opacity="0.75"')}
    ${E(129, 50, 13, 11.5, c.body)}
    ${P(`M136 44 C148 45 ${noseX} 52 ${noseX + 1} 56 C${noseX - 2} 61 144 62 136 62Z`, c.body)}
    ${P(`M134 55 C142 56 ${noseX - 2} 57 ${noseX} 58 C${noseX - 4} 64 142 65 134 63Z`, c.belly)}
    ${o.cheek ? P("M124 56 C130 66 144 66 150 61 L138 57Z", c.belly) : ""}
    ${S(`M138 60 C144 62 ${noseX - 4} 61 ${noseX - 1} 59`, "#1a120c", 0.8, 0.7)}
    ${E(noseX, 55.5, 2.7, 2.1, "#16110e")}
    ${c.sil ? "" : `<path d="M133 49 Q138 45 143 49 Q138 52 133 49Z" fill="${eyeCol}"/><circle cx="138" cy="48.8" r="1.5" fill="#0a0806"/><circle cx="138.6" cy="48.1" r="0.55" fill="#fff"/>${S("M132 47 Q138 43 144 47", c.lo, 1, 0.6)}`}
    ${c.sil ? eye(c, 138, 49, 1.8) : ""}
  </g>`;
};

const lynx = (c: Ctx) => {
  const torso = "M40 76 C38 58 58 50 82 52 C102 54 114 62 112 76 C110 90 96 94 78 94 C58 94 42 90 40 76Z";
  return `
  <g class="fo-breathe">
    ${P("M42 70 C34 70 30 80 34 90 C38 92 44 88 46 80Z", c.c2)}
    ${P("M58 82 L55 111 L66 111 L67 84Z", c.dark)}
    ${P("M98 82 L96 111 L107 111 L108 82Z", c.dark)}
    ${P(torso, c.body)}
    ${clip(`to${c.u}`, torso)}
    <g clip-path="url(#to${c.u})">
      ${E(78, 92, 36, 11, c.belly)}
      ${[[54, 62], [66, 58], [78, 60], [90, 62], [60, 74], [74, 72], [88, 74], [100, 70], [50, 84], [68, 84]].map(([x, y]) => E(x, y, 2.6, 2, c.c2, 'opacity="0.55"')).join("")}
      ${E(52, 76, 17, 19, c.hi, 'opacity="0.16"')}
    </g>
    ${P("M44 88 C37 98 42 105 44 111 L58 111 L56 100 C62 95 64 90 62 84Z", c.body)}
    ${P("M44 104 L44 111 L58 111 L57 104Z", c.c2, 'opacity="0.85"')}
    ${P("M95 84 C92 98 97 105 97 111 L111 111 L108 98 C113 92 114 86 110 80Z", c.body)}
    ${P("M97 104 L97 111 L111 111 L109 104Z", c.c2, 'opacity="0.85"')}
    ${P("M98 62 C104 46 118 42 126 46 L132 68 C122 80 108 82 98 76Z", c.body)}
    ${P("M114 38 L116 14 L128 36Z", c.body)}${P("M117 34 L118 20 L125 35Z", c.c2, 'opacity="0.7"')}${S("M116 14 L115 5", c.c2, 2.2)}
    ${P("M124 36 L134 12 L142 40Z", c.body)}${P("M130 36 L134 22 L139 38Z", c.c2, 'opacity="0.7"')}${S("M134 12 L136 3", c.c2, 2.2)}
    ${E(130, 54, 16, 14, c.body)}
    ${P("M118 58 L112 70 L120 66 L118 76 L128 68 L134 74 L140 66 L148 70 L144 58Z", c.belly)}
    ${E(143, 58, 8, 6, c.belly)}
    ${E(150, 56, 2.2, 1.7, "#3a2326")}
    ${S("M146 60 C148 62 151 62 153 60", "#1a120c", 0.8, 0.6)}
    ${S("M140 50 L146 53 M139 53 L146 55", c.c2, 0.9, 0.35)}
    ${c.sil ? eye(c, 140, 50, 1.9) : `<path d="M135 50 Q140 46 145 50 Q140 53 135 50Z" fill="#d9c25a"/><circle cx="140" cy="49.8" r="1.5" fill="#0a0806"/><circle cx="140.6" cy="49.1" r="0.5" fill="#fff"/>${S("M134 48 Q140 44 146 48", c.c2, 1.2, 0.8)}`}
    ${S("M118 52 L124 56 M117 56 L123 59", c.c2, 0.9, 0.4)}
  </g>`;
};

const badger = (c: Ctx) => {
  const torso = "M34 84 C32 66 52 58 78 60 C102 62 116 70 114 84 C112 98 98 100 76 100 C54 100 36 98 34 84Z";
  return `
  <g class="fo-breathe">
    ${P("M34 78 C26 78 22 86 26 92 C30 94 36 90 38 86Z", c.body)}
    ${P("M54 92 L52 111 L64 111 L64 94Z", c.dark)}
    ${P("M96 92 L94 111 L106 111 L106 94Z", c.dark)}
    ${P(torso, c.body)}
    ${clip(`to${c.u}`, torso)}
    <g clip-path="url(#to${c.u})">
      ${fur(c, 38, 112, 62, 80, 30, 5, 0.35)}
      ${fur(c, 38, 112, 82, 96, 24, 5, 0.25)}
      ${P("M30 82 C60 70 90 70 120 80 L120 104 L30 104Z", c.hi, 'opacity="0.1"')}
    </g>
    ${P("M44 96 L42 111 L58 111 L58 98Z", c.c2)}${P("M92 96 L90 111 L108 111 L108 98Z", c.c2)}
    ${S("M45 108 l2 3 M50 108 l1 3 M55 108 l0 3 M93 108 l2 3 M98 108 l1 3 M103 108 l0 3", "#e8e2d0", 1, 0.7)}
    ${P("M98 66 C104 56 118 56 126 62 L150 76 C152 80 148 84 140 84 L116 88 C106 86 98 80 98 66Z", c.body)}
    ${P("M118 56 C126 48 138 52 140 62 L124 64Z", c.belly)}
    ${P("M124 54 C130 52 134 56 134 60 L124 62Z", c.c2)}
    ${P("M120 68 C132 66 144 72 150 76 C148 80 140 82 132 80 C128 78 124 74 120 68Z", c.belly)}
    ${P("M128 62 C136 62 144 68 150 74 L140 74 C134 70 130 66 128 62Z", c.c2)}
    ${E(150, 76, 3, 2.4, "#16110e")}
    ${E(128, 58, 3, 3.5, c.c2)}
    ${c.sil ? eye(c, 136, 66, 1.6) : `<circle cx="137" cy="66.5" r="1.4" fill="#0a0806"/><circle cx="137.5" cy="66" r="0.45" fill="#fff"/>`}
  </g>`;
};

const boar = (c: Ctx) => {
  const torso = "M30 74 C30 52 52 40 84 42 C108 44 122 54 120 76 C118 92 100 98 76 98 C48 98 30 92 30 74Z";
  return `
  <g class="fo-breathe">
    ${S("M32 66 C20 60 18 72 24 78 C28 80 24 72 26 70", c.c2, 2)}
    ${P("M48 88 L46 111 L56 111 L58 92Z", c.dark)}
    ${P("M98 88 L96 111 L106 111 L108 92Z", c.dark)}
    ${P(torso, c.body)}
    ${clip(`to${c.u}`, torso)}
    <g clip-path="url(#to${c.u})">
      ${E(76, 96, 42, 12, c.belly, 'opacity="0.7"')}
      ${fur(c, 34, 118, 44, 84, 46, 6, 0.4)}
      ${E(46, 66, 18, 22, c.hi, 'opacity="0.12"')}
    </g>
    ${S("M50 44 l-2 -9 l6 7 l1 -10 l6 9 l2 -10 l5 10 l3 -9 l4 10 l4 -8 l3 9 l5 -7 l2 8 l6 -5 l1 7", c.c2, 2.6)}
    ${P("M40 90 C36 100 40 106 41 111 L54 111 L52 100 C58 96 58 92 56 88Z", c.body)}
    ${P("M91 90 C89 100 94 106 95 111 L108 111 L106 100 C112 95 112 90 108 86Z", c.body)}
    ${P("M41 106 L41 111 L54 111 L53 106Z", "#1b130d")}${P("M95 106 L95 111 L108 111 L107 106Z", "#1b130d")}
    ${P("M104 52 C112 44 126 44 132 52 L134 72 C124 84 108 82 102 72Z", c.body)}
    ${P("M126 52 C134 50 146 58 152 68 C154 74 150 80 142 80 L128 80C122 72 122 60 126 52Z", c.body)}
    ${P("M136 74 L152 72 C154 78 150 82 142 82 L134 80Z", c.belly, 'opacity="0.85"')}
    ${E(153, 71, 4.2, 6, "#3a2a22", 'transform="rotate(-8 153 71)"')}
    ${E(153, 69, 1, 1.6, "#120c09")}${E(153, 74, 1, 1.6, "#120c09")}
    ${P("M141 76 C142 70 146 68 148 66 C147 72 145 76 141 80Z", "#f4efe2")}
    ${P("M116 48 L112 34 L124 44Z", c.c2)}${P("M124 46 L128 31 L134 46Z", c.body)}${P("M127 45 L129 36 L132 45Z", c.c2, 'opacity="0.7"')}
    ${c.sil ? eye(c, 134, 61, 1.7) : `<circle cx="134" cy="61" r="1.7" fill="#1a0f08"/><circle cx="134.5" cy="60.4" r="0.5" fill="#fff"/>`}
    ${S("M130 56 l5 2", c.lo, 1, 0.5)}
  </g>`;
};

const bear = (c: Ctx) => {
  const torso = "M26 82 C22 56 50 40 82 44 C108 46 126 58 124 82 C122 96 104 102 76 102 C46 102 28 98 26 82Z";
  return `
  <g class="fo-breathe">
    ${P("M30 80 C22 80 18 88 22 94 C28 96 34 92 36 86Z", c.dark)}
    ${P("M44 90 L40 111 L58 111 L60 92Z", c.dark)}
    ${P("M98 90 L96 111 L114 111 L112 92Z", c.dark)}
    ${P(torso, c.body)}
    ${clip(`to${c.u}`, torso)}
    <g clip-path="url(#to${c.u})">
      ${P("M70 40 C84 36 100 44 104 56 C96 62 76 58 70 40Z", c.hi, 'opacity="0.22"')}
      ${fur(c, 30, 122, 46, 90, 60, 6, 0.32)}
      ${E(80, 100, 44, 12, c.dark, 'opacity="0.5"')}
      ${E(52, 74, 20, 22, c.hi, 'opacity="0.12"')}
    </g>
    ${P("M34 92 C28 102 32 108 34 111 L58 111 L56 102 C62 98 62 94 60 88Z", c.body)}
    ${P("M90 90 C88 102 92 108 94 111 L118 111 L116 100 C122 96 122 92 118 86Z", c.body)}
    ${S("M36 108 l0 3 M42 108 l0 3 M48 108 l0 3 M96 108 l0 3 M102 108 l0 3 M108 108 l0 3", "#e8e2d0", 1.4, 0.8)}
    ${P("M104 50 C112 40 126 40 134 48 L136 72 C124 86 108 84 102 74Z", c.body)}
    ${E(124, 52, 14, 12, c.body)}
    ${E(114, 36, 5, 5, c.c2)}${E(114, 36, 2.4, 2.4, c.belly, 'opacity="0.8"')}
    ${E(132, 34, 5, 5, c.body)}${E(132, 34, 2.4, 2.4, c.c2, 'opacity="0.8"')}
    ${P("M130 52 C140 52 150 60 152 68 C152 74 146 78 138 78 L128 76Z", c.belly)}
    ${E(151, 66, 4.2, 3.2, "#15100c")}
    ${S("M136 74 C142 77 148 76 150 72", "#15100c", 0.9, 0.7)}
    ${c.sil ? eye(c, 133, 51, 1.8) : `<circle cx="133" cy="50" r="1.6" fill="#120c08"/><circle cx="133.5" cy="49.4" r="0.5" fill="#fff"/>`}
  </g>`;
};

const antlers = (c: Ctx, palm: boolean, col: string) => {
  if (palm) {
    return `
    ${P("M112 26 C100 12 82 8 66 14 C70 18 64 22 70 26 C74 24 74 30 82 28 C86 30 90 30 98 34 C104 34 110 32 114 30Z", col)}
    ${S("M70 16 l-8 -3 M74 20 l-8 1 M80 22 l-6 6 M88 22 l-3 8 M96 26 l-2 8", col, 2.2)}
    ${P("M120 24 C128 8 146 2 160 8 C156 12 162 16 156 20 C152 18 152 24 144 24 C140 26 136 26 128 30 C124 30 122 28 120 24Z", col)}
    ${S("M154 10 l4 -4 M152 14 l7 -2 M146 18 l4 5 M138 20 l1 7", col, 2.2)}
    ${S("M70 18 C86 16 100 22 112 28 M156 10 C140 12 128 20 120 26", c.lo, 0.9, 0.5)}`;
  }
  return `
  ${S("M118 22 C112 10 104 4 96 -2 M107 8 C100 6 94 8 90 12 M110 11 C106 2 108 -4 110 -8 M100 2 C94 -2 88 -2 84 2", col, 2.6)}
  ${S("M124 22 C128 10 134 4 142 -2 M133 8 C140 6 146 8 150 12 M130 11 C134 2 132 -4 130 -8 M140 2 C146 -2 152 -2 156 2", col, 2.6)}`;
};

const deer = (c: Ctx, o: { moose?: boolean; spot?: boolean; leaves?: boolean; antler: string }) => {
  const m = !!o.moose;
  const torso = m ? "M34 70 C32 50 54 40 82 42 C104 44 112 54 110 70 C108 84 94 88 74 88 C52 88 36 86 34 70Z" : "M36 72 C34 56 54 50 78 52 C100 54 110 60 108 72 C106 84 92 88 72 88 C52 88 38 86 36 72Z";
  const neck = m ? "M98 50 C104 38 114 34 122 38 L128 58 C118 72 106 72 98 64Z" : "M92 58 C98 40 108 30 118 28 L126 38 C120 48 116 62 108 70Z";
  const legW = m ? 5 : 3.6;
  const legs = [[46, 1], [56, 0], [86, 0], [96, 1]]
    .map(([x, far]) => `${P(`M${x - legW / 2} 84 L${x - legW / 2 + 0.6} 111 L${x + legW / 2 - 0.4} 111 L${x + legW / 2} 84Z`, far ? c.dark : c.body)}${P(`M${x - legW / 2 + 0.4} 105 L${x - legW / 2 + 0.6} 111 L${x + legW / 2 - 0.4} 111 L${x + legW / 2 - 0.2} 105Z`, c.c2)}`)
    .join("");
  const head = m
    ? `${P("M112 36 C118 28 130 28 138 36 C148 40 156 52 156 62 C154 68 146 68 140 64 C132 62 124 58 120 54Z", c.body)}${E(148, 60, 7, 6, c.belly, 'opacity="0.8"')}${E(153, 58, 2.4, 2, "#15100c")}${P("M118 62 C112 72 112 84 120 90 C126 82 126 70 124 60Z", c.dark)}`
    : `${P("M114 28 C120 22 130 24 134 30 L152 48 C154 52 150 56 144 55 L126 50 C118 46 112 36 114 28Z", c.body)}${P("M130 44 L150 50 C152 54 148 57 144 56 L128 52Z", c.belly)}${E(151, 50, 2.2, 1.8, "#15100c")}`;
  const ears = m ? `${P("M112 32 L102 24 L110 42Z", c.body)}${P("M130 28 L134 16 L138 32Z", c.body)}` : `${P("M114 28 L102 22 L112 38Z", c.body)}${P("M124 24 L128 10 L134 26Z", c.body)}${P("M126 23 L128 14 L131 24Z", c.c2, 'opacity="0.6"')}`;
  return `
  <g class="fo-breathe"><g transform="translate(8 12) scale(0.9)">
    ${E(34, 66, o.moose ? 4 : 5, 6, c.belly)}
    ${S(m ? "M114 34 L112 26 M124 32 L126 26" : "M118 26 L118 22 M124 26 L124 22", o.antler, 3)}${antlers(c, m, o.antler)}
    ${legs}
    ${P(torso, c.body)}
    ${clip(`to${c.u}`, torso)}
    <g clip-path="url(#to${c.u})">
      ${E(74, 86, 34, 9, c.belly, 'opacity="0.9"')}
      ${fur(c, 40, 106, 50, 68, 22, 4, 0.25)}
      ${o.spot ? [[50, 60], [62, 56], [74, 58], [86, 60], [56, 70], [70, 68], [84, 70], [96, 66]].map(([x, y]) => E(x, y, 1.8, 1.8, c.belly, 'opacity="0.85"')).join("") : ""}
      ${E(52, 70, 14, 15, c.hi, 'opacity="0.14"')}
    </g>
    ${m ? P("M80 42 C90 36 102 38 108 50 C96 54 84 52 80 42Z", c.hi, 'opacity="0.18"') : ""}
    ${P(neck, c.body)}
    ${head}
    ${ears}
    ${c.sil ? eye(c, m ? 133 : 128, m ? 40 : 34, 1.8) : `<circle cx="${m ? 133 : 128}" cy="${m ? 40 : 34}" r="1.9" fill="#150d08"/><circle cx="${m ? 133.6 : 128.6}" cy="${m ? 39.4 : 33.4}" r="0.55" fill="#fff"/>`}
    ${o.leaves ? [[96, 4], [110, -6], [140, 4], [152, 10], [102, 14]].map(([x, y]) => P(`M${x} ${y} q5 -6 10 0 q-5 6 -10 0Z`, "#86efac", 'opacity="0.9" class="ct-glow"')).join("") : ""}
  </g>`;
};

const hare = (c: Ctx) => `
  <g class="fo-breathe">
    ${P("M30 82 C20 82 18 94 26 98 C34 100 38 92 36 84Z", c.belly)}
    ${P("M36 84 C36 66 56 58 78 62 C98 66 104 80 96 94 C88 104 56 106 40 98 C36 94 36 88 36 84Z", c.body)}
    ${E(56, 90, 24, 16, c.hi, 'opacity="0.14"')}
    ${P("M44 98 C50 108 66 112 90 110 L92 102 C76 104 60 100 52 94Z", c.dark)}
    ${P("M40 88 C46 80 62 82 66 92 C62 100 46 100 40 88Z", c.body)}
    ${S("M42 90 C48 84 60 86 64 92", c.lo, 1.2, 0.4)}
    ${E(70, 98, 20, 7, c.belly, 'opacity="0.9"')}
    ${P("M88 90 C96 96 106 100 112 106 L112 111 L96 111 C92 104 88 98 86 94Z", c.body)}
    ${P("M100 108 L112 108 L114 111 L98 111Z", c.belly)}
    ${P("M84 76 C92 62 108 62 114 74 L112 92 C102 100 88 96 84 88Z", c.body)}
    ${E(108, 70, 13, 11, c.body)}
    ${P("M114 68 C122 68 128 74 128 78 C126 82 118 82 112 80Z", c.belly)}
    ${E(128, 76, 2.2, 1.7, "#c98a8e")}
    ${S("M116 80 C120 82 124 82 127 79 M127 78 l12 -3 M127 79 l12 1 M126 80 l11 5", "#2a1c14", 0.7, 0.55)}
    <g class="fo-ear">${P("M98 62 C92 38 90 14 96 6 C104 6 108 34 108 62Z", c.body)}${P("M99 58 C95 38 94 18 97 11 C102 14 104 36 104 58Z", c.belly, 'opacity="0.85"')}</g>
    ${P("M108 62 C110 40 118 18 126 12 C132 18 124 42 116 64Z", c.dark)}${P("M111 58 C113 40 119 24 124 18 C126 24 120 42 116 58Z", c.belly, 'opacity="0.6"')}
    ${c.sil ? eye(c, 118, 68, 1.9) : `<circle cx="118" cy="68" r="2.4" fill="#2a1a0e"/><circle cx="118" cy="68" r="1.4" fill="#0a0806"/><circle cx="118.7" cy="67.2" r="0.6" fill="#fff"/>`}
  </g>`;

const squirrel = (c: Ctx) => `
  <g class="fo-breathe">
    <g class="ct-tail">
      ${P("M58 100 C20 104 10 70 26 44 C38 22 62 14 74 28 C62 30 50 40 46 58 C42 74 52 86 62 90Z", c.body)}
      ${S("M30 50 C38 32 54 22 66 24 M26 66 C28 52 36 42 48 36", c.hi, 1.4, 0.45)}
      ${S("M22 56 C26 78 42 92 58 94", c.lo, 1.4, 0.4)}
      ${S("M32 40 l-3 -4 M42 30 l-1 -5 M54 22 l1 -4 M20 58 l-5 -1 M18 72 l-5 1", c.hi, 1.6, 0.6)}
    </g>
    ${P("M62 104 C58 110 64 111 74 111 L86 111 C90 108 88 104 80 100Z", c.dark)}
    ${E(80, 80, 20, 28, c.body)}
    ${E(86, 84, 12, 21, c.belly)}
    ${E(70, 76, 10, 16, c.hi, 'opacity="0.16"')}
    ${P("M70 100 C66 108 70 111 78 111 L96 111 C98 106 94 102 88 100Z", c.body)}
    ${P("M76 66 C84 64 96 68 98 78 C92 80 84 76 76 66Z", c.body)}
    ${E(90, 78, 4, 3, c.c2)}
    ${P("M92 80 L102 74 L100 84Z", c.dark, 'opacity="0.0"')}
    ${E(100, 44, 16, 15, c.body)}
    ${P("M88 34 L84 14 L100 28Z", c.body)}${P("M96 30 L104 10 L112 32Z", c.body)}${S("M84 14 L83 6 M104 10 L106 3", c.c2, 2)}
    ${P("M92 31 L90 20 L98 29Z", c.c2, 'opacity="0.6"')}
    ${P("M104 46 C112 46 118 50 118 54 C116 58 108 58 102 56Z", c.belly)}
    ${E(118, 52, 2.2, 1.8, "#2a1a1a")}
    ${S("M108 57 C111 58 114 57 116 55", "#1a120c", 0.8, 0.6)}
    ${c.sil ? eye(c, 106, 42, 2.2) : `<circle cx="106" cy="42" r="3" fill="#1a0f08"/><circle cx="107" cy="41" r="1" fill="#fff"/>`}
    ${E(106, 98, 6, 6.5, c.sil ? c.c2 : "#a8742f")}
    ${P("M101 94 C103 90 110 90 111 94Z", c.sil ? c.c2 : "#5a3a18")}
    ${P("M96 78 C100 84 104 90 106 94 L110 92 C108 86 104 80 100 74Z", c.body)}
  </g>`;

const pheasant = (c: Ctx) => `
  <g class="fo-breathe">
    <g class="ct-tail">
      ${P("M58 74 C30 76 10 92 2 108 C16 106 42 98 62 90Z", c.c0 === c.c0 ? shade(c.c0, -0.15) : c.c0)}
      ${S("M54 82 C36 88 20 96 8 106 M58 86 C42 92 28 100 16 108", c.c2, 1, 0.35)}
      ${[0, 1, 2, 3, 4, 5].map((i) => S(`M${46 - i * 6} ${82 + i * 3.5} l-3 6`, c.lo, 1.6, 0.5)).join("")}
    </g>
    ${S("M76 94 L74 111 M92 94 L94 111", c.sil ? c.c2 : "#7d6a4d", 2.6)}
    ${S("M70 111 l8 0 M90 111 l8 0", c.sil ? c.c2 : "#7d6a4d", 2)}
    ${E(80, 78, 29, 19, c.body, 'transform="rotate(-8 80 78)"')}
    ${P("M96 62 C108 66 112 80 100 90 C94 96 84 96 80 92 C92 86 98 74 96 62Z", c.sil ? c.c1 : "#8a3d1c")}
    ${[[88, 70], [94, 76], [90, 82], [84, 88], [98, 82], [80, 80]].map(([x, y]) => S(`M${x} ${y} q4 -3 8 0`, c.sil ? c.c2 : "#3a1608", 1.2, 0.6)).join("")}
    ${P("M52 72 C66 62 88 64 96 76 C84 86 62 88 52 72Z", c.c1)}
    ${[[58, 74], [66, 72], [74, 72], [82, 74], [62, 79], [70, 78], [78, 79]].map(([x, y]) => E(x, y, 4, 2.6, c.sil ? c.c2 : "#6b2e12", 'opacity="0.55"')).join("")}
    ${P("M96 66 C102 52 108 46 114 46 L120 60 C112 70 104 74 98 76Z", c.sil ? c.c1 : "#a14a1f")}
    ${E(112, 44, 10, 9, c.c2)}
    ${c.sil ? "" : P("M102 56 C106 62 116 62 118 56 L116 52 L104 52Z", "#f4efe2")}
    ${c.sil ? "" : E(111, 44, 4.5, 3.8, "#c8332b", 'opacity="0.95"')}
    ${P("M118 44 L128 48 L119 50Z", c.sil ? c.c2 : "#d9c78a")}
    ${c.sil ? eye(c, 112, 43, 1.8) : `<circle cx="112" cy="43" r="1.7" fill="#e8c23c"/><circle cx="112" cy="43" r="0.9" fill="#0a0806"/>`}
  </g>`;

const crow = (c: Ctx) => `
  <g class="fo-breathe">
    <g class="ct-tail">${P("M56 74 C38 80 20 98 12 106 C30 106 52 96 66 88Z", c.c2)}${S("M50 82 C38 90 26 98 16 104", c.hi, 1, 0.35)}</g>
    ${S("M78 92 L76 111 M92 92 L94 111", c.sil ? c.c2 : "#1a1a1f", 2.6)}
    ${S("M70 111 l9 0 M90 111 l9 0", c.sil ? c.c2 : "#1a1a1f", 2.2)}
    ${E(80, 76, 28, 18, c.body, 'transform="rotate(-10 80 76)"')}
    ${E(82, 84, 18, 8, c.hi, 'opacity="0.22"')}
    ${P("M50 74 C64 64 90 64 100 78 C86 90 62 90 50 74Z", c.c2)}
    ${S("M56 76 C68 70 84 70 94 78 M60 80 C70 76 82 76 90 82", c.hi, 1, 0.45)}
    ${P("M94 66 C100 52 108 46 116 48 L120 60 C112 70 102 74 96 74Z", c.body)}
    ${E(112, 50, 10, 9, c.body)}
    ${E(108, 46, 5, 3, c.hi, 'opacity="0.3"')}
    ${P("M118 48 C126 50 136 56 140 62 C130 62 122 60 116 58Z", c.c2)}
    ${S("M118 52 C126 54 132 58 138 61", c.hi, 0.9, 0.5)}
    ${c.sil ? eye(c, 112, 47, 1.7) : `<circle cx="112" cy="47" r="2" fill="#6b7a99"/><circle cx="112" cy="47" r="1.1" fill="#05070a"/><circle cx="112.6" cy="46.4" r="0.45" fill="#fff"/>`}
  </g>`;

const owl = (c: Ctx) => `
  <g class="fo-breathe">
    ${S("M6 104 L154 104", c.sil ? c.c2 : "#4a3322", 7)}${S("M10 101 L150 101", c.sil ? c.c1 : "#6b4a30", 2, 0.6)}
    ${P("M52 96 C46 100 50 106 54 104 C56 108 62 108 62 102Z", c.sil ? c.c2 : "#d9a441")}${P("M98 96 C94 102 98 108 102 106 C106 108 112 106 110 100Z", c.sil ? c.c2 : "#d9a441")}
    ${E(80, 66, 31, 40, c.body)}
    ${P("M62 38 C52 56 50 84 62 100 C48 92 44 66 52 46Z", c.c2)}${P("M98 38 C108 56 110 84 98 100 C112 92 116 66 108 46Z", c.c2)}
    ${E(80, 78, 17, 26, c.c1)}
    ${[[72, 64], [80, 60], [88, 64], [70, 76], [80, 74], [90, 76], [74, 88], [86, 88], [80, 96]].map(([x, y]) => S(`M${x} ${y} l0 8`, c.c2, 1.8, 0.7)).join("")}
    ${E(80, 36, 28, 23, c.body)}
    ${P("M56 30 L52 6 L70 20Z", c.c2)}${P("M104 30 L108 6 L90 20Z", c.c2)}${P("M58 26 L56 12 L66 21Z", c.hi, 'opacity="0.3"')}${P("M102 26 L104 12 L94 21Z", c.hi, 'opacity="0.3"')}
    ${P("M80 18 C70 22 58 30 58 42 C60 52 72 56 80 54 C88 56 100 52 102 42 C102 30 90 22 80 18Z", c.sil ? c.c1 : "#efe3c4")}
    ${S("M80 20 L80 34", c.c2, 1.6, 0.5)}
    ${E(69, 38, 11, 11.5, c.sil ? c.c2 : "#d9c9a0")}${E(91, 38, 11, 11.5, c.sil ? c.c2 : "#d9c9a0")}
    ${c.sil ? `<circle cx="69" cy="38" r="7.4" fill="#e3b341"/><circle cx="91" cy="38" r="7.4" fill="#e3b341"/><circle cx="69" cy="38" r="2.6" fill="#3a2a08"/><circle cx="91" cy="38" r="2.6" fill="#3a2a08"/>` : `<circle cx="69" cy="38" r="8" fill="#e9a21f"/><circle cx="91" cy="38" r="8" fill="#e9a21f"/><circle cx="69" cy="38" r="5.4" fill="#f4c542" opacity="0.7"/><circle cx="91" cy="38" r="5.4" fill="#f4c542" opacity="0.7"/><circle class="ct-blink" cx="69" cy="38" r="3.6" fill="#0a0806"/><circle class="ct-blink" cx="91" cy="38" r="3.6" fill="#0a0806"/><circle cx="70.6" cy="36.2" r="1.2" fill="#fff"/><circle cx="92.6" cy="36.2" r="1.2" fill="#fff"/>`}
    ${P("M75 44 L80 56 L85 44Z", c.sil ? c.c2 : "#c98a2b")}
  </g>`;

const eagle = (c: Ctx) => `
  <g class="fo-breathe">
    ${S("M4 106 L156 106", c.sil ? c.c2 : "#4a3322", 7)}${S("M8 103 L152 103", c.sil ? c.c1 : "#6b4a30", 2, 0.6)}
    ${P("M44 70 C30 86 26 100 30 112 L42 106 L48 84Z", c.c2)}${S("M36 82 l-4 18 M42 80 l-2 20", c.hi, 1, 0.35)}
    ${S("M74 92 L72 108 M92 92 L94 108", c.sil ? c.c2 : "#e0b030", 3.4)}
    ${S("M66 108 l-4 -1 M69 108 l-1 -3 M72 108 l2 -3 M92 108 l-3 -3 M95 108 l1 -3 M98 108 l4 -1", c.sil ? c.c2 : "#1a1308", 1.8)}
    ${P("M54 60 C54 34 80 22 98 28 C108 34 112 52 106 72 C102 88 90 98 78 98 C64 96 54 82 54 60Z", c.body)}
    ${P("M66 52 C80 48 96 52 102 64 C98 80 84 92 72 92 C62 82 58 66 66 52Z", c.c1, 'opacity="0.55"')}
    ${[[70, 62], [80, 58], [90, 62], [74, 72], [84, 70], [94, 72], [78, 82], [88, 82]].map(([x, y]) => S(`M${x - 4} ${y} q4 6 8 0`, c.lo, 1.2, 0.5)).join("")}
    ${P("M58 48 C54 66 58 86 70 96 C62 82 60 62 66 46Z", c.c2)}
    ${P("M90 24 C96 14 108 12 114 20 L116 38 C108 44 96 42 90 34Z", c.body)}
    ${P("M96 20 C102 14 110 14 112 20 C106 24 100 26 96 28Z", c.c1)}
    ${P("M108 22 C116 23 122 28 121 36 C120 40 117 39 115 36 L111 32Z", c.sil ? c.c2 : "#e8b43a")}
    
    ${S("M104 24 L116 28", c.c2, 2.2, 0.9)}
    ${c.sil ? eye(c, 110, 28, 2) : `<circle cx="110" cy="28.4" r="2.2" fill="#5a2a08"/><circle cx="110" cy="28.4" r="1.2" fill="#0a0806"/><circle cx="110.6" cy="27.8" r="0.45" fill="#fff"/>`}
  </g>`;

const PROFILE: Record<string, (c: Ctx) => string> = {
  coniglio: hare,
  scoiattolo: squirrel,
  fagiano: pheasant,
  cornacchia: crow,
  volpe: (c) => canid(c, { tip: c.sil ? c.c1 : "#fbf6ec", cheek: true, ear: 1, snout: 1 }),
  tasso: badger,
  cinghiale: boar,
  cervo: (c) => deer(c, { antler: c.sil ? c.c2 : "#d9c9a3" }),
  lupo: (c) => canid(c, { ruff: true, ear: 0.9, snout: 1.05, bulk: 1.1, cheek: true, eyeCol: "#d9a21f" }),
  gufo_reale: owl,
  lince: lynx,
  orso: bear,
  alce: (c) => deer(c, { moose: true, antler: c.sil ? c.c2 : "#bfa57a" }),
  aquila: eagle,
  lupo_bianco: (c) => canid(c, { ruff: true, ear: 0.9, snout: 1.05, cheek: false, eyeCol: "#7dd3fc" }),
  cervo_bianco: (c) => deer(c, { antler: c.sil ? c.c2 : "#fff7da" }),
  spirito_bosco: (c) => deer(c, { antler: c.sil ? c.c2 : "#a7f3d0", leaves: !c.sil }),
};

const FALLBACK: Record<AnimalSpecies["kind"], (c: Ctx) => string> = {
  quad: (c) => canid(c, {}),
  deer: (c) => deer(c, { antler: c.c2 }),
  hare,
  squirrel,
  bird: pheasant,
  owl,
};

export function animalSvg(a: AnimalSpecies, silhouette: boolean, uid: string): string {
  const u = uid.replace(/[^a-zA-Z0-9]/g, "");
  const [c0, c1, c2] = silhouette ? ["#141b24", "#1b2430", "#0e141b"] : a.colors;
  const ctx: Ctx = {
    u,
    c0,
    c1,
    c2,
    sil: silhouette,
    body: `url(#b${u})`,
    belly: `url(#l${u})`,
    dark: `url(#d${u})`,
    hi: silhouette ? "#2a3646" : shade(c0, 0.3),
    lo: silhouette ? "#070a0e" : shade(c0, -0.4),
  };
  const draw = PROFILE[a.id] ?? FALLBACK[a.kind];
  const defs = `
  <linearGradient id="b${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c0, silhouette ? 0.12 : 0.2)}"/><stop offset="0.55" stop-color="${c0}"/><stop offset="1" stop-color="${shade(c0, -0.28)}"/></linearGradient>
  <linearGradient id="l${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${shade(c1, -0.16)}"/></linearGradient>
  <linearGradient id="d${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c2, 0.06)}"/><stop offset="1" stop-color="${shade(c2, -0.3)}"/></linearGradient>
  <radialGradient id="g${u}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${a.colors[1]}" stop-opacity="0.55"/><stop offset="1" stop-color="${a.colors[1]}" stop-opacity="0"/></radialGradient>`;
  const aura = a.glow && !silhouette ? `<ellipse cx="80" cy="62" rx="78" ry="56" fill="url(#g${u})" class="ct-glow"/>` : "";
  return `<defs>${defs}</defs>${aura}${ground()}${draw(ctx)}`;
}
