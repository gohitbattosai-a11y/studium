import json
import random
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from lib.db import db
from lib.gate import feature_gate
from lib.security import new_id, now_iso
from lib.stadium_core import CFG, COLORS, fatigue_map, lineup_problem, sanitize_squad
from lib.stadium_league import (
    LCFG,
    SCFG,
    blank_squad,
    club_team,
    club_view,
    compute_scorers,
    champions_tables,
    compute_table,
    ensure_champions,
    ensure_serie_a,
    fixtures_of,
    interval_of,
    make_code,
    start_custom,
    status_of,
    tick,
)
from lib.stadium_friendly import busy, club_rating, friendly_league_id, notify as friendly_notify, play_friendly
from lib.stadium_packs import EXCLUSIVE, PACKS, PACKS_BY_ID, RANK, pack_public, release_value, roll_pack
from routers.shop import require_admin, totals

router = APIRouter()

stadium_member = feature_gate("citta")


class CreateClub(BaseModel):
    name: str = Field(min_length=3, max_length=24)
    color: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")


class SquadSync(BaseModel):
    ctx: str = "pub"
    formation: str
    xi: list[Optional[str]] = Field(default_factory=list)
    players: list[dict] = Field(default_factory=list)


class CreateLeague(BaseModel):
    name: str = Field(min_length=3, max_length=28)
    size: int = Field(ge=2, le=24)
    private: bool = False


class JoinLeague(BaseModel):
    code: Optional[str] = None


class OpenPack(BaseModel):
    pack_id: str


class ReleaseCard(BaseModel):
    card_id: str


async def club_ctx(club: dict) -> str:
    lid = club.get("custom_league_id")
    if not lid:
        return "pub"
    lg = await db.stadium_leagues.find_one({"id": lid}, {"_id": 0, "private": 1})
    return lid if lg and lg.get("private") else "pub"


async def init_private_squad(club: dict, league_id: str, member_id: str) -> None:
    if (club.get("squads") or {}).get(league_id):
        return
    await db.stadium_clubs.update_one({"id": club["id"]}, {"$set": {f"squads.{league_id}": blank_squad(await member_cards(member_id))}})


def club_public(club: dict, ctx: str = "pub") -> dict:
    return {
        "ctx": ctx,
        "id": club["id"],
        "name": club["name"],
        "color": club["color"],
        "formation": club["formation"],
        "xi": club["xi"],
        "players": club["players"],
        "status": status_of(club),
        "pending": round(float(club.get("pending", 0)), 1),
        "played": int(club.get("played", 0)),
        "custom_league_id": club.get("custom_league_id"),
        "serie_a_id": club.get("serie_a_id"),
        "champions_id": club.get("champions_id"),
        "fatigue": fatigue_map(club_team(club), time.time()),
    }


async def get_club(member: dict) -> Optional[dict]:
    return await db.stadium_clubs.find_one({"member_id": member["id"]}, {"_id": 0})


async def need_club(member: dict) -> dict:
    club = await get_club(member)
    if not club:
        raise HTTPException(status_code=404, detail="Crea prima la tua squadra")
    return club


async def member_cards(member_id: str) -> list[dict]:
    return [c async for c in db.stadium_cards.find({"member_id": member_id}, {"_id": 0})]


def settings() -> dict:
    return {
        "interval_minutes": interval_of("custom"),
        "serie_a_interval_minutes": interval_of("serie_a"),
        "min_teams": LCFG["minTeams"],
        "max_teams": LCFG["maxTeams"],
        "default_teams": LCFG["defaultTeams"],
        "walkover_goals": LCFG["walkoverGoals"],
        "auto_substitute": LCFG["autoSubstitute"],
        "serie_a_teams": SCFG["teams"],
        "serie_a_relegated": SCFG["relegated"],
        "colors": COLORS,
        "discipline": CFG["discipline"],
        "squad_max": CFG["squad"]["max"],
    }


