from flask import Blueprint

private_api = Blueprint("private", __name__, url_prefix="/private")
