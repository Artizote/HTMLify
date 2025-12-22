from flask import render_template, send_file

from app.models import TmpFile, TmpFolder
from .public import public


@public.route("/tmp/")
def create_temp_file():
    return render_template("temp-file.html")


@public.route("/tmp/<code>")
def tmp_file(code):
    tf = TmpFile.by_code(code)
    if not tf:
        return "<h1>404 File Not Found</br><a href='/'>Back to home</a></h1>", 404
    return send_file(tf.filepath, download_name=tf.name)


@public.route("/tmp/f/")
def tmp_folder():
    return render_template("temp-folder.html")


@public.route("/tmp/f/<code>")
def tmp_folder_(code):
    tf = TmpFolder.by_code(code)
    if not tf:
        return "<h1>404 Temp folder Not found</br><a href='/'>Back to home</a></h1>", 404
    return render_template("temp-folder.html")

