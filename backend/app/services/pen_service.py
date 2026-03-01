from fastapi import HTTPException, Path

from typing import Optional

from app.models import Pen, Blob
from .user_service import UserService


class PenService:

    @staticmethod
    def get_pen_by_id(id: str) -> Optional[Pen]:
        pen = Pen.by_id(id)
        return pen

    @staticmethod
    def get_user_pens(username: str) -> list[Pen]:
        user = UserService.get_user(username)
        if not user:
            return []
        pens = Pen.select().where(Pen.user_id == user.id)
        return pens

    @staticmethod
    def create_pen(user: str, title: Optional[str]) -> Pen:
        user_ = UserService.get_user(user)
        if not user_:
            raise HTTPException(403, "Unauthrized")
        user_id = user_.id
        pen = Pen.create(
            user_id = user_id,
            title = title or "Untitled",
            head_blob_hash = Blob.create("").hash,
            body_blob_hash = Blob.create("").hash,
            css_blob_hash = Blob.create("").hash,
            js_blob_hash = Blob.create("").hash
        )
        return pen

    @staticmethod
    def update_pen_title(id: str, title: str):
        pen: Pen = Pen.by_id(id)
        if not pen:
            return
        pen.title = title
        pen.save()

    @staticmethod
    def update_pen_head_content(id: str, content: bytes | str):
        pen: Pen = Pen.by_id(id)
        if not pen:
            return
        pen.head_content = content
        pen.save()

    @staticmethod
    def update_pen_body_content(id: str, content: bytes | str):
        pen: Pen = Pen.by_id(id)
        if not pen: return
        pen.body_content = content
        pen.save()

    @staticmethod
    def update_pen_css_content(id: str, content: bytes | str):
        pen: Pen = Pen.by_id(id)
        if not pen: return
        pen.css_content = content
        pen.save()

    @staticmethod
    def update_pen_js_content(id: str, content: bytes | str):
        pen: Pen = Pen.by_id(id)
        if not pen: return
        pen.js_content = content
        pen.save()

    @staticmethod
    def delete_pen(id: str):
        pen: Pen = Pen.by_id(id)
        if not pen: return
        pen.delete_instance()

    @staticmethod
    def pen_from_path_dependency(id: str = Path()) -> Pen:
        pen = Pen.by_id(id)
        if not pen:
            raise HTTPException(404, "Pen not found")
        return pen

