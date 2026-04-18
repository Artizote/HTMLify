from fastapi import APIRouter, Query
from fastapi.responses import FileResponse, JSONResponse

from app.services.qrcode_service import QRCodeService


router = APIRouter(tags=["QR Code"])


@router.get("/qr-code",
    name="QR Code",
    description="Create QR Code for given data"
    )
def qr_code(
    data: str | bytes = Query(None, description="Any data to encode in QR code"),
    fg: str | None = Query(None, description="Foreground color for QR code (#RRGGBB)"),
    bg: str | None = Query(None, description="Background color for QR code (#RRGGBB)")
) -> FileResponse:

    qr_image_filepath = QRCodeService.create(data, fg, bg)
    return FileResponse(qr_image_filepath)

@router.get("/qr-code/json",
    name="QR Code as JSON",
    description="Create QR Code for given data"
    )
def qr_code_as_json(
    data: str | bytes = Query(None, description="Any data to encode in QR code")
) -> JSONResponse:
    qr_json = QRCodeService.create_as_json(data)
    return JSONResponse(qr_json)

