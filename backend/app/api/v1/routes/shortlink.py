from fastapi import APIRouter, HTTPException, Query

from typing import Optional

from app.services.shortlink_service import ShortLinkService
from ..schemas.shortlink import *


router = APIRouter(tags=["ShortLink"])


@router.get("/shortlinks",
    response_model=ShortLinkRead,
    name="ShortLink",
    description="Lookup ShortLinks")
def lookup_shortlink(
    id: Optional[int] = Query(None, description="ID of the shortlink lookup"),
    href: Optional[str] = Query(None, description="URL for shortlink lookup/create"),
    short: Optional[str] = Query(None, description="Short of the shortlink lookup"),
    ):

    if id is not None:
        shortlink = ShortLinkService.get_by_id(id)
        if not shortlink:
            raise HTTPException(status_code=404, detail="ShortLink not found with given ID")
        return ShortLinkRead(**shortlink.to_dict())

    if short is not None:
        shortlink = ShortLinkService.get_by_short(short)
        if not shortlink:
            raise HTTPException(status_code=404, detail="ShortLink found fond for givin short")
        return ShortLinkRead(**shortlink.to_dict())

    if href is not None:
        shortlink = ShortLinkService.get_by_href(href)
        if not shortlink:
            raise HTTPException(status_code=404, detail="ShortLink not found for givin href")
        return ShortLinkRead(**shortlink.to_dict())

    raise HTTPException(status_code=400, detail="Provide at least one query parameter: id, href, or short")

@router.post("/shortlinks", description="Create ShortLink")
def create_shortlink(body: ShortLinkCreate) -> ShortLinkRead:
    shortlink = ShortLinkService.create(body.href, body.new)
    return ShortLinkRead(**shortlink.to_dict())

@router.get("/shortlinks/{short}")
def get_shortlink_by_short(short: str):
    shortlink = ShortLinkService.get_by_short(short)
    if not shortlink:
        raise HTTPException(404, detail="Not found")
    return ShortLinkRead(**shortlink.to_dict())

