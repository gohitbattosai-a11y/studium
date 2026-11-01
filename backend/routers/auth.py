import secrets
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pymongo.errors import DuplicateKeyError

from lib.badges import badges_by_member
from lib.dates import today_iso
from lib.db import db
from lib.security import COOKIE_NAME, TZ, current_member, hash_secret, new_id, now_iso, verify_secret
from models.schemas import GroupPasswordChange, JoinRequest, Me, MemberOut, NicknameChange, PinChange

router = APIRouter()

NICK_TAKEN = "Nickname già in uso in questo gruppo. Se è il tuo, inserisci il PIN personale corretto."
NICK_COOLDOWN = timedelta(days=7)


def member_out(d: dict) -> MemberOut:
    return MemberOut(
        member_id=d["id"],
        nickname=d["nickname"],
        joined_at=d["joined_at"],
        role=d.get("role", "member"),
        participating=bool(d.get("participating", False)),
        decoration=d.get("equipped_decoration"),
        background=d.get("equipped_background"),
        pet=d.get("active_pet"),
    )


async def owner_id_of(group: Optional[dict]) -> Optional[str]:
    if not group:
        return None
    if group.get("owner_id"):
        return group["owner_id"]
    first = await db.members.find({"group_id": group["id"], "role": "admin"}, {"_id": 0, "id": 1}).sort("joined_at", 1).to_list(1)
    return first[0]["id"] if first else None


def next_nickname_change(member: dict) -> Optional[datetime]:
    last = member.get("nickname_changed_at")
    if not last:
        return None
    try:
        due = datetime.fromisoformat(last) + NICK_COOLDOWN
    except ValueError:
        return None
    return due if due > datetime.now(timezone.utc) else None


async def build_me(member: dict) -> Me:
    group = await db.groups.find_one({"id": member["group_id"]}, {"_id": 0})
    count = await db.members.count_documents({"group_id": member["group_id"]})
    due = next_nickname_change(member)
    return Me(
        member_id=member["id"],
        nickname=member["nickname"],
        group_id=member["group_id"],
        group_name=group["name"] if group else "",
        member_count=count,
        today=today_iso(TZ),
        role=member.get("role", "member"),
        participating=bool(member.get("participating", False)),
        is_owner=member.get("role") == "admin" and await owner_id_of(group) == member["id"],
        next_nickname_change=due.isoformat() if due else None,
    )


def require_group_admin(member: dict) -> None:
    if member.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Solo gli admin possono farlo")


def require_pin(member: dict, pin: str) -> None:
    if not verify_secret(pin, member["pin_hash"]):
        raise HTTPException(status_code=403, detail="PIN personale errato")


@router.post("/auth/join", response_model=Me)
async def join(body: JoinRequest, response: Response):
    name_key = body.group_name.casefold()
    group = await db.groups.find_one({"name_key": name_key})
    new_member_id = new_id()
    if body.mode == "create":
        if group:
            raise HTTPException(status_code=409, detail="Esiste già un gruppo con questo nome")
        group = {
            "id": new_id(),
            "name": body.group_name,
            "name_key": name_key,
            "password_hash": hash_secret(body.group_password),
            "owner_id": new_member_id,
            "created_at": now_iso(),
        }
        try:
            await db.groups.insert_one(dict(group))
        except DuplicateKeyError:
            raise HTTPException(status_code=409, detail="Esiste già un gruppo con questo nome")
    else:
        if not group:
            raise HTTPException(status_code=404, detail="Gruppo non trovato")
        if not verify_secret(body.group_password, group["password_hash"]):
            raise HTTPException(status_code=401, detail="Password del gruppo errata")

    nick_key = body.nickname.casefold()
    member = await db.members.find_one({"group_id": group["id"], "nickname_key": nick_key}, {"_id": 0})
    if member:
        if not verify_secret(body.pin, member["pin_hash"]):
            raise HTTPException(status_code=409, detail=NICK_TAKEN)
    else:
        member = {
            "id": new_member_id,
            "group_id": group["id"],
            "nickname": body.nickname,
            "nickname_key": nick_key,
            "pin_hash": hash_secret(body.pin),
            "joined_at": now_iso(),
            "role": "admin" if body.mode == "create" else "member",
            "participating": False,
        }
        try:
            await db.members.insert_one(dict(member))
        except DuplicateKeyError:
            raise HTTPException(status_code=409, detail=NICK_TAKEN)

    token = secrets.token_urlsafe(32)
    await db.sessions.insert_one({"token": token, "member_id": member["id"], "created_at": now_iso()})
    response.set_cookie(COOKIE_NAME, token, httponly=True, samesite="none", secure=True, max_age=60 * 60 * 24 * 60, path="/")
    return await build_me(member)


