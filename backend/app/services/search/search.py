from typing import Iterable
from time import time

from app.utils import normalize_string, tokenize_string
from app.models.search import SearchResult


def search_items(query: str) -> Iterable[SearchResult]:
    """Search items based on query from search index."""

    normlized_query = normalize_string(query)
    query_tokens = list(set(tokenize_string(normlized_query)))
    filter = None
    # TODO: search for partial words too
    for token in query_tokens:
        if not token:
            continue
        if not filter:
            filter = SearchResult.token == token
        else:
            filter = filter | SearchResult.token == token
    reasults = SearchResult.select().where(
            SearchResult.token.in_(query_tokens)
            ).group_by(
            SearchResult.item_id,
            SearchResult.item_type
            ).order_by(SearchResult.score.desc())
    return reasults

def search_items_with_timedelta(query: str) -> tuple[Iterable[SearchResult], float]:
    """Search items based on query from search index with time taken to search"""
    s = time()
    rs = search_items(query)
    d = time() - s
    return rs, d

