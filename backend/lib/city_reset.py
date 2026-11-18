import logging

from lib.db import db
from lib.security import now_iso

logger = logging.getLogger(__name__)

RESET_ID = "city-reset-2026-11-18"

CITY_COLLECTIONS = (
    "fish_catches",
    "fish_casts",
    "museum",
    "city_wallets",
    "dungeon_runs",
    "dungeon_records",
    "dungeon_trophies",
    "dungeon_chars",
    "dungeon_gear",
    "stadium_clubs",
    "stadium_cards",
    "stadium_leagues",
    "stadium_fixtures",
    "stadium_packs",
    "stadium_worlds",
    "stadium_friendlies",
)


async def reset_city_once() -> None:
    try:
        res = await db.app_meta.update_one({"_id": RESET_ID}, {"$setOnInsert": {"at": now_iso()}}, upsert=True)
        if res.upserted_id is None:
            return
        for name in CITY_COLLECTIONS:
            out = await db[name].delete_many({})
            logger.warning("reset città: %s -> %d documenti eliminati", name, out.deleted_count)
    except Exception:
        logger.exception("reset città fallito")
