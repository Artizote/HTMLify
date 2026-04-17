from pydantic import BaseModel


class Frame(BaseModel):
    path: str
    url: str
    user: str
    views: int

    @classmethod
    def from_orm(cls, item):
        return cls(
            path = item.path,
            url = item.url,
            user = item.user.username,
            views = item.views
        )

