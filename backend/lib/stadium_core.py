import json
import math
import random
import zlib
from pathlib import Path
from typing import Optional

BASE = Path(__file__).parent
CFG: dict = json.loads((BASE / "stadium_config.json").read_text(encoding="utf-8"))
try:
    CATALOG: list[dict] = json.loads((BASE / "stadium_players.json").read_text(encoding="utf-8"))
except OSError:
    CATALOG = []
CATALOG_BY_ID = {c["id"]: c for c in CATALOG}
EXCLUSIVE_ALL: list[dict] = CFG.get("packs", {}).get("exclusive", [])
RESERVE = [c for c in CATALOG if c.get("reserve")]
STARTERS = [c for c in CATALOG if not c.get("reserve")]

STAT_KEYS = ["rit", "tir", "pas", "dri", "dif", "fis"]
POS_LIST = ["POR", "DIF", "CEN", "ATT"]
FORMATIONS: dict[str, list[str]] = {
    "4-3-3": ["POR", "DIF", "DIF", "DIF", "DIF", "CEN", "CEN", "CEN", "ATT", "ATT", "ATT"],
    "4-4-2": ["POR", "DIF", "DIF", "DIF", "DIF", "CEN", "CEN", "CEN", "CEN", "ATT", "ATT"],
    "3-5-2": ["POR", "DIF", "DIF", "DIF", "CEN", "CEN", "CEN", "CEN", "CEN", "ATT", "ATT"],
    "4-2-3-1": ["POR", "DIF", "DIF", "DIF", "DIF", "CEN", "CEN", "CEN", "CEN", "CEN", "ATT"],
    "4-5-1": ["POR", "DIF", "DIF", "DIF", "DIF", "CEN", "CEN", "CEN", "CEN", "CEN", "ATT"],
    "3-4-3": ["POR", "DIF", "DIF", "DIF", "CEN", "CEN", "CEN", "CEN", "ATT", "ATT", "ATT"],
    "5-3-2": ["POR", "DIF", "DIF", "DIF", "DIF", "DIF", "CEN", "CEN", "CEN", "ATT", "ATT"],
    "5-4-1": ["POR", "DIF", "DIF", "DIF", "DIF", "DIF", "CEN", "CEN", "CEN", "CEN", "ATT"],
}
WEIGHTS = {
    "POR": {"rit": 0.2, "tir": 0, "pas": 0.15, "dri": 0.1, "dif": 0.4, "fis": 0.15},
    "DIF": {"rit": 0.15, "tir": 0.02, "pas": 0.13, "dri": 0.1, "dif": 0.4, "fis": 0.2},
    "CEN": {"rit": 0.1, "tir": 0.12, "pas": 0.3, "dri": 0.25, "dif": 0.1, "fis": 0.13},
    "ATT": {"rit": 0.2, "tir": 0.35, "pas": 0.1, "dri": 0.2, "dif": 0.02, "fis": 0.13},
}
OFFSETS = {
    "POR": {"rit": -5, "tir": -35, "pas": -8, "dri": -12, "dif": 6, "fis": 0},
    "DIF": {"rit": -2, "tir": -18, "pas": -5, "dri": -10, "dif": 8, "fis": 5},
    "CEN": {"rit": 0, "tir": -4, "pas": 6, "dri": 4, "dif": -6, "fis": -2},
    "ATT": {"rit": 4, "tir": 8, "pas": -4, "dri": 4, "dif": -25, "fis": -3},
}
AW = {"ATT": 1, "CEN": 0.5, "DIF": 0.1, "POR": 0}
DW = {"POR": 1.5, "DIF": 1, "CEN": 0.5, "ATT": 0.05}
GW = {"ATT": 6, "CEN": 2.5, "DIF": 0.8, "POR": 0}
STAT_MAX = 125
OVR_MAX = 105
POT_MAX = 109
COLORS = ["#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#7c3aed", "#0891b2", "#db2777", "#ea580c", "#475569", "#0d9488"]
RARITIES = ["comune", "raro", "epico", "leggendario", "mitico"]
ITALIAN = ["Inter", "Milan", "Napoli", "Juventus", "Atalanta", "Roma", "Lazio", "Fiorentina", "Bologna", "Como", "Torino", "Genoa", "Udinese", "Parma", "Cagliari", "Lecce", "Sassuolo", "Monza", "Venezia", "Frosinone"]
BOT_NAMES = ["Torino", "Genoa", "Udinese", "Parma", "Cagliari", "Lecce", "Sassuolo", "Monza", "Venezia", "Frosinone", "Como", "Bologna"]
FOREIGN = ["Real Madrid", "Barcellona", "Atletico Madrid", "Paris Saint-Germain", "Bayern Monaco", "Arsenal", "Manchester City", "Liverpool", "Chelsea", "Borussia Dortmund", "Bayer Leverkusen", "Benfica", "Sporting CP", "Tottenham", "Newcastle"]
FAT = CFG.get("fatigue", {"perMatch": 18, "recoverPerHour": 14, "freshBelow": 25, "maxPenalty": 0.14, "injuryBoost": 0.8, "friendlyFactor": 0.55})


