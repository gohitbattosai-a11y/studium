import logging
import random
import time
from typing import Optional

from lib.db import db
from lib.push import notify_member
from lib.security import new_id, now_iso
from lib.stadium_core import auto_xi, resolve_xi, simulate, strength
from lib.stadium_league import club_team, club_view

logger = logging.getLogger(__name__)


def friendly_league_id(group_id: str) -> str:
    return f"friendly:{group_id}"


def club_rating(club: dict) -> float:
    team = club_team(club_view(club, "pub"))
    xi = auto_xi(team["players"], team["formation"], set(team["state"].get("out", {}).keys())) if team["players"] else []
    if len(xi) != 11 or any(not i for i in xi):
        return 0.0
    return strength(team, xi, time.time())["ovr"]


async def busy(club_id: str) -> bool:
    return bool(await db.stadium_fixtures.find_one({"status": "playing", "$or": [{"home": club_id}, {"away": club_id}]}, {"_id": 1}))


async def play_friendly(home_club: dict, away_club: dict, rng: Optional[random.Random] = None) -> dict:
    rng = rng or random.Random()
    group_id = home_club["group_id"]
    now = time.time()
    home = club_team(club_view(home_club, "pub"))
    away = club_team(club_view(away_club, "pub"))
    hxi, hprob = resolve_xi(home, False, True)
    axi, aprob = resolve_xi(away, False, True)
    if not hxi:
        raise ValueError(f"{home['name']}: {hprob}")
    if not axi:
        raise ValueError(f"{away['name']}: {aprob}")
    res = simulate(home, away, hxi, axi, rng, now=now, friendly=True)
    fixture = {
        "id": new_id(),
        "league_id": friendly_league_id(group_id),
        "group_id": group_id,
        "season": 0,
        "day": 0,
        "home": home["id"],
        "away": away["id"],
        "at": now,
        "status": "played",
        "hg": res["hg"],
        "ag": res["ag"],
        "walkover": None,
        "events": res["events"],
        "log": res["log"],
        "home_snap": res["home"],
        "away_snap": res["away"],
        "played_at": now_iso(),
        "stage": "friendly",
        "notes": {"home": [], "away": []},
    }
    await db.stadium_fixtures.insert_one(dict(fixture))
    return fixture


def notify(club: dict, title: str, body: str, tag: str) -> None:
    try:
        notify_member(club["member_id"], title, body, tag=tag)
    except Exception:
        logger.exception("push stadio fallita")
