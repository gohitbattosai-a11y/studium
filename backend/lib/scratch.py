OPS = {
    'evt_flag': {"shape": 'hat', "args": {}, "stacks": []},
    'evt_key': {"shape": 'hat', "args": {'key': 'menu:key'}, "stacks": []},
    'evt_click': {"shape": 'hat', "args": {}, "stacks": []},
    'evt_stage': {"shape": 'hat', "args": {}, "stacks": []},
    'evt_receive': {"shape": 'hat', "args": {'msg': 'menu:message'}, "stacks": []},
    'evt_clone': {"shape": 'hat', "args": {}, "stacks": []},
    'evt_when': {"shape": 'hat', "args": {'cond': 'bool'}, "stacks": []},
    'evt_broadcast': {"shape": 'stack', "args": {'msg': 'menu:message'}, "stacks": []},
    'evt_broadcast_wait': {"shape": 'stack', "args": {'msg': 'menu:message'}, "stacks": []},
    'mot_move': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'mot_turn_r': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'mot_turn_l': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'mot_goto': {"shape": 'stack', "args": {'x': 'num', 'y': 'num'}, "stacks": []},
    'mot_goto_target': {"shape": 'stack', "args": {'to': 'menu:pointTarget'}, "stacks": []},
    'mot_glide': {"shape": 'stack', "args": {'s': 'num', 'x': 'num', 'y': 'num'}, "stacks": []},
    'mot_point': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'mot_point_towards': {"shape": 'stack', "args": {'to': 'menu:aimTarget'}, "stacks": []},
    'mot_changex': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'mot_setx': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'mot_changey': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'mot_sety': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'mot_bounce': {"shape": 'stack', "args": {}, "stacks": []},
    'mot_x': {"shape": 'reporter', "args": {}, "stacks": []},
    'mot_y': {"shape": 'reporter', "args": {}, "stacks": []},
    'mot_dir': {"shape": 'reporter', "args": {}, "stacks": []},
    'look_say_for': {"shape": 'stack', "args": {'text': 'text', 's': 'num'}, "stacks": []},
    'look_say': {"shape": 'stack', "args": {'text': 'text'}, "stacks": []},
    'look_show': {"shape": 'stack', "args": {}, "stacks": []},
    'look_hide': {"shape": 'stack', "args": {}, "stacks": []},
    'look_costume': {"shape": 'stack', "args": {'c': 'menu:costume'}, "stacks": []},
    'look_next_costume': {"shape": 'stack', "args": {}, "stacks": []},
    'look_backdrop': {"shape": 'stack', "args": {'b': 'menu:backdrop'}, "stacks": []},
    'look_next_backdrop': {"shape": 'stack', "args": {}, "stacks": []},
    'look_size_set': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'look_size_change': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'look_opacity': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'look_front': {"shape": 'stack', "args": {}, "stacks": []},
    'look_costume_num': {"shape": 'reporter', "args": {}, "stacks": []},
    'look_size': {"shape": 'reporter', "args": {}, "stacks": []},
    'snd_play': {"shape": 'stack', "args": {'sound': 'menu:sound'}, "stacks": []},
    'snd_tone': {"shape": 'stack', "args": {'n': 'num', 's': 'num'}, "stacks": []},
    'ctl_wait': {"shape": 'stack', "args": {'s': 'num'}, "stacks": []},
    'ctl_repeat': {"shape": 'c', "args": {'n': 'num'}, "stacks": ['a']},
    'ctl_forever': {"shape": 'c', "args": {}, "stacks": ['a']},
    'ctl_if': {"shape": 'c', "args": {'cond': 'bool'}, "stacks": ['a']},
    'ctl_ifelse': {"shape": 'c', "args": {'cond': 'bool'}, "stacks": ['a', 'b']},
    'ctl_wait_until': {"shape": 'stack', "args": {'cond': 'bool'}, "stacks": []},
    'ctl_repeat_until': {"shape": 'c', "args": {'cond': 'bool'}, "stacks": ['a']},
    'ctl_for': {"shape": 'c', "args": {'var': 'menu:var', 'from': 'num', 'to': 'num'}, "stacks": ['a']},
    'ctl_stop': {"shape": 'cap', "args": {'what': 'menu:static'}, "stacks": []},
    'ctl_clone': {"shape": 'stack', "args": {'who': 'menu:cloneTarget'}, "stacks": []},
    'ctl_clone_delete': {"shape": 'cap', "args": {}, "stacks": []},
    'sen_touching': {"shape": 'boolean', "args": {'t': 'menu:target'}, "stacks": []},
    'sen_key': {"shape": 'boolean', "args": {'key': 'menu:key'}, "stacks": []},
    'sen_mouse_down': {"shape": 'boolean', "args": {}, "stacks": []},
    'sen_mouse_x': {"shape": 'reporter', "args": {}, "stacks": []},
    'sen_mouse_y': {"shape": 'reporter', "args": {}, "stacks": []},
    'sen_distance': {"shape": 'reporter', "args": {'t': 'menu:aimTarget'}, "stacks": []},
    'sen_ask': {"shape": 'stack', "args": {'q': 'text'}, "stacks": []},
    'sen_answer': {"shape": 'reporter', "args": {}, "stacks": []},
    'sen_timer': {"shape": 'reporter', "args": {}, "stacks": []},
    'sen_timer_reset': {"shape": 'stack', "args": {}, "stacks": []},
    'op_add': {"shape": 'reporter', "args": {'a': 'num', 'b': 'num'}, "stacks": []},
    'op_sub': {"shape": 'reporter', "args": {'a': 'num', 'b': 'num'}, "stacks": []},
    'op_mul': {"shape": 'reporter', "args": {'a': 'num', 'b': 'num'}, "stacks": []},
    'op_div': {"shape": 'reporter', "args": {'a': 'num', 'b': 'num'}, "stacks": []},
    'op_mod': {"shape": 'reporter', "args": {'a': 'num', 'b': 'num'}, "stacks": []},
    'op_random': {"shape": 'reporter', "args": {'a': 'num', 'b': 'num'}, "stacks": []},
    'op_gt': {"shape": 'boolean', "args": {'a': 'text', 'b': 'text'}, "stacks": []},
    'op_lt': {"shape": 'boolean', "args": {'a': 'text', 'b': 'text'}, "stacks": []},
    'op_eq': {"shape": 'boolean', "args": {'a': 'text', 'b': 'text'}, "stacks": []},
    'op_and': {"shape": 'boolean', "args": {'a': 'bool', 'b': 'bool'}, "stacks": []},
    'op_or': {"shape": 'boolean', "args": {'a': 'bool', 'b': 'bool'}, "stacks": []},
    'op_not': {"shape": 'boolean', "args": {'a': 'bool'}, "stacks": []},
    'op_join': {"shape": 'reporter', "args": {'a': 'text', 'b': 'text'}, "stacks": []},
    'op_letter': {"shape": 'reporter', "args": {'n': 'num', 's': 'text'}, "stacks": []},
    'op_len': {"shape": 'reporter', "args": {'s': 'text'}, "stacks": []},
    'op_contains': {"shape": 'boolean', "args": {'a': 'text', 'b': 'text'}, "stacks": []},
    'op_round': {"shape": 'reporter', "args": {'n': 'num'}, "stacks": []},
    'op_math': {"shape": 'reporter', "args": {'fn': 'menu:static', 'n': 'num'}, "stacks": []},
    'var_set': {"shape": 'stack', "args": {'var': 'menu:var', 'v': 'text'}, "stacks": []},
    'var_change': {"shape": 'stack', "args": {'var': 'menu:var', 'v': 'num'}, "stacks": []},
    'var_get': {"shape": 'reporter', "args": {'var': 'menu:var'}, "stacks": []},
    'var_show': {"shape": 'stack', "args": {'var': 'menu:var'}, "stacks": []},
    'var_hide': {"shape": 'stack', "args": {'var': 'menu:var'}, "stacks": []},
    'list_add': {"shape": 'stack', "args": {'v': 'text', 'list': 'menu:list'}, "stacks": []},
    'list_delete': {"shape": 'stack', "args": {'i': 'num', 'list': 'menu:list'}, "stacks": []},
    'list_insert': {"shape": 'stack', "args": {'v': 'text', 'i': 'num', 'list': 'menu:list'}, "stacks": []},
    'list_replace': {"shape": 'stack', "args": {'i': 'num', 'list': 'menu:list', 'v': 'text'}, "stacks": []},
    'list_clear': {"shape": 'stack', "args": {'list': 'menu:list'}, "stacks": []},
    'list_item': {"shape": 'reporter', "args": {'i': 'num', 'list': 'menu:list'}, "stacks": []},
    'list_len': {"shape": 'reporter', "args": {'list': 'menu:list'}, "stacks": []},
    'list_contains': {"shape": 'boolean', "args": {'list': 'menu:list', 'v': 'text'}, "stacks": []},
    'proc_define': {"shape": 'hat', "args": {'name': 'text', 'params': 'text'}, "stacks": []},
    'proc_call': {"shape": 'stack', "args": {'proc': 'text', 'a0': 'text', 'a1': 'text', 'a2': 'text', 'a3': 'text', 'a4': 'text'}, "stacks": []},
    'proc_param': {"shape": 'reporter', "args": {'name': 'text'}, "stacks": []},
    'game_score': {"shape": 'reporter', "args": {}, "stacks": []},
    'game_change_score': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'game_set_score': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'game_lives': {"shape": 'reporter', "args": {}, "stacks": []},
    'game_change_lives': {"shape": 'stack', "args": {'n': 'num'}, "stacks": []},
    'game_time': {"shape": 'reporter', "args": {}, "stacks": []},
    'game_end': {"shape": 'cap', "args": {}, "stacks": []},
}

