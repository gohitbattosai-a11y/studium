import asyncio
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI
from starlette.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).parent / ".env")

from lib.db import client, ensure_indexes, ensure_roles  # noqa: E402
from lib.gate import site_gate  # noqa: E402
from routers import auth, games, homework, materials, notices, pets, polls, shop, status  # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())
    app.state.roles_task = asyncio.create_task(ensure_roles())
    yield
    client.close()


app = FastAPI(title="Studium API", lifespan=lifespan)
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Studium API"}


for _r in (auth.router, status.router):
    api_router.include_router(_r)

for _r in (homework.router, polls.router, materials.router, notices.router, shop.router, games.router, pets.router):
    api_router.include_router(_r, dependencies=[Depends(site_gate)])

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