async def next_fixture(club: dict) -> Optional[dict]:
    best = None
    async for f in db.stadium_fixtures.find({"status": "scheduled", "$or": [{"home": club["id"]}, {"away": club["id"]}]}, {"_id": 0, "log": 0}).sort("at", 1).limit(3):
        league = await db.stadium_leagues.find_one({"id": f["league_id"]}, {"_id": 0, "name": 1, "kind": 1, "teams": 1, "season": 1})
        if not league or league["season"] != f["season"]:
            continue
        names = {t["id"]: t["name"] for t in league["teams"]}
        opp = f["away"] if f["home"] == club["id"] else f["home"]
        cand = {"id": f["id"], "at": f["at"], "day": f["day"], "league_id": f["league_id"], "league": league["name"], "kind": league["kind"], "opponent": names.get(opp, "?"), "home": f["home"] == club["id"]}
        if best is None or cand["at"] < best["at"]:
            best = cand
    return best


@router.get("/stadium/state")
async def state(member: dict = Depends(stadium_member)):
    club = await get_club(member)
    out: dict = {"now": time.time(), "settings": settings(), "club": None, "cards": [], "next": None, "warning": None, "ctx": "pub", "ctx_name": None}
    out["cards"] = await member_cards(member["id"])
    if club:
        ctx = await club_ctx(club)
        view = club_view(club, ctx)
        out["ctx"] = ctx
        out["ctx_name"] = None
        if ctx != "pub":
            lg = await db.stadium_leagues.find_one({"id": ctx}, {"_id": 0, "name": 1})
            out["ctx_name"] = lg["name"] if lg else None
        out["club"] = club_public(view, ctx)
        out["next"] = await next_fixture(club)
        out["warning"] = lineup_problem(club_team(view), set(status_of(view).keys()))
    return out


@router.post("/stadium/club")
async def create_club(body: CreateClub, member: dict = Depends(stadium_member)):
    if await get_club(member):
        raise HTTPException(status_code=409, detail="Hai già una squadra")
    doc = {
        "id": new_id(),
        "member_id": member["id"],
        "group_id": member["group_id"],
        "name": body.name.strip(),
        "color": body.color,
        "formation": "4-3-3",
        "xi": [None] * 11,
        "players": [],
        "state": {"out": {}, "yellows": {}},
        "pending": 0.0,
        "played": 0,
        "custom_league_id": None,
        "serie_a_id": None,
        "created_at": now_iso(),
    }
    try:
        await db.stadium_clubs.insert_one(dict(doc))
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Hai già una squadra")
    return club_public(doc)


@router.put("/stadium/club/squad")
async def sync_squad(body: SquadSync, member: dict = Depends(stadium_member)):
    club = await need_club(member)
    ctx = await club_ctx(club)
    if body.ctx != ctx:
        raise HTTPException(status_code=409, detail="La lega è cambiata, ricarico la rosa")
    cards = {c["id"]: c for c in await member_cards(member["id"])}
    clean = sanitize_squad(body.model_dump(), cards, random.Random())
    ids = {p["id"] for p in clean["players"]}
    view = club_view(club, ctx)
    state_doc = view.get("state") or {"out": {}, "yellows": {}}
    state_doc["out"] = {k: v for k, v in state_doc.get("out", {}).items() if k in ids}
    if ctx == "pub":
        fields = {"formation": clean["formation"], "xi": clean["xi"], "players": clean["players"], "state": state_doc}
    else:
        fields = {f"squads.{ctx}": {"formation": clean["formation"], "xi": clean["xi"], "players": clean["players"], "state": state_doc}}
    await db.stadium_clubs.update_one({"id": club["id"]}, {"$set": fields})
    view = {**view, "formation": clean["formation"], "xi": clean["xi"], "players": clean["players"], "state": state_doc}
    return {"club": club_public(view, ctx), "warning": lineup_problem(club_team(view), set(status_of(view).keys()))}


class WorldSync(BaseModel):
    data: dict
    saved_at: int = 0


