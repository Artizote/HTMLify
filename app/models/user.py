from peewee import Model, SqliteDatabase, AutoField, CharField

from ..utils import randstr, hash_password


user_db = SqliteDatabase("instance/users.db")


class User(Model):
    """ User """

    class Meta:
        database = user_db

    id = AutoField()
    name = CharField(64, default="")
    bio = CharField(512, default="")
    username = CharField(64, unique=True)
    password_hash = CharField(64, null=True)
    email = CharField(unique=True)
    api_key = CharField(32, default=lambda:randstr(32))

    @classmethod
    def by_id(cls, id) -> "User":
        return cls.get_or_none(cls.id==id)

    @classmethod
    def by_username(cls, username) -> "User":
        return cls.get_or_none(cls.username==username)

    def set_password(self, password: str):
        hash = hash_password(password)
        self.password_hash = hash
        self.save()

    def match_password(self, password: str):
        return self.password_hash == hash_password(password)

    def notify(self, msg):
        return NotImplemented

    @property
    def files(self):
        from .file import File
        return File.select().where(File.user_id==self.id)

    @property
    def dir(self):
        from .file import Dir
        return Dir("/"+self.username)

    @property
    def comments(self):
        return NotImplemented

    @property
    def notifications(self):
        return NotImplemented


User.guest = User(username="guest", id=0, name="Guest")

user_db.create_tables([User])
