from peewee import Model, SqliteDatabase, AutoField, CharField, IntegerField, BooleanField, TimestampField
from pygments import lexers, highlight
from pygments.formatters import HtmlFormatter

from typing import List, Union
from datetime import datetime, UTC
from mimetypes import guess_type

from .blob import Blob
from ..utils.helpers import randstr
from ..config import SCHEME, SERVER_NAME


file_db = SqliteDatabase("instance/files.db")
text_lexer = lexers.get_lexer_by_name("text")
html_formatter = HtmlFormatter()
html_formatter_with_linenos = HtmlFormatter(linenos=True)


class FileMode:
    RENDER  = 1
    SOURCE  = 2

    render  = 1
    source  = 2


class FileVisibility:
    PUBLIC  = 1
    HIDDEN  = 2
    ONCE    = 3

    public  = 1
    hidden  = 2
    once    = 3


class FileType:
    UNKNOWN     = 0
    APPLICATION = 1
    AUDIO       = 2
    CHEMICAL    = 3
    FONT        = 4
    IMAGE       = 5
    MESSAGE     = 6
    MODEL       = 7
    TEXT        = 8
    VIDEO       = 9

    unknown     = 0
    application = 1
    audio       = 2
    chemical    = 3
    font        = 4
    image       = 5
    message     = 6
    model       = 7
    text        = 8
    video       = 9

    type_map = {
        "unknown"       : 0,
        "application"   : 1,
        "audio"         : 2,
        "chemical"      : 3,
        "font"          : 4,
        "image"         : 5,
        "message"       : 6,
        "model"         : 7,
        "text"          : 8,
        "video"         : 9,
    }

    @staticmethod
    def mimetype(filename: str) -> str:
        mime = str(guess_type(filename)[0])
        return mime

    @staticmethod
    def mime_type(filename: str) -> str:
        type = FileType.mimetype(filename).split("/")[0]
        return type

    @staticmethod
    def mime_subtype(filename: str) -> str:
        subtype = FileType.mimetype(filename).split("/")[-1]
        return subtype
    
    @staticmethod
    def filetype(filename: str) -> int:
        type = FileType.mime_type(filename)
        return FileType.type_map.get(type, 0)


