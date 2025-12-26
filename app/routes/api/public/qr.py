import qrcode
from flask import request, send_file
from PIL import Image

import os

from app.utils import file_path, hash_sha256, rgb_hex_to_int
from .api import public_api


@public_api.get("/qr")
@public_api.get("/qrcode")
def create_qr_():
    url = request.args.get("url", "")
    text = request.args.get("text", url)
    fg = request.args.get("fg", request.args.get("foreground", ""))
    bg = request.args.get("bg", request.args.get("background", ""))
    text_hash = hash_sha256(text)

    if fg or bg:
        try:
            foreground_tuple = rgb_hex_to_int(fg)
        except:
            foreground_tuple = (0, 0, 0)
        try:
            background_tuple = rgb_hex_to_int(bg)
        except:
            background_tuple = (255, 255, 255)

        qr_image_filepath = file_path("qr", f"{text_hash}-fg-{fg}-bg-{bg}.png")
        if not os.path.exists(qr_image_filepath):
            qr = qrcode.make(text)
            qr_image = qr.get_image()
            print("qr_image.mode:", qr_image.mode)
            colored_qr_image = Image.new("RGB", (qr_image.width, qr_image.height))
            for y in range(qr_image.height):
                for x in range(qr_image.width):
                    pixel = qr_image.getpixel((x, y))
                    if pixel == 0: # Black, foreground color
                        colored_qr_image.putpixel((x, y), foreground_tuple)
                    else: # background
                        colored_qr_image.putpixel((x, y), background_tuple)
            colored_qr_image.save(qr_image_filepath)
        return send_file(qr_image_filepath)

    qr_image_filepath = file_path("qr", text_hash + ".png")
    if not os.path.exists(qr_image_filepath):
        qr = qrcode.make(text)
        qr.save(qr_image_filepath)
    return send_file(qr_image_filepath)

