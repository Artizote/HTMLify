from flask import request

from app.models import Comment
from .api import *


@public_api.get("/comment")
def get_comment_():
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
@json_require
@auth_require
def create_comment_():
    json = g.json
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
@auth_require
def delete_comment_():
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

