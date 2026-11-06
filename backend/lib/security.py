
import hashlib
import hmac
import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request

from lib.db import db

COOKIE_NAME = "studium_session"
TZ = "Europe/Rome"
SEEN_EVERY = timedelta(hours=6)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


def hash_secret(raw: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", raw.encode(), salt, 120_000)
    return f"{salt.hex()}${dk.hex()}"


def verify_secret(raw: str, stored: str) -> bool:
    try:
        salt_hex, dk_hex = stored.split("$", 1)
    except ValueError:
        return False
    dk = hashlib.pbkdf2_hmac("sha256", raw.encode(), bytes.fromhex(salt_hex), 120_000)
    return hmac.compare_digest(dk.hex(), dk_hex)


async def current_member(request: Request) -> dict:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Non autenticato")
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Sessione scaduta")
    member = await db.members.find_one({"id": session["member_id"]}, {"_id": 0})
    if not member:
        raise HTTPException(status_code=401, detail="Membro non trovato")
    now = datetime.now(timezone.utc)
    if (member.get("last_seen") or "") < (now - SEEN_EVERY).isoformat():
        stamp = now.isoformat()
        await db.members.update_one({"id": member["id"]}, {"$set": {"last_seen": stamp}})
        member["last_seen"] = stamp
    return member
