import { useState, type KeyboardEvent } from "react";
import { ArrowLeft, Fish, Landmark } from "lucide-react";
import type { Me } from "@/lib/types";
import { useCity } from "@/lib/city";
import { Button } from "@/components/ui/button";
import { LoadError, SectionHeader, SkeletonList } from "@/components/common";
import Bucket from "./Bucket";
import Museum from "./Museum";
import Pond from "./Pond";

type View = "map" | "museum" | "pond";

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="0" width="6" height="14" fill="#6b4a2b" />
      <circle cx="0" cy="-6" r="16" fill="#2f7a3a" />
      <circle cx="-7" cy="-2" r="10" fill="#3c8d47" />
      <circle cx="8" cy="-10" r="9" fill="#38853f" />
    </g>
  );
}

function House({ x, y, c }: { x: number; y: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-22" y="-14" width="44" height="30" fill="#e8dcc4" />
      <path d="M-27 -14 L0 -36 L27 -14Z" fill={c} />
      <rect x="-5" y="2" width="10" height="14" fill="#6b4a2b" />
      <rect x="-17" y="-8" width="8" height="8" fill="#9ecbe8" />
      <rect x="9" y="-8" width="8" height="8" fill="#9ecbe8" />
    </g>
  );
}

function CityMap({ onGo }: { onGo: (v: View) => void }) {
  const hot = (v: View, label: string) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": label,
    onClick: () => onGo(v),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onGo(v);
      }
    },
  });
  return (
    <svg viewBox="0 0 800 480" className="w-full rounded-xl border border-[#30363D]" data-testid="city-map">
      <defs>
        <linearGradient id="cm-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a9a4f" />
          <stop offset="1" stopColor="#3b8541" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#cm-grass)" />
      <path d="M250 250 C 330 330, 430 270, 560 330" fill="none" stroke="#c9a66b" strokeWidth="24" strokeLinecap="round" />
      <path d="M250 250 C 330 330, 430 270, 560 330" fill="none" stroke="#e0c690" strokeWidth="14" strokeLinecap="round" strokeDasharray="2 14" />
      <path d="M250 250 L 90 400" fill="none" stroke="#c9a66b" strokeWidth="16" strokeLinecap="round" />
      <path d="M560 330 L 720 420" fill="none" stroke="#c9a66b" strokeWidth="16" strokeLinecap="round" />
      <Tree x={60} y={70} s={1.2} />
      <Tree x={130} y={50} />
      <Tree x={40} y={170} />
      <Tree x={700} y={60} s={1.3} />
      <Tree x={760} y={130} />
      <Tree x={420} y={70} />
      <Tree x={480} y={110} s={0.9} />
      <Tree x={90} y={330} />
      <Tree x={330} y={430} s={1.1} />
      <Tree x={410} y={440} />
      <Tree x={750} y={300} s={1.2} />
      <House x={80} y={400} c="#c2553f" />
      <House x={130} y={440} c="#4d6fb3" />
      <House x={720} y={430} c="#d29b3a" />
      <House x={640} y={440} c="#8a5ab0" />

      <g {...hot("museum", "Apri il museo")} className="group cursor-pointer outline-none" data-testid="city-museum">
        <ellipse cx="230" cy="215" rx="140" ry="92" className="fill-white opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-20" />
        <ellipse cx="230" cy="262" rx="112" ry="14" fill="rgba(0,0,0,0.22)" />
        <rect x="140" y="236" width="180" height="12" fill="#cfd4da" />
        <rect x="150" y="224" width="160" height="12" fill="#dde1e6" />
        <rect x="158" y="150" width="144" height="74" fill="#ece8de" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <rect x={166 + i * 24} y="152" width="10" height="70" fill="#f8f5ee" />
            <rect x={164 + i * 24} y="148" width="14" height="6" fill="#d8d3c6" />
            <rect x={164 + i * 24} y="220" width="14" height="5" fill="#d8d3c6" />
          </g>
        ))}
        <rect x="150" y="138" width="160" height="12" fill="#d8d3c6" />
        <path d="M144 138 L230 82 L316 138Z" fill="#c9674b" />
        <path d="M160 134 L230 90 L300 134Z" fill="#dd7e5f" />
        <circle cx="230" cy="116" r="9" fill="#f6e7b4" stroke="#b9852f" strokeWidth="2" />
        <rect x="216" y="192" width="28" height="32" rx="14" fill="#6b4a2b" />
        <path d="M229 82 L229 60 L252 68 L229 76Z" fill="#388bfd" />
        <rect x="180" y="274" width="100" height="26" rx="13" fill="#161B22" stroke="#E3B341" strokeWidth="2" />
        <text x="230" y="292" textAnchor="middle" fontSize="16" fontWeight="600" fill="#F0F6FC">
          Museo
        </text>
      </g>

      <g {...hot("pond", "Vai al pond")} className="group cursor-pointer outline-none" data-testid="city-pond">
        <ellipse cx="590" cy="250" rx="165" ry="105" className="fill-white opacity-0 transition-opacity duration-200 group-hover:opacity-20 group-focus-visible:opacity-20" />
        <path d="M470 250 C 470 190, 540 160, 600 168 C 670 176, 718 214, 712 262 C 706 316, 640 344, 580 338 C 510 332, 470 300, 470 250Z" fill="#6d5a3a" />
        <path d="M480 250 C 480 198, 545 172, 600 179 C 662 187, 704 220, 700 262 C 694 308, 636 332, 582 327 C 520 321, 480 294, 480 250Z" fill="#2a8fb3" />
        <path d="M500 250 C 500 214, 550 194, 600 199 C 650 205, 682 228, 678 262 C 672 296, 630 312, 584 307 C 536 302, 500 282, 500 250Z" fill="#1d6f93" opacity="0.6" />
        <ellipse cx="560" cy="240" rx="3" ry="3" fill="none" stroke="#fff" strokeOpacity="0.7">
          <animate attributeName="rx" values="3;28" dur="3s" repeatCount="indefinite" />
          <animate attributeName="ry" values="3;18" dur="3s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.7;0" dur="3s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="640" cy="280" rx="3" ry="3" fill="none" stroke="#fff" strokeOpacity="0.7">
          <animate attributeName="rx" values="3;24" dur="3.6s" begin="1s" repeatCount="indefinite" />
          <animate attributeName="ry" values="3;15" dur="3.6s" begin="1s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.7;0" dur="3.6s" begin="1s" repeatCount="indefinite" />
        </ellipse>
        <path d="M600 215 q18 -8 30 4 q-12 14 -30 -4Z" fill="#3f9a4a" />
        <path d="M530 280 q18 -8 30 4 q-12 14 -30 -4Z" fill="#3f9a4a" />
        <circle cx="618" cy="214" r="3" fill="#f9a8d4" />
        <path d="M620 262 q10 -7 20 0 q-10 7 -20 0Z M638 262 l8 -5 l0 10Z" fill="#0b2a3d" opacity="0.5" />
        <rect x="570" y="326" width="22" height="48" fill="#8a6a43" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="570" y={332 + i * 10} width="22" height="1.5" fill="rgba(0,0,0,0.25)" />
        ))}
        {[490, 500, 690, 700, 520, 660].map((x, i) => (
          <path key={x} d={`M${x} ${300 - (i % 3) * 10} q4 -16 8 -24`} stroke="#4d8a3e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ))}
        <rect x="540" y="380" width="100" height="26" rx="13" fill="#161B22" stroke="#58A6FF" strokeWidth="2" />
        <text x="590" y="398" textAnchor="middle" fontSize="16" fontWeight="600" fill="#F0F6FC">
          Pond
        </text>
      </g>
    </svg>
  );
}

export default function CityPanel({ me }: { me: Me }) {
  const [view, setView] = useState<View>("map");
  const [bucketOpen, setBucketOpen] = useState(false);
  const city = useCity(true);
  const data = city.data;
  const donated = data?.museum.length ?? 0;
  const total = data?.species.length ?? 40;

  const title = view === "museum" ? "Museo dei pesci" : view === "pond" ? "Il Pond" : "Città";
  const subtitle =
    view === "museum"
      ? "Tutti i pesci donati dal gruppo, con chi li ha pescati."
      : view === "pond"
        ? "Lancia l'esca, aspetta e recupera: ogni tanto ci vuole pazienza."
        : `Ciao ${me.nickname}! Scegli dove andare.`;

  return (
    <div data-testid="city-panel">
      <SectionHeader
        testId="city"
        title={title}
        subtitle={subtitle}
        action={
          view !== "map" ? (
            <Button variant="outline" size="lg" onClick={() => setView("map")} data-testid="city-back">
              <ArrowLeft /> Città
            </Button>
          ) : undefined
        }
      />
      {city.isPending ? (
        <SkeletonList />
      ) : city.isError || !data ? (
        <LoadError testId="city-error" />
      ) : (
        <>
          {view === "map" && (
            <div className="space-y-4">
              <CityMap onGo={setView} />
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setView("museum")} className="flex items-center gap-3 rounded-xl border border-[#30363D] bg-[#161B22] p-4 text-left transition-colors duration-150 hover:bg-[#1B222B]" data-testid="city-card-museum">
                  <div className="grid size-10 place-items-center rounded-lg bg-[#21262D] text-[#E3B341]">
                    <Landmark className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Museo</p>
                    <p className="text-xs text-[#8B949E]">
                      {donated}/{total} specie donate
                    </p>
                  </div>
                </button>
                <button type="button" onClick={() => setView("pond")} className="flex items-center gap-3 rounded-xl border border-[#30363D] bg-[#161B22] p-4 text-left transition-colors duration-150 hover:bg-[#1B222B]" data-testid="city-card-pond">
                  <div className="grid size-10 place-items-center rounded-lg bg-[#21262D] text-[#58A6FF]">
                    <Fish className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Pond</p>
                    <p className="text-xs text-[#8B949E]">
                      {data.bucket.length}/{data.bucket_limit} pesci nel secchio
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
          {view === "museum" && <Museum city={data} onBucket={() => setBucketOpen(true)} />}
          {view === "pond" && <Pond city={data} onBucket={() => setBucketOpen(true)} />}
          <Bucket open={bucketOpen} onClose={() => setBucketOpen(false)} city={data} />
        </>
      )}
    </div>
  );
}
