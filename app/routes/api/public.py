from flask import Blueprint, request, render_template, g, send_file, session
from pygments.formatters import HtmlFormatter
from qrcode import make as make_qr

import binascii

from app.search_engine import query
from app.executors import execute
from app.utils import hash_sha256, file_path
from app.models import *
from .errors import APIErrors, error_respones_dict


public_api = Blueprint("public", __name__)


@public_api.before_request
def before_requesnt():
    # cheking authorized user
    g.auth_user = None
    header = request.headers.get("Authorization")
    if header:
        if header.startswith("Bearer "):
            api_key = header.split()[-1]
            g.auth_user = User.by_api_key(api_key)
    


@public_api.get("/embed")
def _embed():
    id = request.args.get("id", 0, int)
    file = File.by_id(id)
    if not file or file.type != FileType.TEXT or file.visibility != FileVisibility.PUBLIC:
        return "file not found", 404
    return render_template("embed.html", highlight_style=HtmlFormatter().get_style_defs(), file=file)

@public_api.get("/search")
def _search():
    q = request.args.get("q")

    if not q:
        return error_respones_dict(APIErrors.MISSING_PARAMETERS)

    results = query(q)
    return {
        "success": True,
        "result-count": len(results),
        "results": results
    }

@public_api.get("/blob")
def _get_blob():
    hash = request.args.get("hash", "")
    blob = Blob[hash]
    if not blob:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    return {
        "success": True,
        "blob": blob.to_dict()
    }

@public_api.get("/file")
def _get_file():
    id = request.args.get("id")
    path = request.args.get("path")
    password = request.args.get("password") or request.headers.get("X-Password")

    if id == None and path == None:
        return error_respones_dict(APIErrors.MISSING_PARAMETERS)

    if id:
        file = File.by_id(id)
    else:
        file = File.by_path(path)

    if not file:
        return error_respones_dict(APIErrors.NOT_FOUND)

    if file.visibility != FileVisibility.PUBLIC:
        if not g.auth_user or file.user_id != g.auth_user.id:
            return error_respones_dict(APIErrors.UNAUTHORIZED)

    if password and file.is_locked:
        file.unlock(password)

    if g.auth_user and file.user.id == g.auth_user.id:
        file.unlock_without_password()

    if file.is_locked:
        return error_respones_dict(APIErrors.UNAUTHORIZED)

    return {
        "success": True,
        "file": file.to_dict()
    }

@public_api.post("/file")
def create_file():
    if not g.auth_user:
        return error_respones_dict(APIErrors.UNAUTHORIZED), 401

    json = request.get_json()
    if not json:
        return error_respones_dict(APIErrors.MISSING_JSON), 400

    path = json.get("path", "")
    encoded_content = json.get("content")
    title = json.get("title", path.split("/")[-1])
    password = json.get("password", "")
    visibility = json.get("visibility", FileVisibility.PUBLIC)
    mode = json.get("mode", FileMode.RENDER)
    as_guest = json.get("as_guest", False)

    if (not path and not as_guest) or not encoded_content:
        return error_respones_dict(APIErrors.MISSING_PARAMETERS), 400

    if as_guest:
        path = File.new_guest_path(path)

    if not as_guest:
        path_parts = path.split("/")
        if len(path_parts) < 3:
            return error_respones_dict(APIErrors.INVALID_PARAMETERS)
        if path_parts[1] != g.auth_user.username:
            return error_respones_dict(APIErrors.FORBIDDEN), 403

    if path.endswith("/"):
        path = path[:-1]

    if not path.startswith("/"):
        path = "/" + path

    if not File.is_valid_filepath(path):
        return error_respones_dict(APIErrors.INVALID_PARAMETERS)

    _file = File.by_path(path)
    if _file:
        return error_respones_dict(APIErrors.ALREADY_EXISTS), 409

    try:
        blob = Blob.from_base64(encoded_content)
    except binascii.Error:
        return error_respones_dict(APIErrors.INVALID_DATA), 400
    except:
        return error_respones_dict(APIErrors.INTERNAL_ERROR), 500

    try:
        file : File = File.create(
            path = path,
            title = title,
            user_id = g.auth_user.id,
            blob_hash = blob.hash,
            password = password,
            as_guest = as_guest
        )
    except:
        return error_respones_dict(APIErrors.INTERNAL_ERROR), 500

    file.set_visibility(visibility)
    file.set_mode(mode)

    return {
        "success": True,
        "file": file.to_dict()
    }

