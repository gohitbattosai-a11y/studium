import math
from typing import Optional

from lib.custom_catalog import load_items

GRADE_POINTS: dict[int, int] = {
    1: 3,
    2: 4,
    3: 5,
    4: 6,
    5: 8,
    6: 10,
    7: 13,
    8: 16,
    9: 20,
    10: 25,
}

GAME_TIERS: list[tuple[int, int]] = [
    (100, 10),
    (90, 7),
    (75, 5),
    (60, 3),
    (40, 2),
]

AUTHOR_REWARDS: dict[str, int] = {
    "scratch": 10,
    "custom": 7,
}
AUTHOR_REWARD_DEFAULT = 5

Window = Optional[tuple[str, str]]

ITEMS: list[dict] = [
    {
        "id": "fiamma-spettrale",
        "kind": "decoration",
        "name": "Fiamma spettrale",
        "description": "Fiamme viola e blu che avvolgono l'avatar.",
        "price": 20,
        "window": None,
    },
    {
        "id": "aura-oro",
        "kind": "decoration",
        "name": "Aura dorata",
        "description": "Scintille dorate in orbita attorno all'avatar.",
        "price": 30,
        "window": None,
    },
    {
        "id": "drago-spettrale",
        "kind": "decoration",
        "name": "Drago spettrale",
        "description": "Un drago di spirito che gira senza sosta attorno all'avatar.",
        "price": 90,
        "window": None,
    },
    {
        "id": "ghiaccio-cristalli",
        "kind": "decoration",
        "name": "Cristalli di ghiaccio",
        "description": "Schegge di ghiaccio e brillantini in orbita.",
        "price": 25,
        "window": None,
    },
    {
        "id": "fulmine-elettrico",
        "kind": "decoration",
        "name": "Scarica elettrica",
        "description": "Fulmini che crepitano attorno all'avatar.",
        "price": 40,
        "window": None,
    },
    {
        "id": "sakura",
        "kind": "decoration",
        "name": "Petali di ciliegio",
        "description": "Petali rosa che girano dolcemente.",
        "price": 25,
        "window": None,
    },
    {
        "id": "arcobaleno",
        "kind": "decoration",
        "name": "Anello arcobaleno",
        "description": "Un anello dai sette colori che ruota.",
        "price": 50,
        "window": None,
    },
    {
        "id": "zucca-halloween",
        "kind": "decoration",
        "name": "Zucca stregata",
        "description": "Zucca luminosa con pipistrelli in orbita.",
        "price": 35,
        "window": ("10-15", "11-02"),
    },
    {
        "id": "corona-natale",
        "kind": "decoration",
        "name": "Corona di Natale",
        "description": "Ghirlanda con luci che lampeggiano.",
        "price": 35,
        "window": ("12-01", "01-06"),
    },
    {
        "id": "halloween",
        "kind": "background",
        "name": "Notte di Halloween",
        "description": "Luna piena, casa stregata, pipistrelli e zucche.",
        "price": 60,
        "window": ("10-15", "11-02"),
    },
    {
        "id": "biblioteca",
        "kind": "background",
        "name": "Biblioteca notturna",
        "description": "Scaffali di libri, lampada da tavolo accesa e cielo stellato.",
        "price": 60,
        "window": None,
    },
    {
        "id": "natale",
        "kind": "background",
        "name": "Notte di Natale",
        "description": "Neve, albero illuminato e baita nel bosco.",
        "price": 60,
        "window": ("12-01", "01-06"),
    },
    {
        "id": "cuori",
        "kind": "decoration",
        "name": "Cuori fluttuanti",
        "description": "Cuori rosa che girano attorno all'avatar.",
        "price": 25,
        "window": None,
    },
    {
        "id": "bolle-acqua",
        "kind": "decoration",
        "name": "Bolle d'acqua",
        "description": "Bolle azzurre e riflessi marini in orbita.",
        "price": 25,
        "window": None,
    },
    {
        "id": "veleno-tossico",
        "kind": "decoration",
        "name": "Veleno tossico",
        "description": "Schegge verdi e vapori acidi attorno all'avatar.",
        "price": 40,
        "window": None,
    },
    {
        "id": "stelle-notte",
        "kind": "decoration",
        "name": "Notte stellata",
        "description": "Un anello indaco con stelle che brillano.",
        "price": 45,
        "window": None,
    },
    {
        "id": "spazio",
        "kind": "background",
        "name": "Spazio profondo",
        "description": "Nebulose, pianeta ad anelli e stelle cadenti.",
        "price": 60,
        "window": None,
    },
    {
        "id": "oceano",
        "kind": "background",
        "name": "Fondale oceanico",
        "description": "Raggi di luce, pesci colorati e bolle che salgono.",
        "price": 60,
        "window": None,
    },
    {
        "id": "tramonto",
        "kind": "background",
        "name": "Tramonto sui monti",
        "description": "Sole che scende dietro le montagne e uccelli in volo.",
        "price": 60,
        "window": None,
    },
    {
        "id": "giappone",
        "kind": "background",
        "name": "Notte in Giappone",
        "description": "Torii, luna piena e petali di ciliegio che cadono.",
        "price": 60,
        "window": None,
    },
    {
        "id": "neve-fiocchi",
        "kind": "decoration",
        "name": "Fiocchi di neve",
        "description": "Stelle di ghiaccio e brillantini bianchi in orbita.",
        "price": 25,
        "window": None,
    },
    {
        "id": "lava-fuoco",
        "kind": "decoration",
        "name": "Lava incandescente",
        "description": "Schegge di magma e scintille attorno all'avatar.",
        "price": 35,
        "window": None,
    },
    {
        "id": "foglie-bosco",
        "kind": "decoration",
        "name": "Foglie del bosco",
        "description": "Foglie verdi che girano dolcemente.",
        "price": 30,
        "window": None,
    },
    {
        "id": "ombra-viola",
        "kind": "decoration",
        "name": "Ombra viola",
        "description": "Un anello d'ombra con bagliori viola.",
        "price": 35,
        "window": None,
    },
    {
        "id": "foresta",
        "kind": "background",
        "name": "Foresta incantata",
        "description": "Alberi scuri, lucciole e funghi luminosi.",
        "price": 60,
        "window": None,
    },
    {
        "id": "deserto",
        "kind": "background",
        "name": "Deserto di notte",
        "description": "Dune, cactus e luna crescente sotto le stelle.",
        "price": 60,
        "window": None,
    },
    {
        "id": "citta",
        "kind": "background",
        "name": "Città al neon",
        "description": "Grattacieli, finestre accese e sole synthwave.",
        "price": 60,
        "window": None,
    },
    {
        "id": "aurora",
        "kind": "background",
        "name": "Aurora boreale",
        "description": "Bande luminose sopra montagne innevate.",
        "price": 60,
        "window": None,
    },
    {
        "id": "cyber-glitch",
        "kind": "decoration",
        "name": "Cyber Glitch",
        "description": "Effetto digitale avanzato con linee e glitch al neon.",
        "price": 90,
        "window": None,
    },
    {
        "id": "nebulosa-cosmica",
        "kind": "decoration",
        "name": "Nebulosa Cosmica",
        "description": "Stelle cadenti e polvere interstellare.",
        "price": 90,
        "window": None,
    },
    {
        "id": "dinosauri",
        "kind": "decoration",
        "name": "Mondo Giurassico",
        "description": "Artigli infuocati, fossili e ambientazione vulcanica.",
        "price": 100,
        "window": None,
    },
]

ITEMS.extend(load_items({i["id"] for i in ITEMS}))

ITEMS.sort(key=lambda i: i["price"])

ITEMS_BY_ID: dict[str, dict] = {i["id"]: i for i in ITEMS}


def grade_to_points(grade: float) -> int:
  return GRADE_POINTS[min(10, max(1, math.floor(grade + 0.5)))]


def in_window(window: Window, today: str) -> bool:
  if window is None:
    return True
  start, end = window
  md = today[5:10]
  if start <= end:
    return start <= md <= end
  return md >= start or md <= end


def window_label(window: Window) -> Optional[str]:
  if window is None:
    return None
  start, end = window
  fmt = lambda md: f"{md[3:5]}/{md[0:2]}"
  return f"Dal {fmt(start)} al {fmt(end)}"


def game_points(percent: int) -> int:
  for threshold, points in GAME_TIERS:
    if percent >= threshold:
      return points
  return 0


def next_tier(percent: int) -> Optional[tuple[int, int]]:
  for threshold, points in sorted(GAME_TIERS):
    if threshold > percent:
      return threshold, points
  return None


def author_reward(template: str) -> int:
  return AUTHOR_REWARDS.get(template, AUTHOR_REWARD_DEFAULT)
