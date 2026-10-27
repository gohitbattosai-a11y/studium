from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import DuplicateKeyError

from lib.gate import feature_gate
from lib.pets import BOXES, BOXES_BY_ID, DUPLICATE_REFUND, PETS, PETS_BY_ID, PITY_RARITIES, pick_pet, pick_rarity, pity_left, RARITIES
from lib.db import db
from lib.security import new_id, now_iso
from models.schemas import ActivePetRequest, BoxInfo, BoxOdd, GiftPetRequest, PetInfo, PetsState, RollRequest, RollResult
from routers.shop import require_admin, totals

router = APIRouter()

pets_member = feature_gate("pets")


async def fresh(member_id: str) -> dict:
    return await db.members.find_one({"id": member_id}, {"_id": 0})


async def build_state(member: dict) -> PetsState:
    earned, spent = await totals(member["group_id"])
    balance = earned.get(member["id"], 0) - spent.get(member["id"], 0)
    owned = {d["pet_id"]: d["copies"] async for d in db.member_pets.find({"member_id": member["id"]}, {"_id": 0})}
    active = member.get("active_pet")
    pity = member.get("pity", {}) or {}
    boxes = [
        BoxInfo(
            id=b["id"],
            name=b["name"],
            description=b["description"],
            price=b["price"],
            odds=[BoxOdd(rarity=r, percent=b["odds"][r]) for r in RARITIES],
            guaranteed_in=pity_left(int(pity.get(b["id"], 0))),
        )
        for b in BOXES
    ]
    pets = [
        PetInfo(id=p["id"], name=p["name"], rarity=p["rarity"], owned=p["id"] in owned, copies=owned.get(p["id"], 0), active=active == p["id"])
        for p in PETS
    ]
    return PetsState(participating=bool(member.get("participating", False)), balance=balance, active_pet=active, boxes=boxes, pets=pets)


@router.get("/pets", response_model=PetsState)
async def get_pets(member: dict = Depends(pets_member)):
    return await build_state(member)


@router.post("/pets/roll", response_model=RollResult)
async def roll_box(body: RollRequest, member: dict = Depends(pets_member)):
    box = BOXES_BY_ID.get(body.box_id)
    if not box:
        raise HTTPException(status_code=404, detail="Box non trovata")
    if not member.get("participating"):
        raise HTTPException(status_code=403, detail="Attiva la partecipazione nello Shop per aprire le box")
    earned, spent = await totals(member["group_id"])
    balance = earned.get(member["id"], 0) - spent.get(member["id"], 0)
    if balance < box["price"]:
        raise HTTPException(status_code=409, detail="Punti insufficienti")

    pity = int((member.get("pity", {}) or {}).get(box["id"], 0))
    rarity = pick_rarity(box, pity)
    pet = pick_pet(rarity)

    existing = await db.member_pets.find_one({"member_id": member["id"], "pet_id": pet["id"]}, {"_id": 0})
    is_new = existing is None
    refund = 0 if is_new else DUPLICATE_REFUND[rarity]

    await db.purchases.insert_one(
        {
            "id": new_id(),
            "group_id": member["group_id"],
            "member_id": member["id"],
            "item_id": f"box:{box['id']}:{new_id()}",
            "price": box["price"] - refund,
            "created_at": now_iso(),
        }
    )

    copies = 1
    if is_new:
        try:
            await db.member_pets.insert_one(
                {"id": new_id(), "group_id": member["group_id"], "member_id": member["id"], "pet_id": pet["id"], "copies": 1, "obtained_at": now_iso()}
            )
        except DuplicateKeyError:
            is_new = False
            refund = DUPLICATE_REFUND[rarity]
    if not is_new:
        await db.member_pets.update_one({"member_id": member["id"], "pet_id": pet["id"]}, {"$inc": {"copies": 1}})
        doc = await db.member_pets.find_one({"member_id": member["id"], "pet_id": pet["id"]}, {"_id": 0})
        copies = doc["copies"]

    new_pity = 0 if rarity in PITY_RARITIES else pity + 1
    updates = {f"pity.{box['id']}": new_pity}
    if is_new and not member.get("active_pet"):
        updates["active_pet"] = pet["id"]
    await db.members.update_one({"id": member["id"]}, {"$set": updates})

    earned, spent = await totals(member["group_id"])
    return RollResult(
        box_id=box["id"],
        pet_id=pet["id"],
        name=pet["name"],
        rarity=rarity,
        is_new=is_new,
        copies=copies,
        refund=refund,
        cost=box["price"],
        balance=earned.get(member["id"], 0) - spent.get(member["id"], 0),
        guaranteed_in=pity_left(new_pity),
    )


@router.post("/pets/active", response_model=PetsState)
async def set_active(body: ActivePetRequest, member: dict = Depends(pets_member)):
    if body.pet_id is not None:
        if body.pet_id not in PETS_BY_ID:
            raise HTTPException(status_code=400, detail="Pet non valido")
        if not await db.member_pets.find_one({"member_id": member["id"], "pet_id": body.pet_id}):
            raise HTTPException(status_code=403, detail="Non possiedi questo pet")
    await db.members.update_one({"id": member["id"]}, {"$set": {"active_pet": body.pet_id}})
    return await build_state(await fresh(member["id"]))


@router.post("/pets/gift")
async def gift_pet(body: GiftPetRequest, member: dict = Depends(pets_member)):
    require_admin(member)
    if body.pet_id not in PETS_BY_ID:
        raise HTTPException(status_code=404, detail="Pet non trovato")
    target = await db.members.find_one({"id": body.member_id, "group_id": member["group_id"]}, {"_id": 0})
    if not target:
        raise HTTPException(status_code=404, detail="Compagno non trovato")
    try:
        await db.member_pets.insert_one(
            {"id": new_id(), "group_id": member["group_id"], "member_id": target["id"], "pet_id": body.pet_id, "copies": 1, "obtained_at": now_iso()}
        )
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail=f"{target['nickname']} possiede già questo pet")
    if not target.get("active_pet"):
        await db.members.update_one({"id": target["id"]}, {"$set": {"active_pet": body.pet_id}})
    return {"ok": True}
