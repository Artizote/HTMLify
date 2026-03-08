from fastapi import FastAPI
import uvicorn

from .api.v1.api import router as v1_router

app = FastAPI(title="HTMLify")

app.include_router(v1_router, prefix="/v1")

def run_app():
    uvicorn.run("app:app", host="api.localhost", port=8000, reload=True)

if __name__ == "__main__":
    run_app()