import math
import re
from typing import Any

ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,24}$")
COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")

MAX_SPRITES = 8
MAX_BLOCKS = 800
MAX_DEPTH = 24
MAX_SCRIPTS = 40
MAX_LIST = 200
MAX_TEXT = 200
COMMAND_SHAPES = {"stack", "cap", "c"}
REPORTER_SHAPES = {"reporter", "boolean"}


class ScratchError(Exception):
    pass


def fail(message: str):
    raise ScratchError(message)


def as_dict(value: Any, what: str) -> dict:
    if not isinstance(value, dict):
        fail(f"{what}: formato non valido")
    return value


def as_list(value: Any, what: str, low: int, high: int) -> list:
    if not isinstance(value, list):
        fail(f"{what}: formato non valido")
    if not low <= len(value) <= high:
        fail(f"{what}: servono da {low} a {high} elementi")
    return value


def as_id(value: Any, what: str) -> str:
    if not isinstance(value, str) or not ID_RE.match(value):
        fail(f"{what}: identificatore non valido")
    return value


def as_text(value: Any, what: str, high: int, low: int = 0) -> str:
    if not isinstance(value, str):
        fail(f"{what}: testo non valido")
    value = value.strip() if low else value
    if not low <= len(value) <= high:
        fail(f"{what}: lunghezza non valida")
    if "\x00" in value:
        fail(f"{what}: testo non valido")
    return value


