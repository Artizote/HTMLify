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
from models import *
from utils import *
from search_engine import *
from executors import *
from config import *



app = Flask(__name__)

app.secret_key = SECRET_KEY

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=28)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"

db.init_app(app)




reserved_root_paths = {
    "dashboard", "edit", "search",
    "file-upload", "delete", "raw",
    "registration", "action", "parse",
    "render", "archive", "trending",
    "api", "pygments.css", "map",
    "src", "guest", "r",
    "revision", "frames", "robots.txt",
    "exec", "proc",
    }




@app.route('/pygments.css')
def serve_pygments_css():
    return Response(formatters.HtmlFormatter().get_style_defs(), mimetype='text/css')

@app.route("/", methods=["GET", "POST"])
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

@app.route("/dashboard")
def _dashboard():
    if not session.get("user"): return redirect("/login")
    user = session["user"]["username"]
    _files = files.query.filter_by(owner=session["user"]["username"]).all()
    filepaths = map(lambda f:f.path, _files)
    pwd = user+"/"+request.args.get("dir", "")
    current_paths = []
    for filepath in filepaths:
        if filepath.startswith(pwd):
            current_path = filepath[len(pwd):]
            if "/" in current_path:
                current_path = current_path[:current_path.find("/", current_path.find("/"))+1]
            if current_path in current_paths:
                continue
            current_paths.append(current_path)
    session["user"]["notifications"] = Notification.query.filter_by(user=user).filter_by(viewed=0).count()
    return render_template("dashboard.html", filepaths=current_paths, user=user, dir=request.args.get("dir", ""))

@app.route("/<username>")
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

@app.route("/<username>/<path:path>", methods=["GET", "POST"])
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
            return send_from_directory("media", file.content[7:])
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
    for e in executors:
        if not e in _executors:
            _executors.append(e)

    return render_template("file-show.html", file=file, executors=_executors, token=Token.generate())

@app.route("/raw/<path:path>")
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
        return send_from_directory("media", file.content[7:])
    if file.ext == "css":
        return Response(file.content, mimetype='text/css')
    if file.ext == "js":
        return Response(file.content, mimetype='text/js')        
    return file.content, 200, {"Content-type": "text/plain charset=utf-8"}

@app.route("/src/<path:path>")
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
    
    return render_template("file-show.html", file=file, token=Token.generate())


@app.route("/pastebin/<id>")
def _pastebin_data(id):
    c = pastebin_fetch(id)
    if c: return c, {"Content-type": "text/plain charset=utf-8"}
    return "", 404

@app.route("/r", methods=["GET", "POST"])
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

@app.route("/r/<shortcode>")
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

@app.route("/revision/<int:id>")
def _revision(id):
    if not "user" in session.keys():
        return redirect("/login")
    revision = Revision.get(id)
    if not revision:
        return redirect("/dashboard")
    r_file_owner = files.query.filter_by(id=revision.file).first().owner
    if r_file_owner != session["user"]["username"]:
        return redirect("/dashboard")
    return render_template("revision.html", revision=revision)

@app.route("/revision/restore", methods=["POST"])
def _restore_revision():
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


@app.route("/search", methods=["GET", "POST"])
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

@app.route("/media/dp/<username>.jpg")
def _dp(username):
    username = username.lower()
    try:
        open("media/dp/" + username + ".jpg").close()
        return send_from_directory("media/dp/", username + ".jpg")
    except:
        pass
    user = users.query.filter_by(username=username).first()
    if not user: return "File not found", 404
    hash = md5(user.email.encode()).hexdigest()
    gravatar_url = "https://gravatar.com/avatar/" + hash + "?d=retro"
    dp = get(gravatar_url).content
    with open("media/dp/" + username + ".jpg", "wb") as f: f.write(dp)
    return send_from_directory("media/dp/",  username + ".jpg")

@app.route("/media/svg/<filename>")
def _svg(filename):
    return send_from_directory("media/svg", filename)

@app.route("/edit", methods=["GET", "POST"])
def _edit_file():
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

@app.route("/file-upload")
def _file_upload():
    if not session.get("user"): return rnder_template("login.html")
    return render_template("file-upload.html", directories=files.get_directory_tree(session["user"]["username"]))

