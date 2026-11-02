from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request

import uvicorn

from app.config import SERVER_NAME

from .api.internal.api import router as internal_router
from .api.v1.api import router as v1_router

app = FastAPI(title="HTMLify")

app.include_router(internal_router, prefix="/internal")
app.include_router(v1_router, prefix="/v1")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get('/favicon.ico', include_in_schema=False)
@app.get('/favicon.svg', include_in_schema=False)
async def favicon():
    return FileResponse("app/static/favicon.svg")


_original_form = Request.form
async def _form(self, **kwargs):
    kwargs.setdefault("max_part_size", 1024 * 1024 * 1024)
    return await _original_form(self, **kwargs)
Request.form = _form

origins = [
    SERVER_NAME,
    "http://" + SERVER_NAME,
    "https://" + SERVER_NAME,
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
