from enum import StrEnum

from pydantic import BaseModel

from app.services.search_service import SearchResultPage, SearchResult


class SearchResulItemType(StrEnum):
    FILE = "file"
    PEN = "pen"

class SearchResultBase(BaseModel):
    token: str
    score: float
    item_type: SearchResulItemType
    item_id: str

    class Config:
        from_attributes = True

    @classmethod
    def from_sr(cls, sr: SearchResult):
        return cls(
            token=str(sr.token),
            score=float(sr.score),
            item_id=str(sr.item_id),
            item_type=SearchResulItemType.FILE if sr.item_type_s == "file" else SearchResulItemType.PEN
        )

class SearchResultRead(SearchResultBase):
    pass

class SearchResultResponse(BaseModel):
    query: str
    results: list[SearchResultRead]
    total_results: int
    page: int
    page_size: int
    total_pages: int
    time_took: float

    class Config:
        from_attributes = True

    @classmethod
    def from_srp(cls, srp: SearchResultPage):
        results = []
        for sr in srp.results:
            results.append(SearchResultRead.from_sr(sr))
        return cls(
            query=srp.query,
            results=results,
            total_results=srp.total_results,
            page=srp.page,
            page_size=srp.page_size,
            total_pages=srp.total_pages,
            time_took=srp.time_took,
        )


