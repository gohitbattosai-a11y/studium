import random
from typing import Optional

MAX_LEVEL = 10
LEVEL_XP = [0, 0, 40, 100, 180, 290, 430, 600, 810, 1060, 1350]
COOLDOWN_BY_POWER = {1: 2, 2: 3, 3: 4, 4: 6, 5: 8}
DAMAGE_BY_POWER = {1: 4, 2: 6, 3: 9, 4: 13, 5: 20}
HEAL_BY_POWER = {1: 5, 2: 8, 3: 12, 4: 16, 5: 24}
TURNS_BY_POWER = {1: 1, 2: 2, 3: 2, 4: 3, 5: 4}
KIND_MULT = {"strike": 1.0, "bolt": 0.8, "nova": 0.7, "cleave": 0.75, "pierce": 0.8, "chain": 0.6, "meteor": 1.0, "drain": 0.8, "execute": 1.1, "dash": 0.8}
PHYSICAL_KINDS = {"strike", "cleave", "execute", "dash"}
SKINS = ["#f1c9a5", "#e0a97f", "#c68a5e", "#a06a43", "#7a4a2b"]
HAIRS = ["#1a1410", "#3b2a1a", "#6b4423", "#c9a24b", "#8a2d1a", "#e5e7eb"]
CAPES = ["#b3202f", "#2563eb", "#16a34a", "#7c3aed", "#ea580c", "#0891b2", "#be185d", "#475569"]
RARITY_ORDER = ["comune", "non_comune", "raro", "epico", "leggendario"]

CLASSES: list[dict] = [
    {"id": "guerriero", "name": "Guerriero", "icon": "⚔️", "color": "#ef4444", "blurb": "Corazza pesante e colpi devastanti. Resiste a tutto e rompe le linee nemiche.", "hp": 30, "atk": 1, "crit": 0, "slots": 3, "weapon_kind": "spade e asce"},
    {"id": "mago", "name": "Mago", "icon": "🔮", "color": "#a855f7", "blurb": "Fragile ma letale: incantesimi a distanza e tanti dadi speciali in tasca.", "hp": 20, "atk": 0, "crit": 0, "slots": 4, "weapon_kind": "bastoni"},
    {"id": "ranger", "name": "Ranger", "icon": "🏹", "color": "#22c55e", "blurb": "Colpisce da lontano, cura con le erbe e non spreca mai una freccia.", "hp": 24, "atk": 1, "crit": 0, "slots": 3, "weapon_kind": "archi"},
    {"id": "ladro", "name": "Ladro", "icon": "🗡️", "color": "#f59e0b", "blurb": "Veloce e spietato: colpi critici frequenti e affondi alle spalle.", "hp": 22, "atk": 1, "crit": 1, "slots": 3, "weapon_kind": "pugnali"},
]
CLASSES_BY_ID = {c["id"]: c for c in CLASSES}

_KIND_TEXT = {
    "strike": "Colpisce il nemico più vicino per {amount} danni (+ attacco).",
    "bolt": "Un dardo magico colpisce il nemico più vicino per {amount} danni, a qualsiasi distanza.",
    "nova": "Esplosione attorno al nemico più vicino: {amount} danni a tutti entro {radius} caselle.",
    "cleave": "Colpisce tutti i nemici adiacenti per {amount} danni (+ attacco).",
    "pierce": "Una freccia trapassa tutti i nemici nella tua colonna per {amount} danni.",
    "chain": "Colpisce fino a {n} nemici a caso per {amount} danni ciascuno.",
    "meteor": "Colpisce tutti i nemici del piano per {amount} danni.",
    "drain": "Colpisce il nemico più vicino per {amount} danni e ti cura della stessa quantità.",
    "execute": "Bersaglia il nemico più ferito: {amount} danni (+ attacco), il doppio se è sotto metà vita.",
    "dash": "Scatti fino a {range} caselle verso il nemico più vicino e lo colpisci per {amount} danni (+ attacco).",
    "heal": "Ti cura di {amount} punti vita.",
    "ward": "Sei invulnerabile per {turns} turni.",
    "freeze": "Congela tutti i nemici per {turns} turni.",
    "rage": "+{amount} attacco per {turns} turni.",
}


def _ability(aid: str, cls: str, name: str, icon: str, kind: str, power: int, unlock: int) -> dict:
    if kind == "heal":
        amount = HEAL_BY_POWER[power]
    elif kind == "rage":
        amount = power + 1
    elif kind in ("ward", "freeze"):
        amount = 0
    else:
        amount = max(1, round(DAMAGE_BY_POWER[power] * KIND_MULT[kind]))
    out = {
        "id": aid,
        "cls": cls,
        "name": name,
        "icon": icon,
        "kind": kind,
        "power": power,
        "cd": COOLDOWN_BY_POWER[power],
        "unlock": unlock,
        "amount": amount,
        "turns": TURNS_BY_POWER[power] if kind in ("ward", "freeze", "rage") else 0,
        "n": 2 + power // 2 if kind == "chain" else 0,
        "radius": (1 if power <= 3 else 2) if kind == "nova" else 0,
        "range": 2 if kind == "dash" else 0,
    }
    out["text"] = _KIND_TEXT[kind].format(**out)
    return out


