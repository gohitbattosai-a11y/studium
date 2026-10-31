from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import DuplicateKeyError

from lib.badges import award
from lib.dates import today_iso
from lib.db import db
from lib.hunt import advance
from lib.security import TZ, current_member, new_id, now_iso
from models.schemas import CapsuleCreate, CapsuleOut, CapsulesState

router = APIRouter()

MAX_DAYS = 1100


def parse_day(value: str) -> Optional[date]:
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


async def build_state(member: dict) -> CapsulesState:
    gid = member["group_id"]
    today = today_iso(TZ)
    docs = await db.capsules.find({"group_id": gid}, {"_id": 0}).sort([("open_at", 1), ("created_at", 1)]).to_list(1000)
    names = {m["id"]: m["nickname"] async for m in db.members.find({"group_id": gid}, {"_id": 0, "id": 1, "nickname": 1})}
    out: list[CapsuleOut] = []
    has_mine = False
    for d in docs:
        is_open = d["open_at"] <= today
        is_mine = d["member_id"] == member["id"]
        if is_mine:
            has_mine = True
            if is_open:
                await award(member["id"], gid, "viaggiatore-del-tempo")
        out.append(
            CapsuleOut(
                id=d["id"],
                author=names.get(d["member_id"], "Ex compagno"),
                is_mine=is_mine,
                created_at=d["created_at"],
                open_at=d["open_at"],
                is_open=is_open,
                message=d["message"] if is_open else None,
            )
        )
    return CapsulesState(today=today, can_write=not has_mine, capsules=out)


@router.get("/capsules", response_model=CapsulesState)
async def list_capsules(member: dict = Depends(current_member)):
    return await build_state(member)


@router.post("/capsules", response_model=CapsulesState)
async def create_capsule(body: CapsuleCreate, member: dict = Depends(current_member)):
    day = parse_day(body.open_at)
    today = date.fromisoformat(today_iso(TZ))
    if not day:
        raise HTTPException(status_code=400, detail="Data non valida")
    if day <= today:
        raise HTTPException(status_code=400, detail="La data di apertura deve essere nel futuro")
    if day > today + timedelta(days=MAX_DAYS):
        raise HTTPException(status_code=400, detail="La data di apertura è troppo lontana")
    try:
        await db.capsules.insert_one(
            {
                "id": new_id(),
                "group_id": member["group_id"],
                "member_id": member["id"],
                "message": body.message,
                "open_at": body.open_at,
                "created_at": now_iso(),
            }
        )
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Hai già sigillato la tua capsula")
    await award(member["id"], member["group_id"], "messaggero")
    await advance(member)
    return await build_state(member)
