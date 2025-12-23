from flask import render_template, send_file, abort

from app.models import TmpFile, TmpFolder
from .public import public


@public.route("/tmp/")
def create_temp_file():
    return render_template("temp-file.html")


@public.route("/tmp/<code>")
def tmp_file(code):
    tf = TmpFile.by_code(code)
    if not tf:
        abort(404)
    return send_file(tf.filepath, download_name=tf.name)


@public.route("/tmp/f/")
def tmp_folder():
    return render_template("temp-folder.html")


@public.route("/tmp/f/<code>")
def tmp_folder_(code):
    tf = TmpFolder.by_code(code)
    if not tf:
        abort(404)
    return render_template("temp-folder.html")

