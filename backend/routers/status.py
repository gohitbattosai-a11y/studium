from fastapi import APIRouter

from lib.release_state import get_release
from models.schemas import SiteStatus

router = APIRouter()


@router.get("/status", response_model=SiteStatus)
async def site_status():
    return SiteStatus(**get_release())
