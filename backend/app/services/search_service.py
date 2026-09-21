from time import time
from math import ceil

from .search.search import SearchResult, search_items
from app.models.search import SearchResultItemType


class SearchService:

    @staticmethod
    def search_items(query: str, page: int = 1, page_size: int = 32) -> "SearchResultPage":
        return SearchResultPage.get(query, page, page_size)

    @staticmethod
    def search_files(query: str, page: int = 1, page_size: int = 32) -> "SearchResultPage":
        return SearchResultPage.get(query, page, page_size, SearchResultItemType.FILE)

    @staticmethod
    def search_pens(query: str, page: int = 1, page_size: int = 32) -> "SearchResultPage":
        return SearchResultPage.get(query, page, page_size, SearchResultItemType.PEN)


class SearchResultPage:

    def __init__(self, query, results, total_results, page, page_size, total_pages, time_took):
        self.query = query
        self.results = results
        self.total_results = total_results
        self.page = page
        self.page_size = page_size
        self.total_pages = total_pages
        self.time_took = time_took

    @classmethod
    def get(cls, query: str, page: int = 1, page_size: int = 32, type = None):
        start_time = time()
        page = page if page > 0 else 1
        page_size = page_size if page_size > 0 else 32
        search_results = search_items(query)
        if type: search_results = search_results.where(SearchResult.item_type == type)
        total_results = search_results.count()
        results = search_results.paginate(page, page_size)
        total_pages = ceil(total_results / page_size)
        end_time = time()
        time_took = end_time - start_time
        return cls(query, results, total_results, page, page_size, total_pages, time_took)

