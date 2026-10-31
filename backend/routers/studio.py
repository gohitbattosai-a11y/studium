import time

from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import DuplicateKeyError

from lib.db import db
from lib.security import current_member, new_id
from lib.study import MODES, close, phase, settle
from models.schemas import StudyMine, StudyPresence, StudyStart, StudyState

router = APIRouter()


async def build_state(member: dict) -> StudyState:
    gid = member["group_id"]
    await settle(gid)
    now = time.time()
    docs = await db.study_sessions.find({"group_id": gid}, {"_id": 0}).sort("started_ts", 1).to_list(500)
    names = {m["id"]: m["nickname"] async for m in db.members.find({"group_id": gid}, {"_id": 0, "id": 1, "nickname": 1})}
    active: list[StudyPresence] = []
    mine = None
    for d in docs:
        ph, left = phase(d, now)
        if d["member_id"] == member["id"]:
            mine = StudyMine(mode=d["mode"], phase=ph, remaining_s=left, focus_s=d["focus_s"], break_s=d["break_s"], started_ts=d["started_ts"])
        if d["member_id"] in names:
            active.append(StudyPresence(member_id=d["member_id"], nickname=names[d["member_id"]], mode=d["mode"], phase=ph, remaining_s=left))
    fresh = await db.members.find_one({"id": member["id"]}, {"_id": 0, "study_seconds": 1})
    return StudyState(server_now=now, mine=mine, active=active, study_seconds=int((fresh or {}).get("study_seconds", 0)))


@router.get("/studio", response_model=StudyState)
async def get_studio(member: dict = Depends(current_member)):
    return await build_state(member)


@router.post("/studio/start", response_model=StudyState)
async def start_session(body: StudyStart, member: dict = Depends(current_member)):
    await settle(member["group_id"])
    focus_s, break_s = MODES[body.mode]
    now = time.time()
    try:
        await db.study_sessions.insert_one(
            {
                "id": new_id(),
                "group_id": member["group_id"],
                "member_id": member["id"],
                "mode": body.mode,
                "focus_s": focus_s,
                "break_s": break_s,
                "started_ts": now,
                "seen_ts": now,
            }
        )
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Hai già una sessione in corso")
    return await build_state(member)


@router.post("/studio/ping")
async def ping(member: dict = Depends(current_member)):
    res = await db.study_sessions.update_one({"member_id": member["id"]}, {"$set": {"seen_ts": time.time()}})
    return {"ok": bool(res.matched_count)}


@router.post("/studio/stop", response_model=StudyState)
async def stop_session(member: dict = Depends(current_member)):
    doc = await db.study_sessions.find_one({"member_id": member["id"]}, {"_id": 0})
    if doc:
        doc["seen_ts"] = time.time()
        await close(doc, time.time())
    return await build_state(member)
