import random
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from lib.db import db
from lib.dungeon import DUNGEONS, DUNGEONS_BY_ID, LOOT, LOOT_BY_ID, LOOT_LIMIT, MAX_KILLS_PER_FLOOR, MIN_SECONDS_PER_FLOOR, TROPHIES, TROPHIES_BY_ID, roll_loot, roll_trophies
from lib.dungeon_gear import ABILITIES, ABILITIES_BY_ID, CAPES, CLASSES, CLASSES_BY_ID, GEAR, GEAR_BY_ID, HAIRS, LEVEL_XP, MAX_LEVEL, SKINS, STARTER, abilities_for, ability_slots, build_loadout, default_abilities, duplicate_value, level_for, look_valid, roll_gear, usable_gear, xp_gain
from lib.gate import feature_gate
from lib.security import new_id, now_iso

router = APIRouter()

city_member = feature_gate("citta")


class StartRequest(BaseModel):
    dungeon_id: str


class StartOut(BaseModel):
    run_id: str
    loadout: dict


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
    xp: int = 0
    level: int = 1
    leveled: bool = False
    new_abilities: list[str] = Field(default_factory=list)
    gear: list[str] = Field(default_factory=list)
    gear_refund: int = 0


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


class CharOut(BaseModel):
    name: str
    cls: str
    look: dict
    xp: int
    level: int
    xp_base: int
    xp_next: Optional[int]
    equip: dict[str, Optional[str]]
    abilities: list[str]
    slots: int


class ClassOut(BaseModel):
    id: str
    name: str
    icon: str
    color: str
    blurb: str
    hp: int
    atk: int
    crit: int
    slots: int
    weapon_kind: str


class AbilityOut(BaseModel):
    id: str
    cls: str
    name: str
    icon: str
    kind: str
    power: int
    cd: int
    unlock: int
    text: str
    amount: int
    turns: int
    n: int
    radius: int
    range: int


class GearOut(BaseModel):
    id: str
    name: str
    slot: str
    rarity: str
    shape: str
    color: str
    stats: dict[str, int]
    source: str
    classes: list[str]
    price: int
    owned: bool
    usable: bool
    how: str


class CreateCharRequest(BaseModel):
    name: str = Field(min_length=2, max_length=16)
    cls: str
    look: dict = Field(default_factory=dict)


class LookRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=16)
    look: dict = Field(default_factory=dict)


class EquipRequest(BaseModel):
    slot: str
    gear_id: Optional[str] = None


class AbilitiesRequest(BaseModel):
    ids: list[str] = Field(max_length=4)


class BuyGearRequest(BaseModel):
    gear_id: str


class HubOut(BaseModel):
    dungeons: list[DungeonOut]
    items: list[LootOut]
    trophies: list[TrophyOut]
    bag: dict[str, int]
    bag_limit: int
    mine: list[str]
    hunters: list[HunterOut]
    char: Optional[CharOut] = None
    classes: list[ClassOut] = Field(default_factory=list)
    abilities: list[AbilityOut] = Field(default_factory=list)
    gear: list[GearOut] = Field(default_factory=list)
    money: int = 0
    looks: dict = Field(default_factory=dict)


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


async def get_char(member_id: str) -> Optional[dict]:
    return await db.dungeon_chars.find_one({"member_id": member_id}, {"_id": 0})


async def owned_gear(member_id: str) -> set[str]:
    return {d["gear_id"] async for d in db.dungeon_gear.find({"member_id": member_id}, {"_id": 0, "gear_id": 1})}


async def member_trophies(member_id: str) -> set[str]:
    return {d["trophy_id"] async for d in db.dungeon_trophies.find({"member_id": member_id}, {"_id": 0, "trophy_id": 1})}


async def wallet_money(member: dict) -> int:
    doc = await db.city_wallets.find_one({"member_id": member["id"]}, {"_id": 0, "money": 1})
    return int((doc or {}).get("money", 0))


