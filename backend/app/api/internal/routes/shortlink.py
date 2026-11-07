from fastapi import APIRouter, Query, HTTPException
from starlette import status

from typing import Optional

from app.services.shortlink_service import ShortLinkService


router = APIRouter(prefix="/shortlink")


@router.get("/hit")
def hit_file(
    id: Optional[int] = Query(None, description="ShortLink ID"),
):
    shortlink = ShortLinkService.get(id)
    if not shortlink:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail="ShortLink not found"
        )

    shortlink.hit()

    return {"status": "ok"}

