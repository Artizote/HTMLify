from flask import Blueprint, g, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.models import User
from ..errors import error_respones_dict, APIErrors


private_api = Blueprint("private", __name__, url_prefix="/private")


@private_api.before_request
def before_request():
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