async def check_ctx(member: dict, ctx: str) -> None:
    if ctx == "pub":
        return
    club = await get_club(member)
    if not club or await club_ctx(club) != ctx:
        raise HTTPException(status_code=409, detail="Contesto non valido")


@router.get("/stadium/world/{ctx}")
async def get_world(ctx: str, member: dict = Depends(stadium_member)):
    await check_ctx(member, ctx)
    doc = await db.stadium_worlds.find_one({"member_id": member["id"], "ctx": ctx}, {"_id": 0})
    return {"data": doc["data"] if doc else None, "saved_at": int(doc["saved_at"]) if doc else 0}


@router.put("/stadium/world/{ctx}")
async def put_world(ctx: str, body: WorldSync, member: dict = Depends(stadium_member)):
    await check_ctx(member, ctx)
    if len(json.dumps(body.data, separators=(",", ":"))) > 1_500_000:
        raise HTTPException(status_code=413, detail="Dati troppo grandi")
    await db.stadium_worlds.update_one({"member_id": member["id"], "ctx": ctx}, {"$set": {"data": body.data, "saved_at": body.saved_at}}, upsert=True)
    return {"ok": True}


@router.post("/stadium/club/claim")
async def claim(member: dict = Depends(stadium_member)):
    club = await need_club(member)
    got = await db.stadium_clubs.find_one_and_update({"id": club["id"], "pending": {"$gt": 0}}, {"$set": {"pending": 0.0}}, projection={"_id": 0, "pending": 1})
    return {"amount": round(float((got or {}).get("pending", 0)), 1)}


def league_card(league: dict, member: dict, club: Optional[dict]) -> dict:
    mine = bool(club) and any(t["id"] == club["id"] for t in league["teams"])
    return {
        "id": league["id"],
        "name": league["name"],
        "kind": league["kind"],
        "status": league["status"],
        "season": league["season"],
        "size": league["size"],
        "teams": len(league["teams"]),
        "humans": sum(1 for t in league["teams"] if t.get("member_id")),
        "private": bool(league.get("private")),
        "owner": league.get("owner_id") == member["id"],
        "owner_name": league.get("owner_name"),
        "joined": mine,
        "code": league.get("code") if (league.get("owner_id") == member["id"] or mine) else None,
        "interval_minutes": interval_of(league["kind"]),
        "day": league.get("day", 0),
        "total_days": league.get("total_days", 0),
        "start_at": league.get("start_at"),
    }


@router.get("/stadium/leagues")
async def leagues(member: dict = Depends(stadium_member)):
    club = await get_club(member)
    serie = await ensure_serie_a(member["group_id"])
    champions = await ensure_champions(member["group_id"])
    docs = [d async for d in db.stadium_leagues.find({"group_id": member["group_id"], "kind": "custom"}, {"_id": 0, "bots": 0}).sort("created_at", -1).limit(60)]
    return {"serie_a": league_card(serie, member, club), "champions": league_card(champions, member, club), "leagues": [league_card(d, member, club) for d in docs], "now": time.time()}


async def detail(league: dict, member: dict, club: Optional[dict]) -> dict:
    fixtures = await fixtures_of(league)
    table = compute_table(league, fixtures)
    names = {t["id"]: t for t in league["teams"]}
    fx = [
        {
            "id": f["id"],
            "day": f["day"],
            "at": f["at"],
            "status": f["status"],
            "home": f["home"],
            "away": f["away"],
            "hg": f["hg"],
            "ag": f["ag"],
            "walkover": f.get("walkover"),
            "events": f.get("events") or [],
            "stage": f.get("stage"),
            "grp": f.get("grp"),
            "pens": f.get("pens"),
        }
        for f in fixtures
    ]
    out = league_card(league, member, club)
    out["teams_list"] = [{"id": t["id"], "name": t["name"], "color": t["color"], "bot": t.get("member_id") is None, "mine": bool(club) and t["id"] == club["id"]} for t in league["teams"]]
    out["table"] = table
    if league["kind"] == "champions":
        out["groups"] = champions_tables(league, fixtures)
        out["stage"] = league.get("stage")
    out["fixtures"] = fx
    out["scorers"] = compute_scorers(fixtures, league)
    out["champion"] = names.get(league.get("champion") or "", {}).get("name") if league.get("champion") else None
    out["promoted_waiting"] = len(league.get("promoted") or []) if league["kind"] == "serie_a" else 0
    out["next_season_at"] = league.get("next_season_at")
    out["now"] = time.time()
    return out


