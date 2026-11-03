import type { AnimalSpecies } from "@/lib/animals";

export default function AnimalArt({ a, silhouette, className }: { a: AnimalSpecies; silhouette?: boolean; className?: string }) {
  const [c0, c1, c2] = silhouette ? ["#141b24", "#1b2430", "#0e141b"] : a.colors;
  const eye = silhouette ? "#e3b341" : "#111111";
  const b = a.bulk ? 1.18 : 1;
  let body: React.ReactNode;
  if (a.kind === "quad") {
    body = (
      <g>
        <path d="M34 40 Q14 26 8 40 Q14 48 34 50Z" fill={c0} />
        {!a.bulk && <path d="M10 37 Q6 41 10 45 Q17 45 17 38Z" fill={c1} />}
        {[42, 52, 76, 86].map((x) => (
          <rect key={x} x={x - 3} y="54" width={a.bulk ? 9 : 6} height="20" rx="2" fill={c2} />
        ))}
        <ellipse cx="62" cy="46" rx={28 * b} ry={16 * b} fill={c0} />
        <ellipse cx="62" cy="53" rx={20 * b} ry={8 * b} fill={c1} opacity="0.9" />
        <ellipse cx="94" cy="34" rx={12 * b} ry={11 * b} fill={c0} />
        <ellipse cx="104" cy="38" rx="8" ry="5.5" fill={c1} />
        <circle cx="109" cy="36.5" r="2" fill={silhouette ? c2 : "#111111"} />
        {a.bulk ? (
          <>
            <circle cx="88" cy="25" r="4.5" fill={c2} />
            <circle cx="100" cy="25" r="4.5" fill={c2} />
          </>
        ) : (
          <>
            <path d="M86 26 L88 11 L95 24Z" fill={c2} />
            <path d="M96 25 L102 12 L105 27Z" fill={c2} />
          </>
        )}
        {a.tufts && <path d="M88 11 l-1 -6 M102 12 l2 -6" stroke={c2} strokeWidth="2" strokeLinecap="round" />}
        {a.tusks && <path d="M104 41 l-1 7 l5 -5Z" fill="#f8fafc" />}
        <circle cx="96" cy="31" r="1.9" fill={eye} />
      </g>
    );
  } else if (a.kind === "deer") {
    body = (
      <g>
        <ellipse cx="38" cy="40" rx="5" ry="3.5" fill={c1} />
        {[44, 54, 78, 88].map((x) => (
          <rect key={x} x={x - 2} y="54" width="4" height="22" rx="1.5" fill={c2} />
        ))}
        <ellipse cx="64" cy="46" rx="26" ry="13" fill={c0} />
        <ellipse cx="64" cy="52" rx="18" ry="6" fill={c1} opacity="0.9" />
        <path d="M82 42 L92 18 L102 23 L92 48Z" fill={c0} />
        <ellipse cx="101" cy="21" rx="9" ry="6.5" fill={c0} transform="rotate(20 101 21)" />
        <circle cx="109" cy="25" r="2" fill={silhouette ? c2 : "#111111"} />
        <ellipse cx="92" cy="14" rx="3.5" ry="6" fill={c2} transform="rotate(-30 92 14)" />
        <path d="M97 15 L93 3 M93 3 L87 -1 M93 3 L95 -4 M99 15 L105 5 M105 5 L111 1 M105 5 L107 -2" stroke={c2} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <circle cx="103" cy="19" r="1.7" fill={eye} />
      </g>
    );
  } else if (a.kind === "hare") {
    body = (
      <g>
        <ellipse cx="44" cy="62" rx="13" ry="8" fill={c0} />
        <rect x="72" y="58" width="5" height="15" rx="2" fill={c2} />
        <circle cx="29" cy="52" r="6" fill={c1} />
        <ellipse cx="56" cy="52" rx="26" ry="17" fill={c0} />
        <ellipse cx="60" cy="60" rx="16" ry="7" fill={c1} />
        <ellipse cx="82" cy="42" rx="12" ry="10" fill={c0} />
        <ellipse cx="79" cy="20" rx="4" ry="14" fill={c0} transform="rotate(-8 79 20)" />
        <ellipse cx="90" cy="22" rx="4" ry="13" fill={c0} transform="rotate(12 90 22)" />
        <ellipse cx="79" cy="21" rx="1.8" ry="9" fill={c1} transform="rotate(-8 79 21)" />
        <ellipse cx="90" cy="23" rx="1.8" ry="8" fill={c1} transform="rotate(12 90 23)" />
        <circle cx="93" cy="45" r="2" fill={silhouette ? c2 : "#7a4a4a"} />
        <circle cx="86" cy="39" r="1.9" fill={eye} />
      </g>
    );
  } else if (a.kind === "squirrel") {
    body = (
      <g>
        <path d="M44 62 Q14 60 20 28 Q30 2 52 16 Q36 28 44 44Z" fill={c0} />
        <path d="M40 58 Q24 54 28 32" stroke={c1} strokeWidth="3" fill="none" opacity="0.6" />
        <ellipse cx="60" cy="75" rx="11" ry="3" fill={c2} />
        <ellipse cx="58" cy="54" rx="15" ry="20" fill={c0} />
        <ellipse cx="63" cy="58" rx="9" ry="13" fill={c1} />
        <circle cx="66" cy="30" r="11" fill={c0} />
        <path d="M58 22 L60 10 L67 20Z M68 20 L74 10 L76 24Z" fill={c2} />
        <circle cx="76" cy="32" r="2" fill={silhouette ? c2 : "#111111"} />
        <ellipse cx="71" cy="49" rx="4" ry="3" fill={c2} />
        <circle cx="70" cy="27" r="1.8" fill={eye} />
      </g>
    );
  } else if (a.kind === "owl") {
    body = (
      <g>
        <path d="M50 74 l-3 6 M56 75 l-1 6 M64 75 l1 6 M70 74 l3 6" stroke={c2} strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="60" cy="50" rx="24" ry="28" fill={c0} />
        <ellipse cx="60" cy="56" rx="15" ry="19" fill={c1} />
        <circle cx="60" cy="26" r="19" fill={c0} />
        <path d="M44 12 L50 24 L40 24Z M76 12 L70 24 L80 24Z" fill={c2} opacity="0.85" />
        <circle cx="52" cy="26" r="8" fill={silhouette ? "#1b2430" : "#f8f3e4"} />
        <circle cx="68" cy="26" r="8" fill={silhouette ? "#1b2430" : "#f8f3e4"} />
        <circle cx="52" cy="27" r="4" fill={silhouette ? eye : "#111111"} />
        <circle cx="68" cy="27" r="4" fill={silhouette ? eye : "#111111"} />
        <path d="M56 34 L60 42 L64 34Z" fill={silhouette ? c2 : "#e3a53a"} />
      </g>
    );
  } else {
    body = (
      <g>
        <path d="M52 56 v16 M64 56 v16" stroke={silhouette ? c2 : "#c98a2b"} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M32 44 L6 38 L9 48 L6 58 L34 52Z" fill={c2} />
        <ellipse cx="58" cy="44" rx="26" ry="15" fill={c0} />
        <ellipse cx="62" cy="51" rx="18" ry="8" fill={c1} />
        <path d="M44 38 Q62 28 78 42 Q64 58 42 50Z" fill={c2} opacity="0.85" />
        <circle cx="86" cy="32" r="10" fill={c0} />
        <path d="M94 29 L110 34 L94 38Z" fill={silhouette ? c2 : "#e3a53a"} />
        <circle cx="89" cy="30" r="1.9" fill={eye} />
      </g>
    );
  }
  return (
    <svg viewBox="0 -8 120 92" className={className} aria-hidden>
      {a.glow && !silhouette && <ellipse cx="60" cy="42" rx="56" ry="38" fill={c1} opacity="0.28" className="ct-glow" />}
      <ellipse cx="60" cy="77" rx="38" ry="3.5" fill="#000000" opacity="0.25" />
      {body}
    </svg>
  );
}
