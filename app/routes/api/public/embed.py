from flask import request, render_template
from pygments.formatters import HtmlFormatter

from app.models import File, FileType, FileVisibility

from .api import public_api


@public_api.get("/embed")
@public_api.get("/embed/file")
def embed():
    id = request.args.get("id", 0, int)
    file = File.by_id(id)
    if not file or file.type != FileType.TEXT or file.visibility != FileVisibility.PUBLIC:
        return "file not found", 404
    return render_template("embed.html", highlight_style=HtmlFormatter().get_style_defs(), file=file)

