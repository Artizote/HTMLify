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