async def get_league(league_id: str, member: dict) -> dict:
    league = await db.stadium_leagues.find_one({"id": league_id, "group_id": member["group_id"]}, {"_id": 0})
    if not league:
        raise HTTPException(status_code=404, detail="Lega non trovata")
    return league


@router.get("/stadium/serie-a")
async def serie_a(member: dict = Depends(stadium_member)):
    club = await get_club(member)
    return await detail(await ensure_serie_a(member["group_id"]), member, club)


@router.get("/stadium/champions")
async def champions(member: dict = Depends(stadium_member)):
    club = await get_club(member)
    return await detail(await ensure_champions(member["group_id"]), member, club)


@router.get("/stadium/leagues/{league_id}")
async def league_detail(league_id: str, member: dict = Depends(stadium_member)):
    return await detail(await get_league(league_id, member), member, await get_club(member))


@router.post("/stadium/leagues")
async def create_league(body: CreateLeague, member: dict = Depends(stadium_member)):
    club = await need_club(member)
    if club.get("custom_league_id"):
        raise HTTPException(status_code=409, detail="Sei già in una lega: esci o aspetta la fine")
    if not LCFG["minTeams"] <= body.size <= LCFG["maxTeams"]:
        raise HTTPException(status_code=400, detail=f"Le squadre devono essere tra {LCFG['minTeams']} e {LCFG['maxTeams']}")
    mine = await db.stadium_leagues.count_documents({"owner_id": member["id"], "kind": "custom", "status": {"$ne": "finished"}})
    if mine >= LCFG["maxLeaguesOwned"]:
        raise HTTPException(status_code=409, detail="Hai già troppe leghe aperte")
    size = body.size + (body.size % 2)
    league = {
        "id": new_id(),
        "group_id": member["group_id"],
        "kind": "custom",
        "name": body.name.strip(),
        "owner_id": member["id"],
        "owner_name": member.get("nickname") or club["name"],
        "code": make_code(),
        "private": body.private,
        "size": min(size, LCFG["maxTeams"]),
        "status": "open",
        "season": 1,
        "teams": [{"id": club["id"], "name": club["name"], "color": club["color"], "member_id": member["id"], "club_id": club["id"]}],
        "bots": {},
        "day": 0,
        "total_days": 0,
        "champion": None,
        "created_at": now_iso(),
    }
    await db.stadium_leagues.insert_one(dict(league))
    await db.stadium_clubs.update_one({"id": club["id"]}, {"$set": {"custom_league_id": league["id"]}})
    if league["private"]:
        await init_private_squad(club, league["id"], member["id"])
    return league_card(league, member, club)


@router.post("/stadium/leagues/{league_id}/join")
async def join_league(league_id: str, body: JoinLeague, member: dict = Depends(stadium_member)):
    club = await need_club(member)
    league = await get_league(league_id, member)
    if league["kind"] != "custom" or league["status"] != "open":
        raise HTTPException(status_code=409, detail="Questa lega non accetta nuove squadre")
    if club.get("custom_league_id"):
        raise HTTPException(status_code=409, detail="Sei già in una lega")
    if league.get("private") and (body.code or "").strip().upper() != league.get("code"):
        raise HTTPException(status_code=403, detail="Codice errato")
    if len(league["teams"]) >= league["size"]:
        raise HTTPException(status_code=409, detail="Lega al completo")
    res = await db.stadium_leagues.update_one(
        {"id": league["id"], "status": "open", f"teams.{league['size'] - 1}": {"$exists": False}, "teams.id": {"$ne": club["id"]}},
        {"$push": {"teams": {"id": club["id"], "name": club["name"], "color": club["color"], "member_id": member["id"], "club_id": club["id"]}}},
    )
    if res.modified_count == 0:
        raise HTTPException(status_code=409, detail="Impossibile entrare nella lega")
    await db.stadium_clubs.update_one({"id": club["id"]}, {"$set": {"custom_league_id": league["id"]}})
    if league.get("private"):
        await init_private_squad(club, league["id"], member["id"])
    return {"ok": True}


