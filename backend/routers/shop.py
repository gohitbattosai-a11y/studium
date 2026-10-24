from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import DuplicateKeyError

from lib.catalog import ITEMS, ITEMS_BY_ID, grade_to_points, in_window, window_label
from lib.dates import today_iso
from lib.db import db
from lib.security import TZ, current_member, new_id, now_iso
from models.schemas import (
    BonusCreate,
    BuyRequest,
    EquipRequest,
    GradeCreate,
    LeaderboardEntry,
    MemberOut,
    ParticipationRequest,
    PointEvent,
    RoleUpdate,
    ShopItem,
    ShopState,
)
from routers.auth import member_out

router = APIRouter()


def require_admin(member: dict) -> None:
    if member.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo gli admin possono farlo")


async def totals(group_id: str) -> tuple[dict[str, int], dict[str, int]]:
    earned = {
        d["_id"]: d["total"]
        async for d in db.point_events.aggregate(
            [{"$match": {"group_id": group_id}}, {"$group": {"_id": "$member_id", "total": {"$sum": "$points"}}}]
        )
    }
    spent = {
        d["_id"]: d["total"]
        async for d in db.purchases.aggregate(
            [{"$match": {"group_id": group_id}}, {"$group": {"_id": "$member_id", "total": {"$sum": "$price"}}}]
        )
    }
    return earned, spent


async def fresh_member(member_id: str) -> dict:
    return await db.members.find_one({"id": member_id}, {"_id": 0})


async def build_state(member: dict) -> ShopState:
    earned, spent = await totals(member["group_id"])
    total = earned.get(member["id"], 0)
    used = spent.get(member["id"], 0)
    owned = {d["item_id"] async for d in db.purchases.find({"member_id": member["id"]}, {"_id": 0, "item_id": 1})}
    today = today_iso(TZ)
    items = [
        ShopItem(
            id=i["id"],
            kind=i["kind"],
            name=i["name"],
            description=i["description"],
            price=i["price"],
            owned=i["id"] in owned,
            equipped=member.get(f"equipped_{i['kind']}") == i["id"],
            available=in_window(i["window"], today),
            window_label=window_label(i["window"]),
        )
        for i in ITEMS
    ]
    return ShopState(
        participating=bool(member.get("participating", False)),
        role=member.get("role", "member"),
        total_points=total,
        spent=used,
        balance=total - used,
        equipped_decoration=member.get("equipped_decoration"),
        equipped_background=member.get("equipped_background"),
        items=items,
    )


def to_event(d: dict) -> PointEvent:
    return PointEvent(**{k: d.get(k) for k in PointEvent.model_fields})


@router.get("/shop", response_model=ShopState)
async def get_shop(member: dict = Depends(current_member)):
    return await build_state(member)


@router.post("/shop/participation", response_model=ShopState)
async def set_participation(body: ParticipationRequest, member: dict = Depends(current_member)):
    await db.members.update_one({"id": member["id"]}, {"$set": {"participating": body.participating}})
    return await build_state(await fresh_member(member["id"]))


