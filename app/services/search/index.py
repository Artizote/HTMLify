import math

from app.utils.helpers import normalize_string, tokenize_string
from app.models import File, Pen
from app.models.search import SearchResult, SearchIndexStatus, SearchResultItemType


def get_item_type(item: File | Pen) -> int:
    if isinstance(item, File):
        return SearchResultItemType.FILE
    if isinstance(item, Pen):
        return SearchResultItemType.PEN


def get_item_id(item: File | Pen) -> str:
    if isinstance(item, File):
        return str(item.id)
    if isinstance(item, Pen):
        return str(item.id)


def should_index(item: File | Pen) -> bool:
    item_type = 0
    item_id = ""

    if isinstance(item, File):
        item_type = SearchResultItemType.FILE
        item_id = str(item.id)
    if isinstance(item, Pen):
        item_type = SearchResultItemType.PEN
        item_id = str(item.id)

    if not item_type or not item_id:
        return False

    index_status = SearchIndexStatus.get_status(item)

    if index_status.last_index.timestamp() > item.modified.timestamp():
        return False

    if isinstance(item, File):
        if item.as_guest:
            return False
        if item.is_locked:
            return False
        if item.visibility_s.casefold() == "hidden":
            return False
        return True

    if isinstance(item, Pen):
        # Pens does not have any visibilty diffirence
        return True


def get_meta(item: File | Pen) -> str:
    meta = ""
    if isinstance(item, File):
        meta = str(item.title)
    if isinstance(item, Pen):
        meta = str(item.title)
    meta = normalize_string(meta)
    return meta


def get_content(item: File | Pen) -> str:
    content = ""
    if isinstance(item, File):
        content = item.blob.get_str()
    if isinstance(item, Pen):
        content =  "\n".join([
            item.head_blob.get_str(),
            item.body_blob.get_str(),
            item.css_blob.get_str(),
            item.js_blob.get_str(),
        ])
    content = normalize_string(content)
    return content


def index_item(item: File | Pen) -> bool:
    """Index `item` into search index."""

    if not should_index(item):
        return False

    item_id = ""
    item_type = 0

    if isinstance(item, File):
        item_type = SearchResultItemType.FILE
        item_id = str(item.id)
    if isinstance(item, Pen):
        item_type = SearchResultItemType.PEN
        item_id = str(item.id)

    index_status = SearchIndexStatus.get_status(item)
    if not index_status:
        return False

    if not item_type or not item_id:
        return False

    meta = get_meta(item)
    content = get_content(item)

    meta_tokens = tokenize_string(meta)
    content_tokens = tokenize_string(content)

    meta_token_count = len(meta_tokens)
    content_token_count = len(content_tokens)

    meta_weigth = 3.0
    content_weigth = 1.0

    tokens = meta_tokens + content_tokens

    # deleting old index before making new
    SearchResult.delete().where(SearchResult.item_id==item_id).where(SearchResult.item_type==item_type).execute()

    for token in tokens:
        r = SearchResult.get_or_none(token=token, item_id=item_id, item_type=item_type)
        if r: continue

        token_freq_in_meta = meta_tokens.count(token)
        token_freq_in_content = content_tokens.count(token)

        normlised_meta_freq = token_freq_in_meta / meta_token_count
        normlised_content_freq = token_freq_in_content / content_token_count

        meta_score = meta_weigth * math.log(1 + normlised_meta_freq)
        content_score = content_weigth * math.log(1 + normlised_content_freq)

        score = meta_score + content_score

        SearchResult.create(
            token = token,
            score = score,
            item_type = item_type,
            item_id = item_id
        )

    index_status.update_last_index_time()
    return True

