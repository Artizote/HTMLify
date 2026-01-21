from random import randint
from hashlib import sha256
import unicodedata
import os
import re

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

def rgb_hex_to_int(color: str) -> tuple[int, int, int]:
    """Convert RGB Hex string to Int tuple"""
    color = color.replace("#", "")
    r = int(color[0:2], base=16)
    g = int(color[2:4], base=16)
    b = int(color[4:6], base=16)
    return r, g, b

def normalize_string(string: str) -> str:
    """Returns a normlized version of `string`"""

    s = string

    # unicode normlize
    s = unicodedata.normalize("NFKD", s)
    s = s.encode("ascii", "ignore").decode("ascii")

    s = s.lower()

    # Replace separators with space
    s = re.sub(r"[_\-\/\.\:<>\(\)\[\]\|,]+", " ", s)

    # Remove non-alphanumeric characters
    s = re.sub(r"[^a-z0-9\s]", "", s)

    # Remove extra whitespacses
    s = re.sub(r"\s+", " ", s).strip()

    return s

def tokenize_string(string: str) -> list[str]:
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
