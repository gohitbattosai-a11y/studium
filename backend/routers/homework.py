from typing import List

from fastapi import APIRouter, Depends, HTTPException

from lib.db import db
from lib.security import current_member, new_id, now_iso
from models.schemas import Homework, HomeworkCreate
from routers.shop import require_admin

router = APIRouter()


@router.get("/homework", response_model=List[Homework])
async def list_homework(member: dict = Depends(current_member)):
    docs = await db.homework.find({"group_id": member["group_id"]}, {"_id": 0}).to_list(2000)
    docs.sort(key=lambda d: (d["completed"], d["due_date"], d["created_at"]))
    return [Homework(**d) for d in docs]


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
    done = not doc["completed"]
    update = {
        "completed": done,
        "completed_by": member["nickname"] if done else None,
        "completed_at": now_iso() if done else None,
    }
    await db.homework.update_one({"id": id}, {"$set": update})
    return Homework(**{**doc, **update})


@router.delete("/homework/{id}")
async def delete_homework(id: str, member: dict = Depends(current_member)):
    require_admin(member)
    res = await db.homework.delete_one({"id": id, "group_id": member["group_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Compito non trovato")
    return {"ok": True}