@app.route("/delete", methods=["POST"])
def _confirm_delete():
    fullpath = request.form["path"]
    #fullpath = session["user"]["username"] + "/" + path
    file = files.query.filter_by(path=fullpath).first()
    if not file: return redirect("/dashboard")
    imagefiletypes = get_extentions("image")
    return render_template("conferm-delete.html", file=file, imagefietypes=imagefiletypes, token=Token.generate())

@app.route("/frames")
def _frames():
    return render_template("frames.html")

@app.route("/frames/feed")
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

@app.route("/frames/default")
def _frames_default():
    return """<style>*{font-family:font-family: 'Roboto', Arial, sans-serif;}
</style><center><h1>Welcome to HTMLify Frames</h1>
<h1>Use Up & Down button to watch Next/Previus Frame</h1>
<h1>Enjoy</h1></center>"""

PROCESS_POOL = []
@app.get("/proc/<int:pid>")
def _proc_info(pid):
    global PROCESS_POOL
    for p in PROCESS_POOL:
        if p["pid"] == pid:
            ce = p["proc"]
            return jsonify({
                "pid": ce.pid,
                "termination-time": ce.termination_time,
                "runnig": ce.poll() is None,
            })
    return jsonify({}), 404

@app.post("/proc/<int:pid>/communicate")
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
        "runing": ce.poll() is None,
        "pid": ce.pid,
        "termination-time": ce.termination_time,
    })

@app.route("/api/")
def _api_page():
    if  session.get("user"):
        api_key = users.get_user(session["user"]["username"]).api_key
    else:
        api_key = "Please <a href=\"/login\">Login</a> to get your API Key"
    ef = json.load(open("endpoints.json"))
    endpoints = ef["endpoints"]
    status_codes = ef["status-codes"]
    return render_template("api-root.html", endpoints=endpoints, status_codes=status_codes, api_key=api_key)

@app.route("/api/embed")
def _api_embed():
    id = request.args.get("id")
    if not id:
        return ""
    file = files.query.filter_by(id=id).first()
    if not file or file.type != "text" or file.visibility != "p":
        return "", 404
    return render_template("embed.html", highlight_style=formatters.HtmlFormatter().get_style_defs(), file=file)

@app.route("/api/search")
def _api_search():
    q = request.args.get("q", "")
    if not q: return ""
    results = query(q)
    response = {
        "result-count": len(results),
        "results": results
    }
    return  json.dumps(response),200, {"Content-type": "text/json charset=utf-8"}

@app.route("/api/file")
def _api_file():
    id = int(request.args.get("id", 0))
    file = files.query.filter_by(id=id).first()
    if not file:
        return json.dumps({"error":"file not found"}), 404, {"Content-type": "text/json charset=utf-8"}
    responce = {
        "type": file.type,
        "title": file.name,
        "url": request.scheme + "://" + request.host + "/" + file.path,
        "content": file.content if file.type == "text" else None,
        "size": file.size,
        "owner": file.owner if not file.as_guest else None,
    }
    return json.dumps(responce), 200, {"Content-type": "text/json charset=utf-8"}

