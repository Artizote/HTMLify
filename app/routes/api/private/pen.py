from flask import request, g

import binascii

from app.models import Blob, Pen
from .api import *


@private_api.get("/pen")
def get_pen():
    id = request.args.get("id", "")
    pen = Pen.by_id(id)
    if not pen:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    opts = {
        "show_head_content": request.args.get("show_head_content", "false") == "true",
        "show_body_content": request.args.get("show_body_content", "false") == "true",
        "show_css_content": request.args.get("show_css_content", "false") == "true",
        "show_js_content": request.args.get("show_js_content", "false") == "true"
    }
    return {
        "success": True,
        "pen": pen.to_dict(**opts)
    }


@private_api.post("/pen")
def create_pen():
    json = request.get_json() or {}
    if not json:
        return error_respones_dict(APIErrors.MISSING_JSON), 400

    title = json.get("title", "Untitled Pen")
    encoded_head_content = json.get("head_content", "")
    encoded_body_content = json.get("body_content", "")
    encoded_css_content = json.get("css_content", "")
    encoded_js_content = json.get("js_content", "")

    try:
        head_blob = Blob.from_base64(encoded_head_content)
        body_blob = Blob.from_base64(encoded_body_content)
        css_blob = Blob.from_base64(encoded_css_content)
        js_blob = Blob.from_base64(encoded_js_content)
    except binascii.Error:
        return error_respones_dict(APIErrors.INVALID_DATA), 400
    except:
        return error_respones_dict(APIErrors.INTERNAL_ERROR), 500

    pen = Pen.create(
        title = title[:255],
        user_id = g.auth_user.id,
        head_blob_hash = head_blob.hash,
        body_blob_hash = body_blob.hash,
        css_blob_hash = css_blob.hash,
        js_blob_hash = js_blob.hash
    )

    if not pen:
        return error_respones_dict(APIErrors.INTERNAL_ERROR), 500

    return {
        "success": True,
        "pen": pen.to_dict()
    }


@private_api.patch("pen")
def update_pen():
    json = request.get_json()
    if not json:
        return error_respones_dict(APIErrors.MISSING_JSON), 400

    id = json.get("id", "")

    pen = Pen.by_id(id)
    if not pen:
        return error_respones_dict(APIErrors.NOT_FOUND), 404

    if pen.user_id != g.auth_user.id:
        return error_respones_dict(APIErrors.FORBIDDEN), 403

    title = json.get("title")
    encoded_head_content = json.get("head_content")
    encoded_body_content = json.get("body_content")
    encoded_css_content = json.get("css_content")
    encoded_js_content = json.get("js_content")

    if title:
        pen.title = title[:255]

    if encoded_head_content:
        try:
            blob = Blob.from_base64(encoded_head_content)
        except binascii.Error:
            return error_respones_dict(APIErrors.INVALID_DATA)
        except:
            return error_respones_dict(APIErrors.INTERNAL_ERROR)
        pen.head_blob_hash = blob.hash

    if encoded_body_content:
        try:
            blob = Blob.from_base64(encoded_body_content)
        except binascii.Error:
            return error_respones_dict(APIErrors.INVALID_DATA)
        except:
            return error_respones_dict(APIErrors.INTERNAL_ERROR)
        pen.body_blob_hash = blob.hash

    if encoded_css_content:
        try:
            blob = Blob.from_base64(encoded_css_content)
        except binascii.Error:
            return error_respones_dict(APIErrors.INVALID_DATA)
        except:
            return error_respones_dict(APIErrors.INTERNAL_ERROR)
        pen.css_blob_hash = blob.hash

    if encoded_js_content:
        try:
            blob = Blob.from_base64(encoded_js_content)
        except binascii.Error:
            return error_respones_dict(APIErrors.INVALID_DATA)
        except:
            return error_respones_dict(APIErrors.INTERNAL_ERROR)
        pen.js_blob_hash = blob.hash

    pen.save()
    pen.update_modified_time()

    return {
        "success": True,
        "pen": pen.to_dict()
    }


@private_api.delete("/pen")
def delete_pen():
    id = request.args.get("id", "")
    pen = Pen.by_id(id)
    if not pen:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    if pen.user != g.auth_user:
        return error_respones_dict(APIErrors.FORBIDDEN), 403
    deleted = bool(pen.delete_instance())
    return {
        "success": deleted
    }

