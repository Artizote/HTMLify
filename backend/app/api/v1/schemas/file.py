from pydantic import BaseModel, Base64Bytes

from datetime import datetime
from typing import Optional, Self, List, Union
from enum import StrEnum


class FileModeEnum(StrEnum):
    SOURCE = "source"
    RENDER = "render"

class FileVisibilityEnum(StrEnum):
    PUBLIC = "public"
    HIDDEN = "hidden"
    ONEC = "once"


class FileBase(BaseModel):
    id: int
    user: str
    title: str
    path: str
    views: int
    blob_hash: str
    mode: str 
    visibility: str 
    password: Optional[str] = None
    locked: bool
    as_guest: bool 
    modified: datetime 

    @classmethod
    def from_orm(cls, file):
        return cls(
            id=file.id,
            user=file.user.username,
            title=file.title,
            path=file.path,
            views=file.views,
            blob_hash=file.blob_hash,
            mode=file.mode_s,
            visibility=file.visibility_s,
            locked=file.is_locked,
            as_guest=file.as_guest,
            modified=file.modified
        )

class FileRead(FileBase):
    blob_hash: Optional[str] = None
    content: Optional[Base64Bytes] = None
    password: Optional[str] = None

    @classmethod
    def from_orm(cls, file, show_content=False, show_blob_hash=True, show_password=False):
        fr = super().from_orm(file)
        if show_content:
            fr.content = file.blob.get_bytes()
        if not show_blob_hash:
            fr.blob_hash = None
        if show_password:
            fr.password = file.password
        return fr

class FileCreate(BaseModel):
    path: Optional[str]
    title: str = ""
    content: Base64Bytes = b""
    mode: FileModeEnum
    visibility: FileVisibilityEnum
    as_guest: bool = False

class FileUpdate(BaseModel):
    path: Optional[str] = None
    title: Optional[str] = None
    content: Optional[Base64Bytes] = None
    mode: Optional[FileModeEnum] = None
    visibility: Optional[FileVisibilityEnum] = None
    password: Optional[str] = None
    overwrite: Optional[bool] = None

class FolderRead(BaseModel):
    name: str
    path: str
    items: List[Union["FolderRead", FileRead]]

    @classmethod
    def from_orm(cls, dir, show_content=False) -> Self:
        fr = cls(
            name=dir.name,
            path=dir.path,
            items=[]
        )
        if show_content:
            items = dir.items()
            for item in items:
                if item.is_file:
                    fr.items.append(FileRead.from_orm(item, False, False, False))
                else:
                    fr.items.append(cls.from_orm(item, False))
        return fr
             

