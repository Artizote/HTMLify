from flask import Blueprint, request, g

from functools import wraps

from app.models import *
from ..errors import APIErrors, error_respones_dict


public_api = Blueprint("public", __name__)


def auth_require(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        if not g.auth_user:
            return error_respones_dict(APIErrors.UNAUTHORIZED), 401
        return f(*args, **kwargs)
    return decorator

def json_require(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        if not g.json:
            return error_respones_dict(APIErrors.MISSING_JSON), 400
        return f(*args, **kwargs)
    return decorator


@public_api.before_request
def before_requesnt():
    # cheking authorized user
    g.auth_user = None
    header = request.headers.get("Authorization")
    if header:
        if header.startswith("Bearer "):
            api_key = header.split()[-1]
            g.auth_user = User.by_api_key(api_key)
    # checking request json
    g.json = {}
    if request.is_json:
        g.json = request.get_json()

