import re
import time
from typing import Awaitable, Callable, Optional

from lib.badges import award
from lib.catalog import GRADE_POINTS
from lib.db import db
from lib.exclusive import grant
from lib.pets import PETS
from lib.security import now_iso
from lib.study import settle

REWARD_ID = "sigillo-segreto"
FINAL_BADGE = "custode-del-segreto"
POMODORO_SECONDS = 1500
COOLDOWN = 4.0


async def _has_capsule(member: dict, group: dict) -> bool:
    return await db.capsules.count_documents({"member_id": member["id"]}) > 0


async def _has_studied(member: dict, group: dict) -> bool:
    await settle(member["group_id"])
    fresh = await db.members.find_one({"id": member["id"]}, {"_id": 0, "study_seconds": 1})
    return int((fresh or {}).get("study_seconds", 0)) >= POMODORO_SECONDS


def _grade_answer(member: dict, group: dict) -> str:
    return str(GRADE_POINTS[max(GRADE_POINTS)])


def _name_answer(member: dict, group: dict) -> str:
    return str(len(re.findall(r"[^\W\d_]", group.get("name", ""))))


def _pets_answer(member: dict, group: dict) -> str:
    return str(len(PETS))


STEPS: list[dict] = [
    {"title": "La porta", "reveal": "Chi parla al futuro lascia una porta chiusa a chiave.", "kind": "knock"},
    {"title": "La capsula", "reveal": "Un giro intero del timer, nella stanza dove nessuno parla.", "kind": "auto", "check": _has_capsule},
    {"title": "Il silenzio", "reveal": "Il voto più alto vale un certo numero di punti. Sussurralo dove tutto è iniziato.", "kind": "auto", "check": _has_studied},
    {"title": "Il voto", "reveal": "Ogni gruppo ha un nome. Conta solo le sue lettere, niente spazi né numeri.", "kind": "code", "answer": _grade_answer},
    {"title": "Il nome", "reveal": "Nelle casse dei pet vivono tanti amici. Quanti, tra tutti, possono uscire?", "kind": "code", "answer": _name_answer},
    {"title": "Il bestiario", "reveal": "Il passaggio è aperto. Ciò che cerchi ora ti appartiene.", "kind": "code", "answer": _pets_answer},
]


async def load(member: dict) -> Optional[dict]:
    return await db.hunt.find_one({"member_id": member["id"]}, {"_id": 0})


async def knock(member: dict) -> dict:
    await db.hunt.update_one(
        {"member_id": member["id"]},
        {"$setOnInsert": {"member_id": member["id"], "group_id": member["group_id"], "solved": 1, "started_at": now_iso(), "finished_at": None, "last_attempt_ts": 0.0}},
        upsert=True,
    )
    return await advance(member)


async def _finish(member: dict) -> None:
    await grant(member["id"], member["group_id"], REWARD_ID)
    await award(member["id"], member["group_id"], FINAL_BADGE)
    await db.hunt.update_one({"member_id": member["id"], "finished_at": None}, {"$set": {"finished_at": now_iso()}})


async def advance(member: dict) -> Optional[dict]:
    doc = await load(member)
    if not doc:
        return None
    group = await db.groups.find_one({"id": member["group_id"]}, {"_id": 0}) or {}
    solved = doc["solved"]
    while solved < len(STEPS) and STEPS[solved]["kind"] == "auto":
        check: Callable[[dict, dict], Awaitable[bool]] = STEPS[solved]["check"]
        if not await check(member, group):
            break
        moved = await db.hunt.update_one({"member_id": member["id"], "solved": solved}, {"$set": {"solved": solved + 1}})
        if not moved.modified_count:
            break
        solved += 1
    if solved >= len(STEPS):
        await _finish(member)
    return await load(member)


async def answer(member: dict, raw: str) -> str:
    doc = await advance(member)
    if not doc:
        return "closed"
    solved = doc["solved"]
    if solved >= len(STEPS) or STEPS[solved]["kind"] != "code":
        return "wrong"
    now = time.time()
    if now - float(doc.get("last_attempt_ts", 0.0)) < COOLDOWN:
        return "wait"
    await db.hunt.update_one({"member_id": member["id"]}, {"$set": {"last_attempt_ts": now}})
    group = await db.groups.find_one({"id": member["group_id"]}, {"_id": 0}) or {}
    expected = STEPS[solved]["answer"](member, group).strip().casefold()
    if raw.strip().casefold() != expected:
        return "wrong"
    await db.hunt.update_one({"member_id": member["id"], "solved": solved}, {"$set": {"solved": solved + 1}})
    await advance(member)
    return "ok"
