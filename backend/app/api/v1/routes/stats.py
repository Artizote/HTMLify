from fastapi import APIRouter
from starlette.exceptions import HTTPException

from app.services.stats_service import StatsService
from ..schemas.stats import StatsResourceEnum


router = APIRouter(tags=["Stats"])


@router.get("/stats")
def all_stats() -> dict[str, dict[str, int]]:
    return StatsService.all_stats()

@router.get("/stats/{resource}")
def resource_stats(resource: StatsResourceEnum) -> dict[str, int]:
    match resource:
        case StatsResourceEnum.USER:
            return StatsService.user_stats()
        case StatsResourceEnum.BLOB:
            return StatsService.blob_stats()
        case StatsResourceEnum.FILE:
            return StatsService.file_stats()
        case StatsResourceEnum.PEN:
            return StatsService.pen_stats()
        case StatsResourceEnum.TMPFILE:
            return StatsService.tmpfile_stats()
        case StatsResourceEnum.TMPFOLDER:
            return StatsService.tmpfolder_stats()
        case _:
            raise HTTPException(404, "Stats not found for this resource")

