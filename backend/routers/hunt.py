from fastapi import APIRouter, Depends, HTTPException

from lib import hunt
from lib.exclusive import EXCLUSIVE_BY_ID
from lib.security import current_member
from models.schemas import ExclusiveOut, HuntAnswer, HuntLine, HuntState

router = APIRouter()


async def build_state(member: dict) -> HuntState:
    doc = await hunt.advance(member)
    if not doc:
        return HuntState(started=False, solved=[])
    solved = doc["solved"]
    lines = [HuntLine(title=s["title"], reveal=s["reveal"]) for s in hunt.STEPS[:solved]]
    finished = solved >= len(hunt.STEPS)
    item = EXCLUSIVE_BY_ID[hunt.REWARD_ID]
    fresh_equipped = member.get("equipped_decoration") == hunt.REWARD_ID
    return HuntState(
        started=True,
        solved=lines,
        needs_code=not finished and hunt.STEPS[solved]["kind"] == "code",
        finished=finished,
        reward=ExclusiveOut(id=item["id"], name=item["name"], description=item["description"], equipped=fresh_equipped) if finished else None,
    )


@router.get("/hunt", response_model=HuntState)
async def get_hunt(member: dict = Depends(current_member)):
    return await build_state(member)


@router.post("/hunt/knock", response_model=HuntState)
async def knock(member: dict = Depends(current_member)):
    await hunt.knock(member)
    return await build_state(member)


@router.post("/hunt/answer", response_model=HuntState)
async def answer(body: HuntAnswer, member: dict = Depends(current_member)):
    result = await hunt.answer(member, body.answer)
    if result == "closed":
        raise HTTPException(status_code=409, detail="Niente risponde")
    if result == "wait":
        raise HTTPException(status_code=429, detail="Aspetta un istante prima di riprovare")
    if result == "wrong":
        raise HTTPException(status_code=400, detail="Il silenzio non risponde")
    return await build_state(member)
