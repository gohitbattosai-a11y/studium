import asyncio
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware

load_dotenv(Path(__file__).parent / ".env")

from lib.db import client, ensure_indexes, ensure_roles
from lib.gate import site_gate
from lib.maintenance import maintenance_loop
from lib.stadium_league import league_loop
from routers import auth, badges, city, cityshop, dungeon, games, homework, hunt, materials, notices, obs, pets, polls, push, shop, stadium, status


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())
    app.state.roles_task = asyncio.create_task(ensure_roles())
    app.state.maintenance_task = asyncio.create_task(maintenance_loop())
    app.state.league_task = asyncio.create_task(league_loop())
    yield
    app.state.maintenance_task.cancel()
    app.state.league_task.cancel()
    client.close()


app = FastAPI(title="Studium API", lifespan=lifespan)
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Studium API"}


for _r in (auth.router, status.router):
    api_router.include_router(_r)

for _r in (homework.router, polls.router, materials.router, notices.router, shop.router, games.router, pets.router, badges.router, hunt.router, obs.router, city.router, cityshop.router, dungeon.router, stadium.router, push.router):
    api_router.include_router(_r, dependencies=[Depends(site_gate)])

app.include_router(api_router)

app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