@router.post("/shop/buy", response_model=ShopState)
async def buy(body: BuyRequest, member: dict = Depends(current_member)):
    item = ITEMS_BY_ID.get(body.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Oggetto non trovato")
    if not member.get("participating"):
        raise HTTPException(status_code=403, detail="Attiva la partecipazione per usare lo shop")
    if not in_window(item["window"], today_iso(TZ)):
        raise HTTPException(status_code=409, detail="Questo oggetto non è disponibile in questo periodo")
    earned, spent = await totals(member["group_id"])
    if earned.get(member["id"], 0) - spent.get(member["id"], 0) < item["price"]:
        raise HTTPException(status_code=409, detail="Punti insufficienti")
    if await db.purchases.find_one({"member_id": member["id"], "item_id": item["id"]}):
        raise HTTPException(status_code=409, detail="Possiedi già questo oggetto")
    try:
        await db.purchases.insert_one(
            {
                "id": new_id(),
                "group_id": member["group_id"],
                "member_id": member["id"],
                "item_id": item["id"],
                "price": item["price"],
                "created_at": now_iso(),
            }
        )
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Possiedi già questo oggetto")
    return await build_state(await fresh_member(member["id"]))


@router.post("/shop/equip", response_model=ShopState)
async def equip(body: EquipRequest, member: dict = Depends(current_member)):
    field = f"equipped_{body.kind}"
    if body.item_id is not None:
        item = ITEMS_BY_ID.get(body.item_id)
        if not item or item["kind"] != body.kind:
            raise HTTPException(status_code=400, detail="Oggetto non valido")
        if not await db.purchases.find_one({"member_id": member["id"], "item_id": item["id"]}):
            raise HTTPException(status_code=403, detail="Non possiedi questo oggetto")
    await db.members.update_one({"id": member["id"]}, {"$set": {field: body.item_id}})
    return await build_state(await fresh_member(member["id"]))


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def leaderboard(member: dict = Depends(current_member)):
    docs = await db.members.find({"group_id": member["group_id"], "participating": True}, {"_id": 0}).to_list(500)
    earned, _ = await totals(member["group_id"])
    docs.sort(key=lambda m: (-earned.get(m["id"], 0), m["nickname_key"]))
    out: list[LeaderboardEntry] = []
    for i, m in enumerate(docs):
        pts = earned.get(m["id"], 0)
        rank = out[-1].rank if out and out[-1].total_points == pts else i + 1
        out.append(
            LeaderboardEntry(
                rank=rank,
                member_id=m["id"],
                nickname=m["nickname"],
                role=m.get("role", "member"),
                total_points=pts,
                is_me=m["id"] == member["id"],
            )
        )
    return out


@router.get("/points/mine", response_model=List[PointEvent])
async def my_events(member: dict = Depends(current_member)):
    docs = await db.point_events.find({"member_id": member["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [to_event(d) for d in docs]


@router.get("/points/events", response_model=List[PointEvent])
async def group_events(member: dict = Depends(current_member)):
    require_admin(member)
    docs = await db.point_events.find({"group_id": member["group_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [to_event(d) for d in docs]


async def target_participant(member: dict, member_id: str) -> dict:
    target = await db.members.find_one({"id": member_id, "group_id": member["group_id"]}, {"_id": 0})
    if not target:
        raise HTTPException(status_code=404, detail="Compagno non trovato")
    if not target.get("participating"):
        raise HTTPException(status_code=409, detail=f"{target['nickname']} non partecipa alla classifica")
    return target


@router.post("/points/grade", response_model=PointEvent)
async def add_grade(body: GradeCreate, member: dict = Depends(current_member)):
    require_admin(member)
    target = await target_participant(member, body.member_id)
    doc = {
        "id": new_id(),
        "group_id": member["group_id"],
        "member_id": target["id"],
        "nickname": target["nickname"],
        "kind": "grade",
        "subject": body.subject,
        "grade": body.grade,
        "points": grade_to_points(body.grade),
        "reason": None,
        "created_by": member["nickname"],
        "created_at": now_iso(),
    }
    await db.point_events.insert_one(dict(doc))
    return to_event(doc)


@router.post("/points/bonus", response_model=PointEvent)
async def add_bonus(body: BonusCreate, member: dict = Depends(current_member)):
    require_admin(member)
    if body.points == 0:
        raise HTTPException(status_code=400, detail="I punti non possono essere zero")
    target = await target_participant(member, body.member_id)
    earned, spent = await totals(member["group_id"])
    if earned.get(target["id"], 0) + body.points - spent.get(target["id"], 0) < 0:
        raise HTTPException(status_code=409, detail="Il saldo non può andare sotto zero")
    doc = {
        "id": new_id(),
        "group_id": member["group_id"],
        "member_id": target["id"],
        "nickname": target["nickname"],
        "kind": "bonus",
        "subject": None,
        "grade": None,
        "points": body.points,
        "reason": body.reason,
        "created_by": member["nickname"],
        "created_at": now_iso(),
    }
    await db.point_events.insert_one(dict(doc))
    return to_event(doc)


@router.delete("/points/events/{event_id}")
async def delete_event(event_id: str, member: dict = Depends(current_member)):
    require_admin(member)
    event = await db.point_events.find_one({"id": event_id, "group_id": member["group_id"]}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Movimento non trovato")
    earned, spent = await totals(member["group_id"])
    if earned.get(event["member_id"], 0) - event["points"] - spent.get(event["member_id"], 0) < 0:
        raise HTTPException(status_code=409, detail="Punti già spesi: non si può annullare questo movimento")
    await db.point_events.delete_one({"id": event_id})
    return {"ok": True}


@router.post("/members/{member_id}/role", response_model=MemberOut)
async def set_role(member_id: str, body: RoleUpdate, member: dict = Depends(current_member)):
    require_admin(member)
    target = await db.members.find_one({"id": member_id, "group_id": member["group_id"]}, {"_id": 0})
    if not target:
        raise HTTPException(status_code=404, detail="Compagno non trovato")
    if target.get("role") == "admin" and body.role == "member":
        admins = await db.members.count_documents({"group_id": member["group_id"], "role": "admin"})
        if admins <= 1:
            raise HTTPException(status_code=409, detail="Deve restare almeno un admin")
    await db.members.update_one({"id": member_id}, {"$set": {"role": body.role}})
    return member_out(await fresh_member(member_id))
