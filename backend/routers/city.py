import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from pymongo.errors import DuplicateKeyError

from lib.db import db
from lib.fish import BAITS, BAITS_BY_ID, BUCKET_LIMIT, SPECIES, SPECIES_BY_ID, bite_delay, pick_fish
from lib.gate import feature_gate
from lib.security import new_id, now_iso

router = APIRouter()

city_member = feature_gate("citta")


class SpeciesOut(BaseModel):
    id: str
    rarity: str
    shape: str
    colors: list[str]
    pattern: str
    min_cm: float
    max_cm: float
    difficulty: int
    name: Optional[str] = None
    description: Optional[str] = None


class BaitOut(BaseModel):
    id: str
    name: str
    description: str


class CatchOut(BaseModel):
    id: str
    species_id: str
    name: str
    rarity: str
    length: float
    caught_at: str
    donated_by: Optional[str] = None
    donated_at: Optional[str] = None
    description: Optional[str] = None


class DonationOut(BaseModel):
    species_id: str
    donor_id: str
    donor: str
    length: float
    donated_at: str


class CityState(BaseModel):
    species: list[SpeciesOut]
    museum: list[DonationOut]
    bucket: list[CatchOut]
    baits: list[BaitOut]
    bucket_limit: int


class CastRequest(BaseModel):
    bait: str


class CastOut(BaseModel):
    cast_id: str
    bite_in: float
    difficulty: int
    length: float


class ReelRequest(BaseModel):
    cast_id: str
    success: bool


class ReelOut(BaseModel):
    caught: bool
    fish: Optional[CatchOut] = None


class CatchRef(BaseModel):
    catch_id: str


async def load_donations(group_id: str) -> list[DonationOut]:
    docs = await db.museum.find({"group_id": group_id}, {"_id": 0}).to_list(200)
    ids = list({d["donor_id"] for d in docs})
    names = {m["id"]: m["nickname"] async for m in db.members.find({"id": {"$in": ids}}, {"_id": 0, "id": 1, "nickname": 1})}
    return [
        DonationOut(
            species_id=d["species_id"],
            donor_id=d["donor_id"],
            donor=names.get(d["donor_id"], d.get("donor_nickname", "?")),
            length=d["length"],
            donated_at=d["donated_at"],
        )
        for d in docs
    ]


def catch_out(doc: dict, donated: dict[str, DonationOut]) -> CatchOut:
    species = SPECIES_BY_ID[doc["species_id"]]
    gift = donated.get(doc["species_id"])
    return CatchOut(
        id=doc["id"],
        species_id=doc["species_id"],
        name=species["name"],
        rarity=species["rarity"],
        length=doc["length"],
        caught_at=doc["caught_at"],
        donated_by=gift.donor if gift else None,
        donated_at=gift.donated_at if gift else None,
        description=species["description"],
    )


async def bucket_docs(member_id: str) -> list[dict]:
    return await db.fish_catches.find({"member_id": member_id}, {"_id": 0}).sort("caught_at", -1).to_list(BUCKET_LIMIT + 10)


async def build_state(member: dict) -> CityState:
    donations = await load_donations(member["group_id"])
    donated = {d.species_id: d for d in donations}
    docs = await bucket_docs(member["id"])
    known = set(donated) | {c["species_id"] for c in docs}
    species = [
        SpeciesOut(
            id=s["id"],
            rarity=s["rarity"],
            shape=s["shape"],
            colors=s["colors"],
            pattern=s["pattern"],
            min_cm=s["min"],
            max_cm=s["max"],
            difficulty=s["difficulty"],
            name=s["name"] if s["id"] in known else None,
            description=s["description"] if s["id"] in known else None,
        )
        for s in SPECIES
    ]
    return CityState(
        species=species,
        museum=donations,
        bucket=[catch_out(c, donated) for c in docs],
        baits=[BaitOut(id=b["id"], name=b["name"], description=b["description"]) for b in BAITS],
        bucket_limit=BUCKET_LIMIT,
    )


@router.get("/city", response_model=CityState)
async def get_city(member: dict = Depends(city_member)):
    return await build_state(member)


@router.post("/fishing/cast", response_model=CastOut)
async def cast_line(body: CastRequest, member: dict = Depends(city_member)):
    bait = BAITS_BY_ID.get(body.bait)
    if not bait:
        raise HTTPException(status_code=400, detail="Esca non valida")
    species, length = pick_fish(bait)
    wait = bite_delay(bait)
    doc = {
        "id": new_id(),
        "member_id": member["id"],
        "group_id": member["group_id"],
        "species_id": species["id"],
        "length": length,
        "bite_in": wait,
        "created": time.time(),
    }
    await db.fish_casts.replace_one({"member_id": member["id"]}, doc, upsert=True)
    return CastOut(cast_id=doc["id"], bite_in=wait, difficulty=species["difficulty"], length=length)


@router.post("/fishing/reel", response_model=ReelOut)
async def reel_in(body: ReelRequest, member: dict = Depends(city_member)):
    cast = await db.fish_casts.find_one_and_delete({"member_id": member["id"], "id": body.cast_id}, {"_id": 0})
    if not cast:
        raise HTTPException(status_code=404, detail="Lancio scaduto")
    if not body.success:
        return ReelOut(caught=False)
    if time.time() - cast["created"] < cast["bite_in"] * 0.5 + 2:
        raise HTTPException(status_code=409, detail="Il pesce non aveva ancora abboccato")
    doc = {
        "id": new_id(),
        "species_id": cast["species_id"],
        "length": cast["length"],
        "caught_at": now_iso(),
    }
    return ReelOut(caught=True, fish=catch_out(doc, {}))


@router.post("/museum/donate", response_model=DonationOut)
async def donate_fish(body: CatchRef, member: dict = Depends(city_member)):
    catch = await db.fish_catches.find_one({"id": body.catch_id, "member_id": member["id"]}, {"_id": 0})
    if not catch:
        raise HTTPException(status_code=404, detail="Pesce non trovato")
    doc = {
        "id": new_id(),
        "group_id": member["group_id"],
        "species_id": catch["species_id"],
        "donor_id": member["id"],
        "donor_nickname": member["nickname"],
        "length": catch["length"],
        "donated_at": now_iso(),
    }
    try:
        await db.museum.insert_one(dict(doc))
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Questa specie è già stata donata al museo")
    await db.fish_catches.delete_one({"id": catch["id"]})
    return DonationOut(
        species_id=doc["species_id"],
        donor_id=member["id"],
        donor=member["nickname"],
        length=doc["length"],
        donated_at=doc["donated_at"],
    )


@router.post("/fishing/release")
async def release_fish(body: CatchRef, member: dict = Depends(city_member)):
    res = await db.fish_catches.delete_one({"id": body.catch_id, "member_id": member["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pesce non trovato")
    return {"ok": True}
