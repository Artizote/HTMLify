from peewee import Model, SqliteDatabase, IntegerField, CharField, TimestampField
from pygments import lexers, highlight
from pygments.formatters import HtmlFormatter

from datetime import datetime, UTC

from .blob import Blob
from app.utils import randstr
from app.config import SCHEME, SERVER_NAME


pen_db = SqliteDatabase(
        "instance/pens.db",
        pragmas={
            "journal_mode": "wal",
            "synchronous":  2,
            "busy_timeout": 8000,
        })
html_lexer = lexers.get_lexer_by_name("html")
css_lexer = lexers.get_lexer_by_name("css")
js_lexer = lexers.get_lexer_by_name("js")
html_formatter = HtmlFormatter()
html_formatter_with_linenos = HtmlFormatter(linenos=True)


class Pen(Model):
    """ Pen """

    class Meta:
        database = pen_db

    id : str | CharField = CharField(primary_key=True, unique=True, index=True, default=lambda:Pen.new_id())
    user_id : int | IntegerField = IntegerField()
    title: str | CharField = CharField(255, default="Untitled Pen")
    head_blob_hash : str | CharField = CharField(64)
    body_blob_hash : str | CharField = CharField(64)
    css_blob_hash : str | CharField = CharField(64)
    js_blob_hash : str | CharField = CharField(64)
    views : int | IntegerField = IntegerField(default=0)
    modified : datetime | TimestampField = TimestampField(default=datetime.now(UTC))

    def __repr__(self):
        return f"<Pen: {self.id}>"

    @classmethod
    def by_id(cls, id):
        return cls.get_or_none(cls.id==id)

    @classmethod
    def new_id(cls) -> str:
        id = randstr(8)
        while cls.by_id(id):
            id = randstr(8)
        return id

    def hit(self):
        self.views += 1
        self.save()

    def update_modified_time(self):
        self.modified = datetime.now(UTC)
        self.save()

    def highlighted_head_html(self, linenos=False) -> str:
        if linenos:
            formatter = html_formatter_with_linenos
        else:
            formatter = html_formatter
        return highlight(self.head_content, html_lexer, formatter)

    def highlighted_body_html(self, linenos=False) -> str:
        if linenos:
            formatter = html_formatter_with_linenos
        else:
            formatter = html_formatter
        return highlight(self.body_content, html_lexer, formatter)

    def highlighted_css_html(self, linenos=False) -> str:
        if linenos:
            formatter = html_formatter_with_linenos
        else:
            formatter = html_formatter
        return highlight(self.css_content, css_lexer, formatter)

    def highlighted_js_html(self, linenos=False) -> str:
        if linenos:
            formatter = html_formatter_with_linenos
        else:
            formatter = html_formatter
        return highlight(self.js_content, js_lexer, formatter)

    def to_dict(self, **kwargs):
        show_head_content = kwargs.get("show_head_content", False)
        show_body_content = kwargs.get("show_body_content", False)
        show_css_content = kwargs.get("show_css_content", False)
        show_js_content = kwargs.get("show_js_content", False)

        return {
            "id": self.id,
            "title": self.title,
            "user": self.user.id,
            "views": self.views,
            "modified": self.modified.timestamp(),
            "head_blob_hash": self.head_blob_hash,
            "body_blob_hash": self.body_blob_hash,
            "css_blob_hash": self.css_blob_hash,
            "js_blob_hash": self.js_blob_hash,
            "head_content": self.head_blob.get_base64() if show_head_content else None,
            "body_content": self.body_blob.get_base64() if show_body_content else None,
            "css_content": self.css_blob.get_base64() if show_css_content else None,
            "js_content": self.js_blob.get_base64() if show_js_content else None,
            "path": self.path,
            "url": self.url,
            "username": self.user.username,
        }

    @property
    def user(self):
        from .user import User
        return User.by_id(self.user_id)

    @property
    def head_blob(self) -> Blob:
        blob = Blob.by_hash(str(self.head_blob_hash))
        return blob

    @property
    def body_blob(self) -> Blob:
        blob = Blob.by_hash(str(self.body_blob_hash))
        return blob

    @property
    def css_blob(self) -> Blob:
        blob = Blob.by_hash(str(self.css_blob_hash))
        return blob

    @property
    def js_blob(self) -> Blob:
        blob = Blob.by_hash(str(self.js_blob_hash))
        return blob

    @property
    def head_content(self) -> str | bytes:
        return self.head_blob.get_content()

    @property
    def body_content(self) -> str | bytes:
        return self.body_blob.get_content()

    @property
    def css_content(self) -> str | bytes:
        return self.css_blob.get_content()

    @property
    def js_content(self) -> str | bytes:
        return self.js_blob.get_content()

    @head_content.setter
    def head_content(self, content: bytes | str | Blob) -> bool:
        if isinstance(content, Blob):
            blob = content
        else:
            blob = Blob.create(content)
        if not blob:
            return False
        self.head_blob_hash = blob.hash
        return True

    @body_content.setter
    def body_content(self, content: bytes | str | Blob) -> bool:
        if isinstance(content, Blob):
            blob = content
        else:
            blob = Blob.create(content)
        if not blob:
            return False
        self.body_blob_hash = blob.hash
        return True

    @css_content.setter
    def css_content(self, content: bytes | str | Blob) -> bool:
        if isinstance(content, Blob):
            blob = content
        else:
            blob = Blob.create(content)
        if not blob:
            return False
        self.css_blob_hash = blob.hash
        return True

    @js_content.setter
    def js_content(self, content: bytes | str | Blob) -> bool:
        if isinstance(content, Blob):
            blob = content
        else:
            blob = Blob.create(content)
        if not blob:
            return False
        self.js_blob_hash = blob.hash
        return True

    @property
    def path(self):
        return f"/pen/{self.id}"

    @property
    def url(self):
        return f"{SCHEME}://{SERVER_NAME}/pen/{self.id}"
    
    @property
    def depends_on(self) -> list[Blob]:
        return [self.head_blob, self.body_blob, self.css_blob, self.js_blob]


pen_db.create_tables([Pen])
