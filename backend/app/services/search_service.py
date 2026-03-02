from .search.search import SearchResult, search_items, search_items_with_timedelta
from app.models.search import SearchResultItemType


class SearchService:

    @staticmethod
    def search_items(query: str, page: int = 1, page_size: int = 32) -> list[SearchResult]:
        total_results = search_items(query)
        results = total_results.paginate(page, page_size)
        return list(results)

    @staticmethod
    def search_items_with_time(query: str, page: int = 1, page_size: int = 32) -> tuple[list[SearchResult], float]:
        total_results, time_taken = search_items_with_timedelta(query)
        results = total_results.paginate(page, page_size)
        return list(results), time_taken

    @staticmethod
    def search_files(query: str, page: int = 1, page_size: int = 32) -> list[SearchResult]:
        total_results = search_items(query).where(SearchResult.item_type == SearchResultItemType.FILE)
        results = total_results.paginate(page, page_size)
        return list(results)

    @staticmethod
    def search_files_with_time(query: str, page: int = 1, page_size: int = 32) -> tuple[list[SearchResult], float]:
        total_results, time_taken= search_items_with_timedelta(query)
        total_results = total_results.where(SearchResult.item_type == SearchResultItemType.FILE)
        results = total_results.paginate(page, page_size)
        return list(results), time_taken

    @staticmethod
    def search_pens(query: str, page: int = 1, page_size: int = 32) -> list[SearchResult]:
        total_results = search_items(query).where(SearchResult.item_type == SearchResultItemType.FILE)
        results = total_results.paginate(page, page_size)
        return list(results)

    @staticmethod
    def search_pens_with_time(query: str, page: int = 1, page_size: int = 32) -> tuple[list[SearchResult], float]:
        total_results, time_taken= search_items_with_timedelta(query)
        total_results = total_results.where(SearchResult.item_type == SearchResultItemType.PEN)
        results = total_results.paginate(page, page_size)
        return list(results), time_taken