@public_api.patch("/file")
def update_file():
    if not g.auth_user:
        return error_respones_dict(APIErrors.UNAUTHORIZED), 401

    id = request.args.get("id", 0, int)

    file = File.by_id(id)
    if not file:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    if file.user != g.auth_user:
        return error_respones_dict(APIErrors.FORBIDDEN), 403

    json = request.get_json()
    if not json:
        return error_respones_dict(APIErrors.MISSING_JSON)

    path = json.get("path")
    overwrite = json.get("overwrite", False)
    title = json.get("title")
    password = json.get("password", "")
    mode = json.get("mode")
    visibility = json.get("visibility")
    encoded_content = json.get("content")

    if encoded_content:
        try:
            blob = Blob.from_base64(encoded_content)
        except binascii.Error:
            return error_respones_dict(APIErrors.INVALID_DATA)
        except:
            return error_respones_dict(APIErrors.INTERNAL_ERROR)

        file.content = blob
        file.save()

    if visibility:
        file.set_visibility(visibility)

    if mode:
        file.set_mode(mode)

    file.set_password(password)

    if title:
        file.title = title
        file.save()

    if path:
        path_parts = path.split("/")
        if len(path_parts) < 3:
            return error_respones_dict(APIErrors.INVALID_PARAMETERS)
        if path_parts[1] != g.auth_user.username:
            return error_respones_dict(APIErrors.FORBIDDEN), 403

        _file = File.by_path(path)
        if _file and not overwrite:
            return error_respones_dict(APIErrors.ALREADY_EXISTS), 409
        if _file and overwrite:
            _file.delete_instance()
        file.path = path
        file.save()

    file.update_modified_time()

    return {
        "success": True,
        "file": file.to_dict()
    }

@public_api.delete("/file")
def _delete_file():
    if not g.auth_user:
        return error_respones_dict(APIErrors.UNAUTHORIZED), 401

    id = request.args.get("id", 0, int)

    file = File.by_id(id)
    if not file:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    if file.user.id != g.auth_user.id:
        return error_respones_dict(APIErrors.FORBIDDEN), 403

    file.delete_instance()
    return {
        "success": True
    }

@public_api.route("/shortlink")
def shortlink():
    id = request.args.get("id")
    short = request.args.get("short")
    url = request.args.get("url")

    if not id and not url:
        return error_respones_dict(APIErrors.MISSING_PARAMETERS), 400

    shortlink = None
    if id:
        shortlink = ShortLink.by_id(id)
    if short:
        shortlink = ShortLink.by_short(id)
    if url:
        shortlink = ShortLink.create(url)

    if not shortlink:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    return {
        "success": True,
        "shortlink": shortlink.to_dict(),
        "url": shortlink.to_dict()["url"],
        "short": shortlink.short
    }

@public_api.get("/notification")
def _get_notification():
    if not g.auth_user:
        return error_respones_dict(APIErrors.UNAUTHORIZED), 401

    id = request.args.get("id", 0, int)

    notification = Notification.by_id(id)
    if not notification:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    if notification.user_id != g.auth_user.id:
        return error_respones_dict(APIErrors.FORBIDDEN), 403

    return {
        "success": True,
        "notification": notification.to_dict()
    }

@public_api.patch("/notification")
def _markview_notification():
    if not g.auth_user:
        return error_respones_dict(APIErrors.UNAUTHORIZED), 401

    id = request.args.get("id", 0, int)

    notification = Notification.by_id(id)
    if not notification:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    if notification.user_id != g.auth_user.id:
        return error_respones_dict(APIErrors.FORBIDDEN), 403

    notification.mark_viewed()

    return {
        "success": True,
        "notification": notification.to_dict()
    }

@public_api.get("/notifications")
def _get_notifications():
    if not g.auth_user():
        return error_respones_dict(APIErrors.UNAUTHORIZED), 401
    
    notifications = Notification.select().where(Notification.user_id==g.auth_user.id)

    return {
        "success": True,
        "notifications": [n.to_dict() for n in notifications]
    }

@public_api.get("/comment")
def _get_comment():
    id = request.args.get("id", 0, int)

    comment = Comment.by_id(id)
    if not comment:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    if comment.file.visibility != FileVisibility.PUBLIC:
        if not g.auth_user:
            return error_respones_dict(APIErrors.UNAUTHORIZED), 401
        if not (comment.user == g.auth_user or comment.file.user == g.auth_user):
            return error_respones_dict(APIErrors.FORBIDDEN), 403

    return {
        "success": True,
        "comment": comment.to_dict()
    }

@public_api.post("/comment")
def _create_comment():
    if not g.auth_user:
        return error_respones_dict(APIErrors.UNAUTHORIZED), 401

    json = request.get_json()
    if not json:
        return error_respones_dict(APIErrors.MISSING_JSON), 400

    try:
        file_id = int(json.get("file_id"))
    except:
        return error_respones_dict(APIErrors.INVALID_DATA), 400
    content = json.get("content")

    file = File.by_id(file_id)
    if not file:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    comment = Comment.comment(file_id, g.auth_user.id, content)
    if comment:
        return {
            "success": True,
            "comment": comment.to_dict()
        }
    return error_respones_dict(APIErrors.INVALID_DATA), 400

