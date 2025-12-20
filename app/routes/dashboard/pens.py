from flask import render_template, g, request, redirect

from app.models import Pen
from .dashboard import dashboard


@dashboard.route("/pens")
def pens_():
    pens = Pen.select().where(Pen.user_id==g.user.id).order_by(Pen.modified.desc())
    return render_template("pens.html", pens=pens)

@dashboard.route("/pens/edit")
def edit_pen():
    id = request.args.get("id", "")
    pen = Pen.by_id(id)
    if pen and pen.user != g.user:
        return redirect("/pens")
    return render_template("pen-edit.html", pen=pen)

@dashboard.route("/pens/delete")
def delete_pen():
    id = request.args.get("id", "")
    pen = Pen.by_id(id)
    if pen and pen.user != g.user:
        return redirect("/pens")
    return render_template("pen-delete.html", pen=pen)
