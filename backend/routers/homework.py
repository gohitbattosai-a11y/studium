from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from lib.db import db
from lib.security import current_member, new_id, now_iso
from models.schemas import Homework, HomeworkCreate
from routers.shop import require_admin

router = APIRouter()


def personal(doc: dict, member: dict, mark: Optional[dict]) -> Homework:
    return Homework(
        **{
            **doc,
            "completed": mark is not None,
            "completed_by": member["nickname"] if mark else None,
            "completed_at": mark.get("completed_at") if mark else None,
        }
    )


@router.get("/homework", response_model=List[Homework])
async def list_homework(member: dict = Depends(current_member)):
    docs = await db.homework.find({"group_id": member["group_id"]}, {"_id": 0}).to_list(2000)
    marks = {d["homework_id"]: d async for d in db.homework_done.find({"member_id": member["id"]}, {"_id": 0})}
    out = [personal(d, member, marks.get(d["id"])) for d in docs]
    out.sort(key=lambda h: (h.completed, h.due_date, h.created_at))
    return out


@router.post("/homework", response_model=Homework)
async def create_homework(body: HomeworkCreate, member: dict = Depends(current_member)):
    doc = {
        "id": new_id(),
        "group_id": member["group_id"],
        **body.model_dump(),
        "author": member["nickname"],
        "completed": False,
        "completed_by": None,
        "completed_at": None,
        "created_at": now_iso(),
    }
    await db.homework.insert_one(dict(doc))
    return Homework(**doc)


@router.post("/homework/{id}/toggle", response_model=Homework)
async def toggle_homework(id: str, member: dict = Depends(current_member)):
    doc = await db.homework.find_one({"id": id, "group_id": member["group_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Compito non trovato")
    key = {"member_id": member["id"], "homework_id": id}
    if await db.homework_done.find_one(key, {"_id": 0}):
        await db.homework_done.delete_one(key)
        return personal(doc, member, None)
    mark = {"group_id": member["group_id"], "completed_at": now_iso()}
    await db.homework_done.update_one(key, {"$setOnInsert": mark}, upsert=True)
    return personal(doc, member, mark)


@router.delete("/homework/{id}")
async def delete_homework(id: str, member: dict = Depends(current_member)):
    require_admin(member)
    res = await db.homework.delete_one({"id": id, "group_id": member["group_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Compito non trovato")
    await db.homework_done.delete_many({"homework_id": id})
    return {"ok": True}
