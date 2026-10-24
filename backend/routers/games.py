from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import DuplicateKeyError

from lib.catalog import game_points, next_tier
from lib.db import db
from lib.security import current_member, new_id, now_iso
from models.schemas import (
    CustomContent,
    FinishRequest,
    FinishResult,
    GameInput,
    GameOut,
    GameSummary,
    ReviewRequest,
)
from routers.shop import require_admin

router = APIRouter()

MAX_GAMES_PER_MEMBER = 50


def validate_custom(custom: CustomContent) -> None:
    blocks = custom.blocks
    if not 1 <= len(blocks) <= 40:
        raise HTTPException(status_code=400, detail="Servono da 1 a 40 blocchi")
    if not any(b.kind != "info" and b.value >= 1 for b in blocks):
        raise HTTPException(status_code=400, detail="Serve almeno una sfida che assegni punti")
    for i, b in enumerate(blocks, start=1):
        where = f"Blocco {i}: "
        if b.kind == "choice":
            if not b.prompt:
                raise HTTPException(status_code=400, detail=where + "manca la domanda")
            if not 2 <= len(b.options) <= 6:
                raise HTTPException(status_code=400, detail=where + "servono da 2 a 6 risposte")
            if b.correct >= len(b.options):
                raise HTTPException(status_code=400, detail=where + "risposta corretta non valida")
        elif b.kind == "type":
            if not b.prompt or not b.answer:
                raise HTTPException(status_code=400, detail=where + "servono domanda e risposta")
        elif b.kind == "number":
            if not b.prompt or b.number is None:
                raise HTTPException(status_code=400, detail=where + "servono domanda e numero")
        elif b.kind == "order":
            if not 3 <= len(b.steps) <= 8:
                raise HTTPException(status_code=400, detail=where + "servono da 3 a 8 passaggi")
        elif b.kind == "match":
            if not 2 <= len(b.pairs) <= 6:
                raise HTTPException(status_code=400, detail=where + "servono da 2 a 6 coppie")
        elif b.kind == "info" and not b.prompt:
            raise HTTPException(status_code=400, detail=where + "manca il testo")


def validate_content(data: GameInput) -> None:
    c = data.content
    t = data.template
    if t == "quiz":
        if not 1 <= len(c.questions) <= 30:
            raise HTTPException(status_code=400, detail="Servono da 1 a 30 domande")
        if any(q.correct >= len(q.options) for q in c.questions):
            raise HTTPException(status_code=400, detail="Ogni domanda deve avere una risposta corretta valida")
    elif t == "sort":
        if not 2 <= len(c.categories) <= 6:
            raise HTTPException(status_code=400, detail="Servono da 2 a 6 categorie")
        if not 2 <= len(c.sort_items) <= 30:
            raise HTTPException(status_code=400, detail="Servono da 2 a 30 elementi da smistare")
        if any(i.category >= len(c.categories) for i in c.sort_items):
            raise HTTPException(status_code=400, detail="Ogni elemento deve avere una categoria valida")
    elif t in ("abbina", "memory"):
        if not 2 <= len(c.pairs) <= 12:
            raise HTTPException(status_code=400, detail="Servono da 2 a 12 coppie")
    elif t == "indovina":
        if not 1 <= len(c.pairs) <= 30:
            raise HTTPException(status_code=400, detail="Servono da 1 a 30 indizi")
    elif t == "ordina":
        if not 3 <= len(c.steps) <= 12:
            raise HTTPException(status_code=400, detail="Servono da 3 a 12 passaggi")
    elif t == "custom":
        if c.custom is None:
            raise HTTPException(status_code=400, detail="Manca il contenuto del gioco")
        validate_custom(c.custom)


def item_count(g: dict) -> int:
    c = g["content"]
    t = g["template"]
    if t == "quiz":
        return len(c["questions"])
    if t == "sort":
        return len(c["sort_items"])
    if t == "ordina":
        return len(c["steps"])
    if t == "custom":
        return len([b for b in (c.get("custom") or {}).get("blocks", []) if b["kind"] != "info"])
    return len(c["pairs"])


def summary_fields(g: dict, member: dict, plays: dict, claims: dict) -> dict:
    return {
        "id": g["id"],
        "title": g["title"],
        "description": g.get("description", ""),
        "template": g["template"],
        "status": g["status"],
        "author": g["author"],
        "author_id": g["author_id"],
        "plays": g.get("plays", 0),
        "item_count": item_count(g),
        "created_at": g["created_at"],
        "review_note": g.get("review_note"),
        "is_mine": g["author_id"] == member["id"],
        "my_best": plays.get(g["id"]),
        "my_claimed": claims.get(g["id"]),
    }


