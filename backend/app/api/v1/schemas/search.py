from enum import StrEnum

from pydantic import BaseModel

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

class SearchResultRead(SearchResultBase):
    pass

class SearchResultResponse(BaseModel):
    query: str
    results: list[SearchResultRead]
    page: int
    page_size: int
    time_took: float
