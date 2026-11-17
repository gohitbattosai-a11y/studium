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
    FOREIGN,
    ITALIAN,
    apply_discipline,
    apply_fatigue,
    club_entries,
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
CCFG = CFG["champions"]
FRCFG = CFG["friendly"]


def section_of(kind: str) -> dict:
    return SCFG if kind == "serie_a" else CCFG if kind == "champions" else LCFG


def interval_of(kind: str) -> int:
    return int(section_of(kind)["matchIntervalMinutes"])


def offset_of(kind: str) -> int:
    return int(section_of(kind).get("offsetMinutes", 0))


def rewards_of(kind: str) -> dict:
    return section_of(kind)["rewards"]


def next_slot(after: float, interval_min: int, offset_min: int = 0) -> float:
    step = interval_min * 60
    off = offset_min * 60
    if not LCFG["alignToInterval"]:
        return after + off
    return math.ceil((after - off) / step) * step + off


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


def league_ctx(league: dict) -> str:
    return league["id"] if league.get("private") else "pub"


def blank_squad(cards: Optional[list] = None) -> dict:
    return {"formation": "4-3-3", "xi": [None] * 11, "players": [c["player"] for c in (cards or [])], "state": {"out": {}, "yellows": {}}}


def club_view(club: dict, ctx: str) -> dict:
    if ctx == "pub":
        return club
    sq = (club.get("squads") or {}).get(ctx) or blank_squad()
    return {**club, "formation": sq["formation"], "xi": sq["xi"], "players": sq["players"], "state": sq.get("state") or {"out": {}, "yellows": {}}}


def status_of(club: dict) -> dict:
    out = (club.get("state") or {}).get("out", {})
    return {pid: {"kind": v["kind"], "left": v["left"]} for pid, v in out.items()}


def make_code() -> str:
    return "".join(random.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(5))


async def fixtures_of(league: dict, with_log: bool = False) -> list[dict]:
    proj = {"_id": 0} if with_log else {"_id": 0, "log": 0, "home_snap": 0, "away_snap": 0}
    return [f async for f in db.stadium_fixtures.find({"league_id": league["id"], "season": league["season"]}, proj).sort([("day", 1), ("at", 1)])]


def compute_table(league: dict, fixtures: list[dict], group: Optional[str] = None) -> list[dict]:
    win = LCFG["winPoints"]
    draw = LCFG["drawPoints"]
    ids = set((league.get("groups") or {}).get(group, [])) if group else None
    teams = [t for t in league["teams"] if ids is None or t["id"] in ids]
    rows = {t["id"]: {"id": t["id"], "name": t["name"], "color": t["color"], "bot": t.get("member_id") is None, "p": 0, "w": 0, "d": 0, "l": 0, "gf": 0, "ga": 0, "pts": 0} for t in teams}
    if group:
        for r in rows.values():
            r["group"] = group
    for f in fixtures:
        if f.get("status") != "played" or f.get("stage", "group") != "group":
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


