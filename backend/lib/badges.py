from pymongo.errors import DuplicateKeyError

from lib.db import db
from lib.security import new_id, now_iso

BADGES: list[dict] = [
    {"id": "primo-pomodoro", "name": "Primo pomodoro", "description": "Hai completato un pomodoro intero in Sala studio.", "secret": False},
    {"id": "mente-di-ferro", "name": "Mente di ferro", "description": "Cinque ore di studio in Sala studio.", "secret": False},
    {"id": "monaco-studioso", "name": "Monaco studioso", "description": "Venticinque ore di studio in Sala studio.", "secret": False},
    {"id": "messaggero", "name": "Messaggero", "description": "Hai sigillato una capsula del tempo.", "secret": False},
    {"id": "viaggiatore-del-tempo", "name": "Viaggiatore del tempo", "description": "La tua capsula del tempo si è aperta.", "secret": False},
    {"id": "custode-del-segreto", "name": "Custode del segreto", "description": "Hai seguito la traccia fino in fondo.", "secret": True},
]

BADGES_BY_ID: dict[str, dict] = {b["id"]: b for b in BADGES}

STUDY_BADGES: list[tuple[int, str]] = [(1500, "primo-pomodoro"), (18000, "mente-di-ferro"), (90000, "monaco-studioso")]


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


async def award_study(member_id: str, group_id: str, seconds: int) -> None:
    for threshold, badge_id in STUDY_BADGES:
        if seconds >= threshold:
            await award(member_id, group_id, badge_id)


async def badges_by_member(group_id: str) -> dict[str, list[str]]:
    docs = await db.member_badges.find({"group_id": group_id}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    out: dict[str, list[str]] = {}
    for d in docs:
        out.setdefault(d["member_id"], []).append(d["badge_id"])
    return out
