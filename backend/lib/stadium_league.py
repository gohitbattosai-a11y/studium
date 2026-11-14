import asyncio
import logging
import math
import random
import time
from typing import Optional

from pymongo import ReturnDocument

from lib.db import db
from lib.push import notify_member
from lib.security import new_id, now_iso
from lib.stadium_core import (
    BOT_NAMES,
    CFG,
    COLORS,
    apply_discipline,
    make_bot,
    resolve_xi,
    round_robin,
    simulate,
    strongest_real_teams,
    tick_out,
)

logger = logging.getLogger(__name__)

LCFG = CFG["league"]
SCFG = CFG["serieA"]


def interval_of(kind: str) -> int:
    return int(SCFG["matchIntervalMinutes"] if kind == "serie_a" else LCFG["matchIntervalMinutes"])


def rewards_of(kind: str) -> dict:
    return SCFG["rewards"] if kind == "serie_a" else LCFG["rewards"]


def next_slot(after: float, interval_min: int) -> float:
    step = interval_min * 60
    if not LCFG["alignToInterval"]:
        return after
    return math.ceil(after / step) * step


def club_team(club: dict) -> dict:
    return {
        "id": club["id"],
        "name": club["name"],
        "color": club["color"],
        "formation": club["formation"],
        "xi": club["xi"],
        "players": club["players"],
        "state": club.get("state") or {"out": {}, "yellows": {}},
    }


def status_of(club: dict) -> dict:
    out = (club.get("state") or {}).get("out", {})
    return {pid: {"kind": v["kind"], "left": v["left"]} for pid, v in out.items()}


def make_code() -> str:
    return "".join(random.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(5))


async def fixtures_of(league: dict, with_log: bool = False) -> list[dict]:
    proj = {"_id": 0} if with_log else {"_id": 0, "log": 0, "home_snap": 0, "away_snap": 0}
    return [f async for f in db.stadium_fixtures.find({"league_id": league["id"], "season": league["season"]}, proj).sort([("day", 1), ("at", 1)])]


def compute_table(league: dict, fixtures: list[dict]) -> list[dict]:
    win = LCFG["winPoints"]
    draw = LCFG["drawPoints"]
    rows = {t["id"]: {"id": t["id"], "name": t["name"], "color": t["color"], "bot": t.get("member_id") is None, "p": 0, "w": 0, "d": 0, "l": 0, "gf": 0, "ga": 0, "pts": 0} for t in league["teams"]}
    for f in fixtures:
        if f.get("status") != "played":
            continue
        h = rows.get(f["home"])
        a = rows.get(f["away"])
        if not h or not a:
            continue
        for r, gf, ga in ((h, f["hg"], f["ag"]), (a, f["ag"], f["hg"])):
            r["p"] += 1
            r["gf"] += gf
            r["ga"] += ga
        if f.get("walkover") == "both":
            h["l"] += 1
            a["l"] += 1
        elif f["hg"] > f["ag"]:
            h["w"] += 1
            a["l"] += 1
            h["pts"] += win
        elif f["hg"] < f["ag"]:
            a["w"] += 1
            h["l"] += 1
            a["pts"] += win
        else:
            h["d"] += 1
            a["d"] += 1
            h["pts"] += draw
            a["pts"] += draw
    out = sorted(rows.values(), key=lambda r: (-r["pts"], -(r["gf"] - r["ga"]), -r["gf"], r["name"].casefold()))
    for i, r in enumerate(out):
        r["rank"] = i + 1
        r["gd"] = r["gf"] - r["ga"]
    return out


def compute_scorers(fixtures: list[dict], league: dict, limit: int = 10) -> list[dict]:
    names = {t["id"]: t["name"] for t in league["teams"]}
    tally: dict[tuple, int] = {}
    for f in fixtures:
        for e in f.get("events") or []:
            key = (e["player"], e["teamId"])
            tally[key] = tally.get(key, 0) + 1
    rows = [{"player": k[0], "team": names.get(k[1], ""), "goals": n} for k, n in tally.items()]
    rows.sort(key=lambda r: (-r["goals"], r["player"]))
    return rows[:limit]


