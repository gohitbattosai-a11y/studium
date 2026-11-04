import math
import random
import secrets
import time
from typing import Any, Optional

from lib.badges import award
from lib.db import db
from lib.exclusive import OBS_ITEMS, OBS_PET, grant, grant_pet
from lib.pets import BOXES_BY_ID, PETS, RARITIES
from lib.security import now_iso

WORD = "CORALLO"
COOLDOWN = 1.2
ENTRY_BADGE = "lente-curiosa"
HALFWAY_BADGE = "tra-gli-ingranaggi"
FINAL_BADGE = "astronomo-d-ottone"
RINGS = 6
MOD = 5
GRID = 5
SIZE = 7
WORDS = ["NAUFRAGIO", "SCOGLIERA", "PROFONDITA", "BUSSOLA", "ANCORA", "TEMPESTA", "CORRENTE", "MAREGGIATA", "TIMONIERE", "SOMMERSO", "PERISCOPIO", "BATISCAFO"]

ROOMS: list[dict] = [
    {"id": "ponte", "title": "Il Ponte", "puzzles": ["maree", "fanali"], "reveal": "Le lettere salvate sono la chiave, e le prime tre aprono ogni parola scritta sul giornale. Ma i marinai leggono dall'ultimo segno al primo."},
    {"id": "cabina", "title": "La Cabina del Capitano", "puzzles": ["giornale", "segnali"], "reveal": "Ciò che torna indietro nel buio è capovolto, e ogni voce sale di un colore lungo l'arcobaleno."},
    {"id": "macchine", "title": "La Sala Macchine", "puzzles": ["turbine", "manometro", "periscopio", "sonar"], "reveal": "Sul fondo cresce un albero che è un animale. Sette lettere lo scrivono."},
    {"id": "campana", "title": "La Campana", "puzzles": ["corallo"], "reveal": ""},
]

PUZZLES: dict[str, dict] = {
    "maree": {"title": "Le Maree", "letter": "C"},
    "fanali": {"title": "I Fanali", "letter": "O"},
    "giornale": {"title": "Il Giornale di Bordo", "letter": "R"},
    "segnali": {"title": "I Segnali", "letter": "A"},
    "turbine": {"title": "Le Turbine", "letter": "L"},
    "manometro": {"title": "Il Manometro", "letter": "L"},
    "periscopio": {"title": "Il Periscopio", "letter": None},
    "sonar": {"title": "Il Sonar", "letter": "O"},
    "corallo": {"title": "La Campana", "letter": None},
}

ROOM_OF: dict[str, int] = {pid: i for i, room in enumerate(ROOMS) for pid in room["puzzles"]}
LETTERED: list[str] = [pid for room in ROOMS for pid in room["puzzles"] if PUZZLES[pid]["letter"]]
KEY = "".join(PUZZLES[pid]["letter"] for pid in LETTERED[:3])

PERIODS = [(4, 5, 7), (3, 5, 8), (5, 7, 9), (4, 7, 9), (5, 6, 7), (3, 7, 10)]