@router.get("/auth/me", response_model=Me)
async def me(member: dict = Depends(current_member)):
    return await build_me(member)


@router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get(COOKIE_NAME)
    if token:
        await db.sessions.delete_one({"token": token})
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


@router.post("/auth/nickname", response_model=Me)
async def change_nickname(body: NicknameChange, member: dict = Depends(current_member)):
    require_pin(member, body.pin)
    if body.nickname == member["nickname"]:
        raise HTTPException(status_code=400, detail="Questo è già il tuo nome")
    due = next_nickname_change(member)
    if due:
        day = due.astimezone(ZoneInfo(TZ)).strftime("%d/%m/%Y")
        raise HTTPException(status_code=429, detail=f"Puoi cambiare nome una volta a settimana: riprova dal {day}")
    key = body.nickname.casefold()
    taken = await db.members.find_one({"group_id": member["group_id"], "nickname_key": key, "id": {"$ne": member["id"]}}, {"_id": 0, "id": 1})
    if taken:
        raise HTTPException(status_code=409, detail="Nickname già in uso in questo gruppo")
    fields = {"nickname": body.nickname, "nickname_key": key, "nickname_changed_at": now_iso()}
    try:
        await db.members.update_one({"id": member["id"]}, {"$set": fields})
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Nickname già in uso in questo gruppo")

    old, new, gid, mid = member["nickname"], body.nickname, member["group_id"], member["id"]
    await db.homework.update_many({"group_id": gid, "author": old}, {"$set": {"author": new}})
    await db.notices.update_many({"group_id": gid, "author": old}, {"$set": {"author": new}})
    await db.polls.update_many({"group_id": gid, "author": old}, {"$set": {"author": new}})
    await db.materials.update_many({"group_id": gid, "author": old}, {"$set": {"author": new}})
    await db.folders.update_many({"group_id": gid, "created_by": old}, {"$set": {"created_by": new}})
    await db.games.update_many({"group_id": gid, "author_id": mid}, {"$set": {"author": new}})
    await db.poll_votes.update_many({"member_id": mid}, {"$set": {"nickname": new}})
    await db.point_events.update_many({"member_id": mid}, {"$set": {"nickname": new}})
    await db.point_events.update_many({"group_id": gid, "created_by": old}, {"$set": {"created_by": new}})

    return await build_me({**member, **fields})


@router.post("/auth/pin")
async def change_pin(body: PinChange, request: Request, member: dict = Depends(current_member)):
    require_pin(member, body.current_pin)
    if body.new_pin == body.current_pin:
        raise HTTPException(status_code=400, detail="Il nuovo PIN è uguale a quello attuale")
    await db.members.update_one({"id": member["id"]}, {"$set": {"pin_hash": hash_secret(body.new_pin)}})
    await db.sessions.delete_many({"member_id": member["id"], "token": {"$ne": request.cookies.get(COOKIE_NAME)}})
    return {"ok": True}


@router.post("/group/password")
async def change_group_password(body: GroupPasswordChange, member: dict = Depends(current_member)):
    group = await db.groups.find_one({"id": member["group_id"]}, {"_id": 0})
    if member.get("role") != "admin" or await owner_id_of(group) != member["id"]:
        raise HTTPException(status_code=403, detail="Solo l'admin che ha creato il gruppo può cambiare la password")
    require_pin(member, body.pin)
    await db.groups.update_one({"id": group["id"]}, {"$set": {"password_hash": hash_secret(body.new_password)}})
    return {"ok": True}


@router.get("/members", response_model=List[MemberOut])
async def members(member: dict = Depends(current_member)):
    docs = await db.members.find({"group_id": member["group_id"]}, {"_id": 0}).sort("joined_at", 1).to_list(500)
    earned = await badges_by_member(member["group_id"])
    out = [member_out(d) for d in docs]
    for m in out:
        m.badges = earned.get(m.member_id, [])
    return out


@router.post("/members/{member_id}/kick")
async def kick_member(member_id: str, member: dict = Depends(current_member)):
    require_group_admin(member)
    if member_id == member["id"]:
        raise HTTPException(status_code=400, detail="Non puoi espellere te stesso")
    target = await db.members.find_one({"id": member_id, "group_id": member["group_id"]}, {"_id": 0})
    if not target:
        raise HTTPException(status_code=404, detail="Compagno non trovato")
    if target.get("role") == "admin":
        raise HTTPException(status_code=409, detail="Non puoi espellere un admin: togli prima il ruolo")
    await db.sessions.delete_many({"member_id": member_id})
    for name in ("purchases", "member_pets", "point_events", "poll_votes", "game_plays", "game_claims", "homework_done", "member_badges", "member_rewards", "hunt"):
        await db[name].delete_many({"member_id": member_id})
    await db.members.delete_one({"id": member_id})
    return {"ok": True}
