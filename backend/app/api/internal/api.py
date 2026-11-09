from fastapi import APIRouter, Depends

from app.services.auth_service import AuthService

from .routes import (
    file,
    frames,
    pen,
    shortlink,
)


router = APIRouter(include_in_schema=True, dependencies=[Depends(AuthService.verify_internal_code)])

router.include_router(file.router)
router.include_router(frames.router)
router.include_router(pen.router)
router.include_router(shortlink.router)
