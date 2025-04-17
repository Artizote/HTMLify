# user routes

from flask import Blueprint, session, request, render_template, redirect

from datetime import datetime

from ..models import *
from ..utils import *

user = Blueprint("user", __name__)

@user.route("/dashboard")
def dashboard():
    if not session.get("user"): return redirect("/login")
    user = session["user"]["username"]
    dir = request.args.get("dir", "")
    pwd = user+"/"+dir
    items = Dir(pwd).items()[::-1]
    session["user"]["notifications"] = Notification.query.filter_by(user=user).filter_by(viewed=0).count()
    return render_template("dashboard.html", items=items, user=user, dir=dir)

@user.route("/edit", methods=["GET", "POST"])
def edit_file():
    if not session.get("user"): return render_template("login.html")
    if request.method == "POST":
        path = request.args.get("filepath", "")
        if request.form.get("github"):
            content = github_fetch(request.form["user"], request.form["repo"], request.form["branch"], request.form["file"])
            if content:
                return render_template("edit.html", path=path, filecontent=content, filetype=file.split(".")[-1], current_mode="r", current_visibility="p")
        if request.form.get("pastebin"):
            content = pastebin_fetch(request.form["pasteid"])
            return render_template("edit.html", path=path, filecontent=content, filetype=None, current_mode="r", current_visibility="p")
        if request.form.get("clone"):
            file = files.query.filter_by(id=int(request.form.get("clone"))).first()
            if file and (not file.visibility != "h" or file.owner == session["user"]["username"]):
                return render_template("edit.html", path=file.path[file.path.find("/"):], filecontent=file.content, filetype=file.type, current_mode="s", current_visibility="p")


    path = request.args.get("filepath", "")
    if "user" in session.keys():
        fullpath = session["user"]["username"] + "/" + path
    else:
        fullpath = ""
    if file := files.query.filter_by(path=fullpath).first():
        if file.type in {"image", "video", "audio", "document", "unknown"}:
            return render_template("media-edit.html",title=file.name, path=file.path, filetype=file.type, current_mode=file.mode, current_visibility=file.visibility, password=file.password)
        content = file.content
        if last_revision := file.last_revision():
            last_revision_id = last_revision.id
        else:
            last_revision_id = 0
        return render_template("edit.html",title=file.name, path=path, filecontent=content, filetype=file.ext, current_mode=file.mode, current_visibility=file.visibility, password=file.password, last_revision_id=last_revision_id)
    # token for guest users
    session["edit-token"] = Token.generate()
    return render_template("edit.html",title="",  path=path, filetype=None, current_mode="s", current_visibility="p", password="", extentions=get_extentions("text"))

@user.route("/file-upload")
def file_upload():
    if not session.get("user"): return render_template("login.html")
    return render_template("file-upload.html", directories=files.get_directory_tree(session["user"]["username"]))

@user.route("/delete", methods=["POST"])
def confirm_delete():
    fullpath = request.form["path"]
    #fullpath = session["user"]["username"] + "/" + path
    file = files.query.filter_by(path=fullpath).first()
    if not file: return redirect("/dashboard")
    imagefiletypes = get_extentions("image")
    return render_template("conferm-delete.html", file=file, imagefietypes=imagefiletypes, token=Token.generate())

@user.route("/revision/<int:id>")
def revision(id):
    if not "user" in session.keys():
        return redirect("/login")
    revision = Revision.get(id)
    if not revision:
        return redirect("/dashboard")
    r_file_owner = files.query.filter_by(id=revision.file).first().owner
    if r_file_owner != session["user"]["username"]:
        return redirect("/dashboard")
    return render_template("revision.html", revision=revision)

@user.route("/revision/restore", methods=["POST"])
def restore_revision():
    if not session.get("user"): return redirect("/login")
    r_id = int(request.form.get("id", 0))
    if not r_id:

        return redirect("/dashboard")
    revision = Revision.get(r_id)
    file = files.query.filter_by(id=revision.file).first()
    if not file or file.owner != session["user"]["username"]:
        return redirect("/dashboard")
    Revision.make_for(file)
    file.content = revision.content
    db.session.commit()
    return redirect("/revision/"+str(r_id)+"?msg=Version Restored")

@user.route("/notifications/")
def notifications_page():
    if not session.get("user"): return redirect("/login")
    user = users.get_user(session["user"]["username"])
    ns = user.notifications
    notifications = Notification.query.filter_by(user=user.username).filter_by(viewed=0).count()
    session["user"]["notifications"] = notifications
    Notification.purge(user.username)
    return render_template("notifications.html", notifications = ns)

@user.route("/notifications/<int:id>")
def notifications_redirect(id):
    if not session.get("user"): redirect("/")
    n = Notification.by_id(id)
    if not n: return redirect("/notifications")
    if not n.viewed: session["user"]["notifications"] -= 1
    n.viewed = 1
    n.view_time = datetime.utcnow()
    db.session.commit()
    
    return redirect(n.href)
    
@user.route("/git")
def _git_clone():
    if not session.get("user"):
        return redirect("/login")
    return render_template("git-clone.html")

