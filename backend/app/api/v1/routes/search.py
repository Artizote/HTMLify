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

    results_, time_took = SearchService.search_items_with_time(query, page, page_size)

    results = []
    for result in results_:
        srr = SearchResultRead(
            token=str(result.token),
            score=float(result.score),
            item_id=str(result.item_id),
            item_type=SearchResulItemType.FILE if result.item_type_s == "file" else SearchResulItemType.PEN
            )
        results.append(srr)

    search_result_responce = SearchResultResponse(
        query=query,
        results=results,
        page=page,
        page_size=page_size,
        time_took=time_took
    )

    return search_result_responce

@router.get("/search/files", description="Search Files")
def search_files(
    query: str = Query(alias="q"),
    page: int = Query(1, description="Search result page number", gt=0),
    page_size: int = Query(32, description="Page Size", le=1024, gt=0),
    ) -> SearchResultResponse:

    results_, time_took = SearchService.search_files_with_time(query, page, page_size)

    results = []
    for result in results_:
        srr = SearchResultRead(
            token=str(result.token),
            score=float(result.score),
            item_id=str(result.item_id),
            item_type=SearchResulItemType.FILE if result.item_type_s == "file" else SearchResulItemType.PEN
            )
        results.append(srr)

    search_result_responce = SearchResultResponse(
        query=query,
        results=results,
        page=page,
        page_size=page_size,
        time_took=time_took
    )

    return search_result_responce