def _maree(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    periods = list(rng.choice(PERIODS))
    rng.shuffle(periods)
    while True:
        rings = []
        for p in periods:
            step = rng.choice([k for k in range(1, p) if math.gcd(k, p) == 1])
            rings.append({"p": p, "a": rng.randrange(1, p), "s": step})
        span = math.prod(periods)
        day = next((t for t in range(1, span + 1) if all((r["a"] + r["s"] * t) % r["p"] == 0 for r in rings)), 0)
        if day >= 12:
            return {"rings": rings, "span": span}, [str(day)]


def _press(board: list[bool], cell: int) -> None:
    r, c = divmod(cell, GRID)
    for rr, cc in ((r, c), (r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
        if 0 <= rr < GRID and 0 <= cc < GRID:
            board[rr * GRID + cc] = not board[rr * GRID + cc]


def _fanali(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    while True:
        board = [False] * (GRID * GRID)
        for cell in rng.sample(range(GRID * GRID), rng.randint(9, 15)):
            _press(board, cell)
        if sum(board) >= 7:
            return {"board": board}, None


def _giornale(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    base = BOXES_BY_ID["base"]["price"]
    rara = BOXES_BY_ID["rara"]["price"]
    return {}, [str(len(PETS)), str(len(RARITIES)), str(rara), str(base + rara)]


def _vigenere(plain: str, key: str) -> str:
    return "".join(chr((ord(p) - 65 + ord(key[i % len(key)]) - 65) % 26 + 65) for i, p in enumerate(plain))


def _segnali(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    word = rng.choice(WORDS)
    return {"cipher": _vigenere(word[::-1], KEY), "key_length": len(KEY)}, [word.casefold()]


def _turn(state: list[int], counts: list[int]) -> list[int]:
    out = list(state)
    for i, k in enumerate(counts):
        out[i] = (out[i] + k) % MOD
        out[(i + 1) % RINGS] = (out[(i + 1) % RINGS] + 2 * k) % MOD
    return out


def _turbine(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    while True:
        counts = [rng.randrange(MOD) for _ in range(RINGS)]
        state = _turn([0] * RINGS, counts)
        if sum(1 for s in state if s) >= 4:
            return {"state": state, "mod": MOD}, None


def _digits(n: int) -> int:
    return sum(int(d) for d in str(n))


def _primes(count: int) -> list[int]:
    out: list[int] = []
    n = 2
    while len(out) < count:
        if all(n % p for p in out):
            out.append(n)
        n += 1
    return out


def _manometro(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    kind = rng.randrange(7)
    a = rng.randint(2, 7)
    t: list[int] = []
    if kind == 0:
        t = [a, rng.randint(3, 8)]
        while len(t) < 8:
            t.append(t[-1] + t[-2] + len(t))
    elif kind == 1:
        c = rng.randint(1, 9)
        t = [(n + a) ** 3 - c * n for n in range(1, 9)]
    elif kind == 2:
        y = rng.randint(40, 80)
        d = rng.randint(3, 6)
        t = [a * (2 ** (i // 2)) if i % 2 == 0 else y - d * (i // 2) for i in range(8)]
    elif kind == 3:
        t = [a * 3]
        while len(t) < 8:
            t.append(t[-1] + _digits(t[-1]) * 2)
    elif kind == 4:
        t = [a]
        ops = [lambda v: v + 5, lambda v: v * 2, lambda v: v - 3]
        while len(t) < 8:
            t.append(ops[(len(t) - 1) % 3](t[-1]))
    elif kind == 5:
        pr = _primes(8)
        t = [pr[i] * (i + 1) + a for i in range(8)]
    else:
        t = [a, rng.randint(2, 6), rng.randint(3, 9)]
        while len(t) < 8:
            t.append(t[-1] + t[-2] + t[-3])
    return {"terms": t[:6]}, [str(t[6]), str(t[7])]


def _beam(cells: list[str], row: int) -> tuple[str, int, int]:
    r, c, dr, dc = row, -1, 0, 1
    hits = 0
    jumps = 0
    ports = {ch: [i for i, x in enumerate(cells) if x == ch] for ch in "ab"}
    for _ in range(600):
        r, c = r + dr, c + dc
        if r < 0:
            return f"t{c + 1}", hits, jumps
        if r >= SIZE:
            return f"b{c + 1}", hits, jumps
        if c < 0:
            return f"l{r + 1}", hits, jumps
        if c >= SIZE:
            return f"r{r + 1}", hits, jumps
        ch = cells[r * SIZE + c]
        if ch == "/":
            dr, dc = -dc, -dr
            hits += 1
        elif ch == "\\":
            dr, dc = dc, dr
            hits += 1
        elif ch in "ab":
            other = ports["b" if ch == "a" else "a"][0]
            r, c = divmod(other, SIZE)
            jumps += 1
    return "x0", hits, jumps


def _periscopio(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    while True:
        cells = ["."] * (SIZE * SIZE)
        spots = rng.sample(range(SIZE * SIZE), 12)
        for i in spots[:10]:
            cells[i] = rng.choice(["/", "\\"])
        cells[spots[10]] = "a"
        cells[spots[11]] = "b"
        row = rng.randrange(SIZE)
        port, hits, jumps = _beam(cells, row)
        if port != "x0" and hits >= 4 and jumps >= 1 and not port.startswith("l"):
            return {"size": SIZE, "cells": cells, "row": row + 1}, [port, str(hits)]


def _sonar(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    seq = [rng.randrange(5) for _ in range(7)]
    return {"sequence": [f"orb-{i}" for i in seq]}, [f"orb-{(i + 1) % 5}" for i in reversed(seq)]


def _corallo(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    return {}, None


MAKERS = {
    "maree": _maree,
    "fanali": _fanali,
    "giornale": _giornale,
    "segnali": _segnali,
    "turbine": _turbine,
    "manometro": _manometro,
    "periscopio": _periscopio,
    "sonar": _sonar,
    "corallo": _corallo,
}


def make(doc: dict, pid: str) -> tuple[dict, Optional[list[str]]]:
    return MAKERS[pid](random.Random(f"{doc['seed']}:{pid}"))


def _ints(got: list[str], size: int, limit: int) -> Optional[list[int]]:
    try:
        values = [int(t) for t in got]
    except ValueError:
        return None
    if len(values) != size or any(v < 0 or v >= limit for v in values):
        return None
    return values


def verify(doc: dict, pid: str, got: list[str]) -> bool:
    params, answer = make(doc, pid)
    if pid == "fanali":
        mask = got[0] if len(got) == 1 else ""
        if len(mask) != GRID * GRID or set(mask) - {"0", "1"}:
            return False
        board = list(params["board"])
        for cell, bit in enumerate(mask):
            if bit == "1":
                _press(board, cell)
        return not any(board)
    if pid == "turbine":
        counts = _ints(got, RINGS, MOD)
        return counts is not None and not any(_turn(params["state"], counts))
    if pid == "corallo":
        if len(got) != len(LETTERED) or sorted(got) != sorted(LETTERED):
            return False
        return "".join(PUZZLES[g]["letter"] for g in got) == WORD
    return got == answer


def room_index(doc: dict) -> int:
    solved = set(doc.get("solved", []))
    for i, room in enumerate(ROOMS):
        if not all(pid in solved for pid in room["puzzles"]):
            return i
    return len(ROOMS)


async def load(member: dict) -> Optional[dict]:
    return await db.obs.find_one({"member_id": member["id"]}, {"_id": 0})


async def open_door(member: dict) -> Optional[dict]:
    await db.obs.update_one(
        {"member_id": member["id"]},
        {
            "$setOnInsert": {
                "member_id": member["id"],
                "group_id": member["group_id"],
                "seed": secrets.randbits(48),
                "solved": [],
                "started_at": now_iso(),
                "finished_at": None,
                "last_attempt_ts": 0.0,
            }
        },
        upsert=True,
    )
    await award(member["id"], member["group_id"], ENTRY_BADGE)
    return await load(member)


async def _finish(member: dict) -> None:
    for item in OBS_ITEMS:
        await grant(member["id"], member["group_id"], item["id"])
    await grant_pet(member["id"], member["group_id"], OBS_PET["id"])
    await award(member["id"], member["group_id"], FINAL_BADGE)
    await db.obs.update_one({"member_id": member["id"], "finished_at": None}, {"$set": {"finished_at": now_iso()}})


async def solve(member: dict, pid: str, taps: list[str]) -> str:
    doc = await load(member)
    if not doc:
        return "closed"
    if pid not in PUZZLES or pid in doc["solved"]:
        return "wrong"
    if ROOM_OF[pid] > room_index(doc):
        return "wrong"
    now = time.time()
    if now - float(doc.get("last_attempt_ts", 0.0)) < COOLDOWN:
        return "wait"
    await db.obs.update_one({"member_id": member["id"]}, {"$set": {"last_attempt_ts": now}})
    got = [t.strip().casefold() for t in taps]
    if not verify(doc, pid, got):
        return "wrong"
    moved = await db.obs.update_one({"member_id": member["id"], "solved": {"$ne": pid}}, {"$push": {"solved": pid}})
    if not moved.modified_count:
        return "wrong"
    fresh = await load(member)
    index = room_index(fresh)
    if index >= 2:
        await award(member["id"], member["group_id"], HALFWAY_BADGE)
    if index >= len(ROOMS):
        await _finish(member)
    return "ok"


def view(doc: dict) -> dict[str, Any]:
    solved = set(doc["solved"])
    index = room_index(doc)
    rooms = []
    for i, room in enumerate(ROOMS[: index + 1]):
        puzzles = []
        for pid in room["puzzles"]:
            done = pid in solved
            puzzles.append({"id": pid, "title": PUZZLES[pid]["title"], "solved": done, "params": None if done else make(doc, pid)[0] or None})
        rooms.append({"id": room["id"], "title": room["title"], "done": i < index, "puzzles": puzzles})
    fragments = [{"puzzle": pid, "letter": PUZZLES[pid]["letter"]} for pid in LETTERED if pid in solved]
    reveals = [room["reveal"] for room in ROOMS[:index] if room["reveal"]]
    return {"index": index, "rooms": rooms, "fragments": fragments, "reveals": reveals}
