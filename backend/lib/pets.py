import random

RARITIES = ["comune", "non_comune", "raro", "epico", "leggendario"]

PITY_LIMIT = 10
PITY_RARITIES = ["raro", "epico", "leggendario"]

PETS: list[dict] = [
    {"id": "coniglio", "name": "Coniglio", "rarity": "comune"},
    {"id": "gatto", "name": "Gatto", "rarity": "comune"},
    {"id": "cane", "name": "Cane", "rarity": "non_comune"},
    {"id": "tartaruga", "name": "Tartaruga", "rarity": "raro"},
    {"id": "lupo", "name": "Lupo", "rarity": "epico"},
    {"id": "drago", "name": "Drago", "rarity": "leggendario"},
]

PETS_BY_ID: dict[str, dict] = {p["id"]: p for p in PETS}

BOXES: list[dict] = [
    {
        "id": "base",
        "name": "Box Cucciolo",
        "description": "Una cassa di legno: dentro c'è sempre un nuovo amico.",
        "price": 30,
        "odds": {"comune": 55, "non_comune": 27, "raro": 12, "epico": 5, "leggendario": 1},
    },
    {
        "id": "rara",
        "name": "Box Preziosa",
        "description": "Uno scrigno dorato con più possibilità di pet rari.",
        "price": 90,
        "odds": {"comune": 15, "non_comune": 30, "raro": 30, "epico": 18, "leggendario": 7},
    },
]

BOXES_BY_ID: dict[str, dict] = {b["id"]: b for b in BOXES}

DUPLICATE_REFUND: dict[str, int] = {"comune": 6, "non_comune": 12, "raro": 25, "epico": 45, "leggendario": 80}

_rng = random.SystemRandom()


def pick_rarity(box: dict, pity: int) -> str:
    odds = box["odds"]
    pool = PITY_RARITIES if pity >= PITY_LIMIT - 1 else RARITIES
    return _rng.choices(pool, weights=[odds[r] for r in pool])[0]


def pick_pet(rarity: str) -> dict:
    return _rng.choice([p for p in PETS if p["rarity"] == rarity])


def pity_left(pity: int) -> int:
    return max(1, PITY_LIMIT - pity)
