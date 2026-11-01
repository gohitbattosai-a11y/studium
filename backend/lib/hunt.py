import hashlib
import re
import time
from typing import Optional

from lib.badges import award
from lib.catalog import GRADE_POINTS
from lib.db import db
from lib.exclusive import EXCLUSIVE_ITEMS, grant
from lib.pets import PETS
from lib.security import now_iso

FINAL_BADGE = "custode-del-segreto"
HALFWAY_BADGE = "a-meta-strada"
KNOCK_BADGE = "bussatore"
HALFWAY_AT = 3
COOLDOWN = 1.5
RUNES = 4
ECHO_LENGTH = 6


def _code(member: dict, group: dict) -> list[str]:
    return list(f"{GRADE_POINTS[max(GRADE_POINTS)]:02d}{len(PETS):02d}")


def _echo(member: dict, group: dict) -> list[str]:
    digest = hashlib.sha256(f"eco:{member['id']}".encode()).digest()
    return [f"runa-{b % RUNES}" for b in digest[:ECHO_LENGTH]]


STEPS: list[dict] = [
    {
        "id": "soglia",
        "title": "La Soglia",
        "kind": "order",
        "answer": ["pietra-3", "pietra-1", "pietra-5", "pietra-2", "pietra-4"],
        "reveal": "Il tramonto ha cinque colori. Leggi i libri come lui.",
    },
    {
        "id": "biblioteca",
        "title": "La Biblioteca",
        "kind": "order",
        "answer": ["libro-giallo", "libro-arancio", "libro-rosso", "libro-viola", "libro-blu"],
        "reveal": "Una sola luce non respira come le altre.",
    },
    {
        "id": "giardino",
        "title": "Il Giardino",
        "kind": "pick",
        "answer": ["lucciola-5"],
        "reveal": "Il voto migliore vale tanti punti. I pet che escono dalle casse sono altrettanti compagni. Due numeri, uno accanto all'altro.",
    },
    {"id": "torre", "title": "La Torre", "kind": "code", "answer": _code, "reveal": "Ripeti ciò che vedi brillare."},
    {
        "id": "eco",
        "title": "L'Eco",
        "kind": "sequence",
        "answer": _echo,
        "reveal": "Il passaggio è aperto. Ciò che cerchi ora ti appartiene.",
    },
]


def expected(step: dict, member: dict, group: dict) -> list[str]:
    answer = step["answer"]
    return answer(member, group) if callable(answer) else list(answer)


async def load(member: dict) -> Optional[dict]:
    return await db.hunt.find_one({"member_id": member["id"]}, {"_id": 0})


async def knock(member: dict) -> dict:
    await db.hunt.update_one(
        {"member_id": member["id"]},
        {"$setOnInsert": {"member_id": member["id"], "group_id": member["group_id"], "solved": 0, "started_at": now_iso(), "finished_at": None, "last_attempt_ts": 0.0}},
        upsert=True,
    )
    await award(member["id"], member["group_id"], KNOCK_BADGE)
    return await load(member)


async def _finish(member: dict) -> None:
    for item in EXCLUSIVE_ITEMS:
        await grant(member["id"], member["group_id"], item["id"])
    await award(member["id"], member["group_id"], FINAL_BADGE)
    await db.hunt.update_one({"member_id": member["id"], "finished_at": None}, {"$set": {"finished_at": now_iso()}})


async def group_of(member: dict) -> dict:
    return await db.groups.find_one({"id": member["group_id"]}, {"_id": 0}) or {}


async def solve(member: dict, taps: list[str]) -> str:
    doc = await load(member)
    if not doc:
        return "closed"
    solved = doc["solved"]
    if solved >= len(STEPS):
        return "wrong"
    now = time.time()
    if now - float(doc.get("last_attempt_ts", 0.0)) < COOLDOWN:
        return "wait"
    await db.hunt.update_one({"member_id": member["id"]}, {"$set": {"last_attempt_ts": now}})
    step = STEPS[solved]
    want = expected(step, member, await group_of(member))
    got = [t.strip().casefold() for t in taps]
    if got != want:
        return "wrong"
    moved = await db.hunt.update_one({"member_id": member["id"], "solved": solved}, {"$set": {"solved": solved + 1}})
    if not moved.modified_count:
        return "wrong"
    if solved + 1 >= HALFWAY_AT:
        await award(member["id"], member["group_id"], HALFWAY_BADGE)
    if solved + 1 >= len(STEPS):
        await _finish(member)
    return "ok"
