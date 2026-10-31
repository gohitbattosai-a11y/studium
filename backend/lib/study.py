import math
import time

from pymongo import ReturnDocument

from lib.badges import award_study
from lib.db import db

MODES: dict[str, tuple[int, int]] = {"pomodoro": (1500, 300), "lungo": (3000, 600)}
GRACE = 90


def credit(doc: dict, now: float) -> int:
    end = min(now, doc["started_ts"] + doc["focus_s"] + doc["break_s"])
    last = min(end, doc["seen_ts"] + GRACE)
    return int(max(0.0, min(last - doc["started_ts"], doc["focus_s"])))


def phase(doc: dict, now: float) -> tuple[str, int]:
    elapsed = now - doc["started_ts"]
    if elapsed < doc["focus_s"]:
        return "focus", max(0, math.ceil(doc["focus_s"] - elapsed))
    return "break", max(0, math.ceil(doc["focus_s"] + doc["break_s"] - elapsed))


async def close(doc: dict, now: float) -> None:
    gone = await db.study_sessions.find_one_and_delete({"id": doc["id"]})
    if not gone:
        return
    seconds = credit(doc, now)
    if seconds <= 0:
        return
    updated = await db.members.find_one_and_update(
        {"id": doc["member_id"]},
        {"$inc": {"study_seconds": seconds}},
        projection={"_id": 0, "study_seconds": 1},
        return_document=ReturnDocument.AFTER,
    )
    if updated:
        await award_study(doc["member_id"], doc["group_id"], int(updated.get("study_seconds", 0)))


async def settle(group_id: str) -> None:
    now = time.time()
    docs = await db.study_sessions.find({"group_id": group_id}, {"_id": 0}).to_list(500)
    for d in docs:
        over = now >= d["started_ts"] + d["focus_s"] + d["break_s"]
        stale = now - d["seen_ts"] > GRACE
        if over or stale:
            await close(d, now)
