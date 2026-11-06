from fastapi import APIRouter, Depends, HTTPException

from lib.badges import BADGES
from lib.db import db
from lib.exclusive import ALL_EXCLUSIVE, EXCLUSIVE_BY_ID, owned_ids
from lib.security import current_member
from models.schemas import BadgeOut, BadgesState, ExclusiveEquip, ExclusiveOut

router = APIRouter()

FIELD = {"decoration": "equipped_decoration", "background": "equipped_background"}


async def build_state(member: dict) -> BadgesState:
    earned = {d["badge_id"]: d["created_at"] async for d in db.member_badges.find({"member_id": member["id"]}, {"_id": 0})}
    fresh = await db.members.find_one({"id": member["id"]}, {"_id": 0, "equipped_decoration": 1, "equipped_background": 1}) or {}
    owned = await owned_ids(member["id"])
    badges = [
        BadgeOut(id=b["id"], name=b["name"], description=b["description"], owned=b["id"] in earned, earned_at=earned.get(b["id"]))
        for b in BADGES
        if not b["secret"] or b["id"] in earned
    ]
    exclusives = [
        ExclusiveOut(id=i["id"], kind=i["kind"], name=i["name"], description=i["description"], equipped=fresh.get(FIELD[i["kind"]]) == i["id"])
        for i in ALL_EXCLUSIVE
        if i["id"] in owned
    ]
    return BadgesState(badges=badges, exclusives=exclusives)


@router.get("/badges", response_model=BadgesState)
async def get_badges(member: dict = Depends(current_member)):
    return await build_state(member)


@router.post("/badges/exclusive/equip", response_model=BadgesState)
async def equip_exclusive(body: ExclusiveEquip, member: dict = Depends(current_member)):
    if body.item_id is not None:
        item = EXCLUSIVE_BY_ID.get(body.item_id)
        if not item or item["kind"] != body.kind or body.item_id not in await owned_ids(member["id"]):
            raise HTTPException(status_code=403, detail="Non possiedi questo oggetto")
    await db.members.update_one({"id": member["id"]}, {"$set": {FIELD[body.kind]: body.item_id}})
    return await build_state(member)
