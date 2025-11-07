from pathlib import Path
from shutil import rmtree
from subprocess import run

from ..config import GIT_COMMAND_PATH
from .helpers import randstr
from .filetype import filetype

def git_clone(user, repo, dir="", mode='r', visibility='p', overwrite=True):
    from ..models import db, files

    random_dir = randstr(10)
    result = run([GIT_COMMAND_PATH, "clone", repo, random_dir])
    if result.returncode != 0:
        return None

    global path
    repopath = str(Path.cwd())+"/"+random_dir+"/" # fix in future for windows
 
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

        if overwrite:
            if file := files.by_path(user+"/"+dir+("/"if dir else "")+path):
                file.content = content
                file.mode = filemode
                file.visibility = visibility
                file.type = filetype(ext)
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