@app.route("/api/paste", methods=["POST"])
@app.route("/api/create", methods=["POST"])
def _api_paste():
    api_key = request.form.get("api-key")
    username = request.form.get("username").lower()
    filecontent = request.form.get("content")
    filetitle = request.form.get("title")
    path = request.form.get("path")
    file_extention = request.form.get("ext", "txt")
    as_guest = request.form.get("as-guest", "False")
    password = request.form.get("password", "")
    mode = request.form.get("mode", "s")
    visibility = request.form.get("visibility", "p")

    if as_guest == "False":
        as_guest = False
    else:
        as_guest = True

    if not all([api_key, filecontent, username]):
        return json.dumps({"error":"Required arguments not provoded"}), 403
    user= users.query.filter_by(username=username).first()
    if not user:
        return json.dumps({"error":"User not find with given username"}), 403
    if user.api_key != api_key:
        return json.dumps({"error":"API key did not match"}), 403
    if as_guest:
        path  = "guest/" + randstr(10) +"."+ file_extention
        while files.by_path(path):
            path = "guest/" + randstr(10) +"."+ file_extention
        if not filetitle:
            filetitle = path.split("/")[-1]
        session["last-selected-extention"] = file_extention
        file = files(
            path=path,
            name=filetitle,
            ext=file_extention.replace(".", ""),
            content=filecontent,
            size=len(filecontent),
            mode=mode,
            visibility=visibility,
            type="text",
            password=password,
            as_guest = True,
            owner = user.username,
        )
        db.session.add(file)
        db.session.commit()
        return json.dumps({
            "url":request.scheme+"://"+request.host+"/"+path,
            "id": file.id,
        })
    else:
        if not path:
            return json.dumps({
                "error": "path is not provided",
            }), 505, {"Content-type": "text/json charset=utf-8"}
        if path[0] == "/":
            path = path[1:]
        path = username + "/" + path
        if not filetitle:
            filetitle = path.split("/")[-1]

        if file := files.query.filter_by(path=path).first():
            print(file.id)
            print(file.path)
            return (json.dumps({"error": "File already exists at spasified path,\
                    use /api/edit if you want to edit content"}), 400,
                    {"Content-type": "text/json charset=utf-8"})


        file = files(
            path=path,
            name=filetitle,
            ext=file_extention.replace(".", ""),
            content=filecontent,
            size=len(filecontent),
            mode=mode,
            visibility=visibility,
            type="text",
            password=password,
            owner=user.username,
        )
        db.session.add(file)
        db.session.commit()

        return json.dumps({
            "url":request.scheme+"://"+request.host+"/"+path,
            "id": file.id,
        }), 201, {"Content-type": "text/json charset=utf-8"}

    return json.dumps({"error": "chek your arguments"}), 505, {"Content-type": "text/json charset=utf-8"}

@app.route("/api/delete", methods=["POST"])
def _api_delete():
    api_key = request.form.get("api-key", "")
    username = request.form.get("username", "").lower()
    id = int(request.form.get("id", 0))
    user = users.get_user(username)
    if not all([api_key, user]):
        return "", 403
    if user.api_key != api_key:
        return ""
    file = files.query.filter_by(id=id).first()
    if not file:
        return json.dumps({"error":"file not found"}), 404, {"Content-type": "text/json encoding=utf-8"}
    if file.owner != user.username:
        return json.dumps({"error":"not the owner of file"}), 404, {"Content-type": "text/json encoding=utf-8"}
    db.session.delete(file)
    db.session.commit()
    return json.dumps({"succes":"file deleted"}), 200, {"Content-type": "text/json encoding=utf-8"}

@app.route("/api/edit", methods=["POST"])
def _api_edit():
    username = request.form.get("username", "").lower()
    api_key = request.form.get("api-key", "")
    id = int(request.form.get("id", "0"))
    new_content = request.form.get("content", "")

    if not all([username, api_key, id, new_content]):
        return json.dumps({"error":"Required arguments not provided"}), 200, {"Content-type": "text/json encoding=utf-8"}

    user = users.get_user(username)
    if not user or user.api_key != api_key:
        return json.dumps({"error":"Invelid Credidentals"}), 200, {"Content-type": "text/json encoding=utf-8"}

    file = files.query.filter_by(id=id).first()

    if not file or file.owner != user.username:
        return json.dumps({"error":"File Not Found"}), 200, {"Content-type": "text/json encoding=utf-8"}

    file.content = new_content
    file.size = len(new_content)
    db.session.commit()

    return json.dumps({"success": str(len(new_content))+" bytes written"}), 200, {"Content-type": "text/json encoding=utf-8"}

@app.route("/api/shortlink")
def _api_shortlink():
    shortlink = None
    if id := request.args.get("id"):
        shortlink = ShortLink.query.filter_by(id=id).first()
        if not shortlink:
            return json.dumps({"error":"ShorLink Not Found"}), 200, {"Content-type": "text/json encoding=utf-8"}
    if url := request.args.get("url"):
        shortlink = ShortLink.get(ShortLink.create(url))
    if shortcode := request.args.get("shortcode"):
        shortlink = ShortLink.get(shortcode)
    if not shortlink:
            return json.dumps({"error":"Invalid Arguments"}), 200, {"Content-type": "text/json encoding=utf-8"}
    res = {
        "id": shortlink.id,
        "href": shortlink.href,
        "hits": shortlink.visits,
        "shortcode": shortlink.short,
        "url": request.scheme + "://" + request.host+ "/r/" + shortlink.short,
    }
    return json.dumps(res), 200, {"Content-type": "text/json encoding=utf-8"}

