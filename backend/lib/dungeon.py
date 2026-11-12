import math
import random

LOOT_LIMIT = 60
MIN_SECONDS_PER_FLOOR = 8
MAX_KILLS_PER_FLOOR = 14
RARITIES = ["comune", "non_comune", "raro", "epico", "leggendario"]
ODDS = {"comune": 52.0, "non_comune": 28.0, "raro": 14.0, "epico": 4.5, "leggendario": 1.2}

LOOT: list[dict] = [
    {"id": "rottami", "name": "Rottami di ferro", "rarity": "comune", "shape": "scrap", "color": "#9ca3af", "value": 2},
    {"id": "osso", "name": "Osso scheggiato", "rarity": "comune", "shape": "bone", "color": "#e7e0c8", "value": 2},
    {"id": "stoffa", "name": "Stoffa logora", "rarity": "comune", "shape": "cloth", "color": "#a78bfa", "value": 3},
    {"id": "ragnatela", "name": "Ragnatela robusta", "rarity": "comune", "shape": "web", "color": "#e5e7eb", "value": 3},
    {"id": "elmo_ammaccato", "name": "Elmo ammaccato", "rarity": "non_comune", "shape": "helm", "color": "#94a3b8", "value": 9},
    {"id": "pugnale", "name": "Pugnale arrugginito", "rarity": "non_comune", "shape": "dagger", "color": "#b45309", "value": 8},
    {"id": "scudo_scheggiato", "name": "Scudo scheggiato", "rarity": "non_comune", "shape": "shield", "color": "#a16207", "value": 11},
    {"id": "moneta", "name": "Moneta antica", "rarity": "non_comune", "shape": "coin", "color": "#facc15", "value": 10},
    {"id": "spallaccio", "name": "Spallaccio da cavaliere", "rarity": "raro", "shape": "pauldron", "color": "#60a5fa", "value": 24},
    {"id": "spada_runica", "name": "Spada runica", "rarity": "raro", "shape": "sword", "color": "#38bdf8", "value": 30},
    {"id": "anello", "name": "Anello d'argento", "rarity": "raro", "shape": "ring", "color": "#e2e8f0", "value": 22},
    {"id": "gemma", "name": "Gemma grezza", "rarity": "raro", "shape": "gem", "color": "#34d399", "value": 27},
    {"id": "corazza", "name": "Corazza di ferro nero", "rarity": "epico", "shape": "cuirass", "color": "#7c3aed", "value": 68},
    {"id": "elmo_cornuto", "name": "Elmo cornuto d'orco", "rarity": "epico", "shape": "horned", "color": "#dc2626", "value": 74},
    {"id": "amuleto", "name": "Amuleto della notte", "rarity": "epico", "shape": "amulet", "color": "#a855f7", "value": 62},
    {"id": "corona_sepolta", "name": "Corona sepolta", "rarity": "leggendario", "shape": "crown", "color": "#fbbf24", "value": 150},
    {"id": "lama_antica", "name": "Lama dell'antico re", "rarity": "leggendario", "shape": "greatsword", "color": "#f472b6", "value": 170},
]
LOOT_BY_ID = {i["id"]: i for i in LOOT}

TROPHIES: list[dict] = [
    {"id": "t_slime", "name": "Nucleo di slime", "dungeon": "cripta", "enemy": "slime", "rarity": "comune", "art": "core", "color": "#4ade80", "chance": 0.30, "blurb": "Ancora tiepido e gelatinoso."},
    {"id": "t_skeleton", "name": "Teschio incrinato", "dungeon": "cripta", "enemy": "skeleton", "rarity": "non_comune", "art": "skull", "color": "#ebe5d0", "chance": 0.24, "blurb": "Un sorriso che non si spegne mai."},
    {"id": "t_bat", "name": "Ala di pipistrello", "dungeon": "cripta", "enemy": "bat", "rarity": "non_comune", "art": "wing", "color": "#8b5cf6", "chance": 0.24, "blurb": "Sottile come carta, forte come cuoio."},
    {"id": "t_wraith", "name": "Velo dello spettro", "dungeon": "cripta", "enemy": "wraith", "rarity": "raro", "art": "veil", "color": "#67e8f9", "chance": 0.17, "blurb": "Si muove anche senza vento."},
    {"id": "t_golem", "name": "Cuore del Guardiano", "dungeon": "cripta", "enemy": "golem", "rarity": "epico", "art": "heart", "color": "#f97316", "chance": 1.0, "blurb": "Brilla ancora, come una brace."},
    {"id": "t_goblin", "name": "Testa di goblin", "dungeon": "covo", "enemy": "goblin", "rarity": "comune", "art": "goblin", "color": "#84cc16", "chance": 0.28, "blurb": "Orecchie lunghe e un ghigno storto."},
    {"id": "t_orc", "name": "Coltello d'orco", "dungeon": "covo", "enemy": "orc", "rarity": "raro", "art": "knife", "color": "#b91c1c", "chance": 0.2, "blurb": "Dentellato e pieno di tacche."},
    {"id": "t_warlord", "name": "Corona del Re Orco", "dungeon": "covo", "enemy": "warlord", "rarity": "epico", "art": "orccrown", "color": "#eab308", "chance": 1.0, "blurb": "Pesante, rozza e sporca di battaglie."},
    {"id": "t_spider", "name": "Zanna di ragno", "dungeon": "antro", "enemy": "spider", "rarity": "non_comune", "art": "fang", "color": "#a3e635", "chance": 0.24, "blurb": "Ancora velenosa, meglio non toccarla."},
    {"id": "t_broodmother", "name": "Occhio della Regina", "dungeon": "antro", "enemy": "broodmother", "rarity": "leggendario", "art": "eye", "color": "#f43f5e", "chance": 1.0, "blurb": "Sembra ancora guardarti."},
]
TROPHIES_BY_ID = {t["id"]: t for t in TROPHIES}

