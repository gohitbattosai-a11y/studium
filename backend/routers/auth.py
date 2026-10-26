import secrets
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pymongo.errors import DuplicateKeyError

from lib.dates import today_iso
from lib.db import db
from lib.security import COOKIE_NAME, TZ, current_member, hash_secret, new_id, now_iso, verify_secret
from models.schemas import JoinRequest, Me, MemberOut

router = APIRouter()

NICK_TAKEN = "Nickname già in uso in questo gruppo. Se è il tuo, inserisci il PIN personale corretto."


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


async def build_me(member: dict) -> Me:
    group = await db.groups.find_one({"id": member["group_id"]}, {"_id": 0})
    count = await db.members.count_documents({"group_id": member["group_id"]})
    return Me(
        member_id=member["id"],
        nickname=member["nickname"],
        group_id=member["group_id"],
        group_name=group["name"] if group else "",
        member_count=count,
        today=today_iso(TZ),
        role=member.get("role", "member"),
        participating=bool(member.get("participating", False)),
    )


@router.post("/auth/join", response_model=Me)
async def join(body: JoinRequest, response: Response):
    name_key = body.group_name.casefold()
    group = await db.groups.find_one({"name_key": name_key})
    if body.mode == "create":
        if group:
            raise HTTPException(status_code=409, detail="Esiste già un gruppo con questo nome")
        group = {
            "id": new_id(),
            "name": body.group_name,
            "name_key": name_key,
            "password_hash": hash_secret(body.group_password),
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
            "id": new_id(),
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
    response.set_cookie(
    COOKIE_NAME, 
    token, 
    httponly=True, 
    samesite="none", 
    secure=True, 
    max_age=60 * 60 * 24 * 60, 
    path="/"
)
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


@router.get("/members", response_model=List[MemberOut])
async def members(member: dict = Depends(current_member)):
    docs = await db.members.find({"group_id": member["group_id"]}, {"_id": 0}).sort("joined_at", 1).to_list(500)
    return [member_out(d) for d in docs]
