from peewee import Model, SqliteDatabase, AutoField, CharField, BooleanField, IntegerField
from werkzeug.security import generate_password_hash, check_password_hash

from functools import lru_cache

from ..utils import randstr


user_db = SqliteDatabase("instance/users.db")


class UserRole:
    USER = 1

    user = 1


class User(Model):
    """ User """

    class Meta:
        database = user_db

    guest : "User"

    id : int | AutoField = AutoField()
    name : str | CharField = CharField(64, default="")
    bio : str | CharField = CharField(512, default="")
    username : str | CharField = CharField(64, unique=True)
    password_hash : str | CharField = CharField(255, null=True)
    email : str | CharField = CharField(unique=True)
    api_key : str | CharField = CharField(32, default=lambda:User.new_api_key(), unique=True)
    active : bool | BooleanField = BooleanField(default=True)
    verified : bool | BooleanField = BooleanField(default=False)
    role : int | IntegerField  = IntegerField(default=UserRole.USER)

    @staticmethod
    def is_username_valid(username: str) -> bool: 
        username_chars = set(username)
        valid_charset = set("abcdefghijklmnopqrstuvwxyz_0123456789-")

        for c in username_chars:
            if c not in valid_charset:
                return False

        if username_chars == set("-") or username_chars == set("_") or username_chars == set("-_"):
            return False
        
        if len(username) < 4:
            return False

        if len(username) > 64:
            return False

        return True

    @classmethod
    def is_username_available(cls, username: str) -> bool:
        reserved_root_paths = {
            "dashboard", "edit", "search",
            "file-upload", "delete", "raw",
            "registration", "action", "parse",
            "render", "archive", "trending",
            "api", "pygments.css", "map",
            "src", "guest", "r",
            "revision", "frames", "robots.txt",
            "exec", "proc", "static",
            "login", "logout", "print"
            "clone", "tmp", "media"
        }

        if username in reserved_root_paths:
            return False

        user = cls.by_username(username)
        if user:
            return False

        return True

    @classmethod
    def new_api_key(cls) -> str:
        api_key = randstr(32)
        while cls.by_api_key(api_key):
            api_key = randstr(32)
        return api_key

    @classmethod
    def by_id(cls, id) -> "User":
        return cls.get_or_none(cls.id==id)

    @classmethod
    def by_api_key(cls, api_key) -> "User":
        return cls.get_or_none(cls.api_key==api_key)

    @classmethod
    def by_username(cls, username) -> "User":
        return cls.get_or_none(cls.username==username)

    def set_password(self, password: str):
        hash = generate_password_hash(password)
        self.password_hash = hash
        self.save()

    def match_password(self, password: str):
        return check_password_hash(self.password_hash, password)

    def activate(self):
        self.active = True
        self.save()

    def deactive(self):
        self.active = False
        self.save()

    def notify(self, msg, href="/notifications"):
        from .notification import Notification
        Notification.notify(self, msg, href)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "name": self.name,
            "bio": self.bio,
            "active": self.active,
            "verified": self.verified,
            "role": self.role_s,
        }

    @property
    def files(self):
        from .file import File
        return File.select().where(File.user_id==self.id)

    @property
    def dir(self):
        from .file import Dir
        return Dir("/"+self.username)

    @property
    @lru_cache
    def total_views(self):
        total = 0
        for file in self.files:
            total += file.views
        return total

    @property
    def is_active(self) -> bool:
        return bool(self.active)

    @property
    def is_verified(self) -> bool:
        return bool(self.verified)

    @property
    def role_s(self) -> str:
        match self.role:
            case UserRole.USER:
                return "user"
            case _:
                return ""

    @property
    def comments(self):
        from .comment import Comment
        return Comment.select().where(Comment.user_id==self.id)

    @property
    def notifications(self):
        from .notification import Notification
        return Notification.select().where(Notification.user_id==self.id)


user_db.create_tables([User])

User.guest = User(username="guest", id=0, name="Guest")
