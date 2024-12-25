#HTMLify

from flask import *
from random import randint, shuffle
from hashlib import md5
from os import remove, system, path
from datetime import datetime, timedelta
from re import sub, search, findall, compile
from requests import get
from pygments import highlight, lexers, formatters
from pathlib import Path
from threading import Thread
import json
from ..models import *
from ..utils import *
from ..search_engine import *
from ..executors import *
from ..config import *
from app.config import *

public = Blueprint("public", __name__)


@public.route('/pygments.css')
def serve_pygments_css():
    return Response(formatters.HtmlFormatter().get_style_defs(), mimetype='text/css')

@public.route("/", methods=["GET", "POST"])
def _home():
    _files = files.query.filter_by(as_guest=False).all()[::-1]
    if request.method == "POST":
        session["filter-file-modes"]=request.form.getlist("file-modes")
        session["filter-file-order"]=request.form.get("filter-order", "r")
    filterd_modes = session.setdefault("filter-file-modes", ["p", "s"])
    filterd_order = session.setdefault("filter-file-order", "r")
    filterd_files = list(filter(lambda file:file.mode in filterd_modes, _files))
    if filterd_order == "r":
        shuffle(filterd_files)
    elif filterd_order == "n":
        pass
    elif filterd_order == "o":
        filterd_files = filterd_files[::-1]
    return render_template("home.html", files=filterd_files[:MAX_FILES_ON_HOME])

@public.route("/<username>/")
def _usersites(username):
    username = username.lower()
    user = users.get_user(username)
    if not user:
        return "<center><h1>NO USER FOUND WIT NAME " + username + "</h1></center>", 404
    latest_comments = []
    for comment in comments.query.filter_by(author=username).order_by(comments.id.desc()).limit(8).all():
        try:
            latest_comments.append({
                "id": comment.id,
                "filepath": files.query.filter_by(id=comment.file).first().path
            })
        except:
            pass
    return render_template("profile.html", user=user, latest_comments=latest_comments, q="user:@"+user.username+" ")

@public.route("/<username>/<path:path>", methods=["GET", "POST"])
def _userfiles(username, path):
    username = username.lower()
    fullpath = username + "/" + path
    file = files.by_path(fullpath)
    if not file: return "404", 404
    
    if file.visibility == "h":
        if not session.get("user"):
            return "This file is hidden, please <a href=\"/login\">login</a> if you are owner of this file.", 403
        elif file.owner != session["user"]["username"]:
            return "This file is hidden.", 403
    
    if file.password:
        if "passwords" not in session: session["passwords"] = {}
        if request.method == "GET":
            password = session["passwords"].get(str(file.id), "")
            if password != file.password:
                return render_template("locked-file.html")
        if request.method == "POST":
            password = request.form["password"]
            if password != file.password:
                flash("Incorrect Password")
                return render_template("locked-file.html")
            session["passwords"][str(file.id)] = password
    
    file.views += 1
    if file.visibility == "o":
        file.visibility = "h"
    db.session.commit()
        
    if file.type in {"image", "audio", "video", "document", "unknown"}:
        if file.mode == "r":
            file_path = (Path("media") / file.content[7:]).absolute()
            return send_file(file_path)
        return render_template("file-show.html", file=file, token=Token.generate())
    
    if file.ext in {"html", "htm"}:
        if file.mode == "r":
            return file.content, 200, {"Content-type": "text/plain charset=utf-8"}
        elif file.mode == "p":
            return file.content
    
    if file.mode == 'r':
        if file.ext == "css":
            return Response(file.content, mimetype='text/css')
        if file.ext == "js":
            return Response(file.content, mimetype='text/js')
        return file.content, 200, {"Content-type": "text/plain charset=utf-8"}

    _executors = suggest_executors(file.path)
    for e in executors.values():
        if not e in _executors:
            _executors.append(e)

    return render_template("file-show.html", file=file, executors=_executors, token=Token.generate())

@public.route("/raw/<path:path>")
def _raw_file(path):
    file = files.by_path(path)
    if not file:
        return "File not found", 404
    if file.visibility == "h":
        if not session.get("user") or session["user"]["username"] != file.owner:
            return "File is hidden", 403
    
    if file.password:
        if "passwords" not in session: session["passwords"] = {}
        if request.method == "GET":
            password = session["passwords"].get(str(file.id), "")
            if password != file.password:
                return render_template("locked-file.html")
        if request.method == "POST":
            password = request.form["password"]
            if password != file.password:
                flash("Incorrect Password")
                return render_template("locked-file.html")
            session["passwords"][file.id] = password
    
    file.views += 1
    if file.visibility == "o":
        file.visibility = "h"
    db.session.commit()
    
    if file.type in {"image", "audio", "video", "document", "unknown"}:
        file_path = (Path("media") / file.content[7:]).absolute()
        return send_file(file_path)
    if file.ext == "css":
        return Response(file.content, mimetype='text/css')
    if file.ext == "js":
        return Response(file.content, mimetype='text/js')        
    return file.content, 200, {"Content-type": "text/plain charset=utf-8"}

@public.route("/src/<path:path>")
def _src_file(path):
    file = files.by_path(path)
    
    if not file:
        return "File not found", 404
    
    if file.visibility == "h":
        if not session.get("user") or session["user"]["username"] != file.owner:
            return "File is hidden by User, login if you are owner", 403
    
    if file.password:
        if "passwords" not in session: session["passwords"] = {}
        if request.method == "GET":
            password = session["passwords"].get(str(file.id), "")
            if password != file.password:
                return render_template("locked-file.html")
        if request.method == "POST":
            password = request.form["password"]
            if password != file.password:
                flash("Incorrect Password")
                return render_template("locked-file.html")
            session["passwords"][file.id] = password


    if file.visibility == "o":
        file.visibility == "h"
    file.views += 1
    db.session.commit()
    
    _executors = suggest_executors(file.path)
    for e in executors.values():
        if not e in _executors:
            _executors.append(e)

    return render_template("file-show.html", file=file, token=Token.generate(), executors=_executors)


