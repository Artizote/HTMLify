from random import randint
from hashlib import sha256
import os

def randstr(n: int) -> str:
    """Returns an alphanumaric string of length `n`"""
    s = ""
    chars = "qwertyuiopasdfghjklzxcvbnm1234567890"
    for _ in range(n):
        s += chars[randint(0, 35)]
    return s

def escape_html(code: str) -> str:
    """Returns HTML rander safe code"""
    entitys = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }
    for e in entitys.keys():
        code = code.replace(e, entitys[e])
    return code

def hash_sha256(string: str | bytes) -> str:
    """Returns sha256 hexdigest of given string or bytes"""
    if isinstance(string, str):
        string = string.encode()
    return sha256(string).hexdigest()

def file_path(*path) -> str:
    """Returns abslute path for file inside files dir"""
    return os.path.abspath((os.path.join("files", *path)))

def normalizer(string: str) -> str:
    """Returns a normlized version of `string`"""
    s = string
    s = s.lower()
    char_set = set(s)
    for c in char_set:
        if not c.isalnum() and c != " ":
            s = s.replace(c, "")
    return s

def tokenizer(string: str) -> list[str]:
    """Basic tokenizer, returns tokens out of `string`"""
    splits = string.split(" ")
    tokens = []
    for t in splits:
        if "-" in t:
            ts = t.split("-")
            for s in ts:
                if s:
                    tokens.append(s)
            continue
        tokens.append(t)
    return tokens
