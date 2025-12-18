from flask import Blueprint, session, request, redirect, g
from flask_jwt_extended import create_access_token

from app.models import User


dashboard = Blueprint(
        "dashboard",
        __name__,
        subdomain="my",
        static_folder="../../static",
        template_folder="../../templates/dashboard"
)


@dashboard.before_request
def before_request():
    username = session.get("username", "")
    user = User.by_username(username)
    g.user = user
    if (
        not g.user and
        request.endpoint != "dashboard.login" and
        request.endpoint != "dashboard.register" and
        request.endpoint != "dashboard.logout" and
        request.endpoint != "dashboard.static"
    ):
        session["redirect-after-login"] = request.url
        return redirect("/login")


@dashboard.get("/")
def dashboard_():
    return redirect("/files")
    # TODO: make an dashboard page

@dashboard.get("/token")
def get_token():
    username = session.get("username")
    if not username:
        return redirect("/logout")
    token = create_access_token(username)
    return {
        "token": token
    }

