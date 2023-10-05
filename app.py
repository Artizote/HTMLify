#HTMLify

from flask import *
from flask_sqlalchemy import *
from flask_migrate import *
from random import randint
from hashlib import md5
from os import remove, system, path
from datetime import datetime, timedelta
from re import sub, search, findall, compile
from requests import get
from pygments import highlight, lexers, formatters
from config import *



app = Flask(__name__)

app.secret_key = SECRET_KEY

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=28)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"

db = SQLAlchemy(app)

# flask migrate

migrate = Migrate(app, db)

# modals to be efined here

class users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True)
    password = db.Column(db.String(64))
    email = db.Column(db.String(128), unique=True)
    files = db.relationship("files", backref="users")
    quata = db.Column(db.Integer, default=0)
    comments = db.relationship("comments", backref="users")
    notifications = db.relationship("Notification", backref="users")
    
    #stars = db.relationship("files", backref="files")
    
    # --------- to be add, start system ------------- #
    
    @classmethod
    def get_user(users, username):
        return users.query.filter_by(username=username).first()
    
    def file_count(user):
        return files.query.filter_by(owner=user.username).count()
    
    def view_count(user):
        return sum([file.views for file in files.query.filter_by(owner=user.username).all()])
    
    #def notify(user, content, href):
#        n = Notification(user=user.username, content=content, href=content)
#        db.session.add(n)
#        db.session.commit()

