from pydantic import BaseModel

from typing import Optional


class ShortLinkRead(BaseModel):
    id: int
    href: str
    short: str
    hits: int
    url: str


class ShortLinkCreate(BaseModel):
    href: str
    new: Optional[bool] = False

