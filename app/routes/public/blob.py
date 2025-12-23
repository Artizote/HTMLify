from flask import render_template, abort

from app.models import Blob, BlobType
from .public import public


@public.route("/blob/")
def blob_lookup():
    return render_template("blob-lookup.html")


@public.route("/blob/<hash>")
def blob_(hash):
    blob = Blob[hash]
    if not blob:
        abort(404)
    if blob.type == BlobType.TEXT:
        return blob.get_content(), { "Content-type": "text/text" }
    return blob.get_content(), { "Content-type": "application/octet-stream" }

