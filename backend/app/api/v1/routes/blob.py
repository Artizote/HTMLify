from fastapi import APIRouter, HTTPException, Path
from fastapi.responses import FileResponse

from ..schemas.blob import *
from app.services.blob_service import BlobService


router = APIRouter(tags=["Blob"])


@router.get("/blob/{hash}", description="Get Blob Info")
def get_blob_info(hash: str = Path(description="SHA256 hash of blob")) -> BlobInfo:
    blob = BlobService.get_blob(hash)
    if not blob:
        raise HTTPException(404, "Blob not found")
    blob_info = BlobInfo(hash=hash, size=blob.size)
    return blob_info

@router.get("/blob/{hash}/content", description="Get Blob Content")
def get_blob_content(hash: str = Path(description="SHA256 hash of blob")) -> FileResponse:
    blob = BlobService.get_blob(hash)
    if not blob:
        raise HTTPException(404, "Blob not found")
    return FileResponse(blob.filepath, filename=hash, media_type="application/octet-stream")

