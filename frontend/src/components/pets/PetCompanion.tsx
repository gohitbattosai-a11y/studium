import { useEffect, useMemo, useRef, useState } from "react";
import { useGames, useHomework, useLeaderboard, useNotices, usePolls } from "@/lib/queries";
import type { Me } from "@/lib/types";
import { GENERIC_LINES, greeting, PET_LINES } from "./petLines";
import { usePetSettings } from "./petSettings";
import { PetSprite } from "./PetSprite";

interface Announcement {
  id: string;
  text: string;
}

const SPEED = 46;
const RECENT_MS = 3 * 24 * 3600 * 1000;

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

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export default function PetCompanion({ petId, me }: { petId: string; me: Me }) {
  const settings = usePetSettings();
  const homework = useHomework();
  const notices = useNotices();
  const polls = usePolls();
  const games = useGames();
  const board = useLeaderboard();

  const [x, setX] = useState(() => 280 + Math.random() * 200);
  const [duration, setDuration] = useState(0);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [walking, setWalking] = useState(false);
  const [hopping, setHopping] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);

  const xRef = useRef(x);
  const queue = useRef<Announcement[]>([]);
  const seen = useRef<string[]>(loadSeen(me.member_id));
  const lastLine = useRef("");
  const bubbleTimer = useRef<number | undefined>(undefined);
  const hopTimer = useRef<number | undefined>(undefined);
  const dataRef = useRef({ board: board.data });
  dataRef.current = { board: board.data };

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

  const say = (text: string) => {
    setBubble(text);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 3800 + text.length * 45);
  };

  const randomLine = () => {
    const lines = [...(PET_LINES[petId] ?? []), ...GENERIC_LINES, greeting(new Date().getHours(), me.nickname)];
    const leader = dataRef.current.board?.[0];
    if (leader && leader.total_points > 0) lines.push(`${leader.nickname} è primo in classifica con ${leader.total_points} punti!`);
    let line = pick(lines);
    if (line === lastLine.current) line = pick(lines);
    lastLine.current = line;
    return line;
  };

  useEffect(() => {
    if (settings.chatter === "muto") return;
    const base = settings.chatter === "tanto" ? 15000 : 36000;
    let timer = 0;
    const tick = () => {
      const next = queue.current.shift();
      if (next) {
        seen.current = [...seen.current, next.id];
        saveSeen(me.member_id, seen.current);
        say(next.text);
      } else {
        say(randomLine());
      }
      timer = window.setTimeout(tick, base * (0.7 + Math.random() * 0.6));
    };
    timer = window.setTimeout(tick, 4500 + Math.random() * 3000);
    return () => window.clearTimeout(timer);
  }, [settings.chatter, petId]);

  useEffect(() => {
    let timer = 0;
    const slow = petId === "tartaruga" ? 0.55 : petId === "drago" ? 1.1 : 1;
    const step = () => {
      const width = window.innerWidth;
      const min = width >= 768 ? 268 : 8;
      const max = Math.max(min, width - 92);
      const target = min + Math.random() * (max - min);
      const dist = Math.abs(target - xRef.current);
      if (dist < 40) {
        timer = window.setTimeout(step, 1200);
        return;
      }
      const seconds = dist / (SPEED * slow);
      setFacing(target >= xRef.current ? 1 : -1);
      setDuration(seconds);
      setWalking(true);
      setX(target);
      xRef.current = target;
      timer = window.setTimeout(() => {
        setWalking(false);
        timer = window.setTimeout(step, 2500 + Math.random() * 6000);
      }, seconds * 1000);
    };
    timer = window.setTimeout(step, 1500 + Math.random() * 2000);
    return () => window.clearTimeout(timer);
  }, [petId]);

  useEffect(() => {
    const keep = () => {
      const max = Math.max(8, window.innerWidth - 92);
      if (xRef.current > max) {
        xRef.current = max;
        setDuration(0);
        setX(max);
      }
    };
    window.addEventListener("resize", keep);
    return () => {
      window.removeEventListener("resize", keep);
      window.clearTimeout(bubbleTimer.current);
      window.clearTimeout(hopTimer.current);
    };
  }, []);

  const poke = () => {
    say(randomLine());
    setHopping(true);
    window.clearTimeout(hopTimer.current);
    hopTimer.current = window.setTimeout(() => setHopping(false), 650);
  };

  const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
  const align = x < 110 ? "left-0" : x > vw - 200 ? "right-0" : "left-1/2 -translate-x-1/2";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 md:bottom-1" data-testid="pet-companion">
      <div className="relative w-[68px] md:w-[84px]" style={{ transform: `translateX(${x}px)`, transition: `transform ${duration}s linear` }}>
        {bubble && (
          <div className={`absolute bottom-full mb-1 w-max max-w-[210px] ${align}`} data-testid="pet-bubble">
            <div className="rounded-xl bg-[#F0F6FC] px-3 py-2 text-xs leading-snug text-[#0D1117] shadow-lg">{bubble}</div>
          </div>
        )}
        <button type="button" onClick={poke} className="pointer-events-auto block w-full cursor-pointer" aria-label="Accarezza il pet" data-testid="pet-body">
          <PetSprite id={petId} state={hopping ? "hop" : walking ? "walk" : "idle"} facing={facing} />
        </button>
      </div>
    </div>
  );
}
