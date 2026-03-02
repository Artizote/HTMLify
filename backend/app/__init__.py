from fastapi import FastAPI

from .api.v1.api import router as v1_router

app = FastAPI(title="HTMLify")

app.include_router(v1_router, prefix="/v1")
