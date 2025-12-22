from flask import render_template, abort, redirect

from app.models import Pen
from .public import public


@public.route("/pen/<id>")
def pen_(id):
    pen = Pen.by_id(id)
    if not pen:
        abort(404)
    return render_template("pen.html", pen=pen)


@public.route("/pen/<id>/<part>")
def pen_part(id, part):
    pen = Pen.by_id(id)
    if not pen:
        return abort(404)
    part = part.lower()
    match part:
        case "html":
            return render_template("pen.html", pen=pen), { "Content-Type": "text/text" }
        case "head":
            return pen.head_content, { "Content-Type": "text/text" }
        case "body":
            return pen.body_content, { "Content-Type": "text/text" }
        case "css":
            return pen.css_content, { "Content-Type": "text/css" }
        case "js":
            return pen.js_content, { "Content-Type": "text/javascript" }
    return redirect(pen.path)


@public.route("/src/pen/<id>")
def pen_src(id):
    pen = Pen.by_id(id)
    if not pen:
        abort(404)
    return render_template("pen-src.html", pen=pen)


@public.route("/raw/pen/<id>")
def pen_raw(id):
    pen = Pen.by_id(id)
    if not pen:
        abort(404)
    return render_template("pen.html", pen=pen), { "Content-Type": "text/text" }
