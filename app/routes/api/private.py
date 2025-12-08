from flask import Blueprint, g
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

import os
import binascii

from app.models import *
from app.utils import randstr, file_path, git_clone
from .errors import error_respones_dict, APIErrors


private_api = Blueprint("private", __name__, url_prefix="/private")


@private_api.before_request
def before_requesn():
    if request.method == "OPTIONS":
        return None
    # checking authorized user with JWT
    g.auth_user = None
    verify_jwt_in_request()
    username = get_jwt_identity()
    if username:
        g.auth_user = User.by_username(username)

    if not g.auth_user:
        return error_respones_dict(APIErrors.UNAUTHORIZED), 401


@private_api.get("/items")
def list_dir_items():
    dir = request.args.get("dir", request.args.get("user", ""))
    dir = Dir(dir)
    if dir.username != g.auth_user.username:
        return error_respones_dict(APIErrors.FORBIDDEN), 403
    return dir.to_dict()

@private_api.get("/file")
def get_file():
    id = request.args.get("id", 0)
    path = request.args.get("path", "")
    show_content = request.args.get("show-content", "false") == "true"
    file = File.by_id(id)
    if not file and path:
        file = File.by_path(path)
    if not file:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    if file.user != g.auth_user:
        return error_respones_dict(APIErrors.FORBIDDEN), 403
    if file.is_locked:
        file.unlock_without_password()
    return {
        "success": True,
        "file": file.to_dict(show_content=show_content)
    }

@private_api.post("/file")
def create_file():
    # can accept application/json and multipart/form-data
    json = request.get_json() or {}

    _file = request.files.get("file")
    encoded_content = json.get("content")

    path = json.get("path", request.form.get("path", ""))
    title = json.get("title", request.form.get("title", path.split("/")[-1]))
    password = json.get("password", request.form.get("password", ""))
    visibility = json.get("visibility", request.form.get("visibility", FileVisibility.PUBLIC))
    mode = json.get("mode", request.form.get("mode", FileMode.RENDER))
    as_guest = json.get("as_guest", request.form.get("as_guest", "false") == "true")
    overwrite = json.get("overwrite", request.form.get("overwrite", "false") == "true")


    if not _file and not encoded_content:
        return error_respones_dict(APIErrors.MISSING_DATA), 400

    if as_guest and _file:
        return error_respones_dict(APIErrors.INVALID_DATA), 400

    if as_guest:
        path = File.new_guest_path(path)
    else:
        if File.username_from_path(path) != g.auth_user.username:
            return error_respones_dict(APIErrors.FORBIDDEN), 403

    if path.endswith("/"):
        path = path[:-1]

    if not path.startswith("/"):
        path = "/" + path

    if not File.is_valid_filepath(path):
        return error_respones_dict(APIErrors.INVALID_PARAMETERS), 400

    if _file:
        try:
            tmp_filepath = file_path("tmp", randstr(10))
            _file.save(tmp_filepath)
            blob = Blob.from_file(tmp_filepath)
            os.remove(tmp_filepath)
        except:
            return error_respones_dict(APIErrors.INTERNAL_ERROR), 500

    if encoded_content:
        try:
            blob = Blob.from_base64(encoded_content)
        except binascii.Error:
            return error_respones_dict(APIErrors.INVALID_DATA), 400
        except:
            return error_respones_dict(APIErrors.INTERNAL_ERROR), 500

    file_ = File.by_path(path)
    if file_:
        if overwrite:
            file_.delete_instance()
        else:
            return error_respones_dict(APIErrors.ALREADY_EXISTS), 400

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

@private_api.patch("/file")
def update_file():
    json = request.get_json()
    if not json:
        return error_respones_dict(APIErrors.MISSING_JSON), 400

    id = request.args.get("id", 0, int)
    path = request.args.get("path", "")
    file = File.by_id(id)
    if not file and path:
        file = File.by_path(path)
    if not file:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    if file.user != g.auth_user:
        return error_respones_dict(APIErrors.FORBIDDEN), 403

    path = json.get("path")
    overwrite = json.get("overwrite", False)
    title = json.get("title")
    password = json.get("password", "")
    mode = json.get("mode")
    visibility = json.get("visibility")
    encoded_content = json.get("content")

    if path:
        if not path.startswith("/"):
            path = "/" + path
        if File.username_from_path(path) != g.auth_user.username:
            return error_respones_dict(APIErrors.FORBIDDEN), 403
        _file = File.by_path(path)
        if _file:
            if overwrite:
                _file.delete_instance()
            else:
                return error_respones_dict(APIErrors.ALREADY_EXISTS), 400
        file.path = path
        file.save()

    if title:
        file.title = title
        file.save()

    file.set_password(password)

    if mode:
        file.set_mode(mode)

    if visibility:
        file.set_visibility(visibility)

    if encoded_content:
        try:
            blob = Blob.from_base64(encoded_content)
        except binascii.Error:
            return error_respones_dict(APIErrors.INVALID_DATA), 400
        except:
            return error_respones_dict(APIErrors.INTERNAL_ERROR), 500

        file.content = blob
        file.save()

    file.update_modified_time()

    return {
        "success": True,
        "file": file.to_dict()
    }

@private_api.delete("/file")
def delete_file():
    id = request.args.get("id", 0, int)
    path = request.args.get("path", "")
    file = File.by_id(id)
    if not file and path:
        file = File.by_path(path)
    if not file:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    if file.user != g.auth_user:
        return error_respones_dict(APIErrors.FORBIDDEN), 403
    file.delete_instance()
    return {
        "success": True
    }

@private_api.post("/git-clone")
def git_clone_():
    json = request.get_json()
    if not json:
        return error_respones_dict(APIErrors.MISSING_JSON), 400
    repo = json.get("repo")
    dir = json.get("dir", "")
    mode = json.get("mode", FileMode.SOURCE)
    visibility = json.get("visibility", FileVisibility.PUBLIC)
    overwrite = json.get("overwrite", "true") == "true"

    if not repo:
        return error_respones_dict(APIErrors.MISSING_DATA), 400
    try:
        cloned = git_clone(g.auth_user, repo, dir, mode, visibility, overwrite)
    except Exception as e:
        print("e:", e)
        return error_respones_dict(APIErrors.INTERNAL_ERROR), 505

    return {
        "success": bool(cloned)
    }

@private_api.get("/revision")
def get_revision():
    id = request.args.get("id", 0, int)
    revision: Revision = Revision.by_id(id)
    if not revision:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    if revision.file.user != g.auth_user:
        return error_respones_dict(APIErrors.FORBIDDEN), 403
    return {
        "success": True,
        "revision": revision.to_dict(show_content=True)
    }

@private_api.get("/revisions")
def get_revisions():
    id = request.args.get("id", 0, int)
    file = File.by_id(id)
    if not file:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    if file.user != g.auth_user:
        return error_respones_dict(APIErrors.FORBIDDEN), 403
    revisions = [revision.to_dict(show_content=False) for revision in file.revisions]
    return {
        "success": True,
        "revisions": revisions
    }


