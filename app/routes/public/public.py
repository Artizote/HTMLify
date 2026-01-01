import requests
from flask import Blueprint, render_template, send_file, session, g, request, abort, redirect
from pygments.formatters import HtmlFormatter

from hashlib import md5
from random import randint

from app.models import *
from app.utils import file_path, pastebin_fetch
from app.config import *


public = Blueprint("public", __name__)

pygments_css = HtmlFormatter().get_style_defs()


@public.before_request
def before_request():
    g.user = None # No login check till now


@public.route("/dp/<username>")
def user_dp(username):
    username = username.lower()
    dp_path = file_path("dp", username)
    try:
        open(dp_path).close()
        return send_file(dp_path, download_name=username+".jpg")
    except:
        pass
    user = User.by_username(username)
    if not user:
        abort(404)
    hash = md5(user.email.encode()).hexdigest()
    gravatar_url = "https://gravatar.com/avatar/" + hash + "?d=retro"
    dp = requests.get(gravatar_url).content
    with open(dp_path, "wb") as f: f.write(dp)
    return send_file(dp_path)

# TODO: relocate pygments.css
@public.route('/pygments.css')
def serve_pygments_css():
    return pygments_css, {"Content-Type": "text/css"}


@public.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        session["filter-file-modes"]=list(map(int, request.form.getlist("file-modes")))
        session["filter-file-order"]=request.form.get("filter-order", "r")

    files = File.select().where(File.as_guest==False)
    files_count = files.count()
    if not files_count:
        return render_template("home.html", files=[])

    filter_modes = session.setdefault("filter-file-modes", [FileMode.SOURCE, FileMode.RENDER])
    filter_order = session.setdefault("filter-file-order", "r")

    if len(filter_modes) == 2:
        pass
    if len(filter_modes) == 1:
        files = files.where(File.mode == filter_modes[0])
    if len(filter_modes) == 0:
        return render_template("home.html", files=[])

    files_count = files.count()
    if not files_count:
        return render_template("home.html", files=[])

    if filter_order == "n":
        return render_template("home.html", files=files.order_by(File.id.desc()).limit(MAX_FILES_ON_HOME))

    _files = []

    for _ in range(MAX_FILES_ON_HOME):
        _files.append(files[randint(0, files_count-1)])

    return render_template("home.html", files=_files) 

@public.route("/<username>/")
def user_files(username):
    username = username.lower()
    user = User.by_username(username)
    if not user:
        abort(404)
    dir = Dir(username)
    latest_comments = user.comments.limit(10)
    g.q = "user:@"+user.username+" "
    return render_template("dir-view.html", show_profile=True, user=user, latest_comments=latest_comments, dir=dir)

# TODO: Impliment new Search Engine
@public.route("/search", methods=["GET", "POST"])
def search_page():
    abort(404)

@public.route("/pastebin/<id>")
def pastebin_data(id):
    c = pastebin_fetch(id)
    if c: return c, {"Content-type": "text/plain charset=utf-8"}
    abort(404)


@public.route("/http/<int:code>")
def http_states(code):
    try:
        abort(code)
    except LookupError:
        return redirect("/http")

