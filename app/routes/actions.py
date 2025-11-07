# actions

from flask import Blueprint, session, redirect, request

from os import remove, path
from datetime import datetime

from ..models import *
from ..utils import *

action = Blueprint("action", __name__, url_prefix="/action")

reserved_root_paths = {
    "dashboard", "edit", "search",
    "file-upload", "delete", "raw",
    "registration", "action", "parse",
    "render", "archive", "trending",
    "api", "pygments.css", "map",
    "src", "guest", "r",
    "revision", "frames", "robots.txt",
    "exec", "proc", "static",
    "login", "logout", "print"
    "clone", "tmp", "media"
    }

@action.route("/login", methods=["POST"])
def login():
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

@action.route("/registration", methods=["POST"])
def registration():
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

@action.route("/logout")
def logout():
    session["user"] = None
    return redirect("/")

@action.route("/upload", methods=["POST"])
def upload():
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
        #sourcepath = "/media/" + rs + "." + ext.replace("/", "")
        sourcepath = path.abspath(path.join("media", f"{rs}.{ext.replace('/', '')}"))
        if files.by_path(session["user"]["username"]+"/"+name):
            rs = randstr(10)
            name = name[:-len(name.split("/")[-1])] + rs + "." + ext
            filepath = session["user"]["username"] + "/" + dir + name
        
        _file.save(sourcepath)
        with open(sourcepath, 'rb') as f:
            filesize = sum(len(line) for line in f.readlines())
        
        file = files(name=name, ext=ext, type=type, path=filepath, content=f"/media/{sourcepath.split('/')[-1]}", size=filesize, owner=session["user"]["username"])
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

@action.route("/edit", methods=["POST"])
def edit():
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

@action.route("/delete", methods=["POST"])
def delete():
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
                 file_path = path.abspath(path.join(file.content[1:].split("/")))
                 remove(file_path)
             except:
                 pass
    revisions = Revision.query.filter_by(file=file.id).all()
    db.session.delete(file)
    for revision in revisions:
        db.session.delete(revision)
    db.session.commit()
    return redirect("/dashboard")

@action.route("/edit-media", methods=["POST"])
def edit_media():
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

@action.route("/comment", methods=["POST"])
def comment():
    if not session.get("user"): return redirect("/login")
    file_id = request.form["file-id"]
    content = request.form["content"]
    token = request.form["token"]
    
    if not Token.verify(token): return redirect(request.headers.get('Referer', "/"))

    comment = comments.comment(file_id, users.get_user(session["user"]["username"]).id, content)
    if not comment:
        return redirect("/")
    return redirect(request.headers.get('Referer', "/")+"#comment-"+str(comment.id))

@action.route("/git-clone", methods=["POST"])
def _git_clone():
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
