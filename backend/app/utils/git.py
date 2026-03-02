from pathlib import Path
from shutil import rmtree
from subprocess import run

from ..config import GIT_COMMAND_PATH
from .helpers import randstr, file_path

def git_clone(user, repo: str, dir: str, mode: int, visibility: int, overwrite=True):
    """ Git Clone a repo with HTTP method to user's dir """

    from ..models import User, File, Blob

    if isinstance(user, str):
        user = User.by_username(user)
    if not user:
        return None
    
    if not dir.startswith("/"):
        dir = "/" + dir
    if not dir.endswith("/"):
        dir = dir + "/"
    dir = "/" + user.username + dir

    if not File.is_valid_filepath(dir + "file.txt"):
        return None
 
    repo_path = Path(file_path("tmp", randstr(10)))

    result = run([GIT_COMMAND_PATH, "clone", repo, repo_path])
    if result.returncode != 0:
        return None


    rmtree(repo_path.joinpath(".git"))
 
    filterd = []
    paths = [Path(repo_path)]
    for path in paths:
        for item in path.glob("*"):
            if item.is_dir():
                paths.append(item)
            if item.is_file():
                if item.name[0] == ".":
                    continue
                filterd.append(str(item))

    for full_file_path in filterd:
        blob = Blob.from_file(full_file_path)
        if not blob:
            continue
        rel_file_path = full_file_path[len(str(repo_path))+1:]
        file_path_ = dir + rel_file_path

        file = File.by_path(file_path_)
        if file:
            if overwrite:
                file.content = blob
                file.save()
                file.set_visibility(visibility)
                file.set_mode(mode)
            continue

        file = File.create(
            path = file_path_,
            title = file_path_.split("/")[-1],
            user_id = user.id,
            blob_hash = blob.hash,
        )

        file.set_mode(mode)
        file.set_visibility(visibility)

    rmtree(repo_path)
    return True