DUNGEONS: list[dict] = [
    {
        "id": "covo",
        "name": "Covo dei Goblin",
        "tag": "Facile",
        "blurb": "Tre piani di tane scavate nella roccia, goblin veloci e un Re Orco con la corona.",
        "floors": 3,
        "enemies": ["goblin", "orc", "warlord"],
        "loot": ["rottami", "stoffa", "pugnale", "elmo_ammaccato", "moneta", "spallaccio", "anello", "elmo_cornuto", "corona_sepolta"],
        "boost": 0.0,
    },
    {
        "id": "cripta",
        "name": "Cripta dei Dadi",
        "tag": "Media",
        "blurb": "Quattro piani di sepolcri, dadi magici e il Guardiano di pietra.",
        "floors": 4,
        "enemies": ["slime", "skeleton", "bat", "wraith", "golem"],
        "loot": ["osso", "rottami", "elmo_ammaccato", "scudo_scheggiato", "moneta", "spada_runica", "gemma", "spallaccio", "corazza", "amuleto", "lama_antica"],
        "boost": 0.12,
    },
    {
        "id": "antro",
        "name": "Antro del Ragno",
        "tag": "Difficile",
        "blurb": "Cinque piani di ragnatele e veleno, fino alla Regina che aspetta nel buio.",
        "floors": 5,
        "enemies": ["spider", "bat", "wraith", "slime", "broodmother"],
        "loot": ["ragnatela", "osso", "stoffa", "scudo_scheggiato", "moneta", "anello", "gemma", "spada_runica", "amuleto", "corazza", "corona_sepolta", "lama_antica"],
        "boost": 0.25,
    },
]
DUNGEONS_BY_ID = {d["id"]: d for d in DUNGEONS}


def loot_count(cleared: int, won: bool, roll: int) -> int:
    if cleared < 1:
        return 0
    return 1 + (1 if cleared >= 3 else 0) + (1 if won else 0) + (1 if roll >= 5 else 0)


def roll_loot(dungeon: dict, cleared: int, won: bool, roll: int) -> list[str]:
    boost = dungeon["boost"] + 0.08 * cleared + 0.06 * (roll - 1) + (0.25 if won else 0.0)
    pool = [LOOT_BY_ID[i] for i in dungeon["loot"]]
    by_rarity = {r: [i for i in pool if i["rarity"] == r] for r in RARITIES}
    weights = {r: ODDS[r] * math.pow(1 + boost, RARITIES.index(r)) for r in RARITIES if by_rarity[r]}
    names = list(weights)
    out: list[str] = []
    for _ in range(loot_count(cleared, won, roll)):
        rarity = random.choices(names, weights=[weights[n] for n in names])[0]
        out.append(random.choice(by_rarity[rarity])["id"])
    return out


def roll_trophies(dungeon_id: str, kills: dict[str, int], won: bool, owned: set[str]) -> list[str]:
    got: list[str] = []
    for t in TROPHIES:
        if t["dungeon"] != dungeon_id or t["id"] in owned:
            continue
        n = int(kills.get(t["enemy"], 0))
        if n < 1:
            continue
        boss = t["chance"] >= 1.0
        if boss:
            if won:
                got.append(t["id"])
            continue
        if random.random() < 1 - math.pow(1 - t["chance"], min(n, 6)):
            got.append(t["id"])
    return got
