from pydantic import BaseModel, HttpUrl

from typing import Optional


class ShortLinkRead(BaseModel):
    id: int
    href: str
    short: str
    hits: int
    url: str


class ShortLinkCreate(BaseModel):
    href: HttpUrl
    new: Optional[bool] = False

