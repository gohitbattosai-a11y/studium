import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel

load_dotenv(Path(__file__).parent.parent / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

logger = logging.getLogger(__name__)

INDEXES: dict[str, list[IndexModel]] = {
    "groups": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("name_key", ASCENDING)], name="name_key", unique=True),
    ],
    "members": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("group_id", ASCENDING), ("nickname_key", ASCENDING)], name="group_nick", unique=True),
    ],
    "sessions": [IndexModel([("token", ASCENDING)], name="token", unique=True)],
    "homework": [IndexModel([("group_id", ASCENDING), ("id", ASCENDING)], name="group_id_id")],
    "polls": [IndexModel([("group_id", ASCENDING), ("created_at", DESCENDING)], name="group_created")],
    "poll_votes": [IndexModel([("poll_id", ASCENDING), ("member_id", ASCENDING)], name="poll_member", unique=True)],
    "folders": [IndexModel([("group_id", ASCENDING), ("name_key", ASCENDING)], name="group_name", unique=True)],
    "materials": [IndexModel([("group_id", ASCENDING), ("created_at", DESCENDING)], name="group_created")],
    "files": [IndexModel([("id", ASCENDING)], name="id", unique=True)],
    "notices": [IndexModel([("group_id", ASCENDING), ("created_at", DESCENDING)], name="group_created")],
    "point_events": [
        IndexModel([("group_id", ASCENDING), ("created_at", DESCENDING)], name="group_created"),
        IndexModel([("member_id", ASCENDING)], name="member"),
    ],
    "games": [IndexModel([("group_id", ASCENDING), ("status", ASCENDING), ("created_at", DESCENDING)], name="group_status_created")],
    "game_plays": [IndexModel([("game_id", ASCENDING), ("member_id", ASCENDING)], name="game_member", unique=True)],
    "game_claims": [IndexModel([("game_id", ASCENDING), ("member_id", ASCENDING)], name="game_member", unique=True)],
    "purchases": [
        IndexModel([("member_id", ASCENDING), ("item_id", ASCENDING)], name="member_item", unique=True),
        IndexModel([("group_id", ASCENDING)], name="group"),
    ],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:
                logger.error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)


async def ensure_roles() -> None:
    try:
        async for group in db.groups.find({}, {"_id": 0, "id": 1}):
            members = await db.members.find({"group_id": group["id"]}, {"_id": 0}).sort("joined_at", 1).to_list(1000)
            if not members:
                continue
            if not any(m.get("role") == "admin" for m in members):
                await db.members.update_one({"id": members[0]["id"]}, {"$set": {"role": "admin"}})
            await db.members.update_many({"group_id": group["id"], "role": {"$exists": False}}, {"$set": {"role": "member"}})
    except Exception as exc:
        logger.error("ensure_roles: %s", exc)
