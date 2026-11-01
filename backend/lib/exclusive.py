from pymongo.errors import DuplicateKeyError

from lib.db import db
from lib.security import new_id, now_iso

EXCLUSIVE_ITEMS: list[dict] = [
    {
        "id": "sigillo-segreto",
        "kind": "decoration",
        "name": "Sigillo del Custode",
        "description": "Ali di luce, corona e alloro attorno all'avatar. Non si compra: si merita.",
    },
    {
        "id": "santuario-del-custode",
        "kind": "background",
        "name": "Santuario del Custode",
        "description": "Un sole sospeso tra colonne e raggi d'oro. Sfondo esclusivo.",
    },
]

OBS_ITEMS: list[dict] = [
    {
        "id": "astrolabio-ottone",
        "kind": "decoration",
        "name": "Astrolabio d'Ottone",
        "description": "Anelli di ottone che ruotano attorno all'avatar. Non si compra: si merita.",
    },
    {
        "id": "osservatorio-stellare",
        "kind": "background",
        "name": "Osservatorio Stellare",
        "description": "Una cupola aperta sul cielo, tra ingranaggi e telescopio. Sfondo esclusivo.",
    },
]

OBS_PET: dict = {"id": "volpe-ottone", "name": "Volpe d'Ottone", "rarity": "mitico"}

ALL_EXCLUSIVE: list[dict] = EXCLUSIVE_ITEMS + OBS_ITEMS

EXCLUSIVE_BY_ID: dict[str, dict] = {i["id"]: i for i in ALL_EXCLUSIVE}


async def grant(member_id: str, group_id: str, item_id: str) -> bool:
    if item_id not in EXCLUSIVE_BY_ID:
        return False
    try:
        await db.member_rewards.insert_one(
            {"id": new_id(), "member_id": member_id, "group_id": group_id, "item_id": item_id, "created_at": now_iso()}
        )
    except DuplicateKeyError:
        return False
    return True


async def owned_ids(member_id: str) -> set[str]:
    return {d["item_id"] async for d in db.member_rewards.find({"member_id": member_id}, {"_id": 0, "item_id": 1})}


async def grant_pet(member_id: str, group_id: str, pet_id: str) -> bool:
    try:
        await db.member_pets.insert_one(
            {"id": new_id(), "group_id": group_id, "member_id": member_id, "pet_id": pet_id, "copies": 1, "obtained_at": now_iso()}
        )
    except DuplicateKeyError:
        return False
    await db.members.update_one({"id": member_id, "active_pet": {"$in": [None, ""]}}, {"$set": {"active_pet": pet_id}})
    return True
