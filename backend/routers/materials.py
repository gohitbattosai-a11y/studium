from typing import List
from urllib.parse import quote

from bson import Binary
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from pymongo.errors import DuplicateKeyError

from lib.db import db
from lib.security import current_member, new_id, now_iso
from models.schemas import Folder, FolderCreate, Material, MaterialCreate

router = APIRouter()

MAX_FILE_BYTES = 8 * 1024 * 1024
ALLOWED_TYPES = {"application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"}


async def _folder_or_404(folder_id: str, group_id: str) -> dict:
    folder = await db.folders.find_one({"id": folder_id, "group_id": group_id}, {"_id": 0})
    if not folder:
        raise HTTPException(status_code=404, detail="Cartella non trovata")
    return folder


@router.get("/folders", response_model=List[Folder])
async def list_folders(member: dict = Depends(current_member)):
    gid = member["group_id"]
    docs = await db.folders.find({"group_id": gid}, {"_id": 0}).sort("created_at", 1).to_list(500)
    counts = {
        c["_id"]: c["n"]
        async for c in db.materials.aggregate([{"$match": {"group_id": gid}}, {"$group": {"_id": "$folder_id", "n": {"$sum": 1}}}])
    }
    return [Folder(id=d["id"], name=d["name"], created_by=d["created_by"], item_count=counts.get(d["id"], 0)) for d in docs]


@router.post("/folders", response_model=Folder)
async def create_folder(body: FolderCreate, member: dict = Depends(current_member)):
    doc = {
        "id": new_id(),
        "group_id": member["group_id"],
        "name": body.name,
        "name_key": body.name.casefold(),
        "created_by": member["nickname"],
        "created_at": now_iso(),
    }
    try:
        await db.folders.insert_one(dict(doc))
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Esiste già una cartella con questo nome")
    return Folder(id=doc["id"], name=doc["name"], created_by=doc["created_by"], item_count=0)


@router.get("/materials", response_model=List[Material])
async def list_materials(member: dict = Depends(current_member)):
    docs = await db.materials.find({"group_id": member["group_id"]}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return [Material(**d) for d in docs]


@router.post("/materials", response_model=Material)
async def create_material(body: MaterialCreate, member: dict = Depends(current_member)):
    await _folder_or_404(body.folder_id, member["group_id"])
    url = (body.url or "").strip() or None
    note = (body.note or "").strip() or None
    if body.kind == "link":
        if not url or not url.lower().startswith(("http://", "https://")):
            raise HTTPException(status_code=400, detail="Inserisci un link valido (http:// o https://)")
        note = note[:500] if note else None
    else:
        if not note:
            raise HTTPException(status_code=400, detail="Scrivi il testo dell'appunto")
        url = None
    doc = {
        "id": new_id(),
        "group_id": member["group_id"],
        "folder_id": body.folder_id,
        "title": body.title,
        "kind": body.kind,
        "url": url,
        "note": note[:5000] if note else None,
        "author": member["nickname"],
        "created_at": now_iso(),
    }
    await db.materials.insert_one(dict(doc))
    return Material(**doc)


@router.post("/materials/upload", response_model=Material)
async def upload_material(
    folder_id: str = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    member: dict = Depends(current_member),
):
    await _folder_or_404(folder_id, member["group_id"])
    title = title.strip()
    if not title or len(title) > 120:
        raise HTTPException(status_code=400, detail="Titolo non valido")
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Sono ammessi solo PDF e immagini (PNG, JPG, WEBP, GIF)")
    data = await file.read(MAX_FILE_BYTES + 1)
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File troppo grande (max 8 MB)")
    file_id = new_id()
    name = file.filename or "file"
    await db.files.insert_one(
        {"id": file_id, "group_id": member["group_id"], "name": name, "content_type": content_type, "data": Binary(data)}
    )
    doc = {
        "id": new_id(),
        "group_id": member["group_id"],
        "folder_id": folder_id,
        "title": title,
        "kind": "file",
        "file_id": file_id,
        "file_name": name,
        "file_type": content_type,
        "file_size": len(data),
        "author": member["nickname"],
        "created_at": now_iso(),
    }
    await db.materials.insert_one(dict(doc))
    return Material(**doc)


@router.get("/files/{id}")
async def get_file(id: str, member: dict = Depends(current_member)):
    doc = await db.files.find_one({"id": id, "group_id": member["group_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="File non trovato")
    return Response(
        content=bytes(doc["data"]),
        media_type=doc["content_type"],
        headers={"Content-Disposition": f"inline; filename*=UTF-8''{quote(doc['name'])}"},
    )