class files(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    path = db.Column(db.String(1024), unique=True)
    content = db.Column(db.String())
    ext = db.Column(db.String(8))
    type = db.Column(db.String())
    owner = db.Column(db.String(64), db.ForeignKey("users.username"))
    size = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    mode = db.Column(db.String(1), default="r")
    # mode - showmode of the file  r | p | s
    # r - raw mode, show as plain text
    # p - parse mode, for html documents only
    # s - show mode, enable syntex highlighting
    visibility = db.Column(db.String(1), default="p")
    # p - public, show file to all users
    # h - hidden, hide file from other users
    # o - once, file can be only seen once then visiblity will chnage to h
    comments = db.relationship("comments", backref="files")
    password = db.Column(db.String(64), default="")
    #stared = db.Column("")
    # --------- to be add, start system ------------- #
    
    @classmethod
    def by_path(files, path):
        return files.query.filter_by(path=path).first()
    
    def sizef(file):
        size = file.size
        units = ["", "K", "M", "G"]
        degre = 0
        while size // 1024 > 0:
            degre += 1
            size //= 1024
        return str(size) + " " + units[degre] + "B"
    
    def highlighted(file):
        try:
            l = lexers.get_lexer_for_filename(file.name)
        except:
            l = lexers.get_lexer_for_filename("file.txt")
        return highlight(file.content, l, formatters.HtmlFormatter())

class comments(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file = db.Column(db.Integer, db.ForeignKey("files.id"))
    author = db.Column(db.String(64), db.ForeignKey("users.username"))
    content = db.Column(db.String())
    time = db.Column(db.DateTime, default=datetime.utcnow)
    # ------ to be imliment ---------#
    #  likes
    #  replies

class Token(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.String(32))
    ip = db.Column(db.String(), nullable=True)
    page = db.Column(db.String())
    
    
    @classmethod
    def generate(Token):
        t = randstr(32)
        page = request.url
        ip = request.remote_addr
        token = Token(value = t, page=page, ip=ip)
        with db.session.begin_nested():
            db.session.add(token)
            db.session.commit()
        return t
    
    @classmethod
    def verify(Token,token):
        Token.revoke()
        if token := Token.query.filter_by(value=token).first():
            Token.revoke(token.value)
            return True
            if token.page == request.url:
                db.session.delete(token)
                db.session.commit()
                return True
        return False
     
    @classmethod
    def revoke(Token, token=None):
        if t := Token.query.filter_by(value=token).first():
            db.session.delete(t)
            db.session.commit()
            return True
        token_count = Token.query.count()
        if  token_count > SESSION_TOKENS_LIMIT:
            tokens = Token.query.limit(token_count - SESSION_TOKENS_LIMIT).all()
            for token in tokens:
                db.session.delete(token)
            db.session.commit()
            return True
        return False


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.String(64), db.ForeignKey("users.username"))
    content = db.Column(db.String())
    href = db.Column(db.String())
    viewed = db.Column(db.Integer, default=0)
    # 0 -> not viewd
    # 1 -> viewd
    send_time = db.Column(db.DateTime,  default=datetime.utcnow)
    view_time = db.Column(db.DateTime, nullable=True)
    
    
    @classmethod
    def notify(ns, user, message, href):
        if not users.get_user(user): return None
        n = ns(user=user, content=message, href=href)
        db.session.add(n)
        db.session.commit()
    
    @classmethod
    def by_id(ns, id):
        return ns.query.filter_by(id=id).first()
    



reserved_root_paths = {
    "dashboard", "edit", "search",
    "file-upload", "delete", "raw",
    "registration", "action", "parse",
    "render", "archive", "trending",
    "api", "pygments.css", "sitemap",
    }



def filetype(ext):
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

def login_req(route):
    """login required decorator"""
    def w(*args):
        if not session.get("user"):
            return render_template("login.html", error="Log in require")
        return route(*args)    
    return w

def github_fetch(user, repo, branch, file):
    return "functnality not available yet"
    #doing fetching with git clone command
    system("git clone https://github.com/" + user + "/" + repo + ".git media")
    with open("media/" + repo + "/" + file, 'r') as f:
        content = f.read()
    return content
    
def pastebin_fetch(id):
    return get("https://pastebin.com/raw/" + id.replace("/", "")[-8:]).text
    
    """
    sample url: 
    https://api.github.com/repos/amanbabuhemant/mater
    download url:
    https://raw.githubusercontent.com/amanbabuhemant/mater/main/mater.py
    
    """
    file = file.replace("//", "/")
    if file[0] == "/": file = file[1:]
    
    url = "https://raw.githubusercontent.com/" + user + "/" + repo + "/" + branch + "/" + file
    r = get(url)
    
    if r.ok:
        return r.content
    return None
    
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
        result["weight"] = sum(file.content.count(w) for w in qs)
        result["weight"] += sum(file.name.count(w) for w in qs) * 2
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

@app.route('/pygments.css')
def serve_pygments_css():
    return Response(formatters.HtmlFormatter().get_style_defs(), mimetype='text/css')

@app.route("/")
def _home():
    _files = files.query.all()[::-1]
    return render_template("home.html", files=_files)

@app.route("/dashboard")
def _dashboard():
    if not session.get("user"): return redirect("/login")
    user = session["user"]["username"]
    _files = files.query.filter_by(owner=session["user"]["username"]).all()
    filepaths = [file.path[len(file.owner)+1:] for file in _files]
    return render_template("dashboard.html", filepaths=filepaths, user=user)

@app.route("/<username>")
def _usersites(username):
    username = username.lower()
    user = users.get_user(username)
    if not user:
        return "<center><h1>NO USER FOUND WIT NAME" + username + "</h1></center>", 404
    latest_comments = []
    for comment in comments.query.filter_by(author=username).order_by(comments.id.desc()).limit(8).all():
        try:
            latest_comments.append({
                "id": comment.id,
                "filepath": files.query.filter_by(id=comment.file).first().path
            })
        except:
            pass
    return render_template("profile.html", user=user, latest_comments=latest_comments)

@app.route("/<username>/<path:path>", methods=["GET", "POST"])
def _userfiles(username, path):
    username = username.lower()
    fullpath = username + "/" + path
    file = files.by_path(fullpath)
    if not file: return "404", 404
    
    
    if file.visibility == "h":
        if not session.get("user"):
            return "This file is hidden, please login if you are owner of this file.", 403
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
            session["passwords"][file.id] = password
    
    
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
    
    if file.mode == "r":
        if file.ext == "css":
            Response(file.content, mimetype='text/css')
        if file.ext == "js":
            Response(file.content, mimetype='text/js')
        return file.content, 200, {"Content-type": "text/plain charset=utf-8"}
    
    
    return render_template("file-show.html", file=file, token=Token.generate())

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
    return file.content, 200, {"Content-type": "text/plain charset=utf-8"}

@app.route("/pastebin/<id>")
def _pastebin_data(id):
    c = pastebin_fetch(id)
    if c: return c, {"Content-type": "text/plain charset=utf-8"}
    return "", 404

@app.route("/search")
def _search_page():
    q = request.args.get("q", "").lower()#.split(" ")
    page = request.args.get("p", 1)
    types = set(request.args.getlist("file-type"))
    
    #if not q: return redirect("/")
    q = q.replace("  ", " ")
    q = q.strip()
    
    if types == set({}):
        types = {"text", "image", "audio", "video", "document", "unknown"}
    
    if not q: return render_template("search-result.html", results=[])
    results = file_search(q, types)
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
        
    
    path = request.args.get("filepath", "")
    fullpath = session["user"]["username"] + "/" + path
    if file := files.query.filter_by(path=fullpath).first():
        if file.type in {"image", "video", "audio", "document", "unknown"}:
            return render_template("media-edit.html",title=file.name, path=file.path, filetype=file.type, current_mode=file.mode, current_visibility=file.visibility, password=file.password)
        content = file.content
        return render_template("edit.html",title=file.name, path=path, filecontent=content, filetype=file.ext, current_mode=file.mode, current_visibility=file.visibility, password=file.password)
    return render_template("edit.html",title="",  path=path, filetype=None, current_mode="r", current_visibility="p", password="")

@app.route("/file-upload")
def _file_upload():
    if not session.get("user"): return rnder_template("login.html")
    return render_template("file-upload.html")

@app.route("/delete", methods=["POST"])
def _confirm_delete():
    fullpath = request.form["path"]
    #fullpath = session["user"]["username"] + "/" + path
    file = files.query.filter_by(path=fullpath).first()
    if not file: return redirect("/dashboard")
    imagefiletypes = ["png", "jpg", "jpeg"]
    return render_template("conferm-delete.html", file=file, imagefietypes=imagefiletypes)

@app.route("/api/")
def _api_page():
    return "This is API endpoint root"

@app.route("/api/search")
def _api_search():
    q = request.args.get("q", "")
    if not q: return ""
    return file_search(q, filetypes=["text"]), 200, {"Content-type": "text/plain charset=utf-8"}

@app.route("/api/file")
def _api_file():
    id = int(request.args.get("id", 0))
    file = files.query.filter_by(id=id).first()
    if not file: return ""
    return file.content

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
    return render_template("notifications.html", notifications = ns)


@app.route("/notifications/<int:id>")
def _notifications_redirect(id):
    if not session.get("user"): redirect("/")
    n = Notification.by_id(id)
    if not n: return redirect("/notifications")
    if not n.viewed: session["user"]["notifications"] -= 1
    n.viewed = 1
    db.session.commit()
    
    return redirect(n.href)
    

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
    _file = request.files["file"]
    name = request.form.get("filename", _file.filename)
    
    if name == "":
        name = _file.filename
    ext = name.split(".")[-1]
    
    type = filetype(ext)
        
    filepath = session["user"]["username"] + "/" + name
    
    if type == "text":
        if files.by_path(session["user"]["username"]+"/"+name):
            rs = randstr(10)
            name = name[:-len(name.split("/")[-1])] + rs + "." + ext
            filepath = session["user"]["username"] + "/" + name
        
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
        return redirect("/file-upload")


    rs = randstr(10)
    sourcepath = "/media/" + rs + "." + ext
    if files.by_path(session["user"]["username"]+"/"+name):
        rs = randstr(10)
        name = name[:-len(name.split("/")[-1])] + rs + "." + ext
        filepath = session["user"]["username"] + "/" + name
        
    file = files(name=name, ext=ext, type=type, path=filepath, content=sourcepath, owner=session["user"]["username"])
    db.session.add(file)
    db.session.commit()
    _file.save(sourcepath[1:])
    
    return redirect("/file-upload")

@app.route("/action/edit", methods=["POST"])
def _action_edit():
    if not session.get("user"): return redirect("/")
    filepath = request.form.get("path")    
    filetitle = request.form.get("title", filepath.split("/")[-1])
    filecontent = request.form.get("filecontent")
    mode = request.form.get("mode", "r")
    visibility = request.form.get("visibility", "p")
    password = request.form.get("password", "")
    
    if filepath == "": filepath = randstr(10)
    if filepath[0] == "/":
        filepath = filepath[1:]
    
    path = session["user"]["username"] + "/" + filepath
    file = files.by_path(path)
    
    if file:
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
    ext = filepath.split(".")[-1]
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
    if file is None: return redirect("/dashboard")
    if session["user"]["username"] == file.owner:
        try:
            remove(file.content[1:])
        except:
            pass
        db.session.delete(file)
        db.session.commit()
    return redirect("/dashboard")
            
@app.route("/action/edit-media", methods=["POST"])
def _action_edit_media():
    if not session["user"]["username"]: return redirect("/")
    oldpath = session["user"]["username"] + "/" + request.form.get("oldname")
    filepath = session["user"]["username"] + "/" + request.form.get("filename")
    filepath = filepath.replace("//", "/")
    mode = request.form.get("mode", "r")
    visibility = request.form.get("visibility", "p")
    
    file = files.by_path(oldpath)
    if not file: return redirect("/dashboard")
    
    if files.by_path(filepath) and not files.by_path(filepath) is file:
        filepath = filepath[:-len(filepath.split("/")[-1])] + randstr(10) + "." + file.ext
    file.path = filepath
    file.name = filepath.split("/")[-1]
    file.mode = mode
    file.visibility = visibility
    db.session.commit()
    
    return redirect("/edit?filepath=" + filepath[len(file.owner)+1:])

@app.route("/action/comment", methods=["POST"])
def _action_comment():
    if not session.get("user"): return redirect("/login")
    file_id = request.form["file-id"]
    content = request.form["content"]
    token = request.form["token"]
    
    if not Token.verify(token): return redirect(request.headers.get('Referer', "/"))
    if set(content) == {" "}: return redirect(request.headers.get('Referer', "/"))
    
    content = escape_html(content)
    
    valid_tags = {"b", "u", "i", "s", "sub", "sup",
                  "B", "U", "I", "S", "SUB", "SUP"}
    
    for tag in valid_tags:
        content = content.replace("&lt;" + tag + "&gt;", "<" + tag + ">")
        content = content.replace("&lt;/" + tag + "&gt;", "</" + tag + ">")
    
    for tag in valid_tags:
        open_tags = content.count("<" + tag + ">")
        close_tags = content.count("</" + tag + ">")
        if open_tags > close_tags:
            content += ("</" + tag + ">") * (open_tags - close_tags)
    
    content = sub(r'@([\w/\.-]+)', r'<a href="/\1">@\1</a>', content)
    
    comment = comments(file=file_id, author=session["user"]["username"], content=content)
    
    mp = compile(r"@([\w\.-]+)")
    mentions = set(findall(mp, content))
    for mention in mentions:
        Notification.notify(mention, "<b>" +session["user"]["username"] + "</b> mentioned you in the comment", request.headers['Referer'] + "#comment-" + str(comment.id))
    
    file = files.query.filter_by(id=file_id).first()
    
    db.session.add(comment)
    db.session.commit()
    if file.owner != session["user"]["username"]:
        Notification.notify(file.owner, "<b>" + session["user"]["username"] + "</b> comment something on " + file.name, "/"+file.path + "#comment-" + str(comment.id))
    return redirect(request.headers.get('Referer', "/"))

if __name__ == "__main__":
    app.run(debug=True)