async def build_fixtures(league: dict, start_at: float) -> int:
    ids = [t["id"] for t in league["teams"]]
    random.shuffle(ids)
    rounds = round_robin(ids)
    step = interval_of(league["kind"]) * 60
    docs = []
    for d, matches in enumerate(rounds):
        for h, a in matches:
            docs.append(
                {
                    "id": new_id(),
                    "league_id": league["id"],
                    "group_id": league["group_id"],
                    "season": league["season"],
                    "day": d + 1,
                    "home": h,
                    "away": a,
                    "at": start_at + d * step,
                    "status": "scheduled",
                    "hg": None,
                    "ag": None,
                    "walkover": None,
                    "events": [],
                }
            )
    if docs:
        await db.stadium_fixtures.insert_many(docs)
    return len(rounds)


def fresh_bot(name: str, rng: random.Random, real: Optional[str] = None, base: Optional[int] = None) -> dict:
    tid = f"b-{new_id()[:8]}"
    return make_bot(tid, name, rng.choice(COLORS), rng, base=base, real_team=real)


async def fill_with_bots(league: dict) -> None:
    rng = random.Random()
    used = {t["name"] for t in league["teams"]}
    names = [n for n in BOT_NAMES if n not in used]
    rng.shuffle(names)
    while len(league["teams"]) < league["size"]:
        name = names.pop() if names else f"FC {rng.choice(['Rossi', 'Bianchi', 'Verdi', 'Neri'])} {rng.randint(1, 99)}"
        bot = fresh_bot(name, rng)
        league["bots"][bot["id"]] = bot
        league["teams"].append({"id": bot["id"], "name": name, "color": bot["color"], "member_id": None, "club_id": None})


def serie_a_bots(league: dict, humans: int) -> None:
    rng = random.Random()
    need = league["size"] - humans
    real = strongest_real_teams(need)
    league["bots"] = {}
    league["teams"] = [t for t in league["teams"] if t.get("member_id")]
    for name in real:
        bot = fresh_bot(name, rng, real=name, base=rng.randint(64, 72))
        league["bots"][bot["id"]] = bot
        league["teams"].append({"id": bot["id"], "name": name, "color": bot["color"], "member_id": None, "club_id": None})
    while len(league["teams"]) < league["size"]:
        bot = fresh_bot(f"Studium {rng.randint(1, 99)}", rng, base=rng.randint(70, 78))
        league["bots"][bot["id"]] = bot
        league["teams"].append({"id": bot["id"], "name": bot["name"], "color": bot["color"], "member_id": None, "club_id": None})


async def ensure_serie_a(group_id: str) -> dict:
    league = await db.stadium_leagues.find_one({"group_id": group_id, "kind": "serie_a"}, {"_id": 0})
    if league:
        return league
    league = {
        "id": new_id(),
        "group_id": group_id,
        "kind": "serie_a",
        "name": "Serie A",
        "owner_id": None,
        "code": None,
        "private": False,
        "size": int(SCFG["teams"]),
        "status": "running",
        "season": 1,
        "teams": [],
        "bots": {},
        "promoted": [],
        "day": 0,
        "total_days": 0,
        "champion": None,
        "created_at": now_iso(),
        "next_season_at": None,
    }
    serie_a_bots(league, 0)
    start = next_slot(time.time() + 60, interval_of("serie_a"))
    league["start_at"] = start
    league["total_days"] = await build_fixtures(league, start)
    try:
        await db.stadium_leagues.insert_one(dict(league))
    except Exception:
        await db.stadium_fixtures.delete_many({"league_id": league["id"]})
        existing = await db.stadium_leagues.find_one({"group_id": group_id, "kind": "serie_a"}, {"_id": 0})
        if existing:
            return existing
        raise
    return league


