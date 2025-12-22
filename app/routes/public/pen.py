from flask import render_template, abort

from app.models import Pen
from .public import public


@public.route("/pen/<id>")
def pen_(id):
    pen = Pen.by_id(id)
    if not pen:
        abort(404)
    return render_template("pen.html", pen=pen)

