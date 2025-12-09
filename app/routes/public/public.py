import requests
from flask import Blueprint, render_template, send_file, session, g, redirect, jsonify, request
from pygments.formatters import HtmlFormatter

from hashlib import md5
from random import shuffle, randint

from app.models import *
from app.executors import suggest_executors, executors
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
    if not user: return "File not found", 404
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
        session["filter-file-modes"]=request.form.getlist("file-modes")
        # print("session[filter-file-modes]:", session["filter-file-modes"])
        session["filter-file-order"]=request.form.get("filter-order", "r")
        # print("session[filter-file-order]:", session["filter-file-order"])

    files = File.select().where(File.as_guest==False)
    files_count = files.count()
    if not files_count:
        return render_template("home.html", files=[])

    filter_modes = session.setdefault("filter-file-modes", [FileMode.SOURCE, FileMode.RENDER])
    print("filter_modes:", filter_modes)
    filter_order = session.setdefault("filter-file-order", "r")
    print("filter_order:", filter_order)

    if len(filter_modes) == 2:
        pass
    if len(filter_modes) == 1:
        files = files.where(File.mode == filter_modes[0])
    if len(filter_modes) == 0:
        return render_template("home.html", files=[])

    files_count = files.count()
    print("files_count:", files_count)
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
        return "<center><h1>NO USER FOUND WITH NAME '<b>" + username + "</b>'</h1></center>", 404
    dir = Dir(username)
    latest_comments = user.comments.limit(10)
    g.q = "user:@"+user.username+" "
    return render_template("dir-view.html", show_profile=True, user=user, latest_comments=latest_comments, dir=dir)

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
        return "404", 404

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
        return render_template("file-view.html", file=file)

    # Text files 
    if file.mode == FileMode.RENDER:
        return file.content, { "Content-Type": file.mimetype }

    _executors = suggest_executors(file.path)
    for e in executors.values():
        if not e in _executors:
            _executors.append(e)

    return render_template("file-view.html", file=file, executors=_executors)

@public.route("/raw/<path:path>")
def raw_file(path):
    fullpath = "/" + path
    file = File.by_path(fullpath)
    if not file:
        return "File not fousd", 404

    if file.visibility == FileVisibility.HIDDEN:
        if not g.user or g.usel != file.user:
            return "File is hidden", 403

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
        return "File not found", 404

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
    
    _executors = suggest_executors(file.path)
    for e in executors.values():
        if not e in _executors:
            _executors.append(e)

    return render_template("file-view.html", file=file, executors=_executors)

# TODO: Impliment new Search Engine
@public.route("/search", methods=["GET", "POST"])
def search_page():
    return "", 404

@public.route("/r/", methods=["GET", "POST"])
def link_shortener():
    shorted = url = None
    hits = None
    if request.method == "POST":
        url = request.form.get("url")
        if not url:
            return render_template("link-shortener.html")
        shortlink = ShortLink.create(url)
        hits = shortlink.visits
        shorted = shortlink.short
    return render_template("link-shortener.html", shorted=shorted, hits=hits, url=url)

@public.route("/r/<shortcode>")
def shortlink_rediraction(shortcode):
    shortlink = ShortLink.by_short(shortcode)
    if not shortlink:
        return redirect("/r")
    shortlink.hit()
    return redirect(shortlink.href, 302)

@public.route("/tmp/")
def create_temp_file():
    return render_template("temp-file.html")

@public.route("/tmp/<code>")
def tmp_file(code):
    tf = TmpFile.by_code(code)
    if not tf:
        return "<h1>404 File Not Found</br><a href='/'>Back to home</a></h1>", 404
    return send_file(tf.filepath, download_name=tf.name)

@public.route("/tmp/f/")
def tmp_folder():
    return render_template("temp-folder.html")

@public.route("/tmp/f/<code>")
def tmp_folder_(code):
    tf = TmpFolder.by_code(code)
    if not tf:
        return "<h1>404 Temp folder Not found</br><a href='/'>Back to home</a></h1>", 404
    return render_template("temp-folder.html")

# TODO: Make Frames API
@public.route("/frames")
def frames():
    return render_template("frames.html")