ABILITIES: list[dict] = [
    _ability("colpo_possente", "guerriero", "Colpo possente", "💥", "strike", 2, 1),
    _ability("grido_guerra", "guerriero", "Grido di guerra", "📣", "rage", 2, 2),
    _ability("muro_scudi", "guerriero", "Muro di scudi", "🛡️", "ward", 3, 4),
    _ability("vortice", "guerriero", "Vortice di lame", "🌀", "cleave", 4, 6),
    _ability("furia_titanica", "guerriero", "Furia titanica", "🌋", "meteor", 5, 9),
    _ability("dardo_arcano", "mago", "Dardo arcano", "✨", "bolt", 1, 1),
    _ability("palla_fuoco", "mago", "Palla di fuoco", "🔥", "nova", 3, 2),
    _ability("anello_gelo", "mago", "Anello di gelo", "❄️", "freeze", 3, 4),
    _ability("risucchio", "mago", "Risucchio vitale", "🩸", "drain", 3, 6),
    _ability("meteora", "mago", "Pioggia di meteore", "☄️", "meteor", 5, 9),
    _ability("freccia_precisa", "ranger", "Freccia perforante", "🏹", "pierce", 2, 1),
    _ability("pioggia_frecce", "ranger", "Pioggia di frecce", "🌧️", "chain", 3, 2),
    _ability("cura_foresta", "ranger", "Erbe del bosco", "🌿", "heal", 2, 4),
    _ability("tiro_mirato", "ranger", "Tiro mirato", "🎯", "execute", 3, 6),
    _ability("tempesta_spine", "ranger", "Tempesta di spine", "🌪️", "chain", 5, 9),
    _ability("affondo", "ladro", "Affondo", "⚡", "dash", 1, 1),
    _ability("pugnalata", "ladro", "Pugnalata alle spalle", "🗡️", "execute", 3, 2),
    _ability("fumogena", "ladro", "Bomba fumogena", "💨", "ward", 2, 4),
    _ability("danza_lame", "ladro", "Danza di lame", "💫", "cleave", 4, 6),
    _ability("colpo_letale", "ladro", "Colpo letale", "☠️", "execute", 5, 9),
]
ABILITIES_BY_ID = {a["id"]: a for a in ABILITIES}


def _gear(gid: str, name: str, slot: str, rarity: str, shape: str, color: str, stats: dict, source: str, classes: Optional[list] = None, price: int = 0, unlock: Optional[dict] = None, drop: Optional[dict] = None) -> dict:
    return {
        "id": gid,
        "name": name,
        "slot": slot,
        "rarity": rarity,
        "shape": shape,
        "color": color,
        "stats": stats,
        "source": source,
        "classes": classes or [],
        "price": price,
        "unlock": unlock,
        "drop": drop,
    }


