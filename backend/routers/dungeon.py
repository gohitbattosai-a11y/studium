import random
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from lib.db import db
from lib.dungeon import DUNGEONS, DUNGEONS_BY_ID, LOOT, LOOT_BY_ID, LOOT_LIMIT, MAX_KILLS_PER_FLOOR, MIN_SECONDS_PER_FLOOR, TROPHIES, TROPHIES_BY_ID, roll_loot, roll_trophies
from lib.gate import feature_gate
from lib.security import new_id, now_iso

router = APIRouter()

city_member = feature_gate("citta")


class StartRequest(BaseModel):
    dungeon_id: str


class StartOut(BaseModel):
    run_id: str


class FinishRequest(BaseModel):
    run_id: str
    cleared: int = Field(ge=0, le=10)
    won: bool = False
    kills: dict[str, int] = Field(default_factory=dict)


class RecordOut(BaseModel):
    best: int
    wins: int
    runs: int


class FinishOut(BaseModel):
    roll: int
    loot: list[str]
    lost: int
    trophies: list[str]
    record: RecordOut


class SellLine(BaseModel):
    item_id: str
    qty: int = Field(ge=1, le=99)


class SellRequest(BaseModel):
    items: list[SellLine] = Field(min_length=1, max_length=40)


class SellOut(BaseModel):
    earned: int
    bag: dict[str, int]


class LootOut(BaseModel):
    id: str
    name: str
    rarity: str
    shape: str
    color: str
    value: int


class TrophyOut(BaseModel):
    id: str
    name: str
    dungeon: str
    enemy: str
    rarity: str
    art: str
    color: str
    blurb: str


class DungeonOut(BaseModel):
    id: str
    name: str
    tag: str
    blurb: str
    floors: int
    record: RecordOut


class HunterOut(BaseModel):
    member_id: str
    nickname: str
    trophies: list[str]


class HubOut(BaseModel):
    dungeons: list[DungeonOut]
    items: list[LootOut]
    trophies: list[TrophyOut]
    bag: dict[str, int]
    bag_limit: int
    mine: list[str]
    hunters: list[HunterOut]


def bag_total(bag: dict) -> int:
    return sum(int(v) for v in bag.values())


async def wallet_bag(member: dict) -> dict[str, int]:
    doc = await db.city_wallets.find_one({"member_id": member["id"]}, {"_id": 0, "loot": 1})
    return {k: int(v) for k, v in ((doc or {}).get("loot") or {}).items() if int(v) > 0}


async def ensure_wallet(member: dict) -> None:
    fresh = {"group_id": member["group_id"], "money": 0, "stock": {}, "upgrades": {}, "conv": {"date": "", "points": 0}}
    try:
        await db.city_wallets.update_one({"member_id": member["id"]}, {"$setOnInsert": fresh}, upsert=True)
    except DuplicateKeyError:
        pass


async def records_of(member_id: str) -> dict[str, RecordOut]:
    out: dict[str, RecordOut] = {}
    async for r in db.dungeon_records.find({"member_id": member_id}, {"_id": 0}):
        out[r["dungeon_id"]] = RecordOut(best=r.get("best", 0), wins=r.get("wins", 0), runs=r.get("runs", 0))
    return out


@router.get("/dungeon", response_model=HubOut)
async def get_hub(member: dict = Depends(city_member)):
    recs = await records_of(member["id"])
    docs = await db.dungeon_trophies.find({"group_id": member["group_id"]}, {"_id": 0}).to_list(3000)
    by_member: dict[str, list[str]] = {}
    for d in docs:
        by_member.setdefault(d["member_id"], []).append(d["trophy_id"])
    names = {m["id"]: m["nickname"] async for m in db.members.find({"id": {"$in": list(by_member)}}, {"_id": 0, "id": 1, "nickname": 1})}
    hunters = [HunterOut(member_id=mid, nickname=names.get(mid, "?"), trophies=ids) for mid, ids in by_member.items() if mid in names]
    hunters.sort(key=lambda h: (-len(h.trophies), h.nickname.casefold()))
    return HubOut(
        dungeons=[DungeonOut(id=d["id"], name=d["name"], tag=d["tag"], blurb=d["blurb"], floors=d["floors"], record=recs.get(d["id"], RecordOut(best=0, wins=0, runs=0))) for d in DUNGEONS],
        items=[LootOut(**{k: i[k] for k in ("id", "name", "rarity", "shape", "color", "value")}) for i in LOOT],
        trophies=[TrophyOut(**{k: t[k] for k in ("id", "name", "dungeon", "enemy", "rarity", "art", "color", "blurb")}) for t in TROPHIES],
        bag=await wallet_bag(member),
        bag_limit=LOOT_LIMIT,
        mine=by_member.get(member["id"], []),
        hunters=hunters,
    )


