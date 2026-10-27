from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import DuplicateKeyError

from lib.db import db
from lib.security import current_member, new_id, now_iso
from models.schemas import Poll, PollCreate, PollOption, VoteRequest
from routers.shop import require_admin

router = APIRouter()


async def build_polls(docs: list[dict], member_id: str) -> list[Poll]:
    ids = [d["id"] for d in docs]
    votes = await db.poll_votes.find({"poll_id": {"$in": ids}}, {"_id": 0}).to_list(50000)
    out: list[Poll] = []
    for d in docs:
        pv = [v for v in votes if v["poll_id"] == d["id"]]
        options = [
            PollOption(
                id=o["id"],
                text=o["text"],
                votes=sum(1 for v in pv if v["option_id"] == o["id"]),
                voters=[] if d["anonymous"] else [v["nickname"] for v in pv if v["option_id"] == o["id"]],
            )
            for o in d["options"]
        ]
        mine = next((v["option_id"] for v in pv if v["member_id"] == member_id), None)
        out.append(
            Poll(
                id=d["id"],
                question=d["question"],
                anonymous=d["anonymous"],
                author=d["author"],
                created_at=d["created_at"],
                options=options,
                total_votes=len(pv),
                my_vote=mine,
            )
        )
    return out


@router.get("/polls", response_model=List[Poll])
async def list_polls(member: dict = Depends(current_member)):
    docs = await db.polls.find({"group_id": member["group_id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return await build_polls(docs, member["id"])


@router.post("/polls", response_model=Poll)
async def create_poll(body: PollCreate, member: dict = Depends(current_member)):
    doc = {
        "id": new_id(),
        "group_id": member["group_id"],
        "question": body.question,
        "anonymous": body.anonymous,
        "options": [{"id": new_id(), "text": t} for t in body.options],
        "author": member["nickname"],
        "created_at": now_iso(),
    }
    await db.polls.insert_one(dict(doc))
    return (await build_polls([doc], member["id"]))[0]


@router.post("/polls/{id}/vote", response_model=Poll)
async def vote(id: str, body: VoteRequest, member: dict = Depends(current_member)):
    doc = await db.polls.find_one({"id": id, "group_id": member["group_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Sondaggio non trovato")
    if body.option_id not in {o["id"] for o in doc["options"]}:
        raise HTTPException(status_code=400, detail="Opzione non valida")
    key = {"poll_id": id, "member_id": member["id"]}
    fields = {"nickname": member["nickname"], "option_id": body.option_id, "created_at": now_iso()}
    try:
        await db.poll_votes.update_one(key, {"$set": fields}, upsert=True)
    except DuplicateKeyError:
        await db.poll_votes.update_one(key, {"$set": fields})
    return (await build_polls([doc], member["id"]))[0]


@router.delete("/polls/{id}")
async def delete_poll(id: str, member: dict = Depends(current_member)):
    require_admin(member)
    res = await db.polls.delete_one({"id": id, "group_id": member["group_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sondaggio non trovato")
    await db.poll_votes.delete_many({"poll_id": id})
    return {"ok": True}
