from flask import request 

from .api import *


@public_api.get("/search")
def search_():
    # TODO: Implement after search service
    q = request.args.get("q")

    if not q:
        return error_respones_dict(APIErrors.MISSING_PARAMETERS)
    return {"success": True, "result_count":0, "results": []}

