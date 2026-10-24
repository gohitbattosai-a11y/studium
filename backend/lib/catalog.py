import math
from typing import Optional

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
        "id": "natale",
        "kind": "background",
        "name": "Notte di Natale",
        "description": "Neve, albero illuminato e baita nel bosco.",
        "price": 60,
        "window": ("12-01", "01-06"),
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