@public_api.delete("/comment")
def _delete_comment():
    if not g.auth_user:
        return error_respones_dict(APIErrors.UNAUTHORIZED), 401

    id = request.args.get("id", 0, int)

    comment = Comment.by_id(id)
    if not comment:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    if comment.user != g.auth_user:
        return error_respones_dict(APIErrors.FORBIDDEN), 403

    comment.delete_instance()

    return {
        "success": True
    }

# TODO: Make process pool part of executor module
PROCESS_POOL = []
@public_api.post("/exec")
def _start_exec():
    json = request.get_json()
    if not json:
        return error_respones_dict(APIErrors.MISSING_JSON)

    code = json.get("code")
    executor = json.get("code")
    user = g.auth_user
    api_key = user.api_key if user else None

    if not (code or executor):
        return error_respones_dict(APIErrors.MISSING_PARAMETERS)

    ce = execute(code, executor)
    if not ce:
        return error_respones_dict(APIErrors.INVALID_PARAMETERS)

    proc = {
        "proc": ce,
        "pid": ce.pid,
    }

    if api_key:
        proc["api-key"] = api_key

    global PROCESS_POOL
    PROCESS_POOL.append(proc)

    return {
        "success": True,
        "message": "process started",
        "status-code": 0,
        "pid": ce.pid
    }

@public_api.get("/qr")
def _create_qr():
    url = request.args.get("url", "")
    text = request.args.get("text", url)
    qr_image_filepath = file_path("qr", hash_sha256(text) + ".png")
    qr_image = make_qr(text)
    qr_image.save(qr_image_filepath)
    return send_file(qr_image_filepath)

@public_api.get("/tmp")
@public_api.get("/tmpfile")
def _get_temp_file():
    code = request.args.get("code")
    if not code:
        return error_respones_dict(APIErrors.MISSING_PARAMETERS)
    tf = TmpFile.by_code(code)
    if not tf:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    return {
        "success": True,
        "tmpfile": tf.to_dict()
    }

@public_api.post("/tmp")
@public_api.post("/tmpfile")
def _create_temp_file():
    file = request.form.get("file")
    name = request.form.get("name", "")
    expiry = request.form.get("expiry", 0, int)
    if not file:
        return error_respones_dict(APIErrors.MISSING_DATA), 400
    tf = TmpFile.create_with_buffer(file)
    if not tf:
        return error_respones_dict(APIErrors.INTERNAL_ERROR), 500
    tf.name = name or file.name or f"temp-file-{tf.code}"
    if expiry:
        if expiry < tf.expiry.timestamp():
            tf.expiry = datetime.utcfromtimestamp(expiry)
    tf.save()
    return {
        "success": True,
        "tmpfile": tf.to_dict()
    }

@public_api.get("/tmpfolder")
def _get_temp_folder():
    code = request.args.get("code", "")
    if not code:
        return error_respones_dict(APIErrors.MISSING_PARAMETERS), 400
    tf = TmpFolder.by_code(code)
    if not tf:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    json = tf.to_dict()
    if auth_code := session.get("tmp-folder-auth-codes-"+tf.code):
        json["auth-code"] = auth_code
    return json

@public_api.post("/tmpfolder")
def _create_temp_folder():
    json = request.get_json()
    if not json:
        return error_respones_dict(APIErrors.MISSING_JSON), 400
    name = json.get("name", "")
    tf = TmpFolder.create(name=name)
    if not tf:
        return error_respones_dict(APIErrors.INTERNAL_ERROR), 500
    # comment is from old code
    session["tmp-folder-auth-codes-"+tf.code] = tf.auth_code # don't know why dict approach is not working
    return {
        "success": True,
        "tmpfolder": tf.to_dict()
    }


@public_api.put("/tmpfolder")
def _add_temp_folder_file():
    json = request.get_json()
    if not json:
        return error_respones_dict(APIErrors.MISSING_JSON), 400
    code = json.get("code")
    auth_code = json.get("auth_code", "")
    file_code = json.get("file_code", "")
    if not code or not auth_code or not file_code:
        return error_respones_dict(APIErrors.MISSING_PARAMETERS), 400
    tf = TmpFolder.by_code(code)
    if not tf:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    if auth_code != tf.auth_code:
        return error_respones_dict(APIErrors.UNAUTHORIZED), 401
    tf.add_file(file_code)
    return {
        "success": True,
        "tmpfolder": tf.to_dict()
    }

@public_api.delete("/tmpfolder")
def _remove_temp_folder_file():
    json = request.get_json()
    if not json:
        return error_respones_dict(APIErrors.MISSING_JSON), 400
    code = json.get("code", "")
    auth_code = json.get("auth_code", "")
    file_code = json.get("file_code", "")
    if not code or not auth_code or not file_code:
        return error_respones_dict(APIErrors.MISSING_PARAMETERS), 400
    tf = TmpFolder.by_code(code)
    if not tf:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    if auth_code != tf.auth_code:
        return error_respones_dict(APIErrors.UNAUTHORIZED), 401
    tf.remove_file(file_code)
    return {
        "success": True,
        "tmpfolder": tf.to_dict()
    }

