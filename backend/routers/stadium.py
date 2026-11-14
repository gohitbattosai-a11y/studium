import random
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from lib.db import db
from lib.gate import feature_gate
from lib.security import new_id, now_iso
from lib.stadium_core import CFG, COLORS, lineup_problem, sanitize_squad
from lib.stadium_league import (
    LCFG,
    SCFG,
    club_team,
    compute_scorers,
    compute_table,
    ensure_serie_a,
    fixtures_of,
    interval_of,
    make_code,
    start_custom,
    status_of,
    tick,
)
from lib.stadium_packs import EXCLUSIVE, PACKS, PACKS_BY_ID, RANK, pack_public, release_value, roll_pack
from routers.shop import require_admin, totals

router = APIRouter()

stadium_member = feature_gate("citta")


class CreateClub(BaseModel):
    name: str = Field(min_length=3, max_length=24)
    color: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")


class SquadSync(BaseModel):
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


def club_public(club: dict) -> dict:
    return {
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
    out: dict = {"now": time.time(), "settings": settings(), "club": None, "cards": [], "next": None, "warning": None}
    out["cards"] = await member_cards(member["id"])
    if club:
        out["club"] = club_public(club)
        out["next"] = await next_fixture(club)
        out["warning"] = lineup_problem(club_team(club), set(status_of(club).keys()))
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
    cards = {c["id"]: c for c in await member_cards(member["id"])}
    clean = sanitize_squad(body.model_dump(), cards, random.Random())
    ids = {p["id"] for p in clean["players"]}
    state_doc = club.get("state") or {"out": {}, "yellows": {}}
    state_doc["out"] = {k: v for k, v in state_doc.get("out", {}).items() if k in ids}
    await db.stadium_clubs.update_one({"id": club["id"]}, {"$set": {"formation": clean["formation"], "xi": clean["xi"], "players": clean["players"], "state": state_doc}})
    club.update({"formation": clean["formation"], "xi": clean["xi"], "players": clean["players"], "state": state_doc})
    return {"club": club_public(club), "warning": lineup_problem(club_team(club), set(status_of(club).keys()))}


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
    docs = [d async for d in db.stadium_leagues.find({"group_id": member["group_id"], "kind": "custom"}, {"_id": 0, "bots": 0}).sort("created_at", -1).limit(60)]
    return {"serie_a": league_card(serie, member, club), "leagues": [league_card(d, member, club) for d in docs], "now": time.time()}


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
        }
        for f in fixtures
    ]
    out = league_card(league, member, club)
    out["teams_list"] = [{"id": t["id"], "name": t["name"], "color": t["color"], "bot": t.get("member_id") is None, "mine": bool(club) and t["id"] == club["id"]} for t in league["teams"]]
    out["table"] = table
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
    names = {t["id"]: t for t in (league or {}).get("teams", [])}
    return {
        "id": fx["id"],
        "league": (league or {}).get("name", ""),
        "day": fx["day"],
        "at": fx["at"],
        "hg": fx["hg"],
        "ag": fx["ag"],
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
    players = [p for p in club["players"] if p["id"] != card["id"]]
    xi = [None if i == card["id"] else i for i in club["xi"]]
    await db.stadium_clubs.update_one({"id": club["id"]}, {"$set": {"players": players, "xi": xi}, "$inc": {"pending": value}})
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
