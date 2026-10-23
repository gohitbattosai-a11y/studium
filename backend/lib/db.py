"""Shared Mongo handle — import `client`/`db` from here (server.py, routers, seed.py)."""

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

# One entry per collection: every field a route filters, sorts, or dedupes on. Applied by ensure_indexes() at startup.
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
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:  # one at a time so a bad spec skips only itself
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:  # never block boot on an index; the log line names what to fix
                logger.error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)
