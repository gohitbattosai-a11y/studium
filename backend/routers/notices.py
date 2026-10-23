from typing import List

from fastapi import APIRouter, Depends

from lib.db import db
from lib.security import current_member, new_id, now_iso
from models.schemas import Notice, NoticeCreate

router = APIRouter()


@router.get("/notices", response_model=List[Notice])
async def list_notices(member: dict = Depends(current_member)):
    docs = await db.notices.find({"group_id": member["group_id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Notice(**d) for d in docs]


@router.post("/notices", response_model=Notice)
async def create_notice(body: NoticeCreate, member: dict = Depends(current_member)):
    doc = {
        "id": new_id(),
        "group_id": member["group_id"],
        **body.model_dump(),
        "author": member["nickname"],
        "created_at": now_iso(),
    }
    await db.notices.insert_one(dict(doc))
    return Notice(**doc)