async def start_custom(league: dict) -> Optional[str]:
    humans = [t for t in league["teams"] if t.get("member_id")]
    if not humans:
        return "Serve almeno una squadra"
    if LCFG["fillWithBots"]:
        await fill_with_bots(league)
    elif len(league["teams"]) < LCFG["minTeams"]:
        return f"Servono almeno {LCFG['minTeams']} squadre"
    if len(league["teams"]) < LCFG["minTeams"]:
        return f"Servono almeno {LCFG['minTeams']} squadre"
    league["season"] = int(league.get("season", 0)) + 1 if league.get("status") == "finished" else int(league.get("season", 1))
    start = next_slot(time.time() + LCFG["startDelayMinutes"] * 60, interval_of("custom"))
    league["start_at"] = start
    league["total_days"] = await build_fixtures(league, start)
    league["status"] = "running"
    league["day"] = 0
    league["champion"] = None
    await db.stadium_leagues.replace_one({"id": league["id"]}, league)
    return None


def bot_of(league: dict, tid: str) -> Optional[dict]:
    return league["bots"].get(tid)


async def load_team(league: dict, tid: str) -> tuple[Optional[dict], bool]:
    bot = bot_of(league, tid)
    if bot:
        return bot, True
    club = await db.stadium_clubs.find_one({"id": tid}, {"_id": 0})
    return (club_team(club) if club else None), False


def reward_for(cfg: dict, gf: int, ga: int, walkover_win: bool) -> float:
    if walkover_win:
        base = cfg["walkoverWin"]
    elif gf > ga:
        base = cfg["win"]
    elif gf == ga:
        base = cfg["draw"]
    else:
        base = cfg["loss"]
    return round(base + cfg["perGoal"] * gf, 1)


async def save_team(league: dict, team: dict, is_bot: bool, reward: float, notes: list) -> None:
    if is_bot:
        await db.stadium_leagues.update_one({"id": league["id"]}, {"$set": {f"bots.{team['id']}.state": team["state"], f"bots.{team['id']}.players": team["players"]}})
        return
    await db.stadium_clubs.update_one(
        {"id": team["id"]},
        {"$set": {"state": team["state"], "players": team["players"]}, "$inc": {"pending": reward, "played": 1}},
    )


