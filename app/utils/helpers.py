from random import randint

def randstr(n):
    s = ""
    chars = "qwertyuiopasdfghjklzxcvbnm1234567890"
    for _ in range(n):
        s += chars[randint(0, 35)]
    return s

def escape_html(code) -> str:
    entitys = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    }
    for e in entitys.keys():
        code = code.replace(e, entitys[e])
    return code

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