@app.route("/api/notifications", methods=["POST"])
def _api_notifications():
    username = request.form.get("username", "")
    api_key= request.form.get("api-key", "")
    if not all([username, api_key]):
        res = {
            "error": True,
            "message": "Credidentals not provided"
        }
        return json.dumps(res), 401
    user = users.query.filter_by(username=username, api_key=api_key).first()
    if not user:
        res = {
            "error": True,
            "message": "Invalid Credidentals"
        }
        return json.dumps(res), 401
    if id := int(request.form.get("id", 0)):
        n = Notification.query.filter_by(id=id).first()
        if n and n.user == user.username:
            res = {
                "error": False,
                "id": n.id,
                "user": n.user,
                "content": n.content,
                "href": n.href,
                "seen": bool(n.viewed),
                "time": n.send_time,
                "status-code": 0
            }
        else:
            res = {
                "error": True,
                "status-code": 6,
                "message": "Notification not found"
            }
        return json.dumps(res), 200
    if markseen := int(request.form.get("markseen", 0)):
        n = Notification.query.filter_by(id=markseen).first()
        if n and n.user == user.username:
            n.viewd = 1
            n.view_time = datetime.utcnow()
            db.session.commit(n)
            res = {
                "error": False,
                "status-code": 0,
            }
            return json.dumps(res), 200
        res = {
            "error": True,
        }
        return json.dumps(res), 400

    ns = Notification.query.filter_by(user=username).all()
    res = {
        "error": False,
        "notification-count": len(ns),
        "notifications": [],
        "status-code": 0
    }
    for n in ns:
        res["notifications"].append({
            "id": n.id,
            "user": n.user,
            "content": n.content,
            "href": n.href,
            "seen": bool(n.viewed),
            "time": n.send_time,
        })
    Notification.purge(user.username)
    return json.dumps(res), 200

@app.route("/api/comment", methods=["POST"])
def _api_comment():
    user = users.filter_by(username=request.form.get("username", "")).first()
    if not user or user.api_key != request.form.get("api-key", ""):
        return json.dumps({
            "error": True,
            "message": "Inveluod Credidentals",
            "status-code": 3
        }), 401
    if id := int(request.form.get("id", 0)):
        comment = comments.filter_by(id=id).first()
        if not comment:
            return json.dumps({
                "error": True,
                "message": "Comment not found",
                "status-code": 6
            }), 401
        return json.dumps({
            "error": False,
            "id": comment.id,
            "file": comment.file,
            "author": comment.author,
            "status-code": 0,
        }), 200
    if delete := int(request.form.get("delete", 0)):
        comment = comments.filter_by(id=delete).first()
        if comment:
            if user.username != comment.author:
                return json.dumps({
                    "error": True,
                    "message": "Only author can delete comment",
                    "status-code": 3
                }), 401
            db.session.delete(comment)
            db.session.commit()
            return json.dumps({
                "error": False,
                "message": "comment deleted",
                "status-code": 0
            }), 200
        return json.dumps({
            "error": True,
            "message": "comment not found",
            "status-code": 6
        }), 404
    file = int(request.form.get("file", 0))
    content = request.form.get("content")
    if not content:
        return json.dumps({
            "error": True,
            "message": "comment can't be empty",
            "status-code": 2
        }), 200
    comment = comments.comment(file, user.id, content)
    if not comment:
        return json.dumps({
            "error": False,
            "message": "comment created succsessfuly",
            "status-code": 0
        }), 201
    return json.dumps({
        "error": False,
        "message": "comment content is invalid",
        "status-code": 3
    }), 400

