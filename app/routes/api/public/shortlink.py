from flask import request

from app.models import ShortLink
from .api import *


@public_api.route("/shortlink")
def shortlink_():
    id      = request.args.get("id")
    short   = request.args.get("short")
    url     = request.args.get("url")

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
    }