def how_text(g: dict) -> str:
    if g["source"] == "start":
        return "Equipaggiamento iniziale"
    if g["source"] == "shop":
        return f"In vendita per {g['price']} monete"
    if g["source"] == "unlock":
        r = g["unlock"]
        if r["type"] == "wins":
            return f"Si sblocca vincendo {r['n']} volte: {DUNGEONS_BY_ID[r['dungeon']]['name']}"
        if r["type"] == "trophy":
            return f"Si sblocca con il trofeo: {TROPHIES_BY_ID[r['id']]['name']}"
        if r["type"] == "best":
            return f"Si sblocca arrivando al piano {r['n']}: {DUNGEONS_BY_ID[r['dungeon']]['name']}"
        return f"Si sblocca al livello {r['n']}"
    return f"Si trova soltanto nel dungeon: {DUNGEONS_BY_ID[g['drop']['dungeon']]['name']}"


def char_out(char: dict) -> CharOut:
    xp = int(char.get("xp", 0))
    level = level_for(xp)
    slots = ability_slots(level)
    chosen = [a for a in char.get("abilities", []) if a in ABILITIES_BY_ID and ABILITIES_BY_ID[a]["cls"] == char["cls"] and ABILITIES_BY_ID[a]["unlock"] <= level][:slots]
    if not chosen:
        chosen = default_abilities(char["cls"], level)
    return CharOut(
        name=char["name"],
        cls=char["cls"],
        look=char["look"],
        xp=xp,
        level=level,
        xp_base=LEVEL_XP[level],
        xp_next=LEVEL_XP[level + 1] if level < MAX_LEVEL else None,
        equip={"weapon": char.get("equip", {}).get("weapon"), "armor": char.get("equip", {}).get("armor")},
        abilities=chosen,
        slots=slots,
    )


async def equipped_gear(char: dict, owned: set[str], records: dict, trophies: set[str]) -> dict[str, Optional[dict]]:
    level = level_for(int(char.get("xp", 0)))
    out: dict[str, Optional[dict]] = {}
    for slot in ("weapon", "armor"):
        gid = (char.get("equip") or {}).get(slot)
        g = GEAR_BY_ID.get(gid) if gid else None
        if g and g["slot"] == slot and usable_gear(g, char["cls"], owned, records, trophies, level):
            out[slot] = g
        else:
            out[slot] = GEAR_BY_ID[STARTER[slot][char["cls"]]]
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
    char = await get_char(member["id"])
    owned = await owned_gear(member["id"])
    mine_trophies = set(by_member.get(member["id"], []))
    level = level_for(int(char.get("xp", 0))) if char else 1
    rec_plain = {k: {"best": v.best, "wins": v.wins} for k, v in recs.items()}
    cls_id = char["cls"] if char else None
    gear_out = [
        GearOut(
            id=g["id"],
            name=g["name"],
            slot=g["slot"],
            rarity=g["rarity"],
            shape=g["shape"],
            color=g["color"],
            stats=g["stats"],
            source=g["source"],
            classes=g["classes"],
            price=g["price"],
            owned=g["id"] in owned,
            usable=bool(cls_id) and usable_gear(g, cls_id, owned, rec_plain, mine_trophies, level),
            how=how_text(g),
        )
        for g in GEAR
    ]
    return HubOut(
        dungeons=[DungeonOut(id=d["id"], name=d["name"], tag=d["tag"], blurb=d["blurb"], floors=d["floors"], record=recs.get(d["id"], RecordOut(best=0, wins=0, runs=0))) for d in DUNGEONS],
        items=[LootOut(**{k: i[k] for k in ("id", "name", "rarity", "shape", "color", "value")}) for i in LOOT],
        trophies=[TrophyOut(**{k: t[k] for k in ("id", "name", "dungeon", "enemy", "rarity", "art", "color", "blurb")}) for t in TROPHIES],
        bag=await wallet_bag(member),
        bag_limit=LOOT_LIMIT,
        mine=by_member.get(member["id"], []),
        hunters=hunters,
        char=char_out(char) if char else None,
        classes=[ClassOut(**{k: c[k] for k in ("id", "name", "icon", "color", "blurb", "hp", "atk", "crit", "slots", "weapon_kind")}) for c in CLASSES],
        abilities=[AbilityOut(**{k: a[k] for k in ("id", "cls", "name", "icon", "kind", "power", "cd", "unlock", "text", "amount", "turns", "n", "radius", "range")}) for a in ABILITIES],
        gear=gear_out,
        money=await wallet_money(member),
        looks={"skins": SKINS, "hairs": HAIRS, "capes": CAPES},
    )


