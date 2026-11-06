from fastapi import APIRouter, Depends

from lib import push
from lib.db import db
from lib.security import current_member, now_iso
from models.schemas import PushEndpoint, PushState, PushSubscription

router = APIRouter()


@router.get("/push/state", response_model=PushState)
async def push_state(member: dict = Depends(current_member)):
    return PushState(enabled=push.enabled(), public_key=push.public_key() if push.enabled() else None)


@router.post("/push/subscribe", response_model=PushState)
async def subscribe(body: PushSubscription, member: dict = Depends(current_member)):
    await db.push_subs.update_one(
        {"endpoint": body.endpoint},
        {
            "$set": {
                "member_id": member["id"],
                "group_id": member["group_id"],
                "keys": body.keys.model_dump(),
                "created_at": now_iso(),
            }
        },
        upsert=True,
    )
    return PushState(enabled=push.enabled(), public_key=push.public_key() if push.enabled() else None)


@router.post("/push/unsubscribe", response_model=PushState)
async def unsubscribe(body: PushEndpoint, member: dict = Depends(current_member)):
    await db.push_subs.delete_one({"endpoint": body.endpoint, "member_id": member["id"]})
    return PushState(enabled=push.enabled(), public_key=push.public_key() if push.enabled() else None)
