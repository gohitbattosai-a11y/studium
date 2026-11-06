from fastapi import Depends, HTTPException, Request

from lib.release_state import feature_open, get_release
from lib.security import current_member


async def site_gate(request: Request) -> None:
    if not get_release()["updating"]:
        return
    try:
        member = await current_member(request)
    except HTTPException:
        return
    if member.get("role") != "admin":
        raise HTTPException(status_code=503, detail="Il sito si sta aggiornando")


def feature_gate(name: str):
    async def dependency(member: dict = Depends(current_member)) -> dict:
        if not feature_open(name, member.get("role", "member")):
            raise HTTPException(status_code=403, detail="Questa funzione non è ancora disponibile")
        return member

    return dependency