@public.route("/frames/feed")
def frame_feed():
    files = File.select().where(
            File.mode == FileMode.RENDER
            ).where(
            File.visibility == FileVisibility.PUBLIC
            ).where(
            File.as_guest == False
            ).where(
            File.password == ""
            ).where(
            (File.path.endswith(".html") | File.path.endswith(".htm"))
            )
    feed = [file.to_dict(show_content=False) for file in files]
    shuffle(feed)
    feed = feed[:100]
    return json.dumps({"feed": feed, "error": (len(feed)==0)}), 200, {"Content-type": "text/json"}

@public.route("/frames/default")
def frames_default():
    return """<style>*{font-family:font-family: 'Roboto', Arial, sans-serif;}
</style><center><h1>Welcome to HTMLify Frames</h1>
<h1>Use Up & Down button to watch Next/Previus Frame</h1>
<h1>Enjoy</h1></center>"""

# TODO: Improve the Process management
PROCESS_POOL = []
@public.get("/proc/<int:pid>")
def _proc_info(pid):
    global PROCESS_POOL
    for p in PROCESS_POOL:
        if p["pid"] == pid:
            ce = p["proc"]
            return jsonify({
                "pid": ce.pid,
                "termination-time": ce.termination_time,
                "running": ce.poll() is None,
            })
    return jsonify({}), 404

@public.post("/proc/<int:pid>/communicate")
def _proc_communicate(pid):
    ce = None
    for p in PROCESS_POOL:
        if p["pid"] == pid:
            process = p
            ce = p["proc"]
    if not ce:
        return jsonify({
            "error": True,
            "message": "process not found",
        }), 404
    if "api-key" in process:
        user = User.by_username(username=request.form.get("username", ""))
        if not user or not user.api_key == process["api-key"]:
            return jsonify({
                "error": True,
                "message": "you are not authenticated for this process"
            }), 403

    input = request.form.get("input")

    out, err = ce.communicate(input, 1)

    return jsonify({
        "stdout": out,
        "stderr": err,
        "running": ce.poll() is None,
        "pid": ce.pid,
        "termination-time": ce.termination_time,
    })


@public.route("/pastebin/<id>")
def pastebin_data(id):
    c = pastebin_fetch(id)
    if c: return c, {"Content-type": "text/plain charset=utf-8"}
    return "", 404


@public.route("/robots.txt")
def robots_txt():
    return "\n".join([
        "User-agent: *",
        "Disallow: /r/",
        "Disallow: /raw/",
        "Disallow: /pastebin/",
        "Disallow: /tmp/",
        "Sitemap: " + request.scheme + "://" + request.host+ "/map/xml",
    ]), 200, {"Content-type": "text/text"}

@public.route("/map/")
def sitemap():
    return "\n".join([
        "<a href='xml'>xml sitemap</a></br>",
        "<a href='txt'>txt sitemap</a></br>",
        "<a href='html'>html sitemap</a></br>",
    ])

@public.route("/map/xml")
def xml_sitemap():
    site = request.scheme + "://" + request.host
    xml = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n"""
    for user in User.select():
        xml += "<url>\n    <loc>" + site +"/"+ user.username + "</loc>\n</url>\n"
    for file in File.select():
        xml += "<url>\n    <loc>" + site +"/"+ escape_html(file.path) + "</loc>\n</url>\n"
    xml += "</urlset>"
    return xml, { "Content-Type": "text/xml" }

@public.route("/map/txt")
def txt_sitemap():
    site = request.scheme + "://" + request.host
    txt = ""
    for user in User.select():
        txt += site + "/" + user.username + "\n"
    for file in File.select():
        txt += site + "/" + file.path + "\n"
    if txt[-1] == "\n":
        txt = txt[:-1]
    return txt, { "Content-Type": "text/txt" }

@public.route("/map/html")
def html_sitemap():
    site = request.scheme + "://" + request.host
    html = ""
    for user in User.select():
        html += "<a href=\"" + site + "/" + user.username + "\">" + site + "/" + user.username + "</a><br>"
    for file in File.select():
        html += "<a href=\"" + site + "/" + file.path + "\">" + site + "/" + file.path + "</a><br>"
    return html

