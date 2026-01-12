from flask import request, render_template, session, redirect, g

from app.models import User
from .dashboard import dashboard

 
@dashboard.route("/login", methods=["GET", "POST"])
def login():
    # If already logged in, go straight to dashboard
    if g.get('user') and g.user:
        return redirect('/files')

    if request.method == "GET":
        return render_template("login.html")

    # Support both JSON and Form data
    data = request.get_json() if request.is_json else request.form
    username = data.get("username", "").strip().lower()
    password = data.get("password", "")

    user = User.by_username(username)
    if user and user.match_password(password):
        session["username"] = user.username
        
        if request.is_json:
            return {"success": True, "redirect": "/files"}
            
        return redirect('/files')

    error_msg = "Invalid Credentials"
    if request.is_json:
        return {"success": False, "error": error_msg}, 401
        
    return render_template("login.html", error=error_msg)

@dashboard.route("/register", methods=["GET", "POST"])
def register():
    # If already logged in, go straight to dashboard
    if g.get('user') and g.user:
        return redirect('/files')

    if request.method == "GET":
        return render_template("register.html")

    data = request.get_json() if request.is_json else request.form
    username = data.get("username", "").lower()
    password = data.get("password", "")
    repassword = data.get("repassword", "")
    email = data.get("email", "").lower()

    error = None
    if not all([username, password, repassword, email]):
        error = "Fill required fields"
    elif not User.is_username_valid(username):
        error = "Username is not valid"
    elif not User.is_username_available(username):
        error = "Username is not available"
    elif User.get_or_none(User.email==email):
        error = "Email already in use"
    elif password != repassword:
        error = "Confirmation password did not match"

    if error:
        if request.is_json:
            return {"success": False, "error": error}, 400
        return render_template("register.html", error=error)

    user: User = User.create(username=username, email=email)
    user.set_password(password)

    session["username"] = user.username
    
    if request.is_json:
        return {"success": True, "redirect": "/files"}
    
    # After registration, go to dashboard files view
    return redirect('/files')

@dashboard.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

@dashboard.route("/api-key")
def api_key():
    return g.user.api_key, {"Content-Type": "text/text"}