async def play_fixture(fx: dict) -> None:
    league = await db.stadium_leagues.find_one({"id": fx["league_id"]}, {"_id": 0})
    if not league or league["season"] != fx["season"]:
        await db.stadium_fixtures.update_one({"id": fx["id"]}, {"$set": {"status": "void"}})
        return
    home, hb = await load_team(league, fx["home"])
    away, ab = await load_team(league, fx["away"])
    if not home or not away:
        await db.stadium_fixtures.update_one({"id": fx["id"]}, {"$set": {"status": "void"}})
        return
    rng = random.Random()
    auto = bool(LCFG["autoSubstitute"])
    hxi, hprob = resolve_xi(home, hb, auto)
    axi, aprob = resolve_xi(away, ab, auto)
    rcfg = rewards_of(league["kind"])
    notes_h: list = []
    notes_a: list = []
    if hxi and axi:
        res = simulate(home, away, hxi, axi, rng)
        by_h = {p["id"]: p for p in home["players"]}
        by_a = {p["id"]: p for p in away["players"]}
        for g in res["goals"]:
            p = (by_h if g["side"] == 0 else by_a).get(g["pid"])
            if p:
                p["goals"] = int(p.get("goals", 0)) + 1
        notes_h = apply_discipline(home, res, 0, rng, set(hxi))
        notes_a = apply_discipline(away, res, 1, rng, set(axi))
        hg, ag, walk = res["hg"], res["ag"], None
        update = {"log": res["log"], "events": res["events"], "home_snap": res["home"], "away_snap": res["away"]}
        rh = reward_for(rcfg, hg, ag, False)
        ra = reward_for(rcfg, ag, hg, False)
    else:
        wo = LCFG["walkoverGoals"]
        tick_out(home)
        tick_out(away)
        if hxi and not axi:
            hg, ag, walk = wo, 0, "home"
        elif axi and not hxi:
            hg, ag, walk = 0, wo, "away"
        else:
            hg, ag, walk = 0, 0, "both"
        update = {"log": [], "events": [], "home_snap": None, "away_snap": None, "walkover_reason": {"home": hprob, "away": aprob}}
        rh = reward_for(rcfg, hg, ag, walk == "home") if walk != "both" else 0.0
        ra = reward_for(rcfg, ag, hg, walk == "away") if walk != "both" else 0.0
        if walk == "home":
            ra = 0.0
        if walk == "away":
            rh = 0.0
    await save_team(league, home, hb, rh, notes_h)
    await save_team(league, away, ab, ra, notes_a)
    await db.stadium_fixtures.update_one(
        {"id": fx["id"]},
        {"$set": {"status": "played", "hg": hg, "ag": ag, "walkover": walk, "played_at": now_iso(), "notes": {"home": notes_h, "away": notes_a}, **update}},
    )
    await db.stadium_leagues.update_one({"id": league["id"], "day": {"$lt": fx["day"]}}, {"$set": {"day": fx["day"]}})
    for team, is_bot, my, other, notes in ((home, hb, hg, ag, notes_h), (away, ab, ag, hg, notes_a)):
        if is_bot:
            continue
        club = await db.stadium_clubs.find_one({"id": team["id"]}, {"_id": 0, "member_id": 1})
        if club:
            opp = away["name"] if team is home else home["name"]
            tag = "vinto" if my > other else "pareggiato" if my == other else "perso"
            extra = " (a tavolino)" if walk else ""
            body = f"{team['name']} - {opp}: {my}-{other}, hai {tag}{extra}."
            try:
                notify_member(club["member_id"], "Partita giocata", body, tag=f"stadium-{fx['id']}")
            except Exception:
                logger.exception("push stadio fallita")


async def finish_season(league: dict) -> None:
    fixtures = await fixtures_of(league)
    table = compute_table(league, fixtures)
    prizes = rewards_of(league["kind"])["prizes"]
    for row in table:
        club_tid = row["id"]
        if row["bot"]:
            continue
        prize = prizes[row["rank"] - 1] if row["rank"] <= len(prizes) else 0
        upd: dict = {"$inc": {"pending": float(prize)}}
        await db.stadium_clubs.update_one({"id": club_tid}, upd)
        club = await db.stadium_clubs.find_one({"id": club_tid}, {"_id": 0, "member_id": 1})
        if club and row["rank"] == 1:
            try:
                notify_member(club["member_id"], "Campionato vinto!", f"{row['name']} ha vinto {league['name']}.", tag=f"stadium-title-{league['id']}")
            except Exception:
                logger.exception("push stadio fallita")
    champion = table[0] if table else None
    if league["kind"] == "custom":
        await db.stadium_leagues.update_one({"id": league["id"]}, {"$set": {"status": "finished", "champion": champion["id"] if champion else None, "table": table}})
        humans = [t["club_id"] for t in league["teams"] if t.get("club_id")]
        await db.stadium_clubs.update_many({"id": {"$in": humans}}, {"$set": {"custom_league_id": None}})
        if champion and not champion["bot"]:
            serie = await ensure_serie_a(league["group_id"])
            await db.stadium_leagues.update_one({"id": serie["id"]}, {"$addToSet": {"promoted": champion["id"]}})
        return
    relegated = [r for r in table if not r["bot"]][::-1][: int(SCFG["relegated"])] if sum(1 for r in table if not r["bot"]) else []
    drop = {r["id"] for r in relegated}
    keep = [t["id"] for t in league["teams"] if t.get("club_id") and t["id"] not in drop]
    await db.stadium_clubs.update_many({"id": {"$in": list(drop)}}, {"$set": {"serie_a_id": None}})
    await db.stadium_leagues.update_one(
        {"id": league["id"]},
        {"$set": {"status": "break", "champion": champion["id"] if champion else None, "table": table, "keep": keep, "next_season_at": time.time() + SCFG["seasonBreakMinutes"] * 60}},
    )