@router.post("/dungeon/start", response_model=StartOut)
async def start_run(body: StartRequest, member: dict = Depends(city_member)):
    if body.dungeon_id not in DUNGEONS_BY_ID:
        raise HTTPException(status_code=404, detail="Dungeon non trovato")
    char = await get_char(member["id"])
    if not char:
        raise HTTPException(status_code=409, detail="Crea prima il tuo personaggio")
    recs = await records_of(member["id"])
    rec_plain = {k: {"best": v.best, "wins": v.wins} for k, v in recs.items()}
    gear = await equipped_gear(char, await owned_gear(member["id"]), rec_plain, await member_trophies(member["id"]))
    run = {"id": new_id(), "member_id": member["id"], "dungeon_id": body.dungeon_id, "started": time.time()}
    await db.dungeon_runs.replace_one({"member_id": member["id"]}, run, upsert=True)
    return StartOut(run_id=run["id"], loadout=build_loadout(char, gear))


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
    xp_got = 0
    level_now = 1
    leveled = False
    new_abilities: list[str] = []
    drops: list[str] = []
    refund = 0
    char = await get_char(member["id"])
    if char:
        before = level_for(int(char.get("xp", 0)))
        xp_got = xp_gain(cleared, sum(kills.values()), won)
        total_xp = int(char.get("xp", 0)) + xp_got
        level_now = level_for(total_xp)
        leveled = level_now > before
        if leveled:
            new_abilities = [a for a in abilities_for(char["cls"], level_now) if a not in abilities_for(char["cls"], before)]
        await db.dungeon_chars.update_one({"member_id": member["id"]}, {"$set": {"xp": total_xp}})
        have = await owned_gear(member["id"])
        for gid in roll_gear(dungeon["id"], floors, cleared, won, have):
            g = GEAR_BY_ID[gid]
            try:
                await db.dungeon_gear.insert_one({"id": new_id(), "member_id": member["id"], "group_id": member["group_id"], "gear_id": gid, "how": "drop", "found_at": now_iso()})
                drops.append(gid)
            except DuplicateKeyError:
                refund += duplicate_value(g)
        if refund:
            await ensure_wallet(member)
            await db.city_wallets.update_one({"member_id": member["id"]}, {"$inc": {"money": refund}})
    return FinishOut(roll=roll, loot=kept, lost=lost, trophies=new_trophies, record=RecordOut(**rec), xp=xp_got, level=level_now, leveled=leveled, new_abilities=new_abilities, gear=drops, gear_refund=refund)


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


@router.post("/dungeon/char", response_model=CharOut)
async def create_char(body: CreateCharRequest, member: dict = Depends(city_member)):
    if body.cls not in CLASSES_BY_ID:
        raise HTTPException(status_code=400, detail="Classe non valida")
    if await get_char(member["id"]):
        raise HTTPException(status_code=409, detail="Hai già un personaggio")
    name = body.name.strip()
    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Il nome è troppo corto")
    doc = {
        "id": new_id(),
        "member_id": member["id"],
        "group_id": member["group_id"],
        "name": name,
        "cls": body.cls,
        "look": look_valid(body.look),
        "xp": 0,
        "equip": {"weapon": STARTER["weapon"][body.cls], "armor": STARTER["armor"][body.cls]},
        "abilities": default_abilities(body.cls, 1),
        "created_at": now_iso(),
    }
    try:
        await db.dungeon_chars.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Hai già un personaggio")
    return char_out(doc)


