import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGames, useHomework, useLeaderboard, useNotices, usePolls } from "@/lib/queries";
import type { Me } from "@/lib/types";
import { ADVICE, GENERIC_LINES, greeting, LOOK_LINES, PET_LINES } from "./petLines";
import { usePetSettings } from "./petSettings";
import { PetSprite, type PetState } from "./PetSprite";

interface Announcement {
  id: string;
  text: string;
}

type Mode = "idle" | "walk" | "sleep";
type Align = "left" | "center" | "right";

const RECENT_MS = 3 * 24 * 3600 * 1000;
const SLEEP_AFTER_MS = 60_000;
const SCALE = { piccolo: 0.8, normale: 1, grande: 1.35 };

const baseSize = (width: number) => (width >= 1024 ? 144 : width >= 768 ? 120 : 100);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const seenKey = (memberId: string) => `studium:pet:seen:${memberId}`;

const loadSeen = (memberId: string): string[] => {
  try {
    return JSON.parse(localStorage.getItem(seenKey(memberId)) ?? "[]") as string[];
  } catch {
    return [];
  }
};

const saveSeen = (memberId: string, seen: string[]) => {
  try {
    localStorage.setItem(seenKey(memberId), JSON.stringify(seen.slice(-200)));
  } catch {
    return;
  }
};