@router.post("/dungeon/start", response_model=StartOut)
async def start_run(body: StartRequest, member: dict = Depends(city_member)):
    if body.dungeon_id not in DUNGEONS_BY_ID:
        raise HTTPException(status_code=404, detail="Dungeon non trovato")
    run = {"id": new_id(), "member_id": member["id"], "dungeon_id": body.dungeon_id, "started": time.time()}
    await db.dungeon_runs.replace_one({"member_id": member["id"]}, run, upsert=True)
    return StartOut(run_id=run["id"])


@router.post("/dungeon/finish", response_model=FinishOut)
async def finish_run(body: FinishRequest, member: dict = Depends(city_member)):
    run = await db.dungeon_runs.find_one_and_delete({"member_id": member["id"], "id": body.run_id}, {"_id": 0})
    if not run:
        raise HTTPException(status_code=404, detail="Discesa non valida o già conclusa")
    dungeon = DUNGEONS_BY_ID[run["dungeon_id"]]
    floors = dungeon["floors"]
    cleared = min(body.cleared, floors)
    won = body.won and cleared >= floors
    elapsed = time.time() - run["started"]
    if elapsed < MIN_SECONDS_PER_FLOOR * max(0, cleared - 1) + (6 if cleared else 0):
        cleared = 0
        won = False
    kills: dict[str, int] = {}
    cap = MAX_KILLS_PER_FLOOR * floors
    for kind, n in body.kills.items():
        if kind in dungeon["enemies"] and n > 0:
            kills[kind] = min(int(n), cap)
    boss = dungeon["enemies"][-1]
    if won:
        kills[boss] = 1
    else:
        kills.pop(boss, None)
    roll = random.randint(1, 6)
    items = roll_loot(dungeon, cleared, won, roll)
    await ensure_wallet(member)
    bag = await wallet_bag(member)
    room = LOOT_LIMIT - bag_total(bag)
    kept = items[: max(0, room)]
    lost = len(items) - len(kept)
    if kept:
        inc: dict[str, int] = {}
        for i in kept:
            inc[f"loot.{i}"] = inc.get(f"loot.{i}", 0) + 1
        await db.city_wallets.update_one({"member_id": member["id"]}, {"$inc": inc})
    owned = {d["trophy_id"] async for d in db.dungeon_trophies.find({"member_id": member["id"]}, {"_id": 0, "trophy_id": 1})}
    new_trophies: list[str] = []
    for tid in roll_trophies(dungeon["id"], kills, won, owned):
        doc = {"id": new_id(), "member_id": member["id"], "group_id": member["group_id"], "trophy_id": tid, "dungeon_id": dungeon["id"], "found_at": now_iso()}
        try:
            await db.dungeon_trophies.insert_one(doc)
            new_trophies.append(tid)
        except DuplicateKeyError:
            pass
    prev = await db.dungeon_records.find_one({"member_id": member["id"], "dungeon_id": dungeon["id"]}, {"_id": 0}) or {}
    rec = {"best": max(int(prev.get("best", 0)), cleared), "wins": int(prev.get("wins", 0)) + (1 if won else 0), "runs": int(prev.get("runs", 0)) + 1}
    await db.dungeon_records.update_one({"member_id": member["id"], "dungeon_id": dungeon["id"]}, {"$set": {**rec, "group_id": member["group_id"]}}, upsert=True)
    return FinishOut(roll=roll, loot=kept, lost=lost, trophies=new_trophies, record=RecordOut(**rec))


@router.post("/dungeon/sell", response_model=SellOut)
async def sell_loot(body: SellRequest, member: dict = Depends(city_member)):
    want: dict[str, int] = {}
    for line in body.items:
        if line.item_id not in LOOT_BY_ID:
            raise HTTPException(status_code=400, detail="Oggetto non valido")
        want[line.item_id] = want.get(line.item_id, 0) + line.qty
    await ensure_wallet(member)
    flt: dict = {"member_id": member["id"]}
    for item_id, qty in want.items():
        flt[f"loot.{item_id}"] = {"$gte": qty}
    total = sum(LOOT_BY_ID[i]["value"] * q for i, q in want.items())
    inc = {f"loot.{i}": -q for i, q in want.items()}
    inc["money"] = total
    res = await db.city_wallets.update_one(flt, {"$inc": inc})
    if res.modified_count == 0:
        raise HTTPException(status_code=409, detail="Non hai più questi oggetti")
    return SellOut(earned=total, bag=await wallet_bag(member))
