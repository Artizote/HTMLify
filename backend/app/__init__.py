from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import uvicorn

from .api.v1.api import router as v1_router

app = FastAPI(title="HTMLify")

app.include_router(v1_router, prefix="/v1")

origins = [
    "http://localhost:3000",
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