@router.post("/stadium/leagues/{league_id}/leave")
async def leave_league(league_id: str, member: dict = Depends(stadium_member)):
    club = await need_club(member)
    league = await get_league(league_id, member)
    if league["status"] != "open" or not any(t["id"] == club["id"] for t in league["teams"]):
        raise HTTPException(status_code=409, detail="Non puoi uscire da questa lega")
    if league.get("owner_id") == member["id"]:
        raise HTTPException(status_code=409, detail="Il creatore può solo eliminare la lega")
    await db.stadium_leagues.update_one({"id": league["id"]}, {"$pull": {"teams": {"id": club["id"]}}})
    await db.stadium_clubs.update_one({"id": club["id"]}, {"$set": {"custom_league_id": None}})
    return {"ok": True}


@router.delete("/stadium/leagues/{league_id}")
async def delete_league(league_id: str, member: dict = Depends(stadium_member)):
    league = await get_league(league_id, member)
    if league.get("owner_id") != member["id"] or league["kind"] != "custom":
        raise HTTPException(status_code=403, detail="Solo il creatore può eliminare la lega")
    if league["status"] == "running":
        raise HTTPException(status_code=409, detail="La lega è in corso")
    ids = [t["club_id"] for t in league["teams"] if t.get("club_id")]
    await db.stadium_clubs.update_many({"id": {"$in": ids}, "custom_league_id": league["id"]}, {"$set": {"custom_league_id": None}})
    await db.stadium_clubs.update_many({"id": {"$in": ids}}, {"$unset": {f"squads.{league['id']}": ""}})
    await db.stadium_worlds.delete_many({"ctx": league["id"]})
    await db.stadium_fixtures.delete_many({"league_id": league["id"]})
    await db.stadium_leagues.delete_one({"id": league["id"]})
    return {"ok": True}


@router.post("/stadium/leagues/{league_id}/start")
async def start_league(league_id: str, member: dict = Depends(stadium_member)):
    league = await get_league(league_id, member)
    if league.get("owner_id") != member["id"] or league["kind"] != "custom":
        raise HTTPException(status_code=403, detail="Solo il creatore può avviare la lega")
    if league["status"] not in ("open", "finished"):
        raise HTTPException(status_code=409, detail="La lega è già in corso")
    if league["status"] == "finished":
        league["teams"] = [t for t in league["teams"] if t.get("member_id")]
        league["bots"] = {}
        league["season"] = int(league["season"])
        for t in league["teams"]:
            c = await db.stadium_clubs.find_one({"id": t["club_id"]}, {"_id": 0, "custom_league_id": 1})
            if c and c.get("custom_league_id") not in (None, league["id"]):
                raise HTTPException(status_code=409, detail="Una squadra è già in un'altra lega")
    err = await start_custom(league)
    if err:
        raise HTTPException(status_code=409, detail=err)
    ids = [t["club_id"] for t in league["teams"] if t.get("club_id")]
    await db.stadium_clubs.update_many({"id": {"$in": ids}}, {"$set": {"custom_league_id": league["id"]}})
    return await detail(league, member, await get_club(member))


