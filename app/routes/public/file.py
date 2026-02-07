from flask import render_template, request, g, session, send_file, abort

from app.models import User, BlobType, File, FileMode, FileVisibility, Dir
from app.services.executor import Executor
from .public import public


@public.route("/<username>/<path:path>", methods=["GET", "POST"])
def user_file(username, path):
    username = username.lower()
    user = User.by_username(username)
    fullpath = "/" + username + "/" + path
    file = File.by_path(fullpath)
    dir = Dir(fullpath)

    if not file:
        if dir:
            return render_template("dir-view.html", dir=dir)
        abort(404)

    if file.visibility == FileVisibility.HIDDEN:
        if not g.user:
            return render_template("hidden-file.html"), 403
        elif file.user != g.user:
            return render_template("hidden-file.html"), 403

    if file.password:
        passwords = session.setdefault("passwords", {})
        if request.method == "GET":
            password = passwords.get(str(file.id), "")
            file.unlock(password)
            if file.is_locked:
                return render_template("locked-file.html")
        if request.method == "POST":
            password = request.form.get("password", "")
            file.unlock(password)
            if file.is_locked:
                return render_template("locked-file.html")
            session["passwords"][str(file.id)] = password

    file.hit()

    # Binary files
    if file.blob.type == BlobType.BINARY:
        if file.mode == FileMode.RENDER:
            return send_file(file.blob.filepath, download_name=file.name)
        return render_template("file-src.html", file=file)

    # Text files 
    if file.mode == FileMode.RENDER:
        return file.content, { "Content-Type": file.mimetype }

    executors = Executor.suggest_executors(file.name)

    return render_template("file-src.html", file=file, executors=executors)


@public.route("/raw/<path:path>")
def raw_file(path):
    fullpath = "/" + path
    file = File.by_path(fullpath)
    if not file:
        abort(404)

    if file.visibility == FileVisibility.HIDDEN:
        if not g.user or g.usel != file.user:
            return render_template("hidden-file.html"), 403

    # TODO: different password approach for raw files
    if file.password:
        passwords = session.setdefault("passwords", {})
        if request.method == "GET":
            password = passwords.get(str(file.id), "")
            file.unlock(password)
            if file.is_locked:
                return render_template("locked-file.html")
        if request.method == "POST":
            password = request.form.get("password", "")
            file.unlock(password)
            if file.is_locked:
                return render_template("locked-file.html")
            session["passwords"][str(file.id)] = password

    file.hit()

    if file.blob.type == BlobType.TEXT:
        return send_file(file.blob.filepath, mimetype="text/text", download_name=file.name)
    return send_file(file.blob.filepath, mimetype=file.mimetype, download_name=file.name)


@public.route("/src/<path:path>")
def file_src(path):
    fullpath = "/" + path
    file = File.by_path(fullpath)
    if not file:
        abort(404)

    if file.visibility == FileVisibility.HIDDEN:
        if not g.user or g.usel != file.user:
            return render_template("hidden-file.html"), 403

    if file.password:
        passwords = session.setdefault("passwords", {})
        if request.method == "GET":
            password = passwords.get(str(file.id), "")
            file.unlock(password)
            if file.is_locked:
                return render_template("locked-file.html")
        if request.method == "POST":
            password = request.form.get("password", "")
            file.unlock(password)
            if file.is_locked:
                return render_template("locked-file.html")
            session["passwords"][str(file.id)] = password

    file.hit()
    
    executors = Executor.suggest_executors(file.name)

    return render_template("file-src.html", file=file, executors=executors)

