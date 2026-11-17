import random
import zlib
from typing import Optional

import uuid
from lib.stadium_core import CATALOG, CFG, POS_LIST, POT_MAX, RARITIES, STAT_MAX, calc_ovr, clamp, from_catalog, mk_stats

PCFG = CFG["packs"]
PACKS = PCFG["list"]
PACKS_BY_ID = {p["id"]: p for p in PACKS}
EXCLUSIVE = PCFG["exclusive"]
EXCLUSIVE_BY_ID = {e["id"]: e for e in EXCLUSIVE}
RANK = {r: i for i, r in enumerate(RARITIES)}
POS_WEIGHTS = {"POR": 2, "DIF": 6, "CEN": 5, "ATT": 4}
PRICE = {"base": 0.8, "pivot": 50, "exponent": 6}
SELL_RATIO = 0.7


def price_of(ovr: int) -> float:
    return round((ovr / PRICE["pivot"]) ** PRICE["exponent"] * PRICE["base"], 1)


def release_value(ovr: int) -> float:
    return round(price_of(ovr) * SELL_RATIO, 1)


def exclusive_player(entry: dict, pid: str) -> dict:
    rng = random.Random(zlib.crc32(entry["id"].encode()))
    stats = mk_stats(entry["pos"], entry["ovr"], rng)
    ovr = calc_ovr(entry["pos"], stats)
    p = {
        "id": pid,
        "name": entry["name"],
        "pos": entry["pos"],
        "ovr": ovr,
        "pot": clamp(int(entry.get("pot", ovr + 2)), ovr, POT_MAX),
        "stats": stats,
        "goals": 0,
        "trained": -1,
        "training": None,
        "card": entry["card"],
        "look": {"skin": entry["skin"], "hair": entry["hair"], "style": entry["style"]},
    }
    if entry.get("nation"):
        p["nation"] = entry["nation"]
    if entry.get("league"):
        p["league"] = entry["league"]
    if entry.get("team"):
        p["club"] = entry["team"]
    return p


def pick_rarity(odds: dict, rng: random.Random) -> str:
    total = sum(odds.values())
    r = rng.random() * total
    for k, w in odds.items():
        r -= w
        if r <= 0:
            return k
    return next(iter(odds))


def make_card(rarity: str, exclusive_chance: float, owned: set, taken: set, rng: random.Random) -> dict:
    cur = rarity
    pid = f"pk-{uuid.uuid4().hex[:12]}"
    while True:
        pool = [e for e in EXCLUSIVE if e["rarity"] == cur and e["id"] not in owned and e["id"] not in taken]
        wants = cur == "mitico" or (RANK[cur] >= RANK["epico"] and rng.random() < exclusive_chance)
        if wants and pool:
            e = rng.choice(pool)
            taken.add(e["id"])
            return {"id": pid, "rarity": cur, "exclusive_id": e["id"], "player": exclusive_player(e, pid)}
        if cur == "mitico":
            cur = "leggendario"
            continue
        break
    lo, hi = PCFG["rarityOvr"][cur]
    target = rng.randint(lo, hi)
    pos = rng.choices(POS_LIST, weights=[POS_WEIGHTS[p] for p in POS_LIST])[0]
    pool_c = [c for c in CATALOG if c["pos"] == pos and lo <= c["ovr"] <= hi]
    if not pool_c:
        pool_c = sorted([c for c in CATALOG if c["pos"] == pos], key=lambda c: abs(c["ovr"] - target))[:6]
    base = rng.choice(pool_c)
    return {"id": pid, "rarity": cur, "exclusive_id": None, "player": from_catalog(base, pid)}


def roll_pack(pack: dict, owned: set, pity: int, rng: random.Random) -> tuple[list[dict], int]:
    rarities = [pick_rarity(pack["odds"], rng) for _ in range(pack["cards"])]
    g = pack.get("guarantee")
    if g and all(RANK[r] < RANK[g] for r in rarities):
        low = min(range(len(rarities)), key=lambda i: RANK[rarities[i]])
        rarities[low] = g
    floor = PCFG["pityMinRarity"]
    if pity >= PCFG["pityThreshold"] and all(RANK[r] < RANK[floor] for r in rarities):
        low = min(range(len(rarities)), key=lambda i: RANK[rarities[i]])
        rarities[low] = floor
    taken: set = set()
    cards = [make_card(r, pack["exclusiveChance"], owned, taken, rng) for r in sorted(rarities, key=lambda r: RANK[r])]
    best = max(RANK[c["rarity"]] for c in cards)
    new_pity = 0 if best >= RANK[floor] else pity + 1
    return cards, new_pity


def pack_public(pack: dict) -> dict:
    return {k: pack[k] for k in ("id", "name", "price", "cards", "tone", "blurb", "guarantee")} | {"odds": pack["odds"]}
