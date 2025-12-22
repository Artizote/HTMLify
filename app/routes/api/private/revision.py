from flask import request, g

from app.models import File, Revision
from .api import *


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

