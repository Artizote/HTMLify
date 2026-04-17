from fastapi import APIRouter, Query

from random import shuffle
from typing import List, Optional

from ..schemas.frames import *
from app.models import File, FileMode, FileVisibility


router = APIRouter(prefix="/frames")


@router.get("/feed")
def frames_feed(
    n: Optional[int] = Query(None, description="Max number of items", gt=0)
) -> List[Frame]:
    if not n:
        n = 100
    files = File.select().where(
            File.mode == FileMode.RENDER
            ).where(
            File.visibility == FileVisibility.PUBLIC
            ).where(
            File.as_guest == False
            ).where(
            File.password == ""
            ).where(
            (File.path.endswith(".html") | File.path.endswith(".htm"))
            )
    feed = []
    for file in files:
        feed.append(Frame.from_orm(file))
    shuffle(feed)
    return feed[:n]