async def my_progress(member: dict) -> tuple[dict, dict]:
    plays = {d["game_id"]: d["best_percent"] async for d in db.game_plays.find({"member_id": member["id"]}, {"_id": 0})}
    claims = {d["game_id"]: d["points"] async for d in db.game_claims.find({"member_id": member["id"]}, {"_id": 0})}
    return plays, claims


async def get_game(game_id: str, member: dict) -> dict:
    game = await db.games.find_one({"id": game_id, "group_id": member["group_id"]}, {"_id": 0})
    if not game:
        raise HTTPException(status_code=404, detail="Gioco non trovato")
    return game


def can_view(game: dict, member: dict) -> bool:
    return game["status"] == "published" or game["author_id"] == member["id"] or member.get("role") == "admin"


@router.get("/games", response_model=List[GameSummary])
async def list_games(member: dict = Depends(current_member)):
    docs = (
        await db.games.find(
            {"group_id": member["group_id"], "$or": [{"status": "published"}, {"author_id": member["id"]}]},
            {"_id": 0},
        )
        .sort("created_at", -1)
        .to_list(500)
    )
    plays, claims = await my_progress(member)
    return [GameSummary(**summary_fields(g, member, plays, claims)) for g in docs]


@router.get("/games/review", response_model=List[GameSummary])
async def review_queue(member: dict = Depends(current_member)):
    require_admin(member)
    docs = await db.games.find({"group_id": member["group_id"], "status": "pending"}, {"_id": 0}).sort("created_at", 1).to_list(200)
    plays, claims = await my_progress(member)
    return [GameSummary(**summary_fields(g, member, plays, claims)) for g in docs]


@router.get("/games/{game_id}", response_model=GameOut)
async def read_game(game_id: str, member: dict = Depends(current_member)):
    game = await get_game(game_id, member)
    if not can_view(game, member):
        raise HTTPException(status_code=403, detail="Questo gioco non è ancora pubblicato")
    plays, claims = await my_progress(member)
    return GameOut(**summary_fields(game, member, plays, claims), content=game["content"])


