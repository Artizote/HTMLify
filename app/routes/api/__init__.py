# will server on:
# api.<SERVER_NAME>

from flask import Blueprint

from .public import public_api
from .private import private_api

api = Blueprint("api", __name__, subdomain="api")
api.register_blueprint(public_api)
api.register_blueprint(private_api)
