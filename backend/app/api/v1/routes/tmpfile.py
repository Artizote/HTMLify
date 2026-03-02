from fastapi import APIRouter, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse

from typing import Optional

from app.services.tmpfile_service import *
from ..schemas.tmpfile import *


router = APIRouter(tags=["Temp File"])


@router.get("/tmp-files/{id}", description="Get TmpFile Info")
def get_tmp_file(id) -> TmpFileRead:
    tmpfile = TmpFileService.get_tmpfile(id)
    if not tmpfile:
        raise HTTPException(404, detail="Not Found")
    # some issue with tmpfile expiry dataatye, need to be fix before use
    #if tmpfile.expiry.timestamp() < datetime.now(UTC).timestamp():
    #    raise HTTPException(status_code=410, detail="Expired")
    tfr = TmpFileRead.from_orm(tmpfile)
    return tfr

@router.post("/tmp-files", description="Create TmpFile")
def create_tmp_file(
    file: UploadFile,
    name: Optional[str] = Form(None),
    expiry: Optional[int] = Form(None),
) -> TmpFileRead:
    tmpfile = TmpFileService.create_tmpfile(file.file, name or file.filename, expiry)
    tfr = TmpFileRead.from_orm(tmpfile)
    return tfr

@router.get("/tmp-files/{id}/content", description="Get TmpFile Content")
def get_tmp_file_content(id: str) -> FileResponse:
    tmpfile = TmpFileService.get_tmpfile(id)
    if not tmpfile:
        raise HTTPException(404, detail="Not Found")
    # some issue with tmpfile expiry dataatye, need to be fix before use
    # if tmpfile.expiry.timestamp() < datetime.now(UTC).timestamp():
    #     raise HTTPException(410, detail="Expired")
    return FileResponse(tmpfile.filepath, filename=tmpfile.name, content_disposition_type="inline")

@router.get("/tmp-folders/{id}")
def get_tmp_folder(id: str) -> TmpFolderRead:
    tmpfolder = TmpFileService.get_tmpfolder(id)
    if not tmpfolder:
        raise HTTPException(status_code=404, detail="Not Found")
    tfr = TmpFolderRead.from_orm(tmpfolder)
    return tfr

@router.post("/tmp-folders")
def create_tmp_folder(tmpfolder_create: TmpFolderCreate) -> TmpFolderReadWithAuthCode:
    tmpfolder = TmpFileService.create_tmpfolder(tmpfolder_create.name)
    if not tmpfolder:
        raise HTTPException(404, detail="Not Found")
    tfr = TmpFolderReadWithAuthCode.from_orm(tmpfolder)
    return tfr

@router.get("/tmp-folders/{id}/files")
def get_tmp_folder_files(id: str) -> list[TmpFileRead]:
    tmpfolder = TmpFileService.get_tmpfolder(id)
    if not tmpfolder:
        raise HTTPException(404, detail="Not Found")
    tffs = []
    for tmpfile in tmpfolder.files:
        tffs.append(TmpFileRead.from_orm(tmpfile))
    return tffs

@router.post("/tmp-folders/{id}/files")
def add_file_in_tmp_folder(id: str, add_file: TmpFolderFileAdd) -> list[TmpFileRead]:
    try:
        TmpFileService.add_file_in_tmpfolder(id, add_file.id, add_file.auth_code)
    except TmpFolderNotFound:
        raise HTTPException(404, detail="Folder Not Found")
    except TmpFileNotFound:
        raise HTTPException(404, detail="File Not Found") 
    except TmpFolderInvalidAuthCode:
        raise HTTPException(402, detail="Auth Code did not match")
    tmpfolder = TmpFileService.get_tmpfolder(id)
    tffs = []
    for tmpfile in tmpfolder.files:
        tffs.append(TmpFileRead.from_orm(tmpfile))
    return tffs

@router.delete("/tmp-folders/{id}/files")
def remove_file_in_tmp_folder(id: str, remove_file: TmpFolderFileAdd) -> list[TmpFileRead]:
    try:
        TmpFileService.remove_file_from_tmpfolder(id, remove_file.id, remove_file.auth_code)
    except TmpFolderNotFound:
        raise HTTPException(404, detail="Folder Not Found")
    except TmpFileNotFound:
        raise HTTPException(404, detail="File Not Found") 
    except TmpFolderInvalidAuthCode:
        raise HTTPException(402, detail="Auth Code did not match")
    tmpfolder = TmpFileService.get_tmpfolder(id)
    tffs = []
    for tmpfile in tmpfolder.files:
        tffs.append(TmpFileRead.from_orm(tmpfile))
    return tffs

