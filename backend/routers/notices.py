from typing import List

from fastapi import APIRouter, Depends, HTTPException

from lib import push
from lib.dates import today_iso
from lib.db import db
from lib.security import TZ, current_member, new_id, now_iso
from models.schemas import Notice, NoticeCreate
from routers.shop import require_admin

router = APIRouter()

RANK = {"urgente": 0, "avviso": 1, "info": 2}


@router.get("/notices", response_model=List[Notice])
async def list_notices(member: dict = Depends(current_member)):
    docs = await db.notices.find({"group_id": member["group_id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    today = today_iso(TZ)
    out = [Notice(**{**d, "expired": bool(d.get("expires_at") and d["expires_at"] < today)}) for d in docs]
    out.sort(key=lambda n: (n.expired, RANK[n.tag]))
    return out


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
    push.notify_group(
        member["group_id"],
        f"Urgente: {body.title}" if body.tag == "urgente" else body.title,
        body.body,
        exclude_member_id=member["id"],
        tag="notice",
    )
    return Notice(**doc)


@router.delete("/notices/{id}")
async def delete_notice(id: str, member: dict = Depends(current_member)):
    require_admin(member)
    res = await db.notices.delete_one({"id": id, "group_id": member["group_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Avviso non trovato")
    return {"ok": True}
