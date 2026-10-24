import math
from typing import Optional

POINTS_OFFSET = 5

Window = Optional[tuple[str, str]]

ITEMS: list[dict] = [
    {"id": "fiamma-spettrale", "kind": "decoration", "name": "Fiamma spettrale", "description": "Fiamme viola e blu che avvolgono l'avatar.", "price": 10, "window": None},
    {"id": "aura-oro", "kind": "decoration", "name": "Aura dorata", "description": "Scintille dorate in orbita attorno all'avatar.", "price": 15, "window": None},
    {"id": "drago-spettrale", "kind": "decoration", "name": "Drago spettrale", "description": "Un drago di spirito che gira senza sosta attorno all'avatar.", "price": 35, "window": None},
    {"id": "zucca-halloween", "kind": "decoration", "name": "Zucca stregata", "description": "Zucca luminosa con pipistrelli in orbita.", "price": 15, "window": ("10-15", "11-02")},
    {"id": "corona-natale", "kind": "decoration", "name": "Corona di Natale", "description": "Ghirlanda con luci che lampeggiano.", "price": 15, "window": ("12-01", "01-06")},
    {"id": "halloween", "kind": "background", "name": "Notte di Halloween", "description": "Luna piena, casa stregata, pipistrelli e zucche.", "price": 20, "window": ("10-15", "11-02")},
    {"id": "natale", "kind": "background", "name": "Notte di Natale", "description": "Neve, albero illuminato e baita nel bosco.", "price": 20, "window": ("12-01", "01-06")},
]

ITEMS_BY_ID: dict[str, dict] = {i["id"]: i for i in ITEMS}


def grade_to_points(grade: float) -> int:
    return max(0, math.floor(grade + 0.5) - POINTS_OFFSET)


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
