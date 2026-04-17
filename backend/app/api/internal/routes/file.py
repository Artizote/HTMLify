from fastapi import APIRouter, Query, HTTPException
from starlette import status

from typing import Optional

from app.services.file_service import FileService


router = APIRouter(prefix="/file")


@router.get("/hit")
def hit_file(
    id: Optional[int] = Query(None, description="File ID"),
    path: Optional[str] = Query(None, description="File path"),
):
    file = None
    if id:
        file = FileService.get_file_by_id(id)
    if path:
        file = FileService.get_file_by_path(path)
    if not file:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail="File not found"
            )

    file.hit()

    return {"status": "ok"}
