from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from lib.cityshop import CONSUMABLE_CATEGORIES, DAILY_POINTS_CAP, ITEMS, ITEMS_BY_ID, KIND_MULT, RARITY_BASE, RATE, SELL_BATCH_MAX, STACK_MAX, UPGRADES, UPGRADES_BY_ID, sell_value
from lib.dates import today_iso
from lib.db import db
from lib.fish import SPECIES_BY_ID
from lib.gate import feature_gate
from lib.security import TZ, new_id, now_iso

router = APIRouter()

city_member = feature_gate("citta")


class SellItem(BaseModel):
    kind: Literal["fish", "animal", "fossil"]
    species_id: Optional[str] = None
    length: Optional[float] = None
    rarity: Optional[str] = None
    factor: Optional[float] = None


class SellRequest(BaseModel):
    items: list[SellItem] = Field(min_length=1, max_length=SELL_BATCH_MAX)


class BuyRequest(BaseModel):
    item_id: str
    qty: int = Field(default=1, ge=1, le=20)


class UseRequest(BaseModel):
    item_id: str


class UpgradeRequest(BaseModel):
    upgrade_id: str


class ConvertRequest(BaseModel):
    points: int = Field(ge=1, le=10)


class ItemOut(BaseModel):
    id: str
    category: str
    name: str
    description: str
    price: int
    owned: int
    boost: Optional[float] = None
    energy: Optional[int] = None
    millions: Optional[int] = None


class UpgradeOut(BaseModel):
    id: str
    name: str
    description: str
    level: int
    max_level: int
    next_price: Optional[int]


class ConvertOut(BaseModel):
    rate: int
    daily_cap: int
    left_today: int


class ShopOut(BaseModel):
    money: int
    items: list[ItemOut]
    upgrades: list[UpgradeOut]
    convert: ConvertOut
    earned: Optional[int] = None
    granted: Optional[int] = None


async def wallet_of(member: dict) -> dict:
    query = {"member_id": member["id"]}
    doc = await db.city_wallets.find_one(query, {"_id": 0})
    if doc:
        return doc
    fresh = {"member_id": member["id"], "group_id": member["group_id"], "money": 0, "stock": {}, "upgrades": {}, "conv": {"date": "", "points": 0}}
    try:
        await db.city_wallets.insert_one(dict(fresh))
    except DuplicateKeyError:
        pass
    return await db.city_wallets.find_one(query, {"_id": 0}) or fresh


def left_today(wallet: dict) -> int:
    conv = wallet.get("conv") or {}
    used = conv.get("points", 0) if conv.get("date") == today_iso(TZ) else 0
    return max(0, DAILY_POINTS_CAP - used)


def state_of(wallet: dict, **extra) -> ShopOut:
    stock = wallet.get("stock") or {}
    levels = wallet.get("upgrades") or {}
    items = [
        ItemOut(
            id=i["id"],
            category=i["category"],
            name=i["name"],
            description=i["description"],
            price=i["price"],
            owned=int(stock.get(i["id"], 0)),
            boost=i.get("boost"),
            energy=i.get("energy"),
            millions=i.get("millions"),
        )
        for i in ITEMS
    ]
    upgrades = []
    for u in UPGRADES:
        lvl = int(levels.get(u["id"], 0))
        upgrades.append(
            UpgradeOut(id=u["id"], name=u["name"], description=u["description"], level=lvl, max_level=len(u["prices"]), next_price=u["prices"][lvl] if lvl < len(u["prices"]) else None)
        )
    return ShopOut(money=int(wallet.get("money", 0)), items=items, upgrades=upgrades, convert=ConvertOut(rate=RATE, daily_cap=DAILY_POINTS_CAP, left_today=left_today(wallet)), **extra)


def price_of(item: SellItem) -> int:
    if item.kind == "fish":
        sp = SPECIES_BY_ID.get(item.species_id or "")
        if not sp or item.length is None:
            raise HTTPException(status_code=400, detail="Pesce non valido")
        span = sp["max"] - sp["min"]
        factor = (item.length - sp["min"]) / span if span > 0 else 0.5
        return sell_value("fish", sp["rarity"], factor)
    if item.rarity not in RARITY_BASE or item.kind not in KIND_MULT:
        raise HTTPException(status_code=400, detail="Oggetto non valido")
    return sell_value(item.kind, item.rarity, item.factor if item.factor is not None else 0.5)


@router.get("/city/shop", response_model=ShopOut)
async def get_city_shop(member: dict = Depends(city_member)):
    return state_of(await wallet_of(member))


