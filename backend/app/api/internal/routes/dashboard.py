from fastapi import APIRouter
from starlette.exceptions import HTTPException

from app.models import User, File, Pen
from ..schemas.dashboard import *


router = APIRouter(prefix="/dashboard")


@router.get("/{username}/stats")
def user_stats(username: str) -> DashboardStatsResponse:
    user = User.by_username(username)
    if not user:
        raise HTTPException(404, "User not found")

    file_count = File.select().where(File.user_id==user.id, File.as_guest==False).count()
    pen_count = Pen.select().where(Pen.user_id==user.id).count()

    return DashboardStatsResponse(
        file=DashboardStats(count=file_count),
        pen=DashboardStats(count=pen_count),
    )


@router.get("/{username}/latest-modified")
def user_latest_modified(username: str) -> list[DashboardLatestModifiedItem]:
    user = User.by_username(username)
    if not user:
        raise HTTPException(404, "User not found")

    recent_modified_files = File.select().where(File.user_id==user.id, File.as_guest==False).order_by(File.modified.desc()).limit(16)
    recent_modified_pens = Pen.select().where(Pen.user_id==user.id).order_by(Pen.modified.desc()).limit(16)

    recent_modified_items = sorted([*recent_modified_files, *recent_modified_pens], key=lambda i:i.modified, reverse=True)
    recent_modified_items = list(map(DashboardLatestModifiedItem.from_item, recent_modified_items))
    return recent_modified_items

