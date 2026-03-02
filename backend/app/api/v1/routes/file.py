from fastapi import APIRouter, Depends, Query, Body
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
    return FileRead.from_orm(file)

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
    if file.visibility_s != "public":
            return FileRead.from_orm(file, False, False, False)
    return FileRead.from_orm(file, show_content, True, False)

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
    return FileRead.from_orm(updated_file)

@router.delete("/files/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file_by_id(
    file: File = Depends(FileService.file_from_path_dependency),
    user: User = Depends(AuthService.get_current_user),
):
    FileService.delete_file(user, file)

@router.get("/folders")
def get_folder(path: str = Query(None)) -> FolderRead:
    folder = FileService.get_folder(path)
    return FolderRead.from_orm(folder, True)