class File(Model):
    """ File """

    class Meta:
        database = file_db

    id : int | AutoField = AutoField()
    user_id : int | IntegerField = IntegerField(null=True)
    title : str | CharField = CharField(max_length=255, default="")
    path : str | CharField = CharField(max_length=4096, unique=True)
    views : int | IntegerField = IntegerField(default=0)
    blob_hash : str | CharField = CharField(64)
    mode : int | IntegerField = IntegerField(default=FileMode.RENDER)
    visibility : int | IntegerField = IntegerField(default=FileVisibility.PUBLIC)
    password : str | CharField = CharField(max_length=64, null=True, default="")
    as_guest : bool | BooleanField = BooleanField(default=False)
    modified : datetime | TimestampField = TimestampField(default=datetime.now(UTC))

    __unlocked : bool = False

    @staticmethod
    def username_from_path(path) -> str:
        if not path.startswith("/"):
            path = "/" + path
        path_parts = path.split("/")
        if len(path_parts) > 1:
            return path_parts[1]
        return ""

    @classmethod
    def by_id(cls, id) -> "File":
        return cls.get_or_none(cls.id==id)
    
    @classmethod
    def by_path(cls, path):
        return cls.get_or_none(cls.path==path)

    @classmethod
    def new_guest_path(cls, filename: str) -> str:
        ext = filename.split(".")[-1]
        if not ext:
            ext = "txt"
        path = f"/guest/{randstr(10)}.{ext}"
        while cls.by_path(path):
            path = f"/guest/{randstr(10)}.{ext}"
        return path

    def rename(self, new_path, force=False) -> bool:
        if "/" not in new_path:
            new_path = str(self.dir) + new_path
        if self.username_from_path(new_path) != self.user.username:
            return False
        other_file = File.by_path(new_path)
        if other_file:
            if force:
                return False
            other_file.delete_instance()
        self.path = new_path
        self.save()
        return True
    
    def sizef(self):
        size = self.size
        units = ["", "K", "M", "G"]
        degre = 0
        while size // 1024 > 0:
            degre += 1
            size /= 1024
        size = round(size, 2)
        return str(size) + " " + units[degre] + "B"

    def highlighted_html(self, linenos=False) -> str | None:
        try:
            lexer = lexers.get_lexer_for_filename(self.name)
        except:
            lexer = text_lexer
        if linenos:
            formatter = html_formatter_with_linenos
        else:
            formatter = html_formatter
        return highlight(self.text, lexer, formatter)

    def unlock(self, password: str) -> bool:
        if self.password == password:
            self.__unlocked = True
        return self.__unlocked

    def unlock_without_password(self):
        self.__unlocked = True

    def hit(self):
        self.views += 1
        self.save()

    def update_modified_time(self):
        self.modified = datetime.now(UTC)
        self.save()

    def shortlink(self):
        from .shortlink import ShortLink
        return ShortLink.create(self.path)

    def make_revision(self):
        from .revision import Revision
        return Revision.make_for(self)

    def last_revision(self):
        from .revision import Revision
        q = Revision.select().where(
            Revision.file_id == self.id
            ).order_by(Revision.id.desc())
        if q.count():
            return q.last()

    def preview(self) -> str:
        if self.is_locked:
            return ""
        return self.blob.get_str()[:128]

    def set_password(self, password: str):
        self.password = password[:64]
        self.save()

    def set_mode(self, mode: int | str):
        if isinstance(mode, str):
            mode = mode.casefold()
        match mode:
            case FileMode.RENDER | "render":
                self.mode = FileMode.RENDER
            case FileMode.SOURCE | "source":
                self.mode = FileMode.SOURCE
        self.save()

    def set_visibility(self, visibility: int | str):
        if isinstance(visibility, str):
            visibility = visibility.casefold()
        match visibility:
            case FileVisibility.PUBLIC | "public":
                self.visibility = FileVisibility.PUBLIC
            case FileVisibility.HIDDEN | "hidden":
                self.visibility = FileVisibility.HIDDEN
            case FileVisibility.ONCE | "once":
                self.visibility = FileVisibility.ONCE
        self.save()

    def to_dict(self, password: str | None = None, show_content: bool = True) -> dict:
        if password:
            self.unlock(password)

        if self.is_unlocked:
            if show_content:
                content = self.blob.get_base64()
            else:
                content = None
            blob_hash = self.blob.hash
        else:
            content = None
            blob_hash = None

        if self.as_guest:
            user_id = 0
        elif self.user:
            user_id = self.user.id
        else:
            user_id = 0

        return {
            "id": self.id,
            "title": self.title,
            "path": self.path,
            "size": self.size,
            "user": user_id,
            "views": self.views,
            "type": self.type_s,
            "mode": self.mode_s,
            "visibility": self.visibility_s,
            "modified": self.modified.timestamp(),
            "blob_hash": blob_hash,
            "content": content,
            "url": f"{SCHEME}://{SERVER_NAME}{self.path}",
        }

    @property
    def name(self) -> str:
        return self.path.split("/")[-1]

    @name.setter
    def name(self, new_name) -> bool:
        if "/" in new_name:
            return False
        return self.rename(new_name)

    @property
    def ext(self) -> str:
        return self.name.split(".")[-1]

    @property
    def content(self) -> bytes | str:
        return self.blob.get_content()

    @content.setter
    def content(self, content: bytes | str | Blob) -> bool:
        if isinstance(content, Blob):
            blob = content
        else:
            blob = Blob.create(content)
        if not blob:
            return False
        self.blob_hash = blob.hash
        return True

    @property
    def user(self) -> "User":
        from .user import User
        if self.as_guest:
            return User.guest
        user = User.by_id(self.user_id)
        return user

    @property
    def comments(self):
        from .comment import Comment
        return Comment.select().where(Comment.file_id==self.id)

    @property
    def revisions(self):
        from .revision import Revision
        return Revision.select().where(Revision.file_id==self.id)

    @property
    def type(self):
        return FileType.filetype(self.name)

    @property
    def is_file(self) -> bool:
        return True

    @property
    def is_dir(self) -> bool:
        return False

    @property
    def is_locked(self) -> bool:
        if not self.password:
            return False
        return not self.__unlocked

    @property
    def is_unlocked(self) -> bool:
        return not self.is_locked

    @property
    def mode_s(self) -> str:
        match self.mode:
            case FileMode.RENDER:
                return "render"
            case FileMode.SOURCE:
                return "source"
            case _:
                return ""

    @property
    def visibility_s(self) -> str:
        match self.mode:
            case FileVisibility.PUBLIC:
                return "public"
            case FileVisibility.HIDDEN:
                return "hidden"
            case FileVisibility.ONCE:
                return "once"
            case _:
                return ""

    @property
    def type_s(self) -> str:
        match (self.type):
            case FileType.UNKNOWN:
                return "unknown"
            case FileType.APPLICATION:
                return "application"
            case FileType.AUDIO:
                return "audio"
            case FileType.CHEMICAL:
                return "chemical"
            case FileType.FONT:
                return "font"
            case FileType.IMAGE:
                return "image"
            case FileType.MODEL:
                return "model"
            case FileType.TEXT:
                return "text"
            case FileType.VIDEO:
                return "video"
            case _:
                return "unknown"

    @property
    def dir(self) -> "Dir":
        return Dir(self)

    @property
    def blob(self) -> Blob:
        blob = Blob.by_hash(self.blob_hash)
        return blob

    @property
    def text(self) -> str:
        return self.blob.get_text()

    @property
    def binary(self) -> bytes:
        return self.blob.get_binary()

    @property
    def size(self) -> int:
        return self.blob.size


