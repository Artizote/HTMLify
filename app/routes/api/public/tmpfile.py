from flask import request, session

import binascii
from datetime import datetime

from app.models import Blob, TmpFile, TmpFolder
from .api import public_api, error_respones_dict, APIErrors


@public_api.get("/tmp")
@public_api.get("/tmpfile")
def get_temp_file_():
    code = request.args.get("code")
    show_content = request.args.get("show_content", "false") == "true"
    if not code:
        return error_respones_dict(APIErrors.MISSING_PARAMETERS)
    tf = TmpFile.by_code(code)
    if not tf:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    return {
        "success": True,
        "tmpfile": tf.to_dict(show_content=show_content)
    }


@public_api.post("/tmp")
@public_api.post("/tmpfile")
def create_temp_file():
    if request.is_json:
        json = request.get_json()
    else:
        json = {}

    file            = request.files.get("file")
    name            = request.form.get("name", json.get("name", ""))
    encoded_content = json.get("content")
    expiry          = request.form.get("expiry", 0, int) or int(json.get("expiry", 0))

    if not file and not encoded_content:
        return error_respones_dict(APIErrors.MISSING_DATA), 400

    if file:
        tf = TmpFile.create_with_buffer(file)

    if encoded_content:
        try:
            blob = Blob.from_base64(encoded_content)
        except binascii.Error:
            return error_respones_dict(APIErrors.INVALID_DATA), 400
        except:
            return error_respones_dict(APIErrors.INTERNAL_ERROR), 500
        tf = TmpFile.create_with_blob(blob)

    if not tf:
        return error_respones_dict(APIErrors.INTERNAL_ERROR), 500

    tf.name = name or f"temp-file-{tf.code}"

    if expiry:
        if expiry < tf.expiry.timestamp():
            tf.expiry = datetime.utcfromtimestamp(expiry)

    tf.save()
    return {
        "success": True,
        "tmpfile": tf.to_dict()
    }


@public_api.get("/tmpfolder")
def get_temp_folder():
    code = request.args.get("code", "")
    if not code:
        return error_respones_dict(APIErrors.MISSING_PARAMETERS), 400
    tf = TmpFolder.by_code(code)
    if not tf:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    json = tf.to_dict()
    auth_codes = session.setdefault("tmpfolder-auth-codes", {});
    # no auth_code retriving for now
    # TODO: CORS weth credentials
    return {
        "success": True,
        "tmpfolder": json
    }

@public_api.post("/tmpfolder")
def create_temp_folder():
    json = request.get_json()
    if not json:
        return error_respones_dict(APIErrors.MISSING_JSON), 400
    name = json.get("name") or "Folder Name"
    tf = TmpFolder.create(name=name)
    if not tf:
        return error_respones_dict(APIErrors.INTERNAL_ERROR), 500
    # no auth_code saving for now 
    # TODO: CORS weth credentials
    return {
        "success": True,
        "tmpfolder": tf.to_dict(show_auth_code=True)
    }

@public_api.put("/tmpfolder")
def add_temp_folder_file_():
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
def remove_temp_folder_file_():
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

