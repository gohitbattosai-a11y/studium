import asyncio
import logging
from datetime import datetime, timedelta, timezone

from lib.db import db

logger = logging.getLogger(__name__)

INACTIVE_DAYS = 30
SESSION_DAYS = 60
LOOP_SECONDS = 6 * 3600
MAX_GROUPS_PER_RUN = 50

BY_GROUP = (
    "homework",
    "homework_done",
    "polls",
    "folders",
    "materials",
    "files",
    "notices",
    "point_events",
    "games",
    "member_pets",
    "purchases",
    "member_badges",
    "push_subs",
    "museum",
    "dungeon_gear",
    "dungeon_chars",
    "stadium_clubs",
    "stadium_cards",
    "stadium_leagues",
    "stadium_fixtures",
    "stadium_packs",
)

BY_MEMBER = (
    "sessions",
    "homework_done",
    "poll_votes",
    "game_plays",
    "game_claims",
    "member_pets",
    "purchases",
    "member_badges",
    "member_rewards",
    "hunt",
    "obs",
    "fish_catches",
    "fish_casts",
    "push_subs",
    "point_events",
    "dungeon_gear",
    "dungeon_chars",
    "stadium_clubs",
    "stadium_cards",
    "stadium_packs",
)


def _iso_ago(**delta: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(**delta)).isoformat()


async def backfill_last_seen() -> None:
    now = datetime.now(timezone.utc).isoformat()
    await db.members.update_many({"last_seen": {"$exists": False}}, {"$set": {"last_seen": now}})


async def stale_group_ids(cutoff: str) -> list[str]:
    seen_by_group: dict[str, str] = {}
    pipeline = [{"$group": {"_id": "$group_id", "seen": {"$max": {"$ifNull": ["$last_seen", "$joined_at"]}}}}]
    async for row in db.members.aggregate(pipeline):
        seen_by_group[row["_id"]] = row.get("seen") or ""
    stale: list[str] = []
    async for group in db.groups.find({}, {"_id": 0, "id": 1, "created_at": 1}):
        seen = seen_by_group.get(group["id"]) or group.get("created_at") or ""
        if seen and seen < cutoff:
            stale.append(group["id"])
    return stale[:MAX_GROUPS_PER_RUN]


async def purge_group(group_id: str) -> None:
    member_ids = [m["id"] async for m in db.members.find({"group_id": group_id}, {"_id": 0, "id": 1})]
    if member_ids:
        for name in BY_MEMBER:
            await db[name].delete_many({"member_id": {"$in": member_ids}})
    for name in BY_GROUP:
        await db[name].delete_many({"group_id": group_id})
    await db.members.delete_many({"group_id": group_id})
    await db.groups.delete_one({"id": group_id})


async def run_maintenance() -> None:
    await backfill_last_seen()
    await db.sessions.delete_many({"created_at": {"$lt": _iso_ago(days=SESSION_DAYS)}})
    stale = await stale_group_ids(_iso_ago(days=INACTIVE_DAYS))
    for group_id in stale:
        await purge_group(group_id)
    if stale:
        logger.info("maintenance: rimossi %d gruppi inattivi da oltre %d giorni", len(stale), INACTIVE_DAYS)


async def maintenance_loop() -> None:
    await asyncio.sleep(30)
    while True:
        try:
            await run_maintenance()
        except Exception:
            logger.exception("maintenance fallita")
        await asyncio.sleep(LOOP_SECONDS)
