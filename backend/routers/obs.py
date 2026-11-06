from fastapi import APIRouter, Depends, HTTPException

from lib import obs
from lib.db import db
from lib.exclusive import OBS_ITEMS, OBS_PET, owned_ids
from lib.security import current_member
from models.schemas import ExclusiveOut, ObsFragment, ObsPetEquip, ObsPetInfo, ObsRoom, ObsSolve, ObsState

router = APIRouter()

FIELD = {"decoration": "equipped_decoration", "background": "equipped_background"}


async def build_state(member: dict) -> ObsState:
    doc = await obs.load(member)
    if not doc:
        return ObsState(started=False)
    data = obs.view(doc)
    finished = data["index"] >= len(obs.ROOMS)
    state = ObsState(
        started=True,
        finished=finished,
        total_rooms=len(obs.ROOMS),
        rooms=[ObsRoom(**r) for r in data["rooms"]] if not finished else [],
        fragments=[ObsFragment(**f) for f in data["fragments"]],
        reveals=data["reveals"],
    )
    if not finished:
        return state
    fresh = await db.members.find_one({"id": member["id"]}, {"_id": 0, "equipped_decoration": 1, "equipped_background": 1, "active_pet": 1}) or {}
    owned = await owned_ids(member["id"])
    state.rewards = [
        ExclusiveOut(id=i["id"], kind=i["kind"], name=i["name"], description=i["description"], equipped=fresh.get(FIELD[i["kind"]]) == i["id"])
        for i in OBS_ITEMS
        if i["id"] in owned
    ]
    has_pet = await db.member_pets.find_one({"member_id": member["id"], "pet_id": OBS_PET["id"]}, {"_id": 0})
    if has_pet:
        state.pet = ObsPetInfo(id=OBS_PET["id"], name=OBS_PET["name"], rarity=OBS_PET["rarity"], active=fresh.get("active_pet") == OBS_PET["id"])
    return state


@router.get("/obs", response_model=ObsState)
async def get_obs(member: dict = Depends(current_member)):
    return await build_state(member)


@router.post("/obs/open", response_model=ObsState)
async def open_obs(member: dict = Depends(current_member)):
    await obs.open_door(member)
    return await build_state(member)


@router.post("/obs/solve", response_model=ObsState)
async def solve_obs(body: ObsSolve, member: dict = Depends(current_member)):
    result = await obs.solve(member, body.puzzle, body.taps)
    if result == "closed":
        raise HTTPException(status_code=409, detail="Niente risponde")
    if result == "wait":
        raise HTTPException(status_code=429, detail="Aspetta un istante")
    if result == "wrong":
        raise HTTPException(status_code=400, detail="Non è così")
    return await build_state(member)


@router.post("/obs/pet", response_model=ObsState)
async def equip_pet(body: ObsPetEquip, member: dict = Depends(current_member)):
    if not await db.member_pets.find_one({"member_id": member["id"], "pet_id": OBS_PET["id"]}):
        raise HTTPException(status_code=403, detail="Non possiedi questo pet")
    await db.members.update_one({"id": member["id"]}, {"$set": {"active_pet": OBS_PET["id"] if body.active else None}})
    return await build_state(member)
