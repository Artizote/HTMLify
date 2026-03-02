from datetime import datetime
from typing import Self

from pydantic import BaseModel, HttpUrl


class TmpFileRead(BaseModel):
    id: str
    name: str
    url: HttpUrl
    expiry: datetime

    @classmethod
    def from_orm(cls, tmpfile) -> Self:
        return cls(
            id=tmpfile.code,
            name=tmpfile.name,
            url=tmpfile.url,
            expiry=tmpfile.expiry
        )

class TmpFolderRead(BaseModel):
    id: str
    name: str
    files: list[TmpFileRead]

    @classmethod
    def from_orm(cls, tmpfolder) -> Self:
        return cls(
            id=tmpfolder.code,
            name=tmpfolder.name,
            files=[TmpFileRead.from_orm(f) for f in tmpfolder.files]
        )

class TmpFolderReadWithAuthCode(TmpFolderRead):
    auth_code: str

    @classmethod
    def from_orm(cls, tmpfolder) -> Self:
        return cls(
            id=tmpfolder.code,
            name=tmpfolder.name,
            files=[TmpFileRead.from_orm(f) for f in tmpfolder.files],
            auth_code=tmpfolder.auth_code
        )

class TmpFolderCreate(BaseModel):
    name: str

class TmpFolderFileAdd(BaseModel):
    id: str
    auth_code: str

class TmpFolderFileRemove(BaseModel):
    id: str
    auth_code: str