def as_number(value: Any, what: str, low: float, high: float) -> float | int:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        fail(f"{what}: numero non valido")
    if not low <= value <= high:
        fail(f"{what}: valore fuori limite")
    return int(value) if float(value).is_integer() else float(value)


def as_bool(value: Any, what: str) -> bool:
    if not isinstance(value, bool):
        fail(f"{what}: valore non valido")
    return value


class Counter:
    def __init__(self) -> None:
        self.blocks = 0
        self.ids: set[str] = set()
        self.flag = False
        self.scoring = False
        self.ends = False
        self.refs: list[tuple[str, str]] = []


def clean_block(raw: Any, depth: int, counter: Counter, where: str) -> dict:
    if depth > MAX_DEPTH:
        fail(f"{where}: blocchi troppo annidati")
    raw = as_dict(raw, where)
    op = raw.get("op")
    if not isinstance(op, str) or op not in OPS:
        fail(f"{where}: blocco sconosciuto")
    spec = OPS[op]
    counter.blocks += 1
    if counter.blocks > MAX_BLOCKS:
        fail(f"Massimo {MAX_BLOCKS} blocchi")
    block_id = as_id(raw.get("id"), where)
    if block_id in counter.ids:
        fail(f"{where}: identificatore duplicato")
    counter.ids.add(block_id)
    if op in ("game_change_score", "game_set_score"):
        counter.scoring = True
    if op == "game_end":
        counter.ends = True
    args_in = as_dict(raw.get("args", {}), where)
    args: dict[str, Any] = {}
    for key, value in args_in.items():
        kind = spec["args"].get(key)
        if kind is None:
            fail(f"{where}: parametro non valido")
        if isinstance(value, dict):
            if kind.startswith("menu:"):
                fail(f"{where}: questo campo non accetta blocchi")
            inner = clean_block(value, depth + 1, counter, where)
            if OPS[inner["op"]]["shape"] not in REPORTER_SHAPES:
                fail(f"{where}: un campo accetta solo blocchi tondi")
            if kind == "bool" and OPS[inner["op"]]["shape"] != "boolean":
                fail(f"{where}: un campo vero/falso accetta solo condizioni")
            args[key] = inner
        elif isinstance(value, bool):
            args[key] = value
        elif isinstance(value, (int, float)):
            args[key] = as_number(value, where, -1e9, 1e9)
        else:
            text = as_text(value, where, MAX_TEXT)
            args[key] = text
            if kind in ("menu:var", "menu:list", "menu:message"):
                counter.refs.append((kind, text))
    stacks_in = as_dict(raw.get("stacks", {}), where) if spec["stacks"] else {}
    out: dict[str, Any] = {"id": block_id, "op": op, "args": args}
    if spec["stacks"]:
        stacks: dict[str, list] = {}
        for name in stacks_in:
            if name not in spec["stacks"]:
                fail(f"{where}: sezione non valida")
        for name in spec["stacks"]:
            items = as_list(stacks_in.get(name, []), where, 0, MAX_LIST)
            cleaned = [clean_block(item, depth + 1, counter, where) for item in items]
            if any(OPS[c["op"]]["shape"] not in COMMAND_SHAPES for c in cleaned):
                fail(f"{where}: blocco fuori posto")
            stacks[name] = cleaned
        out["stacks"] = stacks
    return out


