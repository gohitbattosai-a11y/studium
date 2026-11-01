from fastapi import APIRouter, Depends, HTTPException

from lib import hunt
from lib.db import db
from lib.exclusive import EXCLUSIVE_ITEMS, owned_ids
from models.schemas import ExclusiveOut, HuntLine, HuntSolve, HuntState
from lib.security import current_member

router = APIRouter()

FIELD = {"decoration": "equipped_decoration", "background": "equipped_background"}


async def build_state(member: dict) -> HuntState:
    doc = await hunt.load(member)
    if not doc:
        return HuntState(started=False, solved=[])
    solved = doc["solved"]
    lines = [HuntLine(title=s["title"], reveal=s["reveal"]) for s in hunt.STEPS[:solved]]
    finished = solved >= len(hunt.STEPS)
    if finished:
        fresh = await db.members.find_one({"id": member["id"]}, {"_id": 0, "equipped_decoration": 1, "equipped_background": 1}) or {}
        owned = await owned_ids(member["id"])
        rewards = [
            ExclusiveOut(id=i["id"], kind=i["kind"], name=i["name"], description=i["description"], equipped=fresh.get(FIELD[i["kind"]]) == i["id"])
            for i in EXCLUSIVE_ITEMS
            if i["id"] in owned
        ]
        return HuntState(started=True, solved=lines, finished=True, rewards=rewards)
    step = hunt.STEPS[solved]
    group = await hunt.group_of(member)
    want = hunt.expected(step, member, group)
    return HuntState(
        started=True,
        scene=step["id"],
        kind=step["kind"],
        length=1 if step["kind"] == "pick" else len(want),
        sequence=want if step["kind"] == "sequence" else None,
        solved=lines,
    )


@router.get("/hunt", response_model=HuntState)
async def get_hunt(member: dict = Depends(current_member)):
    return await build_state(member)


@router.post("/hunt/knock", response_model=HuntState)
async def knock(member: dict = Depends(current_member)):
    await hunt.knock(member)
    return await build_state(member)


@router.post("/hunt/solve", response_model=HuntState)
async def solve(body: HuntSolve, member: dict = Depends(current_member)):
    result = await hunt.solve(member, body.taps)
    if result == "closed":
        raise HTTPException(status_code=409, detail="Niente risponde")
    if result == "wait":
        raise HTTPException(status_code=429, detail="Aspetta un istante")
    if result == "wrong":
        raise HTTPException(status_code=400, detail="Non è così")
    return await build_state(member)