def clamp(v, a, b):
    return max(a, min(b, v))


def calc_ovr(pos: str, stats: dict) -> int:
    return round(sum(WEIGHTS[pos][k] * stats[k] for k in STAT_KEYS))


def mk_stats(pos: str, ovr: int, rng: random.Random) -> dict:
    raw = {k: OFFSETS[pos][k] + rng.randint(-5, 5) for k in STAT_KEYS}
    d = ovr - sum(WEIGHTS[pos][k] * raw[k] for k in STAT_KEYS)
    return {k: clamp(round(raw[k] + d), 20, STAT_MAX) for k in STAT_KEYS}


META = ("nation", "league", "team")


def _meta(entry: dict) -> dict:
    out = {}
    if entry.get("nation"):
        out["nation"] = entry["nation"]
    if entry.get("league"):
        out["league"] = entry["league"]
    if entry.get("team"):
        out["club"] = entry["team"]
    return out


def from_catalog(entry: dict, pid: Optional[str] = None) -> dict:
    if "stats" not in entry:
        stats = mk_stats(entry["pos"], entry["ovr"], random.Random(zlib.crc32(entry["id"].encode())))
        ovr = calc_ovr(entry["pos"], stats)
        entry = {**entry, "stats": stats, "ovr": ovr, "pot": clamp(int(entry.get("pot", ovr + 2)), ovr, POT_MAX)}
    p = {
        "id": pid or entry["id"],
        "name": entry["name"],
        "pos": entry["pos"],
        "ovr": entry["ovr"],
        "pot": entry["pot"],
        "stats": dict(entry["stats"]),
        "goals": 0,
        "trained": -1,
        "training": None,
        "card": entry.get("card") or entry["id"],
        **_meta(entry),
    }
    if entry.get("price") is not None:
        p["price"] = entry["price"]
        p["priceAt"] = entry["ovr"]
    if entry.get("skin"):
        p["look"] = {"skin": entry["skin"], "hair": entry.get("hair"), "style": entry.get("style")}
    return p


