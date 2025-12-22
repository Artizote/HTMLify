from flask import request

from app.models import Blob
from .api import *


@public_api.get("/blob")
def get_blob():
    hash = request.args.get("hash", "")
    show_content = request.args.get("show_content", "true") == "true"
    blob = Blob[hash]
    if not blob:
        return error_respones_dict(APIErrors.NOT_FOUND), 404
    return {
        "success": True,
        "blob": blob.to_dict(show_content=show_content)
    }