@router.get("/stadium/fixtures/{fixture_id}")
async def replay(fixture_id: str, member: dict = Depends(stadium_member)):
    fx = await db.stadium_fixtures.find_one({"id": fixture_id, "group_id": member["group_id"]}, {"_id": 0})
    if not fx or fx["status"] != "played":
        raise HTTPException(status_code=404, detail="Partita non ancora giocata")
    league = await db.stadium_leagues.find_one({"id": fx["league_id"]}, {"_id": 0, "teams": 1, "name": 1})
    if fx.get("stage") == "friendly":
        league = {"name": "Amichevole", "teams": []}
    names = {t["id"]: t for t in (league or {}).get("teams", [])}
    return {
        "id": fx["id"],
        "league": (league or {}).get("name", ""),
        "day": fx["day"],
        "at": fx["at"],
        "hg": fx["hg"],
        "ag": fx["ag"],
        "pens": fx.get("pens"),
        "stage": fx.get("stage"),
        "walkover": fx.get("walkover"),
        "reason": fx.get("walkover_reason"),
        "events": fx.get("events") or [],
        "log": fx.get("log") or [],
        "home": fx.get("home_snap") or {"id": fx["home"], "name": names.get(fx["home"], {}).get("name", "?"), "color": names.get(fx["home"], {}).get("color", "#2563eb"), "formation": "4-3-3", "xi": [], "players": []},
        "away": fx.get("away_snap") or {"id": fx["away"], "name": names.get(fx["away"], {}).get("name", "?"), "color": names.get(fx["away"], {}).get("color", "#dc2626"), "formation": "4-3-3", "xi": [], "players": []},
        "notes": fx.get("notes") or {},
    }


async def pack_balance(member: dict) -> int:
    earned, spent = await totals(member["group_id"])
    return earned.get(member["id"], 0) - spent.get(member["id"], 0)


async def pack_state(member: dict) -> dict:
    cards = await member_cards(member["id"])
    owned = {c["exclusive_id"] for c in cards if c.get("exclusive_id")}
    doc = await db.stadium_packs.find_one({"member_id": member["id"]}, {"_id": 0}) or {}
    return {
        "participating": bool(member.get("participating", False)),
        "balance": await pack_balance(member),
        "packs": [pack_public(p) for p in PACKS],
        "pity": int(doc.get("pity", 0)),
        "collection": [{"id": e["id"], "name": e["name"], "pos": e["pos"], "ovr": e["ovr"], "rarity": e["rarity"], "card": e["card"], "owned": e["id"] in owned} for e in EXCLUSIVE],
    }


@router.get("/stadium/packs")
async def packs(member: dict = Depends(stadium_member)):
    return await pack_state(member)