@app.post("/api/exec")
def _api_exec():
    code = request.form.get("code")
    executor = request.form.get("executor")
    user = users.query.filter_by(username=request.form.get("username", "")).first()
    api_key = request.form.get("api-key", "")

    if not (code or executor):
        return jsonify({
            "error": True,
            "message": "code and executer is required",
            "status-code": 1
        })

    if user and user.api_key != api_key:
        user = None

    ce = execute(code, executor)
    if not ce:
        return jsonify({
            "error": True,
            "message": "process can't be start, check available executors",
            "status-code": 2
        })

    proc = {
        "proc": ce,
        "pid": ce.pid,
    }

    if api_key:
        proc["api-key"] = api_key

    global PROCESS_POOL
    PROCESS_POOL.append(proc)

    return jsonify({
        "error": False,
        "message": "process started",
        "status-code": 0,
        "pid": ce.pid
    })


@app.route("/robots.txt")
def _robots_txt():
    return ("""
User-agent: *
Disallow: /r/
Disallow: /raw/
Disallow: /pastebin/
Sitemap: """ + request.scheme + "://" + request.host+ "/map/xml",
200, {"Content-type": "text/text"})

@app.route("/map/")
def _map():
    return "<a href='xml'>xml sitemap</a>"

@app.route("/map/xml")
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

@app.route("/login")
def _login_page():
    error = request.args.get("error")
    return render_template("login.html", error=error, token=Token.generate())

@app.route("/registration")
def _registration_page():
    error = request.args.get("error")
    return render_template("registration.html", error=error, token=Token.generate())

@app.route("/notifications/")
def _notifications_page():
    if not session.get("user"): return redirect("/login")
    user = users.get_user(session["user"]["username"])
    ns = user.notifications
    notifications = Notification.query.filter_by(user=user.username).filter_by(viewed=0).count()
    session["user"]["notifications"] = notifications
    Notification.purge(user.username)
    return render_template("notifications.html", notifications = ns)


@app.route("/notifications/<int:id>")
def _notifications_redirect(id):
    if not session.get("user"): redirect("/")
    n = Notification.by_id(id)
    if not n: return redirect("/notifications")
    if not n.viewed: session["user"]["notifications"] -= 1
    n.viewed = 1
    n.view_time = datetime.utcnow()
    db.session.commit()
    
    return redirect(n.href)
    
@app.route("/git")
def _git_clone():
    if not session.get("user"):
        return redirect("/login")
    return render_template("git-clone.html")

@app.route("/action/login", methods=["POST"])
def _action_login():
    username = request.form.get("username").lower()
    password = request.form.get("password")
    token = request.form.get("token")
    
    if not Token.verify(token):
        return redirect("/login?error=Invalid session")
    
    if not users.query.filter_by(username = username).first():
        return redirect("/login?error=No user found")
    user = users.query.filter_by(username = username).first()
    if password != user.password:
        Notification.notify(username, "Failed login attempt at " + str(datetime.now()), "/notifications")
        return redirect("/login?error=Wrong Password")
    notifications = Notification.query.filter_by(user=user.username).filter_by(viewed=0).count()
    session["user"] = {"username": user.username, "id": user.id, "email": user.email, "quata": user.quata, "notifications": notifications}
    session.permanent = True
    return redirect("/dashboard")


@app.route("/action/registration", methods=["POST"])
def _action_registration():
    username = request.form.get("username").lower()
    password = request.form.get("password")
    repassword = request.form.get("repassword")
    email = request.form.get("email").lower()
    token = request.form.get("token")
    
    if not Token.verify(token):
        return redirect("/registration?error=Invalid session")
    
    if username in reserved_root_paths:
        return redirect("/registration?error=Username not available")
    
    if users.query.filter_by(username=username).first():
        return redirect("/registration?error=Username already taken, Try another")
    
    if users.query.filter_by(email=email).first():
        return redirect("/registration?error=Email already asignd with an acount")
    
    if password != repassword:
        return redirect("/registration?error=Confermation password does not match")
    
    valid_charset = "qwertyuiopasdfghjklzxcvbnm-_1234567890"
    if not all([c in valid_charset for c in username]):
        return redirect("/registration?error=Username is not valid")
    
    if len(username) < 4:
        return redirect("/registration?error=Username must have 4 letters")
    
    user = users(username = username, email=email, password=password, quata=1048576)
    db.session.add(user)
    db.session.commit()
    notifications = Notification.query.filter_by(user=user.username).filter_by(viewed=0).count()
    session["user"] = {"username": user.username, "id": user.id, "email": user.email, "quata": user.quata, "notifications": notifications}
    return redirect("/dashboard")