GEAR: list[dict] = [
    _gear("g_spada_ferro", "Spada di ferro", "weapon", "comune", "sword", "#cbd5e1", {"atk": 1}, "start", ["guerriero"]),
    _gear("g_ascia_orco", "Ascia dell'orco", "weapon", "non_comune", "axe", "#84cc16", {"atk": 2}, "shop", ["guerriero"], price=220),
    _gear("g_spada_runica", "Spada runica", "weapon", "raro", "sword", "#38bdf8", {"atk": 2, "crit": 1}, "shop", ["guerriero"], price=700),
    _gear("g_mazza_guardiano", "Mazza del Guardiano", "weapon", "epico", "mace", "#f97316", {"atk": 3, "vamp": 1}, "unlock", ["guerriero"], unlock={"type": "trophy", "id": "t_golem"}),
    _gear("g_lama_re", "Lama dell'Antico Re", "weapon", "leggendario", "greatsword", "#f472b6", {"atk": 5, "crit": 1, "vamp": 2}, "drop", ["guerriero"], drop={"dungeon": "antro", "chance": 0.15}),
    _gear("g_bastone_legno", "Bastone di legno", "weapon", "comune", "staff", "#a16207", {"power": 1}, "start", ["mago"]),
    _gear("g_bastone_nodoso", "Bastone nodoso", "weapon", "non_comune", "staff", "#84cc16", {"power": 2}, "shop", ["mago"], price=220),
    _gear("g_verga_gelo", "Verga del gelo", "weapon", "raro", "staff", "#38bdf8", {"power": 3, "atk": 1}, "shop", ["mago"], price=700),
    _gear("g_scettro_notte", "Scettro della notte", "weapon", "epico", "staff", "#a855f7", {"power": 4, "cdr": 1}, "unlock", ["mago"], unlock={"type": "trophy", "id": "t_wraith"}),
    _gear("g_occhio_regina", "Bastone dell'Occhio", "weapon", "leggendario", "staff", "#f43f5e", {"power": 7, "cdr": 2}, "drop", ["mago"], drop={"dungeon": "antro", "chance": 0.15}),
    _gear("g_arco_corto", "Arco corto", "weapon", "comune", "bow", "#a16207", {"atk": 1}, "start", ["ranger"]),
    _gear("g_arco_lungo", "Arco lungo", "weapon", "non_comune", "bow", "#84cc16", {"atk": 2}, "shop", ["ranger"], price=230),
    _gear("g_arco_ragno", "Arco di seta di ragno", "weapon", "raro", "bow", "#e5e7eb", {"atk": 2, "crit": 1}, "unlock", ["ranger"], unlock={"type": "trophy", "id": "t_spider"}),
    _gear("g_arco_cacciatore", "Arco del cacciatore", "weapon", "epico", "bow", "#22c55e", {"atk": 3, "power": 2}, "unlock", ["ranger"], unlock={"type": "wins", "dungeon": "covo", "n": 3}),
    _gear("g_arco_vento", "Arco del vento antico", "weapon", "leggendario", "bow", "#67e8f9", {"atk": 5, "crit": 1, "cdr": 1}, "drop", ["ranger"], drop={"dungeon": "covo", "chance": 0.12}),
    _gear("g_pugnale_ruggine", "Pugnale arrugginito", "weapon", "comune", "dagger", "#b45309", {"atk": 1}, "start", ["ladro"]),
    _gear("g_stiletto", "Stiletto", "weapon", "non_comune", "dagger", "#cbd5e1", {"atk": 2}, "shop", ["ladro"], price=200),
    _gear("g_lame_gemelle", "Lame gemelle", "weapon", "raro", "dagger", "#38bdf8", {"atk": 3}, "shop", ["ladro"], price=760),
    _gear("g_kris_velenoso", "Kris velenoso", "weapon", "epico", "dagger", "#a3e635", {"atk": 3, "crit": 1, "vamp": 1}, "unlock", ["ladro"], unlock={"type": "wins", "dungeon": "cripta", "n": 2}),
    _gear("g_lama_notte", "Lama della notte", "weapon", "leggendario", "dagger", "#c084fc", {"atk": 5, "crit": 2, "vamp": 1}, "drop", ["ladro"], drop={"dungeon": "cripta", "chance": 0.15}),
    _gear("g_tunica", "Tunica di stoffa", "armor", "comune", "robe", "#a78bfa", {"hp": 2}, "start"),
    _gear("g_cuoio", "Cuoio borchiato", "armor", "non_comune", "leather", "#b45309", {"hp": 5}, "shop", price=180),
    _gear("g_cotta_maglia", "Cotta di maglia", "armor", "non_comune", "cuirass", "#94a3b8", {"hp": 2, "armor": 1}, "shop", price=340),
    _gear("g_corazza_nera", "Corazza di ferro nero", "armor", "raro", "cuirass", "#475569", {"hp": 6, "armor": 1}, "shop", price=760),
    _gear("g_scaglie_goblin", "Scaglie di goblin", "armor", "raro", "leather", "#84cc16", {"hp": 8, "guard": 1}, "unlock", unlock={"type": "wins", "dungeon": "covo", "n": 2}),
    _gear("g_armatura_guardiano", "Armatura del Guardiano", "armor", "epico", "cuirass", "#f97316", {"hp": 8, "armor": 2}, "unlock", unlock={"type": "wins", "dungeon": "cripta", "n": 3}),
    _gear("g_manto_ragnatela", "Manto di ragnatela", "armor", "epico", "robe", "#e5e7eb", {"hp": 6, "armor": 1, "regen": 1}, "unlock", unlock={"type": "trophy", "id": "t_broodmother"}),
    _gear("g_egida_re_orco", "Egida del Re Orco", "armor", "leggendario", "cuirass", "#fbbf24", {"hp": 14, "armor": 3, "guard": 1}, "drop", drop={"dungeon": "covo", "chance": 0.14}),
    _gear("g_corazza_eterna", "Corazza del Guardiano eterno", "armor", "leggendario", "cuirass", "#7c3aed", {"hp": 16, "armor": 3, "regen": 1}, "drop", drop={"dungeon": "cripta", "chance": 0.12}),
]
GEAR_BY_ID = {g["id"]: g for g in GEAR}
STARTER = {"weapon": {c["id"]: next(g["id"] for g in GEAR if g["slot"] == "weapon" and g["source"] == "start" and c["id"] in g["classes"]) for c in CLASSES}, "armor": {c["id"]: "g_tunica" for c in CLASSES}}


