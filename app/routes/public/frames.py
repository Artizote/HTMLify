from flask import render_template

import json
from random import shuffle

from app.models import File, FileMode, FileVisibility
from .public import public


# TODO: Make Frames API
@public.route("/frames")
def frames():
    return render_template("frames.html")


@public.route("/frames/feed")
def frame_feed():
    files = File.select().where(
            File.mode == FileMode.RENDER
            ).where(
            File.visibility == FileVisibility.PUBLIC
            ).where(
            File.as_guest == False
            ).where(
            File.password == ""
            ).where(
            (File.path.endswith(".html") | File.path.endswith(".htm"))
            )
    feed = [file.to_dict(show_content=False) for file in files]
    shuffle(feed)
    feed = feed[:100]
    return json.dumps({"feed": feed, "error": (len(feed)==0)}), 200, {"Content-type": "text/json"}


@public.route("/frames/default")
def frames_default():
    return """<style>*{font-family:font-family: 'Roboto', Arial, sans-serif;}
</style><center><h1>Welcome to HTMLify Frames</h1>
<h1>Use Up & Down button to watch Next/Previus Frame</h1>
<h1>Enjoy</h1></center>"""

