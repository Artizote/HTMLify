#HTMLify

from flask import *
from flask_migrate import *
from random import randint, shuffle
from hashlib import md5
from os import remove, system, path
from datetime import datetime, timedelta
from re import sub, search, findall, compile
from requests import get
from pygments import highlight, lexers, formatters
from pathlib import Path
from models import *
from utils import *
from config import *



app = Flask(__name__)

app.secret_key = SECRET_KEY

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=28)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"

db.init_app(app)

# flask migrate

migrate = Migrate(app, db)


reserved_root_paths = {
    "dashboard", "edit", "search",
    "file-upload", "delete", "raw",
    "registration", "action", "parse",
    "render", "archive", "trending",
    "api", "pygments.css", "map",
    "src", "guest", "r",
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
    return render_template("profile.html", user=user, latest_comments=latest_comments)

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

@app.route("/r/<shortcode>")
def _short_redirection(shortcode):
    link = ShortLink.get(shortcode)
    if link:
        link.hit()
        return redirect(link.href, 301)
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

        print("not id, out")
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
    results = file_search(q, types)

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
    imagefiletypes = ["png", "jpg", "jpeg"]
    return render_template("conferm-delete.html", file=file, imagefietypes=imagefiletypes)

@app.route("/api/")
def _api_page():
    html =  "<h1>This is API endpoint root</h1>"
    if "user" in session:
        user = users.get_user(session["user"]["username"])
        html += "You API KEY is: " + user.api_key + "<br>"
    else:
        html += "You are not login, login to get your API KEY"
    html += ""
    return html

@app.route("/api/embed")
def _api_embed():
    id = request.args.get("id")
    if not id:
        return ""
    file = files.query.filter_by(id=id).first()
    if not file or file.type != "text" or file.visibility != "p":
        return ""
    return "<style>"+formatters.HtmlFormatter().get_style_defs()+"</style>"+file.highlighted()

@app.route("/api/search")
def _api_search():
    q = request.args.get("q", "")
    if not q: return ""
    return file_search(q, filetypes=["text"]), 200, {"Content-type": "text/json charset=utf-8"}

@app.route("/api/file")
def _api_file():
    id = int(request.args.get("id", 0))
    file = files.query.filter_by(id=id).first()
    if not file: return ""
    return file.content

@app.route("/api/paste", methods=["POST"])
def _api_paste():
    api_key = request.form.get("api-key")
    username = request.form.get("username")
    filecontent = request.form.get("content")
    filetitle = request.form.get("title")
    file_extention = request.form.get("ext", "txt")
    as_guest = request.form.get("as_guest", "false")
    password = request.form.get("password", "")
    mode = request.form.get("mode", "s")
    visibility = request.form.get("visibility", "p")
    if as_guest == "false":
        as_guest = False
    else:
        as_guest = True
    if not any([api_key, filecontent, username]):
        return "", 403
    user= users.query.filter_by(username=username).first()
    if not user:
        return "", 403
    if user.api_key != api_key:
        return "", 403
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
            mode=mode,
            visibility=visibility,
            type="text",
            password=password,
            as_guest = True,
            owner = user.username,
        )
        db.session.add(file)
        db.session.commit()
        return str({
            "url":request.scheme+"://"+request.host+"/"+path,
            "id": file.id,
        })
    # TODO if not as guest making normal file
    return str({"error": "functnality not implimented yeat"}), 505

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
        xml += "<url>\n    <loc>" + site +"/"+ file.path + "</loc>\n</url>\n"
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
    db.session.delete(file)
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
    if set(content) == {" "}: return redirect(request.headers.get('Referer', "/"))
    
    content = escape_html(content).replace("\n", "<br>")

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
    
    file = files.query.filter_by(id=file_id).first()
    
    db.session.add(comment)
    db.session.commit()
    for mention in mentions:
        Notification.notify(mention, "<b>" +session["user"]["username"] + "</b> mentioned you in the comment", request.headers['Referer'] + "#comment-" + str(comment.id))
    if file.owner != session["user"]["username"]:
        Notification.notify(file.owner, "<b>" + session["user"]["username"] + "</b> comment something on " + file.name, "/"+file.path + "#comment-" + str(comment.id))
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
    app.run(debug=True)