@router.post("/games", response_model=GameOut)
async def create_game(body: GameInput, member: dict = Depends(current_member)):
    validate_content(body)
    if await db.games.count_documents({"author_id": member["id"]}) >= MAX_GAMES_PER_MEMBER:
        raise HTTPException(status_code=409, detail="Hai raggiunto il limite di giochi creati")
    doc = {
        "id": new_id(),
        "group_id": member["group_id"],
        "author_id": member["id"],
        "author": member["nickname"],
        "title": body.title,
        "description": body.description,
        "template": body.template,
        "content": body.content.model_dump(),
        "status": "draft",
        "review_note": None,
        "plays": 0,
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.games.insert_one(dict(doc))
    return GameOut(**summary_fields(doc, member, {}, {}), content=doc["content"])


@router.put("/games/{game_id}", response_model=GameOut)
async def update_game(game_id: str, body: GameInput, member: dict = Depends(current_member)):
    game = await get_game(game_id, member)
    is_admin = member.get("role") == "admin"
    if game["author_id"] != member["id"] and not is_admin:
        raise HTTPException(status_code=403, detail="Puoi modificare solo i tuoi giochi")
    if not is_admin and game["status"] not in ("draft", "rejected"):
        raise HTTPException(status_code=409, detail="Un gioco in revisione o pubblicato non si può modificare")
    validate_content(body)
    fields = {
        "title": body.title,
        "description": body.description,
        "template": body.template,
        "content": body.content.model_dump(),
        "updated_at": now_iso(),
    }
    await db.games.update_one({"id": game_id}, {"$set": fields})
    game.update(fields)
    plays, claims = await my_progress(member)
    return GameOut(**summary_fields(game, member, plays, claims), content=game["content"])


@router.post("/games/{game_id}/submit", response_model=GameSummary)
async def submit_game(game_id: str, member: dict = Depends(current_member)):
    game = await get_game(game_id, member)
    if game["author_id"] != member["id"]:
        raise HTTPException(status_code=403, detail="Puoi inviare solo i tuoi giochi")
    if game["status"] not in ("draft", "rejected"):
        raise HTTPException(status_code=409, detail="Il gioco è già in revisione o pubblicato")
    status = "published" if member.get("role") == "admin" else "pending"
    fields = {"status": status, "review_note": None, "updated_at": now_iso()}
    if status == "published":
        fields["published_at"] = now_iso()
    await db.games.update_one({"id": game_id}, {"$set": fields})
    game.update(fields)
    plays, claims = await my_progress(member)
    return GameSummary(**summary_fields(game, member, plays, claims))


@router.post("/games/{game_id}/review", response_model=GameSummary)
async def review_game(game_id: str, body: ReviewRequest, member: dict = Depends(current_member)):
    require_admin(member)
    game = await get_game(game_id, member)
    if game["status"] != "pending":
        raise HTTPException(status_code=409, detail="Il gioco non è in attesa di revisione")
    if body.approve:
        fields = {"status": "published", "review_note": None, "published_at": now_iso()}
    else:
        fields = {"status": "rejected", "review_note": body.note or "Non approvato"}
    fields["updated_at"] = now_iso()
    await db.games.update_one({"id": game_id}, {"$set": fields})
    game.update(fields)
    plays, claims = await my_progress(member)
    return GameSummary(**summary_fields(game, member, plays, claims))


@router.delete("/games/{game_id}")
async def delete_game(game_id: str, member: dict = Depends(current_member)):
    game = await get_game(game_id, member)
    if game["author_id"] != member["id"] and member.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Puoi eliminare solo i tuoi giochi")
    await db.games.delete_one({"id": game_id})
    await db.game_plays.delete_many({"game_id": game_id})
    await db.game_claims.delete_many({"game_id": game_id})
    return {"ok": True}


def build_result(game: dict, member: dict, round_percent: int, best: int, claimed) -> FinishResult:
    available = game_points(round_percent)
    upcoming = next_tier(round_percent)
    reason = None
    can_claim = False
    if claimed is None:
        if game["author_id"] == member["id"]:
            reason = "author"
        elif not member.get("participating"):
            reason = "non_participating"
        elif available == 0:
            reason = "too_low"
        else:
            can_claim = True
    return FinishResult(
        round_percent=round_percent,
        best_percent=best,
        points_available=available,
        claimed_points=claimed,
        can_claim=can_claim,
        reason=reason,
        next_percent=upcoming[0] if upcoming else None,
        next_points=upcoming[1] if upcoming else None,
    )


@router.post("/games/{game_id}/finish", response_model=FinishResult)
async def finish_game(game_id: str, body: FinishRequest, member: dict = Depends(current_member)):
    game = await get_game(game_id, member)
    if game["status"] != "published" and game["author_id"] != member["id"]:
        raise HTTPException(status_code=403, detail="Questo gioco non è ancora pubblicato")
    previous = await db.game_plays.find_one({"game_id": game_id, "member_id": member["id"]}, {"_id": 0})
    best = max(previous["best_percent"] if previous else 0, body.score)
    await db.game_plays.update_one(
        {"game_id": game_id, "member_id": member["id"]},
        {"$set": {"best_percent": best, "last_percent": body.score, "last_at": now_iso(), "group_id": member["group_id"]}, "$inc": {"plays": 1}},
        upsert=True,
    )
    await db.games.update_one({"id": game_id}, {"$inc": {"plays": 1}})
    claim = await db.game_claims.find_one({"game_id": game_id, "member_id": member["id"]}, {"_id": 0})
    return build_result(game, member, body.score, best, claim["points"] if claim else None)


@router.post("/games/{game_id}/claim", response_model=FinishResult)
async def claim_points(game_id: str, member: dict = Depends(current_member)):
    game = await get_game(game_id, member)
    if game["status"] != "published":
        raise HTTPException(status_code=403, detail="Questo gioco non è pubblicato")
    if game["author_id"] == member["id"]:
        raise HTTPException(status_code=403, detail="Non puoi ottenere punti dal tuo gioco")
    if not member.get("participating"):
        raise HTTPException(status_code=403, detail="Attiva la partecipazione nello Shop per ottenere punti")
    play = await db.game_plays.find_one({"game_id": game_id, "member_id": member["id"]}, {"_id": 0})
    if not play:
        raise HTTPException(status_code=409, detail="Gioca prima una partita")
    percent = play.get("last_percent", play["best_percent"])
    points = game_points(percent)
    if points == 0:
        raise HTTPException(status_code=409, detail="L'ultimo round è sotto il punteggio minimo per ottenere punti")
    if await db.game_claims.find_one({"game_id": game_id, "member_id": member["id"]}):
        raise HTTPException(status_code=409, detail="Hai già riscosso i punti di questo gioco")
    try:
        await db.game_claims.insert_one(
            {
                "id": new_id(),
                "game_id": game_id,
                "group_id": member["group_id"],
                "member_id": member["id"],
                "points": points,
                "created_at": now_iso(),
            }
        )
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Hai già riscosso i punti di questo gioco")
    await db.point_events.insert_one(
        {
            "id": new_id(),
            "group_id": member["group_id"],
            "member_id": member["id"],
            "nickname": member["nickname"],
            "kind": "game",
            "subject": game["title"],
            "grade": None,
            "points": points,
            "reason": f"Gioco: {game['title']}",
            "created_by": member["nickname"],
            "created_at": now_iso(),
        }
    )
    return build_result(game, member, percent, play["best_percent"], points)