def clean_script(raw: Any, counter: Counter, where: str) -> dict:
    raw = as_dict(raw, where)
    blocks_in = as_list(raw.get("blocks"), where, 1, MAX_LIST)
    blocks = [clean_block(b, 0, counter, where) for b in blocks_in]
    first = OPS[blocks[0]["op"]]["shape"]
    if first in REPORTER_SHAPES and len(blocks) != 1:
        fail(f"{where}: blocco fuori posto")
    if any(OPS[b["op"]]["shape"] not in COMMAND_SHAPES for b in blocks[1:]):
        fail(f"{where}: blocco fuori posto")
    if first == "hat" and blocks[0]["op"] == "evt_flag":
        counter.flag = True
    return {
        "id": as_id(raw.get("id"), where),
        "x": as_number(raw.get("x", 0), where, 0, 10000),
        "y": as_number(raw.get("y", 0), where, 0, 10000),
        "blocks": blocks,
    }


def clean_scratch(raw: Any) -> dict:
    raw = as_dict(raw, "Progetto")
    if raw.get("v") != 1:
        fail("Versione del progetto non supportata")
    settings = as_dict(raw.get("settings"), "Impostazioni")
    goal = as_number(settings.get("goal"), "Obiettivo", 1, 1000)
    lives = as_number(settings.get("lives"), "Vite", 0, 9)
    time = as_number(settings.get("time"), "Tempo", 0, 600)

    backdrops = []
    for item in as_list(raw.get("backdrops"), "Sfondi", 1, 10):
        item = as_dict(item, "Sfondo")
        for key in ("from", "to"):
            if not isinstance(item.get(key), str) or not COLOR_RE.match(item[key]):
                fail("Sfondo: colore non valido")
        backdrops.append(
            {
                "id": as_id(item.get("id"), "Sfondo"),
                "name": as_text(item.get("name", ""), "Sfondo", 30),
                "from": item["from"],
                "to": item["to"],
                "deco": as_text(item.get("deco", ""), "Sfondo", 8),
            }
        )

    messages = []
    for m in as_list(raw.get("messages", []), "Messaggi", 0, 30):
        text = as_text(m, "Messaggio", 30, 1)
        if text not in messages:
            messages.append(text)

    sprites_raw = as_list(raw.get("sprites"), "Sprite", 1, MAX_SPRITES)
    sprite_ids = [as_id(as_dict(s, "Sprite").get("id"), "Sprite") for s in sprites_raw]
    if len(set(sprite_ids)) != len(sprite_ids):
        fail("Sprite: identificatore duplicato")

    variables = []
    for v in as_list(raw.get("vars", []), "Variabili", 0, 30):
        v = as_dict(v, "Variabile")
        scope = v.get("scope")
        if scope != "all" and scope not in sprite_ids:
            fail("Variabile: ambito non valido")
        variables.append(
            {
                "id": as_id(v.get("id"), "Variabile"),
                "name": as_text(v.get("name"), "Variabile", 30, 1),
                "initial": as_number(v.get("initial", 0), "Variabile", -1e9, 1e9),
                "scope": scope,
                "shown": as_bool(v.get("shown", False), "Variabile"),
            }
        )

    lists = []
    for l in as_list(raw.get("lists", []), "Liste", 0, 10):
        l = as_dict(l, "Lista")
        scope = l.get("scope")
        if scope != "all" and scope not in sprite_ids:
            fail("Lista: ambito non valido")
        lists.append({"id": as_id(l.get("id"), "Lista"), "name": as_text(l.get("name"), "Lista", 30, 1), "scope": scope})

    counter = Counter()
    sprites = []
    for s in sprites_raw:
        costumes = [as_text(c, "Costume", 8, 1) for c in as_list(s.get("costumes"), "Costumi", 1, 12)]
        rotation = s.get("rotation")
        if rotation not in ("all", "lr", "none"):
            fail("Sprite: rotazione non valida")
        where = "Sprite"
        sprites.append(
            {
                "id": s["id"],
                "name": as_text(s.get("name"), "Sprite", 30, 1),
                "costumes": costumes,
                "x": as_number(s.get("x", 0), where, -1000, 1000),
                "y": as_number(s.get("y", 0), where, -1000, 1000),
                "size": as_number(s.get("size", 100), where, 5, 500),
                "dir": as_number(s.get("dir", 90), where, -360, 360),
                "rotation": rotation,
                "visible": as_bool(s.get("visible", True), where),
                "scripts": [clean_script(sc, counter, f"Sprite «{s.get('name', '')}»") for sc in as_list(s.get("scripts", []), "Script", 0, MAX_SCRIPTS)],
            }
        )

    var_ids = {v["id"] for v in variables}
    list_ids = {l["id"] for l in lists}
    for kind, value in counter.refs:
        if kind == "menu:var" and value not in var_ids:
            fail("Un blocco usa una variabile non scelta o eliminata")
        if kind == "menu:list" and value not in list_ids:
            fail("Un blocco usa una lista non scelta o eliminata")
        if kind == "menu:message" and value not in messages:
            fail("Un blocco usa un messaggio non scelto o eliminato")

    if not counter.flag:
        fail("Aggiungi un blocco «quando si clicca 🏁» per far partire il gioco")
    if not counter.scoring:
        fail("Assegna punti con «cambia punteggio di» o «porta punteggio a»")
    if not counter.ends and time == 0 and lives == 0:
        fail("Aggiungi «termina il gioco», oppure imposta un tempo massimo o delle vite")

    return {
        "v": 1,
        "settings": {"goal": goal, "lives": lives, "time": time},
        "backdrops": backdrops,
        "messages": messages,
        "vars": variables,
        "lists": lists,
        "sprites": sprites,
    }


def count_blocks(project: dict) -> int:
    def walk(block: dict) -> int:
        total = 1
        for value in block.get("args", {}).values():
            if isinstance(value, dict):
                total += walk(value)
        for stack in block.get("stacks", {}).values():
            total += sum(walk(b) for b in stack)
        return total

    return sum(walk(b) for s in project.get("sprites", []) for sc in s.get("scripts", []) for b in sc.get("blocks", []))