def pick_reserve(pos: str, target: int, rng: random.Random, taken: set, spread: int = 8) -> Optional[dict]:
    pool = [c for c in RESERVE if c["pos"] == pos and c["id"] not in taken]
    if not pool:
        pool = [c for c in STARTERS if c["pos"] == pos and c["id"] not in taken and c["ovr"] <= target + spread]
    if not pool:
        return None
    pool.sort(key=lambda c: abs(c["ovr"] - target))
    c = rng.choice(pool[: max(3, len(pool) // 6)])
    taken.add(c["id"])
    return c


def mk_player(pid: str, pos: str, ovr: int, rng: random.Random, name: Optional[str] = None, pot: Optional[int] = None, taken: Optional[set] = None) -> dict:
    entry = pick_reserve(pos, clamp(ovr, 40, OVR_MAX), rng, taken if taken is not None else set())
    if entry:
        return from_catalog(entry, pid)
    stats = mk_stats(pos, clamp(ovr, 40, OVR_MAX), rng)
    real = calc_ovr(pos, stats)
    return {"id": pid, "name": name or "Riserva", "pos": pos, "ovr": real, "pot": clamp(pot if pot is not None else real + 4, real, POT_MAX), "stats": stats, "goals": 0, "trained": -1, "training": None}


def mk_squad(base: int, rng: random.Random, prefix: str, taken: Optional[set] = None) -> list[dict]:
    plan = [("POR", 2), ("DIF", 6), ("CEN", 5), ("ATT", 4)]
    used = taken if taken is not None else set()
    out = []
    for pos, n in plan:
        for i in range(n):
            out.append(mk_player(f"{prefix}-{pos}{i}", pos, base + rng.randint(-9, 9), rng, taken=used))
    return out


def available_ids(team: dict) -> set:
    out = set(team.get("state", {}).get("out", {}).keys())
    return {p["id"] for p in team["players"]} - out


def auto_xi(players: list[dict], formation: str, blocked: Optional[set] = None) -> list[Optional[str]]:
    blocked = blocked or set()
    slots = FORMATIONS[formation]
    pool = sorted([p for p in players if p["id"] not in blocked], key=lambda p: -p["ovr"])
    used: set = set()
    xi: list[Optional[str]] = [None] * len(slots)
    for i, pos in enumerate(slots):
        for p in pool:
            if p["pos"] == pos and p["id"] not in used:
                xi[i] = p["id"]
                used.add(p["id"])
                break
    for i in range(len(slots)):
        if xi[i]:
            continue
        for p in pool:
            if p["id"] not in used:
                xi[i] = p["id"]
                used.add(p["id"])
                break
    return xi


def fatigue_of(team: dict, pid: str, now: Optional[float]) -> float:
    f = (team.get("state") or {}).get("fatigue", {}).get(pid)
    if not f:
        return 0.0
    gone = max(0.0, (now if now is not None else f["at"]) - f["at"])
    return max(0.0, float(f["v"]) - FAT["recoverPerHour"] * gone / 3600)


def fatigue_mult(v: float) -> float:
    over = max(0.0, v - FAT["freshBelow"]) / max(1.0, 100 - FAT["freshBelow"])
    return 1 - FAT["maxPenalty"] * min(1.0, over)


def fatigue_map(team: dict, now: Optional[float]) -> dict:
    out = {}
    for pid in (team.get("state") or {}).get("fatigue", {}):
        v = fatigue_of(team, pid, now)
        if v >= 1:
            out[pid] = round(v)
    return out


def apply_fatigue(team: dict, xi: list, now: float, factor: float = 1.0) -> None:
    fat = team.setdefault("state", {}).setdefault("fatigue", {})
    for pid in xi:
        if not pid:
            continue
        v = fatigue_of(team, pid, now) + FAT["perMatch"] * factor
        fat[pid] = {"v": round(min(100.0, v), 1), "at": now}
    for pid in list(fat.keys()):
        if fatigue_of(team, pid, now) < 1:
            del fat[pid]


def lineup(team: dict, xi: Optional[list] = None, now: Optional[float] = None) -> list[dict]:
    ids = xi if xi is not None else team["xi"]
    by_id = {p["id"]: p for p in team["players"]}
    out = []
    for i, pos in enumerate(FORMATIONS[team["formation"]]):
        p = by_id.get(ids[i]) if i < len(ids) and ids[i] else None
        if p:
            base = p["ovr"] if p["pos"] == pos else p["ovr"] - 12
            eff = round(base * fatigue_mult(fatigue_of(team, p["id"], now)), 1)
        else:
            eff = 30
        out.append({"player": p, "pos": pos, "eff": eff})
    return out


def _wavg(slots: list[dict], w: dict) -> float:
    tot = sum(w[s["pos"]] for s in slots) or 1
    return sum(s["eff"] * w[s["pos"]] for s in slots) / tot


def strength(team: dict, xi: Optional[list] = None, now: Optional[float] = None) -> dict:
    slots = lineup(team, xi, now)
    return {"att": _wavg(slots, AW), "def": _wavg(slots, DW), "ovr": round(sum(s["eff"] for s in slots) / len(slots), 1)}


def lineup_problem(team: dict, blocked: set) -> Optional[str]:
    xi = team.get("xi") or []
    slots = FORMATIONS.get(team.get("formation", ""), None)
    if not slots or len(xi) != len(slots):
        return "formazione non valida"
    ids = [i for i in xi if i]
    if len(ids) != len(slots) or len(set(ids)) != len(ids):
        return "formazione incompleta"
    have = {p["id"] for p in team["players"]}
    if any(i not in have for i in ids):
        return "giocatore non in rosa"
    if any(i in blocked for i in ids):
        return "titolare indisponibile"
    return None


def resolve_xi(team: dict, bot: bool, auto_sub: bool) -> tuple[Optional[list], Optional[str]]:
    blocked = set(team.get("state", {}).get("out", {}).keys())
    if bot:
        return auto_xi(team["players"], team["formation"], blocked), None
    problem = lineup_problem(team, blocked)
    if problem is None:
        return list(team["xi"]), None
    if not auto_sub:
        return None, problem
    by_id = {p["id"]: p for p in team["players"]}
    xi = list(team["xi"])
    used = {i for i in xi if i and i not in blocked and i in by_id}
    slots = FORMATIONS[team["formation"]]
    for i, pos in enumerate(slots):
        if xi[i] and xi[i] in used:
            continue
        pool = sorted([p for p in team["players"] if p["id"] not in blocked and p["id"] not in used], key=lambda p: (p["pos"] != pos, -p["ovr"]))
        if not pool:
            return None, "titolari insufficienti"
        xi[i] = pool[0]["id"]
        used.add(pool[0]["id"])
    return xi, None


def poisson(lam: float, rng: random.Random) -> int:
    limit = math.exp(-lam)
    k = 0
    p = 1.0
    while True:
        k += 1
        p *= rng.random()
        if p <= limit:
            return k - 1


def goal_lambda(att: float, de: float, home: bool) -> float:
    return clamp(1.35 * math.exp((att - de) / 30) * (1.1 if home else 0.95), 0.25, 4.2)


ZONES = [(4, 40), (50, 85)]
MIN_GAP = 4


def take_minute(taken: list, gap: int, rng: random.Random) -> Optional[int]:
    pool = [m for a, b in ZONES for m in range(a, b + 1) if all(abs(x - m) >= gap for x in taken)]
    if not pool:
        return None
    m = rng.choice(pool)
    taken.append(m)
    return m


GOAL_T = ["GOL! {p} la mette dentro per {t}!", "Rete di {p}! {t} colpisce!", "{p} non sbaglia: gol per {t}!"]
SAVE_T = [("parry", "{p} calcia forte, ma il portiere respinge!"), ("parry", "Tiro di {p}: grande parata!"), ("caught", "Tiro di {p}: presa sicura del portiere.")]
OFF_T = [("wide", "{p} ci prova, palla fuori di poco."), ("over", "Conclusione di {p} che sorvola la traversa.")]


def _snapshot(team: dict, xi: list) -> dict:
    by_id = {p["id"]: p for p in team["players"]}
    players = [by_id[i] for i in xi]
    keep = ["id", "name", "pos", "ovr", "pot", "stats", "card", "look", "nation", "league", "club"]
    return {
        "id": team["id"],
        "name": team["name"],
        "color": team["color"],
        "formation": team["formation"],
        "xi": list(xi),
        "players": [{k: p[k] for k in keep if k in p} for p in players],
    }


def simulate(home: dict, away: dict, home_xi: list, away_xi: list, rng: random.Random, now: Optional[float] = None, friendly: bool = False, knockout: bool = False) -> dict:
    d = CFG["discipline"]
    sides = [(home, home_xi), (away, away_xi)]
    st = [strength(t, xi, now) for t, xi in sides]
    lam = [goal_lambda(st[0]["att"], st[1]["def"], True), goal_lambda(st[1]["att"], st[0]["def"], False)]
    taken: list[int] = []
    raw: list[dict] = []
    reds: list[dict] = []
    for si, (team, xi) in enumerate(sides):
        if rng.random() < d["redChance"]:
            field = [p for p in lineup(team, xi) if p["player"] and p["pos"] != "POR"]
            m = take_minute(taken, 3, rng) or rng.randint(20, 80)
            if field:
                culprit = rng.choice(field)["player"]
                left = max(0, 90 - m) / 90
                lam[si] *= 1 - 0.32 * left
                lam[1 - si] *= 1 + 0.2 * left
                reds.append({"side": si, "min": m, "player": culprit})
    goals_n = [poisson(lam[0], rng), poisson(lam[1], rng)]
    goals: list[dict] = []
    for si, (team, xi) in enumerate(sides):
        slots = [s for s in lineup(team, xi) if s["player"] and GW[s["pos"]] > 0]
        total = sum(GW[s["pos"]] for s in slots) or 1

        def shoot() -> Optional[dict]:
            r = rng.random() * total
            for s in slots:
                r -= GW[s["pos"]]
                if r <= 0:
                    return s["player"]
            return slots[0]["player"] if slots else None

        for _ in range(goals_n[si]):
            p = shoot()
            m = take_minute(taken, MIN_GAP, rng) or take_minute(taken, 2, rng) or take_minute(taken, 1, rng) or rng.randint(4, 40)
            name = p["name"] if p else "Sconosciuto"
            goals.append({"min": m, "teamId": team["id"], "player": name, "pid": p["id"] if p else None})
            raw.append({"min": m, "type": "goal", "teamId": team["id"], "player": name, "text": rng.choice(GOAL_T).format(p=name, t=team["name"])})
        chances = clamp(round(lam[si] * 1.3 + rng.randint(0, 2)), 1, 5)
        for _ in range(chances):
            p = shoot()
            m = take_minute(taken, MIN_GAP, rng)
            if not p or m is None:
                continue
            r = rng.random()
            if r < 0.5:
                v, t = rng.choice(SAVE_T)
                raw.append({"min": m, "type": "save", "teamId": team["id"], "player": p["name"], "text": t.format(p=p["name"]), "variant": v})
            elif r < 0.65:
                raw.append({"min": m, "type": "post", "teamId": team["id"], "player": p["name"], "text": f"Palo clamoroso di {p['name']}!"})
            else:
                v, t = rng.choice(OFF_T)
                raw.append({"min": m, "type": "off", "teamId": team["id"], "player": p["name"], "text": t.format(p=p["name"]), "variant": v})
    yellows: list[dict] = []
    red_ids = {r["player"]["id"] for r in reds}
    for si, (team, xi) in enumerate(sides):
        field = [s["player"] for s in lineup(team, xi) if s["player"] and s["pos"] != "POR" and s["player"]["id"] not in red_ids] or [s["player"] for s in lineup(team, xi) if s["player"]]
        for _ in range(rng.randint(0, 2)):
            m = take_minute(taken, MIN_GAP, rng)
            if m is None:
                break
            p = rng.choice(field)
            yellows.append({"side": si, "pid": p["id"]})
            raw.append({"min": m, "type": "yellow", "teamId": team["id"], "player": p["name"], "text": f"Cartellino giallo per {p['name']} ({team['name']})."})
    for r in reds:
        team = sides[r["side"]][0]
        raw.append({"min": r["min"], "type": "red", "teamId": team["id"], "player": r["player"]["name"], "text": f"Cartellino rosso! {r['player']['name']} lascia in dieci {team['name']}."})
    injuries: list[dict] = []
    for si, (team, xi) in enumerate(sides):
        for s in lineup(team, xi):
            p = s["player"]
            if not p or p["id"] in red_ids:
                continue
            tired = fatigue_of(team, p["id"], now) / 100
            chance = d["injuryChance"] * (1 + FAT["injuryBoost"] * tired) * (0 if friendly else 1)
            if rng.random() < chance:
                m = take_minute(taken, 2, rng) or rng.randint(10, 80)
                n = rng.randint(d["injuryMatches"][0], d["injuryMatches"][1])
                injuries.append({"side": si, "pid": p["id"], "left": n})
                raw.append({"min": m, "type": "injury", "teamId": team["id"], "player": p["name"], "text": f"{p['name']} resta a terra: infortunio per {team['name']}."})
    h1 = sum(1 for g in goals if g["min"] <= 45 and g["teamId"] == home["id"])
    a1 = sum(1 for g in goals if g["min"] <= 45 and g["teamId"] == away["id"])
    hg = sum(1 for g in goals if g["teamId"] == home["id"])
    ag = len(goals) - hg
    order = lambda e: -1 if e["type"] == "kickoff" else 1 if e["type"] in ("half", "end") else 0
    allv = [
        {"min": 0, "type": "kickoff", "teamId": home["id"], "player": "", "text": f"Fischio d'inizio: {home['name']} - {away['name']}"},
        *raw,
        {"min": 45, "type": "half", "teamId": home["id"], "player": "", "text": f"Fine primo tempo: {home['name']} {h1}-{a1} {away['name']}"},
        {"min": 90, "type": "end", "teamId": home["id"], "player": "", "text": f"Finita: {home['name']} {hg}-{ag} {away['name']}"},
    ]
    allv.sort(key=lambda e: (e["min"], order(e)))
    for i, e in enumerate(allv):
        e["id"] = i
    scorers = sorted(goals, key=lambda g: g["min"])
    shootout = None
    if knockout and hg == ag:
        shootout = penalties(st, rng)
    return {
        "hg": hg,
        "ag": ag,
        "shootout": shootout,
        "log": allv,
        "events": [{"min": g["min"], "teamId": g["teamId"], "player": g["player"]} for g in scorers],
        "goals": [{"side": 0 if g["teamId"] == home["id"] else 1, "pid": g["pid"]} for g in scorers],
        "reds": [{"side": r["side"], "pid": r["player"]["id"]} for r in reds],
        "yellows": yellows,
        "injuries": injuries,
        "home": _snapshot(home, home_xi),
        "away": _snapshot(away, away_xi),
    }


def penalties(st: list, rng: random.Random) -> list:
    edge = clamp((st[0]["ovr"] - st[1]["ovr"]) / 60, -0.15, 0.15)
    a = b = 0
    for i in range(5):
        a += rng.random() < 0.76 + edge
        b += rng.random() < 0.76 - edge
    while a == b:
        a += rng.random() < 0.76 + edge
        b += rng.random() < 0.76 - edge
    return [a, b]


def rand_between(pair: list, rng: random.Random) -> int:
    return rng.randint(int(pair[0]), int(pair[1]))


def apply_discipline(team: dict, result: dict, side: int, rng: random.Random, played_ids: set) -> list[dict]:
    d = CFG["discipline"]
    state = team.setdefault("state", {})
    out = state.setdefault("out", {})
    yellows = state.setdefault("yellows", {})
    for pid in list(out.keys()):
        out[pid]["left"] -= 1
        if out[pid]["left"] <= 0:
            del out[pid]
    names = {p["id"]: p["name"] for p in team["players"]}
    notes: list[dict] = []
    for r in result["reds"]:
        if r["side"] == side:
            n = rand_between(d["redMatches"], rng)
            out[r["pid"]] = {"kind": "red", "left": n}
            notes.append({"pid": r["pid"], "name": names.get(r["pid"], ""), "kind": "red", "left": n})
    for y in result["yellows"]:
        if y["side"] != side:
            continue
        yellows[y["pid"]] = yellows.get(y["pid"], 0) + 1
        if yellows[y["pid"]] >= d["yellowsForBan"] and y["pid"] not in out:
            yellows[y["pid"]] = 0
            out[y["pid"]] = {"kind": "yellows", "left": d["yellowBanMatches"]}
            notes.append({"pid": y["pid"], "name": names.get(y["pid"], ""), "kind": "yellows", "left": d["yellowBanMatches"]})
    for inj in result["injuries"]:
        if inj["side"] == side and inj["pid"] not in out:
            out[inj["pid"]] = {"kind": "injury", "left": inj["left"]}
            notes.append({"pid": inj["pid"], "name": names.get(inj["pid"], ""), "kind": "injury", "left": inj["left"]})
    return notes


def tick_out(team: dict) -> None:
    out = team.setdefault("state", {}).setdefault("out", {})
    for pid in list(out.keys()):
        out[pid]["left"] -= 1
        if out[pid]["left"] <= 0:
            del out[pid]


def rarity_of_ovr(ovr: int) -> str:
    for r in reversed(RARITIES):
        lo, hi = CFG["packs"]["rarityOvr"][r]
        if ovr >= lo:
            return r
    return "comune"


def sanitize_player(p: dict, cards: dict, rng: random.Random) -> Optional[dict]:
    pid = str(p.get("id", ""))
    pos = p.get("pos")
    if not pid or len(pid) > 64 or pos not in POS_LIST:
        return None
    stats_in = p.get("stats") or {}
    stats = {k: clamp(int(stats_in.get(k, 50)), 20, STAT_MAX) for k in STAT_KEYS}
    cap: int
    pot: int
    if pid.startswith("pk-"):
        card = cards.get(pid)
        if not card:
            return None
        base = card["player"]
        cap = int(base["pot"])
        pot = int(base["pot"])
        name = base["name"]
        extra = {k: base.get(k) for k in ("card", "look", "nation", "league", "club")}
    elif pid in CATALOG_BY_ID:
        base = CATALOG_BY_ID[pid]
        cap = int(base["pot"]) + CFG["squad"]["trainingOvrMargin"]
        pot = int(base["pot"])
        name = base["name"]
        extra = {"card": base.get("card") or base["id"], "nation": base.get("nation"), "league": base.get("league"), "club": base.get("team")}
        if base.get("skin"):
            extra["look"] = {"skin": base["skin"], "hair": base.get("hair"), "style": base.get("style")}
        pos = base["pos"]
    else:
        cap = CFG["squad"]["randomPlayerMaxOvr"] + CFG["squad"]["trainingOvrMargin"]
        pot = clamp(int(p.get("pot", 70)), 40, POT_MAX)
        name = str(p.get("name", "Giocatore"))[:40]
        extra = {}
    ovr = calc_ovr(pos, stats)
    if ovr > cap:
        shift = ovr - cap
        stats = {k: clamp(v - shift, 20, STAT_MAX) for k, v in stats.items()}
        ovr = calc_ovr(pos, stats)
    out = {"id": pid, "name": name, "pos": pos, "ovr": ovr, "pot": max(pot, ovr), "stats": stats, "goals": int(clamp(int(p.get("goals", 0) or 0), 0, 999))}
    for k, v in extra.items():
        if v:
            out[k] = v
    if "price" in p and isinstance(p["price"], (int, float)):
        out["price"] = round(float(p["price"]), 1)
        out["priceAt"] = p.get("priceAt")
    return out


def sanitize_squad(payload: dict, cards: dict, rng: random.Random) -> dict:
    sq = CFG["squad"]
    formation = payload.get("formation") if payload.get("formation") in FORMATIONS else "4-3-3"
    seen: set = set()
    players: list[dict] = []
    for raw in (payload.get("players") or [])[: sq["max"] + sq["packOverflow"] + 4]:
        if not isinstance(raw, dict):
            continue
        p = sanitize_player(raw, cards, rng)
        if p and p["id"] not in seen:
            seen.add(p["id"])
            players.append(p)
    limit = sq["max"] + sq["packOverflow"]
    if len(players) > limit:
        players = sorted(players, key=lambda p: (not p["id"].startswith("pk-"), -p["ovr"]))[:limit]
        seen = {p["id"] for p in players}
    xi_in = payload.get("xi") or []
    xi: list[Optional[str]] = []
    for i in range(len(FORMATIONS[formation])):
        v = xi_in[i] if i < len(xi_in) else None
        xi.append(v if v in seen and v not in xi else None)
    return {"formation": formation, "players": players, "xi": xi}


def club_entries(team: str) -> list[dict]:
    rows = [c for c in STARTERS if c["team"] == team]
    rows += [e for e in EXCLUSIVE_ALL if e.get("team") == team]
    return rows


def make_bot(tid: str, name: str, color: str, rng: random.Random, base: Optional[int] = None, real_team: Optional[str] = None) -> dict:
    team = real_team or name
    entries = club_entries(team)
    taken = {e["id"] for e in entries}
    players = [from_catalog(e, f"c-{tid}-{e['id']}") for e in entries]
    if not players:
        level = base if base is not None else rng.randint(66, 74)
    else:
        top = sorted((p["ovr"] for p in players), reverse=True)[:11]
        level = round(sum(top) / len(top)) - 5
        if base is not None:
            level = min(level, base)
    need = {"POR": 2, "DIF": 6, "CEN": 5, "ATT": 4}
    for pos, n in need.items():
        have = sum(1 for p in players if p["pos"] == pos)
        for _ in range(max(0, n - have)):
            e = pick_reserve(pos, level + rng.randint(-4, 3), rng, taken)
            if e:
                players.append(from_catalog(e, f"r-{tid}-{e['id']}"))
    return {"id": tid, "name": name, "color": color, "formation": "4-3-3", "xi": auto_xi(players, "4-3-3"), "players": players, "state": {"out": {}, "yellows": {}, "fatigue": {}}}


def team_rating(team: str) -> float:
    ovrs = sorted((e["ovr"] for e in club_entries(team)), reverse=True)[:11]
    return sum(ovrs) / len(ovrs) if ovrs else 0.0


def strongest_real_teams(n: int, among: Optional[list] = None, skip: Optional[set] = None) -> list[str]:
    pool = [t for t in (among if among is not None else {c["team"] for c in STARTERS}) if not skip or t not in skip]
    return sorted(pool, key=lambda t: -team_rating(t))[:n]


def round_robin(ids: list[str]) -> list[list[tuple[str, str]]]:
    arr = list(ids)
    if len(arr) % 2:
        arr.append("")
    n = len(arr)
    rounds: list[list[tuple[str, str]]] = []
    for r in range(n - 1):
        m = []
        for i in range(n // 2):
            a, b = arr[i], arr[n - 1 - i]
            if a == "" or b == "":
                continue
            m.append((a, b) if r % 2 == 0 else (b, a))
        rounds.append(m)
        arr.insert(1, arr.pop())
    second = [[(b, a) for a, b in rd] for rd in rounds]
    return rounds + second
