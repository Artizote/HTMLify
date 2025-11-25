# will server on:
# api.<SERVER_NAME>

from flask import Blueprint
from flask_cors import CORS

from app.config import SCHEME, SERVER_NAME

from .public import public_api
from .private import private_api

CORS(public_api, resources={
    r"/*": { "origins": "*" }
})
CORS(private_api, supports_credentials=True, resources={
    r"/*": { "origins": f"{SCHEME}://my.{SERVER_NAME}" }
})

api = Blueprint("api", __name__, subdomain="api")
api.register_blueprint(public_api)
api.register_blueprint(private_api)
