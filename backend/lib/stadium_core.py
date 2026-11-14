import json
import math
import random
from pathlib import Path
from typing import Optional

BASE = Path(__file__).parent
CFG: dict = json.loads((BASE / "stadium_config.json").read_text(encoding="utf-8"))
try:
    CATALOG: list[dict] = json.loads((BASE / "stadium_players.json").read_text(encoding="utf-8"))
except OSError:
    CATALOG = []
CATALOG_BY_ID = {c["id"]: c for c in CATALOG}

STAT_KEYS = ["rit", "tir", "pas", "dri", "dif", "fis"]
POS_LIST = ["POR", "DIF", "CEN", "ATT"]
FORMATIONS: dict[str, list[str]] = {
    "4-3-3": ["POR", "DIF", "DIF", "DIF", "DIF", "CEN", "CEN", "CEN", "ATT", "ATT", "ATT"],
    "4-4-2": ["POR", "DIF", "DIF", "DIF", "DIF", "CEN", "CEN", "CEN", "CEN", "ATT", "ATT"],
    "3-5-2": ["POR", "DIF", "DIF", "DIF", "CEN", "CEN", "CEN", "CEN", "CEN", "ATT", "ATT"],
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
COLORS = ["#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#7c3aed", "#0891b2", "#db2777", "#ea580c", "#475569", "#0d9488"]
FIRST = ["Luca", "Marco", "Matteo", "Andrea", "Davide", "Simone", "Federico", "Alessio", "Giorgio", "Riccardo", "Tommaso", "Nicolò", "Edoardo", "Filippo", "Samuele", "Lorenzo", "Gabriele", "Emanuele", "Stefano", "Diego", "Pietro", "Jacopo", "Mattia", "Leonardo", "Carlos", "Mateo", "Hugo", "Lucas", "Noah", "Kylian", "Jules", "Thomas", "Yannick", "Joshua", "Emre", "Karim", "Omar", "Sven", "Jonas", "Rafael"]
LAST = ["Rossi", "Bianchi", "Ferrari", "Esposito", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Costa", "Giordano", "Mancini", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana", "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferraro", "Galli", "Martini", "Leone", "Longo", "Silva", "Garcia", "Lopez", "Dubois", "Martin", "Müller", "Schmidt", "Kovač", "Nowak", "Haddad", "Yilmaz", "Santos", "Oliveira", "Moreau", "Bernard", "Fischer", "Novak", "Petrov", "Jansen"]
BOT_NAMES = ["Real Studium", "Atletico Banco", "Inter Compiti", "Dinamo Cattedra", "Juve Lavagna", "Sporting Quaderno", "Borussia Zaino", "Milan Ricreazione", "Olimpia Interrogati", "Torino Verifica", "Napoli Appunti", "Roma Merenda"]
RARITIES = ["comune", "non_comune", "raro", "epico", "leggendario", "mitico"]


def clamp(v, a, b):
    return max(a, min(b, v))


def calc_ovr(pos: str, stats: dict) -> int:
    return round(sum(WEIGHTS[pos][k] * stats[k] for k in STAT_KEYS))


def mk_stats(pos: str, ovr: int, rng: random.Random) -> dict:
    raw = {k: OFFSETS[pos][k] + rng.randint(-5, 5) for k in STAT_KEYS}
    d = ovr - sum(WEIGHTS[pos][k] * raw[k] for k in STAT_KEYS)
    return {k: clamp(round(raw[k] + d), 20, 99) for k in STAT_KEYS}


def mk_player(pid: str, pos: str, ovr: int, rng: random.Random, name: Optional[str] = None, pot: Optional[int] = None) -> dict:
    ovr = clamp(ovr, 40, 99)
    stats = mk_stats(pos, ovr, rng)
    real = calc_ovr(pos, stats)
    return {
        "id": pid,
        "name": name or f"{rng.choice(FIRST)} {rng.choice(LAST)}",
        "pos": pos,
        "ovr": real,
        "pot": clamp(pot if pot is not None else real + rng.randint(2, 14), real, 99),
        "stats": stats,
        "goals": 0,
        "trained": -1,
        "training": None,
    }


def from_catalog(entry: dict, pid: Optional[str] = None) -> dict:
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
        "card": entry["id"],
    }
    if entry.get("price") is not None:
        p["price"] = entry["price"]
        p["priceAt"] = entry["ovr"]
    if entry.get("skin"):
        p["look"] = {"skin": entry["skin"], "hair": entry.get("hair"), "style": entry.get("style")}
    return p


