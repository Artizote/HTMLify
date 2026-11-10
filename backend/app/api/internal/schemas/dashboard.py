from datetime import datetime

from pydantic import BaseModel

from app.models import File, Pen


class DashboardStats(BaseModel):
    count: int

class DashboardStatsResponse(BaseModel):
    file: DashboardStats
    pen: DashboardStats

class DashboardLatestModifiedItem(BaseModel):
    type: str
    id: str
    title: str
    path: str
    url: str
    modified: datetime

    @classmethod
    def from_item(cls, item: File | Pen):
        return cls(
            type=("file" if type(item) == File else "pen"),
            id=str(item.id),
            title=str(item.title),
            path=str(item.path),
            url=item.url,
            modified=item.modified,
        )

