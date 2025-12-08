from flask import Blueprint, session, request, render_template, redirect, g
from flask_jwt_extended import create_access_token

from app.models import User, Dir, File, Notification


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
        return redirect("/login")


@dashboard.get("/")
def dashboard_():
    dir = Dir(request.args.get("dir", g.user.username))
    return render_template("dashboard.html", dir=dir)

@dashboard.get("/token")
def get_token():
    username = session.get("username")
    if not username:
        return redirect("/logout")
    token = create_access_token(username)
    return {
        "token": token
    }
    
@dashboard.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")

    username = request.form.get("username", "").strip().lower()
    password = request.form.get("password", "")

    user = User.by_username(username)
    if user and user.match_password(password):
        session["username"] = user.username
        return redirect("/")
    return render_template("login.html", error="Invalid Credidentials")

@dashboard.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "GET":
        return render_template("register.html")

    username = request.form.get("username", "").lower()
    password = request.form.get("password", "")
    repassword = request.form.get("repassword", "")
    email = request.form.get("email", "").lower()

    if not all([username, password, repassword, email]):
        return render_template("register.html", error="Fill required fields")

    if not User.is_username_valid(username):
        return render_template("register.html", error="Username is not valid")

    if not User.is_username_available(username):
        return render_template("register.html", error="Username is not available")

    if User.get_or_none(User.email==email):
        return render_template("register.html", error="Email already in use")
    
    if password != repassword:
        return render_template("register.html", error="Confirmation password did not match")

    user: User = User.create(username=username, email=email)
    user.set_password(password)

    session["username"] = user.username
    
    return redirect("/")

@dashboard.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

@dashboard.route("/upload")
def file_upload():
    return render_template("file-upload.html")

@dashboard.route("/edit")
def file_edit():
    path = request.args.get("path")
    file = File.by_path(path)
    return render_template("file-edit.html", file=file)

@dashboard.route("/delete")
def file_delete():
    path = request.args.get("path")
    file = File.by_path(path)
    if not file:
        return redirect("/")
    if file.user != g.user:
        return redirect("/")
    return render_template("file-delete.html", file=file)

@dashboard.route("/git-clone")
def git_clone():
    dir = Dir(request.args.get("dir", g.user.username))
    return render_template("git-clone.html", dir=dir)

@dashboard.route("/notifications")
def veiw_notifications():
    notifications = g.user.notifications
    return render_template("notifications.html", notifications=notifications)

@dashboard.route("/notifications/<int:id>")
def notification_redirect(id):
    notification = Notification.by_id(id)
    if not notification:
        return redirect("/notifications")
    if notification.user_id != g.user.id:
        return redirect("/")
    return redirect(notification.href)

