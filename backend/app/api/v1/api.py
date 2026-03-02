from fastapi import APIRouter

from .routes import (
    auth,
    blob,
    file,
    pen,
    qrcode,
    search,
    shortlink,
    tmpfile,
    user,
)

router = APIRouter()

router.include_router(auth.router)
router.include_router(blob.router)
router.include_router(file.router)
router.include_router(pen.router)
router.include_router(qrcode.router)
router.include_router(search.router)
router.include_router(shortlink.router)
router.include_router(tmpfile.router)
router.include_router(user.router)
