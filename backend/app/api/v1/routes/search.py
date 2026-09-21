from fastapi import APIRouter, Query

from app.services.search_service import SearchService
from ..schemas.search import *


router = APIRouter(tags=["Search"])

@router.get("/search")
def search(
    query: str = Query(alias="q"),
    page: int = Query(1, description="Search result page number", gt=0),
    page_size: int = Query(32, description="Page Size", le=1024, gt=0),
    ) -> SearchResultResponse:

    srp = SearchService.search_items(query, page, page_size)
    search_result_responce = SearchResultResponse.from_srp(srp)

    return search_result_responce

@router.get("/search/files", description="Search Files")
def search_files(
    query: str = Query(alias="q"),
    page: int = Query(1, description="Search result page number", gt=0),
    page_size: int = Query(32, description="Page Size", le=1024, gt=0),
    ) -> SearchResultResponse:

    srp = SearchService.search_files(query, page, page_size)
    search_result_responce = SearchResultResponse.from_srp(srp)

    return search_result_responce

@router.get("/search/pens", description="Search Pens")
def search_pens(
    query: str = Query(alias="q"),
    page: int = Query(1, description="Search result page number", gt=0),
    page_size: int = Query(32, description="Page Size", le=1024, gt=0),
    ) -> SearchResultResponse:

    srp = SearchService.search_pens(query, page, page_size)
    search_result_responce = SearchResultResponse.from_srp(srp)

    return search_result_responce

