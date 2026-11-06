import json
import logging
import re
from pathlib import Path
from typing import Optional

log = logging.getLogger(__name__)

FILE = Path(__file__).with_name("custom_catalog.json")
KINDS = {"decoration", "background"}
RARITIES = {"comune", "non_comune", "raro", "epico", "leggendario", "mitico"}
ID_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,39}$")
MD_RE = re.compile(r"^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$")


def _read() -> dict:
    try:
        data = json.loads(FILE.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return {}
    except (OSError, ValueError):
        log.exception("custom_catalog.json non leggibile")
        return {}
    return data if isinstance(data, dict) else {}


def _text(raw: dict, key: str) -> str:
    value = raw[key]
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{key} mancante")
    return value.strip()


def _id(raw: dict) -> str:
    value = _text(raw, "id")
    if not ID_RE.match(value):
        raise ValueError(f"id non valido: {value}")
    return value


def _window(raw: dict) -> Optional[tuple[str, str]]:
    value = raw.get("window")
    if value is None:
        return None
    if not isinstance(value, (list, tuple)) or len(value) != 2 or not all(isinstance(v, str) and MD_RE.match(v) for v in value):
        raise ValueError("window deve essere null oppure [\"MM-DD\", \"MM-DD\"]")
    return (value[0], value[1])


def _item(raw: dict) -> dict:
    price = raw["price"]
    if isinstance(price, bool) or not isinstance(price, int) or price < 0:
        raise ValueError("price non valido")
    kind = _text(raw, "kind")
    if kind not in KINDS:
        raise ValueError(f"kind non valido: {kind}")
    return {
        "id": _id(raw),
        "kind": kind,
        "name": _text(raw, "name"),
        "description": _text(raw, "description"),
        "price": price,
        "window": _window(raw),
    }


def _pet(raw: dict) -> dict:
    rarity = _text(raw, "rarity")
    if rarity not in RARITIES:
        raise ValueError(f"rarity non valida: {rarity}")
    return {"id": _id(raw), "name": _text(raw, "name"), "rarity": rarity}


def _collect(key: str, build, taken: set[str]) -> list[dict]:
    out: list[dict] = []
    entries = _read().get(key, [])
    if not isinstance(entries, list):
        return out
    for raw in entries:
        try:
            entry = build(raw)
        except (KeyError, TypeError, ValueError) as exc:
            log.warning("custom_catalog %s saltato: %s", key, exc)
            continue
        if entry["id"] in taken:
            log.warning("custom_catalog %s saltato: id duplicato %s", key, entry["id"])
            continue
        taken.add(entry["id"])
        out.append(entry)
    return out


def load_items(taken: set[str]) -> list[dict]:
    return _collect("items", _item, taken)


def load_pets(taken: set[str]) -> list[dict]:
    return _collect("pets", _pet, taken)