def level_for(xp: int) -> int:
    lvl = 1
    for n in range(2, MAX_LEVEL + 1):
        if xp >= LEVEL_XP[n]:
            lvl = n
    return lvl


def xp_gain(cleared: int, kills: int, won: bool) -> int:
    if cleared < 1:
        return min(8, max(0, kills))
    return cleared * 12 + min(40, max(0, kills)) + (40 if won else 0)


def ability_slots(level: int) -> int:
    return 2 if level < 4 else 3 if level < 8 else 4


def abilities_for(cls: str, level: int) -> list[str]:
    return [a["id"] for a in ABILITIES if a["cls"] == cls and a["unlock"] <= level]


def default_abilities(cls: str, level: int) -> list[str]:
    return abilities_for(cls, level)[: ability_slots(level)]


def unlock_met(rule: Optional[dict], records: dict, trophies: set, level: int) -> bool:
    if not rule:
        return False
    kind = rule.get("type")
    if kind == "wins":
        return int(records.get(rule["dungeon"], {}).get("wins", 0)) >= int(rule["n"])
    if kind == "best":
        return int(records.get(rule["dungeon"], {}).get("best", 0)) >= int(rule["n"])
    if kind == "trophy":
        return rule["id"] in trophies
    if kind == "level":
        return level >= int(rule["n"])
    return False


def usable_gear(gear: dict, cls: str, owned: set, records: dict, trophies: set, level: int) -> bool:
    if gear["classes"] and cls not in gear["classes"]:
        return False
    if gear["source"] == "start":
        return True
    if gear["id"] in owned:
        return True
    if gear["source"] == "unlock":
        return unlock_met(gear["unlock"], records, trophies, level)
    return False


def roll_gear(dungeon_id: str, floors: int, cleared: int, won: bool, owned: set) -> list[str]:
    out: list[str] = []
    if cleared < 1:
        return out
    for g in GEAR:
        d = g["drop"]
        if not d or d["dungeon"] != dungeon_id or g["id"] in owned:
            continue
        if won:
            chance = d["chance"]
        elif cleared >= floors - 1:
            chance = d["chance"] * 0.2
        else:
            continue
        if random.random() < chance:
            out.append(g["id"])
    return out


def duplicate_value(gear: dict) -> int:
    return {"comune": 20, "non_comune": 60, "raro": 160, "epico": 420, "leggendario": 900}[gear["rarity"]]


def look_valid(look: dict) -> dict:
    skin = look.get("skin") if look.get("skin") in SKINS else SKINS[0]
    hair = look.get("hair") if look.get("hair") in HAIRS else HAIRS[0]
    cape = look.get("cape") if look.get("cape") in CAPES else CAPES[0]
    style = int(look.get("style", 0)) if str(look.get("style", 0)).isdigit() else 0
    return {"skin": skin, "hair": hair, "cape": cape, "style": max(0, min(3, style))}


def build_loadout(char: dict, equipped: dict[str, Optional[dict]]) -> dict:
    cls = CLASSES_BY_ID[char["cls"]]
    level = level_for(int(char.get("xp", 0)))
    stats = {"hp": 0, "atk": 0, "armor": 0, "crit": 0, "vamp": 0, "regen": 0, "guard": 0, "power": 0, "cdr": 0}
    for g in equipped.values():
        if g:
            for k, v in g["stats"].items():
                stats[k] = stats.get(k, 0) + int(v)
    chosen = [a for a in char.get("abilities", []) if a in ABILITIES_BY_ID and ABILITIES_BY_ID[a]["cls"] == char["cls"] and ABILITIES_BY_ID[a]["unlock"] <= level][: ability_slots(level)]
    if not chosen:
        chosen = default_abilities(char["cls"], level)
    abilities = []
    for aid in chosen:
        a = dict(ABILITIES_BY_ID[aid])
        if a["kind"] != "ward" and a["kind"] != "freeze" and a["amount"] > 0:
            a["amount"] += stats["power"]
        a["cd"] = max(1, a["cd"] - stats["cdr"])
        abilities.append(a)
    return {
        "name": char["name"],
        "cls": char["cls"],
        "look": char["look"],
        "level": level,
        "hp": cls["hp"] + 3 * (level - 1) + stats["hp"],
        "atk": cls["atk"] + (level - 1) // 3 + stats["atk"],
        "armor": stats["armor"],
        "crit": cls["crit"] + stats["crit"],
        "vamp": stats["vamp"],
        "regen": stats["regen"],
        "guard": stats["guard"],
        "slots": cls["slots"],
        "abilities": abilities,
        "weapon": equipped.get("weapon") and equipped["weapon"]["id"],
        "armor_id": equipped.get("armor") and equipped["armor"]["id"],
    }
