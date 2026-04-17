from fastapi import APIRouter
from .routes import (
    file,
    frames,
    pen,
)


router = APIRouter(include_in_schema=True)

router.include_router(file.router)
router.include_router(frames.router)
router.include_router(pen.router)
