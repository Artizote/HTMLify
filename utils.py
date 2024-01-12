from random import randint
from requests import get
from models import users, files, db
from os import remove, system, path
from shutil import rmtree
from pathlib import Path

def filetype(ext):
    ext = ext.strip().lower()
    a = "audio"
    d = "document"
    i = "image"
    t = "text"
    v = "video"
    e = "application"
    images = {"png", "jpg", "jpeg", "gif", "tif",
             "tiff", "bmp", "eps", "raw", "cr2",
             "nef", "orf", "sr2", "webp"}
    if ext in images : return i
    audios = {"3gp", "amr", "m4a", "m4b", "m4p", "mp3",
             "off", "oga", "ogg", "wav"}
    if ext in audios : return a
    videos = {"mp4", "m4v", "mpg", "mp2", "mpeg",
             "mpe", "mpv", "mpg", "mpeg", "m2v",
             "amv", "asf", "viv", "mkv", "webm"}
    if ext in videos : return v
    texts = {'abap', 'adb', 'adoc', 'asm', "b", 'bat', 'bf',
            'cbl', 'cljs', 'cmd', 'cobra', 'coffee', 'cpp',
            'cpy', 'cs', 'css', 'dart', 'dmd',
            'dockerfile', 'drt', 'elm', 'exs', 'f90',
            'fs', 'gem', 'gemspec', 'go', 'gql',
            'graphqls', 'groovy', 'gsp', 'h', 'hrl',
            'hs', 'html', 'ijl', 'init', 'ipynb',
            'java', 'jl', 'js', 'json', 'jsonld',
            'jsonschema', 'kt', 'kts', 'lisp', 'lua',
            'm', 'md', 'mlx', 'mm', 'mof',
            'php', 'phtml', 'pks', 'pl', 'pp',
            'proto', 'ps1', 'ps1xml', 'psd1', 'psm1',
            'purs', 'py', 'r', 'rb', 're',
            'resource', 'robot', 'rs', 'scala', 'sh',
            'shrc', 'sjs', 'sql', 'ss', 'suite',
            'sv', 'swift', 'tb', 'tex', 'tk',
            'ts', "txt", 'var', 'vbs', 'vhd', 'vpack',
            'vpkg', 'wasm', 'wat', 'ws', 'xml', 'xsd',
            'yaml', 'yml',
    }
    if ext in texts : return t
    documents = {"pdf"}
    if ext in documents : return d
    return "unknown"



def randstr(n):
    s = ""
    chars = "qwertyuiopasdfghjklzxcvbnm1234567890"
    for _ in range(n):
        s += chars[randint(0, 35)]
    return s

def github_fetch(user, repo, branch, file):
    # uninmplimented function
    return "functnality not available yet"
    #doing fetching with git clone command
    system("git clone https://github.com/" + user + "/" + repo + ".git media")
    with open("media/" + repo + "/" + file, 'r') as f:
        content = f.read()
    return content
    
def pastebin_fetch(id):
    return get("https://pastebin.com/raw/" + id.replace("/", "")[-8:]).text
    
def file_search(q, filetypes={"text"}) -> list:
    _files = files.query.all()
    qs = q.split(" ")
    results = []
    for file in _files:
        if file.visibility == "h": continue
        result = {}
        result["id"] = file.id
        result["name"] = file.name
        result["owner"] = file.owner
        result["views"] = file.views
        result["path"] = file.path
        result["mode"] = file.mode
        result["comments"] = str(len(file.comments))
        file.content = str(file.content)
        result["weight"] = 0
        if file.type == "text":
            result["weight"] = sum(file.content.lower().count(w) for w in qs)
        result["weight"] += sum(file.path.lower().count(w) for w in qs) * 2
        result["weight"] += sum(file.name.lower().count(w) for w in qs) * 2
        
        if result["weight"] == 0: continue
        fa = -1
        for w in qs:
            fa = file.content.find(w)
            if fa != -1 : break
        fc = file.content[abs(fa-100): fa +100]
        fc = fc.replace("<", "&lt;").replace(">", "&gt;").lower()
        for w in qs:
            fc = fc.replace(w, "<span class=\"search-found\">"+w+"</span>")
        result["snippet"] = fc
        results.append(result)
    results = list(sorted(results, key=lambda r : r["weight"]))[::-1]
    return results

def escape_html(code) -> str:
    entitys = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    }
    for e in entitys.keys():
        code = code.replace(e, entitys[e])
    return code


def git_clone(user, repo, dir="", mode='r', visibility='p', overwrite=True):

    random_dir = randstr(10)
    clone = not system(GIT_COMMAND_PATH + " clone " + repo + " " + random_dir)
    if not clone:
        return None
    
    repopath = str(Path.cwd())+"/"+random_dir+"/"
        
    filterd = []
    paths = [Path(repopath)]
    for path in paths:
        for item in path.glob("*"):
            if item.is_dir():
                if str(item)[len(repopath):][0] == ".":
                    continue
                paths.append(item)
            if item.is_file():
                if item.name[0] == ".":
                    continue
                filterd.append(str(item))

    for fullpath in filterd:
        path = fullpath[len(repopath):]
        try:
            content = Path(fullpath).read_text()
        except:
            filecontent = Path(fullpath).read_bytes()
            filename = randstr(10)+"."+path.split("/")[-1].split(".")[-1]
            with open("media/"+filename, 'wb+') as f:
                f.write(filecontent)
            content = "/media/"+filename

        ext = path.split("/")[-1].split(".")[-1].replace("/", "").lower()

        filemode = mode
        if mode == 'p':
            if not ext in {"html", "htm"}:
                filemode = 'r'
        
        if overwrite:
            if file := files.by_path(user+"/"+dir+("/"if dir else "")+path):
                file.content = content
                file.mode = filemode
                file.visibility = visibility
                db.session.commit()
                continue

        file = files(
            path = user + "/" + dir +("/"if dir else "")+path,
            owner = user,
            name = path.split("/")[-1],
            ext = ext,
            type = filetype(ext),
            content = content,
            size = len(content),
            mode = filemode,
            visibility = visibility
        )

        db.session.add(file)
        db.session.commit()
    rmtree(random_dir)
    return True