@router.post("/stadium/packs/open")
async def open_pack(body: OpenPack, member: dict = Depends(stadium_member)):
    pack = PACKS_BY_ID.get(body.pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack non trovato")
    if not member.get("participating"):
        raise HTTPException(status_code=403, detail="Attiva la partecipazione nello Shop per aprire i pack")
    await need_club(member)
    if await pack_balance(member) < pack["price"]:
        raise HTTPException(status_code=409, detail="Punti insufficienti")
    cards_owned = await member_cards(member["id"])
    owned = {c["exclusive_id"] for c in cards_owned if c.get("exclusive_id")}
    doc = await db.stadium_packs.find_one({"member_id": member["id"]}, {"_id": 0}) or {}
    cards, pity = roll_pack(pack, owned, int(doc.get("pity", 0)), random.Random())
    await db.purchases.insert_one({"id": new_id(), "group_id": member["group_id"], "member_id": member["id"], "item_id": f"pack:{pack['id']}:{new_id()}", "price": pack["price"], "created_at": now_iso()})
    stored = []
    for c in cards:
        doc_c = {"id": c["id"], "member_id": member["id"], "group_id": member["group_id"], "rarity": c["rarity"], "exclusive_id": c["exclusive_id"], "player": c["player"], "pack_id": pack["id"], "created_at": now_iso()}
        await db.stadium_cards.insert_one(dict(doc_c))
        stored.append({"id": c["id"], "rarity": c["rarity"], "exclusive": bool(c["exclusive_id"]), "player": c["player"]})
    await db.stadium_packs.update_one({"member_id": member["id"]}, {"$set": {"pity": pity, "group_id": member["group_id"]}}, upsert=True)
    stored.sort(key=lambda c: RANK[c["rarity"]])
    return {"pack": pack_public(pack), "cards": stored, "balance": await pack_balance(member), "pity": pity}


@router.post("/stadium/cards/release")
async def release_card(body: ReleaseCard, member: dict = Depends(stadium_member)):
    club = await need_club(member)
    card = await db.stadium_cards.find_one_and_delete({"id": body.card_id, "member_id": member["id"]}, projection={"_id": 0})
    if not card:
        raise HTTPException(status_code=404, detail="Carta non trovata")
    value = release_value(int(card["player"]["ovr"]))
    fields = {"players": [p for p in club["players"] if p["id"] != card["id"]], "xi": [None if i == card["id"] else i for i in club["xi"]]}
    for key, sq in (club.get("squads") or {}).items():
        fields[f"squads.{key}.players"] = [p for p in sq.get("players", []) if p["id"] != card["id"]]
        fields[f"squads.{key}.xi"] = [None if i == card["id"] else i for i in sq.get("xi", [])]
    await db.stadium_clubs.update_one({"id": club["id"]}, {"$set": fields, "$inc": {"pending": value}})
    return {"value": value}


@router.post("/stadium/admin/advance")
async def advance(member: dict = Depends(stadium_member)):
    require_admin(member)
    leagues_running = [d async for d in db.stadium_leagues.find({"group_id": member["group_id"], "status": "running"}, {"_id": 0, "id": 1, "season": 1})]
    now = time.time()
    for lg in leagues_running:
        nxt = await db.stadium_fixtures.find_one({"league_id": lg["id"], "season": lg["season"], "status": "scheduled"}, {"_id": 0, "day": 1}, sort=[("day", 1)])
        if nxt:
            await db.stadium_fixtures.update_many({"league_id": lg["id"], "season": lg["season"], "status": "scheduled", "day": nxt["day"]}, {"$set": {"at": now - 1}})
    played = await tick()
    return {"played": played}


class Challenge(BaseModel):
    club_id: str


def friendly_row(d: dict) -> dict:
    return {k: d.get(k) for k in ("id", "from_club", "from_name", "from_color", "to_club", "to_name", "to_color", "status", "created_at", "expires_at", "fixture_id", "hg", "ag")}


async def expire_friendlies(group_id: str) -> None:
    await db.stadium_friendlies.update_many({"group_id": group_id, "status": "pending", "expires_at": {"$lt": time.time()}}, {"$set": {"status": "expired"}})


@router.get("/stadium/friendlies")
async def friendlies(member: dict = Depends(stadium_member)):
    club = await get_club(member)
    gid = member["group_id"]
    await expire_friendlies(gid)
    clubs = [c async for c in db.stadium_clubs.find({"group_id": gid}, {"_id": 0})]
    rivals = []
    for c in clubs:
        if club and c["id"] == club["id"]:
            continue
        rivals.append({"id": c["id"], "name": c["name"], "color": c["color"], "rating": round(club_rating(c), 1)})
    rivals.sort(key=lambda r: -r["rating"])
    mine = []
    if club:
        mine = [d async for d in db.stadium_friendlies.find({"group_id": gid, "$or": [{"from_club": club["id"]}, {"to_club": club["id"]}]}, {"_id": 0}).sort("created_at", -1).limit(30)]
    return {"now": time.time(), "rivals": rivals, "mine": [friendly_row(d) for d in mine], "club_id": club["id"] if club else None}


@router.post("/stadium/friendlies")
async def challenge(body: Challenge, member: dict = Depends(stadium_member)):
    club = await need_club(member)
    gid = member["group_id"]
    if body.club_id == club["id"]:
        raise HTTPException(status_code=400, detail="Non puoi sfidare te stesso")
    other = await db.stadium_clubs.find_one({"id": body.club_id, "group_id": gid}, {"_id": 0})
    if not other:
        raise HTTPException(status_code=404, detail="Squadra non trovata")
    await expire_friendlies(gid)
    open_n = await db.stadium_friendlies.count_documents({"group_id": gid, "status": "pending", "from_club": club["id"]})
    if open_n >= int(CFG["friendly"]["pendingMax"]):
        raise HTTPException(status_code=409, detail="Hai già troppe sfide in attesa")
    if await db.stadium_friendlies.find_one({"group_id": gid, "status": "pending", "from_club": club["id"], "to_club": other["id"]}, {"_id": 1}):
        raise HTTPException(status_code=409, detail="Sfida già inviata")
    now = time.time()
    doc = {"id": new_id(), "group_id": gid, "from_club": club["id"], "from_name": club["name"], "from_color": club["color"], "to_club": other["id"], "to_name": other["name"], "to_color": other["color"], "status": "pending", "created_at": now, "expires_at": now + 60 * int(CFG["friendly"]["expireMinutes"]), "fixture_id": None}
    await db.stadium_friendlies.insert_one(dict(doc))
    friendly_notify(other, "Sfida amichevole", f"{club['name']} ti sfida a un'amichevole", "friendly")
    return friendly_row(doc)


async def load_friendly(fid: str, member: dict) -> tuple[dict, dict]:
    club = await need_club(member)
    d = await db.stadium_friendlies.find_one({"id": fid, "group_id": member["group_id"]}, {"_id": 0})
    if not d or club["id"] not in (d["from_club"], d["to_club"]):
        raise HTTPException(status_code=404, detail="Sfida non trovata")
    if d["status"] == "pending" and d["expires_at"] < time.time():
        await db.stadium_friendlies.update_one({"id": fid}, {"$set": {"status": "expired"}})
        d["status"] = "expired"
    return club, d


@router.post("/stadium/friendlies/{fid}/accept")
async def accept_friendly(fid: str, member: dict = Depends(stadium_member)):
    club, d = await load_friendly(fid, member)
    if d["to_club"] != club["id"]:
        raise HTTPException(status_code=403, detail="Solo lo sfidato può accettare")
    if d["status"] != "pending":
        raise HTTPException(status_code=409, detail="Sfida non più valida")
    claimed = await db.stadium_friendlies.find_one_and_update({"id": fid, "status": "pending"}, {"$set": {"status": "playing"}})
    if not claimed:
        raise HTTPException(status_code=409, detail="Sfida non più valida")
    home = await db.stadium_clubs.find_one({"id": d["from_club"]}, {"_id": 0})
    away = await db.stadium_clubs.find_one({"id": d["to_club"]}, {"_id": 0})
    try:
        if not home or not away:
            raise ValueError("Squadra non disponibile")
        if await busy(home["id"]) or await busy(away["id"]):
            raise ValueError("Una delle squadre sta giocando una partita ufficiale")
        fx = await play_friendly(home, away)
    except ValueError as e:
        await db.stadium_friendlies.update_one({"id": fid}, {"$set": {"status": "pending"}})
        raise HTTPException(status_code=409, detail=str(e))
    await db.stadium_friendlies.update_one({"id": fid}, {"$set": {"status": "played", "fixture_id": fx["id"], "hg": fx["hg"], "ag": fx["ag"]}})
    friendly_notify(home, "Amichevole giocata", f"{home['name']} {fx['hg']}-{fx['ag']} {away['name']}", "friendly")
    return {"fixture_id": fx["id"], "hg": fx["hg"], "ag": fx["ag"]}


@router.post("/stadium/friendlies/{fid}/decline")
async def decline_friendly(fid: str, member: dict = Depends(stadium_member)):
    club, d = await load_friendly(fid, member)
    if d["status"] != "pending":
        raise HTTPException(status_code=409, detail="Sfida non più valida")
    status = "declined" if d["to_club"] == club["id"] else "cancelled"
    await db.stadium_friendlies.update_one({"id": fid, "status": "pending"}, {"$set": {"status": status}})
    return {"ok": True}