@app.route("/action/logout")
def _action_logout():
    session["user"] = None
    return redirect("/")

@app.route("/action/upload", methods=["POST"])
def _action_upload():
    if not session.get("user"): return redirect("/")
    _files = request.files.getlist("files")
    dir = request.form.get("dir", "")
    if dir and dir[-1] != "/":dir+="/"
    
    file_uploaded = 0
    left_over = []
    for _file in _files:
        if file_uploaded >= MAX_FILE_UPLOAD_LIMIT:
            left_over.append(_file.filename)
            continue
        
        file_uploaded += 1
        name = ""
        if len(_files) == 1:
            name = request.form.get("filename", _file.filename)
        
        if name == "":
            name = _file.filename
        ext = name.split(".")[-1].replace("/", "").lower()
        
        type = filetype(ext)
            
        filepath = session["user"]["username"] + "/" + dir + name
        
        if type == "text":
            if files.by_path(session["user"]["username"]+"/"+ dir +name):
                rs = randstr(10)
                name = name[:-len(name.split("/")[-1])] + rs + "." + ext
                filepath = session["user"]["username"] + "/" + dir + name
            
            file = files(name=name, ext=ext, type=type, path=filepath, owner=session["user"]["username"])
            t = "tempfile" + randstr(4)
            _file.save(t)
            try:
                with open(t, "r") as f:
                    file.content = f.read()
                    file.size = len(file.content)
            except:
                with open(t, "rb") as f:
                    file.content = f.read()
                    file.size = len(file.content)
            remove(t)
            db.session.add(file)
            db.session.commit()
            continue
            
        rs = randstr(10)
        sourcepath = "/media/" + rs + "." + ext.replace("/", "")
        if files.by_path(session["user"]["username"]+"/"+name):
            rs = randstr(10)
            name = name[:-len(name.split("/")[-1])] + rs + "." + ext
            filepath = session["user"]["username"] + "/" + dir + name
        
        _file.save(sourcepath[1:])
        with open(sourcepath[1:], 'rb') as f:
            filesize = sum(len(line) for line in f.readlines())
        
        file = files(name=name, ext=ext, type=type, path=filepath, content=sourcepath, size=filesize, owner=session["user"]["username"])
        db.session.add(file)
        db.session.commit()

    error_msg = ""
    if left_over:
        error_msg = ("only "+
        str(MAX_FILE_UPLOAD_LIMIT) + " files can be upladed at a time " +
        "you can reupload remain files again.<br>" +
        "these file are not uploaded, please reupload them:<br>"+
        ("<br>".join(left_over)) + "&dir="+dir)

    return redirect(("/file-upload?dir="+dir+
                    "&msg="+str(file_uploaded)+
                    " Files uploaded&error-msg="+error_msg))

@app.route("/action/edit", methods=["POST"])
def _action_edit():
    if not session.get("user"): return redirect("/")
    as_guest = request.form.get("asguest")
    file_extention = request.form.get("fileextension", ".txt")  # avaialable when as_guest
    filepath = request.form.get("path")
    if not as_guest:
        filetitle = request.form.get("title", filepath.split("/")[-1])
    else:
        filetitle = request.form.get("title")
    filecontent = request.form.get("filecontent")
    mode = request.form.get("mode", "r")
    visibility = request.form.get("visibility", "p")
    password = request.form.get("password", "")
    
    if as_guest and Token.verify(session.get("edit-token")):
        path  = "guest/" + randstr(10) +"."+ file_extention
        while files.by_path(path):
            path = "guest/" + randstr(10) +"."+ file_extention
        if not filetitle:
            filetitle = path.split("/")[-1]
        session["last-selected-extention"] = file_extention
        file = files(
            path=path,
            name=filetitle,
            ext=file_extention.replace(".", ""),
            content=filecontent,
            mode=mode,
            visibility=visibility,
            type="text",
            password=password,
            as_guest = True,
            owner = session["user"]["username"],
        )
        db.session.add(file)
        db.session.commit()
        return redirect("/"+path)


    if filepath == "": filepath = randstr(10)
    if filepath[0] == "/":
        filepath = filepath[1:]
    
    path = session["user"]["username"] + "/" + filepath
    file = files.by_path(path)
    
    if file:
        Revision.make_for(file)
        file.name = filetitle
        file.content = filecontent
        file.size = len(filecontent)
        file.mode = mode
        file.visibility = visibility
        file.password = password
        db.session.commit()
        return redirect("/edit?filepath=" + filepath)
    
    name = filetitle
    owner = session["user"]["username"]
    path = session["user"]["username"] + "/" + filepath
    ext = filepath.split(".")[-1].lower()
    type = filetype(ext)
    content = filecontent
    size = len(content)
    
    file = files(name=name, ext=ext, owner=owner, path=path, type=type, content=content, size=size, mode=mode, visibility=visibility, password=password)
    db.session.add(file)
    db.session.commit()
    return redirect("/edit?filepath=" + filepath)

