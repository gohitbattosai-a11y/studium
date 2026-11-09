RARITY_BASE: dict[str, int] = {"comune": 1, "non_comune": 4, "raro": 14, "epico": 45, "leggendario": 130, "mitico": 500}
KIND_MULT: dict[str, float] = {"fish": 1.0, "animal": 0.5, "fossil": 1.0}
RATE = 1000
DAILY_POINTS_CAP = 2
STACK_MAX = 99
SELL_BATCH_MAX = 50

ITEMS: list[dict] = [
    {"id": "verme", "category": "esca", "name": "Verme", "description": "Esca equilibrata: un'abboccata per ogni lancio.", "price": 9},
    {"id": "mosca", "category": "esca", "name": "Mosca", "description": "Attira pesci rari, ma è sprecata sui comuni.", "price": 22},
    {"id": "brillante", "category": "esca", "name": "Esca brillante", "description": "La più ambita dai pesci leggendari e mitici.", "price": 60},
    {"id": "fischietto_bosco", "category": "richiamo", "name": "Fischietto del bosco", "description": "Richiamo immediato: attira animali più rari del normale.", "price": 90, "boost": 2.5},
    {"id": "fischietto_argento", "category": "richiamo", "name": "Fischietto d'argento", "description": "Un richiamo acuto che fa uscire gli animali più schivi.", "price": 160, "boost": 4.0},
    {"id": "fischietto_oro", "category": "richiamo", "name": "Fischietto d'oro", "description": "Il suo suono arriva fino alle creature leggendarie.", "price": 260, "boost": 6.5},
    {"id": "caffe", "category": "energia", "name": "Caffè dello scavatore", "description": "Ridà 40 punti di energia allo scavo.", "price": 25, "energy": 40},
    {"id": "borraccia", "category": "energia", "name": "Borraccia ristoratrice", "description": "Ricarica del tutto l'energia dello scavo.", "price": 55, "energy": 0},
    {"id": "fondi_5", "category": "stadio", "name": "Fondi stadio 5 M", "description": "Aggiunge 5 milioni al budget dello stadio.", "price": 100, "millions": 5},
    {"id": "fondi_20", "category": "stadio", "name": "Fondi stadio 20 M", "description": "Aggiunge 20 milioni al budget dello stadio.", "price": 360, "millions": 20},
    {"id": "fondi_50", "category": "stadio", "name": "Fondi stadio 50 M", "description": "Aggiunge 50 milioni al budget dello stadio.", "price": 800, "millions": 50},
]
ITEMS_BY_ID: dict[str, dict] = {i["id"]: i for i in ITEMS}
CONSUMABLE_CATEGORIES = ("esca", "richiamo", "energia")

UPGRADES: list[dict] = [
    {"id": "pala", "name": "Pala rinforzata", "description": "+15% di energia massima allo scavo per livello.", "prices": [150, 400, 900]},
    {"id": "canna", "name": "Canna fortunata", "description": "I pesci abboccano il 10% prima per livello.", "prices": [120, 320, 700]},
]
UPGRADES_BY_ID: dict[str, dict] = {u["id"]: u for u in UPGRADES}


def sell_value(kind: str, rarity: str, factor: float) -> int:
    f = min(1.0, max(0.0, factor))
    return max(1, round(RARITY_BASE[rarity] * KIND_MULT[kind] * (0.8 + 0.4 * f)))