@public.route("/pastebin/<id>")
def _pastebin_data(id):
    c = pastebin_fetch(id)
    if c: return c, {"Content-type": "text/plain charset=utf-8"}
    return "", 404

@public.route("/r", methods=["GET", "POST"])
def _link_shortner():
    shorted = url = None
    hits = None
    if request.method == "POST":
        url = request.form.get("url")
        if not url:
            flash("Please Enter URL")
            return render_template("link-shortner.html")
        shorted = ShortLink.create(url)
        hits = ShortLink.query.filter_by(href=url).first().visits
    return render_template("link-shortner.html", shorted=shorted, hits=hits, url=url)

@public.route("/r/<shortcode>")
def _short_redirection(shortcode):
    link = ShortLink.get(shortcode)
    if link:
        link.hit()
        while link.href.startswith("/r/"):
            l = ShortLink.query.filter_by(shortcode = link.href[3:])
            if not l:
                break
            link = l
        return redirect(link.href, 302)
    return "<h1>404</h1>", 404

@public.route("/search", methods=["GET", "POST"])
def _search_page():
    if request.method == "POST":
        session["filter-file-modes"]=request.form.getlist("file-modes")
    filterd_modes = session.setdefault("filter-file-modes", ["p", "s"])

    q = request.args.get("q", "").lower()
    page = request.args.get("p", 1)
    types = set(request.args.getlist("file-type"))
    
    q = q.replace("  ", " ")
    q = q.strip()
    
    if types == set({}):
        types = {"text", "image", "audio", "video", "document", "unknown"}
    
    if not q: return render_template("search-result.html", results=[])
    filterd_user = None
    if q.startswith("user:@"):
        filterd_user = q.split()[0].split("@")[-1]
        q = q.replace("user:@"+filterd_user+" ", "")
    #results = file_search(q, types)
    results = query(q)

    if filterd_user:
        results = list(filter(lambda r: r["owner"] == filterd_user, results))
        q = "user:@" + filterd_user + " "+q

    results = list(filter(lambda file:file["mode"] in filterd_modes, results))
    return render_template("search-result.html", results=results, page=page, q=q)

@public.route("/media/dp/<username>.jpg")
def _dp(username):
    username = username.lower()
    dp_path = path.abspath(path.join("media", "dp", f"{username}.jpg"))
    try:
        open(dp_path).close()
        return send_file(dp_path)
    except:
        pass
    user = users.query.filter_by(username=username).first()
    if not user: return "File not found", 404
    hash = md5(user.email.encode()).hexdigest()
    gravatar_url = "https://gravatar.com/avatar/" + hash + "?d=retro"
    dp = get(gravatar_url).content
    with open(dp_path, "wb") as f: f.write(dp)
    return send_file(dp_path)

@public.route("/media/svg/<filename>")
def _svg(filename):
    file_path = path.abspath(path.join("media", "svg", filename))
    return send_file(file_path)

@public.route("/frames")
def _frames():
    return render_template("frames.html")

@public.route("/frames/feed")
def _frame_feed():
    _files = list(filter(lambda f:f.ext in {"html", "htm"},
                    files.query
                  .filter_by(mode="p")
                  .filter_by(password="")
                  .filter_by(as_guest=False)
                  .order_by(files.views).all()))
    l = len(_files)
    shuffle(_files)
    feed = []
    server = request.scheme + "://" + request.host
    for file in _files[:128]:
        feed.append({
            "id": file.id,
            "url": "/" + file.path,
            "owner": file.owner,
            "title": file.name,
            "shortlink": server + "/r/" + file.shortlink(),
            "viewcount": file.views,
            "commentcount": len(file.comments),
        })
    return json.dumps({"feed": feed, "error": (len(feed)==0)}), 200, {"Content-type": "text/json"}

@public.route("/frames/default")
def _frames_default():
    return """<style>*{font-family:font-family: 'Roboto', Arial, sans-serif;}
</style><center><h1>Welcome to HTMLify Frames</h1>
<h1>Use Up & Down button to watch Next/Previus Frame</h1>
<h1>Enjoy</h1></center>"""

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
        user = users.query.filter_by(username=request.form.get("username", "")).first()
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



@public.route("/robots.txt")
def _robots_txt():
    return ("""
User-agent: *
Disallow: /r/
Disallow: /raw/
Disallow: /pastebin/
Sitemap: """ + request.scheme + "://" + request.host+ "/map/xml",
200, {"Content-type": "text/text"})

@public.route("/map/")
def _map():
    return "<a href='xml'>xml sitemap</a>"

@public.route("/map/xml")
def _map_xml():
    site = request.scheme + "://" + request.host
    xml = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n"""
    for user in users.query.all():
        xml += "<url>\n    <loc>" + site +"/"+ user.username + "</loc>\n</url>\n"
    for file in files.query.all():
        xml += "<url>\n    <loc>" + site +"/"+ escape_html(file.path) + "</loc>\n</url>\n"
    xml += "</urlset>"
    return Response(xml, mimetype="text/xml")

@public.route("/login")
def _login_page():
    error = request.args.get("error")
    return render_template("login.html", error=error, token=Token.generate())

@public.route("/registration")
def _registration_page():
    error = request.args.get("error")
    return render_template("registration.html", error=error, token=Token.generate())