class Dir:
    """ Directory """

    def __init__(self, file_or_path: File | str):
        if isinstance(file_or_path, File):
            self.__dir = file_or_path.path[:file_or_path.path.rfind("/")]
        else:
            self.__dir = file_or_path
        if not self.__dir:
            self.__dir = "/"
        if not self.__dir.endswith("/"):
            self.__dir += "/"
        if not self.__dir.startswith("/"):
            self.__dir = "/" + self.__dir

    def __repr__(self) -> str:
        return f"<Dir '{self.__dir}'>"
    
    def __str__(self) -> str:
        return self.__dir

    def __eq__(self, other) -> bool:
        if type(self) != type(other):
            return False
        return self.__dir == other.__dir

    def __len__(self) -> int:
        return self.items.__len__()

    @property
    def name(self) -> str:
        parts = self.__dir.split("/")
        if len(parts) > 1:
            return parts[-2]
        return ""

    @property
    def path(self) -> str:
        return self.__dir

    @property
    def title(self) -> str:
        return self.name

    @property
    def dir(self) -> "Dir":
        return self

    @property
    def is_file(self) -> bool:
        return False

    @property
    def is_dir(self) -> bool:
        return True

    @property
    def username(self) -> str:
        path_part = self.__dir.split("/")
        if len(path_part) < 2:
            return ""
        return path_part[1]

    def items(self) -> List[Union["Dir", File]]:
        """Return items of the directory"""
        items_ = []
        filepaths = map(lambda i:i.path, File.select().where(File.path.startswith(self.__dir)).order_by(File.path))
        for path in filepaths:
            if path.count("/") == self.__dir.count("/"):
                items_.append(File.by_path(path))
            else:
                _dir = path[:path.find("/", len(self.__dir))]
                dir = Dir(_dir)
                if dir not in items_:
                    items_.append(dir)
        return items_

    def items_count(self) -> int:
        """Return numbres of items in the direttory"""
        count = 0
        seen_dirs = []
        depth_count = self.__dir.count("/")
        path_len = len(self.__dir)
        filepaths = map(lambda i:i.path, File.select().where(File.path.startswith(self.__dir)).order_by(File.path))
        for path in filepaths:
            if path.count("/") == depth_count:
                count += 1
            else:
                dir = path[:path.find("/", path_len)]
                if dir not in seen_dirs:
                    seen_dirs.append(dir)
                    count += 1
        return count

    def to_dict(self, expand=True, expand_depth=1) -> dict:
        if expand:
            items = self.items()
            for i, item in enumerate(items):
                if item.is_file:
                    items[i] = item.to_dict(show_content=False)
                if item.is_dir:
                    print("name:", self.name)
                    print("expand_depth:", expand_depth)
                    if expand_depth > 1:
                        items[i] = item.to_dict(expand=True, expand_depth=expand_depth-1)
                    else:
                        items[i] = item.to_dict(expand=False)
        else:
            items = []
        return {
            "name": self.name,
            "path": self.__dir,
            "username": self.username,
            "items": items,
            "items_count": self.items_count(),
            "url": f"{SCHEME}://{SERVER_NAME}{self.path}",
        }


file_db.create_tables([File])
