# api

import qrcode
from flask import Blueprint, session, render_template, jsonify, request, send_file
from pygments import formatters

import json
from datetime import datetime
from hashlib import sha256
from pathlib import Path

from ..models import *
from ..utils import *
from ..search_engine import query
from ..executors import execute
from .public import PROCESS_POOL

api = Blueprint("api", __name__, url_prefix="/api")


@api.route("/")
def page():
    if session.get("user"):
        api_key = users.get_user(session["user"]["username"]).api_key
    else:
        api_key = "Please <a href=\"/login\">Login</a> to get your API Key"
    ef = json.load(open("app/routes/api-endpoints.json"))
    endpoints = ef["endpoints"]
    status_codes = ef["status-codes"]
    return render_template("api-root.html", endpoints=endpoints, status_codes=status_codes, api_key=api_key)

@api.route("/embed")
def embed():
    id = request.args.get("id")
    if not id:
        return ""
    file = files.query.filter_by(id=id).first()
    if not file or file.type != "text" or file.visibility != "p":
        return "", 404
    return render_template("embed.html", highlight_style=formatters.HtmlFormatter().get_style_defs(), file=file)

@api.route("/search")
def search():
    q = request.args.get("q", "")
    if not q: return ""
    results = query(q)
    response = {
        "result-count": len(results),
        "results": results
    }
    return  json.dumps(response),200, {"Content-type": "text/json charset=utf-8"}

@api.route("/file")
def file():
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

@api.route("/paste", methods=["POST"])
@api.route("/create", methods=["POST"])
def paste():
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

@api.route("/delete", methods=["POST"])
def delete():
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

@api.route("/edit", methods=["POST"])
def edit():
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

@api.route("/shortlink")
def shortlink():
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

@api.route("/notifications", methods=["POST"])
def notifications():
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

@api.route("/comment", methods=["POST"])
def comment():
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

@api.post("/exec")
def exec():
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

@api.get("/qr")
def qr():
    url = request.args.get("url", "")
    if not url:
        return "URL NOT PROVIDED", 404
    from os import path
    qr_image_filepath = path.abspath(path.join("media", "qr", sha256(url.encode()).hexdigest()) + ".png")
    qr_image = qrcode.make(url)
    qr_image.save(qr_image_filepath)
    return send_file(qr_image_filepath)

@api.get("/tmp")
@api.get("/tmp-file")
def _get_tmp_file():
    code = request.args.get("code", "")
    if not code:
        return jsonify({})
    tf = TmpFile.by_code(code)
    if tf:
        return jsonify(tf.to_dict())
    return jsonify({})

@api.post("/tmp")
@api.post("/tmp-file")
def _create_tmp_file():
    file = request.files.get("file")
    name = request.form.get("name", "")
    expiry = request.form.get("expiry", 0, int)
    if not file:
        return jsonify({
            "error": True,
            "message": "file not provided",
        })
    tf = TmpFile.create_with_buffer(file)
    if not tf:
        return jsonify({
            "error": True,
            "message": "Some internal error accure",
        })
    tf.name = name or file.name or f"temp-file-{tf.code}"
    if expiry:
        print("expiry:", expiry)
        print("tf.expiry.timestamp", tf.expiry)
        if expiry < tf.expiry.timestamp():
            tf.expiry = datetime.fromtimestamp(expiry)
    tf.save()
    return jsonify({
        "error": False,
        "message": "File uploaded",
        "url": request.scheme + "://" + request.host + "/tmp/" + tf.code,
        "code": tf.code
    })

@api.get("/tmp-folder")
def _get_tmp_folder():
    code = request.args.get("code", "")
    if not code:
        return jsonify({})
    tf = TmpFolder.by_code(code)
    if not tf:
        return jsonify({})
    if auth_code := session.get("tmp-folder-auth-codes-"+tf.code):
        print("auth code found in session")
        data = tf.to_dict()
        data["auth-code"] = auth_code
        return jsonify(data)
    print("auth code not found in session")
    return jsonify(tf.to_dict())

@api.post("/tmp-folder")
def _create_tmp_folder():
    name = request.form.get("name", "")
    tf = TmpFolder.create(name=name)
    if not tf:
        return jsonify({
            "error": True,
            "message": "Temp folder cannot be created, try again",
        })
    session["tmp-folder-auth-codes-"+tf.code] = tf.auth_code # don't know why dict approach is not working
    return jsonify({
        "error": False,
        "message": "Temp folder created",
        "code": tf.code,
        "auth-code": tf.auth_code,
        "url": request.scheme + "://" + request.host + "/tmp/f/" + tf.code,
    })

@api.post("/tmp-folder-add")
def _add_to_tmp_folder():
    code = request.form.get("code", "")
    print("code:", code)
    auth_code = request.form.get("auth-code", "")
    print("auth_code:", auth_code)
    file_code = request.form.get("file-code", "")
    print("file_code:", file_code)
    if not code or not auth_code or not file_code:
        return jsonify({
            "error": True,
            "message": "Code, Auth Code, File Code is require",
        })
    tf = TmpFolder.by_code(code)
    if not tf:
        return jsonify({
            "error": True,
            "message": "Temp Folder not found",
        })
    if auth_code != tf.auth_code:
        return jsonify({
            "error": True,
            "message": "Auth code did not match",
        })
    tf.add_file(file_code)
    return jsonify({
        "error": False,
        "message": "",
    })

@api.post("/tmp-folder-remove")
def _remove_from_tmp_folder():
    code = request.form.get("code", "")
    auth_code = request.form.get("auth-code", "")
    file_code = request.form.get("file-code", "")
    if not code or not auth_code or not file_code:
        return jsonify({
            "error": True,
            "message": "Code, Auth Code, File Code is require",
        })
    tf = TmpFolder.by_code(code)
    if not tf:
        return jsonify({
            "error": True,
            "message": "Temp Folder not found",
        })
    if auth_code != tf.auth_code:
        return jsonify({
            "error": True,
            "message": "Auth code did not match",
        })
    tf.remove_file(file_code)
    return jsonify({
        "error": False,
        "message": "",
    })

