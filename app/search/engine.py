import os
from ctypes import CDLL, Structure, c_int, c_char_p



from models import files
from utils.helpers import tokenizer, normalizer, randstr


class SearchResult(Structure):
    _fields_ = (
        ("file_id", c_int),
        ("score", c_int),
        ("apear_offset", c_int),
        ("tokens", c_char_p),
    )

    def __repr__(self):
        return f"<SearchResult {self.tokens}>"

    def __eq__(self, other):
        return self.score == other.score

    def __gt__(self, other):
        return self.score < other.score

    def __lt__(self, other):
        return self.score > other.score
    
    @property
    def file(self):
        return files.query.filter_by(id==self.file_id).first()


class SearchEngine:

    @staticmethod
    def query(q: str) -> list[SearchResult]:
        """Query and return search results"""
        # do the query wuery and return results
        return []

    @staticmethod
    def merge_reselts(results_1: list[SearchResult], results_2: list[SearchResult]) -> list[SearchResult]:
        """Merge results"""
        return []

    @staticmethod
    def index(file_id: int) -> bool:
        """Index the file with `file_id` if indexable"""
        file: files = files.query.filter_by(id=file_id).first()
        if not file or file.type != "text" or file.as_guest:
            return False
        content = file.content
        tokens = tokenizer(content)
        tokens = map(normalizer, tokens)
        tmpfilepath = os.path.abspath(os.path.join("media", "tmp", "search-index-tmp-" + randstr(10)))
        tmpfile = open(tmpfilepath, "w")
        tmpfile.write(" ".join(tokens))
        tmpfile.close()

        return True



