import qrcode
from PIL import Image

import os

from app.utils import hash_sha256, rgb_hex_to_int, file_path


class QRCodeService:

    @staticmethod
    def create(data: str | bytes, fg: str | None = None, bg: str | None = None) -> str:
        data_hash = hash_sha256(data)

        if fg or bg:
            try:
                foreground_tuple = rgb_hex_to_int(fg)
            except:
                foreground_tuple = (0, 0, 0)
            try:
                background_tuple = rgb_hex_to_int(bg)
            except:
                background_tuple = (255, 255, 255)

            qr_image_filepath = file_path("qr", f"{data_hash}-fg-{fg}-bg-{bg}.png")
            if not os.path.exists(qr_image_filepath):
                qr = qrcode.make(data)
                qr_image = qr.get_image()
                colored_qr_image = Image.new("RGB", (qr_image.width, qr_image.height))
                for y in range(qr_image.height):
                    for x in range(qr_image.width):
                        pixel = qr_image.getpixel((x, y))
                        if pixel == 0: # Black, foreground color
                            colored_qr_image.putpixel((x, y), foreground_tuple)
                        else: # background
                            colored_qr_image.putpixel((x, y), background_tuple)
                colored_qr_image.save(qr_image_filepath)
            return qr_image_filepath

        qr_image_filepath = file_path("qr", data_hash + ".png")
        if not os.path.exists(qr_image_filepath):
            qr = qrcode.make(data)
            qr.save(qr_image_filepath)

        return qr_image_filepath

    @staticmethod
    def create_as_json(data: str | bytes) -> dict:
        qrc = qrcode.QRCode()
        qrc.add_data(data)
        qrc.make()
        json = {}
        json["version"] = qrc.version
        modules = []
        for module in qrc.modules:
            modules.append(module.copy())
        json["modules"] = modules
        return json

