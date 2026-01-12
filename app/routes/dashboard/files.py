from flask import request, render_template, redirect, g

from app.models import File, Dir
from .dashboard import dashboard


@dashboard.get("/files")
def files():
    from flask import session
    dir = Dir(request.args.get("dir", g.user.username))
    
    view = request.args.get("view")
    if view in ["grid", "list"]:
        session["files_view"] = view
        
    files_view = session.get("files_view", "grid")
    return render_template("files.html", dir=dir, files_view=files_view)

@dashboard.route("/files/upload")
def file_upload():
    return render_template("file-upload.html")

@dashboard.route("/files/edit")
def file_edit():
    path = request.args.get("path")
    file = File.by_path(path)
    dir = Dir(path or "/" + g.user.username + "/")
    return render_template("file-edit.html", file=file, dir=dir)

@dashboard.route("/files/delete")
def file_delete():
    path = request.args.get("path")
    file = File.by_path(path)
    if not file:
        return redirect("/")
    if file.user != g.user:
        return redirect("/")
    return render_template("file-delete.html", file=file)

@dashboard.route("/files/git-clone")
def git_clone():
    dir = Dir(request.args.get("dir", g.user.username))
    return render_template("git-clone.html", dir=dir)

