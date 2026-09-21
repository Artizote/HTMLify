from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.formparsers import MultiPartParser

import uvicorn

from app.config import SERVER_NAME

from .api.internal.api import router as internal_router
from .api.v1.api import router as v1_router

app = FastAPI(title="HTMLify")

app.include_router(internal_router, prefix="/internal")
app.include_router(v1_router, prefix="/v1")

MultiPartParser.max_part_size = 1024 * 1024 * 1024 # 1 GB

origins = [
    "http://localhost:3000",
    "http://localhost",
    SERVER_NAME
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_app():
    uvicorn.run("app:app", host="api.localhost", port=8000, reload=True, reload_dirs=["app"])

if __name__ == "__main__":
    run_app()
