from flask import request, g

import binascii

from app.models import Blob, File, FileMode, FileVisibility
from .api import *


@public_api.get("/file")
def get_file_():
    id              = request.args.get("id", 0, int)
    path            = request.args.get("path", "")
    show_content    = request.args.get("show_content", "false") == "true"
    password        = request.args.get("password") or request.headers.get("X-Password")

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
        "file": file.to_dict(show_content=show_content)
    }


@public_api.post("/file")
@json_require
@auth_require
def create_file():
    json = g.json

    path            = json.get("path", "")
    encoded_content = json.get("content")
    title           = json.get("title", path.split("/")[-1])
    password        = json.get("password", "")
    visibility      = json.get("visibility", FileVisibility.PUBLIC)
    mode            = json.get("mode", FileMode.RENDER)
    as_guest        = json.get("as_guest", False)

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
@auth_require
def update_file():
    id = request.args.get("id", 0, int)
    path = request.args.get("path", "")

    file = File.by_id(id) or File.by_path(path)
    if not file:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    if file.user != g.auth_user:
        return error_respones_dict(APIErrors.FORBIDDEN), 403

    json = g.json

    path            = json.get("path")
    overwrite       = json.get("overwrite", False)
    title           = json.get("title")
    password        = json.get("password", "")
    mode            = json.get("mode")
    visibility      = json.get("visibility")
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

    if path and path != file.path:
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
@auth_require
def delete_file_():
    id      = request.args.get("id", 0, int)
    path    = request.args.get("path", "")

    file = File.by_id(id) or File.by_path(path)
    if not file:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    if file.user.id != g.auth_user.id:
        return error_respones_dict(APIErrors.FORBIDDEN), 403

    deleted = file.delete_instance()
    return {
        "success": bool(deleted)
    }

