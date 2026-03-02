from typing import Optional

from app.models.shortlink import ShortLink


class ShortLinkService:

    @staticmethod
    def create(href: str, new: bool = False) -> ShortLink:
        return ShortLink.create(href, new)

    @staticmethod
    def get(id: Optional[int] = None, href: Optional[str] = None, short: Optional[str] = None) -> Optional[ShortLink]:
        if id:
            return ShortLink.by_id(id)
        if href:
            return ShortLink.create(href)
        if short:
            return ShortLink.by_short(short)

    @staticmethod
    def get_by_id(id: int) -> Optional[ShortLink]:
        return ShortLink.by_id(id)

    @staticmethod
    def get_by_href(href: str) -> Optional[ShortLink]:
        return ShortLink.create(href)

    @staticmethod
    def get_by_short(short: str) -> Optional[ShortLink]:
        return ShortLink.by_short(short)

