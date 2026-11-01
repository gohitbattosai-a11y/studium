from pymongo.errors import DuplicateKeyError

from lib.db import db
from lib.security import new_id, now_iso

BADGES: list[dict] = [
    {"id": "bussatore", "name": "Bussatore", "description": "Hai bussato alla porta giusta.", "secret": True},
    {"id": "a-meta-strada", "name": "A metà strada", "description": "Metà del passaggio è alle tue spalle.", "secret": True},
    {"id": "lente-curiosa", "name": "Lente curiosa", "description": "Hai trovato la porta dell'osservatorio.", "secret": True},
    {"id": "tra-gli-ingranaggi", "name": "Tra gli ingranaggi", "description": "Hai lasciato l'Atrio e la Biblioteca alle spalle.", "secret": True},
    {"id": "astronomo-d-ottone", "name": "Astronomo d'ottone", "description": "Hai rimesso in ordine le stelle.", "secret": True},
    {"id": "custode-del-segreto", "name": "Custode del segreto", "description": "Hai seguito la traccia fino in fondo.", "secret": True},
]

BADGES_BY_ID: dict[str, dict] = {b["id"]: b for b in BADGES}

async def award(member_id: str, group_id: str, badge_id: str) -> bool:
    if badge_id not in BADGES_BY_ID:
        return False
    try:
        await db.member_badges.insert_one(
            {"id": new_id(), "member_id": member_id, "group_id": group_id, "badge_id": badge_id, "created_at": now_iso()}
        )
    except DuplicateKeyError:
        return False
    return True


async def badges_by_member(group_id: str) -> dict[str, list[str]]:
    docs = await db.member_badges.find({"group_id": group_id}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    out: dict[str, list[str]] = {}
    for d in docs:
        out.setdefault(d["member_id"], []).append(d["badge_id"])
    return out
