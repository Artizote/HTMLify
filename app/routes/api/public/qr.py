from flask import request, send_file
from qrcode import make as make_qr

from app.utils import file_path, hash_sha256
from .api import public_api


@public_api.get("/qr")
@public_api.get("/qrcode")
def create_qr_():
    url = request.args.get("url", "")
    text = request.args.get("text", url)
    qr_image_filepath = file_path("qr", hash_sha256(text) + ".png")
    qr_image = make_qr(text)
    qr_image.save(qr_image_filepath)
    return send_file(qr_image_filepath)

