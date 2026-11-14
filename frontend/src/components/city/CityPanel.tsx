import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, X } from "lucide-react";
import type { Me } from "@/lib/api/types";
import { useCity } from "@/lib/domain/city";
import { Button } from "@/components/ui/button";
import { LoadError, SkeletonList } from "@/components/common";
import { getAmbient, setAmbient } from "@/lib/audio/ambient";
import { setSandboxUser } from "@/lib/runtime/sandbox";
import { useOverlay } from "@/lib/runtime/activity";
import AnimalRoom from "./animals/AnimalRoom";
import Bucket from "./shared/Bucket";
import CityMap from "./map/CityMap";
import Forest from "./animals/Forest";
import Museum from "./museum/Museum";
import MuseumRoom from "./museum/MuseumRoom";
import Pond from "./fishing/Pond";
import Stadium from "./stadium/Stadium";
import School from "./school/School";
import Dig from "./fossils/Dig";
import Shop from "./shop/Shop";
import Dungeon from "./dungeon/Dungeon";
import DungeonHub from "./dungeon/DungeonHub";
import { DUNGEONS, type DungeonId } from "@/lib/domain/dungeon";
import FossilRoom from "./fossils/FossilRoom";
import { ROOMS } from "./shared/rooms";

type View = "map" | "lobby" | "room" | "pond" | "forest" | "stadium" | "animals" | "school" | "dig" | "fossils" | "shop" | "dungeon" | "dungeonrun";

const TITLES: Record<View, string> = { map: "Città", lobby: "Museo", room: "Sala", pond: "Il Pond", forest: "La Foresta", stadium: "Lo Stadio", animals: "Sala animali", school: "Scuola", dig: "Sito di scavo", fossils: "Sala fossili", shop: "Negozio", dungeon: "Sotterranei", dungeonrun: "Sotterranei" };
const PARENT: Record<View, View | null> = { map: null, lobby: "map", room: "lobby", pond: "map", forest: "map", stadium: "map", animals: "lobby", school: "map", dig: "map", fossils: "lobby", shop: "map", dungeon: "map", dungeonrun: "dungeon" };
const SCAPE: Record<View, string> = { map: "city-map", lobby: "city-hall", room: "city-water", pond: "city-pond", forest: "city-forest", stadium: "city-map", animals: "city-meadow", school: "city-hall", dig: "city-meadow", fossils: "city-hall", shop: "city-hall", dungeon: "city-hall", dungeonrun: "city-hall" };
const BACK_LABEL: Record<View, string> = { map: "Esci", lobby: "Città", room: "Atrio", pond: "Città", forest: "Città", stadium: "Città", animals: "Atrio", school: "Città", dig: "Città", fossils: "Atrio", shop: "Città", dungeon: "Città", dungeonrun: "Ingresso" };

export default function CityPanel({ me, onClose }: { me: Me; onClose: () => void }) {
  const [view, setView] = useState<View>("map");
  const [dungeonId, setDungeonId] = useState<DungeonId>("cripta");
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [bucketOpen, setBucketOpen] = useState(false);
  const city = useCity(true);
  useOverlay(true);

  useEffect(() => {
    setSandboxUser(me.member_id, me.nickname);
  }, [me.member_id, me.nickname]);
  const data = city.data;
  const parent = PARENT[view];
  const roomName = useMemo(() => ROOMS.find((r) => r.id === roomId)?.name ?? TITLES.room, [roomId]);

  useEffect(() => {
    const prev = getAmbient();
    return () => setAmbient(prev);
  }, []);

  useEffect(() => {
    setAmbient(SCAPE[view]);
  }, [view]);

  const back = () => (parent ? setView(parent) : onClose());

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const fn = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("[data-slot='dialog-content']")) return;
      if (parent) setView(parent);
      else onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [parent, onClose]);

  const openRoom = (id: string) => {
    setRoomId(id);
    setView("room");
  };

  return createPortal(
    <div className="fixed inset-0 z-[45] flex flex-col bg-[#0D1117] pb-[env(safe-area-inset-bottom)] text-[#E6EDF3]" data-testid="city-screen">
      <header className="absolute inset-x-0 top-0 z-[5] flex h-12 items-center gap-2 bg-gradient-to-b from-black/80 to-transparent px-3">
        <Button variant="outline" size="lg" onClick={back} data-testid="city-back">
          <ArrowLeft /> {BACK_LABEL[view]}
        </Button>
        <h1 className="min-w-0 flex-1 truncate text-center text-sm font-semibold sm:text-base" data-testid="city-title">
          {view === "room" ? roomName : view === "dungeonrun" ? DUNGEONS[dungeonId].name : TITLES[view]}
        </h1>
        <Button variant="ghost" size="icon-lg" onClick={onClose} aria-label="Chiudi la città" data-testid="city-close">
          <X />
        </Button>
      </header>
      <div className="absolute inset-0">
        {city.isPending ? (
          <div className="p-4">
            <SkeletonList />
          </div>
        ) : city.isError || !data ? (
          <div className="p-4">
            <LoadError testId="city-error" />
          </div>
        ) : (
          <>
            {view === "map" && (
              <>
                <CityMap onGo={setView} />
              </>
            )}
            {view === "lobby" && <Museum city={data} onFish={() => openRoom(ROOMS[0].id)} onAnimals={() => setView("animals")} onFossils={() => setView("fossils")} onBucket={() => setBucketOpen(true)} onExit={() => setView("map")} />}
            {view === "room" && <MuseumRoom key={roomId} city={data} roomId={roomId} onRoom={setRoomId} onAtrium={() => setView("lobby")} onBucket={() => setBucketOpen(true)} />}
            {view === "pond" && <Pond city={data} onBucket={() => setBucketOpen(true)} />}
            {view === "animals" && <AnimalRoom />}
            {view === "forest" && <Forest />}
            {view === "school" && <School memberId={me.member_id} />}
            {view === "dig" && <Dig />}
            {view === "shop" && <Shop city={data} participating={me.participating} onExit={() => setView("map")} />}
            {view === "fossils" && <FossilRoom onAtrium={() => setView("lobby")} />}
            {view === "stadium" && <Stadium />}
            {view === "dungeon" && <DungeonHub memberId={me.member_id} onRun={(id) => { setDungeonId(id); setView("dungeonrun"); }} onShop={() => setView("shop")} />}
            {view === "dungeonrun" && <Dungeon key={dungeonId} dungeonId={dungeonId} onExit={() => setView("dungeon")} />}
            <Bucket open={bucketOpen} onClose={() => setBucketOpen(false)} city={data} />
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