@router.post("/city/shop/sell", response_model=ShopOut)
async def sell(body: SellRequest, member: dict = Depends(city_member)):
    wallet = await wallet_of(member)
    total = sum(price_of(i) for i in body.items)
    await db.city_wallets.update_one({"member_id": member["id"]}, {"$inc": {"money": total}})
    wallet["money"] = int(wallet.get("money", 0)) + total
    return state_of(wallet, earned=total)


@router.post("/city/shop/buy", response_model=ShopOut)
async def buy(body: BuyRequest, member: dict = Depends(city_member)):
    item = ITEMS_BY_ID.get(body.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Oggetto non trovato")
    wallet = await wallet_of(member)
    cost = item["price"] * body.qty
    update: dict = {"$inc": {"money": -cost}}
    granted = None
    if item["category"] in CONSUMABLE_CATEGORIES:
        have = int((wallet.get("stock") or {}).get(item["id"], 0))
        if have + body.qty > STACK_MAX:
            raise HTTPException(status_code=409, detail="Ne hai già abbastanza")
        update["$inc"][f"stock.{item['id']}"] = body.qty
    else:
        if body.qty != 1:
            raise HTTPException(status_code=400, detail="Quantità non valida")
        granted = item["millions"]
    res = await db.city_wallets.update_one({"member_id": member["id"], "money": {"$gte": cost}}, update)
    if res.modified_count == 0:
        raise HTTPException(status_code=409, detail="Monete insufficienti")
    return state_of(await wallet_of(member), granted=granted)


@router.post("/city/shop/use", response_model=ShopOut)
async def use_item(body: UseRequest, member: dict = Depends(city_member)):
    item = ITEMS_BY_ID.get(body.item_id)
    if not item or item["category"] not in CONSUMABLE_CATEGORIES:
        raise HTTPException(status_code=404, detail="Oggetto non trovato")
    await wallet_of(member)
    res = await db.city_wallets.update_one({"member_id": member["id"], f"stock.{item['id']}": {"$gte": 1}}, {"$inc": {f"stock.{item['id']}": -1}})
    if res.modified_count == 0:
        raise HTTPException(status_code=409, detail="Non ne hai più")
    return state_of(await wallet_of(member))


@router.post("/city/shop/upgrade", response_model=ShopOut)
async def upgrade(body: UpgradeRequest, member: dict = Depends(city_member)):
    up = UPGRADES_BY_ID.get(body.upgrade_id)
    if not up:
        raise HTTPException(status_code=404, detail="Potenziamento non trovato")
    wallet = await wallet_of(member)
    lvl = int((wallet.get("upgrades") or {}).get(up["id"], 0))
    if lvl >= len(up["prices"]):
        raise HTTPException(status_code=409, detail="Già al livello massimo")
    cost = up["prices"][lvl]
    flt = {"member_id": member["id"], "money": {"$gte": cost}}
    flt[f"upgrades.{up['id']}"] = lvl if lvl > 0 else {"$in": [None, 0]}
    res = await db.city_wallets.update_one(flt, {"$inc": {"money": -cost}, "$set": {f"upgrades.{up['id']}": lvl + 1}})
    if res.modified_count == 0:
        raise HTTPException(status_code=409, detail="Monete insufficienti")
    return state_of(await wallet_of(member))


@router.post("/city/shop/convert", response_model=ShopOut)
async def convert(body: ConvertRequest, member: dict = Depends(city_member)):
    if not member.get("participating"):
        raise HTTPException(status_code=403, detail="Attiva la partecipazione per cambiare le monete in punti")
    wallet = await wallet_of(member)
    if body.points > left_today(wallet):
        raise HTTPException(status_code=409, detail="Hai raggiunto il limite di punti cambiabili oggi")
    cost = body.points * RATE
    today = today_iso(TZ)
    conv = wallet.get("conv") or {}
    used = conv.get("points", 0) if conv.get("date") == today else 0
    flt = {"member_id": member["id"], "money": {"$gte": cost}, "conv": conv}
    res = await db.city_wallets.update_one(flt, {"$inc": {"money": -cost}, "$set": {"conv": {"date": today, "points": used + body.points}}})
    if res.modified_count == 0:
        raise HTTPException(status_code=409, detail="Monete insufficienti")
    await db.point_events.insert_one(
        {
            "id": new_id(),
            "group_id": member["group_id"],
            "member_id": member["id"],
            "nickname": member["nickname"],
            "kind": "bonus",
            "subject": None,
            "grade": None,
            "points": body.points,
            "reason": "Cambio monete della città",
            "created_by": "Città",
            "created_at": now_iso(),
        }
    )
    return state_of(await wallet_of(member))
