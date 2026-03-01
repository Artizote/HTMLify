from pydantic import BaseModel, Base64Str

from typing import Optional
from datetime import datetime


class PenRead(BaseModel):
    id: str
    user: str
    title: str
    head_blob_hash: str
    body_blob_hash: str
    css_blob_hash: str
    js_blob_hash: str
    views: int
    modified: datetime

    head_content: Optional[Base64Str] = None
    body_content: Optional[Base64Str] = None
    css_content: Optional[Base64Str] = None
    js_content: Optional[Base64Str] = None

    @classmethod
    def from_orm(cls, pen, show_content: bool = False):
        pr = cls(
            id = pen.id,
            user = pen.user.username,
            title = pen.title,
            head_blob_hash = pen.head_blob_hash,
            body_blob_hash = pen.body_blob_hash,
            css_blob_hash = pen.css_blob_hash,
            js_blob_hash = pen.js_blob_hash,
            views = pen.views,
            modified = pen.modified
        )
        if show_content:
            pr.head_content = pen.head_blob.get_str()
            pr.body_content = pen.body_blob.get_str()
            pr.css_content = pen.body_blob.get_str()
            pr.js_content = pen.js_blob.get_str()
        return pr


class PenCreate(BaseModel):
    title: str

class PenUpdate(BaseModel):
    title: Optional[str] = None
    head_content: Optional[Base64Str] = None
    body_content: Optional[Base64Str] = None
    css_content: Optional[Base64Str] = None
    js_content: Optional[Base64Str] = None

