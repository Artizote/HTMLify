from flask import request, render_template, session, redirect

from app.models import User
from .dashboard import dashboard

 
@dashboard.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")

    username = request.form.get("username", "").strip().lower()
    password = request.form.get("password", "")

    user = User.by_username(username)
    if user and user.match_password(password):
        session["username"] = user.username
        redirect_path = session.get("redirect-after-login", "/")
        return redirect(redirect_path)
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

