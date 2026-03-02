from fastapi import APIRouter, Query
from fastapi.responses import FileResponse

from app.services.qrcode_service import QRCodeService


router = APIRouter(tags=["QR Code"])


@router.get("/qr-code",
    name="QR Code",
    description="Create QR Code for given data"
    )
def qr_code(
    data: str = Query(None, description="Any data to encode in QR code"),
    fg: str | None = Query(None, description="Foreground color for QR code (#RRGGBB)"),
    bg: str | None = Query(None, description="Background color for QR code (#RRGGBB)")
) -> FileResponse:

    qr_image_filepath = QRCodeService.create(data, fg, bg)
    return FileResponse(qr_image_filepath)

