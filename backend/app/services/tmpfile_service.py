from typing import Optional
from datetime import datetime, UTC

from app.models import Blob, TmpFile, TmpFolder

# TmpFile and TmpFolder has `code` which is unique identifier
# which will be changed to `id` for future proofing
# current service implementations treating `code` as `id`

class TmpFileNotFound(Exception): ...
class TmpFileExpired(Exception): ...
class TmpFolderNotFound(Exception): ...
class TmpFolderInvalidAuthCode(Exception): ...

class TmpFileService:

    @staticmethod
    def get_tmpfile(id: str) -> Optional[TmpFile]:
        tmpfile = TmpFile.by_code(id)
        return tmpfile

    @staticmethod
    def create_tmpfile(file, name: str | None = None, expiry: int | None = None) -> TmpFile:
        blob = Blob.from_bytes(file.read())
        tmpfile = TmpFile.create_with_blob(blob)
        tmpfile.name = name or f"tmp-file-{tmpfile.code}"
        if expiry:
            if tmpfile.expiry.timestamp() < datetime.now(UTC).timestamp():
                tmpfile.expiry = datetime.utcfromtimestamp(expiry)
        tmpfile.save()
        return tmpfile

    @staticmethod
    def get_tmpfolder(id: str) -> TmpFolder:
        tmpfolder = TmpFolder.by_code(id)
        return tmpfolder

    @staticmethod
    def create_tmpfolder(name: str) -> TmpFolder:
        tmpfolder = TmpFolder.create(name=name)
        return tmpfolder

    @staticmethod
    def add_file_in_tmpfolder(tmpfolder_id: str, tmpfile_id: str, auth_code: str):
        tmpfolder: TmpFolder = TmpFolder.by_code(tmpfolder_id)
        if not tmpfolder:
            raise TmpFolderNotFound()
        if tmpfolder.auth_code != auth_code:
            raise TmpFolderInvalidAuthCode()
        tmpfile = TmpFile.by_code(tmpfile_id)
        if not tmpfile:
            raise TmpFileNotFound()
        # if tmpfile.expiry.timestamp() < datetime.now(UTC).timestamp():
        #     raise TmpFileExpired()
        tmpfolder.add_file(tmpfile_id)

    @staticmethod
    def remove_file_from_tmpfolder(tmpfolder_id: str, tmpfile_id: str, auth_code: str):
        tmpfolder: TmpFolder = TmpFolder.by_code(tmpfolder_id)
        if not tmpfolder:
            raise TmpFolderNotFound()
        if tmpfolder.auth_code != auth_code:
            raise TmpFolderInvalidAuthCode()
        tmpfile = TmpFile.by_code(tmpfile_id)
        if not tmpfile:
            raise TmpFileNotFound()
        # tmpfile expiry chekc skipped, temprarily
        tmpfolder.remove_file(tmpfile_id)