@app.route("/action/delete", methods=["POST"])
def _action_delete():
    if not session.get("user"): return redirect("/")
    id = request.form["id"]
    file = files.query.filter_by(id=id).first()
    if not Token.verify(request.form.get("token", "")):
        return redirect("/")
    if file is None: return redirect("/dashboard")
    if session["user"]["username"] != file.owner:
        return redirect("/dashboard")
    if file.type != "text":
        same_media_files = files.query.filter_by(content=file.content).all()
        if len(same_media_files) > 1:
            #if all(same_file.type == "text" for same_file in same_media_files):
            #    try:
            #        remove(file.content[1:])
            #    except:
                    pass
        else:
             try:
                 remove(file.content[1:])
             except:
                 pass
    revisions = Revision.query.filter_by(file=file.id).all()
    db.session.delete(file)
    for revision in revisions:
        db.session.delete(revision)
    db.session.commit()
    return redirect("/dashboard")

@app.route("/action/edit-media", methods=["POST"])
def _action_edit_media():
    if not session["user"]["username"]: return redirect("/")
    oldpath = session["user"]["username"] + "/" + request.form.get("oldname")
    filepath = session["user"]["username"] + "/" + request.form.get("filename")
    filepath = filepath.replace("//", "/")
    filetitle = request.form.get("title", filepath.split("/")[-1])
    mode = request.form.get("mode", "r")
    visibility = request.form.get("visibility", "p")
    password = request.form.get("password")
    
    file = files.by_path(oldpath)
    if not file: return redirect("/dashboard")
    
    if files.by_path(filepath) and not files.by_path(filepath) is file:
        filepath = filepath[:-len(filepath.split("/")[-1])] + randstr(10) + "." + file.ext
    file.path = filepath
    file.name = filetitle
    file.mode = mode
    file.visibility = visibility
    file.password = password
    db.session.commit()
    
    return redirect("/edit?filepath=" + filepath[len(file.owner)+1:])

@app.route("/action/comment", methods=["POST"])
def _action_comment():
    if not session.get("user"): return redirect("/login")
    file_id = request.form["file-id"]
    content = request.form["content"]
    token = request.form["token"]
    
    if not Token.verify(token): return redirect(request.headers.get('Referer', "/"))

    comment = comments.comment(file_id, users.get_user(session["user"]["username"]).id, content)
    if not comment:
        return redirect("/")
    return redirect(request.headers.get('Referer', "/")+"#comment-"+str(comment.id))

@app.route("/action/git-clone", methods=["POST"])
def _action_git_clone():
    if not session.get("user"):
        return redirect("/")
    user = session["user"]["username"]
    repo = request.form.get("repo")
    mode = request.form.get("mode", 'r')
    visibility = request.form.get("visibility", 'p')
    dirc = request.form.get("directory", '')
    if not repo:
        return redirect("/dashboard")
    gitclone = git_clone(user, repo, dirc, mode, visibility)
    if not gitclone:
        return redirect("/git?msg=Check you input fields")
    return redirect("/dashboard")

if __name__ == "__main__":
    Thread(target=search_indexing_daemon, args=(TermFrequency, app, files), daemon=True).start()
    Thread(target=process_pool_purger, args=(PROCESS_POOL,), daemon=True).start()
    app.run(debug=True)
