from fastapi import HTTPException, Path
from starlette import status

from typing import Optional

from app.models import File, Dir, Blob, User


class FileService:

    @staticmethod
    def get_file_by_path(path: str) -> Optional[File]:
        file = File.by_path(path)
        return file

    @staticmethod
    def get_file_by_id(id: int) -> Optional[File]:
        file = File.by_id(id)
        return file

    @staticmethod
    def get_folder(path: str) -> Dir:
        folder = Dir(path)
        return folder

    @staticmethod
    def create_file(
        user: User,
        title: str,
        path: str,
        content: bytes | str,
        mode: str,
        visibility: str,
        password: Optional[str] = None,
        as_guest: bool = False
    ) -> File:

        if (not path and not as_guest):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Non `as_guest` files require path to be created"
            )

        if as_guest:
            path = File.new_guest_path(path)

        if not as_guest:
            path_parts = path.split("/")
            if len(path_parts) < 3:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    "Invalid path for the file"
                )
            if path_parts[1] != user.username:
                raise HTTPException(
                    status.HTTP_403_FORBIDDEN,
                    "You are only allowed to create file in your path"
                )

        if path.endswith("/"):
            path = path[:-1]

        if not path.startswith("/"):
            path = "/" + path

        if not File.is_valid_filepath(path):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Path for file is not valid"
            )

        _file = File.by_path(path)
        if _file:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "File on this path alread exists"
            )

        blob = Blob.create(content)

        try:
            file : File = File.create(
                path = path,
                title = title,
                user_id = user.id,
                blob_hash = blob.hash,
                password = password,
                as_guest = as_guest
            )
        except:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internel Sever Error")

        file.set_visibility(visibility)
        file.set_mode(mode)

        return file

    @staticmethod
    def update_file(
        user: User,
        file: File,
        title: Optional[str] = None,
        path: Optional[str] = None,
        content: Optional[bytes | str] = None,
        password: Optional[str] = None,
        mode: Optional[str] = None,
        visibility: Optional[str] = None,
        overwrite: Optional[bool] = None
    ) -> File:

        if content:
            blob = Blob.create(content)
            file.content = blob
            file.save()

        if visibility:
            file.set_visibility(visibility)

        if mode:
            file.set_mode(mode)

        if password:
            file.set_password(password)

        if title:
            file.title = title
            file.save()

        if path and path != file.path:
            path_parts = path.split("/")
            if len(path_parts) < 3:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    "Invalid path"
                )
            if path_parts[1] != user.username:
                raise HTTPException(
                    status.HTTP_403_FORBIDDEN,
                    "You are not allowed to update this file"
                )

            _file = File.by_path(path)
            if _file and not overwrite:
                raise HTTPException(
                    status.HTTP_409_CONFLICT,
                    "File on this path alreday exists"
                )
            if _file and overwrite:
                _file.delete_instance()
            file.path = path
            file.save()

        file.update_modified_time()

        return file

    @staticmethod
    def delete_file(user: User, file: File) -> bool:
        if file.user != user:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "You are not allowed to delete this file"
            )
        return bool(file.delete_instance())

    @staticmethod
    def file_from_path_dependency(id: int = Path()) -> File:
        file = File.by_id(id)
        if not file:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "File not found"
            )
        return file