async def new_serie_a_season(league: dict) -> None:
    keep = list(league.get("keep") or [])
    promoted = [c for c in (league.get("promoted") or []) if c not in keep]
    cap = int(SCFG["maxHumans"])
    humans_ids = (keep + promoted)[:cap]
    leftover = (keep + promoted)[cap:]
    clubs = [c async for c in db.stadium_clubs.find({"id": {"$in": humans_ids}}, {"_id": 0})]
    league["teams"] = [{"id": c["id"], "name": c["name"], "color": c["color"], "member_id": c["member_id"], "club_id": c["id"]} for c in clubs]
    serie_a_bots(league, len(league["teams"]))
    league["season"] = int(league["season"]) + 1
    league["status"] = "running"
    league["day"] = 0
    league["champion"] = None
    league["promoted"] = leftover
    league["keep"] = []
    league["next_season_at"] = None
    league.pop("table", None)
    start = next_slot(time.time() + 60, interval_of("serie_a"))
    league["start_at"] = start
    league["total_days"] = await build_fixtures(league, start)
    await db.stadium_leagues.replace_one({"id": league["id"]}, league)
    await db.stadium_clubs.update_many({"id": {"$in": [c["id"] for c in clubs]}}, {"$set": {"serie_a_id": league["id"]}})
    for c in clubs:
        try:
            notify_member(c["member_id"], "Serie A", f"{c['name']} è in Serie A: la stagione sta per cominciare.", tag=f"stadium-sa-{league['id']}")
        except Exception:
            logger.exception("push stadio fallita")


async def tick() -> int:
    now = time.time()
    played = 0
    due = [f async for f in db.stadium_fixtures.find({"status": "scheduled", "at": {"$lte": now}}, {"_id": 0}).sort([("at", 1), ("day", 1)]).limit(300)]
    touched: set[str] = set()
    for fx in due:
        claimed = await db.stadium_fixtures.find_one_and_update({"id": fx["id"], "status": "scheduled"}, {"$set": {"status": "playing"}}, return_document=ReturnDocument.AFTER, projection={"_id": 0})
        if not claimed:
            continue
        try:
            await play_fixture(claimed)
            played += 1
        except Exception:
            logger.exception("partita %s fallita", fx["id"])
            await db.stadium_fixtures.update_one({"id": fx["id"]}, {"$set": {"status": "scheduled"}})
            continue
        touched.add(fx["league_id"])
    for lid in touched:
        league = await db.stadium_leagues.find_one({"id": lid}, {"_id": 0})
        if league and league["status"] == "running":
            left = await db.stadium_fixtures.count_documents({"league_id": lid, "season": league["season"], "status": {"$in": ["scheduled", "playing"]}})
            if left == 0:
                locked = await db.stadium_leagues.find_one_and_update({"id": lid, "status": "running"}, {"$set": {"status": "closing"}})
                if locked:
                    await finish_season(league)
    async for league in db.stadium_leagues.find({"kind": "serie_a", "status": "break", "next_season_at": {"$lte": now}}, {"_id": 0}):
        locked = await db.stadium_leagues.find_one_and_update({"id": league["id"], "status": "break"}, {"$set": {"status": "starting"}})
        if locked:
            await new_serie_a_season(league)
    return played


async def league_loop() -> None:
    await asyncio.sleep(10)
    while True:
        try:
            await tick()
        except Exception:
            logger.exception("scheduler stadio fallito")
        await asyncio.sleep(max(5, int(LCFG["schedulerTickSeconds"])))