@router.patch("/dungeon/char", response_model=CharOut)
async def edit_char(body: LookRequest, member: dict = Depends(city_member)):
    char = await get_char(member["id"])
    if not char:
        raise HTTPException(status_code=404, detail="Non hai ancora un personaggio")
    upd: dict = {"look": look_valid({**char["look"], **body.look})}
    if body.name:
        upd["name"] = body.name.strip()
    await db.dungeon_chars.update_one({"member_id": member["id"]}, {"$set": upd})
    return char_out({**char, **upd})


@router.delete("/dungeon/char")
async def reset_char(member: dict = Depends(city_member)):
    await db.dungeon_chars.delete_one({"member_id": member["id"]})
    return {"ok": True}


@router.post("/dungeon/char/equip", response_model=CharOut)
async def equip(body: EquipRequest, member: dict = Depends(city_member)):
    char = await get_char(member["id"])
    if not char:
        raise HTTPException(status_code=404, detail="Non hai ancora un personaggio")
    if body.slot not in ("weapon", "armor"):
        raise HTTPException(status_code=400, detail="Slot non valido")
    gid = body.gear_id
    if gid is None:
        gid = STARTER[body.slot][char["cls"]]
    g = GEAR_BY_ID.get(gid)
    if not g or g["slot"] != body.slot:
        raise HTTPException(status_code=400, detail="Oggetto non valido")
    recs = await records_of(member["id"])
    rec_plain = {k: {"best": v.best, "wins": v.wins} for k, v in recs.items()}
    if not usable_gear(g, char["cls"], await owned_gear(member["id"]), rec_plain, await member_trophies(member["id"]), level_for(int(char.get("xp", 0)))):
        raise HTTPException(status_code=403, detail="Non puoi ancora usare questo oggetto")
    equip_doc = {**(char.get("equip") or {}), body.slot: gid}
    await db.dungeon_chars.update_one({"member_id": member["id"]}, {"$set": {"equip": equip_doc}})
    return char_out({**char, "equip": equip_doc})


@router.post("/dungeon/char/abilities", response_model=CharOut)
async def set_abilities(body: AbilitiesRequest, member: dict = Depends(city_member)):
    char = await get_char(member["id"])
    if not char:
        raise HTTPException(status_code=404, detail="Non hai ancora un personaggio")
    level = level_for(int(char.get("xp", 0)))
    ids = list(dict.fromkeys(body.ids))
    if len(ids) > ability_slots(level):
        raise HTTPException(status_code=400, detail="Hai meno slot abilità di così")
    for a in ids:
        spec = ABILITIES_BY_ID.get(a)
        if not spec or spec["cls"] != char["cls"] or spec["unlock"] > level:
            raise HTTPException(status_code=403, detail="Abilità non disponibile")
    await db.dungeon_chars.update_one({"member_id": member["id"]}, {"$set": {"abilities": ids}})
    return char_out({**char, "abilities": ids})


@router.post("/dungeon/gear/buy")
async def buy_gear(body: BuyGearRequest, member: dict = Depends(city_member)):
    g = GEAR_BY_ID.get(body.gear_id)
    if not g or g["source"] != "shop":
        raise HTTPException(status_code=404, detail="Oggetto non in vendita")
    if g["id"] in await owned_gear(member["id"]):
        raise HTTPException(status_code=409, detail="Lo possiedi già")
    await ensure_wallet(member)
    res = await db.city_wallets.update_one({"member_id": member["id"], "money": {"$gte": g["price"]}}, {"$inc": {"money": -g["price"]}})
    if res.modified_count == 0:
        raise HTTPException(status_code=409, detail="Monete insufficienti")
    try:
        await db.dungeon_gear.insert_one({"id": new_id(), "member_id": member["id"], "group_id": member["group_id"], "gear_id": g["id"], "how": "shop", "found_at": now_iso()})
    except DuplicateKeyError:
        await db.city_wallets.update_one({"member_id": member["id"]}, {"$inc": {"money": g["price"]}})
        raise HTTPException(status_code=409, detail="Lo possiedi già")
    return {"ok": True, "money": await wallet_money(member)}