export default function PetCompanion({ petId, me }: { petId: string; me: Me }) {
  const settings = usePetSettings();
  const homework = useHomework();
  const notices = useNotices();
  const polls = usePolls();
  const games = useGames();
  const board = useLeaderboard();

  const [vw, setVw] = useState(() => window.innerWidth);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [mode, setMode] = useState<Mode>("idle");
  const [hopping, setHopping] = useState(false);
  const [align, setAlign] = useState<Align>("center");
  const [bubble, setBubble] = useState<{ text: string; sleep: boolean } | null>(null);

  const size = Math.round(baseSize(vw) * SCALE[settings.size]);

  const wrap = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef<{ x: number; y: number; curious: boolean } | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const pausedUntil = useRef(0);
  const dwellUntil = useRef(0);
  const lastActive = useRef(Date.now());
  const modeRef = useRef<Mode>("idle");
  const facingRef = useRef<1 | -1>(1);
  const sizeRef = useRef(size);
  const areaRef = useRef(settings.area);
  const queue = useRef<Announcement[]>([]);
  const seen = useRef<string[]>(loadSeen(me.member_id));
  const lastLine = useRef("");
  const bubbleTimer = useRef<number | undefined>(undefined);
  const hopTimer = useRef<number | undefined>(undefined);
  const data = useRef({ board: board.data, homework: homework.data });
  const sayRef = useRef<(text: string) => void>(() => undefined);

  sizeRef.current = size;
  areaRef.current = settings.area;
  data.current = { board: board.data, homework: homework.data };

  const announcements = useMemo<Announcement[]>(() => {
    const now = Date.now();
    const recent = (iso: string) => now - new Date(iso).getTime() < RECENT_MS;
    const out: Announcement[] = [];
    (homework.data ?? []).forEach((h) => {
      if (h.completed) return;
      if (h.author !== me.nickname && recent(h.created_at)) out.push({ id: `hw:${h.id}`, text: `Oh guarda, ${h.author} ha messo un nuovo compito di ${h.subject}!` });
      const days = Math.round((new Date(h.due_date).getTime() - new Date(me.today).getTime()) / 86400000);
      if (days === 1) out.push({ id: `due1:${h.id}:${h.due_date}`, text: `Ricorda: il compito di ${h.subject} è per domani!` });
      if (days === 0) out.push({ id: `due0:${h.id}:${h.due_date}`, text: `Attenzione, oggi scade il compito di ${h.subject}!` });
    });
    (notices.data ?? []).forEach((n) => {
      if (n.author !== me.nickname && recent(n.created_at)) out.push({ id: `nt:${n.id}`, text: `${n.author} ha scritto in bacheca: «${n.title}»` });
    });
    (polls.data ?? []).forEach((p) => {
      if (p.author !== me.nickname && recent(p.created_at) && !p.my_vote) out.push({ id: `pl:${p.id}`, text: `C'è un nuovo sondaggio di ${p.author}: «${p.question}». Hai già votato?` });
    });
    (games.data ?? []).forEach((g) => {
      if (g.status === "published" && !g.is_mine && recent(g.created_at)) out.push({ id: `gm:${g.id}`, text: `Nuovo gioco nell'hub: «${g.title}» di ${g.author}!` });
    });
    return out;
  }, [homework.data, notices.data, polls.data, games.data, me.nickname, me.today]);

  useEffect(() => {
    const queued = new Set(queue.current.map((a) => a.id));
    announcements.forEach((a) => {
      if (!seen.current.includes(a.id) && !queued.has(a.id)) queue.current.push(a);
    });
  }, [announcements]);

  const bounds = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const mobile = w < 768;
    const sz = sizeRef.current;
    const top = (mobile ? 60 : 4) + 72;
    const maxY = Math.max(top, h - sz * 0.8 - (mobile ? 72 : 6));
    return { minX: 0, maxX: Math.max(0, w - sz), minY: areaRef.current === "basso" ? maxY : top, maxY };
  };

  const setModeIf = (next: Mode) => {
    if (modeRef.current !== next) {
      modeRef.current = next;
      setMode(next);
    }
  };

  const setFacingIf = (next: 1 | -1) => {
    if (facingRef.current !== next) {
      facingRef.current = next;
      setFacing(next);
    }
  };

  const faceTowards = (px: number) => {
    const dx = px - (pos.current.x + sizeRef.current / 2);
    if (Math.abs(dx) > 50) setFacingIf(dx > 0 ? 1 : -1);
  };

  const alignFor = (): Align => {
    const x = pos.current.x;
    const w = window.innerWidth;
    return x < 120 ? "left" : x > w - sizeRef.current - 120 ? "right" : "center";
  };

  const say = (text: string) => {
    const duration = 3800 + text.length * 45;
    setBubble({ text, sleep: false });
    setAlign(alignFor());
    if (pointer.current) faceTowards(pointer.current.x);
    pausedUntil.current = performance.now() + Math.min(duration, 7000);
    setModeIf("idle");
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble((b) => (b?.sleep ? b : null)), duration);
  };
  sayRef.current = say;

  const adviceLine = () => {
    const open = (data.current.homework ?? []).filter((h) => !h.completed).sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
    if (open && Math.random() < 0.5) {
      const days = Math.round((new Date(open.due_date).getTime() - new Date(me.today).getTime()) / 86400000);
      if (days <= 0) return `Consiglio: parti subito da ${open.subject}, scade oggi!`;
      if (days === 1) return `Consiglio: ${open.subject} è per domani, meglio iniziare adesso.`;
      return `Consiglio: ${open.subject} scade tra ${days} giorni, inizia con calma.`;
    }
    return pick(ADVICE);
  };

  const flavorLine = () => {
    const lines = [...(PET_LINES[petId] ?? []), ...GENERIC_LINES, greeting(new Date().getHours(), me.nickname)];
    const leader = data.current.board?.[0];
    if (leader && leader.total_points > 0) lines.push(`${leader.nickname} è primo in classifica con ${leader.total_points} punti!`);
    return pick(lines);
  };

  const randomLine = () => {
    let line = Math.random() < 0.38 ? adviceLine() : flavorLine();
    if (line === lastLine.current) line = flavorLine();
    lastLine.current = line;
    return line;
  };

  useLayoutEffect(() => {
    const b = bounds();
    pos.current = { x: b.minX + Math.random() * (b.maxX - b.minX), y: b.maxY };
    if (wrap.current) wrap.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
  }, []);

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const wake = () => {
      lastActive.current = Date.now();
      if (modeRef.current === "sleep") {
        setModeIf("idle");
        setBubble(null);
        dwellUntil.current = performance.now() + 1200;
        setHopping(true);
        window.clearTimeout(hopTimer.current);
        hopTimer.current = window.setTimeout(() => setHopping(false), 650);
      }
    };
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      if (modeRef.current === "idle") faceTowards(e.clientX);
      wake();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", wake, { passive: true });
    window.addEventListener("keydown", wake);
    window.addEventListener("wheel", wake, { passive: true });
    const drowsy = window.setInterval(() => {
      if (Date.now() - lastActive.current > SLEEP_AFTER_MS && modeRef.current !== "sleep") {
        target.current = null;
        setModeIf("sleep");
        setBubble({ text: "Zzz…", sleep: true });
        setAlign(alignFor());
      }
    }, 4000);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("wheel", wake);
      window.clearInterval(drowsy);
      window.clearTimeout(hopTimer.current);
      window.clearTimeout(bubbleTimer.current);
    };
  }, []);

  useEffect(() => {
    if (settings.chatter === "muto") return;
    const base = settings.chatter === "tanto" ? 15000 : 34000;
    let timer = 0;
    const tick = () => {
      if (modeRef.current !== "sleep") {
        const next = queue.current.shift();
        if (next) {
          seen.current = [...seen.current, next.id];
          saveSeen(me.member_id, seen.current);
          sayRef.current(next.text);
        } else {
          sayRef.current(randomLine());
        }
      }
      timer = window.setTimeout(tick, base * (0.7 + Math.random() * 0.6));
    };
    timer = window.setTimeout(tick, 4500 + Math.random() * 3000);
    return () => window.clearTimeout(timer);
  }, [settings.chatter, petId]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const speed = petId === "tartaruga" ? 40 : petId === "drago" ? 72 : petId === "dinosauro" ? 66 : petId === "panda" ? 48 : 62;
    let raf = 0;
    let last = performance.now();

    const randomPoint = () => {
      const b = bounds();
      let p = { x: 0, y: 0 };
      for (let i = 0; i < 8; i++) {
        p = { x: b.minX + Math.random() * (b.maxX - b.minX), y: b.minY + Math.random() * (b.maxY - b.minY) };
        if (Math.hypot(p.x - pos.current.x, p.y - pos.current.y) > 180) break;
      }
      return { ...p, curious: false };
    };

    const nearPointer = () => {
      const b = bounds();
      const ptr = pointer.current!;
      const sz = sizeRef.current;
      const side = Math.random() < 0.5 ? -1 : 1;
      return { x: clamp(ptr.x - sz / 2 + side * sz * 0.85, b.minX, b.maxX), y: clamp(ptr.y - sz * 0.4, b.minY, b.maxY), curious: true };
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const b = bounds();
      const paused = now < pausedUntil.current || modeRef.current === "sleep";
      if (!paused) {
        const t = target.current;
        if (t) {
          const dx = t.x - pos.current.x;
          const dy = t.y - pos.current.y;
          const dist = Math.hypot(dx, dy);
          const step = speed * dt;
          setModeIf("walk");
          if (Math.abs(dx) > 3) setFacingIf(dx > 0 ? 1 : -1);
          if (dist <= step) {
            pos.current = { x: t.x, y: t.y };
            target.current = null;
            dwellUntil.current = now + 1800 + Math.random() * 4200;
            setModeIf("idle");
            if (t.curious && pointer.current) {
              faceTowards(pointer.current.x);
              if (Math.random() < 0.6) sayRef.current(pick(LOOK_LINES));
            }
          } else {
            pos.current = { x: pos.current.x + (dx / dist) * step, y: pos.current.y + (dy / dist) * step };
          }
        } else if (now >= dwellUntil.current) {
          const r = Math.random();
          if (r < 0.58) target.current = randomPoint();
          else if (r < 0.76 && pointer.current) target.current = nearPointer();
          else {
            dwellUntil.current = now + 2500 + Math.random() * 4500;
            setModeIf("idle");
          }
        }
      }
      pos.current = { x: clamp(pos.current.x, b.minX, b.maxX), y: clamp(pos.current.y, b.minY, b.maxY) };
      if (wrap.current) wrap.current.style.transform = `translate3d(${pos.current.x.toFixed(1)}px, ${pos.current.y.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(frame);
    };

    dwellUntil.current = performance.now() + 1500 + Math.random() * 2000;
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [petId, settings.area]);

  const poke = () => {
    lastActive.current = Date.now();
    say(randomLine());
    setHopping(true);
    window.clearTimeout(hopTimer.current);
    hopTimer.current = window.setTimeout(() => setHopping(false), 650);
  };

  const state: PetState = hopping ? "hop" : mode;
  const bubblePos = align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2";

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" data-testid="pet-companion">
      <div ref={wrap} className="absolute left-0 top-0 will-change-transform" style={{ width: size }}>
        {bubble && (
          <div className={`absolute bottom-full mb-1 w-max max-w-[230px] ${bubblePos}`} data-testid="pet-bubble">
            <div className={bubble.sleep ? "rounded-full bg-[#21262D]/90 px-3 py-1 text-xs tracking-widest text-[#C9D1D9]" : "rounded-2xl bg-[#F0F6FC] px-3.5 py-2.5 text-[13px] leading-snug text-[#0D1117] shadow-lg"}>{bubble.text}</div>
          </div>
        )}
        <button type="button" onClick={poke} className="pointer-events-auto block w-full cursor-pointer" aria-label="Accarezza il pet" data-testid="pet-body">
          <PetSprite id={petId} state={state} facing={facing} />
        </button>
      </div>
    </div>
  );
}