def champions_tables(league: dict, fixtures: list[dict]) -> list[dict]:
    out: list[dict] = []
    for g in sorted((league.get("groups") or {}).keys()):
        out.extend(compute_table(league, fixtures, g))
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
    step = interval_of(league["kind"]) * 60
    docs = []
    if league["kind"] == "champions":
        per = len(ids) // int(CCFG["groups"])
        league["groups"] = {chr(65 + i): ids[i * per : (i + 1) * per] for i in range(int(CCFG["groups"]))}
        days = 0
        for letter, members in league["groups"].items():
            rounds = round_robin(members)
            rounds = rounds[: len(rounds) // 2]
            days = max(days, len(rounds))
            for d, matches in enumerate(rounds):
                for h, a in matches:
                    docs.append(fixture_doc(league, d + 1, h, a, start_at + d * step, "group", letter))
        league["stage"] = "group"
        total = days + 2
    else:
        rounds = round_robin(ids)
        for d, matches in enumerate(rounds):
            for h, a in matches:
                docs.append(fixture_doc(league, d + 1, h, a, start_at + d * step))
        total = len(rounds)
    if docs:
        await db.stadium_fixtures.insert_many(docs)
    return total


def fixture_doc(league: dict, day: int, h: str, a: str, at: float, stage: str = "group", grp: Optional[str] = None) -> dict:
    return {
        "id": new_id(),
        "league_id": league["id"],
        "group_id": league["group_id"],
        "season": league["season"],
        "day": day,
        "home": h,
        "away": a,
        "at": at,
        "status": "scheduled",
        "hg": None,
        "ag": None,
        "walkover": None,
        "events": [],
        "stage": stage,
        "grp": grp,
    }


def fresh_bot(name: str, rng: random.Random, real: Optional[str] = None, base: Optional[int] = None) -> dict:
    tid = f"b-{new_id()[:8]}"
    return make_bot(tid, name, rng.choice(COLORS), rng, base=base, real_team=real or (name if club_entries(name) else None))


def bot_team_row(bot: dict) -> dict:
    return {"id": bot["id"], "name": bot["name"], "color": bot["color"], "member_id": None, "club_id": None}


async def fill_with_bots(league: dict) -> None:
    rng = random.Random()
    used = {t["name"] for t in league["teams"]}
    names = [n for n in BOT_NAMES + ITALIAN + FOREIGN if n not in used]
    seen: set = set()
    names = [n for n in names if not (n in seen or seen.add(n))]
    pool = names[:]
    while len(league["teams"]) < league["size"]:
        name = pool.pop(0) if pool else f"Studium {rng.randint(1, 99)}"
        bot = fresh_bot(name, rng)
        league["bots"][bot["id"]] = bot
        league["teams"].append(bot_team_row(bot))


def serie_a_bots(league: dict, humans: int) -> None:
    rng = random.Random()
    need = league["size"] - humans
    real = strongest_real_teams(need, among=ITALIAN)
    league["bots"] = {}
    league["teams"] = [t for t in league["teams"] if t.get("member_id")]
    for name in real:
        bot = fresh_bot(name, rng, real=name, base=rng.randint(70, 78))
        league["bots"][bot["id"]] = bot
        league["teams"].append(bot_team_row(bot))


def champions_bots(league: dict, humans: int) -> None:
    rng = random.Random()
    league["bots"] = {}
    league["teams"] = [t for t in league["teams"] if t.get("member_id")]
    total = int(CCFG["teams"])
    italians = strongest_real_teams(min(int(CCFG["italianBots"]), total - humans), among=ITALIAN)
    foreign = FOREIGN[:]
    rng.shuffle(foreign)
    picks = italians + foreign[: max(0, total - humans - len(italians))]
    for name in picks:
        bot = fresh_bot(name, rng, real=name, base=rng.randint(74, 82))
        league["bots"][bot["id"]] = bot
        league["teams"].append(bot_team_row(bot))


async def ensure_serie_a(group_id: str) -> dict:
    return await ensure_cycle(group_id, "serie_a", "Serie A", int(SCFG["teams"]), serie_a_bots)


async def ensure_champions(group_id: str) -> dict:
    return await ensure_cycle(group_id, "champions", "Champions League", int(CCFG["teams"]), champions_bots)


async def ensure_cycle(group_id: str, kind: str, title: str, size: int, builder) -> dict:
    league = await db.stadium_leagues.find_one({"group_id": group_id, "kind": kind}, {"_id": 0})
    if league:
        return league
    league = {
        "id": new_id(),
        "group_id": group_id,
        "kind": kind,
        "name": title,
        "owner_id": None,
        "code": None,
        "private": False,
        "size": size,
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
    builder(league, 0)
    start = next_slot(time.time() + 60, interval_of(kind), offset_of(kind))
    league["start_at"] = start
    league["total_days"] = await build_fixtures(league, start)
    try:
        await db.stadium_leagues.insert_one(dict(league))
    except Exception:
        await db.stadium_fixtures.delete_many({"league_id": league["id"]})
        existing = await db.stadium_leagues.find_one({"group_id": group_id, "kind": kind}, {"_id": 0})
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
    start = next_slot(time.time() + LCFG["startDelayMinutes"] * 60, interval_of("custom"), offset_of("custom"))
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
    return (club_team(club_view(club, league_ctx(league))) if club else None), False


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
    ctx = league_ctx(league)
    fields = {"state": team["state"], "players": team["players"]} if ctx == "pub" else {f"squads.{ctx}.state": team["state"], f"squads.{ctx}.players": team["players"]}
    await db.stadium_clubs.update_one({"id": team["id"]}, {"$set": fields, "$inc": {"pending": reward, "played": 1}})


def winner_side(hg: int, ag: int, pens: Optional[list], walk: Optional[str]) -> int:
    if walk == "home":
        return 0
    if walk == "away":
        return 1
    if hg != ag:
        return 0 if hg > ag else 1
    if pens:
        return 0 if pens[0] > pens[1] else 1
    return random.randint(0, 1)


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
    stamp = float(fx.get("at") or time.time())
    stage = fx.get("stage", "group")
    knockout = league["kind"] == "champions" and stage != "group"
    hxi, hprob = resolve_xi(home, hb, auto)
    axi, aprob = resolve_xi(away, ab, auto)
    rcfg = rewards_of(league["kind"])
    notes_h: list = []
    notes_a: list = []
    pens = None
    if hxi and axi:
        res = simulate(home, away, hxi, axi, rng, now=stamp, knockout=knockout)
        by_h = {p["id"]: p for p in home["players"]}
        by_a = {p["id"]: p for p in away["players"]}
        for g in res["goals"]:
            p = (by_h if g["side"] == 0 else by_a).get(g["pid"])
            if p:
                p["goals"] = int(p.get("goals", 0)) + 1
        notes_h = apply_discipline(home, res, 0, rng, set(hxi))
        notes_a = apply_discipline(away, res, 1, rng, set(axi))
        apply_fatigue(home, hxi, stamp)
        apply_fatigue(away, axi, stamp)
        hg, ag, walk = res["hg"], res["ag"], None
        pens = res.get("shootout")
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
    winner = None
    if knockout:
        side = winner_side(hg, ag, pens, walk if walk != "both" else None)
        winner = fx["home"] if side == 0 else fx["away"]
    await save_team(league, home, hb, rh, notes_h)
    await save_team(league, away, ab, ra, notes_a)
    await db.stadium_fixtures.update_one(
        {"id": fx["id"]},
        {"$set": {"status": "played", "hg": hg, "ag": ag, "pens": pens, "winner": winner, "walkover": walk, "played_at": now_iso(), "notes": {"home": notes_h, "away": notes_a}, **update}},
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
            if pens and my == other:
                extra = f" (rigori {pens[0]}-{pens[1]})" if team is home else f" (rigori {pens[1]}-{pens[0]})"
            body = f"{team['name']} - {opp}: {my}-{other}, hai {tag}{extra}."
            try:
                notify_member(club["member_id"], league["name"], body, tag=f"stadium-{fx['id']}")
            except Exception:
                logger.exception("push stadio fallita")


async def qualify_for_champions(league: dict, table: list[dict]) -> None:
    humans = [r for r in table if not r["bot"] and r["rank"] <= int(SCFG["qualifyRank"])][: int(SCFG["qualifyMax"])]
    if not humans:
        return
    champs = await ensure_champions(league["group_id"])
    await db.stadium_leagues.update_one({"id": champs["id"]}, {"$addToSet": {"promoted": {"$each": [r["id"] for r in humans]}}})
    for r in humans:
        club = await db.stadium_clubs.find_one({"id": r["id"]}, {"_id": 0, "member_id": 1})
        if club:
            try:
                notify_member(club["member_id"], "Champions League", f"{r['name']} si è qualificata alla prossima Champions League.", tag=f"stadium-q-{league['id']}-{r['id']}")
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
            champs = await ensure_champions(league["group_id"])
            await db.stadium_leagues.update_one({"id": champs["id"]}, {"$addToSet": {"promoted": champion["id"]}})
        return
    await qualify_for_champions(league, table)
    relegated = [r for r in table if not r["bot"]][::-1][: int(SCFG["relegated"])] if sum(1 for r in table if not r["bot"]) else []
    drop = {r["id"] for r in relegated}
    keep = [t["id"] for t in league["teams"] if t.get("club_id") and t["id"] not in drop]
    await db.stadium_clubs.update_many({"id": {"$in": list(drop)}}, {"$set": {"serie_a_id": None}})
    await db.stadium_leagues.update_one(
        {"id": league["id"]},
        {"$set": {"status": "break", "champion": champion["id"] if champion else None, "table": table, "keep": keep, "next_season_at": time.time() + SCFG["seasonBreakMinutes"] * 60}},
    )


def knockout_pairs(league: dict, fixtures: list[dict]) -> list[tuple[str, str]]:
    first: dict[str, list[dict]] = {}
    for letter in sorted((league.get("groups") or {}).keys()):
        first[letter] = compute_table(league, fixtures, letter)
    letters = sorted(first.keys())
    if len(letters) < 2 or any(len(first[l]) < 2 for l in letters):
        return []
    a, b = first[letters[0]], first[letters[1]]
    return [(a[0]["id"], b[1]["id"]), (b[0]["id"], a[1]["id"])]


async def advance_champions(league: dict) -> None:
    lid = league["id"]
    stage = league.get("stage", "group")
    interval = interval_of("champions") * 60
    fixtures = await fixtures_of(league)
    if stage == "group":
        locked = await db.stadium_leagues.find_one_and_update({"id": lid, "status": "running", "stage": "group"}, {"$set": {"stage": "sf"}})
        if not locked:
            return
        pairs = knockout_pairs(league, fixtures)
        start = next_slot(time.time() + 120, interval_of("champions"), offset_of("champions"))
        day = max((f["day"] for f in fixtures), default=0) + 1
        docs = [fixture_doc(league, day, h, a, start, "sf") for h, a in pairs]
        if docs:
            await db.stadium_fixtures.insert_many(docs)
        return
    if stage == "sf":
        locked = await db.stadium_leagues.find_one_and_update({"id": lid, "status": "running", "stage": "sf"}, {"$set": {"stage": "final"}})
        if not locked:
            return
        semis = [f for f in fixtures if f.get("stage") == "sf"]
        winners = [f.get("winner") or f["home"] for f in semis]
        start = next_slot(time.time() + 120, interval_of("champions"), offset_of("champions")) + interval
        day = max((f["day"] for f in fixtures), default=0) + 1
        if len(winners) == 2:
            await db.stadium_fixtures.insert_one(fixture_doc(league, day, winners[0], winners[1], start, "final"))
        return
    if stage == "final":
        locked = await db.stadium_leagues.find_one_and_update({"id": lid, "status": "running", "stage": "final"}, {"$set": {"status": "closing", "stage": "done"}})
        if locked:
            await finish_champions(league, fixtures)


async def finish_champions(league: dict, fixtures: list[dict]) -> None:
    final = next((f for f in fixtures if f.get("stage") == "final"), None)
    semis = [f for f in fixtures if f.get("stage") == "sf"]
    teams = {t["id"]: t for t in league["teams"]}
    order: list[str] = []
    if final:
        champ = final.get("winner") or final["home"]
        order.append(champ)
        order.append(final["away"] if champ == final["home"] else final["home"])
    for f in semis:
        loser = f["away"] if (f.get("winner") or f["home"]) == f["home"] else f["home"]
        order.append(loser)
    rest = [r for r in champions_tables(league, fixtures) if r["id"] not in order]
    order.extend(r["id"] for r in rest)
    prizes = rewards_of("champions")["prizes"]
    table = []
    for i, tid in enumerate(order):
        t = teams.get(tid)
        if not t:
            continue
        row = {"id": tid, "name": t["name"], "color": t["color"], "bot": t.get("member_id") is None, "rank": i + 1, "p": 0, "w": 0, "d": 0, "l": 0, "gf": 0, "ga": 0, "gd": 0, "pts": 0}
        table.append(row)
        if not row["bot"]:
            prize = prizes[i] if i < len(prizes) else 0
            await db.stadium_clubs.update_one({"id": tid}, {"$inc": {"pending": float(prize)}})
            club = await db.stadium_clubs.find_one({"id": tid}, {"_id": 0, "member_id": 1})
            if club and i == 0:
                try:
                    notify_member(club["member_id"], "Champions League vinta!", f"{t['name']} è campione d'Europa.", tag=f"stadium-ucl-{league['id']}")
                except Exception:
                    logger.exception("push stadio fallita")
    humans = [t["club_id"] for t in league["teams"] if t.get("club_id")]
    await db.stadium_clubs.update_many({"id": {"$in": humans}}, {"$set": {"champions_id": None}})
    await db.stadium_leagues.update_one(
        {"id": league["id"]},
        {"$set": {"status": "break", "champion": table[0]["id"] if table else None, "table": table, "next_season_at": time.time() + CCFG["seasonBreakMinutes"] * 60}},
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
    start = next_slot(time.time() + 60, interval_of("serie_a"), offset_of("serie_a"))
    league["start_at"] = start
    league["total_days"] = await build_fixtures(league, start)
    await db.stadium_leagues.replace_one({"id": league["id"]}, league)
    await db.stadium_clubs.update_many({"id": {"$in": [c["id"] for c in clubs]}}, {"$set": {"serie_a_id": league["id"]}})
    for c in clubs:
        try:
            notify_member(c["member_id"], "Serie A", f"{c['name']} è in Serie A: la stagione sta per cominciare.", tag=f"stadium-sa-{league['id']}")
        except Exception:
            logger.exception("push stadio fallita")


async def new_champions_season(league: dict) -> None:
    cap = int(CCFG["maxHumans"])
    queue = list(league.get("promoted") or [])
    humans_ids = queue[:cap]
    leftover = queue[cap:]
    clubs = [c async for c in db.stadium_clubs.find({"id": {"$in": humans_ids}}, {"_id": 0})]
    league["teams"] = [{"id": c["id"], "name": c["name"], "color": c["color"], "member_id": c["member_id"], "club_id": c["id"]} for c in clubs]
    champions_bots(league, len(league["teams"]))
    league["season"] = int(league["season"]) + 1
    league["status"] = "running"
    league["day"] = 0
    league["champion"] = None
    league["promoted"] = leftover
    league["next_season_at"] = None
    league.pop("table", None)
    start = next_slot(time.time() + 120, interval_of("champions"), offset_of("champions"))
    league["start_at"] = start
    league["total_days"] = await build_fixtures(league, start)
    await db.stadium_leagues.replace_one({"id": league["id"]}, league)
    await db.stadium_clubs.update_many({"id": {"$in": [c["id"] for c in clubs]}}, {"$set": {"champions_id": league["id"]}})
    for c in clubs:
        try:
            notify_member(c["member_id"], "Champions League", f"{c['name']} gioca la Champions League: si parte presto.", tag=f"stadium-ucl-start-{league['id']}")
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
    async for lg in db.stadium_leagues.find({"kind": "champions", "status": "running"}, {"_id": 1, "id": 1}):
        touched.add(lg["id"])
    for lid in touched:
        league = await db.stadium_leagues.find_one({"id": lid}, {"_id": 0})
        if league and league["status"] == "running":
            left = await db.stadium_fixtures.count_documents({"league_id": lid, "season": league["season"], "status": {"$in": ["scheduled", "playing"]}})
            if left == 0:
                if league["kind"] == "champions":
                    await advance_champions(league)
                else:
                    locked = await db.stadium_leagues.find_one_and_update({"id": lid, "status": "running"}, {"$set": {"status": "closing"}})
                    if locked:
                        await finish_season(league)
    async for league in db.stadium_leagues.find({"kind": {"$in": ["serie_a", "champions"]}, "status": "break", "next_season_at": {"$lte": now}}, {"_id": 0}):
        locked = await db.stadium_leagues.find_one_and_update({"id": league["id"], "status": "break"}, {"$set": {"status": "starting"}})
        if locked:
            if league["kind"] == "champions":
                await new_champions_season(league)
            else:
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