def mk_squad(base: int, rng: random.Random, prefix: str) -> list[dict]:
    plan = [("POR", 2), ("DIF", 6), ("CEN", 5), ("ATT", 4)]
    out = []
    for pos, n in plan:
        for i in range(n):
            out.append(mk_player(f"{prefix}-{pos}{i}", pos, base + rng.randint(-9, 9), rng))
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


def lineup(team: dict, xi: Optional[list] = None) -> list[dict]:
    ids = xi if xi is not None else team["xi"]
    by_id = {p["id"]: p for p in team["players"]}
    out = []
    for i, pos in enumerate(FORMATIONS[team["formation"]]):
        p = by_id.get(ids[i]) if i < len(ids) and ids[i] else None
        out.append({"player": p, "pos": pos, "eff": (p["ovr"] if p["pos"] == pos else p["ovr"] - 12) if p else 30})
    return out


def _wavg(slots: list[dict], w: dict) -> float:
    tot = sum(w[s["pos"]] for s in slots) or 1
    return sum(s["eff"] * w[s["pos"]] for s in slots) / tot


def strength(team: dict, xi: Optional[list] = None) -> dict:
    slots = lineup(team, xi)
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
    keep = ["id", "name", "pos", "ovr", "pot", "stats", "card", "look"]
    return {
        "id": team["id"],
        "name": team["name"],
        "color": team["color"],
        "formation": team["formation"],
        "xi": list(xi),
        "players": [{k: p[k] for k in keep if k in p} for p in players],
    }


def simulate(home: dict, away: dict, home_xi: list, away_xi: list, rng: random.Random) -> dict:
    d = CFG["discipline"]
    sides = [(home, home_xi), (away, away_xi)]
    st = [strength(t, xi) for t, xi in sides]
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
            if rng.random() < d["injuryChance"]:
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
    return {
        "hg": hg,
        "ag": ag,
        "log": allv,
        "events": [{"min": g["min"], "teamId": g["teamId"], "player": g["player"]} for g in scorers],
        "goals": [{"side": 0 if g["teamId"] == home["id"] else 1, "pid": g["pid"]} for g in scorers],
        "reds": [{"side": r["side"], "pid": r["player"]["id"]} for r in reds],
        "yellows": yellows,
        "injuries": injuries,
        "home": _snapshot(home, home_xi),
        "away": _snapshot(away, away_xi),
    }


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
    stats = {k: clamp(int(stats_in.get(k, 50)), 20, 99) for k in STAT_KEYS}
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
        extra = {"card": base.get("card"), "look": base.get("look")}
    elif pid in CATALOG_BY_ID:
        base = CATALOG_BY_ID[pid]
        cap = int(base["pot"]) + CFG["squad"]["trainingOvrMargin"]
        pot = int(base["pot"])
        name = base["name"]
        extra = {"card": base["id"]}
        if base.get("skin"):
            extra["look"] = {"skin": base["skin"], "hair": base.get("hair"), "style": base.get("style")}
        pos = base["pos"]
    else:
        cap = CFG["squad"]["randomPlayerMaxOvr"] + CFG["squad"]["trainingOvrMargin"]
        pot = clamp(int(p.get("pot", 70)), 40, 99)
        name = str(p.get("name", "Giocatore"))[:40]
        extra = {}
    ovr = calc_ovr(pos, stats)
    if ovr > cap:
        shift = ovr - cap
        stats = {k: clamp(v - shift, 20, 99) for k, v in stats.items()}
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


def make_bot(tid: str, name: str, color: str, rng: random.Random, base: Optional[int] = None, real_team: Optional[str] = None) -> dict:
    lo, hi = 62, 74
    players = mk_squad(base if base is not None else rng.randint(lo, hi), rng, tid)
    if real_team:
        for entry in [c for c in CATALOG if c["team"] == real_team]:
            same = sorted([p for p in players if p["pos"] == entry["pos"] and not p["id"].startswith("c-")], key=lambda p: p["ovr"])
            card = from_catalog(entry, f"c-{tid}-{entry['id']}")
            if same:
                players[players.index(same[0])] = card
            else:
                players.append(card)
    return {"id": tid, "name": name, "color": color, "formation": "4-3-3", "xi": auto_xi(players, "4-3-3"), "players": players, "state": {"out": {}, "yellows": {}}}


def strongest_real_teams(n: int) -> list[str]:
    by: dict[str, list[int]] = {}
    for c in CATALOG:
        by.setdefault(c["team"], []).append(c["ovr"])
    ranked = sorted(by.items(), key=lambda kv: -sum(kv[1]) / len(kv[1]))
    return [name for name, _ in ranked[:n]]


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
