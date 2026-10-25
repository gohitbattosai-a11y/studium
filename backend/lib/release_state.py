import runpy
from pathlib import Path

RELEASE_FILE = Path(__file__).resolve().parent.parent / "release.py"

DEFAULT_MESSAGE = "Il sito si sta aggiornando. Torna tra poco!"

_cache: dict = {"mtime": None, "values": {}}


def _load() -> dict:
    try:
        mtime = RELEASE_FILE.stat().st_mtime_ns
    except OSError:
        return _cache["values"]
    if mtime != _cache["mtime"]:
        try:
            _cache["values"] = runpy.run_path(str(RELEASE_FILE))
            _cache["mtime"] = mtime
        except Exception:
            return _cache["values"]
    return _cache["values"]


def get_release() -> dict:
    values = _load()
    update_type = str(values.get("UPDATE_TYPE", ""))
    messages = values.get("UPDATE_MESSAGES", {}) or {}
    return {
        "updating": bool(values.get("IS_UPDATING", False)),
        "update_type": update_type,
        "message": str(messages.get(update_type, DEFAULT_MESSAGE)),
        "features": {str(k): str(v) for k, v in (values.get("FEATURES", {}) or {}).items()},
    }


def feature_stage(name: str) -> str:
    return get_release()["features"].get(name, "all")


def feature_open(name: str, role: str) -> bool:
    stage = feature_stage(name)
    return stage == "all" or (stage == "admins" and role == "admin")
