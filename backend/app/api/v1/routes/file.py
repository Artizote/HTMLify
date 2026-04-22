from fastapi import APIRouter, Depends, Query, Body, UploadFile, File as FFile, Form
from fastapi.responses import FileResponse
from starlette import status

from typing import Optional

from app.services.auth_service import *
from app.services.file_service import *
from app.models import File, Dir
from ..schemas.file import *


router = APIRouter(tags=["File"])


@router.get("/files")
def get_file_(
    id: Optional[int] = Query(None),
    path: Optional[str] = Query(None),
) -> FileRead:
    file = None
    if id:
        file = FileService.get_file_by_id(id)
    if path:
        file = FileService.get_file_by_path(path)
    if not file:
        raise HTTPException(404, "File not found")
    return FileRead.from_orm(file)

@router.post("/files")
def create_file(
    data: FileCreate = Body(),
    user: User = Depends(AuthService.get_current_user)
) -> FileRead:
    file = FileService.create_file( user, **data.model_dump())
    return FileRead.from_orm(file, show_password=True)

@router.post("/files/upload")
async def create_file_by_upload(
    file: UploadFile = FFile(),
    content: Optional[bytes | str] = Form(None),
    title: Optional[str] = Form(None),
    path: Optional[str] = Form(None),
    password: Optional[str] = Form(""),
    mode: FileModeEnum = Form("source"),
    visibility: FileVisibilityEnum = Form("public"),
    user: User = Depends(AuthService.get_current_user)
) -> FileRead:
    if file:
        content = await file.read()
    if content is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Either file or content must be provided")
    _file = FileService.create_file(
        user,
        title=title or "",
        path=path or "",
        content=content,
        password=password,
        mode=mode,
        visibility=visibility,
        )
    return FileRead.from_orm(_file, show_password=True)

@router.get("/files/{id}")
def get_file_by_id(
    file: File = Depends(FileService.file_from_path_dependency),
    user: Optional[User] = Depends(AuthService.get_or_none_current_user),
    show_content: bool = Query(False),
    password: Optional[str] = Query(None)
) -> FileRead:
    if user:
        if file.user == user:
            return FileRead.from_orm(file, show_content, True, True)
    if file.is_locked:
        if not password:
            return FileRead.from_orm(file, False, False, False)
        if password:
            if file.password == password:
                return FileRead.from_orm(file, show_content, True, False)
    if file.visibility_s != "public" and file.visibility_s != "once":
            return FileRead.from_orm(file, False, False, False)
    return FileRead.from_orm(file, show_content, True, False)

@router.get("/files/{id}/content", description="Get File Content")
def get_file_content(
    file: File = Depends(FileService.file_from_path_dependency),
    user: Optional[User] = Depends(AuthService.get_or_none_current_user),
    password: Optional[str] = Query(None)
) -> FileResponse:
    if user:
        if file.user == user:
            return FileResponse(file.blob.filepath, filename=file.name, 
            content_disposition_type="inline", 
            headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"})
    if file.is_locked:
        if not password:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "File is locked")
        if password:
            if file.password != password:
                raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Wrong password, File is locked")
            return FileResponse(file.blob.filepath, 
            filename=file.name, 
            content_disposition_type="inline", 
            headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"})
    if file.visibility_s != "public" and file.visibility_s != "once":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "File is hidden")
    return FileResponse(file.blob.filepath, 
    filename=file.name, 
    content_disposition_type="inline", 
    headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"})

@router.patch("/files/{id}")
def update_file_by_id(
    data: FileUpdate = Body(),
    file: File = Depends(FileService.file_from_path_dependency),
    user: User = Depends(AuthService.get_current_user)
) -> FileRead:
    updated_file = FileService.update_file(
        user,
        file,
        title=data.title,
        path=data.path,
        content=data.content,
        password=data.password,
        mode=data.mode,
        visibility=data.visibility,
        overwrite=data.overwrite,
    )
    return FileRead.from_orm(updated_file, show_password=True)

@router.delete("/files/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file_by_id(
    file: File = Depends(FileService.file_from_path_dependency),
    user: User = Depends(AuthService.get_current_user),
):
    FileService.delete_file(user, file)

@router.put("/files/{id}/content", status_code=status.HTTP_204_NO_CONTENT)
def update_file_content_by_id(
    content: UploadFile,
    file: File = Depends(FileService.file_from_path_dependency),
    user: User = Depends(AuthService.get_current_user),
):
    if file.user != user:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You are not allowed for this operation")
    file.content = content.file.read()
    file.save()

@router.patch("/files/{id}/update")
async def update_file_by_id_with_form(
    file_to_update: File = Depends(FileService.get_file_by_id),
    user: User = Depends(AuthService.get_current_user),
    path: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    file: Optional[UploadFile] = FFile(None),
    content: Optional[str | bytes] = Form(None),
    mode: Optional[FileModeEnum] = Form(None),
    visibility: Optional[FileVisibilityEnum] = Form(None),
    password: Optional[str] = Form(None),
    overwrite: Optional[bool] = Form(None),
) -> FileRead:
    if file_to_update.user != user:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You are not allowed for this operation")
    if file is not None:
        content = await file.read()
    updated_file = FileService.update_file(
        user,
        file_to_update,
        title=title,
        path=path,
        content=content,
        password=password,
        mode=mode,
        visibility=visibility,
        overwrite=overwrite,
    )
    return FileRead.from_orm(updated_file, show_password=True)

@router.post("/files/git-clone")
async def git_clone_in_files(
    user: User = Depends(AuthService.get_current_user),
    data: FileGitCloneRequest = Body()
) -> FolderRead:
    success = FileService.git_clone(user, **data.model_dump())
    if not success:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    folder = FileService.get_folder(data.folder)
    return FolderRead.from_orm(folder)

@router.get("/folders")
def get_folder(
    path: str = Query(None),
    expand: bool = Query(False),
    expand_depth: int = Query(1, ge=0),
    page: Optional[int] = Query(None, description="Page number", gt=0),
    page_size: Optional[int] = Query(None, description="Page size", gt=0),
    sort: Optional[str] = Query(None, description="Sort"),
) -> FolderRead:
    folder = FileService.get_folder(path)
    folder = FolderRead.from_orm(folder, expand, expand_depth)

    if sort:
        reverse = False
        attr = sort
        if attr.startswith("+"):
            attr = attr[1:]
            reverse = False
        if attr.startswith("-"):
            attr = attr[1:]
            reverse = True
        cansort = []
        cannotsort = []
        for item in folder.items:
            if hasattr(item, attr):
                cansort.append(item)
            else:
                cannotsort.append(item)
        cansort.sort(key=lambda i:getattr(i, attr), reverse=reverse)
        folder.items = cansort + cannotsort

    if not page:
        return folder

    if not page_size:
        page_size = 64
    offset = page_size * (page - 1)
    folder.items = folder.items[offset: offset + page_size]
    return folder

