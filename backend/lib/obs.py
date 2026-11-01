import random
import secrets
import time
from typing import Any, Optional

from lib.badges import award
from lib.db import db
from lib.exclusive import OBS_ITEMS, OBS_PET, grant, grant_pet
from lib.pets import BOXES_BY_ID, PETS, RARITIES
from lib.security import now_iso

WORD = "ZODIACO"
COOLDOWN = 1.2
ENTRY_BADGE = "lente-curiosa"
HALFWAY_BADGE = "tra-gli-ingranaggi"
FINAL_BADGE = "astronomo-d-ottone"
RINGS = 4
MOD = 6
WORDS = ["COMETA", "NEBULOSA", "PIANETA", "ECLISSE", "GALASSIA", "ORBITA", "TELESCOPIO", "SOLSTIZIO", "SATELLITE", "ZENIT"]

ROOMS: list[dict] = [
    {"id": "atrio", "title": "L'Atrio", "puzzles": ["stelle", "lanterne"], "reveal": "Due lettere aprono ogni parola scritta nei libri."},
    {"id": "biblioteca", "title": "La Biblioteca delle Mappe", "puzzles": ["registro", "cifrario"], "reveal": "Il tempo si muove solo se qualcuno lo spinge. Poi ascolta ciò che ritorna."},
    {"id": "torre", "title": "La Torre dell'Orologio", "puzzles": ["ingranaggi", "successione", "eco"], "reveal": "Sette lettere, un solo anello di case. Rimettile dove il cielo le vuole."},
    {"id": "cupola", "title": "La Cupola", "puzzles": ["meridiana"], "reveal": ""},
]

PUZZLES: dict[str, dict] = {
    "stelle": {"title": "Le Costellazioni", "letter": "O"},
    "lanterne": {"title": "Le Lanterne", "letter": "C"},
    "registro": {"title": "Il Registro", "letter": "Z"},
    "cifrario": {"title": "Il Cifrario", "letter": "A"},
    "ingranaggi": {"title": "Gli Ingranaggi", "letter": "I"},
    "successione": {"title": "Il Quadrante", "letter": "D"},
    "eco": {"title": "L'Eco", "letter": "O"},
    "meridiana": {"title": "La Meridiana", "letter": None},
}

ROOM_OF: dict[str, int] = {pid: i for i, room in enumerate(ROOMS) for pid in room["puzzles"]}
LETTERED: list[str] = [pid for room in ROOMS for pid in room["puzzles"] if PUZZLES[pid]["letter"]]
KEY = "".join(PUZZLES[pid]["letter"] for pid in ROOMS[0]["puzzles"])


def _neighbors(cell: int) -> list[int]:
    r, c = divmod(cell, 3)
    out = [cell]
    if r > 0:
        out.append(cell - 3)
    if r < 2:
        out.append(cell + 3)
    if c > 0:
        out.append(cell - 1)
    if c < 2:
        out.append(cell + 1)
    return out


def _press(board: list[bool], cell: int) -> None:
    for c in _neighbors(cell):
        board[c] = not board[c]


def _turn(state: list[int], counts: list[int]) -> list[int]:
    out = list(state)
    for i, k in enumerate(counts):
        out[i] = (out[i] + k) % MOD
        out[(i + 1) % RINGS] = (out[(i + 1) % RINGS] + 2 * k) % MOD
    return out


def _stelle(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    bright = rng.sample(range(2, 8), 3)
    faint = [rng.randint(2, 6) for _ in range(3)]
    return {"panels": [[b, f] for b, f in zip(bright, faint)]}, [str(b) for b in bright]


def _lanterne(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    while True:
        board = [False] * 9
        for cell in rng.sample(range(9), rng.randint(4, 7)):
            _press(board, cell)
        if any(board):
            return {"board": board}, None


def _registro(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    return {}, [str(len(PETS)), str(len(RARITIES)), str(BOXES_BY_ID["rara"]["price"])]


def _vigenere(plain: str, key: str) -> str:
    return "".join(chr((ord(p) - 65 + ord(key[i % len(key)]) - 65) % 26 + 65) for i, p in enumerate(plain))


def _cifrario(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    word = rng.choice(WORDS)
    return {"cipher": _vigenere(word, KEY), "key_length": len(KEY)}, [word.casefold()]


def _ingranaggi(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    while True:
        counts = [rng.randrange(MOD) for _ in range(RINGS)]
        state = _turn([0] * RINGS, counts)
        if sum(1 for s in state if s) >= 3:
            return {"state": state, "mod": MOD}, None


def _successione(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    kind = rng.randrange(5)
    a = rng.randint(2, 9)
    terms: list[int] = []
    if kind == 0:
        terms = [a, rng.randint(2, 9)]
        while len(terms) < 7:
            terms.append(terms[-1] + terms[-2])
    elif kind == 1:
        terms = [a]
        while len(terms) < 7:
            terms.append(terms[-1] * 2 + 1)
    elif kind == 2:
        d = rng.randint(1, 3)
        terms, step = [a], d
        while len(terms) < 7:
            terms.append(terms[-1] + step)
            step += d
    elif kind == 3:
        b, c, e = rng.randint(2, 5), rng.randint(14, 30), rng.randint(2, 5)
        terms = [a + b * (i // 2) if i % 2 == 0 else c - e * (i // 2) for i in range(7)]
    else:
        terms = [a]
        while len(terms) < 7:
            terms.append(terms[-1] + a if len(terms) % 2 else terms[-1] * 2)
    return {"terms": terms[:6]}, [str(terms[6])]


def _eco(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    seq = [f"orb-{rng.randrange(5)}" for _ in range(7)]
    return {"sequence": seq}, seq


def _meridiana(rng: random.Random) -> tuple[dict, Optional[list[str]]]:
    return {}, None


MAKERS = {
    "stelle": _stelle,
    "lanterne": _lanterne,
    "registro": _registro,
    "cifrario": _cifrario,
    "ingranaggi": _ingranaggi,
    "successione": _successione,
    "eco": _eco,
    "meridiana": _meridiana,
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
    if pid == "lanterne":
        try:
            cells = [int(t) for t in got]
        except ValueError:
            return False
        if len(set(cells)) != len(cells) or any(c < 0 or c > 8 for c in cells):
            return False
        board = list(params["board"])
        for cell in cells:
            _press(board, cell)
        return not any(board)
    if pid == "ingranaggi":
        counts = _ints(got, RINGS, MOD)
        return counts is not None and not any(_turn(params["state"], counts))
    if pid == "meridiana":
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
    got = [t.strip().casefold() if pid not in ("eco", "meridiana") else t.strip() for t in taps]
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
