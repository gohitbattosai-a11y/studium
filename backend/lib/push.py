import asyncio
import json
import logging
import os
from typing import Optional

from lib.db import db

log = logging.getLogger(__name__)

_tasks: set[asyncio.Task] = set()


def public_key() -> Optional[str]:
    return os.environ.get("VAPID_PUBLIC_KEY") or None


def enabled() -> bool:
    return bool(os.environ.get("VAPID_PUBLIC_KEY") and os.environ.get("VAPID_PRIVATE_KEY"))


def _clip(text: str, size: int) -> str:
    text = " ".join((text or "").split())
    return text if len(text) <= size else text[: size - 1].rstrip() + "…"


def _deliver(sub: dict, payload: str) -> Optional[int]:
    from pywebpush import WebPushException, webpush

    try:
        webpush(
            subscription_info={"endpoint": sub["endpoint"], "keys": sub["keys"]},
            data=payload,
            vapid_private_key=os.environ["VAPID_PRIVATE_KEY"],
            vapid_claims={"sub": os.environ.get("VAPID_SUBJECT", "mailto:admin@studium.app")},
            ttl=86400,
        )
        return None
    except WebPushException as exc:
        status = getattr(exc.response, "status_code", None)
        if status not in (404, 410):
            log.warning("push fallito (%s): %s", status, exc)
        return status
    except Exception as exc:
        log.warning("push errore: %s", exc)
        return None


async def _send(query: dict, title: str, body: str, tag: Optional[str]) -> None:
    if not enabled():
        return
    payload = json.dumps({"title": _clip(title, 80), "body": _clip(body, 140), "tag": tag or "studium", "url": "/"})
    subs = await db.push_subs.find(query, {"_id": 0}).to_list(5000)
    gate = asyncio.Semaphore(10)

    async def one(sub: dict) -> None:
        async with gate:
            status = await asyncio.to_thread(_deliver, sub, payload)
        if status in (404, 410):
            await db.push_subs.delete_one({"endpoint": sub["endpoint"]})

    await asyncio.gather(*(one(s) for s in subs), return_exceptions=True)


def _fire(coro) -> None:
    task = asyncio.create_task(coro)
    _tasks.add(task)
    task.add_done_callback(_tasks.discard)


def notify_group(group_id: str, title: str, body: str, exclude_member_id: Optional[str] = None, tag: Optional[str] = None) -> None:
    if not enabled():
        return
    query: dict = {"group_id": group_id}
    if exclude_member_id:
        query["member_id"] = {"$ne": exclude_member_id}
    _fire(_send(query, title, body, tag))


def notify_member(member_id: str, title: str, body: str, tag: Optional[str] = None) -> None:
    if not enabled():
        return
    _fire(_send({"member_id": member_id}, title, body, tag))
