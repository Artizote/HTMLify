from fastapi import APIRouter, Query, HTTPException
from starlette import status

from typing import Optional

from app.services.pen_service import PenService


router = APIRouter(prefix="/pen")


@router.get("/hit")
def hit_pen(
    id: Optional[str] = Query(None, description="Pen id"),
    path: Optional[str] = Query(None, description="Pen path"),
):
    pen = None
    if id:
        pen = PenService.get_pen_by_id(id)
    if path:
        pen = PenService.get_pen_by_path(path)
    if not pen:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail = "Pen not found"
        )

    pen.hit()

    return {"status": "ok"}
